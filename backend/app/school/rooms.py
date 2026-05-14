
# app/school/rooms.py

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

router = APIRouter(prefix="/api/rooms", tags=["rooms"])

# ==================== Pydantic Models ====================

class RoomBase(BaseModel):
    room_name: str = Field(..., min_length=1, max_length=100)
    capacity: int = Field(default=30, ge=1, le=1000)
    type: str = Field(..., pattern="^(Classroom|Lab|Hall|Office)$")
    building: Optional[str] = Field(None, max_length=100)
    floor: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    is_active: bool = True
    
    @validator('room_name')
    def validate_room_name(cls, v):
        if not v.strip():
            raise ValueError('Room name cannot be empty')
        return v.strip()

class RoomCreate(RoomBase):
    created_by: Optional[int] = None

class RoomUpdate(BaseModel):
    room_name: Optional[str] = Field(None, min_length=1, max_length=100)
    capacity: Optional[int] = Field(None, ge=1, le=1000)
    type: Optional[str] = Field(None, pattern="^(Classroom|Lab|Hall|Office)$")
    building: Optional[str] = Field(None, max_length=100)
    floor: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    updated_by: Optional[int] = None

class RoomResponse(BaseModel):
    id: int
    room_name: str
    capacity: int
    type: str
    building: Optional[str]
    floor: Optional[str]
    description: Optional[str]
    is_active: bool
    version: int
    created_at: datetime
    updated_at: datetime

# ==================== Helper Functions ====================

def ensure_unique_room_name(cursor, room_name: str, exclude_id: Optional[int] = None):
    """Ensure room name is unique"""
    query = "SELECT id FROM rooms WHERE room_name = ?"
    params = [room_name]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400,
            detail=f"Room '{room_name}' already exists. Please use a unique name."
        )

# ==================== Database Setup ====================

# def create_rooms_table():
#     """Create rooms table if it doesn't exist"""
#     # try:
#     #     logger.info("Creating/checking rooms table")
#     #     conn = get_db_connection()
#     #     cursor = conn.cursor()
        
#     #     # Check if table exists
#     #     cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='rooms'")
#     #     table_exists = cursor.fetchone()
        
#     #     if not table_exists:
#     #         # cursor.execute("""
#     #         #     CREATE TABLE rooms (
#     #         #         id INTEGER PRIMARY KEY AUTOINCREMENT,
#     #         #         room_name TEXT NOT NULL,
#     #         #         capacity INTEGER NOT NULL DEFAULT 30 CHECK (capacity > 0),
#     #         #         type TEXT NOT NULL CHECK (type IN ('Classroom', 'Lab', 'Hall', 'Office')),
#     #         #         building TEXT,
#     #         #         floor TEXT,
#     #         #         description TEXT,
#     #         #         is_active BOOLEAN DEFAULT 1,
#     #         #         version INTEGER DEFAULT 1,
#     #         #         synced_at TIMESTAMP,
#     #         #         updated_by_sync BOOLEAN DEFAULT 0,
#     #         #         sync_error TEXT,
#     #         #         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#     #         #         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#     #         #         created_by INTEGER,
#     #         #         updated_by INTEGER,
#     #         #         FOREIGN KEY (created_by) REFERENCES users(id),
#     #         #         FOREIGN KEY (updated_by) REFERENCES users(id)
#     #         #     )
#     #         # """)
#     #         # logger.info("New rooms table created")
            
#     #         # # Insert default rooms
#     #         # logger.info("Inserting default rooms")
#     #         # default_rooms = [
#     #         #     ("Room 101", 40, "Classroom", "Main Building", "1st Floor", "Standard classroom", 1),
#     #         #     ("Science Lab A", 30, "Lab", "Science Block", "Ground Floor", "Chemistry and Biology lab", 1),
#     #         #     ("Computer Lab", 25, "Lab", "ICT Center", "1st Floor", "Computer laboratory", 1),
#     #         #     ("Assembly Hall", 500, "Hall", "Main Building", "2nd Floor", "School assembly hall", 1)
#     #         # ]
            
            
#     #         # for room in default_rooms:
#     #         #     cursor.execute("""
#     #         #         INSERT INTO rooms (room_name, capacity, type, building, floor, description, is_active, created_at, updated_at)
#     #         #         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
#     #         #     """, (*room, datetime.now().isoformat(), datetime.now().isoformat()))
            
