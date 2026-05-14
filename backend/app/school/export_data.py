# app/school/export_data.py

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, Dict, Any, List
from datetime import datetime
import csv
import io
import json
import pandas as pd
import logging
import traceback
import sys

from app.activation.state import get_db_connection

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

router = APIRouter(prefix="/api/export", tags=["export"])

# ==================== Helper Functions ====================

def dict_to_csv(data: List[Dict[str, Any]]) -> str:
    """Convert list of dictionaries to CSV string"""
    if not data:
        return ""
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()

def dict_to_excel(data: List[Dict[str, Any]]) -> bytes:
    """Convert list of dictionaries to Excel bytes"""
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Export')
    return output.getvalue()

# ==================== Export Functions ====================

def export_students(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Export students data with filters"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            s.id,
            s.student_number,
            p.first_name,
            p.last_name,
            p.other_names,
            p.date_of_birth,
            p.gender,
            p.email,
            p.phone,
            p.address,
            p.city,
            p.state,
            p.country,
            c.class_name,
            sec.section_name,
            ay.year_label as academic_year,
            s.parent1_name,
            s.parent1_phone,
            s.parent1_email,
            s.parent2_name,
            s.parent2_phone,
            s.parent2_email,
            s.guardian_name,
            s.guardian_phone,
            s.guardian_email,
            s.health_condition,
            s.former_school,
            s.enrolled_at,
            s.status,
            s.created_at
        FROM students s
        JOIN person_details p ON s.person_id = p.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
        WHERE s.status != 'deleted'
    """
    params = []
    
    if filters.get('academic_year_id'):
        query += " AND s.academic_year_id = ?"
        params.append(filters['academic_year_id'])
    
    if filters.get('class_id'):
        query += " AND s.class_id = ?"
        params.append(filters['class_id'])
    
    if filters.get('section_id'):
        query += " AND s.section_id = ?"
        params.append(filters['section_id'])
    
    if filters.get('status'):
        query += " AND s.status = ?"
        params.append(filters['status'])
    
    query += " ORDER BY p.last_name, p.first_name"
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in results]

def export_staff(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Export staff data with filters"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            st.id,
            st.staff_number,
            p.first_name,
            p.last_name,
            p.other_names,
            p.date_of_birth,
            p.gender,
            p.email,
            p.phone,
            p.address,
            p.city,
            p.state,
            p.country,
            st.role,
            st.department,
            st.qualification,
            st.specialization,
            st.hired_at,
            st.status as employment_status,
            st.marital_status,
            st.spouse_name,
            st.spouse_phone,
            st.place_of_birth,
            st.created_at
        FROM staff st
        JOIN person_details p ON st.person_id = p.id
        WHERE st.status != 'deleted'
    """
    params = []
    
    if filters.get('role'):
        query += " AND st.role = ?"
        params.append(filters['role'])
    
    if filters.get('department'):
        query += " AND st.department = ?"
        params.append(filters['department'])
    
    if filters.get('status'):
        query += " AND st.status = ?"
        params.append(filters['status'])
    
    query += " ORDER BY p.last_name, p.first_name"
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in results]

