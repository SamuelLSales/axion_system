import sys
import os

sys.path.append(r"c:\Users\Aldebaran\Desktop\G\backend")

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal

from database import SessionLocal
from app.routes.contratos import criar_contrato
from app.schemas.contrato import ContratoCreate
from app.models.usuario import Usuario

db = SessionLocal()

payload = ContratoCreate(
    nome_projeto="ITABIRITO",
    cliente="Exbel",
    empresa="Aldebaran Consultoria",
    direitos_minerarios="51510206",
    area_id=1,
    diretor_projeto="mateus",
    data_inicio="2026-06-02T00:00:00.000Z",
    data_entrega_final="2026-06-23T00:00:00.000Z",
    dias_campo_total=1,
    observacoes=""
)

usuario_mock = db.query(Usuario).filter(Usuario.username == "admin").first()

try:
    res = criar_contrato(contrato_in=payload, db=db, usuario_atual=usuario_mock)
    print("Success!", res.id)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
