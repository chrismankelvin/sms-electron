# # app/school/sections.py

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

# router = APIRouter(prefix="/api/sections", tags=["sections"])

# # ==================== Pydantic Models ====================

# class SectionBase(BaseModel):
#     section_name: str = Field(..., min_length=1, max_length=50)
#     class_id: int
#     academic_year_id: int
#     description: Optional[str] = None
#     capacity: int = Field(default=40, ge=1, le=200)
    
#     @validator('section_name')
#     def validate_section_name(cls, v):
#         if not v.strip():
#             raise ValueError('Section name cannot be empty')
#         return v.strip()

# class SectionCreate(SectionBase):
#     created_by: Optional[int] = None

# class SectionUpdate(BaseModel):
#     section_name: Optional[str] = Field(None, min_length=1, max_length=50)
#     class_id: Optional[int] = None
#     academic_year_id: Optional[int] = None
#     description: Optional[str] = None
#     capacity: Optional[int] = Field(None, ge=1, le=200)
#     updated_by: Optional[int] = None

# class SectionResponse(BaseModel):
#     id: int
#     section_name: str
#     class_id: int
#     academic_year_id: int
#     description: Optional[str]
#     capacity: int
#     current_enrollment: int = 0
#     version: int
#     created_at: datetime
#     updated_at: datetime

# # ==================== Helper Functions ====================

# def get_current_enrollment(cursor, section_id: int) -> int:
#     """Get current number of students enrolled in a section"""
#     try:
#         cursor.execute("""
#             SELECT COUNT(*) as count FROM student_enrollments 
#             WHERE section_id = ? AND status = 'active'
#         """, (section_id,))
#         result = cursor.fetchone()
#         return result['count'] if result else 0
#     except Exception as e:
#         logger.warning(f"Could not get enrollment count for section {section_id}: {str(e)}")
#         return 0

# def validate_class_exists(cursor, class_id: int) -> bool:
#     """Validate that the class exists"""
#     cursor.execute("SELECT id FROM classes WHERE id = ?", (class_id,))
#     return cursor.fetchone() is not None

# def validate_academic_year_exists(cursor, academic_year_id: int) -> bool:
#     """Validate that the academic year exists"""
#     cursor.execute("SELECT id FROM academic_years WHERE id = ?", (academic_year_id,))
#     return cursor.fetchone() is not None

# def ensure_unique_section(cursor, section_name: str, class_id: int, academic_year_id: int, exclude_id: Optional[int] = None):
#     """Ensure section name is unique within the same class and academic year"""
#     query = """
#         SELECT id FROM sections 
#         WHERE section_name = ? AND class_id = ? AND academic_year_id = ?
#     """
#     params = [section_name, class_id, academic_year_id]
    
#     if exclude_id:
#         query += " AND id != ?"
#         params.append(exclude_id)
    
#     cursor.execute(query, params)
#     if cursor.fetchone():
#         raise HTTPException(
#             status_code=400,
#             detail=f"Section '{section_name}' already exists for this class in the selected academic year."
#         )

# # ==================== Database Setup ====================

# def create_sections_table():
#     """Create sections table if it doesn't exist"""
#     try:
#         logger.info("Creating/checking sections table")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if table exists
#         cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sections'")
#         table_exists = cursor.fetchone()
        
#         if not table_exists:
#             cursor.execute("""
#                 CREATE TABLE sections (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     section_name TEXT NOT NULL,
#                     class_id INTEGER NOT NULL,
#                     academic_year_id INTEGER NOT NULL,
#                     description TEXT,
#                     capacity INTEGER DEFAULT 40,
#                     version INTEGER DEFAULT 1,
#                     synced_at TIMESTAMP,
#                     updated_by_sync BOOLEAN DEFAULT 0,
#                     sync_error TEXT,
#                     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#                     created_by INTEGER,
#                     updated_by INTEGER,
#                     FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
#                     FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
#                     FOREIGN KEY (created_by) REFERENCES users(id),
#                     FOREIGN KEY (updated_by) REFERENCES users(id),
#                     UNIQUE(class_id, section_name, academic_year_id)
#                 )
#             """)
#             logger.info("New sections table created")
            
