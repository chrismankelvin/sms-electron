from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
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

router = APIRouter(prefix="/api/batch-promotion", tags=["batch-promotion"])

# ==================== Pydantic Models ====================

class PromotionPreviewRequest(BaseModel):
    from_academic_year_id: int
    from_class_id: int
    to_academic_year_id: int
    to_class_id: int

class PromotionExecuteRequest(BaseModel):
    from_academic_year_id: int
    from_class_id: int
    to_academic_year_id: int
    to_class_id: int
    students: List[Dict[str, Any]]  # Each: {student_id, status, new_class_id, new_section_id}

class OverrideRequest(BaseModel):
    student_id: int
    action: str  # 'promote' or 'repeat'

# ==================== Helper Functions ====================

def get_student_promotion_status(cursor, student_id: int, term_id: int = None) -> Dict:
    """Get student's promotion status based on academic performance"""
    
    # Get student's average score for the term
    if term_id:
        cursor.execute("""
            SELECT average_score, total_subjects_failed
            FROM student_term_results
            WHERE student_id = ? AND term_id = ?
        """, (student_id, term_id))
        result = cursor.fetchone()
        
        if result:
            avg_score = result['average_score'] if result['average_score'] else 0
            failed_subjects = result['total_subjects_failed'] if result['total_subjects_failed'] else 0
            
            # Promotion rules
            if avg_score >= 50 and failed_subjects <= 2:
                status = "Promoted"
            else:
                status = "Repeat"
            
            return {
                "average_score": avg_score,
                "failed_subjects": failed_subjects,
                "status": status
            }
    
    return {
        "average_score": 0,
        "failed_subjects": 0,
        "status": "Pending"
    }

def get_next_class(cursor, current_class_id: int, next_level: bool = True) -> Optional[Dict]:
    """Get the next class for promotion"""
    cursor.execute("""
        SELECT id, class_name, level_id, academic_year_id
        FROM classes
        WHERE level_id = (SELECT level_id + 1 FROM classes WHERE id = ?)
        LIMIT 1
    """, (current_class_id,))
    row = cursor.fetchone()
    
    if row:
        return {
            "id": row['id'],
            "class_name": row['class_name'],
            "level_id": row['level_id'],
            "academic_year_id": row['academic_year_id']
        }
    return None

def get_default_section(cursor, class_id: int) -> Optional[int]:
    """Get default section for a class"""
    cursor.execute("""
        SELECT id FROM sections
        WHERE class_id = ?
        LIMIT 1
    """, (class_id,))
    row = cursor.fetchone()
    return row['id'] if row else None

def get_academic_year_label(cursor, academic_year_id: int) -> str:
    """Get academic year label"""
    cursor.execute("SELECT year_label FROM academic_years WHERE id = ?", (academic_year_id,))
    row = cursor.fetchone()
    return row['year_label'] if row else "Unknown"

def get_class_name(cursor, class_id: int) -> str:
    """Get class name"""
    cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
    row = cursor.fetchone()
    return row['class_name'] if row else "Unknown"

# ==================== API Endpoints ====================

