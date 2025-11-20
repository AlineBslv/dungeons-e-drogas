/**
 * Remove ruídos vindos do OCR ou formatações estranhas
 * @param {string} rawText - Texto bruto extraído do PDF
 * @returns {string} Texto limpo
 */
function cleanText(rawText) {
  return rawText
    // Remove caracteres invisíveis e especiais quebrados
    .replace(/[^\x00-\x7FÀ-ÿ'""–…\n\r\.\,\?\!\:\;\'\"\-\(\)\[\]]/g, " ")
    .replace(/\u0000/g, " ")
    .replace(/ {2,}/g, " ") // Múltiplos espaços
    .replace(/\t+/g, " ") // Tabs
    .replace(/\n{3,}/g, "\n\n") // Quebras excessivas
    .replace(/-\s*\n\s*/g, "") // Palavras quebradas em linhas (ex: "conti-\nnuação" → "continuação")
    .replace(/'/g, "'") // Apóstrofes tipográficos
    .replace(/[""]/g, '"') // Aspas tipográficas
    .replace(/–|—/g, "-") // Travessões
    .replace(/\.\.\./g, "…") // Reticências
    .trim();
}

module.exports = { cleanText };
