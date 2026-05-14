# app/school/teacher_subject_assignments.py

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

router = APIRouter(prefix="/api/teacher-subject-assignments", tags=["teacher-subject-assignments"])

# ==================== Pydantic Models ====================

class TeacherSubjectAssignmentBase(BaseModel):
    staff_id: int
    class_id: int
    subject_id: int
    academic_year_id: int
    is_active: bool = True

class TeacherSubjectAssignmentCreate(TeacherSubjectAssignmentBase):
    created_by: Optional[int] = None

class TeacherSubjectAssignmentUpdate(BaseModel):
    staff_id: Optional[int] = None
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    academic_year_id: Optional[int] = None
    is_active: Optional[bool] = None
    updated_by: Optional[int] = None

# ==================== Helper Functions ====================

def validate_staff_exists(cursor, staff_id: int) -> bool:
    """Validate that the staff member exists"""
    cursor.execute("""
        SELECT s.id 
        FROM staff s
        WHERE s.id = ? AND s.deleted_at IS NULL
    """, (staff_id,))
    return cursor.fetchone() is not None

def get_staff_name(cursor, staff_id: int) -> str:
    """Get staff full name from person_details"""
    cursor.execute("""
        SELECT p.first_name, p.last_name, p.other_names
        FROM staff s
        JOIN person_details p ON s.person_id = p.id
        WHERE s.id = ?
    """, (staff_id,))
    result = cursor.fetchone()
    if result:
        name = f"{result['first_name']} {result['last_name']}"
        if result['other_names']:
            name += f" ({result['other_names']})"
        return name
    return "Unknown"

def validate_class_exists(cursor, class_id: int) -> bool:
    """Validate that the class exists"""
    cursor.execute("SELECT id, class_name FROM classes WHERE id = ?", (class_id,))
    return cursor.fetchone() is not None

def get_class_name(cursor, class_id: int) -> str:
    """Get class name"""
    cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
    result = cursor.fetchone()
    return result['class_name'] if result else "Unknown"

def validate_subject_exists(cursor, subject_id: int) -> bool:
    """Validate that the subject exists"""
    cursor.execute("SELECT id, name, code FROM subjects WHERE id = ?", (subject_id,))
    return cursor.fetchone() is not None

def get_subject_details(cursor, subject_id: int) -> tuple:
    """Get subject name and code"""
    cursor.execute("SELECT name, code FROM subjects WHERE id = ?", (subject_id,))
    result = cursor.fetchone()
    return (result['name'], result['code']) if result else ("Unknown", "")

def validate_academic_year_exists(cursor, academic_year_id: int) -> bool:
    """Validate that the academic year exists"""
    cursor.execute("SELECT id, year_label FROM academic_years WHERE id = ?", (academic_year_id,))
    return cursor.fetchone() is not None

def get_academic_year_label(cursor, academic_year_id: int) -> str:
    """Get academic year label"""
    cursor.execute("SELECT year_label FROM academic_years WHERE id = ?", (academic_year_id,))
    result = cursor.fetchone()
    return result['year_label'] if result else "Unknown"

def check_duplicate_assignment(cursor, staff_id: int, class_id: int, subject_id: int, academic_year_id: int, exclude_id: Optional[int] = None) -> bool:
    """Check if assignment already exists"""
    query = """
        SELECT id FROM teacher_subject_assignments 
        WHERE staff_id = ? AND class_id = ? AND subject_id = ? AND academic_year_id = ?
    """
    params = [staff_id, class_id, subject_id, academic_year_id]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    return cursor.fetchone() is not None

def get_teacher_assignments_for_conflict(cursor, staff_id: int, academic_year_id: int, exclude_id: Optional[int] = None) -> List[Dict]:
    """Get all assignments for a teacher in an academic year"""
    query = """
        SELECT tsa.*, c.class_name, s.name as subject_name
        FROM teacher_subject_assignments tsa
        JOIN classes c ON tsa.class_id = c.id
        JOIN subjects s ON tsa.subject_id = s.id
        WHERE tsa.staff_id = ? AND tsa.academic_year_id = ?
    """
    params = [staff_id, academic_year_id]
    
    if exclude_id:
        query += " AND tsa.id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    
    return [
        {
            "id": row['id'],
            "class_name": row['class_name'],
            "subject_name": row['subject_name'],
            "is_active": bool(row['is_active'])
        }
        for row in results
    ]

