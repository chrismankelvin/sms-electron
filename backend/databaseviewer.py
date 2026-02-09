import sqlite3
from pathlib import Path
from cryptography.fernet import Fernet
import sys

# =========================
# Paths (same as your app)
# =========================
PROJECT_ROOT = Path(__file__).parent
DB_DIR = PROJECT_ROOT / "database"

ENCRYPTED_DB_PATH = DB_DIR / "school_encrypted.db"
DECRYPTED_DB_PATH = DB_DIR / "_school_debug.db"
KEY_PATH = DB_DIR / "db.key"

# =========================
# Load key
# =========================
if not KEY_PATH.exists():
    print("❌ Encryption key not found.")
    sys.exit(1)

FERNET = Fernet(KEY_PATH.read_bytes())

# =========================
# Decrypt DB
# =========================
def decrypt_db():
    if not ENCRYPTED_DB_PATH.exists():
        print("❌ Encrypted database not found.")
        sys.exit(1)

    decrypted = FERNET.decrypt(ENCRYPTED_DB_PATH.read_bytes())
    DECRYPTED_DB_PATH.write_bytes(decrypted)
    print("🔓 Database decrypted for live viewing.")

# =========================
# Re-encrypt DB
# =========================
def encrypt_db():
    encrypted = FERNET.encrypt(DECRYPTED_DB_PATH.read_bytes())
    ENCRYPTED_DB_PATH.write_bytes(encrypted)
    DECRYPTED_DB_PATH.unlink(missing_ok=True)
    print("🔐 Database re-encrypted and cleaned up.")

# =========================
# Interactive Viewer
# =========================
def view_db():
    conn = sqlite3.connect(DECRYPTED_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("\n📊 Live Database Viewer")
    print("Commands:")
    print("  tables              → list tables")
    print("  show <table>        → show all rows")
    print("  schema <table>      → show table schema")
    print("  sql <query>         → run custom SQL")
    print("  exit                → quit\n")

    while True:
        cmd = input("db> ").strip()

        if cmd == "exit":
            break

        elif cmd == "tables":
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
            for row in cursor.fetchall():
                print(" -", row["name"])

        elif cmd.startswith("show "):
            table = cmd.split(" ", 1)[1]
            try:
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                for r in rows:
                    print(dict(r))
                print(f"({len(rows)} rows)")
            except Exception as e:
                print("❌", e)

        elif cmd.startswith("schema "):
            table = cmd.split(" ", 1)[1]
            cursor.execute(
                "SELECT sql FROM sqlite_master WHERE name=?",
                (table,)
            )
            row = cursor.fetchone()
            print(row["sql"] if row else "❌ Table not found")

        elif cmd.startswith("sql "):
            query = cmd[4:]
            try:
                cursor.execute(query)
                rows = cursor.fetchall()
                for r in rows:
                    print(dict(r))
            except Exception as e:
                print("❌", e)

        else:
            print("❓ Unknown command")

    conn.close()

# =========================
# Main
# =========================
if __name__ == "__main__":
    decrypt_db()

    try:
        view_db()
    finally:
        choice = input("\n🔐 Re-encrypt database now? (y/n): ").lower()
        if choice == "y":
            encrypt_db()
        else:
            print("⚠️ Database left DECRYPTED (dev only!)")
