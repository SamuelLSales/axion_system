# 🎨 Design System — Aldebaran Contratos

Este documento define o **Design System completo** para a interface do sistema web corporativo de controle de contratos da **Aldebaran Consultoria** (Belo Horizonte - MG). O novo design visa substituir a interface escura por um padrão visual **clean, moderno e corporativo**, focado em engenharia e solidez.

---

## 1. Diretrizes Visuais e Conceito
- **Profissionalismo & Confiança**: Uso de tipografia robusta e tons sóbrios de azul-ardósia.
- **Claridade & Espaço**: Interfaces predominantemente claras (fundo cinza-claro/branco) com alto contraste e generoso espaçamento para facilitar a leitura.
- **Intencionalidade**: Cores de destaque e semânticas usadas com precisão cirúrgica apenas para guiar a atenção do usuário (ex: status, ações principais, alertas de prazo).

---

## 2. Paleta de Cores (CSS Variables)

Abaixo estão as variáveis prontas para serem coladas no arquivo `src/styles/variables.css` ou na raiz do seu arquivo de estilo global (`index.css`):

```css
:root {
  /* --- Cores de Marca & Primárias --- */
  --color-primary-50: #f0f4f8;
  --color-primary-100: #dbeafe;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e3a8a; /* Azul-ardósia escuro / Engenharia */
  --color-primary-900: #0f172a; /* Azul-petróleo profundo */

  /* --- Cores de Ação / Destaque --- */
  --color-accent-50: #f0fdf4;
  --color-accent-600: #10b981; /* Verde esmeralda para ações positivas */
  --color-accent-700: #047857;
  --color-accent-gold: #eab308; /* Amarelo ouro para destaques */

  /* --- Escala de Neutros --- */
  --color-neutral-white: #ffffff;
  --color-neutral-50: #f8f9fa;   /* Fundo geral das páginas */
  --color-neutral-100: #f1f3f5;  /* Fundo de headers, sidebar, zebra de tabelas */
  --color-neutral-200: #e9ecef;  /* Bordas sutis */
  --color-neutral-300: #dee2e6;  /* Bordas médias / Dividers */
  --color-neutral-500: #6c757d;  /* Texto de apoio (weak) */
  --color-neutral-700: #495057;  /* Texto de leitura (normal) */
  --color-neutral-900: #212529;  /* Títulos e textos de alto contraste */

  /* --- Cores Semânticas --- */
  --color-success: #198754;
  --color-success-bg: #e8f5e9;
  
  --color-warning: #ffc107;
  --color-warning-bg: #fffde7;
  
  --color-danger: #dc3545;
  --color-danger-bg: #ffebee;
  
  --color-info: #0dcaf0;
  --color-info-bg: #e0f7fa;

  /* --- Status Específicos de Contrato --- */
  --status-em-andamento-bg: #e3f2fd;
  --status-em-andamento-text: #0d47a1;
  
  --status-concluido-bg: #e8f5e9;
  --status-concluido-text: #1b5e20;
  
  --status-atrasado-bg: #ffebee;
  --status-atrasado-text: #b71c1c;

  --status-planejamento-bg: #fff3e0;
  --status-planejamento-text: #e65100;

  /* --- Tipografia --- */
  --font-main: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  
  /* --- Sombras --- */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  
  /* --- Transições --- */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 3. Tipografia

- **Fonte Principal**: `'Inter'` (ou `'IBM Plex Sans'`) para todos os elementos de texto.
- **Escala de Texto**:
  - `h1`: 32px (font-weight: 700, line-height: 1.2) - Títulos de páginas principais.
  - `h2`: 24px (font-weight: 600, line-height: 1.3) - Subseções importantes.
  - `h3`: 18px (font-weight: 600, line-height: 1.4) - Títulos de Cards e pequenos blocos.
  - `body`: 14px (font-weight: 400, line-height: 1.5) - Texto de leitura padrão.
  - `caption`/`small`: 12px (font-weight: 400, line-height: 1.4) - Legendas, datas, contadores.
  - `label`: 11px (font-weight: 600, uppercase, tracking-wider) - Rótulos de formulários e cabeçalhos de tabela.

---

## 4. Espaçamento e Grid

- **Base de Espaçamento**: Multiplicador de **4px** para garantir consistência.
  - `sp-1`: 4px | `sp-2`: 8px | `sp-3`: 12px | `sp-4`: 16px (padrão de padding de cards)
  - `sp-6`: 24px (padrão de espaçamento entre seções) | `sp-8`: 32px | `sp-12`: 48px
- **Grid de Layout**:
  - Largura máxima do conteúdo: `1280px`
  - Breakpoints responsivos:
    - Mobile / Tablets: `< 768px` (Sidebar colapsa ou vira menu flutuante)
    - Desktop: `>= 768px` (Layout fixo com Sidebar)

---

## 5. Especificação dos Componentes

### 5.1 Sidebar (Barra Lateral)
- **Largura**: Frequência fixa de `240px`.
- **Fundo**: `var(--color-neutral-white)` ou `var(--color-neutral-50)`.
- **Borda Direita**: `1px solid var(--color-neutral-200)`.
- **Itens de Menu**:
  - Altura do item: `44px` com padding horizontal de `16px`.
  - Ícone (`18px`) alinhado à esquerda com margem direita de `12px`, seguido pelo texto.
  - **Estado Hover**: Fundo sutil `var(--color-neutral-100)` com transição suave (`var(--transition-fast)`).
  - **Estado Ativo**: Fundo levemente sombreado ou cinza `var(--color-neutral-100)`, texto na cor principal (`var(--color-primary-800)`) e uma borda vertical esquerda de `3px solid var(--color-primary-600)`.

### 5.2 Header / Topbar
- **Altura**: `64px`.
- **Fundo**: `var(--color-neutral-white)`.
- **Elevação**: Sombra sutil `var(--shadow-sm)`.
- **Borda Inferior**: `1px solid var(--color-neutral-200)`.
- **Estrutura**:
  - **Lado Esquerdo**: Logo corporativa da Aldebaran Consultoria e indicador de área atual (ex: Topografia ou Geologia).
  - **Lado Direito**: Perfil do usuário com avatar sutil, nome em destaque, papel (ex: Administrador) e botão de Logout.

### 5.3 Cards de Contrato
- **Fundo**: `var(--color-neutral-white)`.
- **Estrutura de Bordas**: `1px solid var(--color-neutral-200)` com `border-radius: 8px`.
- **Sombra**: `var(--shadow-md)` (eleva ligeiramente ao fazer hover para indicar interatividade).
- **Conteúdo Interno**:
  - **Cabeçalho**: Título do Projeto (`h3`, cor `var(--color-neutral-900)`) + Badge de Status flutuando no canto superior direito.
  - **Corpo**: Área (ex: Topografia ou Geologia) escrita em formato `caption` com cor `var(--color-neutral-500)`.
  - **Metadata**: Prazo final destacado com ícone de calendário.
  - **Rodapé**: Barra de progresso compacta (ver item 5.7) e porcentagem visível.

### 5.4 Tabelas
- **Layout**: `width: 100%`, `border-collapse: separate`, `border-spacing: 0`.
- **Cabeçalho (`<thead>`)**: Fundo `var(--color-neutral-100)`, texto `label` (`var(--color-neutral-700)`), alinhamento à esquerda, borda inferior fina `1px solid var(--color-neutral-300)`.
- **Linhas (`<tr>`)**: 
  - Fundo padrão `var(--color-neutral-white)`.
  - Alternação (zebra): Cada linha par com fundo `var(--color-neutral-50)`.
  - Hover: Efeito de destaque nas linhas com fundo `var(--color-primary-50)` e transição suave.
  - Bordas: Apenas bordas horizontais inferiores de `1px solid var(--color-neutral-200)`.

### 5.5 Botões
- **Comum a todos**: `border-radius: 6px`, `font-weight: 500`, transição de cor `var(--transition-fast)`.
- **Botão Primário**:
  - Fundo: `var(--color-primary-800)` ou `var(--color-primary-600)`.
  - Texto: `var(--color-neutral-white)`.
  - Hover: Fundo escurece para `var(--color-primary-700)` ou `var(--color-primary-900)`.
- **Botão Secundário / Outline**:
  - Fundo: Transparente.
  - Borda: `1px solid var(--color-primary-600)`.
  - Texto: `var(--color-primary-600)`.
  - Hover: Fundo sutil `var(--color-primary-50)`.
- **Botão Destrutivo**:
  - Fundo: `var(--color-danger)`.
  - Texto: `var(--color-neutral-white)`.
  - Hover: Fundo mais escuro/pastel avermelhado.
- **Estados**:
  - *Active*: Redução sutil de escala (98%) ou sombra interna.
  - *Disabled*: Fundo `var(--color-neutral-200)`, texto `var(--color-neutral-500)`, cursor não permitido.
  - *Loading*: Cursor de progresso e spinner circular substituindo o ícone comum.

### 5.6 Badges de Status
- **Formato**: Border-radius total (estilo pill), padding vertical de `4px`, horizontal de `12px`.
- **Especificações por Status**:
  - **Em Andamento**: Fundo `var(--status-em-andamento-bg)`, texto `var(--status-em-andamento-text)`.
  - **Concluído**: Fundo `var(--status-concluido-bg)`, texto `var(--status-concluido-text)`.
  - **Atrasado**: Fundo `var(--status-atrasado-bg)`, texto `var(--status-atrasado-text)`.
  - **Planejamento**: Fundo `var(--status-planejamento-bg)`, texto `var(--status-planejamento-text)`.

### 5.7 Barra de Progresso
- **Estrutura**: Canal (fundo cinza sutil `var(--color-neutral-200)`) com altura de `8px` e `border-radius: 9999px`.
- **Indicador Interno**:
  - Altura de `100%`, border-radius idêntico.
  - **Lógica de Cores Dinâmicas (conforme progresso)**:
    - `< 35%`: Vermelho suave (`var(--color-danger)`).
    - `35% - 75%`: Amarelo/Laranja (`var(--color-warning)`).
    - `> 75%`: Verde saudável (`var(--color-success)`).

### 5.8 Alertas de Prazo
- **Design**: Banner horizontal ou card de destaque.
- **Fundo**: `var(--color-danger-bg)` (para atrasados/críticos) ou `var(--color-warning-bg)` (para vencendo em breve).
- **Borda**: Esquerda reforçada (`4px solid`) com a respectiva cor semântica.
- **Conteúdo**: Ícone de alerta (`AlertCircle` ou `Calendar`), descrição do problema e link de ação rápida para ajuste ou contato com o responsável.

---

## 6. Iconografia

- **Biblioteca**: `lucide-react`.
- **Dimensões recomendadas**:
  - Inline com texto: `16px` ou `18px` (ajustar vertical alignment para o centro).
  - Standalone/Dashboard Widgets: `24px`.
- **Cor**: Usar `var(--color-neutral-500)` para ícones secundários/decorativos e `var(--color-primary-800)` para destaque.

---

## 7. Estados Interativos e Acessibilidade

- **Focus Ring**: Todos os elementos interativos (botões, inputs, links) devem exibir um anel de foco visível e acessível: `outline: 2px solid var(--color-primary-600); outline-offset: 2px;` ao serem acessados via teclado.
- **Transições**: Transição suave de cor de fundo e opacidade para hover com `var(--transition-fast)`.

---

## 8. Estrutura de Arquivos CSS Sugerida

Para manter o projeto modular e fácil de gerenciar, sugere-se a seguinte estrutura na pasta `frontend/src/styles`:

```
src/
├── styles/
│   ├── variables.css      # Variáveis do Design System (:root)
│   ├── components.css     # Estilos utilitários dos componentes customizados
│   └── main.css           # Imports globais e reset
```

As variáveis podem ser referenciadas diretamente em arquivos do CSS clássico ou integradas perfeitamente ao `tailwind.config.js` estendendo os temas:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        aldebaran: {
          primary: 'var(--color-primary-800)',
          secondary: 'var(--color-primary-900)',
          light: 'var(--color-neutral-50)',
          border: 'var(--color-neutral-200)',
        }
      }
    }
  }
}
```
