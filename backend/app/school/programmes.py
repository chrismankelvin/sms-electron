# app/school/programmes.py

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

router = APIRouter(prefix="/api/programmes", tags=["programmes"])

# ==================== Pydantic Models ====================

class ProgrammeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    category: Optional[str] = Field(None, pattern="^(JHS|SHS)$")
    description: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Programme name cannot be empty')
        return v.strip()
    
    @validator('code')
    def validate_code(cls, v):
        if v:
            return v.upper().strip()
        return v

class ProgrammeCreate(ProgrammeBase):
    pass

class ProgrammeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    category: Optional[str] = Field(None, pattern="^(JHS|SHS)$")
    description: Optional[str] = None

class ProgrammeResponse(BaseModel):
    id: int
    name: str
    code: Optional[str]
    category: Optional[str]
    description: Optional[str]
    version: int
    created_at: datetime
    updated_at: datetime

# ==================== Helper Functions ====================

def ensure_unique_name(cursor, name: str, exclude_id: Optional[int] = None):
    """Ensure programme name is unique"""
    query = "SELECT id FROM programmes WHERE name = ?"
    params = [name]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400, 
            detail=f"Programme '{name}' already exists. Name must be unique."
        )

def ensure_unique_code(cursor, code: str, exclude_id: Optional[int] = None):
    """Ensure programme code is unique"""
    if not code:
        return
    
    query = "SELECT id FROM programmes WHERE code = ?"
    params = [code]
    
    if exclude_id:
        query += " AND id != ?"
        params.append(exclude_id)
    
    cursor.execute(query, params)
    if cursor.fetchone():
        raise HTTPException(
            status_code=400, 
            detail=f"Code '{code}' already exists. Code must be unique."
        )

# ==================== Database Setup ====================

