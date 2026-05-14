# # app/school/academic_years.py

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

# router = APIRouter(prefix="/api/academic-years", tags=["academic-years"])

# # ==================== Pydantic Models ====================

# class AcademicYearBase(BaseModel):
#     year_label: str = Field(..., min_length=1, max_length=20)
#     start_date: date
#     end_date: date
#     status: str = Field(default="active", pattern="^(active|inactive|archived)$")
#     is_current: bool = False
    
#     @validator('year_label')
#     def validate_year_label(cls, v):
#         # Validate format like "2024-2025"
#         parts = v.split('-')
#         if len(parts) != 2:
#             raise ValueError('Year label must be in format YYYY-YYYY')
#         try:
#             start_year = int(parts[0])
#             end_year = int(parts[1])
#             if end_year != start_year + 1:
#                 raise ValueError('Years must be consecutive (e.g., 2024-2025)')
#         except ValueError:
#             raise ValueError('Invalid year format. Use YYYY-YYYY')
#         return v
    
#     @validator('end_date')
#     def validate_dates(cls, end_date, values):
#         if 'start_date' in values and end_date <= values['start_date']:
#             raise ValueError('End date must be after start date')
#         return end_date

# class AcademicYearCreate(AcademicYearBase):
#     created_by: Optional[int] = None

# class AcademicYearUpdate(BaseModel):
#     year_label: Optional[str] = Field(None, min_length=1, max_length=20)
#     start_date: Optional[date] = None
#     end_date: Optional[date] = None
#     status: Optional[str] = Field(None, pattern="^(active|inactive|archived)$")
#     is_current: Optional[bool] = None
#     updated_by: Optional[int] = None

# class CloneOptions(BaseModel):
#     classes: bool = True
#     subjects: bool = True
#     assignments: bool = True
#     fees: bool = False
#     exams: bool = False

# class CloneRequest(BaseModel):
#     new_year_label: str
#     start_date: date
#     end_date: date
#     source_year_id: int
#     options: CloneOptions = CloneOptions()
#     created_by: Optional[int] = None

# class AcademicYearResponse(BaseModel):
#     id: int
#     year_label: str
#     start_date: date
#     end_date: date
#     is_current: bool
#     status: str
#     version: int
#     created_at: datetime
#     updated_at: datetime
#     created_by: Optional[int]
#     updated_by: Optional[int]

# # ==================== Helper Functions ====================

# def validate_no_overlap(cursor, start_date: date, end_date: date, exclude_id: Optional[int] = None):
#     """Check if new academic year overlaps with existing ones"""
#     query = """
#         SELECT COUNT(*) as count FROM academic_years 
#         WHERE (
#             (start_date BETWEEN ? AND ?) OR 
#             (end_date BETWEEN ? AND ?) OR 
#             (start_date <= ? AND end_date >= ?)
#         )
#     """
#     params = [start_date, end_date, start_date, end_date, start_date, end_date]
    
#     if exclude_id:
#         query += " AND id != ?"
#         params.append(exclude_id)
    
#     cursor.execute(query, params)
#     result = cursor.fetchone()
    
#     if result and result['count'] > 0:
#         raise HTTPException(status_code=400, detail="Academic year dates overlap with existing year")

# def ensure_single_current_year(cursor, year_id: Optional[int] = None):
#     """Ensure only one academic year is marked as current"""
#     if year_id:
#         cursor.execute("""
#             UPDATE academic_years 
#             SET is_current = CASE WHEN id = ? THEN 1 ELSE 0 END,
#                 status = CASE WHEN id = ? AND status = 'archived' THEN 'active' ELSE status END,
#                 updated_at = ?
#             WHERE is_current = 1 OR id = ?
#         """, (year_id, year_id, datetime.now().isoformat(), year_id))
#     else:
#         cursor.execute("""
#             UPDATE academic_years 
#             SET is_current = 0, updated_at = ?
#             WHERE is_current = 1
#         """, (datetime.now().isoformat(),))

# # ==================== Database Setup ====================

# def create_academic_years_table():
#     """Create academic_years table if it doesn't exist"""
#     try:
#         logger.info("Creating/checking academic_years table")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS academic_years (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 year_label TEXT NOT NULL UNIQUE,
#                 start_date DATE NOT NULL,
#                 end_date DATE NOT NULL,
#                 is_current BOOLEAN DEFAULT 0,
#                 status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
#                 version INTEGER DEFAULT 1,
#                 synced_at TIMESTAMP,
#                 updated_by_sync BOOLEAN DEFAULT 0,
#                 sync_error TEXT,
#                 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#                 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                 created_by INTEGER,
#                 updated_by INTEGER
#             )
#         """)
#         logger.info("Table creation/check completed")
        
