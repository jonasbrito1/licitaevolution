@echo off
echo ============================================
echo  LicitaEvolution - Iniciando Backend
echo ============================================
echo.

echo Verificando se os servicos Docker estao rodando...
docker ps | findstr licitaevolution_mysql > nul
if %errorlevel% neq 0 (
    echo.
    echo AVISO: Servicos Docker nao encontrados!
    echo Execute 'start-services.bat' primeiro.
    echo.
    pause
    exit /b 1
)

echo.
echo Iniciando backend em modo desenvolvimento...
echo Backend estara disponivel em: http://localhost:3001
echo.
echo Para parar, pressione Ctrl+C
echo.

npm run dev