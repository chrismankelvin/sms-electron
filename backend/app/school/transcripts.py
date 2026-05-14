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

# router = APIRouter(prefix="/api/transcripts", tags=["transcripts"])

# # ==================== Helper Functions ====================

# def get_student_info(cursor, student_id: int) -> Dict:
#     """Get student information"""
#     cursor.execute("""
#         SELECT s.id, s.student_number, s.enrolled_at,
#                p.first_name, p.last_name, p.other_names, p.date_of_birth,
#                c.class_name, pr.name as programme_name
#         FROM students s
#         JOIN person_details p ON s.person_id = p.id
#         LEFT JOIN classes c ON s.class_id = c.id
#         LEFT JOIN programmes pr ON c.programme_id = pr.id
#         WHERE s.id = ? AND s.deleted_at IS NULL
#     """, (student_id,))
#     row = cursor.fetchone()
#     if row:
#         name = f"{row['first_name']} {row['last_name']}"
#         if row['other_names']:
#             name += f" ({row['other_names']})"
#         return {
#             "id": row['id'],
#             "student_number": row['student_number'],
#             "name": name,
#             "date_of_birth": row['date_of_birth'],
#             "enrolled_at": row['enrolled_at'],
#             "current_class": row['class_name'],
#             "programme": row['programme_name'] or "General"
#         }
#     return None

# def get_all_terms_for_student(cursor, student_id: int) -> List[Dict]:
#     """Get all terms that a student has results for"""
#     cursor.execute("""
#         SELECT DISTINCT t.id, t.name, str.academic_year_id, ay.year_label
#         FROM student_term_results str
#         JOIN terms t ON str.term_id = t.id
#         JOIN academic_years ay ON str.academic_year_id = ay.id
#         WHERE str.student_id = ?
#         ORDER BY ay.year_label, t.id
#     """, (student_id,))
    
#     rows = cursor.fetchall()
#     terms = []
#     for row in rows:
#         terms.append({
#             "id": row['id'],
#             "name": row['name'],
#             "academic_year_id": row['academic_year_id'],
#             "academic_year_label": row['year_label']
#         })
#     return terms

# def get_term_subject_results(cursor, student_id: int, term_id: int, academic_year_id: int) -> List[Dict]:
#     """Get subject results for a specific term"""
#     cursor.execute("""
#         SELECT ssr.subject_id, s.name as subject_name,
#                ssr.total_score, ssr.grade, ssr.grade_point
#         FROM student_subject_results ssr
#         JOIN subjects s ON ssr.subject_id = s.id
#         WHERE ssr.student_id = ? AND ssr.term_id = ? AND ssr.academic_year_id = ?
#         ORDER BY s.name
#     """, (student_id, term_id, academic_year_id))
    
#     rows = cursor.fetchall()
#     results = []
#     for row in rows:
#         results.append({
#             "subject_id": row['subject_id'],
#             "subject_name": row['subject_name'],
#             "score": round(row['total_score'], 2) if row['total_score'] else 0,
#             "grade": row['grade'] if row['grade'] else 'N/A',
#             "grade_point": row['grade_point'] if row['grade_point'] else 0
#         })
#     return results

# def get_term_summary(cursor, student_id: int, term_id: int, academic_year_id: int) -> Dict:
#     """Get term summary for a student"""
#     cursor.execute("""
#         SELECT average_score, overall_grade, overall_grade_point,
#                total_marks, total_subjects_passed, total_subjects_failed
#         FROM student_term_results
#         WHERE student_id = ? AND term_id = ? AND academic_year_id = ?
#     """, (student_id, term_id, academic_year_id))
    
#     row = cursor.fetchone()
#     if row:
#         return {
#             "average_score": round(row['average_score'], 2) if row['average_score'] else 0,
#             "overall_grade": row['overall_grade'] if row['overall_grade'] else 'N/A',
#             "grade_point": row['overall_grade_point'] if row['overall_grade_point'] else 0,
#             "total_marks": row['total_marks'] if row['total_marks'] else 0,
#             "subjects_passed": row['total_subjects_passed'] if row['total_subjects_passed'] else 0,
#             "subjects_failed": row['total_subjects_failed'] if row['total_subjects_failed'] else 0
#         }
#     return None

# def calculate_cumulative_gpa(term_results: List[Dict]) -> float:
#     """Calculate cumulative GPA from term results"""
#     if not term_results:
#         return 0
#     total_gpa = sum(t['grade_point'] for t in term_results)
#     return total_gpa / len(term_results)

# def calculate_total_credits(subject_results: List[List[Dict]]) -> int:
#     """Calculate total credits (simplified - each subject = 3 credits)"""
#     total = 0
#     for term_subjects in subject_results:
#         total += len(term_subjects) * 3
#     return total

