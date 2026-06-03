# backend/app/schemas/fase.py
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.etapa import EtapaResponse

class FaseBase(BaseModel):
    nome_fase: str
    ordem: int = 1

class FaseCreate(FaseBase):
    contrato_id: int

class FaseUpdate(BaseModel):
    nome_fase: Optional[str] = None
    ordem: Optional[int] = None

class FaseResponse(FaseBase):
    id: int
    contrato_id: int
    etapas: List[EtapaResponse] = []

    model_config = ConfigDict(from_attributes=True)
