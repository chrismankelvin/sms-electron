

# import sys
# import io

#     # Force UTF-8 encoding and replace any problematic characters
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
# sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# # run.py
# import uvicorn
# import sys
# import json
# import threading
# import logging
# from app.main import app

# # Set up logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# def route_request(req_type, action, data):
#     """Route requests to the appropriate handler functions"""

#     # ===== API ROUTES (for backend.fetchData) =====
#     if req_type == 'api' and action == 'request':
#         endpoint = data.get('endpoint')
#         method = data.get('method', 'GET')
#         request_data = data.get('data')
        
#         logger.info(f"API Request: {method} {endpoint}")
        
#         # Route to the appropriate endpoint
#         if endpoint == 'setup/school-and-admin':
#             try:
#                 # Import the function from main.py
#                 from app.main import setup_school_and_admin
                
#                 # Create a request object that matches what the endpoint expects
#                 class RequestObject:
#                     def __init__(self, data):
#                         self.school_name = data.get('school_name')
#                         self.school_email = data.get('school_email')
#                         self.school_contact = data.get('school_contact')
#                         self.school_type = data.get('school_type', 'secondary')
#                         self.county = data.get('county')
#                         self.region = data.get('region')
#                         self.city = data.get('city')
#                         self.town = data.get('town')
#                         self.gps_address = data.get('gps_address')
#                         self.country = data.get('country', 'Ghana')
#                         self.first_name = data.get('first_name')
#                         self.middle_name = data.get('middle_name', '')
#                         self.last_name = data.get('last_name')
#                         self.admin_email = data.get('admin_email')
#                         self.contact = data.get('contact')
#                         self.password = data.get('password')
#                         self.confirm_password = data.get('confirm_password')
                
#                 req = RequestObject(request_data)
                
#                 # Call the function (it's async, so we need to run it)
#                 import asyncio
#                 result = asyncio.run(setup_school_and_admin(req))
                
#                 logger.info(f"Setup result: {result.get('message')}")
#                 return result
                
#             except Exception as e:
#                 logger.error(f"Error in setup: {e}")
#                 import traceback
#                 traceback.print_exc()
#                 return {'success': False, 'message': str(e)}
        
#         # AUTH ENDPOINTS
#         elif endpoint == 'auth/login':
#             try:
#                 from app.auth.auth_service import login_user
#                 return login_user(
#                     request_data.get('username'),
#                     request_data.get('password'),
#                     request_data.get('role')
#                 )
#             except Exception as e:
#                 logger.error(f"Error in auth/login: {e}")
#                 return {'success': False, 'message': str(e)}
        
#         elif endpoint == 'auth/logout':
#             try:
#                 from app.auth.auth_service import logout_user
#                 return logout_user()
#             except Exception as e:
#                 logger.error(f"Error in auth/logout: {e}")
#                 return {'success': False, 'message': str(e)}
        
#         elif endpoint == 'auth/session':
#             try:
#                 from app.auth.auth_service import check_user_session
#                 return {'user': check_user_session()}
#             except Exception as e:
#                 logger.error(f"Error in auth/session: {e}")
#                 return {'user': None}
        
#         elif endpoint == 'auth/bootstrap':
#             try:
#                 from app.auth.auth_service import bootstrap_admin
#                 return bootstrap_admin(
#                     request_data.get('username'),
#                     request_data.get('password')
#                 )
#             except Exception as e:
#                 logger.error(f"Error in auth/bootstrap: {e}")
#                 return {'success': False, 'message': str(e)}
        
#         # ACTIVATION ENDPOINTS
#         elif endpoint == 'activation/status':
#             try:
#                 from app.activation.activation_service import check_activation_status
#                 status = check_activation_status()
#                 return {'activated': status.get('activated', False)}
#             except Exception as e:
#                 logger.error(f"Error in activation/status: {e}")
#                 return {'activated': False}
        
#         elif endpoint == 'activation/activate':
#             try:
#                 from app.activation.activation_service import activate_system
#                 return activate_system(
#                     request_data.get('code'),
#                     request_data.get('school_name')
#                 )
#             except Exception as e:
#                 logger.error(f"Error in activation/activate: {e}")
#                 return {'success': False, 'message': str(e)}
        
#         # STUDENTS ENDPOINTS
#         elif endpoint == 'students/list':
#             try:
#                 from database.cloud_db import get_db_connection
#                 conn = get_db_connection()
#                 cursor = conn.cursor()
#                 cursor.execute("SELECT * FROM students ORDER BY name")
#                 columns = [description[0] for description in cursor.description]
#                 rows = cursor.fetchall()
#                 students = [dict(zip(columns, row)) for row in rows]
#                 conn.close()
#                 return {'students': students}
#             except Exception as e:
#                 logger.error(f"Error in students/list: {e}")
#                 return {'students': []}
        
#         elif endpoint == 'students/add':
#             try:
#                 from database.cloud_db import get_db_connection
#                 conn = get_db_connection()
#                 cursor = conn.cursor()
#                 cursor.execute(
#                     "INSERT INTO students (name, class, section, roll_number, parent_name, parent_phone, address, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
#                     (request_data.get('name'), request_data.get('class'), request_data.get('section'),
#                      request_data.get('rollNumber'), request_data.get('parentName'), request_data.get('parentPhone'),
#                      request_data.get('address'), request_data.get('dateOfBirth'))
#                 )
#                 conn.commit()
#                 student_id = cursor.lastrowid
#                 conn.close()
#                 return {'success': True, 'id': student_id}
#             except Exception as e:
#                 logger.error(f"Error in students/add: {e}")
#                 return {'success': False, 'message': str(e)}
        