# # ==================== API Endpoints ====================

# @router.get("/students")
# async def get_students_for_transcript():
#     """Get all students for transcript selection"""
#     logger.info("GET /api/transcripts/students")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT s.id, s.student_number,
#                    p.first_name, p.last_name, p.other_names
#             FROM students s
#             JOIN person_details p ON s.person_id = p.id
#             WHERE s.deleted_at IS NULL
#             ORDER BY p.last_name, p.first_name
#         """)
        
#         rows = cursor.fetchall()
#         students = []
#         for row in rows:
#             name = f"{row['first_name']} {row['last_name']}"
#             if row['other_names']:
#                 name += f" ({row['other_names']})"
#             students.append({
#                 "id": row['id'],
#                 "student_number": row['student_number'],
#                 "name": name
#             })
        
#         return {
#             "success": True,
#             "data": students,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_students_for_transcript: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/generate")
# async def generate_transcript(
#     student_id: int = Query(..., description="Student ID")
# ):
#     """Generate a complete academic transcript for a student"""
#     logger.info(f"GET /api/transcripts/generate - student_id={student_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get student info
#         student_info = get_student_info(cursor, student_id)
#         if not student_info:
#             raise HTTPException(status_code=404, detail="Student not found")
        
#         # Get all terms for this student
#         terms = get_all_terms_for_student(cursor, student_id)
        
#         if not terms:
#             return {
#                 "success": True,
#                 "data": {
#                     "student": student_info,
#                     "terms": [],
#                     "summary": {
#                         "total_credits": 0,
#                         "cumulative_gpa": 0,
#                         "graduation_status": "No results available"
#                     }
#                 },
#                 "timestamp": datetime.now().isoformat()
#             }
        
#         # Get results for each term
#         transcript_terms = []
#         term_summaries = []
#         all_subject_results = []
        
#         for term in terms:
#             subject_results = get_term_subject_results(
#                 cursor, student_id, term['id'], term['academic_year_id']
#             )
#             term_summary = get_term_summary(
#                 cursor, student_id, term['id'], term['academic_year_id']
#             )
            
#             if subject_results and term_summary:
#                 transcript_terms.append({
#                     "academic_year": term['academic_year_label'],
#                     "term_name": term['name'],
#                     "subjects": subject_results,
#                     "gpa": term_summary['grade_point'],
#                     "average_score": term_summary['average_score'],
#                     "overall_grade": term_summary['overall_grade']
#                 })
#                 term_summaries.append(term_summary)
#                 all_subject_results.append(subject_results)
        
#         # Calculate cumulative statistics
#         cumulative_gpa = calculate_cumulative_gpa(term_summaries)
#         total_credits = calculate_total_credits(all_subject_results)
        
#         # Determine graduation status (simplified)
#         graduation_status = "In Progress"
#         if len(transcript_terms) >= 6:  # Assuming 6 terms total
#             if cumulative_gpa >= 2.0:
#                 graduation_status = "Graduated - Eligible"
#             else:
#                 graduation_status = "Graduated - Conditional"
        
#         return {
#             "success": True,
#             "data": {
#                 "student": student_info,
#                 "terms": transcript_terms,
#                 "summary": {
#                     "total_credits": total_credits,
#                     "cumulative_gpa": round(cumulative_gpa, 2),
#                     "graduation_status": graduation_status,
#                     "total_terms": len(transcript_terms)
#                 }
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in generate_transcript: {str(e)}")
#         logger.error(traceback.format_exc())
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

router = APIRouter(prefix="/api/transcripts", tags=["transcripts"])

# ==================== Helper Functions ====================

def get_student_info(cursor, student_id: int) -> Dict:
    """Get student information"""
    cursor.execute("""
        SELECT s.id, s.student_number, s.enrolled_at,
               p.first_name, p.last_name, p.other_names, p.date_of_birth,
               c.class_name, pr.name as programme_name
        FROM students s
        JOIN person_details p ON s.person_id = p.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN programmes pr ON c.programme_id = pr.id
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
            "date_of_birth": row['date_of_birth'],
            "enrolled_at": row['enrolled_at'],
            "current_class": row['class_name'],
            "programme": row['programme_name'] or "General"
        }
    return None

def get_all_terms_for_student(cursor, student_id: int) -> List[Dict]:
    """Get all terms that a student has results for"""
    cursor.execute("""
        SELECT DISTINCT t.id, t.name, str.class_id, c.academic_year_id, ay.year_label
        FROM student_term_results str
        JOIN terms t ON str.term_id = t.id
        JOIN classes c ON str.class_id = c.id
        JOIN academic_years ay ON c.academic_year_id = ay.id
        WHERE str.student_id = ?
        ORDER BY ay.year_label, t.id
    """, (student_id,))
    
    rows = cursor.fetchall()
    terms = []
    for row in rows:
        terms.append({
            "id": row['id'],
            "name": row['name'],
            "class_id": row['class_id'],
            "academic_year_id": row['academic_year_id'],
            "academic_year_label": row['year_label']
        })
    return terms

def get_term_subject_results(cursor, student_id: int, term_id: int) -> List[Dict]:
    """Get subject results for a specific term"""
    cursor.execute("""
        SELECT ssr.subject_id, s.name as subject_name,
               ssr.total_score, ssr.grade, ssr.grade_point
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
            "grade_point": row['grade_point'] if row['grade_point'] else 0
        })
    return results

