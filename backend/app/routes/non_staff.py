# app/routes/non_staff.py

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

def generate_unique_id(prefix: str = "NS") -> str:
    """Generate a unique ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = secrets.token_hex(4).upper()
    return f"{prefix}_{timestamp}_{random_part}"

def generate_non_staff_number() -> str:
    """Generate a unique non-staff number"""
    year = datetime.now().year
    
    # Get the count of non-staff for this year to generate sequential number
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COUNT(*) as count FROM non_staff 
        WHERE non_staff_number LIKE ?
    """, (f"NS/{year}/%",))
    count = cursor.fetchone()['count']
    conn.close()
    
    sequence = str(count + 1).zfill(4)
    return f"NS/{year}/{sequence}"

# def hash_password(password: str) -> tuple:
#     """Hash a password with salt"""
#     salt = secrets.token_hex(16)
#     password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
#     return password_hash, salt

def register_non_staff(non_staff_data: Dict[str, Any]) -> Dict[str, Any]:
    """Register a new non-staff member with all related information"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Generate unique IDs
        unique_id = generate_unique_id("NS")
        non_staff_number = generate_non_staff_number()
        
        # 1. Insert into person_details table
        person_data = {
            'unique_id': unique_id,
            'first_name': non_staff_data.get('first_name'),
            'last_name': non_staff_data.get('surname'),
            'other_names': non_staff_data.get('other_names'),
            'date_of_birth': non_staff_data.get('date_of_birth'),
            'gender': non_staff_data.get('gender'),
            'phone': non_staff_data.get('telephone_number_one'),
            'secondary_phone': non_staff_data.get('telephone_number_two'),
            'email': non_staff_data.get('email_address'),
            'address': non_staff_data.get('address'),
            'city': non_staff_data.get('place_of_resident'),
            'state': non_staff_data.get('state'),
            'country': non_staff_data.get('nationality', 'Ghanaian'),
            'postal_code': non_staff_data.get('postal_code'),
            'nationality': non_staff_data.get('nationality', 'Ghanaian'),
            'blood_group': non_staff_data.get('blood_group'),
            'emergency_contact_name': non_staff_data.get('next_of_kin_name') or non_staff_data.get('fathers_name') or non_staff_data.get('mothers_name'),
            'emergency_contact_phone': non_staff_data.get('emergency_contact_one'),
            'photo_url': non_staff_data.get('photo_url'),
            'national_id': non_staff_data.get('national_identification_number'),
            'health_id': non_staff_data.get('health_insurance_number'),
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
        
        # 2. Create user account for non-staff
        # Generate username from first_name and surname
        username = f"{non_staff_data.get('first_name', '').lower()}.{non_staff_data.get('surname', '').lower()}"
        
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
            non_staff_data.get('email_address'), 
            password_hash, 
            # salt, 
            'teacher',  # Role for non-teaching staff
            non_staff_data.get('current_status', 'active'), 
            datetime.now().isoformat()
        ))
        
        user_id = cursor.lastrowid
        
        # 3. Insert into non_staff table
        non_staff_insert_data = {
            'person_id': person_id,
            'user_id': user_id,
            'unique_id': unique_id,
            'non_staff_number': non_staff_number,
            'role': non_staff_data.get('roles', 'teacher'),
            'department': non_staff_data.get('department'),
            'designation': non_staff_data.get('designation'),
            'hired_at': non_staff_data.get('hired_at', datetime.now().date().isoformat()),
            'status': non_staff_data.get('current_status', 'active'),
            'fathers_name': non_staff_data.get('fathers_name'),
            'fathers_contact': non_staff_data.get('fathers_contact'),
            'mothers_name': non_staff_data.get('mothers_name'),
            'mothers_contact': non_staff_data.get('mothers_contact'),
            'next_of_kin_name': non_staff_data.get('next_of_kin_name'),
            'next_of_kin_contact': non_staff_data.get('next_of_kin_contact'),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        cursor.execute('''
            INSERT INTO non_staff (
                person_id, user_id, unique_id, non_staff_number, role, department,
                designation, hired_at, status, fathers_name, fathers_contact,
                mothers_name, mothers_contact, next_of_kin_name, next_of_kin_contact,
                created_at, updated_at
            ) VALUES (
                :person_id, :user_id, :unique_id, :non_staff_number, :role, :department,
                :designation, :hired_at, :status, :fathers_name, :fathers_contact,
                :mothers_name, :mothers_contact, :next_of_kin_name, :next_of_kin_contact,
                :created_at, :updated_at
            )
        ''', non_staff_insert_data)
        
        non_staff_id = cursor.lastrowid
        
        conn.commit()
        
        # Return success with non-staff details
        return {
            "success": True,
            "message": "Non-Teaching Staff registered successfully",
            "non_staff_id": non_staff_id,
            "person_id": person_id,
            "user_id": user_id,
            "non_staff_number": non_staff_number,
            "username": username,
            "default_password": default_password
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error registering non-staff: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "message": f"Registration failed: {str(e)}"
        }
    finally:
        if conn:
            conn.close()

def get_all_non_staff() -> Dict[str, Any]:
    """Get all non-staff members"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT ns.*, p.first_name, p.last_name, p.other_names, p.email, p.phone, p.address,
                   u.username, u.status as user_status
            FROM non_staff ns
            JOIN person_details p ON ns.person_id = p.id
            LEFT JOIN users u ON ns.user_id = u.id
            WHERE ns.status = 'active'
            ORDER BY p.last_name, p.first_name
        ''')
        
        non_staff_list = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "success": True,
            "non_staff": non_staff_list
        }
    except Exception as e:
        print(f"Error getting non-staff: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "non_staff": []
        }

def get_non_staff_by_id(non_staff_id: int) -> Dict[str, Any]:
    """Get a non-staff member by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT ns.*, p.first_name, p.last_name, p.other_names, p.email, p.phone,
                   p.address, p.date_of_birth, p.nationality, p.emergency_contact_name, p.emergency_contact_phone,
                   u.username, u.status as user_status
            FROM non_staff ns
            JOIN person_details p ON ns.person_id = p.id
            LEFT JOIN users u ON ns.user_id = u.id
            WHERE ns.id = ? AND ns.status = 'active'
        ''', (non_staff_id,))
        
        non_staff = cursor.fetchone()
        conn.close()
        
        if non_staff:
            return {
                "success": True,
                "non_staff": dict(non_staff)
            }
        else:
            return {
                "success": False,
                "message": "Non-staff member not found"
            }
    except Exception as e:
        print(f"Error getting non-staff: {str(e)}")
        return {
            "success": False,
            "message": str(e)
        }