def export_subjects(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Export subjects data with filters"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            id,
            name,
            code,
            type,
            category,
            description,
            created_at,
            updated_at
        FROM subjects
        WHERE 1=1
    """
    params = []
    
    if filters.get('type'):
        query += " AND type = ?"
        params.append(filters['type'])
    
    if filters.get('category'):
        query += " AND category = ?"
        params.append(filters['category'])
    
    query += " ORDER BY name"
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in results]

def export_classes(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Export classes data with filters"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            c.id,
            c.class_name,
            c.class_code,
            l.name as level_name,
            p.name as programme_name,
            ay.year_label as academic_year,
            CONCAT(st.first_name, ' ', st.last_name) as form_master_name,
            c.description,
            c.capacity,
            c.is_active,
            c.created_at,
            c.updated_at
        FROM classes c
        LEFT JOIN levels l ON c.level_id = l.id
        LEFT JOIN programmes p ON c.programme_id = p.id
        LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
        LEFT JOIN staff s ON c.form_master_id = s.id
        LEFT JOIN person_details st ON s.person_id = st.id
        WHERE 1=1
    """
    params = []
    
    if filters.get('academic_year_id'):
        query += " AND c.academic_year_id = ?"
        params.append(filters['academic_year_id'])
    
    if filters.get('level_id'):
        query += " AND c.level_id = ?"
        params.append(filters['level_id'])
    
    if filters.get('is_active') is not None:
        query += " AND c.is_active = ?"
        params.append(1 if filters['is_active'] == 'true' else 0)
    
    query += " ORDER BY c.class_name"
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in results]

def export_results(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Export student results data with filters"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            str.id,
            p.first_name || ' ' || p.last_name as student_name,
            s.student_number,
            c.class_name,
            sub.name as subject_name,
            ay.year_label as academic_year,
            t.name as term_name,
            str.total_score,
            str.grade,
            str.grade_point,
            str.remark,
            str.position_in_class,
            str.computed_at
        FROM student_subject_results str
        JOIN students stu ON str.student_id = stu.id
        JOIN person_details p ON stu.person_id = p.id
        JOIN classes c ON str.class_id = c.id
        JOIN subjects sub ON str.subject_id = sub.id
        JOIN academic_years ay ON str.academic_year_id = ay.id
        JOIN terms t ON str.term_id = t.id
        WHERE 1=1
    """
    params = []
    
    if filters.get('academic_year_id'):
        query += " AND str.academic_year_id = ?"
        params.append(filters['academic_year_id'])
    
    if filters.get('term_id'):
        query += " AND str.term_id = ?"
        params.append(filters['term_id'])
    
    if filters.get('class_id'):
        query += " AND str.class_id = ?"
        params.append(filters['class_id'])
    
    if filters.get('subject_id'):
        query += " AND str.subject_id = ?"
        params.append(filters['subject_id'])
    
    query += " ORDER BY c.class_name, sub.name, str.total_score DESC"
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in results]

def export_attendance(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Export attendance records with filters"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            a.id,
            p.first_name || ' ' || p.last_name as student_name,
            s.student_number,
            c.class_name,
            ay.year_label as academic_year,
            t.name as term_name,
            a.date,
            a.status,
            a.time_in,
            a.time_out,
            a.reason,
            st.first_name || ' ' || st.last_name as marked_by_name,
            a.created_at
        FROM attendance a
        JOIN students stu ON a.student_id = stu.id
        JOIN person_details p ON stu.person_id = p.id
        JOIN classes c ON a.class_id = c.id
        JOIN academic_years ay ON a.academic_year_id = ay.id
        JOIN terms t ON a.term_id = t.id
        LEFT JOIN staff staff_member ON a.marked_by = staff_member.id
        LEFT JOIN person_details st ON staff_member.person_id = st.id
        WHERE 1=1
    """
    params = []
    
    if filters.get('academic_year_id'):
        query += " AND a.academic_year_id = ?"
        params.append(filters['academic_year_id'])
    
    if filters.get('term_id'):
        query += " AND a.term_id = ?"
        params.append(filters['term_id'])
    
    if filters.get('class_id'):
        query += " AND a.class_id = ?"
        params.append(filters['class_id'])
    
    if filters.get('date_from') and filters.get('date_to'):
        query += " AND a.date BETWEEN ? AND ?"
        params.extend([filters['date_from'], filters['date_to']])
    
    query += " ORDER BY a.date DESC, c.class_name, p.last_name"
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in results]

# ==================== API Endpoints ====================

