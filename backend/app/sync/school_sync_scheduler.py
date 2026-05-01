# # # app/sync/school_sync_scheduler.py
# # import asyncio
# # import threading
# # import logging
# # from typing import Callable, Optional, Dict, Any
# # from queue import Queue
# # from datetime import datetime

# # from app.activation.state import get_db_connection
# # # from app.sync.sync_database import SyncDatabaseWrapper
# # from app.sync.sync_database import SyncDatabaseWrapper
# # from app.sync.cloud_adapter import SQLiteCloudAdapter

# # logger = logging.getLogger(__name__)

# # class SchoolSyncScheduler:
# #     """Sync scheduler integrated with your school management system"""
    
# #     def __init__(self, cloud_connection_string: str, cloud_api_key: str):
# #         self.db = SyncDatabaseWrapper()
# #         self.cloud = SQLiteCloudAdapter(cloud_connection_string, cloud_api_key)
# #         self._sync_queue = Queue()
# #         self._is_running = False
# #         self._event_loop = None
# #         self._background_task = None
# #         self._callbacks = []
        
# #         # Configuration
# #         self.config = {
# #             'sync_interval': 10,  # seconds
# #             'batch_size': 50,
# #             'max_retries': 3,
# #             'retry_delays': [1, 5, 15, 30],  # seconds
# #         }
    
# #     def start(self):
# #         """Start the sync scheduler"""
# #         if self._is_running:
# #             return
        
# #         self._is_running = True
        
# #         # Get or create event loop
# #         try:
# #             self._event_loop = asyncio.get_running_loop()
# #         except RuntimeError:
# #             self._event_loop = asyncio.new_event_loop()
# #             asyncio.set_event_loop(self._event_loop)
        
# #         # Start background sync
# #         self._background_task = self._event_loop.create_task(
# #             self._background_sync_loop()
# #         )
        
# #         # Start immediate sync processor
# #         self._start_immediate_processor()
        
# #         logger.info("School Sync Scheduler started")
    
# #     def _start_immediate_processor(self):
# #         """Process immediate sync requests"""
# #         def processor():
# #             while self._is_running:
# #                 try:
# #                     data = self._sync_queue.get(timeout=1)
# #                     if data and self._event_loop:
# #                         asyncio.run_coroutine_threadsafe(
# #                             self._handle_sync_request(data),
# #                             self._event_loop
# #                         )
# #                 except Exception as e:
# #                     if "Empty" not in str(e):
# #                         logger.error(f"Queue processor error: {e}")
        
# #         thread = threading.Thread(target=processor, daemon=True)
# #         thread.start()
    
# #     async def _background_sync_loop(self):
# #         """Background sync loop"""
# #         while self._is_running:
# #             try:
# #                 if await self._is_online():
# #                     if self.db.has_pending_changes():
# #                         await self._full_sync()
# #                     else:
# #                         # Just pull when idle
# #                         await self._pull_changes()
                
# #                 await asyncio.sleep(self.config['sync_interval'])
                
# #             except Exception as e:
# #                 logger.error(f"Background sync error: {e}")
# #                 await asyncio.sleep(5)
    
# #     async def _handle_sync_request(self, request_type: str):
# #         """Handle different sync request types"""
# #         if request_type == "immediate":
# #             await self._push_changes()
# #         elif request_type == "full":
# #             await self._full_sync()
    
# #     async def _push_changes(self) -> Dict[str, Any]:
# #         """Push local changes to cloud"""
# #         if not await self._is_online():
# #             return {'success': False, 'reason': 'offline'}
        
# #         pending = self.db.get_pending_syncs(self.config['batch_size'])
        
# #         if not pending:
# #             return {'success': True, 'synced_count': 0}
        
# #         logger.info(f"Pushing {len(pending)} changes to cloud")
        
# #         # Push to cloud
# #         result = self.cloud.push_changes(pending)
        
# #         # Mark successful ones as synced
# #         if result['synced_count'] > 0:
# #             # In a real implementation, you'd track which ones succeeded
# #             # For simplicity, we'll mark all as synced if no errors
# #             if result['success']:
# #                 for op in pending:
# #                     self.db.mark_synced(op['id'], success=True)
# #             else:
# #                 # Mark only successful ones (you'd need more granular tracking)
# #                 pass
        
# #         return result
    
