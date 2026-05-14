# app/school/levels.py

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

router = APIRouter(prefix="/api/levels", tags=["levels"])

# ==================== Pydantic Models ====================

class LevelBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., pattern="^(JHS|SHS)$")
    order_index: int = Field(..., ge=1, le=20)
    description: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Level name cannot be empty')
        return v.strip()

class LevelCreate(LevelBase):
    pass

class LevelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, pattern="^(JHS|SHS)$")
    order_index: Optional[int] = Field(None, ge=1, le=20)
    description: Optional[str] = None

class LevelResponse(BaseModel):
    id: int
    name: str
    category: str
    order_index: int
    description: Optional[str]
    created_at: datetime

# ==================== Helper Functions ====================

def check_level_has_classes(cursor, level_id: int) -> bool:
    """Check if a level has any classes associated with it"""
    try:
        cursor.execute("SELECT COUNT(*) as count FROM classes WHERE level_id = ?", (level_id,))
        result = cursor.fetchone()
        return result['count'] > 0 if result else False
    except Exception as e:
        logger.warning(f"Could not check classes for level {level_id}: {str(e)}")
        return False

def ensure_unique_order_index(cursor, category: str, order_index: int, exclude_id: Optional[int] = None):
    """Ensure order_index is unique within category"""
    query = "SELECT id FROM levels WHERE category = ? AND order_index = ?"
    params = [category, order_index]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400, 
            detail=f"Order index {order_index} already exists for {category}. Must be unique per category."
        )

def ensure_unique_name_in_category(cursor, category: str, name: str, exclude_id: Optional[int] = None):
    """Ensure name is unique within category"""
    query = "SELECT id FROM levels WHERE category = ? AND name = ?"
    params = [category, name]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400, 
            detail=f"Level '{name}' already exists in {category} category."
        )

def get_next_order_index(cursor, category: str) -> int:
    """Get the next available order index for a category"""
    cursor.execute(
        "SELECT COALESCE(MAX(order_index), 0) as max_index FROM levels WHERE category = ?",
        (category,)
    )
    result = cursor.fetchone()
    return result['max_index'] + 1 if result else 1

# ==================== Database Setup ====================

