# # app/school/terms.py

# from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
# from fastapi.responses import JSONResponse
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

# router = APIRouter(prefix="/api/terms", tags=["terms"])

# # ==================== Pydantic Models ====================

# class TermBase(BaseModel):
#     name: str = Field(..., min_length=1, max_length=100)
#     term_number: int = Field(..., ge=1, le=6)
#     academic_year_id: int
#     start_date: date
#     end_date: date
    
#     @validator('end_date')
#     def validate_dates(cls, end_date, values):
#         if 'start_date' in values and end_date <= values['start_date']:
#             raise ValueError('End date must be after start date')
#         return end_date

# class TermCreate(TermBase):
#     is_active: bool = False
#     created_by: Optional[int] = None

# class TermUpdate(BaseModel):
#     name: Optional[str] = Field(None, min_length=1, max_length=100)
#     term_number: Optional[int] = Field(None, ge=1, le=6)
#     academic_year_id: Optional[int] = None
#     start_date: Optional[date] = None
#     end_date: Optional[date] = None
#     is_active: Optional[bool] = None
#     updated_by: Optional[int] = None

# class TermResponse(BaseModel):
#     id: int
#     name: str
#     term_number: int
#     academic_year_id: int
#     start_date: date
#     end_date: date
#     is_active: bool
#     version: int
#     created_at: datetime
#     updated_at: datetime

# class TermActivateRequest(BaseModel):
#     term_id: int
#     academic_year_id: int

# # ==================== Helper Functions ====================

# def validate_term_dates(cursor, term_data, term_id: Optional[int] = None):
#     """Validate that term dates don't overlap and are within academic year"""
    
#     # Get academic year dates
#     cursor.execute("""
#         SELECT start_date, end_date FROM academic_years 
#         WHERE id = ?
#     """, (term_data.academic_year_id,))
#     academic_year = cursor.fetchone()
    
#     if not academic_year:
#         raise HTTPException(status_code=404, detail="Academic year not found")
    
#     # Check if term dates are within academic year
#     if term_data.start_date < academic_year['start_date']:
#         raise HTTPException(
#             status_code=400, 
#             detail=f"Term start date cannot be before academic year start ({academic_year['start_date']})"
#         )
    
#     if term_data.end_date > academic_year['end_date']:
#         raise HTTPException(
#             status_code=400, 
#             detail=f"Term end date cannot be after academic year end ({academic_year['end_date']})"
#         )
    
#     # Check for overlapping terms within same academic year
#     query = """
#         SELECT COUNT(*) as count FROM terms 
#         WHERE academic_year_id = ? 
#         AND (
#             (start_date BETWEEN ? AND ?) OR 
#             (end_date BETWEEN ? AND ?) OR 
#             (start_date <= ? AND end_date >= ?)
#         )
#     """
#     params = [
#         term_data.academic_year_id,
#         term_data.start_date, term_data.end_date,
#         term_data.start_date, term_data.end_date,
#         term_data.start_date, term_data.end_date
#     ]
    
#     if term_id:
#         query += " AND id != ?"
#         params.append(term_id)
    
#     cursor.execute(query, params)
#     result = cursor.fetchone()
    
#     if result and result['count'] > 0:
#         raise HTTPException(status_code=400, detail="Term dates overlap with existing term")

# def check_previous_term_results(cursor, academic_year_id: int, term_number: int) -> bool:
#     """Check if previous term's results are published"""
#     if term_number == 1:
#         return True
    
#     cursor.execute("""
#         SELECT results_published FROM terms 
#         WHERE academic_year_id = ? AND term_number = ?
#     """, (academic_year_id, term_number - 1))
    
#     previous_term = cursor.fetchone()
    
#     if previous_term and not previous_term['results_published']:
#         return False
#     return True

# def ensure_single_active_term(cursor, academic_year_id: int, term_id: Optional[int] = None):
#     """Ensure only one term is active per academic year"""
#     if term_id:
#         cursor.execute("""
#             UPDATE terms 
#             SET is_active = CASE WHEN id = ? THEN 1 ELSE 0 END,
#                 updated_at = ?
#             WHERE academic_year_id = ?
#         """, (term_id, datetime.now().isoformat(), academic_year_id))
#     else:
#         cursor.execute("""
#             UPDATE terms 
#             SET is_active = 0, updated_at = ?
#             WHERE academic_year_id = ? AND is_active = 1
#         """, (datetime.now().isoformat(), academic_year_id))

# # ==================== Database Setup ====================