#         # Check if table is empty, insert default records
#         cursor.execute("SELECT COUNT(*) as count FROM academic_years")
#         result = cursor.fetchone()
        
#         if result['count'] == 0:
#             logger.info("Inserting default academic years")
#             default_years = [
#                 ("2022-2023", "2022-08-15", "2023-06-10", 0, "archived"),
#                 ("2023-2024", "2023-08-14", "2024-06-08", 0, "inactive"),
#                 ("2024-2025", "2024-08-12", "2025-06-06", 1, "active")
#             ]
            
#             for year in default_years:
#                 cursor.execute("""
#                     INSERT INTO academic_years (
#                         year_label, start_date, end_date, is_current, status,
#                         created_at, updated_at
#                     ) VALUES (?, ?, ?, ?, ?, ?, ?)
#                 """, (*year, datetime.now().isoformat(), datetime.now().isoformat()))
            
#             conn.commit()
#             logger.info("Default academic years inserted successfully")
        
#         conn.close()
#     except Exception as e:
#         logger.error(f"Error creating academic_years table: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise

# # Initialize table on module load
# try:
#     create_academic_years_table()
# except Exception as e:
#     logger.error(f"Failed to initialize academic_years table: {str(e)}")

# # ==================== API Endpoints ====================

# @router.get("/")
# async def get_academic_years():
#     """Get all academic years"""
#     logger.info("GET /api/academic-years/ - Fetching all academic years")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT * FROM academic_years 
#             ORDER BY start_date DESC
#         """)
        
#         results = cursor.fetchall()
#         academic_years = []
        
#         for row in results:
#             academic_years.append({
#                 "id": row['id'],
#                 "year_label": row['year_label'],
#                 "start_date": row['start_date'],
#                 "end_date": row['end_date'],
#                 "is_current": bool(row['is_current']),
#                 "status": row['status'],
#                 "version": row['version'],
#                 "created_at": row['created_at'],
#                 "updated_at": row['updated_at'],
#                 "created_by": row.get('created_by'),
#                 "updated_by": row.get('updated_by')
#             })
        
#         logger.info(f"Retrieved {len(academic_years)} academic years")
        
#         return {
#             "success": True,
#             "data": academic_years,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_academic_years: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
#             logger.debug("Database connection closed")

# @router.get("/current")
# async def get_current_academic_year():
#     """Get the current academic year"""
#     logger.info("GET /api/academic-years/current - Fetching current academic year")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT * FROM academic_years 
#             WHERE is_current = 1
#             LIMIT 1
#         """)
        
#         result = cursor.fetchone()
        
#         if not result:
#             return {
#                 "success": False,
#                 "message": "No current academic year set",
#                 "data": None,
#                 "timestamp": datetime.now().isoformat()
#             }
        
#         current_year = {
#             "id": result['id'],
#             "year_label": result['year_label'],
#             "start_date": result['start_date'],
#             "end_date": result['end_date'],
#             "is_current": bool(result['is_current']),
#             "status": result['status']
#         }
        
#         return {
#             "success": True,
#             "data": current_year,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_current_academic_year: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/{year_id}")
# async def get_academic_year(year_id: int):
#     """Get a specific academic year by ID"""
#     logger.info(f"GET /api/academic-years/{year_id} - Fetching academic year")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("SELECT * FROM academic_years WHERE id = ?", (year_id,))
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Academic year not found")
        
#         academic_year = {
#             "id": result['id'],
#             "year_label": result['year_label'],
#             "start_date": result['start_date'],
#             "end_date": result['end_date'],
#             "is_current": bool(result['is_current']),
#             "status": result['status'],
#             "version": result['version'],
#             "created_at": result['created_at'],
#             "updated_at": result['updated_at']
#         }
        
#         return {
#             "success": True,
#             "data": academic_year,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_academic_year: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/")
# async def create_academic_year(year_data: AcademicYearCreate):
#     """Create a new academic year"""
#     logger.info(f"POST /api/academic-years/ - Creating new academic year: {year_data.year_label}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if year label already exists
#         cursor.execute("SELECT id FROM academic_years WHERE year_label = ?", (year_data.year_label,))
#         if cursor.fetchone():
#             raise HTTPException(status_code=400, detail=f"Academic year {year_data.year_label} already exists")
        
