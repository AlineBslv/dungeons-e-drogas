const { db } = require("../firebaseAdmin.js");

/**
 * Parser de comandos de dados
 * Exemplos: 1d20, 2d6+3, 1d20+5, 3d8-2, d20 (assume 1d20)
 */
function parseDiceCommand(command) {
  // Remove espaços e converte para minúsculo
  const cleanCmd = command.trim().toLowerCase().replace(/\s+/g, '');

  // Regex para capturar: [quantidade]d[tipo][+/-][modificador]
  const diceRegex = /^(\d*)d(\d+)(([+-])(\d+))?$/;
  const match = cleanCmd.match(diceRegex);

  if (!match) {
    throw new Error("Comando inválido. Use formato: XdY+Z (ex: 2d6+3, 1d20, d20)");
  }

  const quantity = parseInt(match[1] || '1'); // default 1 se omitido
  const diceType = parseInt(match[2]);
  const operator = match[4] || '+';
  const modifier = parseInt(match[5] || '0');

  // Validações
  if (quantity < 1 || quantity > 100) {
    throw new Error("Quantidade de dados deve estar entre 1 e 100");
  }

  const validDice = [4, 6, 8, 10, 12, 20, 100];
  if (!validDice.includes(diceType)) {
    throw new Error(`Tipo de dado inválido. Use: ${validDice.join(', ')}`);
  }

  if (modifier < -100 || modifier > 100) {
    throw new Error("Modificador deve estar entre -100 e +100");
  }

  return {
    quantity,
    diceType,
    modifier: operator === '-' ? -modifier : modifier,
    originalCommand: command
  };
}

/**
 * Rola um dado de N lados
 */
function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Executa a rolagem de dados
 */
function executeDiceRoll(parsedCommand) {
  const { quantity, diceType, modifier } = parsedCommand;

  const rolls = [];
  let total = 0;

  // Rola cada dado
  for (let i = 0; i < quantity; i++) {
    const result = rollDie(diceType);
    rolls.push(result);
    total += result;
  }

  // Aplica modificador
  const finalTotal = total + modifier;

  // Detecta críticos e falhas críticas (apenas para d20)
  let isCritical = false;
  let isCriticalFailure = false;

  if (diceType === 20 && quantity === 1) {
    if (rolls[0] === 20) isCritical = true;
    if (rolls[0] === 1) isCriticalFailure = true;
  }

  return {
    rolls,
    total,
    modifier,
    finalTotal,
    isCritical,
    isCriticalFailure,
    diceType,
    quantity
  };
}

/**
 * Endpoint: POST /dice/roll
 * Processa comando de rolagem e salva no histórico
 */
async function rollDice(req, res) {
  try {
    const { campaignId, userId, command, characterName, context } = req.body;

    // Validações
    if (!command) {
      return res.status(400).json({ error: "Comando de dados é obrigatório" });
    }

    // Parse e execução
    const parsedCommand = parseDiceCommand(command);
    const rollResult = executeDiceRoll(parsedCommand);

    // Formata mensagem para o histórico
    const rollMessage = formatRollMessage(rollResult, parsedCommand, characterName, context);

    // Nota: O salvamento no Firestore é feito pelo frontend
    // em campaigns/{campaignId}/messages, não aqui

    return res.json({
      success: true,
      command: parsedCommand.originalCommand,
      result: rollResult,
      message: rollMessage,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error("❌ Erro em /dice/roll:", err);

    // Erros de validação retornam 400
    if (err.message.includes("inválido") || err.message.includes("deve")) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "Falha ao rolar dados" });
  }
}

/**
 * Formata mensagem descritiva da rolagem
 */
function formatRollMessage(result, parsed, characterName, context) {
  const { rolls, finalTotal, isCritical, isCriticalFailure, modifier } = result;
  const name = characterName || "Jogador";

  let msg = `🎲 **${name}** rolou ${parsed.originalCommand}`;

  if (context) {
    msg += ` para **${context}**`;
  }

  msg += `\n`;
  msg += `Resultados: [${rolls.join(', ')}]`;

  if (modifier !== 0) {
    msg += ` ${modifier >= 0 ? '+' : ''}${modifier}`;
  }

  msg += ` = **${finalTotal}**`;

  if (isCritical) {
    msg += ` 🌟 **CRÍTICO!**`;
  } else if (isCriticalFailure) {
    msg += ` 💀 **FALHA CRÍTICA!**`;
  }

  return msg;
}

/**
 * Endpoint: GET /dice/history/:campaignId
 * Retorna histórico de rolagens de uma campanha
 */
async function getDiceHistory(req, res) {
  try {
    const { campaignId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const snapshot = await db
      .collection("messages")
      .where("campaignId", "==", campaignId)
      .where("type", "==", "dice_roll")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));

    return res.json({
      campaignId,
      total: history.length,
      rolls: history
    });

  } catch (err) {
    console.error("❌ Erro em /dice/history:", err);
    return res.status(500).json({ error: "Falha ao recuperar histórico de dados" });
  }
}

module.exports = {
  rollDice,
  getDiceHistory,
  parseDiceCommand,
  executeDiceRoll
};
