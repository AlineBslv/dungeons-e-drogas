/**
 * Serviço RAG (Retrieval Augmented Generation)
 *
 * Combina busca semântica com geração de texto para
 * fornecer respostas fundamentadas na base de conhecimento D&D
 */

const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateEmbedding, cosineSimilarity } = require("./embeddingService");

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Busca chunks relevantes usando busca semântica
 * @param {string} query - Pergunta ou query
 * @param {Object} options - Opções de busca
 * @returns {Promise<Array>} Chunks relevantes com scores
 */
async function retrieveRelevantChunks(query, options = {}) {
  const {
    tipo = null,
    limit = 5,
    minScore = 0.6,
    includeMetadata = true
  } = options;

  try {
    console.log(`🔍 RAG Retrieval: "${query.substring(0, 50)}..."`);

    // Gerar embedding da query
    const queryEmbedding = await generateEmbedding(query, "RETRIEVAL_QUERY");

    // Buscar chunks
    let chunksQuery = db.collection("manual_texts");

    if (tipo) {
      chunksQuery = chunksQuery.where("tipo", "==", tipo);
    }

    const snapshot = await chunksQuery.get();

    if (snapshot.empty) {
      console.log("⚠️  Nenhum chunk encontrado no Firestore");
      return [];
    }

    // Calcular similaridades
    const results = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      if (!data.embedding || data.embedding.length === 0) {
        return; // Skip sem embedding
      }

      const similarity = cosineSimilarity(queryEmbedding, data.embedding);

      if (similarity >= minScore) {
        results.push({
          id: doc.id,
          tipo: data.tipo,
          index: data.index,
          content: data.content,
          similarity: Math.round(similarity * 1000) / 1000,
          metadata: includeMetadata ? data.metadata : undefined,
          startChar: data.startChar,
          endChar: data.endChar
        });
      }
    });

    // Ordenar por similaridade
    results.sort((a, b) => b.similarity - a.similarity);

    const topResults = results.slice(0, limit);
    console.log(`✅ Retrieval: ${topResults.length} chunks (scores: ${topResults.map(r => r.similarity).join(", ")})`);

    return topResults;

  } catch (error) {
    console.error("❌ Erro no retrieval:", error);
    throw new Error(`Falha no retrieval: ${error.message}`);
  }
}

/**
 * Gera resposta usando RAG
 * @param {string} query - Pergunta do usuário
 * @param {Object} options - Opções de geração
 * @returns {Promise<Object>} Resposta com contexto e fontes
 */
