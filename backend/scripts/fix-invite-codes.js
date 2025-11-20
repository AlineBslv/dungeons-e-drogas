/**
 * Script para adicionar códigos de convite em campanhas existentes
 * Execute: node scripts/fix-invite-codes.js
 */

const { getFirestore } = require('firebase-admin/firestore');
require('../firebaseAdmin');

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) code += '-';
  }
  return code;
}

async function fixInviteCodes() {
  try {
    const db = getFirestore();
    const campaignsRef = db.collection('campaigns');

    // Busca todas as campanhas
    const snapshot = await campaignsRef.get();

    console.log(`📊 Total de campanhas: ${snapshot.size}`);

    let fixed = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const updates = {};
      let needsUpdate = false;

      // Se não tem invite_code, gera um
      if (!data.invite_code) {
        updates.invite_code = generateInviteCode();
        needsUpdate = true;
        console.log(`✅ Campanha "${data.title}" recebeu código: ${updates.invite_code}`);
      } else {
        console.log(`⏭️ Campanha "${data.title}" já tem código: ${data.invite_code}`);
      }

      // Se não tem status, define como 'active'
      if (!data.status) {
        updates.status = 'active';
        needsUpdate = true;
        console.log(`✅ Campanha "${data.title}" recebeu status: active`);
      }

      // Se não tem settings, adiciona padrão
      if (!data.settings) {
        updates.settings = {
          allow_player_invites: true,
          require_character_sheet: false,
          max_players: 6,
        };
        needsUpdate = true;
        console.log(`✅ Campanha "${data.title}" recebeu settings padrão`);
      }

      if (needsUpdate) {
        await doc.ref.update(updates);
        fixed++;
      } else {
        skipped++;
      }
    }

    console.log('\n📈 Resumo:');
    console.log(`✅ Corrigidas: ${fixed}`);
    console.log(`⏭️ Puladas: ${skipped}`);
    console.log(`📊 Total: ${snapshot.size}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixInviteCodes();
