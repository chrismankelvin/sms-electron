


#         # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION
#           # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION
#             # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION

#         # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION
#           # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION
         
#             # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION  # STATE DATABASE VERSION

# # app/activation/activation_service.py - COMPLETELY FIXED VERSION
# from .fingerprint import get_or_create_machine_fingerprint
# from .state import mark_activated, is_activated, get_activation_info
# from app.crypto.kdf import derive_db_key
# from pathlib import Path
# import hashlib
# import os
# import sqlite3
# from datetime import datetime
# from typing import Dict, Any

# # CRITICAL: This MUST be identical to what's in vendor_tool.py
# APP_SALT = "YOUR_SECRET_APP_SALT_HERE"  # CHANGE THIS to your actual salt!
# CLOUD_SALT = "YOUR_CLOUD_SALT_HERE"

# # Fixed path resolution
# PROJECT_ROOT = Path(__file__).parent.parent.parent
# DB_PATH = PROJECT_ROOT / "database" / "school.db"

# def get_db_connection():
#     """Get database connection"""
#     try:
#         DB_PATH.parent.mkdir(parents=True, exist_ok=True)
#         conn = sqlite3.connect(str(DB_PATH))
#         conn.row_factory = sqlite3.Row
#         return conn
#     except Exception as e:
#         raise ConnectionError(f"Failed to connect to database: {e}")

# def hash_for_local(data: str) -> str:
#     """Create hash for local storage - MUST use SAME APP_SALT"""
#     return hashlib.sha256((data + APP_SALT).encode()).hexdigest()

# def hash_for_cloud(data: str) -> str:
#     """Create different hash for cloud storage"""
#     return hashlib.sha512((data + CLOUD_SALT).encode()).hexdigest()

# def calculate_expected_code(school_name: str) -> str:
#     """Calculate what the activation code should be"""
#     try:
#         fingerprint = get_or_create_machine_fingerprint()
#         raw = fingerprint + school_name + APP_SALT
#         result = hashlib.sha256(raw.encode()).hexdigest()[:12].upper()
        
#         # DEBUG: Uncomment to see what's being calculated
#         # print(f"DEBUG calculate_expected_code:")
#         # print(f"  Fingerprint: {fingerprint[:16]}...")
#         # print(f"  School: '{school_name}'")
#         # print(f"  Raw (first 50 chars): {raw[:50]}...")
#         # print(f"  Result: {result}")
        
#         return result
#     except Exception as e:
#         print(f"❌ Error in calculate_expected_code: {e}")
#         return ""

# def validate_activation_code(school_name: str, entered_code: str) -> bool:
#     """Validate if the entered code matches what it should be"""
#     try:
#         if not entered_code or not school_name:
#             return False
        
#         # Clean inputs
#         entered_code = entered_code.strip().upper()
#         school_name = school_name.strip()
        
#         expected = calculate_expected_code(school_name)
        
#         # DEBUG OUTPUT - VERY IMPORTANT!
#         print(f"🔍 DEBUG VALIDATION:")
#         print(f"  School: '{school_name}'")
#         print(f"  Entered code: '{entered_code}'")
#         print(f"  Expected code: '{expected}'")
#         print(f"  Match: {entered_code == expected}")
        
#         return entered_code == expected
        
#     except Exception as e:
#         print(f"❌ Error in validate_activation_code: {e}")
#         return False

# def save_activation_to_local_db(school_name: str, activation_code: str) -> bool:
#     """Save activation data to activation_history table"""
#     conn = None
#     try:
#         fingerprint = get_or_create_machine_fingerprint()
        
#         # DEBUG: Check school name match
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Check school in database
#         cursor.execute("SELECT school_name FROM school_info LIMIT 1")
#         db_school = cursor.fetchone()
#         if db_school:
#             print(f"🔍 DEBUG School Check:")
#             print(f"  DB has: '{db_school['school_name']}'")
#             print(f"  Request: '{school_name}'")
#             print(f"  Exact match: {db_school['school_name'] == school_name}")
        
#         # Create hashes using the SAME APP_SALT
#         activation_token_hash = hash_for_local(activation_code)
#         machine_fp_hash = hash_for_local(fingerprint)
        
#         # Check if already activated
#         cursor.execute(
#             "SELECT id FROM activation_history WHERE activation_token_hash = ?",
#             (activation_token_hash,)
#         )
        
#         if cursor.fetchone():
#             print("⚠️ Activation already exists in local DB")
#             return True
        
