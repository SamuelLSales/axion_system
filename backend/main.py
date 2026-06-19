# backend/main.py
import sys
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

# Garante que o diretório backend e backend/app estejam no sys.path do Python para resolver os imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "app"))

from app.routes.contratos import router as contratos_router
from app.routes.fases import router as fases_router
from app.routes.etapas import router as etapas_router
from app.routes.dashboard import router as dashboard_router
from app.routes.exportar import router as exportar_router
from app.routes.responsaveis import router as responsaveis_router
from app.routes.auth import router as auth_router
from app.routes.areas_atuacao import router as areas_atuacao_router
from app.routes.despesas import router as despesas_router
from app.routes.empresa import router as empresa_router
from app.routes.assinaturas import router as assinaturas_router
from app.services.auth import get_usuario_atual

from database import Base, engine
# Importar todos os modelos para garantir criação automática de novas tabelas
from app.models.contrato import Contrato
from app.models.fase import Fase
from app.models.etapa import Etapa
from app.models.responsavel import Responsavel
from app.models.historico import HistoricoAlteracao
from app.models.usuario import Usuario
from app.models.sessao import Sessao
from app.models.empresa import Empresa
from app.models.area_atuacao import AreaAtuacao
from app.models.despesa import Despesa

Base.metadata.create_all(bind=engine)

# Executar migrações automáticas de colunas ausentes (compatível com SQLite e PostgreSQL)
try:
    from migrate_db import run_migration
    run_migration()
except Exception as e:
    print(f"Erro ao executar migrações automáticas no startup: {e}")

from database import SessionLocal
from app.services.auth import gerar_hash_senha

def inicializar_admin_se_necessario():
    db = SessionLocal()
    try:
        empresa_padrao = db.query(Empresa).filter(Empresa.nome_fantasia == "Aldebaran Consultoria").first()
        if not empresa_padrao:
            empresa_padrao = Empresa(nome_fantasia="Aldebaran Consultoria", cnpj="00000000000000")
            db.add(empresa_padrao)
            db.commit()
            db.refresh(empresa_padrao)

        admin_existente = db.query(Usuario).filter(Usuario.username == "admin").first()
        if not admin_existente:
            hash_senha, salt = gerar_hash_senha("admin")
            admin_user = Usuario(
                username="admin",
                nome="Administrador",
                password_hash=hash_senha,
                salt=salt,
                role="admin",
                is_active=True,
                tenant_id=empresa_padrao.id
            )
            db.add(admin_user)
            db.commit()
            print("Usuário administrador padrão (admin/admin) configurado com sucesso.")
    except Exception as e:
        print(f"Erro ao inicializar usuário admin: {e}")
    finally:
        db.close()

inicializar_admin_se_necessario()

# Inicialização da aplicação FastAPI
app = FastAPI(
    title="Aldebaran Contratos API",
    description="API Corporativa para Controle de Contratos e Prazos da Aldebaran Consultoria",
    version="1.0.0"
)

# Configuração de CORS (Cross-Origin Resource Sharing)
# Habilitado para allow_origins=["*"] para permitir que outros dispositivos
# na rede interna local acessem a API hospedada neste servidor Windows/Linux.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão das rotas e roteadores da API
app.include_router(auth_router)
app.include_router(contratos_router, dependencies=[Depends(get_usuario_atual)])
app.include_router(fases_router, dependencies=[Depends(get_usuario_atual)])
app.include_router(etapas_router, dependencies=[Depends(get_usuario_atual)])
app.include_router(despesas_router, dependencies=[Depends(get_usuario_atual)])
app.include_router(dashboard_router, dependencies=[Depends(get_usuario_atual)])
app.include_router(exportar_router) # Exportar valida o token internamente via query params
app.include_router(responsaveis_router, dependencies=[Depends(get_usuario_atual)])
app.include_router(areas_atuacao_router, dependencies=[Depends(get_usuario_atual)])
app.include_router(empresa_router, dependencies=[Depends(get_usuario_atual)])
app.include_router(assinaturas_router) # Webhook não tem dependência de auth. As rotas internas cuidam disso.

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "description": "API do Sistema de Controle de Contratos Aldebaran rodando localmente.",
        "documentation": "/docs"
    }
