@echo off
echo.
echo ========================================
echo  LicitaEvolution - Parar Desenvolvimento
echo ========================================
echo.

echo [INFO] Parando containers Docker...
docker-compose down

echo [INFO] Parando processos Node.js...
taskkill /f /im node.exe >nul 2>nul

echo [INFO] Parando processos npm...
taskkill /f /im npm.cmd >nul 2>nul

echo [INFO] Limpando containers orfaos...
docker container prune -f >nul 2>nul

echo.
echo [INFO] Todos os servicos foram parados.
echo.

pause