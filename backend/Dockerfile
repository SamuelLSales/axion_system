FROM python:3.11-slim

WORKDIR /app

# Instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante da aplicação
# O banco de dados aldebaran.db será sobrescrito ou mantido através do mapeamento de volumes do docker-compose
COPY . .

EXPOSE 8000

# Executar a API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
