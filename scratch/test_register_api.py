import urllib.request
import urllib.error
import json

payload = {
    "nome": "Test",
    "sobrenome": "User",
    "empresa": "Test Empresa",
    "razao_social": "Test Empresa Ltda",
    "cnpj": "12.345.678/0001-95",
    "cargo": "Diretor",
    "telefone": "(11) 99999-9999",
    "email": "testuser_unique_123@example.com",
    "senha": "password123"
}

def make_request(url, method="GET", data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        jsondata = json.dumps(data).encode('utf-8')
    else:
        jsondata = None
        
    try:
        with urllib.request.urlopen(req, data=jsondata, timeout=5) as response:
            status = response.status
            body = response.read().decode('utf-8')
            return status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return None, str(e)

print("Testing GET http://localhost:8000/ ...")
status, body = make_request("http://localhost:8000/")
print("Root Status:", status)
print("Root Response:", body)

print("\nTesting POST http://localhost:8000/auth/register ...")
status, body = make_request("http://localhost:8000/auth/register", method="POST", data=payload)
print("Register Status:", status)
print("Register Response:", body)
