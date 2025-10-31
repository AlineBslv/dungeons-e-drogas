'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { sendMessage } from '@/lib/firestore-helpers';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { GiDragonHead } from 'react-icons/gi';
import { FaCog, FaPlus, FaDownload, FaCopy, FaCircle } from 'react-icons/fa';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import CampaignSidebar from '@/components/chat/CampaignSidebar';
import OnlineUsersList from '@/components/chat/OnlineUsersList';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { exportSessionAsMarkdown, exportSessionAsText, copySessionToClipboard } from '@/lib/export-helpers';
import { ContextPanel } from '@/components/app/context-panel';
import GlobalDiceButton from '@/components/dice/GlobalDiceButton';
import { DiceResult, rollDice } from '@/lib/dice-helpers';
import { toast } from 'sonner';
import { MasterSessionPanel } from '@/components/app/master-session-panel';
import { useSessionStats } from '@/hooks/useSessionStats';
import { useSocket } from '@/hooks/useSocket';
import { ContextControlPanel } from '@/components/app/context-control-panel';
import { ContextPreviewPanel } from '@/components/app/context-preview-panel';
import { ContextSyncListener } from '@/components/app/context-sync-listener';

interface Message {
  id: string;
  sender: 'mestre' | 'drogon' | 'jogador';
  content: string;
  timestamp: string | Timestamp;
  type?: 'message' | 'dice_roll';
  audience?: 'all' | 'master_only';  // Novo: controla visibilidade
  diceData?: {
    command: string;
    result: DiceResult;
    context?: string;
    characterName?: string;
  };
}