#             # Insert default sections if table is empty
#             cursor.execute("SELECT COUNT(*) as count FROM sections")
#             result = cursor.fetchone()
            
#             if result['count'] == 0:
#                 logger.info("Inserting default sections")
#                 default_sections = [
#                     ("A", 1, 3, "Morning section A", 40),
#                     ("B", 1, 3, "Afternoon section B", 40),
#                     ("Morning", 3, 3, "Morning session", 45),
#                     ("Afternoon", 3, 3, "Afternoon session", 45)
#                 ]
                
#                 for section in default_sections:
#                     cursor.execute("""
#                         INSERT INTO sections (
#                             section_name, class_id, academic_year_id, description, capacity,
#                             created_at, updated_at
#                         ) VALUES (?, ?, ?, ?, ?, ?, ?)
#                     """, (*section, datetime.now().isoformat(), datetime.now().isoformat()))
                
#                 conn.commit()
#                 logger.info("Default sections inserted successfully")
#         else:
#             logger.info("Table 'sections' already exists, checking columns")
            
#             # Add missing columns if needed
#             cursor.execute("PRAGMA table_info(sections)")
#             columns = cursor.fetchall()
#             column_names = [col['name'] for col in columns]
            
#             if 'synced_at' not in column_names:
#                 logger.info("Adding synced_at column")
#                 cursor.execute("ALTER TABLE sections ADD COLUMN synced_at TIMESTAMP")
            
#             if 'updated_by_sync' not in column_names:
#                 logger.info("Adding updated_by_sync column")
#                 cursor.execute("ALTER TABLE sections ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0")
            
#             if 'sync_error' not in column_names:
#                 logger.info("Adding sync_error column")
#                 cursor.execute("ALTER TABLE sections ADD COLUMN sync_error TEXT")
            
#             if 'created_by' not in column_names:
#                 logger.info("Adding created_by column")
#                 cursor.execute("ALTER TABLE sections ADD COLUMN created_by INTEGER")
            
#             if 'updated_by' not in column_names:
#                 logger.info("Adding updated_by column")
#                 cursor.execute("ALTER TABLE sections ADD COLUMN updated_by INTEGER")
            
#             conn.commit()
#             logger.info("Table structure updated successfully")
        
#         conn.close()
#     except Exception as e:
#         logger.error(f"Error creating/updating sections table: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise

# # Initialize table on module load
# try:
#     # create_sections_table()
#     pass
# except Exception as e:
#     logger.error(f"Failed to initialize sections table: {str(e)}")

# # ==================== API Endpoints ====================

# @router.get("/")
# async def get_sections(
#     class_id: Optional[int] = None,
#     academic_year_id: Optional[int] = None
# ):
#     """Get all sections with optional filters"""
#     logger.info(f"GET /api/sections/ - Fetching sections (class_id={class_id}, academic_year_id={academic_year_id})")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         query = """
#             SELECT s.*, c.class_name, ay.year_label as academic_year_label
#             FROM sections s
#             JOIN classes c ON s.class_id = c.id
#             JOIN academic_years ay ON s.academic_year_id = ay.id
#             WHERE 1=1
#         """
#         params = []
        
#         if class_id:
#             query += " AND s.class_id = ?"
#             params.append(class_id)
        
#         if academic_year_id:
#             query += " AND s.academic_year_id = ?"
#             params.append(academic_year_id)
        
#         query += " ORDER BY c.class_name ASC, s.section_name ASC"
        
#         cursor.execute(query, params)
#         results = cursor.fetchall()
#         sections = []
        
#         for row in results:
#             current_enrollment = get_current_enrollment(cursor, row['id'])
            
#             sections.append({
#                 "id": row['id'],
#                 "section_name": row['section_name'],
#                 "class_id": row['class_id'],
#                 "class_name": row['class_name'],
#                 "academic_year_id": row['academic_year_id'],
#                 "academic_year_label": row['academic_year_label'],
#                 "description": row['description'],
#                 "capacity": row['capacity'],
#                 "current_enrollment": current_enrollment,
#                 "version": row['version'],
#                 "created_at": row['created_at'],
#                 "updated_at": row['updated_at']
#             })
        
#         logger.info(f"Retrieved {len(sections)} sections")
        
