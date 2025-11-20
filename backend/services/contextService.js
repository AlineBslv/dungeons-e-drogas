require('../firebaseAdmin');
const admin = require('firebase-admin');
const {
  DEFAULT_CONTEXT,
  validateContext,
  normalizeContext,
  mergeWithDefaults,
  calculateTemperature,
  createFirestoreSchema
} = require('../models/contextSchema');

const db = admin.firestore();

/**
 * Serviço de gerenciamento de contexto dinâmico do Mestre Drogon
 */

/**
 * Busca contexto de uma campanha
 * @param {string} campaignId - ID da campanha
 * @returns {Promise<Object|null>}
 */
async function getContext(campaignId) {
  try {
    const doc = await db.collection('contexts').doc(campaignId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data();
  } catch (error) {
    console.error('Erro ao buscar contexto:', error);
    throw error;
  }
}

/**
 * Cria contexto padrão para nova campanha
 * @param {string} campaignId - ID da campanha
 * @param {Object} customContext - Contexto customizado (opcional)
 * @returns {Promise<Object>}
 */
async function createContext(campaignId, customContext = {}) {
  try {
    // Mesclar com defaults
    const context = mergeWithDefaults(customContext);

    // Calcular temperature ideal
    context.temperature = calculateTemperature(context.ai_focus, context.tone);

    // Normalizar
    const normalized = normalizeContext(context);

    // Criar schema Firestore
    const schema = createFirestoreSchema(campaignId, normalized);

    // Salvar
    await db.collection('contexts').doc(campaignId).set(schema);

    console.log(`✅ Contexto criado para campanha ${campaignId}`);
    return schema;
  } catch (error) {
    console.error('Erro ao criar contexto:', error);
    throw error;
  }
}

/**
 * Atualiza contexto existente
 * @param {string} campaignId - ID da campanha
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<Object>}
 */
async function updateContext(campaignId, updates) {
  try {
    // Garantir que contexto existe
    let current = await getContext(campaignId);

    if (!current) {
      console.log(`⚠️  Contexto não existe para ${campaignId}, criando...`);
      current = await createContext(campaignId);
    }

    // Normalizar updates
    const normalized = normalizeContext(updates);

    // Recalcular temperature se necessário
    if (normalized.ai_focus || normalized.tone) {
      const newFocus = normalized.ai_focus || current.ai_focus;
      const newTone = normalized.tone || current.tone;
      normalized.temperature = calculateTemperature(newFocus, newTone);
    }

    // Adicionar timestamp
    normalized.lastUpdate = new Date();

    // Atualizar no Firestore
    await db.collection('contexts').doc(campaignId).update(normalized);

    console.log(`✅ Contexto atualizado para campanha ${campaignId}`);

    // Retornar contexto completo atualizado
    return await getContext(campaignId);
  } catch (error) {
    console.error('Erro ao atualizar contexto:', error);
    throw error;
  }
}

/**
 * Busca ou cria contexto (garante que sempre existe)
 * @param {string} campaignId - ID da campanha
 * @returns {Promise<Object>}
 */
async function getOrCreateContext(campaignId) {
  try {
    let context = await getContext(campaignId);

    if (!context) {
      context = await createContext(campaignId);
    }

    return context;
  } catch (error) {
    console.error('Erro ao buscar ou criar contexto:', error);
    throw error;
  }
}

/**
 * Detecta e atualiza contexto automaticamente baseado na mensagem
 * @param {string} campaignId - ID da campanha
 * @param {string} message - Mensagem do usuário
 * @returns {Promise<Object|null>} Retorna updates aplicados ou null
 */
async function autoDetectContext(campaignId, message) {
  try {
    const updates = {};
    const msg = message.toLowerCase();

    // Detectar nível de detalhe
    if (msg.match(/pode explicar melhor|mais detalhes|detalha/i)) {
      updates.detail_level = 'high';
    } else if (msg.match(/resumo|resuma|curto|breve|rápido/i)) {
      updates.detail_level = 'low';
    }

    // Detectar idioma
    if (msg.match(/fala.*ingl[eê]s|in english|speak english/i)) {
      updates.language = 'en-US';
    } else if (msg.match(/fala.*espanhol|en espa[ñn]ol|habla espa[ñn]ol/i)) {
      updates.language = 'es-ES';
    } else if (msg.match(/fala.*portugu[eê]s|em portugu[eê]s/i)) {
      updates.language = 'pt-BR';
    }

    // Detectar tom
    if (msg.match(/fala s[eé]rio|grave|sombrio|dark/i)) {
      updates.tone = 'dark';
    } else if (msg.match(/tenta ser engra[çc]ado|humor|piada|c[ôo]mico/i)) {
      updates.tone = 'comic';
    } else if (msg.match(/[eé]pico|hero[ií]co|grandioso/i)) {
      updates.tone = 'epic';
    }

    // Detectar estilo
    if (msg.match(/regra|mec[aâ]nica|como funciona/i)) {
      updates.style = 'rule';
    } else if (msg.match(/conta.*hist[oó]ria|narra|descreve/i)) {
      updates.style = 'narrative';
    }

    // Se detectou algo, atualizar
    if (Object.keys(updates).length > 0) {
      await updateContext(campaignId, updates);
      console.log(`🤖 Auto-detecção aplicou: ${JSON.stringify(updates)}`);
      return updates;
    }

    return null;
  } catch (error) {
    console.error('Erro na auto-detecção de contexto:', error);
    return null;
  }
}

/**
 * Deleta contexto de uma campanha
 * @param {string} campaignId - ID da campanha
 * @returns {Promise<void>}
 */
async function deleteContext(campaignId) {
  try {
    await db.collection('contexts').doc(campaignId).delete();
    console.log(`✅ Contexto deletado para campanha ${campaignId}`);
  } catch (error) {
    console.error('Erro ao deletar contexto:', error);
    throw error;
  }
}

/**
 * Reseta contexto para padrão
 * @param {string} campaignId - ID da campanha
 * @returns {Promise<Object>}
 */
async function resetContext(campaignId) {
  try {
    await deleteContext(campaignId);
    return await createContext(campaignId);
  } catch (error) {
    console.error('Erro ao resetar contexto:', error);
    throw error;
  }
}

/**
 * Verifica se contexto expirou (>2h de inatividade)
 * @param {Object} context - Contexto a verificar
 * @returns {boolean}
 */
function isContextExpired(context) {
  if (!context.lastUpdate) return true;

  const now = new Date();
  const lastUpdate = context.lastUpdate.toDate ? context.lastUpdate.toDate() : new Date(context.lastUpdate);
  const diffHours = (now - lastUpdate) / (1000 * 60 * 60);

  return diffHours > 2;
}

/**
 * Atualiza memória de contexto (últimas interações)
 * @param {string} campaignId - ID da campanha
 * @param {string} key - Chave da memória
 * @param {any} value - Valor a armazenar
 * @returns {Promise<void>}
 */
async function updateContextMemory(campaignId, key, value) {
  try {
    const context = await getContext(campaignId);
    const memory = context.context_memory || {};

    memory[key] = {
      value,
      timestamp: new Date()
    };

    // Limitar memória a 10 itens
    const memoryKeys = Object.keys(memory);
    if (memoryKeys.length > 10) {
      // Remover o mais antigo
      const oldest = memoryKeys.reduce((a, b) =>
        memory[a].timestamp < memory[b].timestamp ? a : b
      );
      delete memory[oldest];
    }

    await updateContext(campaignId, { context_memory: memory });
  } catch (error) {
    console.error('Erro ao atualizar memória de contexto:', error);
  }
}

module.exports = {
  getContext,
  createContext,
  updateContext,
  getOrCreateContext,
  autoDetectContext,
  deleteContext,
  resetContext,
  isContextExpired,
  updateContextMemory
};
