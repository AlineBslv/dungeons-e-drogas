const express = require("express");
const { sendMessage } = require("../controllers/chatController.js");

const router = express.Router();

/**
 * POST /chat/send
 * Envia mensagem para o Mestre Drogon
 * Body: { campaignId, userId, message }
 */
router.post("/send", sendMessage);

module.exports = router;
