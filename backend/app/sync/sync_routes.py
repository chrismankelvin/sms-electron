# # app/routes/sync_routes.py
# """
# Sync and Mode Settings API Routes
# Exposes endpoints for frontend to manage sync operations and mode settings
# """

# from fastapi import APIRouter, HTTPException, BackgroundTasks
# from pydantic import BaseModel
# from typing import Dict, Any, Optional
# from datetime import datetime
# import asyncio

# import socket
# import requests
# from app.sync.school_sync_scheduler import SchoolSyncScheduler
# from app.sync.sync_integration import get_sync_scheduler, init_sync_system
# from app.activation.state import get_db_connection

# router = APIRouter(prefix="/api/sync", tags=["sync"])

# # Pydantic models for request/response
# class ModeSettingsRequest(BaseModel):
#     mode: str  # "online" or "offline"
#     live_mode: bool
#     sync_interval: Optional[int] = 10

# class SyncStatusResponse(BaseModel):
#     is_running: bool
#     last_sync: Optional[str]
#     pending_changes: int
#     mode: str
#     live_mode: bool
#     cloud_status: str
#     pending_queue_size: int

# class SyncTriggerResponse(BaseModel):
#     success: bool
#     message: str
#     synced_count: Optional[int] = None
#     timestamp: str

# # Global sync scheduler reference
# _sync_scheduler: Optional[SchoolSyncScheduler] = None

# def get_sync_scheduler_instance():
#     """Get or create sync scheduler instance"""
#     global _sync_scheduler
#     if _sync_scheduler is None:
#         # Initialize with cloud configuration
#         from app.config import CLOUD_CONNECTION_STRING, CLOUD_API_KEY
#         _sync_scheduler = init_sync_system(CLOUD_CONNECTION_STRING, CLOUD_API_KEY)
#     return _sync_scheduler

# # ============= MODE SETTINGS ENDPOINTS =============

# @router.get("/mode")
# async def get_mode_settings():
#     """Get current mode settings"""
#     scheduler = get_sync_scheduler_instance()
    
#     # Get mode from localStorage equivalent (stored in DB)
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         SELECT value FROM system_settings WHERE key = 'mode'
#     """)
#     mode_row = cursor.fetchone()
#     mode = mode_row['value'] if mode_row else "online"
    
#     cursor.execute("""
#         SELECT value FROM system_settings WHERE key = 'live_mode'
#     """)
#     live_row = cursor.fetchone()
#     live_mode = live_row['value'] == '1' if live_row else True
    
#     cursor.execute("""
#         SELECT value FROM system_settings WHERE key = 'sync_interval'
#     """)
#     interval_row = cursor.fetchone()
#     sync_interval = int(interval_row['value']) if interval_row else 10
    
#     conn.close()
    
#     return {
#         "success": True,
#         "data": {
#             "mode": mode,
#             "live_mode": live_mode,
#             "sync_interval": sync_interval,
#             "last_sync": get_last_sync_time(),
#             "pending_changes": get_pending_changes_count()
#         }
#     }

# @router.post("/mode")
# async def update_mode_settings(settings: ModeSettingsRequest, background_tasks: BackgroundTasks):
#     """Update mode settings"""
#     scheduler = get_sync_scheduler_instance()
    
#     # Save to database
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     # Update mode
#     cursor.execute("""
#         INSERT OR REPLACE INTO system_settings (key, value, updated_at)
#         VALUES ('mode', ?, CURRENT_TIMESTAMP)
#     """, (settings.mode,))
    
#     # Update live_mode
#     cursor.execute("""
#         INSERT OR REPLACE INTO system_settings (key, value, updated_at)
#         VALUES ('live_mode', ?, CURRENT_TIMESTAMP)
#     """, ('1' if settings.live_mode else '0',))
    
#     # Update sync_interval if provided
#     if settings.sync_interval:
#         cursor.execute("""
#             INSERT OR REPLACE INTO system_settings (key, value, updated_at)
#             VALUES ('sync_interval', ?, CURRENT_TIMESTAMP)
#         """, (str(settings.sync_interval),))
        
#         # Update scheduler interval if running
#         if scheduler:
#             scheduler.config['sync_interval'] = settings.sync_interval
    
#     conn.commit()
#     conn.close()
    
#     # If switching to online mode and live_mode is true, trigger sync
#     if settings.mode == "online" and settings.live_mode:
#         background_tasks.add_task(trigger_background_sync)
    
#     return {
#         "success": True,
#         "message": f"Mode set to {settings.mode} with {'live' if settings.live_mode else 'read-only'} mode",
#         "data": {
#             "mode": settings.mode,
#             "live_mode": settings.live_mode,
#             "sync_interval": settings.sync_interval
#         }
#     }


# # app/routes/sync_routes.py - Add these checks at the beginning of each endpoint

# from app.sync.sync_integration import is_sync_enabled, get_cloud_config_from_global_settings, refresh_sync_system

