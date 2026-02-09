import sys
import json
from activation_service import (
    activate_system,
    check_activation_status,
    deactivate_system,
)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action provided"}))
        sys.exit(1)

    action = sys.argv[1]
    data = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}

    try:
        if action == "activate":
            school_name = data.get("school_name", "")
            activation_code = data.get("activation_code", "")
            result = activate_system(activation_code, school_name)
        elif action == "status":
            result = check_activation_status()
        elif action == "deactivate":
            result = deactivate_system()
        else:
            result = {"error": f"Unknown action {action}"}
        print(json.dumps({"result": result}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
