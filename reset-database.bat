@echo off
echo.
echo ========================================
echo  LicitaEvolution - Reset Database
echo ========================================
echo.

echo [ATENCAO] Esta operacao ira apagar TODOS os dados!
echo.
set /p confirm="Tem certeza que deseja continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operacao cancelada.
    pause
    exit /b 0
)

echo.
echo [INFO] Parando containers...
docker-compose down

echo [INFO] Removendo volumes do banco de dados...
docker volume rm licitaevolution_postgres_data 2>nul

echo [INFO] Removendo volumes do Redis...
docker volume rm licitaevolution_redis_data 2>nul

echo [INFO] Iniciando containers com banco limpo...
docker-compose up -d postgres redis

echo [INFO] Aguardando banco ficar disponivel...
timeout /t 15 /nobreak >nul

echo [INFO] Executando migrations...
cd backend
npm run db:migrate 2>nul || echo [INFO] Migrations serao executadas na primeira inicializacao

echo [INFO] Executando seeds...
npm run db:seed 2>nul || echo [INFO] Seeds serao executados na primeira inicializacao

cd ..

echo.
echo [SUCCESS] Banco de dados resetado com sucesso!
echo.
echo Para iniciar a aplicacao:
echo   start-dev.bat
echo.

pause