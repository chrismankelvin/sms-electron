# app/school/classes.py

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

router = APIRouter(prefix="/api/classes", tags=["classes"])

# ==================== Pydantic Models ====================

class ClassBase(BaseModel):
    class_name: str = Field(..., min_length=1, max_length=100)
    class_code: Optional[str] = Field(None, min_length=1, max_length=50)
    level_id: int
    programme_id: Optional[int] = None
    academic_year_id: int
    form_master_id: Optional[int] = None
    description: Optional[str] = None
    capacity: int = Field(default=40, ge=1, le=500)
    is_active: bool = Field(default=True)
    
    @validator('class_name')
    def validate_class_name(cls, v):
        if not v.strip():
            raise ValueError('Class name cannot be empty')
        return v.strip()

class ClassCreate(ClassBase):
    created_by: Optional[int] = None

class ClassUpdate(BaseModel):
    class_name: Optional[str] = Field(None, min_length=1, max_length=100)
    class_code: Optional[str] = Field(None, min_length=1, max_length=50)
    level_id: Optional[int] = None
    programme_id: Optional[int] = None
    academic_year_id: Optional[int] = None
    form_master_id: Optional[int] = None
    description: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1, le=500)
    is_active: Optional[bool] = None
    updated_by: Optional[int] = None

class ClassResponse(BaseModel):
    id: int
    class_name: str
    class_code: Optional[str]
    level_id: int
    programme_id: Optional[int]
    academic_year_id: int
    form_master_id: Optional[int]
    description: Optional[str]
    capacity: int
    is_active: bool
    current_enrollment: int = 0
    version: int
    created_at: datetime
    updated_at: datetime

# ==================== Helper Functions ====================

def get_current_enrollment(cursor, class_id: int) -> int:
    """Get current number of students enrolled in a class"""
    try:
        cursor.execute("""
            SELECT COUNT(*) as count FROM student_enrollments 
            WHERE class_id = ? AND status = 'active'
        """, (class_id,))
        result = cursor.fetchone()
        return result['count'] if result else 0
    except Exception as e:
        logger.warning(f"Could not get enrollment count for class {class_id}: {str(e)}")
        return 0

def validate_level_exists(cursor, level_id: int) -> bool:
    """Validate that the level exists"""
    cursor.execute("SELECT id FROM levels WHERE id = ?", (level_id,))
    return cursor.fetchone() is not None

def validate_programme_exists(cursor, programme_id: int) -> bool:
    """Validate that the programme exists"""
    if not programme_id:
        return True
    cursor.execute("SELECT id FROM programmes WHERE id = ?", (programme_id,))
    return cursor.fetchone() is not None

def validate_academic_year_exists(cursor, academic_year_id: int) -> bool:
    """Validate that the academic year exists"""
    cursor.execute("SELECT id FROM academic_years WHERE id = ?", (academic_year_id,))
    return cursor.fetchone() is not None

def validate_form_master_exists(cursor, staff_id: int) -> bool:
    """Validate that the form master (staff) exists"""
    if not staff_id:
        return True
    cursor.execute("SELECT id FROM staff WHERE id = ?", (staff_id,))
    return cursor.fetchone() is not None

def ensure_unique_class_code(cursor, class_code: str, exclude_id: Optional[int] = None):
    """Ensure class code is unique"""
    if not class_code:
        return
    
    query = "SELECT id FROM classes WHERE class_code = ?"
    params = [class_code]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400,
            detail=f"Class code '{class_code}' already exists. Please use a unique code."
        )

def ensure_unique_class_name_in_year(cursor, class_name: str, academic_year_id: int, level_id: int, exclude_id: Optional[int] = None):
    """Ensure class name is unique within the same academic year and level"""
    query = """
        SELECT id FROM classes 
        WHERE class_name = ? AND academic_year_id = ? AND level_id = ?
    """
    params = [class_name, academic_year_id, level_id]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400,
            detail=f"Class '{class_name}' already exists for this academic year and level."
        )

# ==================== Database Setup ====================

