# backend/app/activation/state_cli.py
import json
from state import ensure_all_tables, get_activation_info

import sys

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action provided"}))
        sys.exit(1)

    action = sys.argv[1]

    try:
        if action == "init_tables":
            ensure_all_tables()
            print(json.dumps({"result": "Tables ensured"}))
        elif action == "status":
            info = get_activation_info()
            print(json.dumps({"result": info}))
        else:
            print(json.dumps({"error": f"Unknown action {action}"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