# ==================== Database Setup ====================

def create_teacher_subject_assignments_table():
    """Create teacher_subject_assignments table if it doesn't exist"""
    try:
        logger.info("Creating/checking teacher_subject_assignments table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='teacher_subject_assignments'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE teacher_subject_assignments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    staff_id INTEGER NOT NULL,
                    class_id INTEGER NOT NULL,
                    subject_id INTEGER NOT NULL,
                    academic_year_id INTEGER NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync NUMERIC DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                    UNIQUE(staff_id, class_id, subject_id, academic_year_id)
                )
            """)
            logger.info("New teacher_subject_assignments table created")
        else:
            logger.info("Table 'teacher_subject_assignments' already exists")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(teacher_subject_assignments)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'version' not in column_names:
                logger.info("Adding version column")
                cursor.execute("ALTER TABLE teacher_subject_assignments ADD COLUMN version INTEGER DEFAULT 1")
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE teacher_subject_assignments ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE teacher_subject_assignments ADD COLUMN updated_by_sync NUMERIC DEFAULT 0")
            
            if 'created_by' not in column_names:
                logger.info("Adding created_by column")
                cursor.execute("ALTER TABLE teacher_subject_assignments ADD COLUMN created_by INTEGER")
            
            if 'updated_by' not in column_names:
                logger.info("Adding updated_by column")
                cursor.execute("ALTER TABLE teacher_subject_assignments ADD COLUMN updated_by INTEGER")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating teacher_subject_assignments table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_teacher_subject_assignments_table()
except Exception as e:
    logger.error(f"Failed to initialize teacher_subject_assignments table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_assignments(
    staff_id: Optional[int] = None,
    class_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    academic_year_id: Optional[int] = None,
    is_active: Optional[bool] = None
):
    """Get all teacher subject assignments with optional filters"""
    logger.info(f"GET /api/teacher-subject-assignments/ - Fetching assignments")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT tsa.* FROM teacher_subject_assignments tsa
            WHERE 1=1
        """
        params = []
        
        if staff_id:
            query += " AND tsa.staff_id = ?"
            params.append(staff_id)
        
        if class_id:
            query += " AND tsa.class_id = ?"
            params.append(class_id)
        
        if subject_id:
            query += " AND tsa.subject_id = ?"
            params.append(subject_id)
        
        if academic_year_id:
            query += " AND tsa.academic_year_id = ?"
            params.append(academic_year_id)
        
        if is_active is not None:
            query += " AND tsa.is_active = ?"
            params.append(1 if is_active else 0)
        
        query += " ORDER BY tsa.academic_year_id DESC, tsa.class_id ASC, tsa.subject_id ASC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        assignments = []
        for row in results:
            staff_name = get_staff_name(cursor, row['staff_id'])
            class_name = get_class_name(cursor, row['class_id'])
            subject_name, subject_code = get_subject_details(cursor, row['subject_id'])
            academic_year_label = get_academic_year_label(cursor, row['academic_year_id'])
            
            assignments.append({
                "id": row['id'],
                "staff_id": row['staff_id'],
                "staff_name": staff_name,
                "class_id": row['class_id'],
                "class_name": class_name,
                "subject_id": row['subject_id'],
                "subject_name": subject_name,
                "subject_code": subject_code,
                "academic_year_id": row['academic_year_id'],
                "academic_year_label": academic_year_label,
                "is_active": bool(row['is_active']),
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(assignments)} assignments")
        
        return {
            "success": True,
            "data": assignments,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_assignments: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{assignment_id}")
async def get_assignment(assignment_id: int):
    """Get a specific assignment by ID"""
    logger.info(f"GET /api/teacher-subject-assignments/{assignment_id} - Fetching assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM teacher_subject_assignments WHERE id = ?", (assignment_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        staff_name = get_staff_name(cursor, result['staff_id'])
        class_name = get_class_name(cursor, result['class_id'])
        subject_name, subject_code = get_subject_details(cursor, result['subject_id'])
        academic_year_label = get_academic_year_label(cursor, result['academic_year_id'])
        
        assignment = {
            "id": result['id'],
            "staff_id": result['staff_id'],
            "staff_name": staff_name,
            "class_id": result['class_id'],
            "class_name": class_name,
            "subject_id": result['subject_id'],
            "subject_name": subject_name,
            "subject_code": subject_code,
            "academic_year_id": result['academic_year_id'],
            "academic_year_label": academic_year_label,
            "is_active": bool(result['is_active']),
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": assignment,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_assignment: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/teacher/{staff_id}/conflicts")
async def get_teacher_conflicts(staff_id: int, academic_year_id: int):
    """Get potential conflicts for a teacher's assignments"""
    logger.info(f"GET /api/teacher-subject-assignments/teacher/{staff_id}/conflicts - Checking conflicts")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate staff exists
        if not validate_staff_exists(cursor, staff_id):
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        assignments = get_teacher_assignments_for_conflict(cursor, staff_id, academic_year_id)
        teacher_name = get_staff_name(cursor, staff_id)
        
        return {
            "success": True,
            "data": {
                "teacher_id": staff_id,
                "teacher_name": teacher_name,
                "academic_year_id": academic_year_id,
                "assignments": assignments,
                "has_conflicts": len(assignments) > 1
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_teacher_conflicts: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_assignment(assignment_data: TeacherSubjectAssignmentCreate):
    """Create a new teacher subject assignment"""
    logger.info(f"POST /api/teacher-subject-assignments/ - Creating new assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate foreign keys
        if not validate_staff_exists(cursor, assignment_data.staff_id):
            raise HTTPException(status_code=400, detail=f"Teacher with ID {assignment_data.staff_id} not found")
        
        if not validate_class_exists(cursor, assignment_data.class_id):
            raise HTTPException(status_code=400, detail=f"Class with ID {assignment_data.class_id} not found")
        
        if not validate_subject_exists(cursor, assignment_data.subject_id):
            raise HTTPException(status_code=400, detail=f"Subject with ID {assignment_data.subject_id} not found")
        
        if not validate_academic_year_exists(cursor, assignment_data.academic_year_id):
            raise HTTPException(status_code=400, detail=f"Academic year with ID {assignment_data.academic_year_id} not found")
        
        # Check for duplicate assignment
        if check_duplicate_assignment(
            cursor, 
            assignment_data.staff_id, 
            assignment_data.class_id, 
            assignment_data.subject_id, 
            assignment_data.academic_year_id
        ):
            raise HTTPException(
                status_code=400, 
                detail="This teacher is already assigned to teach this subject in this class for the selected academic year"
            )
        
        # Insert assignment
        cursor.execute("""
            INSERT INTO teacher_subject_assignments (
                staff_id, class_id, subject_id, academic_year_id, is_active,
                created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            assignment_data.staff_id, 
            assignment_data.class_id, 
            assignment_data.subject_id,
            assignment_data.academic_year_id, 
            1 if assignment_data.is_active else 0,
            assignment_data.created_by, 
            datetime.now().isoformat(), 
            datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Assignment created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Assignment created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_assignment: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{assignment_id}")
async def update_assignment(assignment_id: int, assignment_data: TeacherSubjectAssignmentUpdate):
    """Update a teacher subject assignment"""
    logger.info(f"PUT /api/teacher-subject-assignments/{assignment_id} - Updating assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if assignment exists
        cursor.execute("SELECT * FROM teacher_subject_assignments WHERE id = ?", (assignment_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Get values for validation
        new_staff_id = assignment_data.staff_id if assignment_data.staff_id is not None else existing['staff_id']
        new_class_id = assignment_data.class_id if assignment_data.class_id is not None else existing['class_id']
        new_subject_id = assignment_data.subject_id if assignment_data.subject_id is not None else existing['subject_id']
        new_academic_year_id = assignment_data.academic_year_id if assignment_data.academic_year_id is not None else existing['academic_year_id']
        
        # Validate foreign keys if being updated
        if assignment_data.staff_id is not None and not validate_staff_exists(cursor, assignment_data.staff_id):
            raise HTTPException(status_code=400, detail=f"Teacher with ID {assignment_data.staff_id} not found")
        
        if assignment_data.class_id is not None and not validate_class_exists(cursor, assignment_data.class_id):
            raise HTTPException(status_code=400, detail=f"Class with ID {assignment_data.class_id} not found")
        
        if assignment_data.subject_id is not None and not validate_subject_exists(cursor, assignment_data.subject_id):
            raise HTTPException(status_code=400, detail=f"Subject with ID {assignment_data.subject_id} not found")
        
        if assignment_data.academic_year_id is not None and not validate_academic_year_exists(cursor, assignment_data.academic_year_id):
            raise HTTPException(status_code=400, detail=f"Academic year with ID {assignment_data.academic_year_id} not found")
        
        # Check for duplicate if relevant fields changed
        if (assignment_data.staff_id is not None or 
            assignment_data.class_id is not None or 
            assignment_data.subject_id is not None or 
            assignment_data.academic_year_id is not None):
            
            if check_duplicate_assignment(
                cursor, new_staff_id, new_class_id, new_subject_id, new_academic_year_id, assignment_id
            ):
                raise HTTPException(
                    status_code=400,
                    detail="This teacher is already assigned to teach this subject in this class for the selected academic year"
                )
        
        # Apply updates
        if assignment_data.staff_id is not None:
            updates.append("staff_id = ?")
            params.append(assignment_data.staff_id)
        
        if assignment_data.class_id is not None:
            updates.append("class_id = ?")
            params.append(assignment_data.class_id)
        
        if assignment_data.subject_id is not None:
            updates.append("subject_id = ?")
            params.append(assignment_data.subject_id)
        
        if assignment_data.academic_year_id is not None:
            updates.append("academic_year_id = ?")
            params.append(assignment_data.academic_year_id)
        
        if assignment_data.is_active is not None:
            updates.append("is_active = ?")
            params.append(1 if assignment_data.is_active else 0)
        
        if assignment_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(assignment_data.updated_by)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(assignment_id)
            query = f"UPDATE teacher_subject_assignments SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Assignment {assignment_id} updated successfully")
        
        return {
            "success": True,
            "message": "Assignment updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_assignment: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{assignment_id}")
async def delete_assignment(assignment_id: int):
    """Delete a teacher subject assignment"""
    logger.info(f"DELETE /api/teacher-subject-assignments/{assignment_id} - Deleting assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if assignment exists
        cursor.execute("SELECT id FROM teacher_subject_assignments WHERE id = ?", (assignment_id,))
        assignment = cursor.fetchone()
        
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Delete the assignment
        cursor.execute("DELETE FROM teacher_subject_assignments WHERE id = ?", (assignment_id,))
        conn.commit()
        
        logger.info(f"Assignment {assignment_id} deleted successfully")
        
        return {
            "success": True,
            "message": "Assignment deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_assignment: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/bulk")
async def bulk_create_assignments(assignments_data: List[TeacherSubjectAssignmentCreate]):
    """Create multiple teacher subject assignments at once"""
    logger.info(f"POST /api/teacher-subject-assignments/bulk - Creating {len(assignments_data)} assignments")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        created_count = 0
        errors = []
        
        for assignment in assignments_data:
            try:
                # Validate foreign keys
                if not validate_staff_exists(cursor, assignment.staff_id):
                    errors.append(f"Teacher ID {assignment.staff_id} not found")
                    continue
                
                if not validate_class_exists(cursor, assignment.class_id):
                    errors.append(f"Class ID {assignment.class_id} not found")
                    continue
                
                if not validate_subject_exists(cursor, assignment.subject_id):
                    errors.append(f"Subject ID {assignment.subject_id} not found")
                    continue
                
                if not validate_academic_year_exists(cursor, assignment.academic_year_id):
                    errors.append(f"Academic year ID {assignment.academic_year_id} not found")
                    continue
                
                # Check for duplicate
                if check_duplicate_assignment(
                    cursor, assignment.staff_id, assignment.class_id, 
                    assignment.subject_id, assignment.academic_year_id
                ):
                    errors.append(f"Duplicate assignment for teacher {assignment.staff_id}, class {assignment.class_id}, subject {assignment.subject_id}")
                    continue
                
                cursor.execute("""
                    INSERT INTO teacher_subject_assignments (
                        staff_id, class_id, subject_id, academic_year_id, is_active,
                        created_by, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    assignment.staff_id, assignment.class_id, assignment.subject_id,
                    assignment.academic_year_id, 1 if assignment.is_active else 0,
                    assignment.created_by, datetime.now().isoformat(), datetime.now().isoformat()
                ))
                created_count += 1
                
            except Exception as e:
                errors.append(str(e))
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Created {created_count} assignments",
            "data": {
                "created_count": created_count,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in bulk_create_assignments: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()