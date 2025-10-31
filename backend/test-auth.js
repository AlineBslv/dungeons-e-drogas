/**
 * Script de Teste - Autenticação JWT
 * Gera um token JWT de teste usando Firebase Admin SDK
 */

const { admin } = require('./firebaseAdmin');

async function generateTestToken(uid = 'test-user-123') {
  try {
    console.log('🔐 Gerando token JWT de teste...\n');

    // Cria ou obtém usuário de teste
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
      console.log(`✅ Usuário existente encontrado: ${userRecord.email || 'sem email'}`);
    } catch (error) {
      // Usuário não existe, criar um de teste
      console.log('⚠️  Usuário de teste não existe. Criando...');
      userRecord = await admin.auth().createUser({
        uid: uid,
        email: 'test@dungeonsedrogas.com',
        displayName: 'Jogador de Teste',
        password: 'senha-teste-123',
      });
      console.log(`✅ Usuário de teste criado: ${userRecord.email}`);
    }

    // Gera token JWT customizado
    const token = await admin.auth().createCustomToken(uid, {
      tier: 'jogador',
      email: userRecord.email,
    });

    console.log('\n📋 TOKEN JWT GERADO:\n');
    console.log(token);
    console.log('\n');

    console.log('🧪 TESTE COM CURL:\n');
    console.log(`curl -X GET http://localhost:4000/characters \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json"\n`);

    console.log('⚠️  IMPORTANTE:');
    console.log('Este é um Custom Token. Para usar em requisições HTTP, você precisa');
    console.log('trocar por um ID Token usando signInWithCustomToken no Firebase Auth.\n');
    console.log('Para testes reais, use o frontend para fazer login e copie o token do console.\n');

    return token;
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateTestToken()
    .then(() => {
      console.log('✅ Script concluído com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no script:', error);
      process.exit(1);
    });
}

module.exports = { generateTestToken };
