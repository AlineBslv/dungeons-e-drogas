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
import { FaArrowLeft, FaCog, FaPlus, FaDownload, FaCopy } from 'react-icons/fa';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { exportSessionAsMarkdown, exportSessionAsText, copySessionToClipboard } from '@/lib/export-helpers';
import { ContextPanel } from '@/components/app/context-panel';
import GlobalDiceButton from '@/components/dice/GlobalDiceButton';
import { DiceResult, rollDice } from '@/lib/dice-helpers';

interface Message {
  id: string;
  sender: 'mestre' | 'drogon' | 'jogador';
  content: string;
  timestamp: string | Timestamp;
  type?: 'message' | 'dice_roll';
  diceData?: {
    command: string;
    result: DiceResult;
    context?: string;
    characterName?: string;
  };
}

export default function ChatPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { currentCampaign, campaigns, createNewCampaign, selectCampaign, updateCampaignContext, loading: campaignLoading } = useCampaign();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCampaignSelector, setShowCampaignSelector] = useState(false);
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Sincronização em tempo real de mensagens
  useEffect(() => {
    if (!currentCampaign) return;

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

      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [currentCampaign]);

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) return;

    try {
      const campaignId = await createNewCampaign(newCampaignName);
      await selectCampaign(campaignId);
      setShowNewCampaignDialog(false);
      setNewCampaignName('');
      setShowCampaignSelector(false);
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      alert('Erro ao criar campanha');
    }
  };

  const handleExportMarkdown = () => {
    if (!currentCampaign) return;
    exportSessionAsMarkdown(currentCampaign, messages);
    setShowExportMenu(false);
  };

  const handleExportText = () => {
    if (!currentCampaign) return;
    exportSessionAsText(currentCampaign, messages);
    setShowExportMenu(false);
  };

  const handleCopyToClipboard = async () => {
    if (!currentCampaign) return;
    const success = await copySessionToClipboard(currentCampaign, messages);
    if (success) {
      alert('Sessão copiada para a área de transferência!');
    } else {
      alert('Erro ao copiar sessão');
    }
    setShowExportMenu(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleDiceRollFromFloating = (command: string, result: DiceResult) => {
    // Adiciona rolagem ao chat
    const rollMessage: Message = {
      id: Date.now().toString(),
      sender: 'mestre',
      content: '',
      type: 'dice_roll',
      diceData: {
        command,
        result,
        characterName: user?.displayName || 'Mestre',
        context: 'Rolagem rápida',
      },
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, rollMessage]);
  };

  const handleDiceRoll = async (command: string) => {
    if (!currentCampaign) {
      alert('Selecione ou crie uma campanha primeiro');
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

      // Salva rolagem no Firestore
      await sendMessage(currentCampaign.id, {
        sender: userProfile?.tier === 'mestre' ? 'mestre' : 'jogador',
        content: '',
        type: 'dice_roll',
        diceData: {
          command,
          result: response.result,
          characterName: user?.displayName || userProfile?.tier === 'mestre' ? 'Mestre' : 'Jogador',
          context: 'Rolagem via chat',
        },
      });
    } catch (error) {
      console.error('Erro ao rolar dados:', error);
      alert('Erro ao rolar dados. Verifique o comando e tente novamente.');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentCampaign) {
      if (!currentCampaign) {
        alert('Selecione ou crie uma campanha primeiro');
      }
      return;
    }

    setIsTyping(true);

    try {
      // Salva mensagem do mestre no Firestore
      await sendMessage(currentCampaign.id, {
        sender: 'mestre',
        content,
      });

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

      // Salva resposta do Drogon no Firestore
      await sendMessage(currentCampaign.id, {
        sender: 'drogon',
        content: data.message,
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
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

  // Se não há campanha selecionada, mostra seletor
  if (!currentCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-grimoire border-primary/30 shadow-arcane rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>

            <div className="relative z-10">
              <GiDragonHead className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse text-glow-gold" />
              <h1 className="text-3xl font-bold text-center mb-2 font-medieval text-metallic-gold">Selecione uma Campanha</h1>
              <p className="text-muted-foreground text-center mb-8 font-lore">
                Escolha uma campanha existente ou crie uma nova
              </p>

              {campaigns.length > 0 && (
                <div className="space-y-3 mb-6">
                  {campaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => selectCampaign(campaign.id)}
                      className="w-full bg-card/50 border border-border rounded-lg p-4 hover:border-primary/50 hover-lift transition-all text-left"
                    >
                      <h3 className="font-semibold text-lg font-medieval text-foreground">{campaign.title || 'Campanha sem nome'}</h3>
                      <p className="text-sm text-muted-foreground mt-1 font-lore">{campaign.description || 'Sem descrição'}</p>
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setShowNewCampaignDialog(true)}
                className="w-full font-medieval mb-3"
                size="lg"
              >
                <FaPlus className="mr-2" />
                Nova Campanha
              </Button>

              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full font-medieval"
                size="lg"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Dialog Nova Campanha */}
        <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
          <DialogContent className="bg-grimoire border-primary/30">
            <DialogHeader>
              <GiDragonHead className="w-16 h-16 text-primary mx-auto mb-4 text-glow-gold" />
              <DialogTitle className="text-foreground text-center font-medieval">Nova Campanha</DialogTitle>
              <DialogDescription className="text-muted-foreground text-center font-lore">
                Escolha um nome para sua nova aventura
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 font-medieval">
                  Nome da campanha:
                </label>
                <Input
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateCampaign();
                    }
                  }}
                  placeholder="A Lenda de..."
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-3">
              <Button
                onClick={() => {
                  setShowNewCampaignDialog(false);
                  setNewCampaignName('');
                }}
                variant="outline"
                className="flex-1 font-medieval"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCampaign}
                disabled={!newCampaignName.trim()}
                className="flex-1 font-medieval"
              >
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border p-4"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              size="icon"
            >
              <FaArrowLeft className="w-5 h-5" />
            </Button>
            <GiDragonHead className="w-10 h-10 text-primary text-glow-gold" />
            <div>
              <h1 className="text-2xl font-bold font-medieval text-metallic-gold">
                {currentCampaign.title || 'Chat com Drogon'}
              </h1>
              <p className="text-sm text-muted-foreground font-lore">
                Tom: {currentCampaign.context.tone} • Detalhe: {currentCampaign.context.detail_level}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                onClick={() => setShowExportMenu(!showExportMenu)}
                variant="ghost"
                size="icon"
                disabled={messages.length === 0}
              >
                <FaDownload className="w-5 h-5" />
              </Button>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-arcane z-50"
                >
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full px-4 py-2 text-left hover:bg-muted text-sm flex items-center gap-2 rounded-t-lg font-lore transition-colors"
                  >
                    <FaDownload className="w-4 h-4" />
                    Exportar Markdown
                  </button>
                  <button
                    onClick={handleExportText}
                    className="w-full px-4 py-2 text-left hover:bg-muted text-sm flex items-center gap-2 font-lore transition-colors"
                  >
                    <FaDownload className="w-4 h-4" />
                    Exportar Texto
                  </button>
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full px-4 py-2 text-left hover:bg-muted text-sm flex items-center gap-2 rounded-b-lg font-lore transition-colors"
                  >
                    <FaCopy className="w-4 h-4" />
                    Copiar Sessão
                  </button>
                </motion.div>
              )}
            </div>
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
                Bem-vindo ao Chat com Drogon
              </h2>
              <p className="text-muted-foreground/70 font-lore">
                Comece sua aventura fazendo uma pergunta ou descrevendo uma cena
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
              diceData={message.diceData}
            />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-card/80 backdrop-blur-md border-t border-border p-4">
        <div className="max-w-5xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} onDiceRoll={handleDiceRoll} disabled={isTyping} />
        </div>
      </div>

      {/* Dialog Nova Campanha (dentro do chat) */}
      <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
        <DialogContent className="bg-grimoire border-primary/30">
          <DialogHeader>
            <GiDragonHead className="w-16 h-16 text-primary mx-auto mb-4 text-glow-gold" />
            <DialogTitle className="text-foreground text-center font-medieval">Nova Campanha</DialogTitle>
            <DialogDescription className="text-muted-foreground text-center font-lore">
              Escolha um nome para sua nova aventura
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 font-medieval">
                Nome da campanha:
              </label>
              <Input
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCampaign();
                  }
                }}
                placeholder="A Lenda de..."
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-3">
            <Button
              onClick={() => {
                setShowNewCampaignDialog(false);
                setNewCampaignName('');
              }}
              variant="outline"
              className="flex-1 font-medieval"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={!newCampaignName.trim()}
              className="flex-1 font-medieval"
            >
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Context Panel Lateral - Controles de IA */}
      <AnimatePresence>
        {currentCampaign && showSettings && (
          <ContextPanel />
        )}
      </AnimatePresence>

      {/* Botão Flutuante de Dados Global */}
      <GlobalDiceButton />
    </main>
  );
}
