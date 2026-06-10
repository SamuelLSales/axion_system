# backend/app/routes/despesas.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models.despesa import Despesa
from app.models.etapa import Etapa
from app.models.contrato import Contrato
from app.models.historico import HistoricoAlteracao
from app.schemas.despesa import DespesaCreate, DespesaResponse, DespesaUpdate
from app.models.usuario import Usuario
from app.services.auth import get_usuario_atual, require_admin

router = APIRouter(prefix="/despesas", tags=["Despesas"])

@router.post("", response_model=DespesaResponse)
def criar_despesa(despesa_in: DespesaCreate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Cria um novo gasto associado a uma etapa e um contrato específico.
    """
    contrato = db.query(Contrato).filter(Contrato.id == despesa_in.contrato_id, Contrato.tenant_id == usuario_atual.tenant_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
        
    etapa = db.query(Etapa).filter(Etapa.id == despesa_in.etapa_id, Etapa.tenant_id == usuario_atual.tenant_id).first()
    if not etapa:
        raise HTTPException(status_code=404, detail="Etapa não encontrada")

    db_despesa = Despesa(
        contrato_id=despesa_in.contrato_id,
        etapa_id=despesa_in.etapa_id,
        tipo_despesa=despesa_in.tipo_despesa,
        descricao=despesa_in.descricao,
        valor_custo=despesa_in.valor_custo,
        status_pagamento=despesa_in.status_pagamento,
        reembolsavel=despesa_in.reembolsavel,
        tenant_id=usuario_atual.tenant_id
    )
    db.add(db_despesa)
    db.commit()
    db.refresh(db_despesa)

    # Registrar no histórico do contrato
    historico = HistoricoAlteracao(
        contrato_id=contrato.id,
        tenant_id=usuario_atual.tenant_id,
        campo_alterado=f"Despesa Adicionada ({etapa.nome_tarefa})",
        valor_anterior=None,
        valor_novo=f"{db_despesa.descricao} (R$ {db_despesa.valor_custo:.2f})",
        alterado_por=usuario_atual.nome
    )
    db.add(historico)
    db.commit()

    return db_despesa

@router.get("", response_model=List[DespesaResponse])
def listar_despesas(
    contrato_id: Optional[int] = None,
    etapa_id: Optional[int] = None,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_usuario_atual)
):
    """
    Lista as despesas do tenant logado, com filtros opcionais por contrato e/ou etapa.
    """
    query = db.query(Despesa).filter(Despesa.tenant_id == usuario_atual.tenant_id)
    
    if contrato_id is not None:
        query = query.filter(Despesa.contrato_id == contrato_id)
    if etapa_id is not None:
        query = query.filter(Despesa.etapa_id == etapa_id)
        
    return query.all()

@router.put("/{id}", response_model=DespesaResponse)
def atualizar_despesa(id: int, despesa_in: DespesaUpdate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Atualiza uma despesa e registra no histórico de alterações do contrato correspondente.
    """
    db_despesa = db.query(Despesa).filter(Despesa.id == id, Despesa.tenant_id == usuario_atual.tenant_id).first()
    if not db_despesa:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
        
    contrato = db.query(Contrato).filter(Contrato.id == db_despesa.contrato_id).first()
    etapa = db.query(Etapa).filter(Etapa.id == db_despesa.etapa_id).first()
    
    update_data = despesa_in.model_dump(exclude_unset=True)
    
    for campo, novo_valor in update_data.items():
        valor_anterior = getattr(db_despesa, campo)
        if valor_anterior != novo_valor:
            setattr(db_despesa, campo, novo_valor)
            
            # Registrar alteração no histórico
            historico = HistoricoAlteracao(
                contrato_id=contrato.id,
                tenant_id=usuario_atual.tenant_id,
                campo_alterado=f"Despesa '{db_despesa.descricao}' ({etapa.nome_tarefa}): {campo}",
                valor_anterior=str(valor_anterior),
                valor_novo=str(novo_valor),
                alterado_por=usuario_atual.nome
            )
            db.add(historico)
            
    db.commit()
    db.refresh(db_despesa)
    return db_despesa

@router.delete("/{id}")
def remover_despesa(id: int, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Deleta uma despesa específica e registra a exclusão no histórico do contrato.
    """
    db_despesa = db.query(Despesa).filter(Despesa.id == id, Despesa.tenant_id == usuario_atual.tenant_id).first()
    if not db_despesa:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
        
    contrato = db.query(Contrato).filter(Contrato.id == db_despesa.contrato_id).first()
    etapa = db.query(Etapa).filter(Etapa.id == db_despesa.etapa_id).first()
    
    historico = HistoricoAlteracao(
        contrato_id=contrato.id,
        tenant_id=usuario_atual.tenant_id,
        campo_alterado=f"Despesa Removida ({etapa.nome_tarefa})",
        valor_anterior=f"{db_despesa.descricao} (R$ {db_despesa.valor_custo:.2f})",
        valor_novo=None,
        alterado_por=usuario_atual.nome
    )
    db.add(historico)
    
    db.delete(db_despesa)
    db.commit()
    return {"detail": "Despesa removida com sucesso"}