#         # Check for date overlaps
#         validate_no_overlap(cursor, year_data.start_date, year_data.end_date)
        
#         # Handle current year logic
#         is_current = year_data.is_current
#         if is_current:
#             ensure_single_current_year(cursor)
        
#         # Insert new academic year
#         cursor.execute("""
#             INSERT INTO academic_years (
#                 year_label, start_date, end_date, is_current, status,
#                 created_by, created_at, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             year_data.year_label, year_data.start_date, year_data.end_date,
#             is_current, year_data.status, year_data.created_by,
#             datetime.now().isoformat(), datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         new_id = cursor.lastrowid
        
#         logger.info(f"Academic year created successfully with ID: {new_id}")
        
#         return {
#             "success": True,
#             "message": "Academic year created successfully",
#             "data": {"id": new_id},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in create_academic_year: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/{year_id}")
# async def update_academic_year(year_id: int, year_data: AcademicYearUpdate):
#     """Update an academic year"""
#     logger.info(f"PUT /api/academic-years/{year_id} - Updating academic year")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if academic year exists
#         cursor.execute("SELECT * FROM academic_years WHERE id = ?", (year_id,))
#         existing = cursor.fetchone()
        
#         if not existing:
#             raise HTTPException(status_code=404, detail="Academic year not found")
        
#         # Check if trying to archive current year
#         if year_data.status == "archived" and existing['is_current']:
#             raise HTTPException(status_code=400, detail="Cannot archive the current academic year")
        
#         # Build update query dynamically
#         updates = []
#         params = []
        
#         if year_data.year_label is not None:
#             # Check if new label is unique
#             cursor.execute("SELECT id FROM academic_years WHERE year_label = ? AND id != ?", 
#                           (year_data.year_label, year_id))
#             if cursor.fetchone():
#                 raise HTTPException(status_code=400, detail="Year label already exists")
#             updates.append("year_label = ?")
#             params.append(year_data.year_label)
        
#         if year_data.start_date is not None:
#             updates.append("start_date = ?")
#             params.append(year_data.start_date)
        
#         if year_data.end_date is not None:
#             updates.append("end_date = ?")
#             params.append(year_data.end_date)
        
#         if year_data.status is not None:
#             updates.append("status = ?")
#             params.append(year_data.status)
        
#         if year_data.is_current is not None:
#             if year_data.is_current and existing['status'] == 'archived':
#                 raise HTTPException(status_code=400, detail="Cannot set archived year as current")
#             updates.append("is_current = ?")
#             params.append(1 if year_data.is_current else 0)
        
#         if year_data.updated_by is not None:
#             updates.append("updated_by = ?")
#             params.append(year_data.updated_by)
        
#         # Validate dates if both are being updated or if one is updated
#         start_date = year_data.start_date if year_data.start_date is not None else existing['start_date']
#         end_date = year_data.end_date if year_data.end_date is not None else existing['end_date']
        
#         if year_data.start_date is not None or year_data.end_date is not None:
#             if end_date <= start_date:
#                 raise HTTPException(status_code=400, detail="End date must be after start date")
#             # Check for overlaps excluding current year
#             validate_no_overlap(cursor, start_date, end_date, year_id)
        
#         # Add version increment and update timestamp
#         updates.append("version = version + 1")
#         updates.append("updated_at = ?")
#         params.append(datetime.now().isoformat())
        
#         # Execute update
#         if updates:
#             params.append(year_id)
#             query = f"UPDATE academic_years SET {', '.join(updates)} WHERE id = ?"
#             cursor.execute(query, params)
            
#             # Handle current year logic if is_current was set to True
#             if year_data.is_current:
#                 ensure_single_current_year(cursor, year_id)
            
#             conn.commit()
#             logger.info(f"Academic year {year_id} updated successfully")
        
#         return {
#             "success": True,
#             "message": "Academic year updated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in update_academic_year: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.delete("/{year_id}")
# async def delete_academic_year(year_id: int):
#     """Delete an academic year"""
#     logger.info(f"DELETE /api/academic-years/{year_id} - Deleting academic year")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if academic year exists
#         cursor.execute("SELECT is_current, status FROM academic_years WHERE id = ?", (year_id,))
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Academic year not found")
        
