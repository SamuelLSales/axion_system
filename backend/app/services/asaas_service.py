import os
import requests

ASAAS_API_URL = "https://api.asaas.com/v3"

def get_headers():
    api_key = os.getenv("ASAAS_API_KEY")
    return {
        "accept": "application/json",
        "access_token": api_key,
        "content-type": "application/json"
    }

def criar_cliente(nome: str, email: str = None, cpfCnpj: str = None):
    """
    Cria um cliente (Customer) no Asaas.
    """
    url = f"{ASAAS_API_URL}/customers"
    
    payload = {
        "name": nome,
        "email": email or "contato@empresa.com",
    }
    
    if cpfCnpj and str(cpfCnpj).strip():
        payload["cpfCnpj"] = str(cpfCnpj).strip()

    response = requests.post(url, json=payload, headers=get_headers())
    
    if response.status_code in [200, 201]:
        return response.json()
    else:
        # Se for erro de CPF/CNPJ inválido (comum em testes), tenta criar sem o documento
        try:
            error_data = response.json()
            if "errors" in error_data and any(e.get("code") == "invalid_object" for e in error_data["errors"]):
                if "cpfCnpj" in payload:
                    print(f"Aviso: CPF/CNPJ '{payload['cpfCnpj']}' rejeitado pelo Asaas. Tentando sem o documento...")
                    del payload["cpfCnpj"]
                    fallback_response = requests.post(url, json=payload, headers=get_headers())
                    if fallback_response.status_code in [200, 201]:
                        return fallback_response.json()
                    else:
                        raise Exception(f"Erro ao criar cliente no Asaas (fallback): {fallback_response.text}")
        except ValueError:
            pass # Não é JSON
            
        raise Exception(f"Erro ao criar cliente no Asaas: {response.text}")

def criar_assinatura(customer_id: str, value: float, description: str, cycle: str = "MONTHLY"):
    """
    Cria uma assinatura (Subscription) via cartão/pix no Asaas para o cliente.
    """
    url = f"{ASAAS_API_URL}/subscriptions"
    
    payload = {
        "customer": customer_id,
        "billingType": "UNDEFINED", # Deixa o cliente escolher PIX, BOLETO ou CREDIT_CARD
        "value": value,
        "nextDueDate": "2026-07-01", # Ajustar a data conforme a necessidade
        "cycle": cycle,
        "description": description
    }
    
    response = requests.post(url, json=payload, headers=get_headers())
    
    if response.status_code in [200, 201]:
        return response.json()
    else:
        raise Exception(f"Erro ao criar assinatura no Asaas: {response.text}")

def obter_assinatura(subscription_id: str):
    """
    Obtém os detalhes da assinatura.
    """
    url = f"{ASAAS_API_URL}/subscriptions/{subscription_id}"
    response = requests.get(url, headers=get_headers())
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Erro ao obter assinatura no Asaas: {response.text}")

def obter_link_pagamento_assinatura(subscription_id: str):
    """
    Busca as cobranças geradas por uma assinatura para pegar o link de pagamento (invoiceUrl).
    """
    url = f"{ASAAS_API_URL}/subscriptions/{subscription_id}/payments"
    response = requests.get(url, headers=get_headers())
    if response.status_code == 200:
        data = response.json().get("data", [])
        if data:
            return data[0].get("invoiceUrl")
    return None
