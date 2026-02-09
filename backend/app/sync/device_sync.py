# app/sync/device_sync.py
import sqlite3
from datetime import datetime
from pathlib import Path
import logging
from typing import Dict, List, Optional, Tuple, Any
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# class DeviceSyncManager:
#     def __init__(self, local_db_path: str, cloud_client):
#         self.local_db_path = Path(local_db_path)
#         self.cloud_client = cloud_client
        
#     def get_local_connection(self):
#         """Get connection to local SQLite database"""
#         return sqlite3.connect(str(self.local_db_path))
    
#     def ensure_sync_columns(self):
#         """Ensure local devices table has sync columns"""
#         try:
#             conn = self.get_local_connection()
#             cursor = conn.cursor()
            
#             # Check existing columns
#             cursor.execute("PRAGMA table_info(devices)")
#             columns = [col[1] for col in cursor.fetchall()]
            
#             # Add missing columns
#             if "cloud_sync_status" not in columns:
#                 cursor.execute("ALTER TABLE devices ADD COLUMN cloud_sync_status TEXT DEFAULT 'pending'")
#                 logger.info("Added cloud_sync_status column")
            
#             if "last_sync_attempt" not in columns:
#                 cursor.execute("ALTER TABLE devices ADD COLUMN last_sync_attempt DATETIME")
#                 logger.info("Added last_sync_attempt column")
            
#             if "cloud_device_id" not in columns:
#                 cursor.execute("ALTER TABLE devices ADD COLUMN cloud_device_id INTEGER")
#                 logger.info("Added cloud_device_id column")
            
#             if "sync_error" not in columns:
#                 cursor.execute("ALTER TABLE devices ADD COLUMN sync_error TEXT")
#                 logger.info("Added sync_error column")
            
#             if "sync_attempts" not in columns:
#                 cursor.execute("ALTER TABLE devices ADD COLUMN sync_attempts INTEGER DEFAULT 0")
#                 logger.info("Added sync_attempts column")
            
#             conn.commit()
#             conn.close()
#             return True
            
#         except Exception as e:
#             logger.error(f"Error ensuring sync columns: {e}")
#             return False
    
#     def get_devices_to_sync(self, limit: int = 50) -> List[Dict]:
#         """Get devices that need syncing to cloud"""
#         try:
#             self.ensure_sync_columns()
            
#             conn = self.get_local_connection()
#             conn.row_factory = sqlite3.Row
#             cursor = conn.cursor()
            
#             # Get devices that need syncing
#             cursor.execute("""
#                 SELECT d.*, 
#                        u.email as user_email,
#                        u.unique_id as user_unique_id,
#                        s.school_name,
#                        s.email as school_email,
#                        s.phone as school_contact
#                 FROM devices d
#                 LEFT JOIN users u ON d.user_id = u.id
#                 LEFT JOIN school_info s ON 1=1  -- Get school info if exists
#                 WHERE d.cloud_sync_status IN ('pending', 'failed')
#                    OR d.cloud_sync_status IS NULL
#                 ORDER BY 
#                     CASE 
#                         WHEN d.cloud_sync_status = 'failed' THEN 0
#                         ELSE 1
#                     END,
#                     d.sync_attempts ASC,
#                     d.created_at DESC
#                 LIMIT ?
#             """, (limit,))
            
#             devices = [dict(row) for row in cursor.fetchall()]
#             conn.close()
            
#             return devices
#         except Exception as e:
#             logger.error(f"Error getting devices to sync: {e}")
#             return []
    
#     def get_school_info(self) -> Optional[Dict]:
#         """Get school info from local database"""
#         try:
#             conn = self.get_local_connection()
#             conn.row_factory = sqlite3.Row
#             cursor = conn.cursor()
            
#             cursor.execute("SELECT * FROM school_info LIMIT 1")
#             row = cursor.fetchone()
#             conn.close()
            
#             return dict(row) if row else None
#         except:
#             return None
    
#     def get_admin_info(self) -> Optional[Dict]:
#         """Get admin info from local database"""
#         try:
#             conn = self.get_local_connection()
#             conn.row_factory = sqlite3.Row
#             cursor = conn.cursor()
            
#             cursor.execute("""
#                 SELECT * FROM users 
#                 WHERE role = 'admin' 
#                 ORDER BY created_at DESC 
#                 LIMIT 1
#             """)
            
#             row = cursor.fetchone()
#             conn.close()
            
