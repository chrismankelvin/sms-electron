# # app/school/time_slots.py

# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel, Field, validator
# from typing import Optional, Dict, Any, List
# from datetime import datetime, time
# import logging
# import traceback
# import sys

# from app.activation.state import get_db_connection

# # Configure logging
# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)

# if not logger.handlers:
#     console_handler = logging.StreamHandler(sys.stdout)
#     console_handler.setLevel(logging.DEBUG)
#     formatter = logging.Formatter(
#         '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
#     )
#     console_handler.setFormatter(formatter)
#     logger.addHandler(console_handler)

# router = APIRouter(prefix="/api/time-slots", tags=["time-slots"])

# # ==================== Pydantic Models ====================

# class TimeSlotBase(BaseModel):
#     name: str = Field(..., min_length=1, max_length=100)
#     start_time: str = Field(..., regex="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
#     end_time: str = Field(..., regex="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
#     order_index: Optional[int] = Field(None, ge=1)
#     is_break: bool = False
    
#     @validator('end_time')
#     def validate_times(cls, end_time, values):
#         if 'start_time' in values:
#             start = values['start_time']
#             if start >= end_time:
#                 raise ValueError('End time must be after start time')
#         return end_time

# class TimeSlotCreate(TimeSlotBase):
#     pass

# class TimeSlotUpdate(BaseModel):
#     name: Optional[str] = Field(None, min_length=1, max_length=100)
#     start_time: Optional[str] = Field(None, regex="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
#     end_time: Optional[str] = Field(None, regex="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
#     order_index: Optional[int] = Field(None, ge=1)
#     is_break: Optional[bool] = None

# class TimeSlotResponse(BaseModel):
#     id: int
#     name: str
#     start_time: str
#     end_time: str
#     order_index: int
#     is_break: bool
#     version: int
#     created_at: datetime
#     updated_at: datetime

# class TimeSlotReorder(BaseModel):
#     slot_ids: List[int]  # Ordered list of slot IDs

# # ==================== Helper Functions ====================

# def validate_no_overlap(cursor, start_time: str, end_time: str, exclude_id: Optional[int] = None):
#     """Check if time slot overlaps with existing ones"""
#     query = """
#         SELECT id, name, start_time, end_time FROM time_slots 
#         WHERE (start_time < ? AND end_time > ?)
#            OR (start_time < ? AND end_time > ?)
#            OR (start_time >= ? AND end_time <= ?)
#     """
#     params = [end_time, start_time, end_time, start_time, start_time, end_time]
    
#     if exclude_id:
#         query += " AND id != ?"
#         params.append(exclude_id)
    
#     cursor.execute(query, params)
#     overlapping = cursor.fetchone()
    
#     if overlapping:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Time overlaps with '{overlapping['name']}' ({overlapping['start_time']} - {overlapping['end_time']})"
#         )

# def get_next_order_index(cursor) -> int:
#     """Get the next available order index"""
#     cursor.execute("SELECT COALESCE(MAX(order_index), 0) as max_index FROM time_slots")
#     result = cursor.fetchone()
#     return result['max_index'] + 1

# def reorder_slots(cursor, slot_ids: List[int]):
#     """Reorder time slots based on the provided order"""
#     for index, slot_id in enumerate(slot_ids, start=1):
#         cursor.execute("""
#             UPDATE time_slots 
#             SET order_index = ?, updated_at = ?
#             WHERE id = ?
#         """, (index, datetime.now().isoformat(), slot_id))

# # ==================== Database Setup ====================

# def create_time_slots_table():
#     """Create time_slots table if it doesn't exist"""
#     try:
#         logger.info("Creating/checking time_slots table")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if table exists
#         cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='time_slots'")
#         table_exists = cursor.fetchone()
        
#         if not table_exists:
#             cursor.execute("""
#                 CREATE TABLE time_slots (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     name TEXT NOT NULL,
#                     start_time TIME NOT NULL,
#                     end_time TIME NOT NULL,
#                     order_index INTEGER,
#                     is_break BOOLEAN DEFAULT 0,
#                     version INTEGER DEFAULT 1,
#                     synced_at TIMESTAMP,
#                     updated_by_sync NUMERIC DEFAULT 0,
#                     created_at NUMERIC DEFAULT CURRENT_TIMESTAMP,
#                     updated_at NUMERIC DEFAULT CURRENT_TIMESTAMP
#                 )
#             """)
#             logger.info("New time_slots table created")
            
