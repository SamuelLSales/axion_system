# backend/app/routes/dashboard.py
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from database import get_db
from app.models.contrato import Contrato
from app.models.fase import Fase
from app.models.etapa import Etapa
from app.models.area_atuacao import AreaAtuacao
from app.routes.contratos import calcular_e_atualizar_status
from app.models.usuario import Usuario
from app.services.auth import get_usuario_atual

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
def obter_dados_dashboard(db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    """
    Retorna consolidados estatísticos para popular os cards, gráficos e alertas do Dashboard.
    """
    contratos = db.query(Contrato).filter(Contrato.tenant_id == usuario_atual.tenant_id).options(selectinload(Contrato.area_atuacao)).all()
    
    # Recalcula e atualiza o status de todos os contratos para garantir dados precisos
    for contrato in contratos:
        calcular_e_atualizar_status(contrato, db)

    # 1. Contagem por Status
    total_contratos = len(contratos)
    contratos_no_prazo = sum(1 for c in contratos if c.status == "no_prazo")
    contratos_atencao = sum(1 for c in contratos if c.status == "atencao")
    contratos_atrasados = sum(1 for c in contratos if c.status == "atrasado")
    contratos_concluidos = sum(1 for c in contratos if c.status == "concluido")

    # 2. Progresso Médio Geral das Etapas
    todas_etapas = db.query(Etapa).filter(Etapa.tenant_id == usuario_atual.tenant_id).all()
    progresso_medio_geral = 0.0
    if todas_etapas:
        # Multiplicamos por 100 para entregar em formato percentual (0 a 100)
        progresso_medio_geral = (sum(e.progresso for e in todas_etapas) / len(todas_etapas)) * 100

    # 3. Distribuição por Área Dinâmica
    areas = db.query(AreaAtuacao).filter(AreaAtuacao.tenant_id == usuario_atual.tenant_id).all()
    distribuicao_area = {}
    for area in areas:
        distribuicao_area[area.nome] = sum(1 for c in contratos if c.area_id == area.id)

    # 4. Próximos Vencimentos (7 dias)
    hoje = datetime.utcnow().date()
    limite_vencimento = hoje + timedelta(days=7)
    
    proximos_vencimentos = []
    for c in contratos:
        if c.data_entrega_final and c.status != "concluido":
            dt_entrega = c.data_entrega_final.date()
            # Se a entrega final está entre hoje e 7 dias para a frente, ou se já está atrasado mas não concluído
            if hoje <= dt_entrega <= limite_vencimento or dt_entrega < hoje:
                dias_restantes = (dt_entrega - hoje).days
                area_nome = next((a.nome for a in areas if a.id == c.area_id), "Desconhecida")
                proximos_vencimentos.append({
                    "id": c.id,
                    "nome_projeto": c.nome_projeto,
                    "cliente": c.cliente,
                    "area": area_nome,
                    "data_entrega_final": c.data_entrega_final.strftime("%Y-%m-%d"),
                    "dias_restantes": dias_restantes,
                    "status": c.status
                })

    # Ordenar por maior urgência (menor dias_restantes)
    proximos_vencimentos.sort(key=lambda x: x["dias_restantes"])

    return {
        "total_contratos": total_contratos,
        "contratos_no_prazo": contratos_no_prazo,
        "contratos_atencao": contratos_atencao,
        "contratos_atrasados": contratos_atrasados,
        "contratos_concluidos": contratos_concluidos,
        "progresso_medio_geral": round(progresso_medio_geral, 1),
        "distribuicao_area": distribuicao_area,
        "proximos_vencimentos": proximos_vencimentos
    }
