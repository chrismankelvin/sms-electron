# app/school/level_core_subjects.py

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

router = APIRouter(prefix="/api/level-core-subjects", tags=["level-core-subjects"])

# ==================== Pydantic Models ====================

class LevelCoreSubjectBase(BaseModel):
    level_id: int
    subject_id: int

class LevelCoreSubjectCreate(LevelCoreSubjectBase):
    pass

class LevelCoreSubjectResponse(BaseModel):
    id: int
    level_id: int
    subject_id: int
    version: int
    created_at: datetime

class LevelCoreSubjectsBulkUpdate(BaseModel):
    level_id: int
    subject_ids: List[int]

# ==================== Helper Functions ====================

def validate_level_exists(cursor, level_id: int) -> bool:
    """Validate that the level exists"""
    cursor.execute("SELECT id FROM levels WHERE id = ?", (level_id,))
    return cursor.fetchone() is not None

def validate_subject_exists(cursor, subject_id: int) -> bool:
    """Validate that the subject exists"""
    cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
    return cursor.fetchone() is not None

def get_level_core_subjects(cursor, level_id: int) -> List[int]:
    """Get all core subject IDs for a specific level"""
    cursor.execute("""
        SELECT subject_id FROM level_core_subjects 
        WHERE level_id = ?
    """, (level_id,))
    results = cursor.fetchall()
    return [row['subject_id'] for row in results]

def get_all_levels_with_subjects(cursor) -> Dict[int, List[int]]:
    """Get all levels with their core subjects"""
    cursor.execute("""
        SELECT level_id, subject_id FROM level_core_subjects 
        ORDER BY level_id, subject_id
    """)
    results = cursor.fetchall()
    
    assignments = {}
    for row in results:
        if row['level_id'] not in assignments:
            assignments[row['level_id']] = []
        assignments[row['level_id']].append(row['subject_id'])
    
    return assignments

# ==================== Database Setup ====================

def create_level_core_subjects_table():
    """Create level_core_subjects table if it doesn't exist"""
    try:
        logger.info("Creating/checking level_core_subjects table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='level_core_subjects'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE level_core_subjects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level_id INTEGER NOT NULL,
                    subject_id INTEGER NOT NULL,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync NUMERIC DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                    UNIQUE(level_id, subject_id)
                )
            """)
            logger.info("New level_core_subjects table created")
            
            # Insert default assignments
            logger.info("Inserting default level core subject assignments")
            
            # Get all levels and subjects
            cursor.execute("SELECT id, name FROM levels")
            levels = cursor.fetchall()
            
            cursor.execute("SELECT id, name, type FROM subjects")
            subjects = cursor.fetchall()
            
            # Map subject names to IDs
            subject_map = {s['name']: s['id'] for s in subjects}
            
            # Default core subjects for each level
            default_assignments = {
                'JHS 1': ['Mathematics', 'English Language', 'Social Studies', 'Science'],
                'JHS 2': ['Mathematics', 'English Language', 'Social Studies', 'Science'],
                'JHS 3': ['Mathematics', 'English Language', 'Social Studies', 'Science'],
                'SHS 1': ['Mathematics', 'English Language'],
                'SHS 2': ['Mathematics', 'English Language'],
                'SHS 3': ['Mathematics', 'English Language']
            }
            
            for level in levels:
                level_name = level['name']
                if level_name in default_assignments:
                    for subject_name in default_assignments[level_name]:
                        if subject_name in subject_map:
                            cursor.execute("""
                                INSERT INTO level_core_subjects (level_id, subject_id, created_at)
                                VALUES (?, ?, ?)
                            """, (level['id'], subject_map[subject_name], datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default level core subject assignments inserted successfully")
        else:
            logger.info("Table 'level_core_subjects' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(level_core_subjects)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE level_core_subjects ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE level_core_subjects ADD COLUMN updated_by_sync NUMERIC DEFAULT 0")
            
            if 'version' not in column_names:
                logger.info("Adding version column")
                cursor.execute("ALTER TABLE level_core_subjects ADD COLUMN version INTEGER DEFAULT 1")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating level_core_subjects table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_level_core_subjects_table()
except Exception as e:
    logger.error(f"Failed to initialize level_core_subjects table: {str(e)}")

# ==================== API Endpoints ====================

# @router.get("/")
# async def get_all_core_subjects():
#     """Get all level core subject assignments"""
#     logger.info("GET /api/level-core-subjects/ - Fetching all assignments")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get all levels
#         cursor.execute("SELECT id, name FROM levels ORDER BY id")
#         levels = cursor.fetchall()
        
#         # Get all core subjects
#         cursor.execute("""
#             SELECT s.id, s.name, s.code, s.type, s.category 
#             FROM subjects s 
#             WHERE s.type = 'core' OR s.type = 'both'
#             ORDER BY s.name
#         """)
#         all_subjects = cursor.fetchall()
        
