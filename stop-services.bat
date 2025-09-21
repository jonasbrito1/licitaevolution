@echo off
echo ============================================
echo  LicitaEvolution - Parando Servicos
echo ============================================
echo.

echo Parando servicos Docker...
docker-compose -f docker-compose.dev.yml down
echo.

echo ============================================
echo  Servicos parados com sucesso!
echo ============================================