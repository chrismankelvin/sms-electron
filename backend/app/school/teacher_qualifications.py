# # app/school/teacher_qualifications.py

# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel, Field, validator
# from typing import Optional, Dict, Any, List
# from datetime import datetime, date
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

# router = APIRouter(prefix="/api/teacher-qualifications", tags=["teacher-qualifications"])

# # ==================== Pydantic Models ====================

# class TeacherQualificationBase(BaseModel):
#     staff_id: int
#     subject_id: int
#     qualification_level: Optional[str] = Field(None, pattern="^(Bachelor's|Master's|PhD|Diploma|Certification)$")
#     certified_since: Optional[date] = None

# class TeacherQualificationCreate(TeacherQualificationBase):
#     pass

# class TeacherQualificationUpdate(BaseModel):
#     qualification_level: Optional[str] = Field(None, pattern="^(Bachelor's|Master's|PhD|Diploma|Certification)$")
#     certified_since: Optional[date] = None

# class TeacherQualificationResponse(BaseModel):
#     id: int
#     staff_id: int
#     subject_id: int
#     qualification_level: Optional[str]
#     certified_since: Optional[date]
#     version: int
#     created_at: datetime

# class TeacherQualificationBulkUpdate(BaseModel):
#     staff_id: int
#     qualifications: List[Dict[str, Any]]  # List of {subject_id, qualified, qualification_level, certified_since}

# # ==================== Helper Functions ====================

# def validate_staff_exists(cursor, staff_id: int) -> bool:
#     """Validate that the staff member exists"""
#     cursor.execute("SELECT id, first_name, surname FROM staff WHERE id = ?", (staff_id,))
#     return cursor.fetchone() is not None

# def validate_subject_exists(cursor, subject_id: int) -> bool:
#     """Validate that the subject exists"""
#     cursor.execute("SELECT id, name FROM subjects WHERE id = ?", (subject_id,))
#     return cursor.fetchone() is not None

# def get_staff_qualifications(cursor, staff_id: int) -> List[Dict[str, Any]]:
#     """Get all qualifications for a staff member"""
#     cursor.execute("""
#         SELECT tq.*, s.name as subject_name, s.code as subject_code
#         FROM teacher_qualifications tq
#         JOIN subjects s ON tq.subject_id = s.id
#         WHERE tq.staff_id = ?
#         ORDER BY s.name
#     """, (staff_id,))
#     results = cursor.fetchall()
#     return [
#         {
#             "subject_id": row['subject_id'],
#             "subject_name": row['subject_name'],
#             "subject_code": row['subject_code'],
#             "qualification_level": row['qualification_level'],
#             "certified_since": row['certified_since'],
#             "is_qualified": True
#         }
#         for row in results
#     ]

# def get_all_staff(cursor) -> List[Dict[str, Any]]:
#     """Get all staff members"""
#     cursor.execute("SELECT id, first_name, surname, title FROM staff ORDER BY surname, first_name")
#     results = cursor.fetchall()
#     return [
#         {
#             "id": row['id'],
#             "name": f"{row['title']} {row['first_name']} {row['surname']}" if row['title'] else f"{row['first_name']} {row['surname']}",
#             "first_name": row['first_name'],
#             "surname": row['surname'],
#             "title": row['title']
#         }
#         for row in results
#     ]

# def get_all_subjects(cursor) -> List[Dict[str, Any]]:
#     """Get all subjects"""
#     cursor.execute("SELECT id, name, code, type FROM subjects ORDER BY name")
#     results = cursor.fetchall()
#     return [
#         {
#             "id": row['id'],
#             "name": row['name'],
#             "code": row['code'],
#             "type": row['type']
#         }
#         for row in results
#     ]

# # ==================== Database Setup ====================

# def create_teacher_qualifications_table():
#     """Create teacher_qualifications table if it doesn't exist"""
#     try:
#         logger.info("Creating/checking teacher_qualifications table")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if table exists
#         cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='teacher_qualifications'")
#         table_exists = cursor.fetchone()
        
#         if not table_exists:
#             cursor.execute("""
#                 CREATE TABLE teacher_qualifications (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     staff_id INTEGER NOT NULL,
#                     subject_id INTEGER NOT NULL,
#                     qualification_level TEXT,
#                     certified_since DATE,
#                     version INTEGER DEFAULT 1,
#                     synced_at TIMESTAMP,
#                     updated_by_sync NUMERIC DEFAULT 0,
#                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
#                     FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
#                     UNIQUE(staff_id, subject_id)
#                 )
#             """)
#             logger.info("New teacher_qualifications table created")
            