#         # STAFF ENDPOINTS
#         elif endpoint == 'staff/list':
#             try:
#                 from database.cloud_db import get_db_connection
#                 conn = get_db_connection()
#                 cursor = conn.cursor()
#                 cursor.execute("SELECT * FROM staff ORDER BY name")
#                 columns = [description[0] for description in cursor.description]
#                 rows = cursor.fetchall()
#                 staff = [dict(zip(columns, row)) for row in rows]
#                 conn.close()
#                 return {'staff': staff}
#             except Exception as e:
#                 logger.error(f"Error in staff/list: {e}")
#                 return {'staff': []}
        
#         # DATABASE ENDPOINTS
#         elif endpoint == 'database/status':
#             try:
#                 from app.main import database_status
#                 import asyncio
#                 return asyncio.run(database_status())
#             except Exception as e:
#                 logger.error(f"Error in database/status: {e}")
#                 return {'exists': False, 'error': str(e)}
        
#         # SETUP STATUS ENDPOINT
#         elif endpoint == 'setup/status':
#             try:
#                 from app.main import get_setup_status
#                 import asyncio
#                 return asyncio.run(get_setup_status())
#             except Exception as e:
#                 logger.error(f"Error in setup/status: {e}")
#                 return {'activated': False, 'school_completed': False, 'admin_completed': False}
        
#         else:
#             logger.warning(f"Unknown endpoint: {endpoint}")
#             return {'success': False, 'message': f'Unknown endpoint: {endpoint}'}

#     # ===== SETUP ROUTES (direct) =====
#     elif req_type == 'setup' and action == 'school-and-admin':
#         try:
#             from app.main import setup_school_and_admin
            
#             class RequestObject:
#                 def __init__(self, data):
#                     self.school_name = data.get('school_name')
#                     self.school_email = data.get('school_email')
#                     self.school_contact = data.get('school_contact')
#                     self.school_type = data.get('school_type', 'secondary')
#                     self.county = data.get('county')
#                     self.region = data.get('region')
#                     self.city = data.get('city')
#                     self.town = data.get('town')
#                     self.gps_address = data.get('gps_address')
#                     self.country = data.get('country', 'Ghana')
#                     self.first_name = data.get('first_name')
#                     self.middle_name = data.get('middle_name', '')
#                     self.last_name = data.get('last_name')
#                     self.admin_email = data.get('admin_email')
#                     self.contact = data.get('contact')
#                     self.password = data.get('password')
#                     self.confirm_password = data.get('confirm_password')
            
#             req = RequestObject(data)
#             import asyncio
#             result = asyncio.run(setup_school_and_admin(req))
            
#             return {
#                 'success': result.get('success', True),
#                 'message': result.get('message', 'Setup completed successfully'),
#                 'school_id': result.get('school_id'),
#                 'admin_id': result.get('admin_id'),
#                 'cloud_verified': result.get('cloud_verified', False),
#                 'local_saved': result.get('local_saved', {}),
#                 'warnings': result.get('warnings'),
#                 'next_step': result.get('next_step', 'activation')
#             }
#         except Exception as e:
#             logger.error(f"Error in setup: {e}")
#             import traceback
#             traceback.print_exc()
#             return {'success': False, 'message': str(e)}

#     # ===== DATABASE ROUTES =====
#     elif req_type == 'db':
#         from app.activation.state import ensure_all_tables, get_activation_info
        
#         if action == 'init-tables':
#             ensure_all_tables()
#             return {'success': True, 'message': 'Tables initialized'}
#         elif action == 'status':
#             return get_activation_info()
#         elif action == 'get-status':
#             return get_activation_info()

#     # ===== ACTIVATION ROUTES =====
#     elif req_type == 'activation':
#         from app.activation.activation_service import activate_system, check_activation_status, deactivate_system
#         from app.activation.fingerprint import get_or_create_machine_fingerprint
#         from app.activation.state import ensure_all_tables, get_activation_info
        
#         if action == 'status':
#             status = check_activation_status()
#             return {
#                 'activated': status.get('activated', False),
#                 'details': status
#             }
#         elif action == 'activate':
#             return activate_system(data.get('code'), data.get('schoolName') or data.get('school_name'))
#         elif action == 'deactivate':
#             return deactivate_system()
#         elif action == 'fingerprint':
#             return {'fingerprint': get_or_create_machine_fingerprint()}
#         elif action == 'init-tables':
#             ensure_all_tables()
#             return {'success': True, 'message': 'Tables initialized'}
#         elif action == 'get-status':
#             return get_activation_info()

#     # ===== AUTH ROUTES =====
#     elif req_type == 'auth':
#         from app.auth.auth_service import login_user, logout_user, check_user_session, bootstrap_admin
        
#         if action == 'login':
#             return login_user(data.get('username'), data.get('password'), data.get('role'))
#         elif action == 'logout':
#             return logout_user()
#         elif action == 'session':
#             return {'user': check_user_session()}
#         elif action == 'bootstrap':
#             return bootstrap_admin(data.get('username'), data.get('password'))

#     # ===== SETTINGS ROUTES =====
#     elif req_type == 'settings':
#         from app.minisettings.settings_service import get_settings, update_settings
        
