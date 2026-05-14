# from fastapi import APIRouter, HTTPException, Query
# from pydantic import BaseModel, Field, validator
# from typing import Optional, List, Dict, Any
# from datetime import datetime, date
# import logging
# import traceback
# import sys
# import json

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

# router = APIRouter(prefix="/api/scores", tags=["scores"])

# # ==================== Pydantic Models ====================

# class StudentScoreBase(BaseModel):
#     student_id: int
#     subject_id: int
#     assessment_id: int
#     term_id: int
#     score: Optional[float] = Field(None, ge=0)
#     is_absent: bool = False
#     remarks: Optional[str] = None

# class StudentScoreCreate(StudentScoreBase):
#     created_by: Optional[int] = None

# class StudentScoreUpdate(BaseModel):
#     score: Optional[float] = Field(None, ge=0)
#     is_absent: Optional[bool] = None
#     remarks: Optional[str] = None
#     updated_by: Optional[int] = None

# class StudentScoreResponse(BaseModel):
#     id: int
#     student_id: int
#     student_name: str
#     student_number: str
#     subject_id: int
#     subject_name: str
#     assessment_id: int
#     assessment_name: str
#     term_id: int
#     term_name: str
#     score: Optional[float]
#     is_absent: bool
#     remarks: Optional[str]
#     entered_at: datetime
#     updated_at: datetime

# class BulkScoreEntry(BaseModel):
#     assessment_id: int
#     class_id: int
#     term_id: int
#     scores: List[Dict[str, Any]]  # Each: {student_id, score, is_absent, remarks}

# # ==================== Helper Functions ====================

# def get_student_name(cursor, student_id: int) -> str:
#     """Get student name"""
#     cursor.execute("""
#         SELECT p.first_name, p.last_name, p.other_names
#         FROM students s
#         JOIN person_details p ON s.person_id = p.id
#         WHERE s.id = ?
#     """, (student_id,))
#     row = cursor.fetchone()
#     if row:
#         name = f"{row['first_name']} {row['last_name']}"
#         if row['other_names']:
#             name += f" ({row['other_names']})"
#         return name
#     return "Unknown"

# def get_student_number(cursor, student_id: int) -> str:
#     """Get student number"""
#     cursor.execute("SELECT student_number FROM students WHERE id = ?", (student_id,))
#     row = cursor.fetchone()
#     return row['student_number'] if row else "Unknown"

# def get_subject_name(cursor, subject_id: int) -> str:
#     """Get subject name"""
#     cursor.execute("SELECT name FROM subjects WHERE id = ?", (subject_id,))
#     row = cursor.fetchone()
#     return row['name'] if row else "Unknown"

# def get_assessment_details(cursor, assessment_id: int) -> Dict:
#     """Get assessment details"""
#     cursor.execute("""
#         SELECT a.*, s.name as subject_name, t.name as term_name
#         FROM assessments a
#         LEFT JOIN subjects s ON a.subject_id = s.id
#         JOIN terms t ON a.term_id = t.id
#         WHERE a.id = ?
#     """, (assessment_id,))
#     row = cursor.fetchone()
#     if row:
#         return {
#             "id": row['id'],
#             "name": row['name'],
#             "type": row['type'],
#             "subject_id": row['subject_id'],
#             "subject_name": row['subject_name'],
#             "term_id": row['term_id'],
#             "term_name": row['term_name'],
#             "max_score": row['max_score'],
#             "weight": row['weight']
#         }
#     return None

# def get_term_name(cursor, term_id: int) -> str:
#     """Get term name"""
#     cursor.execute("SELECT name FROM terms WHERE id = ?", (term_id,))
#     row = cursor.fetchone()
#     return row['name'] if row else f"Term {term_id}"

# def validate_student_exists(cursor, student_id: int) -> bool:
#     """Validate student exists"""
#     cursor.execute("SELECT id FROM students WHERE id = ? AND deleted_at IS NULL", (student_id,))
#     return cursor.fetchone() is not None

# def validate_subject_exists(cursor, subject_id: int) -> bool:
#     """Validate subject exists"""
#     cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
#     return cursor.fetchone() is not None

# def validate_assessment_exists(cursor, assessment_id: int) -> bool:
#     """Validate assessment exists"""
#     cursor.execute("SELECT id FROM assessments WHERE id = ?", (assessment_id,))
#     return cursor.fetchone() is not None

# def validate_term_exists(cursor, term_id: int) -> bool:
#     """Validate term exists"""
#     cursor.execute("SELECT id FROM terms WHERE id = ?", (term_id,))
#     return cursor.fetchone() is not None

# def validate_class_exists(cursor, class_id: int) -> bool:
#     """Validate class exists"""
#     cursor.execute("SELECT id FROM classes WHERE id = ?", (class_id,))
#     return cursor.fetchone() is not None

# # ==================== Database Setup ====================

