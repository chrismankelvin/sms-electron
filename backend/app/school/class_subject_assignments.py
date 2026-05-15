from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
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

router = APIRouter(prefix="/api/class-subjects", tags=["class-subjects"])

# ==================== Pydantic Models ====================

class ClassSubjectBase(BaseModel):
    class_id: int
    subject_id: int
    is_required: bool = True
    academic_year_id: int

class ClassSubjectCreate(ClassSubjectBase):
    created_by: Optional[int] = None

class ClassSubjectUpdate(BaseModel):
    is_required: Optional[bool] = None
    updated_by: Optional[int] = None

class ClassSubjectResponse(BaseModel):
    id: int
    class_id: int
    class_name: str
    subject_id: int
    subject_name: str
    subject_code: str
    subject_type: str
    is_required: bool
    academic_year_id: int
    academic_year_label: str
    created_at: datetime

# ==================== Helper Functions ====================

def get_class_name(cursor, class_id: int) -> str:
    """Get class name"""
    cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
    result = cursor.fetchone()
    return result['class_name'] if result else "Unknown"

def get_subject_details(cursor, subject_id: int) -> Dict:
    """Get subject details"""
    cursor.execute("SELECT id, name, code, type FROM subjects WHERE id = ?", (subject_id,))
    result = cursor.fetchone()
    if result:
        return {
            "id": result['id'],
            "name": result['name'],
            "code": result['code'],
            "type": result['type']
        }
    return None

def get_academic_year_label(cursor, academic_year_id: int) -> str:
    """Get academic year label"""
    cursor.execute("SELECT year_label FROM academic_years WHERE id = ?", (academic_year_id,))
    result = cursor.fetchone()
    return result['year_label'] if result else "Unknown"

def validate_class_exists(cursor, class_id: int) -> bool:
    """Validate class exists"""
    cursor.execute("SELECT id FROM classes WHERE id = ?", (class_id,))
    return cursor.fetchone() is not None

def validate_subject_exists(cursor, subject_id: int) -> bool:
    """Validate subject exists"""
    cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
    return cursor.fetchone() is not None

def validate_academic_year_exists(cursor, academic_year_id: int) -> bool:
    """Validate academic year exists"""
    cursor.execute("SELECT id FROM academic_years WHERE id = ?", (academic_year_id,))
    return cursor.fetchone() is not None

def check_duplicate_assignment(cursor, class_id: int, subject_id: int, academic_year_id: int, exclude_id: Optional[int] = None) -> bool:
    """Check if subject is already assigned to class for this academic year"""
    query = """
        SELECT id FROM class_subjects 
        WHERE class_id = ? AND subject_id = ? AND academic_year_id = ?
    """
    params = [class_id, subject_id, academic_year_id]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    return cursor.fetchone() is not None

# def get_class_subjects(cursor, class_id: int, academic_year_id: int) -> List[Dict]:
#     """Get all subjects assigned to a class"""
#     cursor.execute("""
#         SELECT cs.*, s.name as subject_name, s.code as subject_code, s.type as subject_type
#         FROM class_subjects cs
#         JOIN subjects s ON cs.subject_id = s.id
#         WHERE cs.class_id = ? AND cs.academic_year_id = ?
#         ORDER BY s.name
#     """, (class_id, academic_year_id))
    
#     rows = cursor.fetchall()
#     results = []
#     for row in rows:
#         results.append({
#             "id": row['id'],
#             "class_id": row['class_id'],
#             "subject_id": row['subject_id'],
#             "subject_name": row['subject_name'],
#             "subject_code": row['subject_code'],
#             "subject_type": row['subject_type'],
#             "is_required": bool(row['is_required']),
#             "academic_year_id": row['academic_year_id'],
#             "created_at": row['created_at']
#         })
#     return results

# Fix the helper function - it should accept cursor as first argument

def get_class_subjects(cursor, class_id: int, academic_year_id: int) -> List[Dict]:
    """Get all subjects assigned to a class"""
    cursor.execute("""
        SELECT cs.*, s.name as subject_name, s.code as subject_code, s.type as subject_type
        FROM class_subjects cs
        JOIN subjects s ON cs.subject_id = s.id
        WHERE cs.class_id = ? AND cs.academic_year_id = ?
        ORDER BY s.name
    """, (class_id, academic_year_id))
    
    rows = cursor.fetchall()
    results = []
    for row in rows:
        results.append({
            "id": row['id'],
            "class_id": row['class_id'],
            "subject_id": row['subject_id'],
            "subject_name": row['subject_name'],
            "subject_code": row['subject_code'],
            "subject_type": row['subject_type'],
            "is_required": bool(row['is_required']),
            "academic_year_id": row['academic_year_id'],
            "created_at": row['created_at']
        })
    return results

