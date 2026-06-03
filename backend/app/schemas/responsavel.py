# backend/app/schemas/responsavel.py
from pydantic import BaseModel, ConfigDict

class ResponsavelBase(BaseModel):
    nome: str
    cargo: str
    area: str

class ResponsavelCreate(ResponsavelBase):
    pass

class ResponsavelResponse(ResponsavelBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
