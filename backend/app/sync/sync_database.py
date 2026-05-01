# # app/sync/sync_database.py
# import sqlite3
# import json
# import hashlib
# from datetime import datetime
# from typing import List, Dict, Any, Optional
# from pathlib import Path
# from app.activation.state import get_db_connection

# class SyncDatabaseWrapper:
#     """Wrapper for your encrypted database with sync capabilities"""
    
#     def __init__(self):
#         self.sync_queue_table = "sync_queue"
#         self.sync_metadata_table = "sync_metadata"
#         self._ensure_sync_tables()
#         self._setup_triggers()
    
#     def _ensure_sync_tables(self):
#         """Add sync-specific tables to your encrypted database"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Sync Queue Table
#         cursor.execute(f"""
#             CREATE TABLE IF NOT EXISTS {self.sync_queue_table} (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 table_name TEXT NOT NULL,
#                 record_id TEXT NOT NULL,
#                 operation TEXT NOT NULL,
#                 data TEXT,
#                 synced BOOLEAN DEFAULT 0,
#                 retry_count INTEGER DEFAULT 0,
#                 last_error TEXT,
#                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#             )
#         """)
        
#         # Index for performance
#         cursor.execute(f"""
#             CREATE INDEX IF NOT EXISTS idx_sync_queue_pending 
#             ON {self.sync_queue_table}(synced, created_at)
#         """)
        
#         # Sync Metadata Table
#         cursor.execute(f"""
#             CREATE TABLE IF NOT EXISTS {self.sync_metadata_table} (
#                 key TEXT PRIMARY KEY,
#                 value TEXT,
#                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#             )
#         """)
        
#         conn.commit()
#         conn.close()
    
#     def _setup_triggers(self):
#         """Set up SQLite triggers to automatically capture changes"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # List of tables to monitor for changes
#         monitored_tables = [
#             'students', 'staff', 'users', 'classes', 'sections', 
#             'academic_years', 'subjects', 'assessments', 'terms',
#             'student_scores', 'attendance', 'teaching_assistants', 'non_staff'
#         ]
        
#         for table in monitored_tables:
#             # Check if table exists
#             cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
#             if cursor.fetchone():
#                 # Drop existing triggers if they exist
#                 cursor.execute(f"DROP TRIGGER IF EXISTS trigger_{table}_insert")
#                 cursor.execute(f"DROP TRIGGER IF EXISTS trigger_{table}_update")
#                 cursor.execute(f"DROP TRIGGER IF EXISTS trigger_{table}_delete")
                
#                 # Create INSERT trigger
#                 cursor.execute(f"""
#                     CREATE TRIGGER IF NOT EXISTS trigger_{table}_insert
#                     AFTER INSERT ON {table}
#                     BEGIN
#                         INSERT INTO sync_queue (table_name, record_id, operation, data, created_at)
#                         VALUES (
#                             '{table}',
#                             NEW.id,
#                             'INSERT',
#                             json_object(
#                                 'id', NEW.id,
#                                 'version', COALESCE(NEW.version, 1),
#                                 'data', 'inserted'
#                             ),
#                             CURRENT_TIMESTAMP
#                         );
#                     END
#                 """)
                
#                 # Create UPDATE trigger
#                 cursor.execute(f"""
#                     CREATE TRIGGER IF NOT EXISTS trigger_{table}_update
#                     AFTER UPDATE ON {table}
#                     WHEN OLD.version != NEW.version OR NEW.updated_by_sync = 0
#                     BEGIN
#                         INSERT INTO sync_queue (table_name, record_id, operation, data, created_at)
#                         VALUES (
#                             '{table}',
#                             NEW.id,
#                             'UPDATE',
#                             json_object(
#                                 'id', NEW.id,
#                                 'version', NEW.version,
#                                 'data', 'updated'
#                             ),
#                             CURRENT_TIMESTAMP
#                         );
#                     END
#                 """)
                
#                 # Create DELETE trigger
#                 cursor.execute(f"""
#                     CREATE TRIGGER IF NOT EXISTS trigger_{table}_delete
#                     AFTER DELETE ON {table}
#                     BEGIN
#                         INSERT INTO sync_queue (table_name, record_id, operation, data, created_at)
#                         VALUES (
#                             '{table}',
#                             OLD.id,
#                             'DELETE',
#                             json_object(
#                                 'id', OLD.id,
#                                 'version', OLD.version,
#                                 'data', 'deleted'
#                             ),
#                             CURRENT_TIMESTAMP
#                         );
#                     END
#                 """)
        
#         conn.commit()
#         conn.close()
#         print("✅ Database triggers set up for automatic sync capture")
    
