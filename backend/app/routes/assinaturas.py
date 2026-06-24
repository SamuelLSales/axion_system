# backend/app/routes/assinaturas.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.services.auth import get_usuario_atual
from app.models.usuario import Usuario
from app.models.empresa import Empresa
from app.services.asaas_service import criar_cliente, criar_assinatura, obter_assinatura
from database import get_db

router = APIRouter(prefix="/assinaturas", tags=["Assinaturas / Asaas"])

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
    Webhook não autenticado que o Asaas vai chamar quando houver pagamento, atraso, etc.
    """
    try:
        payload = await request.json()
        evento = payload.get("event")
        payment = payload.get("payment", {})
        customer_id = payment.get("customer")
        
        if not customer_id:
            return {"status": "ignored", "reason": "No customer ID"}
            
        empresa = db.query(Empresa).filter(Empresa.asaas_customer_id == customer_id).first()
        if not empresa:
            return {"status": "ignored", "reason": "Empresa not found for this customer"}
            
        # Analisa o evento
        if evento == "PAYMENT_RECEIVED" or evento == "PAYMENT_CONFIRMED":
            empresa.status_pagamento = "ativo"
            empresa.ativo = True
        elif evento == "PAYMENT_OVERDUE":
            empresa.status_pagamento = "atrasado"
        elif evento == "PAYMENT_DELETED":
            empresa.status_pagamento = "cancelado"
            
        db.commit()
        return {"status": "ok"}
        
    except Exception as e:
        print(f"Erro no webhook: {e}")
        return {"status": "error"}
