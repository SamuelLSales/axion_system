# backend/app/services/auth.py
import hashlib
import os
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.sessao import Sessao
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db

security = HTTPBearer(auto_error=False)

def gerar_hash_senha(senha: str, salt: str = None) -> tuple[str, str]:
    """Gera hash PBKDF2 da senha usando SHA256 e sal."""
    if not salt:
        salt = os.urandom(16).hex()
    pwdhash = hashlib.pbkdf2_hmac(
        'sha256', 
        senha.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000
    ).hex()
    return pwdhash, salt

def verificar_senha(senha_fornecida: str, hash_salvada: str, salt: str) -> bool:
    """Verifica se a senha fornecida bate com o hash salvo."""
    pwdhash, _ = gerar_hash_senha(senha_fornecida, salt)
    return pwdhash == hash_salvada

def criar_sessao(db: Session, usuario_id: int, expira_em_dias: int = 7) -> str:
    """Gera e registra uma nova sessão para o usuário."""
    token = uuid.uuid4().hex
    limite = datetime.utcnow() + timedelta(days=expira_em_dias)
    
    sessao = Sessao(
        id=token,
        usuario_id=usuario_id,
        expira_em=limite
    )
    db.add(sessao)
    db.commit()
    return token

def obter_usuario_por_token(db: Session, token: str) -> Usuario:
    """Valida o token e retorna o usuário associado, senão None ou levanta erro."""
    sessao = db.query(Sessao).filter(Sessao.id == token).first()
    if not sessao:
        return None
    
    if sessao.expira_em < datetime.utcnow():
        # Deletar sessão expirada
        db.delete(sessao)
        db.commit()
        return None
        
    return sessao.usuario

def get_usuario_atual(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """Dependência do FastAPI que permite opcionalmente ignorar autenticação."""
    if credentials:
        token = credentials.credentials
        usuario = obter_usuario_por_token(db, token)
        if usuario:
            return usuario
    
    # Se não houver credencial enviada, lança exceção (revertendo o comportamento de mock)
    raise HTTPException(status_code=401, detail="Não autenticado")

def require_admin(usuario: Usuario = Depends(get_usuario_atual)) -> Usuario:
    """Garante que o usuário atual tem perfil admin."""
    if usuario.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem realizar esta ação.")
    return usuario
