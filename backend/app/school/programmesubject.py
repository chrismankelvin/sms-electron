# app/school/programme_subjects.py

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

router = APIRouter(prefix="/api/programme-subjects", tags=["programme-subjects"])

# ==================== Pydantic Models ====================

class ProgrammeSubjectBase(BaseModel):
    programme_id: int
    subject_id: int
    is_required: bool = True

class ProgrammeSubjectCreate(ProgrammeSubjectBase):
    pass

class ProgrammeSubjectResponse(BaseModel):
    id: int
    programme_id: int
    subject_id: int
    is_required: bool
    version: int
    created_at: datetime

class ProgrammeSubjectsBulkUpdate(BaseModel):
    programme_id: int
    subjects: List[Dict[str, Any]]  # List of {subject_id, is_required}

class ProgrammeSubjectsAssignment(BaseModel):
    programme_id: int
    assigned_subject_ids: List[int]
    required_subject_ids: List[int]

# ==================== Helper Functions ====================

def validate_programme_exists(cursor, programme_id: int) -> bool:
    """Validate that the programme exists"""
    cursor.execute("SELECT id FROM programmes WHERE id = ?", (programme_id,))
    return cursor.fetchone() is not None

def validate_subject_exists(cursor, subject_id: int) -> bool:
    """Validate that the subject exists"""
    cursor.execute("SELECT id, type FROM subjects WHERE id = ?", (subject_id,))
    return cursor.fetchone() is not None

def get_programme_subjects(cursor, programme_id: int) -> List[Dict[str, Any]]:
    """Get all subjects assigned to a programme with their required status"""
    cursor.execute("""
        SELECT ps.subject_id, ps.is_required, s.name, s.code, s.type
        FROM programme_subjects ps
        JOIN subjects s ON ps.subject_id = s.id
        WHERE ps.programme_id = ?
        ORDER BY s.name
    """, (programme_id,))
    results = cursor.fetchall()
    return [
        {
            "subject_id": row['subject_id'],
            "name": row['name'],
            "code": row['code'],
            "type": row['type'],
            "is_required": bool(row['is_required'])
        }
        for row in results
    ]

def get_available_subjects(cursor, programme_id: int) -> List[Dict[str, Any]]:
    """Get all elective subjects not assigned to a programme"""
    cursor.execute("""
        SELECT s.id, s.name, s.code, s.type
        FROM subjects s
        WHERE s.type = 'elective' 
        AND s.id NOT IN (
            SELECT subject_id FROM programme_subjects WHERE programme_id = ?
        )
        ORDER BY s.name
    """, (programme_id,))
    results = cursor.fetchall()
    return [
        {
            "id": row['id'],
            "name": row['name'],
            "code": row['code'],
            "type": row['type']
        }
        for row in results
    ]

# ==================== Database Setup ====================