# @router.get("/status")
# async def get_sync_status():
#     """Get current sync system status"""
#     # Check if sync is enabled in global settings
#     if not is_sync_enabled():
#         # Get cloud config for more details
#         cloud_config = get_cloud_config_from_global_settings()
        
#         return {
#             "success": True,
#             "data": {
#                 "is_running": False,
#                 "last_sync": None,
#                 "pending_changes": 0,
#                 "mode": "offline",
#                 "live_mode": False,
#                 "cloud_status": "disabled",
#                 "pending_queue_size": 0,
#                 "message": "Sync module is disabled or not configured. Please enable it in Global Settings.",
#                 "config_status": {
#                     "sync_enabled": cloud_config is not None if cloud_config else False,
#                     "has_connection_string": bool(cloud_config.get('connection_string')) if cloud_config else False,
#                     "has_api_key": bool(cloud_config.get('api_key')) if cloud_config else False
#                 }
#             }
#         }
    
#     scheduler = get_sync_scheduler_instance()
    
#     # Check cloud connectivity
#     cloud_status = "unknown"
#     if scheduler:
#         try:
#             online = await scheduler._is_online()
#             cloud_status = "connected" if online else "disconnected"
#         except:
#             cloud_status = "error"
    
#     # Get pending queue size
#     pending_count = get_pending_changes_count()
    
#     # Get mode from DB
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
#     mode_row = cursor.fetchone()
#     cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
#     live_row = cursor.fetchone()
#     conn.close()
    
#     return {
#         "success": True,
#         "data": {
#             "is_running": scheduler is not None and scheduler._is_running,
#             "last_sync": get_last_sync_time(),
#             "pending_changes": pending_count,
#             "mode": mode_row['value'] if mode_row else "online",
#             "live_mode": live_row['value'] == '1' if live_row else True,
#             "cloud_status": cloud_status,
#             "pending_queue_size": pending_count
#         }
#     }

# @router.post("/trigger")
# async def trigger_sync(background_tasks: BackgroundTasks, sync_type: str = "full"):
#     """Manually trigger sync - only if enabled in global settings"""
    
#     # Check if sync is enabled in global settings
#     if not is_sync_enabled():
#         return {
#             "success": False,
#             "message": "Sync module is disabled or not configured. Please enable it in Global Settings first.",
#             "timestamp": datetime.now().isoformat()
#         }
    
#     scheduler = get_sync_scheduler_instance()
    
#     if not scheduler:
#         # Try to initialize sync system
#         scheduler = init_sync_system()
#         if not scheduler:
#             return {
#                 "success": False,
#                 "message": "Failed to initialize sync system. Check your configuration.",
#                 "timestamp": datetime.now().isoformat()
#             }
    
#     # Check if online using internet connectivity test
#     is_online = check_internet_sync()
    
#     if not is_online:
#         return {
#             "success": False,
#             "message": "No internet connection. Cannot sync at this time.",
#             "timestamp": datetime.now().isoformat()
#         }
    
#     # Trigger sync in background
#     background_tasks.add_task(execute_sync, sync_type)
    
#     return {
#         "success": True,
#         "message": f"Sync triggered: {sync_type} sync started",
#         "timestamp": datetime.now().isoformat()
#     }

# @router.post("/refresh")
# async def refresh_sync():
#     """Refresh sync system when settings change"""
#     result = refresh_sync_system()
    
#     if result:
#         return {
#             "success": True,
#             "message": "Sync system refreshed successfully",
#             "timestamp": datetime.now().isoformat()
#         }
#     else:
#         return {
#             "success": False,
#             "message": "Sync system not configured or disabled",
#             "timestamp": datetime.now().isoformat()
#         }


# # Add to sync_routes.py

# # @router.get("/network/status")
# # async def get_network_status():
# #     """Get current network status and system mode"""
# #     scheduler = get_sync_scheduler_instance()
    
# #     if scheduler:
# #         status = scheduler.get_network_status()
# #     else:
# #         # Fallback to database query
# #         conn = get_db_connection()
# #         cursor = conn.cursor()
# #         cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
# #         mode_result = cursor.fetchone()
# #         cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
# #         live_result = cursor.fetchone()
# #         conn.close()
        
# #         status = {
# #             'is_online': False,
# #             'system_mode': mode_result['value'] if mode_result else "online",
# #             'live_mode': live_result['value'] == 'true' if live_result else True,
# #             'auto_switching_enabled': True
# #         }
    
# #     return {
# #         "success": True,
# #         "data": status,
# #         "timestamp": datetime.now().isoformat()
# #     }


# # Add to sync_routes.py

# import socket
# import requests
# # import socket
# import aiohttp
# import asyncio


# # async def check_internet_connectivity_sync() -> bool:
# #     """Check internet connectivity by trying multiple methods"""
    
# #     # Method 1: Try to connect to Google DNS (fastest)
# #     try:
# #         loop = asyncio.get_event_loop()
# #         await loop.run_in_executor(
# #             None,
# #             lambda: socket.create_connection(("8.8.8.8", 53), timeout=3)
# #         )
# #         return True
# #     except:
# #         pass
    
