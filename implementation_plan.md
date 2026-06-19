# Roadmap: Evolução para SaaS Seguro (Assinatura Mensal)

Para transformar o Axion System de um software interno para um **SaaS (Software as a Service) comercial com assinaturas mensais**, precisamos atuar em três pilares principais: **Monetização**, **Segurança** e **Escalabilidade**. 

Abaixo estão os passos estratégicos necessários. Por favor, revise-os para definirmos a ordem de prioridade de implementação.

## 1. Monetização e Assinaturas (Billing)

Para cobrar mensalidades de forma automatizada e sem dor de cabeça:

*   **Integração com Gateway de Pagamento:** Conectar o sistema a um gateway (Recomendo fortemente o **Stripe**, **Asaas** ou **Mercado Pago** para o Brasil) para gerenciar as cobranças via Cartão de Crédito ou Pix.
*   **Gestão de Planos e Limites:** Criar planos (ex: Básico, Pro, Enterprise) limitando uso de recursos (ex: limite de contratos ativos, usuários por empresa ou limite de armazenamento de arquivos).
*   **Webhooks de Status:** O sistema precisa escutar o gateway para bloquear automaticamente empresas inadimplentes (`status_pagamento = atrasado`) ou liberar acesso imediato após o pagamento.
*   **Portal do Cliente:** Uma área dentro de *Configurações* para o usuário baixar notas fiscais, atualizar cartão de crédito ou cancelar a assinatura sem intervenção humana.

## 2. Segurança Avançada e LGPD

Tratando-se de um sistema com dados financeiros e de engenharia de várias empresas, a segurança não pode ser secundária.

*   **Isolamento Estrito (Multi-Tenancy):** Embora já tenhamos o `tenant_id`, precisamos implementar regras globais no banco de dados (Row Level Security no PostgreSQL) para garantir matematicamente que a Empresa A *nunca* consiga acessar dados da Empresa B, mesmo que alguém tente fraudar a API.
*   **Troca de Banco de Dados:** Substituir o **SQLite** atual pelo **PostgreSQL**. O SQLite não é recomendado para sistemas multi-tenant com alta concorrência na nuvem, pois trava o banco inteiro durante escritas simultâneas.
*   **Políticas de Senha e MFA (Autenticação de 2 Fatores):** Bloqueio temporário após 5 tentativas de login incorretas (mitigação de ataque de força-bruta) e opção do usuário ativar 2FA via Authy/Google Authenticator.
*   **Adesão à LGPD:** Checkbox obrigatório de Termos de Uso e Política de Privacidade no registro, e opção de "Excluir minha conta e todos os dados" para respeitar a lei de proteção de dados.
*   **Rate Limiting:** Limitar quantas requisições um usuário pode fazer por segundo na API, evitando que ataques derrubem o servidor.

## 3. Gestão de Permissões (RBAC)

Atualmente temos "Admin", mas empresas exigem mais controle:

*   **Perfis de Acesso Granulares:** Criar funções separadas:
    *   *Gestor Financeiro:* Vê o painel financeiro e faturamentos, mas não apaga contratos.
    *   *Gerente de Projeto:* Cria e edita contratos, mas **não** vê dados financeiros, taxas e TCV.
    *   *Operacional / Visualizador:* Apenas vê o cronograma e conclui etapas, sem permissão de edição global.
*   **Convites de Usuários:** O Administrador da conta precisa poder enviar um convite por e-mail para que seus funcionários entrem diretamente vinculados à empresa dele.

## 4. Infraestrutura e Escalabilidade

*   **Hospedagem Cloud:** Preparar a aplicação para deploy no Docker, subindo o frontend na Vercel ou Netlify, e o backend + PostgreSQL na AWS, Render ou Railway.
*   **Backups Automatizados:** Rotinas diárias de dump do banco de dados salvos em servidores separados (Amazon S3), com criptografia, para evitar perda total de dados de clientes em caso de desastres.

---

## Execução da Fase 1: Integração com Asaas

