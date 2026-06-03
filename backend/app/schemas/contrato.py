# backend/app/schemas/contrato.py
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.fase import FaseResponse
from app.schemas.area_atuacao import AreaAtuacaoResponse

class HistoricoResponse(BaseModel):
    id: int
    contrato_id: int
    campo_alterado: str
    valor_anterior: Optional[str] = None
    valor_novo: Optional[str] = None
    alterado_em: datetime
    alterado_por: str

    model_config = ConfigDict(from_attributes=True)

class ContratoBase(BaseModel):
    nome_projeto: str
    cliente: str
    empresa: str = "AXION Sistemas"
    direitos_minerarios: Optional[str] = None
    area_id: int
    diretor_projeto: str
    data_inicio: Optional[datetime] = None
    data_entrega_final: Optional[datetime] = None
    dias_campo_total: int = 0
    status: str = "no_prazo"
    observacoes: Optional[str] = None

class ContratoCreate(ContratoBase):
    pass

class ContratoUpdate(BaseModel):
    nome_projeto: Optional[str] = None
    cliente: Optional[str] = None
    empresa: Optional[str] = None
    direitos_minerarios: Optional[str] = None
    area_id: Optional[int] = None
    diretor_projeto: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_entrega_final: Optional[datetime] = None
    dias_campo_total: Optional[int] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None

class ContratoResponse(ContratoBase):
    id: int
    criado_em: datetime
    atualizado_em: datetime
    fases: List[FaseResponse] = []
    historicos: List[HistoricoResponse] = []
    area_atuacao: Optional[AreaAtuacaoResponse] = None

    model_config = ConfigDict(from_attributes=True)
