# backend/app/routes/empresa.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.usuario import Usuario
from app.models.empresa import Empresa
from app.services.auth import get_usuario_atual
from pydantic import BaseModel

router = APIRouter(prefix="/empresa", tags=["Empresa"])

class ConfigResponse(BaseModel):
    taxa_imposto: float

class ConfigUpdate(BaseModel):
    taxa_imposto: float

@router.get("/config", response_model=ConfigResponse)
def get_empresa_config(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_usuario_atual)
):
    empresa = db.query(Empresa).filter(Empresa.id == usuario_atual.tenant_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return {"taxa_imposto": empresa.taxa_imposto}

@router.put("/config", response_model=ConfigResponse)
def update_empresa_config(
    config: ConfigUpdate,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_usuario_atual)
):
    empresa = db.query(Empresa).filter(Empresa.id == usuario_atual.tenant_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    
    empresa.taxa_imposto = config.taxa_imposto
    db.commit()
    db.refresh(empresa)
    return {"taxa_imposto": empresa.taxa_imposto}
