# backend/app/models/responsavel.py
from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Responsavel(Base):
    """
    Modelo ORM que representa a tabela 'responsaveis'.
    Contém a listagem de membros da equipe aptos a assumir tarefas no sistema.
    """
    __tablename__ = "responsaveis"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Nome completo do colaborador
    nome = Column(String(255), nullable=False, unique=True)
    
    # Cargo (Diretor, Coordenador, Campo, Financeiro, Outro)
    cargo = Column(String(100), nullable=False)
    
    # Área de atuação (Topografia, Geologia, Administrativo, Todas)
    area = Column(String(100), nullable=False)

    # SaaS Isolamento
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
