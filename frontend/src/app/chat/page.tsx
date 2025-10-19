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

interface Message {
  id: string;
  sender: 'mestre' | 'drogon' | 'jogador';
  content: string;
  timestamp: string | Timestamp;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <GiDragonHead className="w-20 h-20 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Carregando...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8">
            <GiDragonHead className="w-20 h-20 text-purple-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-center mb-2">Selecione uma Campanha</h1>
            <p className="text-gray-400 text-center mb-8">
              Escolha uma campanha existente ou crie uma nova
            </p>

            {campaigns.length > 0 && (
              <div className="space-y-3 mb-6">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => selectCampaign(campaign.id)}
                    className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500 transition-all text-left"
                  >
                    <h3 className="font-semibold text-lg">{campaign.title || 'Campanha sem nome'}</h3>
                    <p className="text-sm text-gray-400 mt-1">{campaign.description || 'Sem descrição'}</p>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowNewCampaignDialog(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <FaPlus />
              Nova Campanha
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </motion.div>

        {/* Dialog Nova Campanha */}
        <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
          <DialogContent className="bg-gray-800/95 border-cyan-500/40">
            <DialogHeader>
              <GiDragonHead className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <DialogTitle className="text-gray-200 text-center">Selecione uma Campanha</DialogTitle>
              <DialogDescription className="text-gray-400 text-center">
                Escolha uma campanha existente ou crie uma nova
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  placeholder=""
                  className="bg-gray-900/50 border-cyan-500/50 text-white focus:border-cyan-400"
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
                className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCampaign}
                disabled={!newCampaignName.trim()}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-purple-500/30 p-4"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <GiDragonHead className="w-10 h-10 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                {currentCampaign.title || 'Chat com Drogon'}
              </h1>
              <p className="text-sm text-gray-400">
                Tom: {currentCampaign.context.tone} • Detalhe: {currentCampaign.context.detail_level}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                disabled={messages.length === 0}
              >
                <FaDownload className="w-5 h-5" />
              </button>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-800 border border-purple-500/30 rounded-lg shadow-lg z-50"
                >
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 text-sm flex items-center gap-2 rounded-t-lg"
                  >
                    <FaDownload className="w-4 h-4" />
                    Exportar Markdown
                  </button>
                  <button
                    onClick={handleExportText}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 text-sm flex items-center gap-2"
                  >
                    <FaDownload className="w-4 h-4" />
                    Exportar Texto
                  </button>
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 text-sm flex items-center gap-2 rounded-b-lg"
                  >
                    <FaCopy className="w-4 h-4" />
                    Copiar Sessão
                  </button>
                </motion.div>
              )}
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <FaCog className="w-5 h-5" />
            </button>
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
              <GiDragonHead className="w-24 h-24 text-purple-400/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-400 mb-2">
                Bem-vindo ao Chat com Drogon
              </h2>
              <p className="text-gray-500">
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
            />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-md border-t border-purple-500/30 p-4">
        <div className="max-w-5xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>

      {/* Dialog Nova Campanha */}
      <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
        <DialogContent className="bg-gray-800/95 border-cyan-500/40">
          <DialogHeader>
            <GiDragonHead className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <DialogTitle className="text-gray-200 text-center">Selecione uma Campanha</DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Escolha uma campanha existente ou crie uma nova
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                placeholder=""
                className="bg-gray-900/50 border-cyan-500/50 text-white focus:border-cyan-400"
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
              className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={!newCampaignName.trim()}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold"
            >
              OK
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
    </main>
  );
}