#         return {
#             "success": True,
#             "data": sections,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_sections: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()
#             logger.debug("Database connection closed")

# @router.get("/{section_id}")
# async def get_section(section_id: int):
#     """Get a specific section by ID"""
#     logger.info(f"GET /api/sections/{section_id} - Fetching section")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT s.*, c.class_name, ay.year_label as academic_year_label
#             FROM sections s
#             JOIN classes c ON s.class_id = c.id
#             JOIN academic_years ay ON s.academic_year_id = ay.id
#             WHERE s.id = ?
#         """, (section_id,))
        
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Section not found")
        
#         current_enrollment = get_current_enrollment(cursor, section_id)
        
#         section = {
#             "id": result['id'],
#             "section_name": result['section_name'],
#             "class_id": result['class_id'],
#             "class_name": result['class_name'],
#             "academic_year_id": result['academic_year_id'],
#             "academic_year_label": result['academic_year_label'],
#             "description": result['description'],
#             "capacity": result['capacity'],
#             "current_enrollment": current_enrollment,
#             "version": result['version'],
#             "created_at": result['created_at'],
#             "updated_at": result['updated_at']
#         }
        
#         return {
#             "success": True,
#             "data": section,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_section: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/by-class/{class_id}")
# async def get_sections_by_class(class_id: int, academic_year_id: Optional[int] = None):
#     """Get all sections for a specific class"""
#     logger.info(f"GET /api/sections/by-class/{class_id} - Fetching sections by class")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         query = """
#             SELECT s.*, ay.year_label as academic_year_label
#             FROM sections s
#             JOIN academic_years ay ON s.academic_year_id = ay.id
#             WHERE s.class_id = ?
#         """
#         params = [class_id]
        
#         if academic_year_id:
#             query += " AND s.academic_year_id = ?"
#             params.append(academic_year_id)
        
#         query += " ORDER BY s.section_name ASC"
        
#         cursor.execute(query, params)
#         results = cursor.fetchall()
#         sections = []
        
#         for row in results:
#             current_enrollment = get_current_enrollment(cursor, row['id'])
            
#             sections.append({
#                 "id": row['id'],
#                 "section_name": row['section_name'],
#                 "class_id": row['class_id'],
#                 "academic_year_id": row['academic_year_id'],
#                 "academic_year_label": row['academic_year_label'],
#                 "description": row['description'],
#                 "capacity": row['capacity'],
#                 "current_enrollment": current_enrollment,
#                 "version": row['version'],
#                 "created_at": row['created_at'],
#                 "updated_at": row['updated_at']
#             })
        
#         return {
#             "success": True,
#             "data": sections,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_sections_by_class: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/")
# async def create_section(section_data: SectionCreate):
#     """Create a new section"""
#     logger.info(f"POST /api/sections/ - Creating new section: {section_data.section_name}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Validate foreign keys
#         if not validate_class_exists(cursor, section_data.class_id):
#             raise HTTPException(status_code=400, detail="Class not found")
        
#         if not validate_academic_year_exists(cursor, section_data.academic_year_id):
#             raise HTTPException(status_code=400, detail="Academic year not found")
        
#         # Ensure unique section within class and academic year
#         ensure_unique_section(
#             cursor, 
#             section_data.section_name, 
#             section_data.class_id, 
#             section_data.academic_year_id
#         )
        
#         # Insert new section
#         cursor.execute("""
#             INSERT INTO sections (
#                 section_name, class_id, academic_year_id, description, capacity,
#                 created_by, created_at, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             section_data.section_name, section_data.class_id, section_data.academic_year_id,
#             section_data.description, section_data.capacity, section_data.created_by,
#             datetime.now().isoformat(), datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         new_id = cursor.lastrowid
        
#         logger.info(f"Section created successfully with ID: {new_id}")
        
#         return {
#             "success": True,
#             "message": "Section created successfully",
#             "data": {"id": new_id},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in create_section: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/{section_id}")
# async def update_section(section_id: int, section_data: SectionUpdate):
#     """Update a section"""
#     logger.info(f"PUT /api/sections/{section_id} - Updating section")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if section exists
#         cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
#         existing = cursor.fetchone()
        
