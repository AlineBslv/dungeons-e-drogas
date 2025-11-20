const fetch = require("node-fetch");

/**
 * Mapeamento de tons narrativos para instruções de prompt
 */
const TONE_PROMPTS = {
  epic: "Adote um tom épico e grandioso, com descrições majestosas e linguagem elevada. Evoque a sensação de grandes aventuras e feitos heroicos.",
  casual: "Use um tom casual, descontraído e leve. Seja acessível e divertido, como numa mesa de RPG entre amigos.",
  horror: "Mantenha um tom sombrio, tenso e atmosférico. Enfatize o mistério, o suspense e elementos macabros.",
};

/**
 * Mapeamento de idiomas para instruções
 */
const LANGUAGE_INSTRUCTIONS = {
  "pt-BR": "Responda SEMPRE em português brasileiro.",
  "en-US": "Always respond in English.",
  "es-ES": "Responde SIEMPRE en español.",
};

/**
 * Configurações de geração baseadas no nível de detalhe
 */
const DETAIL_CONFIGS = {
  low: { temperature: 0.5, topP: 0.8, maxOutputTokens: 200 },
  medium: { temperature: 0.7, topP: 0.9, maxOutputTokens: 400 },
  high: { temperature: 0.9, topP: 0.95, maxOutputTokens: 800 },
};

/**
 * Consulta a Gemini API com contexto de campanha
 * @param {string} userMessage - Mensagem do usuário
 * @param {object} context - Contexto da campanha (name, summary, history, tone, detail_level, language)
 * @returns {Promise<{output: string}>}
 */
async function askGemini(userMessage, context) {
  const tone = context.tone || 'epic';
  const detailLevel = context.detail_level || 'medium';
  const language = context.language || 'pt-BR';

  const systemPrompt = `
Você é o Mestre Drogon — um narrador de RPG baseado em D&D 5e.

CONFIGURAÇÕES DE CONTEXTO:
- Tom Narrativo: ${TONE_PROMPTS[tone] || TONE_PROMPTS.epic}
- Idioma: ${LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS["pt-BR"]}

INFORMAÇÕES DA CAMPANHA:
Campanha: ${context.campaignName}
Resumo prévio: ${context.summary || "Sem contexto prévio."}

HISTÓRICO RECENTE:
${context.history.map((m) => `${m.sender === "user" ? "Mestre" : "Drogon"}: ${m.content}`).join("\n")}

MENSAGEM ATUAL DO MESTRE:
${userMessage}

INSTRUÇÕES:
- Responda de forma narrativa e coesa
- Mantenha consistência com o tom e idioma definidos
- Use as regras de D&D 5e como base para mecânicas
- Seja criativo e envolvente
`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const generationConfig = DETAIL_CONFIGS[detailLevel] || DETAIL_CONFIGS.medium;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Gemini API:", data);
      return { output: "O portal das palavras falhou... tente novamente, Mestre." };
    }

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "(Drogon permaneceu em silêncio...)";

    return { output };
  } catch (error) {
    console.error("Erro Gemini API:", error);
    return { output: "O grimório das respostas está temporariamente selado..." };
  }
}

module.exports = { askGemini };
