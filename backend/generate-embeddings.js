require('./firebaseAdmin');
const admin = require('firebase-admin');
const { generateEmbedding } = require('./services/embeddingService');

const db = admin.firestore();

/**
 * Processa chunks e gera embeddings
 * @param {string} tipo - Tipo do manual (opcional, processa todos se não especificado)
 * @param {number} limit - Limite de chunks para processar (para testes)
 */
async function processEmbeddings(tipo = null, limit = null) {
  try {
    console.log('🚀 Iniciando processamento de embeddings...\n');

    // Buscar chunks
    let query = db.collection('manual_texts');

    if (tipo) {
      query = query.where('tipo', '==', tipo);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    const total = snapshot.size;

    console.log(`📊 Total de chunks a processar: ${total}\n`);

    let processed = 0;
    let errors = 0;

    // Processar em lotes com batch write
    const batchSize = 500; // Limite do Firestore batch
    let batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();

        // Verificar se já tem embedding
        if (data.embedding && data.embedding.length > 0) {
          console.log(`⏭️  Chunk ${data.index} (${data.tipo}) já possui embedding`);
          processed++;
          continue;
        }

        // Gerar embedding
        console.log(`🔄 Processando chunk ${data.index} (${data.tipo})...`);
        const embedding = await generateEmbedding(data.content);

        // Adicionar ao batch
        batch.update(doc.ref, {
          embedding,
          embeddingGeneratedAt: new Date()
        });

        batchCount++;
        processed++;

        // Commit batch quando atingir limite
        if (batchCount >= batchSize) {
          await batch.commit();
          console.log(`✅ Batch de ${batchCount} chunks processado`);
          batch = db.batch();
          batchCount = 0;
        }

        // Rate limiting (Gemini tem limites de requisições)
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms entre requests

      } catch (error) {
        console.error(`❌ Erro ao processar chunk ${doc.id}:`, error.message);
        errors++;
      }

      // Progresso
      if (processed % 10 === 0) {
        console.log(`📈 Progresso: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
      }
    }

    // Commit último batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Último batch de ${batchCount} chunks processado`);
    }

    console.log(`\n✨ Processamento concluído!`);
    console.log(`   Processados: ${processed}`);
    console.log(`   Erros: ${errors}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar
const args = process.argv.slice(2);
const tipo = args[0] || null;
const limit = args[1] ? parseInt(args[1]) : null;

console.log(`Tipo: ${tipo || 'todos'}`);
console.log(`Limit: ${limit || 'sem limite'}\n`);

processEmbeddings(tipo, limit);