#         if not existing:
#             raise HTTPException(status_code=404, detail="Section not found")
        
#         # Build update query dynamically
#         updates = []
#         params = []
        
#         # Get values for validation
#         new_section_name = section_data.section_name if section_data.section_name is not None else existing['section_name']
#         new_class_id = section_data.class_id if section_data.class_id is not None else existing['class_id']
#         new_academic_year_id = section_data.academic_year_id if section_data.academic_year_id is not None else existing['academic_year_id']
#         new_capacity = section_data.capacity if section_data.capacity is not None else existing['capacity']
        
#         # Validate foreign keys if being updated
#         if section_data.class_id is not None and not validate_class_exists(cursor, section_data.class_id):
#             raise HTTPException(status_code=400, detail="Class not found")
        
#         if section_data.academic_year_id is not None and not validate_academic_year_exists(cursor, section_data.academic_year_id):
#             raise HTTPException(status_code=400, detail="Academic year not found")
        
#         # Check unique constraint if relevant fields are being updated
#         if (section_data.section_name is not None or 
#             section_data.class_id is not None or 
#             section_data.academic_year_id is not None):
#             ensure_unique_section(
#                 cursor, new_section_name, new_class_id, new_academic_year_id, section_id
#             )
        
#         # Check capacity against current enrollment
#         if section_data.capacity is not None:
#             current_enrollment = get_current_enrollment(cursor, section_id)
#             if section_data.capacity < current_enrollment:
#                 raise HTTPException(
#                     status_code=400,
#                     detail=f"Cannot reduce capacity to {section_data.capacity} because there are {current_enrollment} students currently enrolled."
#                 )
        
#         # Apply updates
#         if section_data.section_name is not None:
#             updates.append("section_name = ?")
#             params.append(section_data.section_name)
        
#         if section_data.class_id is not None:
#             updates.append("class_id = ?")
#             params.append(section_data.class_id)
        
#         if section_data.academic_year_id is not None:
#             updates.append("academic_year_id = ?")
#             params.append(section_data.academic_year_id)
        
#         if section_data.description is not None:
#             updates.append("description = ?")
#             params.append(section_data.description)
        
#         if section_data.capacity is not None:
#             updates.append("capacity = ?")
#             params.append(section_data.capacity)
        
#         if section_data.updated_by is not None:
#             updates.append("updated_by = ?")
#             params.append(section_data.updated_by)
        
#         # Add version increment and update timestamp
#         updates.append("version = version + 1")
#         updates.append("updated_at = ?")
#         params.append(datetime.now().isoformat())
        
#         # Execute update
#         if updates:
#             params.append(section_id)
#             query = f"UPDATE sections SET {', '.join(updates)} WHERE id = ?"
#             cursor.execute(query, params)
#             conn.commit()
#             logger.info(f"Section {section_id} updated successfully")
        
#         return {
#             "success": True,
#             "message": "Section updated successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in update_section: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.delete("/{section_id}")
# async def delete_section(section_id: int):
#     """Delete a section"""
#     logger.info(f"DELETE /api/sections/{section_id} - Deleting section")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if section exists and get details
#         cursor.execute("""
#             SELECT s.section_name, c.class_name 
#             FROM sections s
#             JOIN classes c ON s.class_id = c.id
#             WHERE s.id = ?
#         """, (section_id,))
#         section = cursor.fetchone()
        
#         if not section:
#             raise HTTPException(status_code=404, detail="Section not found")
        
#         # Check if section has enrolled students
#         current_enrollment = get_current_enrollment(cursor, section_id)
        
#         if current_enrollment > 0:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Cannot delete section '{section['section_name']}' because it has {current_enrollment} enrolled students. Reassign or unenroll students first."
#             )
        
#         # Delete the section
#         cursor.execute("DELETE FROM sections WHERE id = ?", (section_id,))
#         conn.commit()
        
#         logger.info(f"Section {section_id} ({section['section_name']} - {section['class_name']}) deleted successfully")
        