#         if result['is_current']:
#             raise HTTPException(status_code=400, detail="Cannot delete the current academic year")
        
#         # Delete the academic year
#         cursor.execute("DELETE FROM academic_years WHERE id = ?", (year_id,))
#         conn.commit()
        
#         logger.info(f"Academic year {year_id} deleted successfully")
        
#         return {
#             "success": True,
#             "message": "Academic year deleted successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in delete_academic_year: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/{year_id}/set-current")
# async def set_current_academic_year(year_id: int):
#     """Set an academic year as current"""
#     logger.info(f"POST /api/academic-years/{year_id}/set-current - Setting as current")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if academic year exists
#         cursor.execute("SELECT status FROM academic_years WHERE id = ?", (year_id,))
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Academic year not found")
        
#         if result['status'] == 'archived':
#             raise HTTPException(status_code=400, detail="Cannot set archived year as current")
        
#         # Set as current and ensure only one current
#         ensure_single_current_year(cursor, year_id)
        
#         conn.commit()
        
#         logger.info(f"Academic year {year_id} set as current")
        
#         return {
#             "success": True,
#             "message": "Academic year set as current successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in set_current_academic_year: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/clone")
# async def clone_academic_year(clone_request: CloneRequest):
#     """Clone data from previous academic year"""
#     logger.info(f"POST /api/academic-years/clone - Cloning from year {clone_request.source_year_id}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if source year exists
#         cursor.execute("SELECT * FROM academic_years WHERE id = ?", (clone_request.source_year_id,))
#         source_year = cursor.fetchone()
        
#         if not source_year:
#             raise HTTPException(status_code=404, detail="Source academic year not found")
        
#         # Check if new year label already exists
#         cursor.execute("SELECT id FROM academic_years WHERE year_label = ?", (clone_request.new_year_label,))
#         if cursor.fetchone():
#             raise HTTPException(status_code=400, detail="Year label already exists")
        
#         # Check for date overlaps
#         validate_no_overlap(cursor, clone_request.start_date, clone_request.end_date)
        
#         # Create new academic year
#         cursor.execute("""
#             INSERT INTO academic_years (
#                 year_label, start_date, end_date, is_current, status,
#                 created_by, created_at, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             clone_request.new_year_label, clone_request.start_date, clone_request.end_date,
#             0, 'active', clone_request.created_by,
#             datetime.now().isoformat(), datetime.now().isoformat()
#         ))
        
#         new_year_id = cursor.lastrowid
#         conn.commit()
        
#         # Log what would be cloned
#         clone_summary = {
#             "classes": clone_request.options.classes,
#             "subjects": clone_request.options.subjects,
#             "assignments": clone_request.options.assignments,
#             "fees": clone_request.options.fees,
#             "exams": clone_request.options.exams
#         }
        
#         logger.info(f"Clone request completed for new year {new_year_id} with options: {clone_summary}")
        
#         return {
#             "success": True,
#             "message": "Academic year cloned successfully",
#             "data": {
#                 "id": new_year_id,
#                 "cloned_from": clone_request.source_year_id,
#                 "clone_options": clone_summary
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in clone_academic_year: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Sync Integration Functions ====================

# def sync_academic_year_from_external(source_data: Dict[str, Any]) -> bool:

#     """Sync academic year from external database"""
#     try:
#         logger.info("Syncing academic year from external source")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             INSERT OR REPLACE INTO academic_years (
#                 id, year_label, start_date, end_date, is_current, status,
#                 version, synced_at, updated_by_sync, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             source_data.get('id'),
#             source_data.get('year_label'),
#             source_data.get('start_date'),
#             source_data.get('end_date'),
#             source_data.get('is_current', 0),
#             source_data.get('status', 'active'),
#             source_data.get('version', 1),
#             datetime.now().isoformat(),
#             1,
#             datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         conn.close()
#         logger.info("Academic year synced successfully")
#         return True
        
#     except Exception as e:
#         logger.error(f"Error syncing academic year: {str(e)}")
#         logger.error(traceback.format_exc())
#         return False




# app/school/academic_years.py

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

router = APIRouter(prefix="/api/academic-years", tags=["academic-years"])

# ==================== Pydantic Models ====================