# def create_terms_table():
#     """Create terms table if it doesn't exist"""
#     try:
#         logger.info("Creating/checking terms table")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS terms (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 name TEXT NOT NULL,
#                 term_number INTEGER NOT NULL,
#                 academic_year_id INTEGER NOT NULL,
#                 start_date DATE NOT NULL,
#                 end_date DATE NOT NULL,
#                 is_active BOOLEAN DEFAULT 0,
#                 results_published BOOLEAN DEFAULT 0,
#                 version INTEGER DEFAULT 1,
#                 synced_at TIMESTAMP,
#                 updated_by_sync BOOLEAN DEFAULT 0,
#                 sync_error TEXT,
#                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                 created_by INTEGER,
#                 updated_by INTEGER,
#                 FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
#                 UNIQUE(academic_year_id, term_number),
#                 UNIQUE(academic_year_id, name)
#             )
#         """)
#         logger.info("Table creation/check completed")
        
#         # Check if table is empty, insert default records
#         cursor.execute("SELECT COUNT(*) as count FROM terms")
#         result = cursor.fetchone()
        
#         if result['count'] == 0:
#             logger.info("Inserting default terms")
#             default_terms = [
#                 ("First Term", 1, 3, "2024-08-12", "2024-12-15", 1, 1),
#                 ("Second Term", 2, 3, "2025-01-10", "2025-04-05", 0, 0),
#                 ("Third Term", 3, 3, "2025-04-28", "2025-07-20", 0, 0),
#                 ("First Term", 1, 2, "2023-08-14", "2023-12-10", 0, 1)
#             ]
            
#             for term in default_terms:
#                 cursor.execute("""
#                     INSERT INTO terms (
#                         name, term_number, academic_year_id, start_date, end_date, 
#                         is_active, results_published, created_at, updated_at
#                     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
#                 """, (*term, datetime.now().isoformat(), datetime.now().isoformat()))
            
#             conn.commit()
#             logger.info("Default terms inserted successfully")
        
#         conn.close()
#     except Exception as e:
#         logger.error(f"Error creating terms table: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise

# # Initialize table on module load
# try:
#     create_terms_table()
# except Exception as e:
#     logger.error(f"Failed to initialize terms table: {str(e)}")

# # ==================== API Endpoints ====================

# @router.get("/")
# async def get_terms(academic_year_id: Optional[int] = None):
#     """Get all terms, optionally filtered by academic year"""
#     logger.info(f"GET /api/terms/ - Fetching terms (academic_year_id={academic_year_id})")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         if academic_year_id:
#             cursor.execute("""
#                 SELECT * FROM terms 
#                 WHERE academic_year_id = ?
#                 ORDER BY term_number ASC
#             """, (academic_year_id,))
#         else:
#             cursor.execute("""
#                 SELECT * FROM terms 
#                 ORDER BY academic_year_id DESC, term_number ASC
#             """)
        
#         results = cursor.fetchall()
#         terms = []
        
#         for row in results:
#             terms.append({
#                 "id": row['id'],
#                 "name": row['name'],
#                 "term_number": row['term_number'],
#                 "academic_year_id": row['academic_year_id'],
#                 "start_date": row['start_date'],
#                 "end_date": row['end_date'],
#                 "is_active": bool(row['is_active']),
#                 "results_published": bool(row['results_published']),
#                 "version": row['version'],
#                 "created_at": row['created_at'],
#                 "updated_at": row['updated_at']
#             })
        
#         logger.info(f"Retrieved {len(terms)} terms")
        
#         return {
#             "success": True,
#             "data": terms,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_terms: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
#             logger.debug("Database connection closed")

# @router.get("/{term_id}")
# async def get_term(term_id: int):
#     """Get a specific term by ID"""
#     logger.info(f"GET /api/terms/{term_id} - Fetching term")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("SELECT * FROM terms WHERE id = ?", (term_id,))
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Term not found")
        
#         term = {
#             "id": result['id'],
#             "name": result['name'],
#             "term_number": result['term_number'],
#             "academic_year_id": result['academic_year_id'],
#             "start_date": result['start_date'],
#             "end_date": result['end_date'],
#             "is_active": bool(result['is_active']),
#             "results_published": bool(result['results_published']),
#             "version": result['version'],
#             "created_at": result['created_at'],
#             "updated_at": result['updated_at']
#         }
        
#         return {
#             "success": True,
#             "data": term,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_term: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/academic-year/{academic_year_id}/active")
# async def get_active_term(academic_year_id: int):
#     """Get the active term for a specific academic year"""
#     logger.info(f"GET /api/terms/academic-year/{academic_year_id}/active - Fetching active term")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT * FROM terms 
#             WHERE academic_year_id = ? AND is_active = 1
#             LIMIT 1
#         """, (academic_year_id,))
        
#         result = cursor.fetchone()
        
#         if not result:
#             return {
#                 "success": False,
#                 "message": "No active term found for this academic year",
#                 "data": None,
#                 "timestamp": datetime.now().isoformat()
#             }
        
#         term = {
#             "id": result['id'],
#             "name": result['name'],
#             "term_number": result['term_number'],
#             "academic_year_id": result['academic_year_id'],
#             "start_date": result['start_date'],
#             "end_date": result['end_date'],
#             "is_active": bool(result['is_active']),
#             "results_published": bool(result['results_published'])
#         }
        
