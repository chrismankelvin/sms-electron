# # app/routes/global_settings_routes.py
# from fastapi import APIRouter, HTTPException, BackgroundTasks
# from pydantic import BaseModel
# from typing import Optional, Dict, Any
# from datetime import datetime
# import asyncio

# from app.activation.state import get_db_connection
# from app.sync.sync_integration import get_sync_scheduler, init_sync_system, stop_sync_system, refresh_sync_system

# router = APIRouter(prefix="/api/global-settings", tags=["global-settings"])

# # Pydantic models
# class EmailConfig(BaseModel):
#     smtp_server: str = "smtp.gmail.com"
#     smtp_port: int = 587
#     smtp_encryption: str = "TLS"
#     email_from_address: str = "noreply@school.edu"
#     email_from_name: str = "School System"

# class SMSConfig(BaseModel):
#     provider: str = "Twilio"
#     api_key: Optional[str] = None
#     sender_id: str = "SchoolSMS"

# class DatabaseSyncConfig(BaseModel):
#     sync_enabled: bool = False
#     db_connection_string: str
#     db_api_key: str
#     db_name: str
#     db_type: str = "sqlitecloud"

# class GlobalSettingsUpdate(BaseModel):
#     # General
#     date_format: Optional[str] = "DD/MM/YYYY"
#     timezone: Optional[str] = "Africa/Accra"
#     default_language: Optional[str] = "English"
#     session_timeout: Optional[int] = 30
#     password_expiry: Optional[int] = 90
#     two_factor_required: Optional[bool] = True
    
#     # Email
#     email: Optional[EmailConfig] = None
    
#     # SMS
#     sms: Optional[SMSConfig] = None
    
#     # Notifications
#     quiet_hours_start: Optional[str] = "21:00:00"
#     quiet_hours_end: Optional[str] = "07:00:00"
    
#     # Database Sync
#     database: Optional[DatabaseSyncConfig] = None
    
#     # Features
#     enable_sms: Optional[bool] = False
#     enable_push_notifications: Optional[bool] = True
#     enable_fee_module: Optional[bool] = False
#     enable_sync_module: Optional[bool] = False

# @router.get("/")
# async def get_global_settings():
#     """Get all global system settings"""
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("SELECT * FROM global_system_settings WHERE id = 1")
#     result = cursor.fetchone()
#     conn.close()
    
#     if not result:
#         return {
#             "success": False,
#             "message": "Global settings not found"
#         }
    
#     settings = dict(result)
    
#     return {
#         "success": True,
#         "data": {
#             "general": {
#                 "date_format": settings.get('date_format'),
#                 "timezone": settings.get('timezone'),
#                 "default_language": settings.get('default_language'),
#                 "session_timeout": settings.get('session_timeout'),
#                 "password_expiry": settings.get('password_expiry'),
#                 "two_factor_required": bool(settings.get('two_factor_required'))
#             },
#             "email": {
#                 "smtp_server": settings.get('smtp_server'),
#                 "smtp_port": settings.get('smtp_port'),
#                 "smtp_encryption": settings.get('smtp_encryption'),
#                 "email_from_address": settings.get('email_from_address'),
#                 "email_from_name": settings.get('email_from_name')
#             },
#             "sms": {
#                 "provider": settings.get('sms_provider'),
#                 "api_key": settings.get('sms_api_key'),
#                 "sender_id": settings.get('sms_sender_id')
#             },
#             "notifications": {
#                 "quiet_hours_start": settings.get('quiet_hours_start'),
#                 "quiet_hours_end": settings.get('quiet_hours_end')
#             },
#             "database": {
#                 "sync_enabled": bool(settings.get('sync_enabled')),
#                 "db_connection_string": settings.get('db_connection_string'),
#                 "db_api_key": settings.get('db_api_key'),
#                 "db_name": settings.get('db_name'),
#                 "db_type": settings.get('db_type')
#             },
#             "features": {
#                 "enable_sms": bool(settings.get('enable_sms')),
#                 "enable_push_notifications": bool(settings.get('enable_push_notifications')),
#                 "enable_fee_module": bool(settings.get('enable_fee_module')),
#                 "enable_sync_module": bool(settings.get('enable_sync_module'))
#             },
#             "sync_status": {
#                 "last_attempt": settings.get('sync_last_attempt'),
#                 "last_success": settings.get('sync_last_success'),
#                 "last_error": settings.get('sync_last_error'),
#                 "status": settings.get('sync_status')
#             }
#         },
#         "timestamp": datetime.now().isoformat()
#     }

