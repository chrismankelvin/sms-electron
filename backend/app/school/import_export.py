


# # app/school/import_export.py

# from fastapi import APIRouter, HTTPException, UploadFile, File, Form
# from fastapi.responses import StreamingResponse
# from pydantic import BaseModel
# from typing import Optional, Dict, Any, List
# from datetime import datetime
# import logging
# import traceback
# import sys
# import csv
# import io
# import json

# # Remove circular imports - use direct database connection
# from app.activation.state import get_db_connection

# # Configure logging
# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)

# if not logger.handlers:
#     console_handler = logging.StreamHandler(sys.stdout)
#     console_handler.setLevel(logging.DEBUG)
#     formatter = logging.Formatter(
#         '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
#     )
#     console_handler.setFormatter(formatter)
#     logger.addHandler(console_handler)

# router = APIRouter(prefix="/api/import", tags=["import-export"])

# # ==================== Pydantic Models ====================

# class ImportResult(BaseModel):
#     success: bool
#     total_records: int
#     success_count: int
#     error_count: int
#     errors: List[Dict[str, Any]]
#     imported_ids: List[int]

# # ==================== Helper Functions ====================

# def parse_csv_file(file_content: bytes) -> List[Dict[str, str]]:
#     """Parse CSV file content to list of dictionaries"""
#     try:
#         # Try different encodings
#         for encoding in ['utf-8-sig', 'utf-8', 'latin-1']:
#             try:
#                 text = file_content.decode(encoding)
#                 break
#             except UnicodeDecodeError:
#                 continue
#         else:
#             text = file_content.decode('utf-8', errors='replace')
        
#         csv_reader = csv.DictReader(io.StringIO(text))
#         return list(csv_reader)
#     except Exception as e:
#         logger.error(f"Error parsing CSV: {str(e)}")
#         raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

# def parse_excel_file(file_content: bytes) -> List[Dict[str, str]]:
#     """Parse Excel file content to list of dictionaries"""
#     try:
#         import pandas as pd
#         df = pd.read_excel(io.BytesIO(file_content))
#         # Convert NaN to None
#         df = df.where(pd.notnull(df), None)
#         return df.to_dict('records')
#     except ImportError:
#         raise HTTPException(status_code=400, detail="pandas library not installed. Please install pandas to support Excel files.")
#     except Exception as e:
#         logger.error(f"Error parsing Excel: {str(e)}")
#         raise HTTPException(status_code=400, detail=f"Invalid Excel format: {str(e)}")

# def generate_csv_template(headers: List[str]) -> str:
#     """Generate CSV template with given headers"""
#     output = io.StringIO()
#     writer = csv.writer(output)
#     writer.writerow(headers)
#     return output.getvalue()

# def generate_sample_data(import_type: str) -> List[Dict[str, str]]:
#     """Generate sample data for preview"""
#     samples = {
#         'students': [
#             {'Student Number': 'STU001', 'First Name': 'John', 'Last Name': 'Doe', 'Date of Birth': '2010-05-15', 'Gender': 'Male', 'Class': 'JHS 1A', 'Parent Name': 'Mr. John Doe', 'Parent Phone': '0244123456', 'Parent Email': 'john@example.com', 'Address': 'Accra'},
#             {'Student Number': 'STU002', 'First Name': 'Jane', 'Last Name': 'Smith', 'Date of Birth': '2010-08-20', 'Gender': 'Female', 'Class': 'JHS 1A', 'Parent Name': 'Mrs. Jane Smith', 'Parent Phone': '0244789012', 'Parent Email': 'jane@example.com', 'Address': 'Tema'}
#         ],
#         'staff': [
#             {'Staff Number': 'TCH001', 'First Name': 'John', 'Last Name': 'Doe', 'Role': 'Teacher', 'Department': 'Science', 'Qualification': "Bachelor's", 'Hired Date': '2020-09-01', 'Email': 'john@school.edu', 'Phone': '0244123456'},
#             {'Staff Number': 'TCH002', 'First Name': 'Jane', 'Last Name': 'Smith', 'Role': 'Teacher', 'Department': 'Mathematics', 'Qualification': "Master's", 'Hired Date': '2019-09-01', 'Email': 'jane@school.edu', 'Phone': '0244789012'}
#         ],
#         'subjects': [
#             {'Subject Name': 'Mathematics', 'Subject Code': 'MATH101', 'Type': 'core', 'Category': 'BOTH', 'Description': 'Basic mathematics'},
#             {'Subject Name': 'English', 'Subject Code': 'ENG101', 'Type': 'core', 'Category': 'BOTH', 'Description': 'English language'}
#         ],
#         'classes': [
#             {'Class Name': 'JHS 1 Science A', 'Class Code': 'JHS1-SCI-A', 'Level': 'JHS 1', 'Programme': '', 'Capacity': '40', 'Form Master': 'Mr. John Doe'},
#             {'Class Name': 'SHS 1 Science A', 'Class Code': 'SHS1-SCI-A', 'Level': 'SHS 1', 'Programme': 'General Science', 'Capacity': '45', 'Form Master': 'Dr. James Wilson'}
#         ],
#         'scores': [
#             {'Student Number': 'STU001', 'Assessment Name': 'Mathematics Quiz 1', 'Score': '85', 'Absent': 'No', 'Remarks': 'Good'},
#             {'Student Number': 'STU002', 'Assessment Name': 'Mathematics Quiz 1', 'Score': '92', 'Absent': 'No', 'Remarks': 'Excellent'}
#         ]
#     }
#     return samples.get(import_type, [])

