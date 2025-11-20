const fs = require("fs/promises");
const { PDFParse } = require("pdf-parse");
const admin = require("firebase-admin");

// Função para obter Firestore (lazy loading)
const getDb = () => admin.firestore();

/**
 * Extrai texto de um PDF
 * @param {string} pdfPath - Caminho do arquivo PDF
 * @returns {Promise<Object>} Objeto com texto e metadados
 */
async function extractTextFromPDF(pdfPath) {
  let parser;
  try {
    console.log(`📄 Lendo PDF: ${pdfPath}`);
    const dataBuffer = await fs.readFile(pdfPath);
    console.log(`📦 Buffer carregado: ${dataBuffer.length} bytes`);

    parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();

    console.log(`✅ Texto extraído: ${result.text.length} caracteres de ${result.numPages} páginas`);

    return {
      text: result.text,
      pages: result.numPages,
      info: result.info || {}
    };
  } catch (error) {
    console.error("Erro ao extrair texto do PDF:", error);
    console.error("Stack completo:", error.stack);
    throw new Error(`Falha na extração de texto do PDF: ${error.message}`);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

/**
 * Processa PDF e salva texto extraído no Firestore
 * @param {string} tipo - Tipo do livro (livro-jogador, livro-mestre, manual-monstros)
 * @param {string} pdfPath - Caminho do arquivo PDF
 */
async function processPDF(tipo, pdfPath) {
  try {
    console.log(`🔄 Processando PDF: ${tipo}`);

    // Extrair texto
    const { text, pages, info } = await extractTextFromPDF(pdfPath);

    console.log(`📊 Dados extraídos: ${text.length} chars, ${pages} páginas`);

    // Validar dados
    if (!text || text.length === 0) {
      throw new Error("Nenhum texto foi extraído do PDF");
    }

    // Dividir em chunks para facilitar consultas (aprox. 1000 caracteres por chunk)
    const chunkSize = 1000;
    const chunks = [];

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push({
        index: Math.floor(i / chunkSize),
        content: text.substring(i, i + chunkSize),
        tipo
      });
    }

    // Salvar no Firestore
    const db = getDb();
    const batch = db.batch();

    // Atualizar status do manual como processado
    const manualRef = db.collection("manuals").doc(tipo);
    batch.update(manualRef, {
      processado: true,
      totalPages: pages || 0,
      totalChunks: chunks.length,
      dataProcessamento: new Date()
    });

    // Salvar chunks de texto
    chunks.forEach((chunk, idx) => {
      const chunkRef = db.collection("manual_texts").doc(`${tipo}_chunk_${idx}`);
      batch.set(chunkRef, chunk);
    });

    await batch.commit();

    console.log(`✅ PDF processado: ${chunks.length} chunks criados`);

    return {
      tipo,
      pages,
      chunks: chunks.length,
      textLength: text.length
    };
  } catch (error) {
    console.error("Erro ao processar PDF:", error);
    throw error;
  }
}

module.exports = {
  extractTextFromPDF,
  processPDF
};