# @router.put("/")
# async def update_global_settings(settings: GlobalSettingsUpdate, background_tasks: BackgroundTasks):
#     """Update global system settings"""
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     # Build update query dynamically
#     updates = []
#     params = []
    
#     # General settings
#     if settings.date_format:
#         updates.append("date_format = ?")
#         params.append(settings.date_format)
#     if settings.timezone:
#         updates.append("timezone = ?")
#         params.append(settings.timezone)
#     if settings.default_language:
#         updates.append("default_language = ?")
#         params.append(settings.default_language)
#     if settings.session_timeout is not None:
#         updates.append("session_timeout = ?")
#         params.append(settings.session_timeout)
#     if settings.password_expiry is not None:
#         updates.append("password_expiry = ?")
#         params.append(settings.password_expiry)
#     if settings.two_factor_required is not None:
#         updates.append("two_factor_required = ?")
#         params.append(1 if settings.two_factor_required else 0)
    
#     # Email settings
#     if settings.email:
#         if settings.email.smtp_server:
#             updates.append("smtp_server = ?")
#             params.append(settings.email.smtp_server)
#         if settings.email.smtp_port:
#             updates.append("smtp_port = ?")
#             params.append(settings.email.smtp_port)
#         if settings.email.smtp_encryption:
#             updates.append("smtp_encryption = ?")
#             params.append(settings.email.smtp_encryption)
#         if settings.email.email_from_address:
#             updates.append("email_from_address = ?")
#             params.append(settings.email.email_from_address)
#         if settings.email.email_from_name:
#             updates.append("email_from_name = ?")
#             params.append(settings.email.email_from_name)
    
#     # SMS settings
#     if settings.sms:
#         if settings.sms.provider:
#             updates.append("sms_provider = ?")
#             params.append(settings.sms.provider)
#         if settings.sms.api_key:
#             updates.append("sms_api_key = ?")
#             params.append(settings.sms.api_key)
#         if settings.sms.sender_id:
#             updates.append("sms_sender_id = ?")
#             params.append(settings.sms.sender_id)
    
#     # Notification settings
#     if settings.quiet_hours_start:
#         updates.append("quiet_hours_start = ?")
#         params.append(settings.quiet_hours_start)
#     if settings.quiet_hours_end:
#         updates.append("quiet_hours_end = ?")
#         params.append(settings.quiet_hours_end)
    
#     # Features
#     if settings.enable_sms is not None:
#         updates.append("enable_sms = ?")
#         params.append(1 if settings.enable_sms else 0)
#     if settings.enable_push_notifications is not None:
#         updates.append("enable_push_notifications = ?")
#         params.append(1 if settings.enable_push_notifications else 0)
#     if settings.enable_fee_module is not None:
#         updates.append("enable_fee_module = ?")
#         params.append(1 if settings.enable_fee_module else 0)
#     if settings.enable_sync_module is not None:
#         updates.append("enable_sync_module = ?")
#         params.append(1 if settings.enable_sync_module else 0)
    
#     # Database settings
#     if settings.database:
#         if settings.database.sync_enabled is not None:
#             updates.append("sync_enabled = ?")
#             params.append(1 if settings.database.sync_enabled else 0)
#         if settings.database.db_connection_string:
#             updates.append("db_connection_string = ?")
#             params.append(settings.database.db_connection_string)
#         if settings.database.db_api_key:
#             updates.append("db_api_key = ?")
#             params.append(settings.database.db_api_key)
#         if settings.database.db_name:
#             updates.append("db_name = ?")
#             params.append(settings.database.db_name)
#         if settings.database.db_type:
#             updates.append("db_type = ?")
#             params.append(settings.database.db_type)
    
#     # Add updated_at
#     updates.append("updated_at = ?")
#     params.append(datetime.now().isoformat())
    
#     # Execute update
#     if updates:
#         params.append(1)  # WHERE id = 1
#         query = f"UPDATE global_system_settings SET {', '.join(updates)} WHERE id = ?"
#         cursor.execute(query, params)
    
#     conn.commit()
#     conn.close()
    
#     # Check if sync was enabled and start it
#     if settings.database and settings.database.sync_enabled:
#         background_tasks.add_task(initialize_sync_system, settings.database)
    
