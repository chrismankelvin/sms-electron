# # app/school/grade_boundaries.py

# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel, Field, validator
# from typing import Optional, Dict, Any, List
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

# router = APIRouter(prefix="/api/grade-boundaries", tags=["grade-boundaries"])

# # ==================== Pydantic Models ====================

# class GradeBoundaryBase(BaseModel):
#     grade: str = Field(..., min_length=1, max_length=10)
#     min_score: float = Field(..., ge=0, le=100)
#     max_score: float = Field(..., ge=0, le=100)
#     remark: Optional[str] = None
#     grade_point: float = Field(default=0.0, ge=0, le=4)
#     level_category: str = Field(default="BOTH", pattern="^(JHS|SHS|BOTH)$")
#     is_default: bool = False
    
#     @validator('max_score')
#     def validate_scores(cls, max_score, values):
#         if 'min_score' in values and max_score <= values['min_score']:
#             raise ValueError('Max score must be greater than min score')
#         return max_score

# class GradeBoundaryCreate(GradeBoundaryBase):
#     created_by: Optional[int] = None

# class GradeBoundaryUpdate(BaseModel):
#     grade: Optional[str] = Field(None, min_length=1, max_length=10)
#     min_score: Optional[float] = Field(None, ge=0, le=100)
#     max_score: Optional[float] = Field(None, ge=0, le=100)
#     remark: Optional[str] = None
#     grade_point: Optional[float] = Field(None, ge=0, le=4)
#     level_category: Optional[str] = Field(None, pattern="^(JHS|SHS|BOTH)$")
#     is_default: Optional[bool] = None
#     updated_by: Optional[int] = None

# class GradeBoundaryResponse(BaseModel):
#     id: int
#     grade: str
#     min_score: float
#     max_score: float
#     remark: Optional[str]
#     grade_point: float
#     level_category: str
#     is_default: bool
#     version: int
#     created_at: datetime
#     updated_at: datetime

# # ==================== Helper Functions ====================

# def validate_no_overlap(cursor, grade_data, exclude_id: Optional[int] = None):
#     """Check if score range overlaps with existing grades in the same category"""
    
#     # Determine which level categories to check
#     categories_to_check = []
#     if grade_data.level_category == 'BOTH':
#         categories_to_check = ['JHS', 'SHS', 'BOTH']
#     else:
#         categories_to_check = [grade_data.level_category, 'BOTH']
    
#     for category in categories_to_check:
#         query = """
#             SELECT id, grade, min_score, max_score FROM grade_boundaries 
#             WHERE level_category IN (?, 'BOTH')
#             AND (
#                 (min_score <= ? AND max_score >= ?) OR
#                 (min_score <= ? AND max_score >= ?) OR
#                 (min_score >= ? AND max_score <= ?)
#             )
#         """
#         params = [category, 
#                   grade_data.max_score, grade_data.min_score,
#                   grade_data.max_score, grade_data.min_score,
#                   grade_data.min_score, grade_data.max_score]
        
#         if exclude_id:
#             query += " AND id != ?"
#             params.append(exclude_id)
        
#         cursor.execute(query, params)
#         overlapping = cursor.fetchone()
        
#         if overlapping:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Score range overlaps with grade {overlapping['grade']} ({overlapping['min_score']}-{overlapping['max_score']}) in category {category}"
#             )

# def ensure_unique_grade_name(cursor, grade: str, level_category: str, exclude_id: Optional[int] = None):
#     """Ensure grade name is unique within the same level category"""
#     categories_to_check = []
#     if level_category == 'BOTH':
#         categories_to_check = ['JHS', 'SHS', 'BOTH']
#     else:
#         categories_to_check = [level_category]
    
#     for category in categories_to_check:
#         query = "SELECT id FROM grade_boundaries WHERE grade = ? AND level_category = ?"
#         params = [grade, category]
        
#         if exclude_id:
#             query += " AND id != ?"
#             params.append(exclude_id)
        
#         cursor.execute(query, params)
#         if cursor.fetchone():
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Grade '{grade}' already exists for category {category}"
#             )

# def get_grade_for_score(cursor, score: float, level_category: str) -> Dict[str, Any]:
#     """Get grade details for a given score"""
#     query = """
#         SELECT * FROM grade_boundaries 
#         WHERE level_category IN (?, 'BOTH')
#         AND min_score <= ? AND max_score >= ?
#         ORDER BY min_score DESC
#         LIMIT 1
#     """
#     cursor.execute(query, (level_category, score, score))
#     result = cursor.fetchone()
    
