# # app/school/workload.py

# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel, Field
# from typing import Optional, Dict, Any, List
# from datetime import datetime
# import logging
# import traceback
# import sys

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

# router = APIRouter(prefix="/api/workload", tags=["workload"])

# # ==================== Pydantic Models ====================

# class WorkloadThresholdUpdate(BaseModel):
#     threshold: int = Field(default=25, ge=10, le=50)

# class TeacherWorkloadResponse(BaseModel):
#     id: int
#     name: str
#     total_periods: int
#     num_classes: int
#     num_subjects: int
#     status: str
#     workload_percentage: float

# class WorkloadStatisticsResponse(BaseModel):
#     total_teachers: int
#     average_periods: float
#     overloaded_count: int
#     underloaded_count: int
#     normal_count: int
#     max_periods: int
#     min_periods: int

# class WorkloadRecommendation(BaseModel):
#     type: str
#     message: str
#     teachers: List[str]

# # ==================== Helper Functions ====================

# def calculate_teacher_workload(cursor, teacher_id: int, academic_year_id: Optional[int] = None) -> Dict[str, Any]:
#     """Calculate workload for a specific teacher"""
    
#     # Get teacher's assignments
#     query = """
#         SELECT 
#             tsa.id,
#             tsa.class_id,
#             tsa.subject_id,
#             tsa.academic_year_id
#         FROM teacher_subject_assignments tsa
#         WHERE tsa.staff_id = ? AND tsa.is_active = 1
#     """
#     params = [teacher_id]
    
#     if academic_year_id:
#         query += " AND tsa.academic_year_id = ?"
#         params.append(academic_year_id)
    
#     cursor.execute(query, params)
#     assignments = cursor.fetchall()
    
#     # Get time slots count per week (assuming each subject gets one period per week)
#     # This would be more accurate when connected to timetable
#     num_subjects = len(set(a['subject_id'] for a in assignments))
#     num_classes = len(set(a['class_id'] for a in assignments))
    
#     # Calculate total periods (simplified: each assignment = 1 period per week)
#     total_periods = len(assignments)
    
#     return {
#         "total_periods": total_periods,
#         "num_classes": num_classes,
#         "num_subjects": num_subjects
#     }

# def get_workload_status(periods: int, threshold: int) -> str:
#     """Determine workload status based on periods and threshold"""
#     if periods > threshold:
#         return "Overloaded"
#     elif periods < threshold - 10:
#         return "Underloaded"
#     return "Normal"

# def get_workload_color(periods: int, threshold: int) -> str:
#     """Get color class for workload"""
#     if periods > threshold:
#         return "overload"
#     elif periods < threshold - 10:
#         return "warning"
#     return "normal"

# # ==================== API Endpoints ====================

# @router.get("/teachers")
# async def get_teacher_workload(
#     academic_year_id: Optional[int] = None,
#     threshold: int = 25
# ):
#     """Get workload analysis for all teachers"""
#     logger.info(f"GET /api/workload/teachers - Fetching teacher workload")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get all active teachers
#         cursor.execute("""
#             SELECT 
#                 s.id,
#                 s.staff_number,
#                 p.first_name,
#                 p.last_name,
#                 p.title
#             FROM staff s
#             JOIN person_details p ON s.person_id = p.id
#             WHERE s.status = 'active' AND s.role IN ('Teacher', 'Admin')
#             ORDER BY p.last_name, p.first_name
#         """)
        
#         teachers = cursor.fetchall()
#         workload_data = []
        
#         for teacher in teachers:
#             workload = calculate_teacher_workload(cursor, teacher['id'], academic_year_id)
            
#             teacher_name = f"{teacher['title']} {teacher['first_name']} {teacher['last_name']}" if teacher['title'] else f"{teacher['first_name']} {teacher['last_name']}"
            
#             total_periods = workload['total_periods']
#             status = get_workload_status(total_periods, threshold)
            
