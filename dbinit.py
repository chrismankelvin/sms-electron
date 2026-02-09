# # import sqlite3
# # from passlib.context import CryptContext
# # from datetime import datetime

# # pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # # Connect to SQLite (or SQLCipher if encrypted)
# # conn = sqlite3.connect("school.db")
# # cursor = conn.cursor()

# # # Create table
# # cursor.execute("""
# # CREATE TABLE IF NOT EXISTS users (
# #     id INTEGER PRIMARY KEY AUTOINCREMENT,
# #     username TEXT NOT NULL UNIQUE,
# #     password_hash TEXT NOT NULL,
# #     role TEXT NOT NULL,
# #     is_active BOOLEAN NOT NULL DEFAULT 1,
# #     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
# # )
# # """)

# # # Users to insert
# # users = [
# #     ("superadmin", "superpass", "SUPER_ADMIN"),
# #     ("admin", "adminpass", "ADMIN"),
# #     ("staff1", "staffpass", "STAFF"),
# #     ("student1", "studentpass", "STUDENT")
# # ]

# # for username, password, role in users:
# #     password_hash = pwd_context.hash(password)
# #     cursor.execute("""
# #         INSERT INTO users (username, password_hash, role, is_active, created_at)
# #         VALUES (?, ?, ?, 1, ?)
# #     """, (username, password_hash, role, datetime.utcnow()))

# # conn.commit()
# # conn.close()

# # print("Database initialized with test users!")


# import sqlite3
# from passlib.context import CryptContext
# from datetime import datetime
# import uuid

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # Connect to SQLite
# conn = sqlite3.connect("school.db")
# cursor = conn.cursor()

# # ========== ADD SCHOOL_INFO TABLE ==========
# cursor.execute("""
# CREATE TABLE IF NOT EXISTS school_info (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     school_name TEXT NOT NULL,
#     email TEXT,
#     phone TEXT,
#     address TEXT,
#     city TEXT,
#     state TEXT,
#     country TEXT,
#     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
#     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
# )
# """)

# # Insert default school info if not exists
# cursor.execute("""
# INSERT OR IGNORE INTO school_info 
# (school_name, email, phone, address, city, state, country)
# VALUES (?, ?, ?, ?, ?, ?, ?)
# """, (
#     "Your School Name",
#     "school@example.com",
#     "+1234567890",
#     "123 School Street",
#     "City",
#     "State",
#     "Country"
# ))

# # ========== YOUR EXISTING USERS TABLE ==========
# cursor.execute("""
# CREATE TABLE IF NOT EXISTS users (
       
#  id INTEGER PRIMARY KEY AUTOINCREMENT,
#     unique_id TEXT NOT NULL UNIQUE,        
#     username TEXT NOT NULL UNIQUE,         
#     email TEXT UNIQUE,                    
#     password_hash TEXT NOT NULL,          
#     role TEXT NOT NULL,
#     status BOOLEAN NOT NULL DEFAULT 1,     
#     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
# )
# """)

# # ========== ADD ACTIVATION_STATUS TABLE ==========
# cursor.execute("""
# CREATE TABLE IF NOT EXISTS activation_status (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     activated BOOLEAN NOT NULL DEFAULT 0,
#     activation_code TEXT,
#     activated_at DATETIME,
#     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
# )
# """)

# # Insert default activation status
# cursor.execute("""
# INSERT OR IGNORE INTO activation_status 
# (activated, activation_code)
# VALUES (?, ?)
# """, (0, None))

# # ========== INSERT YOUR EXISTING USERS ==========
# users = [
#     ("superadmin", "superpass", "SUPER_ADMIN"),
#     ("admin", "adminpass", "ADMIN"),
#     ("staff1", "staffpass", "STAFF"),
#     ("student1", "studentpass", "STUDENT")
# ]

# for username, password, role in users:
#     # Check if user already exists
#     cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
#     if not cursor.fetchone():
#         password_hash = pwd_context.hash(password)
#         cursor.execute("""
#             INSERT INTO users (username, password_hash, role, is_active, created_at)
#             VALUES (?, ?, ?, 1, ?)
#         """, (username, password_hash, role, datetime.utcnow()))

# conn.commit()

# # ========== VERIFY ==========
# print("✅ Database initialized successfully!")
# print("\n📊 Tables created:")
# cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
# for table in cursor.fetchall():
#     print(f"  • {table[0]}")

# print("\n👥 Users in database:")
# cursor.execute("SELECT username, role, is_active FROM users")
# for user in cursor.fetchall():
#     print(f"  • {user[0]} - {user[1]} (Active: {user[2]})")

# print("\n🏫 School info:")
# cursor.execute("SELECT school_name, email, phone FROM school_info")
# school = cursor.fetchone()
# if school:
#     print(f"  • {school[0]}")
#     print(f"  • Email: {school[1]}")
#     print(f"  • Phone: {school[2]}")

# conn.close()
import sqlite3
from passlib.context import CryptContext
from datetime import datetime
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Connect to SQLite
conn = sqlite3.connect("school.db")
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS activations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activation_token_hash TEXT NOT NULL UNIQUE,
        machine_fingerprint_hash TEXT NOT NULL,
        school_name TEXT NOT NULL,
        activated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        cloud_synced BOOLEAN DEFAULT FALSE,
        cloud_sync_at DATETIME,
        last_verified_at DATETIME,
        license_type TEXT DEFAULT 'STANDARD'
    )
    """)

# =====================================================
# SCHOOL INFO TABLE
# =====================================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS school_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name TEXT NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")





cursor.execute("""
INSERT OR IGNORE INTO school_info
(school_name, email, phone, address, city, state, country)
VALUES (?, ?, ?, ?, ?, ?, ?)
""", (
    "Your School Name",
    "school@example.com",
    "+1234567890",
    "123 School Street",
    "City",
    "State",
    "Country"
))

# =====================================================
# USERS TABLE
# =====================================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

# =====================================================
# ACTIVATION STATUS TABLE
# =====================================================
cursor.execute("""
CREATE TABLE IF NOT EXISTS activation_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activated BOOLEAN NOT NULL DEFAULT 0,
    activation_code TEXT UNIQUE,
    activated_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
INSERT OR IGNORE INTO activation_status (id, activated)
VALUES (1, 0)
""")

# =====================================================
# INSERT DEFAULT USERS
# =====================================================
users = [
    ("superadmin", "superpass", "SUPER_ADMIN"),
    ("admin", "adminpass", "ADMIN"),
    ("staff1", "staffpass", "STAFF"),
    ("student1", "studentpass", "STUDENT")
]

for username, password, role in users:
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO users
            (unique_id, username, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, 1, ?)
        """, (
            str(uuid.uuid4()),
            username,
            pwd_context.hash(password),
            role,
            datetime.utcnow()
        ))

conn.commit()

# =====================================================
# VERIFY
# =====================================================
print("✅ Database initialized successfully!")

print("\n📊 Tables:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
for table in cursor.fetchall():
    print(f" • {table[0]}")

print("\n👥 Users:")
cursor.execute("SELECT username, role, status FROM users")
for user in cursor.fetchall():
    print(f" • {user[0]} - {user[1]} (Active: {user[2]})")

print("\n🏫 School Info:")
cursor.execute("SELECT school_name, email, phone FROM school_info")
school = cursor.fetchone()
if school:
    print(f" • {school[0]}")
    print(f" • Email: {school[1]}")
    print(f" • Phone: {school[2]}")

conn.close()