#     def add_to_sync_queue(self, table_name: str, record_id: str, 
#                           operation: str, data: Dict = None) -> int:
#         """Manually add operation to sync queue (fallback)"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute(f"""
#             INSERT INTO {self.sync_queue_table} 
#             (table_name, record_id, operation, data)
#             VALUES (?, ?, ?, ?)
#         """, (table_name, str(record_id), operation, json.dumps(data) if data else None))
        
#         conn.commit()
#         queue_id = cursor.lastrowid
#         conn.close()
#         return queue_id
    
#     def get_pending_syncs(self, limit: int = 50) -> List[Dict]:
#         """Get pending sync operations"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute(f"""
#             SELECT id, table_name, record_id, operation, data, retry_count, created_at
#             FROM {self.sync_queue_table}
#             WHERE synced = 0
#             ORDER BY created_at ASC
#             LIMIT ?
#         """, (limit,))
        
#         results = [dict(row) for row in cursor.fetchall()]
#         conn.close()
#         return results
    
#     def get_pending_syncs_count(self) -> int:
#         """Get count of pending sync operations"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute(f"""
#             SELECT COUNT(*) as count FROM {self.sync_queue_table} WHERE synced = 0
#         """)
        
#         result = cursor.fetchone()
#         conn.close()
#         return result['count'] if result else 0
    
#     def mark_synced(self, queue_id: int, success: bool = True, error: str = None):
#         """Mark queue item as synced or failed"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         if success:
#             cursor.execute(f"""
#                 UPDATE {self.sync_queue_table}
#                 SET synced = 1, updated_at = CURRENT_TIMESTAMP
#                 WHERE id = ?
#             """, (queue_id,))
#         else:
#             cursor.execute(f"""
#                 UPDATE {self.sync_queue_table}
#                 SET retry_count = retry_count + 1,
#                     last_error = ?,
#                     updated_at = CURRENT_TIMESTAMP
#                 WHERE id = ?
#             """, (error, queue_id))
        
#         conn.commit()
#         conn.close()
    
#     def has_pending_changes(self) -> bool:
#         """Check if there are pending sync operations"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute(f"""
#             SELECT COUNT(*) as count FROM {self.sync_queue_table} WHERE synced = 0
#         """)
#         count = cursor.fetchone()['count']
#         conn.close()
#         return count > 0
    
#     def get_last_sync_version(self, table_name: str = None) -> int:
#         """Get last sync version for a table or globally"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         key = f"last_sync_version_{table_name}" if table_name else "last_sync_version_global"
        
#         cursor.execute(f"""
#             SELECT value FROM {self.sync_metadata_table} WHERE key = ?
#         """, (key,))
        
#         result = cursor.fetchone()
#         conn.close()
#         return int(result['value']) if result else 0
    
#     def update_last_sync_version(self, version: int, table_name: str = None):
#         """Update last sync version"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         key = f"last_sync_version_{table_name}" if table_name else "last_sync_version_global"
        
#         cursor.execute(f"""
#             INSERT OR REPLACE INTO {self.sync_metadata_table} (key, value, updated_at)
#             VALUES (?, ?, CURRENT_TIMESTAMP)
#         """, (key, str(version)))
        
#         conn.commit()
#         conn.close()
    
#     def get_record_by_id(self, table_name: str, record_id: str) -> Optional[Dict]:
#         """Get a record by ID from any table"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         try:
#             cursor.execute(f"SELECT * FROM {table_name} WHERE id = ?", (record_id,))
#             result = cursor.fetchone()
#             conn.close()
#             return dict(result) if result else None
#         except sqlite3.OperationalError:
#             conn.close()
#             return None
    
#     def upsert_record(self, table_name: str, record: Dict, version: int) -> bool:
#         """Insert or update record with version conflict resolution"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         try:
#             # Check current version
#             cursor.execute(f"SELECT version FROM {table_name} WHERE id = ?", (record.get('id'),))
#             current = cursor.fetchone()
            
#             # Higher version wins (cloud version > local version)
#             if current and version <= current['version']:
#                 conn.close()
#                 return False  # Skip update, cloud version is older
            
#             # Add version and sync metadata
#             record['version'] = version
#             record['updated_by_sync'] = 1
#             record['synced_at'] = datetime.now().isoformat()
            
#             # Build upsert query
#             columns = ', '.join(record.keys())
#             placeholders = ', '.join(['?' for _ in record])
            
#             # Handle conflict
#             updates = ', '.join([f"{k}=excluded.{k}" for k in record.keys() if k != 'id'])
            
#             query = f"""
#                 INSERT INTO {table_name} ({columns})
#                 VALUES ({placeholders})
#                 ON CONFLICT(id) DO UPDATE SET {updates}
#             """
            
#             cursor.execute(query, list(record.values()))
#             conn.commit()
#             conn.close()
#             return True
            
#         except Exception as e:
#             print(f"Error upserting into {table_name}: {e}")
#             conn.close()
#             return False
    