#     if result:
#         return {
#             "grade": result['grade'],
#             "remark": result['remark'],
#             "grade_point": result['grade_point']
#         }
#     return {"grade": "N/A", "remark": "Invalid Score", "grade_point": 0}

# # ==================== Database Setup ====================

# def create_grade_boundaries_table():
#     """Create grade_boundaries table if it doesn't exist"""
#     try:
#         logger.info("Creating/checking grade_boundaries table")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if table exists
#         cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='grade_boundaries'")
#         table_exists = cursor.fetchone()
        
#         if not table_exists:
#             # Create new table with all columns
#             cursor.execute("""
#                 CREATE TABLE grade_boundaries (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     grade TEXT NOT NULL,
#                     min_score REAL NOT NULL,
#                     max_score REAL NOT NULL,
#                     remark TEXT,
#                     grade_point REAL DEFAULT 0,
#                     level_category TEXT DEFAULT 'BOTH',
#                     is_default INTEGER DEFAULT 0,
#                     version INTEGER DEFAULT 1,
#                     synced_at TIMESTAMP,
#                     updated_by_sync INTEGER DEFAULT 0,
#                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                     created_by INTEGER,
#                     updated_by INTEGER,
#                     FOREIGN KEY (created_by) REFERENCES users(id),
#                     FOREIGN KEY (updated_by) REFERENCES users(id)
#                 )
#             """)
#             logger.info("New grade_boundaries table created")
            
#             # Insert default grades
#             logger.info("Inserting default grade boundaries")
#             default_grades = [
#                 ("A", 80, 100, "Excellent", 4.0, "BOTH", 1),
#                 ("B", 70, 79, "Very Good", 3.0, "BOTH", 1),
#                 ("C", 60, 69, "Good", 2.0, "BOTH", 1),
#                 ("D", 50, 59, "Credit", 1.0, "BOTH", 1),
#                 ("E", 40, 49, "Pass", 0.5, "BOTH", 1),
#                 ("F", 0, 39, "Fail", 0.0, "BOTH", 1)
#             ]
            
#             for grade in default_grades:
#                 cursor.execute("""
#                     INSERT INTO grade_boundaries (
#                         grade, min_score, max_score, remark, grade_point, 
#                         level_category, is_default, created_at, updated_at
#                     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
#                 """, (*grade, datetime.now().isoformat(), datetime.now().isoformat()))
            
#             conn.commit()
#             logger.info("Default grades inserted successfully")
#         else:
#             logger.info("Table 'grade_boundaries' already exists, checking columns")
            
#             # Add missing columns if needed
#             cursor.execute("PRAGMA table_info(grade_boundaries)")
#             columns = cursor.fetchall()
#             # column_names = [col['name'] for col in columns]
#             column_names = [col[1] for col in columns]
            
#             if 'synced_at' not in column_names:
#                 logger.info("Adding synced_at column")
#                 cursor.execute("ALTER TABLE grade_boundaries ADD COLUMN synced_at TIMESTAMP")
            
#             if 'updated_by_sync' not in column_names:
#                 logger.info("Adding updated_by_sync column")
#                 cursor.execute("ALTER TABLE grade_boundaries ADD COLUMN updated_by_sync INTEGER DEFAULT 0")
            
#             if 'created_by' not in column_names:
#                 logger.info("Adding created_by column")
#                 cursor.execute("ALTER TABLE grade_boundaries ADD COLUMN created_by INTEGER")
            
#             if 'updated_by' not in column_names:
#                 logger.info("Adding updated_by column")
#                 cursor.execute("ALTER TABLE grade_boundaries ADD COLUMN updated_by INTEGER")
            
#             conn.commit()
#             logger.info("Table structure updated successfully")
        
#         conn.close()
#     except Exception as e:
#         logger.error(f"Error creating/updating grade_boundaries table: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise

# # Initialize table on module load
# try:
#     create_grade_boundaries_table()
# except Exception as e:
#     logger.error(f"Failed to initialize grade_boundaries table: {str(e)}")

# # ==================== API Endpoints ====================

# @router.get("/")
# async def get_grade_boundaries(level_category: Optional[str] = None):
#     """Get all grade boundaries, optionally filtered by level category"""
#     logger.info(f"GET /api/grade-boundaries/ - Fetching grade boundaries (level_category={level_category})")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         if level_category and level_category != 'BOTH':
#             query = """
#                 SELECT * FROM grade_boundaries 
#                 WHERE level_category = ? OR level_category = 'BOTH'
#                 ORDER BY min_score DESC
#             """
#             cursor.execute(query, (level_category,))
#         else:
#             cursor.execute("""
#                 SELECT * FROM grade_boundaries 
#                 ORDER BY min_score DESC
#             """)
        
