import sqlite3

def run_migration():
    conn = sqlite3.connect("aldebaran.db")
    cursor = conn.cursor()
    try:
        # Add columns to contratos
        try:
            cursor.execute("ALTER TABLE contratos ADD COLUMN valor_total REAL DEFAULT 0.0 NOT NULL;")
            print("Added 'valor_total' to 'contratos' table.")
        except sqlite3.OperationalError as e:
            print("'valor_total' migration note:", e)

        # Add columns to etapas
        try:
            cursor.execute("ALTER TABLE etapas ADD COLUMN valor_faturamento REAL DEFAULT 0.0 NOT NULL;")
            print("Added 'valor_faturamento' to 'etapas' table.")
        except sqlite3.OperationalError as e:
            print("'valor_faturamento' migration note:", e)

        try:
            cursor.execute("ALTER TABLE etapas ADD COLUMN status_faturamento VARCHAR(50) DEFAULT 'pendente';")
            print("Added 'status_faturamento' to 'etapas' table.")
        except sqlite3.OperationalError as e:
            print("'status_faturamento' migration note:", e)

        conn.commit()
        print("Migration completed successfully!")
    except Exception as e:
        print("Migration failed:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
