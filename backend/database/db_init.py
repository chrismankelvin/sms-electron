

# # database/db_init.py
# import sqlite3
# import os
# from pathlib import Path
# import hashlib
# from datetime import datetime
# import uuid

# def initialize_database():
#     """Initialize the local SQLite database with all tables"""
    
#     # Database paths
#     script_dir = Path(__file__).parent
#     db_path = script_dir / "school.db"
    
#     print(f"📁 Database path: {db_path}")
    
#     # Create directory if it doesn't exist
#     db_path.parent.mkdir(parents=True, exist_ok=True)
    
#     # Connect to database
#     conn = sqlite3.connect(str(db_path))
#     cursor = conn.cursor()
    
#     print("🚀 Initializing database...")
    
#     try:
#         # ============================================
#         # 1. USERS TABLE
#         # ============================================
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS users (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             unique_id TEXT NOT NULL UNIQUE,
#             username TEXT NOT NULL UNIQUE,
#             email TEXT UNIQUE,
#             password_hash TEXT NOT NULL,
#             role TEXT NOT NULL CHECK (
#                 role IN ('admin', 'teacher', 'ta', 'accountant', 'student')
#             ),
#             status TEXT NOT NULL DEFAULT 'active' CHECK (
#                 status IN ('active', 'suspended', 'disabled')
#             ),
#             last_login DATETIME,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
#         )
#         """)
#         print("✅ Created users table")
        
#         # ============================================
#         # 2. SCHOOL_INFO TABLE
#         # ============================================
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
#             school_type TEXT CHECK (
#                 school_type IN ('public','private','charter','other')
#             ),
            
#             -- Activation/license info
#             license_key_hash TEXT,
#             license_type TEXT DEFAULT 'STANDARD',
#             licensed_devices INTEGER DEFAULT 1,
#             license_valid_until DATE,
#             last_license_sync DATETIME,
            
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
#         )
#         """)
#         print("✅ Created school_info table")
        
#         # ============================================
#         # 3. PERSON_DETAILS TABLE
#         # ============================================
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
#         print("✅ Created person_details table")
        
#         # ============================================
#         # 4. ACTIVATION_HISTORY TABLE
#         # ============================================
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
#         print("✅ Created activation_history table")
        
#         # ============================================
#         # 5. DEVICES TABLE
#         # ============================================
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
            
#             -- Activation info
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
#         print("✅ Created devices table")
        
#         # ============================================
#         # 6. STUDENTS TABLE
#         # ============================================
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
            
#             status TEXT NOT NULL DEFAULT 'active' CHECK (
#                 status IN ('active','suspended','graduated','withdrawn')
#             ),
            
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
#             FOREIGN KEY (person_id) REFERENCES person_details(id)
#         )
#         """)
#         print("✅ Created students table")
        
#         # ============================================
#         # 7. STAFF TABLE
#         # ============================================
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
#         print("✅ Created staff table")
        
#         # ============================================
#         # 8. ACADEMIC_YEARS TABLE
#         # ============================================
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS academic_years (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             year_label TEXT NOT NULL UNIQUE,
#             start_date DATE NOT NULL,
#             end_date DATE NOT NULL,
#             status TEXT NOT NULL DEFAULT 'active' CHECK (
#                 status IN ('active','inactive','archived')
#             ),
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
#         )
#         """)
#         print("✅ Created academic_years table")
        
#         # ============================================
#         # 9. CLASSES TABLE
#         # ============================================
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS classes (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             class_name TEXT NOT NULL,
#             class_code TEXT UNIQUE,
#             academic_year_id INTEGER NOT NULL,
#             description TEXT,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#             FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
#         )
#         """)
#         print("✅ Created classes table")
        

#         # ============================================
# # ACTIVATION_STATE TABLE (replaces activation_state.json)
# # ============================================
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS activation_state (
#             id INTEGER PRIMARY KEY DEFAULT 1,  -- Single row table
#             activated BOOLEAN NOT NULL DEFAULT FALSE,
#             activation_code TEXT,
#             machine_fingerprint TEXT,
#             school_name TEXT,
#             activated_at DATETIME,
#             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#             CHECK (id = 1)  -- Ensures only one row
#         )
#         """)
#         print("✅ Created activation_state table")


#         # ============================================
#         # 10. SECTIONS TABLE (FIXED - removed ON UPDATE)
#         # ============================================
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
#         print("✅ Created sections table")
        
#         # ============================================
#         # 11. CREATE INDEXES
#         # ============================================
#         print("\n🔍 Creating indexes...")
        
#         # Users indexes
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)")
        
#         # Activation indexes
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_activation_token ON activation_history(activation_token_hash)")
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_activation_device ON activation_history(device_id)")
        
#         # School info indexes
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_school_info_email ON school_info(email)")
        
#         # Person details indexes
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_person_email ON person_details(email)")
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_person_unique_id ON person_details(unique_id)")
        
#         # Students indexes
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_number ON students(student_number)")
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_students_person ON students(person_id)")
        
#         # Staff indexes
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_staff_number ON staff(staff_number)")
#         cursor.execute("CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id)")
        
#         print("✅ All indexes created")
        
#         conn.commit()
        
#         # Verify tables were created
#         cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
#         tables = cursor.fetchall()
        
#         print(f"\n📊 Database initialized with {len(tables)} tables:")
#         for table in tables:
#             print(f"  • {table[0]}")
        
#         # Show users added
#         # cursor.execute("""
#         #     SELECT u.username, u.role, p.first_name, p.last_name 
#         #     FROM users u 
#         #     LEFT JOIN person_details p ON u.email = p.email 
#         #     ORDER BY u.role, u.username
#         # """)
#         # users = cursor.fetchall()
        
#         # print(f"\n👤 Users in database ({len(users)}):")
#         # for user in users:
#             print(f"  • {user[0]} ({user[1]}) - {user[2]} {user[3]}")
            
#         print(f"\n🎉 Database ready at: {db_path}")
#         # print("\n🔑 Default Login Credentials:")
#         # print("  Admin: admin / admin123")
#         # print("  Teacher: teacher1 / teacher123")
#         # print("  TA: ta1 / ta123456")
#         # print("  Student: student1 / student123")
        
#     except sqlite3.Error as e:
#         print(f"❌ Database error: {e}")
#         conn.rollback()
#         raise
#     except Exception as e:
#         print(f"❌ Error: {e}")
#         conn.rollback()
#         raise
#     finally:
#         conn.close()

# def check_database_integrity():
#     """Check if all required tables exist"""
    
#     db_path = Path("database/school.db")
    
#     if not db_path.exists():
#         print("❌ Database file does not exist!")
#         return False
    
#     required_tables = [
#         'users', 'school_info', 'person_details', 'activation_history',
#         'devices', 'students', 'staff', 'academic_years', 'classes', 'sections'
#     ]
    
#     try:
#         conn = sqlite3.connect(str(db_path))
#         cursor = conn.cursor()
        
#         cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
#         existing_tables = [table[0] for table in cursor.fetchall()]
        
#         missing_tables = [table for table in required_tables if table not in existing_tables]
        
#         if missing_tables:
#             print(f"❌ Missing tables: {', '.join(missing_tables)}")
#             return False
#         else:
#             print("✅ All required tables exist")
#             return True
            
#     except Exception as e:
#         print(f"❌ Error checking database: {e}")
#         return False
#     finally:
#         conn.close()

# def reset_database():
#     """Reset database (DANGEROUS - use for development only)"""
    
#     print("⚠️ WARNING: This will DELETE ALL DATA in the database!")
#     response = input("Are you sure? Type 'YES' to continue: ")
    
#     if response != 'YES':
#         print("Operation cancelled.")
#         return
    
#     db_path = Path("database/school.db")
    
#     if db_path.exists():
#         # Backup old database
#         backup_path = db_path.with_suffix('.db.backup')
#         try:
#             import shutil
#             shutil.copy2(db_path, backup_path)
#             print(f"✅ Database backed up to: {backup_path}")
#         except:
#             print("⚠️ Could not create backup")
    
#     # Delete and recreate
#     if db_path.exists():
#         db_path.unlink()
#         print("✅ Old database deleted")
    
#     initialize_database()

# if __name__ == "__main__":
#     print("="*60)
#     print("SCHOOL MANAGEMENT SYSTEM - DATABASE SETUP")
#     print("="*60)
    
#     print("\nOptions:")
#     print("1. Initialize/Create database")
#     print("2. Check database integrity")
#     print("3. Reset database (DANGEROUS!)")
#     print("4. Exit")
    
#     choice = input("\nEnter choice (1-4): ").strip()
    
#     if choice == "1":
#         initialize_database()
#     elif choice == "2":
#         check_database_integrity()
#     elif choice == "3":
#         reset_database()
#     elif choice == "4":
#         print("Exiting...")
#     else:
#         print("Invalid choice!")



# database/db_init.py
import sqlite3
from pathlib import Path
from datetime import datetime

def initialize_database(db_path: Path):
    """Initialize the local SQLite database with all tables"""

    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    print(f"📁 Creating database at {db_path}")

    try:
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
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS activation_state (
            id INTEGER PRIMARY KEY DEFAULT 1,
            activated BOOLEAN NOT NULL DEFAULT FALSE,
            activation_code TEXT,
            machine_fingerprint TEXT,
            school_name TEXT,
            activated_at DATETIME,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CHECK (id = 1)
        )
        """)

        conn.commit()
        print("✅ All tables created successfully.")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error initializing database: {e}")
        raise
    finally:
        conn.close()
