# Guia de Deploy em Produção - Dungeons e Drogas

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
3. [Deploy do Backend](#deploy-do-backend)
4. [Deploy do Frontend](#deploy-do-frontend)
5. [Monitoramento e Healthchecks](#monitoramento-e-healthchecks)
6. [Troubleshooting em Produção](#troubleshooting-em-produção)

---

## 🛠️ Pré-requisitos

### Backend
- Node.js >= 18.x
- PM2 instalado globalmente: `npm install -g pm2`
- Servidor Linux/Windows com acesso SSH
- Firebase Admin SDK configurado
- Gemini API Key

### Frontend
- Next.js 15.x
- Vercel CLI (recomendado): `npm install -g vercel`
- Ou Firebase Hosting

---

## ⚙️ Configuração de Variáveis de Ambiente

### Backend (.env.production)

1. Copie o arquivo de exemplo:
```bash
cd backend
cp .env.production.example .env.production
```

2. Configure as variáveis:
```env
NODE_ENV=production
PORT=4000

# URLs do frontend (importante para CORS!)
FRONTEND_URL=https://seu-dominio.com
NEXT_PUBLIC_VERCEL_URL=https://seu-app.vercel.app

# Firebase Admin
FIREBASE_PROJECT_ID=dungeons-e-drogas
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@dungeons-e-drogas.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Gemini API
GEMINI_API_KEY=sua_api_key_aqui
```

### Frontend (.env.production)

1. Copie o arquivo de exemplo:
```bash
cd frontend
cp .env.production.example .env.production
```

2. Configure as variáveis:
```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCF...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dungeons-e-drogas.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dungeons-e-drogas
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dungeons-e-drogas.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=666663846015
NEXT_PUBLIC_FIREBASE_APP_ID=1:666663846015:web:47d53f675333f15bab3f4a

# Backend URL (IMPORTANTE!)
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
NEXT_PUBLIC_BACKEND_URL=https://api.seu-dominio.com
```

---

## 🚀 Deploy do Backend

### Opção 1: Deploy Manual com PM2

1. **Clone o repositório no servidor:**
```bash
git clone https://github.com/seu-usuario/dungeons-drogas.git
cd dungeons-drogas/backend
```

2. **Instale as dependências:**
```bash
npm ci --production
```

3. **Configure o .env.production:**
```bash
nano .env.production
# Cole as variáveis de ambiente e salve
```

4. **Execute o script de deploy:**
```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

5. **Verifique o status:**
```bash
pm2 status
pm2 logs dungeons-drogas-backend
```

### Opção 2: Deploy Automatizado com GitHub Actions

Adicione os secrets no GitHub:
- `BACKEND_URL`
- `SSH_HOST`
- `SSH_USER`
- `SSH_PRIVATE_KEY`

O deploy será automatizado via `.github/workflows/deploy.yml`

### Comandos PM2 Úteis

```bash
# Ver status
npm run pm2:status

# Ver logs em tempo real
npm run pm2:logs

# Monitorar recursos
npm run pm2:monit

# Reiniciar servidor
npm run pm2:restart

# Parar servidor
npm run pm2:stop

# Remover do PM2
npm run pm2:delete
```

---

## 🌐 Deploy do Frontend

### Opção 1: Vercel (Recomendado)

1. **Instale a Vercel CLI:**
```bash
npm install -g vercel
```

2. **Faça login:**
```bash
vercel login
```

3. **Configure as variáveis de ambiente na Vercel:**
```bash
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_BACKEND_URL production
# ... adicione todas as variáveis
```

4. **Deploy:**
```bash
cd frontend
vercel --prod
```

### Opção 2: Firebase Hosting

1. **Instale o Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Faça login:**
```bash
firebase login
```

3. **Build e deploy:**
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## 📊 Monitoramento e Healthchecks

### Health Check Manual

```bash
# Teste local
curl http://localhost:4000/health

# Teste produção
curl https://api.seu-dominio.com/health
```

Resposta esperada:
```json
{
  "uptime": 123456,
  "status": "OK",
  "timestamp": 1234567890123,
  "environment": "production",
  "services": {
    "firebase": true,
    "socketio": true
  }
}
```

### Monitor Automático

Execute o script de monitoramento:
```bash
# Configure o webhook do Discord/Slack (opcional)
export WEBHOOK_URL=https://discord.com/api/webhooks/...

# Execute o monitor
node healthcheck.js
```

### GitHub Actions Health Check

O workflow `.github/workflows/healthcheck.yml` verifica a saúde do servidor a cada 15 minutos.

Configure os secrets:
- `BACKEND_URL`: URL do backend em produção
- `DISCORD_WEBHOOK`: Webhook do Discord para alertas

### PM2 Plus (Monitoramento Avançado)

1. **Registre-se em:** https://pm2.io

2. **Conecte o servidor:**
```bash
pm2 link <secret> <public>
```

3. **Dashboard:** Acesse métricas em tempo real, alertas e logs

---

## 🔧 Troubleshooting em Produção

### Backend não está respondendo

1. **Verifique se está rodando:**
```bash
pm2 status
```

2. **Veja os logs:**
```bash
pm2 logs dungeons-drogas-backend --lines 100
```

3. **Verifique portas:**
```bash
netstat -tlnp | grep :4000
```

4. **Reinicie o servidor:**
```bash
pm2 restart dungeons-drogas-backend
```

### Erro de CORS

1. **Verifique as variáveis de ambiente:**
```bash
cat .env.production | grep FRONTEND_URL
```

2. **Certifique-se que o domínio do frontend está correto**

3. **Reinicie após mudanças:**
```bash
pm2 restart dungeons-drogas-backend
```

### Socket.io não conecta

1. **Verifique logs do backend:**
```bash
pm2 logs | grep "Socket"
```

2. **Teste a conexão WebSocket:**
```bash
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://seu-dominio.com
```

3. **Verifique firewall:**
```bash
# Abra a porta 4000
sudo ufw allow 4000
```

### Alto consumo de memória

1. **Monitore com PM2:**
```bash
pm2 monit
```

2. **Ajuste no ecosystem.config.js:**
```javascript
max_memory_restart: '1G'  // Aumentar limite
```

3. **Reinicie:**
```bash
pm2 restart dungeons-drogas-backend
```

---

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] Variáveis de ambiente nunca commitadas no Git
- [ ] CORS configurado apenas para domínios permitidos
- [ ] Rate limiting ativado
- [ ] HTTPS habilitado (Let's Encrypt)
- [ ] Firebase Security Rules configuradas
- [ ] Logs não expõem informações sensíveis
- [ ] PM2 logs com rotação habilitada
- [ ] Backups automáticos do Firestore

### Certificado SSL (Let's Encrypt)

```bash
sudo apt install certbot
sudo certbot --nginx -d api.seu-dominio.com
```

### Firewall (UFW)

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 4000/tcp
sudo ufw enable
```

---

## 📈 Escalabilidade

### Múltiplas Instâncias (Cluster Mode)

Edite `ecosystem.config.js`:
```javascript
instances: 'max',  // Usa todos os CPUs disponíveis
exec_mode: 'cluster'
```

### Load Balancer (Nginx)

Configuração básica:
```nginx
upstream backend {
  server 127.0.0.1:4000;
  server 127.0.0.1:4001;
}

server {
  listen 80;
  server_name api.seu-dominio.com;

  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## 📞 Suporte

Em caso de problemas graves em produção:

1. Verifique os logs do PM2
2. Consulte o [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Crie uma issue no GitHub
4. Entre em contato com a equipe

---

**Última atualização:** 2025-10-30
**Versão:** 1.0.0
