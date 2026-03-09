

# app/activation/state.py
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
import tempfile
from cryptography.fernet import Fernet

# =========================
# Paths and Encryption
# =========================
PROJECT_ROOT = Path(__file__).parent.parent.parent
ENCRYPTED_DB_PATH = PROJECT_ROOT / "database" / "school_encrypted.db"
KEY_PATH = PROJECT_ROOT / "database" / "db.key"

def load_or_create_key() -> bytes:
    """Load encryption key from file or create one."""
    if KEY_PATH.exists():
        return KEY_PATH.read_bytes()
    key = Fernet.generate_key()
    KEY_PATH.write_bytes(key)
    return key

FERNET = Fernet(load_or_create_key())

# =========================
# Encrypted DB Connection Wrapper
# =========================
class EncryptedConnection:
    """Wrapper for sqlite3.Connection that auto-encrypts on close."""

    def __init__(self):
        # Decrypt encrypted DB to a temporary file
        self.temp_file = tempfile.NamedTemporaryFile(delete=False)
        if ENCRYPTED_DB_PATH.exists():
            encrypted_data = ENCRYPTED_DB_PATH.read_bytes()
            decrypted = FERNET.decrypt(encrypted_data)
            self.temp_file.write(decrypted)
        self.temp_file.flush()
        self.temp_file.close()
        # Connect to decrypted DB
        self.conn = sqlite3.connect(self.temp_file.name)
        self.conn.row_factory = sqlite3.Row

    def __getattr__(self, name):
        # Delegate all attributes to the sqlite3.Connection
        return getattr(self.conn, name)

    def close(self):
        """Commit, close, and re-encrypt DB on disk."""
        try:
            self.conn.commit()
            self.conn.close()
            with open(self.temp_file.name, "rb") as f:
                ENCRYPTED_DB_PATH.write_bytes(FERNET.encrypt(f.read()))
        finally:
            # Remove temporary decrypted file
            Path(self.temp_file.name).unlink(missing_ok=True)

def get_db_connection() -> sqlite3.Connection:
    """Get encrypted database connection."""
    return EncryptedConnection()