def create_classes_table():
    """Create classes table if it doesn't exist"""
    try:
        logger.info("Creating/checking classes table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='classes'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE classes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    class_name TEXT NOT NULL,
                    class_code TEXT UNIQUE,
                    level_id INTEGER NOT NULL,
                    programme_id INTEGER,
                    academic_year_id INTEGER NOT NULL,
                    form_master_id INTEGER,
                    description TEXT,
                    capacity INTEGER DEFAULT 40,
                    is_active BOOLEAN DEFAULT 1,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync BOOLEAN DEFAULT 0,
                    sync_error TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE RESTRICT,
                    FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE SET NULL,
                    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                    FOREIGN KEY (form_master_id) REFERENCES staff(id) ON DELETE SET NULL,
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (updated_by) REFERENCES users(id)
                )
            """)
            logger.info("New classes table created")
            
            # Insert default classes if table is empty
            cursor.execute("SELECT COUNT(*) as count FROM classes")
            result = cursor.fetchone()
            
            if result['count'] == 0:
                logger.info("Inserting default classes")
                default_classes = [
                    ("JHS 1 Science A", "JHS1-SCI-A", 1, None, 3, 1, "JHS 1 Science Class A", 40, 1),
                    ("JHS 1 Science B", "JHS1-SCI-B", 1, None, 3, 2, "JHS 1 Science Class B", 40, 1),
                    ("SHS 1 Science A", "SHS1-SCI-A", 4, 1, 3, 3, "SHS 1 Science Class A", 45, 1),
                    ("SHS 1 Arts A", "SHS1-ART-A", 4, 2, 3, 4, "SHS 1 Arts Class A", 45, 1),
                    ("JHS 2 Science A", "JHS2-SCI-A", 2, None, 3, 5, "JHS 2 Science Class A", 40, 0),
                ]
                
                for cls in default_classes:
                    cursor.execute("""
                        INSERT INTO classes (
                            class_name, class_code, level_id, programme_id, academic_year_id,
                            form_master_id, description, capacity, is_active, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (*cls, datetime.now().isoformat(), datetime.now().isoformat()))
                
                conn.commit()
                logger.info("Default classes inserted successfully")
        else:
            logger.info("Table 'classes' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(classes)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE classes ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE classes ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0")
            
            if 'sync_error' not in column_names:
                logger.info("Adding sync_error column")
                cursor.execute("ALTER TABLE classes ADD COLUMN sync_error TEXT")
            
            if 'created_by' not in column_names:
                logger.info("Adding created_by column")
                cursor.execute("ALTER TABLE classes ADD COLUMN created_by INTEGER")
            
            if 'updated_by' not in column_names:
                logger.info("Adding updated_by column")
                cursor.execute("ALTER TABLE classes ADD COLUMN updated_by INTEGER")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating classes table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_classes_table()