#     #         # conn.commit()

#     #         pass
#     #         logger.info("Default rooms inserted successfully")
#     #     else:
#     #         logger.info("Table 'rooms' already exists, checking columns")
            
#     #         # Add missing columns if needed
#     #         cursor.execute("PRAGMA table_info(rooms)")
#     #         columns = cursor.fetchall()
#     #         column_names = [col['name'] for col in columns]
            
#     #         if 'description' not in column_names:
#     #             logger.info("Adding description column")
#     #             cursor.execute("ALTER TABLE rooms ADD COLUMN description TEXT")
            
#     #         if 'is_active' not in column_names:
#     #             logger.info("Adding is_active column")
#     #             cursor.execute("ALTER TABLE rooms ADD COLUMN is_active BOOLEAN DEFAULT 1")
            
#     #         if 'version' not in column_names:
#     #             logger.info("Adding version column")
#     #             cursor.execute("ALTER TABLE rooms ADD COLUMN version INTEGER DEFAULT 1")
            
#     #         if 'synced_at' not in column_names:
#     #             logger.info("Adding synced_at column")
#     #             cursor.execute("ALTER TABLE rooms ADD COLUMN synced_at TIMESTAMP")
            
#     #         if 'updated_by_sync' not in column_names:
#     #             logger.info("Adding updated_by_sync column")
#     #             cursor.execute("ALTER TABLE rooms ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0")
            
#     #         if 'sync_error' not in column_names:
#     #             logger.info("Adding sync_error column")
#     #             cursor.execute("ALTER TABLE rooms ADD COLUMN sync_error TEXT")
            
#     #         if 'created_by' not in column_names:
#     #             logger.info("Adding created_by column")
#     #             cursor.execute("ALTER TABLE rooms ADD COLUMN created_by INTEGER")
            
#     #         if 'updated_by' not in column_names:
#     #             logger.info("Adding updated_by column")
#     #             cursor.execute("ALTER TABLE rooms ADD COLUMN updated_by INTEGER")
            
#     #         conn.commit()
#     #         logger.info("Table structure updated successfully")
        
#     #     # Create indexes
#     #     cursor.execute("CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type)")
#     #     cursor.execute("CREATE INDEX IF NOT EXISTS idx_rooms_building ON rooms(building)")
#     #     cursor.execute("CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active)")
        
#     #     conn.close()
#     # except Exception as e:
#     #     logger.error(f"Error creating/updating rooms table: {str(e)}")
#     #     logger.error(traceback.format_exc())
#     #     raise

# Initialize table on module load
try:
    # create_rooms_table()
    pass