@router.get("/csv/{export_type}")
async def export_to_csv(
    export_type: str,
    academic_year_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None),
    section_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    level_id: Optional[int] = Query(None),
    is_active: Optional[str] = Query(None),
    term_id: Optional[int] = Query(None),
    subject_id: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    """Export data to CSV format"""
    logger.info(f"GET /api/export/csv/{export_type} - Exporting to CSV")
    
    filters = {
        'academic_year_id': academic_year_id,
        'class_id': class_id,
        'section_id': section_id,
        'status': status,
        'role': role,
        'department': department,
        'type': type,
        'category': category,
        'level_id': level_id,
        'is_active': is_active,
        'term_id': term_id,
        'subject_id': subject_id,
        'date_from': date_from,
        'date_to': date_to
    }
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    export_functions = {
        'students': export_students,
        'staff': export_staff,
        'subjects': export_subjects,
        'classes': export_classes,
        'results': export_results,
        'attendance': export_attendance
    }
    
    if export_type not in export_functions:
        raise HTTPException(status_code=400, detail=f"Invalid export type: {export_type}")
    
    try:
        data = export_functions[export_type](filters)
        csv_content = dict_to_csv(data)
        
        filename = f"{export_type}_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return StreamingResponse(
            io.BytesIO(csv_content.encode('utf-8-sig')),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Error in export_to_csv: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/excel/{export_type}")
async def export_to_excel(
    export_type: str,
    academic_year_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None),
    section_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    level_id: Optional[int] = Query(None),
    is_active: Optional[str] = Query(None),
    term_id: Optional[int] = Query(None),
    subject_id: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    """Export data to Excel format"""
    logger.info(f"GET /api/export/excel/{export_type} - Exporting to Excel")
    
    filters = {
        'academic_year_id': academic_year_id,
        'class_id': class_id,
        'section_id': section_id,
        'status': status,
        'role': role,
        'department': department,
        'type': type,
        'category': category,
        'level_id': level_id,
        'is_active': is_active,
        'term_id': term_id,
        'subject_id': subject_id,
        'date_from': date_from,
        'date_to': date_to
    }
    filters = {k: v for k, v in filters.items() if v is not None}
    
    export_functions = {
        'students': export_students,
        'staff': export_staff,
        'subjects': export_subjects,
        'classes': export_classes,
        'results': export_results,
        'attendance': export_attendance
    }
    
    if export_type not in export_functions:
        raise HTTPException(status_code=400, detail=f"Invalid export type: {export_type}")
    
    try:
        data = export_functions[export_type](filters)
        excel_content = dict_to_excel(data)
        
        filename = f"{export_type}_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        return StreamingResponse(
            io.BytesIO(excel_content),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Error in export_to_excel: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/json/{export_type}")
async def export_to_json(
    export_type: str,
    academic_year_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None),
    section_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    level_id: Optional[int] = Query(None),
    is_active: Optional[str] = Query(None),
    term_id: Optional[int] = Query(None),
    subject_id: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    """Export data to JSON format"""
    logger.info(f"GET /api/export/json/{export_type} - Exporting to JSON")
    
    filters = {
        'academic_year_id': academic_year_id,
        'class_id': class_id,
        'section_id': section_id,
        'status': status,
        'role': role,
        'department': department,
        'type': type,
        'category': category,
        'level_id': level_id,
        'is_active': is_active,
        'term_id': term_id,
        'subject_id': subject_id,
        'date_from': date_from,
        'date_to': date_to
    }
    filters = {k: v for k, v in filters.items() if v is not None}
    
    export_functions = {
        'students': export_students,
        'staff': export_staff,
        'subjects': export_subjects,
        'classes': export_classes,
        'results': export_results,
        'attendance': export_attendance
    }
    
    if export_type not in export_functions:
        raise HTTPException(status_code=400, detail=f"Invalid export type: {export_type}")
    
    try:
        data = export_functions[export_type](filters)
        
        filename = f"{export_type}_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        return StreamingResponse(
            io.BytesIO(json.dumps(data, indent=2, default=str).encode('utf-8')),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Error in export_to_json: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/types")
