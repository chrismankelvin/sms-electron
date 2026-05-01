# app/sync/sync_integration.py
"""
Integration module that hooks into your existing database functions
to add sync capabilities without breaking existing code
"""
import functools
from typing import Dict, Any
from app.activation.state import get_db_connection
from app.sync.school_sync_scheduler import SchoolSyncScheduler
from datetime import datetime

# Global sync scheduler instance
_sync_scheduler = None

def init_sync_system(cloud_connection_string: str, cloud_api_key: str):
    """Initialize the sync system (call once at app startup)"""
    global _sync_scheduler
    _sync_scheduler = SchoolSyncScheduler(cloud_connection_string, cloud_api_key)
    _sync_scheduler.start()
    return _sync_scheduler

def get_sync_scheduler():
    """Get the global sync scheduler instance"""
    return _sync_scheduler

# ========== Decorator for automatic sync on write operations ==========

def sync_on_write(table_name: str):
    """
    Decorator that automatically queues sync operations after database writes.
    Use this to decorate your existing write functions.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Execute the original function
            result = func(*args, **kwargs)
            
            # Extract record info from result or kwargs
            record_id = kwargs.get('record_id') or (result if isinstance(result, (int, str)) else None)
            data = kwargs.get('data', {})
            operation = kwargs.get('operation', 'UPDATE')
            
            # Queue for sync
            if _sync_scheduler and record_id:
                _sync_scheduler.on_data_change(table_name, str(record_id), operation, data)
            
            return result
        return wrapper
    return decorator

# ========== Patched versions of your database functions ==========

def synced_insert(table_name: str, data: Dict) -> int:
    """
    Insert with sync support.
    Use this instead of direct INSERT in your code.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Add version and sync metadata
    data['version'] = data.get('version', 1)
    data['synced_at'] = None
    data['updated_by_sync'] = 0
    
    columns = ', '.join(data.keys())
    placeholders = ', '.join(['?' for _ in data])
    
    cursor.execute(f"""
        INSERT INTO {table_name} ({columns})
        VALUES ({placeholders})
    """, list(data.values()))
    
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Trigger sync
    if _sync_scheduler:
        _sync_scheduler.on_data_change(table_name, str(record_id), 'INSERT', data)
    
    return record_id

def synced_update(table_name: str, record_id: str, data: Dict) -> bool:
    """
    Update with sync support.
    Use this instead of direct UPDATE in your code.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Increment version
    cursor.execute(f"SELECT version FROM {table_name} WHERE id = ?", (record_id,))
    current = cursor.fetchone()
    new_version = (current['version'] if current else 0) + 1
    
    data['version'] = new_version
    data['updated_at'] = datetime.now().isoformat()
    
    set_clause = ', '.join([f"{k}=?" for k in data.keys() if k != 'id'])
    
    cursor.execute(f"""
        UPDATE {table_name}
        SET {set_clause}
        WHERE id = ?
    """, list(data.values()) + [record_id])
    
    conn.commit()
    conn.close()
    
    # Trigger sync
    if _sync_scheduler:
        _sync_scheduler.on_data_change(table_name, record_id, 'UPDATE', data)
    
    return True

def synced_delete(table_name: str, record_id: str) -> bool:
    """
    Delete with sync support.
    Use this instead of direct DELETE in your code.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get data before deletion for sync
    cursor.execute(f"SELECT * FROM {table_name} WHERE id = ?", (record_id,))
    data = dict(cursor.fetchone()) if cursor.fetchone() else {'id': record_id}
    
    cursor.execute(f"DELETE FROM {table_name} WHERE id = ?", (record_id,))
    
    conn.commit()
    conn.close()
    
    # Trigger sync
    if _sync_scheduler:
        _sync_scheduler.on_data_change(table_name, record_id, 'DELETE', data)
    
    return True