# ==================== Database Setup ====================

def create_class_subjects_table():
    """Create class_subjects table if it doesn't exist"""
    try:
        logger.info("Creating/checking class_subjects table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='class_subjects'")
        if not cursor.fetchone():
            cursor.execute("""
                CREATE TABLE class_subjects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    class_id INTEGER NOT NULL,
                    subject_id INTEGER NOT NULL,
                    is_required BOOLEAN DEFAULT 1,
                    academic_year_id INTEGER NOT NULL,
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
                    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (updated_by) REFERENCES users(id),
                    UNIQUE(class_id, subject_id, academic_year_id)
                )
            """)
            logger.info("Created class_subjects table")
        
        # Add missing columns if needed
        cursor.execute("PRAGMA table_info(class_subjects)")
        columns = cursor.fetchall()
        column_names = [col['name'] for col in columns]
        
        if 'version' not in column_names:
            cursor.execute("ALTER TABLE class_subjects ADD COLUMN version INTEGER DEFAULT 1")
        if 'synced_at' not in column_names:
            cursor.execute("ALTER TABLE class_subjects ADD COLUMN synced_at TIMESTAMP")
        if 'updated_by_sync' not in column_names:
            cursor.execute("ALTER TABLE class_subjects ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0")
        if 'sync_error' not in column_names:
            cursor.execute("ALTER TABLE class_subjects ADD COLUMN sync_error TEXT")
        if 'created_by' not in column_names:
            cursor.execute("ALTER TABLE class_subjects ADD COLUMN created_by INTEGER")
        if 'updated_by' not in column_names:
            cursor.execute("ALTER TABLE class_subjects ADD COLUMN updated_by INTEGER")
        
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error creating class_subjects table: {str(e)}")
        raise

# Initialize table on module load
try:
    # create_class_subjects_table()
    pass
except Exception as e:
    logger.error(f"Failed to initialize class_subjects table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_all_assignments(
    academic_year_id: Optional[int] = None,
    class_id: Optional[int] = None
):
    """Get all class-subject assignments with optional filters"""
    logger.info(f"GET /api/class-subjects/ - Fetching assignments")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT cs.*, 
                   c.class_name,
                   s.name as subject_name,
                   s.code as subject_code,
                   s.type as subject_type,
                   ay.year_label as academic_year_label
            FROM class_subjects cs
            JOIN classes c ON cs.class_id = c.id
            JOIN subjects s ON cs.subject_id = s.id
            JOIN academic_years ay ON cs.academic_year_id = ay.id
            WHERE 1=1
        """
        params = []
        
        if academic_year_id:
            query += " AND cs.academic_year_id = ?"
            params.append(academic_year_id)
        
        if class_id:
            query += " AND cs.class_id = ?"
            params.append(class_id)
        
        query += " ORDER BY c.class_name, s.name"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        assignments = []
        for row in results:
            assignments.append({
                "id": row['id'],
                "class_id": row['class_id'],
                "class_name": row['class_name'],
                "subject_id": row['subject_id'],
                "subject_name": row['subject_name'],
                "subject_code": row['subject_code'],
                "subject_type": row['subject_type'],
                "is_required": bool(row['is_required']),
                "academic_year_id": row['academic_year_id'],
                "academic_year_label": row['academic_year_label'],
                "created_at": row['created_at']
            })
        
        return {
            "success": True,
            "data": assignments,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_all_assignments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# @router.get("/class/{class_id}")
# async def get_class_subjects(
#     class_id: int,
#     academic_year_id: int = Query(...)
# ):
#     """Get all subjects assigned to a specific class"""
#     logger.info(f"GET /api/class-subjects/class/{class_id} - academic_year={academic_year_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         if not validate_class_exists(cursor, class_id):
#             raise HTTPException(status_code=404, detail="Class not found")
        
#         subjects = get_class_subjects(cursor, class_id, academic_year_id)
#         class_name = get_class_name(cursor, class_id)
        
#         return {
#             "success": True,
#             "data": {
#                 "class_id": class_id,
#                 "class_name": class_name,
#                 "academic_year_id": academic_year_id,
#                 "subjects": subjects
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_class_subjects: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()


@router.get("/class/{class_id}")
async def get_class_subjects_endpoint(
    class_id: int,
    academic_year_id: int = Query(...)
):
    """Get all subjects assigned to a specific class"""
    logger.info(f"GET /api/class-subjects/class/{class_id} - academic_year={academic_year_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if not validate_class_exists(cursor, class_id):
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Call the function correctly with cursor as first argument
        subjects = get_class_subjects(cursor, class_id, academic_year_id)
        class_name = get_class_name(cursor, class_id)
        
        return {
            "success": True,
            "data": {
                "class_id": class_id,
                "class_name": class_name,
                "academic_year_id": academic_year_id,
                "subjects": subjects
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_class_subjects_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()



# @router.get("/available-subjects/{class_id}")
# async def get_available_subjects(
#     class_id: int,
#     academic_year_id: int = Query(...)
# ):
#     """Get subjects that are not yet assigned to a class"""
#     logger.info(f"GET /api/class-subjects/available-subjects/{class_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get subjects already assigned to this class
#         cursor.execute("""
#             SELECT subject_id FROM class_subjects 
#             WHERE class_id = ? AND academic_year_id = ?
#         """, (class_id, academic_year_id))
        