#         results = cursor.fetchall()
#         grade_boundaries = []
        
#         for row in results:
#             grade_boundaries.append({
#                 "id": row['id'],
#                 "grade": row['grade'],
#                 "min_score": row['min_score'],
#                 "max_score": row['max_score'],
#                 "remark": row['remark'],
#                 "grade_point": row['grade_point'],
#                 "level_category": row['level_category'],
#                 "is_default": bool(row['is_default']),
#                 "version": row['version'],
#                 "created_at": row['created_at'],
#                 "updated_at": row['updated_at']
#             })
        
#         logger.info(f"Retrieved {len(grade_boundaries)} grade boundaries")
        
#         return {
#             "success": True,
#             "data": grade_boundaries,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_grade_boundaries: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
#             logger.debug("Database connection closed")

# @router.get("/{grade_id}")
# async def get_grade_boundary(grade_id: int):
#     """Get a specific grade boundary by ID"""
#     logger.info(f"GET /api/grade-boundaries/{grade_id} - Fetching grade boundary")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("SELECT * FROM grade_boundaries WHERE id = ?", (grade_id,))
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Grade boundary not found")
        
#         grade = {
#             "id": result['id'],
#             "grade": result['grade'],
#             "min_score": result['min_score'],
#             "max_score": result['max_score'],
#             "remark": result['remark'],
#             "grade_point": result['grade_point'],
#             "level_category": result['level_category'],
#             "is_default": bool(result['is_default']),
#             "version": result['version'],
#             "created_at": result['created_at'],
#             "updated_at": result['updated_at']
#         }
        
#         return {
#             "success": True,
#             "data": grade,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_grade_boundary: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/")
# async def create_grade_boundary(grade_data: GradeBoundaryCreate):
#     """Create a new grade boundary"""
#     logger.info(f"POST /api/grade-boundaries/ - Creating new grade: {grade_data.grade}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Ensure grade name is unique within category
#         ensure_unique_grade_name(cursor, grade_data.grade, grade_data.level_category)
        
#         # Check for overlapping score ranges
#         validate_no_overlap(cursor, grade_data)
        
#         # Insert new grade boundary
#         cursor.execute("""
#             INSERT INTO grade_boundaries (
#                 grade, min_score, max_score, remark, grade_point, 
#                 level_category, is_default, created_by, created_at, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             grade_data.grade, grade_data.min_score, grade_data.max_score,
#             grade_data.remark, grade_data.grade_point, grade_data.level_category,
#             grade_data.is_default, grade_data.created_by,
#             datetime.now().isoformat(), datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         new_id = cursor.lastrowid
        
#         logger.info(f"Grade boundary created successfully with ID: {new_id}")
        
#         return {
#             "success": True,
#             "message": "Grade boundary created successfully",
#             "data": {"id": new_id},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in create_grade_boundary: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/{grade_id}")
# async def update_grade_boundary(grade_id: int, grade_data: GradeBoundaryUpdate):
#     """Update a grade boundary"""
#     logger.info(f"PUT /api/grade-boundaries/{grade_id} - Updating grade boundary")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if grade exists
#         cursor.execute("SELECT * FROM grade_boundaries WHERE id = ?", (grade_id,))
#         existing = cursor.fetchone()
        
#         if not existing:
#             raise HTTPException(status_code=404, detail="Grade boundary not found")
        
#         # Don't allow modifying default grades if they are being changed significantly
#         if existing['is_default']:
#             if grade_data.grade is not None and grade_data.grade != existing['grade']:
#                 raise HTTPException(status_code=400, detail="Cannot modify default grade name")
#             if grade_data.min_score is not None or grade_data.max_score is not None:
#                 raise HTTPException(status_code=400, detail="Cannot modify default grade score ranges")
#             if grade_data.grade_point is not None:
#                 raise HTTPException(status_code=400, detail="Cannot modify default grade point")
        
#         # Build update query dynamically
#         updates = []
#         params = []
        
#         # Get values for validation
#         new_grade = grade_data.grade if grade_data.grade is not None else existing['grade']
#         new_level_category = grade_data.level_category if grade_data.level_category is not None else existing['level_category']
#         new_min_score = grade_data.min_score if grade_data.min_score is not None else existing['min_score']
#         new_max_score = grade_data.max_score if grade_data.max_score is not None else existing['max_score']
        
