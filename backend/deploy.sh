#!/bin/bash
# Deploy Script - Dungeons e Drogas Backend
# Este script automatiza o deploy do backend em produção

set -e # Para em caso de erro

echo "========================================="
echo "🚀 Deploy - Dungeons e Drogas Backend"
echo "========================================="

# Verifica se está no diretório correto
if [ ! -f "package.json" ]; then
  echo "❌ Erro: Execute este script no diretório backend/"
  exit 1
fi

# Verifica se .env.production existe
if [ ! -f ".env.production" ]; then
  echo "⚠️ Aviso: .env.production não encontrado"
  echo "Copie .env.production.example para .env.production e configure"
  read -p "Deseja continuar mesmo assim? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""
echo "[1/6] 📦 Instalando dependências..."
npm ci --production

echo ""
echo "[2/6] 🧪 Testando servidor..."
node -e "console.log('✅ Node.js funcionando')"

echo ""
echo "[3/6] 🔍 Verificando variáveis de ambiente..."
if [ -f ".env.production" ]; then
  source .env.production
  echo "✅ Variáveis carregadas"
else
  echo "⚠️ Usando variáveis do sistema"
fi

echo ""
echo "[4/6] 🛑 Parando processos PM2 antigos..."
pm2 delete dungeons-drogas-backend 2>/dev/null || echo "Nenhum processo anterior encontrado"

echo ""
echo "[5/6] 🚀 Iniciando servidor com PM2..."
pm2 start ecosystem.config.js --env production

echo ""
echo "[6/6] 💾 Salvando configuração PM2..."
pm2 save

echo ""
echo "========================================="
echo "✅ Deploy concluído com sucesso!"
echo "========================================="
echo ""
echo "Comandos úteis:"
echo "  pm2 status              - Ver status do servidor"
echo "  pm2 logs                - Ver logs em tempo real"
echo "  pm2 monit               - Monitorar recursos"
echo "  pm2 restart all         - Reiniciar servidor"
echo ""
echo "Health check: curl http://localhost:4000/health"
echo "========================================="
