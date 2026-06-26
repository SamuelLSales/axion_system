# backend/app/routes/assinaturas.py
import os
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.services.auth import get_usuario_atual
from app.models.usuario import Usuario
from app.models.empresa import Empresa
from app.services.asaas_service import criar_cliente, criar_assinatura, obter_assinatura
from database import get_db

logger = logging.getLogger("axion.assinaturas")

from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/assinaturas", tags=["Assinaturas / Asaas"])

class CreditCardInfo(BaseModel):
    holderName: str
    number: str
    expiryMonth: str
    expiryYear: str
    ccv: str

class CreditCardHolderInfo(BaseModel):
    name: str
    email: str
    cpfCnpj: str
    postalCode: str
    addressNumber: str
    addressComplement: Optional[str] = None
    phone: str
    mobilePhone: Optional[str] = None

class CheckoutTransparenteRequest(BaseModel):
    plano: str
    metodo_pagamento: str # "PIX" ou "CREDIT_CARD"
    creditCard: Optional[CreditCardInfo] = None
    creditCardHolderInfo: Optional[CreditCardHolderInfo] = None
# Preços base por ciclo (valor total cobrado no ciclo, não o valor mensal)
PRECOS = {
    "mensal": {"valor": 200.00, "ciclo": "MONTHLY", "nome": "Mensal"},
    "trimestral": {"valor": 540.00, "ciclo": "QUARTERLY", "nome": "Trimestral"},
    "semestral": {"valor": 1020.00, "ciclo": "SEMIANNUALLY", "nome": "Semestral"},
    "anual": {"valor": 1800.00, "ciclo": "YEARLY", "nome": "Anual"}
}