#         # Get assignments
#         assignments = get_all_levels_with_subjects(cursor)
        
#         # Build response
#         result = []
#         for level in levels:
#             core_subject_ids = assignments.get(level['id'], [])
#             core_subjects = [
#                 {
#                     "id": s['id'],
#                     "name": s['name'],
#                     "code": s['code'],
#                     "type": s['type'],
#                     "category": s['category']
#                 }
#                 for s in all_subjects if s['id'] in core_subject_ids
#             ]
            
#             all_subjects_with_status = []
#             for subject in all_subjects:
#                 all_subjects_with_status.append({
#                     "id": subject['id'],
#                     "name": subject['name'],
#                     "code": subject['code'],
#                     "type": subject['type'],
#                     "category": subject['category'],
#                     "is_core": subject['id'] in core_subject_ids
#                 })
            
#             result.append({
#                 "level_id": level['id'],
#                 "level_name": level['name'],
#                 "core_subject_ids": core_subject_ids,
#                 "core_subjects": core_subjects,
#                 "all_subjects": all_subjects_with_status
#             })
        
#         logger.info(f"Retrieved assignments for {len(result)} levels")
        
#         return {
#             "success": True,
#             "data": result,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_all_core_subjects: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
#             logger.debug("Database connection closed")

@router.get("/")
async def get_all_core_subjects():
    """Get all level core subject assignments"""
    logger.info("GET /api/level-core-subjects/ - Fetching all assignments")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all levels
        cursor.execute("SELECT id, name FROM levels ORDER BY id")
        levels = cursor.fetchall()
        
        # Get all subjects (don't filter by type)
        cursor.execute("SELECT id, name, code, type, category FROM subjects ORDER BY name")
        all_subjects = cursor.fetchall()
        
        # Get assignments from level_core_subjects table
        assignments = {}
        cursor.execute("SELECT level_id, subject_id FROM level_core_subjects")
        assignment_rows = cursor.fetchall()
        
        for row in assignment_rows:
            level_id = row['level_id']
            subject_id = row['subject_id']
            if level_id not in assignments:
                assignments[level_id] = []
            assignments[level_id].append(subject_id)
        
        # Build response
        result = []
        for level in levels:
            level_id = level['id']
            core_subject_ids = assignments.get(level_id, [])
            
            core_subjects = [
                {
                    "id": s['id'],
                    "name": s['name'],
                    "code": s['code'],
                    "type": s['type'],
                    "category": s['category']
                }
                for s in all_subjects if s['id'] in core_subject_ids
            ]
            
            all_subjects_with_status = []
            for subject in all_subjects:
                all_subjects_with_status.append({
                    "id": subject['id'],
                    "name": subject['name'],
                    "code": subject['code'],
                    "type": subject['type'],
                    "category": subject['category'],
                    "is_core": subject['id'] in core_subject_ids
                })
            
            result.append({
                "level_id": level_id,
                "level_name": level['name'],
                "core_subject_ids": core_subject_ids,
                "core_subjects": core_subjects,
                "all_subjects": all_subjects_with_status
            })
        
        logger.info(f"Retrieved assignments for {len(result)} levels")
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_all_core_subjects: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()