#         return {
#             "success": True,
#             "data": term,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_active_term: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/")
# async def create_term(term_data: TermCreate):
#     """Create a new term"""
#     logger.info(f"POST /api/terms/ - Creating new term: {term_data.name}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if term number already exists for this academic year
#         cursor.execute("""
#             SELECT id FROM terms 
#             WHERE academic_year_id = ? AND term_number = ?
#         """, (term_data.academic_year_id, term_data.term_number))
#         if cursor.fetchone():
#             raise HTTPException(
#                 status_code=400, 
#                 detail=f"Term {term_data.term_number} already exists for this academic year"
#             )
        
#         # Check if term name already exists for this academic year
#         cursor.execute("""
#             SELECT id FROM terms 
#             WHERE academic_year_id = ? AND name = ?
#         """, (term_data.academic_year_id, term_data.name))
#         if cursor.fetchone():
#             raise HTTPException(
#                 status_code=400, 
#                 detail=f"Term '{term_data.name}' already exists for this academic year"
#             )
        
#         # Validate dates
#         validate_term_dates(cursor, term_data)
        
#         # Check previous term results if activating
#         if term_data.is_active and term_data.term_number > 1:
#             can_activate = check_previous_term_results(cursor, term_data.academic_year_id, term_data.term_number)
#             if not can_activate:
#                 raise HTTPException(
#                     status_code=400, 
#                     detail=f"Cannot activate Term {term_data.term_number} until Term {term_data.term_number - 1} results are published"
#                 )
        
#         # Insert new term
#         cursor.execute("""
#             INSERT INTO terms (
#                 name, term_number, academic_year_id, start_date, end_date, 
#                 is_active, created_by, created_at, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             term_data.name, term_data.term_number, term_data.academic_year_id,
#             term_data.start_date, term_data.end_date, term_data.is_active,
#             term_data.created_by, datetime.now().isoformat(), datetime.now().isoformat()
#         ))
        
#         new_id = cursor.lastrowid
        
#         # If this term is active, deactivate others
#         if term_data.is_active:
#             ensure_single_active_term(cursor, term_data.academic_year_id, new_id)
        
#         conn.commit()
        
#         logger.info(f"Term created successfully with ID: {new_id}")
        
#         return {
#             "success": True,
#             "message": "Term created successfully",
#             "data": {"id": new_id},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in create_term: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/{term_id}")
# async def update_term(term_id: int, term_data: TermUpdate):
#     """Update a term"""
#     logger.info(f"PUT /api/terms/{term_id} - Updating term")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if term exists
#         cursor.execute("SELECT * FROM terms WHERE id = ?", (term_id,))
#         existing = cursor.fetchone()
        
#         if not existing:
#             raise HTTPException(status_code=404, detail="Term not found")
        
#         # Build update query dynamically
#         updates = []
#         params = []
        
#         # Prepare data for validation
#         updated_term = {
#             "academic_year_id": term_data.academic_year_id if term_data.academic_year_id is not None else existing['academic_year_id'],
#             "start_date": term_data.start_date if term_data.start_date is not None else existing['start_date'],
#             "end_date": term_data.end_date if term_data.end_date is not None else existing['end_date'],
#             "term_number": term_data.term_number if term_data.term_number is not None else existing['term_number'],
#             "name": term_data.name if term_data.name is not None else existing['name'],
#             "is_active": term_data.is_active if term_data.is_active is not None else existing['is_active']
#         }
        
#         # Check for duplicate term number
#         if term_data.term_number is not None:
#             cursor.execute("""
#                 SELECT id FROM terms 
#                 WHERE academic_year_id = ? AND term_number = ? AND id != ?
#             """, (updated_term['academic_year_id'], term_data.term_number, term_id))
#             if cursor.fetchone():
#                 raise HTTPException(
#                     status_code=400, 
#                     detail=f"Term {term_data.term_number} already exists for this academic year"
#                 )
        
#         # Check for duplicate term name
#         if term_data.name is not None:
#             cursor.execute("""
#                 SELECT id FROM terms 
#                 WHERE academic_year_id = ? AND name = ? AND id != ?
#             """, (updated_term['academic_year_id'], term_data.name, term_id))
#             if cursor.fetchone():
#                 raise HTTPException(
#                     status_code=400, 
#                     detail=f"Term '{term_data.name}' already exists for this academic year"
#                 )
        
#         # Validate dates
#         if term_data.start_date is not None or term_data.end_date is not None:
#             validate_term_dates(cursor, type('TermData', (), updated_term)(), term_id)
        
#         # Check previous term results if activating
#         if term_data.is_active and updated_term['term_number'] > 1:
#             can_activate = check_previous_term_results(cursor, updated_term['academic_year_id'], updated_term['term_number'])
#             if not can_activate:
#                 raise HTTPException(
#                     status_code=400, 
#                     detail=f"Cannot activate Term {updated_term['term_number']} until Term {updated_term['term_number'] - 1} results are published"
#                 )
        
