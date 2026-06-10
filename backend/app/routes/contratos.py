# backend/app/routes/contratos.py
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from database import get_db
from app.models.contrato import Contrato
from app.models.fase import Fase
from app.models.etapa import Etapa
from app.models.historico import HistoricoAlteracao
from app.schemas.contrato import ContratoCreate, ContratoUpdate, ContratoResponse
from app.services.csv_export import registrar_alteracao_csv
from app.models.usuario import Usuario
from app.models.area_atuacao import AreaAtuacao
from app.services.auth import get_usuario_atual, require_admin

router = APIRouter(prefix="/contratos", tags=["Contratos"])

def calcular_e_atualizar_status(contrato: Contrato, db: Session) -> str:
    """
    Calcula dinamicamente o status do contrato baseado nas suas etapas e prazos,
    atualiza o banco de dados e retorna o status.
    """
    # Buscar todas as etapas associadas a este contrato através de suas fases
    etapas = db.query(Etapa).join(Fase).filter(Fase.contrato_id == contrato.id).all()
    
    # Calcular progresso médio
    if etapas:
        progresso_medio = sum(e.progresso for e in etapas) / len(etapas)
    else:
        progresso_medio = 0.0

    # Lógica de definição do status
    if etapas and progresso_medio >= 1.0:
        novo_status = "concluido"
    elif contrato.data_entrega_final:
        hoje = datetime.utcnow().date()
        data_entrega = contrato.data_entrega_final.date()
        limite_atencao = hoje + timedelta(days=7)
        
        if data_entrega < hoje:
            novo_status = "atrasado"
        elif hoje <= data_entrega <= limite_atencao:
            novo_status = "atencao"
        else:
            novo_status = "no_prazo"
    else:
        novo_status = "no_prazo"

    # Se o status mudou, atualiza no banco
    if contrato.status != novo_status:
        contrato.status = novo_status
        db.add(contrato)
        db.commit()
        db.refresh(contrato)

    return novo_status