#             return dict(row) if row else None
#         except:
#             return None
    
#     def prepare_device_for_cloud(self, local_device: Dict) -> Dict:
#         """Prepare device data for cloud storage"""
#         # Get school and admin info
#         school_info = self.get_school_info()
#         admin_info = self.get_admin_info()
        
#         cloud_device = {
#             "device_id": local_device.get("device_id"),
#             "device_name": local_device.get("device_name"),
#             "device_type": local_device.get("device_type"),
#             "os_name": local_device.get("os_name"),
#             "os_version": local_device.get("os_version"),
#             "activation_key": local_device.get("activation_key"),
#             "activation_status": local_device.get("activation_status"),
#             "activation_token_hash": local_device.get("activation_token_hash"),
#             "license_type": local_device.get("license_type"),
#             "activated_at": local_device.get("activated_at"),
#             "license_valid_until": local_device.get("license_valid_until"),
#             "last_license_check": local_device.get("last_license_check"),
#             "last_activated_at": local_device.get("last_activated_at"),
#             "registered_at": local_device.get("registered_at"),
#             "created_at": local_device.get("created_at"),
#             "updated_at": datetime.now().isoformat(),
#             "local_user_id": local_device.get("user_id"),
#             "local_user_email": local_device.get("user_email"),
#             "local_user_unique_id": local_device.get("user_unique_id"),
#             "cloud_sync_status": "syncing",
#             "last_sync_at": datetime.now().isoformat(),
#             "sync_attempts": local_device.get("sync_attempts", 0) + 1
#         }
        
#         # Add school reference if available
#         if school_info:
#             # Try to get school from cloud
#             school_name = school_info.get("school_name")
#             school_email = school_info.get("email")
            
#             cloud_school = self.cloud_client.get_school_by_name_or_email(
#                 school_name=school_name, 
#                 school_email=school_email
#             )
            
#             if cloud_school:
#                 cloud_device["school_installation_id"] = cloud_school.get("id")
#                 cloud_device["school_name"] = cloud_school.get("school_name")
#                 cloud_device["school_email"] = cloud_school.get("school_email")
        
#         # Add admin reference if available
#         if admin_info:
#             # Try to get admin from cloud by email
#             admin_email = admin_info.get("email")
#             if admin_email:
#                 try:
#                     result = self.cloud_client.execute_query(
#                         "SELECT id FROM admin_table WHERE email = ? LIMIT 1",
#                         (admin_email,)
#                     )
#                     if result.get("rows"):
#                         cloud_device["admin_id"] = result["rows"][0]["id"]
#                 except:
#                     pass
        
#         return cloud_device
    
#     def sync_single_device(self, local_device: Dict) -> Dict:
#         """Sync a single device to cloud"""
#         device_id = local_device.get("device_id")
#         local_device_id = local_device.get("id")
        
#         try:
#             # Check if cloud is connected
#             if not self.cloud_client.check_connection():
#                 return {
#                     "success": False,
#                     "device_id": device_id,
#                     "message": "Cloud not connected",
#                     "action": "retry"
#                 }
            
#             # Prepare device data
#             cloud_device_data = self.prepare_device_for_cloud(local_device)
            
#             # Upsert to cloud
#             result = self.cloud_client.upsert_device(cloud_device_data)
            
#             # Update local sync status
#             self.update_local_sync_status(
#                 local_device_id,
#                 "synced" if result.get("success") else "failed",
#                 result.get("message"),
#                 result.get("cloud_device_id")
#             )
            
#             return {
#                 "success": result.get("success", False),
#                 "device_id": device_id,
#                 "message": result.get("message", "Unknown error"),
#                 "action": result.get("action", "error"),
#                 "cloud_device_id": result.get("cloud_device_id")
#             }
            
#         except Exception as e:
#             error_msg = str(e)
#             logger.error(f"Error syncing device {device_id}: {error_msg}")
            
#             # Update local status as failed
#             self.update_local_sync_status(
#                 local_device_id,
#                 "failed",
#                 error_msg,
#                 None
#             )
            
#             return {
#                 "success": False,
#                 "device_id": device_id,
#                 "message": error_msg,
#                 "action": "error"
#             }
    
#     def sync_batch_devices(self, batch_size: int = 20) -> Dict:
#         """Sync a batch of devices to cloud"""
#         results = {
#             "success": False,
#             "total_attempted": 0,
#             "successful": 0,
#             "failed": 0,
#             "devices": [],
#             "start_time": datetime.now().isoformat()
#         }
        
