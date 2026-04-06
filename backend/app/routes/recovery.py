# app/routes/recovery.py

import sys
import os
from pathlib import Path
from datetime import datetime
import traceback
import json
import sqlite3

from app.main import get_db_connection
# Add parent directory to path to import from main
sys.path.append(str(Path(__file__).parent.parent.parent))

# def get_db_connection():
#     """Get local database connection"""
#     import os
#     db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'school.db')
#     conn = sqlite3.connect(db_path)
#     conn.row_factory = sqlite3.Row
#     return conn

def import_recovery(data):
    """
    Import encrypted recovery blob from cloud.
    This WILL wipe local data and force reactivation.
    """
    import sys
    from datetime import datetime
    import traceback
    import json
    import os
    
    school_email = data.get('school_email')
    encrypted_backup = data.get('encrypted_backup')
    
    # Open log file
    log_file = open('recovery_import.log', 'a', encoding='utf-8')
    
    def log_to_file(message):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        log_file.write(f"{timestamp} - {message}\n")
        log_file.flush()
    
    try:
        log_to_file("\n🔍 ===== RECOVERY IMPORT STARTED =====")
        log_to_file(f"🔍 School email: {school_email}")
        log_to_file(f"🔍 Encrypted blob length: {len(encrypted_backup) if encrypted_backup else 0}")
        
        # Step 1: Decrypt the blob
        log_to_file("🔍 Step 1: Decrypting recovery blob...")
        try:
            # Import decryption functions from main
            from app.main import decrypt_recovery_blob
            payload = decrypt_recovery_blob(encrypted_backup, school_email)
            log_to_file(f"✅ Blob decrypted successfully")
        except Exception as decrypt_error:
            error_msg = f"❌ Decryption failed: {decrypt_error}"
            log_to_file(error_msg)
            log_file.close()
            return {
                "success": False,
                "error": f"Decryption failed: {str(decrypt_error)}"
            }

        # Step 2: Validate payload
        log_to_file("🔍 Step 2: Validating recovery payload...")
        try:
            from app.main import validate_recovery_payload
            validate_recovery_payload(payload)
            log_to_file(f"✅ Payload validation passed")
        except Exception as validate_error:
            log_to_file(f"❌ Validation failed: {validate_error}")
            log_file.close()
            return {
                "success": False,
                "error": f"Validation failed: {str(validate_error)}"
            }

        # Step 3: Get database connection
        log_to_file("🔍 Step 3: Connecting to local database...")
        try:
            conn = get_db_connection()
            log_to_file(f"✅ Database connection established")
        except Exception as db_error:
            log_to_file(f"❌ Database connection failed: {db_error}")
            log_file.close()
            return {
                "success": False,
                "error": f"Database connection failed: {str(db_error)}"
            }

        # Step 4: Wipe local database
        log_to_file("🔍 Step 4: Wiping local database...")
        try:
            from app.main import wipe_local_database
            wipe_local_database(conn)
            log_to_file(f"✅ Local database wiped successfully")
        except Exception as wipe_error:
            log_to_file(f"❌ Failed to wipe database: {wipe_error}")
            conn.rollback()
            conn.close()
            log_file.close()
            return {
                "success": False,
                "error": f"Failed to wipe database: {str(wipe_error)}"
            }

        # Step 5: Import school
        log_to_file("🔍 Step 5: Importing school data...")
        try:
            from app.main import import_school_from_recovery
            import_school_from_recovery(conn, payload["school"])
            log_to_file(f"✅ School imported successfully")
        except Exception as school_error:
            log_to_file(f"❌ Failed to import school: {school_error}")
            conn.rollback()
            conn.close()
            log_file.close()
            return {
                "success": False,
                "error": f"Failed to import school: {str(school_error)}"
            }

        # Step 6: Import admins
        log_to_file("🔍 Step 6: Importing admin data...")
        try:
            from app.main import import_admins_from_recovery
            import_admins_from_recovery(conn, payload["admins"])
            log_to_file(f"✅ {len(payload['admins'])} admins imported successfully")
        except Exception as admin_error:
            log_to_file(f"❌ Failed to import admins: {admin_error}")
            conn.rollback()
            conn.close()
            log_file.close()
            return {
                "success": False,
                "error": f"Failed to import admins: {str(admin_error)}"
            }

        # Step 7: Reset activation state
        log_to_file("🔍 Step 7: Resetting activation state...")
        try:
            from app.main import reset_activation_state
            reset_activation_state(conn)
            log_to_file(f"✅ Activation state reset")
        except Exception as activation_error:
            log_to_file(f"❌ Failed to reset activation: {activation_error}")
            conn.rollback()
            conn.close()
            log_file.close()
            return {
                "success": False,
                "error": f"Failed to reset activation: {str(activation_error)}"
            }

        # Step 8: Commit transaction
        log_to_file("🔍 Step 8: Committing transaction...")
        try:
            conn.commit()
            log_to_file(f"✅ Transaction committed successfully")
        except Exception as commit_error:
            log_to_file(f"❌ Failed to commit: {commit_error}")
            conn.rollback()
            conn.close()
            log_file.close()
            return {
                "success": False,
                "error": f"Failed to commit transaction: {str(commit_error)}"
            }

        conn.close()
        log_to_file(f"✅ Database connection closed")

        response = {
            "success": True,
            "message": "Recovery completed successfully",
            "admins_imported": len(payload["admins"]),
            "system_activated": False,
            "next_step": "activation_required"
        }
        
        log_to_file(f"✅ Response: {json.dumps(response)}")
        log_to_file(f"🔍 ===== RECOVERY IMPORT COMPLETED SUCCESSFULLY =====\n")
        
        log_file.close()
        return response

    except Exception as e:
        log_to_file(f"❌ Unhandled exception: {e}")
        traceback.print_exc(file=log_file)
        log_file.close()
        return {
            "success": False,
            "error": f"Recovery failed: {str(e)}"
        }

def request_recovery_code(data):
    """Request recovery code to be sent to school email"""
    try:
        school_email = data.get('school_email')
        
        # Import from main
        from app.main import send_recovery_code
        result = send_recovery_code(school_email)
        
        return result
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to request recovery code: {str(e)}"
        }

def verify_recovery_code(data):
    """Verify recovery code and get encrypted backup"""
    try:
        school_email = data.get('school_email')
        recovery_code = data.get('recovery_code')
        
        # Import from main
        from app.main import verify_recovery_code as verify_code
        result = verify_code(school_email, recovery_code)
        
        return result
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to verify recovery code: {str(e)}"
        }