#             # Insert default qualifications
#             logger.info("Inserting default teacher qualifications")
            
#             # Get staff and subjects
#             cursor.execute("SELECT id, first_name, surname FROM staff")
#             staff_members = cursor.fetchall()
            
#             cursor.execute("SELECT id, name FROM subjects")
#             subjects = cursor.fetchall()
            
#             subject_map = {s['name']: s['id'] for s in subjects}
            
#             # Default qualifications for teachers
#             default_qualifications = {
#                 'John Doe': {
#                     'Mathematics': {"level": "Master's", "since": "2015-08-15"},
#                     'English Language': {"level": "Bachelor's", "since": "2015-08-15"},
#                     'Biology': {"level": "Master's", "since": "2016-06-20"}
#                 },
#                 'Jane Smith': {
#                     'English Language': {"level": "Master's", "since": "2014-09-10"},
#                     'Literature': {"level": "Master's", "since": "2014-09-10"}
#                 }
#             }
            
#             for staff in staff_members:
#                 staff_name = staff['first_name'] + ' ' + staff['surname']
#                 if staff_name in default_qualifications:
#                     for subject_name, qual_data in default_qualifications[staff_name].items():
#                         if subject_name in subject_map:
#                             cursor.execute("""
#                                 INSERT INTO teacher_qualifications 
#                                 (staff_id, subject_id, qualification_level, certified_since, created_at)
#                                 VALUES (?, ?, ?, ?, ?)
#                             """, (
#                                 staff['id'], 
#                                 subject_map[subject_name],
#                                 qual_data['level'],
#                                 qual_data['since'],
#                                 datetime.now().isoformat()
#                             ))
            
#             conn.commit()
#             logger.info("Default teacher qualifications inserted successfully")
#         else:
#             logger.info("Table 'teacher_qualifications' already exists, checking columns")
            
#             # Add missing columns if needed
#             cursor.execute("PRAGMA table_info(teacher_qualifications)")
#             columns = cursor.fetchall()
#             column_names = [col['name'] for col in columns]
            
#             if 'synced_at' not in column_names:
#                 logger.info("Adding synced_at column")
#                 cursor.execute("ALTER TABLE teacher_qualifications ADD COLUMN synced_at TIMESTAMP")
            
#             if 'updated_by_sync' not in column_names:
#                 logger.info("Adding updated_by_sync column")
#                 cursor.execute("ALTER TABLE teacher_qualifications ADD COLUMN updated_by_sync NUMERIC DEFAULT 0")
            
#             if 'version' not in column_names:
#                 logger.info("Adding version column")
#                 cursor.execute("ALTER TABLE teacher_qualifications ADD COLUMN version INTEGER DEFAULT 1")
            
#             conn.commit()
#             logger.info("Table structure updated successfully")
        
#         conn.close()
#     except Exception as e:
#         logger.error(f"Error creating/updating teacher_qualifications table: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise

# # Initialize table on module load
# try:
#     create_teacher_qualifications_table()
# except Exception as e:
#     logger.error(f"Failed to initialize teacher_qualifications table: {str(e)}")

# # ==================== API Endpoints ====================

# @router.get("/")
# async def get_all_teacher_qualifications():
#     """Get all teacher qualifications"""
#     logger.info("GET /api/teacher-qualifications/ - Fetching all qualifications")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         staff_members = get_all_staff(cursor)
#         all_subjects = get_all_subjects(cursor)
        
#         result = []
#         for staff in staff_members:
#             qualifications = get_staff_qualifications(cursor, staff['id'])
#             qualified_subject_ids = [q['subject_id'] for q in qualifications]
            
#             # Build subject list with qualification status
#             subjects_with_status = []
#             for subject in all_subjects:
#                 qual = next((q for q in qualifications if q['subject_id'] == subject['id']), None)
#                 subjects_with_status.append({
#                     "subject_id": subject['id'],
#                     "subject_name": subject['name'],
#                     "subject_code": subject['code'],
#                     "subject_type": subject['type'],
#                     "is_qualified": qual is not None,
#                     "qualification_level": qual['qualification_level'] if qual else None,
#                     "certified_since": qual['certified_since'] if qual else None
#                 })
            
#             result.append({
#                 "staff_id": staff['id'],
#                 "staff_name": staff['name'],
#                 "qualifications": qualifications,
#                 "all_subjects": subjects_with_status
#             })
        
#         logger.info(f"Retrieved qualifications for {len(result)} teachers")
        
#         return {
#             "success": True,
#             "data": result,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_all_teacher_qualifications: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
#             logger.debug("Database connection closed")

