# app/routes/students.py

import sqlite3
from datetime import datetime
import hashlib
import secrets
from typing import Dict, Any, Optional
from app.main import get_db_connection, hash_password

# def get_db_connection():
#     """Get database connection"""
#     # Adjust this path to your actual database location
#     import os
#     db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'school.db')
#     conn = sqlite3.connect(db_path)
#     conn.row_factory = sqlite3.Row
#     return conn


def generate_unique_id(prefix: str = "STU") -> str:
    """Generate a unique ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = secrets.token_hex(4).upper()
    return f"{prefix}_{timestamp}_{random_part}"

def generate_student_number() -> str:
    """Generate a unique student number"""
    year = datetime.now().year
    # Get the count of students for this year to generate sequential number
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COUNT(*) as count FROM students 
        WHERE student_number LIKE ?
    """, (f"STU/{year}/%",))
    count = cursor.fetchone()['count']
    conn.close()
    
    sequence = str(count + 1).zfill(4)
    return f"STU/{year}/{sequence}"

# def hash_password(password: str) -> str:
#     """Hash a password"""
#     salt = secrets.token_hex(16)
#     return hashlib.sha256(f"{password}{salt}".encode()).hexdigest() + ":" + salt

def register_student(student_data: Dict[str, Any]) -> Dict[str, Any]:
    """Register a new student with all related information"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Generate unique IDs
        unique_id = generate_unique_id("STU")
        student_number = generate_student_number()
        
        # 1. Insert into person_details table
        person_data = {
            'unique_id': unique_id,
            'first_name': student_data.get('first_name'),
            'last_name': student_data.get('surname'),
            'other_names': student_data.get('other_names'),
            'date_of_birth': student_data.get('date_of_birth'),
            'gender': student_data.get('gender'),  # Not in form yet
            'phone': student_data.get('fathers_contact') or student_data.get('mothers_contact'),
            'email': student_data.get('email_address'),
            'address': student_data.get('address'),
            'city': student_data.get('place_of_resident'),
            'state': student_data.get('state'),
            'country': student_data.get('nationality', 'Ghanaian'),
            'postal_code': student_data.get('postal_code'),
            'nationality': student_data.get('nationality', 'Ghanaian'),
            'blood_group': student_data.get('blood_group'),
            'emergency_contact_name': student_data.get('fathers_name') or student_data.get('mothers_name') or student_data.get('guardians_name'),
            'emergency_contact_phone': student_data.get('emergency_contact_one'),
            'photo_url': student_data.get('photo_url'),
            'national_id': student_data.get('national_identification_number'),
            'health_id': student_data.get('national_health_insurance_number'),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        cursor.execute('''
            INSERT INTO person_details (
                unique_id, first_name, last_name, other_names, date_of_birth, gender,
                phone, email, address, city, state, country, postal_code, nationality,
                blood_group, emergency_contact_name, emergency_contact_phone, photo_url,
                national_id, health_id, created_at, updated_at
            ) VALUES (
                :unique_id, :first_name, :last_name, :other_names, :date_of_birth, :gender,
                :phone, :email, :address, :city, :state, :country, :postal_code, :nationality,
                :blood_group, :emergency_contact_name, :emergency_contact_phone, :photo_url,
                :national_id, :health_id, :created_at, :updated_at
            )
        ''', person_data)
        
        person_id = cursor.lastrowid
        
        # 2. Insert into students table
        student_insert_data = {
            'person_id': person_id,
            'unique_id': unique_id,
            'student_number': student_number,
            'academic_year_id': student_data.get('academic_year_id', 1),  # Default or get from your system
            'class_id': student_data.get('class_id'),
            'section_id': student_data.get('section_id'),
            'parent1_name': student_data.get('fathers_name'),
            'parent1_phone': student_data.get('fathers_contact'),
            'parent1_email': student_data.get('fathers_email'),
            'parent2_name': student_data.get('mothers_name'),
            'parent2_phone': student_data.get('mothers_contact'),
            'parent2_email': student_data.get('mothers_email'),
            'guardian_name': student_data.get('guardians_name'),
            'guardian_phone': student_data.get('guardians_contact'),
            'guardian_email': student_data.get('guardians_email'),
            'health_condition': student_data.get('disabilities'),
            'former_school': student_data.get('name_of_previous_school'),
            'enrolled_at': student_data.get('date_of_enrollment', datetime.now().date().isoformat()),
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        cursor.execute('''
            INSERT INTO students (
                person_id, unique_id, student_number, academic_year_id, class_id, section_id,
                parent1_name, parent1_phone, parent1_email, parent2_name, parent2_phone, parent2_email,
                guardian_name, guardian_phone, guardian_email, health_condition, former_school,
                enrolled_at, status, created_at, updated_at
            ) VALUES (
                :person_id, :unique_id, :student_number, :academic_year_id, :class_id, :section_id,
                :parent1_name, :parent1_phone, :parent1_email, :parent2_name, :parent2_phone, :parent2_email,
                :guardian_name, :guardian_phone, :guardian_email, :health_condition, :former_school,
                :enrolled_at, :status, :created_at, :updated_at
            )
        ''', student_insert_data)
        
        student_id = cursor.lastrowid
        
        # 3. Create user account for student
        # Generate username from first_name and surname
        username = f"{student_data.get('first_name', '').lower()}.{student_data.get('surname', '').lower()}"
        
        # Check if username exists and make unique if needed
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            username = f"{username}{student_id}"
        
        default_password = "password123"  # This should be communicated to the student
        password_hash = hash_password(default_password).split(':')
        
        cursor.execute('''
            INSERT INTO users (unique_id, username, email, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (unique_id, username, student_data.get('email_address'), password_hash, 'student', 'active', datetime.now().isoformat()))
        
        conn.commit()
        
        # Return success with student details
        return {
            "success": True,
            "message": "Student registered successfully",
            "student_id": student_id,
            "person_id": person_id,
            "student_number": student_number,
            "username": username,
            "default_password": default_password
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error registering student: {str(e)}")
        return {
            "success": False,
            "message": f"Registration failed: {str(e)}"
        }
    finally:
        if conn:
            conn.close()

def get_all_students() -> Dict[str, Any]:
    """Get all students"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT s.*, p.first_name, p.last_name, p.other_names, p.email, p.phone
            FROM students s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.status = 'active'
            ORDER BY p.last_name, p.first_name
        ''')
        
        students = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "success": True,
            "students": students
        }
    except Exception as e:
        print(f"Error getting students: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "students": []
        }

def add_student(student_data: Dict[str, Any]) -> Dict[str, Any]:
    """Add a student (simplified version)"""
    # This is a simplified version - for full registration use register_student
    return register_student(student_data)

def update_student(student_id: int, student_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update student information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update person_details
        if any(k in student_data for k in ['first_name', 'last_name', 'other_names', 'email', 'phone', 'address']):
            cursor.execute('''
                UPDATE person_details
                SET first_name = COALESCE(?, first_name),
                    last_name = COALESCE(?, last_name),
                    other_names = COALESCE(?, other_names),
                    email = COALESCE(?, email),
                    phone = COALESCE(?, phone),
                    address = COALESCE(?, address),
                    updated_at = ?
                WHERE id = (SELECT person_id FROM students WHERE id = ?)
            ''', (
                student_data.get('first_name'),
                student_data.get('last_name'),
                student_data.get('other_names'),
                student_data.get('email'),
                student_data.get('phone'),
                student_data.get('address'),
                datetime.now().isoformat(),
                student_id
            ))
        
        # Update students table
        cursor.execute('''
            UPDATE students
            SET class_id = COALESCE(?, class_id),
                section_id = COALESCE(?, section_id),
                parent1_name = COALESCE(?, parent1_name),
                parent1_phone = COALESCE(?, parent1_phone),
                parent1_email = COALESCE(?, parent1_email),
                parent2_name = COALESCE(?, parent2_name),
                parent2_phone = COALESCE(?, parent2_phone),
                parent2_email = COALESCE(?, parent2_email),
                guardian_name = COALESCE(?, guardian_name),
                guardian_phone = COALESCE(?, guardian_phone),
                guardian_email = COALESCE(?, guardian_email),
                health_condition = COALESCE(?, health_condition),
                updated_at = ?
            WHERE id = ?
        ''', (
            student_data.get('class_id'),
            student_data.get('section_id'),
            student_data.get('parent1_name'),
            student_data.get('parent1_phone'),
            student_data.get('parent1_email'),
            student_data.get('parent2_name'),
            student_data.get('parent2_phone'),
            student_data.get('parent2_email'),
            student_data.get('guardian_name'),
            student_data.get('guardian_phone'),
            student_data.get('guardian_email'),
            student_data.get('health_condition'),
            datetime.now().isoformat(),
            student_id
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Student updated successfully"
        }
        
    except Exception as e:
        print(f"Error updating student: {str(e)}")
        return {
            "success": False,
            "message": f"Update failed: {str(e)}"
        }

def delete_student(student_id: int) -> Dict[str, Any]:
    """Soft delete a student"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE students
            SET status = 'inactive', updated_at = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), student_id))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Student deleted successfully"
        }
        
    except Exception as e:
        print(f"Error deleting student: {str(e)}")
        return {
            "success": False,
            "message": f"Delete failed: {str(e)}"
        }

def search_students(query: str) -> Dict[str, Any]:
    """Search students by name, student number, or email"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        search_term = f"%{query}%"
        cursor.execute('''
            SELECT s.*, p.first_name, p.last_name, p.other_names, p.email, p.phone
            FROM students s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.status = 'active'
            AND (
                p.first_name LIKE ? OR
                p.last_name LIKE ? OR
                s.student_number LIKE ? OR
                p.email LIKE ?
            )
            ORDER BY p.last_name, p.first_name
        ''', (search_term, search_term, search_term, search_term))
        
        students = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "success": True,
            "students": students
        }
        
    except Exception as e:
        print(f"Error searching students: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "students": []
        }