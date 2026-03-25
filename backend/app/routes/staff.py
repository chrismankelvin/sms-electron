# app/routes/staff.py

import sqlite3
from datetime import datetime
import hashlib
import secrets
from typing import Dict, Any, Optional
import os

from app.main import get_db_connection, hash_password


# def get_db_connection():
#     """Get database connection"""
#     db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'school.db')
#     conn = sqlite3.connect(db_path)
#     conn.row_factory = sqlite3.Row
#     return conn


def generate_unique_id(prefix: str = "STAFF") -> str:
    """Generate a unique ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = secrets.token_hex(4).upper()
    return f"{prefix}_{timestamp}_{random_part}"

def generate_staff_number(role: str = "Teacher") -> str:
    """Generate a unique staff number"""
    year = datetime.now().year
    prefix = "TCH" if role == "Teacher" else "ADM"
    
    # Get the count of staff for this year to generate sequential number
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COUNT(*) as count FROM staff 
        WHERE staff_number LIKE ?
    """, (f"{prefix}/{year}/%",))
    count = cursor.fetchone()['count']
    conn.close()
    
    sequence = str(count + 1).zfill(4)
    return f"{prefix}/{year}/{sequence}"

# def hash_password(password: str) -> tuple:
#     """Hash a password with salt"""
#     salt = secrets.token_hex(16)
#     password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
#     return password_hash, salt



