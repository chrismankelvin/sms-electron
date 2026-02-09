

# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------

# import sqlite3
# from datetime import datetime
# from typing import Optional
# from .models import User, Role
# from .password import verify_password, hash_password

# DB_PATH = "database/school.db"  # Path to your SQLite database

# # Simple in-memory session storage
# _SESSIONS: dict[str, int] = {}


# # ---------------- Database Helpers ----------------
# def get_connection():
#     return sqlite3.connect(DB_PATH)


# def row_to_user(row) -> Optional[User]:
#     if not row:
#         return None

#     # Use %f to parse microseconds
#     created_at = datetime.strptime(row[5], "%Y-%m-%d %H:%M:%S.%f")

#     return User(
#         id=row[0],
#         username=row[1],
#         password_hash=row[2],
#         role=Role(row[3]),
#         is_active=bool(row[4]),
#         created_at=created_at
#     )


# # ---------------- User Management ----------------
# def bootstrap_super_admin(username: str, password: str) -> User:
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT COUNT(*) FROM users")
#     if cursor.fetchone()[0] > 0:
#         conn.close()
#         raise RuntimeError("Bootstrap already completed")

#     password_hash = hash_password(password)
#     cursor.execute("""
#         INSERT INTO users (username, password_hash, role, is_active, created_at)
#         VALUES (?, ?, ?, 1, ?)
#     """, (username, password_hash, Role.SUPER_ADMIN.value, datetime.utcnow()))
#     conn.commit()

#     user_id = cursor.lastrowid
#     conn.close()

#     return get_user_by_id(user_id)


# def get_user_by_username(username: str) -> Optional[User]:
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM users WHERE username=? AND is_active=1", (username,))
#     row = cursor.fetchone()
#     conn.close()
#     return row_to_user(row)


# def get_user_by_id(user_id: int) -> Optional[User]:
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
#     row = cursor.fetchone()
#     conn.close()
#     return row_to_user(row)


# def authenticate_user(username: str, password: str) -> Optional[User]:
#     user = get_user_by_username(username)
#     if not user:
#         return None

#     if not verify_password(password, user.password_hash):
#         return None

#     return user


# # ---------------- Session Management ----------------
# def create_session(user_id: int) -> str:
#     session_id = f"session-{user_id}"
#     _SESSIONS[session_id] = user_id
#     return session_id


# def get_user_from_session(session_id: str) -> Optional[User]:
#     user_id = _SESSIONS.get(session_id)
#     if not user_id:
#         return None
#     return get_user_by_id(user_id)


# def clear_session(session_id: str):
#     _SESSIONS.pop(session_id, None)




# // ---------------- DEEPSEEK ----------------
# // ---------------- DEEPSEEK ----------------
# // ---------------- DEEPSEEK ----------------
# // ---------------- DEEPSEEK ----------------



# import sqlite3
# from datetime import datetime
# from typing import Optional
# from .models import User, Role
# from .password import verify_password, hash_password

# DB_PATH = "database/school.db"

# _SESSIONS: dict[str, int] = {}

# def get_connection():
#     return sqlite3.connect(DB_PATH)

# def row_to_user(row) -> Optional[User]:
#     if not row:
#         return None
    
#     # Debug: print row to see structure
#     print(f"DEBUG row_to_user - Row: {row}")
    
#     # Based on your table structure:
#     # 0: id, 1: unique_id, 2: username, 3: email, 4: password_hash, 
#     # 5: role, 6: status, 7: last_login, 8: created_at
    
#     # Parse created_at - it's at index 8
#     created_at = None
#     if row[8]:
#         try:
#             created_at_str = str(row[8])
#             if '.' in created_at_str:
#                 created_at = datetime.strptime(created_at_str, "%Y-%m-%d %H:%M:%S.%f")
#             else:
#                 created_at = datetime.strptime(created_at_str, "%Y-%m-%d %H:%M:%S")
#         except (ValueError, TypeError) as e:
#             print(f"DEBUG: Error parsing datetime {row[8]}: {e}")
#             created_at = datetime.utcnow()
    
#     # Check status - it's at index 6
#     is_active = str(row[4]).lower() == 'active' if row[4] else False
    
#     # Get the password hash - CRITICAL: Check index!
#     password_hash = str(row[4]) if row[4] else ""  # This should be the password_hash column
    
#     # Debug password hash
#     print(f"DEBUG: Password hash from row[4]: '{password_hash}'")
#     print(f"DEBUG: Hash length: {len(password_hash)}")
#     if password_hash:
#         print(f"DEBUG: Hash starts with: '{password_hash[:10]}'")
#         print(f"DEBUG: Hash ends with: '{password_hash[-10:]}'")
    
