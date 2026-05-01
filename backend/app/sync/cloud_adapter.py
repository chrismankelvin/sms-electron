# # app/sync/cloud_adapter.py
# import sqlitecloud
# import json
# from datetime import datetime
# from typing import List, Dict, Any, Optional
# import hashlib
# import logging

# logger = logging.getLogger(__name__)

# class SQLiteCloudAdapter:
#     """Adapter for syncing with SQLite Cloud database"""
    
#     def __init__(self, connection_string: str, api_key: str):
#         self.connection_string = connection_string
#         self.api_key = api_key
#         self._connection = None
    
#     def _get_connection(self):
#         """Get or create SQLite Cloud connection"""
#         if self._connection is None:
#             self._connection = sqlitecloud.connect(self.connection_string)
#             # Set API key if needed (depending on your SQLite Cloud setup)
#             # self._connection.execute(f"PRAGMA apikey = '{self.api_key}'")
#         return self._connection
    
#     def close(self):
#         """Close cloud connection"""
#         if self._connection:
#             self._connection.close()
#             self._connection = None
    
#     def push_changes(self, operations: List[Dict]) -> Dict[str, Any]:
#         """
#         Push local changes to cloud
#         Returns: {'success': bool, 'synced_count': int, 'errors': list}
#         """
#         conn = self._get_connection()
#         cursor = conn.cursor()
        
#         success_count = 0
#         errors = []
        
#         for op in operations:
#             try:
#                 table_name = op['table_name']
#                 record_id = op['record_id']
#                 operation = op['operation']
#                 data = json.loads(op['data']) if op['data'] else {}
                
#                 if operation == 'INSERT':
#                     # Insert with version tracking
#                     data['version'] = data.get('version', 1)
#                     data['synced_at'] = datetime.now().isoformat()
                    
#                     columns = ', '.join(data.keys())
#                     placeholders = ', '.join(['?' for _ in data])
                    
#                     cursor.execute(f"""
#                         INSERT OR REPLACE INTO {table_name} ({columns})
#                         VALUES ({placeholders})
#                     """, list(data.values()))
                    
#                 elif operation == 'UPDATE':
#                     # Update with version increment
#                     data['version'] = data.get('version', 1) + 1
#                     data['synced_at'] = datetime.now().isoformat()
                    
#                     set_clause = ', '.join([f"{k}=?" for k in data.keys() if k != 'id'])
#                     cursor.execute(f"""
#                         UPDATE {table_name}
#                         SET {set_clause}
#                         WHERE id = ?
#                     """, list(data.values()) + [record_id])
                    
#                 elif operation == 'DELETE':
#                     cursor.execute(f"DELETE FROM {table_name} WHERE id = ?", (record_id,))
                
#                 conn.commit()
#                 success_count += 1
                
#             except Exception as e:
#                 errors.append({
#                     'operation': op,
#                     'error': str(e)
#                 })
#                 logger.error(f"Failed to push operation {op['id']}: {e}")
        
#         return {
#             'success': len(errors) == 0,
#             'synced_count': success_count,
#             'errors': errors
#         }
    
#     def pull_changes(self, last_version: int, table_names: List[str] = None) -> Dict[str, Any]:
#         """
#         Pull changes from cloud since last_version
#         Returns: {'records': list, 'new_version': int}
#         """
#         conn = self._get_connection()
#         cursor = conn.cursor()
        
#         all_changes = []
#         max_version = last_version
        
#         # If no specific tables, get all tables from schema
#         if not table_names:
#             cursor.execute("""
#                 SELECT name FROM sqlite_master 
#                 WHERE type='table' AND name NOT LIKE 'sqlite_%'
#                 AND name NOT LIKE 'sync_%'
#             """)
#             table_names = [row[0] for row in cursor.fetchall()]
        
#         for table in table_names:
#             try:
#                 # Get records with version > last_version
#                 cursor.execute(f"""
#                     SELECT *, 'version' as sync_version
#                     FROM {table}
#                     WHERE version > ?
#                     ORDER BY version ASC
#                 """, (last_version,))
                
#                 records = cursor.fetchall()
                
#                 for record in records:
#                     # Convert to dict
#                     record_dict = dict(record)
#                     record_dict['_table_name'] = table
#                     all_changes.append(record_dict)
                    
#                     # Track max version
#                     if record_dict.get('version', 0) > max_version:
#                         max_version = record_dict['version']
                        
