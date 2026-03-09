
        
        
        # app/activation/activation_service.py - Updated version
from .fingerprint import get_or_create_machine_fingerprint
from .state import mark_activated, is_activated, get_activation_info
from app.crypto.kdf import derive_db_key
from pathlib import Path
import hashlib
import sqlite3
from datetime import datetime
from typing import Dict, Any

# CRITICAL: Must match vendor_tool.py
APP_SALT = "YOUR_SECRET_APP_SALT_HERE"
CLOUD_SALT = "YOUR_CLOUD_SALT_HERE"

# ============================================
# DATABASE CONNECTION
# ============================================

def get_db_connection():
    """Get SQLite connection from state.py (row_factory enabled)"""
    from app.activation import state
    try:
        conn = state.get_db_connection()
        return conn
    except Exception as e:
        raise ConnectionError(f"Failed to connect to database: {e}")

# ============================================
# HASH FUNCTIONS
# ============================================

def hash_for_local(data: str) -> str:
    """Hash for local storage using APP_SALT"""
    return hashlib.sha256((data + APP_SALT).encode()).hexdigest()

def hash_for_cloud(data: str) -> str:
    """Hash for cloud storage using CLOUD_SALT"""
    return hashlib.sha512((data + CLOUD_SALT).encode()).hexdigest()

# ============================================
# ACTIVATION CODE CALCULATION & VALIDATION
# ============================================

def calculate_expected_code(school_name: str) -> str:
    """Compute the activation code expected for this machine + school"""
    try:
        fingerprint = get_or_create_machine_fingerprint()
        raw = fingerprint + school_name + APP_SALT
        return hashlib.sha256(raw.encode()).hexdigest()[:12].upper()
    except Exception as e:
        print(f"[ERROR] Error calculating expected code: {e}")
        return ""

def validate_activation_code(school_name: str, entered_code: str) -> bool:
    """Check if provided activation code matches expected"""
    if not entered_code or not school_name:
        return False

    entered_code = entered_code.strip().upper()
    school_name = school_name.strip()
    expected = calculate_expected_code(school_name)

    print(f"DEBUG: Expected={expected}, Entered={entered_code}")
    return entered_code == expected

# ============================================
# SAVE ACTIVATION LOCALLY
# ============================================

def save_activation_to_local_db(school_name: str, activation_code: str) -> bool:
    """Save activation data into activation_history"""
    conn = None
    try:
        fingerprint = get_or_create_machine_fingerprint()
        conn = get_db_connection()
        cursor = conn.cursor()

        activation_token_hash = hash_for_local(activation_code)
        machine_fp_hash = hash_for_local(fingerprint)

        # Get school_info_id
        cursor.execute("SELECT id FROM school_info WHERE school_name = ? LIMIT 1", (school_name,))
        school_row = cursor.fetchone()
        school_info_id = school_row['id'] if school_row else None

        # Check if already exists
        cursor.execute("SELECT id FROM activation_history WHERE activation_token_hash = ?", (activation_token_hash,))
        if cursor.fetchone():
            return True

        # Insert or replace activation record
        cursor.execute("""
            INSERT OR REPLACE INTO activation_history
            (activation_token_hash, machine_fingerprint_hash, school_name, school_info_id,
             license_type, activation_code_hash, activated_at, is_active, cloud_synced,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            activation_token_hash,
            machine_fp_hash,
            school_name,
            school_info_id,
            "STANDARD",
            activation_token_hash,
            datetime.now().isoformat(),
            True,
            False,
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))

        conn.commit()
        return True

    except Exception as e:
        print(f"[ERROR] Failed saving activation: {e}")
        return False
    finally:
        if conn:
            conn.close()

# ============================================
# CLOUD PREPARATION
# ============================================

def prepare_cloud_activation_data(school_name: str, activation_code: str) -> dict:
    fingerprint = get_or_create_machine_fingerprint()
    return {
        "machine_fingerprint_hash": hash_for_cloud(fingerprint),
        "activation_token_hash": hash_for_cloud(activation_code),
        "school_name": school_name,
        "activated_at": datetime.utcnow().isoformat() + "Z",
        "license_type": "STANDARD",
        "version": "1.0"
    }

# ============================================
# SYSTEM ACTIVATION
# ============================================

def activate_system(activation_code: str, school_name: str) -> Dict[str, Any]:
    """Activate the system (local + history)"""
    activation_code = activation_code.strip().upper()
    school_name = school_name.strip()

    # Validate code
    if not validate_activation_code(school_name, activation_code):
        return {"success": False, "error": "Invalid activation code"}

    # Mark as activated in state
    if not mark_activated(activation_code, get_or_create_machine_fingerprint(), school_name):
        return {"success": False, "error": "Failed to mark activation in DB"}

    # Save to activation_history
    local_saved = save_activation_to_local_db(school_name, activation_code)

    cloud_data = prepare_cloud_activation_data(school_name, activation_code)

    return {
        "success": True,
        "local_saved": local_saved,
        "cloud_data": cloud_data,
        "school_name": school_name
    }

# ============================================
# CHECK / DEACTIVATE
# ============================================

def check_activation_status() -> Dict[str, Any]:
    info = get_activation_info()
    fingerprint = get_or_create_machine_fingerprint()
    return {
        "activated": info.get("activated", False) if info else False,
        "machine_fingerprint": fingerprint,
        "school_name": info.get("school_name") if info else None
    }

def deactivate_system() -> Dict[str, Any]:
    fingerprint = get_or_create_machine_fingerprint()
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE activation_state SET activated=FALSE, activation_code=NULL, machine_fingerprint=NULL, school_name=NULL, updated_at=? WHERE id=1", (datetime.now().isoformat(),))
        cursor.execute("UPDATE activation_history SET is_active=FALSE, updated_at=? WHERE machine_fingerprint_hash=?", (datetime.now().isoformat(), hash_for_local(fingerprint)))
        conn.commit()

        return {"success": True, "message": "System deactivated"}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        if conn:
            conn.close()
