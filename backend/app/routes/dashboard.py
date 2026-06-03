# backend/app/routes/dashboard.py
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload, joinedload
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

@router.get("/financeiro")
def obter_dados_financeiros(db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    """
    Retorna dados financeiros consolidados, fluxo de caixa e marcos de faturamento.
    """
    tenant_id = usuario_atual.tenant_id
    
    # 1. Obter todos os contratos do tenant
    contratos = db.query(Contrato).filter(Contrato.tenant_id == tenant_id).all()
    
    # 2. Obter todas as etapas com faturamento do tenant (valor_faturamento > 0)
    # Usando joinedload para carregar fase e contrato de forma eficiente
    etapas_financeiras = (
        db.query(Etapa)
        .join(Fase, Etapa.fase_id == Fase.id)
        .join(Contrato, Fase.contrato_id == Contrato.id)
        .filter(Etapa.tenant_id == tenant_id, Etapa.valor_faturamento > 0)
        .options(joinedload(Etapa.fase).joinedload(Fase.contrato))
        .all()
    )
    
    # TCV: Total Contract Value
    tcv = sum(c.valor_total for c in contratos)
    
    # KPI Totals
    total_recebido = 0.0   # pago
    total_faturado = 0.0   # faturado
    total_a_receber = 0.0  # pendente
    total_atrasado = 0.0   # atrasado, ou pendente/faturado com prazo vencido
    
    hoje = datetime.utcnow().date()
    
    for etapa in etapas_financeiras:
        val = etapa.valor_faturamento
        status = (etapa.status_faturamento or "pendente").lower()
        
        # Check if overdue
        prazo_vencido = False
        if etapa.data_termino:
            prazo_vencido = etapa.data_termino.date() < hoje
            
        if status == "pago":
            total_recebido += val
        elif status == "atrasado" or (status in ("pendente", "faturado") and prazo_vencido):
            total_atrasado += val
            # For KPIs, also increment faturado/pendente according to actual status
            if status == "faturado":
                total_faturado += val
            elif status == "pendente":
                total_a_receber += val
        else:
            if status == "faturado":
                total_faturado += val
            elif status == "pendente":
                total_a_receber += val
                
    # 3. Receita por Área de Atuação (agrupada pelo valor total do contrato)
    areas = db.query(AreaAtuacao).filter(AreaAtuacao.tenant_id == tenant_id).all()
    areas_map = {a.id: a.nome for a in areas}
    
    receita_por_area_dict = {}
    for c in contratos:
        area_nome = areas_map.get(c.area_id, "Não Categorizado")
        receita_por_area_dict[area_nome] = receita_por_area_dict.get(area_nome, 0.0) + c.valor_total
        
    receita_por_area = [{"name": area, "value": val} for area, val in receita_por_area_dict.items()]
    
    # 4. Projeção de Fluxo de Caixa (6 meses a partir do mês atual)
    nomes_meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    ano_atual = hoje.year
    mes_atual = hoje.month
    
    meses_lista = []
    for i in range(6):
        m = mes_atual + i
        y = ano_atual
        if m > 12:
            m = m - 12
            y = y + 1
        chave_mes = f"{y}-{m:02d}"
        nome_mes = f"{nomes_meses[m-1]}/{str(y)[2:]}" # Ex: Jan/26
        meses_lista.append((chave_mes, nome_mes))
        
    dados_fluxo = {chave: {"mes": nome, "pago": 0.0, "previsto": 0.0} for chave, nome in meses_lista}
    
    for etapa in etapas_financeiras:
        if not etapa.data_termino:
            continue
        
        y_etapa = etapa.data_termino.year
        m_etapa = etapa.data_termino.month
        chave_etapa = f"{y_etapa}-{m_etapa:02d}"
        
        if chave_etapa in dados_fluxo:
            val = etapa.valor_faturamento
            status = (etapa.status_faturamento or "pendente").lower()
            if status == "pago":
                dados_fluxo[chave_etapa]["pago"] += val
            else:
                dados_fluxo[chave_etapa]["previsto"] += val
                
    fluxo_caixa = [dados_fluxo[chave] for chave, _ in meses_lista]
    
    # 5. Listagem de Marcos (Milestones)
    marcos = []
    for etapa in etapas_financeiras:
        nome_projeto = "N/A"
        cliente = "N/A"
        contrato_id = None
        if etapa.fase and etapa.fase.contrato:
            nome_projeto = etapa.fase.contrato.nome_projeto
            cliente = etapa.fase.contrato.cliente
            contrato_id = etapa.fase.contrato.id
            
        marcos.append({
            "id": etapa.id,
            "contrato_id": contrato_id,
            "nome_projeto": nome_projeto,
            "cliente": cliente,
            "nome_tarefa": etapa.nome_tarefa,
            "responsavel": etapa.responsavel,
            "valor_faturamento": etapa.valor_faturamento,
            "status_faturamento": etapa.status_faturamento or "pendente",
            "data_termino": etapa.data_termino.strftime("%Y-%m-%d") if etapa.data_termino else None,
        })
        
    # Ordenar: os marcos com prazo nulo vão para o final, os outros ordenados por data
    marcos.sort(key=lambda x: (x["data_termino"] is None, x["data_termino"]))
    
    return {
        "tcv": tcv,
        "total_recebido": total_recebido,
        "total_faturado": total_faturado,
        "total_a_receber": total_a_receber,
        "total_atrasado": total_atrasado,
        "receita_por_area": receita_por_area,
        "fluxo_caixa": fluxo_caixa,
        "marcos": marcos
    }

