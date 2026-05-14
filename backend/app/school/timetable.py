# app/school/timetable.py

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

router = APIRouter(prefix="/api/timetable", tags=["timetable"])

# ==================== Pydantic Models ====================

class TimetableEntryBase(BaseModel):
    class_id: int
    subject_id: int
    staff_id: int
    day_id: int
    time_slot_id: int
    academic_year_id: int
    room: Optional[str] = Field(None, max_length=100)
    is_active: bool = True

class TimetableEntryCreate(TimetableEntryBase):
    created_by: Optional[int] = None

class TimetableEntryUpdate(BaseModel):
    subject_id: Optional[int] = None
    staff_id: Optional[int] = None
    room: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    updated_by: Optional[int] = None

class TimetableEntryResponse(BaseModel):
    id: int
    class_id: int
    class_name: str
    subject_id: int
    subject_name: str
    subject_code: str
    staff_id: int
    staff_name: str
    day_id: int
    day_name: str
    time_slot_id: int
    time_slot_name: str
    start_time: str
    end_time: str
    academic_year_id: int
    academic_year_label: str
    room: Optional[str]
    is_active: bool
    version: int
    created_at: datetime
    updated_at: datetime

class TimetableBulkCreate(BaseModel):
    entries: List[TimetableEntryCreate]

class TimetableCopyRequest(BaseModel):
    source_class_id: int
    source_academic_year_id: int
    source_term_id: Optional[int] = None
    target_class_id: int
    target_academic_year_id: int
    target_term_id: Optional[int] = None

class ValidationResult(BaseModel):
    has_conflicts: bool
    conflicts: List[str]

# ==================== Helper Functions ====================

def get_class_name(cursor, class_id: int) -> str:
    cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
    result = cursor.fetchone()
    return result['class_name'] if result else "Unknown"

def get_subject_name(cursor, subject_id: int) -> str:
    cursor.execute("SELECT name, code FROM subjects WHERE id = ?", (subject_id,))
    result = cursor.fetchone()
    return result['name'] if result else "Unknown", result['code'] if result else ""

def get_staff_name(cursor, staff_id: int) -> str:
    cursor.execute("SELECT first_name, surname FROM staff WHERE id = ?", (staff_id,))
    result = cursor.fetchone()
    return f"{result['first_name']} {result['surname']}" if result else "Unknown"

def get_day_name(cursor, day_id: int) -> str:
    cursor.execute("SELECT name FROM week_days WHERE id = ?", (day_id,))
    result = cursor.fetchone()
    return result['name'] if result else "Unknown"

def get_time_slot_details(cursor, time_slot_id: int) -> tuple:
    cursor.execute("SELECT name, start_time, end_time FROM time_slots WHERE id = ?", (time_slot_id,))
    result = cursor.fetchone()
    return result['name'], result['start_time'], result['end_time'] if result else ("Unknown", "", "")

def get_academic_year_label(cursor, academic_year_id: int) -> str:
    cursor.execute("SELECT year_label FROM academic_years WHERE id = ?", (academic_year_id,))
    result = cursor.fetchone()
    return result['year_label'] if result else "Unknown"

def validate_conflicts(cursor, entry: TimetableEntryBase, exclude_id: Optional[int] = None) -> List[str]:
    """Validate teacher, room, and class conflicts"""
    conflicts = []
    
    # Check teacher conflict (same teacher at same day and time slot)
    query = """
        SELECT t.id, c.class_name FROM timetables t
        JOIN classes c ON t.class_id = c.id
        WHERE t.staff_id = ? AND t.day_id = ? AND t.time_slot_id = ? AND t.academic_year_id = ?
    """
    params = [entry.staff_id, entry.day_id, entry.time_slot_id, entry.academic_year_id]
    if exclude_id:
        query += " AND t.id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    conflict = cursor.fetchone()
    if conflict:
        conflicts.append(f"Teacher is already assigned to class '{conflict['class_name']}' at this time")
    
    # Check room conflict
    if entry.room:
        query = """
            SELECT t.id, c.class_name FROM timetables t
            JOIN classes c ON t.class_id = c.id
            WHERE t.room = ? AND t.day_id = ? AND t.time_slot_id = ? AND t.academic_year_id = ?
        """
        params = [entry.room, entry.day_id, entry.time_slot_id, entry.academic_year_id]
        if exclude_id:
            query += " AND t.id != ?"
            params.append(exclude_id)
        
        cursor.execute(query, params)
        conflict = cursor.fetchone()
        if conflict:
            conflicts.append(f"Room '{entry.room}' is already used by class '{conflict['class_name']}' at this time")
    
    # Check class conflict (class already has a subject at this time)
    query = """
        SELECT id FROM timetables
        WHERE class_id = ? AND day_id = ? AND time_slot_id = ? AND academic_year_id = ?
    """
    params = [entry.class_id, entry.day_id, entry.time_slot_id, entry.academic_year_id]
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        conflicts.append(f"Class already has a subject scheduled at this time")
    
    return conflicts