# @router.get("/teachers")
# async def get_teachers():
#     """Get all teachers for the dropdown"""
#     logger.info("GET /api/teacher-qualifications/teachers - Fetching teachers")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         staff_members = get_all_staff(cursor)
        
#         return {
#             "success": True,
#             "data": staff_members,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_teachers: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/subjects")
# async def get_subjects():
#     """Get all subjects for qualification assignment"""
#     logger.info("GET /api/teacher-qualifications/subjects - Fetching subjects")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         subjects = get_all_subjects(cursor)
        
#         return {
#             "success": True,
#             "data": subjects,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_subjects: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/{staff_id}")
# async def get_teacher_qualifications(staff_id: int):
#     """Get qualifications for a specific teacher"""
#     logger.info(f"GET /api/teacher-qualifications/{staff_id} - Fetching teacher qualifications")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Validate staff exists
#         staff_result = validate_staff_exists(cursor, staff_id)
#         if not staff_result:
#             raise HTTPException(status_code=404, detail="Teacher not found")
        
#         # Get staff name
#         cursor.execute("SELECT first_name, surname, title FROM staff WHERE id = ?", (staff_id,))
#         staff = cursor.fetchone()
#         staff_name = f"{staff['title']} {staff['first_name']} {staff['surname']}" if staff['title'] else f"{staff['first_name']} {staff['surname']}"
        
#         qualifications = get_staff_qualifications(cursor, staff_id)
#         all_subjects = get_all_subjects(cursor)
        
#         # Build subject list with qualification status
#         subjects_with_status = []
#         for subject in all_subjects:
#             qual = next((q for q in qualifications if q['subject_id'] == subject['id']), None)
#             subjects_with_status.append({
#                 "subject_id": subject['id'],
#                 "subject_name": subject['name'],
#                 "subject_code": subject['code'],
#                 "subject_type": subject['type'],
#                 "is_qualified": qual is not None,
#                 "qualification_level": qual['qualification_level'] if qual else None,
#                 "certified_since": qual['certified_since'] if qual else None
#             })
        
#         return {
#             "success": True,
#             "data": {
#                 "staff_id": staff_id,
#                 "staff_name": staff_name,
#                 "qualifications": qualifications,
#                 "subjects": subjects_with_status
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_teacher_qualifications: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/bulk")
# async def bulk_update_qualifications(bulk_data: TeacherQualificationBulkUpdate):
#     """Bulk update qualifications for a teacher"""
#     logger.info(f"POST /api/teacher-qualifications/bulk - Bulk updating for teacher {bulk_data.staff_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Validate staff exists
#         if not validate_staff_exists(cursor, bulk_data.staff_id):
#             raise HTTPException(status_code=404, detail="Teacher not found")
        
#         # Remove existing qualifications for this teacher
#         cursor.execute("DELETE FROM teacher_qualifications WHERE staff_id = ?", (bulk_data.staff_id,))
        
#         # Insert new qualifications
#         inserted_count = 0
#         for qual in bulk_data.qualifications:
#             subject_id = qual.get('subject_id')
#             is_qualified = qual.get('qualified', False)
            
#             if is_qualified and subject_id:
#                 # Validate subject exists
#                 if not validate_subject_exists(cursor, subject_id):
#                     logger.warning(f"Subject with ID {subject_id} not found, skipping")
#                     continue
                
#                 qualification_level = qual.get('qualification_level')
#                 certified_since = qual.get('certified_since')
                
#                 cursor.execute("""
#                     INSERT INTO teacher_qualifications 
#                     (staff_id, subject_id, qualification_level, certified_since, created_at)
#                     VALUES (?, ?, ?, ?, ?)
#                 """, (
#                     bulk_data.staff_id,
#                     subject_id,
#                     qualification_level,
#                     certified_since,
#                     datetime.now().isoformat()
#                 ))
#                 inserted_count += 1
        
#         conn.commit()
        
#         logger.info(f"Bulk update completed for teacher {bulk_data.staff_id}: {inserted_count} qualifications added")
        
#         return {
#             "success": True,
#             "message": "Teacher qualifications updated successfully",
#             "data": {
#                 "staff_id": bulk_data.staff_id,
#                 "qualified_count": inserted_count
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in bulk_update_qualifications: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/{staff_id}/{subject_id}")
# async def add_qualification(staff_id: int, subject_id: int, qual_data: TeacherQualificationCreate):
#     """Add a qualification for a teacher"""
#     logger.info(f"POST /api/teacher-qualifications/{staff_id}/{subject_id} - Adding qualification")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Validate staff exists
#         if not validate_staff_exists(cursor, staff_id):
#             raise HTTPException(status_code=404, detail="Teacher not found")
        
