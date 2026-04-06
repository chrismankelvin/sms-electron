
# backend/app/main.py
# main.py - Updated to remove JSON dependencies
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import sqlite3
from pathlib import Path
import hashlib
import uuid
from fastapi.responses import JSONResponse  # Add this line

import json
import base64
from cryptography.fernet import Fernet

from app.activation import state


from typing import Optional
from typing import List  # Or use list directly in type hints
from app.auth.routes import router as auth_router
from database.cloud_db import SQLiteCloudClient

from app.activation.activation_service import (
    is_activated, 
    activate_system, 
    validate_activation_code,
    check_activation_status,
    calculate_expected_code
)

from app.minisettings.mini_settings_api import router as mini_settings_router
from app.minisettings.settings_service import mini_settings_service

print("=" * 60)
print("MAIN.PY IS BEING LOADED - DEBUG MESSAGE")
print("=" * 60)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        # "http://localhost:5173",
        # "http://127.0.0.1:5173",
        # "http://localhost:3000",  # Common React port
        # "http://localhost:5000",  # Common alternative
        # "null"  # For Electron
    ],
    allow_credentials=False,  # Set to True since we're using specific origins
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
app.include_router(auth_router)

app.include_router(mini_settings_router)
# Initialize SQLiteCloud client

cloud_client = SQLiteCloudClient()


# Add to imports in main.py
from app.sync.device_sync import DeviceSyncManager

# Initialize sync manager after cloud_client
sync_manager = DeviceSyncManager("database/school.db", cloud_client)

# Unified local SQLite database path
# LOCAL_DB_PATH = Path("database/school.db")

def get_db_connection():
    """Get database connection"""
    return state.get_db_connection()


# ============================================
# HELPER FUNCTIONS (Database operations)
# ============================================

def hash_password(password: str) -> str:
    """Hash password for storage"""
    return hashlib.sha256(password.encode()).hexdigest()

# def check_school_setup_complete() -> bool:
#     """Check if school details have been saved"""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("SELECT id, school_name FROM school_info LIMIT 1")
#         row = cursor.fetchone()
        
#         if row:
#             school_id, school_name = row
#             print(f"School found - ID: {school_id}, Name: {school_name}")
#             result = True
#         else:
#             print("No school found in database")
#             result = False
            
#         conn.close()
#         return result
#     except Exception as e:
#         print(f"School check failed: {e}")
#         return False

# def check_admin_setup_complete() -> bool:
#     """Check if admin user has been created"""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("SELECT id, username, role FROM users WHERE role = 'admin' LIMIT 1")
#         row = cursor.fetchone()
        
#         if row:
#             admin_id, username, role = row
#             print(f"Admin found - ID: {admin_id}, Username: {username}, Role: {role}")
#             result = True
#         else:
#             print("No admin user found in database")
            
#             # Optional: Show all users for debugging
#             cursor.execute("SELECT id, username, role FROM users")
#             all_users = cursor.fetchall()
#             if all_users:
#                 print("Other users in database:")
#                 for user in all_users:
#                     print(f"   - ID: {user[0]}, Username: {user[1]}, Role: {user[2]}")
#             else:
#                 print("No users at all in database")
                
#             result = False
            
#         conn.close()
#         return result
#     except Exception as e:
#         print(f"Admin check failed: {e}")
#         return False

def check_school_setup_complete() -> bool:
    """Check if school details have been saved"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, school_name FROM school_info LIMIT 1")
        row = cursor.fetchone()
        
        if row:
            school_id, school_name = row
            print(f"School found - ID: {school_id}, Name: {school_name}")
            result = True
        else:
            print("No school found in database")
            result = False
            
        conn.close()
        return result
    except Exception as e:
        print(f"School check failed: {e}")
        return False

def check_admin_setup_complete() -> bool:
    """Check if admin user has been created"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, role FROM users WHERE role = 'admin' LIMIT 1")
        row = cursor.fetchone()
        
        if row:
            admin_id, username, role = row
            print(f"Admin found - ID: {admin_id}, Username: {username}, Role: {role}")
            result = True
        else:
            print("No admin user found in database")
            
            # Optional: Show all users for debugging
            cursor.execute("SELECT id, username, role FROM users")
            all_users = cursor.fetchall()
            if all_users:
                print("Other users in database:")
                for user in all_users:
                    print(f"   - ID: {user[0]}, Username: {user[1]}, Role: {user[2]}")
            else:
                print("No users at all in database")
                
            result = False
            
        conn.close()
        return result
    except Exception as e:
        print(f"Admin check failed: {e}")
        return False




def save_school_to_local_db(data: dict) -> bool:
    """Save school info to local database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if school info already exists
        cursor.execute("SELECT id FROM school_info LIMIT 1")
        existing = cursor.fetchone()
        
        if existing:
            # Update existing school info
            cursor.execute("""
                UPDATE school_info 
                SET school_name = ?, email = ?, phone = ?, address = ?, 
                    city = ?, state = ?, country = ?, updated_at = ?
                WHERE id = ?
            """, (
                data["school_name"],
                data["school_email"],
                data["school_contact"],
                f"{data['town']}, {data['city']}",
                data["city"],
                data["region"],
                data["county"],
                datetime.now().isoformat(),
                existing[0]
            ))
        else:
            # Insert new school info
            cursor.execute("""
                INSERT INTO school_info 
                (school_name, email, phone, address, city, state, country, 
                 created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data["school_name"],
                data["school_email"],
                data["school_contact"],
                f"{data['town']}, {data['city']}",
                data["city"],
                data["region"],
                data["county"],
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error saving school to local DB: {e}")
        return False

def save_admin_to_local_db(data: dict) -> bool:
    """Save admin user to local database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Generate a unique ID
        unique_id = str(uuid.uuid4())
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (data["email"],))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing user
            cursor.execute("""
                UPDATE users 
                SET password_hash = ?, role = ?, updated_at = ?
                WHERE email = ?
            """, (
                hash_password(data["password"]),
                "admin",
                datetime.now().isoformat(),
                data["email"]
            ))
        else:
            # Insert new user
            cursor.execute("""
                INSERT INTO users 
                (unique_id, username, email, password_hash, role, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                unique_id,
                data["email"],
                data["email"],
                hash_password(data["password"]),
                "admin",
                "active",
                datetime.now().isoformat()
            ))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error saving admin to local DB: {e}")
        return False




# ============================================
# RECOVERY (Option C – Encrypted Backup Blob)
# ============================================

RECOVERY_SECRET = "CHANGE_ME_IN_PRODUCTION"

def derive_recovery_key(school_email: str) -> bytes:
    raw = f"{school_email}:{RECOVERY_SECRET}".encode()
    digest = hashlib.sha256(raw).digest()
    return base64.urlsafe_b64encode(digest)

def decrypt_recovery_blob(encrypted_blob: str, school_email: str) -> dict:
    key = derive_recovery_key(school_email)
    fernet = Fernet(key)
    decrypted = fernet.decrypt(encrypted_blob.encode())
    return json.loads(decrypted)

def validate_recovery_payload(payload: dict):
    required = ["schema_version", "school", "admins", "issued_at"]
    for key in required:
        if key not in payload:
            raise Exception(f"Invalid recovery payload: missing {key}")

    if payload["schema_version"] != 1:
        raise Exception("Unsupported recovery schema version")

    if not payload["admins"]:
        raise Exception("Recovery payload contains no admins")


def wipe_local_database(conn):
    cursor = conn.cursor()

    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM school_info")
    cursor.execute("DELETE FROM devices")
    cursor.execute("DELETE FROM activation_state")

    conn.commit()
def import_school_from_recovery(conn, school: dict):
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO school_info
        (school_name, email, phone, city, state, country, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        school.get("school_name"),
        school.get("school_email"),
        school.get("school_contact"),
        school.get("city"),
        school.get("region"),
        school.get("county"),
        school.get("created_at"),
        datetime.now().isoformat()
    ))

def import_admins_from_recovery(conn, admins: list):
    cursor = conn.cursor()

    for admin in admins:
        cursor.execute("""
            INSERT INTO users
            (unique_id, username, email, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, 'admin', 'active', ?)
        """, (
            str(uuid.uuid4()),
            admin.get("email"),
            admin.get("email"),
            admin.get("password_hash"),
            datetime.now().isoformat()
        ))


