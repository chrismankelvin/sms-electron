# app/school/student_assignment.py

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
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

router = APIRouter(prefix="/api/student-assignments", tags=["student-assignments"])

# ==================== Pydantic Models ====================

class StudentAssignmentCreate(BaseModel):
    student_id: int
    class_id: int
    section_id: int
    updated_by: Optional[int] = None

class BulkStudentAssignment(BaseModel):
    assignments: List[Dict[str, Any]]  # Each: {student_id, class_id, section_id}

# ==================== Helper Functions ====================

def get_student_info(cursor, student_id: int) -> Dict[str, Any]:
    """Get student information"""
    cursor.execute("""
        SELECT s.id, s.student_number, s.academic_year_id, s.class_id, s.section_id,
               p.first_name, p.last_name, p.other_names
        FROM students s
        JOIN person_details p ON s.person_id = p.id
        WHERE s.id = ? AND s.deleted_at IS NULL
    """, (student_id,))
    row = cursor.fetchone()
    if row:
        name = f"{row['first_name']} {row['last_name']}"
        if row['other_names']:
            name += f" ({row['other_names']})"
        return {
            "id": row['id'],
            "student_number": row['student_number'],
            "name": name,
            "academic_year_id": row['academic_year_id'],
            "current_class_id": row['class_id'],
            "current_section_id": row['section_id']
        }
    return None

def validate_class_exists(cursor, class_id: int) -> bool:
    """Validate that the class exists"""
    cursor.execute("SELECT id, class_name FROM classes WHERE id = ?", (class_id,))
    return cursor.fetchone() is not None

def validate_section_exists(cursor, section_id: int) -> bool:
    """Validate that the section exists"""
    cursor.execute("""
        SELECT s.id, s.section_name, s.class_id, c.class_name
        FROM sections s
        JOIN classes c ON s.class_id = c.id
        WHERE s.id = ?
    """, (section_id,))
    return cursor.fetchone() is not None

def get_section_details(cursor, section_id: int) -> Dict[str, Any]:
    """Get section details including class info"""
    cursor.execute("""
        SELECT s.id, s.section_name, s.class_id, s.capacity, c.class_name
        FROM sections s
        JOIN classes c ON s.class_id = c.id
        WHERE s.id = ?
    """, (section_id,))
    row = cursor.fetchone()
    if row:
        return {
            "id": row['id'],
            "section_name": row['section_name'],
            "class_id": row['class_id'],
            "class_name": row['class_name'],
            "capacity": row['capacity']
        }
    return None

def check_section_capacity(cursor, section_id: int, additional_students: int = 0) -> bool:
    """Check if section has capacity for additional students"""
    cursor.execute("""
        SELECT COUNT(*) as count, s.capacity
        FROM students st
        JOIN sections s ON st.section_id = s.id
        WHERE st.section_id = ? AND st.deleted_at IS NULL
    """, (section_id,))
    row = cursor.fetchone()
    
    if row:
        current_count = row['count'] if row['count'] else 0
        capacity = row['capacity'] if row['capacity'] else 40
        return (current_count + additional_students) <= capacity
    return True

# ==================== API Endpoints ====================

