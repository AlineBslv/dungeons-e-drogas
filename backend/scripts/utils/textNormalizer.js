/**
 * Normaliza texto (acentos, caixa, pontuação)
 * @param {string} input - Texto de entrada
 * @param {Object} options - Opções de normalização
 * @param {boolean} options.lowerCase - Converter para minúsculas
 * @param {boolean} options.removeAccents - Remover acentos
 * @returns {string} Texto normalizado
 */
function normalizeText(input, options = { lowerCase: false, removeAccents: false }) {
  let text = input;

  // Remover acentos se solicitado (preservamos por padrão para manter a semântica do português)
  if (options.removeAccents) {
    const accentsMap = {
      'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a',
      'é': 'e', 'ê': 'e',
      'í': 'i',
      'ó': 'o', 'ô': 'o', 'õ': 'o',
      'ú': 'u', 'ü': 'u',
      'ç': 'c',
      'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A',
      'É': 'E', 'Ê': 'E',
      'Í': 'I',
      'Ó': 'O', 'Ô': 'O', 'Õ': 'O',
      'Ú': 'U', 'Ü': 'U',
      'Ç': 'C'
    };

    text = text.replace(/[áàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ]/g, char => accentsMap[char] || char);
  }

  if (options.lowerCase) {
    text = text.toLowerCase();
  }

  // Espaço e pontuação consistentes
  text = text.replace(/\s+([.,!?;:])/g, "$1"); // Remove espaço antes da pontuação
  text = text.replace(/([.,!?;:])(?=[^\s])/g, "$1 "); // Adiciona espaço depois da pontuação
  text = text.replace(/\s{2,}/g, " ").trim(); // Remove espaços duplos

  return text;
}

module.exports = { normalizeText };
