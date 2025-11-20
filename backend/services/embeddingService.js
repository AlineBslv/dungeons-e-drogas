const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Gera embedding para um texto usando Gemini
 * @param {string} text - Texto para gerar embedding
 * @param {string} taskType - Tipo de tarefa (RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, etc)
 * @returns {Promise<number[]>} Vetor de embedding
 */
async function generateEmbedding(text, taskType = "RETRIEVAL_DOCUMENT") {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    const result = await model.embedContent({
      content: { parts: [{ text }] },
      taskType
    });

    return result.embedding.values;
  } catch (error) {
    console.error("Erro ao gerar embedding:", error);
    throw new Error(`Falha ao gerar embedding: ${error.message}`);
  }
}

/**
 * Gera embeddings em lote com rate limiting
 * @param {Array<string>} texts - Array de textos
 * @param {number} batchSize - Tamanho do lote
 * @param {number} delayMs - Delay entre lotes (ms)
 * @returns {Promise<Array<number[]>>} Array de vetores
 */
async function generateEmbeddingsBatch(texts, batchSize = 10, delayMs = 1000) {
  const embeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`🔄 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);

    const batchEmbeddings = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );

    embeddings.push(...batchEmbeddings);

    // Delay entre lotes para respeitar rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return embeddings;
}

/**
 * Calcula similaridade de cosseno entre dois vetores
 * @param {number[]} vecA - Vetor A
 * @param {number[]} vecB - Vetor B
 * @returns {number} Similaridade (0-1)
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error("Vetores devem ter o mesmo tamanho");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch,
  cosineSimilarity
};
