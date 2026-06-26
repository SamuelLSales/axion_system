# backend/app/routes/auth.py
import re
import logging
import threading
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger("axion.auth")

limiter = Limiter(key_func=get_remote_address)

from app.models.usuario import Usuario
from app.models.empresa import Empresa
from app.schemas.auth import (
    LoginRequest, LoginResponse, UserResponse, RegisterRequest, RegisterResponse,
    ProfileUpdateRequest, PasswordChangeRequest, CompanyUpdateRequest, CompanyResponse
)
from app.services.auth import (
    verificar_senha, gerar_hash_senha,
    criar_access_token, criar_refresh_token, decodificar_token,
    get_usuario_atual
)
from app.services.email import enviar_email_ativacao

router = APIRouter(prefix="/auth", tags=["Autenticação"])


# ─── Validadores ──────────────────────────────────────────────────────────────

def validar_senha_forte(senha: str) -> None:
    """Valida que a senha atende os requisitos mínimos de segurança."""
    if len(senha) < 8:
        raise HTTPException(status_code=400, detail="A senha deve ter no mínimo 8 caracteres.")
    if not re.search(r"[A-Z]", senha):
        raise HTTPException(status_code=400, detail="A senha deve conter pelo menos uma letra maiúscula.")
    if not re.search(r"[a-z]", senha):
        raise HTTPException(status_code=400, detail="A senha deve conter pelo menos uma letra minúscula.")
    if not re.search(r"\d", senha):
        raise HTTPException(status_code=400, detail="A senha deve conter pelo menos um número.")


def validar_cnpj(cnpj: str) -> bool:
    """Valida CNPJ com verificação dos dígitos verificadores."""
    cnpj = re.sub(r'[^0-9]', '', cnpj)
    if len(cnpj) != 14:
        return False
    # Rejeita CNPJs com todos os dígitos iguais
    if cnpj == cnpj[0] * 14:
        return False
    # Cálculo do primeiro dígito verificador
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj[i]) * pesos1[i] for i in range(12))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto
    if int(cnpj[12]) != digito1:
        return False
    # Cálculo do segundo dígito verificador
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj[i]) * pesos2[i] for i in range(13))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto
    if int(cnpj[13]) != digito2:
        return False
    return True


# ─── Endpoints de Autenticação ────────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == login_data.username).first()
    if not usuario:
        logger.warning(f"Tentativa de login com usuário inexistente: {login_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos."
        )
    
    if not verificar_senha(login_data.password, usuario.password_hash, usuario.salt):
        logger.warning(f"Senha incorreta para usuário: {login_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos."
        )
        
    if not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta conta ainda não foi ativada. Por favor, verifique seu e-mail para ativar."
        )
        
    empresa = db.query(Empresa).filter(Empresa.id == usuario.tenant_id).first()
    if empresa and empresa.status_pagamento == "atrasado":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="O acesso da sua empresa está suspenso devido a faturas em atraso. Por favor, regularize o pagamento para continuar usando o sistema."
        )

    # Migrar hash antigo para bcrypt no login (transparente para o usuário)
    if not usuario.password_hash.startswith(("$2b$", "$2a$")):
        new_hash, new_salt = gerar_hash_senha(login_data.password)
        usuario.password_hash = new_hash
        usuario.salt = new_salt
        db.commit()
        logger.info(f"Hash migrado para bcrypt para o usuário {usuario.id}")
    
    # Gerar tokens JWT
    token_data = {"sub": str(usuario.id), "tenant_id": str(usuario.tenant_id), "role": usuario.role}
    access_token = criar_access_token(token_data)
    refresh_token = criar_refresh_token(token_data)
    
    logger.info(f"Login bem-sucedido: usuário {usuario.id} ({usuario.username})")
    
    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "user": usuario
    }