def create_programme_subjects_table():
    """Create programme_subjects table if it doesn't exist"""
    try:
        logger.info("Creating/checking programme_subjects table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='programme_subjects'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE programme_subjects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    programme_id INTEGER NOT NULL,
                    subject_id INTEGER NOT NULL,
                    is_required BOOLEAN DEFAULT 1,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync NUMERIC DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                    UNIQUE(programme_id, subject_id)
                )
            """)
            logger.info("New programme_subjects table created")
            
            # Insert default assignments for programmes
            logger.info("Inserting default programme subject assignments")
            
            # Get all programmes
            cursor.execute("SELECT id, name FROM programmes WHERE category = 'SHS'")
            programmes = cursor.fetchall()
            
            # Get all elective subjects
            cursor.execute("SELECT id, name FROM subjects WHERE type = 'elective'")
            subjects = cursor.fetchall()
            
            # Map subject names to IDs
            subject_map = {s['name']: s['id'] for s in subjects}
            
            # Default assignments for each programme
            default_assignments = {
                'General Science': {
                    'required': ['Biology', 'Chemistry', 'Physics'],
                    'elective': ['Mathematics (Elective)']
                },
                'General Arts': {
                    'required': ['Literature', 'History', 'Geography'],
                    'elective': ['Economics', 'Mathematics (Elective)']
                },
                'Business': {
                    'required': ['Accounting', 'Business Management', 'Economics'],
                    'elective': ['Mathematics (Elective)']
                },
                'Visual Arts': {
                    'required': ['Visual Arts'],
                    'elective': ['History', 'Literature']
                },
                'Home Economics': {
                    'required': ['Home Economics'],
                    'elective': ['Biology', 'Chemistry']
                }
            }
            
            for programme in programmes:
                programme_name = programme['name']
                if programme_name in default_assignments:
                    assignments = default_assignments[programme_name]
                    
                    # Insert required subjects
                    for subject_name in assignments.get('required', []):
                        if subject_name in subject_map:
                            cursor.execute("""
                                INSERT INTO programme_subjects (programme_id, subject_id, is_required, created_at)
                                VALUES (?, ?, 1, ?)
                            """, (programme['id'], subject_map[subject_name], datetime.now().isoformat()))
                    
                    # Insert elective subjects
                    for subject_name in assignments.get('elective', []):
                        if subject_name in subject_map:
                            cursor.execute("""
                                INSERT INTO programme_subjects (programme_id, subject_id, is_required, created_at)
                                VALUES (?, ?, 0, ?)
                            """, (programme['id'], subject_map[subject_name], datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default programme subject assignments inserted successfully")
        else:
            logger.info("Table 'programme_subjects' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(programme_subjects)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE programme_subjects ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE programme_subjects ADD COLUMN updated_by_sync NUMERIC DEFAULT 0")
            
            if 'version' not in column_names:
                logger.info("Adding version column")
                cursor.execute("ALTER TABLE programme_subjects ADD COLUMN version INTEGER DEFAULT 1")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating programme_subjects table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_programme_subjects_table()
except Exception as e:
    logger.error(f"Failed to initialize programme_subjects table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_all_programme_subjects():
    """Get all programme subject assignments"""
    logger.info("GET /api/programme-subjects/ - Fetching all assignments")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all SHS programmes
        cursor.execute("SELECT id, name FROM programmes WHERE category = 'SHS' ORDER BY name")
        programmes = cursor.fetchall()
        
        result = []
        for programme in programmes:
            assigned_subjects = get_programme_subjects(cursor, programme['id'])
            available_subjects = get_available_subjects(cursor, programme['id'])
            
            result.append({
                "programme_id": programme['id'],
                "programme_name": programme['name'],
                "assigned_subjects": assigned_subjects,
                "available_subjects": available_subjects
            })
        
        logger.info(f"Retrieved assignments for {len(result)} programmes")
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_all_programme_subjects: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

@router.get("/programmes")
async def get_programmes():
    """Get all SHS programmes for the dropdown"""
    logger.info("GET /api/programme-subjects/programmes - Fetching programmes")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, name FROM programmes WHERE category = 'SHS' ORDER BY name")
        programmes = cursor.fetchall()
        
        result = [{"id": p['id'], "name": p['name']} for p in programmes]
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_programmes: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/available-subjects")
async def get_available_elective_subjects():
    """Get all elective subjects that can be assigned to programmes"""
    logger.info("GET /api/programme-subjects/available-subjects - Fetching available subjects")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, code FROM subjects 
            WHERE type = 'elective' 
            ORDER BY name
        """)
        subjects = cursor.fetchall()
        
        result = [
            {
                "id": s['id'],
                "name": s['name'],
                "code": s['code']
            }
            for s in subjects
        ]
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_available_elective_subjects: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{programme_id}")
async def get_programme_subjects_by_programme(programme_id: int):
    """Get subjects for a specific programme"""
    logger.info(f"GET /api/programme-subjects/{programme_id} - Fetching programme subjects")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate programme exists
        if not validate_programme_exists(cursor, programme_id):
            raise HTTPException(status_code=404, detail="Programme not found")
        
        # Get programme name
        cursor.execute("SELECT name FROM programmes WHERE id = ?", (programme_id,))
        programme = cursor.fetchone()
        
        assigned_subjects = get_programme_subjects(cursor, programme_id)
        available_subjects = get_available_subjects(cursor, programme_id)
        
        return {
            "success": True,
            "data": {
                "programme_id": programme_id,
                "programme_name": programme['name'],
                "assigned_subjects": assigned_subjects,
                "available_subjects": available_subjects
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_programme_subjects_by_programme: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/bulk")
async def bulk_update_programme_subjects(bulk_data: ProgrammeSubjectsBulkUpdate):
    """Bulk update subjects for a specific programme"""
    logger.info(f"POST /api/programme-subjects/bulk - Bulk updating for programme {bulk_data.programme_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate programme exists
        if not validate_programme_exists(cursor, bulk_data.programme_id):
            raise HTTPException(status_code=404, detail="Programme not found")
        
        # Remove existing assignments for this programme
        cursor.execute("DELETE FROM programme_subjects WHERE programme_id = ?", (bulk_data.programme_id,))
        
        # Insert new assignments
        for subject in bulk_data.subjects:
            subject_id = subject.get('subject_id')
            is_required = subject.get('is_required', False)
            
            # Validate subject exists
            subject_result = validate_subject_exists(cursor, subject_id)
            if not subject_result:
                raise HTTPException(status_code=404, detail=f"Subject with ID {subject_id} not found")
            
            cursor.execute("""
                INSERT INTO programme_subjects (programme_id, subject_id, is_required, created_at)
                VALUES (?, ?, ?, ?)
            """, (bulk_data.programme_id, subject_id, 1 if is_required else 0, datetime.now().isoformat()))
        
        conn.commit()
        
        logger.info(f"Bulk update completed for programme {bulk_data.programme_id}: {len(bulk_data.subjects)} subjects assigned")
        
        return {
            "success": True,
            "message": "Programme subjects updated successfully",
            "data": {
                "programme_id": bulk_data.programme_id,
                "assigned_count": len(bulk_data.subjects)
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk_update_programme_subjects: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/assign")
async def assign_programme_subject(assignment: ProgrammeSubjectCreate):
    """Assign a single subject to a programme"""
    logger.info(f"POST /api/programme-subjects/assign - Assigning subject {assignment.subject_id} to programme {assignment.programme_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate programme exists
        if not validate_programme_exists(cursor, assignment.programme_id):
            raise HTTPException(status_code=404, detail="Programme not found")
        
        # Validate subject exists and is elective
        subject = validate_subject_exists(cursor, assignment.subject_id)
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Check if already assigned
        cursor.execute("""
            SELECT id FROM programme_subjects 
            WHERE programme_id = ? AND subject_id = ?
        """, (assignment.programme_id, assignment.subject_id))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Subject already assigned to this programme")
        
        # Create assignment
        cursor.execute("""
            INSERT INTO programme_subjects (programme_id, subject_id, is_required, created_at)
            VALUES (?, ?, ?, ?)
        """, (assignment.programme_id, assignment.subject_id, assignment.is_required, datetime.now().isoformat()))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Subject assigned successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Subject assigned successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in assign_programme_subject: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{programme_id}/{subject_id}")
async def remove_programme_subject(programme_id: int, subject_id: int):
    """Remove a subject assignment from a programme"""
    logger.info(f"DELETE /api/programme-subjects/{programme_id}/{subject_id} - Removing assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if assignment exists
        cursor.execute("""
            SELECT id FROM programme_subjects 
            WHERE programme_id = ? AND subject_id = ?
        """, (programme_id, subject_id))
        
        assignment = cursor.fetchone()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Delete assignment
        cursor.execute("""
            DELETE FROM programme_subjects 
            WHERE programme_id = ? AND subject_id = ?
        """, (programme_id, subject_id))
        
        conn.commit()
        
        logger.info(f"Subject assignment removed for programme {programme_id}, subject {subject_id}")
        
        return {
            "success": True,
            "message": "Subject removed successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in remove_programme_subject: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{programme_id}/{subject_id}/toggle-required")
async def toggle_required(programme_id: int, subject_id: int):
    """Toggle the required status of a subject for a programme"""
    logger.info(f"PUT /api/programme-subjects/{programme_id}/{subject_id}/toggle-required - Toggling required status")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if assignment exists
        cursor.execute("""
            SELECT is_required FROM programme_subjects 
            WHERE programme_id = ? AND subject_id = ?
        """, (programme_id, subject_id))
        
        assignment = cursor.fetchone()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Toggle required status
        new_status = not assignment['is_required']
        cursor.execute("""
            UPDATE programme_subjects 
            SET is_required = ?, version = version + 1
            WHERE programme_id = ? AND subject_id = ?
        """, (1 if new_status else 0, programme_id, subject_id))
        
        conn.commit()
        
        logger.info(f"Required status toggled for programme {programme_id}, subject {subject_id}: {new_status}")
        
        return {
            "success": True,
            "message": "Required status updated",
            "data": {"is_required": new_status},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in toggle_required: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_programme_subject_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync programme subject assignment from external database"""
    try:
        logger.info("Syncing programme subject from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO programme_subjects (
                id, programme_id, subject_id, is_required, version, synced_at, updated_by_sync
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('programme_id'),
            source_data.get('subject_id'),
            source_data.get('is_required', 1),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1
        ))
        
        conn.commit()
        conn.close()
        logger.info("Programme subject synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing programme subject: {str(e)}")
        logger.error(traceback.format_exc())
        return False