#         # Apply updates
#         if term_data.name is not None:
#             updates.append("name = ?")
#             params.append(term_data.name)
        
#         if term_data.term_number is not None:
#             updates.append("term_number = ?")
#             params.append(term_data.term_number)
        
#         if term_data.academic_year_id is not None:
#             updates.append("academic_year_id = ?")
#             params.append(term_data.academic_year_id)
        
#         if term_data.start_date is not None:
#             updates.append("start_date = ?")
#             params.append(term_data.start_date)
        
#         if term_data.end_date is not None:
#             updates.append("end_date = ?")
#             params.append(term_data.end_date)
        
#         if term_data.is_active is not None:
#             updates.append("is_active = ?")
#             params.append(1 if term_data.is_active else 0)
        
#         if term_data.updated_by is not None:
#             updates.append("updated_by = ?")
#             params.append(term_data.updated_by)
        
#         # Add version increment and update timestamp
#         updates.append("version = version + 1")
#         updates.append("updated_at = ?")
#         params.append(datetime.now().isoformat())
        
#         # Execute update
#         if updates:
#             params.append(term_id)
#             query = f"UPDATE terms SET {', '.join(updates)} WHERE id = ?"
#             cursor.execute(query, params)
            
#             # Handle active term logic
#             if term_data.is_active:
#                 ensure_single_active_term(cursor, updated_term['academic_year_id'], term_id)
            
#             conn.commit()
#             logger.info(f"Term {term_id} updated successfully")
        
#         return {
#             "success": True,
#             "message": "Term updated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in update_term: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.delete("/{term_id}")
# async def delete_term(term_id: int):
#     """Delete a term"""
#     logger.info(f"DELETE /api/terms/{term_id} - Deleting term")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if term exists
#         cursor.execute("SELECT is_active FROM terms WHERE id = ?", (term_id,))
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Term not found")
        
#         # Don't allow deleting active term
#         if result['is_active']:
#             raise HTTPException(status_code=400, detail="Cannot delete active term. Deactivate it first.")
        
#         # Delete the term
#         cursor.execute("DELETE FROM terms WHERE id = ?", (term_id,))
#         conn.commit()
        
#         logger.info(f"Term {term_id} deleted successfully")
        
#         return {
#             "success": True,
#             "message": "Term deleted successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in delete_term: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/{term_id}/activate")
# async def activate_term(term_id: int):
#     """Activate a term"""
#     logger.info(f"POST /api/terms/{term_id}/activate - Activating term")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if term exists
#         cursor.execute("""
#             SELECT t.*, a.year_label 
#             FROM terms t
#             JOIN academic_years a ON t.academic_year_id = a.id
#             WHERE t.id = ?
#         """, (term_id,))
#         term = cursor.fetchone()
        
#         if not term:
#             raise HTTPException(status_code=404, detail="Term not found")
        
#         # Check if academic year is active (not archived)
#         cursor.execute("SELECT status FROM academic_years WHERE id = ?", (term['academic_year_id'],))
#         academic_year = cursor.fetchone()
        
#         if academic_year and academic_year['status'] == 'archived':
#             raise HTTPException(status_code=400, detail="Cannot activate term for archived academic year")
        
#         # Check previous term results
#         if term['term_number'] > 1:
#             can_activate = check_previous_term_results(cursor, term['academic_year_id'], term['term_number'])
#             if not can_activate:
#                 raise HTTPException(
#                     status_code=400, 
#                     detail=f"Cannot activate Term {term['term_number']} until Term {term['term_number'] - 1} results are published"
#                 )
        
#         # Activate this term and deactivate others
#         ensure_single_active_term(cursor, term['academic_year_id'], term_id)
        
#         conn.commit()
        
#         logger.info(f"Term {term_id} activated successfully")
        
#         return {
#             "success": True,
#             "message": f"Term {term['name']} has been activated",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in activate_term: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/{term_id}/deactivate")
# async def deactivate_term(term_id: int):
#     """Deactivate a term"""
#     logger.info(f"POST /api/terms/{term_id}/deactivate - Deactivating term")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if term exists
#         cursor.execute("SELECT id FROM terms WHERE id = ?", (term_id,))
#         if not cursor.fetchone():
#             raise HTTPException(status_code=404, detail="Term not found")
        
#         # Deactivate the term
#         cursor.execute("""
#             UPDATE terms 
#             SET is_active = 0, updated_at = ?
#             WHERE id = ?
#         """, (datetime.now().isoformat(), term_id))
#         conn.commit()
        
#         logger.info(f"Term {term_id} deactivated successfully")
        
