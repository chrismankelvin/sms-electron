import sqlite3
from datetime import datetime

# Connect to SQLite database (or create it)
conn = sqlite3.connect('school_management.db')
cursor = conn.cursor()

# ----------------- Helper Functions -----------------
def execute(script):
    try:
        cursor.executescript(script)
        print("Script executed successfully")
    except sqlite3.Error as e:
        print("SQLite error:", e)

def insert_sample(table, columns, values_list):
    for values in values_list:
        placeholders = ','.join(['?'] * len(values))
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        cursor.execute(query, values)
    conn.commit()
    print(f"Inserted {len(values_list)} records into {table}")

# ----------------- Table Creation -----------------
tables_script = """
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','teacher','ta','accountant','student')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','disabled')),
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Person Details
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
);

-- Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_label TEXT NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    class_code TEXT UNIQUE,
    academic_year_id INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Sections
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
);

-- Students
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
    FOREIGN KEY (person_id) REFERENCES person_details(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (section_id) REFERENCES sections(id)
);

-- Staff
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
);

-- Devices
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
    last_activated_at DATETIME,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    staff_id INTEGER,
    student_id INTEGER,
    device_id INTEGER,
    action_type TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);
"""

execute(tables_script)

# ----------------- Insert Sample Data -----------------
# Users
insert_sample(
    "users",
    "unique_id, username, email, password_hash, role",
    [
        ("u1", "admin1", "admin1@example.com", "hash1", "admin"),
        ("u2", "teacher1", "teacher1@example.com", "hash2", "teacher"),
        ("u3", "student1", "student1@example.com", "hash3", "student"),
    ]
)

# Person Details
insert_sample(
    "person_details",
    "unique_id, first_name, last_name, gender, phone",
    [
        ("p1", "John", "Doe", "male", "1234567890"),
        ("p2", "Alice", "Smith", "female", "2345678901"),
        ("p3", "Bob", "Brown", "male", "3456789012"),
    ]
)

# Academic Years
insert_sample(
    "academic_years",
    "year_label, start_date, end_date",
    [
        ("2025/2026", "2025-09-01", "2026-06-30"),
        ("2026/2027", "2026-09-01", "2027-06-30"),
        ("2027/2028", "2027-09-01", "2028-06-30"),
    ]
)

# Classes
insert_sample(
    "classes",
    "class_name, class_code, academic_year_id",
    [
        ("Grade 1", "G1", 1),
        ("Grade 2", "G2", 1),
        ("Grade 3", "G3", 1),
    ]
)

# Sections
insert_sample(
    "sections",
    "section_name, class_id, academic_year_id",
    [
        ("A", 1, 1),
        ("B", 2, 1),
        ("C", 3, 1),
    ]
)

# Students
insert_sample(
    "students",
    "person_id, unique_id, student_number, academic_year_id, class_id, section_id",
    [
        (3, "s1", "S2025001", 1, 1, 1),
        (2, "s2", "S2025002", 1, 2, 2),
        (1, "s3", "S2025003", 1, 3, 3),
    ]
)

# Staff
insert_sample(
    "staff",
    "person_id, unique_id, user_id, staff_number, role",
    [
        (1, "st1", 1, "T001", "admin"),
        (2, "st2", 2, "T002", "teacher"),
        (3, "st3", 3, "T003", "ta"),
    ]
)

# Devices
insert_sample(
    "devices",
    "device_id, user_id, device_name, device_type, os_name, os_version, activation_key, activation_status",
    [
        ("d1", 1, "Admin PC", "PC", "Windows", "10", "KEY001", "active"),
        ("d2", 2, "Teacher Laptop", "Laptop", "Windows", "11", "KEY002", "pending"),
        ("d3", 3, "Student Tablet", "Tablet", "Android", "12", "KEY003", "active"),
    ]
)

# Activity Logs
insert_sample(
    "activity_logs",
    "user_id, staff_id, student_id, device_id, action_type, table_name, description",
    [
        (1, 1, None, 1, "CREATE", "students", "Created student s1"),
        (2, 2, None, 2, "UPDATE", "classes", "Updated class Grade 2"),
        (3, 3, 3, 3, "LOGIN", "users", "Student s3 logged in"),
    ]
)

# Commit and close connection
conn.commit()
conn.close()

print("Database setup complete with sample data!")