def get_term_summary(cursor, student_id: int, term_id: int) -> Dict:
    """Get term summary for a student"""
    cursor.execute("""
        SELECT average_score, overall_grade, overall_grade_point,
               total_marks, total_subjects_passed, total_subjects_failed
        FROM student_term_results
        WHERE student_id = ? AND term_id = ?
    """, (student_id, term_id))
    
    row = cursor.fetchone()
    if row:
        return {
            "average_score": round(row['average_score'], 2) if row['average_score'] else 0,
            "overall_grade": row['overall_grade'] if row['overall_grade'] else 'N/A',
            "grade_point": row['overall_grade_point'] if row['overall_grade_point'] else 0,
            "total_marks": row['total_marks'] if row['total_marks'] else 0,
            "subjects_passed": row['total_subjects_passed'] if row['total_subjects_passed'] else 0,
            "subjects_failed": row['total_subjects_failed'] if row['total_subjects_failed'] else 0
        }
    return None

def calculate_cumulative_gpa(term_results: List[Dict]) -> float:
    """Calculate cumulative GPA from term results"""
    if not term_results:
        return 0
    total_gpa = sum(t.get('grade_point', 0) for t in term_results)
    return total_gpa / len(term_results)

def calculate_total_credits(subject_results: List[List[Dict]]) -> int:
    """Calculate total credits (simplified - each subject = 3 credits)"""
    total = 0
    for term_subjects in subject_results:
        total += len(term_subjects) * 3
    return total

# ==================== API Endpoints ====================

@router.get("/students")
async def get_students_for_transcript():
    """Get all students for transcript selection"""
    logger.info("GET /api/transcripts/students")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT s.id, s.student_number,
                   p.first_name, p.last_name, p.other_names
            FROM students s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.deleted_at IS NULL
            ORDER BY p.last_name, p.first_name
        """)
        
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
        logger.error(f"Error in get_students_for_transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/generate")
async def generate_transcript(
    student_id: int = Query(..., description="Student ID")
):
    """Generate a complete academic transcript for a student"""
    logger.info(f"GET /api/transcripts/generate - student_id={student_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get student info
        student_info = get_student_info(cursor, student_id)
        if not student_info:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Get all terms for this student
        terms = get_all_terms_for_student(cursor, student_id)
        
        if not terms:
            return {
                "success": True,
                "data": {
                    "student": student_info,
                    "terms": [],
                    "summary": {
                        "total_credits": 0,
                        "cumulative_gpa": 0,
                        "graduation_status": "No results available"
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
        
        # Get results for each term
        transcript_terms = []
        term_summaries = []
        all_subject_results = []
        
        for term in terms:
            subject_results = get_term_subject_results(
                cursor, student_id, term['id']
            )
            term_summary = get_term_summary(
                cursor, student_id, term['id']
            )
            
            if subject_results and term_summary:
                transcript_terms.append({
                    "academic_year": term['academic_year_label'],
                    "term_name": term['name'],
                    "subjects": subject_results,
                    "gpa": term_summary['grade_point'],
                    "average_score": term_summary['average_score'],
                    "overall_grade": term_summary['overall_grade']
                })
                term_summaries.append(term_summary)
                all_subject_results.append(subject_results)
        
        # Calculate cumulative statistics
        cumulative_gpa = calculate_cumulative_gpa(term_summaries)
        total_credits = calculate_total_credits(all_subject_results)
        
        # Determine graduation status (simplified)
        graduation_status = "In Progress"
        if len(transcript_terms) >= 6:  # Assuming 6 terms total
            if cumulative_gpa >= 2.0:
                graduation_status = "Graduated - Eligible"
            else:
                graduation_status = "Graduated - Conditional"
        
        return {
            "success": True,
            "data": {
                "student": student_info,
                "terms": transcript_terms,
                "summary": {
                    "total_credits": total_credits,
                    "cumulative_gpa": round(cumulative_gpa, 2),
                    "graduation_status": graduation_status,
                    "total_terms": len(transcript_terms)
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_transcript: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()