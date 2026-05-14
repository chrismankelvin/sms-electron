# from fastapi import APIRouter, HTTPException, Query
# from pydantic import BaseModel
# from typing import Optional, List, Dict, Any
# from datetime import datetime
# import logging
# import traceback
# import sys

# from app.activation.state import get_db_connection

# # Configure logging
# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)

# if not logger.handlers:
#     console_handler = logging.StreamHandler(sys.stdout)
#     console_handler.setLevel(logging.DEBUG)
#     formatter = logging.Formatter(
#         '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
#     )
#     console_handler.setFormatter(formatter)
#     logger.addHandler(console_handler)

# router = APIRouter(prefix="/api/term-results", tags=["term-results"])

# # ==================== Helper Functions ====================

# def get_grade_from_score(cursor, score: float) -> Dict[str, Any]:
#     """Get grade details from grade_boundaries table"""
#     cursor.execute("""
#         SELECT grade, remark, grade_point 
#         FROM grade_boundaries 
#         WHERE min_score <= ? AND max_score >= ?
#         LIMIT 1
#     """, (score, score))
#     result = cursor.fetchone()
    
#     if result:
#         return {
#             "grade": result['grade'],
#             "remark": result['remark'],
#             "grade_point": result['grade_point']
#         }
#     return {
#         "grade": "F",
#         "remark": "Fail",
#         "grade_point": 0.0
#     }

# # ==================== API Endpoints ====================

# @router.get("/")
# async def get_term_results(
#     term_id: int = Query(..., description="Term ID"),
#     class_id: int = Query(..., description="Class ID")
# ):
#     """Get term results for a specific term and class"""
#     logger.info(f"GET /api/term-results/ - term_id={term_id}, class_id={class_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get term details
#         cursor.execute("SELECT id, name FROM terms WHERE id = ?", (term_id,))
#         term = cursor.fetchone()
#         if not term:
#             raise HTTPException(status_code=404, detail="Term not found")
        
#         # Get class details
#         cursor.execute("SELECT id, class_name FROM classes WHERE id = ?", (class_id,))
#         class_item = cursor.fetchone()
#         if not class_item:
#             raise HTTPException(status_code=404, detail="Class not found")
        
#         # Get term results for all students in the class
#         cursor.execute("""
#             SELECT str.*, 
#                    p.first_name, p.last_name, p.other_names,
#                    s.section_id, sec.section_name
#             FROM student_term_results str
#             JOIN students s ON str.student_id = s.id
#             JOIN person_details p ON s.person_id = p.id
#             LEFT JOIN sections sec ON s.section_id = sec.id
#             WHERE str.term_id = ? AND str.class_id = ?
#             ORDER BY str.average_score DESC
#         """, (term_id, class_id))
        
#         results = cursor.fetchall()
        
#         if not results:
#             return {
#                 "success": True,
#                 "data": {
#                     "term": {"id": term_id, "name": term['name']},
#                     "class": {"id": class_id, "name": class_item['class_name']},
#                     "summary": {
#                         "total_students": 0,
#                         "class_average": 0,
#                         "pass_rate": 0,
#                         "highest_average": 0,
#                         "lowest_average": 0
#                     },
#                     "results": []
#                 },
#                 "timestamp": datetime.now().isoformat()
#             }
        
#         # Calculate summary statistics
#         total_students = len(results)
#         total_average = sum(r['average_score'] for r in results)
#         class_average = total_average / total_students if total_students > 0 else 0
#         pass_count = sum(1 for r in results if r['average_score'] >= 50)
#         pass_rate = (pass_count / total_students) * 100 if total_students > 0 else 0
#         highest_average = max(r['average_score'] for r in results)
#         lowest_average = min(r['average_score'] for r in results)
        
#         # Format results
#         formatted_results = []
#         for idx, row in enumerate(results, 1):
#             student_name = f"{row['first_name']} {row['last_name']}"
#             if row['other_names']:
#                 student_name += f" ({row['other_names']})"
            
