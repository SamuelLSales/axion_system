# backend/app/routes/exportar.py
import io
import csv
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from app.services.auth import obter_usuario_por_token
from app.models.historico import HistoricoAlteracao

router = APIRouter(prefix="/exportar", tags=["Exportação"])

@router.get("/csv")
def exportar_historico_csv(contrato_id: int = Query(None), token: str = Query(None), db: Session = Depends(get_db)):
    """
    Retorna um CSV dinâmico gerado direto do banco de dados, filtrando
    pelo contrato se contrato_id for fornecido.
    """
    usuario = obter_usuario_por_token(db, token)
    if not token or not usuario:
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada. Login necessário.")
    
    query = db.query(HistoricoAlteracao).filter(HistoricoAlteracao.tenant_id == usuario.tenant_id)
    if contrato_id:
        query = query.filter(HistoricoAlteracao.contrato_id == contrato_id)
        
    historicos = query.order_by(HistoricoAlteracao.alterado_em.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    
    # Cabeçalhos
    writer.writerow([
        "Data/Hora", 
        "ID Contrato", 
        "Projeto", 
        "Campo Alterado", 
        "Valor Anterior", 
        "Novo Valor", 
        "Responsável"
    ])
    
    for h in historicos:
        nome_projeto = h.contrato.nome_projeto if h.contrato else "Desconhecido"
        writer.writerow([
            h.alterado_em.strftime("%Y-%m-%d %H:%M:%S"),
            h.contrato_id,
            nome_projeto,
            h.campo_alterado,
            h.valor_anterior or "-",
            h.valor_novo or "-",
            h.alterado_por
        ])
    
    output.seek(0)
    
    filename = f"historico_contrato_{contrato_id}.csv" if contrato_id else "historico_completo.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
