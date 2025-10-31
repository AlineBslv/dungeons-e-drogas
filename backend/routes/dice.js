const express = require("express");
const { rollDice, getDiceHistory } = require("../controllers/diceController.js");

const router = express.Router();

/**
 * POST /dice/roll
 * Rola dados e salva no histórico
 *
 * Body:
 * {
 *   "command": "1d20+5",
 *   "campaignId": "campaign_123",
 *   "userId": "user_456",
 *   "characterName": "Thorin Escudo de Carvalho",
 *   "context": "Ataque com machado"
 * }
 */
router.post("/roll", rollDice);

/**
 * GET /dice/history/:campaignId?limit=50
 * Retorna histórico de rolagens de uma campanha
 */
router.get("/history/:campaignId", getDiceHistory);

module.exports = router;