#         if action == 'get':
#             return {'settings': get_settings()}
#         elif action == 'update':
#             return update_settings(data)

#     # ===== STUDENTS ROUTES =====
#     elif req_type == 'students':
#         from database.cloud_db import get_db_connection
        
#         conn = get_db_connection()
#         try:
#             cursor = conn.cursor()
            
#             if action == 'get-all':
#                 cursor.execute("SELECT * FROM students ORDER BY name")
#                 columns = [description[0] for description in cursor.description]
#                 rows = cursor.fetchall()
#                 students = [dict(zip(columns, row)) for row in rows]
#                 return {'students': students}
            
#             elif action == 'add':
#                 cursor.execute(
#                     "INSERT INTO students (name, class, section, roll_number, parent_name, parent_phone, address, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
#                     (data.get('name'), data.get('class'), data.get('section'),
#                      data.get('rollNumber'), data.get('parentName'), data.get('parentPhone'),
#                      data.get('address'), data.get('dateOfBirth'))
#                 )
#                 conn.commit()
#                 return {'success': True, 'id': cursor.lastrowid}
            
#             elif action == 'update':
#                 cursor.execute(
#                     "UPDATE students SET name=?, class=?, section=?, roll_number=?, parent_name=?, parent_phone=?, address=?, date_of_birth=? WHERE id=?",
#                     (data.get('name'), data.get('class'), data.get('section'),
#                      data.get('rollNumber'), data.get('parentName'), data.get('parentPhone'),
#                      data.get('address'), data.get('dateOfBirth'), data.get('id'))
#                 )
#                 conn.commit()
#                 return {'success': True, 'affected': cursor.rowcount}
            
#             elif action == 'delete':
#                 cursor.execute("DELETE FROM students WHERE id=?", (data.get('id'),))
#                 conn.commit()
#                 return {'success': True, 'affected': cursor.rowcount}
#         finally:
#             conn.close()

#     # ===== STAFF ROUTES =====
#     elif req_type == 'staff':
#         from database.cloud_db import get_db_connection
        
#         conn = get_db_connection()
#         try:
#             cursor = conn.cursor()
            
#             if action == 'get-all':
#                 cursor.execute("SELECT * FROM staff ORDER BY name")
#                 columns = [description[0] for description in cursor.description]
#                 rows = cursor.fetchall()
#                 staff = [dict(zip(columns, row)) for row in rows]
#                 return {'staff': staff}
            
#             elif action == 'add':
#                 cursor.execute(
#                     "INSERT INTO staff (name, email, phone, role, department, address, date_of_joining, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
#                     (data.get('name'), data.get('email'), data.get('phone'),
#                      data.get('role'), data.get('department'), data.get('address'),
#                      data.get('dateOfJoining'), data.get('salary'))
#                 )
#                 conn.commit()
#                 return {'success': True, 'id': cursor.lastrowid}
            
#             elif action == 'update':
#                 cursor.execute(
#                     "UPDATE staff SET name=?, email=?, phone=?, role=?, department=?, address=?, date_of_joining=?, salary=? WHERE id=?",
#                     (data.get('name'), data.get('email'), data.get('phone'),
#                      data.get('role'), data.get('department'), data.get('address'),
#                      data.get('dateOfJoining'), data.get('salary'), data.get('id'))
#                 )
#                 conn.commit()
#                 return {'success': True, 'affected': cursor.rowcount}
            
#             elif action == 'delete':
#                 cursor.execute("DELETE FROM staff WHERE id=?", (data.get('id'),))
#                 conn.commit()
#                 return {'success': True, 'affected': cursor.rowcount}
#         finally:
#             conn.close()

#     # ===== DASHBOARD ROUTES =====
#     elif req_type == 'dashboard':
#         from database.cloud_db import get_db_connection
        
#         conn = get_db_connection()
#         try:
#             cursor = conn.cursor()
#             cursor.execute("SELECT COUNT(*) FROM students")
#             total_students = cursor.fetchone()[0]
#             cursor.execute("SELECT COUNT(*) FROM staff")
#             total_staff = cursor.fetchone()[0]
#             return {
#                 'totalStudents': total_students,
#                 'totalStaff': total_staff
#             }
#         finally:
#             conn.close()

#     # ===== SYSTEM ROUTES =====
#     elif req_type == 'system':
#         import platform
#         import os
        
#         if action == 'health':
#             return {'status': 'healthy'}
#         elif action == 'info':
#             return {
#                 'platform': platform.platform(),
#                 'python_version': platform.python_version(),
#                 'cwd': os.getcwd()
#             }

#     # ===== BACKUP ROUTES =====
#     elif req_type == 'backup':
#         import shutil
#         import os
#         from datetime import datetime
        
#         backup_dir = "backups"
#         db_path = "database/school_encrypted.db"
        
#         if action == 'create':
#             os.makedirs(backup_dir, exist_ok=True)
#             timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#             backup_file = f"{backup_dir}/backup_{timestamp}.db"
#             if os.path.exists(db_path):
#                 shutil.copy2(db_path, backup_file)
#                 return {'success': True, 'file': backup_file}
#             return {'success': False, 'message': 'Database file not found'}
        
#         elif action == 'list':
#             os.makedirs(backup_dir, exist_ok=True)
#             backups = []
#             for f in os.listdir(backup_dir):
#                 if f.startswith('backup_') and f.endswith('.db'):
#                     backups.append(f)
#             return {'backups': backups}
    
