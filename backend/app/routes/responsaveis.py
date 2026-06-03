# backend/app/routes/responsaveis.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.responsavel import Responsavel
from app.schemas.responsavel import ResponsavelCreate, ResponsavelResponse
from app.models.usuario import Usuario
from app.services.auth import get_usuario_atual, require_admin

router = APIRouter(prefix="/responsaveis", tags=["Responsáveis"])

@router.get("", response_model=List[ResponsavelResponse])
def listar_responsaveis(db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    """
    Retorna a lista de todos os colaboradores cadastrados no sistema.
    """
    return db.query(Responsavel).filter(Responsavel.tenant_id == usuario_atual.tenant_id).all()

@router.post("", response_model=ResponsavelResponse)
def criar_responsavel(resp_in: ResponsavelCreate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Cadastra um novo colaborador na equipe.
    """
    # Verificar se o nome já está cadastrado para evitar duplicidade
    existente = db.query(Responsavel).filter(Responsavel.nome == resp_in.nome, Responsavel.tenant_id == usuario_atual.tenant_id).first()
    if existente:
        raise HTTPException(status_code=400, detail="Este colaborador já está cadastrado")
    
    db_resp = Responsavel(
        nome=resp_in.nome,
        cargo=resp_in.cargo,
        area=resp_in.area,
        tenant_id=usuario_atual.tenant_id
    )
    db.add(db_resp)
    db.commit()
    db.refresh(db_resp)
    return db_resp

@router.put("/{id}", response_model=ResponsavelResponse)
def atualizar_responsavel(id: int, resp_in: ResponsavelCreate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Atualiza as informações de um colaborador da equipe.
    """
    resp = db.query(Responsavel).filter(Responsavel.id == id, Responsavel.tenant_id == usuario_atual.tenant_id).first()
    if not resp:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    # Se o nome mudou, verificar se o novo nome já existe
    if resp.nome != resp_in.nome:
        existente = db.query(Responsavel).filter(Responsavel.nome == resp_in.nome, Responsavel.tenant_id == usuario_atual.tenant_id).first()
        if existente:
            raise HTTPException(status_code=400, detail="Já existe um colaborador com este nome")
            
    resp.nome = resp_in.nome
    resp.cargo = resp_in.cargo
    resp.area = resp_in.area
    
    db.commit()
    db.refresh(resp)
    return resp

@router.delete("/{id}")
def remover_responsavel(id: int, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Remove um colaborador da equipe.
    """
    resp = db.query(Responsavel).filter(Responsavel.id == id, Responsavel.tenant_id == usuario_atual.tenant_id).first()
    if not resp:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
        
    db.delete(resp)
    db.commit()
    return {"detail": "Colaborador removido com sucesso"}