# def validate_record(import_type: str, record: Dict[str, Any], row_index: int) -> List[Dict[str, Any]]:
#     """Validate a single record based on import type"""
#     errors = []
    
#     if import_type == 'students':
#         if not record.get('First Name'):
#             errors.append({"row": row_index + 1, "error": "First Name is required"})
#         if not record.get('Last Name'):
#             errors.append({"row": row_index + 1, "error": "Last Name is required"})
#         if not record.get('Student Number'):
#             errors.append({"row": row_index + 1, "error": "Student Number is required"})
    
#     elif import_type == 'staff':
#         if not record.get('First Name'):
#             errors.append({"row": row_index + 1, "error": "First Name is required"})
#         if not record.get('Last Name'):
#             errors.append({"row": row_index + 1, "error": "Last Name is required"})
#         if not record.get('Staff Number'):
#             errors.append({"row": row_index + 1, "error": "Staff Number is required"})
    
#     elif import_type == 'subjects':
#         if not record.get('Subject Name'):
#             errors.append({"row": row_index + 1, "error": "Subject Name is required"})
#         if not record.get('Subject Code'):
#             errors.append({"row": row_index + 1, "error": "Subject Code is required"})
    
#     elif import_type == 'classes':
#         if not record.get('Class Name'):
#             errors.append({"row": row_index + 1, "error": "Class Name is required"})
#         if not record.get('Class Code'):
#             errors.append({"row": row_index + 1, "error": "Class Code is required"})
    
#     return errors

# async def import_record(import_type: str, record: Dict[str, Any]) -> Dict[str, Any]:
#     """Import a single record - simplified version without circular imports"""
#     conn = None
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         if import_type == 'students':
#             # Check if student already exists
#             cursor.execute("SELECT id FROM students WHERE admission_number = ?", (record.get('Student Number'),))
#             existing = cursor.fetchone()
            
#             if existing:
#                 return {"success": True, "id": existing['id'], "message": "Student already exists"}
            
#             # Insert student
#             cursor.execute("""
#                 INSERT INTO students (first_name, surname, admission_number, created_at, updated_at)
#                 VALUES (?, ?, ?, ?, ?)
#             """, (
#                 record.get('First Name'),
#                 record.get('Last Name'),
#                 record.get('Student Number'),
#                 datetime.now().isoformat(),
#                 datetime.now().isoformat()
#             ))
#             conn.commit()
#             return {"success": True, "id": cursor.lastrowid}
        
#         elif import_type == 'staff':
#             # Check if staff already exists
#             cursor.execute("SELECT id FROM staff WHERE staff_number = ?", (record.get('Staff Number'),))
#             existing = cursor.fetchone()
            
#             if existing:
#                 return {"success": True, "id": existing['id'], "message": "Staff already exists"}
            
#             # First create person_details
#             cursor.execute("""
#                 INSERT INTO person_details (first_name, last_name, created_at, updated_at)
#                 VALUES (?, ?, ?, ?)
#             """, (
#                 record.get('First Name'),
#                 record.get('Last Name'),
#                 datetime.now().isoformat(),
#                 datetime.now().isoformat()
#             ))
#             person_id = cursor.lastrowid
            
#             # Then insert staff
#             cursor.execute("""
#                 INSERT INTO staff (person_id, staff_number, role, created_at, updated_at)
#                 VALUES (?, ?, ?, ?, ?)
#             """, (
#                 person_id,
#                 record.get('Staff Number'),
#                 record.get('Role', 'Teacher'),
#                 datetime.now().isoformat(),
#                 datetime.now().isoformat()
#             ))
#             conn.commit()
#             return {"success": True, "id": cursor.lastrowid}
        