# #     # Method 2: Try to connect to Cloudflare DNS
# #     try:
# #         loop = asyncio.get_event_loop()
# #         await loop.run_in_executor(
# #             None,
# #             lambda: socket.create_connection(("1.1.1.1", 53), timeout=3)
# #         )
# #         return True
# #     except:
# #         pass
    
# #     # Method 3: Try HTTP request to Google
# #     try:
# #         async with aiohttp.ClientSession() as session:
# #             async with session.get("https://www.google.com", timeout=5) as response:
# #                 if response.status == 200:
# #                     return True
# #     except:
# #         pass
    
# #     # Method 4: Try HTTP request to Cloudflare
# #     try:
# #         async with aiohttp.ClientSession() as session:
# #             async with session.get("https://www.cloudflare.com", timeout=5) as response:
# #                 if response.status == 200:
# #                     return True
# #     except:
# #         pass
    
# #     return False


# # @router.get("/network/status")
# # async def get_network_status():
# #     """Get current network status and system mode"""
    
# #     # Check actual network connectivity
# #     is_online = check_internet_connectivity_sync()
    
# #     scheduler = get_sync_scheduler_instance()
    
# #     if scheduler:
# #         # Update scheduler's network status
# #         scheduler._current_network_status = is_online
# #         status = scheduler.get_network_status()
# #         status['is_online'] = is_online
# #     else:
# #         # Fallback to database query
# #         conn = get_db_connection()
# #         cursor = conn.cursor()
# #         cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
# #         mode_result = cursor.fetchone()
# #         cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
# #         live_result = cursor.fetchone()
# #         conn.close()
        
# #         status = {
# #             'is_online': is_online,
# #             'system_mode': mode_result['value'] if mode_result else "online",
# #             'live_mode': live_result['value'] == 'true' if live_result else True,
# #             'auto_switching_enabled': True
# #         }
    
# #     # Auto-switch mode based on network status
# #     if status.get('auto_switching_enabled', True):
# #         current_mode = status.get('system_mode', 'online')
        
# #         if not is_online and current_mode == 'online':
# #             # Switch to offline mode
# #             conn = get_db_connection()
# #             cursor = conn.cursor()
# #             cursor.execute("""
# #                 UPDATE system_settings 
# #                 SET value = 'offline', updated_at = CURRENT_TIMESTAMP
# #                 WHERE key = 'mode'
# #             """)
# #             conn.commit()
# #             conn.close()
# #             status['system_mode'] = 'offline'
# #             # logger.info("Auto-switched to offline mode - no internet connection")
            
# #         elif is_online and current_mode == 'offline':
# #             # Switch to online mode
# #             conn = get_db_connection()
# #             cursor = conn.cursor()
# #             cursor.execute("""
# #                 UPDATE system_settings 
# #                 SET value = 'online', updated_at = CURRENT_TIMESTAMP
# #                 WHERE key = 'mode'
# #             """)
# #             conn.commit()
# #             conn.close()
# #             status['system_mode'] = 'online'
# #             # logger.info("Auto-switched to online mode - internet connection restored")
    
# #     return {
# #         "success": True,
# #         "data": status,
# #         "timestamp": datetime.now().isoformat()
# #     }


# # @router.get("/network/ping")
# # async def ping_test():
# #     """Simple endpoint to test internet connectivity"""
# #     is_online = check_internet_connectivity_sync()
# #     return {
# #         "success": True,
# #         "online": is_online,
# #         "details": {
# #             "google_ping": is_online,
# #             "timestamp": datetime.now().isoformat()
# #         }
# #     }


# def check_internet_sync() -> bool:
#     """Synchronous internet check that actually works"""
#     try:
#         # Try Google DNS first (fastest)
#         socket.create_connection(("8.8.8.8", 53), timeout=3)
#         print("✅ DNS: Connected to 8.8.8.8")
#         return True
#     except Exception as e:
#         print(f"❌ DNS failed: {e}")
    
#     try:
#         # Try Cloudflare DNS
#         socket.create_connection(("1.1.1.1", 53), timeout=3)
#         print("✅ DNS: Connected to 1.1.1.1")
#         return True
#     except Exception as e:
#         print(f"❌ DNS failed: {e}")
    
#     try:
#         # Try HTTP request as fallback
#         import urllib.request
#         urllib.request.urlopen("https://www.google.com", timeout=5)
#         print("✅ HTTP: Connected to google.com")
#         return True
#     except Exception as e:
#         print(f"❌ HTTP failed: {e}")
    
#     print("❌ All connection methods failed")
#     return False


# @router.get("/network/status")
# async def get_network_status():
#     """Get current network status and system mode"""
    
#     # Check actual internet connectivity using synchronous method
#     is_online = check_internet_sync()
    
#     print(f"📡 Network status check result: is_online={is_online}")
    
#     scheduler = get_sync_scheduler_instance()
    
#     if scheduler:
#         # Update scheduler's network status
#         scheduler._current_network_status = is_online
#         status = scheduler.get_network_status()
#         status['is_online'] = is_online
#     else:
#         # Fallback to database query
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
#         mode_result = cursor.fetchone()
#         cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
#         live_result = cursor.fetchone()
#         conn.close()
        