#     def clear_synced_queue(self):
#         """Clear already synced items from queue"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute(f"DELETE FROM {self.sync_queue_table} WHERE synced = 1")
#         deleted = cursor.rowcount
#         conn.commit()
#         conn.close()
#         return deleted







# app/sync/sync_database.py
import sqlite3
import json
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.activation.state import get_db_connection

class SyncDatabaseWrapper:
    """Wrapper for your encrypted database with sync capabilities"""
    
    def __init__(self):
        self.sync_queue_table = "sync_queue"
        self.sync_metadata_table = "sync_metadata"
        self._ensure_sync_tables()
        self._setup_triggers()
    
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
        
        # Sync Metadata Table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.sync_metadata_table} (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _setup_triggers(self):
        """Set up SQLite triggers to automatically capture changes for ALL tables"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Complete list of ALL tables to monitor for changes
        monitored_tables = [
            # Core tables
            'users',
            'school_info',
            'person_details',
            
            # Academic tables
            'students',
            'staff',
            'teaching_assistants',
            'non_staff',
            'academic_years',
            'terms',
            
            # Structure tables
            'levels',
            'programmes',
            'classes',
            'sections',
            
            # Subjects & Assignments
            'subjects',
            'level_core_subjects',
            'programme_subjects',
            'teacher_qualifications',
            'teacher_subject_assignments',
            
            # Timetable
            'week_days',
            'time_slots',
            'timetables',
            
            # Grades & Assessments
            'grade_boundaries',
            'assessments',
            'student_scores',
            
            # Results
            'student_subject_results',
            'student_term_results',
            
            # History & Tracking
            'student_class_history',
            'student_promotions',
            
            # Attendance
            'attendance',
            
            # Device & Activation

            
            # Recovery
            'recovery_logs',
            
            # System
            'system_settings'
        ]
        
        for table in monitored_tables:
            # Check if table exists
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone():
                # Drop existing triggers if they exist
                cursor.execute(f"DROP TRIGGER IF EXISTS trigger_{table}_insert")
                cursor.execute(f"DROP TRIGGER IF EXISTS trigger_{table}_update")
                cursor.execute(f"DROP TRIGGER IF EXISTS trigger_{table}_delete")
                
                # Create INSERT trigger
                cursor.execute(f"""
                    CREATE TRIGGER IF NOT EXISTS trigger_{table}_insert
                    AFTER INSERT ON {table}
                    BEGIN
                        INSERT INTO sync_queue (table_name, record_id, operation, data, created_at)
                        VALUES (
                            '{table}',
                            NEW.id,
                            'INSERT',
                            json_object(
                                'id', NEW.id,
                                'version', COALESCE(NEW.version, 1)
                            ),
                            CURRENT_TIMESTAMP
                        );
                    END
                """)
                
                # Create UPDATE trigger (skip if updated by sync to avoid loops)
                cursor.execute(f"""
                    CREATE TRIGGER IF NOT EXISTS trigger_{table}_update
                    AFTER UPDATE ON {table}
                    WHEN (OLD.version != NEW.version OR NEW.updated_by_sync = 0 OR NEW.updated_by_sync IS NULL)
                    BEGIN
                        INSERT INTO sync_queue (table_name, record_id, operation, data, created_at)
                        VALUES (
                            '{table}',
                            NEW.id,
                            'UPDATE',
                            json_object(
                                'id', NEW.id,
                                'version', NEW.version,
                                'old_version', OLD.version
                            ),
                            CURRENT_TIMESTAMP
                        );
                    END
                """)
                
                # Create DELETE trigger
                cursor.execute(f"""
                    CREATE TRIGGER IF NOT EXISTS trigger_{table}_delete
                    AFTER DELETE ON {table}
                    BEGIN
                        INSERT INTO sync_queue (table_name, record_id, operation, data, created_at)
                        VALUES (
                            '{table}',
                            OLD.id,
                            'DELETE',
                            json_object(
                                'id', OLD.id,
                                'version', OLD.version
                            ),
                            CURRENT_TIMESTAMP
                        );
                    END
                """)
                
                print(f"✅ Triggers set up for table: {table}")
            else:
                print(f"⚠️ Table {table} does not exist, skipping triggers")
        
        conn.commit()
        conn.close()
        print(f"🎯 Database triggers set up for {len(monitored_tables)} tables")
    
    def add_to_sync_queue(self, table_name: str, record_id: str, 
                          operation: str, data: Dict = None) -> int:
        """Manually add operation to sync queue (fallback)"""
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
            SELECT id, table_name, record_id, operation, data, retry_count, created_at
            FROM {self.sync_queue_table}
            WHERE synced = 0
            ORDER BY created_at ASC
            LIMIT ?
        """, (limit,))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
    
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
    
    def clear_synced_queue(self):
        """Clear already synced items from queue"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(f"DELETE FROM {self.sync_queue_table} WHERE synced = 1")
        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        return deleted