#             # Insert default time slots
#             logger.info("Inserting default time slots")
#             default_slots = [
#                 ("Period 1", "08:00", "08:45", 1, 0),
#                 ("Period 2", "08:45", "09:30", 2, 0),
#                 ("Break", "09:30", "10:00", 3, 1),
#                 ("Period 3", "10:00", "10:45", 4, 0),
#                 ("Period 4", "10:45", "11:30", 5, 0),
#                 ("Lunch", "11:30", "12:15", 6, 1),
#                 ("Period 5", "12:15", "13:00", 7, 0)
#             ]
            
#             for slot in default_slots:
#                 cursor.execute("""
#                     INSERT INTO time_slots (name, start_time, end_time, order_index, is_break, created_at, updated_at)
#                     VALUES (?, ?, ?, ?, ?, ?, ?)
#                 """, (*slot, datetime.now().isoformat(), datetime.now().isoformat()))
            
#             conn.commit()
#             logger.info("Default time slots inserted successfully")
#         else:
#             logger.info("Table 'time_slots' already exists, checking columns")
            
#             # Add missing columns if needed
#             cursor.execute("PRAGMA table_info(time_slots)")
#             columns = cursor.fetchall()
#             column_names = [col['name'] for col in columns]
            
#             if 'synced_at' not in column_names:
#                 logger.info("Adding synced_at column")
#                 cursor.execute("ALTER TABLE time_slots ADD COLUMN synced_at TIMESTAMP")
            
#             if 'updated_by_sync' not in column_names:
#                 logger.info("Adding updated_by_sync column")
#                 cursor.execute("ALTER TABLE time_slots ADD COLUMN updated_by_sync NUMERIC DEFAULT 0")
            
#             if 'version' not in column_names:
#                 logger.info("Adding version column")
#                 cursor.execute("ALTER TABLE time_slots ADD COLUMN version INTEGER DEFAULT 1")
            
#             conn.commit()
#             logger.info("Table structure updated successfully")
        
#         conn.close()
#     except Exception as e:
#         logger.error(f"Error creating/updating time_slots table: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise

# # Initialize table on module load
# try:
#     create_time_slots_table()
# except Exception as e:
#     logger.error(f"Failed to initialize time_slots table: {str(e)}")

# # ==================== API Endpoints ====================

# @router.get("/")
# async def get_time_slots():
#     """Get all time slots ordered by order_index"""
#     logger.info("GET /api/time-slots/ - Fetching all time slots")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT * FROM time_slots 
#             ORDER BY order_index ASC
#         """)
        
#         results = cursor.fetchall()
#         slots = []
        
#         for row in results:
#             slots.append({
#                 "id": row['id'],
#                 "name": row['name'],
#                 "start_time": row['start_time'],
#                 "end_time": row['end_time'],
#                 "order_index": row['order_index'],
#                 "is_break": bool(row['is_break']),
#                 "version": row['version'],
#                 "created_at": row['created_at'],
#                 "updated_at": row['updated_at']
#             })
        
#         logger.info(f"Retrieved {len(slots)} time slots")
        
#         return {
#             "success": True,
#             "data": slots,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_time_slots: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
#             logger.debug("Database connection closed")

# @router.get("/{slot_id}")
# async def get_time_slot(slot_id: int):
#     """Get a specific time slot by ID"""
#     logger.info(f"GET /api/time-slots/{slot_id} - Fetching time slot")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("SELECT * FROM time_slots WHERE id = ?", (slot_id,))
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Time slot not found")
        
#         slot = {
#             "id": result['id'],
#             "name": result['name'],
#             "start_time": result['start_time'],
#             "end_time": result['end_time'],
#             "order_index": result['order_index'],
#             "is_break": bool(result['is_break']),
#             "version": result['version'],
#             "created_at": result['created_at'],
#             "updated_at": result['updated_at']
#         }
        
