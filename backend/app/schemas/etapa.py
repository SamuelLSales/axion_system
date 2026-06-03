# backend/app/schemas/etapa.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class EtapaBase(BaseModel):
    nome_tarefa: str
    responsavel: str
    progresso: float = Field(default=0.0, ge=0.0, le=1.0)
    data_inicio: Optional[datetime] = None
    data_termino: Optional[datetime] = None
    data_conclusao: Optional[datetime] = None
    dias_previstos: int = 0
    observacoes: Optional[str] = None
    valor_faturamento: float = 0.0
    status_faturamento: Optional[str] = "pendente"

class EtapaCreate(EtapaBase):
    fase_id: int

class EtapaUpdate(BaseModel):
    nome_tarefa: Optional[str] = None
    responsavel: Optional[str] = None
    progresso: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    data_inicio: Optional[datetime] = None
    data_termino: Optional[datetime] = None
    data_conclusao: Optional[datetime] = None
    dias_previstos: Optional[int] = None
    observacoes: Optional[str] = None
    valor_faturamento: Optional[float] = None
    status_faturamento: Optional[str] = None

class EtapaResponse(EtapaBase):
    id: int
    fase_id: int

    model_config = ConfigDict(from_attributes=True)