#         return {
#             "success": True,
#             "message": "Term deactivated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in deactivate_term: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/{term_id}/publish-results")
# async def publish_results(term_id: int):
#     """Publish results for a term"""
#     logger.info(f"POST /api/terms/{term_id}/publish-results - Publishing results")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if term exists
#         cursor.execute("SELECT term_number, academic_year_id FROM terms WHERE id = ?", (term_id,))
#         term = cursor.fetchone()
        
#         if not term:
#             raise HTTPException(status_code=404, detail="Term not found")
        
#         # Publish results
#         cursor.execute("""
#             UPDATE terms 
#             SET results_published = 1, updated_at = ?
#             WHERE id = ?
#         """, (datetime.now().isoformat(), term_id))
#         conn.commit()
        
#         logger.info(f"Results published for term {term_id}")
        
#         return {
#             "success": True,
#             "message": f"Results for Term {term['term_number']} have been published",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in publish_results: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Sync Integration Functions ====================

# def sync_term_from_external(source_data: Dict[str, Any]) -> bool:
#     """Sync term from external database"""
#     try:
#         logger.info("Syncing term from external source")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             INSERT OR REPLACE INTO terms (
#                 id, name, term_number, academic_year_id, start_date, end_date,
#                 is_active, results_published, version, synced_at, updated_by_sync, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             source_data.get('id'),
#             source_data.get('name'),
#             source_data.get('term_number'),
#             source_data.get('academic_year_id'),
#             source_data.get('start_date'),
#             source_data.get('end_date'),
#             source_data.get('is_active', 0),
#             source_data.get('results_published', 0),
#             source_data.get('version', 1),
#             datetime.now().isoformat(),
#             1,
#             datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         conn.close()
#         logger.info("Term synced successfully")
#         return True
        
#     except Exception as e:
#         logger.error(f"Error syncing term: {str(e)}")
#         logger.error(traceback.format_exc())
#         return False


# app/school/terms.py

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
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

router = APIRouter(prefix="/api/terms", tags=["terms"])

# ==================== Pydantic Models ====================

class TermBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    term_number: int = Field(..., ge=1, le=6)
    academic_year_id: int
    start_date: date
    end_date: date
    
    @validator('end_date')
    def validate_dates(cls, end_date, values):
        if 'start_date' in values and end_date <= values['start_date']:
            raise ValueError('End date must be after start date')
        return end_date

class TermCreate(TermBase):
    is_active: bool = False
    created_by: Optional[int] = None

class TermUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    term_number: Optional[int] = Field(None, ge=1, le=6)
    academic_year_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    updated_by: Optional[int] = None

class TermResponse(BaseModel):
    id: int
    name: str
    term_number: int
    academic_year_id: int
    start_date: date
    end_date: date
    is_active: bool
    results_published: bool
    version: int
    created_at: datetime
    updated_at: datetime

class TermActivateRequest(BaseModel):
    term_id: int
    academic_year_id: int

# ==================== Helper Functions ====================

def validate_term_dates(cursor, term_data, term_id: Optional[int] = None):
    """Validate that term dates don't overlap and are within academic year"""
    
    # Get academic year dates
    cursor.execute("""
        SELECT start_date, end_date FROM academic_years 
        WHERE id = ?
    """, (term_data.academic_year_id,))
    academic_year = cursor.fetchone()
    
    if not academic_year:
        raise HTTPException(status_code=404, detail="Academic year not found")
    
    # Convert database string dates to date objects for comparison
    academic_start_date = datetime.strptime(academic_year['start_date'], '%Y-%m-%d').date()
    academic_end_date = datetime.strptime(academic_year['end_date'], '%Y-%m-%d').date()
    
    # Check if term dates are within academic year
    if term_data.start_date < academic_start_date:
        raise HTTPException(
            status_code=400, 
            detail=f"Term start date cannot be before academic year start ({academic_year['start_date']})"
        )
    
    if term_data.end_date > academic_end_date:
        raise HTTPException(
            status_code=400, 
            detail=f"Term end date cannot be after academic year end ({academic_year['end_date']})"
        )
    
    # Check for overlapping terms within same academic year
    query = """
        SELECT COUNT(*) as count FROM terms 
        WHERE academic_year_id = ? 
        AND (
            (start_date BETWEEN ? AND ?) OR 
            (end_date BETWEEN ? AND ?) OR 
            (start_date <= ? AND end_date >= ?)
        )
    """
    params = [
        term_data.academic_year_id,
        term_data.start_date.isoformat(), term_data.end_date.isoformat(),
        term_data.start_date.isoformat(), term_data.end_date.isoformat(),
        term_data.start_date.isoformat(), term_data.end_date.isoformat()
    ]
    
    if term_id:
        query += " AND id != ?"
        params.append(term_id)
    
    cursor.execute(query, params)
    result = cursor.fetchone()
    
    if result and result['count'] > 0:
        raise HTTPException(status_code=400, detail="Term dates overlap with existing term")

