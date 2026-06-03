from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from app.models.area_atuacao import AreaAtuacao
from app.schemas.area_atuacao import AreaAtuacaoCreate, AreaAtuacaoResponse
from app.models.usuario import Usuario
from app.services.auth import get_usuario_atual

router = APIRouter(prefix="/areas", tags=["Áreas de Atuação"])

@router.get("/", response_model=List[AreaAtuacaoResponse])
def listar_areas(db: Session = Depends(get_db), current_user: Usuario = Depends(get_usuario_atual)):
    # Isolar por tenant
    return db.query(AreaAtuacao).filter(AreaAtuacao.tenant_id == current_user.tenant_id).all()

@router.post("/", response_model=AreaAtuacaoResponse)
def criar_area(area: AreaAtuacaoCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_usuario_atual)):
    nova_area = AreaAtuacao(
        nome=area.nome,
        cor_visual=area.cor_visual,
        tenant_id=current_user.tenant_id
    )
    db.add(nova_area)
    db.commit()
    db.refresh(nova_area)
    return nova_area

@router.delete("/{area_id}")
def deletar_area(area_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_usuario_atual)):
    area = db.query(AreaAtuacao).filter(AreaAtuacao.id == area_id, AreaAtuacao.tenant_id == current_user.tenant_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Área não encontrada")
    db.delete(area)
    db.commit()
    return {"message": "Área deletada com sucesso"}
