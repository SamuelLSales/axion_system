import os
import sys
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import engine

def run_migration():
    print("======================================================")
    print("Iniciando verificação de colunas e migração automática...")
    print(f"Dialeto do banco detectado: {engine.url.drivername}")
    print("======================================================")
    
    with engine.begin() as connection:
        # 1. Adicionar taxa_imposto na tabela empresas
        try:
            connection.execute(text("ALTER TABLE empresas ADD COLUMN taxa_imposto FLOAT DEFAULT 0.0 NOT NULL;"))
            print("Coluna 'taxa_imposto' adicionada à tabela 'empresas'.")
        except Exception as e:
            err_msg = str(e).lower()
            if "already exists" in err_msg or "duplicate column" in err_msg or "duplicada" in err_msg or "duplicate_column" in err_msg:
                print("Nota: Coluna 'taxa_imposto' já existe na tabela 'empresas'.")
            else:
                print(f"Aviso ao adicionar 'taxa_imposto' (pode já existir): {e}")
                
        # 2. Adicionar gasto_total na tabela contratos
        try:
            connection.execute(text("ALTER TABLE contratos ADD COLUMN gasto_total FLOAT DEFAULT 0.0 NOT NULL;"))
            print("Coluna 'gasto_total' adicionada à tabela 'contratos'.")
        except Exception as e:
            err_msg = str(e).lower()
            if "already exists" in err_msg or "duplicate column" in err_msg or "duplicada" in err_msg or "duplicate_column" in err_msg:
                print("Nota: Coluna 'gasto_total' já existe na tabela 'contratos'.")
            else:
                print(f"Aviso ao adicionar 'gasto_total' (pode já existir): {e}")
                
    print("======================================================")
    print("Verificação/Migração concluída com sucesso!")
    print("======================================================")

if __name__ == "__main__":
    run_migration()