# def create_tables():
#     """Create all score-related tables if they don't exist"""
#     try:
#         logger.info("Creating/checking score-related tables")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if student_scores table exists
#         cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='student_scores'")
#         if not cursor.fetchone():
#             cursor.execute("""
#                 CREATE TABLE student_scores (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     student_id INTEGER NOT NULL,
#                     subject_id INTEGER NOT NULL,
#                     assessment_id INTEGER NOT NULL,
#                     term_id INTEGER NOT NULL,
#                     score REAL CHECK (score >= 0),
#                     is_absent BOOLEAN DEFAULT 0,
#                     remarks TEXT,
#                     version INTEGER DEFAULT 1,
#                     synced_at TIMESTAMP,
#                     updated_by_sync BOOLEAN DEFAULT 0,
#                     sync_error TEXT,
#                     entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     created_by INTEGER,
#                     updated_by INTEGER,
#                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
#                     FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
#                     FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
#                     FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
#                     FOREIGN KEY (created_by) REFERENCES users(id),
#                     FOREIGN KEY (updated_by) REFERENCES users(id),
#                     UNIQUE(student_id, assessment_id)
#                 )
#             """)
#             logger.info("Created student_scores table")
        
#         # Check if student_subject_results table exists
#         cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='student_subject_results'")
#         if not cursor.fetchone():
#             cursor.execute("""
#                 CREATE TABLE student_subject_results (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     student_id INTEGER NOT NULL,
#                     subject_id INTEGER NOT NULL,
#                     term_id INTEGER NOT NULL,
#                     class_id INTEGER NOT NULL,
#                     total_score REAL,
#                     grade TEXT,
#                     grade_point REAL,
#                     remark TEXT,
#                     position_in_class INTEGER,
#                     position_in_section INTEGER,
#                     version INTEGER DEFAULT 1,
#                     synced_at TIMESTAMP,
#                     updated_by_sync NUMERIC DEFAULT 0,
#                     computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     published_at DATETIME,
#                     published_by INTEGER,
#                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     created_by INTEGER,
#                     updated_by INTEGER,
#                     FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
#                     FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
#                     FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
#                     FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
#                     FOREIGN KEY (published_by) REFERENCES users(id),
#                     FOREIGN KEY (created_by) REFERENCES users(id),
#                     FOREIGN KEY (updated_by) REFERENCES users(id),
#                     UNIQUE(student_id, subject_id, term_id)
#                 )
#             """)
#             logger.info("Created student_subject_results table")
        
#         # Check if student_term_results table exists
#         cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='student_term_results'")
#         if not cursor.fetchone():
#             cursor.execute("""
#                 CREATE TABLE student_term_results (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     student_id INTEGER NOT NULL,
#                     class_id INTEGER NOT NULL,
#                     term_id INTEGER NOT NULL,
#                     total_marks REAL,
#                     average_score REAL,
#                     overall_grade TEXT,
#                     overall_grade_point REAL,
#                     position_in_class INTEGER,
#                     position_in_section INTEGER,
#                     total_subjects_passed INTEGER,
#                     total_subjects_failed INTEGER,
#                     version INTEGER DEFAULT 1,
#                     synced_at TIMESTAMP,
#                     updated_by_sync NUMERIC DEFAULT 0,
#                     computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     published_at DATETIME,
#                     published_by INTEGER,
#                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     created_by INTEGER,
#                     updated_by INTEGER,
#                     FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
#                     FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
#                     FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
#                     FOREIGN KEY (published_by) REFERENCES users(id),
#                     FOREIGN KEY (created_by) REFERENCES users(id),
#                     FOREIGN KEY (updated_by) REFERENCES users(id),
#                     UNIQUE(student_id, term_id)
#                 )
#             """)
#             logger.info("Created student_term_results table")
        
#         conn.commit()
#         conn.close()
#     except Exception as e:
#         logger.error(f"Error creating tables: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise

# # Initialize tables on module load
# try:
#     create_tables()
# except Exception as e:
#     logger.error(f"Failed to initialize tables: {str(e)}")

# # ==================== Student Scores Endpoints ====================

# @router.get("/")
# async def get_scores(
#     assessment_id: Optional[int] = None,
#     class_id: Optional[int] = None,
#     student_id: Optional[int] = None,
#     subject_id: Optional[int] = None,
#     term_id: Optional[int] = None
# ):
#     """Get student scores with optional filters"""
#     logger.info(f"GET /api/scores/ - Fetching scores")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         query = """
#             SELECT ss.*, 
#                    s.subject_name,
#                    a.name as assessment_name,
#                    a.max_score,
#                    a.weight,
#                    t.name as term_name
#             FROM student_scores ss
#             JOIN subjects s ON ss.subject_id = s.id
#             JOIN assessments a ON ss.assessment_id = a.id
#             JOIN terms t ON ss.term_id = t.id
#             WHERE 1=1
#         """
#         params = []
        
#         if assessment_id:
#             query += " AND ss.assessment_id = ?"
#             params.append(assessment_id)
        
#         if class_id:
#             query += """
#                 AND ss.student_id IN (
#                     SELECT id FROM students WHERE class_id = ?
#                 )
#             """
#             params.append(class_id)
        
#         if student_id:
#             query += " AND ss.student_id = ?"
#             params.append(student_id)
        
#         if subject_id:
#             query += " AND ss.subject_id = ?"
#             params.append(subject_id)
        
#         if term_id:
#             query += " AND ss.term_id = ?"
#             params.append(term_id)
        
#         query += " ORDER BY ss.student_id, ss.assessment_id"
        
#         cursor.execute(query, params)
#         results = cursor.fetchall()
        
#         scores = []
#         for row in results:
#             student_name = get_student_name(cursor, row['student_id'])
#             student_number = get_student_number(cursor, row['student_id'])
            