#         # Validate subject exists
#         if not validate_subject_exists(cursor, subject_id):
#             raise HTTPException(status_code=404, detail="Subject not found")
        
#         # Check if already exists
#         cursor.execute("""
#             SELECT id FROM teacher_qualifications 
#             WHERE staff_id = ? AND subject_id = ?
#         """, (staff_id, subject_id))
        
#         if cursor.fetchone():
#             raise HTTPException(status_code=400, detail="Qualification already exists for this teacher and subject")
        
#         # Insert qualification
#         cursor.execute("""
#             INSERT INTO teacher_qualifications 
#             (staff_id, subject_id, qualification_level, certified_since, created_at)
#             VALUES (?, ?, ?, ?, ?)
#         """, (
#             staff_id, subject_id, qual_data.qualification_level,
#             qual_data.certified_since, datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         new_id = cursor.lastrowid
        
#         logger.info(f"Qualification added successfully with ID: {new_id}")
        
#         return {
#             "success": True,
#             "message": "Qualification added successfully",
#             "data": {"id": new_id},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in add_qualification: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/{staff_id}/{subject_id}")
# async def update_qualification(staff_id: int, subject_id: int, qual_data: TeacherQualificationUpdate):
#     """Update a qualification for a teacher"""
#     logger.info(f"PUT /api/teacher-qualifications/{staff_id}/{subject_id} - Updating qualification")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if qualification exists
#         cursor.execute("""
#             SELECT id FROM teacher_qualifications 
#             WHERE staff_id = ? AND subject_id = ?
#         """, (staff_id, subject_id))
        
#         existing = cursor.fetchone()
#         if not existing:
#             raise HTTPException(status_code=404, detail="Qualification not found")
        
#         # Build update query
#         updates = []
#         params = []
        
#         if qual_data.qualification_level is not None:
#             updates.append("qualification_level = ?")
#             params.append(qual_data.qualification_level)
        
#         if qual_data.certified_since is not None:
#             updates.append("certified_since = ?")
#             params.append(qual_data.certified_since)
        
#         updates.append("version = version + 1")
#         params.append(datetime.now().isoformat())
#         params.append(staff_id)
#         params.append(subject_id)
        
#         if updates:
#             query = f"""
#                 UPDATE teacher_qualifications 
#                 SET {', '.join(updates)} 
#                 WHERE staff_id = ? AND subject_id = ?
#             """
#             cursor.execute(query, params)
#             conn.commit()
#             logger.info(f"Qualification updated for teacher {staff_id}, subject {subject_id}")
        
#         return {
#             "success": True,
#             "message": "Qualification updated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in update_qualification: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.delete("/{staff_id}/{subject_id}")
# async def remove_qualification(staff_id: int, subject_id: int):
#     """Remove a qualification from a teacher"""
#     logger.info(f"DELETE /api/teacher-qualifications/{staff_id}/{subject_id} - Removing qualification")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if qualification exists
#         cursor.execute("""
#             SELECT id FROM teacher_qualifications 
#             WHERE staff_id = ? AND subject_id = ?
#         """, (staff_id, subject_id))
        
#         existing = cursor.fetchone()
#         if not existing:
#             raise HTTPException(status_code=404, detail="Qualification not found")
        
#         # Delete qualification
#         cursor.execute("""
#             DELETE FROM teacher_qualifications 
#             WHERE staff_id = ? AND subject_id = ?
#         """, (staff_id, subject_id))
        
#         conn.commit()
        
#         logger.info(f"Qualification removed for teacher {staff_id}, subject {subject_id}")
        
#         return {
#             "success": True,
#             "message": "Qualification removed successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in remove_qualification: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/matrix")
# async def get_qualification_matrix():
#     """Get the teacher-subject qualification matrix"""
#     logger.info("GET /api/teacher-qualifications/matrix - Fetching qualification matrix")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         staff_members = get_all_staff(cursor)
#         subjects = get_all_subjects(cursor)
        
#         # Get all qualifications
#         cursor.execute("""
#             SELECT staff_id, subject_id, qualification_level, certified_since
#             FROM teacher_qualifications
#         """)
#         qualifications = cursor.fetchall()
        
#         # Build qualification map
#         qual_map = {}
#         for qual in qualifications:
#             if qual['staff_id'] not in qual_map:
#                 qual_map[qual['staff_id']] = {}
#             qual_map[qual['staff_id']][qual['subject_id']] = {
#                 "qualified": True,
#                 "level": qual['qualification_level'],
#                 "since": qual['certified_since']
#             }
        
