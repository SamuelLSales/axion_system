# 🏗️ Sistema de Controle de Contratos Aldebaran

Este é o sistema web corporativo para controle de prazos e gestão de contratos da **Aldebaran Consultoria** (Belo Horizonte - MG). O sistema é estruturado em duas grandes áreas (Topografia e Geologia), permitindo acompanhar fases, etapas e tarefas em tempo real, com painéis visuais interativos e alertas de prazo integrados.

---

## 📂 Estrutura do Projeto

```text
/aldebaran-contratos
│   iniciar.bat             # Script automatizado para inicialização (Windows)
│   README.md               # Guia de instalação e execução
│
├───backend
│   │   database.py         # Configuração do SQLite com SQLAlchemy
│   │   main.py             # Inicialização da API FastAPI
│   │   requirements.txt    # Dependências do backend Python
│   │
│   └───app
│       ├───models          # Modelos de dados do Banco de Dados
│       ├───routes          # Endpoints da API FastAPI
│       ├───schemas         # Validações Pydantic
│       └───services        # Serviços (ex: Exportação de CSV)
│
└───frontend
    │   package.json        # Dependências e scripts do React + Vite
    │
    └───src
        ├───components      # Componentes reutilizáveis (Header, Sidebar, etc.)
        ├───pages           # Páginas principais (Dashboard, Novo Contrato, etc.)
        └───services        # Chamadas de API (Axios)
```

---

## 🛠️ Pré-requisitos para Instalação

Antes de começar, você precisará ter instalado no seu computador com Windows:

1. **Python 3.10 ou superior**:
   * Baixe no site oficial: [python.org](https://www.python.org/downloads/)
   * **IMPORTANTE**: Durante a instalação, marque a caixa **"Add Python to PATH"** (Adicionar Python ao PATH).
2. **Node.js LTS**:
   * Baixe no site oficial: [nodejs.org](https://nodejs.org/)
   * Instale seguindo o padrão "Next -> Next -> Finish".

---

## ⚡ Inicialização Rápida (Recomendado)

Criamos um script automatizado chamado `iniciar.bat` para facilitar a inicialização de todo o ambiente no Windows.

1. Dê um duplo clique no arquivo `iniciar.bat` localizado na raiz do projeto.
2. O script irá:
   * Criar o ambiente virtual do Python (`venv`).
   * Instalar todas as dependências do backend.
   * Instalar todas as dependências do frontend React.
   * Iniciar o backend FastAPI na porta `8000`.
   * Iniciar o frontend Vite/React na porta `3000`.
3. Abra o seu navegador e acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔧 Inicialização Manual (Passo a Passo)

Caso prefira configurar e rodar cada parte manualmente, siga os passos abaixo no terminal do Windows (PowerShell ou Prompt de Comando):

### 1. Configurando o Backend (FastAPI)

1. Abra o terminal na pasta `backend`:
   ```bash
   cd backend
   ```
2. Crie um ambiente virtual Python:
   ```bash
   python -m venv venv
   ```
3. Ative o ambiente virtual:
   ```bash
   venv\Scripts\activate
   ```
4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
5. Inicie o servidor FastAPI:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
6. O backend estará acessível em: [http://localhost:8000](http://localhost:8000) (documentação interativa em `/docs`).

---

### 2. Configurando o Frontend (React + Vite)

1. Abra outro terminal na pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências do Node:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. O frontend estará acessível em: [http://localhost:3000](http://localhost:3000).


