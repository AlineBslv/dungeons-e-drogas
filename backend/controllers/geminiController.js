const fetch = require("node-fetch");
const { getOrCreateContext, autoDetectContext } = require('../services/contextService');
const { contextToPromptDescription } = require('../models/contextSchema');

/**
 * Endpoint de teste básico para validar conexão com Gemini
 * POST /gemini/chat
 * Body: { message: "string", campaignId: "string" (opcional) }
 */
async function basicChat(req, res) {
  try {
    const { message, campaignId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Campo 'message' é obrigatório." });
    }

    // Buscar ou criar contexto
    const context = await getOrCreateContext(campaignId);

    // Auto-detectar mudanças de contexto
    const detectedChanges = await autoDetectContext(campaignId, message);

    // Usar contexto atualizado se houve mudanças
    const currentContext = detectedChanges
      ? await getOrCreateContext(campaignId)
      : context;

    // Montar prompt com contexto
    const contextDescription = contextToPromptDescription(currentContext);

    const prompt = `
Você é o Mestre Drogon — o narrador arcano e sábio de Dungeons & Dragons.

CONFIGURAÇÕES DE CONTEXTO:
${contextDescription}

INSTRUÇÕES:
- Responda de acordo com o idioma, tom e estilo configurados acima
- Ajuste o nível de detalhe conforme especificado
- Mantenha o foco narrativo definido
- Respeite o clima atual da campanha

Usuário diz: "${message}"
`;

    const response = await sendPromptToGemini(prompt, currentContext.temperature);

    res.json({
      from: "ai",
      response,
      context: {
        tone: currentContext.tone,
        detail_level: currentContext.detail_level,
        language: currentContext.language,
        detectedChanges: detectedChanges || undefined
      }
    });
  } catch (err) {
    console.error("Erro no basicChat:", err);
    res.status(500).json({ error: "Falha na comunicação com a IA." });
  }
}

/**
 * Função auxiliar para enviar prompt direto ao Gemini
 * @param {string} prompt - Texto a ser enviado
 * @param {number} temperature - Temperatura criativa (0-1)
 * @returns {Promise<string>} - Resposta da IA
 */
async function sendPromptToGemini(prompt, temperature = 0.7) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          topP: 0.9,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error Gemini API:", text);
      throw new Error("Falha na requisição Gemini.");
    }

    const data = await res.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";

    return output;
  } catch (err) {
    console.error("Erro em sendPromptToGemini:", err);
    return "⚠️ O portal da sabedoria foi silenciado... (erro Gemini)";
  }
}

module.exports = { basicChat };