#         # Build matrix
#         matrix = []
#         for staff in staff_members:
#             row = {
#                 "staff_id": staff['id'],
#                 "staff_name": staff['name'],
#                 "subjects": []
#             }
#             for subject in subjects:
#                 qual = qual_map.get(staff['id'], {}).get(subject['id'], {})
#                 row["subjects"].append({
#                     "subject_id": subject['id'],
#                     "subject_name": subject['name'],
#                     "is_qualified": qual.get("qualified", False),
#                     "qualification_level": qual.get("level"),
#                     "certified_since": qual.get("since")
#                 })
#             matrix.append(row)
        
#         return {
#             "success": True,
#             "data": {
#                 "teachers": staff_members,
#                 "subjects": subjects,
#                 "matrix": matrix
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_qualification_matrix: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Sync Integration Functions ====================

# def sync_teacher_qualification_from_external(source_data: Dict[str, Any]) -> bool:
#     """Sync teacher qualification from external database"""
#     try:
#         logger.info("Syncing teacher qualification from external source")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             INSERT OR REPLACE INTO teacher_qualifications (
#                 id, staff_id, subject_id, qualification_level, certified_since,
#                 version, synced_at, updated_by_sync
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             source_data.get('id'),
#             source_data.get('staff_id'),
#             source_data.get('subject_id'),
#             source_data.get('qualification_level'),
#             source_data.get('certified_since'),
#             source_data.get('version', 1),
#             datetime.now().isoformat(),
#             1
#         ))
        
#         conn.commit()
#         conn.close()
#         logger.info("Teacher qualification synced successfully")
#         return True
        
#     except Exception as e:
#         logger.error(f"Error syncing teacher qualification: {str(e)}")
#         logger.error(traceback.format_exc())
#         return False





# app/school/teacher_qualifications.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
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

router = APIRouter(prefix="/api/teacher-qualifications", tags=["teacher-qualifications"])

# ==================== Pydantic Models ====================

class TeacherQualificationBase(BaseModel):
    staff_id: int
    subject_id: int
    qualification_level: Optional[str] = Field(None, pattern="^(Bachelor's|Master's|PhD|Diploma|Certification)$")
    certified_since: Optional[date] = None

class TeacherQualificationCreate(TeacherQualificationBase):
    pass

class TeacherQualificationUpdate(BaseModel):
    qualification_level: Optional[str] = Field(None, pattern="^(Bachelor's|Master's|PhD|Diploma|Certification)$")
    certified_since: Optional[date] = None

class TeacherQualificationResponse(BaseModel):
    id: int
    staff_id: int
    subject_id: int
    qualification_level: Optional[str]
    certified_since: Optional[date]
    version: int
    created_at: datetime

class TeacherQualificationBulkUpdate(BaseModel):
    staff_id: int
    qualifications: List[Dict[str, Any]]

# ==================== Helper Functions ====================

def validate_staff_exists(cursor, staff_id: int) -> bool:
    """Validate that the staff member exists"""
    cursor.execute("""
        SELECT s.id 
        FROM staff s
        WHERE s.id = ? AND s.deleted_at IS NULL
    """, (staff_id,))
    return cursor.fetchone() is not None

def get_staff_info(cursor, staff_id: int) -> Optional[Dict[str, Any]]:
    """Get staff information including name from person_details"""
    cursor.execute("""
        SELECT s.id, s.staff_number, s.role, s.status,
               p.first_name, p.last_name, p.other_names
        FROM staff s
        JOIN person_details p ON s.person_id = p.id
        WHERE s.id = ? AND s.deleted_at IS NULL
    """, (staff_id,))
    row = cursor.fetchone()
    if row:
        # Construct full name
        full_name = f"{row['first_name']} {row['last_name']}"
        if row['other_names']:
            full_name += f" ({row['other_names']})"
        
        return {
            "id": row['id'],
            "staff_number": row['staff_number'],
            "role": row['role'],
            "status": row['status'],
            "first_name": row['first_name'],
            "last_name": row['last_name'],
            "name": full_name
        }
    return None

def validate_subject_exists(cursor, subject_id: int) -> bool:
    """Validate that the subject exists"""
    cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
    return cursor.fetchone() is not None

def get_subject_info(cursor, subject_id: int) -> Optional[Dict[str, Any]]:
    """Get subject information"""
    cursor.execute("SELECT id, name, code, type, category FROM subjects WHERE id = ?", (subject_id,))
    row = cursor.fetchone()
    if row:
        return {
            "id": row['id'],
            "name": row['name'],
            "code": row['code'],
            "type": row['type'],
            "category": row['category']
        }
    return None

