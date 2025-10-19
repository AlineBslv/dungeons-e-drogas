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
  language: 'pt-BR' | 'en-US';
  style?: string;
}

export interface Message {
  sender: 'mestre' | 'jogador' | 'drogon';
  content: string;
  timestamp: Timestamp;
  roll_data?: DiceRoll;
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
// UTILITY FUNCTIONS
// ============================================

export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

export { serverTimestamp, Timestamp };
