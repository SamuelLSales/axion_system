# backend/app/models/historico.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class HistoricoAlteracao(Base):
    """
    Modelo ORM que representa a tabela 'historico_alteracoes'.
    Armazena trilha de auditoria para modificações em contratos ou etapas.
    """
    __tablename__ = "historico_alteracoes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # ID do contrato associado (Chave Estrangeira)
    contrato_id = Column(Integer, ForeignKey("contratos.id", ondelete="CASCADE"), nullable=False)
    
    # Nome do campo que sofreu alteração (ex: 'progresso', 'data_entrega_final')
    campo_alterado = Column(String(255), nullable=False)
    
    # Valor anterior antes da modificação (salvo como String para aceitar qualquer tipo)
    valor_anterior = Column(String(255), nullable=True)
    
    # Novo valor após a modificação (salvo como String)
    valor_novo = Column(String(255), nullable=True)
    
    # Data e hora exata da alteração
    alterado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Nome de quem efetuou a alteração (ex: Robson Ribeiro, Nadia, Sistema)
    alterado_por = Column(String(255), default="Sistema", nullable=False)

    # Relacionamento reverso com o Contrato
    contrato = relationship("Contrato", back_populates="historicos")

    # SaaS Isolamento
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
