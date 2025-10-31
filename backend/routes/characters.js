const express = require("express");
const router = express.Router();
const { admin, db } = require("../firebaseAdmin");

// Autenticação JWT agora é feita no index.js antes das rotas
// req.userId já está disponível em todas as rotas deste arquivo

// ============================================
// POST /characters - Criar nova ficha
// ============================================
router.post("/", async (req, res) => {
  try {
    const { name, class: charClass, race, level, attributes, campaign_id } = req.body;

    if (!name || !charClass || !race) {
      return res.status(400).json({ error: "Nome, classe e raça são obrigatórios" });
    }

    // Calcula bônus de proficiência
    const proficiencyBonus = Math.floor(((level || 1) - 1) / 4) + 2;

    const characterData = {
      player_uid: req.userId,
      campaign_id: campaign_id || null,
      name,
      class: charClass,
      race,
      level: level || 1,
      background: req.body.background || '',
      alignment: req.body.alignment || '',

      attributes: attributes || {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },

      hp: {
        current: req.body.hp?.current || 10,
        max: req.body.hp?.max || 10,
        temporary: 0,
      },

      armor_class: req.body.armor_class || 10,
      proficiency_bonus: proficiencyBonus,

      proficiencies: {
        armor: req.body.proficiencies?.armor || [],
        weapons: req.body.proficiencies?.weapons || [],
        tools: req.body.proficiencies?.tools || [],
        languages: req.body.proficiencies?.languages || ['Comum'],
      },

      skills: req.body.skills || {},

      equipment: {
        armor: req.body.equipment?.armor || null,
        weapon_main: req.body.equipment?.weapon_main || null,
        weapon_off: req.body.equipment?.weapon_off || null,
        inventory: req.body.equipment?.inventory || [],
      },

      spells: req.body.spells || null,

      personality_traits: req.body.personality_traits || '',
      ideals: req.body.ideals || '',
      bonds: req.body.bonds || '',
      flaws: req.body.flaws || '',
      backstory: req.body.backstory || '',

      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("character_sheets").add(characterData);

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: "Ficha criada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar ficha:", error);
    res.status(500).json({ error: "Erro ao criar ficha de personagem" });
  }
});

// ============================================
// GET /characters - Listar fichas do usuário
// ============================================
router.get("/", async (req, res) => {
  try {
    const { campaign_id } = req.query;

    let query = db.collection("character_sheets")
      .where("player_uid", "==", req.userId);

    if (campaign_id) {
      query = query.where("campaign_id", "==", campaign_id);
    }

    const snapshot = await query.orderBy("created_at", "desc").get();

    const characters = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, characters });
  } catch (error) {
    console.error("Erro ao buscar fichas:", error);
    res.status(500).json({ error: "Erro ao buscar fichas" });
  }
});

// ============================================
// GET /characters/:id - Buscar ficha específica
// ============================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("character_sheets").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Ficha não encontrada" });
    }

    const character = { id: doc.id, ...doc.data() };

    // Verifica se o usuário tem permissão para ver a ficha
    if (character.player_uid !== req.userId) {
      // Verifica se é mestre da campanha
      if (character.campaign_id) {
        const campaignDoc = await db.collection("campaigns").doc(character.campaign_id).get();
        if (!campaignDoc.exists || campaignDoc.data().master_uid !== req.userId) {
          return res.status(403).json({ error: "Sem permissão para acessar esta ficha" });
        }
      } else {
        return res.status(403).json({ error: "Sem permissão para acessar esta ficha" });
      }
    }

    res.json({ success: true, character });
  } catch (error) {
    console.error("Erro ao buscar ficha:", error);
    res.status(500).json({ error: "Erro ao buscar ficha" });
  }
});

// ============================================
// PUT /characters/:id - Atualizar ficha
// ============================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("character_sheets").doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Ficha não encontrada" });
    }

    // Verifica se é o dono da ficha
    if (doc.data().player_uid !== req.userId) {
      return res.status(403).json({ error: "Sem permissão para editar esta ficha" });
    }

    const updates = { ...req.body };
    delete updates.player_uid; // Não permite mudar o dono
    delete updates.created_at; // Não permite mudar data de criação

    updates.updated_at = admin.firestore.FieldValue.serverTimestamp();

    // Recalcula proficiency bonus se level mudou
    if (updates.level) {
      updates.proficiency_bonus = Math.floor((updates.level - 1) / 4) + 2;
    }

    await docRef.update(updates);

    res.json({ success: true, message: "Ficha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar ficha:", error);
    res.status(500).json({ error: "Erro ao atualizar ficha" });
  }
});

// ============================================
// DELETE /characters/:id - Deletar ficha
// ============================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("character_sheets").doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Ficha não encontrada" });
    }

    // Verifica se é o dono da ficha
    if (doc.data().player_uid !== req.userId) {
      return res.status(403).json({ error: "Sem permissão para deletar esta ficha" });
    }

    await docRef.delete();

    res.json({ success: true, message: "Ficha deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar ficha:", error);
    res.status(500).json({ error: "Erro ao deletar ficha" });
  }
});

// ============================================
// PATCH /characters/:id/hp - Atualizar HP
// ============================================
router.patch("/:id/hp", async (req, res) => {
  try {
    const { id } = req.params;
    const { current, temporary } = req.body;

    const docRef = db.collection("character_sheets").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Ficha não encontrada" });
    }

    if (doc.data().player_uid !== req.userId) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    await docRef.update({
      'hp.current': current,
      'hp.temporary': temporary || 0,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "HP atualizado" });
  } catch (error) {
    console.error("Erro ao atualizar HP:", error);
    res.status(500).json({ error: "Erro ao atualizar HP" });
  }
});

// ============================================
// POST /characters/:id/inventory - Adicionar item
// ============================================
router.post("/:id/inventory", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, weight, description } = req.body;

    if (!name || !quantity) {
      return res.status(400).json({ error: "Nome e quantidade são obrigatórios" });
    }

    const docRef = db.collection("character_sheets").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Ficha não encontrada" });
    }

    if (doc.data().player_uid !== req.userId) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const newItem = { name, quantity, weight: weight || 0, description: description || '' };

    await docRef.update({
      'equipment.inventory': admin.firestore.FieldValue.arrayUnion(newItem),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Item adicionado ao inventário" });
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    res.status(500).json({ error: "Erro ao adicionar item" });
  }
});

// ============================================
// PATCH /characters/:id/link-campaign - Vincular à campanha
// ============================================
router.patch("/:id/link-campaign", async (req, res) => {
  try {
    const { id } = req.params;
    const { campaign_id } = req.body;

    if (!campaign_id) {
      return res.status(400).json({ error: "campaign_id é obrigatório" });
    }

    const docRef = db.collection("character_sheets").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Ficha não encontrada" });
    }

    if (doc.data().player_uid !== req.userId) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    // Verifica se a campanha existe e se o usuário tem acesso
    const campaignDoc = await db.collection("campaigns").doc(campaign_id).get();
    if (!campaignDoc.exists) {
      return res.status(404).json({ error: "Campanha não encontrada" });
    }

    const campaign = campaignDoc.data();
    if (campaign.master_uid !== req.userId && !campaign.players.includes(req.userId)) {
      return res.status(403).json({ error: "Você não faz parte desta campanha" });
    }

    await docRef.update({
      campaign_id,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Ficha vinculada à campanha" });
  } catch (error) {
    console.error("Erro ao vincular ficha:", error);
    res.status(500).json({ error: "Erro ao vincular ficha à campanha" });
  }
});

module.exports = router;
