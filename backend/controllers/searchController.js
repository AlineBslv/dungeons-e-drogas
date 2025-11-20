const admin = require("firebase-admin");
const { generateEmbedding, cosineSimilarity } = require("../services/embeddingService");
const { generateRAGResponse, retrieveRelevantChunks } = require("../services/ragService");

const db = admin.firestore();

/**
 * Consulta com RAG (Retrieval Augmented Generation)
 * POST /search/rag
 * Body: { query: string, tipo?: string, maxChunks?: number, temperature?: number }
 */
async function ragQuery(req, res) {
  try {
    const { query, tipo, maxChunks = 5, temperature = 0.3, language = "pt-BR" } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query ausente ou vazia." });
    }

    console.log(`\n🔮 RAG Query: "${query}"\n`);

    const response = await generateRAGResponse(query, {
      tipo,
      maxChunks,
      temperature,
      includeContext: false,
      language
    });

    res.json({
      success: true,
      query,
      ...response
    });

  } catch (error) {
    console.error("Erro na consulta RAG:", error);
    res.status(500).json({
      success: false,
      error: "Falha na consulta RAG.",
      details: error.message
    });
  }
}

/**
 * Busca semântica nos chunks de manuais
 * POST /search/semantic
 * Body: { query: string, tipo?: string, limit?: number, minScore?: number }
 */
async function semanticSearch(req, res) {
  try {
    const { query, tipo, limit = 5, minScore = 0.5 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query ausente ou vazia." });
    }

    console.log(`🔍 Busca: "${query}" | Tipo: ${tipo || 'todos'} | Limit: ${limit}`);

    // Gerar embedding da query
    const queryEmbedding = await generateEmbedding(query, "RETRIEVAL_QUERY");

    // Buscar chunks com embeddings
    let chunksQuery = db.collection("manual_texts");

    if (tipo) {
      chunksQuery = chunksQuery.where("tipo", "==", tipo);
    }

    const snapshot = await chunksQuery.get();

    if (snapshot.empty) {
      return res.json({
        query,
        results: [],
        message: "Nenhum chunk encontrado com embeddings."
      });
    }

    // Calcular similaridades
    const results = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      if (!data.embedding || data.embedding.length === 0) {
        return; // Skip chunks sem embedding
      }

      const similarity = cosineSimilarity(queryEmbedding, data.embedding);

      if (similarity >= minScore) {
        results.push({
          id: doc.id,
          tipo: data.tipo,
          index: data.index,
          content: data.content,
          similarity: Math.round(similarity * 1000) / 1000, // 3 decimais
        });
      }
    });

    // Ordenar por similaridade (maior primeiro)
    results.sort((a, b) => b.similarity - a.similarity);

    // Limitar resultados
    const topResults = results.slice(0, limit);

    console.log(`✅ ${topResults.length} resultados encontrados (de ${results.length} acima do threshold)`);

    res.json({
      query,
      tipo: tipo || "todos",
      minScore,
      totalFound: topResults.length,
      totalAboveThreshold: results.length,
      results: topResults
    });

  } catch (error) {
    console.error("Erro na busca semântica:", error);
    res.status(500).json({
      error: "Falha na busca semântica.",
      details: error.message
    });
  }
}

/**
 * Retrieve chunks (apenas busca, sem geração)
 * POST /search/retrieve
 * Body: { query: string, tipo?: string, limit?: number, minScore?: number }
 */
async function retrieveChunks(req, res) {
  try {
    const { query, tipo, limit = 5, minScore = 0.6 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query ausente ou vazia." });
    }

    const chunks = await retrieveRelevantChunks(query, {
      tipo,
      limit,
      minScore,
      includeMetadata: true
    });

    res.json({
      success: true,
      query,
      totalFound: chunks.length,
      chunks
    });

  } catch (error) {
    console.error("Erro no retrieve:", error);
    res.status(500).json({
      success: false,
      error: "Falha no retrieve de chunks.",
      details: error.message
    });
  }
}

module.exports = {
  semanticSearch,
  ragQuery,
  retrieveChunks
};