#             scores.append({
#                 "id": row['id'],
#                 "student_id": row['student_id'],
#                 "student_name": student_name,
#                 "student_number": student_number,
#                 "subject_id": row['subject_id'],
#                 "subject_name": row['subject_name'],
#                 "assessment_id": row['assessment_id'],
#                 "assessment_name": row['assessment_name'],
#                 "assessment_max_score": row['max_score'],
#                 "assessment_weight": row['weight'],
#                 "term_id": row['term_id'],
#                 "term_name": row['term_name'],
#                 "score": row['score'],
#                 "is_absent": bool(row['is_absent']),
#                 "remarks": row['remarks'],
#                 "entered_at": row['entered_at'],
#                 "updated_at": row['updated_at']
#             })
        
#         logger.info(f"Retrieved {len(scores)} scores")
        
#         return {
#             "success": True,
#             "data": scores,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_scores: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/assessment/{assessment_id}/class/{class_id}")
# async def get_scores_for_assessment_class(
#     assessment_id: int, 
#     class_id: int
# ):
#     """Get all scores for a specific assessment and class"""
#     logger.info(f"GET /api/scores/assessment/{assessment_id}/class/{class_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get assessment details
#         assessment = get_assessment_details(cursor, assessment_id)
#         if not assessment:
#             raise HTTPException(status_code=404, detail="Assessment not found")
        
#         # Get students in the class
#         cursor.execute("""
#             SELECT s.id, s.student_number, s.class_id, s.section_id,
#                    p.first_name, p.last_name, p.other_names
#             FROM students s
#             JOIN person_details p ON s.person_id = p.id
#             WHERE s.class_id = ? AND s.deleted_at IS NULL
#             ORDER BY p.last_name, p.first_name
#         """, (class_id,))
        
#         students = cursor.fetchall()
        
#         # Get existing scores for this assessment
#         score_map = {}
#         cursor.execute("""
#             SELECT student_id, score, is_absent, remarks, id
#             FROM student_scores
#             WHERE assessment_id = ?
#         """, (assessment_id,))
        
#         for row in cursor.fetchall():
#             score_map[row['student_id']] = {
#                 "score_id": row['id'],
#                 "score": row['score'],
#                 "is_absent": bool(row['is_absent']),
#                 "remarks": row['remarks']
#             }
        
#         # Build response
#         scores_data = []
#         for student in students:
#             name = f"{student['first_name']} {student['last_name']}"
#             if student['other_names']:
#                 name += f" ({student['other_names']})"
            
#             existing_score = score_map.get(student['id'], {})
            
#             scores_data.append({
#                 "student_id": student['id'],
#                 "student_name": name,
#                 "student_number": student['student_number'],
#                 "score_id": existing_score.get('score_id'),
#                 "score": existing_score.get('score'),
#                 "is_absent": existing_score.get('is_absent', False),
#                 "remarks": existing_score.get('remarks', ''),
#                 "subject_id": assessment['subject_id'],
#                 "subject_name": assessment['subject_name']
#             })
        
#         return {
#             "success": True,
#             "data": {
#                 "assessment": assessment,
#                 "class_id": class_id,
#                 "students": scores_data
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_scores_for_assessment_class: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/bulk")
# async def bulk_enter_scores(bulk_data: BulkScoreEntry):
#     """Bulk enter scores for an assessment"""
#     logger.info(f"POST /api/scores/bulk - Bulk entering scores for assessment {bulk_data.assessment_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Validate assessment exists
#         assessment = get_assessment_details(cursor, bulk_data.assessment_id)
#         if not assessment:
#             raise HTTPException(status_code=404, detail="Assessment not found")
        
#         # Validate class exists
#         if not validate_class_exists(cursor, bulk_data.class_id):
#             raise HTTPException(status_code=404, detail="Class not found")
        
#         # Validate term exists
#         if not validate_term_exists(cursor, bulk_data.term_id):
#             raise HTTPException(status_code=404, detail="Term not found")
        
#         updated_count = 0
#         created_count = 0
#         errors = []
        
#         for score_data in bulk_data.scores:
#             try:
#                 student_id = score_data.get('student_id')
#                 score = score_data.get('score')
#                 is_absent = score_data.get('is_absent', False)
#                 remarks = score_data.get('remarks')
                
#                 # Validate student exists
#                 if not validate_student_exists(cursor, student_id):
#                     errors.append(f"Student ID {student_id} not found")
#                     continue
                
#                 # Validate score doesn't exceed max_score
#                 if score is not None and score > assessment['max_score']:
#                     errors.append(f"Score {score} exceeds maximum {assessment['max_score']} for student {student_id}")
#                     continue
                
#                 # Check if score already exists
#                 cursor.execute("""
#                     SELECT id FROM student_scores 
#                     WHERE student_id = ? AND assessment_id = ?
#                 """, (student_id, bulk_data.assessment_id))
                
#                 existing = cursor.fetchone()
                
