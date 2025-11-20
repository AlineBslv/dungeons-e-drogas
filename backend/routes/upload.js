const express = require("express");
const multer = require("multer");
const { uploadBookPDF, processBookPDF } = require("../controllers/uploadController.js");

const router = express.Router();

// Configuração de armazenamento temporário
const upload = multer({ dest: "uploads/" });

// POST /upload/pdf - Fazer upload do PDF
router.post("/pdf", upload.single("file"), uploadBookPDF);

// POST /upload/process - Processar PDF e extrair texto
router.post("/process", processBookPDF);

module.exports = router;