export default function ChatPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { currentCampaign, loading: campaignLoading } = useCampaign();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSessionPanel, setShowSessionPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook de tracking automático de estatísticas da sessão
  useSessionStats({
    campaignId: currentCampaign?.id,
    sessionId: currentCampaign?.current_session,
    enabled: userProfile?.tier === 'mestre',
  });

  // Hook WebSocket para multiplayer
  const {
    isConnected,
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
  } = useSocket({ campaignId: currentCampaign?.id, autoConnect: true });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);


  // Sincronização em tempo real de mensagens
  useEffect(() => {
    if (!currentCampaign || !userProfile) return;

    const messagesRef = collection(db, 'campaigns', currentCampaign.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp instanceof Timestamp
          ? doc.data().timestamp.toDate().toISOString()
          : doc.data().timestamp,
      })) as Message[];

      // Filtrar mensagens do Drogon para jogadores
      const filteredMessages = messagesData.filter((message) => {
        // Se for jogador e a mensagem é apenas para mestre, não mostrar
        if (userProfile.tier === 'jogador' && message.audience === 'master_only') {
          return false;
        }
        return true;
      });

      setMessages(filteredMessages);
    });

    return () => unsubscribe();
  }, [currentCampaign, userProfile]);

  // TODO: Estas funções serão usadas quando o CampaignSidebar for refatorado
  // para suportar criação e deleção de campanhas

  const handleExportMarkdown = () => {
    if (!currentCampaign) return;
    exportSessionAsMarkdown(currentCampaign, messages);
  };

  const handleExportText = () => {
    if (!currentCampaign) return;
    exportSessionAsText(currentCampaign, messages);
  };

  const handleCopyToClipboard = async () => {
    if (!currentCampaign) return;
    const success = await copySessionToClipboard(currentCampaign, messages);
    if (success) {
      toast.success('Sessão copiada para a área de transferência!');
    } else {
      toast.error('Erro ao copiar sessão');
    }
  };

  // WebSocket: Join/Leave campaign
  useEffect(() => {
    if (currentCampaign?.id && isConnected) {
      joinCampaign(currentCampaign.id);
      return () => {
        leaveCampaign(currentCampaign.id);
      };
    }
  }, [currentCampaign?.id, isConnected]);

  // WebSocket: Listen to real-time events
  useEffect(() => {
    if (!currentCampaign?.id) return;

    // Listener para dice rolls
    const cleanupDiceRoll = onDiceRoll((data) => {
      toast.success(`${data.userName} rolou dados!`);
    });

    // Listener para mensagens de Drogon
    const cleanupDrogon = onDrogonMessage((data) => {
      setIsTyping(false);
      toast.info('Drogon respondeu!');
    });

    return () => {
      cleanupDiceRoll?.();
      cleanupDrogon?.();
    };
  }, [currentCampaign?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleDiceRoll = async (command: string) => {
    if (!currentCampaign) {
      toast.error('Selecione ou crie uma campanha primeiro');
      return;
    }

    try {
      // Rola os dados via API
      const response = await rollDice(command, {
        campaignId: currentCampaign.id,
        userId: user?.uid,
        characterName: user?.displayName || userProfile?.tier === 'mestre' ? 'Mestre' : 'Jogador',
        context: 'Rolagem via chat',
      });

      // Emite evento WebSocket para sincronização instantânea
      emitDiceRoll({
        command,
        result: response.result,
        characterName: user?.displayName || userProfile?.tier === 'mestre' ? 'Mestre' : 'Jogador',
      });

      // Salva rolagem no Firestore (visível para todos)
      await sendMessage(currentCampaign.id, {
        sender: userProfile?.tier === 'mestre' ? 'mestre' : 'jogador',
        content: '',
        type: 'dice_roll',
        player_uid: user?.uid, // Adiciona UID para tracking de stats
        audience: 'all', // Rolagens de dados são visíveis para todos
        diceData: {
          command,
          result: response.result,
          characterName: user?.displayName || userProfile?.tier === 'mestre' ? 'Mestre' : 'Jogador',
          context: 'Rolagem via chat',
        },
      });
    } catch (error) {
      console.error('Erro ao rolar dados:', error);
      toast.error('Erro ao rolar dados. Verifique o comando e tente novamente.');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentCampaign) {
      if (!currentCampaign) {
        toast.error('Selecione ou crie uma campanha primeiro');
      }
      return;
    }

    setIsTyping(true);

    try {
      // Salva mensagem do mestre no Firestore (visível para todos)
      await sendMessage(currentCampaign.id, {
        sender: 'mestre',
        content,
        player_uid: user?.uid, // Adiciona UID para tracking de stats
        audience: 'all', // Mensagens do mestre são visíveis para todos
      });

      // Emite evento WebSocket que Drogon está processando
      emitDrogonThinking();

      // Chama API do Gemini
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: currentCampaign.context,
          history: messages.map((m) => ({
            role: m.sender === 'mestre' ? 'user' : 'model',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();

      // Salva resposta do Drogon no Firestore (APENAS PARA MESTRE)
      await sendMessage(currentCampaign.id, {
        sender: 'drogon',
        content: data.message,
        audience: 'master_only', // Jogadores NÃO veem mensagens do Drogon
      });

      // Emite resposta via WebSocket para outros usuários
      emitDrogonResponse(data.message);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsTyping(false);
    }
  };

  if (authLoading || campaignLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GiDragonHead className="w-20 h-20 text-primary mx-auto mb-4 animate-pulse text-glow-gold" />
          <p className="text-muted-foreground font-lore">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar com lista de campanhas */}
      <CampaignSidebar />

      {/* Área principal do chat */}
      {!currentCampaign ? (
        // Estado vazio - nenhuma campanha selecionada
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <GiDragonHead className="w-32 h-32 text-primary/30 mx-auto mb-6 animate-pulse text-glow-gold" />
            <h2 className="text-3xl font-bold text-metallic-gold mb-3 font-medieval">
              Bem-vindo ao Chat com Drogon
            </h2>
            <p className="text-muted-foreground font-lore mb-6">
              Selecione uma campanha na barra lateral ou crie uma nova para começar sua aventura épica!
            </p>
            <Button
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              size="lg"
              variant="drogon"
              className="font-medieval"
            >
              <FaPlus className="mr-2 w-5 h-5" />
              Iniciar Campanha
            </Button>
          </div>
        </div>
      ) : (
        // Chat ativo
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header do Chat */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border p-4"
          >
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <GiDragonHead className="w-10 h-10 text-primary text-glow-gold flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold font-medieval text-metallic-gold truncate">
                    {currentCampaign.title || 'Chat com Drogon'}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-lore">
                    <span>Tom: {currentCampaign.context.tone} • Detalhe: {currentCampaign.context.detail_level}</span>
                    {isConnected && (
                      <div className="flex items-center gap-1 text-green-500">
                        <FaCircle className="w-2 h-2 animate-pulse" />
                        <span>{onlineUsers.length} online</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Botão Controle de Sessão (apenas Mestre) */}
                {userProfile?.tier === 'mestre' && (
                  <Button
                    onClick={() => setShowSessionPanel(!showSessionPanel)}
                    variant="ghost"
                    size="icon"
                    title="Controle de Sessão"
                  >
                    <FaPlus className={`w-5 h-5 transition-transform ${showSessionPanel ? 'rotate-45' : ''}`} />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={messages.length === 0}
                    >
                      <FaDownload className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-gold-500/40 font-lore">
                    <DropdownMenuItem onClick={handleExportMarkdown} className="cursor-pointer">
                      <FaDownload className="w-4 h-4 mr-2" />
                      Exportar Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportText} className="cursor-pointer">
                      <FaDownload className="w-4 h-4 mr-2" />
                      Exportar Texto
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyToClipboard} className="cursor-pointer">
                      <FaCopy className="w-4 h-4 mr-2" />
                      Copiar Sessão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  size="icon"
                >
                  <FaCog className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Layout com Sidebar Direita Opcional */}
          <div className="flex-1 flex overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-5xl mx-auto space-y-4">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <GiDragonHead className="w-24 h-24 text-primary/30 mx-auto mb-4 text-glow-gold" />
                  <h2 className="text-2xl font-bold text-muted-foreground mb-2 font-medieval">
                    Comece sua Aventura
                  </h2>
                  <p className="text-muted-foreground/70 font-lore">
                    Faça uma pergunta ou descreva uma cena para Drogon narrar
                  </p>
                </motion.div>
              )}

              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  sender={message.sender}
                  content={message.content}
                  timestamp={message.timestamp}
                  type={message.type}
                  audience={message.audience}  // Passa controle de visibilidade
                  diceData={message.diceData}
                />
              ))}

                {/* Indicadores de usuários digitando */}
                <AnimatePresence>
                  {typingUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex flex-col gap-2"
                    >
                      {typingUsers.map((user) => (
                        <motion.div
                          key={user.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 bg-accent/20 rounded-lg border border-accent/30"
                        >
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ y: [0, -8, 0] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 0.6,
                                  delay: i * 0.15,
                                }}
                                className="w-1.5 h-1.5 bg-primary rounded-full"
                              />
                            ))}
                          </div>
                          <span className="font-lore">{user.userName} está digitando...</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Sidebar Direita Condicional */}
            <AnimatePresence>
              {(showSettings || showSessionPanel) && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 384, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-l border-border bg-card/80 backdrop-blur-md overflow-hidden"
                >
                  <div className="w-96 h-full overflow-y-auto p-4 space-y-4">
                    {/* Lista de Usuários Online */}
                    {onlineUsers.length > 0 && (
                      <OnlineUsersList users={onlineUsers} />
                    )}

                    {/* Session Panel (apenas Mestre) */}
                    {userProfile?.tier === 'mestre' && showSessionPanel && (
                      <div className="mb-4">
                        <MasterSessionPanel />
                      </div>
                    )}

                    {/* Context Control Panel (apenas Mestre) */}
                    {userProfile?.tier === 'mestre' && showSettings && (
                      <div className="mb-4">
                        <ContextControlPanel />
                      </div>
                    )}

                    {/* Context Panel (Settings) */}
                    {showSettings && <ContextPanel />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="sticky bottom-0 bg-card/80 backdrop-blur-md border-t border-border p-4">
            <div className="max-w-5xl mx-auto">
              <ChatInput
                onSendMessage={handleSendMessage}
                onDiceRoll={handleDiceRoll}
                onTyping={emitTyping}  // Conecta typing indicator ao Socket.io
                disabled={isTyping}
              />
            </div>
          </div>

          {/* Botão Flutuante de Dados Global */}
          <GlobalDiceButton />

          {/* Preview Panel de Context Updates */}
          <ContextPreviewPanel />

          {/* Listener de Sincronização de Contexto */}
          <ContextSyncListener />
        </main>
      )}
    </div>
  );
}