#         status = {
#             'is_online': is_online,
#             'system_mode': mode_result['value'] if mode_result else "online",
#             'live_mode': live_result['value'] == 'true' if live_result else True,
#             'auto_switching_enabled': True
#         }
    
#     # Auto-switch mode based on network status
#     if status.get('auto_switching_enabled', True):
#         current_mode = status.get('system_mode', 'online')
        
#         if not is_online and current_mode == 'online':
#             # Switch to offline mode
#             conn = get_db_connection()
#             cursor = conn.cursor()
#             cursor.execute("""
#                 UPDATE system_settings 
#                 SET value = 'offline', updated_at = CURRENT_TIMESTAMP
#                 WHERE key = 'mode'
#             """)
#             conn.commit()
#             conn.close()
#             status['system_mode'] = 'offline'
#             print("⚠️ Auto-switched to offline mode - no internet connection")
            
#         elif is_online and current_mode == 'offline':
#             # Switch to online mode
#             conn = get_db_connection()
#             cursor = conn.cursor()
#             cursor.execute("""
#                 UPDATE system_settings 
#                 SET value = 'online', updated_at = CURRENT_TIMESTAMP
#                 WHERE key = 'mode'
#             """)
#             conn.commit()
#             conn.close()
#             status['system_mode'] = 'online'
#             print("✅ Auto-switched to online mode - internet connection restored")
    
#     return {
#         "success": True,
#         "data": status,
#         "timestamp": datetime.now().isoformat()
#     }


# @router.get("/network/ping")
# async def ping_test():
#     """Simple endpoint to test internet connectivity"""
#     is_online = check_internet_sync()
#     return {
#         "success": True,
#         "online": is_online,
#         "details": {
#             "google_ping": is_online,
#             "timestamp": datetime.now().isoformat()
#         }
#     }


# # ============= SYNC CONTROL ENDPOINTS =============

# @router.get("/status")
# async def get_sync_status():
#     """Get current sync system status"""
#     scheduler = get_sync_scheduler_instance()
    
#     # Check cloud connectivity
#     cloud_status = "unknown"
#     if scheduler:
#         try:
#             online = await scheduler._is_online()
#             cloud_status = "connected" if online else "disconnected"
#         except:
#             cloud_status = "error"
    
#     # Get pending queue size
#     pending_count = get_pending_changes_count()
    
#     # Get mode from DB
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
#     mode_row = cursor.fetchone()
#     cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
#     live_row = cursor.fetchone()
#     conn.close()
    
#     return {
#         "success": True,
#         "data": {
#             "is_running": scheduler is not None and scheduler._is_running,
#             "last_sync": get_last_sync_time(),
#             "pending_changes": pending_count,
#             "mode": mode_row['value'] if mode_row else "online",
#             "live_mode": live_row['value'] == '1' if live_row else True,
#             "cloud_status": cloud_status,
#             "pending_queue_size": pending_count
#         }
#     }




# # @router.post("/trigger")
# # async def trigger_sync(background_tasks: BackgroundTasks, sync_type: str = "full"):
# #     """Manually trigger sync - just check connection and sync"""
# #     scheduler = get_sync_scheduler_instance()
    
# #     if not scheduler:
# #         raise HTTPException(status_code=500, detail="Sync system not initialized")
    
# #     # Check if online using internet connectivity test
# #     is_online = check_internet_sync()
    
# #     if not is_online:
# #         return {
# #             "success": False,
# #             "message": "No internet connection. Cannot sync at this time.",
# #             "timestamp": datetime.now().isoformat()
# #         }
    
# #     # Trigger sync in background
# #     background_tasks.add_task(execute_sync, sync_type)
    
# #     return {
# #         "success": True,
# #         "message": f"Sync triggered: {sync_type} sync started",
# #         "timestamp": datetime.now().isoformat()
# #     }




# @router.post("/pause")
# async def pause_sync():
#     """Pause background sync"""
#     scheduler = get_sync_scheduler_instance()
    
#     if scheduler and scheduler._is_running:
#         scheduler.stop()
#         return {
#             "success": True,
#             "message": "Sync system paused",
#             "timestamp": datetime.now().isoformat()
#         }
    
#     return {
#         "success": False,
#         "message": "Sync system is not running",
#         "timestamp": datetime.now().isoformat()
#     }

# @router.post("/resume")
# async def resume_sync():
#     """Resume background sync"""
#     scheduler = get_sync_scheduler_instance()
    
#     if scheduler and not scheduler._is_running:
#         scheduler.start()
#         return {
#             "success": True,
#             "message": "Sync system resumed",
#             "timestamp": datetime.now().isoformat()
#         }
    
#     return {
#         "success": False,
#         "message": "Sync system is already running",
#         "timestamp": datetime.now().isoformat()
#     }