#         elif import_type == 'subjects':
#             cursor.execute("""
#                 INSERT OR IGNORE INTO subjects (name, code, type, category, created_at, updated_at)
#                 VALUES (?, ?, ?, ?, ?, ?)
#             """, (
#                 record.get('Subject Name'),
#                 record.get('Subject Code'),
#                 record.get('Type', 'core'),
#                 record.get('Category', 'BOTH'),
#                 datetime.now().isoformat(),
#                 datetime.now().isoformat()
#             ))
#             conn.commit()
#             return {"success": True, "id": cursor.lastrowid if cursor.lastrowid else None}
        
#         elif import_type == 'classes':
#             cursor.execute("""
#                 INSERT OR IGNORE INTO classes (class_name, class_code, capacity, created_at, updated_at)
#                 VALUES (?, ?, ?, ?, ?)
#             """, (
#                 record.get('Class Name'),
#                 record.get('Class Code'),
#                 int(record.get('Capacity', 40)),
#                 datetime.now().isoformat(),
#                 datetime.now().isoformat()
#             ))
#             conn.commit()
#             return {"success": True, "id": cursor.lastrowid if cursor.lastrowid else None}
        
#         return {"success": False, "message": f"Unknown import type: {import_type}"}
        
#     except Exception as e:
#         if conn:
#             conn.rollback()
#         return {"success": False, "message": str(e)}
#     finally:
#         if conn:
#             conn.close()

# # ==================== API Endpoints ====================

# @router.post("/preview/{import_type}")
# async def preview_import(
#     import_type: str,
#     file: UploadFile = File(...),
#     skip_rows: int = Form(0)
# ):
#     """Preview the first few rows of the imported file"""
#     logger.info(f"POST /api/import/preview/{import_type} - Previewing file")
    
#     try:
#         content = await file.read()
        
#         if file.filename.endswith('.csv'):
#             data = parse_csv_file(content)
#         else:
#             data = parse_excel_file(content)
        
#         # Skip rows if specified
#         if skip_rows > 0:
#             data = data[skip_rows:]
        
#         # Get sample (first 5 rows)
#         preview_data = data[:5] if len(data) > 5 else data
        
#         # Get headers
#         headers = list(preview_data[0].keys()) if preview_data else []
        
#         return {
#             "success": True,
#             "data": {
#                 "headers": headers,
#                 "preview": preview_data,
#                 "total_rows": len(data)
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in preview_import: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

# @router.post("/validate/{import_type}")
# async def validate_import(
#     import_type: str,
#     file: UploadFile = File(...),
#     column_mapping: str = Form(...),
#     skip_rows: int = Form(0)
# ):
#     """Validate data before import"""
#     logger.info(f"POST /api/import/validate/{import_type} - Validating file")
    
#     try:
#         content = await file.read()
#         mapping = json.loads(column_mapping)
        
#         if file.filename.endswith('.csv'):
#             data = parse_csv_file(content)
#         else:
#             data = parse_excel_file(content)
        
#         # Skip rows if specified
#         if skip_rows > 0:
#             data = data[skip_rows:]
        
#         errors = []
#         valid_records = []
        
#         for index, row in enumerate(data):
#             mapped_record = {}
#             for target_field, source_field in mapping.items():
#                 if source_field and source_field != 'skip':
#                     mapped_record[target_field] = row.get(source_field, '')
            
#             # Validate based on import type
#             validation_errors = validate_record(import_type, mapped_record, index)
#             if validation_errors:
#                 errors.extend(validation_errors)
#             else:
#                 valid_records.append(mapped_record)
        
#         return {
#             "success": True,
#             "data": {
#                 "total_records": len(data),
#                 "valid_count": len(valid_records),
#                 "error_count": len(errors),
#                 "errors": errors[:50],  # Limit to first 50 errors
#                 "valid_records_preview": valid_records[:10]
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in validate_import: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

# @router.post("/execute/{import_type}")
# async def execute_import(
#     import_type: str,
#     file: UploadFile = File(...),
#     column_mapping: str = Form(...),
#     skip_rows: int = Form(0),
#     skip_errors: bool = Form(False)
# ):
#     """Execute the import"""
#     logger.info(f"POST /api/import/execute/{import_type} - Executing import")
    
#     try:
#         content = await file.read()
#         mapping = json.loads(column_mapping)
        
#         if file.filename.endswith('.csv'):
#             data = parse_csv_file(content)
#         else:
#             data = parse_excel_file(content)
        
