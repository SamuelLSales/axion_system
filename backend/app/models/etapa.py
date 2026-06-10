# backend/app/models/etapa.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Etapa(Base):
    """
    Modelo ORM que representa a tabela 'etapas' (tarefas específicas dentro de uma fase).
    Cada etapa contém prazos, progresso individual e um responsável.
    """
    __tablename__ = "etapas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # ID da fase associada (Chave Estrangeira)
    fase_id = Column(Integer, ForeignKey("fases.id", ondelete="CASCADE"), nullable=False)
    
    # Nome da tarefa/etapa (ex: Escolha de prestador)
    nome_tarefa = Column(String(255), nullable=False)
    
    # Nome do responsável pela tarefa (ex: Robson Ribeiro, Nadia, Humberto)
    responsavel = Column(String(255), nullable=False)
    
    # Progresso individual da tarefa (valor decimal entre 0.0 e 1.0)
    progresso = Column(Float, default=0.0, nullable=False)
    
    # Data de início prevista/real da tarefa
    data_inicio = Column(DateTime, nullable=True)
    
    # Data de término prevista (Prazo)
    data_termino = Column(DateTime, nullable=True)
    
    # Data real de conclusão da tarefa
    data_conclusao = Column(DateTime, nullable=True)
    
    # Quantidade de dias previstos para a realização da tarefa
    dias_previstos = Column(Integer, default=0, nullable=False)
    
    # Observações específicas sobre a etapa
    observacoes = Column(Text, nullable=True)

    # Faturamento e controle financeiro
    valor_faturamento = Column(Float, default=0.0, nullable=False)
    status_faturamento = Column(String(50), default="pendente", nullable=True)

    # Relacionamento reverso com a Fase
    fase = relationship("Fase", back_populates="etapas")

    # Relacionamento com despesas
    despesas = relationship("Despesa", back_populates="etapa", cascade="all, delete-orphan")

    # SaaS Isolamento
    tenant_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
