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
        "cpfCnpj": cpfCnpj
    }
    
    # Remove chaves com None
    payload = {k: v for k, v in payload.items() if v is not None}

    response = requests.post(url, json=payload, headers=get_headers())
    
    if response.status_code in [200, 201]:
        return response.json()
    else:
        raise Exception(f"Erro ao criar cliente no Asaas: {response.text}")

def criar_assinatura(customer_id: str, value: float, description: str):
    """
    Cria uma assinatura (Subscription) via cartão/pix no Asaas para o cliente.
    """
    url = f"{ASAAS_API_URL}/subscriptions"
    
    payload = {
        "customer": customer_id,
        "billingType": "UNDEFINED", # Deixa o cliente escolher PIX, BOLETO ou CREDIT_CARD
        "value": value,
        "nextDueDate": "2026-07-01", # Ajustar a data conforme a necessidade
        "cycle": "MONTHLY",
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
