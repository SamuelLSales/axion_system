import sqlite3

def check_schema():
    conn = sqlite3.connect("aldebaran.db")
    cursor = conn.cursor()
    try:
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        print("Tables in database:")
        for table in tables:
            print(f"\nTable: {table}")
            cursor.execute(f"PRAGMA table_info({table});")
            columns = cursor.fetchall()
            for col in columns:
                # col is (cid, name, type, notnull, dflt_value, pk)
                print(f"  - {col[1]} ({col[2]}){' NOT NULL' if col[3] else ''}{' DEFAULT ' + str(col[4]) if col[4] is not None else ''}{' PK' if col[5] else ''}")
    except Exception as e:
        print("Error checking schema:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    check_schema()
