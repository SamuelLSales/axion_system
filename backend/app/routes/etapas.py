# backend/app/routes/etapas.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models.etapa import Etapa
from app.models.fase import Fase
from app.models.contrato import Contrato
from app.models.historico import HistoricoAlteracao
from app.schemas.etapa import EtapaCreate, EtapaResponse, EtapaUpdate
from app.services.csv_export import registrar_alteracao_csv
from app.routes.contratos import calcular_e_atualizar_status
from app.models.usuario import Usuario
from app.services.auth import get_usuario_atual, require_admin

router = APIRouter(prefix="/etapas", tags=["Etapas"])

@router.post("", response_model=EtapaResponse)
def criar_etapa(etapa_in: EtapaCreate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Cria uma nova etapa dentro de uma fase e atualiza o status do contrato correspondente.
    """
    fase = db.query(Fase).filter(Fase.id == etapa_in.fase_id).first()
    if not fase:
        raise HTTPException(status_code=404, detail="Fase associada não encontrada")
    
    contrato = db.query(Contrato).filter(Contrato.id == fase.contrato_id).first()
    
    db_etapa = Etapa(
        fase_id=etapa_in.fase_id,
        nome_tarefa=etapa_in.nome_tarefa,
        responsavel=etapa_in.responsavel,
        progresso=etapa_in.progresso,
        data_inicio=etapa_in.data_inicio,
        data_termino=etapa_in.data_termino,
        dias_previstos=etapa_in.dias_previstos,
        observacoes=etapa_in.observacoes,
        tenant_id=usuario_atual.tenant_id
    )
    db.add(db_etapa)
    db.commit()
    db.refresh(db_etapa)

    # Registrar criação da etapa no histórico do contrato
    historico = HistoricoAlteracao(
        contrato_id=contrato.id,
        tenant_id=usuario_atual.tenant_id,
        campo_alterado=f"Etapa Criada ({fase.nome_fase})",
        valor_anterior=None,
        valor_novo=db_etapa.nome_tarefa,
        alterado_por=usuario_atual.nome
    )
    db.add(historico)
    db.commit()

    # Registrar no CSV de auditoria
    registrar_alteracao_csv(
        contrato_id=contrato.id,
        nome_projeto=contrato.nome_projeto,
        campo_alterado=f"Criação Etapa: {db_etapa.nome_tarefa}",
        valor_anterior="-",
        valor_novo=f"Fase: {fase.nome_fase} | Resp: {db_etapa.responsavel}",
        alterado_por=usuario_atual.nome
    )

    # Recalcular o status global do contrato
    calcular_e_atualizar_status(contrato, db)

    return db_etapa

@router.put("/{id}", response_model=EtapaResponse)
def atualizar_etapa(id: int, etapa_in: EtapaUpdate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Atualiza uma etapa específica, registrando as alterações no histórico (DB e CSV)
    e recalculando o status global do contrato associado.
    """
    db_etapa = db.query(Etapa).filter(Etapa.id == id, Etapa.tenant_id == usuario_atual.tenant_id).first()
    if not db_etapa:
        raise HTTPException(status_code=404, detail="Etapa não encontrada")

    fase = db.query(Fase).filter(Fase.id == db_etapa.fase_id).first()
    contrato = db.query(Contrato).filter(Contrato.id == fase.contrato_id).first()
    
    update_data = etapa_in.model_dump(exclude_unset=True)
    usuario_alteracao = usuario_atual.nome

    for campo, novo_valor in update_data.items():
        valor_anterior = getattr(db_etapa, campo)
        
        # Só registra e atualiza se o valor realmente mudou
        if valor_anterior != novo_valor:
            setattr(db_etapa, campo, novo_valor)
            
            # Registrar alteração no banco de dados do histórico do contrato
            desc_anterior = str(valor_anterior) if valor_anterior is not None else ""
            desc_novo = str(novo_valor) if novo_valor is not None else ""
            
            # Se for o campo progresso, formatamos como porcentagem para melhor leitura
            if campo == "progresso":
                desc_anterior = f"{int(float(desc_anterior)*100)}%" if desc_anterior else "0%"
                desc_novo = f"{int(float(desc_novo)*100)}%" if desc_novo else "0%"

            historico = HistoricoAlteracao(
                contrato_id=contrato.id,
                tenant_id=usuario_atual.tenant_id,
                campo_alterado=f"Etapa '{db_etapa.nome_tarefa}': {campo}",
                valor_anterior=desc_anterior,
                valor_novo=desc_novo,
                alterado_por=usuario_alteracao
            )
            db.add(historico)
            
            # Registrar no arquivo CSV
            registrar_alteracao_csv(
                contrato_id=contrato.id,
                nome_projeto=contrato.nome_projeto,
                campo_alterado=f"Etapa '{db_etapa.nome_tarefa}': {campo}",
                valor_anterior=desc_anterior if desc_anterior else "-",
                valor_novo=desc_novo if desc_novo else "-",
                alterado_por=usuario_alteracao
            )

    db.commit()
    db.refresh(db_etapa)

    # Recalcular o status global do contrato (como o progresso mudou, o contrato pode passar a 'concluido')
    calcular_e_atualizar_status(contrato, db)

    return db_etapa

@router.delete("/{id}")
def remover_etapa(id: int, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Remove uma etapa específica e recalcula o progresso e status do contrato correspondente.
    """
    db_etapa = db.query(Etapa).filter(Etapa.id == id, Etapa.tenant_id == usuario_atual.tenant_id).first()
    if not db_etapa:
        raise HTTPException(status_code=404, detail="Etapa não encontrada")
    
    fase = db.query(Fase).filter(Fase.id == db_etapa.fase_id).first()
    contrato = db.query(Contrato).filter(Contrato.id == fase.contrato_id).first()

    # Registrar exclusão no histórico
    historico = HistoricoAlteracao(
        contrato_id=contrato.id,
        tenant_id=usuario_atual.tenant_id,
        campo_alterado=f"Etapa Removida ({fase.nome_fase})",
        valor_anterior=db_etapa.nome_tarefa,
        valor_novo=None,
        alterado_por=usuario_atual.nome
    )
    db.add(historico)
    
    # Registrar exclusão no CSV
    registrar_alteracao_csv(
        contrato_id=contrato.id,
        nome_projeto=contrato.nome_projeto,
        campo_alterado=f"Etapa Removida: {db_etapa.nome_tarefa}",
        valor_anterior="-",
        valor_novo="-",
        alterado_por=usuario_atual.nome
    )

    db.delete(db_etapa)
    db.commit()

    # Recalcular status do contrato após exclusão da tarefa
    calcular_e_atualizar_status(contrato, db)

    return {"detail": "Etapa removida com sucesso"}
