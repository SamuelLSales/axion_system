# backend/app/services/csv_export.py
import csv
import os
from datetime import datetime

# Caminho do arquivo CSV de histórico na pasta raiz do backend
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "historico_alteracoes.csv")

# Cabeçalhos do arquivo CSV
CSV_HEADERS = [
    "timestamp",
    "contrato_id",
    "nome_projeto",
    "campo_alterado",
    "valor_anterior",
    "valor_novo",
    "alterado_por"
]

def registrar_alteracao_csv(contrato_id: int, nome_projeto: str, campo_alterado: str, valor_anterior: str, valor_novo: str, alterado_por: str = "Sistema"):
    """
    Registra uma modificação de contrato ou etapa diretamente anexando uma nova linha
    no arquivo historico_alteracoes.csv local de forma Thread-safe básica.
    """
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    
    # Verifica se o arquivo já existe para decidir se escreve o cabeçalho
    file_exists = os.path.exists(CSV_PATH)
    
    try:
        # Abre o arquivo no modo 'a' (append) com encoding utf-8 para suportar acentos
        with open(CSV_PATH, mode="a", newline="", encoding="utf-8") as file:
            writer = csv.writer(file, delimiter=";")
            
            # Se o arquivo foi recém-criado, insere os cabeçalhos primeiro
            if not file_exists:
                writer.writerow(CSV_HEADERS)
            
            # Escreve a linha do histórico
            writer.writerow([
                timestamp,
                contrato_id,
                nome_projeto,
                campo_alterado,
                valor_anterior,
                valor_novo,
                alterado_por
            ])
    except Exception as e:
        # Apenas imprime o erro no terminal do servidor para não quebrar o fluxo principal da API
        print(f"[ERRO CSV EXPORT] Não foi possível registrar alteração no CSV: {str(e)}")
