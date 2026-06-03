# backend/app/models/sessao.py
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Sessao(Base):
    """
    Modelo ORM para armazenar sessões ativas (tokens).
    Garante autenticação simples e controle de logout instantâneo.
    """
    __tablename__ = "sessoes"

    id = Column(String(100), primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    expira_em = Column(DateTime, nullable=False)

    # Relacionamento para acessar informações do usuário a partir da sessão
    usuario = relationship("Usuario")