#             formatted_results.append({
#                 "student_id": row['student_id'],
#                 "student_name": student_name,
#                 "average_score": round(row['average_score'], 2),
#                 "overall_grade": row['overall_grade'],
#                 "overall_grade_point": row['overall_grade_point'],
#                 "position_in_class": idx,
#                 "position_in_section": row.get('position_in_section'),
#                 "section_name": row.get('section_name'),
#                 "total_marks": row['total_marks'],
#                 "total_subjects_passed": row['total_subjects_passed'],
#                 "total_subjects_failed": row['total_subjects_failed'],
#                 "published_at": row['published_at']
#             })
        
#         return {
#             "success": True,
#             "data": {
#                 "term": {"id": term_id, "name": term['name']},
#                 "class": {"id": class_id, "name": class_item['class_name']},
#                 "summary": {
#                     "total_students": total_students,
#                     "class_average": round(class_average, 2),
#                     "pass_rate": round(pass_rate, 2),
#                     "highest_average": round(highest_average, 2),
#                     "lowest_average": round(lowest_average, 2),
#                     "pass_count": pass_count,
#                     "fail_count": total_students - pass_count
#                 },
#                 "results": formatted_results
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_term_results: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/options")
# async def get_term_options():
#     """Get available options for term results"""
#     logger.info("GET /api/term-results/options")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get terms
#         cursor.execute("SELECT id, name FROM terms ORDER BY id")
#         terms = [{"id": row['id'], "name": row['name']} for row in cursor.fetchall()]
        
#         # Get classes
#         cursor.execute("SELECT id, class_name FROM classes ORDER BY class_name")
#         classes = [{"id": row['id'], "name": row['class_name']} for row in cursor.fetchall()]
        
#         return {
#             "success": True,
#             "data": {
#                 "terms": terms,
#                 "classes": classes
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_term_options: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/export/excel")
# async def export_term_results_excel(
#     term_id: int = Query(...),
#     class_id: int = Query(...)
# ):
#     """Export term results to Excel format"""
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get results
#         cursor.execute("""
#             SELECT str.*, 
#                    p.first_name, p.last_name, p.other_names,
#                    s.student_number
#             FROM student_term_results str
#             JOIN students s ON str.student_id = s.id
#             JOIN person_details p ON s.person_id = p.id
#             WHERE str.term_id = ? AND str.class_id = ?
#             ORDER BY str.average_score DESC
#         """, (term_id, class_id))
        
#         results = cursor.fetchall()
        
#         export_data = []
#         for idx, row in enumerate(results, 1):
#             student_name = f"{row['first_name']} {row['last_name']}"
#             if row['other_names']:
#                 student_name += f" ({row['other_names']})"
            
#             export_data.append({
#                 "Position": idx,
#                 "Student Name": student_name,
#                 "Student Number": row['student_number'],
#                 "Average Score": round(row['average_score'], 2),
#                 "Grade": row['overall_grade'],
#                 "Grade Point": row['overall_grade_point'],
#                 "Total Marks": row['total_marks'],
#                 "Subjects Passed": row['total_subjects_passed'],
#                 "Subjects Failed": row['total_subjects_failed']
#             })
        
#         return {
#             "success": True,
#             "data": export_data,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in export_term_results_excel: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()










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

router = APIRouter(prefix="/api/term-results", tags=["term-results"])

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

# ==================== API Endpoints ====================