def update_non_staff(non_staff_id: int, non_staff_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update non-staff information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First, get the person_id and user_id for this non-staff
        cursor.execute("SELECT person_id, user_id FROM non_staff WHERE id = ?", (non_staff_id,))
        result = cursor.fetchone()
        if not result:
            return {"success": False, "message": "Non-staff member not found"}
        
        person_id = result['person_id']
        user_id = result['user_id']
        
        # Update person_details
        if any(k in non_staff_data for k in ['first_name', 'last_name', 'other_names', 'email', 'phone', 'address']):
            cursor.execute('''
                UPDATE person_details
                SET first_name = COALESCE(?, first_name),
                    last_name = COALESCE(?, last_name),
                    other_names = COALESCE(?, other_names),
                    email = COALESCE(?, email),
                    phone = COALESCE(?, phone),
                    address = COALESCE(?, address),
                    updated_at = ?
                WHERE id = ?
            ''', (
                non_staff_data.get('first_name'),
                non_staff_data.get('last_name'),
                non_staff_data.get('other_names'),
                non_staff_data.get('email_address'),
                non_staff_data.get('telephone_number_one'),
                non_staff_data.get('address'),
                datetime.now().isoformat(),
                person_id
            ))
        
        # Update users table
        if any(k in non_staff_data for k in ['username', 'status']):
            cursor.execute('''
                UPDATE users
                SET username = COALESCE(?, username),
                    status = COALESCE(?, status),
                    updated_at = ?
                WHERE id = ?
            ''', (
                non_staff_data.get('username'),
                non_staff_data.get('current_status'),
                datetime.now().isoformat(),
                user_id
            ))
        
        # Update non_staff table
        cursor.execute('''
            UPDATE non_staff
            SET role = COALESCE(?, role),
                department = COALESCE(?, department),
                designation = COALESCE(?, designation),
                status = COALESCE(?, status),
                fathers_name = COALESCE(?, fathers_name),
                fathers_contact = COALESCE(?, fathers_contact),
                mothers_name = COALESCE(?, mothers_name),
                mothers_contact = COALESCE(?, mothers_contact),
                next_of_kin_name = COALESCE(?, next_of_kin_name),
                next_of_kin_contact = COALESCE(?, next_of_kin_contact),
                updated_at = ?
            WHERE id = ?
        ''', (
            non_staff_data.get('role'),
            non_staff_data.get('department'),
            non_staff_data.get('designation'),
            non_staff_data.get('status'),
            non_staff_data.get('fathers_name'),
            non_staff_data.get('fathers_contact'),
            non_staff_data.get('mothers_name'),
            non_staff_data.get('mothers_contact'),
            non_staff_data.get('next_of_kin_name'),
            non_staff_data.get('next_of_kin_contact'),
            datetime.now().isoformat(),
            non_staff_id
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Non-staff member updated successfully"
        }
        
    except Exception as e:
        print(f"Error updating non-staff: {str(e)}")
        return {
            "success": False,
            "message": f"Update failed: {str(e)}"
        }

def delete_non_staff(non_staff_id: int) -> Dict[str, Any]:
    """Soft delete a non-staff member"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE non_staff
            SET status = 'inactive', updated_at = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), non_staff_id))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Non-staff member deleted successfully"
        }
        
    except Exception as e:
        print(f"Error deleting non-staff: {str(e)}")
        return {
            "success": False,
            "message": f"Delete failed: {str(e)}"
        }

def search_non_staff(query: str) -> Dict[str, Any]:
    """Search non-staff members by name, staff number, or email"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        search_term = f"%{query}%"
        cursor.execute('''
            SELECT ns.*, p.first_name, p.last_name, p.other_names, p.email, p.phone
            FROM non_staff ns
            JOIN person_details p ON ns.person_id = p.id
            WHERE ns.status = 'active'
            AND (
                p.first_name LIKE ? OR
                p.last_name LIKE ? OR
                ns.non_staff_number LIKE ? OR
                p.email LIKE ? OR
                p.phone LIKE ? OR
                ns.role LIKE ? OR
                ns.department LIKE ?
            )
            ORDER BY p.last_name, p.first_name
        ''', (search_term, search_term, search_term, search_term, search_term, search_term, search_term))
        
        non_staff_list = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "success": True,
            "non_staff": non_staff_list
        }
        
    except Exception as e:
        print(f"Error searching non-staff: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "non_staff": []
        }