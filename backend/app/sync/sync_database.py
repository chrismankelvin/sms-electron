# app/sync/sync_database.py
import sqlite3
import json
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.activation.state import get_db_connection, ensure_all_tables

class SyncDatabaseWrapper:
    """Wrapper for your encrypted database with sync capabilities"""
    
    def __init__(self):
        self.sync_queue_table = "sync_queue"
        self.sync_metadata_table = "sync_metadata"
        self._ensure_sync_tables()
    
    def _ensure_sync_tables(self):
        """Add sync-specific tables to your encrypted database"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Sync Queue Table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.sync_queue_table} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                record_id TEXT NOT NULL,
                operation TEXT NOT NULL,
                data TEXT,
                synced BOOLEAN DEFAULT 0,
                retry_count INTEGER DEFAULT 0,
                last_error TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Index for performance
        cursor.execute(f"""
            CREATE INDEX IF NOT EXISTS idx_sync_queue_pending 
            ON {self.sync_queue_table}(synced, created_at)
        """)
        
        # Sync Metadata Table (tracks what's been synced)
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.sync_metadata_table} (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Add version columns to existing tables if missing
        self._add_version_columns(cursor)
        
        conn.commit()
        conn.close()
    
    def _add_version_columns(self, cursor):
        """Add version tracking columns to existing tables for conflict resolution"""
        tables_with_version = ['students', 'staff', 'users', 'classes', 'sections', 
                                'academic_years', 'subjects', 'assessments']
        
        for table in tables_with_version:
            try:
                cursor.execute(f"""
                    SELECT version FROM {table} LIMIT 1
                """)
            except sqlite3.OperationalError:
                # Column doesn't exist, add it
                try:
                    cursor.execute(f"""
                        ALTER TABLE {table} ADD COLUMN version INTEGER DEFAULT 1
                    """)
                    cursor.execute(f"""
                        ALTER TABLE {table} ADD COLUMN synced_at TIMESTAMP
                    """)
                    cursor.execute(f"""
                        ALTER TABLE {table} ADD COLUMN updated_by_sync BOOLEAN DEFAULT 0
                    """)
                except sqlite3.OperationalError:
                    pass  # Column might already exist
    
    def add_to_sync_queue(self, table_name: str, record_id: str, 
                          operation: str, data: Dict = None) -> int:
        """Add operation to sync queue"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(f"""
            INSERT INTO {self.sync_queue_table} 
            (table_name, record_id, operation, data)
            VALUES (?, ?, ?, ?)
        """, (table_name, str(record_id), operation, json.dumps(data) if data else None))
        
        conn.commit()
        queue_id = cursor.lastrowid
        conn.close()
        return queue_id
    
    def get_pending_syncs(self, limit: int = 50) -> List[Dict]:
        """Get pending sync operations"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(f"""
            SELECT id, table_name, record_id, operation, data, retry_count
            FROM {self.sync_queue_table}
            WHERE synced = 0
            ORDER BY created_at ASC
            LIMIT ?
        """, (limit,))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
    
    def mark_synced(self, queue_id: int, success: bool = True, error: str = None):
        """Mark queue item as synced or failed"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if success:
            cursor.execute(f"""
                UPDATE {self.sync_queue_table}
                SET synced = 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (queue_id,))
        else:
            cursor.execute(f"""
                UPDATE {self.sync_queue_table}
                SET retry_count = retry_count + 1,
                    last_error = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (error, queue_id))
        
        conn.commit()
        conn.close()
    
    def has_pending_changes(self) -> bool:
        """Check if there are pending sync operations"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(f"""
            SELECT COUNT(*) as count FROM {self.sync_queue_table} WHERE synced = 0
        """)
        count = cursor.fetchone()['count']
        conn.close()
        return count > 0
    
    def get_last_sync_version(self, table_name: str = None) -> int:
        """Get last sync version for a table or globally"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        key = f"last_sync_version_{table_name}" if table_name else "last_sync_version_global"
        
        cursor.execute(f"""
            SELECT value FROM {self.sync_metadata_table} WHERE key = ?
        """, (key,))
        
        result = cursor.fetchone()
        conn.close()
        return int(result['value']) if result else 0
    
    def update_last_sync_version(self, version: int, table_name: str = None):
        """Update last sync version"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        key = f"last_sync_version_{table_name}" if table_name else "last_sync_version_global"
        
        cursor.execute(f"""
            INSERT OR REPLACE INTO {self.sync_metadata_table} (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """, (key, str(version)))
        
        conn.commit()
        conn.close()
    
    def get_record_by_id(self, table_name: str, record_id: str) -> Optional[Dict]:
        """Get a record by ID from any table"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(f"SELECT * FROM {table_name} WHERE id = ?", (record_id,))
            result = cursor.fetchone()
            conn.close()
            return dict(result) if result else None
        except sqlite3.OperationalError:
            conn.close()
            return None
    
    def upsert_record(self, table_name: str, record: Dict, version: int) -> bool:
        """Insert or update record with version conflict resolution"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Check current version
            cursor.execute(f"SELECT version FROM {table_name} WHERE id = ?", (record.get('id'),))
            current = cursor.fetchone()
            
            # Higher version wins (cloud version > local version)
            if current and version <= current['version']:
                conn.close()
                return False  # Skip update, cloud version is older
            
            # Add version and sync metadata
            record['version'] = version
            record['updated_by_sync'] = 1
            record['synced_at'] = datetime.now().isoformat()
            
            # Build upsert query
            columns = ', '.join(record.keys())
            placeholders = ', '.join(['?' for _ in record])
            
            # Handle conflict
            updates = ', '.join([f"{k}=excluded.{k}" for k in record.keys() if k != 'id'])
            
            query = f"""
                INSERT INTO {table_name} ({columns})
                VALUES ({placeholders})
                ON CONFLICT(id) DO UPDATE SET {updates}
            """
            
            cursor.execute(query, list(record.values()))
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error upserting into {table_name}: {e}")
            conn.close()
            return False

    def get_pending_syncs_count(self) -> int:
        """Get count of pending sync operations"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(f"""
            SELECT COUNT(*) as count FROM {self.sync_queue_table} WHERE synced = 0
        """)
        
        result = cursor.fetchone()
        conn.close()
        return result['count'] if result else 0
    


    def get_pending_syncs_count(self) -> int:
        """Get count of pending sync operations"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(f"""
            SELECT COUNT(*) as count FROM {self.sync_queue_table} WHERE synced = 0
        """)
        
        result = cursor.fetchone()
        conn.close()
        return result['count'] if result else 0

        
    def execute_write_operation(self, operation: str, table_name: str, data: Dict) -> bool:
        """Execute a write operation locally and queue for sync"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            if operation == 'INSERT':
                columns = ', '.join(data.keys())
                placeholders = ', '.join(['?' for _ in data])
                cursor.execute(f"""
                    INSERT INTO {table_name} ({columns})
                    VALUES ({placeholders})
                """, list(data.values()))
                
            elif operation == 'UPDATE':
                set_clause = ', '.join([f"{k}=?" for k in data.keys() if k != 'id'])
                cursor.execute(f"""
                    UPDATE {table_name}
                    SET {set_clause}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, list(data.values()) + [data.get('id')])
                
            elif operation == 'DELETE':
                cursor.execute(f"DELETE FROM {table_name} WHERE id = ?", (data.get('id'),))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error executing {operation} on {table_name}: {e}")
            conn.close()
            return False