except Exception as e:
    logger.error(f"Failed to initialize classes table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_classes(
    academic_year_id: Optional[int] = None,
    level_id: Optional[int] = None,
    is_active: Optional[bool] = None
):
    """Get all classes with optional filters"""
    logger.info(f"GET /api/classes/ - Fetching classes (academic_year_id={academic_year_id}, level_id={level_id})")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM classes WHERE 1=1"
        params = []
        
        if academic_year_id:
            query += " AND academic_year_id = ?"
            params.append(academic_year_id)
        
        if level_id:
            query += " AND level_id = ?"
            params.append(level_id)
        
        if is_active is not None:
            query += " AND is_active = ?"
            params.append(1 if is_active else 0)
        
        query += " ORDER BY level_id ASC, class_name ASC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        classes = []
        
        for row in results:
            current_enrollment = get_current_enrollment(cursor, row['id'])
            
            classes.append({
                "id": row['id'],
                "class_name": row['class_name'],
                "class_code": row['class_code'],
                "level_id": row['level_id'],
                "programme_id": row['programme_id'],
                "academic_year_id": row['academic_year_id'],
                "form_master_id": row['form_master_id'],
                "description": row['description'],
                "capacity": row['capacity'],
                "is_active": bool(row['is_active']),
                "current_enrollment": current_enrollment,
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(classes)} classes")
        
        return {
            "success": True,
            "data": classes,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_classes: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

@router.get("/{class_id}")
async def get_class(class_id: int):
    """Get a specific class by ID"""
    logger.info(f"GET /api/classes/{class_id} - Fetching class")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM classes WHERE id = ?", (class_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Class not found")
        
        current_enrollment = get_current_enrollment(cursor, class_id)
        
        class_data = {
            "id": result['id'],
            "class_name": result['class_name'],
            "class_code": result['class_code'],
            "level_id": result['level_id'],
            "programme_id": result['programme_id'],
            "academic_year_id": result['academic_year_id'],
            "form_master_id": result['form_master_id'],
            "description": result['description'],
            "capacity": result['capacity'],
            "is_active": bool(result['is_active']),
            "current_enrollment": current_enrollment,
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": class_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_class: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/code/generate")
async def generate_class_code(class_name: str, level_id: int):
    """Generate a class code based on class name and level"""
    logger.info(f"GET /api/classes/code/generate - Generating code for {class_name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get level name
        cursor.execute("SELECT name FROM levels WHERE id = ?", (level_id,))
        level = cursor.fetchone()
        
        if not level:
            raise HTTPException(status_code=404, detail="Level not found")
        
        level_abbr = level['name'].replace(' ', '').upper()
        
        # Generate class abbreviation from name
        words = class_name.split(' ')
        if len(words) >= 3:
            class_abbr = f"{words[0][:2]}{words[2][:1]}".upper()
        else:
            class_abbr = ''.join(w[0] for w in words).upper()
        
        class_code = f"{level_abbr}-{class_abbr}"
        
        return {
            "success": True,
            "data": {
                "class_code": class_code,
                "level_abbr": level_abbr,
                "class_abbr": class_abbr
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_class_code: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_class(class_data: ClassCreate):
    """Create a new class"""
    logger.info(f"POST /api/classes/ - Creating new class: {class_data.class_name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Validate foreign keys
        if not validate_level_exists(cursor, class_data.level_id):
            raise HTTPException(status_code=400, detail="Level not found")
        
        if not validate_programme_exists(cursor, class_data.programme_id):
            raise HTTPException(status_code=400, detail="Programme not found")
        
        if not validate_academic_year_exists(cursor, class_data.academic_year_id):
            raise HTTPException(status_code=400, detail="Academic year not found")
        
        if not validate_form_master_exists(cursor, class_data.form_master_id):
            raise HTTPException(status_code=400, detail="Form master not found")
        
        # Ensure unique class code
        if class_data.class_code:
            ensure_unique_class_code(cursor, class_data.class_code)
        
        # Ensure unique class name within academic year and level
        ensure_unique_class_name_in_year(
            cursor, class_data.class_name, 
            class_data.academic_year_id, class_data.level_id
        )
        
        # Insert new class
        cursor.execute("""
            INSERT INTO classes (
                class_name, class_code, level_id, programme_id, academic_year_id,
                form_master_id, description, capacity, is_active, created_by,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            class_data.class_name, class_data.class_code, class_data.level_id,
            class_data.programme_id, class_data.academic_year_id, class_data.form_master_id,
            class_data.description, class_data.capacity, class_data.is_active,
            class_data.created_by, datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Class created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Class created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_class: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{class_id}")
async def update_class(class_id: int, class_data: ClassUpdate):
    """Update a class"""
    logger.info(f"PUT /api/classes/{class_id} - Updating class")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if class exists
        cursor.execute("SELECT * FROM classes WHERE id = ?", (class_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Prepare data for validation
        new_class_name = class_data.class_name if class_data.class_name is not None else existing['class_name']
        new_academic_year_id = class_data.academic_year_id if class_data.academic_year_id is not None else existing['academic_year_id']
        new_level_id = class_data.level_id if class_data.level_id is not None else existing['level_id']
        new_class_code = class_data.class_code if class_data.class_code is not None else existing['class_code']
        new_programme_id = class_data.programme_id if class_data.programme_id is not None else existing['programme_id']
        new_form_master_id = class_data.form_master_id if class_data.form_master_id is not None else existing['form_master_id']
        new_capacity = class_data.capacity if class_data.capacity is not None else existing['capacity']
        
        # Validate foreign keys if being updated
        if class_data.level_id is not None and not validate_level_exists(cursor, class_data.level_id):
            raise HTTPException(status_code=400, detail="Level not found")
        
        if class_data.programme_id is not None and not validate_programme_exists(cursor, class_data.programme_id):
            raise HTTPException(status_code=400, detail="Programme not found")
        
        if class_data.academic_year_id is not None and not validate_academic_year_exists(cursor, class_data.academic_year_id):
            raise HTTPException(status_code=400, detail="Academic year not found")
        
        if class_data.form_master_id is not None and not validate_form_master_exists(cursor, class_data.form_master_id):
            raise HTTPException(status_code=400, detail="Form master not found")
        
        # Check unique class code
        if class_data.class_code is not None:
            ensure_unique_class_code(cursor, class_data.class_code, class_id)
            updates.append("class_code = ?")
            params.append(class_data.class_code)
        
        # Check unique class name within academic year and level
        if class_data.class_name is not None or class_data.academic_year_id is not None or class_data.level_id is not None:
            ensure_unique_class_name_in_year(
                cursor, new_class_name, new_academic_year_id, new_level_id, class_id
            )
        
        # Check capacity against current enrollment
        if class_data.capacity is not None:
            current_enrollment = get_current_enrollment(cursor, class_id)
            if class_data.capacity < current_enrollment:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot reduce capacity to {class_data.capacity} because there are {current_enrollment} students currently enrolled."
                )
        
        # Apply updates
        if class_data.class_name is not None:
            updates.append("class_name = ?")
            params.append(class_data.class_name)
        
        if class_data.level_id is not None:
            updates.append("level_id = ?")
            params.append(class_data.level_id)
        
        if class_data.programme_id is not None:
            updates.append("programme_id = ?")
            params.append(class_data.programme_id if class_data.programme_id > 0 else None)
        
        if class_data.academic_year_id is not None:
            updates.append("academic_year_id = ?")
            params.append(class_data.academic_year_id)
        
        if class_data.form_master_id is not None:
            updates.append("form_master_id = ?")
            params.append(class_data.form_master_id if class_data.form_master_id > 0 else None)
        
        if class_data.description is not None:
            updates.append("description = ?")
            params.append(class_data.description)
        
        if class_data.capacity is not None:
            updates.append("capacity = ?")
            params.append(class_data.capacity)
        
        if class_data.is_active is not None:
            updates.append("is_active = ?")
            params.append(1 if class_data.is_active else 0)
        
        if class_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(class_data.updated_by)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(class_id)
            query = f"UPDATE classes SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Class {class_id} updated successfully")
        
        return {
            "success": True,
            "message": "Class updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_class: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{class_id}")
async def delete_class(class_id: int):
    """Delete a class"""
    logger.info(f"DELETE /api/classes/{class_id} - Deleting class")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if class exists and get details
        cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
        class_item = cursor.fetchone()
        
        if not class_item:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Check if class has enrolled students
        current_enrollment = get_current_enrollment(cursor, class_id)
        
        if current_enrollment > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete class because it has {current_enrollment} enrolled students. Reassign or unenroll students first."
            )
        
        # Delete the class
        cursor.execute("DELETE FROM classes WHERE id = ?", (class_id,))
        conn.commit()
        
        logger.info(f"Class {class_id} ({class_item['class_name']}) deleted successfully")
        
        return {
            "success": True,
            "message": f"Class '{class_item['class_name']}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_class: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{class_id}/students")
async def get_class_students(class_id: int):
    """Get all students enrolled in a class"""
    logger.info(f"GET /api/classes/{class_id}/students - Fetching class students")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if class exists
        cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Class not found")
        
        cursor.execute("""
            SELECT s.* FROM students s
            JOIN student_enrollments e ON s.id = e.student_id
            WHERE e.class_id = ? AND e.status = 'active'
            ORDER BY s.surname, s.first_name
        """, (class_id,))
        
        results = cursor.fetchall()
        students = []
        
        for row in results:
            students.append({
                "id": row['id'],
                "first_name": row['first_name'],
                "surname": row['surname'],
                "admission_number": row.get('admission_number'),
                "gender": row.get('gender'),
                "date_of_birth": row.get('date_of_birth')
            })
        
        return {
            "success": True,
            "data": students,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_class_students: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()









# # Add these endpoints to app/school/classes.py

# # ==================== Form Master Management Endpoints ====================

# @router.get("/form-masters/assignments")
# async def get_form_master_assignments(academic_year_id: Optional[int] = None):
#     """Get all form master assignments for classes"""
#     logger.info(f"GET /api/classes/form-masters/assignments - Fetching form master assignments")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         query = """
#             SELECT 
#                 c.id as class_id,
#                 c.class_name,
#                 c.form_master_id,
#                 c.academic_year_id,
#                 ay.year_label as academic_year_label,
#                 s.id as staff_id,
#                 s.staff_number,
#                 p.first_name,
#                 p.last_name,
#                 p.title
#             FROM classes c
#             JOIN academic_years ay ON c.academic_year_id = ay.id
#             LEFT JOIN staff s ON c.form_master_id = s.id
#             LEFT JOIN person_details p ON s.person_id = p.id
#             WHERE 1=1
#         """
#         params = []
        
#         if academic_year_id:
#             query += " AND c.academic_year_id = ?"
#             params.append(academic_year_id)
        
#         query += " ORDER BY ay.year_label DESC, c.class_name ASC"
        
#         cursor.execute(query, params)
#         results = cursor.fetchall()
        
#         assignments = []
#         for row in results:
#             form_master_name = None
#             if row['form_master_id']:
#                 title = f"{row['title']} " if row['title'] else ""
#                 form_master_name = f"{title}{row['first_name']} {row['last_name']}"
            
#             assignments.append({
#                 "id": row['class_id'],
#                 "academic_year_id": row['academic_year_id'],
#                 "academic_year_label": row['academic_year_label'],
#                 "class_id": row['class_id'],
#                 "class_name": row['class_name'],
#                 "form_master_id": row['form_master_id'],
#                 "form_master_name": form_master_name,
#                 "staff_number": row['staff_number']
#             })
        
#         return {
#             "success": True,
#             "data": assignments,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_form_master_assignments: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/form-masters/available")
# async def get_available_form_masters():
#     """Get all staff members who can be form masters"""
#     logger.info("GET /api/classes/form-masters/available - Fetching available staff")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT 
#                 s.id,
#                 s.staff_number,
#                 p.first_name,
#                 p.last_name,
#                 p.title,
#                 p.email,
#                 p.phone
#             FROM staff s
#             JOIN person_details p ON s.person_id = p.id
#             WHERE s.status = 'active' AND s.role IN ('Teacher', 'Admin')
#             ORDER BY p.last_name, p.first_name
#         """)
        
#         results = cursor.fetchall()
#         staff_list = []
        
#         for row in results:
#             title = f"{row['title']} " if row['title'] else ""
#             staff_list.append({
#                 "id": row['id'],
#                 "staff_number": row['staff_number'],
#                 "name": f"{title}{row['first_name']} {row['last_name']}",
#                 "first_name": row['first_name'],
#                 "last_name": row['last_name'],
#                 "email": row['email'],
#                 "phone": row['phone']
#             })
        
#         return {
#             "success": True,
#             "data": staff_list,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_available_form_masters: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/{class_id}/form-master")
# async def get_class_form_master(class_id: int):
#     """Get form master for a specific class"""
#     logger.info(f"GET /api/classes/{class_id}/form-master - Fetching form master")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT 
#                 c.form_master_id,
#                 s.staff_number,
#                 p.first_name,
#                 p.last_name,
#                 p.title,
#                 p.email,
#                 p.phone
#             FROM classes c
#             LEFT JOIN staff s ON c.form_master_id = s.id
#             LEFT JOIN person_details p ON s.person_id = p.id
#             WHERE c.id = ?
#         """, (class_id,))
        
#         result = cursor.fetchone()
        
#         if not result:
#             raise HTTPException(status_code=404, detail="Class not found")
        
#         form_master = None
#         if result['form_master_id']:
#             title = f"{result['title']} " if result['title'] else ""
#             form_master = {
#                 "id": result['form_master_id'],
#                 "staff_number": result['staff_number'],
#                 "name": f"{title}{result['first_name']} {result['last_name']}",
#                 "first_name": result['first_name'],
#                 "last_name": result['last_name'],
#                 "email": result['email'],
#                 "phone": result['phone']
#             }
        
#         return {
#             "success": True,
#             "data": {
#                 "class_id": class_id,
#                 "form_master": form_master
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_class_form_master: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.put("/{class_id}/form-master")
# async def assign_form_master(class_id: int, form_master_data: Dict[str, Any]):
#     """Assign a form master to a class"""
#     logger.info(f"PUT /api/classes/{class_id}/form-master - Assigning form master")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if class exists
#         cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
#         class_item = cursor.fetchone()
        
#         if not class_item:
#             raise HTTPException(status_code=404, detail="Class not found")
        
#         form_master_id = form_master_data.get('form_master_id')
        
#         # Validate staff exists if provided
#         if form_master_id:
#             cursor.execute("SELECT id FROM staff WHERE id = ? AND status = 'active'", (form_master_id,))
#             if not cursor.fetchone():
#                 raise HTTPException(status_code=400, detail="Staff member not found or not active")
        
#         # Update class with new form master
#         cursor.execute("""
#             UPDATE classes 
#             SET form_master_id = ?, updated_at = ?, version = version + 1
#             WHERE id = ?
#         """, (form_master_id if form_master_id else None, datetime.now().isoformat(), class_id))
        
#         conn.commit()
        
#         logger.info(f"Form master assigned to class {class_id}")
        
#         return {
#             "success": True,
#             "message": "Form master assigned successfully",
#             "data": {
#                 "class_id": class_id,
#                 "class_name": class_item['class_name'],
#                 "form_master_id": form_master_id
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in assign_form_master: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.delete("/{class_id}/form-master")
# async def remove_form_master(class_id: int):
#     """Remove form master assignment from a class"""
#     logger.info(f"DELETE /api/classes/{class_id}/form-master - Removing form master")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check if class exists
#         cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
#         class_item = cursor.fetchone()
        
#         if not class_item:
#             raise HTTPException(status_code=404, detail="Class not found")
        
#         # Remove form master
#         cursor.execute("""
#             UPDATE classes 
#             SET form_master_id = NULL, updated_at = ?, version = version + 1
#             WHERE id = ?
#         """, (datetime.now().isoformat(), class_id))
        
#         conn.commit()
        
#         logger.info(f"Form master removed from class {class_id}")
        
#         return {
#             "success": True,
#             "message": "Form master removed successfully",
#             "data": {
#                 "class_id": class_id,
#                 "class_name": class_item['class_name']
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in remove_form_master: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/form-masters/bulk-assign")
# async def bulk_assign_form_masters(assignments_data: Dict[str, Any]):
#     """Bulk assign form masters to multiple classes"""
#     logger.info("POST /api/classes/form-masters/bulk-assign - Bulk assigning form masters")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         assignments = assignments_data.get('assignments', [])
#         updated_count = 0
#         errors = []
        
#         for assignment in assignments:
#             class_id = assignment.get('class_id')
#             form_master_id = assignment.get('form_master_id')
            
#             if not class_id:
#                 errors.append("Class ID missing")
#                 continue
            
#             # Validate class exists
#             cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
#             if not cursor.fetchone():
#                 errors.append(f"Class ID {class_id} not found")
#                 continue
            
#             # Validate staff exists if provided
#             if form_master_id:
#                 cursor.execute("SELECT id FROM staff WHERE id = ?", (form_master_id,))
#                 if not cursor.fetchone():
#                     errors.append(f"Staff ID {form_master_id} not found for class {class_id}")
#                     continue
            
#             cursor.execute("""
#                 UPDATE classes 
#                 SET form_master_id = ?, updated_at = ?, version = version + 1
#                 WHERE id = ?
#             """, (form_master_id if form_master_id else None, datetime.now().isoformat(), class_id))
#             updated_count += 1
        
#         conn.commit()
        
#         return {
#             "success": True,
#             "message": f"Updated {updated_count} classes",
#             "data": {
#                 "updated_count": updated_count,
#                 "errors": errors
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in bulk_assign_form_masters: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()



# Add these endpoints to app/school/classes.py

# ==================== Form Master Management Endpoints ====================

# Add these endpoints to app/school/classes.py

# ==================== Form Master Management Endpoints ====================

@router.get("/form-masters/assignments")
async def get_form_master_assignments(academic_year_id: Optional[int] = None):
    """Get all form master assignments for classes"""
    logger.info(f"GET /api/classes/form-masters/assignments - Fetching form master assignments")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                c.id as class_id,
                c.class_name,
                c.form_master_id,
                c.academic_year_id,
                ay.year_label as academic_year_label,
                s.id as staff_id,
                s.staff_number,
                s.role,
                p.first_name,
                p.last_name,
                p.phone,
                p.email
            FROM classes c
            JOIN academic_years ay ON c.academic_year_id = ay.id
            LEFT JOIN staff s ON c.form_master_id = s.id
            LEFT JOIN person_details p ON s.person_id = p.id
            WHERE 1=1
        """
        params = []
        
        if academic_year_id:
            query += " AND c.academic_year_id = ?"
            params.append(academic_year_id)
        
        query += " ORDER BY ay.year_label DESC, c.class_name ASC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        assignments = []
        for row in results:
            form_master_name = None
            if row['form_master_id']:
                form_master_name = f"{row['first_name']} {row['last_name']}"
            
            assignments.append({
                "id": row['class_id'],
                "academic_year_id": row['academic_year_id'],
                "academic_year_label": row['academic_year_label'],
                "class_id": row['class_id'],
                "class_name": row['class_name'],
                "form_master_id": row['form_master_id'],
                "form_master_name": form_master_name,
                "staff_number": row['staff_number'],
                "role": row['role'],
                "phone": row['phone'],
                "email": row['email']
            })
        
        return {
            "success": True,
            "data": assignments,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_form_master_assignments: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/form-masters/available")
async def get_available_form_masters():
    """Get all staff members who can be form masters"""
    logger.info("GET /api/classes/form-masters/available - Fetching available staff")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                s.id,
                s.staff_number,
                s.role,
                p.first_name,
                p.last_name,
                p.email,
                p.phone
            FROM staff s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.status = 'active' AND s.role IN ('admin', 'teacher')
            ORDER BY p.last_name, p.first_name
        """)
        
        results = cursor.fetchall()
        staff_list = []
        
        for row in results:
            staff_list.append({
                "id": row['id'],
                "staff_number": row['staff_number'],
                "name": f"{row['first_name']} {row['last_name']}",
                "first_name": row['first_name'],
                "last_name": row['last_name'],
                "role": row['role'],
                "email": row['email'],
                "phone": row['phone']
            })
        
        return {
            "success": True,
            "data": staff_list,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_available_form_masters: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{class_id}/form-master")
async def get_class_form_master(class_id: int):
    """Get form master for a specific class"""
    logger.info(f"GET /api/classes/{class_id}/form-master - Fetching form master")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First get class details
        cursor.execute("""
            SELECT c.id, c.class_name, c.form_master_id, c.academic_year_id, ay.year_label
            FROM classes c
            JOIN academic_years ay ON c.academic_year_id = ay.id
            WHERE c.id = ?
        """, (class_id,))
        class_item = cursor.fetchone()
        
        if not class_item:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Get form master details if assigned
        form_master = None
        if class_item['form_master_id']:
            cursor.execute("""
                SELECT 
                    s.id,
                    s.staff_number,
                    s.role,
                    p.first_name,
                    p.last_name,
                    p.email,
                    p.phone
                FROM staff s
                JOIN person_details p ON s.person_id = p.id
                WHERE s.id = ?
            """, (class_item['form_master_id'],))
            
            result = cursor.fetchone()
            if result:
                form_master = {
                    "id": result['id'],
                    "staff_number": result['staff_number'],
                    "name": f"{result['first_name']} {result['last_name']}",
                    "first_name": result['first_name'],
                    "last_name": result['last_name'],
                    "role": result['role'],
                    "email": result['email'],
                    "phone": result['phone']
                }
        
        return {
            "success": True,
            "data": {
                "class_id": class_item['id'],
                "class_name": class_item['class_name'],
                "academic_year_id": class_item['academic_year_id'],
                "academic_year_label": class_item['year_label'],
                "form_master": form_master
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_class_form_master: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{class_id}/form-master")
async def assign_form_master(class_id: int, form_master_data: Dict[str, Any]):
    """Assign a form master to a class"""
    logger.info(f"PUT /api/classes/{class_id}/form-master - Assigning form master")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if class exists
        cursor.execute("SELECT id, class_name FROM classes WHERE id = ?", (class_id,))
        class_item = cursor.fetchone()
        
        if not class_item:
            raise HTTPException(status_code=404, detail="Class not found")
        
        form_master_id = form_master_data.get('form_master_id')
        
        # Validate staff exists if provided
        if form_master_id:
            cursor.execute("""
                SELECT s.id FROM staff s
                WHERE s.id = ? AND s.status = 'active' AND s.role IN ('admin', 'teacher')
            """, (form_master_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail="Staff member not found, not active, or not eligible to be form master")
        
        # Update class with new form master
        cursor.execute("""
            UPDATE classes 
            SET form_master_id = ?, updated_at = ?, version = version + 1
            WHERE id = ?
        """, (form_master_id if form_master_id else None, datetime.now().isoformat(), class_id))
        
        conn.commit()
        
        logger.info(f"Form master assigned to class {class_id}")
        
        return {
            "success": True,
            "message": "Form master assigned successfully",
            "data": {
                "class_id": class_id,
                "class_name": class_item['class_name'],
                "form_master_id": form_master_id
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in assign_form_master: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{class_id}/form-master")
async def remove_form_master(class_id: int):
    """Remove form master assignment from a class"""
    logger.info(f"DELETE /api/classes/{class_id}/form-master - Removing form master")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if class exists
        cursor.execute("SELECT id, class_name FROM classes WHERE id = ?", (class_id,))
        class_item = cursor.fetchone()
        
        if not class_item:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Remove form master
        cursor.execute("""
            UPDATE classes 
            SET form_master_id = NULL, updated_at = ?, version = version + 1
            WHERE id = ?
        """, (datetime.now().isoformat(), class_id))
        
        conn.commit()
        
        logger.info(f"Form master removed from class {class_id}")
        
        return {
            "success": True,
            "message": "Form master removed successfully",
            "data": {
                "class_id": class_id,
                "class_name": class_item['class_name']
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in remove_form_master: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/form-masters/bulk-assign")
async def bulk_assign_form_masters(assignments_data: Dict[str, Any]):
    """Bulk assign form masters to multiple classes"""
    logger.info("POST /api/classes/form-masters/bulk-assign - Bulk assigning form masters")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        assignments = assignments_data.get('assignments', [])
        updated_count = 0
        errors = []
        
        for assignment in assignments:
            class_id = assignment.get('class_id')
            form_master_id = assignment.get('form_master_id')
            
            if not class_id:
                errors.append("Class ID missing")
                continue
            
            # Validate class exists
            cursor.execute("SELECT class_name FROM classes WHERE id = ?", (class_id,))
            class_item = cursor.fetchone()
            if not class_item:
                errors.append(f"Class ID {class_id} not found")
                continue
            
            # Validate staff exists if provided
            if form_master_id:
                cursor.execute("""
                    SELECT s.id FROM staff s
                    WHERE s.id = ? AND s.status = 'active' AND s.role IN ('admin', 'teacher')
                """, (form_master_id,))
                if not cursor.fetchone():
                    errors.append(f"Staff ID {form_master_id} not found, not active, or not eligible for class {class_id}")
                    continue
            
            cursor.execute("""
                UPDATE classes 
                SET form_master_id = ?, updated_at = ?, version = version + 1
                WHERE id = ?
            """, (form_master_id if form_master_id else None, datetime.now().isoformat(), class_id))
            updated_count += 1
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Updated {updated_count} classes",
            "data": {
                "updated_count": updated_count,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in bulk_assign_form_masters: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
@router.get("/form-masters/available")
async def get_available_form_masters():
    """Get all staff members who can be form masters"""
    logger.info("GET /api/classes/form-masters/available - Fetching available staff")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                s.id,
                s.staff_number,
                s.role,
                p.first_name,
                p.last_name,
                p.email,
                p.phone
            FROM staff s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.status = 'active' AND s.role IN ('admin', 'teacher')
            ORDER BY p.last_name, p.first_name
        """)
        
        results = cursor.fetchall()
        staff_list = []
        
        for row in results:
            staff_list.append({
                "id": row['id'],
                "staff_number": row['staff_number'],
                "name": f"{row['first_name']} {row['last_name']}",
                "first_name": row['first_name'],
                "last_name": row['last_name'],
                "role": row['role'],
                "email": row['email'],
                "phone": row['phone']
            })
        
        return {
            "success": True,
            "data": staff_list,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_available_form_masters: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{class_id}/form-master")
async def get_class_form_master(class_id: int):
    """Get form master for a specific class"""
    logger.info(f"GET /api/classes/{class_id}/form-master - Fetching form master")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First get class details
        cursor.execute("SELECT id, name, form_master_id, academic_year_id FROM classes WHERE id = ?", (class_id,))
        class_item = cursor.fetchone()
        
        if not class_item:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Get form master details if assigned
        form_master = None
        if class_item['form_master_id']:
            cursor.execute("""
                SELECT 
                    s.id,
                    s.staff_number,
                    s.role,
                    p.first_name,
                    p.last_name,
                    p.email,
                    p.phone
                FROM staff s
                JOIN person_details p ON s.person_id = p.id
                WHERE s.id = ?
            """, (class_item['form_master_id'],))
            
            result = cursor.fetchone()
            if result:
                form_master = {
                    "id": result['id'],
                    "staff_number": result['staff_number'],
                    "name": f"{result['first_name']} {result['last_name']}",
                    "first_name": result['first_name'],
                    "last_name": result['last_name'],
                    "role": result['role'],
                    "email": result['email'],
                    "phone": result['phone']
                }
        
        return {
            "success": True,
            "data": {
                "class_id": class_item['id'],
                "class_name": class_item['name'],
                "academic_year_id": class_item['academic_year_id'],
                "form_master": form_master
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_class_form_master: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{class_id}/form-master")
async def assign_form_master(class_id: int, form_master_data: Dict[str, Any]):
    """Assign a form master to a class"""
    logger.info(f"PUT /api/classes/{class_id}/form-master - Assigning form master")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if class exists
        cursor.execute("SELECT id, name FROM classes WHERE id = ?", (class_id,))
        class_item = cursor.fetchone()
        
        if not class_item:
            raise HTTPException(status_code=404, detail="Class not found")
        
        form_master_id = form_master_data.get('form_master_id')
        
        # Validate staff exists if provided
        if form_master_id:
            cursor.execute("""
                SELECT s.id FROM staff s
                WHERE s.id = ? AND s.status = 'active' AND s.role IN ('admin', 'teacher')
            """, (form_master_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail="Staff member not found, not active, or not eligible to be form master")
        
        # Update class with new form master
        cursor.execute("""
            UPDATE classes 
            SET form_master_id = ?, updated_at = ?, version = version + 1
            WHERE id = ?
        """, (form_master_id if form_master_id else None, datetime.now().isoformat(), class_id))
        
        conn.commit()
        
        logger.info(f"Form master assigned to class {class_id}")
        
        return {
            "success": True,
            "message": "Form master assigned successfully",
            "data": {
                "class_id": class_id,
                "class_name": class_item['name'],
                "form_master_id": form_master_id
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in assign_form_master: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{class_id}/form-master")
async def remove_form_master(class_id: int):
    """Remove form master assignment from a class"""
    logger.info(f"DELETE /api/classes/{class_id}/form-master - Removing form master")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if class exists
        cursor.execute("SELECT id, name FROM classes WHERE id = ?", (class_id,))
        class_item = cursor.fetchone()
        
        if not class_item:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Remove form master
        cursor.execute("""
            UPDATE classes 
            SET form_master_id = NULL, updated_at = ?, version = version + 1
            WHERE id = ?
        """, (datetime.now().isoformat(), class_id))
        
        conn.commit()
        
        logger.info(f"Form master removed from class {class_id}")
        
        return {
            "success": True,
            "message": "Form master removed successfully",
            "data": {
                "class_id": class_id,
                "class_name": class_item['name']
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in remove_form_master: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/form-masters/bulk-assign")
async def bulk_assign_form_masters(assignments_data: Dict[str, Any]):
    """Bulk assign form masters to multiple classes"""
    logger.info("POST /api/classes/form-masters/bulk-assign - Bulk assigning form masters")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        assignments = assignments_data.get('assignments', [])
        updated_count = 0
        errors = []
        
        for assignment in assignments:
            class_id = assignment.get('class_id')
            form_master_id = assignment.get('form_master_id')
            
            if not class_id:
                errors.append("Class ID missing")
                continue
            
            # Validate class exists
            cursor.execute("SELECT name FROM classes WHERE id = ?", (class_id,))
            class_item = cursor.fetchone()
            if not class_item:
                errors.append(f"Class ID {class_id} not found")
                continue
            
            # Validate staff exists if provided
            if form_master_id:
                cursor.execute("""
                    SELECT s.id FROM staff s
                    WHERE s.id = ? AND s.status = 'active' AND s.role IN ('admin', 'teacher')
                """, (form_master_id,))
                if not cursor.fetchone():
                    errors.append(f"Staff ID {form_master_id} not found, not active, or not eligible for class {class_id}")
                    continue
            
            cursor.execute("""
                UPDATE classes 
                SET form_master_id = ?, updated_at = ?, version = version + 1
                WHERE id = ?
            """, (form_master_id if form_master_id else None, datetime.now().isoformat(), class_id))
            updated_count += 1
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"Updated {updated_count} classes",
            "data": {
                "updated_count": updated_count,
                "errors": errors
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in bulk_assign_form_masters: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()



# ==================== Sync Integration Functions ====================

def sync_class_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync class from external database"""
    try:
        logger.info("Syncing class from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO classes (
                id, class_name, class_code, level_id, programme_id, academic_year_id,
                form_master_id, description, capacity, is_active, version,
                synced_at, updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('class_name'),
            source_data.get('class_code'),
            source_data.get('level_id'),
            source_data.get('programme_id'),
            source_data.get('academic_year_id'),
            source_data.get('form_master_id'),
            source_data.get('description'),
            source_data.get('capacity', 40),
            source_data.get('is_active', 1),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Class synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing class: {str(e)}")
        logger.error(traceback.format_exc())
        return False