#         # Get school_info_id
#         school_info_id = None
#         cursor.execute("SELECT id FROM school_info WHERE school_name = ? LIMIT 1", (school_name,))
#         school_info = cursor.fetchone()
#         if school_info:
#             school_info_id = school_info['id']
#         else:
#             print(f"⚠️ School '{school_name}' not found in school_info table")
#             # Try fuzzy match
#             cursor.execute("SELECT id, school_name FROM school_info")
#             all_schools = cursor.fetchall()
#             for school in all_schools:
#                 if school['school_name'].strip().lower() == school_name.strip().lower():
#                     school_info_id = school['id']
#                     print(f"✅ Found fuzzy match: {school['school_name']}")
#                     break
        
#         # Get device_id
#         device_id = None
#         cursor.execute("SELECT device_id FROM devices WHERE device_id = ?", (fingerprint,))
#         device = cursor.fetchone()
#         if device:
#             device_id = device['device_id']
        
#         # Insert into activation_history
#         cursor.execute("""
#             INSERT OR REPLACE INTO activation_history 
#             (activation_token_hash, machine_fingerprint_hash, device_id,
#              school_name, school_info_id, license_type, activation_code_hash,
#              activated_at, is_active, cloud_synced, created_at, updated_at)
#             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#         """, (
#             activation_token_hash,
#             machine_fp_hash,
#             device_id,
#             school_name,
#             school_info_id,
#             "STANDARD",
#             hash_for_local(activation_code),
#             datetime.now().isoformat(),
#             True,
#             False,
#             datetime.now().isoformat(),
#             datetime.now().isoformat()
#         ))
        
#         conn.commit()
#         print("✅ Activation saved to activation_history table")
#         return True
        
#     except sqlite3.Error as e:
#         print(f"❌ Database error saving activation: {e}")
#         return False
#     except Exception as e:
#         print(f"❌ Failed to save to local DB: {e}")
#         return False
#     finally:
#         if conn:
#             conn.close()

# def prepare_cloud_activation_data(school_name: str, activation_code: str) -> dict:
#     """Prepare activation data for cloud storage"""
#     fingerprint = get_or_create_machine_fingerprint()
    
#     return {
#         "machine_fingerprint_hash": hash_for_cloud(fingerprint),
#         "activation_token_hash": hash_for_cloud(activation_code),
#         "school_name": school_name,
#         "activated_at": datetime.utcnow().isoformat() + "Z",
#         "license_type": "STANDARD",
#         "version": "1.0"
#     }

# def activate_system(activation_code: str, school_name: str) -> Dict[str, Any]:
#     """Activate the system with dual storage - FIXED"""
    
#     # Validate inputs
#     if not activation_code or not school_name:
#         return {"success": False, "error": "Activation code and school name are required"}
    
#     # Clean inputs
#     activation_code = activation_code.strip().upper()
#     school_name = school_name.strip()
    
#     print(f"🚀 ACTIVATION ATTEMPT:")
#     print(f"  School: '{school_name}'")
#     print(f"  Code: '{activation_code}'")
    
#     # FIRST: Check school exists in database
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("SELECT school_name FROM school_info LIMIT 1")
#         db_school = cursor.fetchone()
#         conn.close()
        
#         if not db_school:
#             return {"success": False, "error": "School not found in database. Complete school setup first."}
        
#         db_school_name = db_school['school_name']
#         if db_school_name != school_name:
#             print(f"⚠️ School name mismatch!")
#             print(f"  Database: '{db_school_name}'")
#             print(f"  Request: '{school_name}'")
#             # Try case-insensitive match
#             if db_school_name.lower() != school_name.lower():
#                 return {
#                     "success": False, 
#                     "error": f"School name mismatch. Database has: '{db_school_name}'"
#                 }
#             else:
#                 print(f"✅ Case-insensitive match, using DB name: '{db_school_name}'")
#                 school_name = db_school_name  # Use the exact name from DB
            
#     except Exception as e:
#         return {"success": False, "error": f"Database error: {str(e)}"}
    
#     # Validate the activation code
#     if not validate_activation_code(school_name, activation_code):
#         # Get expected code for better error message
#         expected = calculate_expected_code(school_name)
#         return {
#             "success": False, 
#             "error": f"Invalid activation code.",
#             "debug_info": {
#                 "expected": expected,
#                 "received": activation_code,
#                 "school_name": school_name
#             }
#         }
    
#     try:
#         fingerprint = get_or_create_machine_fingerprint()
#         print(f"✅ Code validation passed!")
#         print(f"  Machine fingerprint: {fingerprint[:16]}...")
        
