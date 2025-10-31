'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  GiCastle,
  GiCrownedSkull,
  GiSwordman,
  GiDragonHead,
  GiScrollUnfurled,
  GiDiceTwentyFacesTwenty,
} from 'react-icons/gi';
import {
  FaUsers,
  FaKey,
  FaPlay,
  FaPause,
  FaStop,
  FaCopy,
  FaArrowLeft,
  FaUserPlus,
  FaUserMinus,
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getCampaign,
  Campaign,
  getSession,
  Session,
  startSession,
  pauseSession,
  resumeSession,
  endSession,
  formatDuration,
  getCampaignMessages,
  removePlayerFromCampaign,
} from '@/lib/firestore-helpers';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { CampaignChat } from '@/components/campaign/CampaignChat';
import { CampaignDiceButton } from '@/components/campaign/CampaignDiceButton';

interface CampaignWithId extends Campaign {
  id: string;
}

interface SessionWithId extends Session {
  id: string;
}

export default function CampaignDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;

  const [campaign, setCampaign] = useState<CampaignWithId | null>(null);
  const [session, setSession] = useState<SessionWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const isMaster = campaign?.master_uid === user?.uid;

  // Load campaign and session
  useEffect(() => {
    if (!campaignId) return;

    const loadCampaignData = async () => {
      try {
        setLoading(true);
        const campaignData = await getCampaign(campaignId);
        if (campaignData) {
          // Garante que settings existe (compatibilidade com campanhas antigas)
          const normalizedCampaign = {
            id: campaignId,
            ...campaignData,
            settings: campaignData.settings || {
              allow_player_invites: true,
              require_character_sheet: false,
              max_players: 6,
            },
          };
          setCampaign(normalizedCampaign);

          // Load current session if exists
          if (campaignData.current_session) {
            const sessionData = await getSession(campaignData.current_session);
            if (sessionData) {
              setSession(sessionData);
            }
          }

          // Load message count
          const messages = await getCampaignMessages(campaignId, 1000);
          setMessageCount(messages.length);
        } else {
          toast.error('Campanha não encontrada');
          router.push('/campaigns');
        }
      } catch (error) {
        console.error('Erro ao carregar campanha:', error);
        toast.error('Erro ao carregar campanha');
      } finally {
        setLoading(false);
      }
    };

    loadCampaignData();

    // Real-time listener for campaign updates
    const campaignRef = doc(db, 'campaigns', campaignId);
    const unsubscribeCampaign = onSnapshot(campaignRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Garante que settings existe
        const normalizedData = {
          id: doc.id,
          ...data,
          settings: data.settings || {
            allow_player_invites: true,
            require_character_sheet: false,
            max_players: 6,
          },
        } as CampaignWithId;
        setCampaign(normalizedData);
      }
    });

    return () => unsubscribeCampaign();
  }, [campaignId, router]);

  // Real-time session timer
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.started_at.toMillis()) / 1000);
      setSessionDuration(elapsed - session.pause_duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Real-time session listener
  useEffect(() => {
    if (!campaign?.current_session) {
      setSession(null);
      return;
    }

    const sessionRef = doc(db, 'sessions', campaign.current_session);
    const unsubscribeSession = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        setSession({ id: doc.id, ...doc.data() } as SessionWithId);
      } else {
        setSession(null);
      }
    });

    return () => unsubscribeSession();
  }, [campaign?.current_session]);

  const handleStartSession = async () => {
    if (!campaign || !user) return;

    try {
      await startSession(campaign.id, user.uid);
      toast.success('Sessão iniciada!');
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      toast.error('Erro ao iniciar sessão');
    }
  };

  const handlePauseSession = async () => {
    if (!session) return;

    try {
      await pauseSession(session.id);
      toast.success('Sessão pausada');
    } catch (error) {
      console.error('Erro ao pausar sessão:', error);
      toast.error('Erro ao pausar sessão');
    }
  };

  const handleResumeSession = async () => {
    if (!session) return;

    try {
      await resumeSession(session.id);
      toast.success('Sessão retomada');
    } catch (error) {
      console.error('Erro ao retomar sessão:', error);
      toast.error('Erro ao retomar sessão');
    }
  };

  const handleEndSession = async () => {
    if (!session) return;

    try {
      await endSession(session.id);
      toast.success('Sessão encerrada');
      setSession(null);
      setSessionDuration(0);
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      toast.error('Erro ao encerrar sessão');
    }
  };

  const handleCopyInviteCode = () => {
    if (!campaign?.invite_code) return;
    navigator.clipboard.writeText(campaign.invite_code);
    toast.success('Código copiado!');
  };

  const handleRemovePlayer = async (playerUid: string) => {
    if (!campaign) return;

    try {
      await removePlayerFromCampaign(campaign.id, playerUid);
      toast.success('Jogador removido');
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      toast.error('Erro ao remover jogador');
    }
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Nunca';
    return timestamp.toDate().toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GiCastle className="w-20 h-20 text-primary mx-auto mb-4 animate-pulse text-glow-gold" />
          <p className="text-muted-foreground font-lore">Carregando campanha...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/campaigns')}
          className="mb-4 flex items-center gap-2"
        >
          <FaArrowLeft />
          Voltar para Campanhas
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {campaign.status === 'active' && (
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
              {campaign.status === 'paused' && (
                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
              )}
              {campaign.status === 'archived' && (
                <span className="w-3 h-3 bg-gray-500 rounded-full" />
              )}
              <h1 className="text-4xl font-bold font-medieval text-metallic-gold">
                {campaign.title}
              </h1>
            </div>
            {campaign.description && (
              <p className="text-muted-foreground font-lore">{campaign.description}</p>
            )}
          </div>

          {isMaster && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
                <FaUserPlus className="mr-2" />
                Convidar Jogadores
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controle de Sessão (apenas Mestre) */}
          {isMaster && (
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-medieval text-gold-500 flex items-center gap-2">
                  <GiDiceTwentyFacesTwenty className="w-6 h-6" />
                  Controle de Sessão
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!session ? (
                  <div className="text-center py-8">
                    <GiDragonHead className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                    <p className="text-muted-foreground font-lore mb-6">
                      Nenhuma sessão ativa
                    </p>
                    <Button onClick={handleStartSession} variant="drogon" size="lg">
                      <FaPlay className="mr-2" />
                      Iniciar Sessão
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-dark-500/50 p-6 rounded-lg border border-primary/20">
                      <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground font-lore mb-2">
                          Duração da Sessão
                        </p>
                        <p className="text-4xl font-bold font-medieval text-primary">
                          {formatDuration(sessionDuration)}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <p className="text-muted-foreground font-lore">Mensagens</p>
                          <p className="font-bold text-foreground">{session.stats.messages_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-lore">Dados Rolados</p>
                          <p className="font-bold text-foreground">{session.stats.dice_rolls_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-lore">Jogadores Ativos</p>
                          <p className="font-bold text-foreground">{session.stats.players_active.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {session.status === 'active' ? (
                        <Button onClick={handlePauseSession} variant="outline" className="flex-1">
                          <FaPause className="mr-2" />
                          Pausar
                        </Button>
                      ) : (
                        <Button onClick={handleResumeSession} variant="drogon" className="flex-1">
                          <FaPlay className="mr-2" />
                          Retomar
                        </Button>
                      )}
                      <Button onClick={handleEndSession} variant="destructive" className="flex-1">
                        <FaStop className="mr-2" />
                        Encerrar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Chat Multiplayer */}
          <Card className="bg-card/50 backdrop-blur border-border h-[600px]">
            <CampaignChat campaignId={campaign.id} isMaster={isMaster} />
          </Card>

          {/* Informações da Campanha */}
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-xl font-medieval text-foreground">
                Informações da Campanha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground font-lore">Tom</Label>
                  <p className="font-medieval text-foreground capitalize">{campaign.context.tone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground font-lore">Estilo</Label>
                  <p className="font-medieval text-foreground capitalize">{campaign.context.style}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground font-lore">Detalhes</Label>
                  <p className="font-medieval text-foreground capitalize">
                    {campaign.context.detail_level === 'low' && 'Baixo'}
                    {campaign.context.detail_level === 'medium' && 'Médio'}
                    {campaign.context.detail_level === 'high' && 'Alto'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground font-lore">Idioma</Label>
                  <p className="font-medieval text-foreground">{campaign.context.language}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-lore">Criada em:</span>
                  <span className="font-medieval text-foreground">
                    {formatDate(campaign.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground font-lore">Última sessão:</span>
                  <span className="font-medieval text-foreground">
                    {formatDate(campaign.last_session)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground font-lore">Total de mensagens:</span>
                  <span className="font-medieval text-foreground">{messageCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral - Jogadores */}
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-xl font-medieval text-foreground flex items-center gap-2">
                <FaUsers />
                Jogadores ({campaign.players.length}/{campaign.settings?.max_players || 6})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mestre */}
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <GiCrownedSkull className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medieval text-foreground">
                      {campaign.master_uid === user?.uid ? 'Você' : 'Mestre'}
                    </p>
                    <p className="text-xs text-muted-foreground font-lore">Mestre da Campanha</p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary">
                    Mestre
                  </Badge>
                </div>

                {/* Jogadores */}
                {campaign.players.length === 0 ? (
                  <div className="text-center py-8">
                    <GiScrollUnfurled className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-lore">
                      Nenhum jogador ainda
                    </p>
                  </div>
                ) : (
                  campaign.players.map((playerUid, index) => (
                    <div
                      key={playerUid}
                      className="flex items-center gap-3 p-3 bg-dark-500/50 rounded-lg border border-border"
                    >
                      <GiSwordman className="w-8 h-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medieval text-foreground">
                          {playerUid === user?.uid ? 'Você' : `Jogador ${index + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground font-lore">Aventureiro</p>
                      </div>
                      {isMaster && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePlayer(playerUid)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <FaUserMinus />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Código de Convite */}
          {campaign.invite_code && (
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader>
                <CardTitle className="text-xl font-medieval text-foreground flex items-center gap-2">
                  <FaKey />
                  Código de Convite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    value={campaign.invite_code}
                    readOnly
                    className="bg-dark-500 border-border font-mono text-lg text-center tracking-wider"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyInviteCode}>
                    <FaCopy />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground font-lore mt-2">
                  Compartilhe este código com os jogadores
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog: Convidar Jogadores */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medieval text-gold-500 flex items-center gap-2">
              <FaUserPlus className="w-5 h-5" />
              Convidar Jogadores
            </DialogTitle>
            <DialogDescription className="font-lore text-text-secondary">
              Compartilhe o código de convite com os jogadores
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-dark-500/50 p-6 rounded-lg border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground font-lore mb-2">Código de Convite</p>
              <p className="text-3xl font-bold font-mono text-primary tracking-wider mb-4">
                {campaign.invite_code}
              </p>
              <Button onClick={handleCopyInviteCode} variant="drogon" className="w-full">
                <FaCopy className="mr-2" />
                Copiar Código
              </Button>
            </div>

            <div className="text-sm text-muted-foreground font-lore">
              <p className="mb-2">Os jogadores podem entrar na campanha:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Acessando a página de Campanhas</li>
                <li>Clicando em &ldquo;Entrar com Código&rdquo;</li>
                <li>Inserindo o código: {campaign.invite_code}</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botão Flutuante de Dados Integrado ao Chat */}
      <CampaignDiceButton campaignId={campaign.id} isMaster={isMaster} />
    </main>
  );
}