# #     async def _pull_changes(self) -> Dict[str, Any]:
# #         """Pull changes from cloud"""
# #         if not await self._is_online():
# #             return {'success': False, 'reason': 'offline'}
        
# #         last_version = self.db.get_last_sync_version()
        
# #         logger.info(f"Pulling changes since version {last_version}")
        
# #         # Get tables to sync (all main tables)
# #         tables = ['students', 'staff', 'users', 'classes', 'sections', 
# #                   'academic_years', 'subjects', 'assessments']
        
# #         result = self.cloud.pull_changes(last_version, tables)
        
# #         # Apply changes locally with conflict resolution
# #         applied_count = 0
# #         for record in result['records']:
# #             table_name = record.pop('_table_name')
# #             version = record.pop('sync_version', record.get('version', 1))
            
# #             if self.db.upsert_record(table_name, record, version):
# #                 applied_count += 1
        
# #         # Update last sync version
# #         if result['new_version'] > last_version:
# #             self.db.update_last_sync_version(result['new_version'])
        
# #         logger.info(f"Applied {applied_count} changes from cloud")
        
# #         return {
# #             'success': True,
# #             'applied_count': applied_count,
# #             'new_version': result['new_version']
# #         }
    
# #     async def _full_sync(self) -> Dict[str, Any]:
# #         """Perform full sync (push + pull)"""
# #         logger.info("Starting full sync")
        
# #         push_result = await self._push_changes()
# #         pull_result = await self._pull_changes()
        
# #         result = {
# #             'success': push_result['success'] and pull_result['success'],
# #             'push': push_result,
# #             'pull': pull_result,
# #             'timestamp': datetime.now().isoformat()
# #         }
        
# #         # Notify callbacks
# #         for callback in self._callbacks:
# #             try:
# #                 callback(result)
# #             except Exception as e:
# #                 logger.error(f"Callback error: {e}")
        
# #         return result
    
# #     async def _is_online(self) -> bool:
# #         """Check if cloud is reachable"""
# #         return self.cloud.health_check()
    
# #     # ========== TRIGGER METHODS (to be called from your app) ==========
    
# #     def on_data_change(self, table_name: str, record_id: str, operation: str, data: Dict = None):
# #         """
# #         TRIGGER 1: Called on every write operation (INSERT, UPDATE, DELETE)
# #         Call this from your existing database write functions
# #         """
# #         # Add to sync queue
# #         self.db.add_to_sync_queue(table_name, record_id, operation, data)
        
# #         # Trigger immediate sync if online
# #         if self._event_loop:
# #             # Check online status asynchronously
# #             future = asyncio.run_coroutine_threadsafe(
# #                 self._is_online(),
# #                 self._event_loop
# #             )
            
# #             try:
# #                 if future.result(timeout=2):
# #                     self._sync_queue.put("immediate")
# #             except:
# #                 pass
    
# #     def on_app_start(self):
# #         """TRIGGER 2: Called when app starts"""
# #         logger.info("App start - triggering full sync")
# #         self._sync_queue.put("full")
    
# #     def on_reconnect(self):
# #         """TRIGGER 3: Called when internet reconnects"""
# #         logger.info("Network reconnected - triggering full sync")
# #         self._sync_queue.put("full")
    
# #     def on_user_login(self, user_id: int):
# #         """TRIGGER 4: Called when user logs in"""
# #         logger.info(f"User {user_id} logged in - triggering sync")
# #         self._sync_queue.put("full")
    
# #     def add_callback(self, callback: Callable):
# #         """Add callback for sync status updates"""
# #         self._callbacks.append(callback)
    
# #     def stop(self):
# #         """Stop the sync scheduler"""
# #         self._is_running = False
# #         if self._background_task:
# #             self._background_task.cancel()
# #         self.cloud.close()
# #         logger.info("Sync scheduler stopped")







# # app/sync/school_sync_scheduler.py
# import asyncio
# import threading
# import logging
# from typing import Callable, Optional, Dict, Any
# from queue import Queue, Empty
# from datetime import datetime

# from app.activation.state import get_db_connection
# from app.sync.sync_database import SyncDatabaseWrapper
# from app.sync.cloud_adapter import SQLiteCloudAdapter

# logger = logging.getLogger(__name__)

# class SchoolSyncScheduler:
#     """Sync scheduler integrated with your school management system"""
    
