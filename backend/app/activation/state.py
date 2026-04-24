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
import os

# Get the user's AppData folder (recommended for Windows)
APPDATA_PATH = Path(os.environ.get('APPDATA', Path.home() / 'AppData' / 'Roaming'))
APP_NAME = "SchoolManagementSystem"  # Your app name

# Create app-specific folder in AppData
APP_DATA_PATH = APPDATA_PATH / APP_NAME
APP_DATA_PATH.mkdir(parents=True, exist_ok=True)

# Database paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
ENCRYPTED_DB_PATH = APP_DATA_PATH / "school_encrypted.db"
KEY_PATH = APP_DATA_PATH / "db.key"

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
# def ensure_all_tables():
#     """Ensure all required tables exist in the encrypted database."""
#     conn = get_db_connection()
#     cursor = conn.cursor()

#     # ====== activation_state ======
#     cursor.execute("""
#         CREATE TABLE IF NOT EXISTS activation_state (
#             id INTEGER PRIMARY KEY CHECK(id = 1),
#             activated BOOLEAN NOT NULL DEFAULT FALSE,
#             activation_code TEXT,
#             machine_fingerprint TEXT,
#             school_name TEXT,
#             activated_at DATETIME,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
#         )
#     """)
#     cursor.execute("SELECT id FROM activation_state WHERE id = 1")
#     if not cursor.fetchone():
#         cursor.execute("""
#             INSERT INTO activation_state (id, activated, created_at, updated_at)
#             VALUES (1, FALSE, ?, ?)
#         """, (datetime.now().isoformat(), datetime.now().isoformat()))