#     raise ValueError(f"Unknown route: {req_type}/{action}")

# def handle_ipc_request(request):
#     """Handle a single IPC request"""
#     try:
#         req_type = request.get('type')
#         action = request.get('action')
#         request_id = request.get('requestId')
#         data = request.get('data', {})
        
#         logger.info(f"IPC: {req_type}/{action} (ID: {request_id})")
        
#         # Route to the appropriate handler
#         result = route_request(req_type, action, data)
        
#         return {
#             'requestId': request_id,
#             'result': result,
#             'status': 'success'
#         }
        
#     except Exception as e:
#         logger.error(f"Error: {e}")
#         import traceback
#         traceback.print_exc()
#         return {
#             'requestId': request.get('requestId'),
#             'error': str(e),
#             'status': 'error'
#         }

# def listen_for_ipc():
#     """Listen for messages from Electron via stdin"""
#     logger.info("IPC Listener started")
    
#     while True:
#         try:
#             line = sys.stdin.readline()
#             if not line:
#                 logger.info("IPC stdin closed")
#                 break
            
#             line = line.strip()
#             if not line:
#                 continue
            
#             request = json.loads(line)
#             response = handle_ipc_request(request)
            
#             sys.stdout.write(json.dumps(response) + '\n')
#             sys.stdout.flush()
            
#         except json.JSONDecodeError as e:
#             logger.error(f"Invalid JSON: {e}")
#             error_response = {
#                 'requestId': 'unknown',
#                 'error': f'Invalid JSON: {str(e)}',
#                 'status': 'error'
#             }
#             sys.stdout.write(json.dumps(error_response) + '\n')
#             sys.stdout.flush()
#         except Exception as e:
#             logger.error(f"Listener error: {e}")

# def main():
#     """Main entry point - starts both IPC listener and FastAPI"""
#     logger.info("=" * 50)
#     logger.info("Starting School Management System Backend")
#     logger.info("=" * 50)
    
#     # Start IPC listener in background thread
#     ipc_thread = threading.Thread(target=listen_for_ipc, daemon=True)
#     ipc_thread.start()
#     logger.info("IPC listener thread started")
    
#     # Initialize database tables
#     try:
#         from app.activation.state import ensure_all_tables
#         ensure_all_tables()
#         logger.info("Database tables ready")
#     except Exception as e:
#         logger.warning(f"Database init skipped: {e}")
    
#     # Start FastAPI server
#     logger.info("Starting FastAPI on http://127.0.0.1:8000")
#     logger.info("=" * 50)
    
#     uvicorn.run(
#         "app.main:app",
#         host="127.0.0.1",
#         port=8000,
#         reload=True,
#         log_level="info"
#     )

# if __name__ == "__main__":
#     main()







import sys
import io