#         try:
#             # Get devices that need syncing
#             devices_to_sync = self.get_devices_to_sync(batch_size)
#             results["total_found"] = len(devices_to_sync)
            
#             if not devices_to_sync:
#                 results["message"] = "No devices need syncing"
#                 results["success"] = True
#                 return results
            
#             # Sync each device
#             for device in devices_to_sync:
#                 sync_result = self.sync_single_device(device)
#                 results["devices"].append(sync_result)
                
#                 if sync_result.get("success"):
#                     results["successful"] += 1
#                 else:
#                     results["failed"] += 1
            
#             results["total_attempted"] = len(devices_to_sync)
#             results["success"] = results["successful"] > 0 or results["total_found"] == 0
#             results["end_time"] = datetime.now().isoformat()
#             results["duration"] = (datetime.fromisoformat(results["end_time"]) - 
#                                  datetime.fromisoformat(results["start_time"])).total_seconds()
            
#             logger.info(f"Batch sync: {results['successful']} successful, {results['failed']} failed")
            
#         except Exception as e:
#             results["error"] = str(e)
#             results["message"] = f"Batch sync failed: {str(e)}"
#             logger.error(f"Batch sync error: {e}")
        
#         return results
    
#     def update_local_sync_status(self, local_id: int, status: str, 
#                                error_msg: str = None, cloud_id: int = None):
#         """Update sync status in local database"""
#         try:
#             conn = self.get_local_connection()
#             cursor = conn.cursor()
            
#             if cloud_id:
#                 cursor.execute("""
#                     UPDATE devices 
#                     SET cloud_sync_status = ?, 
#                         last_sync_attempt = ?,
#                         sync_error = ?,
#                         cloud_device_id = ?,
#                         sync_attempts = sync_attempts + 1,
#                         updated_at = ?
#                     WHERE id = ?
#                 """, (
#                     status,
#                     datetime.now().isoformat(),
#                     error_msg,
#                     cloud_id,
#                     datetime.now().isoformat(),
#                     local_id
#                 ))
#             else:
#                 cursor.execute("""
#                     UPDATE devices 
#                     SET cloud_sync_status = ?, 
#                         last_sync_attempt = ?,
#                         sync_error = ?,
#                         sync_attempts = sync_attempts + 1,
#                         updated_at = ?
#                     WHERE id = ?
#                 """, (
#                     status,
#                     datetime.now().isoformat(),
#                     error_msg,
#                     datetime.now().isoformat(),
#                     local_id
#                 ))
            
#             conn.commit()
#             conn.close()
            
#         except Exception as e:
#             logger.error(f"Error updating local sync status: {e}")
    
#     def get_sync_summary(self) -> Dict:
#         """Get summary of sync status"""
#         try:
#             conn = self.get_local_connection()
#             cursor = conn.cursor()
            
#             # Count devices by sync status
#             cursor.execute("""
#                 SELECT 
#                     COUNT(*) as total,
#                     SUM(CASE WHEN cloud_sync_status = 'synced' THEN 1 ELSE 0 END) as synced,
#                     SUM(CASE WHEN cloud_sync_status = 'pending' OR cloud_sync_status IS NULL THEN 1 ELSE 0 END) as pending,
#                     SUM(CASE WHEN cloud_sync_status = 'failed' THEN 1 ELSE 0 END) as failed,
#                     SUM(CASE WHEN cloud_sync_status = 'syncing' THEN 1 ELSE 0 END) as syncing,
#                     AVG(sync_attempts) as avg_attempts
#                 FROM devices
#             """)
            
#             stats = cursor.fetchone()
            
#             # Get last sync time
#             cursor.execute("""
#                 SELECT MAX(last_sync_attempt) as last_sync
#                 FROM devices 
#                 WHERE last_sync_attempt IS NOT NULL
#             """)
            
#             last_sync = cursor.fetchone()
            
#             # Get devices needing sync
#             cursor.execute("""
#                 SELECT COUNT(*) as needs_sync
#                 FROM devices
#                 WHERE cloud_sync_status IN ('pending', 'failed') 
#                    OR cloud_sync_status IS NULL
#             """)
            
#             needs_sync = cursor.fetchone()
            
#             conn.close()
            
#             total = stats[0] if stats else 0
#             synced = stats[1] if stats else 0
            
