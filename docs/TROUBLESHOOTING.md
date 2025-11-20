# Troubleshooting - Dungeons e Drogas

## ❌ Erro: "xhr poll error" no Socket.io

### Problema
O frontend exibe erro de conexão no console:
```
❌ Connection error: xhr poll error
```

### Causa
O servidor backend não está rodando ou não está acessível na porta 4000.

### Solução

#### Opção 1: Script Automático (Recomendado)
Execute o script de inicialização na raiz do projeto:
```bash
start-dev.bat
```

Isso iniciará automaticamente:
- Backend na porta 4000
- Frontend na porta 3000

#### Opção 2: Manual

1. **Inicie o Backend:**
```bash
cd backend
npm run dev
```

Aguarde até ver:
```
✅ Socket.io server initialized
🚀 Servidor rodando em http://localhost:4000
```

2. **Em outro terminal, inicie o Frontend:**
```bash
cd frontend
npm run dev
```

### Verificação

1. **Teste o Backend:**
```bash
curl http://localhost:4000/ping
```

Deve retornar: `{"message":"pong"}`

2. **Acesse o Frontend:**
```
http://localhost:3000
```

### Melhorias Implementadas

#### 1. Reconexão Automática
O Socket.io agora tenta reconectar automaticamente até 10 vezes com delay progressivo.

#### 2. Feedback Visual
Quando o servidor estiver offline, o usuário verá:
- Banner vermelho com mensagem de erro
- Status "Desconectado" no header
- Inputs desabilitados

#### 3. Logs Detalhados
O console exibe informações úteis:
```
❌ Connection error: xhr poll error
📍 Tentando conectar em: http://localhost:4000
💡 Verifique se o servidor backend está rodando!
🔄 Tentativa de reconexão #1...
```

## 🔥 Outros Problemas Comuns

### Porta 4000 já em uso
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Firebase Authentication Error
Verifique se as variáveis de ambiente estão configuradas:
- `backend/.env`: Firebase Admin credentials
- `frontend/.env.local`: Firebase client config

### CORS Error
Certifique-se de que `NEXT_PUBLIC_BACKEND_URL` no `.env.local` do frontend corresponde ao endereço do backend.

---

**Última atualização:** 2025-10-30
