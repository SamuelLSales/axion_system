# backend/app/models/empresa.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from database import Base

class Empresa(Base):
    """
    Modelo ORM que representa um Tenant (Empresa Cliente) no sistema SaaS.
    """
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome_fantasia = Column(String(255), nullable=False)
    razao_social = Column(String(255), nullable=True)
    cnpj = Column(String(20), unique=True, index=True, nullable=True)
    
    ativo = Column(Boolean, default=True, nullable=False)
    
    taxa_imposto = Column(Float, default=0.0, nullable=False)
    
    # Campos de Integração com Asaas
    asaas_customer_id = Column(String(255), nullable=True)
    asaas_subscription_id = Column(String(255), nullable=True)
    plano = Column(String(50), nullable=True) # Ex: "basico", "pro"
    status_pagamento = Column(String(50), default="ativo", nullable=False) # Ex: "ativo", "atrasado", "cancelado"
    
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relacionamentos genéricos (depende de como configuramos os back_populates nas outras tabelas)
    usuarios = relationship("Usuario", back_populates="empresa", cascade="all, delete-orphan")
    contratos = relationship("Contrato", back_populates="empresa_rel", cascade="all, delete-orphan")
    areas_atuacao = relationship("AreaAtuacao", back_populates="empresa", cascade="all, delete-orphan")