#     return {
#         "success": True,
#         "message": "Global settings updated successfully",
#         "timestamp": datetime.now().isoformat()
#     }

# # @router.post("/sync/enable")
# # async def enable_sync_module(background_tasks: BackgroundTasks):
# #     """Enable the sync module with stored database configuration"""
# #     conn = get_db_connection()
# #     cursor = conn.cursor()
    
# #     cursor.execute("""
# #         SELECT db_connection_string, db_api_key, db_name, db_type, sync_enabled
# #         FROM global_system_settings WHERE id = 1
# #     """)
# #     result = cursor.fetchone()
    
# #     if not result:
# #         conn.close()
# #         return {
# #             "success": False,
# #             "message": "Global settings not found"
# #         }
    
# #     settings = dict(result)
    
# #     if not settings.get('db_connection_string'):
# #         conn.close()
# #         return {
# #             "success": False,
# #             "message": "Database connection string not configured. Please configure database settings first."
# #         }
    
# #     # Update sync_enabled flag
# #     cursor.execute("""
# #         UPDATE global_system_settings 
# #         SET sync_enabled = 1, 
# #             sync_status = 'enabled',
# #             updated_at = ?
# #         WHERE id = 1
# #     """, (datetime.now().isoformat(),))
# #     conn.commit()
# #     conn.close()
    
# #     # Initialize sync system
# #     background_tasks.add_task(initialize_sync_system, {
# #         'db_connection_string': settings.get('db_connection_string'),
# #         'db_api_key': settings.get('db_api_key'),
# #         'db_name': settings.get('db_name'),
# #         'db_type': settings.get('db_type')
# #     })
    
# #     return {
# #         "success": True,
# #         "message": "Sync module enabled. Database synchronization started.",
# #         "timestamp": datetime.now().isoformat()
# #     }


# # app/routes/global_settings_routes.py - Add sync refresh

# @router.post("/sync/enable")
# async def enable_sync_module(background_tasks: BackgroundTasks):
#     """Enable the sync module with stored database configuration"""
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         SELECT db_connection_string, db_api_key, db_name, db_type, sync_enabled
#         FROM global_system_settings WHERE id = 1
#     """)
#     result = cursor.fetchone()
    
#     if not result:
#         conn.close()
#         return {
#             "success": False,
#             "message": "Global settings not found"
#         }
    
#     settings = dict(result)
    
#     if not settings.get('db_connection_string'):
#         conn.close()
#         return {
#             "success": False,
#             "message": "Database connection string not configured. Please configure database settings first."
#         }
    
#     # Update sync_enabled flag
#     cursor.execute("""
#         UPDATE global_system_settings 
#         SET sync_enabled = 1, 
#             sync_status = 'enabled',
#             updated_at = ?
#         WHERE id = 1
#     """, (datetime.now().isoformat(),))
#     conn.commit()
#     conn.close()
    
#     # Refresh sync system in background
#     background_tasks.add_task(refresh_sync_system)
    
#     return {
#         "success": True,
#         "message": "Sync module enabled. Database synchronization started.",
#         "timestamp": datetime.now().isoformat()
#     }

# @router.post("/sync/disable")
# async def disable_sync_module():
#     """Disable the sync module"""
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         UPDATE global_system_settings 
#         SET sync_enabled = 0, 
#             sync_status = 'disabled',
#             updated_at = ?
#         WHERE id = 1
#     """, (datetime.now().isoformat(),))
#     conn.commit()
#     conn.close()
    
#     # Stop sync system
#     stop_sync_system()
    
#     return {
#         "success": True,
#         "message": "Sync module disabled. Database synchronization stopped.",
#         "timestamp": datetime.now().isoformat()
#     }


# @router.post("/sync/disable")
# async def disable_sync_module():
#     """Disable the sync module"""
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         UPDATE global_system_settings 
#         SET sync_enabled = 0, 
#             sync_status = 'disabled',
#             updated_at = ?
#         WHERE id = 1
#     """, (datetime.now().isoformat(),))
#     conn.commit()
#     conn.close()
    
#     # Stop sync system
#     # stop_sync_system()
    
#     return {
#         "success": True,
#         "message": "Sync module disabled. Database synchronization stopped.",
#         "timestamp": datetime.now().isoformat()
#     }

