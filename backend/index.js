const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const chatRoutes = require("./routes/chat.js");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rate limiting para evitar spam
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // máx. 20 requisições por minuto
  message: { error: "Muitas requisições. Aguarde um momento antes de tentar novamente." },
});

app.use("/chat", limiter);

// Rotas
app.get("/", (req, res) => res.send("🔥 Dungeons e Drogas API online"));
app.get("/ping", (_, res) => res.json({ message: "pong" }));
app.use("/chat", chatRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔥 Mensageria ativa em /chat/send`);
});
