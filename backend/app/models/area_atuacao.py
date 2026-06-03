# backend/app/models/area_atuacao.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class AreaAtuacao(Base):
    """
    Modelo ORM para Áreas de Atuação customizáveis por cada Empresa (Tenant).
    Ex: Topografia, Geologia, Meio Ambiente.
    """
    __tablename__ = "areas_atuacao"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    cor_visual = Column(String(20), default="blue", nullable=False) # Ex: blue, red, green, ou hex
    
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="areas_atuacao")
    contratos = relationship("Contrato", back_populates="area_atuacao")