def create_programmes_table():
    """Create programmes table if it doesn't exist"""
    try:
        logger.info("Creating/checking programmes table")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists and get its structure
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='programmes'")
        table_exists = cursor.fetchone()
        
        if table_exists:
            logger.info("Table 'programmes' already exists, checking columns")
            
            # Add missing columns if needed
            cursor.execute("PRAGMA table_info(programmes)")
            columns = cursor.fetchall()
            column_names = [col['name'] for col in columns]
            
            # Add missing sync columns if not present
            if 'version' not in column_names:
                logger.info("Adding version column")
                cursor.execute("ALTER TABLE programmes ADD COLUMN version INTEGER DEFAULT 1")
            
            if 'synced_at' not in column_names:
                logger.info("Adding synced_at column")
                cursor.execute("ALTER TABLE programmes ADD COLUMN synced_at TIMESTAMP")
            
            if 'updated_by_sync' not in column_names:
                logger.info("Adding updated_by_sync column")
                cursor.execute("ALTER TABLE programmes ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0")
            
            if 'created_by' not in column_names:
                logger.info("Adding created_by column")
                cursor.execute("ALTER TABLE programmes ADD COLUMN created_by INTEGER")
            
            if 'updated_by' not in column_names:
                logger.info("Adding updated_by column")
                cursor.execute("ALTER TABLE programmes ADD COLUMN updated_by INTEGER")
            
            # Drop any problematic triggers if they exist
            cursor.execute("SELECT name FROM sqlite_master WHERE type='trigger' AND tbl_name='programmes'")
            triggers = cursor.fetchall()
            for trigger in triggers:
                trigger_name = trigger['name']
                logger.info(f"Dropping trigger: {trigger_name}")
                cursor.execute(f"DROP TRIGGER IF EXISTS {trigger_name}")
            
            conn.commit()
            logger.info("Table structure updated successfully")
        else:
            # Create new table with all columns
            cursor.execute("""
                CREATE TABLE programmes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    code TEXT UNIQUE,
                    description TEXT,
                    category TEXT,
                    version INTEGER DEFAULT 1,
                    synced_at TIMESTAMP,
                    updated_by_sync BOOLEAN DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    CONSTRAINT programmes_check_category CHECK (category IN ('JHS', 'SHS'))
                )
            """)
            logger.info("New programmes table created")
        
        # Check if table is empty, insert default records
        cursor.execute("SELECT COUNT(*) as count FROM programmes")
        result = cursor.fetchone()
        
        if result['count'] == 0:
            logger.info("Inserting default programmes")
            default_programmes = [
                ("General Science", "SCI", "SHS", "Focus on Sciences - Biology, Chemistry, Physics"),
                ("General Arts", "ART", "SHS", "Focus on Humanities and Social Sciences"),
                ("Business", "BUS", "SHS", "Focus on Commerce and Management"),
                ("General", "GEN", "JHS", "General Junior High School Curriculum")
            ]
            
            for programme in default_programmes:
                cursor.execute("""
                    INSERT INTO programmes (name, code, category, description, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (*programme, datetime.now().isoformat(), datetime.now().isoformat()))
            
            conn.commit()
            logger.info("Default programmes inserted successfully")
        
        conn.close()
    except Exception as e:
        logger.error(f"Error creating/updating programmes table: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Initialize table on module load
try:
    create_programmes_table()
except Exception as e:
    logger.error(f"Failed to initialize programmes table: {str(e)}")

# ==================== API Endpoints ====================

@router.get("/")
async def get_programmes():
    """Get all programmes"""
    logger.info("GET /api/programmes/ - Fetching all programmes")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM programmes 
            ORDER BY 
                CASE category 
                    WHEN 'JHS' THEN 1 
                    WHEN 'SHS' THEN 2 
                END,
                name ASC
        """)
        
        results = cursor.fetchall()
        programmes = []
        
        for row in results:
            programmes.append({
                "id": row['id'],
                "name": row['name'],
                "code": row['code'],
                "category": row['category'],
                "description": row['description'],
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(programmes)} programmes")
        
        return {
            "success": True,
            "data": programmes,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_programmes: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")

@router.get("/{programme_id}")
async def get_programme(programme_id: int):
    """Get a specific programme by ID"""
    logger.info(f"GET /api/programmes/{programme_id} - Fetching programme")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM programmes WHERE id = ?", (programme_id,))
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Programme not found")
        
        programme = {
            "id": result['id'],
            "name": result['name'],
            "code": result['code'],
            "category": result['category'],
            "description": result['description'],
            "version": result['version'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        return {
            "success": True,
            "data": programme,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_programme: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/category/{category}")
async def get_programmes_by_category(category: str):
    """Get all programmes for a specific category"""
    logger.info(f"GET /api/programmes/category/{category} - Fetching programmes by category")
    conn = None
    
    try:
        if category not in ['JHS', 'SHS']:
            raise HTTPException(status_code=400, detail="Category must be JHS or SHS")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM programmes 
            WHERE category = ?
            ORDER BY name ASC
        """, (category,))
        
        results = cursor.fetchall()
        programmes = []
        
        for row in results:
            programmes.append({
                "id": row['id'],
                "name": row['name'],
                "code": row['code'],
                "category": row['category'],
                "description": row['description'],
                "version": row['version'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        logger.info(f"Retrieved {len(programmes)} programmes for category {category}")
        
        return {
            "success": True,
            "data": programmes,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_programmes_by_category: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/")
async def create_programme(programme_data: ProgrammeCreate):
    """Create a new programme"""
    logger.info(f"POST /api/programmes/ - Creating new programme: {programme_data.name}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ensure name is unique
        ensure_unique_name(cursor, programme_data.name)
        
        # Ensure code is unique if provided
        if programme_data.code:
            ensure_unique_code(cursor, programme_data.code)
        
        # Prepare code (uppercase if provided)
        code = programme_data.code.upper() if programme_data.code else None
        
        # Insert new programme
        cursor.execute("""
            INSERT INTO programmes (name, code, category, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            programme_data.name, code, programme_data.category,
            programme_data.description, datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(f"Programme created successfully with ID: {new_id}")
        
        return {
            "success": True,
            "message": "Programme created successfully",
            "data": {"id": new_id},
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_programme: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{programme_id}")
async def update_programme(programme_id: int, programme_data: ProgrammeUpdate):
    """Update a programme"""
    logger.info(f"PUT /api/programmes/{programme_id} - Updating programme")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if programme exists
        cursor.execute("SELECT * FROM programmes WHERE id = ?", (programme_id,))
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Programme not found")
        
        # Build update query dynamically
        updates = []
        params = []
        
        # Check name uniqueness if being updated
        if programme_data.name is not None:
            ensure_unique_name(cursor, programme_data.name, programme_id)
            updates.append("name = ?")
            params.append(programme_data.name)
        
        # Check code uniqueness if being updated
        if programme_data.code is not None:
            code = programme_data.code.upper() if programme_data.code else None
            ensure_unique_code(cursor, code, programme_id)
            updates.append("code = ?")
            params.append(code)
        
        if programme_data.category is not None:
            updates.append("category = ?")
            params.append(programme_data.category)
        
        if programme_data.description is not None:
            updates.append("description = ?")
            params.append(programme_data.description)
        
        # Add version increment and update timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        if updates:
            params.append(programme_id)
            query = f"UPDATE programmes SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"Programme {programme_id} updated successfully")
        
        return {
            "success": True,
            "message": "Programme updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_programme: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{programme_id}")
async def delete_programme(programme_id: int):
    """Delete a programme"""
    logger.info(f"DELETE /api/programmes/{programme_id} - Deleting programme")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if programme exists and get details
        cursor.execute("SELECT name FROM programmes WHERE id = ?", (programme_id,))
        programme = cursor.fetchone()
        
        if not programme:
            raise HTTPException(status_code=404, detail="Programme not found")
        
        # TODO: Check if programme has any associated subjects or enrollments
        # This would need to be implemented when related tables are created
        
        # Delete the programme
        cursor.execute("DELETE FROM programmes WHERE id = ?", (programme_id,))
        conn.commit()
        
        logger.info(f"Programme {programme_id} ({programme['name']}) deleted successfully")
        
        return {
            "success": True,
            "message": f"Programme '{programme['name']}' deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_programme: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==================== Sync Integration Functions ====================

def sync_programme_from_external(source_data: Dict[str, Any]) -> bool:
    """Sync programme from external database"""
    try:
        logger.info("Syncing programme from external source")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO programmes (
                id, name, code, category, description, version, 
                synced_at, updated_by_sync, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_data.get('id'),
            source_data.get('name'),
            source_data.get('code'),
            source_data.get('category'),
            source_data.get('description'),
            source_data.get('version', 1),
            datetime.now().isoformat(),
            1,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        logger.info("Programme synced successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing programme: {str(e)}")
        logger.error(traceback.format_exc())
        return False