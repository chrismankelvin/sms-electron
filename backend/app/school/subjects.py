# app/school/subjects.py

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

router = APIRouter(prefix="/api/subjects", tags=["subjects"])

# ==================== Pydantic Models ====================

class SubjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=20)
    type: str = Field(..., pattern="^(core|elective)$")
    category: str = Field(default="BOTH", pattern="^(JHS|SHS|BOTH)$")
    description: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Subject name cannot be empty')
        return v.strip()
    
    @validator('code')
    def validate_code(cls, v):
        if not v.strip():
            raise ValueError('Subject code cannot be empty')
        return v.upper().strip()

class SubjectCreate(SubjectBase):
    created_by: Optional[int] = None

class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    type: Optional[str] = Field(None, pattern="^(core|elective)$")
    category: Optional[str] = Field(None, pattern="^(JHS|SHS|BOTH)$")
    description: Optional[str] = None
    updated_by: Optional[int] = None

class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str
    type: str
    category: str
    description: Optional[str]
    version: int
    created_at: datetime
    updated_at: datetime

# ==================== Helper Functions ====================

def ensure_unique_subject_code(cursor, code: str, exclude_id: Optional[int] = None):
    """Ensure subject code is unique"""
    query = "SELECT id FROM subjects WHERE code = ?"
    params = [code]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400,
            detail=f"Subject code '{code}' already exists. Please use a unique code."
        )

def ensure_unique_subject_name(cursor, name: str, exclude_id: Optional[int] = None):
    """Ensure subject name is unique"""
    query = "SELECT id FROM subjects WHERE name = ?"
    params = [name]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400,
            detail=f"Subject name '{name}' already exists. Please use a unique name."
        )

def generate_subject_code(name: str) -> str:
    """Generate a subject code from the name"""
    if not name:
        return ""
    words = name.split(' ')
    if len(words) == 1:
        code = name[:6].upper()
    else:
        code = ''.join(word[0] for word in words).upper()
    return code

# ==================== Database Setup ====================

