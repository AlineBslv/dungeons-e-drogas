const express = require("express");
const { basicChat } = require("../controllers/geminiController.js");

const router = express.Router();

/**
 * POST /gemini/chat
 * Endpoint de teste para validar conexão com Gemini API
 * Body: { message: "string" }
 */
router.post("/chat", basicChat);

module.exports = router;