# @router.get("/sync/status")
# async def get_sync_module_status():
#     """Get sync module status"""
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         SELECT sync_enabled, sync_status, sync_last_attempt, sync_last_success, 
#                sync_last_error, db_name, db_type
#         FROM global_system_settings WHERE id = 1
#     """)
#     result = cursor.fetchone()
#     conn.close()
    
#     if not result:
#         return {
#             "success": False,
#             "message": "Global settings not found"
#         }
    
#     settings = dict(result)
    
#     return {
#         "success": True,
#         "data": {
#             "enabled": bool(settings.get('sync_enabled')),
#             "status": settings.get('sync_status'),
#             "database": settings.get('db_name'),
#             "database_type": settings.get('db_type'),
#             "last_attempt": settings.get('sync_last_attempt'),
#             "last_success": settings.get('sync_last_success'),
#             "last_error": settings.get('sync_last_error')
#         }
#     }

# async def initialize_sync_system(db_config: dict):
#     """Initialize the sync system with database configuration"""
#     try:
#         connection_string = db_config.get('db_connection_string')
#         api_key = db_config.get('db_api_key')
        
#         # Initialize sync
#         init_sync_system(connection_string, api_key)
        
#         # Update success status
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("""
#             UPDATE global_system_settings 
#             SET sync_last_success = ?, 
#                 sync_status = 'active',
#                 updated_at = ?
#             WHERE id = 1
#         """, (datetime.now().isoformat(), datetime.now().isoformat()))
#         conn.commit()
#         conn.close()
        
#     except Exception as e:
#         # Update error status
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("""
#             UPDATE global_system_settings 
#             SET sync_last_error = ?, 
#                 sync_status = 'error',
#                 updated_at = ?
#             WHERE id = 1
#         """, (str(e), datetime.now().isoformat()))
#         conn.commit()
#         conn.close()
#         print(f"Failed to initialize sync system: {e}")


# app/routes/global_settings_routes.py - Fix the attribute access

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

from app.activation.state import get_db_connection
from app.sync.sync_integration import get_sync_scheduler, init_sync_system, stop_sync_system, refresh_sync_system

router = APIRouter(prefix="/api/global-settings", tags=["global-settings"])

# Pydantic models
class EmailConfig(BaseModel):
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_encryption: str = "TLS"
    email_from_address: str = "noreply@school.edu"
    email_from_name: str = "School System"

class SMSConfig(BaseModel):
    provider: str = "Twilio"
    api_key: Optional[str] = None
    sender_id: str = "SchoolSMS"

class DatabaseSyncConfig(BaseModel):
    sync_enabled: bool = False
    db_connection_string: str = ""
    db_api_key: str = ""
    db_name: str = ""
    db_type: str = "sqlitecloud"

class GlobalSettingsUpdate(BaseModel):
    # General
    date_format: Optional[str] = None
    timezone: Optional[str] = None
    default_language: Optional[str] = None
    session_timeout: Optional[int] = None
    password_expiry: Optional[int] = None
    two_factor_required: Optional[bool] = None
    
    # Email
    email: Optional[EmailConfig] = None
    
    # SMS
    sms: Optional[SMSConfig] = None
    
    # Notifications
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    
    # Database Sync
    database: Optional[DatabaseSyncConfig] = None
    
    # Features
    enable_sms: Optional[bool] = None
    enable_push_notifications: Optional[bool] = None
    enable_fee_module: Optional[bool] = None
    enable_sync_module: Optional[bool] = None

