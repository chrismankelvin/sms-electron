# # fingerprint.py
# import platform
# import uuid
# import hashlib

# def generate_fingerprint() -> str:
#     raw = (
#         platform.system()
#         + platform.release()
#         + platform.machine()
#         + hex(uuid.getnode())
#     )

#     return hashlib.sha256(raw.encode()).hexdigest()


# online startup version# online startup version# online startup version# online startup version

# online startup version# online startup version# online startup version# online startup version

# online startup version# online startup version# online startup version# online startup version

# online startup version# online startup version# online startup version# online startup version

# DATABASE VERSION DATABASE VERSIONDATABASE VERSIONDATABASE VERSIONDATABASE VERSION
# DATABASE VERSIONDATABASE VERSIONDATABASE VERSIONDATABASE VERSION
# DATABASE VERSIONVDATABASE VERSIONDATABASE VERSION
# app/activation/fingerprint.py - Updated to match your devices table schema
# app/activation/fingerprint.py - FIXED VERSION
import platform
import uuid
import hashlib
import sqlite3
from pathlib import Path
import os
from datetime import datetime
from typing import Optional, Dict, Any

# Fixed database path resolution
PROJECT_ROOT = Path(__file__).parent.parent.parent
# DB_PATH = PROJECT_ROOT / "database" / "school.db"
 

def get_db_connection():
    """Get SQLite connection from state.py (row_factory enabled)"""
    from app.activation import state
    try:
        conn = state.get_db_connection()
        return conn
    except Exception as e:
        raise ConnectionError(f"Failed to connect to database: {e}")


def generate_stable_machine_id() -> str:
    """Generate a STABLE machine ID (no random components!)"""
    try:
        # Collect ONLY stable machine information
        # NO RANDOM SEEDS - must be same every time!
        system_info = [
            platform.system(),      # Windows/Linux/Mac
            platform.release(),     # Version number
            platform.machine(),     # x86_64, arm64, etc
            str(uuid.getnode()),    # MAC address - STABLE
            platform.processor() or "unknown",  # CPU info
        ]
        
        # Add user if available (usually stable)
        try:
            import getpass
            system_info.append(getpass.getuser())
        except:
            pass
        
        # Add some OS-specific stable identifiers
        try:
            # For Windows
            if platform.system() == "Windows":
                import winreg
                key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Cryptography")
                machine_guid, _ = winreg.QueryValueEx(key, "MachineGuid")
                system_info.append(str(machine_guid))
        except:
            pass
        
        # Combine and hash - this will be SAME every time!
        machine_string = "||".join(system_info)  # Different separator
        return hashlib.sha256(machine_string.encode()).hexdigest()
        
    except Exception as e:
        print(f"⚠️ Stable machine ID generation failed: {e}")
        # Last resort: Use only MAC address
        return hashlib.sha256(str(uuid.getnode()).encode()).hexdigest()