def create_subjects_table():
    """Create subjects table if it doesn't exist"""
    try:
        logger.info("Creating/checking subjects table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='subjects'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            cursor.execute("""
                CREATE TABLE subjects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    code TEXT UNIQUE,
                    type TEXT NOT NULL CHECK (type IN ('core','elective')),
                    category TEXT CHECK (category IN ('JHS','SHS','BOTH')) DEFAULT 'BOTH',
                    description TEXT,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync BOOLEAN DEFAULT 0,
                    sync_error TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (updated_by) REFERENCES users(id)
                )
            """)
            logger.info("New subjects table created")
            
            # Insert default subjects
            logger.info("Inserting default subjects")
            default_subjects = [
                ("Mathematics", "MATH101", "core", "BOTH", "Fundamental mathematics including algebra, geometry, and calculus"),
                ("English Language", "ENG101", "core", "BOTH", "English language, literature, and composition"),
                ("Biology", "BIO201", "elective", "SHS", "Study of living organisms"),
                ("Chemistry", "CHEM201", "elective", "SHS", "Study of matter and its properties"),
                ("Physics", "PHY201", "elective", "SHS", "Study of matter, energy, and their interactions"),
                ("Social Studies", "SST101", "core", "JHS", "History, geography, and civic education")
            ]
            
            for subject in default_subjects:
                cursor.execute("""
                    INSERT INTO subjects (name, code, type, category, description, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (*subject, datetime.now().isoformat(), datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default subjects inserted successfully")
        else:
            logger.info("Table 'subjects' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(subjects)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE subjects ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE subjects ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0")
            
            if 'sync_error' not in column_names:
                logger.info("Adding sync_error column")
                cursor.execute("ALTER TABLE subjects ADD COLUMN sync_error TEXT")
            
            if 'created_by' not in column_names:
                logger.info("Adding created_by column")
                cursor.execute("ALTER TABLE subjects ADD COLUMN created_by INTEGER")
            
            if 'updated_by' not in column_names:
                logger.info("Adding updated_by column")
                cursor.execute("ALTER TABLE subjects ADD COLUMN updated_by INTEGER")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating subjects table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_subjects_table()
except Exception as e:
    logger.error(f"Failed to initialize subjects table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_subjects(
    subject_type: Optional[str] = None,
    category: Optional[str] = None
):
    """Get all subjects with optional filters"""
    logger.info(f"GET /api/subjects/ - Fetching subjects (type={subject_type}, category={category})")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM subjects WHERE 1=1"
        params = []
        
        if subject_type:
            query += " AND type = ?"
            params.append(subject_type)
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        query += " ORDER BY name ASC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        subjects = []
        
        for row in results:
            subjects.append({
                "id": row['id'],
                "name": row['name'],
                "code": row['code'],
                "type": row['type'],
                "category": row['category'],
                "description": row['description'],
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(subjects)} subjects")
        
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
            logger.debug("Database connection closed")

@router.get("/{subject_id}")
async def get_subject(subject_id: int):
    """Get a specific subject by ID"""
    logger.info(f"GET /api/subjects/{subject_id} - Fetching subject")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        subject = {
            "id": result['id'],
            "name": result['name'],
            "code": result['code'],
            "type": result['type'],
            "category": result['category'],
            "description": result['description'],
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": subject,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_subject: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/code/generate")
async def generate_code(name: str):
    """Generate a subject code from the name"""
    logger.info(f"GET /api/subjects/code/generate - Generating code for {name}")
    
    try:
        code = generate_subject_code(name)
        
        return {
            "success": True,
            "data": {
                "code": code,
                "suggested_code": f"{code}{datetime.now().strftime('%H%M')}"
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in generate_code: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/")
async def create_subject(subject_data: SubjectCreate):
    """Create a new subject"""
    logger.info(f"POST /api/subjects/ - Creating new subject: {subject_data.name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ensure unique subject code
        ensure_unique_subject_code(cursor, subject_data.code)
        
        # Ensure unique subject name
        ensure_unique_subject_name(cursor, subject_data.name)
        
        # Insert new subject
        cursor.execute("""
            INSERT INTO subjects (
                name, code, type, category, description, created_by,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            subject_data.name, subject_data.code, subject_data.type,
            subject_data.category, subject_data.description, subject_data.created_by,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Subject created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Subject created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_subject: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{subject_id}")
async def update_subject(subject_id: int, subject_data: SubjectUpdate):
    """Update a subject"""
    logger.info(f"PUT /api/subjects/{subject_id} - Updating subject")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if subject exists
        cursor.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Check unique constraints if fields are being updated
        if subject_data.code is not None:
            ensure_unique_subject_code(cursor, subject_data.code, subject_id)
            updates.append("code = ?")
            params.append(subject_data.code)
        
        if subject_data.name is not None:
            ensure_unique_subject_name(cursor, subject_data.name, subject_id)
            updates.append("name = ?")
            params.append(subject_data.name)
        
        if subject_data.type is not None:
            updates.append("type = ?")
            params.append(subject_data.type)
        
        if subject_data.category is not None:
            updates.append("category = ?")
            params.append(subject_data.category)
        
        if subject_data.description is not None:
            updates.append("description = ?")
            params.append(subject_data.description)
        
        if subject_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(subject_data.updated_by)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(subject_id)
            query = f"UPDATE subjects SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Subject {subject_id} updated successfully")
        
        return {
            "success": True,
            "message": "Subject updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_subject: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{subject_id}")
async def delete_subject(subject_id: int):
    """Delete a subject"""
    logger.info(f"DELETE /api/subjects/{subject_id} - Deleting subject")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if subject exists and get details
        cursor.execute("SELECT name FROM subjects WHERE id = ?", (subject_id,))
        subject = cursor.fetchone()
        
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # TODO: Check if subject is being used in any assessments or enrollments
        # This would need to be implemented when related tables are created
        
        # Delete the subject
        cursor.execute("DELETE FROM subjects WHERE id = ?", (subject_id,))
        conn.commit()
        
        logger.info(f"Subject {subject_id} ({subject['name']}) deleted successfully")
        
        return {
            "success": True,
            "message": f"Subject '{subject['name']}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_subject: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{subject_id}/assign-levels")
async def assign_levels(subject_id: int, level_data: Dict[str, Any]):
    """Assign subject to levels"""
    logger.info(f"PUT /api/subjects/{subject_id}/assign-levels - Assigning levels")
    conn = None
    
    try:
        levels = level_data.get('levels', [])
        category = level_data.get('category')
        
        if not levels and not category:
            raise HTTPException(status_code=400, detail="Levels or category must be provided")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if subject exists
        cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Update subject category based on selected levels
        if category:
            cursor.execute("""
                UPDATE subjects 
                SET category = ?, updated_at = ?, version = version + 1
                WHERE id = ?
            """, (category, datetime.now().isoformat(), subject_id))
        elif levels:
            # Determine category from selected levels
            has_jhs = any('JHS' in level for level in levels)
            has_shs = any('SHS' in level for level in levels)
            
            if has_jhs and has_shs:
                new_category = 'BOTH'
            elif has_jhs:
                new_category = 'JHS'
            elif has_shs:
                new_category = 'SHS'
            else:
                new_category = 'BOTH'
            
            cursor.execute("""
                UPDATE subjects 
                SET category = ?, updated_at = ?, version = version + 1
                WHERE id = ?
            """, (new_category, datetime.now().isoformat(), subject_id))
        
        conn.commit()
        
        logger.info(f"Levels assigned to subject {subject_id}")
        
        return {
            "success": True,
            "message": "Levels assigned successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in assign_levels: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{subject_id}/assign-programmes")
async def assign_programmes(subject_id: int, programme_data: Dict[str, Any]):
    """Assign subject to programmes (for elective subjects)"""
    logger.info(f"PUT /api/subjects/{subject_id}/assign-programmes - Assigning programmes")
    conn = None
    
    try:
        programme_ids = programme_data.get('programme_ids', [])
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if subject exists and is elective
        cursor.execute("SELECT type FROM subjects WHERE id = ?", (subject_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        if result['type'] != 'elective':
            raise HTTPException(status_code=400, detail="Only elective subjects can be assigned to programmes")
        
        # First, remove existing assignments
        cursor.execute("DELETE FROM subject_programmes WHERE subject_id = ?", (subject_id,))
        
        # Add new assignments
        for programme_id in programme_ids:
            cursor.execute("""
                INSERT INTO subject_programmes (subject_id, programme_id, created_at)
                VALUES (?, ?, ?)
            """, (subject_id, programme_id, datetime.now().isoformat()))
        
        conn.commit()
        
        logger.info(f"Programmes assigned to subject {subject_id}")
        
        return {
            "success": True,
            "message": "Programmes assigned successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in assign_programmes: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_subject_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync subject from external database"""
    try:
        logger.info("Syncing subject from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO subjects (
                id, name, code, type, category, description, version,
                synced_at, updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('name'),
            source_data.get('code'),
            source_data.get('type'),
            source_data.get('category', 'BOTH'),
            source_data.get('description'),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Subject synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing subject: {str(e)}")
        logger.error(traceback.format_exc())
        return False

# Create junction table for subject-programme assignments if not exists
def create_subject_programmes_table():
    """Create subject_programmes junction table"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS subject_programmes (
                subject_id INTEGER NOT NULL,
                programme_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (subject_id, programme_id),
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE CASCADE
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Subject-programmes junction table created/checked")
    except Exception as e:
        logger.error(f"Error creating subject_programmes table: {str(e)}")

# Create junction table for subject-teacher assignments if not exists
def create_subject_teachers_table():
    """Create subject_teachers junction table"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS subject_teachers (
                subject_id INTEGER NOT NULL,
                teacher_id INTEGER NOT NULL,
                is_qualified BOOLEAN DEFAULT 0,
                assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (subject_id, teacher_id),
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                FOREIGN KEY (teacher_id) REFERENCES staff(id) ON DELETE CASCADE
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Subject-teachers junction table created/checked")
    except Exception as e:
        logger.error(f"Error creating subject_teachers table: {str(e)}")

# Create junction tables on module load
try:
    create_subject_programmes_table()
    create_subject_teachers_table()
except Exception as e:
    logger.error(f"Failed to create junction tables: {str(e)}")