async function generateRAGResponse(query, options = {}) {
  const {
    tipo = null,
    maxChunks = 5,
    temperature = 0.3, // Baixa para respostas mais precisas
    includeContext = true,
    language = "pt-BR"
  } = options;

  try {
    console.log(`\n🧠 RAG Generation iniciado para: "${query}"\n`);

    // 1. Retrieval - Buscar chunks relevantes
    const chunks = await retrieveRelevantChunks(query, {
      tipo,
      limit: maxChunks,
      minScore: 0.6
    });

    if (chunks.length === 0) {
      return {
        answer: "Desculpe, não encontrei informações relevantes sobre isso nos manuais de D&D 5e disponíveis. Você pode reformular sua pergunta?",
        sources: [],
        context: null,
        confidence: 0
      };
    }

    // 2. Construir contexto a partir dos chunks
    const context = chunks.map((chunk, idx) =>
      `[Fonte ${idx + 1} - ${chunk.tipo} - Similaridade: ${chunk.similarity}]\n${chunk.content}`
    ).join("\n\n---\n\n");

    // 3. Prompt para geração
    const systemPrompt = `Você é Mestre Drogon, um assistente especialista em Dungeons & Dragons 5ª Edição.

**Sua missão:**
- Responder perguntas sobre regras de D&D 5e com base APENAS nas fontes fornecidas
- Ser preciso, claro e objetivo
- Citar as fontes quando relevante
- Se a informação não estiver nas fontes, diga claramente
- Responder em ${language === "pt-BR" ? "Português Brasileiro" : language}

**Regras:**
1. Use APENAS informações dos trechos fornecidos
2. Cite a fonte ao mencionar regras específicas (ex: "[Fonte 1]")
3. Se algo não estiver nas fontes, seja honesto: "Essa informação não está disponível nos trechos consultados"
4. Seja conciso, mas completo
5. Use exemplos quando ajudar na compreensão

**Contexto dos Manuais D&D 5e:**
${context}

---

**Pergunta do usuário:**
${query}

**Sua resposta (fundamentada nas fontes acima):**`;

    // 4. Gerar resposta com Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature,
        maxOutputTokens: 1024,
      }
    });

    console.log("⚙️  Gerando resposta com Gemini...");
    const result = await model.generateContent(systemPrompt);
    const answer = result.response.text();

    console.log(`✅ Resposta gerada (${answer.length} caracteres)\n`);

    // 5. Calcular confiança média
    const avgConfidence = chunks.reduce((sum, c) => sum + c.similarity, 0) / chunks.length;

    // 6. Formatar fontes
    const sources = chunks.map(chunk => ({
      tipo: chunk.tipo,
      index: chunk.index,
      similarity: chunk.similarity,
      preview: chunk.content.substring(0, 150) + "...",
      hasRules: chunk.metadata?.hasRules || false,
      chapter: chunk.metadata?.chapter || null,
      section: chunk.metadata?.section || null
    }));

    return {
      answer,
      sources,
      context: includeContext ? context : null,
      confidence: Math.round(avgConfidence * 100) / 100,
      chunksUsed: chunks.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Erro na geração RAG:", error);
    throw new Error(`Falha na geração RAG: ${error.message}`);
  }
}

/**
 * Verifica se uma query deve usar RAG (heurística)
 * @param {string} message - Mensagem do usuário
 * @returns {boolean} true se deve usar RAG
 */
function shouldUseRAG(message) {
  const lowerMessage = message.toLowerCase();

  // Indicadores de consulta de regras
  const ruleIndicators = [
    'como funciona',
    'qual é a regra',
    'regra sobre',
    'regras de',
    'como fazer',
    'o que é',
    'explique',
    'cd ',
    'dificuldade',
    'teste de',
    'jogada de',
    'dano',
    'magia',
    'spell',
    'classe',
    'raça',
    'atributo',
    'habilidade',
    'perícia',
    'proficiência'
  ];

  return ruleIndicators.some(indicator => lowerMessage.includes(indicator));
}

/**
 * Integra RAG na resposta do Drogon
 * @param {string} userMessage - Mensagem do usuário
 * @param {string} campaignId - ID da campanha
 * @param {Object} context - Contexto da campanha
 * @returns {Promise<Object>} Resposta enriquecida com RAG
 */
async function enhanceDrogonWithRAG(userMessage, campaignId, context = {}) {
  try {
    // Verificar se deve usar RAG
    if (!shouldUseRAG(userMessage)) {
      return {
        useRAG: false,
        ragData: null
      };
    }

    console.log(`🔮 RAG ativado para mensagem: "${userMessage.substring(0, 50)}..."`);

    // Gerar resposta com RAG
    const ragResponse = await generateRAGResponse(userMessage, {
      tipo: null, // Busca em todos os manuais
      maxChunks: 3,
      temperature: 0.4,
      includeContext: false, // Não retorna contexto completo
      language: context.language || "pt-BR"
    });

    return {
      useRAG: true,
      ragData: ragResponse
    };

  } catch (error) {
    console.error("⚠️  Erro ao integrar RAG (fallback para resposta normal):", error);
    return {
      useRAG: false,
      ragData: null,
      error: error.message
    };
  }
}

module.exports = {
  retrieveRelevantChunks,
  generateRAGResponse,
  shouldUseRAG,
  enhanceDrogonWithRAG
};
