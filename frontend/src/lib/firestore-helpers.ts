/**
 * Firestore Helpers - Dungeons e Drogas
 * Funções auxiliares para interação com Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// TYPES
// ============================================

export interface Campaign {
  master_uid: string;
  players: string[];
  context: CampaignContext;
  created_at: Timestamp;
  last_session?: Timestamp;
  title?: string;
  description?: string;
}

export interface CampaignContext {
  tone: 'epic' | 'casual' | 'horror';
  detail_level: 'low' | 'medium' | 'high';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  style?: string;
}

export interface Message {
  sender: 'mestre' | 'jogador' | 'drogon';
  content: string;
  timestamp: Timestamp;
  type?: 'message' | 'dice_roll';
  roll_data?: DiceRoll;
  diceData?: {
    command: string;
    result: any;
    context?: string;
    characterName?: string;
  };
  player_uid?: string;
}

export interface DiceRoll {
  dice: string;
  modifier: number;
  result: number;
  rolls?: number[];
}

export interface Context {
  current_scene?: string;
  active_characters: string[];
  location?: string;
  time_of_day?: string;
  recent_events: string[];
  session_summary?: string;
  updated_at: Timestamp;
}

export interface CharacterSheet {
  player_uid: string;
  campaign_id?: string;
  name: string;
  class: string;
  race: string;
  subrace?: string; // NOVO: Sub-raça (ex: "Alto Elfo", "Anão da Montanha")
  subclass?: string; // NOVO: Subclasse escolhida no nível 3
  level: number;
  background?: string;
  alignment?: string;

  // Atributos base (3-20)
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };

  // Pontos de vida
  hp: {
    current: number;
    max: number;
    temporary: number;
  };

  // Classe de Armadura
  armor_class: number;
  has_shield?: boolean; // NOVO: Se está usando escudo

  // Proficiências
  proficiency_bonus: number;
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
  };

  // Skills (perícias)
  skills: {
    [key: string]: {
      proficient: boolean;
      expertise: boolean;
      bonus?: number;
    };
  };

  // NOVO: Talentos (Feats) selecionados nos níveis ASI
  feats?: {
    level: number;
    feat_name: string;
    choice?: string; // Para talentos que exigem escolha (ex: Iniciado em Magia)
  }[];

  // NOVO: Melhorias de Atributo (ASI) aplicadas
  ability_improvements?: {
    level: number;
    attribute1: keyof CharacterSheet['attributes'];
    attribute2?: keyof CharacterSheet['attributes'];
  }[];

  // Equipamento
  equipment: {
    armor?: string;
    weapon_main?: string;
    weapon_off?: string;
    inventory: InventoryItem[];
  };

  // Spells (magias) - opcional
  spells?: {
    spellcasting_ability?: string;
    spell_save_dc?: number;
    spell_attack_bonus?: number;
    spell_slots?: { [level: number]: { max: number; current: number } };
    known_spells: string[];
    cantrips?: string[]; // NOVO: Truques conhecidos
  };

  // Informações narrativas
  personality_traits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface InventoryItem {
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
}

// ============================================
// CAMPAIGNS
// ============================================

export async function createCampaign(
  masterUid: string,
  campaignData: Partial<Campaign>
): Promise<string> {
  const campaignRef = doc(collection(db, 'campaigns'));
  const campaign: Campaign = {
    master_uid: masterUid,
    players: [],
    context: {
      tone: 'epic',
      detail_level: 'medium',
      language: 'pt-BR',
    },
    created_at: Timestamp.now(),
    ...campaignData,
  };

  await setDoc(campaignRef, campaign);
  return campaignRef.id;
}

export async function getCampaign(campaignId: string): Promise<Campaign | null> {
  const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
  if (campaignDoc.exists()) {
    return campaignDoc.data() as Campaign;
  }
  return null;
}

export async function updateCampaign(
  campaignId: string,
  updates: Partial<Campaign>
): Promise<void> {
  await updateDoc(doc(db, 'campaigns', campaignId), updates);
}

export async function addPlayerToCampaign(
  campaignId: string,
  playerUid: string
): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (campaign && !campaign.players.includes(playerUid)) {
    await updateDoc(doc(db, 'campaigns', campaignId), {
      players: [...campaign.players, playerUid],
    });
  }
}

export async function removePlayerFromCampaign(
  campaignId: string,
  playerUid: string
): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (campaign) {
    await updateDoc(doc(db, 'campaigns', campaignId), {
      players: campaign.players.filter((uid) => uid !== playerUid),
    });
  }
}

export async function getUserCampaigns(uid: string, isMaster: boolean): Promise<any[]> {
  const campaignsRef = collection(db, 'campaigns');
  const q = isMaster
    ? query(campaignsRef, where('master_uid', '==', uid))
    : query(campaignsRef, where('players', 'array-contains', uid));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ============================================
// MESSAGES
// ============================================

export async function sendMessage(
  campaignId: string,
  message: Omit<Message, 'timestamp'>
): Promise<string> {
  const messagesRef = collection(db, 'campaigns', campaignId, 'messages');
  const fullMessage: Message = {
    ...message,
    timestamp: Timestamp.now(),
  };

  const messageDoc = await addDoc(messagesRef, fullMessage);

  // Atualiza last_session da campanha
  await updateDoc(doc(db, 'campaigns', campaignId), {
    last_session: Timestamp.now(),
  });

  return messageDoc.id;
}

export async function getCampaignMessages(
  campaignId: string,
  limitCount: number = 50
): Promise<any[]> {
  const messagesRef = collection(db, 'campaigns', campaignId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function deleteMessage(
  campaignId: string,
  messageId: string
): Promise<void> {
  await deleteDoc(doc(db, 'campaigns', campaignId, 'messages', messageId));
}

// ============================================
// CONTEXTS
// ============================================

export async function updateCampaignContext(
  campaignId: string,
  contextData: Partial<Context>
): Promise<void> {
  const contextRef = doc(db, 'contexts', campaignId);
  await setDoc(
    contextRef,
    {
      ...contextData,
      updated_at: Timestamp.now(),
    },
    { merge: true }
  );
}

export async function getCampaignContext(campaignId: string): Promise<Context | null> {
  const contextDoc = await getDoc(doc(db, 'contexts', campaignId));
  if (contextDoc.exists()) {
    return contextDoc.data() as Context;
  }
  return null;
}

export async function addEventToContext(
  campaignId: string,
  event: string
): Promise<void> {
  const context = await getCampaignContext(campaignId);
  const recentEvents = context?.recent_events || [];

  // Manter apenas os últimos 5 eventos
  const updatedEvents = [...recentEvents, event].slice(-5);

  await updateCampaignContext(campaignId, {
    recent_events: updatedEvents,
  });
}

// ============================================
// DICE ROLLING
// ============================================

export function rollDice(diceNotation: string): DiceRoll {
  // Parse notation like "2d6+3" or "d20"
  const match = diceNotation.match(/^(\d*)d(\d+)([+-]\d+)?$/i);

  if (!match) {
    throw new Error(`Invalid dice notation: ${diceNotation}`);
  }

  const numDice = parseInt(match[1] || '1');
  const numSides = parseInt(match[2]);
  const modifier = parseInt(match[3] || '0');

  const rolls: number[] = [];
  let total = 0;

  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * numSides) + 1;
    rolls.push(roll);
    total += roll;
  }

  const result = total + modifier;

  return {
    dice: diceNotation,
    modifier,
    result,
    rolls,
  };
}

// ============================================
// CHARACTER SHEETS
// ============================================

/**
 * Calcula o modificador de atributo D&D 5e
 */
