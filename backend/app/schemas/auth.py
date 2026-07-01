# backend/app/schemas/auth.py
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    nome: str
    sobrenome: str
    empresa: str
    razao_social: str | None = None
    cnpj: str | None = None
    cargo: str | None = None
    telefone: str
    email: EmailStr
    senha: str

    @field_validator('nome', 'sobrenome', 'empresa')
    @classmethod
    def nao_vazio(cls, v: str, info) -> str:
        if not v or not v.strip():
            raise ValueError(f'{info.field_name} não pode ser vazio.')
        return v.strip()

    @field_validator('telefone')
    @classmethod
    def telefone_valido(cls, v: str) -> str:
        import re
        limpo = re.sub(r'[^0-9]', '', v)
        if len(limpo) < 10 or len(limpo) > 11:
            raise ValueError('Telefone deve ter 10 ou 11 dígitos.')
        return v


class ProfileUpdateRequest(BaseModel):
    nome: str


class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str


class CompanyUpdateRequest(BaseModel):
    nome_fantasia: str
    razao_social: str | None = None
    cnpj: str | None = None
    taxa_imposto: float | None = 0.0


class CompanyResponse(BaseModel):
    id: int
    nome_fantasia: str
    razao_social: str | None = None
    cnpj: str | None = None
    taxa_imposto: float = 0.0
    plano: str | None = None
    status_pagamento: str = "ativo"
    criado_em: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    username: str
    nome: str
    role: str
    tenant_id: int | None = None
    empresa: CompanyResponse | None = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    token: str
    refresh_token: str
    user: UserResponse


class RegisterResponse(BaseModel):
    message: str
    email: str
