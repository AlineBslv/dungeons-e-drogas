/**
 * EXEMPLO DE INTEGRAÇÃO - Master Session Control
 *
 * Este arquivo mostra como integrar o MasterSessionPanel na página de chat
 * junto com o hook useSessionStats para tracking automático.
 *
 * Copie as seções relevantes para frontend/src/app/chat/page.tsx
 */

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
import { FaCog, FaPlus } from 'react-icons/fa';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import CampaignSidebar from '@/components/chat/CampaignSidebar';
import { ContextPanel } from '@/components/app/context-panel';
import GlobalDiceButton from '@/components/dice/GlobalDiceButton';
import { DiceResult, rollDice } from '@/lib/dice-helpers';
import { toast } from 'sonner';

// ============ NOVOS IMPORTS ============
import { MasterSessionPanel } from '@/components/app/master-session-panel';
import { useSessionStats } from '@/hooks/useSessionStats';

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
  const { currentCampaign, loading: campaignLoading } = useCampaign();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSessionPanel, setShowSessionPanel] = useState(false); // NOVO
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============ NOVO: Hook de tracking automático ============
  useSessionStats({
    campaignId: currentCampaign?.id,
    sessionId: currentCampaign?.current_session,
    enabled: userProfile?.tier === 'mestre', // Só ativa para mestres
  });

  // Verificação de autenticação
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

  // Auto-scroll ao receber nova mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handler para enviar mensagens
  const handleSendMessage = async (content: string) => {
    if (!currentCampaign || !user || !userProfile) return;

    try {
      setIsTyping(true);

      // Envia mensagem do usuário
      await sendMessage(currentCampaign.id, {
        content,
        sender: userProfile.tier === 'mestre' ? 'mestre' : 'jogador',
        player_uid: user.uid,
      });

      // Chama IA Gemini
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context: currentCampaign.context,
          history: messages.slice(-5),
        }),
      });

      const data = await response.json();

      // Envia resposta do Drogon
      await sendMessage(currentCampaign.id, {
        content: data.message,
        sender: 'drogon',
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsTyping(false);
    }
  };

  // Handler para rolagens de dados
  const handleDiceRoll = async (result: DiceResult) => {
    if (!currentCampaign || !user) return;

    try {
      await sendMessage(currentCampaign.id, {
        content: `Rolou ${result.command}: ${result.total}`,
        sender: userProfile?.tier === 'mestre' ? 'mestre' : 'jogador',
        type: 'dice_roll',
        diceData: {
          command: result.command,
          result,
        },
        player_uid: user.uid,
      });

      toast.success(`🎲 Resultado: ${result.total}`);
    } catch (error) {
      console.error('Erro ao registrar rolagem:', error);
    }
  };

  // Loading states
  if (authLoading || campaignLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-200">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <GiDragonHead className="w-16 h-16 text-gold-500" />
        </motion.div>
      </div>
    );
  }

  // Sem campanha selecionada
  if (!currentCampaign) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-200">
        <div className="text-center">
          <GiDragonHead className="w-24 h-24 text-gold-500 mx-auto mb-4" />
          <h2 className="text-xl font-medieval text-gold-500 mb-2">Selecione uma Campanha</h2>
          <p className="text-text-secondary mb-4">
            Escolha ou crie uma campanha para começar a aventura
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gold-500 text-dark-100 rounded-lg font-ui hover:bg-gold-400"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isMaster = userProfile?.tier === 'mestre';

  return (
    <div className="flex h-screen bg-dark-200">
      {/* Sidebar Esquerda */}
      <CampaignSidebar />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border bg-dark-300 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <GiDragonHead className="w-6 h-6 text-gold-500" />
            <h1 className="text-lg font-medieval text-gold-500">
              {currentCampaign.title || 'Campanha sem título'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* ============ NOVO: Toggle Session Panel (Apenas Mestre) ============ */}
            {isMaster && (
              <button
                onClick={() => setShowSessionPanel(!showSessionPanel)}
                className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
                title="Controle de Sessão"
              >
                <FaPlus className={`w-4 h-4 text-text-secondary transition-transform ${showSessionPanel ? 'rotate-45' : ''}`} />
              </button>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
            >
              <FaCog className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Layout Responsivo */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Container */}
          <div className="flex-1 flex flex-col">
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>

              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-dark-300">
              <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
            </div>
          </div>

          {/* ============ NOVO: Sidebar Direita Condicional ============ */}
          <AnimatePresence>
            {(showSettings || (isMaster && showSessionPanel)) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-l border-border bg-dark-300 overflow-hidden"
              >
                <div className="w-80 h-full overflow-y-auto p-4 space-y-4">
                  {/* Session Panel (apenas Mestre) */}
                  {isMaster && showSessionPanel && (
                    <div className="mb-4">
                      <MasterSessionPanel />
                    </div>
                  )}

                  {/* Context Panel (Settings) */}
                  {showSettings && <ContextPanel />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Botão de Dados Flutuante */}
      <GlobalDiceButton onRollComplete={handleDiceRoll} />
    </div>
  );
}