#                 if existing:
#                     # Update existing
#                     cursor.execute("""
#                         UPDATE student_scores 
#                         SET score = ?, is_absent = ?, remarks = ?, updated_at = ?
#                         WHERE student_id = ? AND assessment_id = ?
#                     """, (score, 1 if is_absent else 0, remarks, 
#                           datetime.now().isoformat(), student_id, bulk_data.assessment_id))
#                     updated_count += 1
#                 else:
#                     # Insert new
#                     cursor.execute("""
#                         INSERT INTO student_scores (
#                             student_id, subject_id, assessment_id, term_id, 
#                             score, is_absent, remarks, entered_at, updated_at
#                         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
#                     """, (student_id, assessment['subject_id'], bulk_data.assessment_id,
#                           bulk_data.term_id, score, 1 if is_absent else 0, remarks,
#                           datetime.now().isoformat(), datetime.now().isoformat()))
#                     created_count += 1
                
#             except Exception as e:
#                 errors.append(f"Error for student {score_data.get('student_id')}: {str(e)}")
        
#         conn.commit()
        
#         logger.info(f"Bulk score entry completed: {created_count} created, {updated_count} updated, {len(errors)} errors")
        
#         return {
#             "success": True,
#             "message": f"Saved {created_count + updated_count} scores",
#             "data": {
#                 "created_count": created_count,
#                 "updated_count": updated_count,
#                 "errors": errors
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in bulk_enter_scores: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/{score_id}")
# async def update_score(score_id: int, score_data: StudentScoreUpdate):
#     """Update a single score"""
#     logger.info(f"PUT /api/scores/{score_id} - Updating score")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if score exists
#         cursor.execute("SELECT * FROM student_scores WHERE id = ?", (score_id,))
#         existing = cursor.fetchone()
        
#         if not existing:
#             raise HTTPException(status_code=404, detail="Score record not found")
        
#         # Build update query
#         updates = []
#         params = []
        
#         if score_data.score is not None:
#             # Get assessment max score for validation
#             cursor.execute("SELECT max_score FROM assessments WHERE id = ?", (existing['assessment_id'],))
#             assessment = cursor.fetchone()
#             if assessment and score_data.score > assessment['max_score']:
#                 raise HTTPException(status_code=400, detail=f"Score cannot exceed {assessment['max_score']}")
#             updates.append("score = ?")
#             params.append(score_data.score)
        
#         if score_data.is_absent is not None:
#             updates.append("is_absent = ?")
#             params.append(1 if score_data.is_absent else 0)
        
#         if score_data.remarks is not None:
#             updates.append("remarks = ?")
#             params.append(score_data.remarks)
        
#         if score_data.updated_by is not None:
#             updates.append("updated_by = ?")
#             params.append(score_data.updated_by)
        
#         updates.append("updated_at = ?")
#         params.append(datetime.now().isoformat())
#         updates.append("version = version + 1")
        
#         if updates:
#             params.append(score_id)
#             query = f"UPDATE student_scores SET {', '.join(updates)} WHERE id = ?"
#             cursor.execute(query, params)
#             conn.commit()
        
#         return {
#             "success": True,
#             "message": "Score updated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in update_score: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Computation Endpoints ====================

# @router.post("/compute-subject-results/{term_id}/{class_id}")
# async def compute_subject_results(term_id: int, class_id: int):
#     """Compute subject results for all students in a class for a term"""
#     logger.info(f"POST /api/scores/compute-subject-results/{term_id}/{class_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get all students in the class
#         cursor.execute("""
#             SELECT id FROM students WHERE class_id = ? AND deleted_at IS NULL
#         """, (class_id,))
#         students = cursor.fetchall()
        
#         # Get all subjects for this class
#         cursor.execute("""
#             SELECT DISTINCT subject_id FROM student_scores 
#             WHERE term_id = ? AND student_id IN (SELECT id FROM students WHERE class_id = ?)
#         """, (term_id, class_id))
#         subjects = cursor.fetchall()
        
#         computed_count = 0
        
#         for student in students:
#             for subject in subjects:
#                 # Get all scores for this student-subject-term
#                 cursor.execute("""
#                     SELECT ss.score, a.weight, ss.is_absent
#                     FROM student_scores ss
#                     JOIN assessments a ON ss.assessment_id = a.id
#                     WHERE ss.student_id = ? AND ss.subject_id = ? AND ss.term_id = ?
#                 """, (student['id'], subject['subject_id'], term_id))
                
#                 scores = cursor.fetchall()
                
#                 if scores:
#                     # Calculate weighted total
#                     total_weighted_score = 0
#                     total_weight = 0
                    
#                     for score in scores:
#                         if not score['is_absent'] and score['score'] is not None:
#                             weighted_contribution = (score['score'] / 100) * score['weight']
#                             total_weighted_score += weighted_contribution
#                             total_weight += score['weight']
                    
#                     if total_weight > 0:
#                         final_score = (total_weighted_score / total_weight) * 100
#                     else:
#                         final_score = 0
                    
#                     # Get grade based on score (you can integrate with grade_boundaries)
#                     grade = get_grade_from_score(final_score)
                    
#                     # Upsert subject result
#                     cursor.execute("""
#                         INSERT INTO student_subject_results 
#                         (student_id, subject_id, term_id, class_id, total_score, grade, computed_at)
#                         VALUES (?, ?, ?, ?, ?, ?, ?)
#                         ON CONFLICT(student_id, subject_id, term_id) DO UPDATE SET
#                         total_score = excluded.total_score,
#                         grade = excluded.grade,
#                         computed_at = excluded.computed_at
#                     """, (student['id'], subject['subject_id'], term_id, class_id, final_score, grade, datetime.now().isoformat()))
                    
