# app/sync/network_monitor.py
import asyncio
import socket
import threading
from typing import Callable, Optional
import logging

logger = logging.getLogger(__name__)

class NetworkMonitor:
    """Monitor network connectivity and trigger sync on reconnect"""
    
    def __init__(self, sync_scheduler):
        self.sync_scheduler = sync_scheduler
        self._is_online = False
        self._monitoring = False
        self._check_interval = 2
        self._callbacks = []
    
    def start(self):
        """Start network monitoring in background"""
        self._monitoring = True
        threading.Thread(target=self._monitor_loop, daemon=True).start()
        logger.info("Network monitoring started")
    
    def _monitor_loop(self):
        """Monitor network in background thread"""
        while self._monitoring:
            current_status = self._check_connectivity()
            
            if current_status and not self._is_online:
                logger.info("Network connected - triggering sync")
                if self.sync_scheduler:
                    self.sync_scheduler.on_reconnect()
            elif not current_status and self._is_online:
                logger.warning("Network disconnected")
            
            self._is_online = current_status
            
            import time
            time.sleep(self._check_interval)
    
    def _check_connectivity(self) -> bool:
        """Check actual network connectivity"""
        try:
            socket.create_connection(("8.8.8.8", 53), timeout=3)
            return True
        except:
            return False
    
    def is_online(self) -> bool:
        """Get current online status"""
        return self._is_online
    
    def stop(self):
        """Stop monitoring"""
        self._monitoring = False