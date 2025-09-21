@echo off
echo ============================================
echo  LicitaEvolution - Iniciando Servicos
echo ============================================
echo.

echo [1/3] Iniciando banco de dados e Redis...
docker-compose -f docker-compose.dev.yml up -d
echo.

echo [2/3] Aguardando servicos ficarem prontos...
timeout /t 10 /nobreak > nul
echo.

echo [3/3] Iniciando aplicacao...
echo Backend estara disponivel em: http://localhost:3001
echo.

echo Para iniciar o backend, execute:
echo   npm run dev
echo.
echo Para iniciar o frontend, execute:
echo   cd frontend
echo   npm start
echo.

echo Para parar os servicos do Docker:
echo   stop-services.bat
echo.

echo ============================================
echo  Servicos Docker iniciados com sucesso!
echo ============================================
echo.
echo Acesse PgAdmin em: http://localhost:5050
echo   Email: admin@admin.com
echo   Senha: admin123
echo.
echo Banco PostgreSQL:
echo   Host: localhost
echo   Porta: 5432
echo   Database: erp_licitacao
echo   Usuario: admin
echo   Senha: admin123
echo.