#         return {
#             "success": True,
#             "data": slot,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_time_slot: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/")
# async def create_time_slot(slot_data: TimeSlotCreate):
#     """Create a new time slot"""
#     logger.info(f"POST /api/time-slots/ - Creating new time slot: {slot_data.name}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Validate no overlap
#         validate_no_overlap(cursor, slot_data.start_time, slot_data.end_time)
        
#         # Get next order index if not provided
#         order_index = slot_data.order_index if slot_data.order_index is not None else get_next_order_index(cursor)
        
#         # If order_index is provided, shift existing slots
#         if slot_data.order_index is not None:
#             cursor.execute("""
#                 UPDATE time_slots 
#                 SET order_index = order_index + 1, updated_at = ?
#                 WHERE order_index >= ?
#             """, (datetime.now().isoformat(), slot_data.order_index))
        
#         # Insert new time slot
#         cursor.execute("""
#             INSERT INTO time_slots (name, start_time, end_time, order_index, is_break, created_at, updated_at)
#             VALUES (?, ?, ?, ?, ?, ?, ?)
#         """, (
#             slot_data.name, slot_data.start_time, slot_data.end_time,
#             order_index, slot_data.is_break,
#             datetime.now().isoformat(), datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         new_id = cursor.lastrowid
        
#         logger.info(f"Time slot created successfully with ID: {new_id}")
        
#         return {
#             "success": True,
#             "message": "Time slot created successfully",
#             "data": {"id": new_id},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in create_time_slot: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/{slot_id}")
# async def update_time_slot(slot_id: int, slot_data: TimeSlotUpdate):
#     """Update a time slot"""
#     logger.info(f"PUT /api/time-slots/{slot_id} - Updating time slot")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if time slot exists
#         cursor.execute("SELECT * FROM time_slots WHERE id = ?", (slot_id,))
#         existing = cursor.fetchone()
        
#         if not existing:
#             raise HTTPException(status_code=404, detail="Time slot not found")
        
#         # Build update query dynamically
#         updates = []
#         params = []
        
#         # Validate time overlap if times are being updated
#         new_start = slot_data.start_time if slot_data.start_time is not None else existing['start_time']
#         new_end = slot_data.end_time if slot_data.end_time is not None else existing['end_time']
        
#         if slot_data.start_time is not None or slot_data.end_time is not None:
#             # Validate end time after start time
#             if new_start >= new_end:
#                 raise HTTPException(status_code=400, detail="End time must be after start time")
            
#             # Check for overlaps
#             validate_no_overlap(cursor, new_start, new_end, slot_id)
        
#         if slot_data.name is not None:
#             updates.append("name = ?")
#             params.append(slot_data.name)
        
#         if slot_data.start_time is not None:
#             updates.append("start_time = ?")
#             params.append(slot_data.start_time)
        
#         if slot_data.end_time is not None:
#             updates.append("end_time = ?")
#             params.append(slot_data.end_time)
        
#         if slot_data.is_break is not None:
#             updates.append("is_break = ?")
#             params.append(1 if slot_data.is_break else 0)
        
#         # Handle order_index change
#         if slot_data.order_index is not None and slot_data.order_index != existing['order_index']:
#             old_index = existing['order_index']
#             new_index = slot_data.order_index
            
#             if new_index < old_index:
#                 # Move up: shift slots between new and old index down
#                 cursor.execute("""
#                     UPDATE time_slots 
#                     SET order_index = order_index + 1, updated_at = ?
#                     WHERE order_index >= ? AND order_index < ?
#                 """, (datetime.now().isoformat(), new_index, old_index))
#             else:
#                 # Move down: shift slots between old and new index up
#                 cursor.execute("""
#                     UPDATE time_slots 
#                     SET order_index = order_index - 1, updated_at = ?
#                     WHERE order_index > ? AND order_index <= ?
#                 """, (datetime.now().isoformat(), old_index, new_index))
            
#             updates.append("order_index = ?")
#             params.append(new_index)
        
