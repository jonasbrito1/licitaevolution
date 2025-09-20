@echo off
echo.
echo ========================================
echo  LicitaEvolution - Instalar Dependencias
echo ========================================
echo.

echo [INFO] Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale o Node.js 20+ de: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js versao:
node --version

echo [INFO] npm versao:
npm --version

echo.
echo [INFO] Instalando dependencias do backend...
cd backend
npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do backend
    pause
    exit /b 1
)

echo.
echo [INFO] Instalando dependencias do frontend...
cd ..\frontend
npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)

cd ..

echo.
echo [INFO] Instalando dependencias globais uteis...
npm install -g nodemon concurrently

echo.
echo [SUCCESS] Todas as dependencias foram instaladas com sucesso!
echo.

pause