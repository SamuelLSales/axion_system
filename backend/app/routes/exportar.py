# backend/app/routes/exportar.py
import os
import csv
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from app.services.csv_export import CSV_PATH, CSV_HEADERS
from app.services.auth import obter_usuario_por_token

router = APIRouter(prefix="/exportar", tags=["Exportação"])

@router.get("/csv")
def exportar_historico_csv(token: str = Query(None), db: Session = Depends(get_db)):
    """
    Retorna o arquivo CSV 'historico_alteracoes.csv' contendo todo o histórico de auditoria
    para download pelo usuário no frontend (exige token de sessão).
    """
    if not token or not obter_usuario_por_token(db, token):
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada. Login necessário.")
    # Se o arquivo não existir por falta de alterações feitas, criamos um vazio com o cabeçalho
    if not os.path.exists(CSV_PATH):
        try:
            with open(CSV_PATH, mode="w", newline="", encoding="utf-8") as file:
                writer = csv.writer(file, delimiter=";")
                writer.writerow(CSV_HEADERS)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro ao inicializar arquivo CSV: {str(e)}")

    # Retorna o arquivo local como download anexado
    return FileResponse(
        path=CSV_PATH,
        media_type="text/csv",
        filename="historico_alteracoes.csv"
    )
