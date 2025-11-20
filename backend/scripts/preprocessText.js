require('../firebaseAdmin');
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const { cleanText } = require("./utils/textCleaner");
const { normalizeText } = require("./utils/textNormalizer");
const { splitIntoSections } = require("./utils/sectionSplitter");

const db = admin.firestore();

/**
 * Pré-processa texto de um chunk no Firestore
 * @param {string} tipo - Tipo do manual
 */
async function preprocessManualChunks(tipo) {
  try {
    console.log(`🔮 Iniciando pré-processamento de: ${tipo}...\n`);

    // Buscar todos os chunks do tipo
    const chunksSnapshot = await db.collection('manual_texts')
      .where('tipo', '==', tipo)
      .get();

    if (chunksSnapshot.empty) {
      console.log(`❌ Nenhum chunk encontrado para tipo: ${tipo}`);
      return;
    }

    console.log(`📊 Total de chunks encontrados: ${chunksSnapshot.size}`);

    // Juntar todos os chunks em ordem
    const chunks = [];
    chunksSnapshot.forEach(doc => {
      const data = doc.data();
      chunks.push({ index: data.index, content: data.content, id: doc.id });
    });

    // Ordenar por índice
    chunks.sort((a, b) => a.index - b.index);

    // Juntar todo o texto
    const rawText = chunks.map(c => c.content).join('\n');
    console.log(`📏 Tamanho do texto bruto: ${rawText.length} caracteres`);

    // Aplicar limpeza
    console.log('🧹 Limpando texto...');
    const cleaned = cleanText(rawText);

    // Aplicar normalização
    console.log('📐 Normalizando texto...');
    const normalized = normalizeText(cleaned, { lowerCase: false, removeAccents: false });

    // Dividir em seções
    console.log('✂️  Dividindo em seções...');
    const sections = splitIntoSections(normalized);

    console.log(`📚 Seções identificadas: ${sections.length}`);

    // Juntar seções com separador
    const finalText = sections.join('\n\n---\n\n');

    // Salvar arquivo limpo
    const outputDir = path.join(__dirname, '..', 'text');
    const outputFile = path.join(outputDir, `${tipo}.clean.txt`);

    fs.writeFileSync(outputFile, finalText, 'utf-8');
    console.log(`✅ Arquivo salvo em: ${outputFile}`);

    // Salvar metadados no Firestore
    await db.collection('preprocessed_texts').doc(tipo).set({
      tipo,
      status: 'limpo',
      secoes: sections.length,
      caracteres: finalText.length,
      versao: '1.0.0-clean',
      outputFile,
      dataProcessamento: new Date()
    });

    console.log(`\n✨ Pré-processamento concluído!`);
    console.log(`   Texto original: ${rawText.length} chars`);
    console.log(`   Texto limpo: ${finalText.length} chars`);
    console.log(`   Seções: ${sections.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar
const tipo = process.argv[2];

if (!tipo) {
  console.error('❌ Informe o tipo do manual. Ex: node preprocessText.js livro-jogador');
  process.exit(1);
}

preprocessManualChunks(tipo);
