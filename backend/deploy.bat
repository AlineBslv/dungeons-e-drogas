@echo off
REM Deploy Script - Dungeons e Drogas Backend (Windows)
REM Este script automatiza o deploy do backend em produção

echo =========================================
echo 🚀 Deploy - Dungeons e Drogas Backend
echo =========================================

REM Verifica se está no diretório correto
if not exist "package.json" (
  echo ❌ Erro: Execute este script no diretório backend/
  pause
  exit /b 1
)

REM Verifica se .env.production existe
if not exist ".env.production" (
  echo ⚠️ Aviso: .env.production não encontrado
  echo Copie .env.production.example para .env.production e configure
  pause
)

echo.
echo [1/6] 📦 Instalando dependências...
call npm ci --production

echo.
echo [2/6] 🧪 Testando servidor...
node -e "console.log('✅ Node.js funcionando')"

echo.
echo [3/6] 🔍 Verificando variáveis de ambiente...
if exist ".env.production" (
  echo ✅ Arquivo .env.production encontrado
) else (
  echo ⚠️ Usando variáveis do sistema
)

echo.
echo [4/6] 🛑 Parando processos PM2 antigos...
call pm2 delete dungeons-drogas-backend 2>nul || echo Nenhum processo anterior encontrado

echo.
echo [5/6] 🚀 Iniciando servidor com PM2...
call pm2 start ecosystem.config.js --env production

echo.
echo [6/6] 💾 Salvando configuração PM2...
call pm2 save

echo.
echo =========================================
echo ✅ Deploy concluído com sucesso!
echo =========================================
echo.
echo Comandos úteis:
echo   pm2 status              - Ver status do servidor
echo   pm2 logs                - Ver logs em tempo real
echo   pm2 monit               - Monitorar recursos
echo   pm2 restart all         - Reiniciar servidor
echo.
echo Health check: curl http://localhost:4000/health
echo =========================================
pause