@router.get("/options")
async def get_promotion_options():
    """Get available options for batch promotion"""
    logger.info("GET /api/batch-promotion/options")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get academic years
        cursor.execute("SELECT id, year_label FROM academic_years ORDER BY year_label DESC")
        years = [{"id": row['id'], "label": row['year_label']} for row in cursor.fetchall()]
        
        # Get classes
        cursor.execute("SELECT id, class_name, level_id FROM classes ORDER BY level_id, class_name")
        classes = [{"id": row['id'], "name": row['class_name'], "level_id": row['level_id']} for row in cursor.fetchall()]
        
        # Get current term for determining promotion rules
        cursor.execute("SELECT id, name FROM terms WHERE id = 3 OR id = (SELECT MAX(id) FROM terms) LIMIT 1")
        term = cursor.fetchone()
        current_term_id = term['id'] if term else None
        
        return {
            "success": True,
            "data": {
                "academic_years": years,
                "classes": classes,
                "current_term_id": current_term_id
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_promotion_options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/preview")
async def preview_promotion(request: PromotionPreviewRequest):
    """Preview students for promotion"""
    logger.info(f"POST /api/batch-promotion/preview - from_class={request.from_class_id}, to_class={request.to_class_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get students in the from_class
        cursor.execute("""
            SELECT s.id, s.student_number, s.academic_year_id, s.class_id, s.section_id,
                   p.first_name, p.last_name, p.other_names
            FROM students s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.class_id = ? AND s.academic_year_id = ? AND s.deleted_at IS NULL
            ORDER BY p.last_name, p.first_name
        """, (request.from_class_id, request.from_academic_year_id))
        
        students = cursor.fetchall()
        
        # Get the last term for performance evaluation
        cursor.execute("SELECT id FROM terms ORDER BY id DESC LIMIT 1")
        term_row = cursor.fetchone()
        term_id = term_row['id'] if term_row else None
        
        preview_students = []
        for student in students:
            name = f"{student['first_name']} {student['last_name']}"
            if student['other_names']:
                name += f" ({student['other_names']})"
            
            # Get promotion status
            status_info = get_student_promotion_status(cursor, student['id'], term_id)
            
            preview_students.append({
                "student_id": student['id'],
                "student_name": name,
                "student_number": student['student_number'],
                "current_class_id": student['class_id'],
                "current_section_id": student['section_id'],
                "average_score": status_info['average_score'],
                "failed_subjects": status_info['failed_subjects'],
                "status": status_info['status']
            })
        
        from_class_name = get_class_name(cursor, request.from_class_id)
        to_class_name = get_class_name(cursor, request.to_class_id)
        from_year_label = get_academic_year_label(cursor, request.from_academic_year_id)
        to_year_label = get_academic_year_label(cursor, request.to_academic_year_id)
        
        return {
            "success": True,
            "data": {
                "from_class": {
                    "id": request.from_class_id,
                    "name": from_class_name,
                    "academic_year_id": request.from_academic_year_id,
                    "academic_year_label": from_year_label
                },
                "to_class": {
                    "id": request.to_class_id,
                    "name": to_class_name,
                    "academic_year_id": request.to_academic_year_id,
                    "academic_year_label": to_year_label
                },
                "students": preview_students,
                "summary": {
                    "total_students": len(preview_students),
                    "promoted_count": sum(1 for s in preview_students if s['status'] == 'Promoted'),
                    "repeat_count": sum(1 for s in preview_students if s['status'] == 'Repeat')
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in preview_promotion: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/execute")
async def execute_promotion(request: PromotionExecuteRequest):
    """Execute batch promotion for students"""
    logger.info(f"POST /api/batch-promotion/execute - from_class={request.from_class_id}, to_class={request.to_class_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        promoted_count = 0
        repeat_count = 0
        errors = []
        
        for student_data in request.students:
            try:
                student_id = student_data.get('student_id')
                status = student_data.get('status')
                
                if status == 'Promoted':
                    # Update student to new academic year and class
                    cursor.execute("""
                        UPDATE students 
                        SET academic_year_id = ?, class_id = ?, section_id = NULL, updated_at = ?
                        WHERE id = ?
                    """, (request.to_academic_year_id, request.to_class_id, datetime.now().isoformat(), student_id))
                    promoted_count += 1
                    logger.info(f"Student {student_id} promoted to class {request.to_class_id}")
                    
                else:  # Repeat
                    # Student stays in same class but moves to next year? Or stays?
                    # For repeat, they typically stay in same class but might have a new academic year
                    cursor.execute("""
                        UPDATE students 
                        SET academic_year_id = ?, updated_at = ?
                        WHERE id = ?
                    """, (request.to_academic_year_id, datetime.now().isoformat(), student_id))
                    repeat_count += 1
                    logger.info(f"Student {student_id} will repeat")
                
            except Exception as e:
                errors.append(f"Error processing student {student_data.get('student_id')}: {str(e)}")
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Processed {promoted_count + repeat_count} students",
            "data": {
                "promoted_count": promoted_count,
                "repeat_count": repeat_count,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in execute_promotion: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()