#             workload_data.append({
#                 "id": teacher['id'],
#                 "name": teacher_name.strip(),
#                 "staff_number": teacher['staff_number'],
#                 "total_periods": total_periods,
#                 "num_classes": workload['num_classes'],
#                 "num_subjects": workload['num_subjects'],
#                 "status": status,
#                 "workload_percentage": min((total_periods / threshold) * 100, 150)
#             })
        
#         # Sort by total periods descending
#         workload_data.sort(key=lambda x: x['total_periods'], reverse=True)
        
#         return {
#             "success": True,
#             "data": workload_data,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_teacher_workload: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/statistics")
# async def get_workload_statistics(
#     academic_year_id: Optional[int] = None,
#     threshold: int = 25
# ):
#     """Get workload statistics summary"""
#     logger.info(f"GET /api/workload/statistics - Fetching workload statistics")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get all active teachers
#         cursor.execute("""
#             SELECT 
#                 s.id,
#                 p.first_name,
#                 p.last_name
#             FROM staff s
#             JOIN person_details p ON s.person_id = p.id
#             WHERE s.status = 'active' AND s.role IN ('Teacher', 'Admin')
#         """)
        
#         teachers = cursor.fetchall()
        
#         total_periods = 0
#         overloaded_count = 0
#         underloaded_count = 0
#         normal_count = 0
#         max_periods = 0
#         min_periods = float('inf')
        
#         for teacher in teachers:
#             workload = calculate_teacher_workload(cursor, teacher['id'], academic_year_id)
#             periods = workload['total_periods']
            
#             total_periods += periods
#             max_periods = max(max_periods, periods)
#             min_periods = min(min_periods, periods)
            
#             status = get_workload_status(periods, threshold)
#             if status == "Overloaded":
#                 overloaded_count += 1
#             elif status == "Underloaded":
#                 underloaded_count += 1
#             else:
#                 normal_count += 1
        
#         average_periods = total_periods / len(teachers) if teachers else 0
        
#         return {
#             "success": True,
#             "data": {
#                 "total_teachers": len(teachers),
#                 "average_periods": round(average_periods, 1),
#                 "overloaded_count": overloaded_count,
#                 "underloaded_count": underloaded_count,
#                 "normal_count": normal_count,
#                 "max_periods": max_periods,
#                 "min_periods": min_periods if min_periods != float('inf') else 0
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_workload_statistics: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/recommendations")
# async def get_workload_recommendations(
#     academic_year_id: Optional[int] = None,
#     threshold: int = 25
# ):
#     """Get recommendations based on workload analysis"""
#     logger.info(f"GET /api/workload/recommendations - Fetching recommendations")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get all active teachers
#         cursor.execute("""
#             SELECT 
#                 s.id,
#                 p.first_name,
#                 p.last_name,
#                 p.title
#             FROM staff s
#             JOIN person_details p ON s.person_id = p.id
#             WHERE s.status = 'active' AND s.role IN ('Teacher', 'Admin')
#         """)
        
#         teachers = cursor.fetchall()
        
#         overloaded_teachers = []
#         underloaded_teachers = []
        
#         for teacher in teachers:
#             workload = calculate_teacher_workload(cursor, teacher['id'], academic_year_id)
#             periods = workload['total_periods']
#             teacher_name = f"{teacher['title']} {teacher['first_name']} {teacher['last_name']}" if teacher['title'] else f"{teacher['first_name']} {teacher['last_name']}"
            
#             status = get_workload_status(periods, threshold)
#             if status == "Overloaded":
#                 overloaded_teachers.append(teacher_name.strip())
#             elif status == "Underloaded":
#                 underloaded_teachers.append(teacher_name.strip())
        
#         recommendations = []
        
#         if overloaded_teachers:
#             recommendations.append({
#                 "type": "warning",
#                 "message": f"{len(overloaded_teachers)} teacher(s) are overloaded. Consider redistributing classes or hiring additional staff.",
#                 "teachers": overloaded_teachers
#             })
        