def create_levels_table():
    """Create levels table if it doesn't exist"""
    try:
        logger.info("Creating/checking levels table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS levels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL CHECK (category IN ('JHS','SHS')),
                order_index INTEGER NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(category, order_index)
            )
        """)
        logger.info("Table creation/check completed")
        
        # Check if table is empty, insert default records
        cursor.execute("SELECT COUNT(*) as count FROM levels")
        result = cursor.fetchone()
        
        if result['count'] == 0:
            logger.info("Inserting default levels")
            default_levels = [
                ("JHS 1", "JHS", 1, "Junior High School Year 1"),
                ("JHS 2", "JHS", 2, "Junior High School Year 2"),
                ("JHS 3", "JHS", 3, "Junior High School Year 3 - BECE"),
                ("SHS 1", "SHS", 1, "Senior High School Year 1"),
                ("SHS 2", "SHS", 2, "Senior High School Year 2"),
                ("SHS 3", "SHS", 3, "Senior High School Year 3 - WASSCE")
            ]
            
            for level in default_levels:
                cursor.execute("""
                    INSERT INTO levels (name, category, order_index, description, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (*level, datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default levels inserted successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating levels table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    # create_levels_table()
    pass
except Exception as e:
    logger.error(f"Failed to initialize levels table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_levels():
    """Get all levels ordered by category and order_index"""
    logger.info("GET /api/levels/ - Fetching all levels")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM levels 
            ORDER BY 
                CASE category 
                    WHEN 'JHS' THEN 1 
                    WHEN 'SHS' THEN 2 
                END,
                order_index ASC
        """)
        
        results = cursor.fetchall()
        levels = []
        
        for row in results:
            # Check if level has classes
            has_classes = check_level_has_classes(cursor, row['id'])
            
            levels.append({
                "id": row['id'],
                "name": row['name'],
                "category": row['category'],
                "order_index": row['order_index'],
                "description": row['description'],
                "has_classes": has_classes,
                "created_at": row['created_at']
            })
        
        logger.info(f"Retrieved {len(levels)} levels")
        
        return {
            "success": True,
            "data": levels,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_levels: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

@router.get("/{level_id}")
async def get_level(level_id: int):
    """Get a specific level by ID"""
    logger.info(f"GET /api/levels/{level_id} - Fetching level")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM levels WHERE id = ?", (level_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Level not found")
        
        has_classes = check_level_has_classes(cursor, level_id)
        
        level = {
            "id": result['id'],
            "name": result['name'],
            "category": result['category'],
            "order_index": result['order_index'],
            "description": result['description'],
            "has_classes": has_classes,
            "created_at": result['created_at']
        }
        
        return {
            "success": True,
            "data": level,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_level: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/category/{category}")
async def get_levels_by_category(category: str):
    """Get all levels for a specific category"""
    logger.info(f"GET /api/levels/category/{category} - Fetching levels by category")
    conn = None
    
    try:
        if category not in ['JHS', 'SHS']:
            raise HTTPException(status_code=400, detail="Category must be JHS or SHS")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM levels 
            WHERE category = ?
            ORDER BY order_index ASC
        """, (category,))
        
        results = cursor.fetchall()
        levels = []
        
        for row in results:
            has_classes = check_level_has_classes(cursor, row['id'])
            
            levels.append({
                "id": row['id'],
                "name": row['name'],
                "category": row['category'],
                "order_index": row['order_index'],
                "description": row['description'],
                "has_classes": has_classes,
                "created_at": row['created_at']
            })
        
        logger.info(f"Retrieved {len(levels)} levels for category {category}")
        
        return {
            "success": True,
            "data": levels,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_levels_by_category: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/next-order/{category}")
async def get_next_order_index_endpoint(category: str):
    """Get the next available order index for a category"""
    logger.info(f"GET /api/levels/next-order/{category} - Getting next order index")
    conn = None
    
    try:
        if category not in ['JHS', 'SHS']:
            raise HTTPException(status_code=400, detail="Category must be JHS or SHS")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        next_index = get_next_order_index(cursor, category)
        
        return {
            "success": True,
            "data": {
                "category": category,
                "next_order_index": next_index
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_next_order_index: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_level(level_data: LevelCreate):
    """Create a new level"""
    logger.info(f"POST /api/levels/ - Creating new level: {level_data.name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if order_index is unique within category
        ensure_unique_order_index(cursor, level_data.category, level_data.order_index)
        
        # Check if name is unique within category
        ensure_unique_name_in_category(cursor, level_data.category, level_data.name)
        
        # Insert new level
        cursor.execute("""
            INSERT INTO levels (name, category, order_index, description, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            level_data.name, level_data.category, level_data.order_index,
            level_data.description, datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Level created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Level created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_level: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{level_id}")
async def update_level(level_id: int, level_data: LevelUpdate):
    """Update a level"""
    logger.info(f"PUT /api/levels/{level_id} - Updating level")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if level exists
        cursor.execute("SELECT * FROM levels WHERE id = ?", (level_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Level not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Get values for uniqueness checks
        new_category = level_data.category if level_data.category is not None else existing['category']
        new_order_index = level_data.order_index if level_data.order_index is not None else existing['order_index']
        new_name = level_data.name if level_data.name is not None else existing['name']
        
        # Check if order_index is unique within category (excluding current level)
        if level_data.order_index is not None:
            ensure_unique_order_index(cursor, new_category, new_order_index, level_id)
        
        # Check if name is unique within category (excluding current level)
        if level_data.name is not None:
            ensure_unique_name_in_category(cursor, new_category, new_name, level_id)
        
        # Apply updates
        if level_data.name is not None:
            updates.append("name = ?")
            params.append(level_data.name)
        
        if level_data.category is not None:
            updates.append("category = ?")
            params.append(level_data.category)
        
        if level_data.order_index is not None:
            updates.append("order_index = ?")
            params.append(level_data.order_index)
        
        if level_data.description is not None:
            updates.append("description = ?")
            params.append(level_data.description)
        
        # Execute update
        if updates:
            params.append(level_id)
            query = f"UPDATE levels SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Level {level_id} updated successfully")
        
        return {
            "success": True,
            "message": "Level updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_level: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{level_id}")
async def delete_level(level_id: int):
    """Delete a level"""
    logger.info(f"DELETE /api/levels/{level_id} - Deleting level")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if level exists and get details
        cursor.execute("SELECT name, category FROM levels WHERE id = ?", (level_id,))
        level = cursor.fetchone()
        
        if not level:
            raise HTTPException(status_code=404, detail="Level not found")
        
        # Check if level has classes
        has_classes = check_level_has_classes(cursor, level_id)
        
        if has_classes:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot delete {level['name']} because it has existing classes. Please reassign or delete classes first."
            )
        
        # Delete the level
        cursor.execute("DELETE FROM levels WHERE id = ?", (level_id,))
        conn.commit()
        
        logger.info(f"Level {level_id} ({level['name']}) deleted successfully")
        
        return {
            "success": True,
            "message": f"Level '{level['name']}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_level: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/reorder")
async def reorder_levels(reorder_data: Dict[str, Any]):
    """Reorder levels within a category"""
    logger.info(f"POST /api/levels/reorder - Reordering levels")
    conn = None
    
    try:
        category = reorder_data.get('category')
        level_order = reorder_data.get('order', [])
        
        if category not in ['JHS', 'SHS']:
            raise HTTPException(status_code=400, detail="Category must be JHS or SHS")
        
        if not level_order:
            raise HTTPException(status_code=400, detail="Order list cannot be empty")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update order_index for each level
        for index, level_id in enumerate(level_order, start=1):
            cursor.execute("""
                UPDATE levels 
                SET order_index = ?
                WHERE id = ? AND category = ?
            """, (index, level_id, category))
        
        conn.commit()
        
        logger.info(f"Levels reordered for category {category}")
        
        return {
            "success": True,
            "message": "Levels reordered successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in reorder_levels: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_level_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync level from external database"""
    try:
        logger.info("Syncing level from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO levels (id, name, category, order_index, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('name'),
            source_data.get('category'),
            source_data.get('order_index'),
            source_data.get('description'),
            source_data.get('created_at', datetime.now().isoformat())
        ))
        
        conn.commit()
        conn.close()
        logger.info("Level synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing level: {str(e)}")
        logger.error(traceback.format_exc())
        return False