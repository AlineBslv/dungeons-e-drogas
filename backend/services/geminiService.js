const fetch = require("node-fetch");

/**
 * Consulta a Gemini API com contexto de campanha
 * @param {string} userMessage - Mensagem do usuário
 * @param {object} context - Contexto da campanha (name, summary, history)
 * @returns {Promise<{output: string}>}
 */
async function askGemini(userMessage, context) {
  const systemPrompt = `
Você é o Mestre Drogon — um mentor sábio, sarcástico e divertido.
Use base nas regras de D&D 5e, mas responda de modo narrativo e coeso.
Campanha: ${context.campaignName}.
Resumo prévio: ${context.summary || "Sem contexto prévio."}
Histórico recente:
${context.history.map((m) => `${m.sender === "user" ? "Mestre" : "Drogon"}: ${m.content}`).join("\n")}

Mensagem atual: ${userMessage}
`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 400,
          },
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