def register_staff(staff_data: Dict[str, Any]) -> Dict[str, Any]:
    """Register a new staff member with all related information"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Determine role
        role = staff_data.get('roles', staff_data.get('role', 'Teacher'))
        
        # Generate unique IDs
        unique_id = generate_unique_id("STAFF")
        staff_number = generate_staff_number(role)
        
        # 1. Insert into person_details table
        person_data = {
            'unique_id': unique_id,
            'first_name': staff_data.get('first_name'),
            'last_name': staff_data.get('surname'),
            'other_names': staff_data.get('other_names'),
            'date_of_birth': staff_data.get('date_of_birth'),
            'gender': staff_data.get('gender'),
            'phone': staff_data.get('telephone_number_one'),
            'secondary_phone': staff_data.get('telephone_number_two'),
            'email': staff_data.get('email_address'),
            'address': staff_data.get('address'),
            'city': staff_data.get('place_of_resident'),
            'state': staff_data.get('state'),
            'country': staff_data.get('nationality', 'Ghanaian'),
            'postal_code': staff_data.get('postal_code'),
            'nationality': staff_data.get('nationality', 'Ghanaian'),
            'blood_group': staff_data.get('blood_group'),
            'emergency_contact_name': staff_data.get('emergency_contact_one_name') or staff_data.get('next_of_kin_name'),
            'emergency_contact_phone': staff_data.get('emergency_contact_one'),
            'photo_url': staff_data.get('photo_url'),
            'national_id': staff_data.get('national_identification_number'),
            'health_id': staff_data.get('health_insurance_number'),
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
        
        # 2. Create user account for staff
        # Generate username from first_name and surname
        username = f"{staff_data.get('first_name', '').lower()}.{staff_data.get('surname', '').lower()}"
        
        # Check if username exists and make unique if needed
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            username = f"{username}{person_id}"
        
        default_password = "password123"  # This should be communicated to the staff member
        password_hash = hash_password(default_password)
        
        # Generate unique_id for user
        user_unique_id = generate_unique_id("USER")
        
        cursor.execute('''
            INSERT INTO users (unique_id, username, email, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_unique_id, 
            username, 
            staff_data.get('email_address'), 
            password_hash, 
            # salt, 
            role.lower(),  # Store role in uppercase (TEACHER or ADMIN)
            staff_data.get('current_status', 'active'), 
            datetime.now().isoformat()
        ))
        
        user_id = cursor.lastrowid
        
        # 3. Insert into staff table
        staff_insert_data = {
            'person_id': person_id,
            'unique_id': unique_id,
            'user_id': user_id,
            'staff_number': staff_number,
            'role': role,
            'hired_at': staff_data.get('hired_at', datetime.now().date().isoformat()),
            'department': staff_data.get('department'),
            'status': staff_data.get('current_status', 'active'),
            'marital_status': staff_data.get('marital_status'),
            'spouse_name': staff_data.get('spouse_name'),
            'spouse_phone': staff_data.get('spouse_phone'),
            'place_of_birth': staff_data.get('place_of_birth'),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        cursor.execute('''
            INSERT INTO staff (
                person_id, unique_id, user_id, staff_number, role, hired_at,
                department, status, marital_status, spouse_name, spouse_phone,
                place_of_birth, created_at, updated_at
            ) VALUES (
                :person_id, :unique_id, :user_id, :staff_number, :role, :hired_at,
                :department, :status, :marital_status, :spouse_name, :spouse_phone,
                :place_of_birth, :created_at, :updated_at
            )
        ''', staff_insert_data)
        
        staff_id = cursor.lastrowid
        
        conn.commit()
        
        # Return success with staff details
        return {
            "success": True,
            "message": f"{role} registered successfully",
            "staff_id": staff_id,
            "person_id": person_id,
            "user_id": user_id,
            "staff_number": staff_number,
            "username": username,
            "default_password": default_password,
            "role": role
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error registering staff: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "message": f"Registration failed: {str(e)}"
        }
    finally:
        if conn:
            conn.close()

def get_all_staff() -> Dict[str, Any]:
    """Get all staff members"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT s.*, p.first_name, p.last_name, p.other_names, p.email, p.phone, p.emergency_contact_name, p.emergency_contact_phone,
                   u.username, u.status as user_status
            FROM staff s
            JOIN person_details p ON s.person_id = p.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.status = 'active'
            ORDER BY p.last_name, p.first_name
        ''')
        
        staff_list = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "success": True,
            "staff": staff_list
        }
    except Exception as e:
        print(f"Error getting staff: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "staff": []
        }

def add_staff(staff_data: Dict[str, Any]) -> Dict[str, Any]:
    """Add a staff member (simplified version)"""
    return register_staff(staff_data)

def update_staff(staff_id: int, staff_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update staff information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First, get the person_id and user_id for this staff
        cursor.execute("SELECT person_id, user_id FROM staff WHERE id = ?", (staff_id,))
        result = cursor.fetchone()
        if not result:
            return {"success": False, "message": "Staff member not found"}
        
        person_id = result['person_id']
        user_id = result['user_id']
        
        # Update person_details
        if any(k in staff_data for k in ['first_name', 'last_name', 'other_names', 'email', 'phone', 'address', 'place_of_birth']):
            cursor.execute('''
                UPDATE person_details
                SET first_name = COALESCE(?, first_name),
                    last_name = COALESCE(?, last_name),
                    other_names = COALESCE(?, other_names),
                    email = COALESCE(?, email),
                    phone = COALESCE(?, phone),
                    address = COALESCE(?, address),
                    place_of_birth = COALESCE(?, place_of_birth),
                    updated_at = ?
                WHERE id = ?
            ''', (
                staff_data.get('first_name'),
                staff_data.get('last_name'),
                staff_data.get('other_names'),
                staff_data.get('email_address'),
                staff_data.get('telephone_number_one'),
                staff_data.get('address'),
                staff_data.get('place_of_birth'),
                datetime.now().isoformat(),
                person_id
            ))
        
        # Update users table
        if any(k in staff_data for k in ['username', 'status']):
            cursor.execute('''
                UPDATE users
                SET username = COALESCE(?, username),
                    status = COALESCE(?, status),
                    updated_at = ?
                WHERE id = ?
            ''', (
                staff_data.get('username'),
                staff_data.get('current_status'),
                datetime.now().isoformat(),
                user_id
            ))
        
        # Update staff table
        cursor.execute('''
            UPDATE staff
            SET role = COALESCE(?, role),
                department = COALESCE(?, department),
                status = COALESCE(?, status),
                marital_status = COALESCE(?, marital_status),
                spouse_name = COALESCE(?, spouse_name),
                spouse_phone = COALESCE(?, spouse_phone),
                updated_at = ?
            WHERE id = ?
        ''', (
            staff_data.get('role'),
            staff_data.get('department'),
            staff_data.get('status'),
            staff_data.get('marital_status'),
            staff_data.get('spouse_name'),
            staff_data.get('spouse_phone'),
            datetime.now().isoformat(),
            staff_id
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Staff updated successfully"
        }
        
    except Exception as e:
        print(f"Error updating staff: {str(e)}")
        return {
            "success": False,
            "message": f"Update failed: {str(e)}"
        }

def delete_staff(staff_id: int) -> Dict[str, Any]:
    """Soft delete a staff member"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE staff
            SET status = 'inactive', updated_at = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), staff_id))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Staff deleted successfully"
        }
        
    except Exception as e:
        print(f"Error deleting staff: {str(e)}")
        return {
            "success": False,
            "message": f"Delete failed: {str(e)}"
        }

def search_staff(query: str) -> Dict[str, Any]:
    """Search staff by name, staff number, or email"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        search_term = f"%{query}%"
        cursor.execute('''
            SELECT s.*, p.first_name, p.last_name, p.other_names, p.email, p.phone
            FROM staff s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.status = 'active'
            AND (
                p.first_name LIKE ? OR
                p.last_name LIKE ? OR
                s.staff_number LIKE ? OR
                p.email LIKE ? OR
                p.phone LIKE ?
            )
            ORDER BY p.last_name, p.first_name
        ''', (search_term, search_term, search_term, search_term, search_term))
        
        staff_list = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "success": True,
            "staff": staff_list
        }
        
    except Exception as e:
        print(f"Error searching staff: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "staff": []
        }