#         # Check grade name uniqueness if being updated
#         if grade_data.grade is not None:
#             ensure_unique_grade_name(cursor, new_grade, new_level_category, grade_id)
#             updates.append("grade = ?")
#             params.append(grade_data.grade)
        
#         # Check for overlap if score ranges are being updated
#         if grade_data.min_score is not None or grade_data.max_score is not None:
#             # Create temporary object for validation
#             class TempGrade:
#                 pass
#             temp_grade = TempGrade()
#             temp_grade.level_category = new_level_category
#             temp_grade.min_score = new_min_score
#             temp_grade.max_score = new_max_score
#             validate_no_overlap(cursor, temp_grade, grade_id)
            
#             if grade_data.min_score is not None:
#                 updates.append("min_score = ?")
#                 params.append(grade_data.min_score)
            
#             if grade_data.max_score is not None:
#                 updates.append("max_score = ?")
#                 params.append(grade_data.max_score)
        
#         if grade_data.remark is not None:
#             updates.append("remark = ?")
#             params.append(grade_data.remark)
        
#         if grade_data.grade_point is not None:
#             updates.append("grade_point = ?")
#             params.append(grade_data.grade_point)
        
#         if grade_data.level_category is not None:
#             updates.append("level_category = ?")
#             params.append(grade_data.level_category)
        
#         if grade_data.is_default is not None:
#             updates.append("is_default = ?")
#             params.append(1 if grade_data.is_default else 0)
        
#         if grade_data.updated_by is not None:
#             updates.append("updated_by = ?")
#             params.append(grade_data.updated_by)
        
#         # Add version increment and update timestamp
#         updates.append("version = version + 1")
#         updates.append("updated_at = ?")
#         params.append(datetime.now().isoformat())
        
#         # Execute update
#         if updates:
#             params.append(grade_id)
#             query = f"UPDATE grade_boundaries SET {', '.join(updates)} WHERE id = ?"
#             cursor.execute(query, params)
#             conn.commit()
#             logger.info(f"Grade boundary {grade_id} updated successfully")
        
#         return {
#             "success": True,
#             "message": "Grade boundary updated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in update_grade_boundary: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.delete("/{grade_id}")
# async def delete_grade_boundary(grade_id: int):
#     """Delete a grade boundary"""
#     logger.info(f"DELETE /api/grade-boundaries/{grade_id} - Deleting grade boundary")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if grade exists and get details
#         cursor.execute("SELECT grade, is_default FROM grade_boundaries WHERE id = ?", (grade_id,))
#         grade = cursor.fetchone()
        
#         if not grade:
#             raise HTTPException(status_code=404, detail="Grade boundary not found")
        
#         if grade['is_default']:
#             raise HTTPException(status_code=400, detail="Cannot delete default grade boundary")
        
#         # Delete the grade boundary
#         cursor.execute("DELETE FROM grade_boundaries WHERE id = ?", (grade_id,))
#         conn.commit()
        
#         logger.info(f"Grade boundary {grade_id} ({grade['grade']}) deleted successfully")
        
#         return {
#             "success": True,
#             "message": f"Grade boundary '{grade['grade']}' deleted successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in delete_grade_boundary: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/copy-jhs-to-shs")
# async def copy_jhs_to_shs():
#     """Copy grade boundaries from JHS to SHS"""
#     logger.info("POST /api/grade-boundaries/copy-jhs-to-shs - Copying grades from JHS to SHS")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get all grades applicable to JHS
#         cursor.execute("""
#             SELECT * FROM grade_boundaries 
#             WHERE level_category IN ('JHS', 'BOTH')
#             ORDER BY min_score DESC
#         """)
        
#         jhs_grades = cursor.fetchall()
#         copied_count = 0
        
#         for grade in jhs_grades:
#             # Check if equivalent SHS grade already exists
#             cursor.execute("""
#                 SELECT id FROM grade_boundaries 
#                 WHERE grade = ? AND level_category = 'SHS'
#             """, (grade['grade'],))
            
#             if not cursor.fetchone():
#                 # Create SHS copy
#                 cursor.execute("""
#                     INSERT INTO grade_boundaries (
#                         grade, min_score, max_score, remark, grade_point, 
#                         level_category, is_default, created_at, updated_at
#                     ) VALUES (?, ?, ?, ?, ?, 'SHS', ?, ?, ?)
#                 """, (
#                     grade['grade'], grade['min_score'], grade['max_score'],
#                     grade['remark'], grade['grade_point'], 0,
#                     datetime.now().isoformat(), datetime.now().isoformat()
#                 ))
#                 copied_count += 1
        