async def get_export_types():
    """Get available export types with their filter options"""
    logger.info("GET /api/export/types - Fetching export types")
    
    export_types = [
        {
            "id": "students",
            "name": "All Students",
            "description": "Export complete student records with parent information",
            "filters": ["academic_year_id", "class_id", "section_id", "status"]
        },
        {
            "id": "staff",
            "name": "All Staff",
            "description": "Export staff directory with qualifications and contact details",
            "filters": ["role", "department", "status"]
        },
        {
            "id": "subjects",
            "name": "Subjects",
            "description": "Export subject master list with codes and categories",
            "filters": ["type", "category"]
        },
        {
            "id": "classes",
            "name": "Classes",
            "description": "Export class structures with capacity and form masters",
            "filters": ["academic_year_id", "level_id", "is_active"]
        },
        {
            "id": "results",
            "name": "Results",
            "description": "Export assessment results and academic performance",
            "filters": ["academic_year_id", "term_id", "class_id", "subject_id"]
        },
        {
            "id": "attendance",
            "name": "Attendance",
            "description": "Export attendance records for students",
            "filters": ["academic_year_id", "term_id", "class_id", "date_range"]
        }
    ]
    
    return {
        "success": True,
        "data": export_types,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/filters/{export_type}")
async def get_filter_options(export_type: str):
    """Get filter options for a specific export type"""
    logger.info(f"GET /api/export/filters/{export_type} - Fetching filter options")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        filter_options = {}
        
        if export_type == 'students' or export_type == 'classes' or export_type == 'results' or export_type == 'attendance':
            # Get academic years
            cursor.execute("SELECT id, year_label FROM academic_years ORDER BY year_label DESC")
            filter_options['academic_years'] = [dict(row) for row in cursor.fetchall()]
        
        if export_type == 'students' or export_type == 'results' or export_type == 'attendance':
            # Get classes
            cursor.execute("SELECT id, class_name FROM classes WHERE is_active = 1 ORDER BY class_name")
            filter_options['classes'] = [dict(row) for row in cursor.fetchall()]
            
            # Get sections
            cursor.execute("SELECT id, section_name FROM sections ORDER BY section_name")
            filter_options['sections'] = [dict(row) for row in cursor.fetchall()]
        
        if export_type == 'students':
            # Get statuses
            filter_options['statuses'] = ['active', 'suspended', 'graduated', 'withdrawn', 'transferred']
        
        if export_type == 'staff':
            # Get roles
            cursor.execute("SELECT DISTINCT role FROM staff WHERE role IS NOT NULL")
            filter_options['roles'] = [row['role'] for row in cursor.fetchall()]
            
            # Get departments
            cursor.execute("SELECT DISTINCT department FROM staff WHERE department IS NOT NULL")
            filter_options['departments'] = [row['department'] for row in cursor.fetchall()]
            
            # Get statuses
            filter_options['statuses'] = ['active', 'suspended', 'terminated', 'on_leave']
        
        if export_type == 'subjects':
            # Get types
            filter_options['types'] = ['core', 'elective']
            
            # Get categories
            filter_options['categories'] = ['JHS', 'SHS', 'BOTH']
        
        if export_type == 'classes':
            # Get levels
            cursor.execute("SELECT id, name FROM levels ORDER BY name")
            filter_options['levels'] = [dict(row) for row in cursor.fetchall()]
        
        if export_type == 'results' or export_type == 'attendance':
            # Get terms
            cursor.execute("SELECT id, name FROM terms ORDER BY term_number")
            filter_options['terms'] = [dict(row) for row in cursor.fetchall()]
        
        if export_type == 'results':
            # Get subjects
            cursor.execute("SELECT id, name FROM subjects ORDER BY name")
            filter_options['subjects'] = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            "success": True,
            "data": filter_options,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        conn.close()
        logger.error(f"Error in get_filter_options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get filter options: {str(e)}")