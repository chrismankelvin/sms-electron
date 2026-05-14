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

router = APIRouter(prefix="/api/process-results", tags=["process-results"])

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

def calculate_subject_results_for_class(cursor, term_id: int, class_id: int, subject_id: int):
    """Calculate subject results for a specific class and subject"""
    
    # Get all students in the class
    cursor.execute("""
        SELECT s.id, s.student_number, s.section_id
        FROM students s
        WHERE s.class_id = ? AND s.deleted_at IS NULL
    """, (class_id,))
    
    students = cursor.fetchall()
    results = []
    
    for student in students:
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
            total_weighted_score = 0
            total_weight = 0
            
            for score in scores:
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
        
        grade_info = get_grade_from_score(cursor, final_score)
        
        results.append({
            "student_id": student['id'],
            "total_score": round(final_score, 2),
            "grade": grade_info['grade'],
            "grade_point": grade_info['grade_point'],
            "remark": grade_info['remark']
        })
    
    return results

def calculate_term_results_for_student(cursor, student_id: int, term_id: int, class_id: int):
    """Calculate term results for a specific student"""
    
    # Get all subjects for this class/term that have been calculated
    cursor.execute("""
        SELECT ssr.*, s.name as subject_name
        FROM student_subject_results ssr
        JOIN subjects s ON ssr.subject_id = s.id
        WHERE ssr.student_id = ? AND ssr.term_id = ? AND ssr.class_id = ?
    """, (student_id, term_id, class_id))
    
    subject_results = cursor.fetchall()
    
    if not subject_results:
        return None
    
    total_marks = sum(r['total_score'] for r in subject_results)
    average_score = total_marks / len(subject_results)
    grade_info = get_grade_from_score(cursor, average_score)
    
    passed = sum(1 for r in subject_results if r['grade'] and r['grade'] != 'F')
    failed = len(subject_results) - passed
    
    return {
        "student_id": student_id,
        "total_marks": round(total_marks, 2),
        "average_score": round(average_score, 2),
        "overall_grade": grade_info['grade'],
        "overall_grade_point": grade_info['grade_point'],
        "total_subjects_passed": passed,
        "total_subjects_failed": failed
    }

# ==================== API Endpoints ====================