#         assigned_ids = [row['subject_id'] for row in cursor.fetchall()]
        
#         # Build query for available subjects
#         if assigned_ids:
#             placeholders = ','.join(['?'] * len(assigned_ids))
#             query = f"""
#                 SELECT id, name, code, type FROM subjects 
#                 WHERE id NOT IN ({placeholders})
#                 ORDER BY name
#             """
#             cursor.execute(query, assigned_ids)
#         else:
#             cursor.execute("SELECT id, name, code, type FROM subjects ORDER BY name")
        
#         results = cursor.fetchall()
        
#         subjects = []
#         for row in results:
#             subjects.append({
#                 "id": row['id'],
#                 "name": row['name'],
#                 "code": row['code'],
#                 "type": row['type']
#             })
        
#         return {
#             "success": True,
#             "data": subjects,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_available_subjects: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

@router.get("/available-subjects/{class_id}")
async def get_available_subjects(
    class_id: int,
    academic_year_id: int = Query(...)
):
    """Get subjects that are not yet assigned to a class"""
    logger.info(f"GET /api/class-subjects/available-subjects/{class_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get subjects already assigned to this class
        cursor.execute("""
            SELECT subject_id FROM class_subjects 
            WHERE class_id = ? AND academic_year_id = ?
        """, (class_id, academic_year_id))
        
        assigned_ids = [row['subject_id'] for row in cursor.fetchall()]
        
        # Build query for available subjects
        if assigned_ids:
            placeholders = ','.join(['?'] * len(assigned_ids))
            query = f"""
                SELECT id, name, code, type FROM subjects 
                WHERE id NOT IN ({placeholders})
                ORDER BY name
            """
            cursor.execute(query, assigned_ids)
        else:
            cursor.execute("SELECT id, name, code, type FROM subjects ORDER BY name")
        
        results = cursor.fetchall()
        
        subjects = []
        for row in results:
            subjects.append({
                "id": row['id'],
                "name": row['name'],
                "code": row['code'],
                "type": row['type']
            })
        
        return {
            "success": True,
            "data": subjects,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_available_subjects: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()


@router.post("/")
async def create_assignment(assignment_data: ClassSubjectCreate):
    """Assign a subject to a class"""
    logger.info(f"POST /api/class-subjects/ - class={assignment_data.class_id}, subject={assignment_data.subject_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate foreign keys
        if not validate_class_exists(cursor, assignment_data.class_id):
            raise HTTPException(status_code=400, detail="Class not found")
        
        if not validate_subject_exists(cursor, assignment_data.subject_id):
            raise HTTPException(status_code=400, detail="Subject not found")
        
        if not validate_academic_year_exists(cursor, assignment_data.academic_year_id):
            raise HTTPException(status_code=400, detail="Academic year not found")
        
        # Check for duplicate
        if check_duplicate_assignment(cursor, assignment_data.class_id, assignment_data.subject_id, assignment_data.academic_year_id):
            class_name = get_class_name(cursor, assignment_data.class_id)
            subject_details = get_subject_details(cursor, assignment_data.subject_id)
            raise HTTPException(
                status_code=400,
                detail=f"Subject '{subject_details['name']}' is already assigned to class '{class_name}' for this academic year"
            )
        
        # Insert assignment
        cursor.execute("""
            INSERT INTO class_subjects (class_id, subject_id, is_required, academic_year_id, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            assignment_data.class_id, assignment_data.subject_id,
            assignment_data.is_required, assignment_data.academic_year_id,
            assignment_data.created_by, datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        return {
            "success": True,
            "message": "Subject assigned to class successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_assignment: {str(e)}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/bulk")
async def bulk_assign_subjects(
    class_id: int = Query(...),
    academic_year_id: int = Query(...),
    subject_ids: List[int] = Query(...)
):
    """Bulk assign multiple subjects to a class"""
    logger.info(f"POST /api/class-subjects/bulk - class={class_id}, subjects={len(subject_ids)}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if not validate_class_exists(cursor, class_id):
            raise HTTPException(status_code=400, detail="Class not found")
        
        if not validate_academic_year_exists(cursor, academic_year_id):
            raise HTTPException(status_code=400, detail="Academic year not found")
        
        added_count = 0
        errors = []
        
        for subject_id in subject_ids:
            try:
                if not validate_subject_exists(cursor, subject_id):
                    errors.append(f"Subject ID {subject_id} not found")
                    continue
                
                if check_duplicate_assignment(cursor, class_id, subject_id, academic_year_id):
                    subject_details = get_subject_details(cursor, subject_id)
                    errors.append(f"Subject '{subject_details['name']}' already assigned")
                    continue
                
                cursor.execute("""
                    INSERT INTO class_subjects (class_id, subject_id, is_required, academic_year_id, created_at, updated_at)
                    VALUES (?, ?, 1, ?, ?, ?)
                """, (class_id, subject_id, academic_year_id, datetime.now().isoformat(), datetime.now().isoformat()))
                added_count += 1
                
            except Exception as e:
                errors.append(f"Error adding subject {subject_id}: {str(e)}")
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Added {added_count} subjects to class",
            "data": {
                "added_count": added_count,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in bulk_assign_subjects: {str(e)}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{assignment_id}")
async def update_assignment(assignment_id: int, assignment_data: ClassSubjectUpdate):
    """Update an assignment (e.g., toggle required status)"""
    logger.info(f"PUT /api/class-subjects/{assignment_id} - Updating assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM class_subjects WHERE id = ?", (assignment_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        updates = []
        params = []
        
        if assignment_data.is_required is not None:
            updates.append("is_required = ?")
            params.append(1 if assignment_data.is_required else 0)
        
        if assignment_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(assignment_data.updated_by)
        
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        updates.append("version = version + 1")
        
        if updates:
            params.append(assignment_id)
            query = f"UPDATE class_subjects SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        return {
            "success": True,
            "message": "Assignment updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_assignment: {str(e)}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{assignment_id}")
async def delete_assignment(assignment_id: int):
    """Remove a subject from a class"""
    logger.info(f"DELETE /api/class-subjects/{assignment_id} - Deleting assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM class_subjects WHERE id = ?", (assignment_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        cursor.execute("DELETE FROM class_subjects WHERE id = ?", (assignment_id,))
        conn.commit()
        
        return {
            "success": True,
            "message": "Subject removed from class successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_assignment: {str(e)}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/summary/{academic_year_id}")
async def get_assignment_summary(academic_year_id: int):
    """Get summary of subject assignments by class"""
    logger.info(f"GET /api/class-subjects/summary/{academic_year_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all classes
        cursor.execute("SELECT id, class_name FROM classes ORDER BY class_name")
        classes = cursor.fetchall()
        
        # Get all subjects
        cursor.execute("SELECT id, name FROM subjects ORDER BY name")
        subjects = cursor.fetchall()
        
        # Get assignments
        cursor.execute("""
            SELECT class_id, subject_id FROM class_subjects 
            WHERE academic_year_id = ?
        """, (academic_year_id,))
        
        assignments = {}
        for row in cursor.fetchall():
            if row['class_id'] not in assignments:
                assignments[row['class_id']] = set()
            assignments[row['class_id']].add(row['subject_id'])
        
        # Build matrix
        matrix = []
        for class_item in classes:
            class_subjects = assignments.get(class_item['id'], set())
            matrix.append({
                "class_id": class_item['id'],
                "class_name": class_item['class_name'],
                "subject_count": len(class_subjects),
                "subjects": [
                    {
                        "subject_id": s['id'],
                        "subject_name": s['name'],
                        "assigned": s['id'] in class_subjects
                    }
                    for s in subjects
                ]
            })
        
        return {
            "success": True,
            "data": {
                "classes": [{"id": c['id'], "name": c['class_name']} for c in classes],
                "subjects": [{"id": s['id'], "name": s['name']} for s in subjects],
                "matrix": matrix
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_assignment_summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()