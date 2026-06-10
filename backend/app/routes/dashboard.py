# backend/app/routes/dashboard.py
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import extract
from database import get_db
from app.models.contrato import Contrato
from app.models.fase import Fase
from app.models.etapa import Etapa
from app.models.empresa import Empresa
from app.models.area_atuacao import AreaAtuacao
from app.models.usuario import Usuario
from app.services.auth import get_usuario_atual
from app.routes.contratos import calcular_e_atualizar_status

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
def obter_dados_financeiros(
    contrato_id: Optional[int] = Query(None),
    area_id: Optional[int] = Query(None),
    ano: Optional[int] = Query(None),
    db: Session = Depends(get_db), 
    usuario_atual: Usuario = Depends(get_usuario_atual)
):
    """
    Retorna dados financeiros consolidados, fluxo de caixa e marcos de faturamento.
    """
    tenant_id = usuario_atual.tenant_id
    
    # 1. Obter todos os contratos do tenant
    query_contratos = db.query(Contrato).filter(Contrato.tenant_id == tenant_id)
    if contrato_id:
        query_contratos = query_contratos.filter(Contrato.id == contrato_id)
    if area_id:
        query_contratos = query_contratos.filter(Contrato.area_id == area_id)
    if ano:
        from sqlalchemy import or_
        query_contratos = query_contratos.filter(
            or_(
                extract('year', Contrato.data_entrega_final) == ano,
                extract('year', Contrato.data_inicio) == ano
            )
        )
    contratos = query_contratos.all()
    
    # 2. Obter todas as etapas com faturamento do tenant (valor_faturamento > 0)
    # Usando joinedload para carregar fase e contrato de forma eficiente
    query_etapas = (
        db.query(Etapa)
        .join(Fase, Etapa.fase_id == Fase.id)
        .join(Contrato, Fase.contrato_id == Contrato.id)
        .filter(Etapa.tenant_id == tenant_id, Etapa.valor_faturamento > 0)
    )
    if contrato_id:
        query_etapas = query_etapas.filter(Contrato.id == contrato_id)
    if area_id:
        query_etapas = query_etapas.filter(Contrato.area_id == area_id)
    if ano:
        query_etapas = query_etapas.filter(
            or_(
                extract('year', Contrato.data_entrega_final) == ano,
                extract('year', Contrato.data_inicio) == ano,
                extract('year', Etapa.data_termino) == ano
            )
        )
        
    etapas_financeiras = query_etapas.options(joinedload(Etapa.fase).joinedload(Fase.contrato)).all()
    
    # Não precisamos mais carregar tabela de despesas separadamente, pois é um campo no contrato
    
    # TCV: Total Contract Value
    tcv = sum(c.valor_total for c in contratos)
    
    # KPI Totals — Receitas
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
            if status == "faturado":
                total_faturado += val
            elif status == "pendente":
                total_a_receber += val
        else:
            if status == "faturado":
                total_faturado += val
            elif status == "pendente":
                total_a_receber += val
                
    # KPI Totals — Gastos/Despesas
    total_despesas = sum(c.gasto_total for c in contratos if hasattr(c, 'gasto_total') and c.gasto_total)
    despesas_pagas = total_despesas # Assumiremos tudo como pago ou ignoraremos separação
    despesas_pendentes = 0.0
    
    # Obter Taxa de Imposto da Empresa
    empresa = db.query(Empresa).filter(Empresa.id == tenant_id).first()
    taxa_imposto = empresa.taxa_imposto if empresa else 0.0
    
    imposto_projetado = tcv * (taxa_imposto / 100)
    imposto_pago = total_recebido * (taxa_imposto / 100)
    
    # Cálculo de Margens
    margem_real = 0.0
    if total_recebido > 0:
        margem_real = ((total_recebido - despesas_pagas - imposto_pago) / total_recebido) * 100
        
    margem_projetada = 0.0
    if tcv > 0:
        margem_projetada = ((tcv - total_despesas - imposto_projetado) / tcv) * 100
        
    # 4. Receita por Área de Atuação (agrupada pelo valor total do contrato)
    areas = db.query(AreaAtuacao).filter(AreaAtuacao.tenant_id == tenant_id).all()
    areas_map = {a.id: a.nome for a in areas}
    
    receita_por_area_dict = {}
    for c in contratos:
        area_nome = areas_map.get(c.area_id, "Não Categorizado")
        receita_por_area_dict[area_nome] = receita_por_area_dict.get(area_nome, 0.0) + c.valor_total
        
    receita_por_area = [{"name": area, "value": val} for area, val in receita_por_area_dict.items()]
    
    # 5. Gastos por Categoria (Simplificado)
    despesas_por_categoria = [
        {"name": "Gastos Gerais", "value": total_despesas}
    ]
    
    # 6. Rentabilidade e Margem por Área
    rentabilidade_por_area_dict = {}
    for c in contratos:
        area_nome = areas_map.get(c.area_id, "Não Categorizado")
        if area_nome not in rentabilidade_por_area_dict:
            rentabilidade_por_area_dict[area_nome] = {"name": area_nome, "faturado": 0.0, "gasto": 0.0}
        
        rentabilidade_por_area_dict[area_nome]["faturado"] += c.valor_total or 0.0
        rentabilidade_por_area_dict[area_nome]["gasto"] += c.gasto_total or 0.0
        
    rentabilidade_por_area = list(rentabilidade_por_area_dict.values())
    
    # 7. Listagem de Marcos (Milestones)
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
        "total_despesas": total_despesas,
        "despesas_pagas": despesas_pagas,
        "despesas_pendentes": despesas_pendentes,
        "taxa_imposto": taxa_imposto,
        "imposto_projetado": imposto_projetado,
        "imposto_pago": imposto_pago,
        "margem_real": round(margem_real, 1),
        "margem_projetada": round(margem_projetada, 1),
        "receita_por_area": receita_por_area,
        "despesas_por_categoria": despesas_por_categoria,
        "rentabilidade_por_area": rentabilidade_por_area,
        "marcos": marcos
    }

