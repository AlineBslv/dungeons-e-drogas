const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Rotas simples de teste ---
app.get("/", (req, res) => res.send("🔥 Dungeons e Drogas API online"));
app.get("/ping", (_, res) => res.json({ message: "pong" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