#         # Skip rows if specified
#         if skip_rows > 0:
#             data = data[skip_rows:]
        
#         errors = []
#         imported_ids = []
        
#         for index, row in enumerate(data):
#             mapped_record = {}
#             for target_field, source_field in mapping.items():
#                 if source_field and source_field != 'skip':
#                     mapped_record[target_field] = row.get(source_field, '').strip()
            
#             try:
#                 result = await import_record(import_type, mapped_record)
#                 if result.get('success'):
#                     if result.get('id'):
#                         imported_ids.append(result['id'])
#                 else:
#                     errors.append({
#                         "row": index + 1,
#                         "error": result.get('message', 'Import failed')
#                     })
#                     if not skip_errors:
#                         break
#             except Exception as e:
#                 errors.append({
#                     "row": index + 1,
#                     "error": str(e)
#                 })
#                 if not skip_errors:
#                     break
        
#         return {
#             "success": True,
#             "data": {
#                 "total_records": len(data),
#                 "success_count": len(imported_ids),
#                 "error_count": len(errors),
#                 "errors": errors,
#                 "imported_ids": imported_ids
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in execute_import: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

# @router.get("/template/{import_type}")
# async def download_template(import_type: str):
#     """Download template CSV file for the specified import type"""
#     logger.info(f"GET /api/import/template/{import_type} - Downloading template")
    
#     templates = {
#         'students': ['Student Number', 'First Name', 'Last Name', 'Date of Birth', 'Gender', 'Class', 'Parent Name', 'Parent Phone', 'Parent Email', 'Address'],
#         'staff': ['Staff Number', 'First Name', 'Last Name', 'Role', 'Department', 'Qualification', 'Hired Date', 'Email', 'Phone'],
#         'subjects': ['Subject Name', 'Subject Code', 'Type', 'Category', 'Description'],
#         'classes': ['Class Name', 'Class Code', 'Level', 'Programme', 'Capacity', 'Form Master'],
#         'scores': ['Student Number', 'Assessment Name', 'Score', 'Absent', 'Remarks']
#     }
    
#     if import_type not in templates:
#         raise HTTPException(status_code=400, detail=f"Invalid import type: {import_type}")
    
#     csv_content = generate_csv_template(templates[import_type])
    
#     return StreamingResponse(
#         io.BytesIO(csv_content.encode('utf-8-sig')),
#         media_type="text/csv",
#         headers={"Content-Disposition": f"attachment; filename={import_type}_template.csv"}
#     )

# @router.get("/sample/{import_type}")
# async def get_sample_data(import_type: str):
#     """Get sample data for preview"""
#     logger.info(f"GET /api/import/sample/{import_type} - Fetching sample data")
    
#     templates = {
#         'students': ['Student Number', 'First Name', 'Last Name', 'Date of Birth', 'Gender', 'Class', 'Parent Name', 'Parent Phone', 'Parent Email', 'Address'],
#         'staff': ['Staff Number', 'First Name', 'Last Name', 'Role', 'Department', 'Qualification', 'Hired Date', 'Email', 'Phone'],
#         'subjects': ['Subject Name', 'Subject Code', 'Type', 'Category', 'Description'],
#         'classes': ['Class Name', 'Class Code', 'Level', 'Programme', 'Capacity', 'Form Master'],
#         'scores': ['Student Number', 'Assessment Name', 'Score', 'Absent', 'Remarks']
#     }
    
#     sample_data = generate_sample_data(import_type)
    
#     return {
#         "success": True,
#         "data": {
#             "headers": templates.get(import_type, []),
#             "sample_data": sample_data
#         },
#         "timestamp": datetime.now().isoformat()
#     }

# @router.post("/suggest-mapping")
# async def suggest_mapping(file: UploadFile = File(...)):
#     """Suggest column mapping based on file headers"""
#     logger.info("POST /api/import/suggest-mapping - Suggesting mapping")
    
#     try:
#         content = await file.read()
        
#         if file.filename.endswith('.csv'):
#             data = parse_csv_file(content)
#         else:
#             data = parse_excel_file(content)
        
#         headers = list(data[0].keys()) if data else []
        
#         # Common mappings
#         common_mappings = {
#             'first_name': ['first name', 'firstname', 'fname', 'first'],
#             'last_name': ['last name', 'lastname', 'lname', 'surname', 'last'],
#             'email': ['email', 'e-mail', 'mail'],
#             'phone': ['phone', 'telephone', 'mobile', 'contact'],
#             'class': ['class', 'class name', 'class_name'],
#             'student_number': ['student number', 'student id', 'studentid', 'admission number'],
#             'staff_number': ['staff number', 'staff id', 'employee number', 'staff_number'],
#             'subject_name': ['subject', 'subject name', 'subject_name'],
#             'subject_code': ['code', 'subject code', 'subject_code']
#         }
        