def check_previous_term_results(cursor, academic_year_id: int, term_number: int) -> bool:
    """Check if previous term's results are published"""
    if term_number == 1:
        return True
    
    cursor.execute("""
        SELECT results_published FROM terms 
        WHERE academic_year_id = ? AND term_number = ?
    """, (academic_year_id, term_number - 1))
    
    previous_term = cursor.fetchone()
    
    if previous_term and not previous_term['results_published']:
        return False
    return True

def ensure_single_active_term(cursor, academic_year_id: int, term_id: Optional[int] = None):
    """Ensure only one term is active per academic year"""
    if term_id:
        cursor.execute("""
            UPDATE terms 
            SET is_active = CASE WHEN id = ? THEN 1 ELSE 0 END,
                updated_at = ?
            WHERE academic_year_id = ?
        """, (term_id, datetime.now().isoformat(), academic_year_id))
    else:
        cursor.execute("""
            UPDATE terms 
            SET is_active = 0, updated_at = ?
            WHERE academic_year_id = ? AND is_active = 1
        """, (datetime.now().isoformat(), academic_year_id))

# ==================== Database Setup ====================

def create_terms_table():
    """Create terms table if it doesn't exist"""
    try:
        logger.info("Creating/checking terms table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS terms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                term_number INTEGER NOT NULL,
                academic_year_id INTEGER NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                is_active BOOLEAN DEFAULT 0,
                results_published BOOLEAN DEFAULT 0,
                version INTEGER DEFAULT 1,
                synced_at TIMESTAMP,
                updated_by_sync BOOLEAN DEFAULT 0,
                sync_error TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER,
                updated_by INTEGER,
                FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                UNIQUE(academic_year_id, term_number),
                UNIQUE(academic_year_id, name)
            )
        """)
        logger.info("Table creation/check completed")
        
        # Check if table is empty, insert default records
        cursor.execute("SELECT COUNT(*) as count FROM terms")
        result = cursor.fetchone()
        
        if result['count'] == 0:
            logger.info("Inserting default terms")
            default_terms = [
                ("First Term", 1, 3, "2024-08-12", "2024-12-15", 1, 1),
                ("Second Term", 2, 3, "2025-01-10", "2025-04-05", 0, 0),
                ("Third Term", 3, 3, "2025-04-28", "2025-07-20", 0, 0),
                ("First Term", 1, 2, "2023-08-14", "2023-12-10", 0, 1)
            ]
            
            for term in default_terms:
                cursor.execute("""
                    INSERT INTO terms (
                        name, term_number, academic_year_id, start_date, end_date, 
                        is_active, results_published, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (*term, datetime.now().isoformat(), datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default terms inserted successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating terms table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    # create_terms_table()
    pass
except Exception as e:
    logger.error(f"Failed to initialize terms table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_terms(academic_year_id: Optional[int] = None):
    """Get all terms, optionally filtered by academic year"""
    logger.info(f"GET /api/terms/ - Fetching terms (academic_year_id={academic_year_id})")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if academic_year_id:
            cursor.execute("""
                SELECT * FROM terms 
                WHERE academic_year_id = ?
                ORDER BY term_number ASC
            """, (academic_year_id,))
        else:
            cursor.execute("""
                SELECT * FROM terms 
                ORDER BY academic_year_id DESC, term_number ASC
            """)
        
        results = cursor.fetchall()
        terms = []
        
        for row in results:
            terms.append({
                "id": row['id'],
                "name": row['name'],
                "term_number": row['term_number'],
                "academic_year_id": row['academic_year_id'],
                "start_date": row['start_date'],
                "end_date": row['end_date'],
                "is_active": bool(row['is_active']),
                "results_published": bool(row['results_published']),
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(terms)} terms")
        
        return {
            "success": True,
            "data": terms,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_terms: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

@router.get("/{term_id}")
async def get_term(term_id: int):
    """Get a specific term by ID"""
    logger.info(f"GET /api/terms/{term_id} - Fetching term")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM terms WHERE id = ?", (term_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Term not found")
        
        term = {
            "id": result['id'],
            "name": result['name'],
            "term_number": result['term_number'],
            "academic_year_id": result['academic_year_id'],
            "start_date": result['start_date'],
            "end_date": result['end_date'],
            "is_active": bool(result['is_active']),
            "results_published": bool(result['results_published']),
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": term,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_term: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/academic-year/{academic_year_id}/active")
async def get_active_term(academic_year_id: int):
    """Get the active term for a specific academic year"""
    logger.info(f"GET /api/terms/academic-year/{academic_year_id}/active - Fetching active term")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM terms 
            WHERE academic_year_id = ? AND is_active = 1
            LIMIT 1
        """, (academic_year_id,))
        
        result = cursor.fetchone()
        
        if not result:
            return {
                "success": False,
                "message": "No active term found for this academic year",
                "data": None,
                "timestamp": datetime.now().isoformat()
            }
        
        term = {
            "id": result['id'],
            "name": result['name'],
            "term_number": result['term_number'],
            "academic_year_id": result['academic_year_id'],
            "start_date": result['start_date'],
            "end_date": result['end_date'],
            "is_active": bool(result['is_active']),
            "results_published": bool(result['results_published'])
        }
        
        return {
            "success": True,
            "data": term,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_active_term: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_term(term_data: TermCreate):
    """Create a new term"""
    logger.info(f"POST /api/terms/ - Creating new term: {term_data.name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if term number already exists for this academic year
        cursor.execute("""
            SELECT id FROM terms 
            WHERE academic_year_id = ? AND term_number = ?
        """, (term_data.academic_year_id, term_data.term_number))
        if cursor.fetchone():
            raise HTTPException(
                status_code=400, 
                detail=f"Term {term_data.term_number} already exists for this academic year"
            )
        
        # Check if term name already exists for this academic year
        cursor.execute("""
            SELECT id FROM terms 
            WHERE academic_year_id = ? AND name = ?
        """, (term_data.academic_year_id, term_data.name))
        if cursor.fetchone():
            raise HTTPException(
                status_code=400, 
                detail=f"Term '{term_data.name}' already exists for this academic year"
            )
        
        # Validate dates
        validate_term_dates(cursor, term_data)
        
        # Check previous term results if activating
        if term_data.is_active and term_data.term_number > 1:
            can_activate = check_previous_term_results(cursor, term_data.academic_year_id, term_data.term_number)
            if not can_activate:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cannot activate Term {term_data.term_number} until Term {term_data.term_number - 1} results are published"
                )
        
        # Insert new term
        cursor.execute("""
            INSERT INTO terms (
                name, term_number, academic_year_id, start_date, end_date, 
                is_active, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            term_data.name, term_data.term_number, term_data.academic_year_id,
            term_data.start_date.isoformat(), term_data.end_date.isoformat(), 
            term_data.is_active,
            term_data.created_by, datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        new_id = cursor.lastrowid
        
        # If this term is active, deactivate others
        if term_data.is_active:
            ensure_single_active_term(cursor, term_data.academic_year_id, new_id)
        
        conn.commit()
        
        logger.info(f"Term created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Term created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_term: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{term_id}")
async def update_term(term_id: int, term_data: TermUpdate):
    """Update a term"""
    logger.info(f"PUT /api/terms/{term_id} - Updating term")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if term exists
        cursor.execute("SELECT * FROM terms WHERE id = ?", (term_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Term not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Prepare data for validation
        updated_term = {
            "academic_year_id": term_data.academic_year_id if term_data.academic_year_id is not None else existing['academic_year_id'],
            "start_date": term_data.start_date if term_data.start_date is not None else datetime.strptime(existing['start_date'], '%Y-%m-%d').date(),
            "end_date": term_data.end_date if term_data.end_date is not None else datetime.strptime(existing['end_date'], '%Y-%m-%d').date(),
            "term_number": term_data.term_number if term_data.term_number is not None else existing['term_number'],
            "name": term_data.name if term_data.name is not None else existing['name'],
            "is_active": term_data.is_active if term_data.is_active is not None else existing['is_active']
        }
        
        # Check for duplicate term number
        if term_data.term_number is not None:
            cursor.execute("""
                SELECT id FROM terms 
                WHERE academic_year_id = ? AND term_number = ? AND id != ?
            """, (updated_term['academic_year_id'], term_data.term_number, term_id))
            if cursor.fetchone():
                raise HTTPException(
                    status_code=400, 
                    detail=f"Term {term_data.term_number} already exists for this academic year"
                )
        
        # Check for duplicate term name
        if term_data.name is not None:
            cursor.execute("""
                SELECT id FROM terms 
                WHERE academic_year_id = ? AND name = ? AND id != ?
            """, (updated_term['academic_year_id'], term_data.name, term_id))
            if cursor.fetchone():
                raise HTTPException(
                    status_code=400, 
                    detail=f"Term '{term_data.name}' already exists for this academic year"
                )
        
        # Validate dates
        if term_data.start_date is not None or term_data.end_date is not None:
            # Create a temporary object for validation
            class TempTerm:
                pass
            temp_term = TempTerm()
            temp_term.academic_year_id = updated_term['academic_year_id']
            temp_term.start_date = updated_term['start_date']
            temp_term.end_date = updated_term['end_date']
            validate_term_dates(cursor, temp_term, term_id)
        
        # Check previous term results if activating
        if term_data.is_active and updated_term['term_number'] > 1:
            can_activate = check_previous_term_results(cursor, updated_term['academic_year_id'], updated_term['term_number'])
            if not can_activate:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cannot activate Term {updated_term['term_number']} until Term {updated_term['term_number'] - 1} results are published"
                )
        
        # Apply updates
        if term_data.name is not None:
            updates.append("name = ?")
            params.append(term_data.name)
        
        if term_data.term_number is not None:
            updates.append("term_number = ?")
            params.append(term_data.term_number)
        
        if term_data.academic_year_id is not None:
            updates.append("academic_year_id = ?")
            params.append(term_data.academic_year_id)
        
        if term_data.start_date is not None:
            updates.append("start_date = ?")
            params.append(term_data.start_date.isoformat())
        
        if term_data.end_date is not None:
            updates.append("end_date = ?")
            params.append(term_data.end_date.isoformat())
        
        if term_data.is_active is not None:
            updates.append("is_active = ?")
            params.append(1 if term_data.is_active else 0)
        
        if term_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(term_data.updated_by)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(term_id)
            query = f"UPDATE terms SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            
            # Handle active term logic
            if term_data.is_active:
                ensure_single_active_term(cursor, updated_term['academic_year_id'], term_id)
            
            conn.commit()
            logger.info(f"Term {term_id} updated successfully")
        
        return {
            "success": True,
            "message": "Term updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_term: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{term_id}")
async def delete_term(term_id: int):
    """Delete a term"""
    logger.info(f"DELETE /api/terms/{term_id} - Deleting term")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if term exists
        cursor.execute("SELECT is_active FROM terms WHERE id = ?", (term_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Term not found")
        
        # Don't allow deleting active term
        if result['is_active']:
            raise HTTPException(status_code=400, detail="Cannot delete active term. Deactivate it first.")
        
        # Delete the term
        cursor.execute("DELETE FROM terms WHERE id = ?", (term_id,))
        conn.commit()
        
        logger.info(f"Term {term_id} deleted successfully")
        
        return {
            "success": True,
            "message": "Term deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_term: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/{term_id}/activate")
async def activate_term(term_id: int):
    """Activate a term"""
    logger.info(f"POST /api/terms/{term_id}/activate - Activating term")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if term exists
        cursor.execute("""
            SELECT t.*, a.year_label 
            FROM terms t
            JOIN academic_years a ON t.academic_year_id = a.id
            WHERE t.id = ?
        """, (term_id,))
        term = cursor.fetchone()
        
        if not term:
            raise HTTPException(status_code=404, detail="Term not found")
        
        # Check if academic year is active (not archived)
        cursor.execute("SELECT status FROM academic_years WHERE id = ?", (term['academic_year_id'],))
        academic_year = cursor.fetchone()
        
        if academic_year and academic_year['status'] == 'archived':
            raise HTTPException(status_code=400, detail="Cannot activate term for archived academic year")
        
        # Check previous term results
        if term['term_number'] > 1:
            can_activate = check_previous_term_results(cursor, term['academic_year_id'], term['term_number'])
            if not can_activate:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cannot activate Term {term['term_number']} until Term {term['term_number'] - 1} results are published"
                )
        
        # Activate this term and deactivate others
        ensure_single_active_term(cursor, term['academic_year_id'], term_id)
        
        conn.commit()
        
        logger.info(f"Term {term_id} activated successfully")
        
        return {
            "success": True,
            "message": f"Term {term['name']} has been activated",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in activate_term: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/{term_id}/deactivate")
async def deactivate_term(term_id: int):
    """Deactivate a term"""
    logger.info(f"POST /api/terms/{term_id}/deactivate - Deactivating term")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if term exists
        cursor.execute("SELECT id FROM terms WHERE id = ?", (term_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Term not found")
        
        # Deactivate the term
        cursor.execute("""
            UPDATE terms 
            SET is_active = 0, updated_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), term_id))
        conn.commit()
        
        logger.info(f"Term {term_id} deactivated successfully")
        
        return {
            "success": True,
            "message": "Term deactivated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in deactivate_term: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/{term_id}/publish-results")
async def publish_results(term_id: int):
    """Publish results for a term"""
    logger.info(f"POST /api/terms/{term_id}/publish-results - Publishing results")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if term exists
        cursor.execute("SELECT term_number, academic_year_id FROM terms WHERE id = ?", (term_id,))
        term = cursor.fetchone()
        
        if not term:
            raise HTTPException(status_code=404, detail="Term not found")
        
        # Publish results
        cursor.execute("""
            UPDATE terms 
            SET results_published = 1, updated_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), term_id))
        conn.commit()
        
        logger.info(f"Results published for term {term_id}")
        
        return {
            "success": True,
            "message": f"Results for Term {term['term_number']} have been published",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in publish_results: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_term_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync term from external database"""
    try:
        logger.info("Syncing term from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO terms (
                id, name, term_number, academic_year_id, start_date, end_date,
                is_active, results_published, version, synced_at, updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('name'),
            source_data.get('term_number'),
            source_data.get('academic_year_id'),
            source_data.get('start_date'),
            source_data.get('end_date'),
            source_data.get('is_active', 0),
            source_data.get('results_published', 0),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Term synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing term: {str(e)}")
        logger.error(traceback.format_exc())
        return False