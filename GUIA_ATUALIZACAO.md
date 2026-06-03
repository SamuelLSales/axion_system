# 🚀 Guia de Atualização e Deploy — Aldebaran Contratos

Este guia orienta o fluxo correto para realizar alterações no código no seu computador local, enviá-las para o GitHub e aplicá-las no servidor (VM).

---

## 💻 1. No seu Computador Local (Desenvolvimento)

Sempre que você terminar de fazer uma modificação no código e quiser enviar para o GitHub, siga estes passos:

### Passo 1.1: Verificar o Status
Certifique-se de que nenhum arquivo indesejado (como bancos de dados locais ou arquivos `.env`) está pendente de envio.
```bash
git status
```
> [!NOTE]
> Arquivos como `aldebaran.db`, `.env` e pastas `node_modules` devem ser ignorados automaticamente pelo Git devido ao arquivo `.gitignore`.

### Passo 1.2: Adicionar e Commitar as Alterações
Adicione os arquivos modificados e crie um commit descritivo:
```bash
git add .
git commit -m "feat/fix: descrição breve do que você alterou"
```

### Passo 1.3: Enviar para o GitHub
Envie as alterações para a sua branch principal (geralmente `main` ou `master`):
```bash
git push origin main
```

---

## ☁️ 2. Na sua Máquina Virtual / VM (Servidor)

Depois de enviar o código para o GitHub, você deve atualizar a VM que está rodando o sistema.

### Passo 2.1: Conectar à VM via Terminal (SSH)
Abra o PowerShell ou Prompt de Comando e conecte-se à VM:
```bash
ssh usuario@ip_da_vm
```

### Passo 2.2: Acessar a pasta do Projeto na VM
```bash
cd ~/aldebaran-contratos
```

### Passo 2.3: Configurar o arquivo `.env` (Somente na primeira vez ou se o token mudar)
Se a VM ainda não tiver o arquivo `.env`, crie-o copiando o modelo:
```bash
cp .env.example .env
```
Edite o arquivo `.env` na VM (usando o editor `nano`):
```bash
nano .env
```
Substitua `seu_token_do_ngrok_aqui` pelo seu token real do Ngrok. Salve o arquivo pressionando `Ctrl + O`, depois `Enter`, e feche com `Ctrl + X`.

### Passo 2.4: Baixar as Novas Alterações do GitHub
```bash
git pull origin main
```
> [!IMPORTANT]
> Graças ao `.gitignore`, o seu banco de dados ativo na VM (`backend/aldebaran.db`) **não** será sobrescrito ou apagado ao rodar o `git pull`.

### Passo 2.5: Reconstruir e Reiniciar o Docker
Para que as atualizações do código entrem em vigor, execute:
```bash
sudo docker compose up -d --build
```
> [!TIP]
> Esse comando irá reconstruir apenas as partes que foram alteradas no código (frontend ou backend) e reiniciará os containers sem qualquer perda de dados do banco.
