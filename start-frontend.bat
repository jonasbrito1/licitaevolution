@echo off
echo ============================================
echo  LicitaEvolution - Iniciando Frontend
echo ============================================
echo.

echo Verificando se o backend esta rodando...
curl -s http://localhost:3001/api/health > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo AVISO: Backend nao encontrado em http://localhost:3001
    echo Execute 'start-backend.bat' primeiro.
    echo.
    pause
    exit /b 1
)

echo.
echo Iniciando frontend em modo desenvolvimento...
echo Frontend estara disponivel em: http://localhost:3000
echo.
echo Para parar, pressione Ctrl+C
echo.

cd frontend
npm start