#         conn.commit()
        
#         logger.info(f"Copied {copied_count} grade boundaries from JHS to SHS")
        
#         return {
#             "success": True,
#             "message": f"Successfully copied {copied_count} grade boundaries from JHS to SHS",
#             "data": {"copied_count": copied_count},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in copy_jhs_to_shs: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/preview-score")
# async def preview_score(score_data: Dict[str, Any]):
#     """Get grade details for a given score"""
#     logger.info(f"POST /api/grade-boundaries/preview-score - Previewing score {score_data.get('score')}")
#     conn = None
    
#     try:
#         score = score_data.get('score')
#         level_category = score_data.get('level_category', 'BOTH')
        
#         if score is None:
#             raise HTTPException(status_code=400, detail="Score is required")
        
#         if not isinstance(score, (int, float)):
#             raise HTTPException(status_code=400, detail="Score must be a number")
        
#         if score < 0 or score > 100:
#             raise HTTPException(status_code=400, detail="Score must be between 0 and 100")
        
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         grade_info = get_grade_for_score(cursor, score, level_category)
        
#         return {
#             "success": True,
#             "data": {
#                 "score": score,
#                 "grade": grade_info['grade'],
#                 "remark": grade_info['remark'],
#                 "grade_point": grade_info['grade_point']
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in preview_score: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Sync Integration Functions ====================

# def sync_grade_boundary_from_external(source_data: Dict[str, Any]) -> bool:
#     """Sync grade boundary from external database"""
#     try:
#         logger.info("Syncing grade boundary from external source")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             INSERT OR REPLACE INTO grade_boundaries (
#                 id, grade, min_score, max_score, remark, grade_point,
#                 level_category, is_default, version, synced_at, updated_by_sync, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             source_data.get('id'),
#             source_data.get('grade'),
#             source_data.get('min_score'),
#             source_data.get('max_score'),
#             source_data.get('remark'),
#             source_data.get('grade_point'),
#             source_data.get('level_category', 'BOTH'),
#             source_data.get('is_default', 0),
#             source_data.get('version', 1),
#             datetime.now().isoformat(),
#             1,
#             datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         conn.close()
#         logger.info("Grade boundary synced successfully")
#         return True
        
#     except Exception as e:
#         logger.error(f"Error syncing grade boundary: {str(e)}")
#         logger.error(traceback.format_exc())
#         return False







# app/school/grade_boundaries.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
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

router = APIRouter(prefix="/api/grade-boundaries", tags=["grade-boundaries"])

# ==================== Pydantic Models ====================

class GradeBoundaryBase(BaseModel):
    grade: str = Field(..., min_length=1, max_length=10)
    min_score: float = Field(..., ge=0, le=100)
    max_score: float = Field(..., ge=0, le=100)
    remark: Optional[str] = None
    grade_point: float = Field(default=0.0, ge=0, le=4)
    level_category: str = Field(default="BOTH", pattern="^(JHS|SHS|BOTH)$")
    is_default: bool = False
    
    @validator('max_score')
    def validate_scores(cls, max_score, values):
        if 'min_score' in values and max_score <= values['min_score']:
            raise ValueError('Max score must be greater than min score')
        return max_score

class GradeBoundaryCreate(GradeBoundaryBase):
    created_by: Optional[int] = None

class GradeBoundaryUpdate(BaseModel):
    grade: Optional[str] = Field(None, min_length=1, max_length=10)
    min_score: Optional[float] = Field(None, ge=0, le=100)
    max_score: Optional[float] = Field(None, ge=0, le=100)
    remark: Optional[str] = None
    grade_point: Optional[float] = Field(None, ge=0, le=4)
    level_category: Optional[str] = Field(None, pattern="^(JHS|SHS|BOTH)$")
    is_default: Optional[bool] = None
    updated_by: Optional[int] = None

# ==================== Helper Functions ====================

def row_to_dict(row) -> Dict[str, Any]:
    """Convert sqlite3.Row to dictionary"""
    if row is None:
        return {}
    return {key: row[key] for key in row.keys()}

