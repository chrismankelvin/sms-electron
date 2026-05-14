# app/school/week_days.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
import logging
import traceback
import sys

from app.activation.state import get_db_connection

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

router = APIRouter(prefix="/api/week-days", tags=["week-days"])

# ==================== Pydantic Models ====================

class WeekDayBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=20)
    order_index: Optional[int] = Field(None, ge=1, le=7)
    is_active: bool = True
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Day name cannot be empty')
        return v.capitalize()

class WeekDayCreate(WeekDayBase):
    pass

class WeekDayUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=20)
    order_index: Optional[int] = Field(None, ge=1, le=7)
    is_active: Optional[bool] = None

class WeekDayResponse(BaseModel):
    id: int
    name: str
    order_index: Optional[int]
    is_active: bool
    version: int
    created_at: datetime
    updated_at: datetime

class WeekDayReorder(BaseModel):
    day_ids: List[int]  # Ordered list of day IDs for active days

# ==================== Helper Functions ====================

def ensure_unique_name(cursor, name: str, exclude_id: Optional[int] = None):
    """Ensure day name is unique"""
    query = "SELECT id FROM week_days WHERE name = ?"
    params = [name]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400,
            detail=f"Day '{name}' already exists. Please use a unique name."
        )

def ensure_unique_order_index(cursor, order_index: int, exclude_id: Optional[int] = None):
    """Ensure order index is unique among active days"""
    if not order_index:
        return
    
    query = "SELECT id, name FROM week_days WHERE order_index = ? AND is_active = 1"
    params = [order_index]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    existing = cursor.fetchone()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Order index {order_index} is already used by {existing['name']}"
        )

def get_next_order_index(cursor) -> int:
    """Get the next available order index for active days"""
    cursor.execute("SELECT COALESCE(MAX(order_index), 0) as max_index FROM week_days WHERE is_active = 1")
    result = cursor.fetchone()
    return result['max_index'] + 1

def reorder_active_days(cursor, day_ids: List[int]):
    """Reorder active days based on the provided order"""
    for index, day_id in enumerate(day_ids, start=1):
        cursor.execute("""
            UPDATE week_days 
            SET order_index = ?, updated_at = ?, version = version + 1
            WHERE id = ? AND is_active = 1
        """, (index, datetime.now().isoformat(), day_id))

def update_order_indices(cursor):
    """Update order indices for all active days based on current order"""
    cursor.execute("""
        SELECT id FROM week_days 
        WHERE is_active = 1 
        ORDER BY order_index ASC, id ASC
    """)
    active_days = cursor.fetchall()
    
    for index, day in enumerate(active_days, start=1):
        cursor.execute("""
            UPDATE week_days 
            SET order_index = ?, updated_at = ?, version = version + 1
            WHERE id = ?
        """, (index, datetime.now().isoformat(), day['id']))

def validate_day_not_in_use(cursor, day_id: int):
    """Check if day is being used in any schedule"""
    # This is a placeholder - implement when schedule table exists
    # cursor.execute("SELECT id FROM schedules WHERE day_id = ? LIMIT 1", (day_id,))
    # if cursor.fetchone():
    #     raise HTTPException(
    #         status_code=400,
    #         detail="Cannot delete or deactivate day because it is being used in schedules"
    #     )
    pass

# ==================== Database Setup ====================

