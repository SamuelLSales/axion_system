# backend/seed.py
import sys
import os
from datetime import datetime

# Garante que a pasta backend seja visível para o import do Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Base, engine, SessionLocal
# Importar os modelos explicitamente para que o metadata os conheça ao rodar create_all
from app.models.contrato import Contrato
from app.models.fase import Fase
from app.models.etapa import Etapa
from app.models.responsavel import Responsavel
from app.models.historico import HistoricoAlteracao
from app.models.usuario import Usuario
from app.models.sessao import Sessao

def seed_database():
    print("======================================================")
    print("Inicializando e Semeando o Banco de Dados SQLite...")
    print("======================================================")
    
    # 1. Cria todas as tabelas no arquivo SQLite se elas não existirem
    print("Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Verificar se já existem dados no banco para evitar duplicidade
        if db.query(Responsavel).first() is not None:
            print("O banco de dados já possui dados cadastrados. Pulando seed.")
            return

        # 1.5 Criar Usuários Iniciais (Admin e Viewer)
        from app.models.usuario import Usuario
        from app.services.auth import gerar_hash_senha
        
        if db.query(Usuario).first() is None:
            print("Semeando Usuários...")
            hash_admin, salt_admin = gerar_hash_senha("admin")
            admin = Usuario(username="admin", password_hash=hash_admin, salt=salt_admin, nome="Administrador", role="admin", is_active=True)
            
            hash_visita, salt_visita = gerar_hash_senha("visita")
            visita = Usuario(username="visita", password_hash=hash_visita, salt=salt_visita, nome="Visitante", role="viewer", is_active=True)
            
            db.add_all([admin, visita])
            db.commit()

        # 2. Cadastrar os Responsáveis Padrão
        print("Semeando Responsáveis...")
        robson = Responsavel(nome="Robson Ribeiro", cargo="Diretor", area="Todas")
        nadia = Responsavel(nome="Nadia", cargo="Coordenadora", area="Administrativo")
        humberto = Responsavel(nome="Humberto", cargo="Campo", area="Topografia")
        
        db.add_all([robson, nadia, humberto])
        db.commit() # Salva no banco para obter IDs se necessário
        
        # 3. Criar Contrato Exemplo (Mapeamento Igaratinga MG)
        print("Semeando Contrato de Exemplo...")
        contrato = Contrato(
            nome_projeto="Mapeamento Igaratinga MG",
            cliente="Exbel",
            empresa="Aldebaran Consultoria",
            direitos_minerarios="831.199/2025 e 830.067/2025",
            area="Topografia",
            diretor_projeto="Robson Ribeiro",
            data_inicio=datetime(2026, 2, 20),
            data_entrega_final=datetime(2026, 3, 21),
            dias_campo_total=12,
            status="atrasado", # 2026-03-21 já passou do prazo em relação ao local time (maio de 2026)
            observacoes="Contrato estratégico de mapeamento topográfico e geológico para licenciamento mineral."
        )
        db.add(contrato)
        db.commit()

        # 4. Criar as Fases do Contrato
        print("Semeando Fases...")
        fase1 = Fase(contrato_id=contrato.id, nome_fase="Fase 1 – Planejamento", ordem=1)
        fase2 = Fase(contrato_id=contrato.id, nome_fase="Fase 2 – Mapeamento de Campo", ordem=2)
        fase3 = Fase(contrato_id=contrato.id, nome_fase="Fase 3 – Elaboração de Relatório", ordem=3)
        
        db.add_all([fase1, fase2, fase3])
        db.commit()

        # 5. Criar as Etapas de Cada Fase
        print("Semeando Etapas das Fases...")
        
        # Etapas da Fase 1 - Planejamento (100% completas)
        etapas_fase1 = [
            Etapa(
                fase_id=fase1.id,
                nome_tarefa="Escolha de prestador",
                responsavel="Robson Ribeiro",
                progresso=1.0,
                data_inicio=datetime(2026, 2, 20),
                data_termino=datetime(2026, 2, 22),
                dias_previstos=2,
                observacoes="Definido parceiro de topografia terceirizado para apoio local."
            ),
            Etapa(
                fase_id=fase1.id,
                nome_tarefa="Elaboração do termo de ref.",
                responsavel="Nadia",
                progresso=1.0,
                data_inicio=datetime(2026, 2, 22),
                data_termino=datetime(2026, 2, 24),
                dias_previstos=2,
                observacoes="Termo de referência detalhado enviado para aprovação."
            ),
            Etapa(
                fase_id=fase1.id,
                nome_tarefa="Envio de Termo",
                responsavel="Nadia",
                progresso=1.0,
                data_inicio=datetime(2026, 2, 24),
                data_termino=datetime(2026, 2, 25),
                dias_previstos=1,
                observacoes="Envio oficial de documentação ao prestador."
            ),
            Etapa(
                fase_id=fase1.id,
                nome_tarefa="Negociação Comercial",
                responsavel="Robson Ribeiro",
                progresso=1.0,
                data_inicio=datetime(2026, 2, 25),
                data_termino=datetime(2026, 2, 28),
                dias_previstos=3,
                observacoes="Alinhamento e fechamento de valores e prazos adicionais."
            ),
            Etapa(
                fase_id=fase1.id,
                nome_tarefa="Envio de OS ao prestador",
                responsavel="Nadia",
                progresso=1.0,
                data_inicio=datetime(2026, 2, 28),
                data_termino=datetime(2026, 3, 1),
                dias_previstos=1,
                observacoes="Ordem de Serviço assinada e enviada."
            ),
            Etapa(
                fase_id=fase1.id,
                nome_tarefa="Orientações ao Financeiro",
                responsavel="Nadia",
                progresso=1.0,
                data_inicio=datetime(2026, 3, 1),
                data_termino=datetime(2026, 3, 2),
                dias_previstos=1,
                observacoes="Solicitação de faturamento e adiantamento de despesas de campo."
            )
        ]
        
        # Etapas da Fase 2 - Mapeamento de Campo
        etapas_fase2 = [
            Etapa(
                fase_id=fase2.id,
                nome_tarefa="Mobilização de campo",
                responsavel="Humberto",
                progresso=1.0,
                data_inicio=datetime(2026, 3, 3),
                data_termino=datetime(2026, 3, 4),
                dias_previstos=1,
                observacoes="Equipe e equipamentos deslocados com sucesso para Igaratinga/MG."
            ),
            Etapa(
                fase_id=fase2.id,
                nome_tarefa="Mapeamento 830.067/2025",
                responsavel="Humberto",
                progresso=0.5,
                data_inicio=datetime(2026, 3, 4),
                data_termino=datetime(2026, 3, 12),
                dias_previstos=8,
                observacoes="Mapeamento geológico-topográfico em andamento (50% de área)."
            ),
            Etapa(
                fase_id=fase2.id,
                nome_tarefa="Mapeamento 831.199/2025",
                responsavel="Humberto",
                progresso=0.0,
                data_inicio=datetime(2026, 3, 12),
                data_termino=datetime(2026, 3, 16),
                dias_previstos=4,
                observacoes="Aguardando liberação de proprietário da fazenda vizinha."
            )
        ]
        
        # Etapas da Fase 3 - Elaboração de Relatório (A definir/Padrão)
        etapas_fase3 = [
            Etapa(
                fase_id=fase3.id,
                nome_tarefa="Consolidação de dados de campo",
                responsavel="Nadia",
                progresso=0.0,
                data_inicio=datetime(2026, 3, 16),
                data_termino=datetime(2026, 3, 18),
                dias_previstos=2,
                observacoes="Importação dos pontos e processamento topográfico pós-campo."
            ),
            Etapa(
                fase_id=fase3.id,
                nome_tarefa="Elaboração do relatório técnico",
                responsavel="Robson Ribeiro",
                progresso=0.0,
                data_inicio=datetime(2026, 3, 18),
                data_termino=datetime(2026, 3, 20),
                dias_previstos=2,
                observacoes="Redação da fundamentação geológica e geração de mapas temáticos."
            ),
            Etapa(
                fase_id=fase3.id,
                nome_tarefa="Envio de relatório ao cliente",
                responsavel="Robson Ribeiro",
                progresso=0.0,
                data_inicio=datetime(2026, 3, 20),
                data_termino=datetime(2026, 3, 21),
                dias_previstos=1,
                observacoes="Envio formal em PDF e entrega física dos mapas assinados."
            )
        ]
        
        db.add_all(etapas_fase1)
        db.add_all(etapas_fase2)
        db.add_all(etapas_fase3)
        db.commit()

        # 6. Histórico Inicial
        print("Registrando histórico inicial...")
        historico = HistoricoAlteracao(
            contrato_id=contrato.id,
            campo_alterado="Criado",
            valor_anterior=None,
            valor_novo="Contrato importado da planilha original",
            alterado_por="Sistema",
            alterado_em=datetime.utcnow()
        )
        db.add(historico)
        db.commit()

        print("======================================================")
        print("Banco de dados semeado com sucesso!")
        print("======================================================")

    except Exception as e:
        db.rollback()
        print(f"[ERRO NO SEED] Falha ao semear banco de dados: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