# =========================
# Activation State Table  ensure_activation_state_table
# =========================
def ensure_all_tables():
    """Ensure all required tables exist in the encrypted database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # ====== activation_state ======
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activation_state (
            id INTEGER PRIMARY KEY CHECK(id = 1),
            activated BOOLEAN NOT NULL DEFAULT FALSE,
            activation_code TEXT,
            machine_fingerprint TEXT,
            school_name TEXT,
            activated_at DATETIME,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("SELECT id FROM activation_state WHERE id = 1")
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO activation_state (id, activated, created_at, updated_at)
            VALUES (1, FALSE, ?, ?)
        """, (datetime.now().isoformat(), datetime.now().isoformat()))

        # ----------------- 1. USERS -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unique_id TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL UNIQUE,
            email TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'ta', 'accountant', 'student')),
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disabled')),
            last_login DATETIME,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # ----------------- 2. SCHOOL_INFO -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS school_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            school_name TEXT NOT NULL,
            school_logo_url TEXT,
            motto TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            country TEXT,
            postal_code TEXT,
            phone TEXT,
            email TEXT,
            website TEXT,
            principal_name TEXT,
            principal_email TEXT,
            vice_principal_name TEXT,
            vice_principal_email TEXT,
            total_classes INTEGER DEFAULT 0,
            total_sections INTEGER DEFAULT 0,
            total_students INTEGER DEFAULT 0,
            total_staff INTEGER DEFAULT 0,
            established_year INTEGER,
            school_type TEXT CHECK (school_type IN ('public','private','charter','other')),
            license_key_hash TEXT,
            license_type TEXT DEFAULT 'STANDARD',
            licensed_devices INTEGER DEFAULT 1,
            license_valid_until DATE,
            last_license_sync DATETIME,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # ----------------- 3. PERSON_DETAILS -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS person_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unique_id TEXT NOT NULL UNIQUE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            other_names TEXT,
            date_of_birth DATE,
            gender TEXT CHECK (gender IN ('male','female','other')),
            phone TEXT,
            email TEXT UNIQUE,
            address TEXT,
            city TEXT,
            state TEXT,
            country TEXT,
            postal_code TEXT,
            nationality TEXT,
            blood_group TEXT,
            emergency_contact_name TEXT,
            emergency_contact_phone TEXT,
            photo_url TEXT,
            national_id TEXT UNIQUE,
            health_id TEXT UNIQUE,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # ----------------- 4. ACTIVATION_HISTORY -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS activation_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activation_token_hash TEXT NOT NULL UNIQUE,
            machine_fingerprint_hash TEXT NOT NULL,
            device_id TEXT,
            school_name TEXT NOT NULL,
            school_info_id INTEGER,
            license_type TEXT NOT NULL DEFAULT 'STANDARD',
            activation_code_hash TEXT NOT NULL,
            activated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_verified_at DATETIME,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            cloud_synced BOOLEAN DEFAULT FALSE,
            cloud_sync_at DATETIME,
            cloud_sync_error TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (school_info_id) REFERENCES school_info(id)
        )
        """)

        # ----------------- 5. DEVICES -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT NOT NULL UNIQUE,
            user_id INTEGER,
            device_name TEXT,
            device_type TEXT,
            os_name TEXT,
            os_version TEXT,
            activation_key TEXT UNIQUE,
            activation_status TEXT DEFAULT 'pending',
            activation_token_hash TEXT,
            license_type TEXT DEFAULT 'STANDARD',
            activated_at DATETIME,
            license_valid_until DATE,
            last_license_check DATETIME,
            cloud_sync_status TEXT,
            last_activated_at DATETIME,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # ----------------- 6. STUDENTS -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            person_id INTEGER NOT NULL UNIQUE,
            unique_id TEXT NOT NULL UNIQUE,
            student_number TEXT UNIQUE NOT NULL,
            academic_year_id INTEGER NOT NULL,
            class_id INTEGER,
            section_id INTEGER,
            parent1_name TEXT,
            parent1_phone TEXT,
            parent1_email TEXT,
            parent2_name TEXT,
            parent2_phone TEXT,
            parent2_email TEXT,
            guardian_name TEXT,
            guardian_phone TEXT,
            guardian_email TEXT,
            health_condition TEXT,
            former_school TEXT,
            enrolled_at DATE,
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','graduated','withdrawn')),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (person_id) REFERENCES person_details(id)
        )
        """)

        # ----------------- 7. STAFF -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            person_id INTEGER NOT NULL UNIQUE,
            unique_id TEXT NOT NULL UNIQUE,
            user_id INTEGER NOT NULL UNIQUE,
            staff_number TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin','teacher','ta','accountant')),
            hired_at DATE,
            department TEXT,
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','terminated')),
            marital_status TEXT CHECK (marital_status IN ('single','married','divorced','widowed','other')),
            spouse_name TEXT,
            spouse_phone TEXT,
            place_of_birth TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (person_id) REFERENCES person_details(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        # ----------------- 8. ACADEMIC_YEARS -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS academic_years (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year_label TEXT NOT NULL UNIQUE,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # ----------------- 9. CLASSES -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_name TEXT NOT NULL,
            class_code TEXT UNIQUE,
            academic_year_id INTEGER NOT NULL,
            description TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
        )
        """)

        # ----------------- 10. SECTIONS -----------------
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section_name TEXT NOT NULL,
            class_id INTEGER NOT NULL,
            academic_year_id INTEGER NOT NULL,
            description TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (class_id) REFERENCES classes(id),
            FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
        )
        """)

        # ----------------- 11. ACTIVATION_STATE -----------------





    # Add more tables here if needed (students, staff, classes, sections, etc.)

    conn.commit()
    conn.close()
    print(" All required tables are ensured in the encrypted database.")




# =========================
# Activation State Functions
# =========================
def is_activated() -> bool:
    ensure_all_tables()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT activated FROM activation_state WHERE id = 1")
    result = cursor.fetchone()
    conn.close()
    return bool(result['activated']) if result else False

def mark_activated(activation_code: str, machine_fingerprint: str, school_name: str) -> bool:
    ensure_all_tables()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE activation_state
        SET activated = TRUE,
            activation_code = ?,
            machine_fingerprint = ?,
            school_name = ?,
            activated_at = ?,
            updated_at = ?
        WHERE id = 1
    """, (
        activation_code,
        machine_fingerprint,
        school_name,
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    conn.close()  # Auto-reencrypt happens here
    return True

def get_activation_info() -> Optional[Dict[str, Any]]:
    ensure_all_tables()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM activation_state WHERE id = 1")
    result = cursor.fetchone()
    conn.close()
    if not result:
        return None
    info = dict(result)
    info['is_activated'] = bool(info['activated'])
    info['checked_at'] = datetime.now().isoformat()
    return info

def clear_activation() -> bool:
    ensure_all_tables()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE activation_state
        SET activated = FALSE,
            activation_code = NULL,
            machine_fingerprint = NULL,
            school_name = NULL,
            activated_at = NULL,
            updated_at = ?
        WHERE id = 1
    """, (datetime.now().isoformat(),))
    conn.close()  # Auto-reencrypt happens here
    return True

# =========================
# Initialize table on import
# =========================
ensure_all_tables()
