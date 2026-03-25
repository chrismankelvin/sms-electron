# app/routes/teaching_assistants.py

import sqlite3
from datetime import datetime
import hashlib
import secrets
from typing import Dict, Any, Optional
import os

# def get_db_connection():
#     """Get database connection"""
#     db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'school.db')
#     conn = sqlite3.connect(db_path)
#     conn.row_factory = sqlite3.Row
#     return conn

from app.main import get_db_connection, hash_password

def generate_unique_id(prefix: str = "TA") -> str:
    """Generate a unique ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = secrets.token_hex(4).upper()
    return f"{prefix}_{timestamp}_{random_part}"

def generate_ta_number() -> str:
    """Generate a unique teaching assistant number"""
    year = datetime.now().year
    
    # Get the count of TAs for this year to generate sequential number
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COUNT(*) as count FROM teaching_assistants 
        WHERE ta_number LIKE ?
    """, (f"TA/{year}/%",))
    count = cursor.fetchone()['count']
    conn.close()
    
    sequence = str(count + 1).zfill(4)
    return f"TA/{year}/{sequence}"

def hash_password(password: str) -> tuple:
    """Hash a password with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return password_hash, salt

# def register_teaching_assistant(ta_data: Dict[str, Any]) -> Dict[str, Any]:
#     """Register a new teaching assistant with all related information"""
#     conn = None
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Generate unique IDs
#         unique_id = generate_unique_id("TA")
#         ta_number = generate_ta_number()
        
#         # 1. Insert into person_details table
#         person_data = {
#             'unique_id': unique_id,
#             'first_name': ta_data.get('first_name'),
#             'last_name': ta_data.get('surname'),
#             'other_names': ta_data.get('other_names'),
#             'date_of_birth': ta_data.get('date_of_birth'),
#             'gender': ta_data.get('gender'),
#             'phone': ta_data.get('telephone_number_one'),
#             'secondary_phone': ta_data.get('telephone_number_two'),
#             'email': ta_data.get('email_address'),
#             'address': ta_data.get('address'),
#             'city': ta_data.get('place_of_resident'),
#             'state': ta_data.get('state'),
#             'country': ta_data.get('nationality', 'Ghanaian'),
#             'postal_code': ta_data.get('postal_code'),
#             'nationality': ta_data.get('nationality', 'Ghanaian'),
#             'blood_group': ta_data.get('blood_group'),
#             'emergency_contact_name': ta_data.get('fathers_name') or ta_data.get('mothers_name'),
#             'emergency_contact_phone': ta_data.get('emergency_contact_one'),
#             'photo_url': ta_data.get('photo_url'),
#             'national_id': ta_data.get('national_identification_number'),
#             'health_id': ta_data.get('health_insurance_number'),
#             'created_at': datetime.now().isoformat(),
#             'updated_at': datetime.now().isoformat()
#         }
        
#         cursor.execute('''
#             INSERT INTO person_details (
#                 unique_id, first_name, last_name, other_names, date_of_birth, gender,
#                 phone, email, address, city, state, country, postal_code, nationality,
#                 blood_group, emergency_contact_name, emergency_contact_phone, photo_url,
#                 national_id, health_id, created_at, updated_at
#             ) VALUES (
#                 :unique_id, :first_name, :last_name, :other_names, :date_of_birth, :gender,
#                 :phone, :email, :address, :city, :state, :country, :postal_code, :nationality,
#                 :blood_group, :emergency_contact_name, :emergency_contact_phone, :photo_url,
#                 :national_id, :health_id, :created_at, :updated_at
#             )
#         ''', person_data)
        
#         person_id = cursor.lastrowid
        
#         # 2. Create user account for teaching assistant
#         # Generate username from first_name and surname
#         username = f"{ta_data.get('first_name', '').lower()}.{ta_data.get('surname', '').lower()}"
        
#         # Check if username exists and make unique if needed
#         cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
#         if cursor.fetchone():
#             username = f"{username}{person_id}"
        
#         default_password = "password123"  # This should be communicated to the TA
#         password_hash, salt = hash_password(default_password)
        
#         # Generate unique_id for user
#         user_unique_id = generate_unique_id("USER")
        
#         cursor.execute('''
#             INSERT INTO users (unique_id, username, email, password_hash, salt, role, status, created_at)
#             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
#         ''', (
#             user_unique_id, 
#             username, 
#             ta_data.get('email_address'), 
#             password_hash, 
#             salt, 
#             'TEACHING_ASSISTANT',  # Role for teaching assistants
#             'active', 
#             datetime.now().isoformat()
#         ))
        
#         user_id = cursor.lastrowid
        
#         # 3. Insert into teaching_assistants table
#         ta_insert_data = {
#             'person_id': person_id,
#             'user_id': user_id,
#             'unique_id': unique_id,
#             'ta_number': ta_number,
#             'college_university': ta_data.get('college_university'),
#             'college_index_number': ta_data.get('college_index_number'),
#             'course_of_study': ta_data.get('course_of_study'),
#             'current_level': ta_data.get('current_level'),
#             'mentee_type': ta_data.get('mentee_type'),
#             'national_service_id': ta_data.get('national_service_id'),
#             'date_of_authorization': ta_data.get('date_of_authorization'),
#             'date_of_termination': ta_data.get('date_of_termination'),
#             'status': 'active',
#             'created_at': datetime.now().isoformat(),
#             'updated_at': datetime.now().isoformat()
#         }
        
#         cursor.execute('''
#             INSERT INTO teaching_assistants (
#                 person_id, user_id, unique_id, ta_number, college_university, college_index_number,
#                 course_of_study, current_level, mentee_type, national_service_id,
#                 date_of_authorization, date_of_termination, status, created_at, updated_at
#             ) VALUES (
#                 :person_id, :user_id, :unique_id, :ta_number, :college_university, :college_index_number,
#                 :course_of_study, :current_level, :mentee_type, :national_service_id,
#                 :date_of_authorization, :date_of_termination, :status, :created_at, :updated_at
#             )
#         ''', ta_insert_data)
        
#         ta_id = cursor.lastrowid
        
#         conn.commit()
        
#         # Return success with teaching assistant details
#         return {
#             "success": True,
#             "message": "Teaching Assistant registered successfully",
#             "ta_id": ta_id,
#             "person_id": person_id,
#             "user_id": user_id,
#             "ta_number": ta_number,
#             "username": username,
#             "default_password": default_password
#         }
        
#     except Exception as e:
#         if conn:
#             conn.rollback()
#         print(f"Error registering teaching assistant: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return {
#             "success": False,
#             "message": f"Registration failed: {str(e)}"
#         }
#     finally:
#         if conn:
#             conn.close()


def register_teaching_assistant(ta_data: Dict[str, Any]) -> Dict[str, Any]:
    """Register a new teaching assistant with all related information"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get national_id from form data
        national_id = ta_data.get('national_identification_number')
        
        # Check if a person with this national_id already exists
        if national_id:
            cursor.execute("SELECT id FROM person_details WHERE national_id = ?", (national_id,))
            existing_person = cursor.fetchone()
            
            if existing_person:
                # Person already exists, check if they're already a teaching assistant
                person_id = existing_person['id']
                cursor.execute("SELECT id FROM teaching_assistants WHERE person_id = ?", (person_id,))
                existing_ta = cursor.fetchone()
                
                if existing_ta:
                    return {
                        "success": False,
                        "message": f"A teaching assistant with National ID {national_id} already exists"
                    }
                
                # Person exists but not as TA, reuse the person record
                person_id = existing_person['id']
                
                # Generate unique IDs
                unique_id = generate_unique_id("TA")
                ta_number = generate_ta_number()
                
                # Create user account for teaching assistant
                username = f"{ta_data.get('first_name', '').lower()}.{ta_data.get('surname', '').lower()}"
                cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
                if cursor.fetchone():
                    username = f"{username}{person_id}"
                
                default_password = "password123"
                password_hash, salt = hash_password(default_password)
                user_unique_id = generate_unique_id("USER")
                
                cursor.execute('''
                    INSERT INTO users (unique_id, username, email, password_hash, role, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    user_unique_id, 
                    username, 
                    ta_data.get('email_address'), 
                    password_hash, 
                    # salt, 
                    'TEACHING_ASSISTANT', 
                    'active', 
                    datetime.now().isoformat()
                ))
                
                user_id = cursor.lastrowid
                
                # Insert into teaching_assistants table
                cursor.execute('''
                    INSERT INTO teaching_assistants (
                        person_id, user_id, unique_id, ta_number, college_university, college_index_number,
                        course_of_study, current_level, mentee_type, national_service_id,
                        date_of_authorization, date_of_termination, status, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    person_id, user_id, unique_id, ta_number,
                    ta_data.get('college_university'),
                    ta_data.get('college_index_number'),
                    ta_data.get('course_of_study'),
                    ta_data.get('current_level'),
                    ta_data.get('mentee_type'),
                    ta_data.get('national_service_id'),
                    ta_data.get('date_of_authorization'),
                    ta_data.get('date_of_termination'),
                    'active',
                    datetime.now().isoformat(),
                    datetime.now().isoformat()
                ))
                
                ta_id = cursor.lastrowid
                conn.commit()
                
                return {
                    "success": True,
                    "message": "Teaching Assistant registered successfully (using existing person record)",
                    "ta_id": ta_id,
                    "person_id": person_id,
                    "user_id": user_id,
                    "ta_number": ta_number,
                    "username": username,
                    "default_password": default_password
                }
        
        # If no existing person found, create new person record
        # Generate unique IDs
        unique_id = generate_unique_id("TA")
        ta_number = generate_ta_number()
        
        # 1. Insert into person_details table
        person_data = {
            'unique_id': unique_id,
            'first_name': ta_data.get('first_name'),
            'last_name': ta_data.get('surname'),
            'other_names': ta_data.get('other_names'),
            'date_of_birth': ta_data.get('date_of_birth'),
            'gender': ta_data.get('gender'),
            'phone': ta_data.get('telephone_number_one'),
            'email': ta_data.get('email_address'),
            'address': ta_data.get('address'),
            'city': ta_data.get('place_of_resident'),
            'state': ta_data.get('state'),
            'country': ta_data.get('nationality', 'Ghanaian'),
            'postal_code': ta_data.get('postal_code'),
            'nationality': ta_data.get('nationality', 'Ghanaian'),
            'blood_group': ta_data.get('blood_group'),
            'emergency_contact_name': ta_data.get('fathers_name') or ta_data.get('mothers_name'),
            'emergency_contact_phone': ta_data.get('emergency_contact_one'),
            'photo_url': ta_data.get('photo_url'),
            'national_id': national_id,  # Use the national_id from form
            'health_id': ta_data.get('health_insurance_number'),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Handle NULL values properly
        for key, value in person_data.items():
            if value is None:
                person_data[key] = None
        
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
        
        # 2. Create user account for teaching assistant
        username = f"{ta_data.get('first_name', '').lower()}.{ta_data.get('surname', '').lower()}"
        
        # Check if username exists and make unique if needed
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            username = f"{username}{person_id}"
        
        default_password = "password123"
        password_hash = hash_password(default_password)
        user_unique_id = generate_unique_id("USER")
        
        cursor.execute('''
            INSERT INTO users (unique_id, username, email, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_unique_id, 
            username, 
            ta_data.get('email_address'), 
            password_hash, 
            # salt, 
            'ta', 
            'active', 
            datetime.now().isoformat()
        ))
        
        user_id = cursor.lastrowid
        
        # 3. Insert into teaching_assistants table
        cursor.execute('''
            INSERT INTO teaching_assistants (
                person_id, user_id, unique_id, ta_number, college_university, college_index_number,
                course_of_study, current_level, mentee_type, national_service_id,
                date_of_authorization, date_of_termination, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            person_id, user_id, unique_id, ta_number,
            ta_data.get('college_university'),
            ta_data.get('college_index_number'),
            ta_data.get('course_of_study'),
            ta_data.get('current_level'),
            ta_data.get('mentee_type'),
            ta_data.get('national_service_id'),
            ta_data.get('date_of_authorization'),
            ta_data.get('date_of_termination'),
            'active',
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        ta_id = cursor.lastrowid
        
        conn.commit()
        
        # Return success with teaching assistant details
        return {
            "success": True,
            "message": "Teaching Assistant registered successfully",
            "ta_id": ta_id,
            "person_id": person_id,
            "user_id": user_id,
            "ta_number": ta_number,
            "username": username,
            "default_password": default_password
        }
        
    except sqlite3.IntegrityError as e:
        if conn:
            conn.rollback()
        print(f"IntegrityError registering teaching assistant: {str(e)}")
        
        # Check if it's a duplicate national_id error
        if "national_id" in str(e):
            return {
                "success": False,
                "message": "A person with this National ID already exists. Please use a different National ID or update the existing record."
            }
        else:
            return {
                "success": False,
                "message": f"Database integrity error: {str(e)}"
            }
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error registering teaching assistant: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "message": f"Registration failed: {str(e)}"
        }
    finally:
        if conn:
            conn.close()

def get_all_teaching_assistants() -> Dict[str, Any]:
    """Get all teaching assistants"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT ta.*, p.first_name, p.last_name, p.other_names, p.email, p.phone,
                   u.username, u.status as user_status
            FROM teaching_assistants ta
            JOIN person_details p ON ta.person_id = p.id
            LEFT JOIN users u ON ta.user_id = u.id
            WHERE ta.status = 'active'
            ORDER BY p.last_name, p.first_name
        ''')
        
        tas = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "success": True,
            "teaching_assistants": tas
        }
    except Exception as e:
        print(f"Error getting teaching assistants: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "teaching_assistants": []
        }

def get_teaching_assistant_by_id(ta_id: int) -> Dict[str, Any]:
    """Get a teaching assistant by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT ta.*, p.first_name, p.last_name, p.other_names, p.email, p.phone,
                   p.address, p.date_of_birth, p.nationality,
                   u.username, u.status as user_status
            FROM teaching_assistants ta
            JOIN person_details p ON ta.person_id = p.id
            LEFT JOIN users u ON ta.user_id = u.id
            WHERE ta.id = ? AND ta.status = 'active'
        ''', (ta_id,))
        
        ta = cursor.fetchone()
        conn.close()
        
        if ta:
            return {
                "success": True,
                "teaching_assistant": dict(ta)
            }
        else:
            return {
                "success": False,
                "message": "Teaching assistant not found"
            }
    except Exception as e:
        print(f"Error getting teaching assistant: {str(e)}")
        return {
            "success": False,
            "message": str(e)
        }

def update_teaching_assistant(ta_id: int, ta_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update teaching assistant information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First, get the person_id and user_id for this TA
        cursor.execute("SELECT person_id, user_id FROM teaching_assistants WHERE id = ?", (ta_id,))
        result = cursor.fetchone()
        if not result:
            return {"success": False, "message": "Teaching assistant not found"}
        
        person_id = result['person_id']
        user_id = result['user_id']
        
        # Update person_details
        if any(k in ta_data for k in ['first_name', 'last_name', 'other_names', 'email', 'phone', 'address']):
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
                ta_data.get('first_name'),
                ta_data.get('last_name'),
                ta_data.get('other_names'),
                ta_data.get('email_address'),
                ta_data.get('telephone_number_one'),
                ta_data.get('address'),
                datetime.now().isoformat(),
                person_id
            ))
        
        # Update users table
        if any(k in ta_data for k in ['username', 'status']):
            cursor.execute('''
                UPDATE users
                SET username = COALESCE(?, username),
                    status = COALESCE(?, status),
                    updated_at = ?
                WHERE id = ?
            ''', (
                ta_data.get('username'),
                ta_data.get('status'),
                datetime.now().isoformat(),
                user_id
            ))
        
        # Update teaching_assistants table
        cursor.execute('''
            UPDATE teaching_assistants
            SET college_university = COALESCE(?, college_university),
                college_index_number = COALESCE(?, college_index_number),
                course_of_study = COALESCE(?, course_of_study),
                current_level = COALESCE(?, current_level),
                mentee_type = COALESCE(?, mentee_type),
                national_service_id = COALESCE(?, national_service_id),
                date_of_authorization = COALESCE(?, date_of_authorization),
                date_of_termination = COALESCE(?, date_of_termination),
                status = COALESCE(?, status),
                updated_at = ?
            WHERE id = ?
        ''', (
            ta_data.get('college_university'),
            ta_data.get('college_index_number'),
            ta_data.get('course_of_study'),
            ta_data.get('current_level'),
            ta_data.get('mentee_type'),
            ta_data.get('national_service_id'),
            ta_data.get('date_of_authorization'),
            ta_data.get('date_of_termination'),
            ta_data.get('status'),
            datetime.now().isoformat(),
            ta_id
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Teaching assistant updated successfully"
        }
        
    except Exception as e:
        print(f"Error updating teaching assistant: {str(e)}")
        return {
            "success": False,
            "message": f"Update failed: {str(e)}"
        }

def delete_teaching_assistant(ta_id: int) -> Dict[str, Any]:
    """Soft delete a teaching assistant"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE teaching_assistants
            SET status = 'inactive', updated_at = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), ta_id))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Teaching assistant deleted successfully"
        }
        
    except Exception as e:
        print(f"Error deleting teaching assistant: {str(e)}")
        return {
            "success": False,
            "message": f"Delete failed: {str(e)}"
        }

def search_teaching_assistants(query: str) -> Dict[str, Any]:
    """Search teaching assistants by name, TA number, or email"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        search_term = f"%{query}%"
        cursor.execute('''
            SELECT ta.*, p.first_name, p.last_name, p.other_names, p.email, p.phone
            FROM teaching_assistants ta
            JOIN person_details p ON ta.person_id = p.id
            WHERE ta.status = 'active'
            AND (
                p.first_name LIKE ? OR
                p.last_name LIKE ? OR
                ta.ta_number LIKE ? OR
                p.email LIKE ? OR
                p.phone LIKE ? OR
                ta.course_of_study LIKE ? OR
                ta.college_university LIKE ?
            )
            ORDER BY p.last_name, p.first_name
        ''', (search_term, search_term, search_term, search_term, search_term, search_term, search_term))
        
        tas = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            "success": True,
            "teaching_assistants": tas
        }
        
    except Exception as e:
        print(f"Error searching teaching assistants: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "teaching_assistants": []
        }