#         # Add version increment and update timestamp
#         updates.append("version = version + 1")
#         updates.append("updated_at = ?")
#         params.append(datetime.now().isoformat())
        
#         # Execute update
#         if updates:
#             params.append(slot_id)
#             query = f"UPDATE time_slots SET {', '.join(updates)} WHERE id = ?"
#             cursor.execute(query, params)
#             conn.commit()
#             logger.info(f"Time slot {slot_id} updated successfully")
        
#         return {
#             "success": True,
#             "message": "Time slot updated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in update_time_slot: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.delete("/{slot_id}")
# async def delete_time_slot(slot_id: int):
#     """Delete a time slot"""
#     logger.info(f"DELETE /api/time-slots/{slot_id} - Deleting time slot")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if time slot exists and get order_index
#         cursor.execute("SELECT name, order_index FROM time_slots WHERE id = ?", (slot_id,))
#         slot = cursor.fetchone()
        
#         if not slot:
#             raise HTTPException(status_code=404, detail="Time slot not found")
        
#         # Delete the time slot
#         cursor.execute("DELETE FROM time_slots WHERE id = ?", (slot_id,))
        
#         # Reorder remaining slots
#         cursor.execute("""
#             UPDATE time_slots 
#             SET order_index = order_index - 1, updated_at = ?
#             WHERE order_index > ?
#         """, (datetime.now().isoformat(), slot['order_index']))
        
#         conn.commit()
        
#         logger.info(f"Time slot {slot_id} ({slot['name']}) deleted successfully")
        
#         return {
#             "success": True,
#             "message": f"Time slot '{slot['name']}' deleted successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in delete_time_slot: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/reorder")
# async def reorder_time_slots(reorder_data: TimeSlotReorder):
#     """Reorder time slots"""
#     logger.info("POST /api/time-slots/reorder - Reordering time slots")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Validate all slot IDs exist
#         for slot_id in reorder_data.slot_ids:
#             cursor.execute("SELECT id FROM time_slots WHERE id = ?", (slot_id,))
#             if not cursor.fetchone():
#                 raise HTTPException(status_code=404, detail=f"Time slot with ID {slot_id} not found")
        
#         # Reorder slots
#         reorder_slots(cursor, reorder_data.slot_ids)
#         conn.commit()
        
#         logger.info(f"Time slots reordered successfully")
        
#         return {
#             "success": True,
#             "message": "Time slots reordered successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in reorder_time_slots: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/check-overlap")
# async def check_time_overlap(start_time: str, end_time: str, exclude_id: Optional[int] = None):
#     """Check if a time slot would overlap with existing ones"""
#     logger.info(f"GET /api/time-slots/check-overlap - Checking overlap for {start_time}-{end_time}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         query = """
#             SELECT id, name, start_time, end_time FROM time_slots 
#             WHERE (start_time < ? AND end_time > ?)
#                OR (start_time < ? AND end_time > ?)
#                OR (start_time >= ? AND end_time <= ?)
#         """
#         params = [end_time, start_time, end_time, start_time, start_time, end_time]
        
#         if exclude_id:
#             query += " AND id != ?"
#             params.append(exclude_id)
        
#         cursor.execute(query, params)
#         overlapping = cursor.fetchone()
        
#         if overlapping:
#             return {
#                 "success": False,
#                 "data": {
#                     "overlaps": True,
#                     "conflicting_slot": {
#                         "id": overlapping['id'],
#                         "name": overlapping['name'],
#                         "start_time": overlapping['start_time'],
#                         "end_time": overlapping['end_time']
#                     }
#                 },
#                 "timestamp": datetime.now().isoformat()
#             }
        
#         return {
#             "success": True,
#             "data": {"overlaps": False},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in check_time_overlap: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Sync Integration Functions ====================

# def sync_time_slot_from_external(source_data: Dict[str, Any]) -> bool:
#     """Sync time slot from external database"""
#     try:
#         logger.info("Syncing time slot from external source")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             INSERT OR REPLACE INTO time_slots (
#                 id, name, start_time, end_time, order_index, is_break,
#                 version, synced_at, updated_by_sync, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             source_data.get('id'),
#             source_data.get('name'),
#             source_data.get('start_time'),
#             source_data.get('end_time'),
#             source_data.get('order_index'),
#             source_data.get('is_break', 0),
#             source_data.get('version', 1),
#             datetime.now().isoformat(),
#             1,
#             datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         conn.close()
#         logger.info("Time slot synced successfully")
#         return True
        
