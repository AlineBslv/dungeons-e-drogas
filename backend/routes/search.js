const express = require("express");
const { semanticSearch, ragQuery, retrieveChunks } = require("../controllers/searchController");

const router = express.Router();

// POST /search/rag - Consulta com RAG (Retrieval + Generation)
router.post("/rag", ragQuery);

// POST /search/semantic - Busca semântica (legado, mantido para compatibilidade)
router.post("/semantic", semanticSearch);

// POST /search/retrieve - Retrieve chunks sem geração
router.post("/retrieve", retrieveChunks);

module.exports = router;