#         if underloaded_teachers:
#             recommendations.append({
#                 "type": "info",
#                 "message": f"{len(underloaded_teachers)} teacher(s) are underloaded. Consider assigning additional classes or subjects.",
#                 "teachers": underloaded_teachers
#             })
        
#         if not overloaded_teachers and not underloaded_teachers:
#             recommendations.append({
#                 "type": "success",
#                 "message": "Excellent! All teachers are within optimal workload range.",
#                 "teachers": []
#             })
        
#         return {
#             "success": True,
#             "data": recommendations,
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_workload_recommendations: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.post("/threshold")
# async def update_threshold(threshold_data: WorkloadThresholdUpdate):
#     """Update workload threshold (stored in settings)"""
#     logger.info(f"POST /api/workload/threshold - Updating threshold to {threshold_data.threshold}")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Store threshold in settings table
#         cursor.execute("""
#             INSERT OR REPLACE INTO settings (key, value, updated_at)
#             VALUES ('workload_threshold', ?, ?)
#         """, (threshold_data.threshold, datetime.now().isoformat()))
        
#         conn.commit()
        
#         return {
#             "success": True,
#             "message": "Threshold updated successfully",
#             "data": {"threshold": threshold_data.threshold},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in update_threshold: {str(e)}")
#         logger.error(traceback.format_exc())
#         if conn:
#             conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/threshold")
# async def get_threshold():
#     """Get current workload threshold"""
#     logger.info("GET /api/workload/threshold - Fetching threshold")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("SELECT value FROM settings WHERE key = 'workload_threshold'")
#         result = cursor.fetchone()
        
#         threshold = int(result['value']) if result else 25
        
#         return {
#             "success": True,
#             "data": {"threshold": threshold},
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"Error in get_threshold: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()

# @router.get("/teacher/{teacher_id}")
# async def get_teacher_workload_detail(
#     teacher_id: int,
#     academic_year_id: Optional[int] = None
# ):
#     """Get detailed workload for a specific teacher"""
#     logger.info(f"GET /api/workload/teacher/{teacher_id} - Fetching teacher workload detail")
#     conn = None
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Get teacher details
#         cursor.execute("""
#             SELECT 
#                 s.id,
#                 s.staff_number,
#                 p.first_name,
#                 p.last_name,
#                 p.title,
#                 p.email,
#                 p.phone
#             FROM staff s
#             JOIN person_details p ON s.person_id = p.id
#             WHERE s.id = ?
#         """, (teacher_id,))
        
#         teacher = cursor.fetchone()
        
#         if not teacher:
#             raise HTTPException(status_code=404, detail="Teacher not found")
        
#         # Get workload calculations
#         workload = calculate_teacher_workload(cursor, teacher_id, academic_year_id)
        
#         # Get detailed assignments
#         query = """
#             SELECT 
#                 tsa.id,
#                 tsa.class_id,
#                 c.class_name,
#                 tsa.subject_id,
#                 s.name as subject_name,
#                 s.code as subject_code,
#                 tsa.academic_year_id,
#                 ay.year_label as academic_year_label
#             FROM teacher_subject_assignments tsa
#             JOIN classes c ON tsa.class_id = c.id
#             JOIN subjects s ON tsa.subject_id = s.id
#             JOIN academic_years ay ON tsa.academic_year_id = ay.id
#             WHERE tsa.staff_id = ? AND tsa.is_active = 1
#         """
#         params = [teacher_id]
        
#         if academic_year_id:
#             query += " AND tsa.academic_year_id = ?"
#             params.append(academic_year_id)
        
#         cursor.execute(query, params)
#         assignments = cursor.fetchall()
        
#         teacher_name = f"{teacher['title']} {teacher['first_name']} {teacher['last_name']}" if teacher['title'] else f"{teacher['first_name']} {teacher['last_name']}"
        
