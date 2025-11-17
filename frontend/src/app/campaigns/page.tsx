'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { GiCastle, GiCrownedSkull, GiSwordman, GiScrollUnfurled } from 'react-icons/gi';
import { FaPlus, FaUsers, FaClock, FaKey, FaArchive } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getUserCampaigns, joinCampaignByCode, Campaign } from '@/lib/firestore-helpers';
import { CreateCampaignDialog } from '@/components/campaign/CreateCampaignDialog';
import { CampaignCardSkeleton } from '@/components/ui/campaign-card-skeleton';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

interface CampaignWithId extends Campaign {
  id: string;
}

export default function CampaignsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joiningCampaign, setJoiningCampaign] = useState(false);

  const isMaster = userProfile?.tier === 'mestre';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadCampaigns = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userCampaigns = await getUserCampaigns(user.uid, isMaster);
        // Normaliza campanhas antigas sem settings
        const normalizedCampaigns = userCampaigns.map((campaign) => ({
          ...campaign,
          settings: campaign.settings || {
            allow_player_invites: true,
            require_character_sheet: false,
            max_players: 6,
          },
        })) as CampaignWithId[];
        setCampaigns(normalizedCampaigns);
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        toast.error('Erro ao carregar campanhas');
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [user, isMaster]);

  const handleJoinCampaign = async () => {
    if (!user || !inviteCode.trim()) {
      toast.error('Por favor, insira um código de convite');
      return;
    }

    setJoiningCampaign(true);

    try {
      const campaignId = await joinCampaignByCode(inviteCode.trim(), user.uid);
      toast.success('Você entrou na campanha!');
      setShowJoinDialog(false);
      setInviteCode('');
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao entrar na campanha';
      toast.error(errorMessage);
    } finally {
      setJoiningCampaign(false);
    }
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Nunca';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen p-8">
        {/* Header Skeleton */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GiCastle className="w-12 h-12 text-primary/50 animate-pulse" />
                <div className="h-10 w-48 bg-primary/10 rounded animate-pulse" />
              </div>
              <div className="h-5 w-96 bg-primary/10 rounded animate-pulse mt-2" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-40 bg-primary/10 rounded animate-pulse" />
              <div className="h-10 w-40 bg-primary/10 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Campaigns Grid Skeleton */}
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-primary/10 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const masterCampaigns = campaigns.filter((c) => c.master_uid === user?.uid);
  const playerCampaigns = campaigns.filter((c) => c.players.includes(user?.uid || ''));

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-medieval text-metallic-gold flex items-center gap-3">
              <GiCastle className="w-12 h-12 text-primary" />
              Campanhas
            </h1>
            <p className="text-muted-foreground mt-2 font-lore">
              Sessões multiplayer organizadas de RPG
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowJoinDialog(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FaKey />
              Entrar com Código
            </Button>

            {isMaster && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="drogon"
                className="flex items-center gap-2"
              >
                <FaPlus />
                Criar Campanha
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Campanhas como Mestre */}
      {isMaster && masterCampaigns.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold font-medieval text-gold-500 mb-6 flex items-center gap-2">
            <GiCrownedSkull className="w-6 h-6" />
            Suas Campanhas (Mestre)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {masterCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover-lift cursor-pointer group"
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-medieval text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        {campaign.status === 'active' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                        {campaign.status === 'paused' && <span className="w-2 h-2 bg-yellow-500 rounded-full" />}
                        {campaign.status === 'archived' && <FaArchive className="w-4 h-4 text-muted-foreground" />}
                        {campaign.title}
                      </CardTitle>
                      <CardDescription className="mt-2 font-lore line-clamp-2">
                        {campaign.description || 'Sem descrição'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {campaign.context.tone}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {campaign.context.style}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FaUsers className="w-3 h-3" />
                      {campaign.players.length}/{campaign.settings?.max_players || 6}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      {formatDate(campaign.last_session)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      )}

      {/* Campanhas como Jogador */}
      {playerCampaigns.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold font-medieval text-gold-500 mb-6 flex items-center gap-2">
            <GiSwordman className="w-6 h-6" />
            Participando como Jogador
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playerCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover-lift cursor-pointer group"
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-medieval text-foreground group-hover:text-primary transition-colors">
                    {campaign.title}
                  </CardTitle>
                  <CardDescription className="font-lore">
                    Mestre: {campaign.master_uid === user?.uid ? 'Você' : 'Outro jogador'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FaUsers className="w-3 h-3" />
                      {campaign.players.length} jogadores
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      {formatDate(campaign.last_session)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      )}

      {/* Estado Vazio */}
      {campaigns.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center py-16"
        >
          <GiScrollUnfurled className="w-32 h-32 text-primary/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold font-medieval text-foreground mb-4">
            Nenhuma Campanha Encontrada
          </h2>
          <p className="text-muted-foreground font-lore mb-8">
            {isMaster
              ? 'Crie sua primeira campanha multiplayer e convide jogadores para participar!'
              : 'Entre em uma campanha usando um código de convite ou aguarde um Mestre convidá-lo.'}
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setShowJoinDialog(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FaKey />
              Entrar com Código
            </Button>
            {isMaster && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="drogon"
                className="flex items-center gap-2"
              >
                <FaPlus />
                Criar Campanha
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Dialog: Criar Campanha */}
      <CreateCampaignDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {/* Dialog: Entrar com Código */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medieval text-gold-500 flex items-center gap-2">
              <FaKey className="w-5 h-5" />
              Entrar em Campanha
            </DialogTitle>
            <DialogDescription className="font-lore text-text-secondary">
              Insira o código de convite fornecido pelo Mestre
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code" className="font-ui text-text-primary">
                Código de Convite
              </Label>
              <Input
                id="invite-code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                maxLength={9}
                disabled={joiningCampaign}
                className="bg-dark-500 border-border font-mono text-lg text-center tracking-wider"
              />
              <p className="text-xs text-text-secondary font-lore">
                Formato: XXXX-XXXX (8 caracteres)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowJoinDialog(false);
                  setInviteCode('');
                }}
                disabled={joiningCampaign}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleJoinCampaign}
                disabled={joiningCampaign || inviteCode.length < 8}
                variant="drogon"
                className="flex-1"
              >
                {joiningCampaign ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
