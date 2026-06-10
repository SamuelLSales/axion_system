# backend/app/schemas/despesa.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class DespesaBase(BaseModel):
    tipo_despesa: str # logistica, pessoal, terceiros, taxas
    descricao: str
    valor_custo: float = Field(default=0.0, ge=0.0)
    status_pagamento: str = "pendente" # pendente, pago
    reembolsavel: bool = False

class DespesaCreate(DespesaBase):
    contrato_id: int

class DespesaUpdate(BaseModel):
    tipo_despesa: Optional[str] = None
    descricao: Optional[str] = None
    valor_custo: Optional[float] = Field(default=None, ge=0.0)
    status_pagamento: Optional[str] = None
    reembolsavel: Optional[bool] = None

class DespesaResponse(DespesaBase):
    id: int
    contrato_id: int
    criado_em: datetime
    atualizado_em: datetime

    model_config = ConfigDict(from_attributes=True)
