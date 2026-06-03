from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AreaAtuacaoBase(BaseModel):
    nome: str
    cor_visual: Optional[str] = "blue"

class AreaAtuacaoCreate(AreaAtuacaoBase):
    pass

class AreaAtuacaoResponse(AreaAtuacaoBase):
    id: int
    tenant_id: int
    criado_em: datetime

    class Config:
        orm_mode = True
