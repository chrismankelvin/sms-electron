# app/config.py
import os
from pathlib import Path
# sqlitecloud://crp6lwxvnz.g2.sqlite.cloud:8860/synctest?apikey=CWwoReVnb5JGoUcHzuZgVuaLpIVt2Vyag7iHbW1ixMU
# Cloud Configuration
CLOUD_CONNECTION_STRING = os.getenv(
    "CLOUD_CONNECTION_STRING", 
    "sqlitecloud://crp6lwxvnz.g2.sqlite.cloud:8860/synctest"
)
CLOUD_API_KEY = os.getenv(
    "CLOUD_API_KEY", 
    "CWwoReVnb5JGoUcHzuZgVuaLpIVt2Vyag7iHbW1ixMU"
)

# App Configuration
APP_NAME = "SchoolManagementSystem"
APP_DATA_PATH = Path(os.environ.get('APPDATA', Path.home() / 'AppData' / 'Roaming')) / APP_NAME

# Sync Configuration
DEFAULT_SYNC_INTERVAL = 10  # seconds
DEFAULT_BATCH_SIZE = 50
DEFAULT_MAX_RETRIES = 3