#         return {
#             "success": True,
#             "data": {
#                 "id": teacher['id'],
#                 "name": teacher_name.strip(),
#                 "staff_number": teacher['staff_number'],
#                 "email": teacher['email'],
#                 "phone": teacher['phone'],
#                 "total_periods": workload['total_periods'],
#                 "num_classes": workload['num_classes'],
#                 "num_subjects": workload['num_subjects'],
#                 "assignments": [
#                     {
#                         "id": a['id'],
#                         "class_id": a['class_id'],
#                         "class_name": a['class_name'],
#                         "subject_id": a['subject_id'],
#                         "subject_name": a['subject_name'],
#                         "subject_code": a['subject_code'],
#                         "academic_year_id": a['academic_year_id'],
#                         "academic_year_label": a['academic_year_label']
#                     }
#                     for a in assignments
#                 ]
#             },
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error in get_teacher_workload_detail: {str(e)}")
#         logger.error(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
#     finally:
#         if conn:
#             conn.close()






# app/school/workload.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
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

router = APIRouter(prefix="/api/workload", tags=["workload"])

# ==================== Pydantic Models ====================

class WorkloadThresholdUpdate(BaseModel):
    threshold: int = Field(default=25, ge=10, le=50)

class TeacherWorkloadResponse(BaseModel):
    id: int
    name: str
    total_periods: int
    num_classes: int
    num_subjects: int
    status: str
    workload_percentage: float

class WorkloadStatisticsResponse(BaseModel):
    total_teachers: int
    average_periods: float
    overloaded_count: int
    underloaded_count: int
    normal_count: int
    max_periods: int
    min_periods: int

class WorkloadRecommendation(BaseModel):
    type: str
    message: str
    teachers: List[str]

# ==================== Helper Functions ====================

def calculate_teacher_workload(cursor, teacher_id: int, academic_year_id: Optional[int] = None) -> Dict[str, Any]:
    """Calculate workload for a specific teacher"""
    
    # Get teacher's assignments
    query = """
        SELECT 
            tsa.id,
            tsa.class_id,
            tsa.subject_id,
            tsa.academic_year_id
        FROM teacher_subject_assignments tsa
        WHERE tsa.staff_id = ? AND tsa.is_active = 1
    """
    params = [teacher_id]
    
    if academic_year_id:
        query += " AND tsa.academic_year_id = ?"
        params.append(academic_year_id)
    
    cursor.execute(query, params)
    assignments = cursor.fetchall()
    
    # Get time slots count per week (assuming each subject gets one period per week)
    # This would be more accurate when connected to timetable
    num_subjects = len(set(a['subject_id'] for a in assignments))
    num_classes = len(set(a['class_id'] for a in assignments))
    
    # Calculate total periods (simplified: each assignment = 1 period per week)
    total_periods = len(assignments)
    
    return {
        "total_periods": total_periods,
        "num_classes": num_classes,
        "num_subjects": num_subjects
    }

def get_workload_status(periods: int, threshold: int) -> str:
    """Determine workload status based on periods and threshold"""
    if periods > threshold:
        return "Overloaded"
    elif periods < threshold - 10:
        return "Underloaded"
    return "Normal"

def get_workload_color(periods: int, threshold: int) -> str:
    """Get color class for workload"""
    if periods > threshold:
        return "overload"
    elif periods < threshold - 10:
        return "warning"
    return "normal"

# ==================== API Endpoints ====================

