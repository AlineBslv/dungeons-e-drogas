'use client';

/**
 * MasterSessionPanel - Painel de Controle de Sessão para Mestres
 * Permite iniciar, pausar, retomar e encerrar sessões de jogo
 * Exibe estatísticas em tempo real e histórico de sessões
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GiPlayButton,
  GiPauseButton,
  GiStopSign,
  GiHourglass,
  GiScrollUnfurled,
  GiDiceTwentyFacesTwenty,
  GiThreeFriends,
} from 'react-icons/gi';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  startSession,
  pauseSession,
  resumeSession,
  endSession,
  getCampaignSessions,
  formatDuration,
  Session,
} from '@/lib/firestore-helpers';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaign } from '@/contexts/CampaignContext';

export function MasterSessionPanel() {
  const { user, userProfile } = useAuth();
  const { currentCampaign } = useCampaign();

  const [currentSession, setCurrentSession] = useState<(Session & { id: string }) | null>(null);
  const [sessionHistory, setSessionHistory] = useState<(Session & { id: string })[]>([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Verifica se é mestre
  const isMaster = userProfile?.tier === 'mestre';

  // Timer que atualiza a cada segundo
  useEffect(() => {
    if (!currentSession || currentSession.status !== 'active') return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - currentSession.started_at.toMillis()) / 1000);
      setTimer(elapsed - currentSession.pause_duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  // Listener real-time da sessão atual
  useEffect(() => {
    if (!currentCampaign?.current_session) {
      setCurrentSession(null);
      return;
    }

    const sessionRef = doc(db, 'sessions', currentCampaign.current_session);
    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentSession({ id: snapshot.id, ...snapshot.data() } as Session & { id: string });
      }
    });

    return () => unsubscribe();
  }, [currentCampaign?.current_session]);

  // Carrega histórico de sessões
  useEffect(() => {
    if (!currentCampaign?.id) return;

    const loadHistory = async () => {
      const sessions = await getCampaignSessions(currentCampaign.id);
      setSessionHistory(sessions.filter((s) => s.status === 'ended'));
    };

    loadHistory();
  }, [currentCampaign?.id]);

  // Handlers de controle
  const handleStartSession = async () => {
    if (!currentCampaign || !user) return;
    setLoading(true);
    try {
      const sessionId = await startSession(currentCampaign.id, user.uid);

      // Emite evento Socket.io
      if (typeof window !== 'undefined' && (window as any).socket) {
        (window as any).socket.emit('session:start', {
          campaignId: currentCampaign.id,
          sessionId,
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      alert('Erro ao iniciar sessão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSession = async () => {
    if (!currentSession || !currentCampaign) return;
    setLoading(true);
    try {
      await pauseSession(currentSession.id);

      // Emite evento Socket.io
      if (typeof window !== 'undefined' && (window as any).socket) {
        (window as any).socket.emit('session:pause', {
          campaignId: currentCampaign.id,
          sessionId: currentSession.id,
        });
      }
    } catch (error) {
      console.error('Erro ao pausar sessão:', error);
      alert('Erro ao pausar sessão.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async () => {
    if (!currentSession || !currentCampaign) return;
    setLoading(true);
    try {
      await resumeSession(currentSession.id);

      // Emite evento Socket.io
      if (typeof window !== 'undefined' && (window as any).socket) {
        (window as any).socket.emit('session:resume', {
          campaignId: currentCampaign.id,
          sessionId: currentSession.id,
        });
      }
    } catch (error) {
      console.error('Erro ao retomar sessão:', error);
      alert('Erro ao retomar sessão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!currentSession || !currentCampaign) return;
    if (!confirm('Tem certeza que deseja encerrar esta sessão?')) return;

    setLoading(true);
    try {
      await endSession(currentSession.id, sessionNotes || undefined);

      // Emite evento Socket.io
      if (typeof window !== 'undefined' && (window as any).socket) {
        (window as any).socket.emit('session:end', {
          campaignId: currentCampaign.id,
          sessionId: currentSession.id,
        });
      }

      setSessionNotes('');
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      alert('Erro ao encerrar sessão.');
    } finally {
      setLoading(false);
    }
  };

  if (!isMaster) {
    return (
      <div className="p-4 border border-border rounded-lg bg-dark-400">
        <p className="text-sm text-text-secondary">Apenas Mestres podem controlar sessões.</p>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="p-4 border border-border rounded-lg bg-dark-400">
        <p className="text-sm text-text-secondary">Selecione uma campanha para controlar sessões.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Painel de Controle Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border border-gold-500/30 rounded-lg bg-dark-400 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medieval text-gold-500 flex items-center gap-2">
            <GiScrollUnfurled className="w-5 h-5" />
            Controle de Sessão
          </h3>
          <div className="flex items-center gap-2">
            {currentSession && (
              <span
                className={cn(
                  'px-2 py-1 rounded text-xs font-ui font-semibold',
                  currentSession.status === 'active' && 'bg-green-500/20 text-green-500',
                  currentSession.status === 'paused' && 'bg-yellow-500/20 text-yellow-500'
                )}
              >
                {currentSession.status === 'active' && 'ATIVA'}
                {currentSession.status === 'paused' && 'PAUSADA'}
              </span>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-4xl font-mono text-gold-500 mb-2">
            <GiHourglass className="w-8 h-8 animate-pulse" />
            {formatDuration(timer)}
          </div>
          <p className="text-xs text-text-secondary">
            {currentSession
              ? currentSession.status === 'active'
                ? 'Sessão em andamento'
                : 'Sessão pausada'
              : 'Nenhuma sessão ativa'}
          </p>
        </div>

        {/* Botões de Controle */}
        <div className="flex gap-2 justify-center">
          {!currentSession && (
            <Button
              onClick={handleStartSession}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <GiPlayButton className="w-5 h-5" />
              Iniciar Sessão
            </Button>
          )}

          {currentSession?.status === 'active' && (
            <>
              <Button
                onClick={handlePauseSession}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                <GiPauseButton className="w-5 h-5" />
                Pausar
              </Button>
              <Button
                onClick={handleEndSession}
                disabled={loading}
                variant="destructive"
                className="gap-2"
              >
                <GiStopSign className="w-5 h-5" />
                Encerrar
              </Button>
            </>
          )}

          {currentSession?.status === 'paused' && (
            <>
              <Button
                onClick={handleResumeSession}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <GiPlayButton className="w-5 h-5" />
                Retomar
              </Button>
              <Button
                onClick={handleEndSession}
                disabled={loading}
                variant="destructive"
                className="gap-2"
              >
                <GiStopSign className="w-5 h-5" />
                Encerrar
              </Button>
            </>
          )}
        </div>

        {/* Notas de Sessão */}
        {currentSession && (
          <div className="mt-4">
            <label className="block text-sm font-ui text-text-secondary mb-2">
              Notas da Sessão (opcional):
            </label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full px-3 py-2 bg-dark-500 border border-border rounded-lg text-sm text-text-primary font-ui resize-none focus:outline-none focus:border-gold-500/50"
              rows={3}
              placeholder="Resumo, eventos importantes, decisões dos jogadores..."
            />
          </div>
        )}
      </motion.div>

      {/* Estatísticas da Sessão Atual */}
      <AnimatePresence>
        {currentSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="p-4 border border-border rounded-lg bg-dark-500 text-center">
              <GiScrollUnfurled className="w-6 h-6 text-gold-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary font-mono">
                {currentSession.stats.messages_count}
              </p>
              <p className="text-xs text-text-secondary font-ui">Mensagens</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-dark-500 text-center">
              <GiDiceTwentyFacesTwenty className="w-6 h-6 text-gold-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary font-mono">
                {currentSession.stats.dice_rolls_count}
              </p>
              <p className="text-xs text-text-secondary font-ui">Rolagens</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-dark-500 text-center">
              <GiThreeFriends className="w-6 h-6 text-gold-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary font-mono">
                {currentSession.stats.players_active.length}
              </p>
              <p className="text-xs text-text-secondary font-ui">Jogadores</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Histórico de Sessões */}
      {sessionHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 border border-border rounded-lg bg-dark-400"
        >
          <h4 className="text-sm font-medieval text-gold-500 mb-3">Histórico de Sessões</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessionHistory.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-dark-500 border border-border rounded-lg text-xs"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-ui text-text-primary font-semibold">
                    {new Date(session.started_at.toMillis()).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="font-mono text-gold-500">{formatDuration(session.total_duration)}</span>
                </div>
                <div className="flex gap-4 text-text-secondary">
                  <span>{session.stats.messages_count} msgs</span>
                  <span>{session.stats.dice_rolls_count} dados</span>
                  <span>{session.stats.players_active.length} players</span>
                </div>
                {session.notes && (
                  <p className="mt-2 text-text-secondary italic line-clamp-2">{session.notes}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
