# # app/sync/sync_integration.py
# """
# Integration module that hooks into your existing database functions
# to add sync capabilities without breaking existing code
# """
# import functools
# from typing import Dict, Any
# from app.activation.state import get_db_connection
# from app.sync.school_sync_scheduler import SchoolSyncScheduler
# from datetime import datetime

# # Global sync scheduler instance
# _sync_scheduler = None

# def init_sync_system(cloud_connection_string: str, cloud_api_key: str):
#     """Initialize the sync system (call once at app startup)"""
#     global _sync_scheduler
#     _sync_scheduler = SchoolSyncScheduler(cloud_connection_string, cloud_api_key)
#     _sync_scheduler.start()
#     return _sync_scheduler

# def get_sync_scheduler():
#     """Get the global sync scheduler instance"""
#     return _sync_scheduler

# # ========== Decorator for automatic sync on write operations ==========

# def sync_on_write(table_name: str):
#     """
#     Decorator that automatically queues sync operations after database writes.
#     Use this to decorate your existing write functions.
#     """
#     def decorator(func):
#         @functools.wraps(func)
#         def wrapper(*args, **kwargs):
#             # Execute the original function
#             result = func(*args, **kwargs)
            
#             # Extract record info from result or kwargs
#             record_id = kwargs.get('record_id') or (result if isinstance(result, (int, str)) else None)
#             data = kwargs.get('data', {})
#             operation = kwargs.get('operation', 'UPDATE')
            
#             # Queue for sync
#             if _sync_scheduler and record_id:
#                 _sync_scheduler.on_data_change(table_name, str(record_id), operation, data)
            
#             return result
#         return wrapper
#     return decorator

# # ========== Patched versions of your database functions ==========

# def synced_insert(table_name: str, data: Dict) -> int:
#     """
#     Insert with sync support.
#     Use this instead of direct INSERT in your code.
#     """
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     # Add version and sync metadata
#     data['version'] = data.get('version', 1)
#     data['synced_at'] = None
#     data['updated_by_sync'] = 0
    
#     columns = ', '.join(data.keys())
#     placeholders = ', '.join(['?' for _ in data])
    
#     cursor.execute(f"""
#         INSERT INTO {table_name} ({columns})
#         VALUES ({placeholders})
#     """, list(data.values()))
    
#     record_id = cursor.lastrowid
#     conn.commit()
#     conn.close()
    
#     # Trigger sync
#     if _sync_scheduler:
#         _sync_scheduler.on_data_change(table_name, str(record_id), 'INSERT', data)
    
#     return record_id

# def synced_update(table_name: str, record_id: str, data: Dict) -> bool:
#     """
#     Update with sync support.
#     Use this instead of direct UPDATE in your code.
#     """
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     # Increment version
#     cursor.execute(f"SELECT version FROM {table_name} WHERE id = ?", (record_id,))
#     current = cursor.fetchone()
#     new_version = (current['version'] if current else 0) + 1
    
#     data['version'] = new_version
#     data['updated_at'] = datetime.now().isoformat()
    
#     set_clause = ', '.join([f"{k}=?" for k in data.keys() if k != 'id'])
    
#     cursor.execute(f"""
#         UPDATE {table_name}
#         SET {set_clause}
#         WHERE id = ?
#     """, list(data.values()) + [record_id])
    
#     conn.commit()
#     conn.close()
    
#     # Trigger sync
#     if _sync_scheduler:
#         _sync_scheduler.on_data_change(table_name, record_id, 'UPDATE', data)
    
#     return True

# def synced_delete(table_name: str, record_id: str) -> bool:
#     """
#     Delete with sync support.
#     Use this instead of direct DELETE in your code.
#     """
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     # Get data before deletion for sync
#     cursor.execute(f"SELECT * FROM {table_name} WHERE id = ?", (record_id,))
#     data = dict(cursor.fetchone()) if cursor.fetchone() else {'id': record_id}
    
#     cursor.execute(f"DELETE FROM {table_name} WHERE id = ?", (record_id,))
    
#     conn.commit()
#     conn.close()
    
#     # Trigger sync
#     if _sync_scheduler:
#         _sync_scheduler.on_data_change(table_name, record_id, 'DELETE', data)
    
#     return True










