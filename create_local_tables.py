# create_local_tables.py
import sqlite3
from pathlib import Path

# Database path - same as in your main.py
LOCAL_DB_PATH = Path("./school.db")

def create_local_tables():
    """Create all necessary tables in local SQLite database"""
    
    # Create database directory if it doesn't exist
    LOCAL_DB_PATH.parent.mkdir(exist_ok=True)
    
    print(f"Creating/updating database at: {LOCAL_DB_PATH}")
    
    # Connect to SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 1. Create school_info table
        print("Creating school_info table...")
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
                school_type TEXT CHECK (
                    school_type IN ('public','private','charter','other')
                ),
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ school_info table created")
        
        # 2. Create users table
        print("Creating users table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                unique_id TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK (
                    role IN ('admin', 'teacher', 'ta', 'accountant', 'student')
                ),
                status TEXT NOT NULL DEFAULT 'active' CHECK (
                    status IN ('active', 'suspended', 'disabled')
                ),
                last_login DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ users table created")
        
        # 3. Optional: Create activation_status table for tracking
        print("Creating activation_status table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activation_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                activated BOOLEAN NOT NULL DEFAULT 0,
                activation_code TEXT,
                activated_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ activation_status table created")
        
        # 4. Create an index for faster queries
        print("Creating indexes...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_school_info_email ON school_info(email)")
        print("✅ Indexes created")
        
        # Commit all changes
        conn.commit()
        
        print("\n🎉 All tables created successfully!")
        
        # Show what tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        
        print("\nTables in database:")
        for table in tables:
            print(f"  - {table[0]}")
            
    except sqlite3.Error as e:
        print(f"❌ SQLite error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        # Close the connection
        conn.close()
        print(f"\nDatabase connection closed.")

def verify_tables():
    """Verify that tables exist and show their structure"""
    print("\n🔍 Verifying table structures...")
    
    if not LOCAL_DB_PATH.exists():
        print("❌ Database file does not exist!")
        return
    
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        
        if not tables:
            print("❌ No tables found in database!")
            return
        
        print(f"Found {len(tables)} tables:")
        
        for table_name in tables:
            table = table_name[0]
            print(f"\n📋 Table: {table}")
            print("  Columns:")
            
            # Get table structure
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            
            for col in columns:
                col_id, col_name, col_type, not_null, default_val, pk = col
                print(f"    - {col_name} ({col_type})"
                      f"{' PRIMARY KEY' if pk else ''}"
                      f"{' NOT NULL' if not_null else ''}"
                      f"{f' DEFAULT {default_val}' if default_val else ''}")
            
            # Count rows
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  Rows: {count}")
            
    except sqlite3.Error as e:
        print(f"❌ Error verifying tables: {e}")
    finally:
        conn.close()

def drop_and_recreate():
    """Drop all tables and recreate them (DANGEROUS - use for development only!)"""
    print("⚠️ WARNING: This will DROP ALL TABLES and recreate them!")
    response = input("Are you sure? Type 'YES' to continue: ")
    
    if response != 'YES':
        print("Operation cancelled.")
        return
    
    if not LOCAL_DB_PATH.exists():
        print("Database doesn't exist yet. Creating...")
        create_local_tables()
        return
    
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        
        print(f"Dropping {len(tables)} tables...")
        for table_name in tables:
            table = table_name[0]
            if not table.startswith('sqlite_'):  # Don't drop system tables
                cursor.execute(f"DROP TABLE IF EXISTS {table}")
                print(f"  Dropped: {table}")
        
        conn.commit()
        print("✅ All tables dropped")
        
        # Recreate tables
        conn.close()
        create_local_tables()
        
    except sqlite3.Error as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("LOCAL DATABASE TABLE CREATION SCRIPT")
    print("=" * 60)
    print("\nChoose an option:")
    print("1. Create/Update tables (safe - won't delete existing data)")
    print("2. Verify table structures")
    print("3. DROP ALL and recreate (DANGEROUS - development only!)")
    print("4. Exit")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == "1":
        create_local_tables()
        verify_tables()
    elif choice == "2":
        verify_tables()
    elif choice == "3":
        drop_and_recreate()
    elif choice == "4":
        print("Exiting...")
    else:
        print("Invalid choice!")
    
    print("\nScript completed.")