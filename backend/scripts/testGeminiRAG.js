require('../firebaseAdmin');
const admin = require('firebase-admin');
const { generateEmbedding, cosineSimilarity } = require('../services/embeddingService');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Teste manual de consulta RAG (Retrieval-Augmented Generation)
 * Busca chunks semânticos relevantes e consulta o Gemini com contexto
 *
 * @param {string} query - Pergunta do usuário
 * @param {number} topK - Número de chunks mais relevantes para recuperar
 */
async function testGeminiRAG(query, topK = 5) {
  try {
    console.log('🧙 TESTE DE CONSULTA RAG - MESTRE DROGON\n');
    console.log(`📝 Pergunta: "${query}"\n`);

    // Passo 1: Gerar embedding da query
    console.log('🔄 Gerando embedding da pergunta...');
    const queryEmbedding = await generateEmbedding(query, "RETRIEVAL_QUERY");
    console.log(`✅ Embedding gerado (${queryEmbedding.length} dimensões)\n`);

    // Passo 2: Buscar todos os chunks com embeddings
    console.log('🔍 Buscando chunks com embeddings...');
    const chunksSnapshot = await db.collection('smart_chunks')
      .where('embedding', '!=', null)
      .get();

    const chunks = chunksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📚 Total de chunks disponíveis: ${chunks.length}\n`);

    if (chunks.length === 0) {
      console.error('❌ Nenhum chunk com embedding encontrado. Execute primeiro generateSmartEmbeddings.js');
      process.exit(1);
    }

    // Passo 3: Calcular similaridade para cada chunk
    console.log('🧮 Calculando similaridades...');
    const similarities = chunks.map(chunk => ({
      ...chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Passo 4: Ordenar por similaridade e pegar os top K
    const topChunks = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    console.log(`✅ Top ${topK} chunks mais relevantes:\n`);
    topChunks.forEach((chunk, i) => {
      console.log(`${i + 1}. [Similaridade: ${chunk.similarity.toFixed(4)}]`);
      console.log(`   Header: ${chunk.header}`);
      console.log(`   Content: ${chunk.content.substring(0, 100)}...`);
      console.log(`   Tipo: ${chunk.tipo} | Index: ${chunk.index}`);
      console.log('');
    });

    // Passo 5: Montar contexto a partir dos chunks recuperados
    const contextText = topChunks
      .map((chunk, i) => `[CONTEXTO ${i + 1}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    // Passo 6: Construir prompt com contexto RAG
    const prompt = `Você é o Mestre Drogon, o narrador arcano e sábio de Dungeons & Dragons.

Você tem acesso ao conhecimento dos manuais oficiais de D&D 5e.

CONTEXTO RELEVANTE DOS MANUAIS:
${contextText}

---

PERGUNTA DO JOGADOR:
${query}

INSTRUÇÕES:
- Use APENAS as informações do contexto fornecido acima
- Responda de forma narrativa, sábia e levemente bem-humorada
- Se a resposta não estiver no contexto, diga "Essa informação não consta nos pergaminhos que possuo..."
- Cite regras específicas quando relevante
- Mantenha o tom do Mestre Drogon (sábio, arcano, descontraído)

RESPOSTA:`;

    // Passo 7: Enviar para Gemini
    console.log('🤖 Consultando Mestre Drogon (Gemini)...\n');
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 800,
      }
    });

    const response = result.response.text();

    // Passo 8: Exibir resposta
    console.log('═'.repeat(80));
    console.log('🧙 RESPOSTA DO MESTRE DROGON:');
    console.log('═'.repeat(80));
    console.log(response);
    console.log('═'.repeat(80));
    console.log('');

    // Estatísticas
    console.log('📊 ESTATÍSTICAS:');
    console.log(`   Query: "${query}"`);
    console.log(`   Chunks recuperados: ${topK}`);
    console.log(`   Melhor similaridade: ${topChunks[0].similarity.toFixed(4)}`);
    console.log(`   Pior similaridade (top ${topK}): ${topChunks[topK - 1].similarity.toFixed(4)}`);
    console.log(`   Tamanho do contexto: ${contextText.length} chars`);
    console.log(`   Tamanho da resposta: ${response.length} chars`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar
const query = process.argv.slice(2).join(' ');
const topK = parseInt(process.env.TOP_K) || 5;

if (!query) {
  console.error('❌ Informe uma pergunta. Ex: node testGeminiRAG.js "Como funciona vantagem em D&D?"');
  console.log('\nExemplos de perguntas:');
  console.log('  - "Como funciona vantagem e desvantagem?"');
  console.log('  - "Quais são as raças disponíveis?"');
  console.log('  - "O que é um halfling?"');
  console.log('  - "Como criar um personagem anão guerreiro?"');
  console.log('  - "Quais são as classes de conjurador?"');
  process.exit(1);
}

console.log(`Top K: ${topK}\n`);
testGeminiRAG(query, topK);