@router.get("/options")
async def get_process_options():
    """Get available options for processing results"""
    logger.info("GET /api/process-results/options")
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
        
        # Get subjects
        cursor.execute("SELECT id, name FROM subjects ORDER BY name")
        subjects = [{"id": row['id'], "name": row['name']} for row in cursor.fetchall()]
        
        return {
            "success": True,
            "data": {
                "terms": terms,
                "academic_years": years,
                "classes": classes,
                "subjects": subjects
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_process_options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# @router.post("/calculate-subjects")
# async def calculate_subject_results(
#     term_id: int,
#     class_id: int,
#     subject_id: Optional[int] = None
# ):
#     """Calculate subject results for a class"""
#     logger.info(f"POST /api/process-results/calculate-subjects - term={term_id}, class={class_id}, subject={subject_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get subjects to process
#         if subject_id:
#             subjects = [(subject_id,)]
#         else:
#             cursor.execute("SELECT id FROM subjects")
#             subjects = cursor.fetchall()
        
#         total_subjects = len(subjects)
#         subjects_calculated = 0
#         students_processed = 0
#         errors = []
        
#         for (subj_id,) in subjects:
#             try:
#                 # Calculate results for this subject
#                 results = calculate_subject_results_for_class(cursor, term_id, class_id, subj_id)
                
#                 # Save to student_subject_results table
#                 for result in results:
#                     cursor.execute("""
#                         INSERT INTO student_subject_results (
#                             student_id, subject_id, term_id, class_id,
#                             total_score, grade, grade_point, remark, computed_at
#                         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
#                         ON CONFLICT(student_id, subject_id, term_id) DO UPDATE SET
#                             total_score = excluded.total_score,
#                             grade = excluded.grade,
#                             grade_point = excluded.grade_point,
#                             remark = excluded.remark,
#                             computed_at = excluded.computed_at
#                     """, (
#                         result['student_id'], subj_id, term_id, class_id,
#                         result['total_score'], result['grade'],
#                         result['grade_point'], result['remark'],
#                         datetime.now().isoformat()
#                     ))
#                     students_processed += 1
                
#                 subjects_calculated += 1
                
#             except Exception as e:
#                 errors.append(f"Subject {subj_id}: {str(e)}")
        
#         conn.commit()
        
#         return {
#             "success": True,
#             "message": f"Calculated {subjects_calculated} subjects",
#             "data": {
#                 "subjects_calculated": subjects_calculated,
#                 "total_subjects": total_subjects,
#                 "students_processed": students_processed,
#                 "errors": errors
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in calculate_subject_results: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
# Update the calculate_subject_results endpoint in app/school/process_results.py

@router.post("/calculate-subjects")
async def calculate_subject_results(
    request_data: Dict[str, Any]
):
    """Calculate subject results for a class"""
    term_id = request_data.get('term_id')
    class_id = request_data.get('class_id')
    subject_id = request_data.get('subject_id')  # This can be None
    
    logger.info(f"POST /api/process-results/calculate-subjects - term={term_id}, class={class_id}, subject={subject_id}")
    conn = None
    
    # Validate required fields
    if not term_id:
        raise HTTPException(status_code=400, detail="term_id is required")
    if not class_id:
        raise HTTPException(status_code=400, detail="class_id is required")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get subjects to process
        if subject_id:
            # Process only the specified subject
            cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
            subjects = cursor.fetchall()
            if not subjects:
                raise HTTPException(status_code=404, detail=f"Subject with id {subject_id} not found")
        else:
            # Process all subjects
            cursor.execute("SELECT id FROM subjects")
            subjects = cursor.fetchall()
        
        total_subjects = len(subjects)
        subjects_calculated = 0
        total_students_processed = 0
        errors = []
        
        for (subj_id,) in subjects:
            try:
                # Get all students in the class
                cursor.execute("""
                    SELECT s.id, s.student_number, s.section_id
                    FROM students s
                    WHERE s.class_id = ? AND s.deleted_at IS NULL
                """, (class_id,))
                
                students = cursor.fetchall()
                students_processed = 0
                
                for student in students:
                    try:
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
                        """, (student['id'], subj_id, term_id))
                        
                        scores = cursor.fetchall()
                        
                        if scores:
                            total_weighted_score = 0
                            total_weight = 0
                            
                            for score_data in scores:
                                percentage = (score_data['score'] / score_data['max_score']) * 100
                                weighted_contribution = (percentage * score_data['weight']) / 100
                                total_weighted_score += weighted_contribution
                                total_weight += score_data['weight']
                            
                            if total_weight > 0:
                                final_score = total_weighted_score
                            else:
                                final_score = 0
                        else:
                            final_score = 0
                        
                        # Get grade from grade_boundaries
                        grade_info = get_grade_from_score(cursor, final_score)
                        
                        # Save to student_subject_results table
                        cursor.execute("""
                            INSERT INTO student_subject_results (
                                student_id, subject_id, term_id, class_id,
                                total_score, grade, grade_point, remark, computed_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(student_id, subject_id, term_id) DO UPDATE SET
                                total_score = excluded.total_score,
                                grade = excluded.grade,
                                grade_point = excluded.grade_point,
                                remark = excluded.remark,
                                computed_at = excluded.computed_at
                        """, (
                            student['id'], subj_id, term_id, class_id,
                            round(final_score, 2), grade_info['grade'],
                            grade_info['grade_point'], grade_info['remark'],
                            datetime.now().isoformat()
                        ))
                        students_processed += 1
                        
                    except Exception as e:
                        errors.append(f"Student {student['id']}: {str(e)}")
                
                subjects_calculated += 1
                total_students_processed += students_processed
                
            except Exception as e:
                errors.append(f"Subject {subj_id}: {str(e)}")
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Calculated {subjects_calculated} subjects",
            "data": {
                "subjects_calculated": subjects_calculated,
                "total_subjects": total_subjects,
                "students_processed": total_students_processed,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in calculate_subject_results: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()





# @router.post("/calculate-term")
# async def calculate_term_results(
#     term_id: int,
#     class_id: int
# ):
#     """Calculate term results for a class"""
#     logger.info(f"POST /api/process-results/calculate-term - term={term_id}, class={class_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get all students in the class
#         cursor.execute("""
#             SELECT id FROM students WHERE class_id = ? AND deleted_at IS NULL
#         """, (class_id,))
#         students = cursor.fetchall()
        
#         total_students = len(students)
#         students_processed = 0
#         errors = []
        
#         for student in students:
#             try:
#                 term_result = calculate_term_results_for_student(
#                     cursor, student['id'], term_id, class_id
#                 )
                
#                 if term_result:
#                     cursor.execute("""
#                         INSERT INTO student_term_results (
#                             student_id, class_id, term_id, total_marks, average_score,
#                             overall_grade, overall_grade_point, total_subjects_passed,
#                             total_subjects_failed, computed_at
#                         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#                         ON CONFLICT(student_id, term_id) DO UPDATE SET
#                             total_marks = excluded.total_marks,
#                             average_score = excluded.average_score,
#                             overall_grade = excluded.overall_grade,
#                             overall_grade_point = excluded.overall_grade_point,
#                             total_subjects_passed = excluded.total_subjects_passed,
#                             total_subjects_failed = excluded.total_subjects_failed,
#                             computed_at = excluded.computed_at
#                     """, (
#                         student['id'], class_id, term_id,
#                         term_result['total_marks'], term_result['average_score'],
#                         term_result['overall_grade'], term_result['overall_grade_point'],
#                         term_result['total_subjects_passed'], term_result['total_subjects_failed'],
#                         datetime.now().isoformat()
#                     ))
#                     students_processed += 1
                
#             except Exception as e:
#                 errors.append(f"Student {student['id']}: {str(e)}")
        
#         conn.commit()
        
#         return {
#             "success": True,
#             "message": f"Calculated term results for {students_processed} students",
#             "data": {
#                 "students_processed": students_processed,
#                 "total_students": total_students,
#                 "errors": errors
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in calculate_term_results: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
@router.post("/calculate-term")
async def calculate_term_results(
    request_data: Dict[str, Any]
):
    """Calculate term results for a class"""
    term_id = request_data.get('term_id')
    class_id = request_data.get('class_id')
    
    logger.info(f"POST /api/process-results/calculate-term - term={term_id}, class={class_id}")
    conn = None
    
    # Validate required fields
    if not term_id:
        raise HTTPException(status_code=400, detail="term_id is required")
    if not class_id:
        raise HTTPException(status_code=400, detail="class_id is required")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all students in the class
        cursor.execute("""
            SELECT id FROM students WHERE class_id = ? AND deleted_at IS NULL
        """, (class_id,))
        students = cursor.fetchall()
        
        total_students = len(students)
        students_processed = 0
        errors = []
        
        for student in students:
            try:
                # Get all subject results for this student
                cursor.execute("""
                    SELECT ssr.total_score, ssr.grade, s.name as subject_name
                    FROM student_subject_results ssr
                    JOIN subjects s ON ssr.subject_id = s.id
                    WHERE ssr.student_id = ? AND ssr.term_id = ? AND ssr.class_id = ?
                """, (student['id'], term_id, class_id))
                
                subject_results = cursor.fetchall()
                
                if subject_results:
                    total_marks = sum(r['total_score'] for r in subject_results if r['total_score'])
                    average_score = total_marks / len(subject_results)
                    grade_info = get_grade_from_score(cursor, average_score)
                    
                    passed = sum(1 for r in subject_results if r['grade'] and r['grade'] != 'F')
                    failed = len(subject_results) - passed
                    
                    # Save to student_term_results table
                    cursor.execute("""
                        INSERT INTO student_term_results (
                            student_id, class_id, term_id, total_marks, average_score,
                            overall_grade, overall_grade_point, total_subjects_passed,
                            total_subjects_failed, computed_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(student_id, term_id) DO UPDATE SET
                            total_marks = excluded.total_marks,
                            average_score = excluded.average_score,
                            overall_grade = excluded.overall_grade,
                            overall_grade_point = excluded.overall_grade_point,
                            total_subjects_passed = excluded.total_subjects_passed,
                            total_subjects_failed = excluded.total_subjects_failed,
                            computed_at = excluded.computed_at
                    """, (
                        student['id'], class_id, term_id,
                        round(total_marks, 2), round(average_score, 2),
                        grade_info['grade'], grade_info['grade_point'],
                        passed, failed, datetime.now().isoformat()
                    ))
                    students_processed += 1
                
            except Exception as e:
                errors.append(f"Student {student['id']}: {str(e)}")
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Calculated term results for {students_processed} students",
            "data": {
                "students_processed": students_processed,
                "total_students": total_students,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in calculate_term_results: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()




# @router.post("/publish")
# async def publish_results(
#     term_id: int,
#     class_id: int,
#     published_by: Optional[int] = None
# ):
#     """Publish results for a class"""
#     logger.info(f"POST /api/process-results/publish - term={term_id}, class={class_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Update student_term_results with publish date
#         cursor.execute("""
#             UPDATE student_term_results 
#             SET published_at = ?, published_by = ?
#             WHERE term_id = ? AND class_id = ? AND published_at IS NULL
#         """, (datetime.now().isoformat(), published_by, term_id, class_id))
        
#         published_count = cursor.rowcount
#         conn.commit()
        
#         return {
#             "success": True,
#             "message": f"Published results for {published_count} students",
#             "data": {
#                 "published_count": published_count
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in publish_results: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()


@router.post("/publish")
async def publish_results(
    request_data: Dict[str, Any]
):
    """Publish results for a class"""
    term_id = request_data.get('term_id')
    class_id = request_data.get('class_id')
    published_by = request_data.get('published_by')
    
    logger.info(f"POST /api/process-results/publish - term={term_id}, class={class_id}")
    conn = None
    
    # Validate required fields
    if not term_id:
        raise HTTPException(status_code=400, detail="term_id is required")
    if not class_id:
        raise HTTPException(status_code=400, detail="class_id is required")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update student_term_results with publish date
        cursor.execute("""
            UPDATE student_term_results 
            SET published_at = ?, published_by = ?
            WHERE term_id = ? AND class_id = ? AND published_at IS NULL
        """, (datetime.now().isoformat(), published_by, term_id, class_id))
        
        published_count = cursor.rowcount
        conn.commit()
        
        return {
            "success": True,
            "message": f"Published results for {published_count} students",
            "data": {
                "published_count": published_count
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in publish_results: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()


