@echo off
echo ======================================
echo  LicitaEvolution - Docker Development
echo ======================================
echo.

if "%1"=="build" (
    echo Construindo imagens Docker...
    docker-compose build
    echo.
    echo Build concluido!
    goto end
)

if "%1"=="up" (
    echo Iniciando servicos...
    docker-compose up -d
    echo.
    echo Servicos iniciados!
    echo.
    echo Acesse:
    echo - Frontend: http://localhost:3000
    echo - Backend API: http://localhost:3001
    echo - PgAdmin: http://localhost:5050
    echo - PostgreSQL: localhost:5432
    echo.
    echo Para ver logs: docker-dev logs
    goto end
)

if "%1"=="down" (
    echo Parando servicos...
    docker-compose down
    echo.
    echo Servicos parados!
    goto end
)

if "%1"=="logs" (
    echo Mostrando logs...
    docker-compose logs -f
    goto end
)

if "%1"=="restart" (
    echo Reiniciando servicos...
    docker-compose down
    docker-compose up -d
    echo.
    echo Servicos reiniciados!
    goto end
)

if "%1"=="status" (
    echo Status dos containers:
    docker-compose ps
    goto end
)

if "%1"=="clean" (
    echo Limpando containers e volumes...
    docker-compose down -v
    docker system prune -f
    echo.
    echo Limpeza concluida!
    goto end
)

echo.
echo Uso: docker-dev [comando]
echo.
echo Comandos disponveis:
echo   build   - Constroi as imagens Docker
echo   up      - Inicia todos os servicos
echo   down    - Para todos os servicos
echo   restart - Reinicia todos os servicos
echo   logs    - Mostra logs em tempo real
echo   status  - Mostra status dos containers
echo   clean   - Para servicos e limpa volumes
echo.

:end