const express = require("express");
const { semanticSearch } = require("../controllers/searchController");

const router = express.Router();

// POST /search/semantic - Busca semântica
router.post("/semantic", semanticSearch);

module.exports = router;
