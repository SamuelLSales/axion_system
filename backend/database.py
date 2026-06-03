# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Caminho do banco de dados (padrão é SQLite local, mas agora podemos usar PostgreSQL via .env)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///aldebaran.db")

# Criação do engine de conexão
# 'check_same_thread' é necessário apenas para o SQLite
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL, connect_args=connect_args
)

# Criação do gerador de sessões (SessionLocal). Cada instância do SessionLocal
# representará uma sessão de conversação com o banco de dados.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base declarativa que todos os nossos modelos ORM irão herdar
Base = declarative_base()

def get_db():
    """
    Função utilitária (Dependency Injection) para obter uma sessão do banco de dados.
    Garante que a sessão seja aberta e devidamente fechada após a conclusão da requisição.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