def reset_activation_state(conn):
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO activation_state
        (id, activated, activation_code, machine_fingerprint, created_at)
        VALUES (1, FALSE, NULL, NULL, ?)
    """, (datetime.now().isoformat(),))
    conn.commit()


# ============================================
# REQUEST MODELS
# ============================================

class SchoolDetailsRequest(BaseModel):
    school_name: str
    school_email: str
    school_contact: str
    county: str
    region: str
    city: str
    town: str
    gps_address: str

class AdminDetailsRequest(BaseModel):
    first_name: str
    middle_name: Optional[str] = ""
    last_name: str
    email: str
    contact: str
    password: str
    confirm_password: str

class ActivationRequest(BaseModel):
    code: str
    school_name: str

class ValidateRequest(BaseModel):
    school_name: str
    code: str

class ExpectedCodeRequest(BaseModel):
    school_name: str



# Python 3.9+ style:
class SyncRequest(BaseModel):
    device_ids: Optional[list[int]] = None  # Use lowercase list
    batch_size: Optional[int] = 10
    force_sync_all: Optional[bool] = False

class DeviceRegistrationRequest(BaseModel):
    device_id: str
    device_name: str
    device_type: Optional[str] = "computer"
    os_name: str
    os_version: str
    activation_key: Optional[str] = None
    user_id: Optional[int] = None



class RecoveryImportRequest(BaseModel):
    school_email: str
    encrypted_backup: str



class SchoolAndAdminRequest(BaseModel):
    # School Details
    school_name: str
    school_email: str
    school_contact: str
    school_type: str = "secondary"  # default or from frontend
    county: str
    region: str
    city: str
    town: str
    gps_address: str
    country: str = "Ghana"  # default or from frontend
    
    # Admin Details
    first_name: str
    middle_name: Optional[str] = ""
    last_name: str
    admin_email: str
    contact: str
    password: str
    confirm_password: str

class CompleteSyncRequest(BaseModel):
    sync_school: bool = True
    sync_activation: bool = True
    sync_devices: bool = True
    device_batch_size: int = 20

# ============================================
# SETUP ENDPOINTS
# ============================================

@app.get("/test-cors")
async def test_cors():
    return {"message": "CORS is working"}


# @app.post("/setup/school-and-admin")
# async def setup_school_and_admin(req: SchoolAndAdminRequest):
#     """Create school and admin in a single transaction"""
#     try:
#         # Check if already activated
#         if is_activated():
#             raise HTTPException(status_code=400, detail="System already activated")
        
#         # Validate passwords
#         if req.password != req.confirm_password:
#             raise HTTPException(status_code=400, detail="Passwords do not match")
        
#         if len(req.password) < 6:
#             raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
#         # Check SQLiteCloud connection
#         if not cloud_client.check_connection():
#             raise HTTPException(
#                 status_code=503, 
#                 detail="Cannot connect to cloud database. Please check your internet connection."
#             )
        
#         print(f"[debug] DEBUG: Starting school and admin setup for: {req.school_name}")
        
#         # ===== 1. CREATE SCHOOL IN CLOUD =====
#         school_data = {
#             "school_name": req.school_name,
#             "school_email": req.school_email,
#             "school_contact": req.school_contact,
#             "school_type": req.school_type,
#             "county": req.county,
#             "region": req.region,
#             "city": req.city,
#             "town": req.town,
#             "gps_address": req.gps_address,
#             "country": req.country,
#             "created_at": datetime.now().isoformat()
#         }
        
#         print(f"[debug] DEBUG: Inserting school into cloud: {req.school_name}")
#         school_id = cloud_client.insert_school(school_data)
        
#         if not school_id:
#             print(f"[ERROR] DEBUG: School insertion failed - no school_id returned")
#             raise HTTPException(status_code=500, detail="Failed to create school in cloud database")
        
#         print(f"[ok] DEBUG: School inserted with ID: {school_id}")
        
#         # VERIFY SCHOOL WAS ACTUALLY CREATED
#         print(f"[debug] DEBUG: Verifying school creation...")
#         school_check = cloud_client.execute_query(
#             "SELECT id, school_name FROM school_installations WHERE id = ?",
#             (school_id,)
#         )
        
#         if not school_check.get("success"):
#             print(f"[ERROR] DEBUG: School verification query failed: {school_check.get('error')}")
#             raise HTTPException(status_code=500, detail="Failed to verify school creation")
        
#         if not school_check.get("rows"):
#             print(f"[ERROR] DEBUG: School not found in cloud after insertion")
#             raise HTTPException(status_code=500, detail="School not found after creation")
        
#         print(f"[ok] DEBUG: School verified: {school_check['rows'][0]['school_name']}")
        
#         # ===== 2. CHECK FOR DUPLICATE ADMIN =====
#         print(f"[debug] DEBUG: Checking for duplicate admin...")
        
#         # Check by email
#         email_check = cloud_client.execute_query(
#             "SELECT id FROM admin_table WHERE email = ?",
#             (req.admin_email,)
#         )
        
#         if email_check.get("rows"):
#             print(f"[ERROR] DEBUG: Admin email {req.admin_email} already exists!")
#             # Clean up school
#             cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
#             raise HTTPException(
#                 status_code=400, 
#                 detail=f"Admin email {req.admin_email} is already registered. Please use a different email."
#             )
        
#         # Check by contact
#         contact_check = cloud_client.execute_query(
#             "SELECT id FROM admin_table WHERE contact = ?",
#             (req.contact,)
#         )
        
#         if contact_check.get("rows"):
#             print(f"[ERROR] DEBUG: Admin contact {req.contact} already exists!")
#             # Clean up school
#             cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
#             raise HTTPException(
#                 status_code=400, 
#                 detail=f"Contact number {req.contact} is already registered. Please use a different contact."
#             )
        
#         print(f"[ok] DEBUG: No duplicate admin found")
        
#         # ===== 3. CREATE ADMIN IN CLOUD =====
#         admin_data = {
#             "first_name": req.first_name,
#             "middle_name": req.middle_name,
#             "last_name": req.last_name,
#             "contact": req.contact,
#             "password_hash": hash_password(req.password),
#             "email": req.admin_email,
#             "school_id": school_id,  # Link to the school
#             "role": "super_admin",
#             "created_at": datetime.now().isoformat()
#         }
        
#         print(f"[debug] DEBUG: Creating new admin in cloud: {req.admin_email}")
        
#         # Call insert_admin directly (it should handle duplicates but we already checked)
#         admin_id = cloud_client.insert_admin(school_id, admin_data)
        
#         if not admin_id:
#             print(f"[ERROR] DEBUG: Admin insertion failed - no admin_id returned")
#             # Clean up school
#             cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
#             raise HTTPException(status_code=500, detail="Failed to create admin in cloud database")
        
#         print(f"[ok] DEBUG: Admin created with ID: {admin_id}")
        
#         # ===== 4. VERIFY ADMIN CREATION =====
#         print(f"[debug] DEBUG: Verifying admin creation...")
        
#         # First, check if we got a NEW admin ID (not an existing one)
#         admin_check = cloud_client.execute_query(
#             "SELECT id, email, school_id, created_at FROM admin_table WHERE id = ?",
#             (admin_id,)
#         )
        
#         if not admin_check.get("success"):
#             print(f"[ERROR] DEBUG: Admin verification query failed")
#             # Clean up
#             cloud_client.execute_query("DELETE FROM admin_table WHERE id = ?", (admin_id,))
#             cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
#             raise HTTPException(status_code=500, detail="Failed to verify admin creation")
        
#         if not admin_check.get("rows"):
#             print(f"[ERROR] DEBUG: Admin not found after creation")
#             # Clean up school
#             cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
#             raise HTTPException(status_code=500, detail="Admin not found after creation")
        
#         admin_info = admin_check['rows'][0]
#         print(f"[ok] DEBUG: Admin found: {admin_info['email']}")
        
#         # Verify it's linked to OUR school
#         if admin_info['school_id'] != school_id:
#             print(f"[ERROR] DEBUG: Admin created with wrong school_id!")
#             print(f"  Expected: {school_id}, Got: {admin_info['school_id']}")
#             # Clean up both
#             cloud_client.execute_query("DELETE FROM admin_table WHERE id = ?", (admin_id,))
#             cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
#             raise HTTPException(status_code=500, detail="Admin created with incorrect school association")
        
#         # Verify email matches
#         if admin_info['email'] != req.admin_email:
#             print(f"[ERROR] DEBUG: Admin email mismatch!")
#             print(f"  Expected: {req.admin_email}, Got: {admin_info['email']}")
#             # Clean up both
#             cloud_client.execute_query("DELETE FROM admin_table WHERE id = ?", (admin_id,))
#             cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
#             raise HTTPException(status_code=500, detail="Admin email mismatch")
        
#         print(f"[ok] DEBUG: Admin properly created and verified")
        
#         # ===== 5. SAVE TO LOCAL DATABASE =====
#         local_errors = []
        
#         # Save school to local DB
#         print(f"[debug] DEBUG: Saving school to local database...")
#         local_school_success = save_school_to_local_db(school_data)
        
#         if not local_school_success:
#             local_errors.append("Failed to save school to local database")
#             print(f"[warn] WARNING: Failed to save school to local database")
#         else:
#             print(f"[ok] DEBUG: School saved to local database")
        
#         # Save admin to local DB
#         print(f"[debug] DEBUG: Saving admin to local database...")
#         local_admin_success = save_admin_to_local_db({
#             "email": req.admin_email,
#             "password": req.password,
#             "first_name": req.first_name,
#             "last_name": req.last_name,
#             "contact": req.contact,
#             "school_id": school_id
#         })
        
#         if not local_admin_success:
#             local_errors.append("Failed to save admin to local database")
#             print(f"[warn] WARNING: Failed to save admin to local database")
#         else:
#             print(f"[ok] DEBUG: Admin saved to local database")

# ####### 5.5 INSERTING THE ACTIVATION REQUEST TO THE CLOUD REQUEST #####



        
#         # ===== 6. FINAL CONFIRMATION =====
#         print(f"[debug] DEBUG: Final confirmation...")
        
#         # Simple count check
#         school_count = cloud_client.execute_query(
#             "SELECT COUNT(*) as count FROM school_installations WHERE id = ?",
#             (school_id,)
#         )
        
#         admin_count = cloud_client.execute_query(
#             "SELECT COUNT(*) as count FROM admin_table WHERE id = ? AND school_id = ?",
#             (admin_id, school_id)
#         )
        
#         if (not school_count.get("success") or 
#             not admin_count.get("success") or
#             school_count['rows'][0]['count'] != 1 or
#             admin_count['rows'][0]['count'] != 1):
#             print(f"[ERROR] DEBUG: Final count verification failed!")
#             raise HTTPException(status_code=500, detail="Final verification failed")
        
#         print(f"[ok] DEBUG: Setup completed successfully!")
#         print(f"  School ID: {school_id}")
#         print(f"  Admin ID: {admin_id}")
        
#         return {
#             "success": True,
#             "message": "School and admin created successfully",
#             "school_id": school_id,
#             "admin_id": admin_id,
#             "cloud_verified": True,
#             "local_saved": {
#                 "school": local_school_success,
#                 "admin": local_admin_success
#             },
#             "warnings": local_errors if local_errors else None,
#             "next_step": "activation"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"[ERROR] ERROR in setup_school_and_admin: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Setup failed: {str(e)}")

# ACTIVATTION KEY AUTO REQUEST ADDED STABLE VERSION (USES DIRECT SQL NO CLOUD CLIENT)
@app.post("/setup/school-and-admin")
async def setup_school_and_admin(req: SchoolAndAdminRequest):
    """Create school and admin in a single transaction"""
    try:
        # Check if already activated
        if is_activated():
            raise HTTPException(status_code=400, detail="System already activated")
        
        # Validate passwords
        if req.password != req.confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")
        
        if len(req.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        # Check SQLiteCloud connection
        if not cloud_client.check_connection(force_refresh=True):
            raise HTTPException(
                status_code=503, 
                detail="Cannot connect to cloud database. Please check your internet connection."
            )
        
        print(f"[debug] DEBUG: Starting school and admin setup for: {req.school_name}")
        
        # ===== 1. CREATE SCHOOL IN CLOUD =====
        school_data = {
            "school_name": req.school_name,
            "school_email": req.school_email,
            "school_contact": req.school_contact,
            "school_type": req.school_type,
            "county": req.county,
            "region": req.region,
            "city": req.city,
            "town": req.town,
            "gps_address": req.gps_address,
            "country": req.country,
            "created_at": datetime.now().isoformat()
        }
        
        print(f"[debug] DEBUG: Inserting school into cloud: {req.school_name}")
        school_id = cloud_client.insert_school(school_data)
        
        if not school_id:
            print(f"[ERROR] DEBUG: School insertion failed - no school_id returned")
            raise HTTPException(status_code=500, detail="Failed to create school in cloud database")
        
        print(f"[ok] DEBUG: School inserted with ID: {school_id}")
        
        # VERIFY SCHOOL WAS ACTUALLY CREATED
        print(f"[debug] DEBUG: Verifying school creation...")
        school_check = cloud_client.execute_query(
            "SELECT id, school_name FROM school_installations WHERE id = ?",
            (school_id,)
        )
        
        if not school_check.get("success"):
            print(f"[ERROR] DEBUG: School verification query failed: {school_check.get('error')}")
            raise HTTPException(status_code=500, detail="Failed to verify school creation")
        
        if not school_check.get("rows"):
            print(f"[ERROR] DEBUG: School not found in cloud after insertion")
            raise HTTPException(status_code=500, detail="School not found after creation")
        
        print(f"[ok] DEBUG: School verified: {school_check['rows'][0]['school_name']}")
        
        # ===== 2. CHECK FOR DUPLICATE ADMIN =====
        print(f"[debug] DEBUG: Checking for duplicate admin...")
        
        # Check by email
        email_check = cloud_client.execute_query(
            "SELECT id FROM admin_table WHERE email = ?",
            (req.admin_email,)
        )
        
        if email_check.get("rows"):
            print(f"[ERROR] DEBUG: Admin email {req.admin_email} already exists!")
            # Clean up school
            cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
            raise HTTPException(
                status_code=400, 
                detail=f"Admin email {req.admin_email} is already registered. Please use a different email."
            )
        
        # Check by contact
        contact_check = cloud_client.execute_query(
            "SELECT id FROM admin_table WHERE contact = ?",
            (req.contact,)
        )
        
        if contact_check.get("rows"):
            print(f"[ERROR] DEBUG: Admin contact {req.contact} already exists!")
            # Clean up school
            cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
            raise HTTPException(
                status_code=400, 
                detail=f"Contact number {req.contact} is already registered. Please use a different contact."
            )
        
        print(f"[ok] DEBUG: No duplicate admin found")
        
        # ===== 3. CREATE ADMIN IN CLOUD =====
        admin_data = {
            "first_name": req.first_name,
            "middle_name": req.middle_name,
            "last_name": req.last_name,
            "contact": req.contact,
            "password_hash": hash_password(req.password),
            "email": req.admin_email,
            "school_id": school_id,  # Link to the school
            "role": "super_admin",
            "created_at": datetime.now().isoformat()
        }
        
        print(f"[debug] DEBUG: Creating new admin in cloud: {req.admin_email}")
        
        # Call insert_admin directly (it should handle duplicates but we already checked)
        admin_id = cloud_client.insert_admin(school_id, admin_data)
        
        if not admin_id:
            print(f"[ERROR] DEBUG: Admin insertion failed - no admin_id returned")
            # Clean up school
            cloud_client.execute_query("DELETE FROM school_installations WHERE id = ?", (school_id,))
            raise HTTPException(status_code=500, detail="Failed to create admin in cloud database")
        
        print(f"[ok] DEBUG: Admin created with ID: {admin_id}")
        
        # ===== 4. VERIFY ADMIN CREATION =====
        # ===== 4. VERIFY ADMIN CREATION =====
        print(f"[debug] DEBUG: Verifying admin creation...")

        # First, check if we got a NEW admin ID (not an existing one)
        admin_check = cloud_client.execute_query(
            "SELECT id, email, school_id, created_at FROM admin_table WHERE id = ?",
            (admin_id,)
        )

        if not admin_check.get("success"):
            print(f"[ERROR] DEBUG: Admin verification query failed")
            # Don't clean up - just warn
            print(f"[WARN] Continuing despite verification failure")
        elif not admin_check.get("rows"):
            print(f"[ERROR] DEBUG: Admin not found after creation")
            # Try to find by email instead
            admin_by_email = cloud_client.execute_query(
                "SELECT id, email, school_id FROM admin_table WHERE email = ?",
                (req.admin_email,)
            )
            if admin_by_email.get("rows"):
                admin_info = admin_by_email['rows'][0]
                admin_id = admin_info['id']
                print(f"[DEBUG] Found admin by email: {admin_info}")
            else:
                print(f"[WARN] Could not find admin, but continuing...")
                admin_info = {"id": admin_id, "email": req.admin_email, "school_id": None}
        else:
            admin_info = admin_check['rows'][0]

        print(f"[ok] DEBUG: Admin found: {admin_info.get('email', req.admin_email)}")

        # Fix school_id if needed - DON'T FAIL
        if admin_info.get('school_id') != school_id:
            print(f"[WARN] DEBUG: Admin school_id mismatch!")
            print(f"  Expected: {school_id}, Got: {admin_info.get('school_id')}")
            print(f"[DEBUG] Fixing admin school_id...")
            
            # Update the admin's school_id
            update_result = cloud_client.execute_query(
                "UPDATE admin_table SET school_id = ? WHERE id = ?",
                (school_id, admin_info['id'])
            )
            
            if update_result.get("rowcount", 0) > 0:
                print(f"[OK] DEBUG: Admin school_id updated successfully")
            else:
                print(f"[ERROR] DEBUG: Failed to update admin school_id - continuing anyway")

        # Verify email matches - DON'T FAIL
        if admin_info.get('email') != req.admin_email:
            print(f"[WARN] DEBUG: Admin email mismatch!")
            print(f"  Expected: {req.admin_email}, Got: {admin_info.get('email')}")
            print(f"[DEBUG] Continuing anyway...")

        print(f"[ok] DEBUG: Admin verification completed")
        





        # ===== 5. SAVE TO LOCAL DATABASE =====
        local_errors = []
        
        # Save school to local DB
        print(f"[debug] DEBUG: Saving school to local database...")
        local_school_success = save_school_to_local_db(school_data)
        
        if not local_school_success:
            local_errors.append("Failed to save school to local database")
            print(f"[warn] WARNING: Failed to save school to local database")
        else:
            print(f"[ok] DEBUG: School saved to local database")
        
        # Save admin to local DB
        print(f"[debug] DEBUG: Saving admin to local database...")
        local_admin_success = save_admin_to_local_db({
            "email": req.admin_email,
            "password": req.password,
            "first_name": req.first_name,
            "last_name": req.last_name,
            "contact": req.contact,
            "school_id": school_id
        })
        
        if not local_admin_success:
            local_errors.append("Failed to save admin to local database")
            print(f"[warn] WARNING: Failed to save admin to local database")
        else:
            print(f"[ok] DEBUG: Admin saved to local database")

        # ===== 5.5 INSERTING THE ACTIVATION REQUEST TO THE CLOUD =====
        print(f"[debug] DEBUG: ===== STARTING ACTIVATION REQUEST INSERTION =====")
        
        # Get the machine fingerprint
        try:
            from app.activation.fingerprint import get_or_create_machine_fingerprint
            machine_fingerprint = get_or_create_machine_fingerprint()
            print(f"[debug] DEBUG: Machine fingerprint obtained: {machine_fingerprint}")
            print(f"[debug] DEBUG: Fingerprint length: {len(machine_fingerprint)}")
        except Exception as fp_error:
            print(f"[ERROR] DEBUG: Failed to get machine fingerprint: {fp_error}")
            import traceback
            traceback.print_exc()
            machine_fingerprint = f"error_{datetime.now().timestamp()}"
        
        # Create admin full name
        admin_full_name = " ".join(filter(None, [req.first_name, req.middle_name, req.last_name])).strip()
        print(f"[debug] DEBUG: Admin full name: {admin_full_name}")
        
        current_time = datetime.now().isoformat()
        print(f"[debug] DEBUG: Current time: {current_time}")
        
        # FIRST: Check if activation_requests table exists and has correct structure
        print(f"[debug] DEBUG: Checking if activation_requests table exists...")
        table_check = cloud_client.execute_query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='activation_requests'"
        )
        print(f"[debug] DEBUG: Table check result: {table_check}")
        
        # Drop the existing table if it has wrong structure
        if table_check.get("rows"):
            print(f"[warn] DEBUG: activation_requests table exists, checking structure...")
            pragma_query = "PRAGMA table_info(activation_requests)"
            pragma_result = cloud_client.execute_query(pragma_query)
            print(f"[debug] DEBUG: Current table structure: {pragma_result}")
            
            # Check if school_id column exists
            has_school_id = False
            if pragma_result.get("rows"):
                for column in pragma_result["rows"]:
                    if column["name"] == "school_id":
                        has_school_id = True
                        break
            
            if not has_school_id:
                print(f"[warn] DEBUG: Table missing school_id column, dropping and recreating...")
                cloud_client.execute_query("DROP TABLE IF EXISTS activation_requests")
                table_check = {"rows": []}  # Force recreation
        
        if not table_check.get("rows"):
            print(f"[warn] DEBUG: Creating activation_requests table with correct structure...")
            
            # Create the table with ALL required columns including school_id and admin_id
            create_table_sql = """
                CREATE TABLE IF NOT EXISTS activation_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_name TEXT NOT NULL,
                    school_email TEXT NOT NULL,
                    admin_name TEXT NOT NULL,
                    admin_email TEXT NOT NULL,
                    machine_fingerprint TEXT NOT NULL,
                    request_time TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    school_id INTEGER,
                    admin_id INTEGER,
                    activation_code TEXT,
                    approved_by TEXT,
                    approved_at TEXT,
                    expires_at TEXT,
                    notes TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
             
                )
            """
            create_result = cloud_client.execute_query(create_table_sql)
            print(f"[debug] DEBUG: Table creation result: {create_result}")
            
            if not create_result.get("success"):
                print(f"[ERROR] DEBUG: Failed to create activation_requests table!")
                local_errors.append("Could not create activation_requests table in cloud")
                activation_request_id = None
            else:
                print(f"[ok] DEBUG: Successfully created activation_requests table with all columns")
        
        # Insert activation request with all fields
        print(f"[debug] DEBUG: Attempting to insert activation request...")
        
        insert_sql = """
            INSERT INTO activation_requests 
            (school_name, school_email, admin_name, admin_email, 
             machine_fingerprint, request_time, status, school_id, admin_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        insert_params = (
            req.school_name,
            req.school_email,
            admin_full_name,
            req.admin_email,
            machine_fingerprint,
            current_time,
            "pending",
            school_id,
            admin_id,
            current_time,
        
        )
        
        print(f"[debug] DEBUG: Insert SQL: {insert_sql}")
        print(f"[debug] DEBUG: Insert params: {insert_params}")
        
        # Execute the insert
        insert_result = cloud_client.execute_query(insert_sql, insert_params)
        print(f"[debug] DEBUG: Insert result: {insert_result}")
        
        activation_request_id = None
        
        if insert_result.get("success"):
            # Get the last inserted ID
            id_query = "SELECT last_insert_rowid() as id"
            id_result = cloud_client.execute_query(id_query)
            print(f"[debug] DEBUG: Last insert ID result: {id_result}")
            
            if id_result.get("success") and id_result.get("rows"):
                activation_request_id = id_result["rows"][0]["id"]
                print(f"[ok] DEBUG: ✓ Activation request inserted with ID: {activation_request_id}")
                
                # Verify the insertion
                verify_query = "SELECT * FROM activation_requests WHERE id = ?"
                verify_result = cloud_client.execute_query(verify_query, (activation_request_id,))
                print(f"[debug] DEBUG: Verification result: {verify_result}")
                
                if verify_result.get("success") and verify_result.get("rows"):
                    print(f"[ok] DEBUG: ✓ Verified activation request in cloud")
                    print(f"  ID: {verify_result['rows'][0]['id']}")
                    print(f"  School: {verify_result['rows'][0]['school_name']}")
                    print(f"  Admin: {verify_result['rows'][0]['admin_name']}")
                    print(f"  Fingerprint: {verify_result['rows'][0]['machine_fingerprint'][:16]}...")
                    print(f"  Status: {verify_result['rows'][0]['status']}")
                    print(f"  School ID: {verify_result['rows'][0]['school_id']}")
                    print(f"  Admin ID: {verify_result['rows'][0]['admin_id']}")
                else:
                    print(f"[ERROR] DEBUG: ✗ Could not verify insertion")
            else:
                print(f"[ERROR] DEBUG: ✗ Could not get last insert ID: {id_result}")
        else:
            print(f"[ERROR] DEBUG: ✗ Insert failed: {insert_result.get('error')}")
            print(f"[ERROR] DEBUG: Full error: {insert_result}")
            local_errors.append(f"Failed to create activation request: {insert_result.get('error')}")
        
        # Final status
        if activation_request_id:
            print(f"[ok] DEBUG: ===== ACTIVATION REQUEST SUCCESSFULLY INSERTED =====")
            print(f"  Request ID: {activation_request_id}")
            print(f"  Fingerprint: {machine_fingerprint[:16]}...")
            print(f"  School: {req.school_name}")
            print(f"  Admin: {admin_full_name}")
        else:
            print(f"[ERROR] DEBUG: ===== ACTIVATION REQUEST INSERTION FAILED =====")
            print(f"  All insertion attempts failed")
            local_errors.append("Failed to create activation request in cloud")
        
        print(f"[debug] DEBUG: ===== COMPLETED ACTIVATION REQUEST INSERTION =====")
        
        # ===== 6. FINAL CONFIRMATION =====
        print(f"[debug] DEBUG: Final confirmation...")
        
        # Simple count check
        school_count = cloud_client.execute_query(
            "SELECT COUNT(*) as count FROM school_installations WHERE id = ?",
            (school_id,)
        )
        
        admin_count = cloud_client.execute_query(
            "SELECT COUNT(*) as count FROM admin_table WHERE id = ? AND school_id = ?",
            (admin_id, school_id)
        )
        
        if (not school_count.get("success") or 
            not admin_count.get("success") or
            school_count['rows'][0]['count'] != 1 or
            admin_count['rows'][0]['count'] != 1):
            print(f"[ERROR] DEBUG: Final count verification failed!")
            raise HTTPException(status_code=500, detail="Final verification failed")
        
        print(f"[ok] DEBUG: Setup completed successfully!")
        print(f"  School ID: {school_id}")
        print(f"  Admin ID: {admin_id}")
        print(f"  Machine Fingerprint: {machine_fingerprint[:16]}...")
        print(f"  Activation Request ID: {activation_request_id if activation_request_id else 'Failed'}")
  
        return {
            "success": True,
            "message": "School, admin, and activation request created successfully",
            "school_id": school_id,
            "admin_id": admin_id,
            "activation_request_id": activation_request_id,
            "machine_fingerprint": machine_fingerprint,
            "cloud_verified": True,
            "local_saved": {
                "school": local_school_success,
                "admin": local_admin_success,
                "activation_request": activation_request_id is not None
            },
            "warnings": local_errors if local_errors else None,
            "next_step": "pending_activation"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] ERROR in setup_school_and_admin: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Setup failed: {str(e)}")

# ============================================
# ACTIVATION ENDPOINTS
# ============================================

@app.get("/activation/status")
def activation_status():
    return {"activated": is_activated()}


@app.get("/stage/now")
def stage_now():
    """Get current setup stage"""
    school = check_school_setup_complete()
    admin = check_admin_setup_complete()
    active = is_activated()
    
    # Determine current step
    if active:
        step = "completed"
        stage = 4
        message = "Setup completed"
    elif not school:
        step = "school"
        stage = 1
        message = "School information required"
    elif not admin:
        step = "admin"
        stage = 2
        message = "Admin account required"
    else:
        step = "activation"
        stage = 3
        message = "Activation required"
    
    return {
        "success": True,
        "stage": stage,
        "step": step,
        "message": message,
        "status": {
            "school_completed": school,
            "admin_completed": admin,
            "activated": active
        },
        "requires_internet": True,
        "progress": {
            "school": 25 if school else 0,
            "admin": 50 if admin else 25 if school else 0,
            "activation": 75 if active else 50 if admin else 25 if school else 0,
            "completed": 100 if active else 75 if admin else 50 if school else 25
        }
    }  


@app.get("/activation/status/detailed")
def detailed_activation_status():
    """Get detailed activation status"""
    return check_activation_status()

@app.post("/activation/validate")
def validate_code(req: ValidateRequest):
    """Validate an activation code without activating"""
    is_valid = validate_activation_code(req.school_name, req.code)
    return {
        "valid": is_valid,
        "message": "Code is valid" if is_valid else "Invalid activation code"
    }

@app.post("/activation/expected-code")
def get_expected_code(req: ExpectedCodeRequest):
    """Get what the activation code should be for this machine + school"""
    expected = calculate_expected_code(req.school_name)
    return {
        "expected_code": expected,
        "school_name": req.school_name,
        "note": "This is for debugging. In production, codes are generated by the vendor."
    }


# With mini_settings_reset
@app.post("/activation/activate")
async def activate(req: ActivationRequest):
    """Activate the system and reset mini-settings"""
    try:
        # Check if already activated
        if is_activated():
            return {
                "success": True, 
                "message": "Already activated",
                "already_activated": True
            }
        
        # Validate activation code
        if not req.code or len(req.code) < 6:
            return {"success": False, "message": "Invalid activation code"}
        
        # Validate school name
        if not req.school_name or len(req.school_name) < 2:
            return {"success": False, "message": "School name is required"}
        
        # Check if school setup is complete
        if not check_school_setup_complete():
            return {"success": False, "message": "Please complete school setup first"}
        
        # Check if admin setup is complete
        if not check_admin_setup_complete():
            return {"success": False, "message": "Please complete admin setup first"}
        
        # Activate the system
        result = activate_system(req.code, req.school_name)
        
        if not result["success"]:
            return result
        
        # =============================================
        # CRITICAL: RESET MINI-SETTINGS HERE
        # =============================================
        try:
            # First, load current settings to preserve theme/screensaver/schoolType
            current_settings = mini_settings_service.load_settings()
            
            # Create updated settings - reset hasSeenMiniSettings to False
            updated_settings = {
                **current_settings,  # Keep existing settings
                "hasSeenMiniSettings": False,  # Reset this to False
                "lastUpdated": mini_settings_service.get_current_timestamp(),
                "resetReason": "system_activation",  # Track why it was reset
                "resetAtActivation": True  # Flag that this was reset at activation
            }
            
            # Save the updated settings
            mini_settings_service.save_all_settings(updated_settings)
            
            print("[ok] Mini-settings reset: hasSeenMiniSettings = False")
            print(f"   Settings preserved: theme={current_settings.get('theme')}, "
                  f"screensaver={current_settings.get('screensaver')}, "
                  f"schoolType={current_settings.get('schoolType')}")
            
        except Exception as settings_error:
            print(f"[warn] Could not reset mini-settings: {settings_error}")
            # Don't fail activation if settings reset fails
            # Just log it and continue
            
        # =============================================
        # END OF MINI-SETTINGS RESET
        # =============================================
        
        # Try to send activation data to cloud
        cloud_success = False
        cloud_error = None
        
        if cloud_client.check_connection(force_refresh=True):
            try:
                cloud_data = result["cloud_data"]
                
                # Update activation in SQLiteCloud
                query = "UPDATE school_installations SET activation_code = ? WHERE school_name = ?"
                cloud_client.execute_query(query, (req.code, req.school_name))
                
                cloud_success = True
                print("[ok] Activation saved to cloud database")
                
            except Exception as e:
                cloud_error = str(e)
                print(f"[warn] Cloud save failed: {e}")
        else:
            cloud_error = "Cannot connect to cloud database"
            print("[warn] Skipping cloud save (offline)")
        
        # Build success message
        message = result["message"]
        if cloud_success:
            message += " (cloud synced)"
        elif cloud_error:
            message += f" (cloud error: {cloud_error})"
        
        # Return success response
        return {
            "success": True,
            "message": message,
            "local_saved": result["local_saved"],
            "cloud_saved": cloud_success,
            "redirect_to": "/",
            "mini_settings_reset": True  # Let frontend know
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Activation failed: {str(e)}")



@app.get("/activation/machine-id")
def get_machine_id():
    """Get the machine fingerprint (for vendor to generate codes)"""
    from app.activation.fingerprint import get_or_create_machine_fingerprint
    fingerprint = get_or_create_machine_fingerprint()
    
    return {
        "machine_fingerprint": fingerprint,
        "note": "Share this with vendor to generate activation code"
    }

# ============================================
# UTILITY ENDPOINTS
# ============================================

# @app.get("/setup/status")
# async def get_setup_status():
#     """Check what step we're on"""
#     activated = is_activated()
#     school_completed = check_school_setup_complete()
#     admin_completed = check_admin_setup_complete()
    
#     # Determine current step
#     if activated:
#         current_step = "completed"
#     elif not school_completed:
#         current_step = "school"
#     elif not admin_completed:
#         current_step = "admin"
#     else:
#         current_step = "activation"
    
#     return {
#         "activated": activated,
#         "school_completed": school_completed,
#         "admin_completed": admin_completed,
#         "current_step": current_step,
#         "requires_internet": True
#     }

@app.get("/setup/status")
def get_setup_status():
    """Get the current setup status with step information"""
    try:
        # Get individual status values
        activated = is_activated()
        school_completed = check_school_setup_complete()
        admin_completed = check_admin_setup_complete()
        
        # Determine current step
        if activated:
            current_step = "completed"
        elif not school_completed:
            current_step = "school"
        elif not admin_completed:
            current_step = "admin"
        else:
            # School and admin are complete but not activated
            current_step = "activation"
        
        # Prepare the response
        status = {
            "activated": activated,
            "school_completed": school_completed,
            "admin_completed": admin_completed,
            "current_step": current_step,
            "requires_internet": True
        }
        
        # Log the status for debugging
        print(f"📊 Setup Status: activated={activated}, school={school_completed}, admin={admin_completed}, step={current_step}")
        
        return status
        
    except Exception as e:
        print(f"❌ Error getting setup status: {e}")
        # Return a safe default
        return {
            "activated": False,
            "school_completed": False,
            "admin_completed": False,
            "current_step": "school",
            "requires_internet": True
        }


import time
@app.get("/health/connectivity")
async def check_connectivity():
    """Enhanced health check with detailed diagnostics"""
    start_time = time.time()
    
    try:
        # Check database connectivity
        is_connected = cloud_client.check_connection(force_refresh=True)
        response_time = (time.time() - start_time) * 1000  # ms
        
        # Get connection stats if available
        connection_stats = {}
        if hasattr(cloud_client, 'get_connection_stats'):
            connection_stats = cloud_client.get_connection_stats()
        
        if is_connected:
            return {
                "status": "healthy",
                "online": True,
                "message": "Connected to SQLiteCloud database",
                "database": "SQLiteCloud",
                "response_time_ms": round(response_time, 2),
                "timestamp": datetime.now().isoformat(),
                "connection_stats": connection_stats
            }
        else:
            return {
                "status": "unhealthy",
                "onliney": False,
                "message": "Cannot connect to SQLiteCloud database",
                "database": "SQLiteCloud",
                "response_time_ms": round(response_time, 2),
                "timestamp": datetime.now().isoformat(),
                "error_type": "connection_failed"
            }
            
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        return {
            "status": "error",
            "online": False,
            "message": f"Connection error: {str(e)}",
            "database": "SQLiteCloud",
            "response_time_ms": round(response_time, 2),
            "timestamp": datetime.now().isoformat(),
            "error_type": type(e).__name__
        }


@app.get("/database/status")
async def database_status():
    """Check local database status"""
    try:
    
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get table count
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        # Check activation state
        cursor.execute("SELECT activated FROM activation_state WHERE id = 1")
        activation_state = cursor.fetchone()
        
        # Check counts
        cursor.execute("SELECT COUNT(*) FROM school_info")
        school_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        admin_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "exists": True,
            "table_count": len(tables),
            "activated": bool(activation_state[0]) if activation_state else False,
            "school_count": school_count,
            "admin_count": admin_count
        }
        
    except Exception as e:
        return {"error": str(e), "exists": False}
    
    
    
# ============================================
# DEVICE SYNC ENDPOINTS
# ============================================

@app.post("/sync/complete")
async def complete_sync(req: CompleteSyncRequest):
    """Complete sync: school, activation, and devices in one call"""
    try:
        # Get the data from request
        data = req.dict()
        sync_school = data.get('syncSchool', data.get('sync_school', True))
        sync_activation = data.get('syncActivation', data.get('sync_activation', True))
        sync_devices = data.get('syncDevices', data.get('sync_devices', True))
        device_batch_size = data.get('deviceBatchSize', data.get('device_batch_size', 20))
        
        print(f"[debug] DEBUG: /sync/complete endpoint called")
        print(f"[debug] DEBUG: sync_school={sync_school}, sync_activation={sync_activation}, sync_devices={sync_devices}")
        
        # Check connectivity
        if not cloud_client.check_connection(force_refresh=True):
            print("[ERROR] DEBUG: Cloud client connection check failed")
            raise HTTPException(
                status_code=503, 
                detail="Cannot connect to cloud database. Please check your internet connection."
            )
        
        print("[ok] DEBUG: Cloud connection successful")
        
        results = {
            "success": False,
            "steps": {},
            "timestamp": datetime.now().isoformat(),
            "details": {}
        }
        
        # Helper function to get school info from local DB
        def get_local_school_info():
            """Get school info from local database"""
            try:
                conn = get_db_connection()
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM school_info LIMIT 1")
                row = cursor.fetchone()
                conn.close()
                return dict(row) if row else None
            except Exception as e:
                print(f"[ERROR] DEBUG: Error getting school info: {e}")
                return None
        
        # Helper function to get activation data from local DB
        def get_local_activation_data():
            """Get activation data from local database"""
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM activation_state WHERE id = 1")
                activation_state = cursor.fetchone()
                conn.close()
                return activation_state
            except Exception as e:
                print(f"[ERROR] DEBUG: Error getting activation data: {e}")
                return None
        
        # Variables to share between steps
        school_info = None
        school_id = None
        school_success = False
        school_message = ""
        
        # STEP 1: Sync school to school_installations table
        if sync_school:
            try:
                print("[debug] DEBUG: Starting school sync...")
                
                # Get school info from local
                school_info = get_local_school_info()
                
                if not school_info:
                    school_message = "No school info found locally"
                    print(f"[ERROR] DEBUG: {school_message}")
                else:
                    school_name = school_info.get("school_name")
                    school_email = school_info.get("email")
                    school_contact = school_info.get("phone")
                    county = school_info.get("county")
                    region = school_info.get("region")
                    city = school_info.get("city")
                    town = school_info.get("town")
                    gps_address = school_info.get("gps_address")
                    
                    # Check if school exists in cloud
                    existing_school = cloud_client.execute_query(
                        "SELECT * FROM school_installations WHERE school_name = ? OR school_email = ?",
                        (school_name, school_email)
                    )
                    
                    if existing_school.get("rows"):
                        # School exists
                        school_id = existing_school["rows"][0]["id"]
                        school_message = f"School already exists in cloud (ID: {school_id})"
                        school_success = True
                        print(f"[ok] DEBUG: {school_message}")
                    else:
                        # Create new school in school_installations table
                        insert_result = cloud_client.execute_query("""
                            INSERT INTO school_installations 
                            (school_name, school_email, school_contact, county, region, 
                             city, town, gps_address, created_at) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            school_name, school_email, school_contact, 
                            county, region, city, town, gps_address,
                            datetime.now().isoformat()
                        ))
                        
                        if insert_result.get("success"):
                            # Get the new school ID
                            school_result = cloud_client.execute_query(
                                "SELECT id FROM school_installations WHERE school_email = ?",
                                (school_email,)
                            )
                            
                            if school_result.get("rows"):
                                school_id = school_result["rows"][0]["id"]
                                school_message = f"School created in cloud (ID: {school_id})"
                                school_success = True
                                print(f"[ok] DEBUG: {school_message}")
                            else:
                                school_message = "School created but failed to get ID"
                                print(f"[ERROR] DEBUG: {school_message}")
                        else:
                            school_message = "Failed to create school in cloud"
                            print(f"[ERROR] DEBUG: {school_message}")
                
                results["steps"]["school"] = {
                    "success": school_success,
                    "message": school_message,
                    "school_id": school_id
                }
                
            except Exception as e:
                error_msg = f"School sync error: {str(e)}"
                print(f"[ERROR] DEBUG: {error_msg}")
                results["steps"]["school"] = {
                    "success": False,
                    "message": error_msg
                }
        
        # STEP 2: Sync activation data
        activation_success = False
        activation_code = None
        activation_message = ""
        
        if sync_activation:
            try:
                print("[debug] DEBUG: Starting activation sync...")
                
                # Get activation data from local
                activation_state = get_local_activation_data()
                
                if not activation_state or len(activation_state) < 3:
                    activation_message = "No activation data found locally"
                    print(f"[ERROR] DEBUG: {activation_message}")
                else:
                    activation_code = activation_state[2] if len(activation_state) > 2 else ""
                    
                    if not activation_code:
                        activation_message = "No activation code found"
                        print(f"[ERROR] DEBUG: {activation_message}")
                    else:
                        # Get school info if not already fetched
                        if not school_info:
                            school_info = get_local_school_info()
                        
                        if not school_info:
                            activation_message = "No school info found for activation"
                            print(f"[ERROR] DEBUG: {activation_message}")
                        else:
                            school_email = school_info.get("email")
                            
                            # Get device name from local devices table
                            device_name = "Default Device"
                            try:
                                conn = get_db_connection()
                                cursor = conn.cursor()
                                cursor.execute("SELECT device_name FROM devices LIMIT 1")
                                device_result = cursor.fetchone()
                                conn.close()
                                
                                if device_result and device_result[0]:
                                    device_name = device_result[0]
                            except Exception as e:
                                print(f"[warn] DEBUG: Could not get device name: {e}")
                            
                            # Update school_installations with activation code and device_name
                            update_result = cloud_client.execute_query("""
                                UPDATE school_installations 
                                SET activation_code = ?, 
                                    device_name = ?
                                WHERE school_email = ?
                            """, (
                                activation_code,
                                device_name,
                                school_email
                            ))
                            
                            if update_result.get("success"):
                                activation_success = True
                                activation_message = f"Activation data synced (Code: {activation_code})"
                                print(f"[ok] DEBUG: {activation_message}")
                            else:
                                activation_message = "Failed to update activation in cloud"
                                print(f"[ERROR] DEBUG: {activation_message}")
                
                results["steps"]["activation"] = {
                    "success": activation_success,
                    "message": activation_message,
                    "activation_code": activation_code
                }
                
            except Exception as e:
                error_msg = f"Activation sync error: {str(e)}"
                print(f"[ERROR] DEBUG: {error_msg}")
                results["steps"]["activation"] = {
                    "success": False,
                    "message": error_msg
                }
        
        # STEP 3: Sync devices - REPLACE device per school with history tracking
        devices_success = False
        devices_synced = 0
        devices_failed = 0
        devices_message = ""
        device_history_entries = 0
        
        if sync_devices:
            try:
                print("[debug] DEBUG: Starting devices sync (REPLACE mode with history)...")
                
                # Get school info if not already fetched
                if not school_info:
                    school_info = get_local_school_info()
                
                if not school_info:
                    devices_message = "No school info available - cannot sync devices"
                    devices_success = False
                    print(f"[ERROR] DEBUG: {devices_message}")
                else:
                    school_name = school_info.get("school_name")
                    school_email = school_info.get("email")
                    
                    print(f"[debug] DEBUG: Syncing devices for school: {school_name} ({school_email})")
                    
                    # Get devices from local DB
                    conn = get_db_connection()
                    conn.row_factory = sqlite3.Row
                    cursor = conn.cursor()
                    
                    # Check table structure
                    cursor.execute("PRAGMA table_info(devices)")
                    columns_info = cursor.fetchall()
                    column_names = [col[1] for col in columns_info]
                    has_sync_column = "cloud_sync_status" in column_names
                    
                    # Get devices that need syncing
                    if has_sync_column:
                        print("[debug] DEBUG: cloud_sync_status column exists")
                        cursor.execute("""
                            SELECT * FROM devices 
                            WHERE cloud_sync_status IN ('pending', 'failed') 
                               OR cloud_sync_status IS NULL
                            LIMIT ?
                        """, (device_batch_size,))
                    else:
                        print("[debug] DEBUG: cloud_sync_status column does NOT exist, syncing all devices")
                        cursor.execute("SELECT * FROM devices LIMIT ?", (device_batch_size,))
                    
                    devices = [dict(row) for row in cursor.fetchall()]
                    conn.close()
                    
                    print(f"[debug] DEBUG: Found {len(devices)} devices to sync")
                    
                    if not devices:
                        devices_message = "No devices need syncing (all already synced or no pending devices)"
                        devices_success = True
                        print(f"[ok] DEBUG: {devices_message}")
                    else:
                        successful = 0
                        failed = 0
                        history_created = 0
                        
                        for device in devices:
                            device_id = device.get("device_id")
                            print(f"[debug] DEBUG: Processing device: {device_id} for school {school_name}")
                            
                            try:
                                # Prepare device data for cloud
                                device_data = {
                                    "device_id": device_id,
                                    "device_name": device.get("device_name", "Unknown Device"),
                                    "device_type": device.get("device_type", "unknown"),
                                    "os_name": device.get("os_name", "Unknown OS"),
                                    "os_version": device.get("os_version", "1.0"),
                                    "activation_key": device.get("activation_key"),
                                    "activation_status": device.get("activation_status", "pending"),
                                    "activation_token_hash": device.get("activation_token_hash"),
                                    "license_type": device.get("license_type", "STANDARD"),
                                    "activated_at": device.get("activated_at"),
                                    "license_valid_until": device.get("license_valid_until"),
                                    "last_license_check": device.get("last_license_check"),
                                    "last_activated_at": device.get("last_activated_at"),
                                    "registered_at": device.get("registered_at") or datetime.now().isoformat(),
                                    "created_at": device.get("created_at") or datetime.now().isoformat(),
                                    "updated_at": datetime.now().isoformat(),
                                    "cloud_sync_status": "synced",
                                    "last_sync_at": datetime.now().isoformat(),
                                    "sync_attempts": 1,
                                    "school_name": school_name,
                                    "school_email": school_email
                                }
                                
                                # Add user info if available
                                user_id = device.get("user_id")
                                if user_id:
                                    try:
                                        user_conn = get_db_connection()
                                        user_conn.row_factory = sqlite3.Row
                                        user_cursor = user_conn.cursor()
                                        user_cursor.execute("SELECT email, unique_id FROM users WHERE id = ?", (user_id,))
                                        user = user_cursor.fetchone()
                                        user_conn.close()
                                        
                                        if user:
                                            device_data["local_user_id"] = user_id
                                            device_data["local_user_email"] = user["email"]
                                            device_data["local_user_unique_id"] = user["unique_id"]
                                    except Exception as e:
                                        print(f"[warn] DEBUG: Could not get user info for device {device_id}: {e}")
                                
                                # Check if a device already exists for this school
                                existing_device = cloud_client.execute_query(
                                    "SELECT device_id, device_name, device_type, os_name, os_version, activation_status, sync_attempts FROM devices WHERE school_email = ?",
                                    (school_email,)
                                )
                                
                                if existing_device.get("rows"):
                                    # Device exists for this school - UPDATE all fields (except school info)
                                    old_device = existing_device["rows"][0]
                                    old_device_id = old_device["device_id"]
                                    existing_sync_attempts = old_device.get("sync_attempts", 0)
                                    
                                    print(f"[debug] DEBUG: Found existing device {old_device_id} for school {school_name}")
                                    print(f"[debug] DEBUG: Updating all device fields for school {school_name}")
                                    print(f"[debug] DEBUG: Old device_id: {old_device_id}, New device_id: {device_id}")
                                    
                                    # Create device history entry before updating
                                    try:
                                        history_result = cloud_client.execute_query("""
                                            INSERT INTO device_history 
                                            (school_email, old_device_id, new_device_id, old_device_name, 
                                             new_device_name, old_device_type, new_device_type, old_os_name,
                                             new_os_name, old_os_version, new_os_version, old_activation_status,
                                             new_activation_status, device_replaced_at, reason)
                                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                        """, (
                                            school_email,
                                            old_device_id,
                                            device_id,
                                            old_device.get("device_name", "Unknown"),
                                            device_data["device_name"],
                                            old_device.get("device_type", "unknown"),
                                            device_data["device_type"],
                                            old_device.get("os_name", "Unknown"),
                                            device_data["os_name"],
                                            old_device.get("os_version", "1.0"),
                                            device_data["os_version"],
                                            old_device.get("activation_status", "pending"),
                                            device_data["activation_status"],
                                            datetime.now().isoformat(),
                                            "device_replacement_sync"
                                        ))
                                        
                                        if history_result.get("success"):
                                            history_created += 1
                                            print(f"[ok] DEBUG: Created device history entry for replacement: {old_device_id} -> {device_id}")
                                        else:
                                            print(f"[warn] DEBUG: Failed to create device history entry: {history_result.get('error')}")
                                    except Exception as e:
                                        print(f"[warn] DEBUG: Error creating device history: {e}")
                                    
                                    # DELETE the old device and INSERT the new one
                                    # This handles the UNIQUE constraint on device_id
                                    print(f"[debug] DEBUG: Deleting old device {old_device_id} and inserting new device {device_id}")
                                    
                                    # First, delete the old device
                                    delete_result = cloud_client.execute_query(
                                        "DELETE FROM devices WHERE school_email = ?",
                                        (school_email,)
                                    )
                                    
                                    if not delete_result.get("success"):
                                        print(f"[ERROR] DEBUG: Failed to delete old device {old_device_id}: {delete_result.get('error')}")
                                        failed += 1
                                        continue
                                    
                                    print(f"[ok] DEBUG: Deleted old device {old_device_id} for school {school_name}")
                                    
                                    # Now INSERT the new device
                                    result = cloud_client.execute_query("""
                                        INSERT INTO devices 
                                        (device_id, school_name, school_email, device_name, device_type,
                                         os_name, os_version, activation_key, activation_status, activation_token_hash,
                                         license_type, activated_at, license_valid_until, last_license_check,
                                         last_activated_at, registered_at, created_at, updated_at,
                                         local_user_id, local_user_email, local_user_unique_id,
                                         cloud_sync_status, last_sync_at, sync_attempts)
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                    """, (
                                        device_data["device_id"],
                                        device_data["school_name"],
                                        device_data["school_email"],
                                        device_data["device_name"],
                                        device_data["device_type"],
                                        device_data["os_name"],
                                        device_data["os_version"],
                                        device_data["activation_key"],
                                        device_data["activation_status"],
                                        device_data["activation_token_hash"],
                                        device_data["license_type"],
                                        device_data["activated_at"],
                                        device_data["license_valid_until"],
                                        device_data["last_license_check"],
                                        device_data["last_activated_at"],
                                        device_data["registered_at"],
                                        device_data["created_at"],
                                        device_data["updated_at"],
                                        device_data.get("local_user_id"),
                                        device_data.get("local_user_email"),
                                        device_data.get("local_user_unique_id"),
                                        device_data["cloud_sync_status"],
                                        device_data["last_sync_at"],
                                        existing_sync_attempts + 1  # Increment sync attempts from old device
                                    ))
                                    
                                else:
                                    # No device exists for this school - INSERT new
                                    print(f"[debug] DEBUG: No existing device for school {school_name}, inserting new device {device_id}")
                                    
                                    result = cloud_client.execute_query("""
                                        INSERT INTO devices 
                                        (device_id, school_name, school_email, device_name, device_type,
                                         os_name, os_version, activation_key, activation_status, activation_token_hash,
                                         license_type, activated_at, license_valid_until, last_license_check,
                                         last_activated_at, registered_at, created_at, updated_at,
                                         local_user_id, local_user_email, local_user_unique_id,
                                         cloud_sync_status, last_sync_at, sync_attempts)
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                    """, (
                                        device_data["device_id"],
                                        device_data["school_name"],
                                        device_data["school_email"],
                                        device_data["device_name"],
                                        device_data["device_type"],
                                        device_data["os_name"],
                                        device_data["os_version"],
                                        device_data["activation_key"],
                                        device_data["activation_status"],
                                        device_data["activation_token_hash"],
                                        device_data["license_type"],
                                        device_data["activated_at"],
                                        device_data["license_valid_until"],
                                        device_data["last_license_check"],
                                        device_data["last_activated_at"],
                                        device_data["registered_at"],
                                        device_data["created_at"],
                                        device_data["updated_at"],
                                        device_data.get("local_user_id"),
                                        device_data.get("local_user_email"),
                                        device_data.get("local_user_unique_id"),
                                        device_data["cloud_sync_status"],
                                        device_data["last_sync_at"],
                                        device_data["sync_attempts"]
                                    ))
                                
                                if result.get("success"):
                                    successful += 1
                                    print(f"[ok] DEBUG: Device {device_id} synced for school {school_name}")
                                    
                                    # Update local sync status
                                    try:
                                        update_conn = get_db_connection()
                                        update_cursor = update_conn.cursor()
                                        update_cursor.execute("""
                                            UPDATE devices 
                                            SET cloud_sync_status = 'synced',
                                                last_sync_attempt = ?,
                                                sync_attempts = COALESCE(sync_attempts, 0) + 1
                                            WHERE id = ?
                                        """, (datetime.now().isoformat(), device.get("id")))
                                        update_conn.commit()
                                        update_conn.close()
                                        print(f"[ok] DEBUG: Updated local sync status for device {device_id}")
                                    except Exception as e:
                                        print(f"[warn] DEBUG: Could not update local sync status for {device_id}: {e}")
                                else:
                                    failed += 1
                                    error_detail = result.get('error', 'Unknown error')
                                    print(f"[ERROR] DEBUG: Failed to sync device {device_id}: {error_detail}")
                                    
                            except Exception as e:
                                print(f"[ERROR] DEBUG: Error processing device {device_id}: {e}")
                                import traceback
                                traceback.print_exc()
                                failed += 1
                        
                        devices_synced = successful
                        devices_failed = failed
                        device_history_entries = history_created
                        devices_success = successful > 0 or (successful == 0 and failed == 0)
                        devices_message = f"Synced {successful} devices, failed {failed} for school {school_name}, created {history_created} history entries"
                        
                        # DEBUG: Check if devices are now in cloud
                        if successful > 0:
                            try:
                                check_result = cloud_client.execute_query("SELECT COUNT(*) as count FROM devices WHERE school_email = ?", (school_email,))
                                if check_result.get("success") and check_result.get("rows"):
                                    count = check_result['rows'][0]['count']
                                    print(f"[ok] DEBUG: School {school_name} now has {count} device(s) in cloud")
                            except Exception as e:
                                print(f"[warn] DEBUG: Could not check cloud devices count: {e}")
                
                print(f"[ok] DEBUG: Devices sync result: {devices_message}")
                
                results["steps"]["devices"] = {
                    "success": devices_success,
                    "message": devices_message,
                    "synced": devices_synced,
                    "failed": devices_failed,
                    "history_entries": device_history_entries,
                    "school_name": school_name if school_info else None,
                    "school_email": school_email if school_info else None
                }
                
            except Exception as e:
                error_msg = f"Devices sync error: {str(e)}"
                print(f"[ERROR] DEBUG: {error_msg}")
                import traceback
                traceback.print_exc()
                results["steps"]["devices"] = {
                    "success": False,
                    "message": error_msg,
                    "synced": 0,
                    "failed": 0,
                    "history_entries": 0
                }
        
        # Determine overall success
        all_steps = results.get("steps", {})
        successful_steps = sum(1 for step in all_steps.values() if step.get("success"))
        
        results["success"] = successful_steps > 0
        
        # Calculate sync summary
        results["summary"] = {
            "total_steps": len(all_steps),
            "successful_steps": successful_steps,
            "failed_steps": len(all_steps) - successful_steps,
            "total_devices_synced": devices_synced,
            "device_history_entries": device_history_entries
        }
        
        print(f"[ok] DEBUG: Complete sync finished with success: {results['success']}")
        print(f"[ok] DEBUG: Summary: {successful_steps}/{len(all_steps)} steps successful")
        
        return results
        
    except HTTPException as he:
        print(f"[ERROR] HTTP Exception in /sync/complete: {he.detail}")
        raise
    except Exception as e:
        print(f"[ERROR] Exception in /sync/complete: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Complete sync failed: {str(e)}")


# ============================================
# DEVICE SYNC ENDPOINTS - UPDATED WITH BETTER ERROR HANDLING
# ============================================

@app.get("/sync/status")
async def get_sync_status():
    """Get current sync status"""
    try:
        summary = sync_manager.get_sync_summary()
        online = cloud_client.check_connection(force_refresh=True)
        
        return {
            "online": online,
            "sync_summary": summary,
            "cloud_connected": online,
            "last_checked": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sync status: {str(e)}")


@app.post("/devices/register")
async def register_device(req: DeviceRegistrationRequest):
    """Register a new device locally and sync to cloud"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if device already exists
        cursor.execute("SELECT id FROM devices WHERE device_id = ?", (req.device_id,))
        existing = cursor.fetchone()
        
        if existing:
            conn.close()
            raise HTTPException(status_code=400, detail="Device already registered")
        
        # Insert into local database
        cursor.execute("""
            INSERT INTO devices 
            (device_id, device_name, device_type, os_name, os_version, 
             activation_key, user_id, registered_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            req.device_id,
            req.device_name,
            req.device_type,
            req.os_name,
            req.os_version,
            req.activation_key,
            req.user_id,
            datetime.now().isoformat(),
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        device_id = cursor.lastrowid
        conn.commit()
        
        # Get the newly inserted device
        cursor.execute("SELECT * FROM devices WHERE id = ?", (device_id,))
        device_row = cursor.fetchone()
        
        # Convert to dict
        column_names = [description[0] for description in cursor.description]
        device_dict = dict(zip(column_names, device_row))
        
        conn.close()
        
        # Try to sync to cloud if online
        cloud_synced = False
        cloud_message = "Offline - will sync later"
        
        if cloud_client.check_connection(force_refresh=True):
            sync_result = sync_manager.sync_single_device(device_dict)
            cloud_synced = sync_result.get("success", False)
            cloud_message = sync_result.get("message", "Unknown error")
        
        return {
            "success": True,
            "message": "Device registered successfully",
            "local_device_id": device_id,
            "device_identifier": req.device_id,
            "cloud_synced": cloud_synced,
            "cloud_message": cloud_message,
            "next_step": "activation" if not req.activation_key else "complete"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register device: {str(e)}")

@app.get("/devices/local")
async def get_local_devices(limit: int = 100, offset: int = 0):
    """Get all devices from local database"""
    try:
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT d.*, u.email as user_email
            FROM devices d
            LEFT JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        
        devices = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "success": True,
            "count": len(devices),
            "devices": devices
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get local devices: {str(e)}")

@app.get("/devices/cloud")
async def get_cloud_devices():
    """Get devices from cloud database for this school"""
    try:
        if not cloud_client.check_connection(force_refresh=True):
            raise HTTPException(status_code=503, detail="Cannot connect to cloud database")
        
        # Get school info to filter devices
        school_info = sync_manager.get_school_info()
        
        if not school_info:
            return {"success": False, "message": "No school info found", "devices": []}
        
        school_name = school_info.get("school_name")
        
        if not school_name:
            return {"success": False, "message": "School name not found", "devices": []}
        
        # Query cloud devices for this school
        result = cloud_client.execute_query(
            "SELECT * FROM devices WHERE school_name = ? ORDER BY created_at DESC",
            (school_name,)
        )
        
        if result.get("success"):
            return {
                "success": True,
                "count": len(result.get("rows", [])),
                "devices": result.get("rows", [])
            }
        else:
            return {
                "success": False,
                "message": "Failed to fetch devices from cloud",
                "devices": []
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cloud devices: {str(e)}")
@app.get("/health/test")
async def health_test():
    """Simple health check endpoint"""
    return {
        "status": "ok",
        "service": "school-management-system",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "sync_devices": "POST /sync/devices",
            "register_device": "POST /devices/register",
            "sync_status": "GET /sync/status",
            "health_connectivity": "GET /health/connectivity"
        }
    }
    
    
    
# @app.post("/recovery/import")
# async def import_recovery(req: RecoveryImportRequest):
#     """
#     Import encrypted recovery blob from cloud.
#     This WILL wipe local data and force reactivation.
#     """
#     try:
#         payload = decrypt_recovery_blob(
#             req.encrypted_backup,
#             req.school_email
#         )

#         validate_recovery_payload(payload)

#         conn = get_db_connection()

#         wipe_local_database(conn)
#         import_school_from_recovery(conn, payload["school"])
#         import_admins_from_recovery(conn, payload["admins"])
#         reset_activation_state(conn)

#         conn.commit()
#         conn.close()

#         return {
#             "success": True,
#             "message": "Recovery completed successfully",
#             "admins_imported": len(payload["admins"]),
#             "system_activated": False,
#             "next_step": "activation_required"
#         }

#     except Exception as e:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Recovery failed: {str(e)}"
#         )
import sys

@app.post("/recovery/import")
async def import_recovery(req: RecoveryImportRequest):
    """
    Import encrypted recovery blob from cloud.
    This WILL wipe local data and force reactivation.
    """
    import sys
    from datetime import datetime
    import traceback
    import json
    
    # Open log file in append mode
    import os
    print(f"📝 Current working directory: {os.getcwd()}", flush=True)
    print(f"📝 Script directory: {os.path.dirname(os.path.abspath(__file__))}", flush=True)
    log_file = open('recovery_import.log', 'a', encoding='utf-8')
    
    def log_to_file(message):
        """Write message to log file with timestamp"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        log_file.write(f"{timestamp} - {message}\n")
        log_file.flush()  # Force write to disk immediately
    
    try:
        log_to_file("\n🔍 ===== RECOVERY IMPORT STARTED =====")
        log_to_file(f"🔍 School email: {req.school_email}")
        log_to_file(f"🔍 Encrypted blob length: {len(req.encrypted_backup) if req.encrypted_backup else 0}")
        log_to_file(f"🔍 Blob preview: {req.encrypted_backup[:100] if req.encrypted_backup else 'None'}...")
        
        # Step 1: Decrypt the blob
        log_to_file("🔍 Step 1: Decrypting recovery blob...")
        try:
            payload = decrypt_recovery_blob(
                req.encrypted_backup,
                req.school_email
            )
            log_to_file(f"✅ Blob decrypted successfully")
            log_to_file(f"🔍 Payload schema version: {payload.get('schema_version')}")
            log_to_file(f"🔍 Payload issued at: {payload.get('issued_at')}")
            log_to_file(f"🔍 School data: {payload.get('school', {}).get('school_name')}")
            log_to_file(f"🔍 Admins count: {len(payload.get('admins', []))}")
        except Exception as decrypt_error:
            error_msg = f"❌ Decryption failed: {decrypt_error}"
            log_to_file(error_msg)
            log_to_file(f"❌ Decryption error type: {type(decrypt_error)}")
            traceback.print_exc(file=log_file)
            log_file.close()
            raise HTTPException(
                status_code=400,
                detail=f"Decryption failed: {str(decrypt_error)}"
            )

        # Step 2: Validate payload
        log_to_file("🔍 Step 2: Validating recovery payload...")
        try:
            validate_recovery_payload(payload)
            log_to_file(f"✅ Payload validation passed")
        except Exception as validate_error:
            log_to_file(f"❌ Validation failed: {validate_error}")
            log_to_file(f"❌ Validation error type: {type(validate_error)}")
            traceback.print_exc(file=log_file)
            log_file.close()
            raise HTTPException(
                status_code=400,
                detail=f"Validation failed: {str(validate_error)}"
            )

        # Step 3: Get database connection
        log_to_file("🔍 Step 3: Connecting to local database...")
        try:
            conn = get_db_connection()
            log_to_file(f"✅ Database connection established")
        except Exception as db_error:
            log_to_file(f"❌ Database connection failed: {db_error}")
            log_to_file(f"❌ DB error type: {type(db_error)}")
            traceback.print_exc(file=log_file)
            log_file.close()
            raise HTTPException(
                status_code=500,
                detail=f"Database connection failed: {str(db_error)}"
            )

        # Step 4: Wipe local database
        log_to_file("🔍 Step 4: Wiping local database...")
        try:
            wipe_local_database(conn)
            log_to_file(f"✅ Local database wiped successfully")
        except Exception as wipe_error:
            log_to_file(f"❌ Failed to wipe database: {wipe_error}")
            log_to_file(f"❌ Wipe error type: {type(wipe_error)}")
            traceback.print_exc(file=log_file)
            conn.rollback()
            conn.close()
            log_file.close()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to wipe database: {str(wipe_error)}"
            )

        # Step 5: Import school
        log_to_file("🔍 Step 5: Importing school data...")
        log_to_file(f"🔍 School data to import: {json.dumps(payload['school'], default=str)}")
        try:
            import_school_from_recovery(conn, payload["school"])
            log_to_file(f"✅ School imported successfully")
        except Exception as school_error:
            log_to_file(f"❌ Failed to import school: {school_error}")
            log_to_file(f"❌ School error type: {type(school_error)}")
            traceback.print_exc(file=log_file)
            conn.rollback()
            conn.close()
            log_file.close()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to import school: {str(school_error)}"
            )

        # Step 6: Import admins
        log_to_file("🔍 Step 6: Importing admin data...")
        log_to_file(f"🔍 Admin data to import: {json.dumps(payload['admins'], default=str)}")
        try:
            import_admins_from_recovery(conn, payload["admins"])
            log_to_file(f"✅ {len(payload['admins'])} admins imported successfully")
            for i, admin in enumerate(payload['admins']):
                log_to_file(f"  Admin {i+1}: {admin.get('email', 'No email')}")
        except Exception as admin_error:
            log_to_file(f"❌ Failed to import admins: {admin_error}")
            log_to_file(f"❌ Admin error type: {type(admin_error)}")
            traceback.print_exc(file=log_file)
            conn.rollback()
            conn.close()
            log_file.close()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to import admins: {str(admin_error)}"
            )

        # Step 7: Reset activation state
        log_to_file("🔍 Step 7: Resetting activation state...")
        try:
            reset_activation_state(conn)
            log_to_file(f"✅ Activation state reset")
        except Exception as activation_error:
            log_to_file(f"❌ Failed to reset activation: {activation_error}")
            log_to_file(f"❌ Activation error type: {type(activation_error)}")
            traceback.print_exc(file=log_file)
            conn.rollback()
            conn.close()
            log_file.close()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to reset activation: {str(activation_error)}"
            )

        # Step 8: Commit transaction
        log_to_file("🔍 Step 8: Committing transaction...")
        try:
            conn.commit()
            log_to_file(f"✅ Transaction committed successfully")
        except Exception as commit_error:
            log_to_file(f"❌ Failed to commit: {commit_error}")
            log_to_file(f"❌ Commit error type: {type(commit_error)}")
            traceback.print_exc(file=log_file)
            conn.rollback()
            conn.close()
            log_file.close()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to commit transaction: {str(commit_error)}"
            )

        conn.close()
        log_to_file(f"✅ Database connection closed")

        # Prepare response
        response = {
            "success": True,
            "message": "Recovery completed successfully",
            "admins_imported": len(payload["admins"]),
            "system_activated": False,
            "next_step": "activation_required"
        }
        
        log_to_file(f"✅ Response: {json.dumps(response)}")
        log_to_file(f"🔍 ===== RECOVERY IMPORT COMPLETED SUCCESSFULLY =====\n")
        
        # Close log file before returning
        log_file.close()
        return response

    except HTTPException:
        # Make sure to close log file before re-raising
        log_file.close()
        raise
    except Exception as e:
        log_to_file(f"❌ Unhandled exception: {e}")
        log_to_file(f"❌ Exception type: {type(e)}")
        log_to_file(f"❌ Exception args: {e.args}")
        traceback.print_exc(file=log_file)
        log_file.close()
        raise HTTPException(
            status_code=400,
            detail=f"Recovery failed: {str(e)}"
        )

  
    
@app.get("/devices/{device_id}/sync")
async def sync_single_device(device_id: str):
    """Sync a specific device by device_id"""
    try:
        if not cloud_client.check_connection(force_refresh=True):
            raise HTTPException(status_code=503, detail="Cannot connect to cloud database")
        
        # Get device from local DB
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM devices WHERE device_id = ?", (device_id,))
        device = cursor.fetchone()
        conn.close()
        
        if not device:
            raise HTTPException(status_code=404, detail="Device not found locally")
        
        # Sync to cloud
        result = sync_manager.sync_single_device(dict(device))
        
        return {
            "success": result.get("success", False),
            "message": result.get("message", "Sync completed"),
            "device_id": device_id,
            "action": result.get("action", "unknown")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync device: {str(e)}")




@app.on_event("shutdown")
def shutdown_event():
    """Clean up connections on shutdown"""
    cloud_client.close()