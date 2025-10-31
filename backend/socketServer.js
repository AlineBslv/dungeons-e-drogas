/**
 * WebSocket Server - Dungeons e Drogas
 * Sistema de sincronização multiplayer em tempo real
 */

const { Server } = require("socket.io");
const { admin } = require("./firebaseAdmin");

class SocketServer {
  constructor() {
    this.io = null;
    this.activeSessions = new Map(); // sessionId -> Set<socketId>
    this.userPresence = new Map(); // userId -> { socketId, campaignId, role }
  }

  /**
   * Inicializa o servidor Socket.io
   */
  initialize(httpServer) {
    // Permite múltiplas origens em desenvolvimento
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      process.env.FRONTEND_URL,
      process.env.NEXT_PUBLIC_VERCEL_URL,
    ].filter(Boolean); // Remove valores undefined

    const isProduction = process.env.NODE_ENV === "production";

    this.io = new Server(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // Permite requisições sem origin apenas em desenvolvimento
          if (!origin && !isProduction) return callback(null, true);

          // Verifica se origin está na lista de permitidos
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          // Em desenvolvimento, aceita qualquer localhost
          if (!isProduction && origin.includes("localhost")) {
            return callback(null, true);
          }

          // Em produção, aceita domínios Vercel
          if (isProduction && origin.match(/\.vercel\.app$/)) {
            return callback(null, true);
          }

          // Rejeita outras origens
          console.warn(`⚠️ CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
      // Configurações de produção otimizadas
      pingTimeout: isProduction ? 60000 : 30000,
      pingInterval: isProduction ? 25000 : 10000,
      connectTimeout: 45000,
      transports: ['websocket', 'polling'],
      allowUpgrades: true,
      upgradeTimeout: 10000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log("✅ Socket.io server initialized");
  }

  /**
   * Middleware de autenticação JWT via Socket.io
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        console.log('🔌 New socket connection attempt:', socket.id);
        const token = socket.handshake.auth.token;

        if (!token) {
          console.error('❌ No token provided in handshake');
          return next(new Error("Authentication error: No token provided"));
        }

        console.log('🔐 Token received, verifying with Firebase...');

        // Verifica token Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        socket.userId = decodedToken.uid;
        socket.userEmail = decodedToken.email;

        console.log(`✅ User authenticated: ${socket.userId} (${socket.userEmail})`);
        next();
      } catch (error) {
        console.error("❌ Authentication error:", error.message);
        next(new Error("Authentication error"));
      }
    });
  }

  /**
   * Configura event handlers do Socket.io
   */
  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`✅ Client connected: ${socket.id} (User: ${socket.userId})`);

      // === CAMPAIGN EVENTS ===

      /**
       * Jogador/Mestre entra em uma campanha
       */
      socket.on("join:campaign", async (data) => {
        const { campaignId, role } = data;

        try {
          // Verifica permissões no Firestore
          const campaignDoc = await admin
            .firestore()
            .collection("campaigns")
            .doc(campaignId)
            .get();

          if (!campaignDoc.exists) {
            socket.emit("error", { message: "Campanha não encontrada" });
            return;
          }

          const campaign = campaignDoc.data();

          // Verifica se usuário tem permissão
          const isMaster = campaign.master_uid === socket.userId;
          const isPlayer = campaign.players.includes(socket.userId);

          if (!isMaster && !isPlayer) {
            socket.emit("error", { message: "Você não tem acesso a esta campanha" });
            return;
          }

          // Entra na room da campanha
          socket.join(campaignId);
          socket.currentCampaignId = campaignId;
          socket.currentRole = isMaster ? "mestre" : "jogador";

          // Registra presença
          this.userPresence.set(socket.userId, {
            socketId: socket.id,
            campaignId,
            role: socket.currentRole,
            userName: socket.userEmail?.split("@")[0] || "Anônimo",
          });

          // Notifica outros usuários
          const onlineUsers = this.getOnlineUsers(campaignId);
          this.io.to(campaignId).emit("presence:update", { onlineUsers });

          socket.emit("join:success", {
            campaignId,
            role: socket.currentRole,
            onlineUsers,
          });

          console.log(`📥 User ${socket.userId} joined campaign ${campaignId} as ${socket.currentRole}`);
        } catch (error) {
          console.error("Error joining campaign:", error);
          socket.emit("error", { message: "Erro ao entrar na campanha" });
        }
      });

      /**
       * Sai de uma campanha
       */
      socket.on("leave:campaign", (data) => {
        const { campaignId } = data;

        if (socket.currentCampaignId === campaignId) {
          socket.leave(campaignId);
          this.userPresence.delete(socket.userId);

          // Notifica outros usuários
          const onlineUsers = this.getOnlineUsers(campaignId);
          this.io.to(campaignId).emit("presence:update", { onlineUsers });

          console.log(`📤 User ${socket.userId} left campaign ${campaignId}`);
        }
      });

      // === TYPING INDICATORS ===

      /**
       * Usuário começou a digitar
       */
      socket.on("typing:start", (data) => {
        const { campaignId } = data;

        if (socket.currentCampaignId === campaignId) {
          socket.to(campaignId).emit("typing:user", {
            userId: socket.userId,
            userName: this.userPresence.get(socket.userId)?.userName || "Anônimo",
            isTyping: true,
          });
        }
      });

      /**
       * Usuário parou de digitar
       */
      socket.on("typing:stop", (data) => {
        const { campaignId } = data;

        if (socket.currentCampaignId === campaignId) {
          socket.to(campaignId).emit("typing:user", {
            userId: socket.userId,
            userName: this.userPresence.get(socket.userId)?.userName || "Anônimo",
            isTyping: false,
          });
        }
      });

      // === DICE ROLL EVENTS ===

      /**
       * Rolagem de dados em tempo real
       */
      socket.on("dice:roll", async (data) => {
        const { campaignId, diceData } = data;

        if (socket.currentCampaignId === campaignId) {
          // Broadcast para todos na campanha (incluindo quem rolou)
          this.io.to(campaignId).emit("dice:rolled", {
            userId: socket.userId,
            userName: this.userPresence.get(socket.userId)?.userName || "Anônimo",
            role: socket.currentRole,
            diceData,
            timestamp: new Date().toISOString(),
          });

          console.log(`🎲 Dice rolled in campaign ${campaignId}: ${JSON.stringify(diceData)}`);
        }
      });

      // === MESSAGE EVENTS ===

      /**
       * Nova mensagem enviada (sincronização instantânea)
       */
      socket.on("message:send", async (data) => {
        const { campaignId, message } = data;

        if (socket.currentCampaignId === campaignId) {
          // Broadcast para todos exceto sender
          socket.to(campaignId).emit("message:new", {
            ...message,
            userId: socket.userId,
            timestamp: new Date().toISOString(),
          });
        }
      });

      /**
       * Mensagem de Drogon (IA) sendo processada
       */
      socket.on("drogon:thinking", (data) => {
        const { campaignId } = data;

        if (socket.currentCampaignId === campaignId) {
          socket.to(campaignId).emit("drogon:processing", {
            isProcessing: true,
          });
        }
      });

      /**
       * Resposta de Drogon recebida
       */
      socket.on("drogon:response", (data) => {
        const { campaignId, message } = data;

        if (socket.currentCampaignId === campaignId) {
          this.io.to(campaignId).emit("drogon:message", {
            message,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // === CONTEXT UPDATE EVENTS (Mestre only) ===

      /**
       * Mestre atualiza contexto da campanha em tempo real
       */
      socket.on("context:update", async (data) => {
        const { campaignId, context } = data;

        if (socket.currentRole === "mestre" && socket.currentCampaignId === campaignId) {
          // Broadcast para todos os jogadores (exceto o mestre que enviou)
          socket.to(campaignId).emit("context:updated", {
            context,
            updatedBy: socket.userId,
            updatedAt: new Date().toISOString(),
          });

          console.log(`⚙️ Context updated in campaign ${campaignId}:`, context);
        } else {
          socket.emit("error", { message: "Apenas o Mestre pode atualizar o contexto" });
        }
      });

      // === SESSION CONTROL EVENTS (Mestre only) ===

      /**
       * Mestre inicia sessão
       */
      socket.on("session:start", async (data) => {
        const { campaignId, sessionId } = data;

        if (socket.currentRole === "mestre" && socket.currentCampaignId === campaignId) {
          this.io.to(campaignId).emit("session:started", {
            sessionId,
            startedAt: new Date().toISOString(),
          });

          console.log(`▶️ Session ${sessionId} started in campaign ${campaignId}`);
        }
      });

      /**
       * Mestre pausa sessão
       */
      socket.on("session:pause", (data) => {
        const { campaignId, sessionId } = data;

        if (socket.currentRole === "mestre" && socket.currentCampaignId === campaignId) {
          this.io.to(campaignId).emit("session:paused", {
            sessionId,
            pausedAt: new Date().toISOString(),
          });
        }
      });

      /**
       * Mestre retoma sessão
       */
      socket.on("session:resume", (data) => {
        const { campaignId, sessionId } = data;

        if (socket.currentRole === "mestre" && socket.currentCampaignId === campaignId) {
          this.io.to(campaignId).emit("session:resumed", {
            sessionId,
            resumedAt: new Date().toISOString(),
          });
        }
      });

      /**
       * Mestre encerra sessão
       */
      socket.on("session:end", (data) => {
        const { campaignId, sessionId } = data;

        if (socket.currentRole === "mestre" && socket.currentCampaignId === campaignId) {
          this.io.to(campaignId).emit("session:ended", {
            sessionId,
            endedAt: new Date().toISOString(),
          });

          console.log(`⏹️ Session ${sessionId} ended in campaign ${campaignId}`);
        }
      });

      // === DISCONNECT ===

      socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);

        // Remove presença
        const campaignId = socket.currentCampaignId;
        this.userPresence.delete(socket.userId);

        if (campaignId) {
          const onlineUsers = this.getOnlineUsers(campaignId);
          this.io.to(campaignId).emit("presence:update", { onlineUsers });
        }
      });
    });
  }

  /**
   * Retorna lista de usuários online em uma campanha
   */
  getOnlineUsers(campaignId) {
    const users = [];

    for (const [userId, presence] of this.userPresence.entries()) {
      if (presence.campaignId === campaignId) {
        users.push({
          userId,
          userName: presence.userName,
          role: presence.role,
        });
      }
    }

    return users;
  }

  /**
   * Envia evento para uma campanha específica
   */
  emitToCampaign(campaignId, event, data) {
    this.io.to(campaignId).emit(event, data);
  }

  /**
   * Envia evento para um usuário específico
   */
  emitToUser(userId, event, data) {
    const presence = this.userPresence.get(userId);
    if (presence) {
      this.io.to(presence.socketId).emit(event, data);
    }
  }
}

module.exports = new SocketServer();