@router.get("/")
async def get_student_assignments(
    academic_year_id: Optional[int] = None,
    class_id: Optional[int] = None,
    section_id: Optional[int] = None
):
    """Get all student assignments with optional filters"""
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                s.id as student_id,
                s.student_number,
                s.class_id,
                s.section_id,
                s.academic_year_id,
                s.status,
                s.updated_at,
                p.first_name,
                p.last_name,
                p.other_names,
                c.class_name,
                sec.section_name
            FROM students s
            JOIN person_details p ON s.person_id = p.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE s.deleted_at IS NULL
        """
        params = []
        
        if academic_year_id:
            query += " AND s.academic_year_id = ?"
            params.append(academic_year_id)
        
        if class_id:
            query += " AND s.class_id = ?"
            params.append(class_id)
        
        if section_id:
            query += " AND s.section_id = ?"
            params.append(section_id)
        
        query += " ORDER BY p.last_name, p.first_name"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        assignments = []
        for row in results:
            name = f"{row['first_name']} {row['last_name']}"
            if row['other_names']:
                name += f" ({row['other_names']})"
            
            assignments.append({
                "student_id": row['student_id'],
                "student_number": row['student_number'],
                "student_name": name,
                "class_id": row['class_id'],
                "class_name": row['class_name'],
                "section_id": row['section_id'],
                "section_name": row['section_name'],
                "academic_year_id": row['academic_year_id'],
                "status": row['status'],
                "updated_at": row['updated_at']
            })
        
        return {
            "success": True,
            "data": assignments,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_student_assignments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()



@router.get("/student/{student_id}")
async def get_student_assignment(student_id: int):
    """Get a specific student's current assignment"""
    logger.info(f"GET /api/student-assignments/student/{student_id} - Fetching student assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if student exists
        student_info = get_student_info(cursor, student_id)
        if not student_info:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Get class and section names
        class_name = None
        section_name = None
        
        if student_info['current_class_id']:
            cursor.execute("SELECT class_name FROM classes WHERE id = ?", (student_info['current_class_id'],))
            class_result = cursor.fetchone()
            class_name = class_result['class_name'] if class_result else None
        
        if student_info['current_section_id']:
            cursor.execute("SELECT section_name FROM sections WHERE id = ?", (student_info['current_section_id'],))
            section_result = cursor.fetchone()
            section_name = section_result['section_name'] if section_result else None
        
        cursor.execute("SELECT year_label FROM academic_years WHERE id = ?", (student_info['academic_year_id'],))
        year_result = cursor.fetchone()
        academic_year_label = year_result['year_label'] if year_result else None
        
        return {
            "success": True,
            "data": {
                "student_id": student_id,
                "student_number": student_info['student_number'],
                "student_name": student_info['name'],
                "class_id": student_info['current_class_id'],
                "class_name": class_name,
                "section_id": student_info['current_section_id'],
                "section_name": section_name,
                "academic_year_id": student_info['academic_year_id'],
                "academic_year_label": academic_year_label,
                "is_assigned": student_info['current_class_id'] is not None
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_student_assignment: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def assign_student(assignment: StudentAssignmentCreate):
    """Assign a student to a class and section"""
    logger.info(f"POST /api/student-assignments/ - Assigning student {assignment.student_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate student exists
        student_info = get_student_info(cursor, assignment.student_id)
        if not student_info:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Validate class exists
        if not validate_class_exists(cursor, assignment.class_id):
            raise HTTPException(status_code=400, detail="Class not found")
        
        # Validate section exists and belongs to the class
        section_details = get_section_details(cursor, assignment.section_id)
        if not section_details:
            raise HTTPException(status_code=400, detail="Section not found")
        
        if section_details['class_id'] != assignment.class_id:
            raise HTTPException(
                status_code=400, 
                detail=f"Section '{section_details['section_name']}' does not belong to the selected class"
            )
        
        # Check section capacity (excluding current student if they are already in this section)
        additional_count = 1
        if student_info['current_section_id'] == assignment.section_id:
            additional_count = 0  # Student already in this section, just updating
        
        if not check_section_capacity(cursor, assignment.section_id, additional_count):
            raise HTTPException(
                status_code=400,
                detail=f"Section '{section_details['section_name']}' has reached its capacity of {section_details['capacity']} students"
            )
        
        # Update student's class and section
        cursor.execute("""
            UPDATE students 
            SET class_id = ?, section_id = ?, updated_by = ?, updated_at = ?
            WHERE id = ?
        """, (
            assignment.class_id, assignment.section_id,
            assignment.updated_by, datetime.now().isoformat(),
            assignment.student_id
        ))
        
        conn.commit()
        
        logger.info(f"Student {assignment.student_id} assigned to class {assignment.class_id}, section {assignment.section_id}")
        
        return {
            "success": True,
            "message": "Student assigned successfully",
            "data": {
                "student_id": assignment.student_id,
                "class_id": assignment.class_id,
                "section_id": assignment.section_id,
                "class_name": section_details['class_name'],
                "section_name": section_details['section_name']
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in assign_student: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/bulk")
async def bulk_assign_students(bulk_data: BulkStudentAssignment):
    """Bulk assign multiple students to classes and sections"""
    logger.info(f"POST /api/student-assignments/bulk - Bulk assigning {len(bulk_data.assignments)} students")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        updated_count = 0
        errors = []
        
        # Group assignments by section to check capacity
        section_counts = {}
        for assignment in bulk_data.assignments:
            section_id = assignment.get('section_id')
            if section_id:
                section_counts[section_id] = section_counts.get(section_id, 0) + 1
        
        # Check capacity for each section
        for section_id, additional_count in section_counts.items():
            if not check_section_capacity(cursor, section_id, additional_count):
                section_details = get_section_details(cursor, section_id)
                errors.append(f"Section '{section_details['section_name'] if section_details else section_id}' does not have enough capacity for {additional_count} additional students")
        
        if errors:
            return {
                "success": False,
                "message": "Capacity validation failed",
                "data": {
                    "updated_count": 0,
                    "errors": errors
                },
                "timestamp": datetime.now().isoformat()
            }
        
        for assignment in bulk_data.assignments:
            try:
                student_id = assignment.get('student_id')
                class_id = assignment.get('class_id')
                section_id = assignment.get('section_id')
                updated_by = assignment.get('updated_by')
                
                # Validate student exists
                student_info = get_student_info(cursor, student_id)
                if not student_info:
                    errors.append(f"Student ID {student_id} not found")
                    continue
                
                # Validate class exists
                if not validate_class_exists(cursor, class_id):
                    errors.append(f"Class ID {class_id} not found")
                    continue
                
                # Validate section exists
                section_details = get_section_details(cursor, section_id)
                if not section_details:
                    errors.append(f"Section ID {section_id} not found")
                    continue
                
                # Validate section belongs to class
                if section_details['class_id'] != class_id:
                    errors.append(f"Section '{section_details['section_name']}' does not belong to the selected class for student {student_id}")
                    continue
                
                # Update student
                cursor.execute("""
                    UPDATE students 
                    SET class_id = ?, section_id = ?, updated_by = ?, updated_at = ?
                    WHERE id = ?
                """, (class_id, section_id, updated_by, datetime.now().isoformat(), student_id))
                
                updated_count += 1
                
            except Exception as e:
                errors.append(f"Error assigning student {assignment.get('student_id')}: {str(e)}")
        
        conn.commit()
        
        logger.info(f"Bulk assignment completed: {updated_count} updated, {len(errors)} errors")
        
        return {
            "success": True,
            "message": f"Assigned {updated_count} students successfully",
            "data": {
                "updated_count": updated_count,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in bulk_assign_students: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{student_id}")
async def update_student_assignment(student_id: int, assignment: StudentAssignmentCreate):
    """Update a student's assignment"""
    logger.info(f"PUT /api/student-assignments/{student_id} - Updating student assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Reuse the same logic as POST
        return await assign_student(assignment)
        
    except Exception as e:
        logger.error(f"Error in update_student_assignment: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{student_id}")
async def remove_student_assignment(student_id: int):
    """Remove a student's assignment (set class_id and section_id to NULL)"""
    logger.info(f"DELETE /api/student-assignments/{student_id} - Removing student assignment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate student exists
        student_info = get_student_info(cursor, student_id)
        if not student_info:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Remove assignment
        cursor.execute("""
            UPDATE students 
            SET class_id = NULL, section_id = NULL, updated_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), student_id))
        
        conn.commit()
        
        logger.info(f"Assignment removed for student {student_id}")
        
        return {
            "success": True,
            "message": "Student assignment removed successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in remove_student_assignment: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()