# ==================== Database Setup ====================

def create_timetable_tables():
    """Create timetable table if it doesn't exist"""
    try:
        logger.info("Creating/checking timetables table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='timetables'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE timetables (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    class_id INTEGER NOT NULL,
                    subject_id INTEGER NOT NULL,
                    staff_id INTEGER NOT NULL,
                    day_id INTEGER NOT NULL,
                    time_slot_id INTEGER NOT NULL,
                    academic_year_id INTEGER NOT NULL,
                    room TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync BOOLEAN DEFAULT 0,
                    sync_error TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
                    FOREIGN KEY (day_id) REFERENCES week_days(id) ON DELETE RESTRICT,
                    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE RESTRICT,
                    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (updated_by) REFERENCES users(id),
                    UNIQUE(class_id, day_id, time_slot_id, academic_year_id),
                    UNIQUE(staff_id, day_id, time_slot_id, academic_year_id),
                    UNIQUE(room, day_id, time_slot_id, academic_year_id)
                )
            """)
            logger.info("New timetables table created")
        else:
            logger.info("Table 'timetables' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(timetables)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE timetables ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE timetables ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0")
            
            if 'sync_error' not in column_names:
                logger.info("Adding sync_error column")
                cursor.execute("ALTER TABLE timetables ADD COLUMN sync_error TEXT")
            
            if 'created_by' not in column_names:
                logger.info("Adding created_by column")
                cursor.execute("ALTER TABLE timetables ADD COLUMN created_by INTEGER")
            
            if 'updated_by' not in column_names:
                logger.info("Adding updated_by column")
                cursor.execute("ALTER TABLE timetables ADD COLUMN updated_by INTEGER")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating timetables table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_timetable_tables()
except Exception as e:
    logger.error(f"Failed to initialize timetables table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/entries")
async def get_timetable_entries(
    class_id: Optional[int] = None,
    academic_year_id: Optional[int] = None,
    day_id: Optional[int] = None
):
    """Get timetable entries with optional filters"""
    logger.info(f"GET /api/timetable/entries - Fetching entries")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT t.* 
            FROM timetables t
            WHERE 1=1
        """
        params = []
        
        if class_id:
            query += " AND t.class_id = ?"
            params.append(class_id)
        
        if academic_year_id:
            query += " AND t.academic_year_id = ?"
            params.append(academic_year_id)
        
        if day_id:
            query += " AND t.day_id = ?"
            params.append(day_id)
        
        query += " ORDER BY t.day_id, t.time_slot_id"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        entries = []
        for row in results:
            subject_name, subject_code = get_subject_name(cursor, row['subject_id'])
            
            entries.append({
                "id": row['id'],
                "class_id": row['class_id'],
                "class_name": get_class_name(cursor, row['class_id']),
                "subject_id": row['subject_id'],
                "subject_name": subject_name,
                "subject_code": subject_code,
                "staff_id": row['staff_id'],
                "staff_name": get_staff_name(cursor, row['staff_id']),
                "day_id": row['day_id'],
                "day_name": get_day_name(cursor, row['day_id']),
                "time_slot_id": row['time_slot_id'],
                "time_slot_name": get_time_slot_details(cursor, row['time_slot_id'])[0],
                "start_time": get_time_slot_details(cursor, row['time_slot_id'])[1],
                "end_time": get_time_slot_details(cursor, row['time_slot_id'])[2],
                "academic_year_id": row['academic_year_id'],
                "academic_year_label": get_academic_year_label(cursor, row['academic_year_id']),
                "room": row['room'],
                "is_active": bool(row['is_active']),
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        return {
            "success": True,
            "data": entries,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_timetable_entries: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/by-class/{class_id}")
async def get_timetable_by_class(class_id: int, academic_year_id: int):
    """Get timetable for a specific class and academic year"""
    logger.info(f"GET /api/timetable/by-class/{class_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT t.* FROM timetables t
            WHERE t.class_id = ? AND t.academic_year_id = ?
            ORDER BY t.day_id, t.time_slot_id
        """, (class_id, academic_year_id))
        
        results = cursor.fetchall()
        
        # Get days and time slots for matrix structure
        cursor.execute("SELECT id, name, order_index FROM week_days WHERE is_active = 1 ORDER BY order_index")
        days = cursor.fetchall()
        
        cursor.execute("SELECT id, name, start_time, end_time, order_index FROM time_slots ORDER BY order_index")
        time_slots = cursor.fetchall()
        
        # Build timetable matrix
        timetable_matrix = {}
        for day in days:
            timetable_matrix[day['name']] = {}
            for slot in time_slots:
                timetable_matrix[day['name']][slot['name']] = None
        
        for row in results:
            day_name = get_day_name(cursor, row['day_id'])
            slot_name = get_time_slot_details(cursor, row['time_slot_id'])[0]
            subject_name, _ = get_subject_name(cursor, row['subject_id'])
            staff_name = get_staff_name(cursor, row['staff_id'])
            
            timetable_matrix[day_name][slot_name] = {
                "subject": subject_name,
                "teacher": staff_name,
                "room": row['room'] or "Unassigned",
                "entry_id": row['id']
            }
        
        return {
            "success": True,
            "data": {
                "class_id": class_id,
                "class_name": get_class_name(cursor, class_id),
                "academic_year_id": academic_year_id,
                "academic_year_label": get_academic_year_label(cursor, academic_year_id),
                "days": [{"id": d['id'], "name": d['name']} for d in days],
                "time_slots": [{"id": s['id'], "name": s['name'], "start_time": s['start_time'], "end_time": s['end_time']} for s in time_slots],
                "timetable": timetable_matrix
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_timetable_by_class: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/entries")
async def create_timetable_entry(entry: TimetableEntryCreate):
    """Create a new timetable entry"""
    logger.info(f"POST /api/timetable/entries - Creating new entry")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate conflicts
        conflicts = validate_conflicts(cursor, entry)
        if conflicts:
            return {
                "success": False,
                "message": "Validation failed",
                "conflicts": conflicts,
                "timestamp": datetime.now().isoformat()
            }
        
        # Insert entry
        cursor.execute("""
            INSERT INTO timetables (
                class_id, subject_id, staff_id, day_id, time_slot_id,
                academic_year_id, room, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry.class_id, entry.subject_id, entry.staff_id, entry.day_id,
            entry.time_slot_id, entry.academic_year_id, entry.room,
            entry.created_by, datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        return {
            "success": True,
            "message": "Timetable entry created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in create_timetable_entry: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/entries/bulk")
async def bulk_create_entries(bulk_data: TimetableBulkCreate):
    """Create multiple timetable entries at once"""
    logger.info(f"POST /api/timetable/entries/bulk - Creating {len(bulk_data.entries)} entries")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        created_count = 0
        errors = []
        
        for entry in bulk_data.entries:
            try:
                conflicts = validate_conflicts(cursor, entry)
                if conflicts:
                    errors.append({
                        "entry": entry.dict(),
                        "conflicts": conflicts
                    })
                    continue
                
                cursor.execute("""
                    INSERT INTO timetables (
                        class_id, subject_id, staff_id, day_id, time_slot_id,
                        academic_year_id, room, created_by, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    entry.class_id, entry.subject_id, entry.staff_id, entry.day_id,
                    entry.time_slot_id, entry.academic_year_id, entry.room,
                    entry.created_by, datetime.now().isoformat(), datetime.now().isoformat()
                ))
                created_count += 1
            except Exception as e:
                errors.append({
                    "entry": entry.dict(),
                    "error": str(e)
                })
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Created {created_count} timetable entries",
            "data": {
                "created_count": created_count,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in bulk_create_entries: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/entries/{entry_id}")
async def update_timetable_entry(entry_id: int, entry: TimetableEntryUpdate):
    """Update a timetable entry"""
    logger.info(f"PUT /api/timetable/entries/{entry_id} - Updating entry")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if entry exists
        cursor.execute("SELECT * FROM timetables WHERE id = ?", (entry_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Timetable entry not found")
        
        # Build update query
        updates = []
        params = []
        
        if entry.subject_id is not None:
            updates.append("subject_id = ?")
            params.append(entry.subject_id)
        
        if entry.staff_id is not None:
            updates.append("staff_id = ?")
            params.append(entry.staff_id)
        
        if entry.room is not None:
            updates.append("room = ?")
            params.append(entry.room)
        
        if entry.is_active is not None:
            updates.append("is_active = ?")
            params.append(1 if entry.is_active else 0)
        
        if entry.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(entry.updated_by)
        
        # Add version increment and timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        if updates:
            params.append(entry_id)
            query = f"UPDATE timetables SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        return {
            "success": True,
            "message": "Timetable entry updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_timetable_entry: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/entries/{entry_id}")
async def delete_timetable_entry(entry_id: int):
    """Delete a timetable entry"""
    logger.info(f"DELETE /api/timetable/entries/{entry_id} - Deleting entry")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM timetables WHERE id = ?", (entry_id,))
        conn.commit()
        
        return {
            "success": True,
            "message": "Timetable entry deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in delete_timetable_entry: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/validate")
async def validate_timetable(class_id: int, academic_year_id: int):
    """Validate the entire timetable for a class and academic year"""
    logger.info(f"POST /api/timetable/validate - Validating timetable")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM timetables
            WHERE class_id = ? AND academic_year_id = ?
        """, (class_id, academic_year_id))
        
        entries = cursor.fetchall()
        conflicts = []
        
        # Check teacher conflicts
        teacher_schedule = {}
        # Check room conflicts
        room_schedule = {}
        
        for entry in entries:
            day_name = get_day_name(cursor, entry['day_id'])
            slot_name = get_time_slot_details(cursor, entry['time_slot_id'])[0]
            
            teacher_key = f"{entry['staff_id']}-{entry['day_id']}-{entry['time_slot_id']}"
            if teacher_key in teacher_schedule:
                conflicts.append(f"Teacher {get_staff_name(cursor, entry['staff_id'])} double-booked on {day_name} {slot_name}")
            teacher_schedule[teacher_key] = True
            
            if entry['room']:
                room_key = f"{entry['room']}-{entry['day_id']}-{entry['time_slot_id']}"
                if room_key in room_schedule:
                    conflicts.append(f"Room {entry['room']} double-booked on {day_name} {slot_name}")
                room_schedule[room_key] = True
        
        return {
            "success": True,
            "data": {
                "has_conflicts": len(conflicts) > 0,
                "conflicts": conflicts
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in validate_timetable: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/copy")
async def copy_timetable(copy_request: TimetableCopyRequest):
    """Copy timetable from source to target"""
    logger.info(f"POST /api/timetable/copy - Copying timetable")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get source entries
        cursor.execute("""
            SELECT * FROM timetables
            WHERE class_id = ? AND academic_year_id = ?
        """, (copy_request.source_class_id, copy_request.source_academic_year_id))
        
        source_entries = cursor.fetchall()
        copied_count = 0
        
        for source in source_entries:
            # Check for conflicts in target
            temp_entry = TimetableEntryBase(
                class_id=copy_request.target_class_id,
                subject_id=source['subject_id'],
                staff_id=source['staff_id'],
                day_id=source['day_id'],
                time_slot_id=source['time_slot_id'],
                academic_year_id=copy_request.target_academic_year_id,
                room=source['room']
            )
            
            conflicts = validate_conflicts(cursor, temp_entry)
            if not conflicts:
                cursor.execute("""
                    INSERT INTO timetables (
                        class_id, subject_id, staff_id, day_id, time_slot_id,
                        academic_year_id, room, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    copy_request.target_class_id, source['subject_id'], source['staff_id'],
                    source['day_id'], source['time_slot_id'], copy_request.target_academic_year_id,
                    source['room'], datetime.now().isoformat(), datetime.now().isoformat()
                ))
                copied_count += 1
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Copied {copied_count} timetable entries",
            "data": {"copied_count": copied_count},
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in copy_timetable: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_timetable_entry_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync timetable entry from external database"""
    try:
        logger.info("Syncing timetable entry from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO timetables (
                id, class_id, subject_id, staff_id, day_id, time_slot_id,
                academic_year_id, room, is_active, version, synced_at,
                updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('class_id'),
            source_data.get('subject_id'),
            source_data.get('staff_id'),
            source_data.get('day_id'),
            source_data.get('time_slot_id'),
            source_data.get('academic_year_id'),
            source_data.get('room'),
            source_data.get('is_active', 1),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Timetable entry synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing timetable entry: {str(e)}")
        logger.error(traceback.format_exc())
        return False