@router.get("/teachers")
async def get_teacher_workload(
    academic_year_id: Optional[int] = None,
    threshold: int = 25
):
    """Get workload analysis for all teachers"""
    logger.info(f"GET /api/workload/teachers - Fetching teacher workload")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all active teachers (without title column)
        cursor.execute("""
            SELECT 
                s.id,
                s.staff_number,
                p.first_name,
                p.last_name
            FROM staff s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.status = 'active' AND s.role IN ('Teacher', 'Admin')
            ORDER BY p.last_name, p.first_name
        """)
        
        teachers = cursor.fetchall()
        workload_data = []
        
        for teacher in teachers:
            workload = calculate_teacher_workload(cursor, teacher['id'], academic_year_id)
            
            teacher_name = f"{teacher['first_name']} {teacher['last_name']}"
            
            total_periods = workload['total_periods']
            status = get_workload_status(total_periods, threshold)
            
            workload_data.append({
                "id": teacher['id'],
                "name": teacher_name.strip(),
                "staff_number": teacher['staff_number'],
                "total_periods": total_periods,
                "num_classes": workload['num_classes'],
                "num_subjects": workload['num_subjects'],
                "status": status,
                "workload_percentage": min((total_periods / threshold) * 100, 150) if threshold > 0 else 0
            })
        
        # Sort by total periods descending
        workload_data.sort(key=lambda x: x['total_periods'], reverse=True)
        
        return {
            "success": True,
            "data": workload_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_teacher_workload: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/statistics")
async def get_workload_statistics(
    academic_year_id: Optional[int] = None,
    threshold: int = 25
):
    """Get workload statistics summary"""
    logger.info(f"GET /api/workload/statistics - Fetching workload statistics")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all active teachers
        cursor.execute("""
            SELECT 
                s.id
            FROM staff s
            WHERE s.status = 'active' AND s.role IN ('Teacher', 'Admin')
        """)
        
        teachers = cursor.fetchall()
        
        total_periods = 0
        overloaded_count = 0
        underloaded_count = 0
        normal_count = 0
        max_periods = 0
        min_periods = float('inf')
        
        for teacher in teachers:
            workload = calculate_teacher_workload(cursor, teacher['id'], academic_year_id)
            periods = workload['total_periods']
            
            total_periods += periods
            max_periods = max(max_periods, periods)
            min_periods = min(min_periods, periods)
            
            status = get_workload_status(periods, threshold)
            if status == "Overloaded":
                overloaded_count += 1
            elif status == "Underloaded":
                underloaded_count += 1
            else:
                normal_count += 1
        
        average_periods = total_periods / len(teachers) if teachers else 0
        
        return {
            "success": True,
            "data": {
                "total_teachers": len(teachers),
                "average_periods": round(average_periods, 1),
                "overloaded_count": overloaded_count,
                "underloaded_count": underloaded_count,
                "normal_count": normal_count,
                "max_periods": max_periods,
                "min_periods": min_periods if min_periods != float('inf') else 0
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_workload_statistics: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/recommendations")
async def get_workload_recommendations(
    academic_year_id: Optional[int] = None,
    threshold: int = 25
):
    """Get recommendations based on workload analysis"""
    logger.info(f"GET /api/workload/recommendations - Fetching recommendations")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all active teachers (without title column)
        cursor.execute("""
            SELECT 
                s.id,
                p.first_name,
                p.last_name
            FROM staff s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.status = 'active' AND s.role IN ('Teacher', 'Admin')
        """)
        
        teachers = cursor.fetchall()
        
        overloaded_teachers = []
        underloaded_teachers = []
        
        for teacher in teachers:
            workload = calculate_teacher_workload(cursor, teacher['id'], academic_year_id)
            periods = workload['total_periods']
            teacher_name = f"{teacher['first_name']} {teacher['last_name']}"
            
            status = get_workload_status(periods, threshold)
            if status == "Overloaded":
                overloaded_teachers.append(teacher_name.strip())
            elif status == "Underloaded":
                underloaded_teachers.append(teacher_name.strip())
        
        recommendations = []
        
        if overloaded_teachers:
            recommendations.append({
                "type": "warning",
                "message": f"{len(overloaded_teachers)} teacher(s) are overloaded. Consider redistributing classes or hiring additional staff.",
                "teachers": overloaded_teachers
            })
        
        if underloaded_teachers:
            recommendations.append({
                "type": "info",
                "message": f"{len(underloaded_teachers)} teacher(s) are underloaded. Consider assigning additional classes or subjects.",
                "teachers": underloaded_teachers
            })
        
        if not overloaded_teachers and not underloaded_teachers:
            recommendations.append({
                "type": "success",
                "message": "Excellent! All teachers are within optimal workload range.",
                "teachers": []
            })
        
        return {
            "success": True,
            "data": recommendations,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_workload_recommendations: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/threshold")
async def update_threshold(threshold_data: WorkloadThresholdUpdate):
    """Update workload threshold (stored in settings)"""
    logger.info(f"POST /api/workload/threshold - Updating threshold to {threshold_data.threshold}")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if settings table exists, create if not
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP
            )
        """)
        
        # Store threshold in settings table
        cursor.execute("""
            INSERT OR REPLACE INTO settings (key, value, updated_at)
            VALUES ('workload_threshold', ?, ?)
        """, (str(threshold_data.threshold), datetime.now().isoformat()))
        
        conn.commit()
        
        return {
            "success": True,
            "message": "Threshold updated successfully",
            "data": {"threshold": threshold_data.threshold},
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in update_threshold: {str(e)}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/threshold")
async def get_threshold():
    """Get current workload threshold"""
    logger.info("GET /api/workload/threshold - Fetching threshold")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if settings table exists
        cursor.execute("""
            SELECT name FROM sqlite_master WHERE type='table' AND name='settings'
        """)
        
        if cursor.fetchone():
            cursor.execute("SELECT value FROM settings WHERE key = 'workload_threshold'")
            result = cursor.fetchone()
            threshold = int(result['value']) if result else 25
        else:
            threshold = 25
        
        return {
            "success": True,
            "data": {"threshold": threshold},
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_threshold: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/teacher/{teacher_id}")
async def get_teacher_workload_detail(
    teacher_id: int,
    academic_year_id: Optional[int] = None
):
    """Get detailed workload for a specific teacher"""
    logger.info(f"GET /api/workload/teacher/{teacher_id} - Fetching teacher workload detail")
    conn = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get teacher details (without title column)
        cursor.execute("""
            SELECT 
                s.id,
                s.staff_number,
                p.first_name,
                p.last_name,
                p.email,
                p.phone
            FROM staff s
            JOIN person_details p ON s.person_id = p.id
            WHERE s.id = ?
        """, (teacher_id,))
        
        teacher = cursor.fetchone()
        
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        # Get workload calculations
        workload = calculate_teacher_workload(cursor, teacher_id, academic_year_id)
        
        # Get detailed assignments
        query = """
            SELECT 
                tsa.id,
                tsa.class_id,
                c.class_name,
                tsa.subject_id,
                s.name as subject_name,
                s.code as subject_code,
                tsa.academic_year_id,
                ay.year_label as academic_year_label
            FROM teacher_subject_assignments tsa
            JOIN classes c ON tsa.class_id = c.id
            JOIN subjects s ON tsa.subject_id = s.id
            JOIN academic_years ay ON tsa.academic_year_id = ay.id
            WHERE tsa.staff_id = ? AND tsa.is_active = 1
        """
        params = [teacher_id]
        
        if academic_year_id:
            query += " AND tsa.academic_year_id = ?"
            params.append(academic_year_id)
        
        cursor.execute(query, params)
        assignments = cursor.fetchall()
        
        teacher_name = f"{teacher['first_name']} {teacher['last_name']}"
        
        return {
            "success": True,
            "data": {
                "id": teacher['id'],
                "name": teacher_name.strip(),
                "staff_number": teacher['staff_number'],
                "email": teacher['email'],
                "phone": teacher['phone'],
                "total_periods": workload['total_periods'],
                "num_classes": workload['num_classes'],
                "num_subjects": workload['num_subjects'],
                "assignments": [
                    {
                        "id": a['id'],
                        "class_id": a['class_id'],
                        "class_name": a['class_name'],
                        "subject_id": a['subject_id'],
                        "subject_name": a['subject_name'],
                        "subject_code": a['subject_code'],
                        "academic_year_id": a['academic_year_id'],
                        "academic_year_label": a['academic_year_label']
                    }
                    for a in assignments
                ]
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_teacher_workload_detail: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if conn:
            conn.close()