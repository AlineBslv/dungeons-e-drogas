require('./firebaseAdmin');
const admin = require('firebase-admin');

const db = admin.firestore();

(async () => {
  try {
    console.log('📊 Verificando qualidade dos chunks...\n');

    const chunks = await db.collection('manual_texts')
      .limit(5)
      .get();

    chunks.forEach((doc) => {
      const data = doc.data();
      console.log(`\n${'='.repeat(60)}`);
      console.log(`CHUNK ${data.index} | Tipo: ${data.tipo}`);
      console.log(`${'='.repeat(60)}`);
      console.log(data.content.substring(0, 400));
      console.log(`\n[...] (${data.content.length} caracteres totais)\n`);
    });

    // Estatísticas
    const allChunks = await db.collection('manual_texts').get();
    const tipos = {};
    allChunks.forEach(doc => {
      const tipo = doc.data().tipo;
      tipos[tipo] = (tipos[tipo] || 0) + 1;
    });

    console.log('\n📈 Estatísticas:');
    console.log(JSON.stringify(tipos, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
})();