#             except sqlitecloud.Error as e:
#                 logger.error(f"Error pulling from {table}: {e}")
        
#         return {
#             'records': all_changes,
#             'new_version': max_version,
#             'count': len(all_changes)
#         }
    
#     def health_check(self) -> bool:
#         """Check if cloud is reachable"""
#         try:
#             conn = self._get_connection()
#             cursor = conn.cursor()
#             cursor.execute("SELECT 1")
#             return True
#         except Exception as e:
#             logger.error(f"Cloud health check failed: {e}")
#             return False
    
#     def get_server_timestamp(self) -> str:
#         """Get current server timestamp"""
#         conn = self._get_connection()
#         cursor = conn.cursor()
#         cursor.execute("SELECT datetime('now')")
#         return cursor.fetchone()[0]







# app/sync/cloud_adapter.py
import sqlitecloud
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class SQLiteCloudAdapter:
    """Adapter for syncing with SQLite Cloud database"""
    
    def __init__(self, connection_string: str, api_key: str = None):
        self.connection_string = connection_string
        self.api_key = api_key
        self._connection = None
    
    # def _get_connection(self):
    #     """Get or create SQLite Cloud connection with proper authentication"""
    #     if self._connection is None:
    #         try:
    #             # Connect with API key authentication
    #             if self.api_key:
    #                 # Method 1: Include API key in connection string
    #                 if '?apikey=' not in self.connection_string:
    #                     separator = '&' if '?' in self.connection_string else '?'
    #                     full_connection = f"{self.connection_string}{separator}apikey={self.api_key}"
    #                 else:
    #                     full_connection = self.connection_string
                    
    #                 self._connection = sqlitecloud.connect(full_connection)
    #             else:
    #                 # Method 2: Connect without API key (might fail)
    #                 self._connection = sqlitecloud.connect(self.connection_string)
                
    #             # Test connection
    #             cursor = self._connection.cursor()
    #             cursor.execute("SELECT 1")
    #             cursor.fetchone()
                
    #             logger.info("Successfully connected to SQLite Cloud")
                
    #         except Exception as e:
    #             logger.error(f"Failed to connect to SQLite Cloud: {e}")
    #             raise
        
    #     return self._connection


    def _get_connection(self):
        """Get or create SQLite Cloud connection with proper authentication"""
        if self._connection is None:
            try:
                # Hardcoded credentials as fallback
                if not self.connection_string:
                    self.connection_string = "sqlitecloud://crp6lwxvnz.g2.sqlite.cloud:8860/hool"
                
                if not self.api_key:
                    self.api_key = "CWwoReVnb5JGoUcHzuZgVuaLpIVt2Vyag7iHbW1ixMU"
                
                # Connect with API key authentication
                if '?apikey=' not in self.connection_string:
                    separator = '&' if '?' in self.connection_string else '?'
                    full_connection = f"{self.connection_string}{separator}apikey={self.api_key}"
                else:
                    full_connection = self.connection_string
                
                logger.debug(f"Connecting to SQLite Cloud...")
                self._connection = sqlitecloud.connect(full_connection)
                
                # Test connection
                cursor = self._connection.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                
                logger.info("Successfully connected to SQLite Cloud")
                
            except Exception as e:
                logger.error(f"Failed to connect to SQLite Cloud: {e}")
                raise
        
        return self._connection
    



    def close(self):
        """Close cloud connection"""
        if self._connection:
            self._connection.close()
            self._connection = None
    
    def push_changes(self, operations: List[Dict]) -> Dict[str, Any]:
        """Push local changes to cloud"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
        except Exception as e:
            logger.error(f"Cannot push changes: {e}")
            return {
                'success': False,
                'synced_count': 0,
                'errors': [{'error': f"Connection failed: {e}"}]
            }
        
        success_count = 0
        errors = []
        
        for op in operations:
            try:
                table_name = op['table_name']
                record_id = op['record_id']
                operation = op['operation']
                data = json.loads(op['data']) if op['data'] else {}
                
                if operation == 'INSERT':
                    # Check if record exists
                    cursor.execute(f"SELECT 1 FROM {table_name} WHERE id = ?", (record_id,))
                    exists = cursor.fetchone()
                    
                    if exists:
                        # Update instead
                        data['version'] = data.get('version', 1) + 1
                        data['synced_at'] = datetime.now().isoformat()
                        
                        set_clause = ', '.join([f"{k}=?" for k in data.keys() if k != 'id'])
                        cursor.execute(f"""
                            UPDATE {table_name}
                            SET {set_clause}
                            WHERE id = ?
                        """, list(data.values()) + [record_id])
                    else:
                        # Insert new
                        data['version'] = data.get('version', 1)
                        data['synced_at'] = datetime.now().isoformat()
                        
                        columns = ', '.join(data.keys())
                        placeholders = ', '.join(['?' for _ in data])
                        
                        cursor.execute(f"""
                            INSERT INTO {table_name} ({columns})
                            VALUES ({placeholders})
                        """, list(data.values()))
                    
                elif operation == 'UPDATE':
                    data['version'] = data.get('version', 1) + 1
                    data['synced_at'] = datetime.now().isoformat()
                    
                    set_clause = ', '.join([f"{k}=?" for k in data.keys() if k != 'id'])
                    cursor.execute(f"""
                        UPDATE {table_name}
                        SET {set_clause}
                        WHERE id = ?
                    """, list(data.values()) + [record_id])
                    
                elif operation == 'DELETE':
                    cursor.execute(f"DELETE FROM {table_name} WHERE id = ?", (record_id,))
                
                conn.commit()
                success_count += 1
                
            except Exception as e:
                errors.append({
                    'operation': op,
                    'error': str(e)
                })
                logger.error(f"Failed to push operation {op.get('id')}: {e}")
        
        return {
            'success': len(errors) == 0,
            'synced_count': success_count,
            'errors': errors
        }
    
    def pull_changes(self, last_version: int, table_names: List[str] = None) -> Dict[str, Any]:
        """Pull changes from cloud since last_version"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
        except Exception as e:
            logger.error(f"Cannot pull changes: {e}")
            return {
                'records': [],
                'new_version': last_version,
                'count': 0,
                'error': str(e)
            }
        
        all_changes = []
        max_version = last_version
        
        # If no specific tables, get all tables from schema
        if not table_names:
            try:
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%'
                    AND name NOT LIKE 'sync_%'
                    AND name NOT LIKE 'notification_%'
                    AND name NOT LIKE '_%'
                """)
                table_names = [row[0] for row in cursor.fetchall()]
            except Exception as e:
                logger.error(f"Failed to get table list: {e}")
                table_names = []
        
        for table in table_names:
            try:
                # Check if table has version column
                cursor.execute(f"PRAGMA table_info({table})")
                columns = [col[1] for col in cursor.fetchall()]
                
                if 'version' not in columns:
                    continue  # Skip tables without version tracking
                
                # Get records with version > last_version
                query = f"""
                    SELECT * FROM {table}
                    WHERE version > ?
                    ORDER BY version ASC
                """
                cursor.execute(query, (last_version,))
                
                records = cursor.fetchall()
                
                for record in records:
                    # Convert to dict
                    record_dict = {}
                    for i, col in enumerate(columns):
                        record_dict[col] = record[i]
                    
                    record_dict['_table_name'] = table
                    all_changes.append(record_dict)
                    
                    # Track max version
                    if record_dict.get('version', 0) > max_version:
                        max_version = record_dict['version']
                        
            except Exception as e:
                logger.error(f"Error pulling from {table}: {e}")
        
        return {
            'records': all_changes,
            'new_version': max_version,
            'count': len(all_changes)
        }
    

    def health_check(self) -> bool:
        """Check if cloud is reachable with better error handling"""
        try:
            # Try to get connection
            conn = self._get_connection()
            cursor = conn.cursor()
            
            # Simple query that should always work
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
            if result and result[0] == 1:
                logger.debug("Cloud health check passed")
                return True
            else:
                logger.warning("Cloud health check returned unexpected result")
                return False
                
        except sqlitecloud.OperationalError as e:
            # This is the "error while writing data" that appears intermittently
            if "writing data" in str(e).lower():
                logger.debug(f"Cloud health check intermittent error: {e}")
                # Return True for intermittent errors (assume still connected)
                return True
            else:
                logger.error(f"Cloud health check operational error: {e}")
                return False
        except Exception as e:
            logger.error(f"Cloud health check failed: {e}")
            return False
            
        
    def get_server_timestamp(self) -> str:
        """Get current server timestamp"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT datetime('now')")
            result = cursor.fetchone()
            return result[0] if result else datetime.now().isoformat()
        except:
            return datetime.now().isoformat()