#         return {
#             "success": True,
#             "message": f"Section '{section['section_name']}' deleted successfully",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in delete_section: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/{section_id}/students")
# async def get_section_students(section_id: int):
#     """Get all students enrolled in a section"""
#     logger.info(f"GET /api/sections/{section_id}/students - Fetching section students")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if section exists
#         cursor.execute("SELECT section_name FROM sections WHERE id = ?", (section_id,))
#         if not cursor.fetchone():
#             raise HTTPException(status_code=404, detail="Section not found")
        
#         cursor.execute("""
#             SELECT s.* FROM students s
#             JOIN student_enrollments e ON s.id = e.student_id
#             WHERE e.section_id = ? AND e.status = 'active'
#             ORDER BY s.surname, s.first_name
#         """, (section_id,))
        
#         results = cursor.fetchall()
#         students = []
        
#         for row in results:
#             students.append({
#                 "id": row['id'],
#                 "first_name": row['first_name'],
#                 "surname": row['surname'],
#                 "admission_number": row.get('admission_number'),
#                 "gender": row.get('gender'),
#                 "date_of_birth": row.get('date_of_birth')
#             })
        
#         return {
#             "success": True,
#             "data": students,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_section_students: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# # ==================== Sync Integration Functions ====================

# def sync_section_from_external(source_data: Dict[str, Any]) -> bool:
#     """Sync section from external database"""
#     try:
#         logger.info("Syncing section from external source")
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             INSERT OR REPLACE INTO sections (
#                 id, section_name, class_id, academic_year_id, description, capacity,
#                 version, synced_at, updated_by_sync, updated_at
#             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             source_data.get('id'),
#             source_data.get('section_name'),
#             source_data.get('class_id'),
#             source_data.get('academic_year_id'),
#             source_data.get('description'),
#             source_data.get('capacity', 40),
#             source_data.get('version', 1),
#             datetime.now().isoformat(),
#             1,
#             datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         conn.close()
#         logger.info("Section synced successfully")
#         return True
        
#     except Exception as e:
#         logger.error(f"Error syncing section: {str(e)}")
#         logger.error(traceback.format_exc())
#         return False






# app/school/sections.py

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

router = APIRouter(prefix="/api/sections", tags=["sections"])

# ==================== Pydantic Models ====================

class SectionBase(BaseModel):
    section_name: str = Field(..., min_length=1, max_length=50)
    class_id: int
    academic_year_id: int
    description: Optional[str] = None
    capacity: int = Field(default=40, ge=1, le=200)
    
    @validator('section_name')
    def validate_section_name(cls, v):
        if not v.strip():
            raise ValueError('Section name cannot be empty')
        return v.strip()

class SectionCreate(SectionBase):
    created_by: Optional[int] = None

class SectionUpdate(BaseModel):
    section_name: Optional[str] = Field(None, min_length=1, max_length=50)
    class_id: Optional[int] = None
    academic_year_id: Optional[int] = None
    description: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1, le=200)
    updated_by: Optional[int] = None

class SectionResponse(BaseModel):
    id: int
    section_name: str
    class_id: int
    class_name: str
    academic_year_id: int
    academic_year_label: str
    description: Optional[str]
    capacity: int
    current_enrollment: int = 0
    version: int
    created_at: datetime
    updated_at: datetime

# ==================== Helper Functions ====================

def get_current_enrollment(cursor, section_id: int, academic_year_id: int = None) -> int:
    """Get current number of students enrolled in a section from the students table"""
    try:
        if academic_year_id:
            cursor.execute("""
                SELECT COUNT(*) as count FROM students 
                WHERE section_id = ? AND academic_year_id = ? AND deleted_at IS NULL
            """, (section_id, academic_year_id))
        else:
            cursor.execute("""
                SELECT COUNT(*) as count FROM students 
                WHERE section_id = ? AND deleted_at IS NULL
            """, (section_id,))
        result = cursor.fetchone()
        return result['count'] if result else 0
    except Exception as e:
        logger.warning(f"Could not get enrollment count for section {section_id}: {str(e)}")
        return 0

def validate_class_exists(cursor, class_id: int) -> bool:
    """Validate that the class exists"""
    cursor.execute("SELECT id, class_name FROM classes WHERE id = ?", (class_id,))
    return cursor.fetchone() is not None

def get_class_name(cursor, class_id: int) -> str:
    """Get class name"""
    cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
    result = cursor.fetchone()
    return result['class_name'] if result else "Unknown"