@router.post("/checkout")
def criar_checkout(plano: str, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    """
    Inicia o checkout para a empresa do usuário logado.
    Se a empresa não tem asaas_customer_id, cria o cliente no Asaas.
    Em seguida, cria a assinatura do plano escolhido e retorna o link.
    """
    if usuario_atual.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem gerenciar assinaturas.")
        
    empresa = db.query(Empresa).filter(Empresa.id == usuario_atual.tenant_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")
        
    if plano not in PRECOS:
        raise HTTPException(status_code=400, detail="Plano inválido. Escolha: mensal, trimestral, semestral ou anual.")
        
    # Se a empresa não tem cliente no Asaas, cria agora
    if not empresa.asaas_customer_id:
        try:
            # Pega o email do usuario admin atual como referência
            cliente_asaas = criar_cliente(nome=empresa.nome_fantasia, email=usuario_atual.username, cpfCnpj=empresa.cnpj)
            empresa.asaas_customer_id = cliente_asaas["id"]
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    # Cria a assinatura no Asaas
    try:
        detalhes_plano = PRECOS[plano]
        assinatura = criar_assinatura(
            customer_id=empresa.asaas_customer_id,
            value=detalhes_plano["valor"],
            description=f"Assinatura Plano {detalhes_plano['nome']} - Axion System",
            cycle=detalhes_plano["ciclo"]
        )
        empresa.asaas_subscription_id = assinatura["id"]
        empresa.plano = plano
        # Até o primeiro pagamento ser feito, o status fica pendente
        db.commit()
        
        # O Asaas não retorna o invoiceUrl na criação da assinatura.
        # Precisamos buscar a primeira cobrança gerada por ela:
        from app.services.asaas_service import obter_link_pagamento_assinatura
        invoice_url = obter_link_pagamento_assinatura(assinatura["id"])
        
        return {
            "status": "success",
            "subscription_id": assinatura["id"],
            "invoiceUrl": invoice_url or "" # Link de pagamento Asaas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/checkout-transparente")
def criar_checkout_transparente(payload: CheckoutTransparenteRequest, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    """
    Cria uma assinatura transparente e retorna os dados para pagamento (QR Code PIX ou sucesso do Cartão).
    """
    if usuario_atual.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem gerenciar assinaturas.")
        
    empresa = db.query(Empresa).filter(Empresa.id == usuario_atual.tenant_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")
        
    if payload.plano not in PRECOS:
        raise HTTPException(status_code=400, detail="Plano inválido.")
        
    if payload.metodo_pagamento not in ["PIX", "CREDIT_CARD"]:
        raise HTTPException(status_code=400, detail="Método de pagamento inválido.")

    if payload.metodo_pagamento == "CREDIT_CARD" and (not payload.creditCard or not payload.creditCardHolderInfo):
        raise HTTPException(status_code=400, detail="Dados do cartão são obrigatórios para pagamento via cartão de crédito.")

    # Se a empresa não tem cliente no Asaas, cria agora
    if not empresa.asaas_customer_id:
        try:
            # Usa os dados do titular do cartão (se houver) ou os dados básicos
            cpf_cnpj = payload.creditCardHolderInfo.cpfCnpj if payload.creditCardHolderInfo else empresa.cnpj
            cliente_asaas = criar_cliente(nome=empresa.nome_fantasia, email=usuario_atual.username, cpfCnpj=cpf_cnpj)
            empresa.asaas_customer_id = cliente_asaas["id"]
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    try:
        detalhes_plano = PRECOS[payload.plano]
        
        # Cria a assinatura no Asaas
        assinatura = criar_assinatura(
            customer_id=empresa.asaas_customer_id,
            value=detalhes_plano["valor"],
            description=f"Assinatura Plano {detalhes_plano['nome']} - Axion System",
            cycle=detalhes_plano["ciclo"],
            billingType=payload.metodo_pagamento,
            creditCard=payload.creditCard.dict() if payload.creditCard else None,
            creditCardHolderInfo=payload.creditCardHolderInfo.dict() if payload.creditCardHolderInfo else None
        )
        
        empresa.asaas_subscription_id = assinatura["id"]
        empresa.plano = payload.plano
        db.commit()
        
        # Buscar pagamento para pegar QR Code PIX
        from app.services.asaas_service import obter_cobranca_assinatura, obter_qrcode_pix
        payment_id = obter_cobranca_assinatura(assinatura["id"])
        
        response_data = {
            "status": "success",
            "subscription_id": assinatura["id"],
            "metodo": payload.metodo_pagamento
        }
        
        if payload.metodo_pagamento == "PIX" and payment_id:
            qr_code_data = obter_qrcode_pix(payment_id)
            response_data["pix"] = {
                "encodedImage": qr_code_data.get("encodedImage"),
                "payload": qr_code_data.get("payload")
            }
            
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def obter_status(db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    """
    Retorna o status da assinatura atual e o plano.
    """
    empresa = db.query(Empresa).filter(Empresa.id == usuario_atual.tenant_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")
        
    return {
        "plano": empresa.plano,
        "status_pagamento": empresa.status_pagamento,
        "asaas_subscription_id": empresa.asaas_subscription_id
    }

@router.post("/webhook")
async def webhook_asaas(request: Request, db: Session = Depends(get_db)):
    """
    Webhook autenticado via ASAAS_WEBHOOK_TOKEN que o Asaas chama para notificações de pagamento.
    """
    # Verificar token de autenticação do webhook
    webhook_token = os.getenv("ASAAS_WEBHOOK_TOKEN")
    if webhook_token:
        received_token = request.headers.get("asaas-access-token", "")
        if received_token != webhook_token:
            logger.warning(f"Webhook rejeitado: token inválido de IP {request.client.host}")
            raise HTTPException(status_code=401, detail="Token de webhook inválido.")
    else:
        logger.warning("ASAAS_WEBHOOK_TOKEN não configurado — webhook aceita qualquer chamada!")

    try:
        payload = await request.json()
        evento = payload.get("event")
        payment = payload.get("payment", {})
        customer_id = payment.get("customer")
        
        logger.info(f"Webhook recebido: evento={evento}, customer={customer_id}, IP={request.client.host}")
        
        if not customer_id:
            return {"status": "ignored", "reason": "No customer ID"}
            
        empresa = db.query(Empresa).filter(Empresa.asaas_customer_id == customer_id).first()
        if not empresa:
            logger.warning(f"Webhook: empresa não encontrada para customer_id={customer_id}")
            return {"status": "ignored", "reason": "Empresa not found for this customer"}
            
        # Analisa o evento
        status_anterior = empresa.status_pagamento
        if evento in ("PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"):
            empresa.status_pagamento = "ativo"
            empresa.ativo = True
        elif evento == "PAYMENT_OVERDUE":
            empresa.status_pagamento = "atrasado"
        elif evento == "PAYMENT_DELETED":
            empresa.status_pagamento = "cancelado"
            
        db.commit()
        logger.info(f"Webhook processado: empresa={empresa.id}, status {status_anterior} → {empresa.status_pagamento}")
        return {"status": "ok"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Erro ao processar webhook")
        return {"status": "error"}

