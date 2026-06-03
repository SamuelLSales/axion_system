# 🎨 Prompt: Redesign Visual — Aldebaran Contratos

## Contexto do Projeto
Sistema web corporativo de controle de contratos da **Aldebaran Consultoria** (Belo Horizonte - MG).
Stack: **React + Vite** no frontend, **FastAPI + SQLite** no backend.
O sistema possui duas áreas principais (Topografia e Geologia), com dashboard, 
listagem de contratos, fases, etapas e tarefas.

## Problema Atual
O design atual está visualmente pesado e escuro, não transmitindo a seriedade 
e profissionalismo esperados de um sistema corporativo de engenharia.

## Objetivo
Criar um **Design System completo** para o frontend React antes de qualquer 
alteração nos arquivos. O novo visual deve ser:

- **Corporativo e clean**: transmitir confiança, organização e profissionalismo
- **Mais claro e arejado**: fundo predominantemente branco/cinza-claro, com 
  elementos de cor usados com moderação e intenção
- **Consistente**: todos os componentes seguindo o mesmo padrão visual

---

## O que o Design System deve conter

### 1. Paleta de Cores
Defina variáveis CSS (`:root`) com:
- Cor primária da marca (sugestão: azul-petróleo ou azul-ardósia — remete a 
  engenharia e solidez)
- Cor de destaque/ação (botões, links ativos)
- Escala de neutros (branco, cinzas, preto suave)
- Cores semânticas: sucesso, alerta, erro, informação
- Cores de status de contrato (ex: Em andamento, Concluído, Atrasado)

### 2. Tipografia
- Fonte principal (sugestão: Inter ou IBM Plex Sans — modernas e legíveis)
- Escala tipográfica: h1, h2, h3, body, caption, label
- Pesos utilizados e line-heights

### 3. Espaçamento e Grid
- Escala de espaçamento (4px base)
- Largura máxima do conteúdo
- Colunas e breakpoints

### 4. Componentes — especificação visual de cada um:

#### Sidebar
- Fundo branco ou cinza muito claro (ex: #F8F9FA)
- Itens com ícone + texto, hover suave
- Item ativo com borda esquerda colorida (accent)
- Largura fixa: 240px

#### Header / Topbar
- Fundo branco com sombra sutil (box-shadow leve)
- Logo da Aldebaran à esquerda
- Informações do usuário/perfil à direita

#### Cards de Contrato
- Fundo branco, border-radius 8px, sombra leve
- Badge colorido de status no canto superior direito
- Hierarquia clara: título > área > prazo > progresso

#### Tabelas
- Header com fundo cinza-claro (#F1F3F5)
- Linhas alternadas levemente (zebra sutil)
- Hover na linha com highlight suave
- Bordas mínimas (apenas horizontais)

#### Botões
- Primário: cor de destaque, texto branco, border-radius 6px
- Secundário: outline com cor de destaque
- Destrutivo: vermelho suave
- Estados: hover, active, disabled, loading

#### Badges de Status
- Tamanho pequeno, border-radius pill
- Cada status com cor de fundo pastel + texto escuro correspondente

#### Barra de Progresso
- Altura fina (6–8px), border-radius total
- Cor varia conforme % (verde > amarelo > vermelho)

#### Alertas de Prazo
- Banner ou card destacado quando contrato estiver próximo do vencimento
- Ícone + texto + cor semântica de alerta

### 5. Iconografia
- Biblioteca recomendada: Lucide React (já popular no ecossistema Vite/React)
- Tamanho padrão: 18px inline, 24px standalone

### 6. Sombras e Elevação
- Definir 3 níveis: card, modal, dropdown

### 7. Estados Interativos
- Padrão de focus ring acessível
- Transições suaves (150–200ms ease)

---

## Entregável Esperado
Um arquivo `design-system.md` contendo:
1. Todas as variáveis CSS prontas para colar em um arquivo `variables.css`
2. Especificação escrita de cada componente listado acima
3. Sugestão de estrutura de arquivos CSS/Tailwind para o projeto
4. (Opcional) Exemplos de classes utilitárias mais usadas

**Não altere nenhum arquivo do projeto ainda.** Apenas gere o Design System 
para revisão e aprovação primeiro.