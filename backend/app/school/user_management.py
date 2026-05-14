# app/school/user_management.py - Fixed version

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
import secrets
import hashlib
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

router = APIRouter(prefix="/api/users", tags=["user-management"])

# ==================== Helper Functions ====================

def hash_password(password: str) -> str:
    """Hash a password with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return f"{password_hash}:{salt}"

def generate_unique_id(prefix: str = "USR") -> str:
    """Generate a unique ID for user"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = secrets.token_hex(4).upper()
    return f"{prefix}_{timestamp}_{random_part}"

def create_users_table():
    """Create users table if it doesn't exist"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                unique_id TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'ta', 'accountant', 'student', 'non_staff')),
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended','on_leave', 'disabled')),
                last_login DATETIME,
                version INTEGER DEFAULT 1,
                synced_at TIMESTAMP,
                updated_by_sync BOOLEAN DEFAULT 0,
                sync_error TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        logger.info("Users table created/verified successfully")
    except Exception as e:
        logger.error(f"Error creating users table: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

# Create table on module load
try:
    create_users_table()
except Exception as e:
    logger.error(f"Failed to create users table: {str(e)}")

# ==================== Pydantic Models ====================

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: str
    send_welcome: bool = True
    created_by: Optional[int] = None

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    status: Optional[str] = None
    updated_by: Optional[int] = None

# ==================== API Endpoints ====================

@router.get("/")
async def get_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 50
):
    """Get all users with optional filters"""
    logger.info(f"GET /api/users/ - Fetching users")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build query
        query = """
            SELECT id, unique_id, username, email, role, status, last_login, 
                   created_at, updated_at
            FROM users WHERE 1=1
        """
        params = []
        
        if role:
            query += " AND role = ?"
            params.append(role)
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        if search:
            query += " AND (username LIKE ? OR email LIKE ?)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
        
        # Get total count - FIXED: Use proper row access
        count_query = query.replace(
            "SELECT id, unique_id, username, email, role, status, last_login, created_at, updated_at",
            "SELECT COUNT(*) as total"
        )
        cursor.execute(count_query, params)
        total_row = cursor.fetchone()
        # Access by index since sqlite3.Row
        total = total_row[0] if total_row else 0
        logger.info(f"Total users found: {total}")
        
        # Add pagination
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([page_size, (page - 1) * page_size])
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        users = []
        for row in results:
            users.append({
                "id": row[0],
                "unique_id": row[1],
                "username": row[2],
                "email": row[3],
                "role": row[4],
                "status": row[5],
                "last_login": row[6],
                "created_at": row[7],
                "updated_at": row[8]
            })
        
        return {
            "success": True,
            "data": users,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_users: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": str(e),
            "data": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "total_pages": 0,
            "timestamp": datetime.now().isoformat()
        }
    finally:
        if conn:
            conn.close()

@router.get("/roles/list")
async def get_user_roles():
    """Get list of available user roles"""
    return {
        "success": True,
        "data": ['admin', 'teacher', 'ta', 'accountant', 'student', 'non_staff'],
        "timestamp": datetime.now().isoformat()
    }

@router.post("/")
async def create_user(user_data: UserCreate):
    """Create a new user"""
    logger.info(f"POST /api/users/ - Creating user: {user_data.username}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if username exists
        cursor.execute("SELECT id FROM users WHERE username = ?", (user_data.username,))
        if cursor.fetchone():
            return {
                "success": False,
                "error": "Username already exists",
                "message": "Please choose a different username"
            }
        
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (user_data.email,))
        if cursor.fetchone():
            return {
                "success": False,
                "error": "Email already exists",
                "message": "A user with this email already exists"
            }
        
        # Generate IDs and password
        unique_id = generate_unique_id("USR")
        temp_password = secrets.token_urlsafe(10)
        password_hash = hash_password(temp_password)
        
        # Validate role
        valid_roles = ['admin', 'teacher', 'ta', 'accountant', 'student', 'non_staff']
        if user_data.role not in valid_roles:
            return {
                "success": False,
                "error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            }
        
        # Insert user
        cursor.execute("""
            INSERT INTO users (unique_id, username, email, password_hash, role, status, 
                              created_at, updated_at, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            unique_id, user_data.username, user_data.email, password_hash,
            user_data.role, 'active', datetime.now().isoformat(), 
            datetime.now().isoformat(), user_data.created_by
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        logger.info(f"User created successfully with ID: {user_id}")
        
        return {
            "success": True,
            "message": "User created successfully",
            "data": {
                "id": user_id,
                "unique_id": unique_id,
                "username": user_data.username,
                "email": user_data.email,
                "role": user_data.role,
                "status": "active",
                "temporary_password": temp_password if user_data.send_welcome else None
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in create_user: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to create user"
        }
    finally:
        if conn:
            conn.close()

@router.put("/{user_id}")
async def update_user(user_id: int, user_data: UserUpdate):
    """Update a user"""
    logger.info(f"PUT /api/users/{user_id} - Updating user")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        existing = cursor.fetchone()
        if not existing:
            return {
                "success": False,
                "error": "User not found"
            }
        
        # Build update query
        updates = []
        params = []
        
        if user_data.username is not None:
            # Check if username is taken
            cursor.execute("SELECT id FROM users WHERE username = ? AND id != ?", 
                          (user_data.username, user_id))
            if cursor.fetchone():
                return {
                    "success": False,
                    "error": "Username already taken"
                }
            updates.append("username = ?")
            params.append(user_data.username)
        
        if user_data.email is not None:
            cursor.execute("SELECT id FROM users WHERE email = ? AND id != ?", 
                          (user_data.email, user_id))
            if cursor.fetchone():
                return {
                    "success": False,
                    "error": "Email already taken"
                }
            updates.append("email = ?")
            params.append(user_data.email)
        
        if user_data.role is not None:
            valid_roles = ['admin', 'teacher', 'ta', 'accountant', 'student', 'non_staff']
            if user_data.role not in valid_roles:
                return {
                    "success": False,
                    "error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
                }
            updates.append("role = ?")
            params.append(user_data.role)
        
        if user_data.status is not None:
            valid_statuses = ['active', 'suspended', 'on_leave', 'disabled']
            if user_data.status not in valid_statuses:
                return {
                    "success": False,
                    "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
                }
            updates.append("status = ?")
            params.append(user_data.status)
        
        if user_data.updated_by is not None:
            updates.append("updated_by = ?")
            params.append(user_data.updated_by)
        
        # Add version increment and timestamp
        updates.append("version = version + 1")
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        if updates:
            params.append(user_id)
            query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            logger.info(f"User {user_id} updated successfully")
        
        return {
            "success": True,
            "message": "User updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in update_user: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to update user"
        }
    finally:
        if conn:
            conn.close()

@router.post("/{user_id}/toggle-status")
async def toggle_user_status(user_id: int):
    """Toggle user status between active and suspended"""
    logger.info(f"POST /api/users/{user_id}/toggle-status")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get current status
        cursor.execute("SELECT status FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            return {
                "success": False,
                "error": "User not found"
            }
        
        # Toggle status - access by index since it's a tuple
        current_status = user[0]
        new_status = 'suspended' if current_status == 'active' else 'active'
        
        cursor.execute("""
            UPDATE users 
            SET status = ?, version = version + 1, updated_at = ?
            WHERE id = ?
        """, (new_status, datetime.now().isoformat(), user_id))
        
        conn.commit()
        
        return {
            "success": True,
            "message": f"User {new_status} successfully",
            "data": {"status": new_status},
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in toggle_user_status: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if conn:
            conn.close()

@router.post("/{user_id}/reset-password")
async def reset_user_password(user_id: int):
    """Reset user password"""
    logger.info(f"POST /api/users/{user_id}/reset-password")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not cursor.fetchone():
            return {
                "success": False,
                "error": "User not found"
            }
        
        # Generate new temporary password
        temp_password = secrets.token_urlsafe(10)
        password_hash = hash_password(temp_password)
        
        # Update password
        cursor.execute("""
            UPDATE users 
            SET password_hash = ?, version = version + 1, updated_at = ?
            WHERE id = ?
        """, (password_hash, datetime.now().isoformat(), user_id))
        
        conn.commit()
        
        return {
            "success": True,
            "message": "Password reset successfully",
            "data": {
                "temporary_password": temp_password
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in reset_user_password: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if conn:
            conn.close()

@router.delete("/{user_id}")
async def delete_user(user_id: int):
    """Soft delete a user"""
    logger.info(f"DELETE /api/users/{user_id}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not cursor.fetchone():
            return {
                "success": False,
                "error": "User not found"
            }
        
        # Soft delete
        cursor.execute("""
            UPDATE users 
            SET status = 'disabled', version = version + 1, updated_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), user_id))
        
        conn.commit()
        
        return {
            "success": True,
            "message": "User deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in delete_user: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if conn:
            conn.close()

@router.get("/test")
async def test_endpoint():
    """Test endpoint to check if API is working"""
    return {
        "success": True,
        "message": "User management API is working",
        "timestamp": datetime.now().isoformat()
    }