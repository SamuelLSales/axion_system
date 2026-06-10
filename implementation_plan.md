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

> [!IMPORTANT]
> **O que devemos atacar primeiro?**
> Para começarmos as implementações, qual desses três módulos você gostaria que eu desenhasse os primeiros códigos? 
> **(1)** Começar pela infra de pagamentos/planos?
> **(2)** Melhorar os perfis de acesso e bloqueios de segurança?
> **(3)** Preparar a migração para PostgreSQL (essencial para escalabilidade e segurança)?
