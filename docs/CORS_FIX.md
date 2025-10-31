# Correção CORS - Socket.io Multiplayer

**Data:** 30 de Outubro de 2025
**Problema:** Erro `xhr poll error` - CORS bloqueando conexões Socket.io de `localhost:3002`

## Problema Identificado

O backend estava configurado para aceitar apenas conexões de `http://localhost:3000`, mas o frontend estava rodando em `http://localhost:3002`, causando erro CORS:

```
Access to XMLHttpRequest at 'http://localhost:4000/socket.io/?EIO=4&transport=polling&t=q2v87yir'
from origin 'http://localhost:3002' has been blocked by CORS policy:
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3000'
that is not equal to the supplied origin.
```

## Correções Aplicadas

### 1. Socket.io CORS ([backend/socketServer.js](../backend/socketServer.js:19-55))

**Antes:**
```javascript
this.io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }
});
```

**Depois:**
```javascript
// Permite múltiplas origens em desenvolvimento
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_VERCEL_URL,
].filter(Boolean);

this.io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Permite requisições sem origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);

      // Verifica se origin está na lista de permitidos
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Em desenvolvimento, aceita qualquer localhost
      if (process.env.NODE_ENV !== "production" && origin.includes("localhost")) {
        return callback(null, true);
      }

      // Rejeita outras origens
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  }
});
```

### 2. Express CORS ([backend/index.js](../backend/index.js:20-54))

**Antes:**
```javascript
app.use(cors());
```

**Depois:**
```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_VERCEL_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== "production" && origin.includes("localhost")) {
      return callback(null, true);
    }

    console.warn(`⚠️ CORS blocked origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
```

## Benefícios

1. **Flexibilidade em Desenvolvimento:** Aceita qualquer porta localhost durante desenvolvimento
2. **Segurança em Produção:** Mantém lista restrita de origens permitidas em produção
3. **Suporte Mobile:** Permite requisições sem `origin` (apps nativos)
4. **Debugging:** Logs de avisos quando origem é bloqueada

## Como Testar

### 1. Reiniciar Backend

```bash
cd backend
npm run dev
```

Você deve ver:
```
✅ Socket.io server initialized
🚀 Servidor rodando em http://localhost:4000
⚡ WebSocket ativo em ws://localhost:4000
```

### 2. Reiniciar Frontend (qualquer porta)

```bash
cd frontend
npm run dev -- -p 3002  # Ou qualquer outra porta
```

### 3. Testar Conexão

Abra o console do navegador em `http://localhost:3002` e verifique:

**Sucesso:**
```
🔌 Initializing socket connection to: http://localhost:4000
✅ Firebase token obtained: eyJhbGciOiJSUzI1NiIs...
🔌 Socket.io client created
✅ Socket connected: abc123
```

**Erro (se CORS ainda estiver bloqueado):**
```
❌ Connection error: xhr poll error
```

### 4. Verificar Console do Backend

Você deve ver no terminal do backend:
```
🔌 New socket connection attempt: abc123
🔐 Token received, verifying with Firebase...
✅ User authenticated: userId123 (user@example.com)
✅ Client connected: abc123 (User: userId123)
```

## Variáveis de Ambiente

Para produção, configure no arquivo `.env`:

```bash
# Desenvolvimento
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Produção (exemplo)
NODE_ENV=production
FRONTEND_URL=https://dungeons-e-drogas.vercel.app
NEXT_PUBLIC_VERCEL_URL=https://dungeons-e-drogas.vercel.app
```

## Troubleshooting

### Erro persiste após correção

1. **Limpar cache do navegador:**
   - Chrome: Ctrl+Shift+Delete → Limpar cache
   - Firefox: Ctrl+Shift+Delete → Limpar cache

2. **Verificar se backend foi reiniciado:**
   ```bash
   # Parar servidor (Ctrl+C)
   cd backend
   npm run dev
   ```

3. **Verificar se frontend está usando porta correta:**
   - Abra [frontend/src/hooks/useSocket.ts:10](../frontend/src/hooks/useSocket.ts#L10)
   - Confirme: `const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';`

4. **Verificar logs do backend:**
   - Se ver `⚠️ CORS blocked origin: http://localhost:XXXX`, a porta ainda não está permitida
   - Adicione a porta manualmente no array `allowedOrigins`

### Erro de autenticação JWT

Se aparecer:
```
❌ Authentication error: No token provided
```

Verifique:
1. Usuário está logado (`useAuth().user !== null`)
2. Token Firebase está sendo passado no handshake ([frontend/src/hooks/useSocket.ts:83](../frontend/src/hooks/useSocket.ts#L83))

## Próximos Passos

Agora que o CORS está corrigido, você pode:

1. Testar funcionalidades multiplayer:
   - Typing indicators
   - Presença de usuários online
   - Sincronização de rolagem de dados
   - Mensagens em tempo real

2. Continuar implementação de features de alta prioridade:
   - Sistema de presença (3h)
   - Notificações toast (3h)
   - Painel mestre avançado (10h)

## Referências

- [Socket.io CORS Documentation](https://socket.io/docs/v4/handling-cors/)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
