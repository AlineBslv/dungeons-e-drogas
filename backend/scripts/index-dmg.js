/**
 * Script para indexar o Livro do Mestre (DMG) com embeddings
 *
 * Este script:
 * 1. Lê o texto limpo do DMG
 * 2. Divide em chunks otimizados (com overlap)
 * 3. Gera embeddings usando Gemini
 * 4. Salva no Firestore com metadados
 *
 * Uso: node scripts/index-dmg.js
 */

require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const admin = require("firebase-admin");
const { generateEmbeddingsBatch } = require("../services/embeddingService");

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * Divide texto em chunks com overlap para manter contexto
 * @param {string} text - Texto completo
 * @param {number} chunkSize - Tamanho do chunk (caracteres)
 * @param {number} overlap - Overlap entre chunks (caracteres)
 * @returns {Array<Object>} Chunks com metadados
 */
function smartChunk(text, chunkSize = 800, overlap = 200) {
  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Se não é o último chunk, tenta quebrar em uma quebra de linha
    if (end < text.length) {
      const lastNewline = text.lastIndexOf('\n', end);
      const lastPeriod = text.lastIndexOf('.', end);

      // Quebra em parágrafo ou sentença, se possível
      if (lastNewline > start + chunkSize / 2) {
        end = lastNewline;
      } else if (lastPeriod > start + chunkSize / 2) {
        end = lastPeriod + 1;
      }
    }

    const content = text.substring(start, end).trim();

    if (content.length > 50) { // Ignora chunks muito pequenos
      chunks.push({
        index: chunkIndex++,
        content,
        startChar: start,
        endChar: end,
        length: content.length
      });
    }

    start = end - overlap;
  }

  return chunks;
}

/**
 * Detecta seções no texto do DMG
 * @param {string} content - Conteúdo do chunk
 * @returns {Object} Metadados da seção
 */
function extractMetadata(content) {
  const metadata = {
    hasTitle: false,
    hasTable: false,
    hasRules: false,
    section: null,
    chapter: null
  };

  // Detecta capítulos (CAPÍTULO X:)
  const chapterMatch = content.match(/CAPÍTULO\s+(\d+):\s*([^\n]+)/i);
  if (chapterMatch) {
    metadata.chapter = parseInt(chapterMatch[1]);
    metadata.section = chapterMatch[2].trim();
    metadata.hasTitle = true;
  }

  // Detecta tabelas
  if (content.includes('---') || content.match(/\|\s*\w+\s*\|/)) {
    metadata.hasTable = true;
  }

  // Detecta regras (indicadores: "deve", "pode", "CD", "teste de")
  const ruleIndicators = ['deve', 'pode', 'cd ', 'teste de', 'jogada de', 'dano'];
  if (ruleIndicators.some(indicator => content.toLowerCase().includes(indicator))) {
    metadata.hasRules = true;
  }

  return metadata;
}

/**
 * Processa e indexa o DMG
 */
async function indexDMG() {
  try {
    console.log("🚀 Iniciando indexação do Livro do Mestre (DMG)...\n");

    // 1. Ler arquivo de texto limpo
    const textPath = path.join(__dirname, "../text/livro-mestre.clean.txt");
    console.log(`📖 Lendo arquivo: ${textPath}`);

    const fullText = await fs.readFile(textPath, "utf-8");
    console.log(`✅ Arquivo lido: ${fullText.length} caracteres\n`);

    // 2. Dividir em chunks inteligentes
    console.log("🔪 Dividindo texto em chunks...");
    const chunks = smartChunk(fullText, 800, 200);
    console.log(`✅ ${chunks.length} chunks criados\n`);

    // 3. Adicionar metadados
    console.log("🏷️  Extraindo metadados...");
    const chunksWithMetadata = chunks.map(chunk => ({
      ...chunk,
      metadata: extractMetadata(chunk.content),
      tipo: "livro-mestre"
    }));
    console.log(`✅ Metadados extraídos\n`);

    // 4. Gerar embeddings
    console.log("🧠 Gerando embeddings com Gemini...");
    console.log(`⚠️  Isso pode levar alguns minutos (${chunks.length} chunks)...\n`);

    const texts = chunks.map(c => c.content);
    const embeddings = await generateEmbeddingsBatch(texts, 5, 2000); // 5 por batch, 2s delay

    console.log(`✅ ${embeddings.length} embeddings gerados\n`);

    // 5. Salvar no Firestore
    console.log("💾 Salvando no Firestore...");

    // Processar em batches de 500 (limite do Firestore)
    const BATCH_SIZE = 500;
    let savedCount = 0;

    for (let i = 0; i < chunksWithMetadata.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchChunks = chunksWithMetadata.slice(i, i + BATCH_SIZE);

      batchChunks.forEach((chunk, idx) => {
        const globalIdx = i + idx;
        const docRef = db.collection("manual_texts").doc(`dmg_chunk_${globalIdx}`);

        batch.set(docRef, {
          tipo: chunk.tipo,
          index: chunk.index,
          content: chunk.content,
          embedding: embeddings[globalIdx],
          metadata: chunk.metadata,
          startChar: chunk.startChar,
          endChar: chunk.endChar,
          length: chunk.length,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          version: "1.0"
        });
      });

      await batch.commit();
      savedCount += batchChunks.length;
      console.log(`  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${savedCount}/${chunksWithMetadata.length} chunks salvos`);
    }

    // 6. Salvar metadados do manual
    console.log("\n📋 Salvando metadados do manual...");
    await db.collection("manuals").doc("livro-mestre").set({
      nome: "Livro do Mestre",
      nome_original: "Dungeon Master's Guide",
      tipo: "livro-mestre",
      edicao: "5e",
      idioma: "pt-BR",
      totalChunks: chunks.length,
      chunkSize: 800,
      overlap: 200,
      embeddingModel: "text-embedding-004",
      totalCharacters: fullText.length,
      indexed_at: admin.firestore.FieldValue.serverTimestamp(),
      version: "1.0",
      status: "indexed"
    });

    console.log("✅ Metadados salvos\n");

    // 7. Sumário final
    console.log("═".repeat(60));
    console.log("🎉 INDEXAÇÃO CONCLUÍDA COM SUCESSO!");
    console.log("═".repeat(60));
    console.log(`📚 Manual: Livro do Mestre (DMG)`);
    console.log(`📄 Caracteres processados: ${fullText.length.toLocaleString()}`);
    console.log(`🧩 Chunks criados: ${chunks.length}`);
    console.log(`🧠 Embeddings gerados: ${embeddings.length}`);
    console.log(`💾 Documentos salvos no Firestore: ${savedCount}`);
    console.log(`⏱️  Modelo: Gemini text-embedding-004`);
    console.log("═".repeat(60));

    process.exit(0);

  } catch (error) {
    console.error("\n❌ ERRO na indexação:");
    console.error(error);
    process.exit(1);
  }
}

// Executar
indexDMG();