#     def __init__(self, cloud_connection_string: str, cloud_api_key: str = None):
#         self.db = SyncDatabaseWrapper()
#         self.cloud = SQLiteCloudAdapter(cloud_connection_string, cloud_api_key)
#         self._sync_queue = Queue()
#         self._is_running = False
#         self._event_loop = None
#         self._background_task = None
#         self._processor_thread = None
#         self._callbacks = []
        
#         # Configuration
#         self.config = {
#             'sync_interval': 10,  # seconds
#             'batch_size': 50,
#             'max_retries': 3,
#             'retry_delays': [1, 5, 15, 30],  # seconds
#         }
    
#     def start(self):
#         """Start the sync scheduler"""
#         if self._is_running:
#             logger.warning("Sync scheduler already running")
#             return
        
#         self._is_running = True
        
#         # Create event loop in a separate thread
#         def run_event_loop():
#             self._event_loop = asyncio.new_event_loop()
#             asyncio.set_event_loop(self._event_loop)
#             self._event_loop.run_forever()
        
#         loop_thread = threading.Thread(target=run_event_loop, daemon=True)
#         loop_thread.start()
        
#         # Wait for event loop to be created
#         import time
#         time.sleep(0.5)
        
#         # Start background sync
#         if self._event_loop:
#             self._background_task = asyncio.run_coroutine_threadsafe(
#                 self._background_sync_loop(),
#                 self._event_loop
#             )
        
#         # Start immediate sync processor
#         self._start_immediate_processor()
        
#         logger.info("School Sync Scheduler started")
    
#     def _start_immediate_processor(self):
#         """Process immediate sync requests"""
#         def processor():
#             while self._is_running:
#                 try:
#                     data = self._sync_queue.get(timeout=1)
#                     if data and self._event_loop and self._event_loop.is_running():
#                         asyncio.run_coroutine_threadsafe(
#                             self._handle_sync_request(data),
#                             self._event_loop
#                         )
#                 except Empty:
#                     continue
#                 except Exception as e:
#                     logger.error(f"Queue processor error: {e}", exc_info=True)
        
#         self._processor_thread = threading.Thread(target=processor, daemon=True)
#         self._processor_thread.start()
    
#     async def _background_sync_loop(self):
#         """Background sync loop"""
#         while self._is_running:
#             try:
#                 if await self._is_online():
#                     if self.db.has_pending_changes():
#                         logger.info("Background sync: Pending changes found, syncing...")
#                         await self._full_sync()
#                     else:
#                         # Just pull when idle
#                         logger.debug("Background sync: No pending changes, pulling updates...")
#                         await self._pull_changes()
#                 else:
#                     logger.debug("Background sync: Offline, skipping sync")
                
#                 await asyncio.sleep(self.config['sync_interval'])
                
#             except asyncio.CancelledError:
#                 break
#             except Exception as e:
#                 logger.error(f"Background sync error: {e}", exc_info=True)
#                 await asyncio.sleep(5)
    
#     async def _handle_sync_request(self, request_type: str):
#         """Handle different sync request types"""
#         try:
#             if request_type == "immediate":
#                 await self._push_changes()
#             elif request_type == "full":
#                 await self._full_sync()
#         except Exception as e:
#             logger.error(f"Sync request handler error: {e}", exc_info=True)
    
#     async def _push_changes(self) -> Dict[str, Any]:
#         """Push local changes to cloud"""
#         if not await self._is_online():
#             return {'success': False, 'reason': 'offline'}
        
#         pending = self.db.get_pending_syncs(self.config['batch_size'])
        
#         if not pending:
#             return {'success': True, 'synced_count': 0}
        
#         logger.info(f"Pushing {len(pending)} changes to cloud")
        
#         # Push to cloud
#         result = self.cloud.push_changes(pending)
        
#         # Mark successful ones as synced
#         if result['success']:
#             for op in pending:
#                 self.db.mark_synced(op['id'], success=True)
#             logger.info(f"Successfully pushed {result['synced_count']} changes")
#         else:
#             logger.error(f"Push failed with {len(result['errors'])} errors")
        
#         return result
    
#     async def _pull_changes(self) -> Dict[str, Any]:
#         """Pull changes from cloud"""
#         if not await self._is_online():
#             return {'success': False, 'reason': 'offline'}
        
#         last_version = self.db.get_last_sync_version()
        
#         logger.info(f"Pulling changes since version {last_version}")
        
