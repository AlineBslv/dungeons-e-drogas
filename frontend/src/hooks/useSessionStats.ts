/**
 * useSessionStats - Hook para atualizar estatísticas da sessão em tempo real
 * Monitora mensagens e rolagens de dados, atualizando automaticamente o Firestore
 */

import { useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateSessionStats } from '@/lib/firestore-helpers';

interface UseSessionStatsOptions {
  campaignId: string | undefined;
  sessionId: string | undefined;
  enabled?: boolean;
}

export function useSessionStats({ campaignId, sessionId, enabled = true }: UseSessionStatsOptions) {
  const messageCountRef = useRef(0);
  const diceRollCountRef = useRef(0);
  const activePlayersRef = useRef<Set<string>>(new Set());
  const lastUpdateRef = useRef(0);
  const sessionStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!campaignId || !sessionId || !enabled) {
      console.log('[useSessionStats] Desabilitado:', { campaignId, sessionId, enabled });
      return;
    }

    console.log('[useSessionStats] Iniciando tracking para sessão:', sessionId);

    // Marca o início da sessão para filtrar apenas mensagens novas
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now();
    }

    // Listener para mensagens da campanha
    const messagesRef = collection(db, 'campaigns', campaignId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      let newMessageCount = 0;
      let newDiceRollCount = 0;
      const newActivePlayers = new Set<string>();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();

        // Conta apenas mensagens (exclui Drogon para stats de jogadores)
        if (data.sender !== 'drogon') {
          newMessageCount++;
        }

        // Conta rolagens de dados
        if (data.type === 'dice_roll' || data.diceData || data.roll_data) {
          newDiceRollCount++;
        }

        // Rastreia jogadores ativos (apenas humanos, não Drogon)
        if (data.player_uid && data.sender !== 'drogon') {
          newActivePlayers.add(data.player_uid);
        }
      });

      console.log('[useSessionStats] Snapshot:', {
        messages: newMessageCount,
        diceRolls: newDiceRollCount,
        activePlayers: newActivePlayers.size,
      });

      // Só atualiza se houver mudanças
      const hasChanges =
        messageCountRef.current !== newMessageCount ||
        diceRollCountRef.current !== newDiceRollCount ||
        activePlayersRef.current.size !== newActivePlayers.size;

      if (hasChanges) {
        messageCountRef.current = newMessageCount;
        diceRollCountRef.current = newDiceRollCount;
        activePlayersRef.current = newActivePlayers;

        // Throttle reduzido: atualiza no máximo a cada 2 segundos
        const now = Date.now();
        if (now - lastUpdateRef.current > 2000) {
          lastUpdateRef.current = now;

          console.log('[useSessionStats] Atualizando Firestore:', {
            sessionId,
            messages_count: newMessageCount,
            dice_rolls_count: newDiceRollCount,
            players_active: Array.from(newActivePlayers),
          });

          updateSessionStats(sessionId, {
            messages_count: newMessageCount,
            dice_rolls_count: newDiceRollCount,
            players_active: Array.from(newActivePlayers),
          }).catch((error) => {
            console.error('[useSessionStats] Erro ao atualizar:', error);
          });
        }
      }
    });

    return () => {
      console.log('[useSessionStats] Cleanup para sessão:', sessionId);
      unsubscribeMessages();

      // Atualização final ao desmontar
      if (messageCountRef.current > 0) {
        console.log('[useSessionStats] Atualização final:', {
          messages: messageCountRef.current,
          diceRolls: diceRollCountRef.current,
          players: activePlayersRef.current.size,
        });

        updateSessionStats(sessionId, {
          messages_count: messageCountRef.current,
          dice_rolls_count: diceRollCountRef.current,
          players_active: Array.from(activePlayersRef.current),
        }).catch((error) => {
          console.error('[useSessionStats] Erro na atualização final:', error);
        });
      }
    };
  }, [campaignId, sessionId, enabled]);

  return {
    messageCount: messageCountRef.current,
    diceRollCount: diceRollCountRef.current,
    activePlayersCount: activePlayersRef.current.size,
  };
}