def validate_no_overlap(cursor, grade_data, exclude_id: Optional[int] = None):
    """Check if score range overlaps with existing grades in the same category"""
    
    categories_to_check = []
    if grade_data.level_category == 'BOTH':
        categories_to_check = ['JHS', 'SHS', 'BOTH']
    else:
        categories_to_check = [grade_data.level_category, 'BOTH']
    
    for category in categories_to_check:
        query = """
            SELECT id, grade, min_score, max_score FROM grade_boundaries 
            WHERE level_category IN (?, 'BOTH')
            AND (
                (min_score <= ? AND max_score >= ?) OR
                (min_score <= ? AND max_score >= ?) OR
                (min_score >= ? AND max_score <= ?)
            )
        """
        params = [category, 
                  grade_data.max_score, grade_data.min_score,
                  grade_data.max_score, grade_data.min_score,
                  grade_data.min_score, grade_data.max_score]
        
        if exclude_id:
            query += " AND id != ?"
            params.append(exclude_id)
        
        cursor.execute(query, params)
        overlapping = cursor.fetchone()
        
        if overlapping:
            overlapping_dict = row_to_dict(overlapping)
            raise HTTPException(
                status_code=400,
                detail=f"Score range overlaps with grade {overlapping_dict['grade']} ({overlapping_dict['min_score']}-{overlapping_dict['max_score']}) in category {category}"
            )

def ensure_unique_grade_name(cursor, grade: str, level_category: str, exclude_id: Optional[int] = None):
    """Ensure grade name is unique within the same level category"""
    categories_to_check = []
    if level_category == 'BOTH':
        categories_to_check = ['JHS', 'SHS', 'BOTH']
    else:
        categories_to_check = [level_category]
    
    for category in categories_to_check:
        query = "SELECT id FROM grade_boundaries WHERE grade = ? AND level_category = ?"
        params = [grade, category]
        
        if exclude_id:
            query += " AND id != ?"
            params.append(exclude_id)
        
        cursor.execute(query, params)
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail=f"Grade '{grade}' already exists for category {category}"
            )

def get_grade_for_score(cursor, score: float, level_category: str) -> Dict[str, Any]:
    """Get grade details for a given score"""
    query = """
        SELECT * FROM grade_boundaries 
        WHERE level_category IN (?, 'BOTH')
        AND min_score <= ? AND max_score >= ?
        ORDER BY min_score DESC
        LIMIT 1
    """
    cursor.execute(query, (level_category, score, score))
    result = cursor.fetchone()
    
    if result:
        result_dict = row_to_dict(result)
        return {
            "grade": result_dict.get('grade', 'N/A'),
            "remark": result_dict.get('remark', ''),
            "grade_point": result_dict.get('grade_point', 0)
        }
    return {"grade": "N/A", "remark": "Invalid Score", "grade_point": 0}

# ==================== Database Setup ====================