# Force UTF-8 encoding and replace any problematic characters
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# run.py
import uvicorn
import sys
import json
import threading
import logging
from app.main import app

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def route_request(req_type, action, data):
    """Route requests to the appropriate handler functions"""

    # ===== API ROUTES (for backend.fetchData) =====
    if req_type == 'api' and action == 'request':
        endpoint = data.get('endpoint')
        method = data.get('method', 'GET')
        request_data = data.get('data')
        
        logger.info(f"API Request: {method} {endpoint}")
        
        # Route to the appropriate endpoint
        if endpoint == 'setup/school-and-admin':
            try:
                # Import the function from main.py
                from app.main import setup_school_and_admin
                
                # Create a request object that matches what the endpoint expects
                class RequestObject:
                    def __init__(self, data):
                        self.school_name = data.get('school_name')
                        self.school_email = data.get('school_email')
                        self.school_contact = data.get('school_contact')
                        self.school_type = data.get('school_type', 'secondary')
                        self.county = data.get('county')
                        self.region = data.get('region')
                        self.city = data.get('city')
                        self.town = data.get('town')
                        self.gps_address = data.get('gps_address')
                        self.country = data.get('country', 'Ghana')
                        self.first_name = data.get('first_name')
                        self.middle_name = data.get('middle_name', '')
                        self.last_name = data.get('last_name')
                        self.admin_email = data.get('admin_email')
                        self.contact = data.get('contact')
                        self.password = data.get('password')
                        self.confirm_password = data.get('confirm_password')
                
                req = RequestObject(request_data)
                
                # Call the function (it's async, so we need to run it)
                import asyncio
                result = asyncio.run(setup_school_and_admin(req))
                
                logger.info(f"Setup result: {result.get('message')}")
                return result
                
            except Exception as e:
                logger.error(f"Error in setup: {e}")
                import traceback
                traceback.print_exc()
                return {'success': False, 'message': str(e)}
        
    #     # AUTH ENDPOINTS
    #     elif endpoint == 'auth/login':
    #         try:
    #             from app.auth.auth_service import login_user
    #             return login_user(
    #                 request_data.get('username'),
    #                 request_data.get('password'),
    #                 request_data.get('role')
    #             )
    #         except Exception as e:
    #             logger.error(f"Error in auth/login: {e}")
    #             return {'success': False, 'message': str(e)}
        
    #     elif endpoint == 'auth/logout':
    #         try:
    #             from app.auth.auth_service import logout_user
    #             return logout_user()
    #         except Exception as e:
    #             logger.error(f"Error in auth/logout: {e}")
    #             return {'success': False, 'message': str(e)}
        
    #     elif endpoint == 'auth/session':
    #         try:
    #             from app.auth.auth_service import check_user_session
    #             return {'user': check_user_session()}
    #         except Exception as e:
    #             logger.error(f"Error in auth/session: {e}")
    #             return {'user': None}
        
    #     elif endpoint == 'auth/bootstrap':
    #         try:
    #             from app.auth.auth_service import bootstrap_admin
    #             return bootstrap_admin(
    #                 request_data.get('username'),
    #                 request_data.get('password')
    #             )
    #         except Exception as e:
    #             logger.error(f"Error in auth/bootstrap: {e}")
    #             return {'success': False, 'message': str(e)}
        

    # # ===== AUTH ROUTES =====
    # elif req_type == 'auth':
    #     from app.auth.auth_service import login_user, logout_user, check_user_session, bootstrap_admin
        
    #     if action == 'login':
    #         return login_user(data.get('username'), data.get('password'), data.get('role'))
    #     elif action == 'logout':
    #         return logout_user()
    #     elif action == 'session':
    #         return {'user': check_user_session()}
    #     elif action == 'bootstrap':
    #         return bootstrap_admin(data.get('username'), data.get('password'))

      
      
            # ===== AUTH ROUTES in run.py =====
    elif req_type == 'auth':
        from app.auth.auth_service import login_user, logout_user, check_user_session, bootstrap_admin
        
        if action == 'login':
            # Extract login credentials
            username = data.get('username')
            password = data.get('password')
            role = data.get('role')
            
            print(f"Auth login request - username: {username}, role: {role}")
            
            result = login_user(username, password, role)
            print(f"Login result: {result}")
            return result
        
        elif action == 'logout':
            # Extract session ID if provided
            session_id = data.get('session_id')
            return logout_user(session_id)
        
        elif action == 'session':
            # Extract session ID if provided
            session_id = data.get('session_id')
            user = check_user_session(session_id)
            return {'user': user}
        
        elif action == 'bootstrap':
            # Bootstrap admin user
            username = data.get('username')
            password = data.get('password')
            return bootstrap_admin(username, password)




      
      
      
        # ===== ACTIVATION ENDPOINTS (UPDATED) =====
        elif endpoint == 'activation/status':
            try:
                from app.activation.state import is_activated
                return {'activated': is_activated()}
            except Exception as e:
                logger.error(f"Error in activation/status: {e}")
                return {'activated': False}
        
        elif endpoint == 'activation/status/detailed':
            try:
                from app.activation.activation_service import check_activation_status
                return check_activation_status()
            except Exception as e:
                logger.error(f"Error in activation/status/detailed: {e}")
                return {'activated': False, 'error': str(e)}
        
        elif endpoint == 'activation/validate':
            try:
                from app.activation.activation_service import validate_activation_code
                is_valid = validate_activation_code(
                    request_data.get('school_name'),
                    request_data.get('code')
                )
                return {
                    'valid': is_valid,
                    'message': 'Code is valid' if is_valid else 'Invalid activation code'
                }
            except Exception as e:
                logger.error(f"Error in activation/validate: {e}")
                return {'valid': False, 'message': str(e)}
        
        elif endpoint == 'activation/expected-code':
            try:
                from app.activation.activation_service import calculate_expected_code
                expected = calculate_expected_code(request_data.get('school_name'))
                return {
                    'expected_code': expected,
                    'school_name': request_data.get('school_name'),
                    'note': 'This is for debugging. In production, codes are generated by the vendor.'
                }
            except Exception as e:
                logger.error(f"Error in activation/expected-code: {e}")
                return {'expected_code': None, 'error': str(e)}
        
        elif endpoint == 'activation/activate':
            try:
                from app.activation.activation_service import activate_system
                from app.minisettings.mini_settings_api import mini_settings_service
                
                # Call the activation service
                result = activate_system(
                    request_data.get('code'),
                    request_data.get('school_name')
                )
                
                # If activation successful, reset mini-settings
                if result.get('success'):
                    try:
                        # Load current settings
                        current_settings = mini_settings_service.load_settings()
                        
                        # Reset hasSeenMiniSettings to False
                        updated_settings = {
                            **current_settings,
                            "hasSeenMiniSettings": False,
                            "lastUpdated": mini_settings_service.get_current_timestamp(),
                            "resetReason": "system_activation",
                            "resetAtActivation": True
                        }
                        
                        # Save updated settings
                        mini_settings_service.save_all_settings(updated_settings)
                        
                        logger.info("Mini-settings reset: hasSeenMiniSettings = False")
                        result['mini_settings_reset'] = True
                        
                    except Exception as settings_error:
                        logger.warning(f"Could not reset mini-settings: {settings_error}")
                        result['mini_settings_reset'] = False
                
                return result
                
            except Exception as e:
                logger.error(f"Error in activation/activate: {e}")
                import traceback
                traceback.print_exc()
                return {'success': False, 'message': str(e)}
        
        elif endpoint == 'activation/machine-id':
            try:
                from app.activation.fingerprint import get_or_create_machine_fingerprint
                fingerprint = get_or_create_machine_fingerprint()
                return {
                    'machine_fingerprint': fingerprint,
                    'note': 'Share this with vendor to generate activation code'
                }
            except Exception as e:
                logger.error(f"Error in activation/machine-id: {e}")
                return {'machine_fingerprint': None, 'error': str(e)}
        
        # STUDENTS ENDPOINTS
        elif endpoint == 'students/list':
            try:
                from database.cloud_db import get_db_connection
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM students ORDER BY name")
                columns = [description[0] for description in cursor.description]
                rows = cursor.fetchall()
                students = [dict(zip(columns, row)) for row in rows]
                conn.close()
                return {'students': students}
            except Exception as e:
                logger.error(f"Error in students/list: {e}")
                return {'students': []}
        
        elif endpoint == 'students/add':
            try:
                from database.cloud_db import get_db_connection
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO students (name, class, section, roll_number, parent_name, parent_phone, address, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (request_data.get('name'), request_data.get('class'), request_data.get('section'),
                     request_data.get('rollNumber'), request_data.get('parentName'), request_data.get('parentPhone'),
                     request_data.get('address'), request_data.get('dateOfBirth'))
                )
                conn.commit()
                student_id = cursor.lastrowid
                conn.close()
                return {'success': True, 'id': student_id}
            except Exception as e:
                logger.error(f"Error in students/add: {e}")
                return {'success': False, 'message': str(e)}
        
        # STAFF ENDPOINTS
        elif endpoint == 'staff/list':
            try:
                from database.cloud_db import get_db_connection
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM staff ORDER BY name")
                columns = [description[0] for description in cursor.description]
                rows = cursor.fetchall()
                staff = [dict(zip(columns, row)) for row in rows]
                conn.close()
                return {'staff': staff}
            except Exception as e:
                logger.error(f"Error in staff/list: {e}")
                return {'staff': []}
        
        # DATABASE ENDPOINTS
        elif endpoint == 'database/status':
            try:
                from app.main import database_status
                import asyncio
                return asyncio.run(database_status())
            except Exception as e:
                logger.error(f"Error in database/status: {e}")
                return {'exists': False, 'error': str(e)}
        
        # SETUP STATUS ENDPOINT
        elif endpoint == 'setup/status':
            try:
                from app.main import get_setup_status
                import asyncio
                return asyncio.run(get_setup_status())
            except Exception as e:
                logger.error(f"Error in setup/status: {e}")
                return {'activated': False, 'school_completed': False, 'admin_completed': False}
        
        else:
            logger.warning(f"Unknown endpoint: {endpoint}")
            return {'success': False, 'message': f'Unknown endpoint: {endpoint}'}
            

    # ===== SETUP ROUTES (direct) =====
    elif req_type == 'setup' and action == 'school-and-admin':
        try:
            from app.main import setup_school_and_admin
            
            class RequestObject:
                def __init__(self, data):
                    self.school_name = data.get('school_name')
                    self.school_email = data.get('school_email')
                    self.school_contact = data.get('school_contact')
                    self.school_type = data.get('school_type', 'secondary')
                    self.county = data.get('county')
                    self.region = data.get('region')
                    self.city = data.get('city')
                    self.town = data.get('town')
                    self.gps_address = data.get('gps_address')
                    self.country = data.get('country', 'Ghana')
                    self.first_name = data.get('first_name')
                    self.middle_name = data.get('middle_name', '')
                    self.last_name = data.get('last_name')
                    self.admin_email = data.get('admin_email')
                    self.contact = data.get('contact')
                    self.password = data.get('password')
                    self.confirm_password = data.get('confirm_password')
            
            req = RequestObject(data)
            import asyncio
            result = asyncio.run(setup_school_and_admin(req))
            
            return {
                'success': result.get('success', True),
                'message': result.get('message', 'Setup completed successfully'),
                'school_id': result.get('school_id'),
                'admin_id': result.get('admin_id'),
                'cloud_verified': result.get('cloud_verified', False),
                'local_saved': result.get('local_saved', {}),
                'warnings': result.get('warnings'),
                'next_step': result.get('next_step', 'activation')
            }
        except Exception as e:
            logger.error(f"Error in setup: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'message': str(e)}

    # ===== DATABASE ROUTES =====
    # elif req_type == 'db':
    #     from app.activation.state import ensure_all_tables, get_activation_info
    #     from app.main import get_setup_status
        
    #     if action == 'init-tables':
    #         ensure_all_tables()
    #         return {'success': True, 'message': 'Tables initialized'}
    #     elif action == 'status':
    #         return get_setup_status()
    #     elif action == 'get-status':
    #         return get_setup_status()
    
        # ===== DATABASE ROUTES =====
    elif req_type == 'db':
        from app.activation.state import ensure_all_tables, is_activated
        from app.main import check_school_setup_complete, check_admin_setup_complete
        
        # Helper function to get setup status
        # def get_setup_status():
        #     try:
        #         info = get_activation_info()
        #         school = info.get('school_completed', False)
        #         admin = info.get('admin_completed', False)
        #         active = info.get('activated', False)
                
        #         # Determine current step
        #         if active:
        #             current_step = "completed"
        #         elif not school:
        #             current_step = "school"
        #         elif not admin:
        #             current_step = "admin"
        #         else:
        #             current_step = "activation"
                
        #         return {
        #             "activated": active,
        #             "school_completed": school,
        #             "admin_completed": admin,
        #             "current_step": current_step,
        #             "requires_internet": True
        #         }
        #     except Exception as e:
        #         logger.error(f"Error in get_setup_status: {e}")
        #         return {
        #             'activated': False,
        #             'school_completed': False,
        #             'admin_completed': False,
        #             'current_step': 'school'
        #         }

        def get_setup_status():
            """Check what step we're on"""
            activated = is_activated()
            school_completed = check_school_setup_complete()
            admin_completed = check_admin_setup_complete()
            
            # Determine current step
            if activated:
                current_step = "completed"
            elif not school_completed:
                current_step = "school"
            elif not admin_completed:
                current_step = "admin"
            else:
                current_step = "activation"
            
            return {
                "activated": activated,
                "school_completed": school_completed,
                "admin_completed": admin_completed,
                "current_step": current_step,
                "requires_internet": True
            }


            
        
        if action == 'init-tables':
            ensure_all_tables()
            return {'success': True, 'message': 'Tables initialized'}
        elif action == 'status':
            return get_setup_status()
        elif action == 'get-status':
            return get_setup_status()





    elif req_type == 'setup':
        from app.main import get_setup_status
        if action == 'status':
            return get_setup_status()

    # ===== ACTIVATION ROUTES (direct) =====
    elif req_type == 'activation':
        from app.activation.activation_service import activate_system, check_activation_status
        from app.activation.state import is_activated
        from app.activation.fingerprint import get_or_create_machine_fingerprint
        from app.activation.activation_service import validate_activation_code, calculate_expected_code
        from app.minisettings.mini_settings_api import mini_settings_service
        
        if action == 'status':
            return {
                'activated': is_activated(),    
                'result': {'activated': is_activated()}
            }
        
        elif action == 'get-status':
            return check_activation_status()
        
        elif action == 'getDetailedStatus':
            return check_activation_status()
        
        elif action == 'machine-id':
            fingerprint = get_or_create_machine_fingerprint()
            return {
                'machine_fingerprint': fingerprint,
                'result': {'machine_fingerprint': fingerprint}
            }
        
        elif action == 'fingerprint':
            return {'fingerprint': get_or_create_machine_fingerprint()}
        
        elif action == 'validate':
            is_valid = validate_activation_code(
                data.get('school_name'),
                data.get('code')
            )
            return {
                'valid': is_valid,
                'message': 'Code is valid' if is_valid else 'Invalid activation code',
                'result': {
                    'valid': is_valid,
                    'message': 'Code is valid' if is_valid else 'Invalid activation code'
                }
            }
        
        elif action == 'expected-code':
            expected = calculate_expected_code(data.get('school_name'))
            return {
                'expected_code': expected,
                'school_name': data.get('school_name'),
                'result': {
                    'expected_code': expected,
                    'school_name': data.get('school_name')
                }
            }
        
        elif action == 'activate':

            print("DEBUG action:", action)
            print("DEBUG data:", data)
            print("DEBUG data type:", type(data))

            code = data.get('code')
            school_name = data.get('schoolName')

            print("DEBUG code:", code)
            print("DEBUG school_name:", school_name)

            if not code or not school_name:
                result = {"success": False, "message": "Invalid request"}
            else:
                result = activate_system(code, school_name)


            # result = activate_system(data.get('code'), data.get('school_name'))
            
            
            # Reset mini-settings if activation successful
            if result.get('success'):
                try:
                    current_settings = mini_settings_service.load_settings()
                    updated_settings = {
                        **current_settings,
                        "hasSeenMiniSettings": False,
                        "lastUpdated": mini_settings_service.get_current_timestamp(),
                        "resetReason": "system_activation",
                        "resetAtActivation": True
                    }
                    mini_settings_service.save_all_settings(updated_settings)
                    result['mini_settings_reset'] = True
                except Exception as e:
                    logger.warning(f"Could not reset mini-settings: {e}")
                    result['mini_settings_reset'] = False
            
            return result
        
        elif action == 'deactivate':
            from app.activation.state import deactivate_system as deactivate
            return deactivate()
        
        elif action == 'init-tables':
            ensure_all_tables()
            return {'success': True, 'message': 'Tables initialized'}


    # ===== SETTINGS ROUTES =====
    elif req_type == 'settings':
        from app.minisettings.settings_service import get_settings, update_settings
        
        if action == 'get':
            return {'settings': get_settings()}
        elif action == 'update':
            return update_settings(data)

    # ===== STUDENTS ROUTES =====
    elif req_type == 'students':
        from database.cloud_db import get_db_connection
        
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            
            if action == 'get-all':
                cursor.execute("SELECT * FROM students ORDER BY name")
                columns = [description[0] for description in cursor.description]
                rows = cursor.fetchall()
                students = [dict(zip(columns, row)) for row in rows]
                return {'students': students}
            
            elif action == 'add':
                cursor.execute(
                    "INSERT INTO students (name, class, section, roll_number, parent_name, parent_phone, address, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (data.get('name'), data.get('class'), data.get('section'),
                     data.get('rollNumber'), data.get('parentName'), data.get('parentPhone'),
                     data.get('address'), data.get('dateOfBirth'))
                )
                conn.commit()
                return {'success': True, 'id': cursor.lastrowid}
            
            elif action == 'update':
                cursor.execute(
                    "UPDATE students SET name=?, class=?, section=?, roll_number=?, parent_name=?, parent_phone=?, address=?, date_of_birth=? WHERE id=?",
                    (data.get('name'), data.get('class'), data.get('section'),
                     data.get('rollNumber'), data.get('parentName'), data.get('parentPhone'),
                     data.get('address'), data.get('dateOfBirth'), data.get('id'))
                )
                conn.commit()
                return {'success': True, 'affected': cursor.rowcount}
            
            elif action == 'delete':
                cursor.execute("DELETE FROM students WHERE id=?", (data.get('id'),))
                conn.commit()
                return {'success': True, 'affected': cursor.rowcount}
        finally:
            conn.close()

    # ===== STAFF ROUTES =====
    elif req_type == 'staff':
        from database.cloud_db import get_db_connection
        
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            
            if action == 'get-all':
                cursor.execute("SELECT * FROM staff ORDER BY name")
                columns = [description[0] for description in cursor.description]
                rows = cursor.fetchall()
                staff = [dict(zip(columns, row)) for row in rows]
                return {'staff': staff}
            
            elif action == 'add':
                cursor.execute(
                    "INSERT INTO staff (name, email, phone, role, department, address, date_of_joining, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (data.get('name'), data.get('email'), data.get('phone'),
                     data.get('role'), data.get('department'), data.get('address'),
                     data.get('dateOfJoining'), data.get('salary'))
                )
                conn.commit()
                return {'success': True, 'id': cursor.lastrowid}
            
            elif action == 'update':
                cursor.execute(
                    "UPDATE staff SET name=?, email=?, phone=?, role=?, department=?, address=?, date_of_joining=?, salary=? WHERE id=?",
                    (data.get('name'), data.get('email'), data.get('phone'),
                     data.get('role'), data.get('department'), data.get('address'),
                     data.get('dateOfJoining'), data.get('salary'), data.get('id'))
                )
                conn.commit()
                return {'success': True, 'affected': cursor.rowcount}
            
            elif action == 'delete':
                cursor.execute("DELETE FROM staff WHERE id=?", (data.get('id'),))
                conn.commit()
                return {'success': True, 'affected': cursor.rowcount}
        finally:
            conn.close()

    # ===== DASHBOARD ROUTES =====
    elif req_type == 'dashboard':
        from database.cloud_db import get_db_connection
        
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM students")
            total_students = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM staff")
            total_staff = cursor.fetchone()[0]
            return {
                'totalStudents': total_students,
                'totalStaff': total_staff
            }
        finally:
            conn.close()

    # ===== SYSTEM ROUTES =====
    elif req_type == 'system':
        import platform
        import os
        
        if action == 'health':
            return {'status': 'healthy'}
        elif action == 'info':
            return {
                'platform': platform.platform(),
                'python_version': platform.python_version(),
                'cwd': os.getcwd()
            }

    # ===== BACKUP ROUTES =====
    elif req_type == 'backup':
        import shutil
        import os
        from datetime import datetime
        
        backup_dir = "backups"
        db_path = "database/school_encrypted.db"
        
        if action == 'create':
            os.makedirs(backup_dir, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"{backup_dir}/backup_{timestamp}.db"
            if os.path.exists(db_path):
                shutil.copy2(db_path, backup_file)
                return {'success': True, 'file': backup_file}
            return {'success': False, 'message': 'Database file not found'}
        
        elif action == 'list':
            os.makedirs(backup_dir, exist_ok=True)
            backups = []
            for f in os.listdir(backup_dir):
                if f.startswith('backup_') and f.endswith('.db'):
                    backups.append(f)
            return {'backups': backups}
    
    raise ValueError(f"Unknown route: {req_type}/{action}")

def handle_ipc_request(request):
    """Handle a single IPC request"""
    try:
        req_type = request.get('type')
        action = request.get('action')
        request_id = request.get('requestId')
        data = request.get('data', {})
        
        logger.info(f"IPC: {req_type}/{action} (ID: {request_id})")
        
        # Route to the appropriate handler
        result = route_request(req_type, action, data)
        
        return {
            'requestId': request_id,
            'result': result,
            'status': 'success'
        }
        
    except Exception as e:
        logger.error(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return {
            'requestId': request.get('requestId'),
            'error': str(e),
            'status': 'error'
        }

def listen_for_ipc():
    """Listen for messages from Electron via stdin"""
    logger.info("IPC Listener started")
    
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                logger.info("IPC stdin closed")
                break
            
            line = line.strip()
            if not line:
                continue
            
            request = json.loads(line)
            response = handle_ipc_request(request)
            
            sys.stdout.write(json.dumps(response) + '\n')
            sys.stdout.flush()
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON: {e}")
            error_response = {
                'requestId': 'unknown',
                'error': f'Invalid JSON: {str(e)}',
                'status': 'error'
            }
            sys.stdout.write(json.dumps(error_response) + '\n')
            sys.stdout.flush()
        except Exception as e:
            logger.error(f"Listener error: {e}")

def main():
    """Main entry point - starts both IPC listener and FastAPI"""
    
    logger.info("=" * 50)
    logger.info("Starting School Management System Backend")
    logger.info("=" * 50)
    
    # Start IPC listener in background thread
    ipc_thread = threading.Thread(target=listen_for_ipc, daemon=True)
    ipc_thread.start()
    logger.info("IPC listener thread started")
    
    # Initialize database tables
    try:
        from app.activation.state import ensure_all_tables
        ensure_all_tables()
        logger.info("Database tables ready")
    except Exception as e:
        logger.warning(f"Database init skipped: {e}")
    
    # Start FastAPI server
    logger.info("Starting FastAPI on http://127.0.0.1:8000")
    logger.info("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()