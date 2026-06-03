# backend/app/routes/auth.py
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models.usuario import Usuario
from app.models.sessao import Sessao
from app.models.empresa import Empresa
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse, RegisterRequest, RegisterResponse
from app.services.auth import verificar_senha, gerar_hash_senha, criar_sessao, get_usuario_atual
from app.services.email import enviar_email_ativacao

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == request.username).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos."
        )
    
    if not verificar_senha(request.password, usuario.password_hash, usuario.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos."
        )
        
    if not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta conta ainda não foi ativada. Por favor, verifique seu e-mail para ativar."
        )
    
    token = criar_sessao(db, usuario.id)
    return {
        "token": token,
        "user": usuario
    }

@router.post("/register", response_model=RegisterResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # 1. Verifica se e-mail existe
    if db.query(Usuario).filter(Usuario.username == request.email).first():
        raise HTTPException(status_code=400, detail="E-mail já está em uso.")
    
    # 2. Cria a Empresa
    nova_empresa = Empresa(
        nome_fantasia=request.empresa,
        ativo=True
    )
    db.add(nova_empresa)
    db.flush() # Para pegar o id da empresa
    
    # 3. Cria o Usuario admin (inativo até ativação por e-mail)
    pwdhash, salt = gerar_hash_senha(request.senha)
    token = uuid.uuid4().hex
    expira_em = datetime.utcnow() + timedelta(hours=24)
    
    novo_usuario = Usuario(
        nome=f"{request.nome} {request.sobrenome}".strip(),
        username=request.email,
        password_hash=pwdhash,
        salt=salt,
        role="admin",
        is_active=False,
        activation_token=token,
        activation_token_expires=expira_em,
        tenant_id=nova_empresa.id
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    # 4. Envia o e-mail de ativação (SMTP ou Console Log)
    enviar_email_ativacao(
        email_destino=novo_usuario.username,
        nome_usuario=novo_usuario.nome,
        token_ativacao=token
    )
    
    return {
        "message": "Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.",
        "email": novo_usuario.username
    }

@router.get("/activate")
def activate(token: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.activation_token == token).first()
    if not usuario:
        raise HTTPException(status_code=400, detail="Token de ativação inválido.")
    
    if usuario.activation_token_expires and usuario.activation_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Este token de ativação expirou.")
    
    # Ativa o usuário e limpa os campos de token
    usuario.is_active = True
    usuario.activation_token = None
    usuario.activation_token_expires = None
    db.commit()
    
    return {"message": "Sua conta foi ativada com sucesso! Você já pode fazer login."}

@router.post("/logout")
def logout(usuario: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    # Deleta todas as sessões do usuário atual
    db.query(Sessao).filter(Sessao.usuario_id == usuario.id).delete()
    db.commit()
    return {"message": "Sessão encerrada com sucesso."}

@router.get("/me", response_model=UserResponse)
def me(usuario: Usuario = Depends(get_usuario_atual)):
    return usuario