# # In sync_routes.py
# @router.post("/mode/live/enable")
# async def enable_live_mode():
#     """Enable live mode to start syncing"""
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("""
#         UPDATE system_settings 
#         SET value = 'true', updated_at = CURRENT_TIMESTAMP
#         WHERE key = 'live_mode'
#     """)
#     conn.commit()
#     conn.close()
    
#     return {
#         "success": True,
#         "message": "Live mode enabled. Synchronization will now occur.",
#         "timestamp": datetime.now().isoformat()
#     }

#     # Add to sync_routes.py
# @router.get("/network/check")
# async def check_network():
#     """Quick network connectivity check"""
#     scheduler = get_sync_scheduler_instance()
    
#     if scheduler:
#         is_online = await scheduler._is_online()
#         return {
#             "success": True,
#             "online": is_online,
#             "timestamp": datetime.now().isoformat()
#         }
    
#     return {
#         "success": False,
#         "online": False,
#         "message": "Sync system not initialized"
#     }

# # ============= QUEUE MANAGEMENT ENDPOINTS =============

# @router.get("/queue")
# async def get_sync_queue(limit: int = 50):
#     """Get pending sync queue items"""
#     scheduler = get_sync_scheduler_instance()
    
#     if not scheduler:
#         raise HTTPException(status_code=500, detail="Sync system not initialized")
    
#     pending = scheduler.db.get_pending_syncs(limit)
    
#     return {
#         "success": True,
#         "data": {
#             "total": len(pending),
#             "items": pending,
#             "limit": limit
#         }
#     }

# @router.delete("/queue/{queue_id}")
# async def remove_from_queue(queue_id: int):
#     """Remove specific item from sync queue"""
#     scheduler = get_sync_scheduler_instance()
    
#     if not scheduler:
#         raise HTTPException(status_code=500, detail="Sync system not initialized")
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("DELETE FROM sync_queue WHERE id = ?", (queue_id,))
#     conn.commit()
#     conn.close()
    
#     return {
#         "success": True,
#         "message": f"Item {queue_id} removed from queue",
#         "timestamp": datetime.now().isoformat()
#     }

# @router.delete("/queue/clear")
# async def clear_sync_queue():
#     """Clear all pending sync queue items"""
#     scheduler = get_sync_scheduler_instance()
    
#     if not scheduler:
#         raise HTTPException(status_code=500, detail="Sync system not initialized")
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("DELETE FROM sync_queue WHERE synced = 0")
#     deleted = cursor.rowcount
#     conn.commit()
#     conn.close()
    
#     return {
#         "success": True,
#         "message": f"Cleared {deleted} pending items from queue",
#         "deleted_count": deleted,
#         "timestamp": datetime.now().isoformat()
#     }

# # ============= HELPER FUNCTIONS =============

# def get_last_sync_time() -> Optional[str]:
#     """Get last successful sync time from database"""
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("""
#         SELECT value FROM sync_metadata WHERE key = 'last_sync_time'
#     """)
#     result = cursor.fetchone()
#     conn.close()
#     return result['value'] if result else None

# def get_pending_changes_count() -> int:
#     """Get count of pending changes in sync queue"""
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT COUNT(*) as count FROM sync_queue WHERE synced = 0")
#     result = cursor.fetchone()
#     conn.close()
#     return result['count'] if result else 0

# async def execute_sync(sync_type: str):
#     """Execute sync operation (background task)"""
#     scheduler = get_sync_scheduler_instance()
    
#     if not scheduler:
#         return
    
#     try:
#         if sync_type == "full":
#             result = await scheduler._full_sync()
#         elif sync_type == "push":
#             result = await scheduler._push_changes()
#         elif sync_type == "pull":
#             result = await scheduler._pull_changes()
#         else:
#             result = await scheduler._full_sync()
        
#         # Update last sync time in database
#         if result.get('success'):
#             conn = get_db_connection()
#             cursor = conn.cursor()
#             cursor.execute("""
#                 INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
#                 VALUES ('last_sync_time', ?, CURRENT_TIMESTAMP)
#             """, (datetime.now().isoformat(),))
#             conn.commit()
#             conn.close()
            
#     except Exception as e:
#         print(f"Background sync error: {e}")

# async def trigger_background_sync():
#     """Trigger background sync (used from background_tasks)"""
#     await execute_sync("full")

# # ============= WEBHOOK FOR CLOUD NOTIFICATIONS =============

# class CloudWebhookPayload(BaseModel):
#     event_type: str  # "data_changed", "schema_updated", "sync_requested"
#     table_name: Optional[str] = None
#     record_id: Optional[str] = None
#     timestamp: str

# @router.post("/webhook/cloud")
# async def cloud_webhook(payload: CloudWebhookPayload, background_tasks: BackgroundTasks):
#     """
#     Webhook endpoint for cloud to notify about changes
#     This allows cloud to push changes to local when updates happen
#     """
#     scheduler = get_sync_scheduler_instance()
    
#     if not scheduler:
#         return {"success": False, "message": "Sync system not initialized"}
    
