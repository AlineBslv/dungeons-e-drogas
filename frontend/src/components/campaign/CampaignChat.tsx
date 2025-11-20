'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GiDragonHead, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { FaPaperPlane, FaDiceD20, FaCircle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { sendMessage } from '@/lib/firestore-helpers';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSocket, OnlineUser } from '@/hooks/useSocket';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'mestre' | 'jogador';
  sender_uid: string;
  content: string;
  timestamp: Timestamp;
  type?: 'message' | 'dice_roll' | 'system';
  diceData?: {
    command: string;
    result: any;
    context?: string;
    characterName?: string;
  };
}

interface CampaignChatProps {
  campaignId: string;
  isMaster: boolean;
}

export function CampaignChat({ campaignId, isMaster }: CampaignChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection
  const {
    isConnected,
    connectionError,
    onlineUsers,
    typingUsers,
    joinCampaign,
    leaveCampaign,
    emitTyping,
    emitMessage,
    onMessage,
  } = useSocket({ campaignId, autoConnect: true });

  // Join campaign on mount
  useEffect(() => {
    if (campaignId && isConnected) {
      joinCampaign(campaignId);
      return () => {
        leaveCampaign(campaignId);
      };
    }
  }, [campaignId, isConnected]);

  // Load messages from Firestore
  useEffect(() => {
    if (!campaignId) return;

    const messagesRef = collection(db, 'campaigns', campaignId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [campaignId]);

  // Listen to WebSocket messages
  useEffect(() => {
    if (!campaignId) return;

    const cleanup = onMessage((data) => {
      // Message is already synced via Firestore, no need for notification
    });

    return cleanup;
  }, [campaignId, onMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    emitTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user || isSending) return;

    setIsSending(true);

    try {
      const message = {
        sender: isMaster ? ('mestre' as const) : ('jogador' as const),
        sender_uid: user.uid,
        content: messageInput.trim(),
        type: 'message' as const,
      };

      // Save to Firestore
      await sendMessage(campaignId, message);

      // Emit via WebSocket for real-time sync
      emitMessage(message);

      // Clear input
      setMessageInput('');
      emitTyping(false);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserName = (senderUid: string, sender: 'mestre' | 'jogador') => {
    if (senderUid === user?.uid) return 'Você';
    if (sender === 'mestre') return 'Mestre';
    const onlineUser = onlineUsers.find((u) => u.userId === senderUid);
    return onlineUser?.userName || 'Jogador';
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GiDragonHead className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-medieval text-lg text-foreground">Chat da Campanha</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isConnected ? (
                  <>
                    <FaCircle className="w-2 h-2 text-green-500 animate-pulse" />
                    <span>{onlineUsers.length} online</span>
                  </>
                ) : (
                  <>
                    <FaCircle className="w-2 h-2 text-red-500" />
                    <span>Desconectado</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Online Users */}
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-2">
              {onlineUsers.slice(0, 3).map((user) => (
                <Badge key={user.userId} variant="outline" className="text-xs">
                  {user.role === 'mestre' ? '👑' : '⚔️'} {user.userName}
                </Badge>
              ))}
              {onlineUsers.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{onlineUsers.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <GiDragonHead className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-lore">
                Nenhuma mensagem ainda. Inicie a conversa!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_uid === user?.uid;
              const userName = getUserName(message.sender_uid, message.sender);

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-primary/20 border border-primary/30'
                        : 'bg-dark-500/50 border border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medieval text-foreground">
                        {userName}
                      </span>
                      {message.sender === 'mestre' && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          Mestre
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>

                    {/* Mensagem de Texto */}
                    {message.type !== 'dice_roll' && message.content && (
                      <p className="text-sm font-lore text-foreground whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}

                    {/* Rolagem de Dados */}
                    {message.type === 'dice_roll' && message.diceData && (
                      <div className="flex items-center gap-3 bg-dark-500/30 p-2 rounded border border-primary/20">
                        <GiPerspectiveDiceSixFacesRandom className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground font-lore">
                            {message.diceData.command}
                          </p>
                          <p className="text-xl font-bold font-medieval text-primary">
                            {message.diceData.result.finalTotal}
                          </p>
                          {message.diceData.result.rolls && message.diceData.result.rolls.length > 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              [{message.diceData.result.rolls.join(', ')}]
                              {message.diceData.result.modifier !== 0 && ` ${message.diceData.result.modifier > 0 ? '+' : ''}${message.diceData.result.modifier}`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-muted-foreground font-lore"
            >
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>
                {typingUsers.map((u) => u.userName).join(', ')}{' '}
                {typingUsers.length === 1 ? 'está' : 'estão'} digitando...
              </span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem... (Enter para enviar)"
            disabled={isSending || !isConnected}
            className="min-h-[60px] max-h-[120px] resize-none bg-dark-500 border-border"
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending || !isConnected}
              variant="drogon"
              size="icon"
              className="h-[60px]"
            >
              <FaPaperPlane />
            </Button>
          </div>
        </div>
        {!isConnected && (
          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
            <p className="text-xs text-red-500 font-lore flex items-center gap-2">
              <FaCircle className="w-2 h-2 animate-pulse" />
              {connectionError || 'Desconectado. Tentando reconectar...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