@router.get("/")
async def get_global_settings():
    """Get all global system settings"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM global_system_settings WHERE id = 1")
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        return {
            "success": False,
            "message": "Global settings not found"
        }
    
    settings = dict(result)
    
    return {
        "success": True,
        "data": {
            "general": {
                "date_format": settings.get('date_format'),
                "timezone": settings.get('timezone'),
                "default_language": settings.get('default_language'),
                "session_timeout": settings.get('session_timeout'),
                "password_expiry": settings.get('password_expiry'),
                "two_factor_required": bool(settings.get('two_factor_required'))
            },
            "email": {
                "smtp_server": settings.get('smtp_server'),
                "smtp_port": settings.get('smtp_port'),
                "smtp_encryption": settings.get('smtp_encryption'),
                "email_from_address": settings.get('email_from_address'),
                "email_from_name": settings.get('email_from_name')
            },
            "sms": {
                "provider": settings.get('sms_provider'),
                "api_key": settings.get('sms_api_key'),
                "sender_id": settings.get('sms_sender_id')
            },
            "notifications": {
                "quiet_hours_start": settings.get('quiet_hours_start'),
                "quiet_hours_end": settings.get('quiet_hours_end')
            },
            "database": {
                "sync_enabled": bool(settings.get('sync_enabled')),
                "db_connection_string": settings.get('db_connection_string'),
                "db_api_key": settings.get('db_api_key'),
                "db_name": settings.get('db_name'),
                "db_type": settings.get('db_type')
            },
            "features": {
                "enable_sms": bool(settings.get('enable_sms')),
                "enable_push_notifications": bool(settings.get('enable_push_notifications')),
                "enable_fee_module": bool(settings.get('enable_fee_module')),
                "enable_sync_module": bool(settings.get('enable_sync_module'))
            },
            "sync_status": {
                "last_attempt": settings.get('sync_last_attempt'),
                "last_success": settings.get('sync_last_success'),
                "last_error": settings.get('sync_last_error'),
                "status": settings.get('sync_status')
            }
        },
        "timestamp": datetime.now().isoformat()
    }

@router.put("/")
async def update_global_settings(settings: GlobalSettingsUpdate, background_tasks: BackgroundTasks):
    """Update global system settings"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Build update query dynamically
    updates = []
    params = []
    
    # General settings
    if settings.date_format is not None:
        updates.append("date_format = ?")
        params.append(settings.date_format)
    if settings.timezone is not None:
        updates.append("timezone = ?")
        params.append(settings.timezone)
    if settings.default_language is not None:
        updates.append("default_language = ?")
        params.append(settings.default_language)
    if settings.session_timeout is not None:
        updates.append("session_timeout = ?")
        params.append(settings.session_timeout)
    if settings.password_expiry is not None:
        updates.append("password_expiry = ?")
        params.append(settings.password_expiry)
    if settings.two_factor_required is not None:
        updates.append("two_factor_required = ?")
        params.append(1 if settings.two_factor_required else 0)
    
    # Email settings
    if settings.email:
        if settings.email.smtp_server:
            updates.append("smtp_server = ?")
            params.append(settings.email.smtp_server)
        if settings.email.smtp_port:
            updates.append("smtp_port = ?")
            params.append(settings.email.smtp_port)
        if settings.email.smtp_encryption:
            updates.append("smtp_encryption = ?")
            params.append(settings.email.smtp_encryption)
        if settings.email.email_from_address:
            updates.append("email_from_address = ?")
            params.append(settings.email.email_from_address)
        if settings.email.email_from_name:
            updates.append("email_from_name = ?")
            params.append(settings.email.email_from_name)
    
    # SMS settings
    if settings.sms:
        if settings.sms.provider:
            updates.append("sms_provider = ?")
            params.append(settings.sms.provider)
        if settings.sms.api_key:
            updates.append("sms_api_key = ?")
            params.append(settings.sms.api_key)
        if settings.sms.sender_id:
            updates.append("sms_sender_id = ?")
            params.append(settings.sms.sender_id)
    
    # Notification settings
    if settings.quiet_hours_start is not None:
        updates.append("quiet_hours_start = ?")
        params.append(settings.quiet_hours_start)
    if settings.quiet_hours_end is not None:
        updates.append("quiet_hours_end = ?")
        params.append(settings.quiet_hours_end)
    
    # Features
    if settings.enable_sms is not None:
        updates.append("enable_sms = ?")
        params.append(1 if settings.enable_sms else 0)
    if settings.enable_push_notifications is not None:
        updates.append("enable_push_notifications = ?")
        params.append(1 if settings.enable_push_notifications else 0)
    if settings.enable_fee_module is not None:
        updates.append("enable_fee_module = ?")
        params.append(1 if settings.enable_fee_module else 0)
    if settings.enable_sync_module is not None:
        updates.append("enable_sync_module = ?")
        params.append(1 if settings.enable_sync_module else 0)
    
    # Database settings - FIXED: Access attributes directly, not with .get()
    if settings.database:
        # sync_enabled
        if settings.database.sync_enabled is not None:
            updates.append("sync_enabled = ?")
            params.append(1 if settings.database.sync_enabled else 0)
        # db_connection_string
        if settings.database.db_connection_string:
            updates.append("db_connection_string = ?")
            params.append(settings.database.db_connection_string)
        # db_api_key
        if settings.database.db_api_key is not None:
            updates.append("db_api_key = ?")
            params.append(settings.database.db_api_key)
        # db_name
        if settings.database.db_name:
            updates.append("db_name = ?")
            params.append(settings.database.db_name)
        # db_type
        if settings.database.db_type:
            updates.append("db_type = ?")
            params.append(settings.database.db_type)
    
    # Add updated_at
    updates.append("updated_at = ?")
    params.append(datetime.now().isoformat())
    
    # Execute update
    if updates:
        params.append(1)  # WHERE id = 1
        query = f"UPDATE global_system_settings SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
    
    conn.commit()
    conn.close()
    
    # Check if sync was enabled and start it
    if settings.database and settings.database.sync_enabled:
        background_tasks.add_task(initialize_sync_system, settings.database)
    
    return {
        "success": True,
        "message": "Global settings updated successfully",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/sync/enable")
async def enable_sync_module(background_tasks: BackgroundTasks):
    """Enable the sync module with stored database configuration"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT db_connection_string, db_api_key, db_name, db_type, sync_enabled
        FROM global_system_settings WHERE id = 1
    """)
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        return {
            "success": False,
            "message": "Global settings not found"
        }
    
    settings = dict(result)
    
    if not settings.get('db_connection_string'):
        conn.close()
        return {
            "success": False,
            "message": "Database connection string not configured. Please configure database settings first."
        }
    
    # Update sync_enabled flag AND enable_sync_module
    cursor.execute("""
        UPDATE global_system_settings 
        SET sync_enabled = 1, 
            enable_sync_module = 1,
            sync_status = 'enabled',
            updated_at = ?
        WHERE id = 1
    """, (datetime.now().isoformat(),))
    conn.commit()
    conn.close()
    
    # Initialize sync system
    background_tasks.add_task(initialize_sync_system, {
        'db_connection_string': settings.get('db_connection_string'),
        'db_api_key': settings.get('db_api_key'),
        'db_name': settings.get('db_name'),
        'db_type': settings.get('db_type')
    })
    
    return {
        "success": True,
        "message": "Sync module enabled. Database synchronization started.",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/sync/disable")
async def disable_sync_module():
    """Disable the sync module"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE global_system_settings 
        SET sync_enabled = 0, 
            enable_sync_module = 0,
            sync_status = 'disabled',
            updated_at = ?
        WHERE id = 1
    """, (datetime.now().isoformat(),))
    conn.commit()
    conn.close()
    
    # Stop sync system
    stop_sync_system()
    
    return {
        "success": True,
        "message": "Sync module disabled. Database synchronization stopped.",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/sync/status")
async def get_sync_module_status():
    """Get sync module status"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT sync_enabled, enable_sync_module, sync_status, sync_last_attempt, 
               sync_last_success, sync_last_error, db_name, db_type
        FROM global_system_settings WHERE id = 1
    """)
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        return {
            "success": False,
            "message": "Global settings not found"
        }
    
    settings = dict(result)
    
    return {
        "success": True,
        "data": {
            "enabled": bool(settings.get('sync_enabled')) and bool(settings.get('enable_sync_module')),
            "status": settings.get('sync_status'),
            "database": settings.get('db_name'),
            "database_type": settings.get('db_type'),
            "last_attempt": settings.get('sync_last_attempt'),
            "last_success": settings.get('sync_last_success'),
            "last_error": settings.get('sync_last_error')
        }
    }

async def initialize_sync_system(db_config: dict):
    """Initialize the sync system with database configuration"""
    try:
        connection_string = db_config.get('db_connection_string')
        api_key = db_config.get('db_api_key')
        db_name = db_config.get('db_name')
        
        # Initialize sync
        result = init_sync_system()  # This now reads from global settings
        
        if result:
            # Update success status
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE global_system_settings 
                SET sync_last_success = ?, 
                    sync_status = 'active',
                    updated_at = ?
                WHERE id = 1
            """, (datetime.now().isoformat(), datetime.now().isoformat()))
            conn.commit()
            conn.close()
            print(f"✅ Sync system initialized for database: {db_name}")
        else:
            raise Exception("Sync initialization returned None")
        
    except Exception as e:
        # Update error status
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE global_system_settings 
            SET sync_last_error = ?, 
                sync_status = 'error',
                updated_at = ?
            WHERE id = 1
        """, (str(e), datetime.now().isoformat()))
        conn.commit()
        conn.close()
        print(f"❌ Failed to initialize sync system: {e}")