#         # Derive DB key (if kdf module exists)
#         db_key = None
#         try:
#             db_key = derive_db_key(activation_code, fingerprint)
#         except:
#             print("⚠️ derive_db_key not available, skipping")
        
#         # Mark system as activated in activation_state table
#         success = mark_activated(activation_code, fingerprint, school_name)
#         if not success:
#             return {"success": False, "error": "Failed to mark system as activated"}
        
#         # Save to activation_history table
#         local_save_success = save_activation_to_local_db(school_name, activation_code)
        
#         # Update device activation status
#         conn = None
#         try:
#             conn = get_db_connection()
#             cursor = conn.cursor()
            
#             # Check if device exists
#             cursor.execute("SELECT id FROM devices WHERE device_id = ?", (fingerprint,))
#             if cursor.fetchone():
#                 cursor.execute("""
#                     UPDATE devices 
#                     SET activation_status = 'activated',
#                         activation_token_hash = ?,
#                         license_type = 'STANDARD',
#                         activated_at = ?,
#                         last_activated_at = ?,
#                         updated_at = ?
#                     WHERE device_id = ?
#                 """, (
#                     hash_for_local(activation_code),
#                     datetime.now().isoformat(),
#                     datetime.now().isoformat(),
#                     datetime.now().isoformat(),
#                     fingerprint
#                 ))
#             else:
#                 cursor.execute("""
#                     INSERT INTO devices 
#                     (device_id, device_name, device_type, os_name, os_version,
#                      activation_status, activation_token_hash, license_type,
#                      activated_at, last_activated_at, registered_at, created_at, updated_at)
#                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#                 """, (
#                     fingerprint,
#                     f"Primary Device - {school_name}",
#                     "normal",
#                     "Unknown",
#                     "Unknown",
#                     "activated",
#                     hash_for_local(activation_code),
#                     "STANDARD",
#                     datetime.now().isoformat(),
#                     datetime.now().isoformat(),
#                     datetime.now().isoformat(),
#                     datetime.now().isoformat(),
#                     datetime.now().isoformat()
#                 ))
            
#             conn.commit()
#         except Exception as e:
#             print(f"⚠️ Could not update devices table: {e}")
#         finally:
#             if conn:
#                 conn.close()
        
#         # Prepare data for cloud
#         cloud_data = prepare_cloud_activation_data(school_name, activation_code)
        
#         # Securely clear sensitive data
#         if db_key:
#             del db_key
        
#         print(f"🎉 SYSTEM ACTIVATED SUCCESSFULLY!")
#         print(f"  School: {school_name}")
#         print(f"  Code: {activation_code}")
        
#         return {
#             "success": True,
#             "message": "System activated successfully!",
#             "local_saved": local_save_success,
#             "cloud_data": cloud_data,
#             "fingerprint_short": fingerprint[:8] + "...",
#             "school_name": school_name
#         }
        
#     except Exception as e:
#         print(f"❌ Activation failed with exception: {e}")
#         return {"success": False, "error": f"Activation failed: {str(e)}"}

# def check_activation_status() -> Dict[str, Any]:
#     """Check detailed activation status from both tables"""
#     activation_info = get_activation_info()
#     fingerprint = get_or_create_machine_fingerprint()
    
#     conn = None
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get latest activation history
#         cursor.execute("""
#             SELECT school_name, activated_at, license_type, is_active
#             FROM activation_history 
#             WHERE machine_fingerprint_hash = ?
#             ORDER BY activated_at DESC 
#             LIMIT 1
#         """, (hash_for_local(fingerprint),))
        
#         history = cursor.fetchone()
        
#         if not activation_info and not history:
#             return {
#                 "activated": False,
#                 "machine_fingerprint": fingerprint,
#                 "has_activation_data": False,
#                 "message": "System not activated"
#             }
        
#         result = {
#             "activated": activation_info.get("activated", False) if activation_info else False,
#             "machine_fingerprint": fingerprint,
#             "has_activation_data": activation_info is not None or history is not None,
#             "timestamp": datetime.now().isoformat()
#         }
        
#         # Merge activation_state info
#         if activation_info:
#             result.update({
#                 "activation_code": activation_info.get("activation_code"),
#                 "school_name": activation_info.get("school_name"),
#                 "activated_at": activation_info.get("activated_at")
#             })
        
#         # Merge activation_history info
#         if history:
#             result.update({
#                 "history_school_name": history['school_name'],
#                 "history_activated_at": history['activated_at'],
#                 "history_license_type": history['license_type'],
#                 "history_is_active": bool(history['is_active'])
#             })
        
#         return result
        