class AcademicYearBase(BaseModel):
    year_label: str = Field(..., min_length=1, max_length=20)
    start_date: date
    end_date: date
    status: str = Field(default="active", pattern="^(active|inactive|archived)$")
    is_current: bool = False
    
    @validator('year_label')
    def validate_year_label(cls, v):
        # Validate format like "2024-2025"
        parts = v.split('-')
        if len(parts) != 2:
            raise ValueError('Year label must be in format YYYY-YYYY')
        try:
            start_year = int(parts[0])
            end_year = int(parts[1])
            if end_year != start_year + 1:
                raise ValueError('Years must be consecutive (e.g., 2024-2025)')
        except ValueError:
            raise ValueError('Invalid year format. Use YYYY-YYYY')
        return v
    
    @validator('end_date')
    def validate_dates(cls, end_date, values):
        if 'start_date' in values and end_date <= values['start_date']:
            raise ValueError('End date must be after start date')
        return end_date

class AcademicYearCreate(AcademicYearBase):
    created_by: Optional[int] = None

class AcademicYearUpdate(BaseModel):
    year_label: Optional[str] = Field(None, min_length=1, max_length=20)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive|archived)$")
    is_current: Optional[bool] = None
    updated_by: Optional[int] = None

class CloneOptions(BaseModel):
    classes: bool = True
    subjects: bool = True
    assignments: bool = True
    fees: bool = False
    exams: bool = False

class CloneRequest(BaseModel):
    new_year_label: str
    start_date: date
    end_date: date
    source_year_id: int
    options: CloneOptions = CloneOptions()
    created_by: Optional[int] = None

class AcademicYearResponse(BaseModel):
    id: int
    year_label: str
    start_date: date
    end_date: date
    is_current: bool
    status: str
    version: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int]
    updated_by: Optional[int]

# ==================== Helper Functions ====================

def validate_no_overlap(cursor, start_date: date, end_date: date, exclude_id: Optional[int] = None):
    """Check if new academic year overlaps with existing ones"""
    query = """
        SELECT COUNT(*) as count FROM academic_years 
        WHERE (
            (start_date BETWEEN ? AND ?) OR 
            (end_date BETWEEN ? AND ?) OR 
            (start_date <= ? AND end_date >= ?)
        )
    """
    params = [start_date, end_date, start_date, end_date, start_date, end_date]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    result = cursor.fetchone()
    
    if result and result['count'] > 0:
        raise HTTPException(status_code=400, detail="Academic year dates overlap with existing year")

def ensure_single_current_year(cursor, year_id: Optional[int] = None):
    """Ensure only one academic year is marked as current"""
    if year_id:
        cursor.execute("""
            UPDATE academic_years 
            SET is_current = CASE WHEN id = ? THEN 1 ELSE 0 END,
                status = CASE WHEN id = ? AND status = 'archived' THEN 'active' ELSE status END,
                updated_at = ?
            WHERE is_current = 1 OR id = ?
        """, (year_id, year_id, datetime.now().isoformat(), year_id))
    else:
        cursor.execute("""
            UPDATE academic_years 
            SET is_current = 0, updated_at = ?
            WHERE is_current = 1
        """, (datetime.now().isoformat(),))

# ==================== Database Setup ====================