def get_or_create_machine_fingerprint() -> str:
    """Get existing fingerprint from devices table or create a new one - FIXED"""
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # FIRST: Look for ANY primary device in the database
        cursor.execute("""
            SELECT device_id FROM devices 
            WHERE device_type = 'primary' 
            ORDER BY created_at ASC 
            LIMIT 1
        """)
        
        result = cursor.fetchone()
        
        if result:
            fingerprint = result['device_id']
            print(f"✅ Using existing fingerprint from database: {fingerprint[:16]}...")
            
            # Update last_activated_at timestamp
            cursor.execute("""
                UPDATE devices 
                SET last_activated_at = ?, updated_at = ?
                WHERE device_id = ?
            """, (
                datetime.now().isoformat(),
                datetime.now().isoformat(),
                fingerprint
            ))
            conn.commit()
            return fingerprint
        
        # If no primary device exists, create one with STABLE ID
        print("⚠️ No primary device found, creating new with stable ID...")
        
        stable_id = generate_stable_machine_id()
        device_name = f"{platform.system()} {platform.release()} ({platform.machine()})"
        
        # Insert new device with STABLE ID
        cursor.execute("""
            INSERT INTO devices 
            (device_id, device_name, device_type, os_name, os_version,
             activation_status, registered_at, created_at, updated_at, last_activated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            stable_id,
            device_name,
            "primary",
            platform.system(),
            platform.release(),
            "pending",
            datetime.now().isoformat(),
            datetime.now().isoformat(),
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        print(f"✅ Created new device with fingerprint: {stable_id[:16]}...")
        return stable_id
        
    except sqlite3.Error as e:
        print(f"⚠️ Database error in fingerprint generation: {e}")
        # Fallback to stable ID without database
        return generate_stable_machine_id()
    except Exception as e:
        print(f"⚠️ Unexpected error in fingerprint generation: {e}")
        return generate_stable_machine_id()
    finally:
        if conn:
            conn.close()

def get_existing_fingerprint() -> Optional[str]:
    """Get the existing fingerprint without creating a new one"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT device_id FROM devices 
            WHERE device_type = 'primary' 
            ORDER BY created_at ASC 
            LIMIT 1
        """)
        
        result = cursor.fetchone()
        if result:
            return result['device_id']
        return None
        
    except Exception as e:
        print(f"⚠️ Failed to get existing fingerprint: {e}")
        return None
    finally:
        if conn:
            conn.close()

def reset_fingerprint() -> str:
    """Force create a new fingerprint (development only)"""
    print("⚠️ WARNING: Resetting fingerprint...")
    
    conn = None
    try:
        # Generate new stable ID
        new_id = generate_stable_machine_id()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Delete old devices
        cursor.execute("DELETE FROM devices WHERE device_type = 'primary'")
        
        # Create new device
        device_name = f"{platform.system()} {platform.release()} ({platform.machine()})"
        
        cursor.execute("""
            INSERT INTO devices 
            (device_id, device_name, device_type, os_name, os_version,
             activation_status, registered_at, created_at, updated_at, last_activated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            new_id,
            device_name,
            "primary",
            platform.system(),
            platform.release(),
            "pending",
            datetime.now().isoformat(),
            datetime.now().isoformat(),
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        print(f"✅ Reset to new fingerprint: {new_id[:16]}...")
        return new_id
        
    except Exception as e:
        print(f"❌ Failed to reset fingerprint: {e}")
        return generate_stable_machine_id()
    finally:
        if conn:
            conn.close()

def get_device_info(device_id: Optional[str] = None) -> Dict[str, Any]:
    """Get information about a specific device or the current device"""
    if not device_id:
        device_id = get_existing_fingerprint() or get_or_create_machine_fingerprint()
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM devices 
            WHERE device_id = ?
        """, (device_id,))
        
        result = cursor.fetchone()
        if result:
            return dict(result)
        return {}
        
    except Exception as e:
        print(f"⚠️ Failed to get device info: {e}")
        return {}
    finally:
        if conn:
            conn.close()

def generate_fingerprint() -> str:
    """Alias for compatibility - generates fingerprint without storing"""
    return generate_stable_machine_id()

# Test function
def test_fingerprint():
    """Test the fingerprint generation"""
    print("="*60)
    print("FINGERPRINT TEST")
    print("="*60)
    
    # Get existing fingerprint first
    existing = get_existing_fingerprint()
    if existing:
        print(f"1. Existing fingerprint: {existing[:32]}...")
    else:
        print("1. No existing fingerprint found")
    
    # Get or create fingerprint (should return same as existing)
    fp1 = get_or_create_machine_fingerprint()
    print(f"2. First call: {fp1[:32]}...")
    
    # Second call should be IDENTICAL
    fp2 = get_or_create_machine_fingerprint()
    print(f"3. Second call: {fp2[:32]}...")
    
    print(f"4. Same fingerprint? {fp1 == fp2}")
    
    # Get device info
    info = get_device_info(fp1)
    if info:
        print(f"5. Device name: {info.get('device_name', 'Unknown')}")
        print(f"   Created: {info.get('created_at', 'Unknown')}")
    
    print("="*60)
    
    if fp1 == fp2:
        print("✅ SUCCESS: Fingerprint is stable!")
        return fp1
    else:
        print("❌ FAILED: Fingerprint is changing!")
        return None

if __name__ == "__main__":
    # Run test if module is executed directly
    result = test_fingerprint()
    
    if result:
        print(f"\nYour stable fingerprint: {result}")
        print(f"Use this in vendor_tool.py to generate activation codes!")
    else:
        print("\nFingerprint is unstable. Check your database!")
        
        # Show what's in the database
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT device_id, device_name, created_at FROM devices")
            devices = cursor.fetchall()
            conn.close()
            
            print("\nDevices in database:")
            for device in devices:
                print(f"  - {device['device_id'][:16]}... : {device['device_name']}")
        except:
            print("Could not read database")