except Exception as e:
    logger.error(f"Failed to initialize rooms table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_rooms(
    room_type: Optional[str] = None,
    building: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """Get all rooms with optional filters"""
    logger.info(f"GET /api/rooms/ - Fetching rooms (type={room_type}, building={building})")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM rooms WHERE 1=1"
        params = []
        
        if room_type:
            query += " AND type = ?"
            params.append(room_type)
        
        if building:
            query += " AND building = ?"
            params.append(building)
        
        if is_active is not None:
            query += " AND is_active = ?"
            params.append(1 if is_active else 0)
        
        query += " ORDER BY building ASC, floor ASC, room_name ASC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        rooms = []
        
        for row in results:
            rooms.append({
                "id": row['id'],
                "room_name": row['room_name'],
                "capacity": row['capacity'],
                "type": row['type'],
                "building": row['building'],
                "floor": row['floor'],
                "description": row['description'] if 'description' in row.keys() else None,
                "is_active": bool(row['is_active']) if 'is_active' in row.keys() else True,
                "version": row['version'] if 'version' in row.keys() else 1,
                "created_at": row['created_at'],
                "updated_at": row['updated_at'] if 'updated_at' in row.keys() else row['created_at']
            })
        
        logger.info(f"Retrieved {len(rooms)} rooms")
        
        return {
            "success": True,
            "data": rooms,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_rooms: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

@router.get("/types")
async def get_room_types():
    """Get all available room types"""
    logger.info("GET /api/rooms/types - Fetching room types")
    
    return {
        "success": True,
        "data": ["Classroom", "Lab", "Hall", "Office"],
        "timestamp": datetime.now().isoformat()
    }

@router.get("/{room_id}")
async def get_room(room_id: int):
    """Get a specific room by ID"""
    logger.info(f"GET /api/rooms/{room_id} - Fetching room")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM rooms WHERE id = ?", (room_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Room not found")
        
        room = {
            "id": result['id'],
            "room_name": result['room_name'],
            "capacity": result['capacity'],
            "type": result['type'],
            "building": result['building'],
            "floor": result['floor'],
            "description": result['description'] if 'description' in result.keys() else None,
            "is_active": bool(result['is_active']) if 'is_active' in result.keys() else True,
            "version": result['version'] if 'version' in result.keys() else 1,
            "created_at": result['created_at'],
            "updated_at": result['updated_at'] if 'updated_at' in result.keys() else result['created_at']
        }
        
        return {
            "success": True,
            "data": room,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_room: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_room(room_data: RoomCreate):
    """Create a new room"""
    logger.info(f"POST /api/rooms/ - Creating new room: {room_data.room_name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ensure unique room name
        ensure_unique_room_name(cursor, room_data.room_name)
        
        # Insert new room
        cursor.execute("""
            INSERT INTO rooms (room_name, capacity, type, building, floor, description, is_active, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            room_data.room_name, room_data.capacity, room_data.type,
            room_data.building, room_data.floor, room_data.description,
            room_data.is_active, room_data.created_by,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Room created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Room created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_room: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{room_id}")
async def update_room(room_id: int, room_data: RoomUpdate):
    """Update a room"""
    logger.info(f"PUT /api/rooms/{room_id} - Updating room")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if room exists
        cursor.execute("SELECT * FROM rooms WHERE id = ?", (room_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Check name uniqueness if being updated
        if room_data.room_name is not None:
            ensure_unique_room_name(cursor, room_data.room_name, room_id)
            updates.append("room_name = ?")
            params.append(room_data.room_name)
        
        if room_data.capacity is not None:
            updates.append("capacity = ?")
            params.append(room_data.capacity)
        
        if room_data.type is not None:
            updates.append("type = ?")
            params.append(room_data.type)
        
        if room_data.building is not None:
            updates.append("building = ?")
            params.append(room_data.building)
        
        if room_data.floor is not None:
            updates.append("floor = ?")
            params.append(room_data.floor)
        
        if room_data.description is not None:
            updates.append("description = ?")
            params.append(room_data.description)
        
        if room_data.is_active is not None:
            updates.append("is_active = ?")
            params.append(1 if room_data.is_active else 0)
        
        if room_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(room_data.updated_by)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(room_id)
            query = f"UPDATE rooms SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Room {room_id} updated successfully")
        
        return {
            "success": True,
            "message": "Room updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_room: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{room_id}")
async def delete_room(room_id: int):
    """Delete a room"""
    logger.info(f"DELETE /api/rooms/{room_id} - Deleting room")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if room exists and get details
        cursor.execute("SELECT room_name FROM rooms WHERE id = ?", (room_id,))
        room = cursor.fetchone()
        
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # TODO: Check if room is being used in any schedules
        # This would need to be implemented when schedule tables are created
        
        # Delete the room
        cursor.execute("DELETE FROM rooms WHERE id = ?", (room_id,))
        conn.commit()
        
        logger.info(f"Room {room_id} ({room['room_name']}) deleted successfully")
        
        return {
            "success": True,
            "message": f"Room '{room['room_name']}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_room: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_room_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync room from external database"""
    try:
        logger.info("Syncing room from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO rooms (
                id, room_name, capacity, type, building, floor, description,
                is_active, version, synced_at, updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('room_name'),
            source_data.get('capacity', 30),
            source_data.get('type'),
            source_data.get('building'),
            source_data.get('floor'),
            source_data.get('description'),
            source_data.get('is_active', 1),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Room synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing room: {str(e)}")
        logger.error(traceback.format_exc())
        return False