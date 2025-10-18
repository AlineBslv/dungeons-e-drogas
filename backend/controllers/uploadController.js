const fs = require("fs/promises");
const path = require("path");
const admin = require("firebase-admin");
const { processPDF } = require("../services/pdfService");

const db = admin.firestore();

// Função para upload local de PDF
async function uploadPDF(file) {
  const pdfDir = path.join(__dirname, "..", "pdfs");
  const filename = `${Date.now()}_${file.originalname}`;
  const destination = path.join(pdfDir, filename);

  // Move arquivo temporário para pasta pdfs
  await fs.rename(file.path, destination);

  return {
    path: destination,
    filename: filename,
    relativePath: `pdfs/${filename}`
  };
}

async function uploadBookPDF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const { tipo } = req.body; // "livro-jogador", "livro-mestre", "manual-monstros"
    if (!tipo) {
      return res.status(400).json({ error: "Tipo do livro ausente." });
    }

    // Validar tipo MIME
    if (req.file.mimetype !== "application/pdf") {
      return res.status(415).json({ error: "Somente grimórios em formato .pdf são aceitos" });
    }

    const result = await uploadPDF(req.file);

    const meta = {
      nome: req.file.originalname,
      tipo,
      tamanho: req.file.size,
      mime: req.file.mimetype,
      path: result.path,
      relativePath: result.relativePath,
      filename: result.filename,
      dataUpload: new Date(),
      processado: false, // Será true após extrair texto
    };

    await db.collection("manuals").doc(tipo).set(meta);

    res.json({
      message: "Grimório armazenado com sucesso! 📚",
      meta
    });
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ error: "Falha ao enviar PDF." });
  }
}

async function processBookPDF(req, res) {
  try {
    const { tipo } = req.body;

    if (!tipo) {
      return res.status(400).json({ error: "Tipo do livro ausente." });
    }

    // Buscar metadados do manual
    const manualDoc = await db.collection("manuals").doc(tipo).get();

    if (!manualDoc.exists) {
      return res.status(404).json({ error: "Grimório não encontrado. Faça o upload primeiro." });
    }

    const manualData = manualDoc.data();

    if (manualData.processado) {
      return res.status(400).json({ error: "Este grimório já foi processado." });
    }

    // Processar PDF
    const result = await processPDF(tipo, manualData.path);

    res.json({
      message: "Grimório processado com sucesso! 📖✨",
      result
    });
  } catch (err) {
    console.error("Erro ao processar PDF:", err);
    console.error("Stack:", err.stack);
    res.status(500).json({
      error: "Falha ao processar grimório.",
      details: err.message
    });
  }
}

module.exports = { uploadBookPDF, processBookPDF };
