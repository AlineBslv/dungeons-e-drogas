const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const { admin } = require("./firebaseAdmin");
const { authenticateJWT } = require("./middleware/auth");
const chatRoutes = require("./routes/chat.js");
const geminiRoutes = require("./routes/gemini.js");
const uploadRoutes = require("./routes/upload.js");
const searchRoutes = require("./routes/search.js");
const charactersRoutes = require("./routes/characters.js");
const diceRoutes = require("./routes/dice.js");
const socketServer = require("./socketServer");

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configuração CORS - Permite múltiplas origens em desenvolvimento
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
    const isProduction = process.env.NODE_ENV === "production";

    // Permite requisições sem origin (mobile apps, Postman, etc) apenas em dev
    if (!origin && !isProduction) return callback(null, true);

    // Verifica se origin está na lista de permitidos
    if (origin && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Em desenvolvimento, aceita qualquer localhost
    if (!isProduction && origin && origin.includes("localhost")) {
      return callback(null, true);
    }

    // Em produção, aceita domínios Vercel
    if (isProduction && origin && origin.match(/\.vercel\.app$/)) {
      return callback(null, true);
    }

    // Rejeita outras origens
    console.warn(`⚠️ CORS blocked origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting para evitar spam
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // máx. 20 requisições por minuto
  message: { error: "Muitas requisições. Aguarde um momento antes de tentar novamente." },
});

// Rotas públicas (sem autenticação)
app.get("/", (req, res) => res.send("🧙‍♂️ Servidor ativo e conectado ao portal do Gemini"));
app.get("/ping", (_, res) => res.json({ message: "pong" }));

// Health check endpoint para monitoramento
app.get("/health", async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    status: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      firebase: false,
      socketio: false,
    }
  };

  try {
    // Verifica Firebase
    await admin.auth().listUsers(1);
    healthcheck.services.firebase = true;

    // Verifica Socket.io
    const socketServer = require("./socketServer");
    healthcheck.services.socketio = !!socketServer.io;

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'ERROR';
    healthcheck.error = error.message;
    res.status(503).json(healthcheck);
  }
});

// Readiness check (Kubernetes/Docker)
app.get("/ready", (req, res) => {
  res.status(200).json({ ready: true });
});

app.use("/dice", limiter, diceRoutes); // Rota pública para dados

// Rotas protegidas (requerem autenticação JWT)
app.use("/chat", limiter, authenticateJWT, chatRoutes);
app.use("/gemini", authenticateJWT, geminiRoutes);
app.use("/upload", authenticateJWT, uploadRoutes);
app.use("/search", authenticateJWT, searchRoutes);
app.use("/characters", authenticateJWT, charactersRoutes);

// Inicializa Socket.io
socketServer.initialize(httpServer);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔥 Mensageria ativa em /chat/send`);
  console.log(`⚡ WebSocket ativo em ws://localhost:${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);

  // Notifica PM2 que o servidor está pronto
  if (process.send) {
    process.send('ready');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('⚠️ SIGINT recebido. Encerrando servidor...');
  httpServer.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recebido. Encerrando servidor...');
  httpServer.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});