#         suggested_mapping = {}
#         for header in headers:
#             header_lower = header.lower()
#             for target, patterns in common_mappings.items():
#                 if any(pattern in header_lower for pattern in patterns):
#                     suggested_mapping[target] = header
#                     break
        
#         return {
#             "success": True,
#             "data": {
#                 "headers": headers,
#                 "suggested_mapping": suggested_mapping
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in suggest_mapping: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Mapping suggestion failed: {str(e)}")









# app/school/import_export.py

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import logging
import traceback
import sys
import csv
import io
import json
import secrets
import hashlib

from app.activation.state import get_db_connection
# from app.routes.students import generate_student_number

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

router = APIRouter(prefix="/api/import", tags=["import-export"])

# ==================== Helper Functions ====================

def hash_password(password: str) -> str:
    """Hash a password with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return f"{password_hash}:{salt}"

def generate_unique_id(prefix: str = "IMP") -> str:
    """Generate a unique ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = secrets.token_hex(4).upper()
    return f"{prefix}_{timestamp}_{random_part}"

def parse_csv_file(file_content: bytes) -> List[Dict[str, str]]:
    """Parse CSV file content to list of dictionaries"""
    try:
        for encoding in ['utf-8-sig', 'utf-8', 'latin-1']:
            try:
                text = file_content.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        else:
            text = file_content.decode('utf-8', errors='replace')
        
        csv_reader = csv.DictReader(io.StringIO(text))
        return list(csv_reader)
    except Exception as e:
        logger.error(f"Error parsing CSV: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

def parse_excel_file(file_content: bytes) -> List[Dict[str, str]]:
    """Parse Excel file content to list of dictionaries"""
    try:
        import pandas as pd
        df = pd.read_excel(io.BytesIO(file_content))
        df = df.where(pd.notnull(df), None)
        return df.to_dict('records')
    except ImportError:
        raise HTTPException(status_code=400, detail="pandas library not installed")
    except Exception as e:
        logger.error(f"Error parsing Excel: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid Excel format: {str(e)}")

def generate_csv_template(headers: List[str]) -> str:
    """Generate CSV template with given headers"""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    return output.getvalue()

# ==================== Import Record Functions ====================

def import_student_record(record: Dict[str, Any], row_index: int) -> Dict[str, Any]:
    """Import a single student record with user account creation"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if student already exists by student number
        student_number = record.get('Student Number', '').strip()
        if student_number:
            cursor.execute("SELECT id FROM students WHERE student_number = ?", (student_number,))
            if cursor.fetchone():
                return {"success": True, "message": "Student already exists", "id": None}
        
        # Generate unique IDs
        unique_id = generate_unique_id("STU")
        if not student_number:
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
            student_number = f"STU/{year}/{sequence}"
        
        # Insert into person_details
        person_data = {
            'unique_id': unique_id,
            'first_name': record.get('First Name', ''),
            'last_name': record.get('Last Name', ''),
            'other_names': record.get('Other Names', ''),
            'date_of_birth': record.get('Date of Birth'),
            'gender': record.get('Gender', '').lower(),
            'phone': record.get('Phone', ''),
            'email': record.get('Email', ''),
            'address': record.get('Address', ''),
            'city': record.get('City', ''),
            'state': record.get('State', ''),
            'country': record.get('Country', 'Ghana'),
            'postal_code': record.get('Postal Code', ''),
            'nationality': record.get('Nationality', 'Ghanaian'),
            'blood_group': record.get('Blood Group', ''),
            'emergency_contact_name': record.get('Emergency Contact Name', ''),
            'emergency_contact_phone': record.get('Emergency Contact Phone', ''),
            'photo_url': record.get('Photo URL'),
            'national_id': record.get('National ID'),
            'health_id': record.get('Health Insurance Number'),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        cursor.execute('''
            INSERT INTO person_details (
                unique_id, first_name, last_name, other_names, date_of_birth, gender,
                phone, email, address, city, state, country, postal_code, nationality,
                blood_group, emergency_contact_name, emergency_contact_phone, photo_url,
                national_id, health_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', tuple(person_data.values()))
        
        person_id = cursor.lastrowid
        
        # Insert into students
        cursor.execute('''
            INSERT INTO students (
                person_id, unique_id, student_number, academic_year_id,
                parent1_name, parent1_phone, parent1_email,
                parent2_name, parent2_phone, parent2_email,
                guardian_name, guardian_phone, guardian_email,
                health_condition, former_school, enrolled_at, status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            person_id, unique_id, student_number, 1,  # academic_year_id default to 1
            record.get('Parent Name', ''), record.get('Parent Phone', ''), record.get('Parent Email', ''),
            record.get('Parent2 Name', ''), record.get('Parent2 Phone', ''), record.get('Parent2 Email', ''),
            record.get('Guardian Name', ''), record.get('Guardian Phone', ''), record.get('Guardian Email', ''),
            record.get('Health Condition', ''), record.get('Former School', ''),
            datetime.now().date().isoformat(), 'active',
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        student_id = cursor.lastrowid
        
        # Create user account for student
        username = f"{record.get('First Name', '').lower()}.{record.get('Last Name', '').lower()}"
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            username = f"{username}{student_id}"
        
        default_password = "password123"
        password_hash = hash_password(default_password)
        user_unique_id = generate_unique_id("USER")
        
        cursor.execute('''
            INSERT INTO users (unique_id, username, email, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, 'student', 'active', ?)
        ''', (user_unique_id, username, record.get('Email', ''), password_hash, datetime.now().isoformat()))
        
        user_id = cursor.lastrowid
        
        # Update student with user_id
        cursor.execute("UPDATE students SET user_id = ? WHERE id = ?", (user_id, student_id))
        
        conn.commit()
        
        return {
            "success": True,
            "id": student_id,
            "username": username,
            "password": default_password
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error importing student: {str(e)}")
        return {"success": False, "error": str(e)}
    finally:
        if conn:
            conn.close()

def import_staff_record(record: Dict[str, Any], row_index: int) -> Dict[str, Any]:
    """Import a single staff record with user account creation"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if staff already exists
        staff_number = record.get('Staff Number', '').strip()
        if staff_number:
            cursor.execute("SELECT id FROM staff WHERE staff_number = ?", (staff_number,))
            if cursor.fetchone():
                return {"success": True, "message": "Staff already exists", "id": None}
        
        # Generate unique IDs
        unique_id = generate_unique_id("STAFF")
        if not staff_number:
            year = datetime.now().year
            prefix = "TCH" if record.get('Role', 'Teacher') == 'Teacher' else "ADM"
            cursor.execute("SELECT COUNT(*) as count FROM staff WHERE staff_number LIKE ?", (f"{prefix}/{year}/%",))
            count = cursor.fetchone()[0] if isinstance(cursor.fetchone(), tuple) else cursor.fetchone()['count']
            staff_number = f"{prefix}/{year}/{str(count + 1).zfill(4)}"
        
        # Insert into person_details
        person_data = {
            'unique_id': unique_id,
            'first_name': record.get('First Name', ''),
            'last_name': record.get('Last Name', ''),
            'other_names': record.get('Other Names', ''),
            'date_of_birth': record.get('Date of Birth'),
            'gender': record.get('Gender', '').lower(),
            'phone': record.get('Phone', ''),
            'email': record.get('Email', ''),
            'address': record.get('Address', ''),
            'city': record.get('City', ''),
            'state': record.get('State', ''),
            'country': record.get('Country', 'Ghana'),
            'postal_code': record.get('Postal Code', ''),
            'nationality': record.get('Nationality', 'Ghanaian'),
            'blood_group': record.get('Blood Group', ''),
            'emergency_contact_name': record.get('Emergency Contact Name', ''),
            'emergency_contact_phone': record.get('Emergency Contact Phone', ''),
            'photo_url': record.get('Photo URL'),
            'national_id': record.get('National ID'),
            'health_id': record.get('Health Insurance Number'),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        cursor.execute('''
            INSERT INTO person_details (
                unique_id, first_name, last_name, other_names, date_of_birth, gender,
                phone, email, address, city, state, country, postal_code, nationality,
                blood_group, emergency_contact_name, emergency_contact_phone, photo_url,
                national_id, health_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', tuple(person_data.values()))
        
        person_id = cursor.lastrowid
        
        # Insert into staff
        cursor.execute('''
            INSERT INTO staff (
                person_id, unique_id, staff_number, role, department, qualification,
                specialization, hired_at, status, marital_status, spouse_name, spouse_phone,
                place_of_birth, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            person_id, unique_id, staff_number,
            record.get('Role', 'Teacher'), record.get('Department', ''),
            record.get('Qualification', ''), record.get('Specialization', ''),
            record.get('Hired Date'), 'active',
            record.get('Marital Status', ''), record.get('Spouse Name', ''), record.get('Spouse Phone', ''),
            record.get('Place of Birth', ''),
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        staff_id = cursor.lastrowid
        
        # Create user account for staff
        username = f"{record.get('First Name', '').lower()}.{record.get('Last Name', '').lower()}"
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            username = f"{username}{staff_id}"
        
        default_password = "password123"
        password_hash = hash_password(default_password)
        user_unique_id = generate_unique_id("USER")
        role = record.get('Role', 'teacher').lower()
        
        cursor.execute('''
            INSERT INTO users (unique_id, username, email, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'active', ?)
        ''', (user_unique_id, username, record.get('Email', ''), password_hash, role, datetime.now().isoformat()))
        
        user_id = cursor.lastrowid
        
        # Update staff with user_id
        cursor.execute("UPDATE staff SET user_id = ? WHERE id = ?", (user_id, staff_id))
        
        conn.commit()
        
        return {
            "success": True,
            "id": staff_id,
            "username": username,
            "password": default_password
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error importing staff: {str(e)}")
        return {"success": False, "error": str(e)}
    finally:
        if conn:
            conn.close()

def import_subject_record(record: Dict[str, Any], row_index: int) -> Dict[str, Any]:
    """Import a single subject record"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        subject_code = record.get('Subject Code', '').strip()
        subject_name = record.get('Subject Name', '').strip()
        
        cursor.execute("SELECT id FROM subjects WHERE code = ? OR name = ?", (subject_code, subject_name))
        if cursor.fetchone():
            return {"success": True, "message": "Subject already exists", "id": None}
        
        cursor.execute('''
            INSERT INTO subjects (name, code, type, category, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            subject_name, subject_code,
            record.get('Type', 'core'), record.get('Category', 'BOTH'),
            record.get('Description', ''),
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        return {"success": True, "id": cursor.lastrowid}
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error importing subject: {str(e)}")
        return {"success": False, "error": str(e)}
    finally:
        if conn:
            conn.close()

def import_class_record(record: Dict[str, Any], row_index: int) -> Dict[str, Any]:
    """Import a single class record"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        class_code = record.get('Class Code', '').strip()
        if class_code:
            cursor.execute("SELECT id FROM classes WHERE class_code = ?", (class_code,))
            if cursor.fetchone():
                return {"success": True, "message": "Class already exists", "id": None}
        
        # Get level ID from level name
        level_name = record.get('Level', '')
        cursor.execute("SELECT id FROM levels WHERE name = ?", (level_name,))
        level = cursor.fetchone()
        level_id = level[0] if level else None
        
        # Get programme ID from programme name
        programme_name = record.get('Programme', '')
        programme_id = None
        if programme_name:
            cursor.execute("SELECT id FROM programmes WHERE name = ?", (programme_name,))
            programme = cursor.fetchone()
            programme_id = programme[0] if programme else None
        
        cursor.execute('''
            INSERT INTO classes (
                class_name, class_code, level_id, programme_id, academic_year_id,
                description, capacity, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            record.get('Class Name', ''), class_code, level_id, programme_id, 1,
            record.get('Description', ''), int(record.get('Capacity', 40)), 1,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        return {"success": True, "id": cursor.lastrowid}
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error importing class: {str(e)}")
        return {"success": False, "error": str(e)}
    finally:
        if conn:
            conn.close()

# ==================== API Endpoints ====================

@router.get("/template/{import_type}")
async def download_template(import_type: str):
    """Download template CSV file"""
    templates = {
        'students': ['Student Number', 'First Name', 'Last Name', 'Other Names', 'Date of Birth', 'Gender', 'Email', 'Phone', 'Address', 'Parent Name', 'Parent Phone', 'Parent Email'],
        'staff': ['Staff Number', 'First Name', 'Last Name', 'Other Names', 'Role', 'Department', 'Qualification', 'Hired Date', 'Email', 'Phone'],
        'subjects': ['Subject Name', 'Subject Code', 'Type', 'Category', 'Description'],
        'classes': ['Class Name', 'Class Code', 'Level', 'Programme', 'Capacity', 'Description']
    }
    
    if import_type not in templates:
        raise HTTPException(status_code=400, detail=f"Invalid import type: {import_type}")
    
    csv_content = generate_csv_template(templates[import_type])
    return StreamingResponse(
        io.BytesIO(csv_content.encode('utf-8-sig')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={import_type}_template.csv"}
    )

@router.post("/preview/{import_type}")
async def preview_import(import_type: str, file: UploadFile = File(...)):
    """Preview the file before import"""
    try:
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            data = parse_csv_file(content)
        else:
            data = parse_excel_file(content)
        
        preview_data = data[:5]
        headers = list(preview_data[0].keys()) if preview_data else []
        
        return {
            "success": True,
            "data": {
                "headers": headers,
                "preview": preview_data,
                "total_rows": len(data)
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in preview_import: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

@router.post("/validate/{import_type}")
async def validate_import(
    import_type: str,
    file: UploadFile = File(...),
    column_mapping: str = Form(...)
):
    """Validate data before import"""
    try:
        content = await file.read()
        mapping = json.loads(column_mapping)
        
        if file.filename.endswith('.csv'):
            data = parse_csv_file(content)
        else:
            data = parse_excel_file(content)
        
        errors = []
        valid_records = []
        
        required_fields = {
            'students': ['First Name', 'Last Name'],
            'staff': ['First Name', 'Last Name'],
            'subjects': ['Subject Name', 'Subject Code'],
            'classes': ['Class Name', 'Class Code']
        }
        
        for index, row in enumerate(data):
            mapped_record = {}
            for target_field, source_field in mapping.items():
                if source_field and source_field != 'skip':
                    mapped_record[target_field] = row.get(source_field, '')
            
            # Check required fields
            for req in required_fields.get(import_type, []):
                if not mapped_record.get(req):
                    errors.append({"row": index + 1, "error": f"Missing required field: {req}"})
            
            if not errors:
                valid_records.append(mapped_record)
        
        return {
            "success": True,
            "data": {
                "total_records": len(data),
                "valid_count": len(valid_records),
                "error_count": len(errors),
                "errors": errors[:50]
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in validate_import: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

@router.post("/execute/{import_type}")
async def execute_import(
    import_type: str,
    file: UploadFile = File(...),
    column_mapping: str = Form(...),
    skip_errors: bool = Form(False)
):
    """Execute the import"""
    try:
        content = await file.read()
        mapping = json.loads(column_mapping)
        
        if file.filename.endswith('.csv'):
            data = parse_csv_file(content)
        else:
            data = parse_excel_file(content)
        
        import_functions = {
            'students': import_student_record,
            'staff': import_staff_record,
            'subjects': import_subject_record,
            'classes': import_class_record
        }
        
        import_func = import_functions.get(import_type)
        if not import_func:
            raise HTTPException(status_code=400, detail=f"Unknown import type: {import_type}")
        
        errors = []
        imported_ids = []
        
        for index, row in enumerate(data):
            mapped_record = {}
            for target_field, source_field in mapping.items():
                if source_field and source_field != 'skip':
                    mapped_record[target_field] = row.get(source_field, '').strip()
            
            try:
                result = import_func(mapped_record, index)
                if result.get('success'):
                    if result.get('id'):
                        imported_ids.append(result['id'])
                else:
                    errors.append({"row": index + 1, "error": result.get('error', 'Import failed')})
                    if not skip_errors:
                        break
            except Exception as e:
                errors.append({"row": index + 1, "error": str(e)})
                if not skip_errors:
                    break
        
        return {
            "success": True,
            "data": {
                "total_records": len(data),
                "success_count": len(imported_ids),
                "error_count": len(errors),
                "errors": errors,
                "imported_ids": imported_ids
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in execute_import: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

@router.post("/suggest-mapping")
async def suggest_mapping(file: UploadFile = File(...)):
    """Suggest column mapping based on file headers"""
    try:
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            data = parse_csv_file(content)
        else:
            data = parse_excel_file(content)
        
        headers = list(data[0].keys()) if data else []
        
        common_mappings = {
            'first_name': ['first name', 'firstname', 'fname'],
            'last_name': ['last name', 'lastname', 'lname', 'surname'],
            'email': ['email', 'e-mail'],
            'phone': ['phone', 'telephone', 'mobile'],
            'student_number': ['student number', 'student id', 'admission number'],
            'staff_number': ['staff number', 'employee number'],
            'subject_name': ['subject', 'subject name'],
            'subject_code': ['code', 'subject code'],
            'class_name': ['class', 'class name']
        }
        
        suggested_mapping = {}
        for header in headers:
            header_lower = header.lower()
            for target, patterns in common_mappings.items():
                if any(pattern in header_lower for pattern in patterns):
                    suggested_mapping[target] = header
                    break
        
        return {
            "success": True,
            "data": {
                "headers": headers,
                "suggested_mapping": suggested_mapping
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in suggest_mapping: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mapping suggestion failed: {str(e)}")