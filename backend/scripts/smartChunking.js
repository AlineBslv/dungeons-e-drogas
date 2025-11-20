require('../firebaseAdmin');
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * Faz re-chunking inteligente baseado em seções lógicas
 * Em vez de chunks fixos de 1000 chars, usa seções semânticas
 * @param {string} tipo - Tipo do manual
 * @param {number} maxChunkSize - Tamanho máximo de chunk (padrão: 2000 chars)
 * @param {boolean} preserveHeaders - Incluir headers nas seções (padrão: true)
 */
async function smartChunking(tipo, maxChunkSize = 2000, preserveHeaders = true) {
  try {
    console.log(`🧠 Iniciando re-chunking inteligente de: ${tipo}...\n`);

    // Ler arquivo limpo
    const filePath = path.join(__dirname, '..', 'text', `${tipo}.clean.txt`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filePath}`);
      console.log('Execute primeiro: node scripts/preprocessText.js', tipo);
      process.exit(1);
    }

    const cleanText = fs.readFileSync(filePath, 'utf-8');

    // Dividir por separador de seções
    const rawSections = cleanText.split('\n\n---\n\n');
    console.log(`📚 Seções brutas encontradas: ${rawSections.length}`);

    // Processar seções
    const smartChunks = [];
    let currentChunk = { header: '', content: '', size: 0 };

    for (const section of rawSections) {
      const trimmed = section.trim();
      if (!trimmed) continue;

      // Detectar se é header
      const isHeader = trimmed.startsWith('#');

      if (isHeader) {
        // Salvar chunk anterior se existir
        if (currentChunk.content && currentChunk.size > 0) {
          smartChunks.push({
            header: currentChunk.header,
            content: currentChunk.content.trim(),
            size: currentChunk.size
          });
        }

        // Iniciar novo chunk com header
        currentChunk = {
          header: trimmed.replace(/^#\s*/, ''),
          content: preserveHeaders ? trimmed + '\n\n' : '',
          size: preserveHeaders ? trimmed.length + 2 : 0
        };
      } else {
        // Adicionar conteúdo ao chunk atual
        const sectionSize = trimmed.length + 2; // +2 para \n\n

        // Se adicionar esta seção ultrapassar o limite, salvar chunk atual e iniciar novo
        if (currentChunk.size + sectionSize > maxChunkSize && currentChunk.size > 0) {
          smartChunks.push({
            header: currentChunk.header,
            content: currentChunk.content.trim(),
            size: currentChunk.size
          });

          // Novo chunk mantém o header
          currentChunk = {
            header: currentChunk.header,
            content: preserveHeaders ? `# ${currentChunk.header}\n\n${trimmed}\n\n` : `${trimmed}\n\n`,
            size: (preserveHeaders ? currentChunk.header.length + 4 : 0) + sectionSize
          };
        } else {
          // Adicionar ao chunk atual
          currentChunk.content += trimmed + '\n\n';
          currentChunk.size += sectionSize;
        }
      }
    }

    // Adicionar último chunk
    if (currentChunk.content && currentChunk.size > 0) {
      smartChunks.push({
        header: currentChunk.header,
        content: currentChunk.content.trim(),
        size: currentChunk.size
      });
    }

    console.log(`✂️  Chunks inteligentes criados: ${smartChunks.length}`);

    // Estatísticas
    const avgSize = Math.round(smartChunks.reduce((sum, c) => sum + c.size, 0) / smartChunks.length);
    const minSize = Math.min(...smartChunks.map(c => c.size));
    const maxSize = Math.max(...smartChunks.map(c => c.size));

    console.log(`\n📊 Estatísticas dos chunks:`);
    console.log(`   Tamanho médio: ${avgSize} chars`);
    console.log(`   Tamanho mínimo: ${minSize} chars`);
    console.log(`   Tamanho máximo: ${maxSize} chars`);

    // Salvar no Firestore em nova collection
    console.log(`\n💾 Salvando chunks no Firestore...`);
    let batch = db.batch();
    const batchSize = 500;
    let batchCount = 0;
    let saved = 0;

    for (let i = 0; i < smartChunks.length; i++) {
      const chunk = smartChunks[i];
      const docRef = db.collection('smart_chunks').doc(`${tipo}_chunk_${i}`);

      batch.set(docRef, {
        tipo,
        index: i,
        header: chunk.header,
        content: chunk.content,
        size: chunk.size,
        createdAt: new Date(),
        version: '2.0-semantic'
      });

      batchCount++;
      saved++;

      // Commit batch quando atingir limite
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`   ✅ Batch de ${batchCount} chunks salvo (${saved}/${smartChunks.length})`);
        batch = db.batch(); // Criar novo batch
        batchCount = 0;
      }
    }

    // Commit último batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`   ✅ Último batch de ${batchCount} chunks salvo`);
    }

    // Salvar metadados
    await db.collection('smart_chunks_metadata').doc(tipo).set({
      tipo,
      totalChunks: smartChunks.length,
      avgSize,
      minSize,
      maxSize,
      maxChunkSize,
      preserveHeaders,
      version: '2.0-semantic',
      createdAt: new Date()
    });

    console.log(`\n✨ Re-chunking concluído!`);
    console.log(`   Total: ${smartChunks.length} chunks semânticos`);
    console.log(`   Collection: smart_chunks`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar
const tipo = process.argv[2];
const maxChunkSize = parseInt(process.argv[3]) || 2000;

if (!tipo) {
  console.error('❌ Informe o tipo do manual. Ex: node smartChunking.js livro-jogador [maxSize]');
  process.exit(1);
}

console.log(`Tipo: ${tipo}`);
console.log(`Max chunk size: ${maxChunkSize} chars\n`);

smartChunking(tipo, maxChunkSize);
