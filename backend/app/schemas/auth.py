# backend/app/schemas/auth.py
from pydantic import BaseModel
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    nome: str
    sobrenome: str
    empresa: str
    telefone: str
    email: str
    senha: str

class ProfileUpdateRequest(BaseModel):
    nome: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class CompanyUpdateRequest(BaseModel):
    nome_fantasia: str
    razao_social: str | None = None
    cnpj: str | None = None

class CompanyResponse(BaseModel):
    id: int
    nome_fantasia: str
    razao_social: str | None = None
    cnpj: str | None = None

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
    user: UserResponse

class RegisterResponse(BaseModel):
    message: str
    email: str
