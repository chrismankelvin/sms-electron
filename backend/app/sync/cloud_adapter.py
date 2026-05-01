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
    
    def _get_connection(self):
        """Get or create SQLite Cloud connection with proper authentication"""
        if self._connection is None:
            try:
                if not self.connection_string:
                    self.connection_string = "sqlitecloud://crp6lwxvnz.g2.sqlite.cloud:8860/synctest"
                
                if not self.api_key:
                    self.api_key = "CWwoReVnb5JGoUcHzuZgVuaLpIVt2Vyag7iHbW1ixMU"
                
                if '?apikey=' not in self.connection_string:
                    separator = '&' if '?' in self.connection_string else '?'
                    full_connection = f"{self.connection_string}{separator}apikey={self.api_key}"
                else:
                    full_connection = self.connection_string
                
                logger.debug(f"Connecting to SQLite Cloud...")
                self._connection = sqlitecloud.connect(full_connection)
                
                cursor = self._connection.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                
                logger.info("Successfully connected to SQLite Cloud")
                
            except Exception as e:
                logger.error(f"Failed to connect to SQLite Cloud: {e}")
                raise
        
        return self._connection
    
    def _get_record_from_local(self, table_name: str, record_id: str) -> Optional[Dict]:
        """Get the actual record from local database"""
        try:
            from app.activation.state import get_db_connection
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [col[1] for col in cursor.fetchall()]
            
            if not columns:
                conn.close()
                return None
            
            cursor.execute(f"SELECT * FROM {table_name} WHERE id = ?", (record_id,))
            row = cursor.fetchone()
            
            conn.close()
            
            if row:
                return dict(row)
            return None
            
        except Exception as e:
            logger.error(f"Error getting record from local {table_name}: {e}")
            return None
    
    def _get_foreign_keys(self, table_name: str) -> List[Dict]:
        """Get foreign key relationships for a table"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(f"PRAGMA foreign_key_list({table_name})")
            fks = cursor.fetchall()
            
            result = []
            for fk in fks:
                result.append({
                    'column': fk[3],  # 'from' column
                    'references_table': fk[2],  # 'to' table
                    'references_column': fk[4]  # 'to' column
                })
            
            return result
        except Exception as e:
            logger.debug(f"Error getting foreign keys for {table_name}: {e}")
            return []
    
    def close(self):
        """Close cloud connection"""
        if self._connection:
            self._connection.close()
            self._connection = None
    
    def push_changes(self, operations: List[Dict]) -> Dict[str, Any]:
        """Push local changes to cloud with dependency handling"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            # Temporarily disable foreign key checks for this sync session
            cursor.execute("PRAGMA foreign_keys = OFF")
        except Exception as e:
            logger.error(f"Cannot push changes: {e}")
            return {
                'success': False,
                'synced_count': 0,
                'errors': [{'error': f"Connection failed: {e}"}]
            }
        
        success_count = 0
        errors = []
        
        # Sort operations by priority (INSERT before UPDATE/DELETE that depend on them)
        # Simple approach: process INSERTs first, then UPDATEs, then DELETEs
        inserts = [op for op in operations if op['operation'] == 'INSERT']
        updates = [op for op in operations if op['operation'] == 'UPDATE']
        deletes = [op for op in operations if op['operation'] == 'DELETE']
        
        # Process in order: INSERT, UPDATE, DELETE
        ordered_ops = inserts + updates + deletes
        
        for op in ordered_ops:
            try:
                table_name = op['table_name']
                record_id = op['record_id']
                operation = op['operation']
                
                if operation == 'DELETE':
                    cursor.execute(f"DELETE FROM {table_name} WHERE id = ?", (record_id,))
                    conn.commit()
                    success_count += 1
                    logger.info(f"✅ Deleted {table_name} id={record_id} from cloud")
                    continue
                
                # Get the actual record from local database
                record = self._get_record_from_local(table_name, record_id)
                
                if not record and operation != 'DELETE':
                    logger.warning(f"Record {record_id} not found in {table_name}, skipping")
                    errors.append({
                        'operation': op,
                        'error': f"Record not found locally"
                    })
                    continue
                
                # Get cloud table columns
                cursor.execute(f"PRAGMA table_info({table_name})")
                cloud_columns = [col[1] for col in cursor.fetchall()]
                
                if not cloud_columns:
                    logger.warning(f"Table {table_name} doesn't exist in cloud")
                    errors.append({
                        'operation': op,
                        'error': f"Table {table_name} does not exist in cloud"
                    })
                    continue
                
                # Filter record to only include columns that exist in cloud
                filtered_record = {}
                for key, value in record.items():
                    if key in cloud_columns and key not in ['data', 'sync_error', 'last_error']:
                        filtered_record[key] = value
                
                # Increment version for cloud
                current_version = filtered_record.get('version', 1)
                filtered_record['version'] = current_version + 1
                filtered_record['synced_at'] = datetime.now().isoformat()
                
                # For INSERT, remove id if it's auto-increment (let cloud assign)
                # But preserve it if we need to maintain specific IDs
                if operation == 'INSERT':
                    # Keep the ID if it's provided and not auto-increment
                    pass
                
                # Check if record exists in cloud
                cursor.execute(f"SELECT id FROM {table_name} WHERE id = ?", (record_id,))
                exists = cursor.fetchone()
                
                if exists and operation == 'INSERT':
                    # Record exists, do UPDATE instead
                    operation = 'UPDATE'
                
                if operation == 'UPDATE' or (operation == 'INSERT' and exists):
                    # UPDATE existing record
                    set_clause = ', '.join([f"{k}=?" for k in filtered_record.keys() if k != 'id'])
                    values = [filtered_record[k] for k in filtered_record.keys() if k != 'id'] + [record_id]
                    
                    cursor.execute(f"""
                        UPDATE {table_name}
                        SET {set_clause}
                        WHERE id = ?
                    """, values)
                    logger.info(f"✅ Updated {table_name} id={record_id} in cloud")
                else:
                    # INSERT new record
                    columns = ', '.join(filtered_record.keys())
                    placeholders = ', '.join(['?' for _ in filtered_record])
                    
                    cursor.execute(f"""
                        INSERT OR REPLACE INTO {table_name} ({columns})
                        VALUES ({placeholders})
                    """, list(filtered_record.values()))
                    logger.info(f"✅ Inserted {table_name} id={record_id} into cloud")
                
                conn.commit()
                success_count += 1
                
            except Exception as e:
                error_msg = str(e)
                if "FOREIGN KEY" in error_msg:
                    logger.warning(f"Foreign key error for {op.get('table_name')} id={op.get('record_id')}: {error_msg}")
                    # Don't mark as error - will retry later when dependencies are synced
                    errors.append({
                        'operation': op,
                        'error': f"FOREIGN KEY constraint failed - dependencies not yet synced"
                    })
                else:
                    logger.error(f"Failed to push operation {op.get('id')}: {error_msg}")
                    errors.append({
                        'operation': op,
                        'error': error_msg
                    })
        
        # Re-enable foreign key checks
        try:
            cursor.execute("PRAGMA foreign_keys = ON")
        except:
            pass
        
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
        
        if not table_names:
            try:
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%'
                    AND name NOT LIKE 'sync_%'
                    AND name NOT LIKE 'notification_%'
                    AND name NOT LIKE '_%'
                    AND name NOT LIKE 'email_%'
                    AND name NOT LIKE 'sms_%'
                """)
                table_names = [row[0] for row in cursor.fetchall()]
            except Exception as e:
                logger.error(f"Failed to get table list: {e}")
                table_names = []
        
        for table in table_names:
            try:
                cursor.execute(f"PRAGMA table_info({table})")
                columns = [col[1] for col in cursor.fetchall()]
                
                if 'version' not in columns:
                    continue
                
                query = f"""
                    SELECT * FROM {table}
                    WHERE version > ?
                    ORDER BY version ASC
                """
                cursor.execute(query, (last_version,))
                
                records = cursor.fetchall()
                
                for record in records:
                    record_dict = {}
                    for i, col in enumerate(columns):
                        record_dict[col] = record[i]
                    
                    record_dict['_table_name'] = table
                    all_changes.append(record_dict)
                    
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
            conn = self._get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
            if result and result[0] == 1:
                logger.debug("Cloud health check passed")
                return True
            else:
                logger.warning("Cloud health check returned unexpected result")
                return False
                
        except sqlitecloud.OperationalError as e:
            if "writing data" in str(e).lower():
                logger.debug(f"Cloud health check intermittent error: {e}")
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