def validate_academic_year_exists(cursor, academic_year_id: int) -> bool:
    """Validate that the academic year exists"""
    cursor.execute("SELECT id, year_label FROM academic_years WHERE id = ?", (academic_year_id,))
    return cursor.fetchone() is not None

def get_academic_year_label(cursor, academic_year_id: int) -> str:
    """Get academic year label"""
    cursor.execute("SELECT year_label FROM academic_years WHERE id = ?", (academic_year_id,))
    result = cursor.fetchone()
    return result['year_label'] if result else "Unknown"

def ensure_unique_section(cursor, section_name: str, class_id: int, academic_year_id: int, exclude_id: Optional[int] = None):
    """Ensure section name is unique within the same class and academic year"""
    query = """
        SELECT id FROM sections 
        WHERE section_name = ? AND class_id = ? AND academic_year_id = ?
    """
    params = [section_name, class_id, academic_year_id]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400,
            detail=f"Section '{section_name}' already exists for this class in the selected academic year."
        )

# ==================== Database Setup ====================

def create_sections_table():
    """Create sections table if it doesn't exist"""
    try:
        logger.info("Creating/checking sections table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sections'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE sections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    section_name TEXT NOT NULL,
                    class_id INTEGER NOT NULL,
                    academic_year_id INTEGER NOT NULL,
                    description TEXT,
                    capacity INTEGER DEFAULT 40,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync BOOLEAN DEFAULT 0,
                    sync_error TEXT,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (updated_by) REFERENCES users(id),
                    UNIQUE(class_id, section_name, academic_year_id)
                )
            """)
            logger.info("New sections table created")
        else:
            logger.info("Table 'sections' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(sections)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE sections ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE sections ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0")
            
            if 'sync_error' not in column_names:
                logger.info("Adding sync_error column")
                cursor.execute("ALTER TABLE sections ADD COLUMN sync_error TEXT")
            
            if 'created_by' not in column_names:
                logger.info("Adding created_by column")
                cursor.execute("ALTER TABLE sections ADD COLUMN created_by INTEGER")
            
            if 'updated_by' not in column_names:
                logger.info("Adding updated_by column")
                cursor.execute("ALTER TABLE sections ADD COLUMN updated_by INTEGER")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating sections table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_sections_table()
except Exception as e:
    logger.error(f"Failed to initialize sections table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_sections(
    class_id: Optional[int] = None,
    academic_year_id: Optional[int] = None
):
    """Get all sections with optional filters"""
    logger.info(f"GET /api/sections/ - Fetching sections (class_id={class_id}, academic_year_id={academic_year_id})")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT s.*, c.class_name, ay.year_label as academic_year_label
            FROM sections s
            JOIN classes c ON s.class_id = c.id
            JOIN academic_years ay ON s.academic_year_id = ay.id
            WHERE 1=1
        """
        params = []
        
        if class_id:
            query += " AND s.class_id = ?"
            params.append(class_id)
        
        if academic_year_id:
            query += " AND s.academic_year_id = ?"
            params.append(academic_year_id)
        
        query += " ORDER BY c.class_name ASC, s.section_name ASC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        sections = []
        
        for row in results:
            # Get enrollment count from students table
            current_enrollment = get_current_enrollment(cursor, row['id'], row['academic_year_id'])
            
            sections.append({
                "id": row['id'],
                "section_name": row['section_name'],
                "class_id": row['class_id'],
                "class_name": row['class_name'],
                "academic_year_id": row['academic_year_id'],
                "academic_year_label": row['academic_year_label'],
                "description": row['description'],
                "capacity": row['capacity'],
                "current_enrollment": current_enrollment,
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(sections)} sections")
        
        return {
            "success": True,
            "data": sections,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_sections: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{section_id}")
async def get_section(section_id: int):
    """Get a specific section by ID"""
    logger.info(f"GET /api/sections/{section_id} - Fetching section")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT s.*, c.class_name, ay.year_label as academic_year_label
            FROM sections s
            JOIN classes c ON s.class_id = c.id
            JOIN academic_years ay ON s.academic_year_id = ay.id
            WHERE s.id = ?
        """, (section_id,))
        
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Section not found")
        
        current_enrollment = get_current_enrollment(cursor, section_id, result['academic_year_id'])
        
        section = {
            "id": result['id'],
            "section_name": result['section_name'],
            "class_id": result['class_id'],
            "class_name": result['class_name'],
            "academic_year_id": result['academic_year_id'],
            "academic_year_label": result['academic_year_label'],
            "description": result['description'],
            "capacity": result['capacity'],
            "current_enrollment": current_enrollment,
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": section,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_section: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/by-class/{class_id}")
async def get_sections_by_class(class_id: int, academic_year_id: Optional[int] = None):
    """Get all sections for a specific class"""
    logger.info(f"GET /api/sections/by-class/{class_id} - Fetching sections by class")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate class exists
        if not validate_class_exists(cursor, class_id):
            raise HTTPException(status_code=404, detail="Class not found")
        
        query = """
            SELECT s.*, ay.year_label as academic_year_label
            FROM sections s
            JOIN academic_years ay ON s.academic_year_id = ay.id
            WHERE s.class_id = ?
        """
        params = [class_id]
        
        if academic_year_id:
            query += " AND s.academic_year_id = ?"
            params.append(academic_year_id)
        
        query += " ORDER BY s.section_name ASC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        sections = []
        
        for row in results:
            current_enrollment = get_current_enrollment(cursor, row['id'], row['academic_year_id'])
            
            sections.append({
                "id": row['id'],
                "section_name": row['section_name'],
                "class_id": row['class_id'],
                "academic_year_id": row['academic_year_id'],
                "academic_year_label": row['academic_year_label'],
                "description": row['description'],
                "capacity": row['capacity'],
                "current_enrollment": current_enrollment,
                "available_spots": row['capacity'] - current_enrollment,
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        return {
            "success": True,
            "data": sections,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_sections_by_class: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_section(section_data: SectionCreate):
    """Create a new section"""
    logger.info(f"POST /api/sections/ - Creating new section: {section_data.section_name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate foreign keys
        if not validate_class_exists(cursor, section_data.class_id):
            raise HTTPException(status_code=400, detail="Class not found")
        
        if not validate_academic_year_exists(cursor, section_data.academic_year_id):
            raise HTTPException(status_code=400, detail="Academic year not found")
        
        # Ensure unique section within class and academic year
        ensure_unique_section(
            cursor, 
            section_data.section_name, 
            section_data.class_id, 
            section_data.academic_year_id
        )
        
        # Insert new section
        cursor.execute("""
            INSERT INTO sections (
                section_name, class_id, academic_year_id, description, capacity,
                created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            section_data.section_name, section_data.class_id, section_data.academic_year_id,
            section_data.description, section_data.capacity, section_data.created_by,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Section created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Section created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_section: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{section_id}")
async def update_section(section_id: int, section_data: SectionUpdate):
    """Update a section"""
    logger.info(f"PUT /api/sections/{section_id} - Updating section")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if section exists
        cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Section not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Get values for validation
        new_section_name = section_data.section_name if section_data.section_name is not None else existing['section_name']
        new_class_id = section_data.class_id if section_data.class_id is not None else existing['class_id']
        new_academic_year_id = section_data.academic_year_id if section_data.academic_year_id is not None else existing['academic_year_id']
        new_capacity = section_data.capacity if section_data.capacity is not None else existing['capacity']
        
        # Validate foreign keys if being updated
        if section_data.class_id is not None and not validate_class_exists(cursor, section_data.class_id):
            raise HTTPException(status_code=400, detail="Class not found")
        
        if section_data.academic_year_id is not None and not validate_academic_year_exists(cursor, section_data.academic_year_id):
            raise HTTPException(status_code=400, detail="Academic year not found")
        
        # Check unique constraint if relevant fields are being updated
        if (section_data.section_name is not None or 
            section_data.class_id is not None or 
            section_data.academic_year_id is not None):
            ensure_unique_section(
                cursor, new_section_name, new_class_id, new_academic_year_id, section_id
            )
        
        # Check capacity against current enrollment from students table
        if section_data.capacity is not None:
            current_enrollment = get_current_enrollment(cursor, section_id, existing['academic_year_id'])
            if section_data.capacity < current_enrollment:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot reduce capacity to {section_data.capacity} because there are {current_enrollment} students currently enrolled."
                )
        
        # Apply updates
        if section_data.section_name is not None:
            updates.append("section_name = ?")
            params.append(section_data.section_name)
        
        if section_data.class_id is not None:
            updates.append("class_id = ?")
            params.append(section_data.class_id)
        
        if section_data.academic_year_id is not None:
            updates.append("academic_year_id = ?")
            params.append(section_data.academic_year_id)
        
        if section_data.description is not None:
            updates.append("description = ?")
            params.append(section_data.description)
        
        if section_data.capacity is not None:
            updates.append("capacity = ?")
            params.append(section_data.capacity)
        
        if section_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(section_data.updated_by)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(section_id)
            query = f"UPDATE sections SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Section {section_id} updated successfully")
        
        return {
            "success": True,
            "message": "Section updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_section: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{section_id}")
async def delete_section(section_id: int):
    """Delete a section"""
    logger.info(f"DELETE /api/sections/{section_id} - Deleting section")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if section exists and get details
        cursor.execute("""
            SELECT s.section_name, c.class_name, s.academic_year_id
            FROM sections s
            JOIN classes c ON s.class_id = c.id
            WHERE s.id = ?
        """, (section_id,))
        section = cursor.fetchone()
        
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
        
        # Check if section has enrolled students (from students table)
        current_enrollment = get_current_enrollment(cursor, section_id, section['academic_year_id'])
        
        if current_enrollment > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete section '{section['section_name']}' because it has {current_enrollment} enrolled students. Reassign or unenroll students first."
            )
        
        # Delete the section
        cursor.execute("DELETE FROM sections WHERE id = ?", (section_id,))
        conn.commit()
        
        logger.info(f"Section {section_id} ({section['section_name']} - {section['class_name']}) deleted successfully")
        
        return {
            "success": True,
            "message": f"Section '{section['section_name']}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_section: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{section_id}/students")
