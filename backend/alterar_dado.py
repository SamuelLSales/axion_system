import sqlite3

# 1. Conecta ao seu banco de dados
conn = sqlite3.connect('aldebaran.db')
cursor = conn.cursor()

# 2. Defina qual tabela, qual campo mudar e a condição.
# Exemplo: Mudando o nome de um contrato na tabela 'contratos'
tabela = 'areas_atuacao' 
campo = 'nome'
novo_valor = 'Topografia'
valor_antigo = 'Topogrfia'

# Executa a alteração
query = f"UPDATE {tabela} SET {campo} = ? WHERE {campo} = ?"
cursor.execute(query, (novo_valor, valor_antigo))

# Verifica quantas linhas foram alteradas
linhas_afetadas = cursor.rowcount
print(f"{linhas_afetadas} registro(s) atualizado(s)!")

# 3. Salva a alteração e fecha a conexão
conn.commit()
conn.close()