#                     computed_count += 1
        
#         conn.commit()
        
#         return {
#             "success": True,
#             "message": f"Computed {computed_count} subject results",
#             "data": {"computed_count": computed_count},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in compute_subject_results: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# def get_grade_from_score(score: float) -> str:
#     """Get grade from score based on grade boundaries"""
#     if score >= 80:
#         return "A"
#     elif score >= 70:
#         return "B"
#     elif score >= 60:
#         return "C"
#     elif score >= 50:
#         return "D"
#     elif score >= 40:
#         return "E"
#     else:
#         return "F"

# # ==================== Result Publishing Endpoints ====================

# @router.post("/publish-term-results/{term_id}/{class_id}")
# async def publish_term_results(term_id: int, class_id: int, published_by: int = None):
#     """Publish term results for a class"""
#     logger.info(f"POST /api/scores/publish-term-results/{term_id}/{class_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # First compute subject results
#         await compute_subject_results(term_id, class_id)
        
#         # Get all students in the class
#         cursor.execute("""
#             SELECT id FROM students WHERE class_id = ? AND deleted_at IS NULL
#         """, (class_id,))
#         students = cursor.fetchall()
        
#         published_count = 0
        
#         for student in students:
#             # Get all subject results for this student
#             cursor.execute("""
#                 SELECT total_score, grade FROM student_subject_results 
#                 WHERE student_id = ? AND term_id = ?
#             """, (student['id'], term_id))
            
#             subject_results = cursor.fetchall()
            
#             if subject_results:
#                 total_marks = sum(r['total_score'] for r in subject_results if r['total_score'])
#                 average_score = total_marks / len(subject_results) if subject_results else 0
                
#                 # Calculate overall grade
#                 overall_grade = get_grade_from_score(average_score)
                
#                 # Calculate passed/failed subjects
#                 passed = sum(1 for r in subject_results if r['grade'] and r['grade'] != 'F')
#                 failed = len(subject_results) - passed
                
#                 # Upsert term result
#                 cursor.execute("""
#                     INSERT INTO student_term_results 
#                     (student_id, class_id, term_id, total_marks, average_score, 
#                      overall_grade, total_subjects_passed, total_subjects_failed, 
#                      published_at, published_by)
#                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#                     ON CONFLICT(student_id, term_id) DO UPDATE SET
#                     total_marks = excluded.total_marks,
#                     average_score = excluded.average_score,
#                     overall_grade = excluded.overall_grade,
#                     total_subjects_passed = excluded.total_subjects_passed,
#                     total_subjects_failed = excluded.total_subjects_failed,
#                     published_at = excluded.published_at,
#                     published_by = excluded.published_by
#                 """, (student['id'], class_id, term_id, total_marks, average_score,
#                       overall_grade, passed, failed, datetime.now().isoformat(), published_by))
                
#                 published_count += 1
        
#         conn.commit()
        
#         return {
#             "success": True,
#             "message": f"Published results for {published_count} students",
#             "data": {"published_count": published_count},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in publish_term_results: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Subject Results Endpoints ====================

# @router.get("/subject-results")
# async def get_subject_results(
#     student_id: Optional[int] = None,
#     subject_id: Optional[int] = None,
#     term_id: Optional[int] = None,
#     class_id: Optional[int] = None
# ):
#     """Get computed subject results"""
#     logger.info(f"GET /api/scores/subject-results - Fetching subject results")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         query = """
#             SELECT ssr.*, 
#                    s.name as subject_name,
#                    t.name as term_name,
#                    c.class_name,
#                    p.first_name, p.last_name, p.other_names
#             FROM student_subject_results ssr
#             JOIN subjects s ON ssr.subject_id = s.id
#             JOIN terms t ON ssr.term_id = t.id
#             JOIN classes c ON ssr.class_id = c.id
#             JOIN students st ON ssr.student_id = st.id
#             JOIN person_details p ON st.person_id = p.id
#             WHERE 1=1
#         """
#         params = []
        
#         if student_id:
#             query += " AND ssr.student_id = ?"
#             params.append(student_id)
        
#         if subject_id:
#             query += " AND ssr.subject_id = ?"
#             params.append(subject_id)
        
#         if term_id:
#             query += " AND ssr.term_id = ?"
#             params.append(term_id)
        
#         if class_id:
#             query += " AND ssr.class_id = ?"
#             params.append(class_id)
        
#         query += " ORDER BY ssr.class_id, ssr.subject_id, ssr.total_score DESC"
        
#         cursor.execute(query, params)
#         results = cursor.fetchall()
        
#         subject_results = []
#         for row in results:
#             name = f"{row['first_name']} {row['last_name']}"
#             if row['other_names']:
#                 name += f" ({row['other_names']})"
            
#             subject_results.append({
#                 "id": row['id'],
#                 "student_id": row['student_id'],
#                 "student_name": name,
#                 "subject_id": row['subject_id'],
#                 "subject_name": row['subject_name'],
#                 "term_id": row['term_id'],
#                 "term_name": row['term_name'],
#                 "class_id": row['class_id'],
#                 "class_name": row['class_name'],
#                 "total_score": row['total_score'],
#                 "grade": row['grade'],
#                 "remark": row['remark'],
#                 "position_in_class": row['position_in_class'],
#                 "computed_at": row['computed_at']
#             })
        
