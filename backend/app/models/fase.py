# backend/app/models/fase.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Fase(Base):
    """
    Modelo ORM que representa a tabela 'fases'.
    Cada contrato é composto por uma ou mais fases ordenadas (ex: Planejamento, Campo, Relatório).
    """
    __tablename__ = "fases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # ID do contrato associado (Chave Estrangeira)
    contrato_id = Column(Integer, ForeignKey("contratos.id", ondelete="CASCADE"), nullable=False)
    
    # Nome da fase (ex: Fase 1 – Planejamento)
    nome_fase = Column(String(255), nullable=False)
    
    # Ordem de exibição da fase (ex: 1, 2, 3)
    ordem = Column(Integer, default=1, nullable=False)

    # Relacionamento reverso com o Contrato
    contrato = relationship("Contrato", back_populates="fases")
    
    # Relacionamento com as etapas filhas da fase (com cascade delete)
    etapas = relationship("Etapa", back_populates="fase", cascade="all, delete-orphan")

    # SaaS Isolamento
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
