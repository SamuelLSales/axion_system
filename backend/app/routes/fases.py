# backend/app/routes/fases.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models.fase import Fase
from app.models.contrato import Contrato
from app.schemas.fase import FaseCreate, FaseResponse, FaseUpdate
from app.models.usuario import Usuario
from app.services.auth import get_usuario_atual, require_admin

router = APIRouter(prefix="/fases", tags=["Fases"])

@router.post("", response_model=FaseResponse)
def criar_fase(fase_in: FaseCreate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Cria uma nova fase associada a um contrato.
    """
    contrato = db.query(Contrato).filter(Contrato.id == fase_in.contrato_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato associado não encontrado")
    
    db_fase = Fase(
        contrato_id=fase_in.contrato_id,
        nome_fase=fase_in.nome_fase,
        ordem=fase_in.ordem,
        tenant_id=usuario_atual.tenant_id
    )
    db.add(db_fase)
    db.commit()
    db.refresh(db_fase)
    return db_fase

@router.put("/{id}", response_model=FaseResponse)
def atualizar_fase(id: int, fase_in: FaseUpdate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Atualiza informações de uma fase (como nome e ordem).
    """
    fase = db.query(Fase).filter(Fase.id == id, Fase.tenant_id == usuario_atual.tenant_id).first()
    if not fase:
        raise HTTPException(status_code=404, detail="Fase não encontrada")
    
    update_data = fase_in.model_dump(exclude_unset=True)
    for campo, valor in update_data.items():
        setattr(fase, campo, valor)
        
    db.commit()
    db.refresh(fase)
    return fase

@router.delete("/{id}")
def remover_fase(id: int, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Remove uma fase e todas as suas etapas associadas em cascata.
    """
    fase = db.query(Fase).filter(Fase.id == id, Fase.tenant_id == usuario_atual.tenant_id).first()
    if not fase:
        raise HTTPException(status_code=404, detail="Fase não encontrada")
    
    db.delete(fase)
    db.commit()
    return {"detail": "Fase removida com sucesso"}