def get_staff_qualifications(cursor, staff_id: int) -> List[Dict[str, Any]]:
    """Get all qualifications for a staff member"""
    cursor.execute("""
        SELECT tq.*, s.name as subject_name, s.code as subject_code, s.type as subject_type
        FROM teacher_qualifications tq
        JOIN subjects s ON tq.subject_id = s.id
        WHERE tq.staff_id = ?
        ORDER BY s.name
    """, (staff_id,))
    results = cursor.fetchall()
    return [
        {
            "id": row['id'],
            "subject_id": row['subject_id'],
            "subject_name": row['subject_name'],
            "subject_code": row['subject_code'],
            "subject_type": row['subject_type'],
            "qualification_level": row['qualification_level'],
            "certified_since": row['certified_since'],
            "is_qualified": True,
            "version": row['version'],
            "created_at": row['created_at']
        }
        for row in results
    ]

def get_all_staff(cursor, role_filter: str = None) -> List[Dict[str, Any]]:
    """Get all staff members with their person details"""
    query = """
        SELECT s.id, s.staff_number, s.role, s.status,
               p.first_name, p.last_name, p.other_names
        FROM staff s
        JOIN person_details p ON s.person_id = p.id
        WHERE s.deleted_at IS NULL
    """
    params = []
    
    if role_filter:
        query += " AND s.role IN ('admin', 'teacher', 'ta')"
    
    query += " ORDER BY p.last_name, p.first_name"
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    
    staff_list = []
    for row in results:
        # Construct full name
        name_parts = [row['first_name'], row['last_name']]
        full_name = " ".join(name_parts)
        if row['other_names']:
            full_name += f" ({row['other_names']})"
        
        staff_list.append({
            "id": row['id'],
            "staff_number": row['staff_number'],
            "role": row['role'],
            "status": row['status'],
            "first_name": row['first_name'],
            "last_name": row['last_name'],
            "other_names": row['other_names'],
            "name": full_name
        })
    
    return staff_list

def get_all_subjects(cursor) -> List[Dict[str, Any]]:
    """Get all subjects"""
    cursor.execute("SELECT id, name, code, type, category FROM subjects ORDER BY name")
    results = cursor.fetchall()
    return [
        {
            "id": row['id'],
            "name": row['name'],
            "code": row['code'],
            "type": row['type'],
            "category": row['category']
        }
        for row in results
    ]

# ==================== Database Setup ====================

