@echo off
echo ==============================================
echo Iniciando Sistema Geogest (SaaS Multi-tenant)
echo ==============================================

echo.
echo [1/2] Configurando e iniciando o Backend (FastAPI)...
cd backend
if not exist venv (
    echo Criando ambiente virtual...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Instalando dependencias do backend...
pip install -r requirements.txt
echo Iniciando API...
start "Geogest API (Backend)" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo [2/2] Configurando e iniciando o Frontend (React)...
cd ../frontend
echo Instalando dependencias do frontend...
call npm install
echo Iniciando Web App...
start "Geogest Web (Frontend)" cmd /k "npm run dev"

echo.
echo ==============================================
echo Tudo pronto!
echo Frontend (Web): http://localhost:3000
echo Backend (API):  http://localhost:8000
echo ==============================================
pause