Como você já criou a conta no Asaas, vamos focar em integrar a API deles ao backend do Axion System. A integração funcionará assim: toda empresa cadastrada será sincronizada como um "Cliente" (`Customer`) no Asaas e terá uma "Assinatura" (`Subscription`) vinculada.

### User Review Required

> [!WARNING]
> **Chave de API do Asaas:** Você precisará gerar uma chave de API (API Key) no painel do Asaas e colocá-la nas variáveis de ambiente do sistema (`.env` ou nas configurações do Windows), para que não fiquem expostas no código.

### Open Questions

> [!IMPORTANT]
> 1. **Ambiente:** Vamos iniciar os testes usando a API de Sandbox do Asaas (ambiente de testes sem dinheiro real) ou já vamos apontar direto para Produção?
> 2. **Planos e Preços:** Quais serão os nomes e valores dos planos que vamos oferecer (ex: Básico R$ 99/mês, Pro R$ 199/mês)?
> 3. **Bloqueio de Inadimplência:** Se o Asaas notificar o webhook de que o pagamento de uma empresa está atrasado, devemos bloquear o login dos usuários daquela empresa imediatamente, ou apenas mostrar um alerta vermelho pedindo a regularização?

### Proposed Changes

---

#### 1. Banco de Dados e Modelos (Backend)

Precisamos expandir a tabela `empresas` para guardar os IDs de referência do Asaas.

##### [MODIFY] [empresa.py](file:///c:/Users/Aldebaran/axion_system/backend/app/models/empresa.py)
Adicionar os seguintes campos:
- `asaas_customer_id`: ID do cliente no Asaas.
- `asaas_subscription_id`: ID da assinatura no Asaas.
- `plano`: Nome do plano assinado (ex: "pro", "basico").
- `status_pagamento`: Status atual da assinatura (ex: "ativo", "atrasado", "cancelado").

##### [MODIFY] [migrate_db.py](file:///c:/Users/Aldebaran/axion_system/backend/migrate_db.py)
Adicionar comandos `ALTER TABLE empresas` para inserir essas novas colunas automaticamente nos bancos existentes.

---

#### 2. Serviço de Integração Asaas (Backend)

Vamos criar um módulo específico para conversar com a API do Asaas.

##### [NEW] `c:/Users/Aldebaran/axion_system/backend/app/services/asaas_service.py`
Módulo responsável pelas seguintes funções:
- `criar_cliente(empresa)`: Cria o cliente na API do Asaas e retorna o `asaas_customer_id`.
- `criar_assinatura(customer_id, plano)`: Cria a cobrança recorrente no Asaas.
- `obter_link_pagamento(subscription_id)`: Pega a URL do Asaas para o cliente inserir o cartão de crédito ou pagar via Pix.

---

#### 3. Rotas e Webhooks (Backend)

O frontend precisará interagir com essas funções, e o Asaas precisa de um local no nosso servidor para enviar notificações (Webhooks) de pagamentos aprovados ou recusados.

##### [NEW] `c:/Users/Aldebaran/axion_system/backend/app/routes/assinaturas.py`
Rotas para o frontend:
- `GET /assinatura/status`: Retorna o status atual da assinatura do tenant e o link de pagamento.
- `POST /assinatura/webhook`: Rota desprotegida para receber eventos POST do Asaas (ex: `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`).

##### [MODIFY] [main.py](file:///c:/Users/Aldebaran/axion_system/backend/main.py)
Incluir o novo router `assinaturas_router`.

---

## Verification Plan

### Manual Verification
1. Configurar a `ASAAS_API_KEY` localmente.
2. Iniciar o servidor FastAPI.
3. Chamar o endpoint para criar uma assinatura (mock de cadastro).
4. Verificar se o cliente e a assinatura aparecem no Dashboard do Asaas.
5. Simular um evento de webhook usando o Postman ou o painel do Asaas para garantir que o sistema atualiza o `status_pagamento` da empresa para "ativo" ou "atrasado".
