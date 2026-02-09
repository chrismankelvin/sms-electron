# backend/app/activation/fingerprint_cli.py
import json
import sys
from fingerprint import (
    get_or_create_machine_fingerprint,
    get_existing_fingerprint,
    reset_fingerprint,
    get_device_info
)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action"}))
        sys.exit(1)

    action = sys.argv[1]

    try:
        if action == "get":
            fp = get_or_create_machine_fingerprint()
            print(json.dumps({"result": fp}))
        elif action == "existing":
            fp = get_existing_fingerprint()
            print(json.dumps({"result": fp}))
        elif action == "reset":
            fp = reset_fingerprint()
            print(json.dumps({"result": fp}))
        elif action == "info":
            device_id = sys.argv[2] if len(sys.argv) > 2 else None
            info = get_device_info(device_id)
            print(json.dumps({"result": info}))
        else:
            print(json.dumps({"error": f"Unknown action {action}"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