#         # Get tables to sync (all main tables that have version tracking)
#         tables = [
#             'students', 'staff', 'users', 'classes', 'sections', 
#             'academic_years', 'subjects', 'assessments', 'terms'
#         ]
        
#         result = self.cloud.pull_changes(last_version, tables)
        
#         if 'error' in result:
#             logger.error(f"Pull failed: {result['error']}")
#             return {'success': False, 'error': result['error']}
        
#         # Apply changes locally with conflict resolution
#         applied_count = 0
#         for record in result['records']:
#             table_name = record.pop('_table_name')
#             version = record.get('version', 1)
            
#             # Remove any sync-specific fields before saving
#             record.pop('synced_at', None)
#             record.pop('updated_by_sync', None)
            
#             if self.db.upsert_record(table_name, record, version):
#                 applied_count += 1
        
#         # Update last sync version
#         if result['new_version'] > last_version:
#             self.db.update_last_sync_version(result['new_version'])
        
#         logger.info(f"Applied {applied_count} changes from cloud (new version: {result['new_version']})")
        
#         # Update last sync time
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("""
#             INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
#             VALUES ('last_sync_time', ?, CURRENT_TIMESTAMP)
#         """, (datetime.now().isoformat(),))
#         conn.commit()
#         conn.close()
        
#         return {
#             'success': True,
#             'applied_count': applied_count,
#             'new_version': result['new_version']
#         }
    
#     async def _full_sync(self) -> Dict[str, Any]:
#         """Perform full sync (push + pull)"""
#         logger.info("Starting full sync")
        
#         push_result = await self._push_changes()
#         pull_result = await self._pull_changes()
        
#         result = {
#             'success': push_result.get('success', False) and pull_result.get('success', False),
#             'push': push_result,
#             'pull': pull_result,
#             'timestamp': datetime.now().isoformat()
#         }
        
#         # Notify callbacks
#         for callback in self._callbacks:
#             try:
#                 if asyncio.iscoroutinefunction(callback):
#                     await callback(result)
#                 else:
#                     callback(result)
#             except Exception as e:
#                 logger.error(f"Callback error: {e}")
        
#         logger.info(f"Full sync completed: {result['success']}")
#         return result
    
#     async def _is_online(self) -> bool:
#         """Check if cloud is reachable"""
#         return self.cloud.health_check()
    
#     # ========== TRIGGER METHODS ==========
    
#     def on_data_change(self, table_name: str, record_id: str, operation: str, data: Dict = None):
#         """Called on every write operation"""
#         try:
#             # Add to sync queue
#             queue_id = self.db.add_to_sync_queue(table_name, record_id, operation, data)
#             logger.debug(f"Added to sync queue: {operation} on {table_name} (ID: {queue_id})")
            
#             # Trigger immediate sync if online (non-blocking check)
#             if self._event_loop and self._event_loop.is_running():
#                 # Don't block here, just queue it
#                 self._sync_queue.put("immediate")
#         except Exception as e:
#             logger.error(f"Error in on_data_change: {e}", exc_info=True)
    
#     def on_app_start(self):
#         """Called when app starts"""
#         logger.info("App start - triggering full sync")
#         self._sync_queue.put("full")
    
#     def on_reconnect(self):
#         """Called when internet reconnects"""
#         logger.info("Network reconnected - triggering full sync")
#         self._sync_queue.put("full")
    
#     def on_user_login(self, user_id: int):
#         """Called when user logs in"""
#         logger.info(f"User {user_id} logged in - triggering sync")
#         self._sync_queue.put("full")
    
#     def add_callback(self, callback: Callable):
#         """Add callback for sync status updates"""
#         self._callbacks.append(callback)
    
#     def get_status(self) -> Dict[str, Any]:
#         """Get current sync status"""
#         return {
#             'is_running': self._is_running,
#             'pending_changes': self.db.get_pending_syncs_count() if hasattr(self.db, 'get_pending_syncs_count') else 0,
#             'queue_size': self._sync_queue.qsize(),
#             'config': self.config
#         }
    
#     def stop(self):
#         """Stop the sync scheduler"""
#         self._is_running = False
        
#         if self._background_task:
#             self._background_task.cancel()
        
#         if self._event_loop and self._event_loop.is_running():
#             self._event_loop.call_soon_threadsafe(self._event_loop.stop)
        
#         self.cloud.close()
#         logger.info("Sync scheduler stopped")