export function calculateAttributeModifier(attributeValue: number): number {
  return Math.floor((attributeValue - 10) / 2);
}

/**
 * Calcula o bônus de proficiência baseado no level
 */
export function calculateProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

/**
 * Cria uma nova ficha de personagem
 */
export async function createCharacterSheet(
  playerUid: string,
  characterData: Partial<CharacterSheet>
): Promise<string> {
  try {
    const sheetRef = doc(collection(db, 'character_sheets'));

    const now = Timestamp.now();

    // Remove campos undefined para evitar erro do Firestore
    const cleanData: any = {
      player_uid: playerUid,
      name: characterData.name || 'Aventureiro',
      class: characterData.class || 'Guerreiro',
      race: characterData.race || 'Humano',
      level: characterData.level || 1,
      attributes: characterData.attributes || {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      hp: characterData.hp || {
        current: 10,
        max: 10,
        temporary: 0,
      },
      armor_class: characterData.armor_class || 10,
      proficiency_bonus: characterData.proficiency_bonus || 2,
      proficiencies: characterData.proficiencies || {
        armor: [],
        weapons: [],
        tools: [],
        languages: ['Comum'],
      },
      skills: characterData.skills || {},
      equipment: characterData.equipment || {
        inventory: [],
      },
      created_at: now,
      updated_at: now,
    };

    // Adiciona campos opcionais apenas se não forem undefined
    if (characterData.personality_traits) cleanData.personality_traits = characterData.personality_traits;
    if (characterData.ideals) cleanData.ideals = characterData.ideals;
    if (characterData.bonds) cleanData.bonds = characterData.bonds;
    if (characterData.flaws) cleanData.flaws = characterData.flaws;
    if (characterData.backstory) cleanData.backstory = characterData.backstory;
    if (characterData.campaign_id) cleanData.campaign_id = characterData.campaign_id;
    if (characterData.background) cleanData.background = characterData.background;
    if (characterData.alignment) cleanData.alignment = characterData.alignment;

    // Recalcula valores derivados
    cleanData.proficiency_bonus = calculateProficiencyBonus(cleanData.level);

    console.log("Salvando ficha no Firestore:", cleanData);
    await setDoc(sheetRef, cleanData);
    console.log("Ficha salva com sucesso! ID:", sheetRef.id);
    return sheetRef.id;
  } catch (error) {
    console.error("Erro em createCharacterSheet:", error);
    throw error;
  }
}

/**
 * Busca uma ficha de personagem por ID
 */
export async function getCharacterSheet(sheetId: string): Promise<(CharacterSheet & { id: string }) | null> {
  const sheetDoc = await getDoc(doc(db, 'character_sheets', sheetId));
  if (sheetDoc.exists()) {
    return { id: sheetDoc.id, ...sheetDoc.data() } as CharacterSheet & { id: string };
  }
  return null;
}

/**
 * Atualiza uma ficha de personagem
 */
export async function updateCharacterSheet(
  sheetId: string,
  updates: Partial<CharacterSheet>
): Promise<void> {
  await updateDoc(doc(db, 'character_sheets', sheetId), {
    ...updates,
    updated_at: Timestamp.now(),
  });
}

/**
 * Deleta uma ficha de personagem
 */
export async function deleteCharacterSheet(sheetId: string): Promise<void> {
  await deleteDoc(doc(db, 'character_sheets', sheetId));
}

/**
 * Busca todas as fichas de um jogador
 */
export async function getPlayerCharacterSheets(playerUid: string): Promise<(CharacterSheet & { id: string })[]> {
  const sheetsRef = collection(db, 'character_sheets');
  const q = query(sheetsRef, where('player_uid', '==', playerUid));

  const snapshot = await getDocs(q);
  const sheets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CharacterSheet & { id: string }));

  // Ordena por created_at no lado do cliente (mais recente primeiro)
  return sheets.sort((a, b) => {
    const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
    const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
    return timeB - timeA; // Ordem decrescente (mais recente primeiro)
  });
}