#     # Map the database role to your Role enum
#     db_role = str(row[5]).lower() if row[5] else ''
#     print(f"DEBUG: Database role: '{db_role}'")
    
#     # Map database roles to Role enum
#     role_mapping = {
#         'admin': Role.ADMIN,
#         'teacher': Role.STAFF,
#         'ta': Role.STAFF,
#         'accountant': Role.STAFF,
#         'student': Role.STUDENT
#     }
    
#     role = role_mapping.get(db_role, Role.STUDENT)
    
#     return User(
#         id=row[0],
#         username=str(row[2]) if row[2] else "",
#         password_hash=password_hash,
#         role=role,
#         is_active=is_active,
#         created_at=created_at
#     )

# def bootstrap_super_admin(username: str, password: str) -> User:
#     print(f"DEBUG bootstrap_super_admin: Creating user {username}")
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT COUNT(*) FROM users")
#     if cursor.fetchone()[0] > 0:
#         conn.close()
#         raise RuntimeError("Bootstrap already completed")

#     password_hash = hash_password(password)
#     unique_id = f"user_{datetime.utcnow().timestamp()}"
    
#     print(f"DEBUG: Generated password hash: {password_hash}")
#     print(f"DEBUG: Hash length: {len(password_hash)}")
    
#     cursor.execute("""
#         INSERT INTO users (unique_id, username, password_hash, role, status, created_at)
#         VALUES (?, ?, ?, 'admin', 'active', ?)
#     """, (unique_id, username, password_hash, datetime.utcnow()))
#     conn.commit()

#     user_id = cursor.lastrowid
#     conn.close()
    
#     print(f"DEBUG: Created user with ID: {user_id}")
#     return get_user_by_id(user_id)

# def get_user_by_username(username: str) -> Optional[User]:
#     print(f"DEBUG get_user_by_username: Looking for user '{username}'")
#     conn = get_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         SELECT id, unique_id, username, email, password_hash, 
#                role, status, last_login, created_at 
#         FROM users 
#         WHERE username=? AND status='active'
#     """, (username,))
#     row = cursor.fetchone()
#     conn.close()
    
#     if row:
#         print(f"DEBUG: Found user in DB: {row[2]}")
#         # Let's check what's in each column
#         for i, col in enumerate(row):
#             print(f"DEBUG: row[{i}] = {col}")
#     else:
#         print(f"DEBUG: No user found with username: {username}")
    
#     return row_to_user(row)

# def get_user_by_id(user_id: int) -> Optional[User]:
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("""
#         SELECT id, unique_id, username, email, password_hash, 
#                role, status, last_login, created_at 
#         FROM users 
#         WHERE id=?
#     """, (user_id,))
#     row = cursor.fetchone()
#     conn.close()
#     return row_to_user(row)

# def authenticate_user(username: str, password: str, requested_role: Optional[str] = None) -> Optional[User]:
#     print(f"\nDEBUG authenticate_user: Starting authentication for '{username}'")
#     print(f"DEBUG: Password to check: '{password}'")
    
#     user = get_user_by_username(username)
#     if not user:
#         print(f"DEBUG: No user found")
#         return None

#     print(f"DEBUG: Found user: {user.username}")
#     print(f"DEBUG: User password_hash: '{user.password_hash}'")
    
#     if not user.password_hash or user.password_hash.strip() == "":
#         print(f"ERROR: Password hash is empty or None!")
#         return None
    
#     # Check hash format
#     if not user.password_hash.startswith('$2b$'):
#         print(f"WARNING: Hash doesn't have bcrypt format. Got: '{user.password_hash[:20]}...'")
    
#     try:
#         print(f"DEBUG: Attempting password verification...")
#         verified = verify_password(password, user.password_hash)
#         print(f"DEBUG: Password verification result: {verified}")
        
#         if not verified:
#             print(f"DEBUG: Password verification failed")
#             return None
#     except Exception as e:
#         print(f"ERROR in password verification: {type(e).__name__}: {e}")
#         # Try to see what's wrong with the hash
#         print(f"DEBUG: Problematic hash value: '{user.password_hash}'")
#         return None
    
#     if requested_role:
#         print(f"DEBUG: Checking requested role: {requested_role}")
#         role_mapping = {
#             "Admin": [Role.ADMIN],
#             "Teacher": [Role.STAFF],
#             "Teaching Assistant": [Role.STAFF],
#             "Accountant": [Role.STAFF],
#             "Student": [Role.STUDENT]
#         }
        
