require('../firebaseAdmin');
const admin = require('firebase-admin');
const { generateEmbedding } = require('../services/embeddingService');

const db = admin.firestore();

/**
 * Gera embeddings para chunks semânticos com retry logic otimizado
 * @param {string} tipo - Tipo do manual (opcional, processa todos se não especificado)
 * @param {number} limit - Limite de chunks para processar (para testes)
 * @param {number} startFrom - Índice inicial para continuar de onde parou
 */
async function generateSmartEmbeddings(tipo = null, limit = null, startFrom = 0) {
  try {
    console.log('🧠 Iniciando geração de embeddings para chunks semânticos...\n');

    // Buscar chunks da nova collection (sem índice composto)
    const snapshot = await db.collection('smart_chunks').get();
    let allDocs = snapshot.docs;

    // Filtrar por tipo se especificado
    if (tipo) {
      allDocs = allDocs.filter(doc => doc.data().tipo === tipo);
      console.log(`🔍 Filtrando por tipo: ${tipo}`);
    }

    // Ordenar por index
    allDocs.sort((a, b) => a.data().index - b.data().index);

    if (startFrom > 0) {
      console.log(`⏩ Começando do índice ${startFrom}\n`);
    }

    // Aplicar limit se especificado
    const docsToProcess = limit
      ? allDocs.slice(startFrom, startFrom + limit)
      : allDocs.slice(startFrom);
    const total = docsToProcess.length;

    console.log(`📊 Total de chunks a processar: ${total}`);
    console.log(`   Chunks com embedding: ${startFrom}`);
    console.log(`   Chunks restantes: ${total}\n`);

    let processed = 0;
    let skipped = 0;
    let errors = 0;
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 5;

    // Configuração de rate limiting otimizada
    const BATCH_SIZE = 5; // Processar 5 por vez
    const DELAY_BETWEEN_REQUESTS = 500; // 500ms entre requests
    const DELAY_BETWEEN_BATCHES = 3000; // 3s entre batches
    const RETRY_DELAY = 10000; // 10s após erro de rate limit
    const MAX_RETRIES = 3;

    // Processar em pequenos batches
    for (let i = 0; i < docsToProcess.length; i += BATCH_SIZE) {
      const batchDocs = docsToProcess.slice(i, Math.min(i + BATCH_SIZE, docsToProcess.length));
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(docsToProcess.length / BATCH_SIZE);

      console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batchDocs.length} chunks)`);

      // Processar batch sequencialmente com delay
      for (const doc of batchDocs) {
        const data = doc.data();
        const globalIndex = startFrom + processed + skipped;

        // Verificar se já tem embedding
        if (data.embedding && data.embedding.length > 0) {
          console.log(`⏭️  [${globalIndex}] Chunk ${data.index} (${data.tipo}) já possui embedding`);
          skipped++;
          continue;
        }

        // Tentar gerar embedding com retry logic
        let success = false;
        let retries = 0;

        while (!success && retries < MAX_RETRIES) {
          try {
            console.log(`🔄 [${globalIndex}] Processando chunk ${data.index} (${data.tipo}) - "${data.header.substring(0, 50)}..."`);

            const embedding = await generateEmbedding(data.content);

            // Salvar imediatamente (não usar batch)
            await doc.ref.update({
              embedding,
              embeddingGeneratedAt: new Date()
            });

            processed++;
            consecutiveErrors = 0;
            success = true;

            console.log(`✅ [${globalIndex}] Embedding gerado (${embedding.length} dimensões)`);

            // Delay entre requests
            if (processed % BATCH_SIZE !== 0 || processed < docsToProcess.length) {
              await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            }

          } catch (error) {
            retries++;
            consecutiveErrors++;
            errors++;

            // Verificar se é erro de rate limit
            if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
              console.warn(`⚠️  [${globalIndex}] Rate limit atingido (tentativa ${retries}/${MAX_RETRIES})`);
              console.log(`   Aguardando ${RETRY_DELAY / 1000}s antes de tentar novamente...`);
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            } else if (error.message?.includes('quota')) {
              console.error(`❌ [${globalIndex}] Quota excedida. Interrompendo processo.`);
              throw new Error('Quota da API Gemini excedida. Execute novamente mais tarde.');
            } else {
              console.error(`❌ [${globalIndex}] Erro ao processar chunk ${doc.id}:`, error.message);

              if (retries < MAX_RETRIES) {
                console.log(`   Tentando novamente em ${RETRY_DELAY / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              }
            }

            // Se muitos erros consecutivos, pausar
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              console.error(`\n⛔ Muitos erros consecutivos (${consecutiveErrors}). Pausando por 30s...`);
              await new Promise(resolve => setTimeout(resolve, 30000));
              consecutiveErrors = 0;
            }
          }
        }

        if (!success) {
          console.error(`💀 [${globalIndex}] Falha após ${MAX_RETRIES} tentativas. Pulando chunk ${doc.id}`);
        }
      }

      // Delay entre batches (exceto no último)
      if (i + BATCH_SIZE < docsToProcess.length) {
        console.log(`\n⏸️  Pausa de ${DELAY_BETWEEN_BATCHES / 1000}s entre batches...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }

      // Progresso geral
      const totalProcessed = startFrom + processed + skipped;
      const totalChunks = allDocs.length;
      const progressPct = Math.round((totalProcessed / totalChunks) * 100);
      console.log(`\n📈 Progresso global: ${totalProcessed}/${totalChunks} (${progressPct}%)`);
      console.log(`   Novos embeddings: ${processed}`);
      console.log(`   Pulados (já existentes): ${skipped}`);
      console.log(`   Erros: ${errors}`);
    }

    // Atualizar metadados
    if (tipo && processed > 0) {
      await db.collection('smart_chunks_metadata').doc(tipo).update({
        embeddingsGenerated: true,
        totalEmbeddings: startFrom + processed + skipped,
        lastEmbeddingUpdate: new Date()
      });
    }

    console.log(`\n✨ Processamento concluído!`);
    console.log(`   Total processado: ${processed}`);
    console.log(`   Pulados: ${skipped}`);
    console.log(`   Erros: ${errors}`);
    console.log(`   Collection: smart_chunks`);

    if (processed + skipped < total) {
      const nextStart = startFrom + processed + skipped;
      console.log(`\n💡 Para continuar de onde parou, execute:`);
      console.log(`   node scripts/generateSmartEmbeddings.js ${tipo || 'null'} null ${nextStart}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar
const args = process.argv.slice(2);
const tipo = args[0] && args[0] !== 'null' ? args[0] : null;
const limit = args[1] && args[1] !== 'null' ? parseInt(args[1]) : null;
const startFrom = args[2] ? parseInt(args[2]) : 0;

console.log(`📋 Configuração:`);
console.log(`   Tipo: ${tipo || 'todos'}`);
console.log(`   Limit: ${limit || 'sem limite'}`);
console.log(`   Start from: ${startFrom}\n`);

generateSmartEmbeddings(tipo, limit, startFrom);
