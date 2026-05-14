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

router = APIRouter(prefix="/api/subject-results", tags=["subject-results"])

# ==================== Helper Functions ====================

def get_grade_from_score(cursor, score: float) -> Dict[str, Any]:
    """Get grade details from grade_boundaries table"""
    cursor.execute("""
        SELECT grade, remark, grade_point 
        FROM grade_boundaries 
        WHERE min_score <= ? AND max_score >= ?
        LIMIT 1
    """, (score, score))
    result = cursor.fetchone()
    
    if result:
        return {
            "grade": result['grade'],
            "remark": result['remark'],
            "grade_point": result['grade_point']
        }
    return {
        "grade": "F",
        "remark": "Fail",
        "grade_point": 0.0
    }

def calculate_subject_results(cursor, term_id: int, class_id: int, subject_id: int) -> List[Dict]:
    """Calculate subject results for all students in a class"""
    
    # Get all students in the class
    cursor.execute("""
        SELECT s.id, s.student_number, s.section_id, sec.section_name,
               p.first_name, p.last_name, p.other_names
        FROM students s
        JOIN person_details p ON s.person_id = p.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        WHERE s.class_id = ? AND s.deleted_at IS NULL
        ORDER BY p.last_name, p.first_name
    """, (class_id,))
    
    students = cursor.fetchall()
    results = []
    
    for student in students:
        student_name = f"{student['first_name']} {student['last_name']}"
        if student['other_names']:
            student_name += f" ({student['other_names']})"
        
        # Get all scores for this student in this subject and term
        cursor.execute("""
            SELECT ss.score, a.max_score, a.weight
            FROM student_scores ss
            JOIN assessments a ON ss.assessment_id = a.id
            WHERE ss.student_id = ? 
              AND ss.subject_id = ? 
              AND ss.term_id = ?
              AND ss.is_absent = 0
              AND ss.score IS NOT NULL
        """, (student['id'], subject_id, term_id))
        
        scores = cursor.fetchall()
        
        if scores:
            # Calculate weighted total
            total_weighted_score = 0
            total_weight = 0
            
            for score in scores:
                # Convert score to percentage of max_score
                percentage = (score['score'] / score['max_score']) * 100
                weighted_contribution = (percentage * score['weight']) / 100
                total_weighted_score += weighted_contribution
                total_weight += score['weight']
            
            if total_weight > 0:
                final_score = total_weighted_score
            else:
                final_score = 0
        else:
            final_score = 0
        
        # Get grade from grade_boundaries
        grade_info = get_grade_from_score(cursor, final_score)
        
        results.append({
            "student_id": student['id'],
            "student_name": student_name,
            "student_number": student['student_number'],
            "section_id": student['section_id'],
            "section_name": student['section_name'],
            "total_score": round(final_score, 2),
            "grade": grade_info['grade'],
            "grade_point": grade_info['grade_point'],
            "remark": grade_info['remark']
        })
    
    # Calculate positions
    # Sort by total_score descending
    results.sort(key=lambda x: x['total_score'], reverse=True)
    
    # Assign class positions
    for idx, result in enumerate(results, 1):
        result['position_in_class'] = idx
    
    # Calculate section positions if sections exist
    sections = {}
    for result in results:
        section_id = result.get('section_id')
        if section_id:
            if section_id not in sections:
                sections[section_id] = []
            sections[section_id].append(result)
    
    # Assign section positions
    for section_id, section_students in sections.items():
        section_students.sort(key=lambda x: x['total_score'], reverse=True)
        for idx, student in enumerate(section_students, 1):
            student['position_in_section'] = idx
    
    # Ensure all results have position_in_section
    for result in results:
        if 'position_in_section' not in result:
            result['position_in_section'] = None
    
    return results

# ==================== API Endpoints ====================

@router.get("/")
async def get_subject_results(
    term_id: int = Query(..., description="Term ID"),
    class_id: int = Query(..., description="Class ID"),
    subject_id: int = Query(..., description="Subject ID")
):
    """Get subject results for a specific term, class, and subject"""
    logger.info(f"GET /api/subject-results/ - term_id={term_id}, class_id={class_id}, subject_id={subject_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get term details
        cursor.execute("SELECT name FROM terms WHERE id = ?", (term_id,))
        term = cursor.fetchone()
        if not term:
            raise HTTPException(status_code=404, detail="Term not found")
        
        # Get class details
        cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
        class_item = cursor.fetchone()
        if not class_item:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Get subject details
        cursor.execute("SELECT name FROM subjects WHERE id = ?", (subject_id,))
        subject = cursor.fetchone()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Calculate results
        results = calculate_subject_results(cursor, term_id, class_id, subject_id)
        
        # Get summary statistics
        total_students = len(results)
        average_score = round(sum(r['total_score'] for r in results) / total_students, 2) if total_students > 0 else 0
        highest_score = max((r['total_score'] for r in results), default=0)
        lowest_score = min((r['total_score'] for r in results), default=0)
        
        # Count students by grade
        grade_counts = {}
        for result in results:
            grade = result['grade']
            grade_counts[grade] = grade_counts.get(grade, 0) + 1
        
        return {
            "success": True,
            "data": {
                "term": {
                    "id": term_id,
                    "name": term['name']
                },
                "class": {
                    "id": class_id,
                    "name": class_item['class_name']
                },
                "subject": {
                    "id": subject_id,
                    "name": subject['name']
                },
                "summary": {
                    "total_students": total_students,
                    "average_score": average_score,
                    "highest_score": highest_score,
                    "lowest_score": lowest_score,
                    "grade_distribution": grade_counts
                },
                "results": results
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_subject_results: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/options")
async def get_filter_options():
    """Get available filter options for dropdowns"""
    logger.info("GET /api/subject-results/options - Fetching filter options")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get terms
        cursor.execute("SELECT id, name FROM terms ORDER BY id")
        terms = [{"id": row['id'], "name": row['name']} for row in cursor.fetchall()]
        
        # Get classes
        cursor.execute("SELECT id, class_name FROM classes ORDER BY class_name")
        classes = [{"id": row['id'], "name": row['class_name']} for row in cursor.fetchall()]
        
        # Get subjects
        cursor.execute("SELECT id, name FROM subjects ORDER BY name")
        subjects = [{"id": row['id'], "name": row['name']} for row in cursor.fetchall()]
        
        return {
            "success": True,
            "data": {
                "terms": terms,
                "classes": classes,
                "subjects": subjects
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_filter_options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/export/excel")
async def export_subject_results_excel(
    term_id: int = Query(...),
    class_id: int = Query(...),
    subject_id: int = Query(...)
):
    """Export subject results to Excel format"""
    # This would generate an Excel file
    # For now, return the data
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        results = calculate_subject_results(cursor, term_id, class_id, subject_id)
        
        return {
            "success": True,
            "data": results,
            "message": "Export data ready",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in export_subject_results_excel: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()