@router.get("/")
async def get_term_results(
    term_id: int = Query(..., description="Term ID"),
    class_id: int = Query(..., description="Class ID")
):
    """Get term results for a specific term and class"""
    logger.info(f"GET /api/term-results/ - term_id={term_id}, class_id={class_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get term details
        cursor.execute("SELECT id, name FROM terms WHERE id = ?", (term_id,))
        term_row = cursor.fetchone()
        if not term_row:
            raise HTTPException(status_code=404, detail="Term not found")
        term = {"id": term_row['id'], "name": term_row['name']}
        
        # Get class details
        cursor.execute("SELECT id, class_name FROM classes WHERE id = ?", (class_id,))
        class_row = cursor.fetchone()
        if not class_row:
            raise HTTPException(status_code=404, detail="Class not found")
        class_info = {"id": class_row['id'], "name": class_row['class_name']}
        
        # Get term results for all students in the class
        cursor.execute("""
            SELECT 
                str.student_id,
                str.total_marks,
                str.average_score,
                str.overall_grade,
                str.overall_grade_point,
                str.total_subjects_passed,
                str.total_subjects_failed,
                str.published_at,
                p.first_name,
                p.last_name,
                p.other_names,
                s.section_id,
                sec.section_name
            FROM student_term_results str
            JOIN students s ON str.student_id = s.id
            JOIN person_details p ON s.person_id = p.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE str.term_id = ? AND str.class_id = ?
            ORDER BY str.average_score DESC
        """, (term_id, class_id))
        
        rows = cursor.fetchall()
        results = []
        
        for row in rows:
            # Build student name
            student_name = f"{row['first_name']} {row['last_name']}"
            if row['other_names']:
                student_name += f" ({row['other_names']})"
            
            results.append({
                "student_id": row['student_id'],
                "student_name": student_name,
                "average_score": round(row['average_score'], 2) if row['average_score'] else 0,
                "overall_grade": row['overall_grade'] if row['overall_grade'] else 'N/A',
                "overall_grade_point": row['overall_grade_point'] if row['overall_grade_point'] else 0,
                "total_marks": row['total_marks'] if row['total_marks'] else 0,
                "total_subjects_passed": row['total_subjects_passed'] if row['total_subjects_passed'] else 0,
                "total_subjects_failed": row['total_subjects_failed'] if row['total_subjects_failed'] else 0,
                "section_id": row['section_id'],
                "section_name": row['section_name'],
                "published_at": row['published_at']
            })
        
        # Calculate summary statistics
        total_students = len(results)
        
        if total_students > 0:
            total_average = sum(r['average_score'] for r in results)
            class_average = total_average / total_students
            pass_count = sum(1 for r in results if r['average_score'] >= 50)
            pass_rate = (pass_count / total_students) * 100
            highest_average = max(r['average_score'] for r in results)
            lowest_average = min(r['average_score'] for r in results)
        else:
            class_average = 0
            pass_rate = 0
            highest_average = 0
            lowest_average = 0
            pass_count = 0
        
        # Add positions
        for idx, result in enumerate(results, 1):
            result['position_in_class'] = idx
        
        return {
            "success": True,
            "data": {
                "term": term,
                "class": class_info,
                "summary": {
                    "total_students": total_students,
                    "class_average": round(class_average, 2),
                    "pass_rate": round(pass_rate, 2),
                    "highest_average": round(highest_average, 2),
                    "lowest_average": round(lowest_average, 2),
                    "pass_count": pass_count,
                    "fail_count": total_students - pass_count
                },
                "results": results
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_term_results: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/options")
async def get_term_options():
    """Get available options for term results"""
    logger.info("GET /api/term-results/options")
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
        
        return {
            "success": True,
            "data": {
                "terms": terms,
                "classes": classes
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_term_options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/export/excel")
async def export_term_results_excel(
    term_id: int = Query(...),
    class_id: int = Query(...)
):
    """Export term results to Excel format"""
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get results
        cursor.execute("""
            SELECT 
                str.average_score,
                str.overall_grade,
                str.overall_grade_point,
                str.total_marks,
                str.total_subjects_passed,
                str.total_subjects_failed,
                p.first_name,
                p.last_name,
                p.other_names,
                s.student_number
            FROM student_term_results str
            JOIN students s ON str.student_id = s.id
            JOIN person_details p ON s.person_id = p.id
            WHERE str.term_id = ? AND str.class_id = ?
            ORDER BY str.average_score DESC
        """, (term_id, class_id))
        
        rows = cursor.fetchall()
        
        export_data = []
        for idx, row in enumerate(rows, 1):
            student_name = f"{row['first_name']} {row['last_name']}"
            if row['other_names']:
                student_name += f" ({row['other_names']})"
            
            export_data.append({
                "Position": idx,
                "Student Name": student_name,
                "Student Number": row['student_number'],
                "Average Score": round(row['average_score'], 2) if row['average_score'] else 0,
                "Grade": row['overall_grade'] if row['overall_grade'] else 'N/A',
                "Grade Point": row['overall_grade_point'] if row['overall_grade_point'] else 0,
                "Total Marks": row['total_marks'] if row['total_marks'] else 0,
                "Subjects Passed": row['total_subjects_passed'] if row['total_subjects_passed'] else 0,
                "Subjects Failed": row['total_subjects_failed'] if row['total_subjects_failed'] else 0
            })
        
        return {
            "success": True,
            "data": export_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in export_term_results_excel: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()