/**
 * Busca fichas de personagem de uma campanha
 */
export async function getCampaignCharacterSheets(campaignId: string): Promise<(CharacterSheet & { id: string })[]> {
  const sheetsRef = collection(db, 'character_sheets');
  const q = query(sheetsRef, where('campaign_id', '==', campaignId));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CharacterSheet & { id: string }));
}

/**
 * Vincula uma ficha a uma campanha
 */
export async function linkCharacterToCampaign(
  sheetId: string,
  campaignId: string
): Promise<void> {
  await updateDoc(doc(db, 'character_sheets', sheetId), {
    campaign_id: campaignId,
    updated_at: Timestamp.now(),
  });
}

/**
 * Remove vínculo de ficha com campanha
 */
export async function unlinkCharacterFromCampaign(sheetId: string): Promise<void> {
  await updateDoc(doc(db, 'character_sheets', sheetId), {
    campaign_id: null,
    updated_at: Timestamp.now(),
  });
}

/**
 * Atualiza HP de um personagem
 */
export async function updateCharacterHP(
  sheetId: string,
  current: number,
  temporary: number = 0
): Promise<void> {
  await updateDoc(doc(db, 'character_sheets', sheetId), {
    'hp.current': current,
    'hp.temporary': temporary,
    updated_at: Timestamp.now(),
  });
}

/**
 * Adiciona item ao inventário
 */
export async function addInventoryItem(
  sheetId: string,
  item: InventoryItem
): Promise<void> {
  const sheet = await getCharacterSheet(sheetId);
  if (!sheet) throw new Error('Ficha não encontrada');

  const updatedInventory = [...sheet.equipment.inventory, item];
  await updateDoc(doc(db, 'character_sheets', sheetId), {
    'equipment.inventory': updatedInventory,
    updated_at: Timestamp.now(),
  });
}

/**
 * Remove item do inventário
 */
export async function removeInventoryItem(
  sheetId: string,
  itemName: string
): Promise<void> {
  const sheet = await getCharacterSheet(sheetId);
  if (!sheet) throw new Error('Ficha não encontrada');

  const updatedInventory = sheet.equipment.inventory.filter(
    (item) => item.name !== itemName
  );

  await updateDoc(doc(db, 'character_sheets', sheetId), {
    'equipment.inventory': updatedInventory,
    updated_at: Timestamp.now(),
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

export { serverTimestamp, Timestamp };
