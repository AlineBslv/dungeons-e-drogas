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

// Conversation - Chat individual com Drogon
export interface Conversation {
  user_uid: string;
  title?: string;
  created_at: Timestamp;
  last_message_at: Timestamp;
  context: ConversationContext;
  tags?: string[];
  message_count?: number;
}

export interface ConversationContext {
  tone: 'epic' | 'casual' | 'horror' | 'dark' | 'comic' | 'neutral' | 'mystical';
  detail_level: 'low' | 'medium' | 'high';
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

export interface ConversationMessage {
  sender: 'user' | 'drogon';
  content: string;
  timestamp: Timestamp;
  type?: 'message' | 'dice_roll';
  roll_data?: DiceRoll;
}

// Campaign - Multiplayer com Mestre e Jogadores
export interface Campaign {
  master_uid: string;
  title: string; // OBRIGATÓRIO
  description?: string;
  players: string[];
  invite_code?: string;
  status: 'active' | 'paused' | 'archived';
  created_at: Timestamp;
  last_session?: Timestamp;
  current_session?: string;
  context: CampaignContext;
  settings: CampaignSettings;
}

export interface CampaignSettings {
  allow_player_invites: boolean;
  require_character_sheet: boolean;
  max_players: number;
}

export interface Session {
  campaign_id: string;
  master_uid: string;
  status: 'active' | 'paused' | 'ended';
  started_at: Timestamp;
  paused_at?: Timestamp;
  ended_at?: Timestamp;
  total_duration: number; // em segundos
  pause_duration: number; // em segundos
  stats: {
    messages_count: number;
    dice_rolls_count: number;
    players_active: string[]; // UIDs dos jogadores que participaram
  };
  notes?: string; // Notas do mestre sobre a sessão
}

export interface CampaignContext {
  tone: 'epic' | 'casual' | 'horror' | 'dark' | 'comic' | 'neutral' | 'mystical';
  detail_level: 'low' | 'medium' | 'high';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  style?: string;
}

export interface Message {
  sender: 'mestre' | 'jogador' | 'drogon';
  sender_uid?: string;
  content: string;
  timestamp: Timestamp;
  type?: 'message' | 'dice_roll' | 'character_action';
  audience?: 'all' | 'master_only';
  roll_data?: DiceRoll;
  diceData?: {
    command: string;
    result: any;
    context?: string;
    characterName?: string;
  };
  characterAction?: {
    characterId: string;
    characterName: string;
    characterClass: string;
    action: any;
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
  title: string,
  campaignData: Partial<Campaign>
): Promise<string> {
  const campaignRef = doc(collection(db, 'campaigns'));

  // Gera código de convite único
  const inviteCode = generateInviteCode();

  const campaign: Campaign = {
    master_uid: masterUid,
    title,
    description: campaignData.description,
    players: [],
    invite_code: inviteCode,
    status: 'active',
    created_at: Timestamp.now(),
    context: {
      tone: campaignData.context?.tone || 'epic',
      detail_level: campaignData.context?.detail_level || 'medium',
      language: campaignData.context?.language || 'pt-BR',
      style: campaignData.context?.style || 'sandbox',
    },
    settings: {
      allow_player_invites: campaignData.settings?.allow_player_invites ?? true,
      require_character_sheet: campaignData.settings?.require_character_sheet ?? false,
      max_players: campaignData.settings?.max_players || 6,
    },
  };

  await setDoc(campaignRef, campaign);
  return campaignRef.id;
}

/**
 * Gera um código de convite único para campanha
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem O, I, 0, 1
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) code += '-'; // Formato: XXXX-XXXX
  }
  return code;
}

/**
 * Busca campanha por código de convite
 */
export async function getCampaignByInviteCode(inviteCode: string): Promise<(Campaign & { id: string }) | null> {
  const campaignsRef = collection(db, 'campaigns');
  const q = query(campaignsRef, where('invite_code', '==', inviteCode.toUpperCase()), limit(1));

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Campaign & { id: string };
  }
  return null;
}

/**
 * Jogador entra em uma campanha via código de convite
 */
export async function joinCampaignByCode(inviteCode: string, playerUid: string): Promise<string> {
  try {
    const campaign = await getCampaignByInviteCode(inviteCode);

    if (!campaign) {
      throw new Error('Código de convite inválido');
    }

    if (campaign.status !== 'active') {
      throw new Error('Esta campanha não está ativa');
    }

    // Garante que settings existe (compatibilidade com campanhas antigas)
    const maxPlayers = campaign.settings?.max_players || 6;

    if (campaign.players.length >= maxPlayers) {
      throw new Error('Campanha está cheia');
    }

    if (campaign.players.includes(playerUid)) {
      throw new Error('Você já está nesta campanha');
    }

    if (campaign.master_uid === playerUid) {
      throw new Error('Você é o mestre desta campanha');
    }

    // Adiciona jogador
    await addPlayerToCampaign(campaign.id, playerUid);

    return campaign.id;
  } catch (error: any) {
    console.error('Error in joinCampaignByCode:', error);
    // Se é uma mensagem conhecida, repassa
    if (error.message && error.message.includes('convite')) {
      throw error;
    }
    if (error.message && error.message.includes('campanha')) {
      throw error;
    }
    // Caso contrário, verifica se é erro de permissão
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      throw new Error('Erro de permissão. Verifique se você está autenticado.');
    }
    throw new Error('Erro ao entrar na campanha. Tente novamente.');
  }
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

export async function deleteCampaign(campaignId: string): Promise<void> {
  await deleteDoc(doc(db, 'campaigns', campaignId));
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

  // Atualiza last_session da campanha (apenas se for mestre)
  try {
    await updateDoc(doc(db, 'campaigns', campaignId), {
      last_session: Timestamp.now(),
    });
  } catch (error) {
    // Ignora erro de permissão - jogador não pode atualizar campanha
    console.log('Note: Could not update last_session (player permissions)');
  }

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

// ============================================
// SESSIONS
// ============================================

/**
 * Inicia uma nova sessão de jogo
 */
export async function startSession(campaignId: string, masterUid: string): Promise<string> {
  const sessionRef = doc(collection(db, 'sessions'));
  const session: Session = {
    campaign_id: campaignId,
    master_uid: masterUid,
    status: 'active',
    started_at: Timestamp.now(),
    total_duration: 0,
    pause_duration: 0,
    stats: {
      messages_count: 0,
      dice_rolls_count: 0,
      players_active: [],
    },
  };

  await setDoc(sessionRef, session);

  // Atualiza campanha com sessão atual
  await updateDoc(doc(db, 'campaigns', campaignId), {
    current_session: sessionRef.id,
    last_session: Timestamp.now(),
  });

  return sessionRef.id;
}

/**
 * Pausa uma sessão ativa
 */
export async function pauseSession(sessionId: string): Promise<void> {
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
  if (!sessionDoc.exists()) throw new Error('Sessão não encontrada');

  const session = sessionDoc.data() as Session;
  if (session.status !== 'active') throw new Error('Sessão não está ativa');

  await updateDoc(doc(db, 'sessions', sessionId), {
    status: 'paused',
    paused_at: Timestamp.now(),
  });
}

/**
 * Resume uma sessão pausada
 */
export async function resumeSession(sessionId: string): Promise<void> {
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
  if (!sessionDoc.exists()) throw new Error('Sessão não encontrada');

  const session = sessionDoc.data() as Session;
  if (session.status !== 'paused') throw new Error('Sessão não está pausada');

  const pauseDuration = Math.floor(
    (Date.now() - (session.paused_at?.toMillis() || 0)) / 1000
  );

  await updateDoc(doc(db, 'sessions', sessionId), {
    status: 'active',
    pause_duration: session.pause_duration + pauseDuration,
    paused_at: null,
  });
}

/**
 * Encerra uma sessão
 */
export async function endSession(sessionId: string, notes?: string): Promise<void> {
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
  if (!sessionDoc.exists()) throw new Error('Sessão não encontrada');

  const session = sessionDoc.data() as Session;
  const now = Timestamp.now();

  // Calcula duração total
  let totalDuration = Math.floor((now.toMillis() - session.started_at.toMillis()) / 1000);

  // Se estava pausada, adiciona a última pausa
  if (session.status === 'paused' && session.paused_at) {
    const lastPauseDuration = Math.floor((now.toMillis() - session.paused_at.toMillis()) / 1000);
    totalDuration = session.total_duration + (totalDuration - session.pause_duration - lastPauseDuration);
  }

  const updates: any = {
    status: 'ended',
    ended_at: now,
    total_duration: totalDuration,
  };

  if (notes) updates.notes = notes;

  await updateDoc(doc(db, 'sessions', sessionId), updates);

  // Remove sessão atual da campanha
  await updateDoc(doc(db, 'campaigns', session.campaign_id), {
    current_session: null,
  });
}

/**
 * Busca sessão por ID
 */
export async function getSession(sessionId: string): Promise<(Session & { id: string }) | null> {
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
  if (sessionDoc.exists()) {
    return { id: sessionDoc.id, ...sessionDoc.data() } as Session & { id: string };
  }
  return null;
}

/**
 * Busca todas as sessões de uma campanha
 */
export async function getCampaignSessions(campaignId: string): Promise<(Session & { id: string })[]> {
  const sessionsRef = collection(db, 'sessions');
  const q = query(
    sessionsRef,
    where('campaign_id', '==', campaignId),
    orderBy('started_at', 'desc'),
    limit(20)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Session & { id: string }));
}

/**
 * Atualiza estatísticas da sessão
 */
export async function updateSessionStats(
  sessionId: string,
  updates: Partial<Session['stats']>
): Promise<void> {
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
  if (!sessionDoc.exists()) return;

  const session = sessionDoc.data() as Session;
  await updateDoc(doc(db, 'sessions', sessionId), {
    'stats.messages_count': updates.messages_count ?? session.stats.messages_count,
    'stats.dice_rolls_count': updates.dice_rolls_count ?? session.stats.dice_rolls_count,
    'stats.players_active': updates.players_active ?? session.stats.players_active,
  });
}

/**
 * Formata duração em formato legível (HH:MM:SS)
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
}

// ============================================
// CONVERSATIONS (Chat Individual com Drogon)
// ============================================

/**
 * Cria uma nova conversa individual com Drogon
 */
export async function createConversation(
  userUid: string,
  title?: string,
  context?: Partial<ConversationContext>
): Promise<string> {
  const conversationRef = doc(collection(db, 'conversations'));
  const conversation: Conversation = {
    user_uid: userUid,
    title,
    created_at: Timestamp.now(),
    last_message_at: Timestamp.now(),
    context: {
      tone: context?.tone || 'casual',
      detail_level: context?.detail_level || 'medium',
      language: context?.language || 'pt-BR',
    },
    message_count: 0,
  };

  await setDoc(conversationRef, conversation);
  return conversationRef.id;
}

/**
 * Busca todas as conversas de um usuário
 */
export async function getUserConversations(userUid: string): Promise<(Conversation & { id: string })[]> {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('user_uid', '==', userUid),
    orderBy('last_message_at', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Conversation & { id: string }));
}