def create_teacher_qualifications_table():
    """Create teacher_qualifications table if it doesn't exist"""
    try:
        logger.info("Creating/checking teacher_qualifications table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='teacher_qualifications'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE teacher_qualifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    staff_id INTEGER NOT NULL,
                    subject_id INTEGER NOT NULL,
                    qualification_level TEXT,
                    certified_since DATE,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync NUMERIC DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                    UNIQUE(staff_id, subject_id)
                )
            """)
            logger.info("New teacher_qualifications table created")
        else:
            logger.info("Table 'teacher_qualifications' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(teacher_qualifications)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE teacher_qualifications ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE teacher_qualifications ADD COLUMN updated_by_sync NUMERIC DEFAULT 0")
            
            if 'version' not in column_names:
                logger.info("Adding version column")
                cursor.execute("ALTER TABLE teacher_qualifications ADD COLUMN version INTEGER DEFAULT 1")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating teacher_qualifications table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_teacher_qualifications_table()
except Exception as e:
    logger.error(f"Failed to initialize teacher_qualifications table: {str(e)}")

# ==================== API Endpoints ====================


@router.get("/matrix")
async def get_qualification_matrix():
    """Get the teacher-subject qualification matrix"""
    logger.info("GET /api/teacher-qualifications/matrix - Fetching qualification matrix")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        staff_members = get_all_staff(cursor)
        subjects = get_all_subjects(cursor)
        
        # Get all qualifications
        cursor.execute("""
            SELECT staff_id, subject_id, qualification_level, certified_since
            FROM teacher_qualifications
        """)
        qualifications = cursor.fetchall()
        
        # Build qualification map
        qual_map = {}
        for qual in qualifications:
            if qual['staff_id'] not in qual_map:
                qual_map[qual['staff_id']] = {}
            qual_map[qual['staff_id']][qual['subject_id']] = {
                "qualified": True,
                "level": qual['qualification_level'],
                "since": qual['certified_since']
            }
        
        # Build matrix
        matrix = []
        for staff in staff_members:
            row = {
                "staff_id": staff['id'],
                "staff_name": staff['name'],
                "staff_number": staff['staff_number'],
                "role": staff['role'],
                "subjects": []
            }
            for subject in subjects:
                qual = qual_map.get(staff['id'], {}).get(subject['id'], {})
                row["subjects"].append({
                    "subject_id": subject['id'],
                    "subject_name": subject['name'],
                    "subject_code": subject['code'],
                    "is_qualified": qual.get("qualified", False),
                    "qualification_level": qual.get("level"),
                    "certified_since": qual.get("since")
                })
            matrix.append(row)
        
        return {
            "success": True,
            "data": {
                "teachers": staff_members,
                "subjects": subjects,
                "matrix": matrix
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_qualification_matrix: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()




@router.get("/")
async def get_all_teacher_qualifications():
    """Get all teacher qualifications"""
    logger.info("GET /api/teacher-qualifications/ - Fetching all qualifications")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        staff_members = get_all_staff(cursor)
        all_subjects = get_all_subjects(cursor)
        
        result = []
        for staff in staff_members:
            qualifications = get_staff_qualifications(cursor, staff['id'])
            qualified_subject_ids = [q['subject_id'] for q in qualifications]
            
            # Build subject list with qualification status
            subjects_with_status = []
            for subject in all_subjects:
                qual = next((q for q in qualifications if q['subject_id'] == subject['id']), None)
                subjects_with_status.append({
                    "subject_id": subject['id'],
                    "subject_name": subject['name'],
                    "subject_code": subject['code'],
                    "subject_type": subject['type'],
                    "subject_category": subject['category'],
                    "is_qualified": qual is not None,
                    "qualification_level": qual['qualification_level'] if qual else None,
                    "certified_since": qual['certified_since'] if qual else None,
                    "qualification_id": qual['id'] if qual else None
                })
            
            result.append({
                "staff_id": staff['id'],
                "staff_name": staff['name'],
                "staff_number": staff['staff_number'],
                "role": staff['role'],
                "status": staff['status'],
                "qualifications": qualifications,
                "all_subjects": subjects_with_status
            })
        
        logger.info(f"Retrieved qualifications for {len(result)} teachers")
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_all_teacher_qualifications: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/teachers")
async def get_teachers():
    """Get all teachers for the dropdown"""
    logger.info("GET /api/teacher-qualifications/teachers - Fetching teachers")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        staff_members = get_all_staff(cursor, role_filter='teacher')
        
        return {
            "success": True,
            "data": staff_members,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_teachers: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/subjects")
async def get_subjects():
    """Get all subjects for qualification assignment"""
    logger.info("GET /api/teacher-qualifications/subjects - Fetching subjects")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        subjects = get_all_subjects(cursor)
        
        return {
            "success": True,
            "data": subjects,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_subjects: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{staff_id}")
async def get_teacher_qualifications(staff_id: int):
    """Get qualifications for a specific teacher"""
    logger.info(f"GET /api/teacher-qualifications/{staff_id} - Fetching teacher qualifications")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate staff exists and get info
        staff_info = get_staff_info(cursor, staff_id)
        if not staff_info:
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        qualifications = get_staff_qualifications(cursor, staff_id)
        all_subjects = get_all_subjects(cursor)
        
        # Build subject list with qualification status
        subjects_with_status = []
        for subject in all_subjects:
            qual = next((q for q in qualifications if q['subject_id'] == subject['id']), None)
            subjects_with_status.append({
                "subject_id": subject['id'],
                "subject_name": subject['name'],
                "subject_code": subject['code'],
                "subject_type": subject['type'],
                "subject_category": subject['category'],
                "is_qualified": qual is not None,
                "qualification_level": qual['qualification_level'] if qual else None,
                "certified_since": qual['certified_since'] if qual else None,
                "qualification_id": qual['id'] if qual else None
            })
        
        return {
            "success": True,
            "data": {
                "staff_id": staff_id,
                "staff_name": staff_info['name'],
                "staff_number": staff_info['staff_number'],
                "role": staff_info['role'],
                "status": staff_info['status'],
                "qualifications": qualifications,
                "subjects": subjects_with_status
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_teacher_qualifications: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/bulk")
async def bulk_update_qualifications(bulk_data: TeacherQualificationBulkUpdate):
    """Bulk update qualifications for a teacher"""
    logger.info(f"POST /api/teacher-qualifications/bulk - Bulk updating for teacher {bulk_data.staff_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate staff exists
        if not validate_staff_exists(cursor, bulk_data.staff_id):
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        # Remove existing qualifications for this teacher
        cursor.execute("DELETE FROM teacher_qualifications WHERE staff_id = ?", (bulk_data.staff_id,))
        
        # Insert new qualifications
        inserted_count = 0
        for qual in bulk_data.qualifications:
            subject_id = qual.get('subject_id')
            is_qualified = qual.get('qualified', False)
            
            if is_qualified and subject_id:
                # Validate subject exists
                if not validate_subject_exists(cursor, subject_id):
                    logger.warning(f"Subject with ID {subject_id} not found, skipping")
                    continue
                
                qualification_level = qual.get('qualification_level')
                certified_since = qual.get('certified_since')
                
                cursor.execute("""
                    INSERT INTO teacher_qualifications 
                    (staff_id, subject_id, qualification_level, certified_since, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    bulk_data.staff_id,
                    subject_id,
                    qualification_level,
                    certified_since,
                    datetime.now().isoformat()
                ))
                inserted_count += 1
        
        conn.commit()
        
        logger.info(f"Bulk update completed for teacher {bulk_data.staff_id}: {inserted_count} qualifications added")
        
        return {
            "success": True,
            "message": "Teacher qualifications updated successfully",
            "data": {
                "staff_id": bulk_data.staff_id,
                "qualified_count": inserted_count
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk_update_qualifications: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/{staff_id}/{subject_id}")
async def add_qualification(staff_id: int, subject_id: int, qual_data: TeacherQualificationCreate):
    """Add a qualification for a teacher"""
    logger.info(f"POST /api/teacher-qualifications/{staff_id}/{subject_id} - Adding qualification")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate staff exists
        if not validate_staff_exists(cursor, staff_id):
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        # Validate subject exists
        if not validate_subject_exists(cursor, subject_id):
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Check if already exists
        cursor.execute("""
            SELECT id FROM teacher_qualifications 
            WHERE staff_id = ? AND subject_id = ?
        """, (staff_id, subject_id))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Qualification already exists for this teacher and subject")
        
        # Insert qualification
        cursor.execute("""
            INSERT INTO teacher_qualifications 
            (staff_id, subject_id, qualification_level, certified_since, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            staff_id, subject_id, qual_data.qualification_level,
            qual_data.certified_since, datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Qualification added successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Qualification added successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in add_qualification: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{staff_id}/{subject_id}")
async def update_qualification(staff_id: int, subject_id: int, qual_data: TeacherQualificationUpdate):
    """Update a qualification for a teacher"""
    logger.info(f"PUT /api/teacher-qualifications/{staff_id}/{subject_id} - Updating qualification")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if qualification exists
        cursor.execute("""
            SELECT id FROM teacher_qualifications 
            WHERE staff_id = ? AND subject_id = ?
        """, (staff_id, subject_id))
        
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Qualification not found")
        
        # Build update query
        updates = []
        params = []
        
        if qual_data.qualification_level is not None:
            updates.append("qualification_level = ?")
            params.append(qual_data.qualification_level)
        
        if qual_data.certified_since is not None:
            updates.append("certified_since = ?")
            params.append(qual_data.certified_since)
        
        updates.append("version = version + 1")
        params.append(staff_id)
        params.append(subject_id)
        
        if updates:
            query = f"""
                UPDATE teacher_qualifications 
                SET {', '.join(updates)} 
                WHERE staff_id = ? AND subject_id = ?
            """
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Qualification updated for teacher {staff_id}, subject {subject_id}")
        
        return {
            "success": True,
            "message": "Qualification updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_qualification: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{staff_id}/{subject_id}")
async def remove_qualification(staff_id: int, subject_id: int):
    """Remove a qualification from a teacher"""
    logger.info(f"DELETE /api/teacher-qualifications/{staff_id}/{subject_id} - Removing qualification")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if qualification exists
        cursor.execute("""
            SELECT id FROM teacher_qualifications 
            WHERE staff_id = ? AND subject_id = ?
        """, (staff_id, subject_id))
        
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Qualification not found")
        
        # Delete qualification
        cursor.execute("""
            DELETE FROM teacher_qualifications 
            WHERE staff_id = ? AND subject_id = ?
        """, (staff_id, subject_id))
        
        conn.commit()
        
        logger.info(f"Qualification removed for teacher {staff_id}, subject {subject_id}")
        
        return {
            "success": True,
            "message": "Qualification removed successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in remove_qualification: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()


# ==================== Sync Integration Functions ====================

def sync_teacher_qualification_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync teacher qualification from external database"""
    try:
        logger.info("Syncing teacher qualification from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO teacher_qualifications (
                id, staff_id, subject_id, qualification_level, certified_since,
                version, synced_at, updated_by_sync
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('staff_id'),
            source_data.get('subject_id'),
            source_data.get('qualification_level'),
            source_data.get('certified_since'),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1
        ))  
        
        conn.commit()
        conn.close()
        logger.info("Teacher qualification synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing teacher qualification: {str(e)}")
        logger.error(traceback.format_exc())
        return False