#         return {
#             "success": True,
#             "data": subject_results,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_subject_results: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Term Results Endpoints ====================

# @router.get("/term-results")
# async def get_term_results(
#     student_id: Optional[int] = None,
#     term_id: Optional[int] = None,
#     class_id: Optional[int] = None
# ):
#     """Get computed term results"""
#     logger.info(f"GET /api/scores/term-results - Fetching term results")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         query = """
#             SELECT str.*, 
#                    t.name as term_name,
#                    c.class_name,
#                    p.first_name, p.last_name, p.other_names
#             FROM student_term_results str
#             JOIN terms t ON str.term_id = t.id
#             JOIN classes c ON str.class_id = c.id
#             JOIN students st ON str.student_id = st.id
#             JOIN person_details p ON st.person_id = p.id
#             WHERE 1=1
#         """
#         params = []
        
#         if student_id:
#             query += " AND str.student_id = ?"
#             params.append(student_id)
        
#         if term_id:
#             query += " AND str.term_id = ?"
#             params.append(term_id)
        
#         if class_id:
#             query += " AND str.class_id = ?"
#             params.append(class_id)
        
#         query += " ORDER BY str.class_id, str.average_score DESC"
        
#         cursor.execute(query, params)
#         results = cursor.fetchall()
        
#         term_results = []
#         for row in results:
#             name = f"{row['first_name']} {row['last_name']}"
#             if row['other_names']:
#                 name += f" ({row['other_names']})"
            
#             term_results.append({
#                 "id": row['id'],
#                 "student_id": row['student_id'],
#                 "student_name": name,
#                 "class_id": row['class_id'],
#                 "class_name": row['class_name'],
#                 "term_id": row['term_id'],
#                 "term_name": row['term_name'],
#                 "total_marks": row['total_marks'],
#                 "average_score": row['average_score'],
#                 "overall_grade": row['overall_grade'],
#                 "position_in_class": row['position_in_class'],
#                 "total_subjects_passed": row['total_subjects_passed'],
#                 "total_subjects_failed": row['total_subjects_failed'],
#                 "published_at": row['published_at']
#             })
        
#         return {
#             "success": True,
#             "data": term_results,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_term_results: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()











from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
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

router = APIRouter(prefix="/api/scores", tags=["scores"])

# ==================== Pydantic Models ====================

class StudentScoreBase(BaseModel):
    student_id: int
    assessment_id: int
    term_id: int
    score: Optional[float] = Field(None, ge=0)
    is_absent: bool = False
    remarks: Optional[str] = None

class StudentScoreCreate(StudentScoreBase):
    created_by: Optional[int] = None

class StudentScoreUpdate(BaseModel):
    score: Optional[float] = Field(None, ge=0)
    is_absent: Optional[bool] = None
    remarks: Optional[str] = None
    updated_by: Optional[int] = None

class StudentScoreResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_number: str
    assessment_id: int
    assessment_name: str
    assessment_max_score: float
    assessment_weight: float
    subject_id: int
    subject_name: str
    term_id: int
    term_name: str
    score: Optional[float]
    is_absent: bool
    remarks: Optional[str]
    entered_at: datetime
    updated_at: datetime

class BulkScoreEntry(BaseModel):
    assessment_id: int
    class_id: int
    term_id: int
    scores: List[Dict[str, Any]]  # Each: {student_id, score, is_absent, remarks}

# ==================== Helper Functions ====================

def get_student_name(cursor, student_id: int) -> str:
    """Get student name"""
    cursor.execute("""
        SELECT p.first_name, p.last_name, p.other_names
        FROM students s
        JOIN person_details p ON s.person_id = p.id
        WHERE s.id = ?
    """, (student_id,))
    row = cursor.fetchone()
    if row:
        name = f"{row['first_name']} {row['last_name']}"
        if row['other_names']:
            name += f" ({row['other_names']})"
        return name
    return "Unknown"

def get_student_number(cursor, student_id: int) -> str:
    """Get student number"""
    cursor.execute("SELECT student_number FROM students WHERE id = ?", (student_id,))
    row = cursor.fetchone()
    return row['student_number'] if row else "Unknown"

def get_subject_name(cursor, subject_id: int) -> str:
    """Get subject name"""
    cursor.execute("SELECT name FROM subjects WHERE id = ?", (subject_id,))
    row = cursor.fetchone()
    return row['name'] if row else "Unknown"

def get_assessment_details(cursor, assessment_id: int) -> Dict:
    """Get assessment details - must have subject_id"""
    cursor.execute("""
        SELECT a.*, s.name as subject_name, t.name as term_name
        FROM assessments a
        JOIN subjects s ON a.subject_id = s.id
        JOIN terms t ON a.term_id = t.id
        WHERE a.id = ?
    """, (assessment_id,))
    row = cursor.fetchone()
    if row:
        return {
            "id": row['id'],
            "name": row['name'],
            "type": row['type'],
            "subject_id": row['subject_id'],
            "subject_name": row['subject_name'],
            "term_id": row['term_id'],
            "term_name": row['term_name'],
            "max_score": row['max_score'],
            "weight": row['weight']
        }
    return None