#             return {
#                 "total_devices": total,
#                 "synced": synced,
#                 "pending": stats[2] if stats else 0,
#                 "failed": stats[3] if stats else 0,
#                 "syncing": stats[4] if stats else 0,
#                 "needs_sync": needs_sync[0] if needs_sync else 0,
#                 "avg_sync_attempts": round(stats[5], 2) if stats and stats[5] else 0,
#                 "last_sync": last_sync[0] if last_sync and last_sync[0] else None,
#                 "sync_percentage": round((synced / total * 100), 2) if total > 0 else 0
#             }
            
#         except Exception as e:
#             logger.error(f"Error getting sync summary: {e}")
#             return {}
    
#     def sync_activation_status(self, activation_code: str) -> bool:
#         """Sync activation status to cloud"""
#         try:
#             if not self.cloud_client.check_connection():
#                 return False
            
#             school_info = self.get_school_info()
#             if not school_info:
#                 return False
            
#             school_name = school_info.get("school_name")
#             if not school_name:
#                 return False
            
#             # Update school in cloud with activation code
#             query = """
#                 UPDATE school_installations 
#                 SET activation_code = ?, updated_at = ?
#                 WHERE school_name = ?
#             """
            
#             result = self.cloud_client.execute_query(
#                 query, 
#                 (activation_code, datetime.now().isoformat(), school_name)
#             )
            
#             return result.get("success", False)
            
#         except Exception as e:
#             logger.error(f"Error syncing activation: {e}")
#             return False
        
# In your device_sync.py

