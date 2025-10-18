/**
 * Divide texto em blocos lógicos menores (capítulos, seções ou parágrafos)
 * Segue um critério baseado em títulos (palavras todas maiúsculas ou precedidas de números)
 * @param {string} text - Texto normalizado
 * @returns {Array<string>} Array de seções
 */
function splitIntoSections(text) {
  const sections = [];
  const lines = text.split(/\n/);
  let current = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Detectar headers:
    // 1. Linhas com mais de 50% de letras maiúsculas
    // 2. Linhas começando com "CAPÍTULO", "PARTE", etc.
    // 3. Linhas que parecem títulos (curtas e todas caps)
    const upperCaseRatio = (trimmed.match(/[A-ZÁÉÍÓÚÃÕÂÊÔÀÇ]/g) || []).length / trimmed.length;
    const isLikelyHeader =
      /^(CAPÍTULO|PARTE|SEÇÃO|APÊNDICE|ÍNDICE|SUMÁRIO|PREFÁCIO|INTRODUÇÃO)/i.test(trimmed) ||
      (upperCaseRatio > 0.7 && trimmed.length > 3 && trimmed.length < 100) ||
      /^[\d\s\.\-]+[A-ZÁÉÍÓÚÃÕÂÊÔÀÇ\s]{3,}$/.test(trimmed); // Ex: "1.2 TÍTULO"

    if (isLikelyHeader && trimmed.length > 0) {
      // Salvar seção anterior
      if (current.trim()) {
        sections.push(current.trim());
      }
      // Iniciar nova seção com marcação de header
      current = `# ${trimmed}\n`;
    } else {
      current += `${trimmed} `;
    }
  }

  // Adicionar última seção
  if (current.trim()) {
    sections.push(current.trim());
  }

  // Limpar espaços duplos e retornar
  return sections.map((s) => s.replace(/\s{2,}/g, " ").trim()).filter(s => s.length > 0);
}

module.exports = { splitIntoSections };
