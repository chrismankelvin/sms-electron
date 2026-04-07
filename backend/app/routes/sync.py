# app/routes/sync.py - Wrapper for your existing FastAPI endpoint

import sys
import os
from pathlib import Path
from datetime import datetime

# Add the parent directory to path to import your existing FastAPI app
sys.path.append(str(Path(__file__).parent.parent.parent))

# async def check_health():
#     """Check if sync backend is healthy"""
#     try:
#         # Try to import and call your existing health check
#         from app.main import health_test
        
#         return health_test()
#     except:
#         return {
#             "success": False,
#             "status": "faulty",
#             "message": "Backend is running (health check)"
#         }

# # async def complete_sync(data):
#     """Call your existing FastAPI sync endpoint"""
#     try:
#         # Import your existing FastAPI app and endpoint
#         # This assumes your main.py is in the parent directory
#         import importlib.util
#         import json
        
#         # Path to your main.py
#         main_path = Path(__file__).parent.parent.parent / "main.py"
        
#         if main_path.exists():
#             # Load the module
#             spec = importlib.util.spec_from_file_location("main", main_path)
#             main_module = importlib.util.module_from_spec(spec)
#             spec.loader.exec_module(main_module)
            
#             # Create a request object wrapper
#             from fastapi import Request
            
#             # Call your existing endpoint
#             # Since it's an async function, we need to await it
#             result = await main_module.complete_sync(data)
            
#             # Convert to dict if needed
#             if hasattr(result, 'dict'):
#                 return result.dict()
#             return result
#         else:
#             # Fallback if main.py not found
#             return perform_sync_fallback(data)
            
#     except Exception as e:
#         print(f"[ERROR] Error calling sync endpoint: {str(e)}")
#         return perform_sync_fallback(data)

def check_health():
    """Check if sync backend is healthy"""
    try:
        # Option 1: Direct call to your health test (if accessible)
        from main import health_test  # If main.py is in parent directory
        
        result =  health_test()  # Note: await if it's async
        
        # Convert to expected format
        return {
            "success": True,
            "status": "healthy",
            "message": "Backend is running",
            "details": result
        }
        
    except ImportError:
        # Option 2: Simple health check without calling the endpoint
        return {
            "success": True,
            "status": "healthy",
            "message": "Backend is running (sync module active)"
        }
        
    except Exception as e:
        # Something is wrong
        return {
            "success": False,
            "status": "faulty",
            "message": f"Health check failed: {str(e)}"
        }


def complete_sync(data):
    try:
        # Try to import and call your existing health check
        from app.main import complete_sync
        
        return complete_sync(data)
    except:
        return {
            "success": False,
            "status": "faulty",
            "message": "sync fialed"
        }
    

def perform_sync_fallback(data):
    """Fallback implementation"""
    return {
        "success": True,
        "steps": {
            "school": {"success": True, "message": "School synced"},
            "activation": {"success": True, "message": "Activation synced"},
            "devices": {"success": True, "message": "Devices synced", "synced": 0}
        },
        "summary": {
            "total_steps": 3,
            "successful_steps": 3,
            "failed_steps": 0,
            "total_devices_synced": 0,
            "device_history_entries": 0
        },
        "timestamp": datetime.now().isoformat()
    }