def get_term_name(cursor, term_id: int) -> str:
    """Get term name"""
    cursor.execute("SELECT name FROM terms WHERE id = ?", (term_id,))
    row = cursor.fetchone()
    return row['name'] if row else f"Term {term_id}"

def validate_student_exists(cursor, student_id: int) -> bool:
    """Validate student exists"""
    cursor.execute("SELECT id FROM students WHERE id = ? AND deleted_at IS NULL", (student_id,))
    return cursor.fetchone() is not None

def validate_assessment_exists(cursor, assessment_id: int) -> bool:
    """Validate assessment exists and has subject_id"""
    cursor.execute("SELECT id, subject_id FROM assessments WHERE id = ?", (assessment_id,))
    row = cursor.fetchone()
    return row is not None and row['subject_id'] is not None

def validate_term_exists(cursor, term_id: int) -> bool:
    """Validate term exists"""
    cursor.execute("SELECT id FROM terms WHERE id = ?", (term_id,))
    return cursor.fetchone() is not None

def validate_class_exists(cursor, class_id: int) -> bool:
    """Validate class exists"""
    cursor.execute("SELECT id FROM classes WHERE id = ?", (class_id,))
    return cursor.fetchone() is not None

# ==================== Database Setup ====================

def create_tables():
    """Create all score-related tables if they don't exist"""
    try:
        logger.info("Creating/checking score-related tables")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if student_scores table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='student_scores'")
        if not cursor.fetchone():
            cursor.execute("""
                CREATE TABLE student_scores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    subject_id INTEGER NOT NULL,
                    assessment_id INTEGER NOT NULL,
                    term_id INTEGER NOT NULL,
                    score REAL CHECK (score >= 0),
                    is_absent BOOLEAN DEFAULT 0,
                    remarks TEXT,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync BOOLEAN DEFAULT 0,
                    sync_error TEXT,
                    entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
                    FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (updated_by) REFERENCES users(id),
                    UNIQUE(student_id, assessment_id)
                )
            """)
            logger.info("Created student_scores table")
        
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error creating tables: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize tables on module load
try:
    create_tables()
except Exception as e:
    logger.error(f"Failed to initialize tables: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/assessments")