# # app/sync/sync_integration.py
# import logging
# from app.sync.school_sync_scheduler import SchoolSyncScheduler
# from app.activation.state import get_db_connection

# logger = logging.getLogger(__name__)

# _sync_scheduler = None

# def get_cloud_config_from_global_settings():
#     """Get cloud configuration from global settings"""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT db_connection_string, db_api_key, db_name, db_type, 
#                    sync_enabled, enable_sync_module
#             FROM global_system_settings WHERE id = 1
#         """)
#         result = cursor.fetchone()
#         conn.close()
        
#         if not result:
#             logger.warning("Global settings not found")
#             return None
        
#         settings = dict(result)
        
#         # Check if sync module is enabled
#         if not settings.get('enable_sync_module') or not settings.get('sync_enabled'):
#             logger.info("Sync module is disabled in global settings")
#             return None
        
#         # Check if connection string is provided
#         if not settings.get('db_connection_string'):
#             logger.warning("Database connection string not configured in global settings")
#             return None
        
#         return {
#             'connection_string': settings.get('db_connection_string'),
#             'api_key': settings.get('db_api_key'),
#             'db_name': settings.get('db_name'),
#             'db_type': settings.get('db_type')
#         }
        
#     except Exception as e:
#         logger.error(f"Error getting cloud config: {e}")
#         return None

# def init_sync_system():
#     """Initialize the sync system only if enabled in global settings"""
#     global _sync_scheduler
    
#     # Get cloud configuration from global settings
#     cloud_config = get_cloud_config_from_global_settings()
    
#     if not cloud_config:
#         logger.info("Sync module not enabled or not configured. Skipping initialization.")
#         return None
    
#     if _sync_scheduler is None:
#         connection_string = cloud_config['connection_string']
#         api_key = cloud_config.get('api_key')
        
#         _sync_scheduler = SchoolSyncScheduler(connection_string, api_key)
#         _sync_scheduler.start()
#         logger.info(f"Sync system initialized with connection: {cloud_config['db_name']}")
    
#     return _sync_scheduler

# def stop_sync_system():
#     """Stop the sync system"""
#     global _sync_scheduler
#     if _sync_scheduler:
#         _sync_scheduler.stop()
#         _sync_scheduler = None
#         logger.info("Sync system stopped")

# def get_sync_scheduler():
#     """Get the global sync scheduler instance"""
#     global _sync_scheduler
#     return _sync_scheduler

# def is_sync_enabled() -> bool:
#     """Check if sync is enabled in global settings"""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("""
#             SELECT sync_enabled, enable_sync_module, db_connection_string 
#             FROM global_system_settings WHERE id = 1
#         """)
#         result = cursor.fetchone()
#         conn.close()
        
#         if not result:
#             return False
        
#         return bool(result['sync_enabled']) and bool(result['enable_sync_module']) and bool(result['db_connection_string'])
        
#     except Exception as e:
#         logger.error(f"Error checking sync enabled: {e}")
#         return False

# def refresh_sync_system():
#     """Refresh the sync system when settings change"""
#     global _sync_scheduler
    
#     # Stop existing sync if running
#     if _sync_scheduler:
#         stop_sync_system()
    
#     # Start new sync if enabled
#     return init_sync_system()





# app/sync/sync_integration.py
import logging
from app.sync.school_sync_scheduler import SchoolSyncScheduler
from app.activation.state import get_db_connection
from datetime import datetime

logger = logging.getLogger(__name__)

_sync_scheduler = None

