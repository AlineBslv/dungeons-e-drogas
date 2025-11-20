/**
 * useSocket Hook - Dungeons e Drogas
 * Hook customizado para gerenciar conexões WebSocket
 */

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { getSocketConfig } from '@/lib/socket-config';

export interface OnlineUser {
  userId: string;
  userName: string;
  role: 'mestre' | 'jogador';
}

export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface DiceRollEvent {
  userId: string;
  userName: string;
  role: 'mestre' | 'jogador';
  diceData: any;
  timestamp: string;
}

export interface MessageEvent {
  userId: string;
  timestamp: string;
  [key: string]: any;
}

interface UseSocketOptions {
  campaignId?: string | null;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  joinCampaign: (campaignId: string) => void;
  leaveCampaign: (campaignId: string) => void;
  emitTyping: (isTyping: boolean) => void;
  emitDiceRoll: (diceData: any) => void;
  emitMessage: (message: any) => void;
  emitDrogonThinking: () => void;
  emitDrogonResponse: (message: string) => void;
  onDiceRoll: (callback: (data: DiceRollEvent) => void) => (() => void) | undefined;
  onMessage: (callback: (data: MessageEvent) => void) => (() => void) | undefined;
  onDrogonMessage: (callback: (data: any) => void) => (() => void) | undefined;
  onSessionEvent: (event: string, callback: (data: any) => void) => (() => void) | undefined;
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { campaignId, autoConnect = true } = options;
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  /**
   * Inicializa conexão Socket.io
   */
  useEffect(() => {
    if (!user || !autoConnect) {
      console.log('⚠️ Socket init skipped:', { user: !!user, autoConnect });
      return;
    }

    const initSocket = async () => {
      try {
        // Obtém token Firebase
        const token = await user.getIdToken();
        console.log('✅ Firebase token obtained:', token.substring(0, 20) + '...');

        // Cria conexão Socket.io com configurações centralizadas
        const socketConfig = getSocketConfig(token);
        console.log('🔌 Initializing socket connection to:', socketConfig.url);

        const socket = io(socketConfig.url, socketConfig);

        console.log('🔌 Socket.io client created');
        socketRef.current = socket;

        // Event: Connected
        socket.on('connect', () => {
          console.log('✅ Socket connected:', socket.id);
          setIsConnected(true);
          setConnectionError(null);

          // Auto-join campaign se fornecido
          if (campaignId) {
            joinCampaign(campaignId);
          }
        });

        // Event: Disconnected
        socket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason);
          setIsConnected(false);
        });

        // Event: Error
        socket.on('error', (error) => {
          console.error('❌ Socket error:', error);
        });

        // Event: Join success
        socket.on('join:success', (data) => {
          console.log('📥 Joined campaign:', data);
          setOnlineUsers(data.onlineUsers || []);
        });

        // Event: Presence update
        socket.on('presence:update', (data) => {
          console.log('👥 Presence update:', data.onlineUsers);
          setOnlineUsers(data.onlineUsers || []);
        });

        // Event: Typing indicator
        socket.on('typing:user', (data: TypingUser) => {
          setTypingUsers((prev) => {
            const filtered = prev.filter((u) => u.userId !== data.userId);
            return data.isTyping ? [...filtered, data] : filtered;
          });
        });

        // Event: Connection error
        socket.on('connect_error', (error) => {
          console.error('❌ Connection error:', error.message);
          console.error('📍 Tentando conectar em:', socketConfig.url);
          console.error('🌍 Ambiente:', process.env.NODE_ENV || 'development');

          const errorMessage = process.env.NODE_ENV === 'production'
            ? 'Servidor temporariamente indisponível. Reconectando...'
            : 'Servidor offline. Verifique se o backend está rodando.';

          setIsConnected(false);
          setConnectionError(errorMessage);
        });

        // Event: Reconnect attempt
        socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔄 Tentativa de reconexão #${attemptNumber}...`);
        });

        // Event: Reconnect success
        socket.on('reconnect', (attemptNumber) => {
          console.log(`✅ Reconectado com sucesso após ${attemptNumber} tentativas`);
          setIsConnected(true);
          if (campaignId) {
            joinCampaign(campaignId);
          }
        });
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initSocket();

    // Cleanup
    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, autoConnect]); // Removido campaignId das deps para evitar reconexões

  /**
   * Entra em uma campanha
   */
  const joinCampaign = (campaignId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join:campaign', { campaignId });
    }
  };

  /**
   * Sai de uma campanha
   */
  const leaveCampaign = (campaignId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave:campaign', { campaignId });
      setOnlineUsers([]);
    }
  };

  /**
   * Emite evento de digitação
   */
  const emitTyping = (isTyping: boolean) => {
    if (socketRef.current?.connected && campaignId) {
      const event = isTyping ? 'typing:start' : 'typing:stop';
      socketRef.current.emit(event, { campaignId });
    }
  };

  /**
   * Emite evento de rolagem de dados
   */
  const emitDiceRoll = (diceData: any) => {
    if (socketRef.current?.connected && campaignId) {
      socketRef.current.emit('dice:roll', { campaignId, diceData });
    }
  };

  /**
   * Emite nova mensagem
   */
  const emitMessage = (message: any) => {
    if (socketRef.current?.connected && campaignId) {
      socketRef.current.emit('message:send', { campaignId, message });
    }
  };

  /**
   * Emite que Drogon está pensando
   */
  const emitDrogonThinking = () => {
    if (socketRef.current?.connected && campaignId) {
      socketRef.current.emit('drogon:thinking', { campaignId });
    }
  };

  /**
   * Emite resposta de Drogon
   */
  const emitDrogonResponse = (message: string) => {
    if (socketRef.current?.connected && campaignId) {
      socketRef.current.emit('drogon:response', { campaignId, message });
    }
  };

  /**
   * Listener para rolagem de dados
   */
  const onDiceRoll = (callback: (data: DiceRollEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('dice:rolled', callback);
      return () => {
        socketRef.current?.off('dice:rolled', callback);
      };
    }
  };

  /**
   * Listener para nova mensagem
   */
  const onMessage = (callback: (data: MessageEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message:new', callback);
      return () => {
        socketRef.current?.off('message:new', callback);
      };
    }
  };

  /**
   * Listener para mensagem de Drogon
   */
  const onDrogonMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('drogon:message', callback);
      return () => {
        socketRef.current?.off('drogon:message', callback);
      };
    }
  };

  /**
   * Listener para eventos de sessão
   */
  const onSessionEvent = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => {
        socketRef.current?.off(event, callback);
      };
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    onlineUsers,
    typingUsers,
    joinCampaign,
    leaveCampaign,
    emitTyping,
    emitDiceRoll,
    emitMessage,
    emitDrogonThinking,
    emitDrogonResponse,
    onDiceRoll,
    onMessage,
    onDrogonMessage,
    onSessionEvent,
  };
}
