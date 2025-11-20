require('../firebaseAdmin');
const { getOrCreateContext, updateContext } = require('../services/contextService');
const { contextToPromptDescription } = require('../models/contextSchema');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Teste do sistema de contexto dinâmico do Mestre Drogon
 * Testa diferentes configurações de tom, idioma e estilo
 */

async function testContextualChat() {
  const campaignId = 'test_context';
  const testMessage = "Descreva uma taverna movimentada onde os aventureiros se encontram";

  console.log('🧪 TESTE DO SISTEMA DE CONTEXTO DINÂMICO\n');
  console.log(`📝 Mensagem teste: "${testMessage}"\n`);
  console.log('═'.repeat(80));

  // Teste 1: Tom Épico + Alto Detalhe
  console.log('\n🎭 TESTE 1: Tom Épico + Alto Detalhe');
  console.log('─'.repeat(80));

  await updateContext(campaignId, {
    tone: 'epic',
    detail_level: 'high',
    language: 'pt-BR',
    style: 'narrative'
  });

  let context = await getOrCreateContext(campaignId);
  let response = await sendContextualMessage(testMessage, context);

  console.log(`\n📊 Contexto:\n${contextToPromptDescription(context)}\n`);
  console.log(`🧙 Resposta do Drogon:\n${response}\n`);

  await sleep(2000);

  // Teste 2: Tom Cômico + Baixo Detalhe
  console.log('═'.repeat(80));
  console.log('\n🎭 TESTE 2: Tom Cômico + Baixo Detalhe');
  console.log('─'.repeat(80));

  await updateContext(campaignId, {
    tone: 'comic',
    detail_level: 'low',
    style: 'casual'
  });

  context = await getOrCreateContext(campaignId);
  response = await sendContextualMessage(testMessage, context);

  console.log(`\n📊 Contexto:\n${contextToPromptDescription(context)}\n`);
  console.log(`🧙 Resposta do Drogon:\n${response}\n`);

  await sleep(2000);

  // Teste 3: Tom Sombrio + Médio Detalhe
  console.log('═'.repeat(80));
  console.log('\n🎭 TESTE 3: Tom Sombrio + Médio Detalhe');
  console.log('─'.repeat(80));

  await updateContext(campaignId, {
    tone: 'dark',
    detail_level: 'medium',
    mood: 'fear',
    style: 'narrative'
  });

  context = await getOrCreateContext(campaignId);
  response = await sendContextualMessage(testMessage, context);

  console.log(`\n📊 Contexto:\n${contextToPromptDescription(context)}\n`);
  console.log(`🧙 Resposta do Drogon:\n${response}\n`);

  await sleep(2000);

  // Teste 4: Estilo Técnico (Regras)
  console.log('═'.repeat(80));
  console.log('\n🎭 TESTE 4: Estilo Técnico (Regras)');
  console.log('─'.repeat(80));

  const technicalMessage = "Como funciona o sistema de combate em D&D?";

  await updateContext(campaignId, {
    tone: 'neutral',
    detail_level: 'medium',
    style: 'rule',
    ai_focus: 'rules'
  });

  context = await getOrCreateContext(campaignId);
  response = await sendContextualMessage(technicalMessage, context);

  console.log(`\n📝 Mensagem: "${technicalMessage}"\n`);
  console.log(`📊 Contexto:\n${contextToPromptDescription(context)}\n`);
  console.log(`🧙 Resposta do Drogon:\n${response}\n`);

  console.log('═'.repeat(80));
  console.log('\n✨ Testes concluídos!\n');

  process.exit(0);
}

async function sendContextualMessage(message, context) {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"
  });

  const contextDescription = contextToPromptDescription(context);

  const prompt = `
Você é o Mestre Drogon — o narrador arcano e sábio de Dungeons & Dragons.

CONFIGURAÇÕES DE CONTEXTO:
${contextDescription}

INSTRUÇÕES:
- Responda de acordo com o idioma, tom e estilo configurados acima
- Ajuste o nível de detalhe conforme especificado
- Mantenha o foco narrativo definido
- Respeite o clima atual da campanha

Usuário diz: "${message}"
`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: context.temperature,
      topP: 0.9,
      maxOutputTokens: 600,
    }
  });

  return result.response.text();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar
testContextualChat().catch(error => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