@router.post("/refresh")
def refresh_token(request: Request, db: Session = Depends(get_db)):
    """Gera um novo access token a partir de um refresh token válido."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Refresh token não fornecido.")
    
    token = auth_header.replace("Bearer ", "")
    payload = decodificar_token(token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido ou expirado.")
    
    user_id = payload.get("sub")
    usuario = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
    if not usuario or not usuario.is_active:
        raise HTTPException(status_code=401, detail="Usuário não encontrado ou desativado.")
    
    # Gerar novo access token
    token_data = {"sub": str(usuario.id), "tenant_id": str(usuario.tenant_id), "role": usuario.role}
    new_access_token = criar_access_token(token_data)
    
    logger.info(f"Token renovado para usuário {usuario.id}")
    
    return {"token": new_access_token}


@router.post("/register", response_model=RegisterResponse)
@router.post("/signup", response_model=RegisterResponse)
@limiter.limit("3/hour")
def register(request: Request, register_data: RegisterRequest, db: Session = Depends(get_db)):
    try:
        # 1. Validar senha forte
        validar_senha_forte(register_data.senha)
        
        # 2. Verifica se e-mail existe
        if db.query(Usuario).filter(Usuario.username == register_data.email).first():
            raise HTTPException(status_code=400, detail="E-mail já está em uso.")

        # 3. Verifica e valida CNPJ
        cnpj_limpo = re.sub(r'[^0-9]', '', register_data.cnpj.strip()) if register_data.cnpj else None
        if cnpj_limpo:
            if not validar_cnpj(cnpj_limpo):
                raise HTTPException(status_code=400, detail="CNPJ inválido. Verifique os dígitos.")
            if db.query(Empresa).filter(Empresa.cnpj == cnpj_limpo).first():
                raise HTTPException(status_code=400, detail="CNPJ já está cadastrado no sistema.")

        # 4. Cria a Empresa
        nova_empresa = Empresa(
            nome_fantasia=register_data.empresa,
            razao_social=register_data.razao_social or None,
            cnpj=cnpj_limpo or None,
            ativo=True
        )
        db.add(nova_empresa)
        db.flush()
        
        # 5. Cria o Usuario admin (inativo até ativação por e-mail)
        pwdhash, salt = gerar_hash_senha(register_data.senha)
        
        import uuid
        token = uuid.uuid4().hex
        expira_em = datetime.now(timezone.utc) + timedelta(hours=24)
        
        novo_usuario = Usuario(
            nome=f"{register_data.nome} {register_data.sobrenome}".strip(),
            username=register_data.email,
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
        
        logger.info(f"Nova conta criada: empresa={nova_empresa.nome_fantasia}, email={novo_usuario.username}")
        
        # 6. Envia o e-mail de ativação em background
        def _enviar():
            try:
                enviar_email_ativacao(
                    email_destino=novo_usuario.username,
                    nome_usuario=novo_usuario.nome,
                    token_ativacao=token
                )
            except Exception as e:
                logger.error(f"Erro ao enviar e-mail de ativação para {novo_usuario.username}: {e}")

        threading.Thread(target=_enviar, daemon=True).start()
        
        return {
            "message": "Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.",
            "email": novo_usuario.username
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.exception(f"Erro interno no cadastro")
        raise HTTPException(
            status_code=500,
            detail="Ocorreu um erro interno ao processar seu cadastro. Por favor, tente novamente mais tarde."
        )


@router.get("/activate")
def activate(token: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.activation_token == token).first()
    if not usuario:
        raise HTTPException(status_code=400, detail="Token de ativação inválido.")
    
    if usuario.activation_token_expires and usuario.activation_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Este token de ativação expirou.")
    
    # Ativa o usuário e limpa os campos de token
    usuario.is_active = True
    usuario.activation_token = None
    usuario.activation_token_expires = None
    db.commit()
    
    logger.info(f"Conta ativada: usuário {usuario.id} ({usuario.username})")
    
    return {"message": "Sua conta foi ativada com sucesso! Você já pode fazer login."}

@router.post("/logout")
def logout(usuario: Usuario = Depends(get_usuario_atual)):
    """
    Com JWT, o logout é tratado no frontend (remover o token).
    Este endpoint existe para compatibilidade e logging.
    """
    logger.info(f"Logout: usuário {usuario.id} ({usuario.username})")
    return {"message": "Sessão encerrada com sucesso."}

@router.get("/me", response_model=UserResponse)
def me(usuario: Usuario = Depends(get_usuario_atual)):
    return usuario

@router.put("/profile", response_model=UserResponse)
def update_profile(request: ProfileUpdateRequest, usuario: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    usuario.nome = request.nome
    db.commit()
    db.refresh(usuario)
    return usuario

@router.post("/change-password")
def change_password(request: PasswordChangeRequest, usuario: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    # 1. Verifica se a senha antiga está correta
    if not verificar_senha(request.old_password, usuario.password_hash, usuario.salt):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha atual fornecida está incorreta."
        )
    
    # 2. Validar nova senha forte
    validar_senha_forte(request.new_password)
    
    # 3. Gera a nova senha (agora com bcrypt) e salva
    pwdhash, salt = gerar_hash_senha(request.new_password)
    usuario.password_hash = pwdhash
    usuario.salt = salt
    db.commit()
    
    logger.info(f"Senha alterada: usuário {usuario.id}")
    
    return {"message": "Senha alterada com sucesso!"}

@router.get("/company", response_model=CompanyResponse)
def get_company(usuario: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    if not usuario.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não possui uma empresa associada."
        )
    empresa = db.query(Empresa).filter(Empresa.id == usuario.tenant_id).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada."
        )
    return empresa

@router.put("/company", response_model=CompanyResponse)
def update_company(request: CompanyUpdateRequest, usuario: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    # Garantir que apenas admins podem atualizar os dados da empresa
    if usuario.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem gerenciar as configurações da empresa."
        )
    
    if not usuario.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não possui uma empresa associada."
        )
        
    empresa = db.query(Empresa).filter(Empresa.id == usuario.tenant_id).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada."
        )
        
    # Verificar e validar o CNPJ fornecido
    if request.cnpj:
        cnpj_limpo = re.sub(r'[^0-9]', '', request.cnpj.strip())
        if cnpj_limpo:
            if not validar_cnpj(cnpj_limpo):
                raise HTTPException(status_code=400, detail="CNPJ inválido. Verifique os dígitos.")
            empresa_existente = db.query(Empresa).filter(Empresa.cnpj == cnpj_limpo, Empresa.id != empresa.id).first()
            if empresa_existente:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Este CNPJ já está sendo utilizado por outra empresa cadastrada."
                )
            empresa.cnpj = cnpj_limpo
            
    empresa.nome_fantasia = request.nome_fantasia
    empresa.razao_social = request.razao_social
    if request.taxa_imposto is not None:
        empresa.taxa_imposto = request.taxa_imposto
    
    db.commit()
    db.refresh(empresa)
    return empresa
