@echo off
echo.
echo ========================================
echo  LicitaEvolution - Setup para Windows
echo ========================================
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js 20+ de: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se o Docker está instalado
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Docker nao encontrado!
    echo Por favor, instale o Docker Desktop de: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar se o Git está instalado
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Git nao encontrado!
    echo Por favor, instale o Git de: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [INFO] Verificando dependencias...

REM Verificar versões
echo [INFO] Node.js versao:
node --version

echo [INFO] npm versao:
npm --version

echo [INFO] Docker versao:
docker --version

echo.
echo [INFO] Todas as dependencias estao instaladas!
echo.

REM Criar arquivos de ambiente se não existirem
echo [INFO] Configurando arquivos de ambiente...

if not exist .env.example (
    echo [INFO] Criando .env.example...
    (
        echo # Configuracao do Banco de Dados
        echo POSTGRES_HOST=localhost
        echo POSTGRES_PORT=5432
        echo POSTGRES_DB=licitaevolution
        echo POSTGRES_USER=postgres
        echo POSTGRES_PASSWORD=senha123
        echo DATABASE_URL=postgresql://postgres:senha123@localhost:5432/licitaevolution
        echo.
        echo # Configuracao JWT
        echo JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # Configuracao Redis
        echo REDIS_HOST=localhost
        echo REDIS_PORT=6379
        echo REDIS_PASSWORD=
        echo.
        echo # Configuracao Claude AI
        echo ANTHROPIC_API_KEY=sua_chave_anthropic_aqui
        echo ANTHROPIC_MODEL=claude-3-opus-20240229
        echo.
        echo # Configuracao do Servidor
        echo NODE_ENV=development
        echo PORT=3001
        echo.
        echo # URLs
        echo FRONTEND_URL=http://localhost:3000
        echo BACKEND_URL=http://localhost:3001
    ) > .env.example
)

if not exist .env (
    echo [INFO] Copiando .env.example para .env...
    copy .env.example .env
    echo.
    echo [ATENCAO] Configure as variaveis de ambiente no arquivo .env
    echo Especialmente:
    echo   - ANTHROPIC_API_KEY (chave da API Claude)
    echo   - JWT_SECRET (chave secreta para JWT)
    echo   - POSTGRES_PASSWORD (senha do banco)
    echo.
)

echo [INFO] Instalando dependencias do backend...
cd backend
npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do backend
    pause
    exit /b 1
)

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
echo [INFO] Criando diretorio de logs...
if not exist backend\logs mkdir backend\logs

echo [INFO] Criando diretorio de uploads...
if not exist backend\uploads mkdir backend\uploads
if not exist backend\uploads\temp mkdir backend\uploads\temp

echo.
echo ========================================
echo  Setup concluido com sucesso!
echo ========================================
echo.
echo Para iniciar o sistema:
echo.
echo 1. Configure o arquivo .env com suas credenciais
echo 2. Execute: docker-compose up -d  (para banco e Redis)
echo 3. Execute: npm run dev             (em outro terminal)
echo.
echo Ou use o script de desenvolvimento:
echo    start-dev.bat
echo.
echo Documentacao: README.md
echo.

pause