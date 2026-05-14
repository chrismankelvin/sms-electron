# # app/school/assessments.py

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

# router = APIRouter(prefix="/api/assessments", tags=["assessments"])

# # ==================== Pydantic Models ====================

# class AssessmentBase(BaseModel):
#     name: str = Field(..., min_length=1, max_length=100)
#     type: Optional[str] = Field(None, pattern="^(quiz|test|exam|project|homework|classwork)$")
#     term_id: int
#     academic_year_id: int
#     subject_id: Optional[int] = None
#     weight: float = Field(..., ge=0, le=100)
#     max_score: float = Field(default=100, gt=0)
#     assessment_date: Optional[date] = None
#     description: Optional[str] = None
    
#     @validator('weight')
#     def validate_weight(cls, v):
#         if v < 0 or v > 100:
#             raise ValueError('Weight must be between 0 and 100')
#         return v

# class AssessmentCreate(AssessmentBase):
#     created_by: Optional[int] = None

# class AssessmentUpdate(BaseModel):
#     name: Optional[str] = Field(None, min_length=1, max_length=100)
#     type: Optional[str] = Field(None, pattern="^(quiz|test|exam|project|homework|classwork)$")
#     term_id: Optional[int] = None
#     academic_year_id: Optional[int] = None
#     subject_id: Optional[int] = None
#     weight: Optional[float] = Field(None, ge=0, le=100)
#     max_score: Optional[float] = Field(None, gt=0)
#     assessment_date: Optional[date] = None
#     description: Optional[str] = None
#     updated_by: Optional[int] = None

# class AssessmentResponse(BaseModel):
#     id: int
#     name: str
#     type: Optional[str]
#     term_id: int
#     academic_year_id: int
#     subject_id: Optional[int]
#     weight: float
#     max_score: float
#     assessment_date: Optional[date]
#     description: Optional[str]
#     version: int
#     created_at: datetime
#     updated_at: datetime

# class AssessmentTypeBase(BaseModel):
#     name: str = Field(..., min_length=1, max_length=50)
#     default_weight: float = Field(..., ge=0, le=100)
#     max_score: float = Field(default=100, gt=0)
#     applicable_levels: str = Field(default="BOTH", pattern="^(JHS|SHS|BOTH)$")

# class AssessmentTypeResponse(BaseModel):
#     id: int
#     name: str
#     default_weight: float
#     max_score: float
#     applicable_levels: str
#     version: int
#     created_at: datetime
#     updated_at: datetime

# # ==================== Helper Functions ====================

# def validate_term_exists(cursor, term_id: int, academic_year_id: int) -> bool:
#     """Validate that the term exists and belongs to the academic year"""
#     cursor.execute("""
#         SELECT id FROM terms 
#         WHERE id = ? AND academic_year_id = ?
#     """, (term_id, academic_year_id))
#     return cursor.fetchone() is not None

# def validate_academic_year_exists(cursor, academic_year_id: int) -> bool:
#     """Validate that the academic year exists"""
#     cursor.execute("SELECT id FROM academic_years WHERE id = ?", (academic_year_id,))
#     return cursor.fetchone() is not None

# def validate_subject_exists(cursor, subject_id: int) -> bool:
#     """Validate that the subject exists"""
#     cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
#     return cursor.fetchone() is not None

# def get_total_weight_by_term(cursor, term_id: int, exclude_assessment_id: Optional[int] = None) -> float:
#     """Get total assessment weight for a specific term"""
#     query = "SELECT SUM(weight) as total FROM assessments WHERE term_id = ?"
#     params = [term_id]
    
#     if exclude_assessment_id:
#         query += " AND id != ?"
#         params.append(exclude_assessment_id)
    
#     cursor.execute(query, params)
#     result = cursor.fetchone()
#     return result['total'] if result['total'] is not None else 0

# # ==================== Database Setup ====================