def create_week_days_table():
    """Create week_days table if it doesn't exist"""
    try:
        logger.info("Creating/checking week_days table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='week_days'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE week_days (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    order_index INTEGER,
                    is_active BOOLEAN DEFAULT 1,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync NUMERIC DEFAULT 0,
                    created_at NUMERIC DEFAULT CURRENT_TIMESTAMP,
                    updated_at NUMERIC DEFAULT CURRENT_TIMESTAMP
                )
            """)
            logger.info("New week_days table created")
            
            # Insert default week days
            logger.info("Inserting default week days")
            default_days = [
                ("Monday", 1, 1),
                ("Tuesday", 2, 1),
                ("Wednesday", 3, 1),
                ("Thursday", 4, 1),
                ("Friday", 5, 1),
                ("Saturday", 6, 0),
                ("Sunday", 7, 0)
            ]
            
            for day in default_days:
                cursor.execute("""
                    INSERT INTO week_days (name, order_index, is_active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (*day, datetime.now().isoformat(), datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default week days inserted successfully")
        else:
            logger.info("Table 'week_days' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(week_days)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE week_days ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE week_days ADD COLUMN updated_by_sync NUMERIC DEFAULT 0")
            
            if 'version' not in column_names:
                logger.info("Adding version column")
                cursor.execute("ALTER TABLE week_days ADD COLUMN version INTEGER DEFAULT 1")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating week_days table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_week_days_table()
except Exception as e:
    logger.error(f"Failed to initialize week_days table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_week_days():
    """Get all week days ordered by order_index (active days first, then inactive)"""
    logger.info("GET /api/week-days/ - Fetching all week days")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM week_days 
            ORDER BY 
                CASE 
                    WHEN is_active = 1 AND order_index IS NOT NULL THEN order_index
                    WHEN is_active = 1 THEN 999
                    WHEN is_active = 0 THEN 1000
                    ELSE 1001
                END ASC,
                id ASC
        """)
        
        results = cursor.fetchall()
        days = []
        
        for row in results:
            days.append({
                "id": row['id'],
                "name": row['name'],
                "order_index": row['order_index'],
                "is_active": bool(row['is_active']),
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(days)} week days")
        
        return {
            "success": True,
            "data": days,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_week_days: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

@router.get("/active")
async def get_active_week_days():
    """Get all active week days ordered by order_index"""
    logger.info("GET /api/week-days/active - Fetching active week days")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM week_days 
            WHERE is_active = 1
            ORDER BY order_index ASC
        """)
        
        results = cursor.fetchall()
        days = []
        
        for row in results:
            days.append({
                "id": row['id'],
                "name": row['name'],
                "order_index": row['order_index'],
                "is_active": bool(row['is_active']),
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(days)} active week days")
        
        return {
            "success": True,
            "data": days,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_active_week_days: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{day_id}")
async def get_week_day(day_id: int):
    """Get a specific week day by ID"""
    logger.info(f"GET /api/week-days/{day_id} - Fetching week day")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM week_days WHERE id = ?", (day_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Week day not found")
        
        day = {
            "id": result['id'],
            "name": result['name'],
            "order_index": result['order_index'],
            "is_active": bool(result['is_active']),
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": day,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_week_day: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_week_day(day_data: WeekDayCreate):
    """Create a new week day"""
    logger.info(f"POST /api/week-days/ - Creating new week day: {day_data.name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ensure unique name
        ensure_unique_name(cursor, day_data.name)
        
        # Determine order_index
        order_index = day_data.order_index
        if order_index is None:
            if day_data.is_active:
                order_index = get_next_order_index(cursor)
            else:
                order_index = None
        
        # If order_index provided and day is active, check uniqueness and shift if needed
        if order_index is not None and day_data.is_active:
            ensure_unique_order_index(cursor, order_index)
            
            # Shift existing order indices to make room
            cursor.execute("""
                UPDATE week_days 
                SET order_index = order_index + 1, updated_at = ?, version = version + 1
                WHERE is_active = 1 AND order_index >= ?
            """, (datetime.now().isoformat(), order_index))
        
        # Insert new week day
        cursor.execute("""
            INSERT INTO week_days (name, order_index, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            day_data.name, order_index, 1 if day_data.is_active else 0,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Week day created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Week day created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_week_day: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{day_id}")
async def update_week_day(day_id: int, day_data: WeekDayUpdate):
    """Update a week day"""
    logger.info(f"PUT /api/week-days/{day_id} - Updating week day")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if week day exists
        cursor.execute("SELECT * FROM week_days WHERE id = ?", (day_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Week day not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Handle name update
        if day_data.name is not None:
            ensure_unique_name(cursor, day_data.name, day_id)
            updates.append("name = ?")
            params.append(day_data.name)
        
        # Get new status values
        new_is_active = day_data.is_active if day_data.is_active is not None else existing['is_active']
        new_order_index = day_data.order_index if day_data.order_index is not None else existing['order_index']
        
        # If changing active status
        if day_data.is_active is not None:
            if day_data.is_active:
                # Activating: assign next available order_index if None
                if new_order_index is None:
                    new_order_index = get_next_order_index(cursor)
                    updates.append("order_index = ?")
                    params.append(new_order_index)
                else:
                    # Check uniqueness of order_index
                    ensure_unique_order_index(cursor, new_order_index, day_id)
                    # Shift existing order indices
                    cursor.execute("""
                        UPDATE week_days 
                        SET order_index = order_index + 1, updated_at = ?, version = version + 1
                        WHERE is_active = 1 AND order_index >= ? AND id != ?
                    """, (datetime.now().isoformat(), new_order_index, day_id))
                    updates.append("order_index = ?")
                    params.append(new_order_index)
            else:
                # Deactivating: remove order_index
                updates.append("order_index = ?")
                params.append(None)
                
                # Reorder remaining active days
                cursor.execute("""
                    SELECT id FROM week_days 
                    WHERE is_active = 1 AND id != ?
                    ORDER BY order_index ASC
                """, (day_id,))
                active_days = cursor.fetchall()
                
                for index, day in enumerate(active_days, start=1):
                    cursor.execute("""
                        UPDATE week_days 
                        SET order_index = ?, updated_at = ?, version = version + 1
                        WHERE id = ?
                    """, (index, datetime.now().isoformat(), day['id']))
            
            updates.append("is_active = ?")
            params.append(1 if day_data.is_active else 0)
        else:
            # Just updating order_index for active day
            if day_data.order_index is not None and new_is_active:
                ensure_unique_order_index(cursor, new_order_index, day_id)
                
                old_index = existing['order_index']
                if new_order_index < old_index:
                    # Moving up
                    cursor.execute("""
                        UPDATE week_days 
                        SET order_index = order_index + 1, updated_at = ?, version = version + 1
                        WHERE is_active = 1 AND order_index >= ? AND order_index < ? AND id != ?
                    """, (datetime.now().isoformat(), new_order_index, old_index, day_id))
                elif new_order_index > old_index:
                    # Moving down
                    cursor.execute("""
                        UPDATE week_days 
                        SET order_index = order_index - 1, updated_at = ?, version = version + 1
                        WHERE is_active = 1 AND order_index > ? AND order_index <= ? AND id != ?
                    """, (datetime.now().isoformat(), old_index, new_order_index, day_id))
                
                updates.append("order_index = ?")
                params.append(new_order_index)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(day_id)
            query = f"UPDATE week_days SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Week day {day_id} updated successfully")
        
        return {
            "success": True,
            "message": "Week day updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_week_day: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{day_id}")
async def delete_week_day(day_id: int):
    """Delete a week day"""
    logger.info(f"DELETE /api/week-days/{day_id} - Deleting week day")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if week day exists
        cursor.execute("SELECT name, is_active FROM week_days WHERE id = ?", (day_id,))
        day = cursor.fetchone()
        
        if not day:
            raise HTTPException(status_code=404, detail="Week day not found")
        
        if day['is_active']:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete active day '{day['name']}'. Please deactivate it first."
            )
        
        # Check if day is being used (optional)
        validate_day_not_in_use(cursor, day_id)
        
        # Delete the week day
        cursor.execute("DELETE FROM week_days WHERE id = ?", (day_id,))
        conn.commit()
        
        logger.info(f"Week day {day_id} ({day['name']}) deleted successfully")
        
        return {
            "success": True,
            "message": f"Week day '{day['name']}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_week_day: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/reorder")
async def reorder_week_days(reorder_data: WeekDayReorder):
    """Reorder active week days"""
    logger.info("POST /api/week-days/reorder - Reordering week days")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate all day IDs exist and are active
        for day_id in reorder_data.day_ids:
            cursor.execute("SELECT is_active FROM week_days WHERE id = ?", (day_id,))
            day = cursor.fetchone()
            if not day:
                raise HTTPException(status_code=404, detail=f"Week day with ID {day_id} not found")
            if not day['is_active']:
                raise HTTPException(status_code=400, detail=f"Cannot reorder inactive days. Day ID {day_id} is inactive.")
        
        # Reorder days
        reorder_active_days(cursor, reorder_data.day_ids)
        conn.commit()
        
        logger.info(f"Week days reordered successfully")
        
        return {
            "success": True,
            "message": "Week days reordered successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in reorder_week_days: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/{day_id}/toggle-active")
async def toggle_active_status(day_id: int):
    """Toggle the active status of a week day"""
    logger.info(f"POST /api/week-days/{day_id}/toggle-active - Toggling active status")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if week day exists
        cursor.execute("SELECT id, name, is_active, order_index FROM week_days WHERE id = ?", (day_id,))
        day = cursor.fetchone()
        
        if not day:
            raise HTTPException(status_code=404, detail="Week day not found")
        
        new_status = not day['is_active']
        
        if new_status:
            # Activating: assign next available order_index
            new_order_index = get_next_order_index(cursor)
            cursor.execute("""
                UPDATE week_days 
                SET is_active = 1, order_index = ?, updated_at = ?, version = version + 1
                WHERE id = ?
            """, (new_order_index, datetime.now().isoformat(), day_id))
        else:
            # Check if day is being used in schedules before deactivating
            validate_day_not_in_use(cursor, day_id)
            
            # Deactivating: remove order_index
            cursor.execute("""
                UPDATE week_days 
                SET is_active = 0, order_index = NULL, updated_at = ?, version = version + 1
                WHERE id = ?
            """, (datetime.now().isoformat(), day_id))
            
            # Reorder remaining active days
            update_order_indices(cursor)
        
        conn.commit()
        
        logger.info(f"Week day {day_id} ({day['name']}) active status changed to {new_status}")
        
        return {
            "success": True,
            "message": f"Day '{day['name']}' has been {'activated' if new_status else 'deactivated'}",
            "data": {"is_active": new_status},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in toggle_active_status: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_week_day_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync week day from external database"""
    try:
        logger.info("Syncing week day from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO week_days (
                id, name, order_index, is_active, version, synced_at, updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('name'),
            source_data.get('order_index'),
            source_data.get('is_active', 1),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Week day synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing week day: {str(e)}")
        logger.error(traceback.format_exc())
        return False