#         # ----------------- 1. USERS -----------------
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS users (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             unique_id TEXT NOT NULL UNIQUE,
#             username TEXT NOT NULL UNIQUE,
#             email TEXT UNIQUE,
#             password_hash TEXT NOT NULL,
#             role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'ta', 'accountant', 'student', 'non_staff')),
#             status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended','on_leave', 'disabled')),
#             last_login DATETIME,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
#         )
#         """)

#         # ----------------- 2. SCHOOL_INFO -----------------
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS school_info (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             school_name TEXT NOT NULL,
#             school_logo_url TEXT,
#             motto TEXT,
#             address TEXT,
#             city TEXT,
#             state TEXT,
#             country TEXT,
#             postal_code TEXT,
#             phone TEXT,
#             email TEXT,
#             website TEXT,
#             principal_name TEXT,
#             principal_email TEXT,
#             vice_principal_name TEXT,
#             vice_principal_email TEXT,
#             total_classes INTEGER DEFAULT 0,
#             total_sections INTEGER DEFAULT 0,
#             total_students INTEGER DEFAULT 0,
#             total_staff INTEGER DEFAULT 0,
#             established_year INTEGER,
#             school_type TEXT CHECK (school_type IN ('public','private','charter','other')),
#             license_key_hash TEXT,
#             license_type TEXT DEFAULT 'STANDARD',
#             licensed_devices INTEGER DEFAULT 1,
#             license_valid_until DATE,
#             last_license_sync DATETIME,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
#         )
#         """)

#         # ----------------- 3. PERSON_DETAILS -----------------
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS person_details (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             unique_id TEXT NOT NULL UNIQUE,
#             first_name TEXT NOT NULL,
#             last_name TEXT NOT NULL,
#             other_names TEXT,
#             date_of_birth DATE,
#             gender TEXT CHECK (gender IN ('male','female','other')),
#             phone TEXT,
#             email TEXT UNIQUE,
#             address TEXT,
#             city TEXT,
#             state TEXT,
#             country TEXT,
#             postal_code TEXT,
#             nationality TEXT,
#             blood_group TEXT,
#             emergency_contact_name TEXT,
#             emergency_contact_phone TEXT,
#             photo_url TEXT,
#             national_id TEXT UNIQUE,
#             health_id TEXT UNIQUE,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
#         )
#         """)

#         # ----------------- 4. ACTIVATION_HISTORY -----------------
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS activation_history (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             activation_token_hash TEXT NOT NULL UNIQUE,
#             machine_fingerprint_hash TEXT NOT NULL,
#             device_id TEXT,
#             school_name TEXT NOT NULL,
#             school_info_id INTEGER,
#             license_type TEXT NOT NULL DEFAULT 'STANDARD',
#             activation_code_hash TEXT NOT NULL,
#             activated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             last_verified_at DATETIME,
#             is_active BOOLEAN NOT NULL DEFAULT TRUE,
#             cloud_synced BOOLEAN DEFAULT FALSE,
#             cloud_sync_at DATETIME,
#             cloud_sync_error TEXT,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#             FOREIGN KEY (school_info_id) REFERENCES school_info(id)
#         )
#         """)

#         # ----------------- 5. DEVICES -----------------
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS devices (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             device_id TEXT NOT NULL UNIQUE,
#             user_id INTEGER,
#             device_name TEXT,
#             device_type TEXT,
#             os_name TEXT,
#             os_version TEXT,
#             activation_key TEXT UNIQUE,
#             activation_status TEXT DEFAULT 'pending',
#             activation_token_hash TEXT,
#             license_type TEXT DEFAULT 'STANDARD',
#             activated_at DATETIME,
#             license_valid_until DATE,
#             last_license_check DATETIME,
#             cloud_sync_status TEXT,
#             last_activated_at DATETIME,
#             registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#             FOREIGN KEY (user_id) REFERENCES users(id)
#         )
#         """)

#         # ----------------- 6. STUDENTS -----------------
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS students (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             person_id INTEGER NOT NULL UNIQUE,
#             unique_id TEXT NOT NULL UNIQUE,
#             student_number TEXT UNIQUE NOT NULL,
#             academic_year_id INTEGER NOT NULL,
#             class_id INTEGER,
#             section_id INTEGER,
#             parent1_name TEXT,
#             parent1_phone TEXT,
#             parent1_email TEXT,
#             parent2_name TEXT,
#             parent2_phone TEXT,
#             parent2_email TEXT,
#             guardian_name TEXT,
#             guardian_phone TEXT,
#             guardian_email TEXT,
#             health_condition TEXT,
#             former_school TEXT,
#             enrolled_at DATE,
#             status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','graduated','withdrawn')),
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#             FOREIGN KEY (person_id) REFERENCES person_details(id)
#         )
#         """)

#         # ----------------- 7. STAFF -----------------
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS staff (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             person_id INTEGER NOT NULL UNIQUE,
#             unique_id TEXT NOT NULL UNIQUE,
#             user_id INTEGER NOT NULL UNIQUE,
#             staff_number TEXT UNIQUE NOT NULL,
#             role TEXT NOT NULL CHECK (role IN ('admin','teacher','ta','accountant')),
#             hired_at DATE,
#             department TEXT,
#             status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','terminated')),
#             marital_status TEXT CHECK (marital_status IN ('single','married','divorced','widowed','other')),
#             spouse_name TEXT,
#             spouse_phone TEXT,
#             place_of_birth TEXT,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#             FOREIGN KEY (person_id) REFERENCES person_details(id),
#             FOREIGN KEY (user_id) REFERENCES users(id)
#         )
#         """)

#         # ----------------- 8. ACADEMIC_YEARS -----------------
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS academic_years (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             year_label TEXT NOT NULL UNIQUE,
#             start_date DATE NOT NULL,
#             end_date DATE NOT NULL,
#             status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
#         )
#         """)

#         # ----------------- 9. CLASSES -----------------
#         # cursor.execute("""
#         # CREATE TABLE IF NOT EXISTS classes (
#         #     id INTEGER PRIMARY KEY AUTOINCREMENT,
#         #     class_name TEXT NOT NULL,
#         #     class_code TEXT UNIQUE,
#         #     academic_year_id INTEGER NOT NULL,
#         #     description TEXT,
#         #     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#         #     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#         #     FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
#         # )
#         # """)

#         # ----------------- 10. SECTIONS -----------------
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS sections (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             section_name TEXT NOT NULL,
#             class_id INTEGER NOT NULL,
#             academic_year_id INTEGER NOT NULL,
#             description TEXT,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#             FOREIGN KEY (class_id) REFERENCES classes(id),
#             FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
#         )
#         """)

#         # ----------------- 11. ACTIVATION_STATE -----------------
#                # ----------------------------------------

#         cursor.execute( """
#       CREATE TABLE IF NOT EXISTS recovery_logs (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     school_email TEXT NOT NULL,
#                     recovery_type TEXT NOT NULL,
#                     status TEXT NOT NULL,
#                     details TEXT,
#                     ip_address TEXT,
#                     recovered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
#                 )
# """)
        
        
#         # ----------------- 12. TEACHING ASISTANTS -----------------
#                # ----------------------------------------

#         cursor.execute( """
#      -- Teaching Assistants Table Schema
# CREATE TABLE IF NOT EXISTS teaching_assistants (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     person_id INTEGER NOT NULL,
#     user_id INTEGER,
#     unique_id TEXT,
#     ta_number TEXT NOT NULL,
#     college_university TEXT,
#     college_index_number TEXT,
#     course_of_study TEXT,
#     current_level TEXT,
#     mentee_type TEXT,
#     national_service_id TEXT,
#     date_of_authorization DATE,
#     date_of_termination DATE,
#     status TEXT DEFAULT 'active',
#     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#     FOREIGN KEY (person_id) REFERENCES person_details(id),
#     FOREIGN KEY (user_id) REFERENCES users(id)
# );
# """)

#    # ----------------- 13. NON_STAFF  -----------------
#                # ----------------------------------------

#         cursor.execute( """
#      CREATE TABLE IF NOT EXISTS non_staff (id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER NOT NULL, user_id INTEGER, unique_id TEXT, non_staff_number TEXT NOT NULL, role TEXT NOT NULL, department TEXT, designation TEXT, hired_at DATE, status TEXT DEFAULT 'active', fathers_name TEXT, fathers_contact TEXT, mothers_name TEXT, mothers_contact TEXT, next_of_kin_name TEXT, next_of_kin_contact TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (person_id) REFERENCES person_details(id), FOREIGN KEY (user_id) REFERENCES users(id));
# """)
        

#         # -----------------14. LEVELS  -----------------

#         cursor.execute("""
# CREATE TABLE levels (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name TEXT NOT NULL,
#     category TEXT NOT NULL CHECK (category IN ('JHS','SHS')),
#     order_index INTEGER
# );

# """

#         )
#         # -----------------15. PROGRAMMS  -----------------
#         cursor.execute(""" 
# CREATE TABLE programmes (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name TEXT NOT NULL UNIQUE,
#     description TEXT
# );

# """)
#         # -----------------16.   -----------------
#         cursor.execute(
#             """
# CREATE TABLE classes (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     class_name TEXT NOT NULL,
#     class_code TEXT UNIQUE,

#     level_id INTEGER NOT NULL,
#     programme_id INTEGER,

#     academic_year_id INTEGER NOT NULL,
#     form_master_id INTEGER,

#     description TEXT,

#     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

#     FOREIGN KEY (level_id) REFERENCES levels(id),
#     FOREIGN KEY (programme_id) REFERENCES programmes(id),
#     FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
#     FOREIGN KEY (form_master_id) REFERENCES staff(id)
# );
# """
#         )
#         # ----------------- 17. SUBJECTS -----------------
#         cursor.execute(
# """
# CREATE TABLE subjects (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name TEXT NOT NULL,
#     code TEXT UNIQUE,

#     type TEXT CHECK (type IN ('core','elective'))
# );
# """

#         )
#         # -----------------18. PROGRAM SUBJECTS  -----------------

#         cursor.execute(
#             """
# CREATE TABLE programme_subjects (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     programme_id INTEGER NOT NULL,
#     subject_id INTEGER NOT NULL,

#     UNIQUE(programme_id, subject_id),

#     FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE CASCADE,
#     FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
# );
# """
#         )
#         # -----------------19. LEVEL CORE SUBJECTS  -----------------
#         cursor.execute(
#             """CREATE TABLE level_core_subjects (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     level_id INTEGER NOT NULL,
#     subject_id INTEGER NOT NULL,

#     UNIQUE(level_id, subject_id),

#     FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
#     FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
# );"""
#         )
#         # -----------------20. TEACHER SUBJECTS ASSIGNMENT  -----------------
#         cursor.execute("""
# CREATE TABLE teacher_subject_assignments (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     staff_id INTEGER NOT NULL,
#     class_id INTEGER NOT NULL,
#     subject_id INTEGER NOT NULL,
#     academic_year_id INTEGER NOT NULL,

#     UNIQUE(staff_id, class_id, subject_id, academic_year_id),

#     FOREIGN KEY (staff_id) REFERENCES staff(id),
#     FOREIGN KEY (class_id) REFERENCES classes(id),
#     FOREIGN KEY (subject_id) REFERENCES subjects(id),
#     FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
# );""")

#  # -----------------21. WEEK DAYS  -----------------
#         cursor.execute(
#             """CREATE TABLE week_days (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name TEXT NOT NULL UNIQUE
# );"""
#         )
#   # -----------------22. TIME SLOT  -----------------
#         cursor.execute(
#             """CREATE TABLE time_slots (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name TEXT NOT NULL,

#     start_time TIME NOT NULL,
#     end_time TIME NOT NULL,

#     order_index INTEGER
# );"""
#         )
#    # -----------------23.TIMETABLES  -----------------
#         cursor.execute(
#             """CREATE TABLE timetables (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     class_id INTEGER NOT NULL,
#     subject_id INTEGER NOT NULL,
#     staff_id INTEGER NOT NULL,

#     day_id INTEGER NOT NULL,
#     time_slot_id INTEGER NOT NULL,

#     academic_year_id INTEGER NOT NULL,

#     room TEXT,

#     UNIQUE(class_id, day_id, time_slot_id, academic_year_id),
#     UNIQUE(staff_id, day_id, time_slot_id, academic_year_id),

#     FOREIGN KEY (class_id) REFERENCES classes(id),
#     FOREIGN KEY (subject_id) REFERENCES subjects(id),
#     FOREIGN KEY (staff_id) REFERENCES staff(id),
#     FOREIGN KEY (day_id) REFERENCES week_days(id),
#     FOREIGN KEY (time_slot_id) REFERENCES time_slots(id),
#     FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
# );"""
#         )
#     # -----------------24. TERMS  -----------------
#         cursor.execute(
#             """CREATE TABLE terms (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name TEXT NOT NULL,

#     academic_year_id INTEGER NOT NULL,

#     FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
# );"""
#         )
#      # -----------------25.ASSESMENTS  -----------------
#         cursor.execute(
#          """CREATE TABLE assessments (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     name TEXT NOT NULL,
#     type TEXT,

#     term_id INTEGER NOT NULL,
#     academic_year_id INTEGER NOT NULL,

#     weight REAL CHECK (weight >= 0 AND weight <= 100),

#     FOREIGN KEY (term_id) REFERENCES terms(id),
#     FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
# );
# """
#      )
#      # -----------------26. STUDENTS SCORE  -----------------
#         cursor.execute(
#             """CREATE TABLE student_scores (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     student_id INTEGER NOT NULL,
#     subject_id INTEGER NOT NULL,
#     assessment_id INTEGER NOT NULL,

#     score REAL CHECK (score >= 0 AND score <= 100),

#     UNIQUE(student_id, subject_id, assessment_id),

#     FOREIGN KEY (student_id) REFERENCES students(id),
#     FOREIGN KEY (subject_id) REFERENCES subjects(id),
#     FOREIGN KEY (assessment_id) REFERENCES assessments(id)
# );
# """
#         )
#  # -----------------27. STUDENTS SUBJECT RESULTS -----------------
#         cursor.execute(
#             """CREATE TABLE student_subject_results (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     student_id INTEGER NOT NULL,
#     subject_id INTEGER NOT NULL,
#     term_id INTEGER NOT NULL,
#     class_id INTEGER NOT NULL,

#     class_score REAL,
#     exam_score REAL,
#     total_score REAL,

#     grade TEXT,
#     remark TEXT,
#     position INTEGER,

#     UNIQUE(student_id, subject_id, term_id),

#     FOREIGN KEY (student_id) REFERENCES students(id),
#     FOREIGN KEY (subject_id) REFERENCES subjects(id),
#     FOREIGN KEY (term_id) REFERENCES terms(id),
#     FOREIGN KEY (class_id) REFERENCES classes(id)
# );
# """
#         )

#          # -----------------28. STUDENT TERM RESULTS  -----------------
#         cursor.execute(
#             """CREATE TABLE student_term_results (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     student_id INTEGER NOT NULL,
#     class_id INTEGER NOT NULL,
#     term_id INTEGER NOT NULL,

#     total_marks REAL,
#     average_score REAL,

#     overall_grade TEXT,
#     position INTEGER,

#     UNIQUE(student_id, term_id),

#     FOREIGN KEY (student_id) REFERENCES students(id),
#     FOREIGN KEY (class_id) REFERENCES classes(id),
#     FOREIGN KEY (term_id) REFERENCES terms(id)
# );"""
#         )
#           # -----------------29. STUDENT PROMOTIONS  -----------------
#         cursor.execute(
#             """CREATE TABLE student_promotions (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     student_id INTEGER NOT NULL,
#     from_class_id INTEGER,
#     to_class_id INTEGER,

#     academic_year_id INTEGER NOT NULL,

#     status TEXT CHECK (status IN ('promoted','repeated','graduated')),

#     FOREIGN KEY (student_id) REFERENCES students(id),
#     FOREIGN KEY (from_class_id) REFERENCES classes(id),
#     FOREIGN KEY (to_class_id) REFERENCES classes(id),
#     FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
# );
# """
#         )
#            # -----------------30. STUDENT CLASS HISTORY  -----------------
#         cursor.execute(
#                """CREATE TABLE student_class_history (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,

#     student_id INTEGER NOT NULL,
#     class_id INTEGER NOT NULL,
#     academic_year_id INTEGER NOT NULL,

#     status TEXT,

#     FOREIGN KEY (student_id) REFERENCES students(id),
#     FOREIGN KEY (class_id) REFERENCES classes(id),
#     FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
# );"""
#            )
#             # -----------------2  -----------------



#     # Add more tables here if needed (students, staff, classes, sections, etc.)

#     conn.commit()
#     conn.close()
#     print(" All required tables are ensured in the encrypted database.")


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

    # ----------------- 1. USERS (UNCHANGED) -----------------
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
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # ----------------- 2. SCHOOL_INFO (ENHANCED) -----------------
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

    # ----------------- 3. PERSON_DETAILS (ENHANCED) -----------------
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

    # ----------------- 4. ACTIVATION_HISTORY (UNCHANGED) -----------------
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

    # ----------------- 5. DEVICES (UNCHANGED) -----------------
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

    # ----------------- 6. STUDENTS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER NOT NULL UNIQUE,
        unique_id TEXT NOT NULL UNIQUE,
        student_number TEXT UNIQUE NOT NULL,
        user_id INTEGER UNIQUE,
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
        enrolled_at DATE DEFAULT CURRENT_DATE,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','graduated','withdrawn','transferred')),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        deleted_at DATETIME,
        deleted_by INTEGER,
        FOREIGN KEY (person_id) REFERENCES person_details(id) ON DELETE RESTRICT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE RESTRICT,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id),
        FOREIGN KEY (deleted_by) REFERENCES users(id)
    )
    """)

    # ----------------- 7. STAFF (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER NOT NULL UNIQUE,
        unique_id TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL UNIQUE,
        staff_number TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin','teacher','ta','accountant','librarian','guidance')),
        department TEXT,
        qualification TEXT,
        specialization TEXT,
        hired_at DATE,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','terminated','on_leave')),
        marital_status TEXT CHECK (marital_status IN ('single','married','divorced','widowed','other')),
        spouse_name TEXT,
        spouse_phone TEXT,
        place_of_birth TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        deleted_at DATETIME,
        deleted_by INTEGER,
        FOREIGN KEY (person_id) REFERENCES person_details(id) ON DELETE RESTRICT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id),
        FOREIGN KEY (deleted_by) REFERENCES users(id)
    )
    """)

    # ----------------- 8. ACADEMIC_YEARS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS academic_years (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year_label TEXT NOT NULL UNIQUE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_current BOOLEAN DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    )
    """)

    # ----------------- 9. LEVELS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('JHS','SHS')),
        order_index INTEGER NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, order_index)
    )
    """)

    # ----------------- 10. PROGRAMMES (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS programmes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        code TEXT UNIQUE,
        description TEXT,
        category TEXT CHECK (category IN ('JHS','SHS')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # ----------------- 11. CLASSES (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classes (
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

    # ----------------- 12. SECTIONS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_name TEXT NOT NULL,
        class_id INTEGER NOT NULL,
        academic_year_id INTEGER NOT NULL,
        description TEXT,
        capacity INTEGER DEFAULT 40,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id),
        UNIQUE(class_id, section_name, academic_year_id)
    )
    """)

    # ----------------- 13. TEACHING ASSISTANTS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teaching_assistants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER NOT NULL,
        user_id INTEGER,
        unique_id TEXT,
        ta_number TEXT NOT NULL UNIQUE,
        college_university TEXT,
        college_index_number TEXT,
        course_of_study TEXT,
        current_level TEXT,
        mentee_type TEXT,
        national_service_id TEXT,
        supervising_teacher_id INTEGER,
        date_of_authorization DATE,
        date_of_termination DATE,
        status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','terminated')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (person_id) REFERENCES person_details(id) ON DELETE RESTRICT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (supervising_teacher_id) REFERENCES staff(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    )
    """)

    # ----------------- 14. NON_STAFF (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS non_staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER NOT NULL,
        user_id INTEGER,
        unique_id TEXT,
        non_staff_number TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        department TEXT,
        designation TEXT,
        hired_at DATE,
        status TEXT DEFAULT 'active' CHECK (status IN ('active','terminated','resigned')),
        fathers_name TEXT,
        fathers_contact TEXT,
        mothers_name TEXT,
        mothers_contact TEXT,
        next_of_kin_name TEXT,
        next_of_kin_contact TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (person_id) REFERENCES person_details(id) ON DELETE RESTRICT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    )
    """)

    # ----------------- 15. SUBJECTS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('core','elective')),
        category TEXT CHECK (category IN ('JHS','SHS','BOTH')) DEFAULT 'BOTH',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # ----------------- 16. LEVEL CORE SUBJECTS -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS level_core_subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE(level_id, subject_id)
    )
    """)

    # ----------------- 17. PROGRAMME SUBJECTS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS programme_subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        programme_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        is_required BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE(programme_id, subject_id)
    )
    """)

    # ----------------- 18. TEACHER QUALIFICATIONS (NEW) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teacher_qualifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        qualification_level TEXT,
        certified_since DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE(staff_id, subject_id)
    )
    """)

    # ----------------- 19. TEACHER SUBJECT ASSIGNMENTS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        academic_year_id INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id),
        UNIQUE(staff_id, class_id, subject_id, academic_year_id)
    )
    """)

    # ----------------- 20. WEEK DAYS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS week_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        order_index INTEGER,
        is_active BOOLEAN DEFAULT 1
    )
    """)

    # ----------------- 21. TIME SLOTS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS time_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        order_index INTEGER,
        is_break BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # ----------------- 22. TIMETABLES (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS timetables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        staff_id INTEGER NOT NULL,
        day_id INTEGER NOT NULL,
        time_slot_id INTEGER NOT NULL,
        academic_year_id INTEGER NOT NULL,
        room TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
        FOREIGN KEY (day_id) REFERENCES week_days(id) ON DELETE RESTRICT,
        FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE RESTRICT,
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id),
        UNIQUE(class_id, day_id, time_slot_id, academic_year_id),
        UNIQUE(staff_id, day_id, time_slot_id, academic_year_id),
        UNIQUE(room, day_id, time_slot_id, academic_year_id)
    )
    """)

    # ----------------- 23. TERMS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS terms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        term_number INTEGER NOT NULL,
        academic_year_id INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        UNIQUE(academic_year_id, term_number),
        UNIQUE(academic_year_id, name)
    )
    """)

    # ----------------- 24. GRADE BOUNDARIES (NEW) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS grade_boundaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        grade TEXT NOT NULL,
        min_score REAL NOT NULL,
        max_score REAL NOT NULL,
        remark TEXT,
        grade_point REAL DEFAULT 0,
        level_category TEXT CHECK (level_category IN ('JHS','SHS','BOTH')) DEFAULT 'BOTH',
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    )
    """)

    # ----------------- 25. ASSESSMENTS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK (type IN ('quiz','test','exam','project','homework','classwork')),
        term_id INTEGER NOT NULL,
        academic_year_id INTEGER NOT NULL,
        subject_id INTEGER,
        weight REAL CHECK (weight >= 0 AND weight <= 100),
        max_score REAL DEFAULT 100,
        assessment_date DATE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    )
    """)

    # ----------------- 26. STUDENT SCORES (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        assessment_id INTEGER NOT NULL,
        term_id INTEGER NOT NULL,
        score REAL CHECK (score >= 0),
        is_absent BOOLEAN DEFAULT 0,
        remarks TEXT,
        entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
        FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id),
        UNIQUE(student_id, assessment_id)
    )
    """)

    # ----------------- 27. STUDENT SUBJECT RESULTS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_subject_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        term_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        total_score REAL,
        grade TEXT,
        grade_point REAL,
        remark TEXT,
        position_in_class INTEGER,
        position_in_section INTEGER,
        computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME,
        published_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (published_by) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id),
        UNIQUE(student_id, subject_id, term_id)
    )
    """)

    # ----------------- 28. STUDENT TERM RESULTS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_term_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        term_id INTEGER NOT NULL,
        total_marks REAL,
        average_score REAL,
        overall_grade TEXT,
        overall_grade_point REAL,
        position_in_class INTEGER,
        position_in_section INTEGER,
        total_subjects_passed INTEGER,
        total_subjects_failed INTEGER,
        computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME,
        published_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
        FOREIGN KEY (published_by) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id),
        UNIQUE(student_id, term_id)
    )
    """)

    # ----------------- 29. STUDENT CLASS HISTORY (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_class_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        academic_year_id INTEGER NOT NULL,
        section_id INTEGER,
        enrollment_date DATE DEFAULT CURRENT_DATE,
        withdrawal_date DATE,
        status TEXT CHECK (status IN ('enrolled','transferred','withdrawn','graduated')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        UNIQUE(student_id, academic_year_id)
    )
    """)

    # ----------------- 30. STUDENT PROMOTIONS (ENHANCED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_promotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        from_class_id INTEGER,
        to_class_id INTEGER NOT NULL,
        from_academic_year_id INTEGER NOT NULL,
        to_academic_year_id INTEGER NOT NULL,
        promotion_date DATE DEFAULT CURRENT_DATE,
        status TEXT NOT NULL CHECK (status IN ('promoted','repeated','graduated','transferred')),
        decision_reason TEXT,
        approved_by INTEGER,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (from_class_id) REFERENCES classes(id) ON DELETE SET NULL,
        FOREIGN KEY (to_class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (from_academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (to_academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    )
    """)

    # ----------------- 31. ATTENDANCE (NEW - MINIMUM VIABLE) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        academic_year_id INTEGER NOT NULL,
        term_id INTEGER NOT NULL,
        date DATE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('present','absent','late','excused','holiday')),
        time_in TIME,
        time_out TIME,
        reason TEXT,
        marked_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
        FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES staff(id) ON DELETE RESTRICT,
        UNIQUE(student_id, date)
    )
    """)

    # ----------------- 32. RECOVERY LOGS (UNCHANGED) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recovery_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_email TEXT NOT NULL,
        recovery_type TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        recovered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    """)

        # ----------------- 33. NOTIFICATIONS (NEW) -----------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notification_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        title_template TEXT NOT NULL,
        body_template TEXT NOT NULL,
        type TEXT CHECK (type IN ('email', 'sms', 'push', 'in_app')) DEFAULT 'in_app',
        category TEXT CHECK (category IN ('academic', 'attendance', 'fee', 'event', 'system', 'promotion')),
        variables JSON,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_id TEXT NOT NULL UNIQUE,
        recipient_user_id INTEGER,
        recipient_role TEXT CHECK (recipient_role IN ('admin', 'teacher', 'ta', 'accountant', 'student', 'parent', 'non_staff', 'all')),
        recipient_entity_id INTEGER,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        type TEXT CHECK (type IN ('email', 'sms', 'push', 'in_app')) NOT NULL,
        priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
        category TEXT CHECK (category IN ('academic', 'attendance', 'fee', 'event', 'system', 'promotion')),
        related_entity_type TEXT,
        related_entity_id INTEGER,
        scheduled_for DATETIME,
        sent_at DATETIME,
        delivered_at DATETIME,
        read_at DATETIME,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
        failure_reason TEXT,
        retry_count INTEGER DEFAULT 0,
        metadata JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notification_recipients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
        sent_at DATETIME,
        read_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(notification_id, user_id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notification_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('academic', 'attendance', 'fee', 'event', 'system', 'promotion')),
        channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
        is_enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, category, channel)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_id INTEGER NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('create', 'schedule', 'send', 'deliver', 'read', 'fail', 'cancel')),
        performed_by INTEGER,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
        FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS email_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_id INTEGER NOT NULL,
        recipient_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        attachments JSON,
        priority INTEGER DEFAULT 5,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
        retry_count INTEGER DEFAULT 0,
        last_error TEXT,
        scheduled_at DATETIME,
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sms_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_id INTEGER NOT NULL,
        recipient_phone TEXT NOT NULL,
        message TEXT NOT NULL,
        provider TEXT,
        priority INTEGER DEFAULT 5,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
        retry_count INTEGER DEFAULT 0,
        last_error TEXT,
        scheduled_at DATETIME,
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- General
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    timezone TEXT DEFAULT 'Africa/Accra',
    language TEXT DEFAULT 'English',

    -- Security
    session_timeout INTEGER DEFAULT 30,           -- minutes
    password_expiry INTEGER DEFAULT 90,           -- days
    two_factor_required BOOLEAN DEFAULT 1,

    -- Email Configuration
    smtp_server TEXT,
    smtp_port INTEGER,
    smtp_encryption TEXT CHECK (smtp_encryption IN ('TLS','SSL','NONE')) DEFAULT 'TLS',
    email_from_address TEXT,
    email_from_name TEXT,

    -- SMS Configuration
    sms_provider TEXT,
    sms_api_key TEXT,
    sms_sender_id TEXT,

    -- Notifications
    quiet_hours_start TIME,
    quiet_hours_end TIME,

    -- Features
    enable_parent_portal BOOLEAN DEFAULT 1,
    enable_sms BOOLEAN DEFAULT 1,
    enable_push BOOLEAN DEFAULT 1,
    enable_fee_module BOOLEAN DEFAULT 0,

    -- Integrations
    payment_gateway TEXT,
    lms_url TEXT,

    -- System Behavior
    mode TEXT CHECK (mode IN ('online','offline')) DEFAULT 'online',
    live_mode BOOLEAN DEFAULT 1,
    peak_mode BOOLEAN DEFAULT 0,


    -- Sync
    last_sync DATETIME,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,

    FOREIGN KEY (updated_by) REFERENCES users(id)
)


""")
    






    # Insert default notification templates
    cursor.execute("SELECT COUNT(*) FROM notification_templates")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO notification_templates (name, title_template, body_template, type, category, variables, is_active)
            VALUES 
                ('result_published', 'Results Available - {{term_name}} {{academic_year}}', 'Dear {{student_name}}, your results for {{term_name}} {{academic_year}} are now available. Average: {{average}}%, Grade: {{grade}}', 'in_app', 'academic', '["student_name", "term_name", "academic_year", "average", "grade"]', 1),
                ('result_published_email', 'Academic Results - {{term_name}} {{academic_year}}', 'Dear Parent,\n\nYour child {{student_name}} results for {{term_name}} {{academic_year}} are now available.\n\nAverage Score: {{average}}%\nOverall Grade: {{grade}}\nPosition in Class: {{position}}\n\nLogin to the portal to view detailed results.', 'email', 'academic', '["student_name", "term_name", "academic_year", "average", "grade", "position"]', 1),
                ('attendance_alert', 'Attendance Alert - {{student_name}}', 'Your child {{student_name}} was marked {{status}} on {{date}}. Reason: {{reason}}', 'in_app', 'attendance', '["student_name", "status", "date", "reason"]', 1),
                ('fee_reminder', 'Fee Payment Reminder', 'This is a reminder that school fees of {{amount}} for {{term_name}} {{academic_year}} are due by {{due_date}}. Current balance: {{balance}}', 'in_app', 'fee', '["amount", "term_name", "academic_year", "due_date", "balance"]', 1),
                ('promotion_notification', 'Academic Promotion - {{new_class}}', 'Congratulations! Your child {{student_name}} has been promoted to {{new_class}} for the {{new_academic_year}} academic year.', 'in_app', 'promotion', '["student_name", "new_class", "new_academic_year"]', 1),
                ('class_timetable_updated', 'Timetable Updated - {{class_name}}', 'The timetable for {{class_name}} has been updated for {{term_name}} {{academic_year}}. Please check your portal.', 'in_app', 'academic', '["class_name", "term_name", "academic_year"]', 1)
        """)

    # Add notification indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification ON notification_recipients(notification_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notification_recipients_user ON notification_recipients(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON sms_queue(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sms_queue_scheduled ON sms_queue(scheduled_at)")

    # =============================================
    # PERFORMANCE INDEXES
    # =============================================
    
    # Person & User indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_person_details_email ON person_details(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_person_details_phone ON person_details(phone)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)")
    
    # Student indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_person ON students(person_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_academic_year ON students(academic_year_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_status ON students(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_student_number ON students(student_number)")
    
    # Staff indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_staff_person ON staff(person_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role)")
    
    # Academic indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(level_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sections_class ON sections(class_id)")
    
    # Subject assignment indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_teacher_subject_staff ON teacher_subject_assignments(staff_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_teacher_subject_class ON teacher_subject_assignments(class_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_teacher_subject_academic_year ON teacher_subject_assignments(academic_year_id)")
    
    # Timetable indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timetables_class ON timetables(class_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timetables_staff ON timetables(staff_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timetables_day ON timetables(day_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timetables_academic_year ON timetables(academic_year_id)")
    
    # Assessment indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_term ON assessments(term_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_academic_year ON assessments(academic_year_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject_id)")
    
    # Scores indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scores_student ON student_scores(student_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scores_assessment ON student_scores(assessment_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scores_term ON student_scores(term_id)")
    
    # Results indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_subject_results_student ON student_subject_results(student_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_subject_results_term ON student_subject_results(term_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_subject_results_class ON student_subject_results(class_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_term_results_student ON student_term_results(student_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_term_results_term ON student_term_results(term_id)")
    
    # Attendance indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_attendance_student_term ON attendance(student_id, term_id)")
    
    # History indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_class_history_student ON student_class_history(student_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_class_history_academic_year ON student_class_history(academic_year_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_promotions_student ON student_promotions(student_id)")

    # Insert default grade boundaries if none exist
    cursor.execute("SELECT COUNT(*) FROM grade_boundaries")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO grade_boundaries (grade, min_score, max_score, remark, grade_point, level_category, is_default)
            VALUES 
                ('A', 80, 100, 'Excellent', 4.0, 'BOTH', 1),
                ('B', 70, 79, 'Very Good', 3.0, 'BOTH', 0),
                ('C', 60, 69, 'Good', 2.0, 'BOTH', 0),
                ('D', 50, 59, 'Credit', 1.0, 'BOTH', 0),
                ('E', 40, 49, 'Pass', 0.5, 'BOTH', 0),
                ('F', 0, 39, 'Fail', 0.0, 'BOTH', 0)
        """)

    conn.commit()
    conn.close()
    print("All required tables are ensured in the encrypted database.")



# =========================
# Activation State Functions
# =========================
# def is_activated() -> bool:
#     ensure_all_tables()
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT activated FROM activation_state WHERE id = 1")
#     result = cursor.fetchone()
#     conn.close()
#     return bool(result['activated']) if result else False

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