#         if requested_role in role_mapping:
#             allowed_roles = role_mapping[requested_role]
#             if user.role not in allowed_roles:
#                 print(f"DEBUG: User role {user.role} not in allowed roles {allowed_roles}")
#                 return None
    
#     print(f"DEBUG: Authentication successful for {username}")
#     return user

# def create_session(user_id: int) -> str:
#     session_id = f"session_{user_id}_{datetime.utcnow().timestamp()}"
#     _SESSIONS[session_id] = user_id
    
#     # Update last_login in database
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("UPDATE users SET last_login=? WHERE id=?", (datetime.utcnow(), user_id))
#     conn.commit()
#     conn.close()
    
#     return session_id

# def get_user_from_session(session_id: str) -> Optional[User]:
#     user_id = _SESSIONS.get(session_id)
#     if not user_id:
#         return None
#     return get_user_by_id(user_id)

# def clear_session(session_id: str):
#     _SESSIONS.pop(session_id, None)




import sqlite3
from datetime import datetime
from typing import Optional
import hashlib
from .models import User, Role

# DB_PATH = "database/school.db"

_SESSIONS: dict[str, int] = {}


def get_connection():
    """Get SQLite connection from state.py (row_factory enabled)"""
    from app.activation import state
    try:
        conn = state.get_db_connection()
        return conn
    except Exception as e:
        raise ConnectionError(f"Failed to connect to database: {e}")


