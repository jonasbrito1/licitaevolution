@echo off
echo.
echo ========================================
echo  LicitaEvolution - Ambiente de Desenvolvimento
echo ========================================
echo.

REM Verificar se o Docker está rodando
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Docker nao esta rodando!
    echo Por favor, inicie o Docker Desktop primeiro.
    pause
    exit /b 1
)

REM Verificar se existe .env
if not exist .env (
    echo [ERRO] Arquivo .env nao encontrado!
    echo Execute primeiro: setup-windows.bat
    pause
    exit /b 1
)

echo [INFO] Iniciando servicos de infraestrutura...
docker-compose up -d postgres redis

echo [INFO] Aguardando servicos ficarem disponiveis...
timeout /t 10 /nobreak >nul

echo [INFO] Verificando status dos containers...
docker-compose ps

echo.
echo [INFO] Iniciando aplicacao em modo desenvolvimento...
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo pgAdmin: http://localhost:5050 (admin@admin.com / admin)
echo.

REM Abrir múltiplas janelas do terminal
start "Backend API" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend React" cmd /k "cd frontend && npm start"

echo [INFO] Aplicacao iniciada!
echo.
echo Pressione qualquer tecla para parar todos os servicos...
pause >nul

echo.
echo [INFO] Parando servicos...
docker-compose down
taskkill /f /im node.exe >nul 2>nul

echo [INFO] Servicos parados.
pause