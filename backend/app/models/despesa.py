# backend/app/models/despesa.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base

class Despesa(Base):
    """
    Modelo ORM que representa a tabela 'despesas' (gastos associados a etapas do contrato).
    """
    __tablename__ = "despesas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Relacionamento com o Contrato
    contrato_id = Column(Integer, ForeignKey("contratos.id", ondelete="CASCADE"), nullable=False)
    
    # Categoria de Gasto (logistica, pessoal, terceiros, taxas)
    tipo_despesa = Column(String(100), nullable=False)
    
    # Descrição do gasto (ex: Combustível, Hospedagem)
    descricao = Column(String(255), nullable=False)
    
    # Valor real do custo
    valor_custo = Column(Float, default=0.0, nullable=False)
    
    # Estado do pagamento (pendente, pago)
    status_pagamento = Column(String(50), default="pendente", nullable=False)
    
    # Se a despesa é reembolsável pelo cliente
    reembolsavel = Column(Boolean, default=False, nullable=False)
    
    # SaaS Isolamento
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    
    # Data de registro
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relacionamentos
    contrato = relationship("Contrato", back_populates="despesas")