# def create_assessments_tables():
#     """Create assessments and assessments tables if they don't exist"""
#     try:
#         logger.info("Creating/checking assessments tables")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Create assessments table first
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS assessments (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 name TEXT NOT NULL UNIQUE,
#                 default_weight REAL NOT NULL CHECK (default_weight >= 0 AND default_weight <= 100),
#                 max_score REAL DEFAULT 100 CHECK (max_score > 0),
#                 applicable_levels TEXT DEFAULT 'BOTH',
#                 version INTEGER DEFAULT 1,
#                 synced_at TIMESTAMP,
#                 updated_by_sync INTEGER DEFAULT 0,
#                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                 created_by INTEGER,
#                 updated_by INTEGER,
#                 FOREIGN KEY (created_by) REFERENCES users(id),
#                 FOREIGN KEY (updated_by) REFERENCES users(id)
#             )
#         """)
#         logger.info("Assessment types table created/checked")
        
#         # Create assessments table
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS assessments (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 name TEXT NOT NULL,
#                 type TEXT,
#                 term_id INTEGER NOT NULL,
#                 academic_year_id INTEGER NOT NULL,
#                 subject_id INTEGER,
#                 weight REAL NOT NULL CHECK (weight >= 0 AND weight <= 100),
#                 max_score REAL DEFAULT 100 CHECK (max_score > 0),
#                 assessment_date TIMESTAMP,
#                 description TEXT,
#                 version INTEGER DEFAULT 1,
#                 synced_at TIMESTAMP,
#                 updated_by_sync INTEGER DEFAULT 0,
#                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                 created_by INTEGER,
#                 updated_by INTEGER,
#                 FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
#                 FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
#                 FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
#                 FOREIGN KEY (created_by) REFERENCES users(id),
#                 FOREIGN KEY (updated_by) REFERENCES users(id)
#             )
#         """)
#         logger.info("Assessments table created/checked")
        
#         # Check if assessments table is empty, insert default records
#         cursor.execute("SELECT COUNT(*) as count FROM assessments")
#         result = cursor.fetchone()
        
#         if result['count'] == 0:
#             logger.info("Inserting default assessment types")
#             default_types = [
#                 ("Quiz", 15, 100, "BOTH"),
#                 ("Test", 20, 100, "BOTH"),
#                 ("Project", 15, 100, "BOTH"),
#                 ("Homework", 10, 50, "BOTH"),
#                 ("Classwork", 10, 50, "BOTH"),
#                 ("Examination", 30, 100, "BOTH")
#             ]
            
#             for type_data in default_types:
#                 cursor.execute("""
#                     INSERT INTO assessments (name, default_weight, max_score, applicable_levels, created_at, updated_at)
#                     VALUES (?, ?, ?, ?, ?, ?)
#                 """, (*type_data, datetime.now().isoformat(), datetime.now().isoformat()))
            
#             conn.commit()
#             logger.info("Default assessment types inserted successfully")
        
#         conn.close()
#     except Exception as e:
#         logger.error(f"Error creating assessment tables: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise

# # Initialize tables on module load
# try:
#     # create_assessments_tables()
#     pass
# except Exception as e:
#     logger.error(f"Failed to initialize assessment tables: {str(e)}")

# # ==================== API Endpoints for Assessment Types ====================

# @router.get("/types")
# async def get_assessment_types():
#     """Get all assessment types"""
#     logger.info("GET /api/assessments/types - Fetching all assessment types")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT * FROM assessments 
#             ORDER BY id ASC
#         """)
        
#         results = cursor.fetchall()
#         assessment_types = []
        
#         for row in results:
#             assessment_types.append({
#                 "id": row['id'],
#                 "name": row['name'],
#                 "default_weight": row['default_weight'],
#                 "max_score": row['max_score'],
#                 "applicable_levels": row['applicable_levels'],
#                 "version": row['version'],
#                 "created_at": row['created_at'],
#                 "updated_at": row['updated_at']
#             })
        
#         logger.info(f"Retrieved {len(assessment_types)} assessment types")
        
#         return {
#             "success": True,
#             "data": assessment_types,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_assessment_types: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
#             logger.debug("Database connection closed")

# @router.post("/types")
# async def create_assessment_type(type_data: AssessmentTypeBase):
#     """Create a new assessment type"""
#     logger.info(f"POST /api/assessments/types - Creating new assessment type: {type_data.name}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if assessment type name already exists
#         cursor.execute("SELECT id FROM assessments WHERE name = ?", (type_data.name,))
#         if cursor.fetchone():
#             raise HTTPException(status_code=400, detail=f"Assessment type '{type_data.name}' already exists")
        
#         # Insert new assessment type
#         cursor.execute("""
#             INSERT INTO assessments (name, default_weight, max_score, applicable_levels, created_at, updated_at)
#             VALUES (?, ?, ?, ?, ?, ?)
#         """, (
#             type_data.name, type_data.default_weight, type_data.max_score,
#             type_data.applicable_levels, datetime.now().isoformat(), datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         new_id = cursor.lastrowid
        
#         logger.info(f"Assessment type created successfully with ID: {new_id}")
        
#         return {
#             "success": True,
#             "message": "Assessment type created successfully",
#             "data": {"id": new_id},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in create_assessment_type: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/types/{type_id}")
# async def update_assessment_type(type_id: int, type_data: AssessmentTypeBase):
#     """Update an assessment type"""
#     logger.info(f"PUT /api/assessments/types/{type_id} - Updating assessment type")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if assessment type exists
#         cursor.execute("SELECT id FROM assessments WHERE id = ?", (type_id,))
#         if not cursor.fetchone():
#             raise HTTPException(status_code=404, detail="Assessment type not found")
        
#         # Check if another assessment type has the same name
#         cursor.execute("SELECT id FROM assessments WHERE name = ? AND id != ?", (type_data.name, type_id))
#         if cursor.fetchone():
#             raise HTTPException(status_code=400, detail=f"Assessment type '{type_data.name}' already exists")
        
#         # Update assessment type
#         cursor.execute("""
#             UPDATE assessments 
#             SET name = ?, default_weight = ?, max_score = ?, applicable_levels = ?,
#                 version = version + 1, updated_at = ?
#             WHERE id = ?
#         """, (
#             type_data.name, type_data.default_weight, type_data.max_score,
#             type_data.applicable_levels, datetime.now().isoformat(), type_id
#         ))
#         conn.commit()
        
#         logger.info(f"Assessment type {type_id} updated successfully")
        
#         return {
#             "success": True,
#             "message": "Assessment type updated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in update_assessment_type: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.delete("/types/{type_id}")
# async def delete_assessment_type(type_id: int):
#     """Delete an assessment type"""
#     logger.info(f"DELETE /api/assessments/types/{type_id} - Deleting assessment type")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if assessment type exists
#         cursor.execute("SELECT name FROM assessments WHERE id = ?", (type_id,))
#         assessment_type = cursor.fetchone()
        
#         if not assessment_type:
#             raise HTTPException(status_code=404, detail="Assessment type not found")
        
#         # Delete the assessment type
#         cursor.execute("DELETE FROM assessments WHERE id = ?", (type_id,))
#         conn.commit()
        
#         logger.info(f"Assessment type {type_id} ({assessment_type['name']}) deleted successfully")
        
#         return {
#             "success": True,
#             "message": f"Assessment type '{assessment_type['name']}' deleted successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in delete_assessment_type: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/types/weight-summary")
# async def get_weight_summary():
#     """Get weight summary for all assessment types"""
#     logger.info("GET /api/assessments/types/weight-summary - Getting weight summary")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT name, default_weight, max_score, applicable_levels 
#             FROM assessments 
#             ORDER BY id ASC
#         """)
        
#         results = cursor.fetchall()
#         total_weight = sum(row['default_weight'] for row in results)
        
#         return {
#             "success": True,
#             "data": {
#                 "total_weight": total_weight,
#                 "is_valid": total_weight == 100,
#                 "assessments": [
#                     {
#                         "name": row['name'],
#                         "default_weight": row['default_weight'],
#                         "max_score": row['max_score'],
#                         "applicable_levels": row['applicable_levels']
#                     }
#                     for row in results
#                 ]
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_weight_summary: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== API Endpoints for Assessments ====================

# @router.get("/")
# async def get_assessments(term_id: Optional[int] = None, academic_year_id: Optional[int] = None):
#     """Get all assessments, optionally filtered by term or academic year"""
#     logger.info(f"GET /api/assessments/ - Fetching assessments (term_id={term_id}, academic_year_id={academic_year_id})")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         query = "SELECT * FROM assessments WHERE 1=1"
#         params = []
        
#         if term_id:
#             query += " AND term_id = ?"
#             params.append(term_id)
        
#         if academic_year_id:
#             query += " AND academic_year_id = ?"
#             params.append(academic_year_id)
        
#         query += " ORDER BY assessment_date ASC"
        
#         cursor.execute(query, params)
#         results = cursor.fetchall()
#         assessments = []
        
#         for row in results:
#             assessments.append({
#                 "id": row['id'],
#                 "name": row['name'],
#                 "type": row['type'],
#                 "term_id": row['term_id'],
#                 "academic_year_id": row['academic_year_id'],
#                 "subject_id": row['subject_id'],
#                 "weight": row['weight'],
#                 "max_score": row['max_score'],
#                 "assessment_date": row['assessment_date'],
#                 "description": row['description'],
#                 "version": row['version'],
#                 "created_at": row['created_at'],
#                 "updated_at": row['updated_at']
#             })
        
#         logger.info(f"Retrieved {len(assessments)} assessments")
        
#         return {
#             "success": True,
#             "data": assessments,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_assessments: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/{assessment_id}")
# async def get_assessment(assessment_id: int):
#     """Get a specific assessment by ID"""
#     logger.info(f"GET /api/assessments/{assessment_id} - Fetching assessment")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Assessment not found")
        
#         assessment = {
#             "id": result['id'],
#             "name": result['name'],
#             "type": result['type'],
#             "term_id": result['term_id'],
#             "academic_year_id": result['academic_year_id'],
#             "subject_id": result['subject_id'],
#             "weight": result['weight'],
#             "max_score": result['max_score'],
#             "assessment_date": result['assessment_date'],
#             "description": result['description'],
#             "version": result['version'],
#             "created_at": result['created_at'],
#             "updated_at": result['updated_at']
#         }
        
#         return {
#             "success": True,
#             "data": assessment,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_assessment: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/")
# async def create_assessment(assessment_data: AssessmentCreate):
#     """Create a new assessment"""
#     logger.info(f"POST /api/assessments/ - Creating new assessment: {assessment_data.name}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Validate academic year exists
#         if not validate_academic_year_exists(cursor, assessment_data.academic_year_id):
#             raise HTTPException(status_code=400, detail="Academic year not found")
        
#         # Validate term exists and belongs to academic year
#         if not validate_term_exists(cursor, assessment_data.term_id, assessment_data.academic_year_id):
#             raise HTTPException(status_code=400, detail="Term not found or does not belong to the specified academic year")
        
#         # Validate subject exists if provided
#         if assessment_data.subject_id:
#             if not validate_subject_exists(cursor, assessment_data.subject_id):
#                 raise HTTPException(status_code=400, detail="Subject not found")
        
#         # Check total weight for the term
#         total_weight = get_total_weight_by_term(cursor, assessment_data.term_id)
#         if total_weight + assessment_data.weight > 100:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Total assessment weight for term would exceed 100%. Current: {total_weight}%, Adding: {assessment_data.weight}%"
#             )
        
#         # Insert new assessment
#         cursor.execute("""
#             INSERT INTO assessments (
#                 name, type, term_id, academic_year_id, subject_id, weight, 
#                 max_score, assessment_date, description, created_by, created_at, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             assessment_data.name, assessment_data.type, assessment_data.term_id,
#             assessment_data.academic_year_id, assessment_data.subject_id, assessment_data.weight,
#             assessment_data.max_score, assessment_data.assessment_date, assessment_data.description,
#             assessment_data.created_by, datetime.now().isoformat(), datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         new_id = cursor.lastrowid
        
#         logger.info(f"Assessment created successfully with ID: {new_id}")
        
#         return {
#             "success": True,
#             "message": "Assessment created successfully",
#             "data": {"id": new_id},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in create_assessment: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/{assessment_id}")
# async def update_assessment(assessment_id: int, assessment_data: AssessmentUpdate):
#     """Update an assessment"""
#     logger.info(f"PUT /api/assessments/{assessment_id} - Updating assessment")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if assessment exists
#         cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
#         existing = cursor.fetchone()
        
#         if not existing:
#             raise HTTPException(status_code=404, detail="Assessment not found")
        
#         # Build update query dynamically
#         updates = []
#         params = []
        
#         # Validate if fields are being updated
#         if assessment_data.term_id is not None or assessment_data.academic_year_id is not None:
#             term_id = assessment_data.term_id if assessment_data.term_id is not None else existing['term_id']
#             academic_year_id = assessment_data.academic_year_id if assessment_data.academic_year_id is not None else existing['academic_year_id']
            
#             if not validate_term_exists(cursor, term_id, academic_year_id):
#                 raise HTTPException(status_code=400, detail="Term not found or does not belong to the specified academic year")
        
#         if assessment_data.academic_year_id is not None:
#             if not validate_academic_year_exists(cursor, assessment_data.academic_year_id):
#                 raise HTTPException(status_code=400, detail="Academic year not found")
#             updates.append("academic_year_id = ?")
#             params.append(assessment_data.academic_year_id)
        
#         if assessment_data.subject_id is not None:
#             if assessment_data.subject_id > 0 and not validate_subject_exists(cursor, assessment_data.subject_id):
#                 raise HTTPException(status_code=400, detail="Subject not found")
#             updates.append("subject_id = ?")
#             params.append(assessment_data.subject_id if assessment_data.subject_id > 0 else None)
        
#         # Check weight constraint if weight is being updated
#         if assessment_data.weight is not None:
#             term_id = assessment_data.term_id if assessment_data.term_id is not None else existing['term_id']
#             total_weight = get_total_weight_by_term(cursor, term_id, assessment_id)
#             if total_weight + assessment_data.weight > 100:
#                 raise HTTPException(
#                     status_code=400,
#                     detail=f"Total assessment weight for term would exceed 100%. Current (excluding this): {total_weight}%, Adding: {assessment_data.weight}%"
#                 )
#             updates.append("weight = ?")
#             params.append(assessment_data.weight)
        
#         if assessment_data.name is not None:
#             updates.append("name = ?")
#             params.append(assessment_data.name)
        
#         if assessment_data.type is not None:
#             updates.append("type = ?")
#             params.append(assessment_data.type)
        
#         if assessment_data.term_id is not None:
#             updates.append("term_id = ?")
#             params.append(assessment_data.term_id)
        
#         if assessment_data.max_score is not None:
#             updates.append("max_score = ?")
#             params.append(assessment_data.max_score)
        
#         if assessment_data.assessment_date is not None:
#             updates.append("assessment_date = ?")
#             params.append(assessment_data.assessment_date)
        
#         if assessment_data.description is not None:
#             updates.append("description = ?")
#             params.append(assessment_data.description)
        
#         if assessment_data.updated_by is not None:
#             updates.append("updated_by = ?")
#             params.append(assessment_data.updated_by)
        
#         # Add version increment and update timestamp
#         updates.append("version = version + 1")
#         updates.append("updated_at = ?")
#         params.append(datetime.now().isoformat())
        
#         # Execute update
#         if updates:
#             params.append(assessment_id)
#             query = f"UPDATE assessments SET {', '.join(updates)} WHERE id = ?"
#             cursor.execute(query, params)
#             conn.commit()
#             logger.info(f"Assessment {assessment_id} updated successfully")
        
#         return {
#             "success": True,
#             "message": "Assessment updated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in update_assessment: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.delete("/{assessment_id}")
# async def delete_assessment(assessment_id: int):
#     """Delete an assessment"""
#     logger.info(f"DELETE /api/assessments/{assessment_id} - Deleting assessment")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if assessment exists
#         cursor.execute("SELECT name FROM assessments WHERE id = ?", (assessment_id,))
#         assessment = cursor.fetchone()
        
#         if not assessment:
#             raise HTTPException(status_code=404, detail="Assessment not found")
        
#         # Delete the assessment
#         cursor.execute("DELETE FROM assessments WHERE id = ?", (assessment_id,))
#         conn.commit()
        
#         logger.info(f"Assessment {assessment_id} ({assessment['name']}) deleted successfully")
        
#         return {
#             "success": True,
#             "message": f"Assessment '{assessment['name']}' deleted successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in delete_assessment: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Sync Integration Functions ====================

# def sync_assessment_from_external(source_data: Dict[str, Any]) -> bool:
#     """Sync assessment from external database"""
#     try:
#         logger.info("Syncing assessment from external source")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             INSERT OR REPLACE INTO assessments (
#                 id, name, type, term_id, academic_year_id, subject_id, weight,
#                 max_score, assessment_date, description, version, synced_at, 
#                 updated_by_sync, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             source_data.get('id'),
#             source_data.get('name'),
#             source_data.get('type'),
#             source_data.get('term_id'),
#             source_data.get('academic_year_id'),
#             source_data.get('subject_id'),
#             source_data.get('weight'),
#             source_data.get('max_score', 100),
#             source_data.get('assessment_date'),
#             source_data.get('description'),
#             source_data.get('version', 1),
#             datetime.now().isoformat(),
#             1,
#             datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         conn.close()
#         logger.info("Assessment synced successfully")
#         return True
        
#     except Exception as e:
#         logger.error(f"Error syncing assessment: {str(e)}")
#         logger.error(traceback.format_exc())
#         return False














































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

router = APIRouter(prefix="/api/assessments", tags=["assessments"])

# ==================== Pydantic Models ====================

class AssessmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., pattern="^(quiz|test|exam|project|homework|classwork)$")
    term_id: int
    academic_year_id: int
    subject_id: Optional[int] = None
    weight: float = Field(..., ge=0, le=100)
    max_score: float = Field(default=100, ge=1)
    assessment_date: Optional[date] = None
    description: Optional[str] = None

class AssessmentCreate(AssessmentBase):
    created_by: Optional[int] = None

class AssessmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[str] = Field(None, pattern="^(quiz|test|exam|project|homework|classwork)$")
    term_id: Optional[int] = None
    academic_year_id: Optional[int] = None
    subject_id: Optional[int] = None
    weight: Optional[float] = Field(None, ge=0, le=100)
    max_score: Optional[float] = Field(None, ge=1)
    assessment_date: Optional[date] = None
    description: Optional[str] = None
    updated_by: Optional[int] = None

class AssessmentResponse(BaseModel):
    id: int
    name: str
    type: str
    term_id: int
    term_name: str
    academic_year_id: int
    academic_year_label: str
    subject_id: Optional[int]
    subject_name: Optional[str]
    weight: float
    max_score: float
    assessment_date: Optional[date]
    description: Optional[str]
    version: int
    created_at: datetime
    updated_at: datetime

# ==================== Helper Functions ====================

def get_term_name(cursor, term_id: int) -> str:
    """Get term name"""
    cursor.execute("SELECT name FROM terms WHERE id = ?", (term_id,))
    result = cursor.fetchone()
    return result['name'] if result else f"Term {term_id}"

def get_academic_year_label(cursor, academic_year_id: int) -> str:
    """Get academic year label"""
    cursor.execute("SELECT year_label FROM academic_years WHERE id = ?", (academic_year_id,))
    result = cursor.fetchone()
    return result['year_label'] if result else "Unknown"

def get_subject_name(cursor, subject_id: int) -> Optional[str]:
    """Get subject name"""
    if not subject_id:
        return None
    cursor.execute("SELECT name FROM subjects WHERE id = ?", (subject_id,))
    result = cursor.fetchone()
    return result['name'] if result else None

def validate_term_exists(cursor, term_id: int) -> bool:
    """Validate that the term exists"""
    cursor.execute("SELECT id FROM terms WHERE id = ?", (term_id,))
    return cursor.fetchone() is not None

def validate_academic_year_exists(cursor, academic_year_id: int) -> bool:
    """Validate that the academic year exists"""
    cursor.execute("SELECT id FROM academic_years WHERE id = ?", (academic_year_id,))
    return cursor.fetchone() is not None

def validate_subject_exists(cursor, subject_id: int) -> bool:
    """Validate that the subject exists"""
    if not subject_id:
        return True
    cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
    return cursor.fetchone() is not None

def check_total_weight(cursor, academic_year_id: int, term_id: int, exclude_id: Optional[int] = None) -> float:
    """Get total weight for assessments in a term and academic year"""
    query = """
        SELECT SUM(weight) as total FROM assessments 
        WHERE academic_year_id = ? AND term_id = ?
    """
    params = [academic_year_id, term_id]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    result = cursor.fetchone()
    return result['total'] if result['total'] else 0

# ==================== Database Setup ====================

def create_assessments_table():
    """Create assessments table if it doesn't exist"""
    try:
        logger.info("Creating/checking assessments table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='assessments'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE assessments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    type TEXT CHECK (type IN ('quiz','test','exam','project','homework','classwork')),
                    term_id INTEGER NOT NULL,
                    academic_year_id INTEGER NOT NULL,
                    subject_id INTEGER,
                    weight REAL CHECK (weight >= 0 AND weight <= 100),
                    max_score REAL DEFAULT 100,
                    assessment_date DATE,
                    description TEXT,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync BOOLEAN DEFAULT 0,
                    sync_error TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
                    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (updated_by) REFERENCES users(id)
                )
            """)
            logger.info("New assessments table created")
        else:
            logger.info("Table 'assessments' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(assessments)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'version' not in column_names:
                logger.info("Adding version column")
                cursor.execute("ALTER TABLE assessments ADD COLUMN version INTEGER DEFAULT 1")
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE assessments ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE assessments ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0")
            
            if 'sync_error' not in column_names:
                logger.info("Adding sync_error column")
                cursor.execute("ALTER TABLE assessments ADD COLUMN sync_error TEXT")
            
            if 'created_by' not in column_names:
                logger.info("Adding created_by column")
                cursor.execute("ALTER TABLE assessments ADD COLUMN created_by INTEGER")
            
            if 'updated_by' not in column_names:
                logger.info("Adding updated_by column")
                cursor.execute("ALTER TABLE assessments ADD COLUMN updated_by INTEGER")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating assessments table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_assessments_table()
except Exception as e:
    logger.error(f"Failed to initialize assessments table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_assessments(
    term_id: Optional[int] = None,
    academic_year_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    assessment_type: Optional[str] = None
):
    """Get all assessments with optional filters"""
    logger.info(f"GET /api/assessments/ - Fetching assessments")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT a.*, 
                   t.name as term_name,
                   ay.year_label as academic_year_label,
                   s.name as subject_name
            FROM assessments a
            JOIN terms t ON a.term_id = t.id
            JOIN academic_years ay ON a.academic_year_id = ay.id
            LEFT JOIN subjects s ON a.subject_id = s.id
            WHERE 1=1
        """
        params = []
        
        if term_id:
            query += " AND a.term_id = ?"
            params.append(term_id)
        
        if academic_year_id:
            query += " AND a.academic_year_id = ?"
            params.append(academic_year_id)
        
        if subject_id:
            query += " AND a.subject_id = ?"
            params.append(subject_id)
        
        if assessment_type:
            query += " AND a.type = ?"
            params.append(assessment_type)
        
        query += " ORDER BY a.assessment_date DESC, a.created_at DESC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        assessments = []
        for row in results:
            assessments.append({
                "id": row['id'],
                "name": row['name'],
                "type": row['type'],
                "term_id": row['term_id'],
                "term_name": row['term_name'],
                "academic_year_id": row['academic_year_id'],
                "academic_year_label": row['academic_year_label'],
                "subject_id": row['subject_id'],
                "subject_name": row['subject_name'],
                "weight": row['weight'],
                "max_score": row['max_score'],
                "assessment_date": row['assessment_date'],
                "description": row['description'],
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(assessments)} assessments")
        
        return {
            "success": True,
            "data": assessments,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_assessments: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{assessment_id}")
async def get_assessment(assessment_id: int):
    """Get a specific assessment by ID"""
    logger.info(f"GET /api/assessments/{assessment_id} - Fetching assessment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT a.*, 
                   t.name as term_name,
                   ay.year_label as academic_year_label,
                   s.name as subject_name
            FROM assessments a
            JOIN terms t ON a.term_id = t.id
            JOIN academic_years ay ON a.academic_year_id = ay.id
            LEFT JOIN subjects s ON a.subject_id = s.id
            WHERE a.id = ?
        """, (assessment_id,))
        
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        assessment = {
            "id": result['id'],
            "name": result['name'],
            "type": result['type'],
            "term_id": result['term_id'],
            "term_name": result['term_name'],
            "academic_year_id": result['academic_year_id'],
            "academic_year_label": result['academic_year_label'],
            "subject_id": result['subject_id'],
            "subject_name": result['subject_name'],
            "weight": result['weight'],
            "max_score": result['max_score'],
            "assessment_date": result['assessment_date'],
            "description": result['description'],
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": assessment,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_assessment: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/weight-summary/{academic_year_id}/{term_id}")
async def get_weight_summary(academic_year_id: int, term_id: int):
    """Get weight summary for a specific academic year and term"""
    logger.info(f"GET /api/assessments/weight-summary/{academic_year_id}/{term_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        total_weight = check_total_weight(cursor, academic_year_id, term_id)
        
        return {
            "success": True,
            "data": {
                "academic_year_id": academic_year_id,
                "term_id": term_id,
                "total_weight": total_weight,
                "remaining": 100 - total_weight,
                "is_valid": total_weight == 100
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_weight_summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_assessment(assessment_data: AssessmentCreate):
    """Create a new assessment"""
    logger.info(f"POST /api/assessments/ - Creating new assessment: {assessment_data.name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate foreign keys
        if not validate_term_exists(cursor, assessment_data.term_id):
            raise HTTPException(status_code=400, detail="Term not found")
        
        if not validate_academic_year_exists(cursor, assessment_data.academic_year_id):
            raise HTTPException(status_code=400, detail="Academic year not found")
        
        if assessment_data.subject_id and not validate_subject_exists(cursor, assessment_data.subject_id):
            raise HTTPException(status_code=400, detail="Subject not found")
        
        # Check total weight doesn't exceed 100
        current_total = check_total_weight(cursor, assessment_data.academic_year_id, assessment_data.term_id)
        new_total = current_total + assessment_data.weight
        
        if new_total > 100:
            raise HTTPException(
                status_code=400,
                detail=f"Total weight would exceed 100%. Current total: {current_total}%, Adding: {assessment_data.weight}%"
            )
        
        # Insert assessment
        cursor.execute("""
            INSERT INTO assessments (
                name, type, term_id, academic_year_id, subject_id, weight,
                max_score, assessment_date, description, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            assessment_data.name, assessment_data.type,
            assessment_data.term_id, assessment_data.academic_year_id,
            assessment_data.subject_id, assessment_data.weight,
            assessment_data.max_score, assessment_data.assessment_date,
            assessment_data.description, assessment_data.created_by,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Assessment created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Assessment created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_assessment: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{assessment_id}")
async def update_assessment(assessment_id: int, assessment_data: AssessmentUpdate):
    """Update an assessment"""
    logger.info(f"PUT /api/assessments/{assessment_id} - Updating assessment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if assessment exists
        cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Build update query
        updates = []
        params = []
        
        # Get values for validation
        new_term_id = assessment_data.term_id if assessment_data.term_id is not None else existing['term_id']
        new_academic_year_id = assessment_data.academic_year_id if assessment_data.academic_year_id is not None else existing['academic_year_id']
        new_weight = assessment_data.weight if assessment_data.weight is not None else existing['weight']
        
        # Validate foreign keys if being updated
        if assessment_data.term_id is not None and not validate_term_exists(cursor, assessment_data.term_id):
            raise HTTPException(status_code=400, detail="Term not found")
        
        if assessment_data.academic_year_id is not None and not validate_academic_year_exists(cursor, assessment_data.academic_year_id):
            raise HTTPException(status_code=400, detail="Academic year not found")
        
        if assessment_data.subject_id is not None and assessment_data.subject_id != 0:
            if not validate_subject_exists(cursor, assessment_data.subject_id):
                raise HTTPException(status_code=400, detail="Subject not found")
        
        # Check total weight doesn't exceed 100
        if assessment_data.weight is not None or assessment_data.term_id is not None or assessment_data.academic_year_id is not None:
            current_total = check_total_weight(cursor, new_academic_year_id, new_term_id, assessment_id)
            new_total = current_total + new_weight
            
            if new_total > 100:
                raise HTTPException(
                    status_code=400,
                    detail=f"Total weight would exceed 100%. Current total (excluding this): {current_total}%, New weight: {new_weight}%"
                )
        
        # Apply updates
        if assessment_data.name is not None:
            updates.append("name = ?")
            params.append(assessment_data.name)
        
        if assessment_data.type is not None:
            updates.append("type = ?")
            params.append(assessment_data.type)
        
        if assessment_data.term_id is not None:
            updates.append("term_id = ?")
            params.append(assessment_data.term_id)
        
        if assessment_data.academic_year_id is not None:
            updates.append("academic_year_id = ?")
            params.append(assessment_data.academic_year_id)
        
        if assessment_data.subject_id is not None:
            updates.append("subject_id = ?")
            params.append(assessment_data.subject_id if assessment_data.subject_id != 0 else None)
        
        if assessment_data.weight is not None:
            updates.append("weight = ?")
            params.append(assessment_data.weight)
        
        if assessment_data.max_score is not None:
            updates.append("max_score = ?")
            params.append(assessment_data.max_score)
        
        if assessment_data.assessment_date is not None:
            updates.append("assessment_date = ?")
            params.append(assessment_data.assessment_date)
        
        if assessment_data.description is not None:
            updates.append("description = ?")
            params.append(assessment_data.description)
        
        if assessment_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(assessment_data.updated_by)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(assessment_id)
            query = f"UPDATE assessments SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Assessment {assessment_id} updated successfully")
        
        return {
            "success": True,
            "message": "Assessment updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_assessment: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{assessment_id}")
async def delete_assessment(assessment_id: int):
    """Delete an assessment"""
    logger.info(f"DELETE /api/assessments/{assessment_id} - Deleting assessment")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if assessment exists
        cursor.execute("SELECT name FROM assessments WHERE id = ?", (assessment_id,))
        assessment = cursor.fetchone()
        
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Delete the assessment
        cursor.execute("DELETE FROM assessments WHERE id = ?", (assessment_id,))
        conn.commit()
        
        logger.info(f"Assessment {assessment_id} ({assessment['name']}) deleted successfully")
        
        return {
            "success": True,
            "message": f"Assessment '{assessment['name']}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_assessment: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()




