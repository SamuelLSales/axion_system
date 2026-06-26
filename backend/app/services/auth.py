# backend/app/services/auth.py
import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.usuario import Usuario
from database import get_db

logger = logging.getLogger("axion.auth")

# ─── Configuração de Segurança ────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "TROQUE_ESTA_CHAVE_EM_PRODUCAO_OBRIGATORIAMENTE")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# ─── Password Hashing (bcrypt via passlib) ────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── Bearer token security scheme ─────────────────────────────────────────────
security = HTTPBearer(auto_error=False)


def gerar_hash_senha(senha: str, salt: str = None) -> tuple[str, str]:
    """
    Gera hash bcrypt da senha.
    O parâmetro 'salt' é mantido por compatibilidade, mas bcrypt gera seu próprio salt internamente.
    Retorna (hash, salt_placeholder) para manter compatibilidade com o schema do banco.
    """
    password_hash = pwd_context.hash(senha)
    # O salt real está embutido no hash bcrypt. Mantemos uma string placeholder
    # para compatibilidade com o schema existente do banco de dados.
    return password_hash, salt or "bcrypt_internal"


def verificar_senha(senha_fornecida: str, hash_salvada: str, salt: str) -> bool:
    """
    Verifica se a senha fornecida bate com o hash salvo.
    Suporta tanto o formato antigo (PBKDF2) quanto o novo (bcrypt).
    """
    # Hashes bcrypt sempre começam com $2b$ ou $2a$
    if hash_salvada.startswith(("$2b$", "$2a$")):
        return pwd_context.verify(senha_fornecida, hash_salvada)
    
    # Fallback para o formato antigo PBKDF2 (para usuários existentes que ainda não trocaram a senha)
    import hashlib
    pwdhash = hashlib.pbkdf2_hmac(
        'sha256',
        senha_fornecida.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return pwdhash == hash_salvada


def criar_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria um JWT access token assinado."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def criar_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria um JWT refresh token assinado (longa duração)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token(token: str) -> Optional[dict]:
    """Decodifica e valida um JWT. Retorna o payload ou None se inválido/expirado."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.debug(f"Token JWT inválido: {e}")
        return None


def get_usuario_atual(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Dependência do FastAPI que extrai o usuário autenticado do JWT.
    Lança HTTP 401 se o token for inválido, expirado ou o usuário não existir.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    token = credentials.credentials
    payload = decodificar_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    
    # Verificar tipo do token (access tokens apenas)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Token inválido (tipo incorreto)")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido (sem identificação)")
    
    usuario = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    if not usuario.is_active:
        raise HTTPException(status_code=401, detail="Conta desativada")
    
    return usuario


def obter_usuario_por_token(db: Session, token: str) -> Optional[Usuario]:
    """
    Valida um JWT e retorna o usuário associado.
    Usado para compatibilidade com a rota de exportação CSV (token via query param).
    """
    if not token:
        return None
    
    payload = decodificar_token(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    return db.query(Usuario).filter(Usuario.id == int(user_id)).first()


def require_admin(usuario: Usuario = Depends(get_usuario_atual)) -> Usuario:
    """Garante que o usuário atual tem perfil admin."""
    if usuario.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acesso negado. Apenas administradores podem realizar esta ação."
        )
    return usuario
