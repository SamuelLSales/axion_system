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

class UserResponse(BaseModel):
    id: int
    username: str
    nome: str
    role: str

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    token: str
    user: UserResponse

class RegisterResponse(BaseModel):
    message: str
    email: str