async def get_available_assessments():
    """Get all assessments that have subjects assigned"""
    logger.info("GET /api/scores/assessments - Fetching available assessments")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT a.*, s.name as subject_name, t.name as term_name
            FROM assessments a
            JOIN subjects s ON a.subject_id = s.id
            JOIN terms t ON a.term_id = t.id
            ORDER BY a.created_at DESC
        """)
        
        results = cursor.fetchall()
        
        assessments = []
        for row in results:
            assessments.append({
                "id": row['id'],
                "name": row['name'],
                "type": row['type'],
                "subject_id": row['subject_id'],
                "subject_name": row['subject_name'],
                "term_id": row['term_id'],
                "term_name": row['term_name'],
                "max_score": row['max_score'],
                "weight": row['weight'],
                "assessment_date": row['assessment_date']
            })
        
        return {
            "success": True,
            "data": assessments,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_available_assessments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/assessment/{assessment_id}/class/{class_id}")
async def get_scores_for_assessment_class(
    assessment_id: int, 
    class_id: int
):
    """Get all scores for a specific assessment and class"""
    logger.info(f"GET /api/scores/assessment/{assessment_id}/class/{class_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get assessment details
        assessment = get_assessment_details(cursor, assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found or has no subject assigned")
        
        # Get students in the class
        cursor.execute("""
            SELECT s.id, s.student_number, s.class_id, s.section_id,
                   p.first_name, p.last_name, p.other_names
            FROM students s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.class_id = ? AND s.deleted_at IS NULL
            ORDER BY p.last_name, p.first_name
        """, (class_id,))
        
        students = cursor.fetchall()
        
        # Get existing scores for this assessment
        score_map = {}
        cursor.execute("""
            SELECT student_id, score, is_absent, remarks, id
            FROM student_scores
            WHERE assessment_id = ?
        """, (assessment_id,))
        
        for row in cursor.fetchall():
            score_map[row['student_id']] = {
                "score_id": row['id'],
                "score": row['score'],
                "is_absent": bool(row['is_absent']),
                "remarks": row['remarks']
            }
        
        # Build response
        scores_data = []
        for student in students:
            name = f"{student['first_name']} {student['last_name']}"
            if student['other_names']:
                name += f" ({student['other_names']})"
            
            existing_score = score_map.get(student['id'], {})
            
            scores_data.append({
                "student_id": student['id'],
                "student_name": name,
                "student_number": student['student_number'],
                "score_id": existing_score.get('score_id'),
                "score": existing_score.get('score'),
                "is_absent": existing_score.get('is_absent', False),
                "remarks": existing_score.get('remarks', ''),
                "subject_id": assessment['subject_id'],
                "subject_name": assessment['subject_name']
            })
        
        return {
            "success": True,
            "data": {
                "assessment": assessment,
                "class_id": class_id,
                "students": scores_data
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_scores_for_assessment_class: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/bulk")
async def bulk_enter_scores(bulk_data: BulkScoreEntry):
    """Bulk enter scores for an assessment"""
    logger.info(f"POST /api/scores/bulk - Bulk entering scores for assessment {bulk_data.assessment_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate assessment exists and has subject_id
        assessment = get_assessment_details(cursor, bulk_data.assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found or has no subject assigned")
        
        # Validate class exists
        if not validate_class_exists(cursor, bulk_data.class_id):
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Validate term exists
        if not validate_term_exists(cursor, bulk_data.term_id):
            raise HTTPException(status_code=404, detail="Term not found")
        
        # Get subject_id from assessment (required)
        subject_id = assessment.get('subject_id')
        if not subject_id:
            raise HTTPException(status_code=400, detail="Assessment has no subject assigned. Please update the assessment first.")
        
        updated_count = 0
        created_count = 0
        errors = []
        
        for score_data in bulk_data.scores:
            try:
                student_id = score_data.get('student_id')
                score = score_data.get('score')
                is_absent = score_data.get('is_absent', False)
                remarks = score_data.get('remarks')
                
                # Validate student exists
                if not validate_student_exists(cursor, student_id):
                    errors.append(f"Student ID {student_id} not found")
                    continue
                
                # If absent, set score to None
                if is_absent:
                    score = None
                
                # Validate score doesn't exceed max_score
                if score is not None and score > assessment['max_score']:
                    errors.append(f"Score {score} exceeds maximum {assessment['max_score']} for student {student_id}")
                    continue
                
                # Check if score already exists
                cursor.execute("""
                    SELECT id FROM student_scores 
                    WHERE student_id = ? AND assessment_id = ?
                """, (student_id, bulk_data.assessment_id))
                
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing
                    cursor.execute("""
                        UPDATE student_scores 
                        SET score = ?, is_absent = ?, remarks = ?, updated_at = ?, version = version + 1
                        WHERE student_id = ? AND assessment_id = ?
                    """, (score, 1 if is_absent else 0, remarks, 
                          datetime.now().isoformat(), student_id, bulk_data.assessment_id))
                    updated_count += 1
                    logger.info(f"Updated score for student {student_id}")
                else:
                    # Insert new with subject_id
                    cursor.execute("""
                        INSERT INTO student_scores (
                            student_id, subject_id, assessment_id, term_id, 
                            score, is_absent, remarks, entered_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (student_id, subject_id, bulk_data.assessment_id,
                          bulk_data.term_id, score, 1 if is_absent else 0, remarks,
                          datetime.now().isoformat(), datetime.now().isoformat()))
                    created_count += 1
                    logger.info(f"Created score for student {student_id}")
                
            except Exception as e:
                error_msg = f"Error for student {score_data.get('student_id')}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)
        
        conn.commit()
        
        logger.info(f"Bulk score entry completed: {created_count} created, {updated_count} updated, {len(errors)} errors")
        
        return {
            "success": True,
            "message": f"Saved {created_count + updated_count} scores",
            "data": {
                "created_count": created_count,
                "updated_count": updated_count,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk_enter_scores: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/subject-results")
async def get_subject_results(
    student_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    term_id: Optional[int] = None,
    class_id: Optional[int] = None
):
    """Get computed subject results"""
    logger.info(f"GET /api/scores/subject-results - Fetching subject results")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Calculate scores per subject per student
        query = """
            SELECT 
                ss.student_id,
                ss.subject_id,
                ss.term_id,
                s.name as subject_name,
                t.name as term_name,
                st.class_id,
                c.class_name,
                AVG((ss.score / a.max_score) * a.weight) as weighted_score,
                SUM(a.weight) as total_weight
            FROM student_scores ss
            JOIN subjects s ON ss.subject_id = s.id
            JOIN assessments a ON ss.assessment_id = a.id
            JOIN terms t ON ss.term_id = t.id
            JOIN students st ON ss.student_id = st.id
            JOIN classes c ON st.class_id = c.id
            WHERE ss.score IS NOT NULL AND ss.is_absent = 0
        """
        params = []
        
        if student_id:
            query += " AND ss.student_id = ?"
            params.append(student_id)
        
        if subject_id:
            query += " AND ss.subject_id = ?"
            params.append(subject_id)
        
        if term_id:
            query += " AND ss.term_id = ?"
            params.append(term_id)
        
        if class_id:
            query += " AND st.class_id = ?"
            params.append(class_id)
        
        query += " GROUP BY ss.student_id, ss.subject_id, ss.term_id"
        query += " ORDER BY c.class_name, s.name, weighted_score DESC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        subject_results = []
        for row in results:
            student_name = get_student_name(cursor, row['student_id'])
            total_score = (row['weighted_score'] / row['total_weight']) * 100 if row['total_weight'] > 0 else 0
            
            subject_results.append({
                "student_id": row['student_id'],
                "student_name": student_name,
                "subject_id": row['subject_id'],
                "subject_name": row['subject_name'],
                "term_id": row['term_id'],
                "term_name": row['term_name'],
                "class_id": row['class_id'],
                "class_name": row['class_name'],
                "total_score": round(total_score, 2),
                "grade": get_grade_from_score(total_score)
            })
        
        return {
            "success": True,
            "data": subject_results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_subject_results: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

def get_grade_from_score(score: float) -> str:
    """Get grade from score based on grade boundaries"""
    if score >= 80:
        return "A"
    elif score >= 70:
        return "B"
    elif score >= 60:
        return "C"
    elif score >= 50:
        return "D"
    elif score >= 40:
        return "E"
    else:
        return "F"