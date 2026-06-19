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

---

## Execução da Fase 1.5: Frontend (Portal de Assinaturas)

Como o backend já está plugado no Asaas, vamos finalizar essa funcionalidade construindo a interface para o usuário no Frontend React.

### User Review Required

> [!IMPORTANT]
> **Fluxo de Onboarding (Sua Sugestão):** Achei excelente! É o padrão de ouro de sistemas SaaS. O fluxo será:
> 1. Usuário se cadastra.
> 2. Clica no link do e-mail para validar a conta.
> 3. Faz o primeiro login.
> 4. O sistema detecta que ele ainda não tem um plano e o **bloqueia na Tela de Onboarding/Escolha de Plano** (ele não consegue acessar o dashboard até assinar).
> 5. Ele escolhe o plano, paga, o Asaas libera, e o sistema abre o Dashboard.
>
> Você concorda com esse bloqueio obrigatório (o usuário *precisa* assinar para testar) ou prefere dar X dias de teste grátis (Trial)?

### Open Questions

> [!WARNING]
> 1. Para quem **já tem** um plano e quer apenas consultar faturas ou cancelar no futuro, colocamos um botão "Meu Plano" dentro da tela de Configurações?

### Proposed Changes

---

#### 1. Roteamento de Onboarding (Frontend)

##### [MODIFY] `c:/Users/Aldebaran/axion_system/frontend/src/App.jsx` e `src/components/ProtectedRoute.jsx`
- Adicionar uma regra: Se o usuário estiver logado mas a empresa não tiver `plano` ou o `status_pagamento` for pendente/atrasado, redirecionar obrigatoriamente para a rota `/escolher-plano`.

---

#### 2. Tela de Escolha de Plano

##### [NEW] `c:/Users/Aldebaran/axion_system/frontend/src/pages/EscolherPlanoPage.jsx`
- Uma tela bonita (sem o menu lateral do sistema, focada apenas na conversão).
- Cards detalhando os benefícios do plano Básico e Pro.
- Ao clicar em "Assinar", chama a API do backend para gerar o checkout do Asaas e abre a fatura para pagamento.

---

#### 3. Serviços de API e Tratamento de Erros

##### [MODIFY] `c:/Users/Aldebaran/axion_system/frontend/src/services/api.js`
- Adicionar as funções `criarCheckoutAsaas(plano)`.

##### [MODIFY] `c:/Users/Aldebaran/axion_system/frontend/src/pages/Login.jsx`
- Capturar erros de Inadimplência (403) e redirecionar o usuário para a página de faturas/aviso de bloqueio.

---

## Verification Plan

### Manual Verification
1. Fazer login no Frontend com um usuário Admin.
2. Acessar a nova tela de "Meu Plano".
3. Clicar em "Assinar Pro".
4. Garantir que uma nova aba seja aberta direcionando para o checkout oficial do Asaas daquela empresa.
