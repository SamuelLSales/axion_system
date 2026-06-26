# backend/main.py
import sys
import os
import logging
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
import time

# ─── Configuração de Logging Estruturado ──────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ]
)
logger = logging.getLogger("axion")

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
    logger.warning(f"Migrações automáticas ignoradas: {e}")

from database import SessionLocal
from app.services.auth import gerar_hash_senha


def inicializar_admin_se_necessario():
    db = SessionLocal()
    try:
        empresa_padrao = db.query(Empresa).filter(Empresa.nome_fantasia == "Aldebaran Consultoria").first()
        if not empresa_padrao:
            empresa_padrao = Empresa(
                nome_fantasia="Aldebaran Consultoria", 
                cnpj="00000000000000",
                plano="isento",
                status_pagamento="ativo"
            )
            db.add(empresa_padrao)
            db.commit()
            db.refresh(empresa_padrao)
        else:
            # Garante que a empresa existente continue isenta
            if empresa_padrao.plano != "isento":
                empresa_padrao.plano = "isento"
                empresa_padrao.status_pagamento = "ativo"
                db.commit()

        admin_existente = db.query(Usuario).filter(Usuario.username == "admin").first()
        if not admin_existente:
            default_pw = os.getenv("ADMIN_DEFAULT_PASSWORD", "Trocar@123!")
            hash_senha, salt = gerar_hash_senha(default_pw)
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
            logger.info("Usuário administrador padrão configurado com sucesso.")
    except Exception as e:
        logger.error(f"Erro ao inicializar usuário admin: {e}")
    finally:
        db.close()

inicializar_admin_se_necessario()


# ─── Verificação de SECRET_KEY ────────────────────────────────────────────────
secret_key = os.getenv("SECRET_KEY", "")
if not secret_key or secret_key == "TROQUE_ESTA_CHAVE_EM_PRODUCAO_OBRIGATORIAMENTE":
    logger.warning(
        "⚠️  SECRET_KEY não configurada ou usando valor padrão. "
        "Configure uma chave secreta forte no .env antes de publicar!"
    )

# ─── Inicialização da aplicação FastAPI ───────────────────────────────────────
app = FastAPI(
    title="Aldebaran Contratos API",
    description="API Corporativa para Controle de Contratos e Prazos da Aldebaran Consultoria",
    version="1.1.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT", "development") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT", "development") != "production" else None,
)


# ─── Middleware: Request Logging ──────────────────────────────────────────────
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000  # ms
        
        # Não logar health checks para não poluir
        if request.url.path != "/health":
            logger.info(
                f"{request.method} {request.url.path} → {response.status_code} "
                f"({process_time:.0f}ms) IP={request.client.host}"
            )
        return response

app.add_middleware(RequestLoggingMiddleware)


# ─── Middleware: Security Headers ─────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        # HSTS será adicionado quando SSL estiver configurado
        if os.getenv("ENABLE_HSTS", "false").lower() == "true":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)


# ─── Handler Global de Exceções ───────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Captura exceções não tratadas e retorna uma resposta segura (sem stack trace)."""
    logger.exception(f"Exceção não tratada em {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde."}
    )


# ─── Configuração de Rate Limiting ───────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ─── Configuração de CORS ────────────────────────────────────────────────────
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


# ─── Inclusão das rotas e roteadores da API ───────────────────────────────────
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


# ─── Endpoints de Infraestrutura ──────────────────────────────────────────────
@app.get("/")
def read_root():
    return {
        "status": "Online",
        "description": "API do Sistema de Controle de Contratos Aldebaran.",
        "version": "1.1.0",
        "documentation": "/docs"
    }


@app.get("/health")
def health_check():
    """Endpoint de health check para monitoramento de uptime."""
    return {"status": "healthy", "version": "1.1.0"}
