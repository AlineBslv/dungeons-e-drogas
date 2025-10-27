'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { motion } from 'framer-motion';
import { GiDragonHead, GiSwordman, GiScrollQuill, GiDiceTwentyFacesTwenty, GiCrystalBall, GiCastle } from 'react-icons/gi';
import { FaUserShield, FaSignOutAlt, FaPlus, FaComments, FaClock } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GlobalDiceButton from '@/components/dice/GlobalDiceButton';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CampaignWithStats {
  id: string;
  title?: string;
  description?: string;
  last_session?: Timestamp;
  messageCount?: number;
  lastMessage?: string;
}

export default function DashboardPage() {
  const { user, userProfile, loading, logout } = useAuth();
  const { campaigns, selectCampaign } = useCampaign();
  const router = useRouter();
  const [campaignsWithStats, setCampaignsWithStats] = useState<CampaignWithStats[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Busca estatísticas das campanhas
  useEffect(() => {
    const fetchCampaignStats = async () => {
      if (!campaigns || campaigns.length === 0) {
        setCampaignsWithStats([]);
        return;
      }

      const campaignsData = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            // Busca última mensagem e contagem
            const messagesRef = collection(db, 'campaigns', campaign.id, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
            const snapshot = await getDocs(q);

            let lastMessage = '';
            if (!snapshot.empty) {
              const lastDoc = snapshot.docs[0].data();
              lastMessage = lastDoc.content || 'Rolagem de dados';
            }

            // Conta total de mensagens
            const allMessagesRef = collection(db, 'campaigns', campaign.id, 'messages');
            const allSnapshot = await getDocs(allMessagesRef);
            const messageCount = allSnapshot.size;

            return {
              id: campaign.id,
              title: campaign.title,
              description: campaign.description,
              last_session: campaign.last_session,
              messageCount,
              lastMessage: lastMessage.substring(0, 100),
            };
          } catch (error) {
            console.error(`Erro ao buscar stats da campanha ${campaign.id}:`, error);
            return {
              id: campaign.id,
              title: campaign.title,
              description: campaign.description,
              last_session: campaign.last_session,
              messageCount: 0,
              lastMessage: '',
            };
          }
        })
      );

      setCampaignsWithStats(campaignsData);
    };

    fetchCampaignStats();
  }, [campaigns]);

  const handleContinueChat = async (campaignId: string) => {
    await selectCampaign(campaignId);
    router.push('/chat');
  };

  const handleNewCampaign = () => {
    router.push('/chat');
  };

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout do dashboard...')
      await logout();
      console.log('Logout concluído, redirecionando...')
      router.push('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GiDragonHead className="w-20 h-20 text-primary mx-auto mb-4 animate-pulse text-glow-gold" />
          <p className="text-muted-foreground font-lore">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const isMaster = userProfile.tier === 'mestre';

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <GiDragonHead className="w-16 h-16 text-primary text-glow-gold" />
            <div>
              <h1 className="text-4xl font-bold font-medieval text-metallic-gold">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 font-lore">Bem-vindo, {userProfile.name}!</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaSignOutAlt />
            <span>Sair</span>
          </Button>
        </div>
      </motion.div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <Card className="bg-grimoire border-primary/30 shadow-arcane relative overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
          <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>

          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>

          <CardContent className="p-8 relative z-10">
            <div className="flex items-center gap-6">
              {isMaster ? (
                <FaUserShield className="w-24 h-24 text-primary" />
              ) : (
                <GiSwordman className="w-24 h-24 text-primary" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold font-medieval text-foreground">{userProfile.name}</h2>
                  <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-sm font-semibold text-primary font-medieval flex items-center gap-1.5">
                    {isMaster ? (
                      <><FaUserShield className="h-3.5 w-3.5" /> Mestre</>
                    ) : (
                      <><GiSwordman className="h-3.5 w-3.5" /> Jogador</>
                    )}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4 font-lore">{userProfile.email}</p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-lore">Campanhas Ativas:</span>
                    <span className="font-semibold text-primary font-medieval">
                      {userProfile.active_campaigns.length}
                    </span>
                  </div>
                  {userProfile.preferred_tone && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-lore">Tom Preferido:</span>
                      <span className="font-semibold text-primary capitalize font-medieval">
                        {userProfile.preferred_tone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-7xl mx-auto"
      >
        <h3 className="text-2xl font-bold mb-6 font-medieval text-metallic-gold">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isMaster ? (
            <>
              <Card className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover-lift cursor-pointer group">
                <CardHeader>
                  <GiCastle className="w-12 h-12 text-primary mb-3 group-hover:text-glow-gold transition-all" />
                  <CardTitle className="text-xl font-medieval">Nova Campanha</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-lore">Crie uma nova aventura épica</CardDescription>
                </CardContent>
              </Card>
              <Card
                onClick={() => router.push('/chat')}
                className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover-lift cursor-pointer group"
              >
                <CardHeader>
                  <GiCrystalBall className="w-12 h-12 text-primary mb-3 group-hover:text-glow-gold transition-all" />
                  <CardTitle className="text-xl font-medieval">Chat com Drogon</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-lore">Converse com o narrador IA</CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover-lift cursor-pointer group">
                <CardHeader>
                  <GiScrollQuill className="w-12 h-12 text-primary mb-3 group-hover:text-glow-gold transition-all" />
                  <CardTitle className="text-xl font-medieval">Base Cognitiva</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-lore">Consulte regras e lore de D&D</CardDescription>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card
                onClick={() => router.push('/campaigns')}
                className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover-lift cursor-pointer group"
              >
                <CardHeader>
                  <GiCastle className="w-12 h-12 text-primary mb-3 group-hover:text-glow-gold transition-all" />
                  <CardTitle className="text-xl font-medieval">Minhas Campanhas</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-lore">Veja suas aventuras ativas</CardDescription>
                </CardContent>
              </Card>
              <Card
                onClick={() => router.push('/characters')}
                className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover-lift cursor-pointer group"
              >
                <CardHeader>
                  <GiScrollQuill className="w-12 h-12 text-primary mb-3 group-hover:text-glow-gold transition-all" />
                  <CardTitle className="text-xl font-medieval">Fichas de Personagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-lore">Gerencie seus personagens</CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover-lift cursor-pointer group">
                <CardHeader>
                  <GiDiceTwentyFacesTwenty className="w-12 h-12 text-primary mb-3 group-hover:text-glow-gold transition-all" />
                  <CardTitle className="text-xl font-medieval">Rolagens Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-lore">Role dados virtualmente</CardDescription>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </motion.div>

      {/* Campanhas Recentes - Apenas para Mestres */}
      {isMaster && campaignsWithStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-7xl mx-auto mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold font-medieval text-metallic-gold flex items-center gap-2">
              <FaComments className="text-primary" />
              Conversas com Drogon
            </h3>
            <Button onClick={handleNewCampaign} className="flex items-center gap-2">
              <FaPlus />
              Nova Conversa
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaignsWithStats.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Card
                  onClick={() => handleContinueChat(campaign.id)}
                  className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover-lift cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-medieval text-foreground group-hover:text-primary transition-colors">
                          {campaign.title || `Campanha ${campaign.id.substring(0, 8)}`}
                        </CardTitle>
                        <CardDescription className="mt-1 font-lore text-xs">
                          {campaign.description || 'Sem descrição'}
                        </CardDescription>
                      </div>
                      <GiDragonHead className="w-8 h-8 text-primary/40 group-hover:text-primary group-hover:text-glow-gold transition-all" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {campaign.lastMessage && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 font-lore">
                        {campaign.lastMessage}...
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <FaComments className="h-3 w-3" />
                          {campaign.messageCount || 0} mensagens
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="h-3 w-3" />
                          {formatDate(campaign.last_session)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Coming Soon Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-7xl mx-auto mt-12 text-center"
      >
        <Card className="bg-accent/30 backdrop-blur border-accent/50">
          <CardContent className="p-6">
            <p className="text-muted-foreground font-lore">
              🚧 Dashboard em construção • Mais funcionalidades em breve
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Botão Flutuante de Dados Global */}
      <GlobalDiceButton />
    </main>
  );
}