def create_academic_years_table():
    """Create academic_years table if it doesn't exist"""
    try:
        logger.info("Creating/checking academic_years table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS academic_years (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                year_label TEXT NOT NULL UNIQUE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                is_current BOOLEAN DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
                version INTEGER DEFAULT 1,
                synced_at TIMESTAMP,
                updated_by_sync BOOLEAN DEFAULT 0,
                sync_error TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER,
                updated_by INTEGER
            )
        """)
        logger.info("Table creation/check completed")
        
        # Check if table is empty, insert default records
        cursor.execute("SELECT COUNT(*) as count FROM academic_years")
        result = cursor.fetchone()
        
        if result['count'] == 0:
            logger.info("Inserting default academic years")
            default_years = [
                ("2022-2023", "2022-08-15", "2023-06-10", 0, "archived"),
                ("2023-2024", "2023-08-14", "2024-06-08", 0, "inactive"),
                ("2024-2025", "2024-08-12", "2025-06-06", 1, "active")
            ]
            
            for year in default_years:
                cursor.execute("""
                    INSERT INTO academic_years (
                        year_label, start_date, end_date, is_current, status,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (*year, datetime.now().isoformat(), datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default academic years inserted successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating academic_years table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    # create_academic_years_table()
    pass
except Exception as e:
    logger.error(f"Failed to initialize academic_years table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_academic_years():
    """Get all academic years"""
    logger.info("GET /api/academic-years/ - Fetching all academic years")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM academic_years 
            ORDER BY start_date DESC
        """)
        
        results = cursor.fetchall()
        academic_years = []
        
        for row in results:
            # Use direct dictionary access instead of .get()
            academic_years.append({
                "id": row['id'],
                "year_label": row['year_label'],
                "start_date": row['start_date'],
                "end_date": row['end_date'],
                "is_current": bool(row['is_current']),
                "status": row['status'],
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at'],
                "created_by": row['created_by'] if 'created_by' in row.keys() else None,
                "updated_by": row['updated_by'] if 'updated_by' in row.keys() else None
            })
        
        logger.info(f"Retrieved {len(academic_years)} academic years")
        
        return {
            "success": True,
            "data": academic_years,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_academic_years: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

@router.get("/current")
async def get_current_academic_year():
    """Get the current academic year"""
    logger.info("GET /api/academic-years/current - Fetching current academic year")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM academic_years 
            WHERE is_current = 1
            LIMIT 1
        """)
        
        result = cursor.fetchone()
        
        if not result:
            return {
                "success": False,
                "message": "No current academic year set",
                "data": None,
                "timestamp": datetime.now().isoformat()
            }
        
        current_year = {
            "id": result['id'],
            "year_label": result['year_label'],
            "start_date": result['start_date'],
            "end_date": result['end_date'],
            "is_current": bool(result['is_current']),
            "status": result['status']
        }
        
        return {
            "success": True,
            "data": current_year,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_current_academic_year: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{year_id}")
async def get_academic_year(year_id: int):
    """Get a specific academic year by ID"""
    logger.info(f"GET /api/academic-years/{year_id} - Fetching academic year")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM academic_years WHERE id = ?", (year_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Academic year not found")
        
        academic_year = {
            "id": result['id'],
            "year_label": result['year_label'],
            "start_date": result['start_date'],
            "end_date": result['end_date'],
            "is_current": bool(result['is_current']),
            "status": result['status'],
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": academic_year,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_academic_year: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_academic_year(year_data: AcademicYearCreate):
    """Create a new academic year"""
    logger.info(f"POST /api/academic-years/ - Creating new academic year: {year_data.year_label}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if year label already exists
        cursor.execute("SELECT id FROM academic_years WHERE year_label = ?", (year_data.year_label,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail=f"Academic year {year_data.year_label} already exists")
        
        # Check for date overlaps
        validate_no_overlap(cursor, year_data.start_date, year_data.end_date)
        
        # Handle current year logic
        is_current = year_data.is_current
        if is_current:
            ensure_single_current_year(cursor)
        
        # Insert new academic year
        cursor.execute("""
            INSERT INTO academic_years (
                year_label, start_date, end_date, is_current, status,
                created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            year_data.year_label, year_data.start_date, year_data.end_date,
            is_current, year_data.status, year_data.created_by,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Academic year created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Academic year created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_academic_year: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{year_id}")
async def update_academic_year(year_id: int, year_data: AcademicYearUpdate):
    """Update an academic year"""
    logger.info(f"PUT /api/academic-years/{year_id} - Updating academic year")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if academic year exists
        cursor.execute("SELECT * FROM academic_years WHERE id = ?", (year_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Academic year not found")
        
        # Check if trying to archive current year
        if year_data.status == "archived" and existing['is_current']:
            raise HTTPException(status_code=400, detail="Cannot archive the current academic year")
        
        # Build update query dynamically
        updates = []
        params = []
        
        if year_data.year_label is not None:
            # Check if new label is unique
            cursor.execute("SELECT id FROM academic_years WHERE year_label = ? AND id != ?", 
                          (year_data.year_label, year_id))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Year label already exists")
            updates.append("year_label = ?")
            params.append(year_data.year_label)
        
        if year_data.start_date is not None:
            updates.append("start_date = ?")
            params.append(year_data.start_date)
        
        if year_data.end_date is not None:
            updates.append("end_date = ?")
            params.append(year_data.end_date)
        
        if year_data.status is not None:
            updates.append("status = ?")
            params.append(year_data.status)
        
        if year_data.is_current is not None:
            if year_data.is_current and existing['status'] == 'archived':
                raise HTTPException(status_code=400, detail="Cannot set archived year as current")
            updates.append("is_current = ?")
            params.append(1 if year_data.is_current else 0)
        
        if year_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(year_data.updated_by)
        
        # Validate dates if both are being updated or if one is updated
        start_date = year_data.start_date if year_data.start_date is not None else existing['start_date']
        end_date = year_data.end_date if year_data.end_date is not None else existing['end_date']
        
        if year_data.start_date is not None or year_data.end_date is not None:
            if end_date <= start_date:
                raise HTTPException(status_code=400, detail="End date must be after start date")
            # Check for overlaps excluding current year
            validate_no_overlap(cursor, start_date, end_date, year_id)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(year_id)
            query = f"UPDATE academic_years SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            
            # Handle current year logic if is_current was set to True
            if year_data.is_current:
                ensure_single_current_year(cursor, year_id)
            
            conn.commit()
            logger.info(f"Academic year {year_id} updated successfully")
        
        return {
            "success": True,
            "message": "Academic year updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_academic_year: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{year_id}")
async def delete_academic_year(year_id: int):
    """Delete an academic year"""
    logger.info(f"DELETE /api/academic-years/{year_id} - Deleting academic year")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if academic year exists
        cursor.execute("SELECT is_current, status FROM academic_years WHERE id = ?", (year_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Academic year not found")
        
        if result['is_current']:
            raise HTTPException(status_code=400, detail="Cannot delete the current academic year")
        
        # Delete the academic year
        cursor.execute("DELETE FROM academic_years WHERE id = ?", (year_id,))
        conn.commit()
        
        logger.info(f"Academic year {year_id} deleted successfully")
        
        return {
            "success": True,
            "message": "Academic year deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_academic_year: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/{year_id}/set-current")
async def set_current_academic_year(year_id: int):
    """Set an academic year as current"""
    logger.info(f"POST /api/academic-years/{year_id}/set-current - Setting as current")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if academic year exists
        cursor.execute("SELECT status FROM academic_years WHERE id = ?", (year_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Academic year not found")
        
        if result['status'] == 'archived':
            raise HTTPException(status_code=400, detail="Cannot set archived year as current")
        
        # Set as current and ensure only one current
        ensure_single_current_year(cursor, year_id)
        
        conn.commit()
        
        logger.info(f"Academic year {year_id} set as current")
        
        return {
            "success": True,
            "message": "Academic year set as current successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in set_current_academic_year: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/clone")
async def clone_academic_year(clone_request: CloneRequest):
    """Clone data from previous academic year"""
    logger.info(f"POST /api/academic-years/clone - Cloning from year {clone_request.source_year_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if source year exists
        cursor.execute("SELECT * FROM academic_years WHERE id = ?", (clone_request.source_year_id,))
        source_year = cursor.fetchone()
        
        if not source_year:
            raise HTTPException(status_code=404, detail="Source academic year not found")
        
        # Check if new year label already exists
        cursor.execute("SELECT id FROM academic_years WHERE year_label = ?", (clone_request.new_year_label,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Year label already exists")
        
        # Check for date overlaps
        validate_no_overlap(cursor, clone_request.start_date, clone_request.end_date)
        
        # Create new academic year
        cursor.execute("""
            INSERT INTO academic_years (
                year_label, start_date, end_date, is_current, status,
                created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            clone_request.new_year_label, clone_request.start_date, clone_request.end_date,
            0, 'active', clone_request.created_by,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        new_year_id = cursor.lastrowid
        conn.commit()
        
        # Log what would be cloned
        clone_summary = {
            "classes": clone_request.options.classes,
            "subjects": clone_request.options.subjects,
            "assignments": clone_request.options.assignments,
            "fees": clone_request.options.fees,
            "exams": clone_request.options.exams
        }
        
        logger.info(f"Clone request completed for new year {new_year_id} with options: {clone_summary}")
        
        return {
            "success": True,
            "message": "Academic year cloned successfully",
            "data": {
                "id": new_year_id,
                "cloned_from": clone_request.source_year_id,
                "clone_options": clone_summary
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in clone_academic_year: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_academic_year_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync academic year from external database"""
    try:
        logger.info("Syncing academic year from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO academic_years (
                id, year_label, start_date, end_date, is_current, status,
                version, synced_at, updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('year_label'),
            source_data.get('start_date'),
            source_data.get('end_date'),
            source_data.get('is_current', 0),
            source_data.get('status', 'active'),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Academic year synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing academic year: {str(e)}")
        logger.error(traceback.format_exc())
        return False