#     # Trigger sync based on event type
#     if payload.event_type == "data_changed":
#         background_tasks.add_task(execute_sync, "pull")
#     elif payload.event_type == "sync_requested":
#         background_tasks.add_task(execute_sync, "full")
    
#     return {
#         "success": True,
#         "message": f"Webhook received: {payload.event_type}",
#         "timestamp": datetime.now().isoformat()
#     }














# app/routes/sync_routes.py
"""
Sync and Mode Settings API Routes
Exposes endpoints for frontend to manage sync operations and mode settings
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import asyncio
import socket
import urllib.request

from app.sync.school_sync_scheduler import SchoolSyncScheduler
from app.sync.sync_integration import get_sync_scheduler, init_sync_system, is_sync_enabled, get_cloud_config_from_global_settings, refresh_sync_system
from app.activation.state import get_db_connection

router = APIRouter(prefix="/api/sync", tags=["sync"])

# Pydantic models for request/response
class ModeSettingsRequest(BaseModel):
    mode: str  # "online" or "offline"
    live_mode: bool
    sync_interval: Optional[int] = 10

class SyncStatusResponse(BaseModel):
    is_running: bool
    last_sync: Optional[str]
    pending_changes: int
    mode: str
    live_mode: bool
    cloud_status: str
    pending_queue_size: int

class SyncTriggerResponse(BaseModel):
    success: bool
    message: str
    synced_count: Optional[int] = None
    timestamp: str

# Global sync scheduler reference
_sync_scheduler: Optional[SchoolSyncScheduler] = None

def get_sync_scheduler_instance():
    """Get or create sync scheduler instance"""
    global _sync_scheduler
    if _sync_scheduler is None:
        # Initialize sync system (reads from global settings)
        _sync_scheduler = init_sync_system()
    return _sync_scheduler

# ============= HELPER FUNCTIONS =============

def check_internet_sync() -> bool:
    """Synchronous internet check that actually works"""
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        print("✅ DNS: Connected to 8.8.8.8")
        return True
    except Exception as e:
        print(f"❌ DNS failed: {e}")
    
    try:
        socket.create_connection(("1.1.1.1", 53), timeout=3)
        print("✅ DNS: Connected to 1.1.1.1")
        return True
    except Exception as e:
        print(f"❌ DNS failed: {e}")
    
    try:
        urllib.request.urlopen("https://www.google.com", timeout=5)
        print("✅ HTTP: Connected to google.com")
        return True
    except Exception as e:
        print(f"❌ HTTP failed: {e}")
    
    print("❌ All connection methods failed")
    return False

def get_last_sync_time() -> Optional[str]:
    """Get last successful sync time from database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT value FROM sync_metadata WHERE key = 'last_sync_time'
    """)
    result = cursor.fetchone()
    conn.close()
    return result['value'] if result else None

def get_pending_changes_count() -> int:
    """Get count of pending changes in sync queue"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM sync_queue WHERE synced = 0")
    result = cursor.fetchone()
    conn.close()
    return result['count'] if result else 0