#     except Exception as e:
#         logger.error(f"Error syncing time slot: {str(e)}")
#         logger.error(traceback.format_exc())
#         return False











# app/school/time_slots.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime, time
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

router = APIRouter(prefix="/api/time-slots", tags=["time-slots"])

# ==================== Pydantic Models ====================

class TimeSlotBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    start_time: str = Field(..., pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    order_index: Optional[int] = Field(None, ge=1)
    is_break: bool = False
    
    @validator('end_time')
    def validate_times(cls, end_time, values):
        if 'start_time' in values:
            start = values['start_time']
            if start >= end_time:
                raise ValueError('End time must be after start time')
        return end_time

class TimeSlotCreate(TimeSlotBase):
    pass

class TimeSlotUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    start_time: Optional[str] = Field(None, pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: Optional[str] = Field(None, pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    order_index: Optional[int] = Field(None, ge=1)
    is_break: Optional[bool] = None

class TimeSlotResponse(BaseModel):
    id: int
    name: str
    start_time: str
    end_time: str
    order_index: int
    is_break: bool
    version: int
    created_at: datetime
    updated_at: datetime

class TimeSlotReorder(BaseModel):
    slot_ids: List[int]  # Ordered list of slot IDs

# ==================== Helper Functions ====================

def validate_no_overlap(cursor, start_time: str, end_time: str, exclude_id: Optional[int] = None):
    """Check if time slot overlaps with existing ones"""
    query = """
        SELECT id, name, start_time, end_time FROM time_slots 
        WHERE (start_time < ? AND end_time > ?)
           OR (start_time < ? AND end_time > ?)
           OR (start_time >= ? AND end_time <= ?)
    """
    params = [end_time, start_time, end_time, start_time, start_time, end_time]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    overlapping = cursor.fetchone()
    
    if overlapping:
        raise HTTPException(
            status_code=400,
            detail=f"Time overlaps with '{overlapping['name']}' ({overlapping['start_time']} - {overlapping['end_time']})"
        )

def get_next_order_index(cursor) -> int:
    """Get the next available order index"""
    cursor.execute("SELECT COALESCE(MAX(order_index), 0) as max_index FROM time_slots")
    result = cursor.fetchone()
    return result['max_index'] + 1

def reorder_slots(cursor, slot_ids: List[int]):
    """Reorder time slots based on the provided order"""
    for index, slot_id in enumerate(slot_ids, start=1):
        cursor.execute("""
            UPDATE time_slots 
            SET order_index = ?, updated_at = ?
            WHERE id = ?
        """, (index, datetime.now().isoformat(), slot_id))

# ==================== Database Setup ====================

def create_time_slots_table():
    """Create time_slots table if it doesn't exist"""
    try:
        logger.info("Creating/checking time_slots table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='time_slots'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE time_slots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    order_index INTEGER,
                    is_break BOOLEAN DEFAULT 0,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync NUMERIC DEFAULT 0,
                    created_at NUMERIC DEFAULT CURRENT_TIMESTAMP,
                    updated_at NUMERIC DEFAULT CURRENT_TIMESTAMP
                )
            """)
            logger.info("New time_slots table created")
            
            # Insert default time slots
            logger.info("Inserting default time slots")
            default_slots = [
                ("Period 1", "08:00", "08:45", 1, 0),
                ("Period 2", "08:45", "09:30", 2, 0),
                ("Break", "09:30", "10:00", 3, 1),
                ("Period 3", "10:00", "10:45", 4, 0),
                ("Period 4", "10:45", "11:30", 5, 0),
                ("Lunch", "11:30", "12:15", 6, 1),
                ("Period 5", "12:15", "13:00", 7, 0)
            ]
            
            for slot in default_slots:
                cursor.execute("""
                    INSERT INTO time_slots (name, start_time, end_time, order_index, is_break, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (*slot, datetime.now().isoformat(), datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default time slots inserted successfully")
        else:
            logger.info("Table 'time_slots' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(time_slots)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE time_slots ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE time_slots ADD COLUMN updated_by_sync NUMERIC DEFAULT 0")
            
            if 'version' not in column_names:
                logger.info("Adding version column")
                cursor.execute("ALTER TABLE time_slots ADD COLUMN version INTEGER DEFAULT 1")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating time_slots table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_time_slots_table()
except Exception as e:
    logger.error(f"Failed to initialize time_slots table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_time_slots():
    """Get all time slots ordered by order_index"""
    logger.info("GET /api/time-slots/ - Fetching all time slots")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM time_slots 
            ORDER BY order_index ASC
        """)
        
        results = cursor.fetchall()
        slots = []
        
        for row in results:
            slots.append({
                "id": row['id'],
                "name": row['name'],
                "start_time": row['start_time'],
                "end_time": row['end_time'],
                "order_index": row['order_index'],
                "is_break": bool(row['is_break']),
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(slots)} time slots")
        
        return {
            "success": True,
            "data": slots,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_time_slots: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

@router.get("/{slot_id}")
async def get_time_slot(slot_id: int):
    """Get a specific time slot by ID"""
    logger.info(f"GET /api/time-slots/{slot_id} - Fetching time slot")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM time_slots WHERE id = ?", (slot_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Time slot not found")
        
        slot = {
            "id": result['id'],
            "name": result['name'],
            "start_time": result['start_time'],
            "end_time": result['end_time'],
            "order_index": result['order_index'],
            "is_break": bool(result['is_break']),
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": slot,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_time_slot: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_time_slot(slot_data: TimeSlotCreate):
    """Create a new time slot"""
    logger.info(f"POST /api/time-slots/ - Creating new time slot: {slot_data.name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate no overlap
        validate_no_overlap(cursor, slot_data.start_time, slot_data.end_time)
        
        # Get next order index if not provided
        order_index = slot_data.order_index if slot_data.order_index is not None else get_next_order_index(cursor)
        
        # If order_index is provided, shift existing slots
        if slot_data.order_index is not None:
            cursor.execute("""
                UPDATE time_slots 
                SET order_index = order_index + 1, updated_at = ?
                WHERE order_index >= ?
            """, (datetime.now().isoformat(), slot_data.order_index))
        
        # Insert new time slot
        cursor.execute("""
            INSERT INTO time_slots (name, start_time, end_time, order_index, is_break, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            slot_data.name, slot_data.start_time, slot_data.end_time,
            order_index, slot_data.is_break,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Time slot created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Time slot created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_time_slot: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{slot_id}")
async def update_time_slot(slot_id: int, slot_data: TimeSlotUpdate):
    """Update a time slot"""
    logger.info(f"PUT /api/time-slots/{slot_id} - Updating time slot")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if time slot exists
        cursor.execute("SELECT * FROM time_slots WHERE id = ?", (slot_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Time slot not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Validate time overlap if times are being updated
        new_start = slot_data.start_time if slot_data.start_time is not None else existing['start_time']
        new_end = slot_data.end_time if slot_data.end_time is not None else existing['end_time']
        
        if slot_data.start_time is not None or slot_data.end_time is not None:
            # Validate end time after start time
            if new_start >= new_end:
                raise HTTPException(status_code=400, detail="End time must be after start time")
            
            # Check for overlaps
            validate_no_overlap(cursor, new_start, new_end, slot_id)
        
        if slot_data.name is not None:
            updates.append("name = ?")
            params.append(slot_data.name)
        
        if slot_data.start_time is not None:
            updates.append("start_time = ?")
            params.append(slot_data.start_time)
        
        if slot_data.end_time is not None:
            updates.append("end_time = ?")
            params.append(slot_data.end_time)
        
        if slot_data.is_break is not None:
            updates.append("is_break = ?")
            params.append(1 if slot_data.is_break else 0)
        
        # Handle order_index change
        if slot_data.order_index is not None and slot_data.order_index != existing['order_index']:
            old_index = existing['order_index']
            new_index = slot_data.order_index
            
            if new_index < old_index:
                # Move up: shift slots between new and old index down
                cursor.execute("""
                    UPDATE time_slots 
                    SET order_index = order_index + 1, updated_at = ?
                    WHERE order_index >= ? AND order_index < ?
                """, (datetime.now().isoformat(), new_index, old_index))
            else:
                # Move down: shift slots between old and new index up
                cursor.execute("""
                    UPDATE time_slots 
                    SET order_index = order_index - 1, updated_at = ?
                    WHERE order_index > ? AND order_index <= ?
                """, (datetime.now().isoformat(), old_index, new_index))
            
            updates.append("order_index = ?")
            params.append(new_index)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(slot_id)
            query = f"UPDATE time_slots SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Time slot {slot_id} updated successfully")
        
        return {
            "success": True,
            "message": "Time slot updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_time_slot: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{slot_id}")
async def delete_time_slot(slot_id: int):
    """Delete a time slot"""
    logger.info(f"DELETE /api/time-slots/{slot_id} - Deleting time slot")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if time slot exists and get order_index
        cursor.execute("SELECT name, order_index FROM time_slots WHERE id = ?", (slot_id,))
        slot = cursor.fetchone()
        
        if not slot:
            raise HTTPException(status_code=404, detail="Time slot not found")
        
        # Delete the time slot
        cursor.execute("DELETE FROM time_slots WHERE id = ?", (slot_id,))
        
        # Reorder remaining slots
        cursor.execute("""
            UPDATE time_slots 
            SET order_index = order_index - 1, updated_at = ?
            WHERE order_index > ?
        """, (datetime.now().isoformat(), slot['order_index']))
        
        conn.commit()
        
        logger.info(f"Time slot {slot_id} ({slot['name']}) deleted successfully")
        
        return {
            "success": True,
            "message": f"Time slot '{slot['name']}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_time_slot: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/reorder")
async def reorder_time_slots(reorder_data: TimeSlotReorder):
    """Reorder time slots"""
    logger.info("POST /api/time-slots/reorder - Reordering time slots")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate all slot IDs exist
        for slot_id in reorder_data.slot_ids:
            cursor.execute("SELECT id FROM time_slots WHERE id = ?", (slot_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail=f"Time slot with ID {slot_id} not found")
        
        # Reorder slots
        reorder_slots(cursor, reorder_data.slot_ids)
        conn.commit()
        
        logger.info(f"Time slots reordered successfully")
        
        return {
            "success": True,
            "message": "Time slots reordered successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in reorder_time_slots: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/check-overlap")
async def check_time_overlap(start_time: str, end_time: str, exclude_id: Optional[int] = None):
    """Check if a time slot would overlap with existing ones"""
    logger.info(f"GET /api/time-slots/check-overlap - Checking overlap for {start_time}-{end_time}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT id, name, start_time, end_time FROM time_slots 
            WHERE (start_time < ? AND end_time > ?)
               OR (start_time < ? AND end_time > ?)
               OR (start_time >= ? AND end_time <= ?)
        """
        params = [end_time, start_time, end_time, start_time, start_time, end_time]
        
        if exclude_id:
            query += " AND id != ?"
            params.append(exclude_id)
        
        cursor.execute(query, params)
        overlapping = cursor.fetchone()
        
        if overlapping:
            return {
                "success": False,
                "data": {
                    "overlaps": True,
                    "conflicting_slot": {
                        "id": overlapping['id'],
                        "name": overlapping['name'],
                        "start_time": overlapping['start_time'],
                        "end_time": overlapping['end_time']
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "success": True,
            "data": {"overlaps": False},
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in check_time_overlap: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_time_slot_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync time slot from external database"""
    try:
        logger.info("Syncing time slot from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO time_slots (
                id, name, start_time, end_time, order_index, is_break,
                version, synced_at, updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('name'),
            source_data.get('start_time'),
            source_data.get('end_time'),
            source_data.get('order_index'),
            source_data.get('is_break', 0),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Time slot synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing time slot: {str(e)}")
        logger.error(traceback.format_exc())
        return False