#     except Exception as e:
#         print(f"⚠️ Error checking activation history: {e}")
#         return {
#             "activated": activation_info.get("activated", False) if activation_info else False,
#             "machine_fingerprint": fingerprint,
#             "has_activation_data": activation_info is not None,
#             "error": str(e),
#             "timestamp": datetime.now().isoformat()
#         }
#     finally:
#         if conn:
#             conn.close()

# def deactivate_system() -> Dict[str, Any]:
#     """Deactivate the system from all tables"""
#     conn = None
#     try:
#         fingerprint = get_or_create_machine_fingerprint()
#         machine_fp_hash = hash_for_local(fingerprint)
        
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Update activation_state table
#         cursor.execute("""
#             UPDATE activation_state 
#             SET activated = FALSE,
#                 activation_code = NULL,
#                 machine_fingerprint = NULL,
#                 school_name = NULL,
#                 activated_at = NULL,
#                 updated_at = ?
#             WHERE id = 1
#         """, (datetime.now().isoformat(),))
        
#         # Update activation_history table
#         cursor.execute("""
#             UPDATE activation_history 
#             SET is_active = FALSE,
#                 updated_at = ?
#             WHERE machine_fingerprint_hash = ? AND is_active = TRUE
#         """, (datetime.now().isoformat(), machine_fp_hash))
        
#         # Update devices table
#         cursor.execute("""
#             UPDATE devices 
#             SET activation_status = 'deactivated',
#                 updated_at = ?
#             WHERE device_id = ?
#         """, (datetime.now().isoformat(), fingerprint))
        
#         conn.commit()
        
#         return {
#             "success": True,
#             "message": "System deactivated from all tables"
#         }
        
#     except Exception as e:
#         return {"success": False, "error": f"Deactivation failed: {str(e)}"}
#     finally:
#         if conn:
#             conn.close()

# # DIAGNOSTIC FUNCTION - Run this to debug
# def diagnose_activation_issue(school_name: str, code: str):
#     """Run this function to diagnose why activation is failing"""
#     print("="*60)
#     print("ACTIVATION DIAGNOSIS")
#     print("="*60)
    
#     # 1. Get current fingerprint
#     fp = get_or_create_machine_fingerprint()
#     print(f"1. Current machine fingerprint: {fp}")
#     print(f"   Length: {len(fp)} chars")
    
#     # 2. Check APP_SALT
#     print(f"\n2. APP_SALT being used: '{APP_SALT}'")
    
#     # 3. Manual calculation
#     raw = fp + school_name + APP_SALT
#     expected = hashlib.sha256(raw.encode()).hexdigest()[:12].upper()
#     print(f"\n3. Manual calculation:")
#     print(f"   Raw string (first 100 chars): {raw[:100]}...")
#     print(f"   Expected code: {expected}")
#     print(f"   Provided code: {code}")
#     print(f"   Match: {code == expected}")
    
#     # 4. Check school in database
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("SELECT school_name FROM school_info LIMIT 1")
#         db_school = cursor.fetchone()
#         conn.close()
        
#         if db_school:
#             print(f"\n4. School in database: '{db_school['school_name']}'")
#             print(f"   Requested school: '{school_name}'")
#             print(f"   Exact match: {db_school['school_name'] == school_name}")
#             print(f"   Case-insensitive match: {db_school['school_name'].lower() == school_name.lower()}")
#         else:
#             print(f"\n4. NO SCHOOL FOUND IN DATABASE!")
            
#     except Exception as e:
#         print(f"\n4. Database error: {e}")
    
#     # 5. Test validation
#     print(f"\n5. Validation test:")
#     is_valid = validate_activation_code(school_name, code)
#     print(f"   Result: {is_valid}")
    
#     print("="*60)
    
#     if not is_valid:
#         print("❌ PROBLEM FOUND: The code doesn't match what's expected!")
#         print(f"   Try using this code instead: {expected}")
    
#     return expected

# # Quick test
# if __name__ == "__main__":
#     # Test the diagnosis
#     school = "Asantemanshs"
#     test_code = "EDF31ECDC5BF"
    
#     print("Running self-test...")
#     expected_code = diagnose_activation_issue(school, test_code)
    
#     if test_code != expected_code:
#         print(f"\n💡 SUGGESTION:")
#         print(f"Use this code instead: {expected_code}")
#         print(f"Or update APP_SALT to match what was used to generate {test_code}")
        
        
        
        
#         # ENCRPTION DATABASE
        
        
        
        
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
        print(f"❌ Error calculating expected code: {e}")
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
        print(f"❌ Failed saving activation: {e}")
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