# app/sync/school_sync_scheduler.py
import asyncio
import threading
import logging
from typing import Callable, Optional, Dict, Any
from queue import Queue, Empty
from datetime import datetime
import time

logger = logging.getLogger(__name__)

# Import your existing modules
from app.activation.state import get_db_connection
from app.sync.sync_database import SyncDatabaseWrapper
from app.sync.cloud_adapter import SQLiteCloudAdapter

class SchoolSyncScheduler:
    """Enhanced sync scheduler with automatic mode switching based on network"""
    
    def __init__(self, cloud_connection_string: str, cloud_api_key: str = None):
        self.db = SyncDatabaseWrapper()
        self.cloud = SQLiteCloudAdapter(cloud_connection_string, cloud_api_key)
        self._sync_queue = Queue()
        self._is_running = False
        self._event_loop = None
        self._background_task = None
        self._processor_thread = None
        self._network_monitor_thread = None
        self._callbacks = []
        self._last_sync_time = 0
        self._min_sync_interval = 5
        self._pending_sync_request = False
        self._sync_lock = threading.Lock()
        self._current_network_status = True  # Assume online initially
        self._auto_mode_switching = True  # Enable automatic mode switching
        
        # Configuration
        self.config = {
            'sync_interval': 30,
            'batch_size': 50,
            'max_retries': 3,
            'retry_delays': [1, 5, 15, 30],
            'network_check_interval': 5,  # Check network every 5 seconds
            'auto_mode_switch': True,  # Automatically switch between online/offline
        }
    
    def start(self):
        """Start the sync scheduler"""
        if self._is_running:
            logger.warning("Sync scheduler already running")
            return
        
        self._is_running = True
        
        # Load current mode from database
        self._load_current_mode()
        
        # Create event loop in a separate thread
        def run_event_loop():
            self._event_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self._event_loop)
            self._event_loop.run_forever()
        
        loop_thread = threading.Thread(target=run_event_loop, daemon=True)
        loop_thread.start()
        
        # Wait for event loop to be created
        time.sleep(0.5)
        
        # Start background sync
        if self._event_loop:
            self._background_task = asyncio.run_coroutine_threadsafe(
                self._background_sync_loop(),
                self._event_loop
            )
        
        # Start immediate sync processor
        self._start_immediate_processor()
        
        # Start network monitor for automatic mode switching
        self._start_network_monitor()
        
        logger.info("School Sync Scheduler started with auto mode switching")
    
    def _load_current_mode(self):
        """Load current mode from database"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
            result = cursor.fetchone()
            conn.close()
            
            if result:
                current_mode = result['value']
                logger.info(f"Current system mode from database: {current_mode}")
            else:
                # Default to online mode
                self._set_system_mode("online")
        except Exception as e:
            logger.error(f"Failed to load current mode: {e}")
    
    def _set_system_mode(self, new_mode: str):
        """Set system mode in database"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO system_settings (key, value, updated_at)
                VALUES ('mode', ?, CURRENT_TIMESTAMP)
            """, (new_mode,))
            conn.commit()
            conn.close()
            logger.info(f"System mode set to: {new_mode}")
            
            # Notify callbacks about mode change
            for callback in self._callbacks:
                try:
                    callback({
                        'type': 'mode_change',
                        'mode': new_mode,
                        'timestamp': datetime.now().isoformat()
                    })
                except Exception as e:
                    logger.error(f"Callback error: {e}")
                    
        except Exception as e:
            logger.error(f"Failed to set system mode: {e}")
    
    def _start_network_monitor(self):
        """Start network monitoring thread for automatic mode switching"""
        def monitor_network():
            consecutive_failures = 0
            max_failures_before_offline = 2  # Switch to offline after 2 consecutive failures
            
            while self._is_running:
                try:
                    # Check network connectivity
                    is_online = self._check_network_sync()
                    
                    if is_online != self._current_network_status:
                        consecutive_failures = 0
                        self._current_network_status = is_online
                        
                        if is_online:
                            # Network restored - automatically switch to online mode
                            logger.info("🌐 Network restored! Switching to online mode...")
                            self._set_system_mode("online")
                            
                            # Trigger sync when coming back online
                            if self._event_loop and self._event_loop.is_running():
                                asyncio.run_coroutine_threadsafe(
                                    self._on_network_restored(),
                                    self._event_loop
                                )
                        else:
                            # Network lost - automatically switch to offline mode
                            logger.warning("📡 Network lost! Switching to offline mode...")
                            self._set_system_mode("offline")
                    
                    elif not is_online:
                        # Count consecutive failures
                        consecutive_failures += 1
                        if consecutive_failures >= max_failures_before_offline and self._current_network_status:
                            # Only switch if we were online and now have multiple failures
                            self._current_network_status = False
                            logger.warning(f"⚠️ Network appears offline after {consecutive_failures} checks. Switching to offline mode...")
                            self._set_system_mode("offline")
                    else:
                        # Online and stable
                        consecutive_failures = 0
                    
                except Exception as e:
                    logger.error(f"Network monitor error: {e}")
                
                time.sleep(self.config['network_check_interval'])
        
        self._network_monitor_thread = threading.Thread(target=monitor_network, daemon=True)
        self._network_monitor_thread.start()
        logger.info(f"Network monitor started (check interval: {self.config['network_check_interval']}s)")
    


    # def _check_network_sync(self) -> bool:
    #     """Synchronous network check"""
    #     try:
    #         # Try to reach cloud
    #         return self.cloud.health_check()
    #     except Exception as e:
    #         logger.debug(f"Network check failed: {e}")
    #         return False
    

    def _check_network_sync(self) -> bool:
        """Synchronous network check using multiple methods"""
        import socket
        
        # Try multiple DNS servers
        dns_servers = ["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]
        
        for dns in dns_servers:
            try:
                socket.create_connection((dns, 53), timeout=3)
                return True
            except:
                continue
        
        # Try HTTP request as fallback
        try:
            import urllib.request
            urllib.request.urlopen("https://www.google.com", timeout=5)
            return True
        except:
            try:
                urllib.request.urlopen("https://www.cloudflare.com", timeout=5)
                return True
            except:
                return False



    async def _is_online(self) -> bool:
        """Async network check"""
        try:
            # Use asyncio timeout to prevent blocking
            return await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(None, self._check_network_sync),
                timeout=5.0
            )
        except asyncio.TimeoutError:
            logger.debug("Cloud health check timeout")
            return False
        except Exception as e:
            logger.debug(f"Cloud health check error: {e}")
            return False
    
    async def _on_network_restored(self):
        """Handle network restored event"""
        logger.info("🔄 Network restored - checking for pending changes...")
        
        # Get current live mode setting
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
            result = cursor.fetchone()
            conn.close()
            
            live_mode = result['value'] == 'true' if result else True
            
            if live_mode:
                # Trigger sync to push pending changes
                logger.info("📤 Live mode enabled - syncing pending changes...")
                await self._full_sync()
            else:
                logger.info("💤 Live mode disabled - changes will sync when live mode is enabled")
        except Exception as e:
            logger.error(f"Error on network restored: {e}")
        
        # Notify frontend about status change
        for callback in self._callbacks:
            try:
                callback({
                    'type': 'network_restored',
                    'timestamp': datetime.now().isoformat()
                })
            except Exception as e:
                logger.error(f"Callback error: {e}")
    
    def _start_immediate_processor(self):
        """Process immediate sync requests with debouncing"""
        def processor():
            last_request_time = 0
            debounce_interval = 3
            
            while self._is_running:
                try:
                    self._sync_queue.get(timeout=1)
                    
                    current_time = time.time()
                    
                    if current_time - last_request_time >= debounce_interval:
                        last_request_time = current_time
                        
                        if self._event_loop and self._event_loop.is_running():
                            asyncio.run_coroutine_threadsafe(
                                self._debounced_sync(),
                                self._event_loop
                            )
                except Empty:
                    continue
                except Exception as e:
                    logger.error(f"Queue processor error: {e}", exc_info=True)
        
        self._processor_thread = threading.Thread(target=processor, daemon=True)
        self._processor_thread.start()
    
    async def _debounced_sync(self):
        """Handle debounced sync request"""
        with self._sync_lock:
            # Check current mode from database
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
                result = cursor.fetchone()
                conn.close()
                
                current_mode = result['value'] if result else "online"
                
                # Only sync if in online mode
                if current_mode != "online":
                    logger.debug("Sync skipped: System in offline mode")
                    return
                
                current_time = time.time()
                
                if current_time - self._last_sync_time >= self._min_sync_interval:
                    self._last_sync_time = current_time
                    await self._quick_sync()
            except Exception as e:
                logger.error(f"Debounced sync error: {e}")
    
    async def _quick_sync(self):
        """Quick sync - only push pending changes, no pull"""
        try:
            # Check if online and live mode enabled
            if not await self._is_online():
                return
            
            # Check live mode
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
                result = cursor.fetchone()
                conn.close()
                
                live_mode = result['value'] == 'true' if result else True
                
                if not live_mode:
                    logger.debug("Quick sync skipped: Live mode disabled")
                    return
            except Exception as e:
                logger.error(f"Error checking live mode: {e}")
                return
            
            pending_count = self.db.get_pending_syncs_count() if hasattr(self.db, 'get_pending_syncs_count') else 0
            
            if pending_count > 0:
                logger.info(f"Quick sync: Pushing {pending_count} pending changes")
                await self._push_changes()
        except Exception as e:
            logger.error(f"Quick sync error: {e}", exc_info=True)
    
    async def _background_sync_loop(self):
        """Background sync loop - less frequent, full sync"""
        sync_counter = 0
        
        while self._is_running:
            try:
                # Check current mode from database
                try:
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
                    result = cursor.fetchone()
                    conn.close()
                    
                    current_mode = result['value'] if result else "online"
                except Exception as e:
                    logger.error(f"Error getting mode: {e}")
                    current_mode = "online"
                
                if current_mode == "online" and await self._is_online():
                    # Check live mode
                    try:
                        conn = get_db_connection()
                        cursor = conn.cursor()
                        cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
                        result = cursor.fetchone()
                        conn.close()
                        
                        live_mode = result['value'] == 'true' if result else True
                    except Exception as e:
                        logger.error(f"Error getting live mode: {e}")
                        live_mode = True
                    
                    if live_mode:
                        # Only do full sync every few cycles
                        if sync_counter % 3 == 0:
                            logger.info("Background full sync starting...")
                            await self._full_sync()
                        else:
                            pending_count = self.db.get_pending_syncs_count() if hasattr(self.db, 'get_pending_syncs_count') else 0
                            if pending_count > 0:
                                logger.info(f"Background push sync: {pending_count} changes")
                                await self._push_changes()
                        
                        sync_counter += 1
                    else:
                        logger.debug("Background sync: Live mode disabled")
                else:
                    if current_mode != "online":
                        logger.debug("Background sync: System in offline mode")
                    sync_counter = 0
                
                await asyncio.sleep(self.config['sync_interval'])
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Background sync error: {e}", exc_info=True)
                await asyncio.sleep(10)
    
    async def _push_changes(self) -> Dict[str, Any]:
        """Push local changes to cloud"""
        if not await self._is_online():
            return {'success': False, 'reason': 'offline'}
        
        pending = self.db.get_pending_syncs(self.config['batch_size'])
        
        if not pending:
            return {'success': True, 'synced_count': 0}
        
        logger.info(f"Pushing {len(pending)} changes to cloud")
        
        # Push to cloud
        result = self.cloud.push_changes(pending)
        
        # Mark successful ones as synced
        if result['success']:
            for op in pending:
                self.db.mark_synced(op['id'], success=True)
            logger.info(f"Successfully pushed {result['synced_count']} changes")
        else:
            logger.error(f"Push failed with {len(result['errors'])} errors")
        
        return result
    
    async def _pull_changes(self) -> Dict[str, Any]:
        """Pull changes from cloud"""
        if not await self._is_online():
            return {'success': False, 'reason': 'offline'}
        
        last_version = self.db.get_last_sync_version()
        
        logger.info(f"Pulling changes since version {last_version}")
        
        # Get tables to sync
        tables = [
            'students', 'staff', 'users', 'classes', 'sections', 
            'academic_years', 'subjects', 'assessments', 'terms'
        ]
        
        result = self.cloud.pull_changes(last_version, tables)
        
        if 'error' in result:
            logger.error(f"Pull failed: {result['error']}")
            return {'success': False, 'error': result['error']}
        
        # Apply changes locally
        applied_count = 0
        for record in result['records']:
            table_name = record.pop('_table_name')
            version = record.get('version', 1)
            
            # Remove sync-specific fields
            record.pop('synced_at', None)
            record.pop('updated_by_sync', None)
            
            if self.db.upsert_record(table_name, record, version):
                applied_count += 1
        
        # Update last sync version
        if result['new_version'] > last_version:
            self.db.update_last_sync_version(result['new_version'])
        
        if applied_count > 0:
            logger.info(f"Applied {applied_count} changes from cloud (new version: {result['new_version']})")
        else:
            logger.debug(f"No new changes from cloud (version: {result['new_version']})")
        
        # Update last sync time
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
                VALUES ('last_sync_time', ?, CURRENT_TIMESTAMP)
            """, (datetime.now().isoformat(),))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to update sync time: {e}")
        
        return {
            'success': True,
            'applied_count': applied_count,
            'new_version': result['new_version']
        }
    
    async def _full_sync(self) -> Dict[str, Any]:
        """Perform full sync (push + pull)"""
        with self._sync_lock:
            logger.info("Starting full sync")
            
            push_result = await self._push_changes()
            await asyncio.sleep(1)
            pull_result = await self._pull_changes()
            
            result = {
                'success': push_result.get('success', False) and pull_result.get('success', False),
                'push': push_result,
                'pull': pull_result,
                'timestamp': datetime.now().isoformat()
            }
            
            # Notify callbacks
            for callback in self._callbacks:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(result)
                    else:
                        callback(result)
                except Exception as e:
                    logger.error(f"Callback error: {e}")
            
            logger.info(f"Full sync completed: {result['success']}")
            return result
    
    # ========== TRIGGER METHODS ==========
    
    def on_data_change(self, table_name: str, record_id: str, operation: str, data: Dict = None):
        """Called on every write operation"""
        try:
            # Add to sync queue
            queue_id = self.db.add_to_sync_queue(table_name, record_id, operation, data)
            logger.debug(f"Added to sync queue: {operation} on {table_name} (ID: {queue_id})")
            
            # Queue sync request (will be debounced)
            self._sync_queue.put("immediate")
        except Exception as e:
            logger.error(f"Error in on_data_change: {e}", exc_info=True)
    
    def on_app_start(self):
        """Called when app starts - delayed sync"""
        logger.info("App start - scheduling sync in 5 seconds")
        if self._event_loop and self._event_loop.is_running():
            asyncio.run_coroutine_threadsafe(
                self._delayed_sync(5),
                self._event_loop
            )
    
    def on_reconnect(self):
        """Called when internet reconnects"""
        logger.info("Network reconnected - triggering sync")
        self._sync_queue.put("full")
    
    def on_user_login(self, user_id: int):
        """Called when user logs in"""
        logger.info(f"User {user_id} logged in - triggering sync")
        self._sync_queue.put("full")
    
    async def _delayed_sync(self, delay_seconds: int):
        """Perform sync after delay"""
        await asyncio.sleep(delay_seconds)
        await self._full_sync()
    
    def add_callback(self, callback: Callable):
        """Add callback for sync status updates"""
        self._callbacks.append(callback)
    
    def get_network_status(self) -> Dict[str, Any]:
        """Get current network and mode status"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
            mode_result = cursor.fetchone()
            cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
            live_result = cursor.fetchone()
            conn.close()
        except Exception as e:
            logger.error(f"Error getting network status: {e}")
            return {
                'is_online': self._current_network_status,
                'system_mode': 'offline',
                'live_mode': False,
                'auto_switching_enabled': self.config['auto_mode_switch']
            }
        
        return {
            'is_online': self._current_network_status,
            'system_mode': mode_result['value'] if mode_result else "online",
            'live_mode': live_result['value'] == 'true' if live_result else True,
            'auto_switching_enabled': self.config['auto_mode_switch']
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get current sync status"""
        pending_count = 0
        try:
            pending_count = self.db.get_pending_syncs_count() if hasattr(self.db, 'get_pending_syncs_count') else 0
        except Exception as e:
            logger.error(f"Error getting pending count: {e}")
        
        return {
            'is_running': self._is_running,
            'pending_changes': pending_count,
            'queue_size': self._sync_queue.qsize(),
            'last_sync_time': self._last_sync_time,
            'config': self.config
        }
    
    def stop(self):
        """Stop the sync scheduler"""
        self._is_running = False
        
        if self._background_task:
            self._background_task.cancel()
        
        if self._event_loop and self._event_loop.is_running():
            self._event_loop.call_soon_threadsafe(self._event_loop.stop)
        
        self.cloud.close()
        logger.info("Sync scheduler stopped")