@router.get("/levels")
async def get_levels():
    """Get all levels for the dropdown"""
    logger.info("GET /api/level-core-subjects/levels - Fetching levels")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, name FROM levels ORDER BY id")
        levels = cursor.fetchall()
        
        result = [{"id": level['id'], "name": level['name']} for level in levels]
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_levels: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/subjects")
async def get_all_subjects():
    """Get all subjects for assignment"""
    logger.info("GET /api/level-core-subjects/subjects - Fetching subjects")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, code, type, category 
            FROM subjects 
            ORDER BY type, name
        """)
        subjects = cursor.fetchall()
        
        result = [
            {
                "id": s['id'],
                "name": s['name'],
                "code": s['code'],
                "type": s['type'],
                "category": s['category']
            }
            for s in subjects
        ]
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_all_subjects: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{level_id}")
async def get_level_core_subjects(level_id: int):
    """Get core subjects for a specific level"""
    logger.info(f"GET /api/level-core-subjects/{level_id} - Fetching core subjects")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate level exists
        if not validate_level_exists(cursor, level_id):
            raise HTTPException(status_code=404, detail="Level not found")
        
        # Get level name
        cursor.execute("SELECT name FROM levels WHERE id = ?", (level_id,))
        level = cursor.fetchone()
        
        # Get core subject IDs for this level
        core_subject_ids = get_level_core_subjects(cursor, level_id)
        
        # Get all subjects with assignment status
        cursor.execute("SELECT id, name, code, type, category FROM subjects ORDER BY name")
        all_subjects = cursor.fetchall()
        
        subjects_with_status = []
        for subject in all_subjects:
            subjects_with_status.append({
                "id": subject['id'],
                "name": subject['name'],
                "code": subject['code'],
                "type": subject['type'],
                "category": subject['category'],
                "is_core": subject['id'] in core_subject_ids
            })
        
        return {
            "success": True,
            "data": {
                "level_id": level_id,
                "level_name": level['name'],
                "core_subject_ids": core_subject_ids,
                "subjects": subjects_with_status
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_level_core_subjects: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# @router.get("/matrix")
# async def get_assignment_matrix():
#     """Get the complete level-subject assignment matrix"""
#     logger.info("GET /api/level-core-subjects/matrix - Fetching assignment matrix")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get all levels
#         cursor.execute("SELECT id, name FROM levels ORDER BY id")
#         levels = cursor.fetchall()
        
#         # Get all subjects
#         cursor.execute("SELECT id, name FROM subjects WHERE type = 'core' ORDER BY name")
#         subjects = cursor.fetchall()
        
#         # Get all assignments
#         assignments = get_all_levels_with_subjects(cursor)
        
#         # Build matrix
#         matrix = []
#         for level in levels:
#             core_subject_ids = assignments.get(level['id'], [])
#             row = {
#                 "level_id": level['id'],
#                 "level_name": level['name'],
#                 "subjects": []
#             }
#             for subject in subjects:
#                 row["subjects"].append({
#                     "subject_id": subject['id'],
#                     "subject_name": subject['name'],
#                     "is_core": subject['id'] in core_subject_ids
#                 })
#             matrix.append(row)
        
#         return {
#             "success": True,
#             "data": {
#                 "levels": [{"id": l['id'], "name": l['name']} for l in levels],
#                 "subjects": [{"id": s['id'], "name": s['name']} for s in subjects],
#                 "matrix": matrix
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_assignment_matrix: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

@router.get("/matrix")
async def get_assignment_matrix():
    """Get the complete level-subject assignment matrix"""
    logger.info("GET /api/level-core-subjects/matrix - Fetching assignment matrix")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all levels
        cursor.execute("SELECT id, name FROM levels ORDER BY id")
        levels = cursor.fetchall()
        
        if not levels:
            logger.warning("No levels found")
            return {
                "success": True,
                "data": {
                    "levels": [],
                    "subjects": [],
                    "matrix": []
                },
                "timestamp": datetime.now().isoformat()
            }
        
        # Get all subjects (remove the type filter to get all subjects)
        cursor.execute("SELECT id, name FROM subjects ORDER BY name")
        subjects = cursor.fetchall()
        
        if not subjects:
            logger.warning("No subjects found")
            return {
                "success": True,
                "data": {
                    "levels": [{"id": l['id'], "name": l['name']} for l in levels],
                    "subjects": [],
                    "matrix": [{
                        "level_id": l['id'],
                        "level_name": l['name'],
                        "subjects": []
                    } for l in levels]
                },
                "timestamp": datetime.now().isoformat()
            }
        
        # Get all assignments from level_core_subjects table
        assignments = {}
        try:
            cursor.execute("SELECT level_id, subject_id FROM level_core_subjects")
            assignment_rows = cursor.fetchall()
            
            for row in assignment_rows:
                level_id = row['level_id']
                subject_id = row['subject_id']
                if level_id not in assignments:
                    assignments[level_id] = []
                assignments[level_id].append(subject_id)
            
            logger.info(f"Found {len(assignment_rows)} assignments")
        except Exception as e:
            logger.warning(f"Error fetching assignments: {e}")
            assignments = {}
        
        # Build matrix
        matrix = []
        for level in levels:
            level_id = level['id']
            core_subject_ids = assignments.get(level_id, [])
            
            row = {
                "level_id": level_id,
                "level_name": level['name'],
                "subjects": []
            }
            
            for subject in subjects:
                subject_id = subject['id']
                row["subjects"].append({
                    "subject_id": subject_id,
                    "subject_name": subject['name'],
                    "is_core": subject_id in core_subject_ids
                })
            
            matrix.append(row)
        
        logger.info(f"Matrix built successfully with {len(levels)} levels and {len(subjects)} subjects")
        
        return {
            "success": True,
            "data": {
                "levels": [{"id": l['id'], "name": l['name']} for l in levels],
                "subjects": [{"id": s['id'], "name": s['name']} for s in subjects],
                "matrix": matrix
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_assignment_matrix: {str(e)}")
        logger.error(traceback.format_exc())
        # Return empty structure instead of throwing error
        return {
            "success": True,
            "data": {
                "levels": [],
                "subjects": [],
                "matrix": []
            },
            "timestamp": datetime.now().isoformat()
        }
    finally:
        if conn:
            conn.close()



@router.post("/bulk")
async def bulk_update_core_subjects(bulk_data: LevelCoreSubjectsBulkUpdate):
    """Bulk update core subjects for a specific level"""
    logger.info(f"POST /api/level-core-subjects/bulk - Bulk updating for level {bulk_data.level_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate level exists
        if not validate_level_exists(cursor, bulk_data.level_id):
            raise HTTPException(status_code=404, detail="Level not found")
        
        # Validate all subjects exist
        for subject_id in bulk_data.subject_ids:
            if not validate_subject_exists(cursor, subject_id):
                raise HTTPException(status_code=404, detail=f"Subject with ID {subject_id} not found")
        
        # Remove existing assignments for this level
        cursor.execute("DELETE FROM level_core_subjects WHERE level_id = ?", (bulk_data.level_id,))
        
        # Insert new assignments
        for subject_id in bulk_data.subject_ids:
            cursor.execute("""
                INSERT INTO level_core_subjects (level_id, subject_id, created_at)
                VALUES (?, ?, ?)
            """, (bulk_data.level_id, subject_id, datetime.now().isoformat()))
        
        conn.commit()
        
        logger.info(f"Bulk update completed for level {bulk_data.level_id}: {len(bulk_data.subject_ids)} subjects assigned")
        
        return {
            "success": True,
            "message": f"Core subjects updated successfully for level",
            "data": {
                "level_id": bulk_data.level_id,
                "assigned_count": len(bulk_data.subject_ids)
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk_update_core_subjects: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/assign")
async def assign_core_subject(assignment: LevelCoreSubjectCreate):
    """Assign a single core subject to a level"""
    logger.info(f"POST /api/level-core-subjects/assign - Assigning subject {assignment.subject_id} to level {assignment.level_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate level exists
        if not validate_level_exists(cursor, assignment.level_id):
            raise HTTPException(status_code=404, detail="Level not found")
        
        # Validate subject exists
        if not validate_subject_exists(cursor, assignment.subject_id):
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Check if already assigned
        cursor.execute("""
            SELECT id FROM level_core_subjects 
            WHERE level_id = ? AND subject_id = ?
        """, (assignment.level_id, assignment.subject_id))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Subject already assigned as core to this level")
        
        # Create assignment
        cursor.execute("""
            INSERT INTO level_core_subjects (level_id, subject_id, created_at)
            VALUES (?, ?, ?)
        """, (assignment.level_id, assignment.subject_id, datetime.now().isoformat()))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Core subject assigned successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Core subject assigned successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in assign_core_subject: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{level_id}/{subject_id}")
async def remove_core_subject(level_id: int, subject_id: int):
    """Remove a core subject assignment from a level"""
    logger.info(f"DELETE /api/level-core-subjects/{level_id}/{subject_id} - Removing assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if assignment exists
        cursor.execute("""
            SELECT id FROM level_core_subjects 
            WHERE level_id = ? AND subject_id = ?
        """, (level_id, subject_id))
        
        assignment = cursor.fetchone()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Delete assignment
        cursor.execute("""
            DELETE FROM level_core_subjects 
            WHERE level_id = ? AND subject_id = ?
        """, (level_id, subject_id))
        
        conn.commit()
        
        logger.info(f"Core subject assignment removed for level {level_id}, subject {subject_id}")
        
        return {
            "success": True,
            "message": "Core subject removed successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in remove_core_subject: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_level_core_subject_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync level core subject assignment from external database"""
    try:
        logger.info("Syncing level core subject from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO level_core_subjects (
                id, level_id, subject_id, version, synced_at, updated_by_sync
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('level_id'),
            source_data.get('subject_id'),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1
        ))
        
        conn.commit()
        conn.close()
        logger.info("Level core subject synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing level core subject: {str(e)}")
        logger.error(traceback.format_exc())
        return False