async def execute_sync(sync_type: str):
    """Execute sync operation (background task)"""
    scheduler = get_sync_scheduler_instance()
    
    if not scheduler:
        return
    
    try:
        if sync_type == "full":
            result = await scheduler._full_sync()
        elif sync_type == "push":
            result = await scheduler._push_changes()
        elif sync_type == "pull":
            result = await scheduler._pull_changes()
        else:
            result = await scheduler._full_sync()
        
        # Update last sync time in database
        if result.get('success'):
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
                VALUES ('last_sync_time', ?, CURRENT_TIMESTAMP)
            """, (datetime.now().isoformat(),))
            conn.commit()
            conn.close()
            
    except Exception as e:
        print(f"Background sync error: {e}")

async def trigger_background_sync():
    """Trigger background sync (used from background_tasks)"""
    await execute_sync("full")

# ============= MODE SETTINGS ENDPOINTS =============

@router.get("/mode")
async def get_mode_settings():
    """Get current mode settings"""
    scheduler = get_sync_scheduler_instance()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
    mode_row = cursor.fetchone()
    mode = mode_row['value'] if mode_row else "online"
    
    cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
    live_row = cursor.fetchone()
    live_mode = live_row['value'] == '1' if live_row else True
    
    cursor.execute("SELECT value FROM system_settings WHERE key = 'sync_interval'")
    interval_row = cursor.fetchone()
    sync_interval = int(interval_row['value']) if interval_row else 10
    
    conn.close()
    
    return {
        "success": True,
        "data": {
            "mode": mode,
            "live_mode": live_mode,
            "sync_interval": sync_interval,
            "last_sync": get_last_sync_time(),
            "pending_changes": get_pending_changes_count()
        }
    }

@router.post("/mode")
async def update_mode_settings(settings: ModeSettingsRequest, background_tasks: BackgroundTasks):
    """Update mode settings"""
    scheduler = get_sync_scheduler_instance()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update mode
    cursor.execute("""
        INSERT OR REPLACE INTO system_settings (key, value, updated_at)
        VALUES ('mode', ?, CURRENT_TIMESTAMP)
    """, (settings.mode,))
    
    # Update live_mode
    cursor.execute("""
        INSERT OR REPLACE INTO system_settings (key, value, updated_at)
        VALUES ('live_mode', ?, CURRENT_TIMESTAMP)
    """, ('1' if settings.live_mode else '0',))
    
    # Update sync_interval if provided
    if settings.sync_interval:
        cursor.execute("""
            INSERT OR REPLACE INTO system_settings (key, value, updated_at)
            VALUES ('sync_interval', ?, CURRENT_TIMESTAMP)
        """, (str(settings.sync_interval),))
        
        if scheduler:
            scheduler.config['sync_interval'] = settings.sync_interval
    
    conn.commit()
    conn.close()
    
    if settings.mode == "online" and settings.live_mode:
        background_tasks.add_task(trigger_background_sync)
    
    return {
        "success": True,
        "message": f"Mode set to {settings.mode} with {'live' if settings.live_mode else 'read-only'} mode",
        "data": {
            "mode": settings.mode,
            "live_mode": settings.live_mode,
            "sync_interval": settings.sync_interval
        }
    }

# ============= NETWORK STATUS ENDPOINTS =============

@router.get("/network/status")
async def get_network_status():
    """Get current network status and system mode"""
    
    is_online = check_internet_sync()
    print(f"📡 Network status check result: is_online={is_online}")
    
    scheduler = get_sync_scheduler_instance()
    
    if scheduler:
        scheduler._current_network_status = is_online
        status = scheduler.get_network_status()
        status['is_online'] = is_online
    else:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
        mode_result = cursor.fetchone()
        cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
        live_result = cursor.fetchone()
        conn.close()
        
        status = {
            'is_online': is_online,
            'system_mode': mode_result['value'] if mode_result else "online",
            'live_mode': live_result['value'] == 'true' if live_result else True,
            'auto_switching_enabled': True
        }
    
    # Auto-switch mode based on network status
    if status.get('auto_switching_enabled', True):
        current_mode = status.get('system_mode', 'online')
        
        if not is_online and current_mode == 'online':
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE system_settings 
                SET value = 'offline', updated_at = CURRENT_TIMESTAMP
                WHERE key = 'mode'
            """)
            conn.commit()
            conn.close()
            status['system_mode'] = 'offline'
            print("⚠️ Auto-switched to offline mode - no internet connection")
            
        elif is_online and current_mode == 'offline':
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE system_settings 
                SET value = 'online', updated_at = CURRENT_TIMESTAMP
                WHERE key = 'mode'
            """)
            conn.commit()
            conn.close()
            status['system_mode'] = 'online'
            print("✅ Auto-switched to online mode - internet connection restored")
    
    return {
        "success": True,
        "data": status,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/network/ping")
async def ping_test():
    """Simple endpoint to test internet connectivity"""
    is_online = check_internet_sync()
    return {
        "success": True,
        "online": is_online,
        "details": {
            "google_ping": is_online,
            "timestamp": datetime.now().isoformat()
        }
    }

@router.get("/network/check")
async def check_network():
    """Quick network connectivity check"""
    scheduler = get_sync_scheduler_instance()
    
    if scheduler:
        is_online = await scheduler._is_online()
        return {
            "success": True,
            "online": is_online,
            "timestamp": datetime.now().isoformat()
        }
    
    return {
        "success": False,
        "online": False,
        "message": "Sync system not initialized"
    }

# ============= SYNC CONTROL ENDPOINTS =============

@router.get("/status")
async def get_sync_status():
    """Get current sync system status"""
    
    # Check if sync is enabled in global settings
    if not is_sync_enabled():
        cloud_config = get_cloud_config_from_global_settings()
        
        return {
            "success": True,
            "data": {
                "is_running": False,
                "last_sync": None,
                "pending_changes": 0,
                "mode": "offline",
                "live_mode": False,
                "cloud_status": "disabled",
                "pending_queue_size": 0,
                "message": "Sync module is disabled or not configured. Please enable it in Global Settings.",
                "config_status": {
                    "sync_enabled": cloud_config is not None if cloud_config else False,
                    "has_connection_string": bool(cloud_config.get('connection_string')) if cloud_config else False,
                    "has_api_key": bool(cloud_config.get('api_key')) if cloud_config else False
                }
            }
        }
    
    scheduler = get_sync_scheduler_instance()
    
    cloud_status = "unknown"
    if scheduler:
        try:
            online = await scheduler._is_online()
            cloud_status = "connected" if online else "disconnected"
        except:
            cloud_status = "error"
    
    pending_count = get_pending_changes_count()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM system_settings WHERE key = 'mode'")
    mode_row = cursor.fetchone()
    cursor.execute("SELECT value FROM system_settings WHERE key = 'live_mode'")
    live_row = cursor.fetchone()
    conn.close()
    
    return {
        "success": True,
        "data": {
            "is_running": scheduler is not None and scheduler._is_running,
            "last_sync": get_last_sync_time(),
            "pending_changes": pending_count,
            "mode": mode_row['value'] if mode_row else "online",
            "live_mode": live_row['value'] == '1' if live_row else True,
            "cloud_status": cloud_status,
            "pending_queue_size": pending_count
        }
    }

@router.post("/trigger")
async def trigger_sync(background_tasks: BackgroundTasks, sync_type: str = "full"):
    """Manually trigger sync - only if enabled in global settings"""
    
    if not is_sync_enabled():
        return {
            "success": False,
            "message": "Sync module is disabled or not configured. Please enable it in Global Settings first.",
            "timestamp": datetime.now().isoformat()
        }
    
    scheduler = get_sync_scheduler_instance()
    
    if not scheduler:
        scheduler = init_sync_system()
        if not scheduler:
            return {
                "success": False,
                "message": "Failed to initialize sync system. Check your configuration.",
                "timestamp": datetime.now().isoformat()
            }
    
    is_online = check_internet_sync()
    
    if not is_online:
        return {
            "success": False,
            "message": "No internet connection. Cannot sync at this time.",
            "timestamp": datetime.now().isoformat()
        }
    
    background_tasks.add_task(execute_sync, sync_type)
    
    return {
        "success": True,
        "message": f"Sync triggered: {sync_type} sync started",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/refresh")
async def refresh_sync():
    """Refresh sync system when settings change"""
    result = refresh_sync_system()
    
    if result:
        return {
            "success": True,
            "message": "Sync system refreshed successfully",
            "timestamp": datetime.now().isoformat()
        }
    else:
        return {
            "success": False,
            "message": "Sync system not configured or disabled",
            "timestamp": datetime.now().isoformat()
        }

@router.post("/pause")
async def pause_sync():
    """Pause background sync"""
    scheduler = get_sync_scheduler_instance()
    
    if scheduler and scheduler._is_running:
        scheduler.stop()
        return {
            "success": True,
            "message": "Sync system paused",
            "timestamp": datetime.now().isoformat()
        }
    
    return {
        "success": False,
        "message": "Sync system is not running",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/resume")
async def resume_sync():
    """Resume background sync"""
    scheduler = get_sync_scheduler_instance()
    
    if scheduler and not scheduler._is_running:
        scheduler.start()
        return {
            "success": True,
            "message": "Sync system resumed",
            "timestamp": datetime.now().isoformat()
        }
    
    return {
        "success": False,
        "message": "Sync system is already running",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/mode/live/enable")
async def enable_live_mode():
    """Enable live mode to start syncing"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE system_settings 
        SET value = 'true', updated_at = CURRENT_TIMESTAMP
        WHERE key = 'live_mode'
    """)
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "message": "Live mode enabled. Synchronization will now occur.",
        "timestamp": datetime.now().isoformat()
    }

# ============= QUEUE MANAGEMENT ENDPOINTS =============

@router.get("/queue")
async def get_sync_queue(limit: int = 50):
    """Get pending sync queue items"""
    scheduler = get_sync_scheduler_instance()
    
    if not scheduler:
        raise HTTPException(status_code=500, detail="Sync system not initialized")
    
    pending = scheduler.db.get_pending_syncs(limit)
    
    return {
        "success": True,
        "data": {
            "total": len(pending),
            "items": pending,
            "limit": limit
        }
    }

@router.delete("/queue/{queue_id}")
async def remove_from_queue(queue_id: int):
    """Remove specific item from sync queue"""
    scheduler = get_sync_scheduler_instance()
    
    if not scheduler:
        raise HTTPException(status_code=500, detail="Sync system not initialized")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sync_queue WHERE id = ?", (queue_id,))
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "message": f"Item {queue_id} removed from queue",
        "timestamp": datetime.now().isoformat()
    }

@router.delete("/queue/clear")
async def clear_sync_queue():
    """Clear all pending sync queue items"""
    scheduler = get_sync_scheduler_instance()
    
    if not scheduler:
        raise HTTPException(status_code=500, detail="Sync system not initialized")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sync_queue WHERE synced = 0")
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "message": f"Cleared {deleted} pending items from queue",
        "deleted_count": deleted,
        "timestamp": datetime.now().isoformat()
    }

# ============= WEBHOOK FOR CLOUD NOTIFICATIONS =============

class CloudWebhookPayload(BaseModel):
    event_type: str
    table_name: Optional[str] = None
    record_id: Optional[str] = None
    timestamp: str

@router.post("/webhook/cloud")
async def cloud_webhook(payload: CloudWebhookPayload, background_tasks: BackgroundTasks):
    """Webhook endpoint for cloud to notify about changes"""
    scheduler = get_sync_scheduler_instance()
    
    if not scheduler:
        return {"success": False, "message": "Sync system not initialized"}
    
    if payload.event_type == "data_changed":
        background_tasks.add_task(execute_sync, "pull")
    elif payload.event_type == "sync_requested":
        background_tasks.add_task(execute_sync, "full")
    
    return {
        "success": True,
        "message": f"Webhook received: {payload.event_type}",
        "timestamp": datetime.now().isoformat()
    }