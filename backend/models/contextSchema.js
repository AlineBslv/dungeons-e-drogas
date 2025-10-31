/**
 * Schema de contexto dinâmico do Mestre Drogon
 * Define variáveis que controlam tom, idioma, estilo e profundidade das respostas da IA
 */

/**
 * Valores possíveis para cada variável de contexto
 */
const CONTEXT_VALUES = {
  language: {
    'pt-BR': 'Português (Brasil)',
    'en-US': 'English (United States)',
    'es-ES': 'Español (España)',
    'auto': 'Auto-detectar idioma'
  },

  tone: {
    'epic': 'Épico - grandioso, heróico, poético',
    'dark': 'Sombrio - dramático, misterioso',
    'comic': 'Cômico - leve, sarcástico, bem-humorado',
    'neutral': 'Neutro - conversa padrão',
    'mystical': 'Místico - arcano, sábio, enigmático',
    'horror': 'Horror - terror, suspense, sobrenatural'
  },

  detail_level: {
    'low': 'Baixo - respostas curtas e diretas',
    'medium': 'Médio - descrições balanceadas',
    'high': 'Alto - narrativa cinematográfica e detalhada'
  },

  style: {
    'rule': 'Técnico - explicações de regras e mecânicas',
    'narrative': 'Narrativo - histórias e descrições imersivas',
    'casual': 'Casual - conversa coloquial e descontraída'
  },

  ai_focus: {
    'rules': 'Regras - foco em mecânicas e sistema de jogo',
    'storytelling': 'Narrativa - foco em história e imersão',
    'lore': 'Lore - foco em conhecimento e mitologia do mundo',
    'balanced': 'Balanceado - equilibra regras e narrativa'
  },

  user_tier: {
    'mestre': 'Mestre - controla a campanha',
    'jogador': 'Jogador - participa da sessão',
    'visitante': 'Visitante - observador'
  },

  mood: {
    'hope': 'Esperança - otimista, aventureiro',
    'fear': 'Medo - tenso, perigoso',
    'mystery': 'Mistério - intrigante, enigmático',
    'joy': 'Alegria - celebratório, triunfante',
    'despair': 'Desespero - sombrio, desesperançado',
    'neutral': 'Neutro - estado padrão'
  }
};

/**
 * Contexto padrão (usado ao criar nova campanha)
 */
const DEFAULT_CONTEXT = {
  language: 'pt-BR',
  tone: 'mystical',
  detail_level: 'medium',
  style: 'narrative',
  user_tier: 'mestre',
  ai_focus: 'storytelling',
  mood: 'hope',
  temperature: 0.7,
  sessionStart: null,
  lastUpdate: null,
  context_memory: {}
};

/**
 * Mapeamento de temperature por foco da IA
 */
const TEMPERATURE_BY_FOCUS = {
  'rules': 0.3,        // Preciso e técnico
  'storytelling': 0.8,  // Criativo e narrativo
  'lore': 0.5,         // Balanceado
  'balanced': 0.6      // Ligeiramente criativo
};

/**
 * Mapeamento de temperature por tom
 */
const TEMPERATURE_BY_TONE = {
  'epic': 0.8,
  'dark': 0.7,
  'comic': 0.9,
  'neutral': 0.5,
  'mystical': 0.7,
  'horror': 0.85  // Alta criatividade para gerar suspense imprevisível
};

/**
 * Valida se um contexto tem todos os campos necessários
 * @param {Object} context - Contexto a ser validado
 * @returns {boolean}
 */
function validateContext(context) {
  const requiredFields = [
    'language',
    'tone',
    'detail_level',
    'style',
    'user_tier',
    'ai_focus',
    'mood',
    'temperature'
  ];

  return requiredFields.every(field => context.hasOwnProperty(field));
}

/**
 * Normaliza valores de contexto (lowercase, trim)
 * @param {Object} context - Contexto a ser normalizado
 * @returns {Object}
 */
function normalizeContext(context) {
  const normalized = { ...context };

  // Normalizar strings
  ['language', 'tone', 'detail_level', 'style', 'user_tier', 'ai_focus', 'mood'].forEach(field => {
    if (typeof normalized[field] === 'string') {
      normalized[field] = normalized[field].toLowerCase().trim();
    }
  });

  // Garantir temperature entre 0 e 1
  if (typeof normalized.temperature === 'number') {
    normalized.temperature = Math.max(0, Math.min(1, normalized.temperature));
  }

  return normalized;
}

/**
 * Mescla contexto parcial com valores padrão
 * @param {Object} partialContext - Contexto parcial
 * @returns {Object}
 */
function mergeWithDefaults(partialContext = {}) {
  return {
    ...DEFAULT_CONTEXT,
    ...partialContext,
    lastUpdate: new Date()
  };
}

/**
 * Calcula temperature ideal baseado em foco e tom
 * @param {string} ai_focus - Foco da IA
 * @param {string} tone - Tom narrativo
 * @returns {number}
 */
function calculateTemperature(ai_focus, tone) {
  const focusTemp = TEMPERATURE_BY_FOCUS[ai_focus] || 0.7;
  const toneTemp = TEMPERATURE_BY_TONE[tone] || 0.7;

  // Média ponderada (60% foco, 40% tom)
  return Math.round((focusTemp * 0.6 + toneTemp * 0.4) * 10) / 10;
}

/**
 * Converte contexto em descrição textual para prompt
 * @param {Object} context - Contexto da campanha
 * @returns {string}
 */
function contextToPromptDescription(context) {
  const descriptions = {
    language: CONTEXT_VALUES.language[context.language] || context.language,
    tone: CONTEXT_VALUES.tone[context.tone] || context.tone,
    detail_level: CONTEXT_VALUES.detail_level[context.detail_level] || context.detail_level,
    style: CONTEXT_VALUES.style[context.style] || context.style,
    ai_focus: CONTEXT_VALUES.ai_focus[context.ai_focus] || context.ai_focus,
    mood: CONTEXT_VALUES.mood[context.mood] || context.mood
  };

  return `
Idioma: ${descriptions.language}
Tom: ${descriptions.tone}
Nível de detalhe: ${descriptions.detail_level}
Estilo: ${descriptions.style}
Foco: ${descriptions.ai_focus}
Clima da campanha: ${descriptions.mood}
Temperatura criativa: ${context.temperature}
  `.trim();
}

/**
 * Cria schema Firestore para salvar contexto
 * @param {string} campaignId - ID da campanha
 * @param {Object} context - Contexto a ser salvo
 * @returns {Object}
 */
function createFirestoreSchema(campaignId, context) {
  const normalized = normalizeContext(context);

  return {
    campaignId,
    ...normalized,
    sessionStart: normalized.sessionStart || new Date(),
    lastUpdate: new Date(),
    version: '1.0'
  };
}

module.exports = {
  CONTEXT_VALUES,
  DEFAULT_CONTEXT,
  TEMPERATURE_BY_FOCUS,
  TEMPERATURE_BY_TONE,
  validateContext,
  normalizeContext,
  mergeWithDefaults,
  calculateTemperature,
  contextToPromptDescription,
  createFirestoreSchema
};