def create_grade_boundaries_table():
    """Create grade_boundaries table if it doesn't exist"""
    try:
        logger.info("Creating/checking grade_boundaries table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='grade_boundaries'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE grade_boundaries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    grade TEXT NOT NULL,
                    min_score REAL NOT NULL,
                    max_score REAL NOT NULL,
                    remark TEXT,
                    grade_point REAL DEFAULT 0,
                    level_category TEXT DEFAULT 'BOTH',
                    is_default INTEGER DEFAULT 0,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (updated_by) REFERENCES users(id)
                )
            """)
            logger.info("New grade_boundaries table created")
            
            # Insert default grades
            logger.info("Inserting default grade boundaries")
            default_grades = [
                ("A", 80, 100, "Excellent", 4.0, "BOTH", 1),
                ("B", 70, 79, "Very Good", 3.0, "BOTH", 1),
                ("C", 60, 69, "Good", 2.0, "BOTH", 1),
                ("D", 50, 59, "Credit", 1.0, "BOTH", 1),
                ("E", 40, 49, "Pass", 0.5, "BOTH", 1),
                ("F", 0, 39, "Fail", 0.0, "BOTH", 1)
            ]
            
            for grade in default_grades:
                cursor.execute("""
                    INSERT INTO grade_boundaries (
                        grade, min_score, max_score, remark, grade_point, 
                        level_category, is_default, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (*grade, datetime.now().isoformat(), datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default grades inserted successfully")
        else:
            logger.info("Table 'grade_boundaries' already exists")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(grade_boundaries)")
            columns = cursor.fetchall()
            column_names = [col[1] for col in columns]  # Column name is at index 1
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE grade_boundaries ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE grade_boundaries ADD COLUMN updated_by_sync INTEGER DEFAULT 0")
            
            if 'created_by' not in column_names:
                logger.info("Adding created_by column")
                cursor.execute("ALTER TABLE grade_boundaries ADD COLUMN created_by INTEGER")
            
            if 'updated_by' not in column_names:
                logger.info("Adding updated_by column")
                cursor.execute("ALTER TABLE grade_boundaries ADD COLUMN updated_by INTEGER")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating grade_boundaries table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_grade_boundaries_table()
except Exception as e:
    logger.error(f"Failed to initialize grade_boundaries table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_grade_boundaries(level_category: Optional[str] = None):
    """Get all grade boundaries, optionally filtered by level category"""
    logger.info(f"GET /api/grade-boundaries/ - Fetching grade boundaries")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if level_category and level_category != 'BOTH':
            query = """
                SELECT * FROM grade_boundaries 
                WHERE level_category = ? OR level_category = 'BOTH'
                ORDER BY min_score DESC
            """
            cursor.execute(query, (level_category,))
        else:
            cursor.execute("""
                SELECT * FROM grade_boundaries 
                ORDER BY min_score DESC
            """)
        
        results = cursor.fetchall()
        grade_boundaries = []
        
        for row in results:
            grade_boundaries.append({
                "id": row[0],
                "grade": row[1],
                "min_score": row[2],
                "max_score": row[3],
                "remark": row[4],
                "grade_point": row[5],
                "level_category": row[6],
                "is_default": bool(row[7]),
                "version": row[8] if len(row) > 8 else 1,
                "created_at": row[12] if len(row) > 12 else datetime.now().isoformat(),
                "updated_at": row[13] if len(row) > 13 else datetime.now().isoformat()
            })
        
        logger.info(f"Retrieved {len(grade_boundaries)} grade boundaries")
        
        return {
            "success": True,
            "data": grade_boundaries,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_grade_boundaries: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{grade_id}")
async def get_grade_boundary(grade_id: int):
    """Get a specific grade boundary by ID"""
    logger.info(f"GET /api/grade-boundaries/{grade_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM grade_boundaries WHERE id = ?", (grade_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Grade boundary not found")
        
        grade = {
            "id": result[0],
            "grade": result[1],
            "min_score": result[2],
            "max_score": result[3],
            "remark": result[4],
            "grade_point": result[5],
            "level_category": result[6],
            "is_default": bool(result[7]),
            "version": result[8] if len(result) > 8 else 1,
            "created_at": result[12] if len(result) > 12 else datetime.now().isoformat(),
            "updated_at": result[13] if len(result) > 13 else datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "data": grade,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_grade_boundary: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_grade_boundary(grade_data: GradeBoundaryCreate):
    """Create a new grade boundary"""
    logger.info(f"POST /api/grade-boundaries/ - Creating grade: {grade_data.grade}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        ensure_unique_grade_name(cursor, grade_data.grade, grade_data.level_category)
        validate_no_overlap(cursor, grade_data)
        
        cursor.execute("""
            INSERT INTO grade_boundaries (
                grade, min_score, max_score, remark, grade_point, 
                level_category, is_default, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            grade_data.grade, grade_data.min_score, grade_data.max_score,
            grade_data.remark, grade_data.grade_point, grade_data.level_category,
            1 if grade_data.is_default else 0, grade_data.created_by,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        return {
            "success": True,
            "message": "Grade boundary created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_grade_boundary: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{grade_id}")
async def update_grade_boundary(grade_id: int, grade_data: GradeBoundaryUpdate):
    """Update a grade boundary"""
    logger.info(f"PUT /api/grade-boundaries/{grade_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM grade_boundaries WHERE id = ?", (grade_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Grade boundary not found")
        
        existing_dict = {
            "grade": existing[1],
            "min_score": existing[2],
            "max_score": existing[3],
            "remark": existing[4],
            "grade_point": existing[5],
            "level_category": existing[6],
            "is_default": bool(existing[7])
        }
        
        if existing_dict['is_default']:
            if grade_data.grade is not None and grade_data.grade != existing_dict['grade']:
                raise HTTPException(status_code=400, detail="Cannot modify default grade name")
            if grade_data.min_score is not None or grade_data.max_score is not None:
                raise HTTPException(status_code=400, detail="Cannot modify default grade score ranges")
            if grade_data.grade_point is not None:
                raise HTTPException(status_code=400, detail="Cannot modify default grade point")
        
        updates = []
        params = []
        
        new_grade = grade_data.grade if grade_data.grade is not None else existing_dict['grade']
        new_level_category = grade_data.level_category if grade_data.level_category is not None else existing_dict['level_category']
        new_min_score = grade_data.min_score if grade_data.min_score is not None else existing_dict['min_score']
        new_max_score = grade_data.max_score if grade_data.max_score is not None else existing_dict['max_score']
        
        if grade_data.grade is not None:
            ensure_unique_grade_name(cursor, new_grade, new_level_category, grade_id)
            updates.append("grade = ?")
            params.append(grade_data.grade)
        
        if grade_data.min_score is not None or grade_data.max_score is not None:
            class TempGrade:
                pass
            temp_grade = TempGrade()
            temp_grade.level_category = new_level_category
            temp_grade.min_score = new_min_score
            temp_grade.max_score = new_max_score
            validate_no_overlap(cursor, temp_grade, grade_id)
            
            if grade_data.min_score is not None:
                updates.append("min_score = ?")
                params.append(grade_data.min_score)
            
            if grade_data.max_score is not None:
                updates.append("max_score = ?")
                params.append(grade_data.max_score)
        
        if grade_data.remark is not None:
            updates.append("remark = ?")
            params.append(grade_data.remark)
        
        if grade_data.grade_point is not None:
            updates.append("grade_point = ?")
            params.append(grade_data.grade_point)
        
        if grade_data.level_category is not None:
            updates.append("level_category = ?")
            params.append(grade_data.level_category)
        
        if grade_data.is_default is not None:
            updates.append("is_default = ?")
            params.append(1 if grade_data.is_default else 0)
        
        if grade_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(grade_data.updated_by)
        
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        if updates:
            params.append(grade_id)
            query = f"UPDATE grade_boundaries SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        return {
            "success": True,
            "message": "Grade boundary updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_grade_boundary: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{grade_id}")
async def delete_grade_boundary(grade_id: int):
    """Delete a grade boundary"""
    logger.info(f"DELETE /api/grade-boundaries/{grade_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT grade, is_default FROM grade_boundaries WHERE id = ?", (grade_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Grade boundary not found")
        
        is_default = bool(result[1])
        grade_name = result[0]
        
        if is_default:
            raise HTTPException(status_code=400, detail="Cannot delete default grade boundary")
        
        cursor.execute("DELETE FROM grade_boundaries WHERE id = ?", (grade_id,))
        conn.commit()
        
        return {
            "success": True,
            "message": f"Grade boundary '{grade_name}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_grade_boundary: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/copy-jhs-to-shs")
async def copy_jhs_to_shs():
    """Copy grade boundaries from JHS to SHS"""
    logger.info("POST /api/grade-boundaries/copy-jhs-to-shs")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM grade_boundaries 
            WHERE level_category IN ('JHS', 'BOTH')
            ORDER BY min_score DESC
        """)
        
        jhs_grades = cursor.fetchall()
        copied_count = 0
        
        for grade in jhs_grades:
            grade_name = grade[1]
            cursor.execute("""
                SELECT id FROM grade_boundaries 
                WHERE grade = ? AND level_category = 'SHS'
            """, (grade_name,))
            
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO grade_boundaries (
                        grade, min_score, max_score, remark, grade_point, 
                        level_category, is_default, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, 'SHS', ?, ?, ?)
                """, (
                    grade[1], grade[2], grade[3], grade[4], grade[5], 0,
                    datetime.now().isoformat(), datetime.now().isoformat()
                ))
                copied_count += 1
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Successfully copied {copied_count} grade boundaries",
            "data": {"copied_count": copied_count},
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in copy_jhs_to_shs: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/preview-score")
async def preview_score(score_data: Dict[str, Any]):
    """Get grade details for a given score"""
    logger.info(f"POST /api/grade-boundaries/preview-score")
    conn = None
    
    try:
        score = score_data.get('score')
        level_category = score_data.get('level_category', 'BOTH')
        
        if score is None:
            raise HTTPException(status_code=400, detail="Score is required")
        
        if not isinstance(score, (int, float)):
            raise HTTPException(status_code=400, detail="Score must be a number")
        
        if score < 0 or score > 100:
            raise HTTPException(status_code=400, detail="Score must be between 0 and 100")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        grade_info = get_grade_for_score(cursor, score, level_category)
        
        return {
            "success": True,
            "data": {
                "score": score,
                "grade": grade_info['grade'],
                "remark": grade_info['remark'],
                "grade_point": grade_info['grade_point']
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in preview_score: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()