def hash_password_sha256(password: str) -> str:
    """Hash password using SHA256 (matching main.py)"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password_sha256(password: str, password_hash: str) -> bool:
    """Verify password using SHA256 (matching main.py)"""
    if not password_hash:
        return False
    return hashlib.sha256(password.encode()).hexdigest() == password_hash

def row_to_user(row) -> Optional[User]:
    if not row:
        return None
    
    # Based on your table structure:
    # 0: id, 1: unique_id, 2: username, 3: email, 4: password_hash, 
    # 5: role, 6: status, 7: last_login, 8: created_at
    
    # Parse created_at - it's at index 8
    created_at = None
    if row[8]:
        try:
            created_at_str = str(row[8])
            if '.' in created_at_str:
                created_at = datetime.strptime(created_at_str, "%Y-%m-%d %H:%M:%S.%f")
            else:
                created_at = datetime.strptime(created_at_str, "%Y-%m-%d %H:%M:%S")
        except (ValueError, TypeError) as e:
            print(f"Error parsing datetime {row[8]}: {e}")
            created_at = datetime.utcnow()
    
    # Check status - it's at index 6 (CORRECTED)
    is_active = str(row[6]).lower() == 'active' if row[6] else False
    
    # Get the password hash - it's at index 4
    password_hash = str(row[4]) if row[4] else ""
    
    # Map the database role to your Role enum
    db_role = str(row[5]).lower() if row[5] else ''
    
    # Map database roles to Role enum
    role_mapping = {
        'admin': Role.ADMIN,
        'teacher': Role.STAFF,
        'ta': Role.STAFF,
        'accountant': Role.STAFF,
        'student': Role.STUDENT
    }
    
    role = role_mapping.get(db_role, Role.STUDENT)
    
    return User(
        id=row[0],
        username=str(row[2]) if row[2] else "",
        password_hash=password_hash,
        role=role,
        is_active=is_active,
        created_at=created_at
    )

def bootstrap_super_admin(username: str, password: str) -> User:
    print(f"DEBUG bootstrap_super_admin: Creating user {username}")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        conn.close()
        raise RuntimeError("Bootstrap already completed")

    password_hash = hash_password_sha256(password)
    unique_id = f"user_{datetime.utcnow().timestamp()}"
    
    print(f"DEBUG: Generated password hash (SHA256): {password_hash}")
    print(f"DEBUG: Hash length: {len(password_hash)}")
    
    cursor.execute("""
        INSERT INTO users (unique_id, username, password_hash, role, status, created_at)
        VALUES (?, ?, ?, 'admin', 'active', ?)
    """, (unique_id, username, password_hash, datetime.utcnow()))
    conn.commit()

    user_id = cursor.lastrowid
    conn.close()
    
    print(f"DEBUG: Created user with ID: {user_id}")
    return get_user_by_id(user_id)

def get_user_by_username(username: str) -> Optional[User]:
    print(f"DEBUG get_user_by_username: Looking for user '{username}'")
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, unique_id, username, email, password_hash, 
               role, status, last_login, created_at 
        FROM users 
        WHERE username=? AND status='active'
    """, (username,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        print(f"DEBUG: Found user in DB: {row[2]}")
        print(f"DEBUG: Password hash from DB: '{row[4]}'")
        print(f"DEBUG: Hash length: {len(str(row[4])) if row[4] else 0}")
    else:
        print(f"DEBUG: No user found with username: {username}")
    
    return row_to_user(row)

def get_user_by_id(user_id: int) -> Optional[User]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, unique_id, username, email, password_hash, 
               role, status, last_login, created_at 
        FROM users 
        WHERE id=?
    """, (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_user(row)

def authenticate_user(username: str, password: str, requested_role: Optional[str] = None) -> Optional[User]:
    print(f"\nDEBUG authenticate_user: Starting authentication for '{username}'")
    print(f"DEBUG: Password to check: '{password}'")
    
    user = get_user_by_username(username)
    if not user:
        print(f"DEBUG: No user found")
        return None

    print(f"DEBUG: Found user: {user.username}")
    print(f"DEBUG: User password_hash from DB: '{user.password_hash}'")
    
    if not user.password_hash or user.password_hash.strip() == "":
        print(f"ERROR: Password hash is empty or None!")
        return None
    
    try:
        print(f"DEBUG: Attempting password verification with SHA256...")
        
        # Calculate what the hash should be
        expected_hash = hashlib.sha256(password.encode()).hexdigest()
        print(f"DEBUG: Expected hash: {expected_hash}")
        print(f"DEBUG: Actual hash: {user.password_hash}")
        
        # Verify password using SHA256
        verified = verify_password_sha256(password, user.password_hash)
        print(f"DEBUG: Password verification result: {verified}")
        
        if not verified:
            print(f"DEBUG: Password verification failed")
            # Additional debug: check if hashes match
            print(f"DEBUG: Hash comparison: {expected_hash == user.password_hash}")
            return None
    except Exception as e:
        print(f"ERROR in password verification: {type(e).__name__}: {e}")
        print(f"DEBUG: Problematic hash value: '{user.password_hash}'")
        return None
    
    if requested_role:
        print(f"DEBUG: Checking requested role: {requested_role}")
        role_mapping = {
            "Admin": [Role.ADMIN],
            "Teacher": [Role.STAFF],
            "Teaching Assistant": [Role.STAFF],
            "Accountant": [Role.STAFF],
            "Student": [Role.STUDENT]
        }
        
        if requested_role in role_mapping:
            allowed_roles = role_mapping[requested_role]
            if user.role not in allowed_roles:
                print(f"DEBUG: User role {user.role} not in allowed roles {allowed_roles}")
                return None
    
    print(f"DEBUG: Authentication successful for {username}")
    return user

def create_session(user_id: int) -> str:
    session_id = f"session_{user_id}_{datetime.utcnow().timestamp()}"
    _SESSIONS[session_id] = user_id
    
    # Update last_login in database
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET last_login=? WHERE id=?", (datetime.utcnow(), user_id))
    conn.commit()
    conn.close()
    
    return session_id

def get_user_from_session(session_id: str) -> Optional[User]:
    user_id = _SESSIONS.get(session_id)
    if not user_id:
        return None
    return get_user_by_id(user_id)

def clear_session(session_id: str):
    _SESSIONS.pop(session_id, None)

# Helper function to create a user for testing
def create_test_user(username: str, password: str, role: str = "student") -> Optional[User]:
    """Create a test user with SHA256 hashed password"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        password_hash = hash_password_sha256(password)
        unique_id = f"test_{datetime.utcnow().timestamp()}"
        
        cursor.execute("""
            INSERT INTO users (unique_id, username, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, 'active', ?)
        """, (unique_id, username, password_hash, role, datetime.utcnow()))
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        print(f"Test user created: {username} with ID {user_id}")
        print(f"Password hash: {password_hash}")
        
        return get_user_by_id(user_id)
    except Exception as e:
        print(f"Error creating test user: {e}")
        return None

# Helper function to check user's password hash
def check_user_password_hash(username: str):
    """Debug function to check a user's password hash"""
    user = get_user_by_username(username)
    if user:
        print(f"\nUser: {user.username}")
        print(f"Password hash: {user.password_hash}")
        print(f"Hash length: {len(user.password_hash)}")
        print(f"Is SHA256 format: {len(user.password_hash) == 64 and all(c in '0123456789abcdef' for c in user.password_hash.lower())}")
        return user.password_hash
    return None