async def get_section_students(section_id: int, academic_year_id: Optional[int] = None):
    """Get all students enrolled in a section from the students table"""
    logger.info(f"GET /api/sections/{section_id}/students - Fetching section students")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if section exists
        cursor.execute("SELECT section_name, academic_year_id FROM sections WHERE id = ?", (section_id,))
        section = cursor.fetchone()
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
        
        year_id = academic_year_id or section['academic_year_id']
        
        # Get students directly from students table
        cursor.execute("""
            SELECT 
                s.id,
                s.student_number,
                s.status,
                s.enrolled_at,
                p.first_name,
                p.last_name,
                p.other_names,
                p.gender,
                p.date_of_birth,
                p.phone,
                p.email,
                p.address
            FROM students s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.section_id = ? AND s.academic_year_id = ? AND s.deleted_at IS NULL
            ORDER BY p.last_name, p.first_name
        """, (section_id, year_id))
        
        results = cursor.fetchall()
        students = []
        
        for row in results:
            name = f"{row['first_name']} {row['last_name']}"
            if row['other_names']:
                name += f" ({row['other_names']})"
            
            students.append({
                "id": row['id'],
                "student_number": row['student_number'],
                "name": name,
                "first_name": row['first_name'],
                "last_name": row['last_name'],
                "gender": row['gender'],
                "date_of_birth": row['date_of_birth'],
                "phone": row['phone'],
                "email": row['email'],
                "address": row['address'],
                "status": row['status'],
                "enrolled_at": row['enrolled_at']
            })
        
        return {
            "success": True,
            "data": {
                "section_id": section_id,
                "section_name": section['section_name'],
                "academic_year_id": year_id,
                "students": students,
                "count": len(students)
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_section_students: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_section_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync section from external database"""
    try:
        logger.info("Syncing section from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO sections (
                id, section_name, class_id, academic_year_id, description, capacity,
                version, synced_at, updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('section_name'),
            source_data.get('class_id'),
            source_data.get('academic_year_id'),
            source_data.get('description'),
            source_data.get('capacity', 40),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Section synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing section: {str(e)}")
        logger.error(traceback.format_exc())
        return False