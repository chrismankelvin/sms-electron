from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
import traceback
import sys
import json

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

router = APIRouter(prefix="/api/report-cards", tags=["report-cards"])

# ==================== Helper Functions ====================

def get_student_info(cursor, student_id: int) -> Dict:
    """Get student information"""
    cursor.execute("""
        SELECT s.id, s.student_number, s.class_id, s.section_id,
               p.first_name, p.last_name, p.other_names,
               c.class_name, sec.section_name
        FROM students s
        JOIN person_details p ON s.person_id = p.id
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
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
            "class_id": row['class_id'],
            "class_name": row['class_name'],
            "section_id": row['section_id'],
            "section_name": row['section_name']
        }
    return None

def get_term_results_for_student(cursor, student_id: int, term_id: int) -> Dict:
    """Get term results for a student"""
    cursor.execute("""
        SELECT average_score, overall_grade, overall_grade_point,
               total_marks, total_subjects_passed, total_subjects_failed,
               position_in_class
        FROM student_term_results
        WHERE student_id = ? AND term_id = ?
    """, (student_id, term_id))
    row = cursor.fetchone()
    if row:
        return {
            "average_score": row['average_score'],
            "overall_grade": row['overall_grade'],
            "overall_grade_point": row['overall_grade_point'],
            "total_marks": row['total_marks'],
            "total_subjects_passed": row['total_subjects_passed'],
            "total_subjects_failed": row['total_subjects_failed'],
            "position_in_class": row['position_in_class']
        }
    return None

def get_subject_results_for_student(cursor, student_id: int, term_id: int) -> List[Dict]:
    """Get subject results for a student"""
    cursor.execute("""
        SELECT ssr.subject_id, s.name as subject_name,
               ssr.total_score, ssr.grade, ssr.grade_point, ssr.remark
        FROM student_subject_results ssr
        JOIN subjects s ON ssr.subject_id = s.id
        WHERE ssr.student_id = ? AND ssr.term_id = ?
        ORDER BY s.name
    """, (student_id, term_id))
    rows = cursor.fetchall()
    
    results = []
    for row in rows:
        results.append({
            "subject_id": row['subject_id'],
            "subject_name": row['subject_name'],
            "score": round(row['total_score'], 2) if row['total_score'] else 0,
            "grade": row['grade'] if row['grade'] else 'N/A',
            "grade_point": row['grade_point'] if row['grade_point'] else 0,
            "remark": row['remark'] if row['remark'] else 'N/A'
        })
    return results

# ==================== API Endpoints ====================

@router.get("/options")
async def get_report_options():
    """Get available options for report cards"""
    logger.info("GET /api/report-cards/options")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get terms
        cursor.execute("SELECT id, name FROM terms ORDER BY id")
        terms = [{"id": row['id'], "name": row['name']} for row in cursor.fetchall()]
        
        # Get academic years
        cursor.execute("SELECT id, year_label FROM academic_years ORDER BY year_label DESC")
        years = [{"id": row['id'], "label": row['year_label']} for row in cursor.fetchall()]
        
        # Get classes
        cursor.execute("SELECT id, class_name FROM classes ORDER BY class_name")
        classes = [{"id": row['id'], "name": row['class_name']} for row in cursor.fetchall()]
        
        return {
            "success": True,
            "data": {
                "terms": terms,
                "academic_years": years,
                "classes": classes
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_report_options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/students")
async def get_students_for_class(
    class_id: int = Query(..., description="Class ID")
):
    """Get all students in a class"""
    logger.info(f"GET /api/report-cards/students - class_id={class_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT s.id, s.student_number,
                   p.first_name, p.last_name, p.other_names
            FROM students s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.class_id = ? AND s.deleted_at IS NULL
            ORDER BY p.last_name, p.first_name
        """, (class_id,))
        
        rows = cursor.fetchall()
        students = []
        for row in rows:
            name = f"{row['first_name']} {row['last_name']}"
            if row['other_names']:
                name += f" ({row['other_names']})"
            students.append({
                "id": row['id'],
                "student_number": row['student_number'],
                "name": name
            })
        
        return {
            "success": True,
            "data": students,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_students_for_class: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/generate")
async def generate_report_card(
    student_id: int = Query(..., description="Student ID"),
    term_id: int = Query(..., description="Term ID"),
    class_id: int = Query(..., description="Class ID"),
    template: str = Query("standard", description="Report card template")
):
    """Generate a report card for a specific student"""
    logger.info(f"GET /api/report-cards/generate - student={student_id}, term={term_id}, class={class_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get student info
        student_info = get_student_info(cursor, student_id)
        if not student_info:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Get term results
        term_results = get_term_results_for_student(cursor, student_id, term_id)
        if not term_results:
            raise HTTPException(status_code=404, detail="Term results not found for this student")
        
        # Get subject results
        subject_results = get_subject_results_for_student(cursor, student_id, term_id)
        
        # Get term info
        cursor.execute("SELECT name FROM terms WHERE id = ?", (term_id,))
        term_row = cursor.fetchone()
        term_name = term_row['name'] if term_row else f"Term {term_id}"
        
        # Get class info for position calculation
        cursor.execute("SELECT COUNT(*) as total FROM student_term_results WHERE term_id = ? AND class_id = ?", (term_id, class_id))
        count_row = cursor.fetchone()
        total_students = count_row['total'] if count_row else 0
        
        # Calculate totals
        total_score = sum(r['score'] for r in subject_results) if subject_results else 0
        max_possible = len(subject_results) * 100
        
        report_data = {
            "student": student_info,
            "term": {
                "id": term_id,
                "name": term_name
            },
            "class": {
                "id": class_id,
                "name": student_info['class_name'],
                "section": student_info['section_name'],
                "total_students": total_students
            },
            "subjects": subject_results,
            "summary": {
                "average_score": round(term_results['average_score'], 2) if term_results['average_score'] else 0,
                "total_score": round(total_score, 2),
                "max_possible": max_possible,
                "overall_grade": term_results['overall_grade'],
                "grade_point": term_results['overall_grade_point'],
                "position_in_class": term_results['position_in_class'],
                "subjects_passed": term_results['total_subjects_passed'],
                "subjects_failed": term_results['total_subjects_failed']
            },
            "template": template,
            "generated_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "data": report_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_report_card: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/generate-all")
async def generate_all_report_cards(
    request_data: Dict[str, Any]
):
    """Generate report cards for all students in a class"""
    term_id = request_data.get('term_id')
    class_id = request_data.get('class_id')
    template = request_data.get('template', 'standard')
    
    logger.info(f"POST /api/report-cards/generate-all - term={term_id}, class={class_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all students in the class
        cursor.execute("""
            SELECT id FROM students WHERE class_id = ? AND deleted_at IS NULL
        """, (class_id,))
        students = cursor.fetchall()
        
        report_cards = []
        for student in students:
            try:
                report_data = await generate_report_card(
                    student_id=student['id'],
                    term_id=term_id,
                    class_id=class_id,
                    template=template
                )
                report_cards.append(report_data['data'])
            except Exception as e:
                logger.warning(f"Could not generate report for student {student['id']}: {str(e)}")
        
        return {
            "success": True,
            "message": f"Generated {len(report_cards)} report cards",
            "data": report_cards,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in generate_all_report_cards: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()