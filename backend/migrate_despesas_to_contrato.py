import sqlite3

def run_migration():
    conn = sqlite3.connect("aldebaran.db")
    cursor = conn.cursor()
    try:
        cursor.execute("DROP TABLE IF EXISTS despesas;")
        conn.commit()
        print("Tabela 'despesas' removida com sucesso. O SQLAlchemy a recriará no próximo restart.")
    except Exception as e:
        print("Falha na migração:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