class DeviceSyncManager:
    def __init__(self, local_db_path: str, cloud_client):
        self.local_db_path = Path(local_db_path)
        self.cloud_client = cloud_client
    
    def sync_all_data(self) -> Dict:
        """Sync ALL data: school, activation, and devices"""
        results = {
            "school_synced": False,
            "activation_synced": False,
            "devices_synced": False,
            "details": {}
        }
        
        try:
            # 1. First sync school info
            school_result = self.sync_school_info()
            results["school_synced"] = school_result["success"]
            results["details"]["school"] = school_result
            
            # 2. Sync activation code
            if school_result["success"]:
                activation_result = self.sync_activation_data()
                results["activation_synced"] = activation_result["success"]
                results["details"]["activation"] = activation_result
                
                # 3. Sync devices with proper school linkage
                if activation_result.get("activation_code"):
                    devices_result = self.sync_devices_with_school(
                        school_result.get("school_id"),
                        activation_result.get("activation_code")
                    )
                    results["devices_synced"] = devices_result["success"]
                    results["details"]["devices"] = devices_result
                else:
                    results["details"]["devices"] = {
                        "success": False,
                        "message": "No activation code available"
                    }
            
            results["success"] = (
                results["school_synced"] and 
                results["activation_synced"] and 
                results["devices_synced"]
            )
            
        except Exception as e:
            results["error"] = str(e)
            results["success"] = False
        
        return results
    
    def sync_school_info(self) -> Dict:
        """Sync school info to school_installations table"""
        try:
            school_info = self.get_school_info()
            if not school_info:
                return {"success": False, "message": "No school info found locally"}
            
            # Check if school already exists in cloud
            existing_school = self.cloud_client.execute_query(
                "SELECT * FROM school_installations WHERE school_name = ? OR school_email = ?",
                (school_info.get("school_name"), school_info.get("email"))
            )
            
            if existing_school.get("rows"):
                # School exists, return its ID
                school_id = existing_school["rows"][0]["id"]
                return {
                    "success": True,
                    "message": "School already exists in cloud",
                    "school_id": school_id,
                    "action": "existing"
                }
            else:
                # Create new school in cloud
                school_data = {
                    "school_name": school_info.get("school_name"),
                    "school_email": school_info.get("email"),
                    "school_contact": school_info.get("phone"),
                    "county": school_info.get("county"),
                    "region": school_info.get("region"),
                    "city": school_info.get("city"),
                    "town": school_info.get("town"),
                    "gps_address": school_info.get("gps_address"),
                    "created_at": datetime.now().isoformat()
                }
                
                result = self.cloud_client.execute_query("""
                    INSERT INTO school_installations (
                        school_name, school_email, school_contact,
                        county, region, city, town, gps_address, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    school_data["school_name"],
                    school_data["school_email"],
                    school_data["school_contact"],
                    school_data["county"],
                    school_data["region"],
                    school_data["city"],
                    school_data["town"],
                    school_data["gps_address"],
                    school_data["created_at"]
                ))
                
                if result.get("success"):
                    # Get the new school ID
                    school_result = self.cloud_client.execute_query(
                        "SELECT id FROM school_installations WHERE school_email = ?",
                        (school_data["school_email"],)
                    )
                    
                    if school_result.get("rows"):
                        school_id = school_result["rows"][0]["id"]
                        return {
                            "success": True,
                            "message": "School created in cloud",
                            "school_id": school_id,
                            "action": "created"
                        }
                
                return {"success": False, "message": "Failed to create school in cloud"}
                
        except Exception as e:
            return {"success": False, "message": f"Error syncing school: {str(e)}"}
    
    def sync_activation_data(self) -> Dict:
        """Sync activation data to school_installations table"""
        try:
            # Get activation data from local
            conn = self.get_local_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM activation_state WHERE id = 1")
            activation_state = cursor.fetchone()
            conn.close()
            
            if not activation_state or len(activation_state) < 3:
                return {"success": False, "message": "No activation data found"}
            
            activation_code = activation_state[2] if len(activation_state) > 2 else ""
            if not activation_code:
                return {"success": False, "message": "No activation code found"}
            
            # Get school info for the update
            school_info = self.get_school_info()
            if not school_info:
                return {"success": False, "message": "No school info found"}
            
            # Get device name (from first device or system)
            device_name = self.get_device_name()
            
            # Update school_installations with activation code
            update_result = self.cloud_client.execute_query("""
                UPDATE school_installations 
                SET activation_code = ?, 
                    device_name = ?,
                    updated_at = ?
                WHERE school_email = ?
            """, (
                activation_code,
                device_name,
                datetime.now().isoformat(),
                school_info.get("email")
            ))
            
            return {
                "success": update_result.get("success", False),
                "message": "Activation data synced" if update_result.get("success") else "Failed to sync activation",
                "activation_code": activation_code,
                "device_name": device_name
            }
            
        except Exception as e:
            return {"success": False, "message": f"Error syncing activation: {str(e)}"}
    
    def get_device_name(self) -> str:
        """Get device name from local database"""
        try:
            conn = self.get_local_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT device_name FROM devices LIMIT 1")
            result = cursor.fetchone()
            conn.close()
            
            if result and result[0]:
                return result[0]
        except:
            pass
        
        return "Default Device"
    
    def sync_devices_with_school(self, school_id: int, activation_code: str) -> Dict:
        """Sync devices with proper school and activation linking"""
        try:
            # Get devices from local
            devices = self.get_devices_to_sync(limit=50)
            
            if not devices:
                return {"success": True, "message": "No devices to sync", "synced": 0}
            
            successful = 0
            failed = 0
            
            for device in devices:
                result = self.sync_single_device_with_school(
                    device, 
                    school_id, 
                    activation_code
                )
                
                if result.get("success"):
                    successful += 1
                else:
                    failed += 1
            
            return {
                "success": successful > 0,
                "message": f"Synced {successful} of {successful + failed} devices",
                "synced": successful,
                "failed": failed
            }
            
        except Exception as e:
            return {"success": False, "message": f"Error syncing devices: {str(e)}"}
    
    def sync_single_device_with_school(self, local_device: Dict, 
                                     school_id: int, 
                                     activation_code: str) -> Dict:
        """Sync a single device with school context"""
        try:
            # Prepare device data with school info
            cloud_device_data = self.prepare_device_for_cloud(local_device)
            
            # Add school and activation info
            cloud_device_data["school_installation_id"] = school_id
            cloud_device_data["activation_code"] = activation_code
            
            # Get school info for school_name and school_email
            school_info = self.get_school_info()
            if school_info:
                cloud_device_data["school_name"] = school_info.get("school_name")
                cloud_device_data["school_email"] = school_info.get("email")
            
            # Insert/Update in cloud
            result = self.cloud_client.upsert_device(cloud_device_data)
            
            # Update local sync status
            self.update_local_sync_status(
                local_device.get("id"),
                "synced" if result.get("success") else "failed",
                result.get("message"),
                result.get("cloud_device_id")
            )
            
            return {
                "success": result.get("success", False),
                "device_id": local_device.get("device_id"),
                "message": result.get("message", "Unknown error")
            }
            
        except Exception as e:
            return {
                "success": False,
                "device_id": local_device.get("device_id"),
                "message": f"Error: {str(e)}"
            }   
        