def get_cloud_config_from_global_settings():
    """Get cloud configuration from global settings"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT db_connection_string, db_api_key, db_name, db_type, 
                   sync_enabled, enable_sync_module
            FROM global_system_settings WHERE id = 1
        """)
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            logger.warning("Global settings not found")
            return None
        
        settings = dict(result)
        
        # Check if sync module is enabled
        if not settings.get('enable_sync_module') or not settings.get('sync_enabled'):
            logger.info("Sync module is disabled in global settings")
            return None
        
        # Check if connection string is provided
        if not settings.get('db_connection_string'):
            logger.warning("Database connection string not configured in global settings")
            return None
        
        connection_string = settings.get('db_connection_string')
        api_key = settings.get('db_api_key')
        db_name = settings.get('db_name')
        db_type = settings.get('db_type', 'sqlitecloud')
        
        # Format connection string with database name if needed
        if db_name and db_type == 'sqlitecloud':
            # For SQLite Cloud, ensure the database name is in the connection string
            if '/synctest' in connection_string:
                # Replace existing database name
                connection_string = connection_string.replace('/synctest', f'/{db_name}')
            elif db_name not in connection_string:
                # Add database name to connection string
                if '?apikey=' in connection_string:
                    parts = connection_string.split('?')
                    connection_string = f"{parts[0]}/{db_name}?{parts[1]}"
                else:
                    connection_string = f"{connection_string}/{db_name}"
        
        logger.info(f"Cloud config loaded: db_name={db_name}, db_type={db_type}")
        
        return {
            'connection_string': connection_string,
            'api_key': api_key,
            'db_name': db_name,
            'db_type': db_type
        }
        
    except Exception as e:
        logger.error(f"Error getting cloud config: {e}")
        return None

def init_sync_system():
    """Initialize the sync system only if enabled in global settings"""
    global _sync_scheduler
    
    # Get cloud configuration from global settings
    cloud_config = get_cloud_config_from_global_settings()
    
    if not cloud_config:
        logger.info("Sync module not enabled or not configured. Skipping initialization.")
        return None
    
    if _sync_scheduler is None:
        connection_string = cloud_config['connection_string']
        api_key = cloud_config.get('api_key')
        db_name = cloud_config.get('db_name')
        
        try:
            logger.info(f"Initializing sync system with database: {db_name}")
            _sync_scheduler = SchoolSyncScheduler(connection_string, api_key)
            _sync_scheduler.start()
            logger.info(f"✅ Sync system initialized successfully with connection: {connection_string}")
            
            # Update sync status in global settings
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE global_system_settings 
                SET sync_status = 'active',
                    sync_last_attempt = ?,
                    updated_at = ?
                WHERE id = 1
            """, (datetime.now().isoformat(), datetime.now().isoformat()))
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to initialize sync system: {e}")
            # Update error status
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE global_system_settings 
                SET sync_status = 'error',
                    sync_last_error = ?,
                    updated_at = ?
                WHERE id = 1
            """, (str(e), datetime.now().isoformat()))
            conn.commit()
            conn.close()
            return None
    
    return _sync_scheduler

def stop_sync_system():
    """Stop the sync system"""
    global _sync_scheduler
    if _sync_scheduler:
        _sync_scheduler.stop()
        _sync_scheduler = None
        logger.info("Sync system stopped")
        
        # Update sync status in global settings
        try:
            from datetime import datetime
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE global_system_settings 
                SET sync_status = 'disabled',
                    updated_at = ?
                WHERE id = 1
            """, (datetime.now().isoformat(),))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error updating sync status: {e}")

def get_sync_scheduler():
    """Get the global sync scheduler instance"""
    global _sync_scheduler
    return _sync_scheduler

def is_sync_enabled() -> bool:
    """Check if sync is enabled in global settings"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT sync_enabled, enable_sync_module, db_connection_string 
            FROM global_system_settings WHERE id = 1
        """)
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return False
        
        enabled = bool(result['sync_enabled']) and bool(result['enable_sync_module']) and bool(result['db_connection_string'])
        logger.debug(f"Sync enabled check: {enabled}")
        return enabled
        
    except Exception as e:
        logger.error(f"Error checking sync enabled: {e}")
        return False

def refresh_sync_system():
    """Refresh the sync system when settings change"""
    global _sync_scheduler
    
    logger.info("Refreshing sync system...")
    
    # Stop existing sync if running
    if _sync_scheduler:
        stop_sync_system()
    
    # Start new sync if enabled
    result = init_sync_system()
    
    if result:
        logger.info("✅ Sync system refreshed successfully")
    else:
        logger.info("Sync system not configured or disabled after refresh")
    
    return result

def get_sync_status():
    """Get current sync status from global settings"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT sync_status, sync_last_attempt, sync_last_success, sync_last_error,
                   db_name, db_type, sync_enabled, enable_sync_module
            FROM global_system_settings WHERE id = 1
        """)
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return {
                'status': 'unknown',
                'message': 'Global settings not found'
            }
        
        return dict(result)
        
    except Exception as e:
        logger.error(f"Error getting sync status: {e}")
        return {'status': 'error', 'message': str(e)}