@router.get("", response_model=List[ContratoResponse])
def listar_contratos(db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    """
    Retorna todos os contratos, recalculando o status de cada um em tempo de execução.
    """
    contratos = db.query(Contrato).filter(Contrato.tenant_id == usuario_atual.tenant_id).options(
        selectinload(Contrato.area_atuacao),
        selectinload(Contrato.fases).selectinload(Fase.etapas),
        selectinload(Contrato.despesas)
    ).all()
    for contrato in contratos:
        calcular_e_atualizar_status(contrato, db)
    return contratos

@router.get("/{id}", response_model=ContratoResponse)
def obter_contrato(id: int, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    """
    Retorna os detalhes de um contrato específico, incluindo fases, etapas e histórico.
    """
    contrato = db.query(Contrato).filter(Contrato.id == id, Contrato.tenant_id == usuario_atual.tenant_id).options(
        selectinload(Contrato.area_atuacao),
        selectinload(Contrato.fases).selectinload(Fase.etapas),
        selectinload(Contrato.despesas)
    ).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    calcular_e_atualizar_status(contrato, db)
    return contrato

@router.post("", response_model=ContratoResponse)
def criar_contrato(contrato_in: ContratoCreate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Cria um novo contrato. Ao criar, inicializa opcionalmente com fases padrão
    (Planejamento, Execução de Campo, Elaboração de Relatório) se solicitado.
    """
    db_contrato = Contrato(
        nome_projeto=contrato_in.nome_projeto,
        cliente=contrato_in.cliente,
        empresa=contrato_in.empresa,
        direitos_minerarios=contrato_in.direitos_minerarios,
        area_id=contrato_in.area_id,
        tenant_id=usuario_atual.tenant_id,
        diretor_projeto=contrato_in.diretor_projeto,
        data_inicio=contrato_in.data_inicio,
        data_entrega_final=contrato_in.data_entrega_final,
        dias_campo_total=contrato_in.dias_campo_total,
        valor_total=contrato_in.valor_total,
        gasto_total=contrato_in.gasto_total,
        status="no_prazo",
        observacoes=contrato_in.observacoes
    )
    db.add(db_contrato)
    db.commit()
    db.refresh(db_contrato)

    # Criar fases padrão do template para conveniência
    fases_padrao = ["Fase 1 – Planejamento", "Fase 2 – Mapeamento de Campo", "Fase 3 – Elaboração de Relatório"]
    for i, nome_fase in enumerate(fases_padrao, start=1):
        fase = Fase(contrato_id=db_contrato.id, nome_fase=nome_fase, ordem=i, tenant_id=usuario_atual.tenant_id)
        db.add(fase)
    
    # Criar histórico de criação
    area_nome = db.query(AreaAtuacao).filter(AreaAtuacao.id == db_contrato.area_id).first().nome if db_contrato.area_id else "Desconhecida"
    historico = HistoricoAlteracao(
        contrato_id=db_contrato.id,
        tenant_id=usuario_atual.tenant_id,
        campo_alterado="Criado",
        valor_anterior=None,
        valor_novo=f"Contrato criado na área {area_nome}",
        alterado_por=usuario_atual.nome
    )
    db.add(historico)
    db.commit()
    db.refresh(db_contrato)

    # Registrar no CSV de auditoria
    registrar_alteracao_csv(
        contrato_id=db_contrato.id,
        nome_projeto=db_contrato.nome_projeto,
        campo_alterado="Contrato Criado",
        valor_anterior="-",
        valor_novo=f"Área: {area_nome}",
        alterado_por=usuario_atual.nome
    )

    return db_contrato

@router.put("/{id}", response_model=ContratoResponse)
def atualizar_contrato(id: int, contrato_in: ContratoUpdate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Atualiza as informações de um contrato e grava todas as modificações no histórico
    do banco de dados e no log CSV.
    """
    contrato = db.query(Contrato).filter(Contrato.id == id, Contrato.tenant_id == usuario_atual.tenant_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")

    update_data = contrato_in.model_dump(exclude_unset=True)
    usuario_alteracao = usuario_atual.nome

    for campo, novo_valor in update_data.items():
        valor_anterior = getattr(contrato, campo)
        
        # Só registra alteração se o valor de fato mudou
        if valor_anterior != novo_valor:
            setattr(contrato, campo, novo_valor)
            
            # Registrar alteração no banco
            historico = HistoricoAlteracao(
                contrato_id=contrato.id,
                tenant_id=usuario_atual.tenant_id,
                campo_alterado=campo,
                valor_anterior=str(valor_anterior) if valor_anterior is not None else "",
                valor_novo=str(novo_valor) if novo_valor is not None else "",
                alterado_por=usuario_alteracao
            )
            db.add(historico)
            
            # Registrar no CSV
            registrar_alteracao_csv(
                contrato_id=contrato.id,
                nome_projeto=contrato.nome_projeto,
                campo_alterado=campo,
                valor_anterior=str(valor_anterior) if valor_anterior is not None else "-",
                valor_novo=str(novo_valor) if novo_valor is not None else "-",
                alterado_por=usuario_alteracao
            )

    db.commit()
    calcular_e_atualizar_status(contrato, db)
    return contrato

@router.delete("/{id}")
def remover_contrato(id: int, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(require_admin)):
    """
    Remove um contrato e todos os seus vínculos em cascata (fases, etapas, históricos).
    """
    contrato = db.query(Contrato).filter(Contrato.id == id, Contrato.tenant_id == usuario_atual.tenant_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    # Registrar exclusão no CSV antes de deletar
    registrar_alteracao_csv(
        contrato_id=contrato.id,
        nome_projeto=contrato.nome_projeto,
        campo_alterado="Deletado",
        valor_anterior=contrato.nome_projeto,
        valor_novo="-",
        alterado_por=usuario_atual.nome
    )

    db.delete(contrato)
    db.commit()
    return {"detail": "Contrato removido com sucesso"}