/**
 * Busca uma conversa por ID
 */
export async function getConversation(conversationId: string): Promise<(Conversation & { id: string }) | null> {
  const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
  if (conversationDoc.exists()) {
    return { id: conversationDoc.id, ...conversationDoc.data() } as Conversation & { id: string };
  }
  return null;
}

/**
 * Envia mensagem em uma conversa individual
 */
export async function sendConversationMessage(
  conversationId: string,
  message: Omit<ConversationMessage, 'timestamp'>
): Promise<string> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const fullMessage: ConversationMessage = {
    ...message,
    timestamp: Timestamp.now(),
  };

  const messageDoc = await addDoc(messagesRef, fullMessage);

  // Atualiza last_message_at e message_count
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnap = await getDoc(conversationRef);
  const currentCount = conversationSnap.data()?.message_count || 0;

  await updateDoc(conversationRef, {
    last_message_at: Timestamp.now(),
    message_count: currentCount + 1,
  });

  return messageDoc.id;
}

/**
 * Busca mensagens de uma conversa
 */
export async function getConversationMessages(
  conversationId: string,
  limitCount: number = 100
): Promise<any[]> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Atualiza contexto de uma conversa
 */
export async function updateConversationContext(
  conversationId: string,
  context: Partial<ConversationContext>
): Promise<void> {
  await updateDoc(doc(db, 'conversations', conversationId), {
    context,
  });
}

/**
 * Deleta uma conversa e todas suas mensagens
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  // Deleta todas as mensagens primeiro
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const messagesSnapshot = await getDocs(messagesRef);

  const deletePromises = messagesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Deleta a conversa
  await deleteDoc(doc(db, 'conversations', conversationId));
}
