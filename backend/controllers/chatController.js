const db = require("../firebaseAdmin.js");
const { askGemini } = require("../services/geminiService.js");

/**
 * Endpoint: POST /chat/send
 * Recebe mensagem do usuário, consulta IA e salva no Firestore
 */
async function sendMessage(req, res) {
  try {
    const { campaignId, userId, message } = req.body;

    // Validações básicas
    if (!campaignId || !message) {
      return res.status(400).json({ error: "Parâmetros ausentes: campaignId e message são obrigatórios" });
    }

    if (!message.trim()) {
      return res.status(400).json({ error: "Mensagem não pode estar vazia" });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: "Mensagem muito longa (máx. 2000 caracteres)" });
    }

    // 1️⃣ Recupera dados completos da campanha (tone, detail_level, language)
    const campaignDoc = await db.collection("campaigns").doc(campaignId).get();
    if (!campaignDoc.exists) {
      return res.status(404).json({ error: "Campanha não encontrada" });
    }
    const campaignData = campaignDoc.data();

    // 2️⃣ Recupera contexto narrativo da campanha
    const ctxDoc = await db.collection("contexts").doc(campaignId).get();
    const campaignContext = ctxDoc.exists ? ctxDoc.data().summary : "";

    // 3️⃣ Recupera últimas mensagens (para histórico do prompt)
    const msgsSnapshot = await db
      .collection("messages")
      .where("campaignId", "==", campaignId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const lastMessages = msgsSnapshot.docs
      .map((d) => d.data())
      .reverse();

    // 4️⃣ Monta contexto completo pro Gemini com parâmetros de personalização
    const context = {
      campaignName: campaignData.title || campaignId,
      summary: campaignContext,
      history: lastMessages,
      tone: campaignData.context?.tone || 'epic',
      detail_level: campaignData.context?.detail_level || 'medium',
      language: campaignData.context?.language || 'pt-BR',
    };

    // 5️⃣ Recebe resposta da IA
    const aiResponse = await askGemini(message, context);

    // 6️⃣ Salva no Firestore (batch write para atomicidade)
    const batch = db.batch();

    const userMsgRef = db.collection("messages").doc();
    batch.set(userMsgRef, {
      campaignId,
      sender: "user",
      content: message,
      userId: userId || "anonymous",
      createdAt: new Date(),
    });

    const aiMsgRef = db.collection("messages").doc();
    batch.set(aiMsgRef, {
      campaignId,
      sender: "ai",
      content: aiResponse.output,
      createdAt: new Date(),
    });

    await batch.commit();

    // 7️⃣ Retorna resposta
    return res.json({
      from: "ai",
      response: aiResponse.output,
      campaignId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Erro em /chat/send:", err);

    // Verifica se é erro do Firestore
    if (err.code === "unavailable") {
      return res.status(503).json({ error: "O grimório dos dados está lacrado... tente novamente em instantes." });
    }

    return res.status(500).json({ error: "Falha na comunicação com a IA" });
  }
}

module.exports = { sendMessage };
