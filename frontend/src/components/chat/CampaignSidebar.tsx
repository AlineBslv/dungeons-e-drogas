'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GiDragonHead } from 'react-icons/gi';
import { FaPlus, FaTrash, FaComments, FaClock, FaBars, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useCampaign } from '@/contexts/CampaignContext';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CampaignSidebarProps {
  onNewCampaign?: () => void;
}

export default function CampaignSidebar({ onNewCampaign }: CampaignSidebarProps) {
  const router = useRouter();
  const { currentCampaign, campaigns, selectCampaign, deleteCampaign, createNewCampaign } = useCampaign();
  const [campaignStats, setCampaignStats] = useState<{[key: string]: {messageCount: number}}>({});
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Carrega estatísticas das campanhas
  useEffect(() => {
    const loadCampaignStats = async () => {
      const stats: {[key: string]: {messageCount: number}} = {};

      for (const campaign of campaigns) {
        try {
          const messagesRef = collection(db, 'campaigns', campaign.id, 'messages');
          const snapshot = await getCountFromServer(messagesRef);
          stats[campaign.id] = { messageCount: snapshot.data().count };
        } catch {
          stats[campaign.id] = { messageCount: 0 };
        }
      }

      setCampaignStats(stats);
    };

    if (campaigns.length > 0) {
      loadCampaignStats();
    }
  }, [campaigns]);

  const formatRelativeTime = (timestamp: Date | { toDate: () => Date } | string | null | undefined) => {
    if (!timestamp) return 'Nunca';

    const date = typeof timestamp === 'object' && 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) return;

    try {
      const campaignId = await createNewCampaign(newCampaignName);
      await selectCampaign(campaignId);
      setShowNewCampaignDialog(false);
      setNewCampaignName('');
      setIsSidebarOpen(false);
      if (onNewCampaign) onNewCampaign();
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      toast.error('Erro ao criar campanha');
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    try {
      await deleteCampaign(campaignToDelete);
      setShowDeleteDialog(false);
      setCampaignToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar campanha:', error);
      toast.error('Erro ao deletar campanha');
    }
  };

  const openDeleteDialog = (campaignId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCampaignToDelete(campaignId);
    setShowDeleteDialog(true);
  };

  const handleSelectCampaign = (campaignId: string) => {
    selectCampaign(campaignId);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-card border border-border rounded-lg shadow-arcane"
      >
        {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
      </button>

      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-80 bg-grimoire border-r border-border z-40 flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Voltar ao Dashboard"
            >
              <FaArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <h2 className="text-xl font-bold font-medieval text-metallic-gold">Campanhas</h2>
          </div>

          <Button
            onClick={() => setShowNewCampaignDialog(true)}
            variant="drogon"
            className="w-full font-medieval"
            size="sm"
          >
            <FaPlus className="mr-2 w-4 h-4" />
            Nova Campanha
          </Button>
        </div>

        {/* Lista de Campanhas */}
        <div className="flex-1 overflow-y-auto p-2">
          {campaigns.length === 0 ? (
            <div className="text-center py-8 px-4">
              <GiDragonHead className="w-16 h-16 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-lore">
                Nenhuma campanha ainda.
                <br />
                Crie sua primeira!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map((campaign) => {
                const stats = campaignStats[campaign.id];
                const messageCount = stats?.messageCount || 0;
                const isActive = currentCampaign?.id === campaign.id;

                return (
                  <motion.div
                    key={campaign.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <div
                      onClick={() => handleSelectCampaign(campaign.id)}
                      className={`w-full p-3 rounded-lg border transition-all text-left group relative cursor-pointer ${
                        isActive
                          ? 'bg-primary/20 border-primary/50 shadow-arcane'
                          : 'bg-card/30 border-border hover:bg-card/50 hover:border-primary/30'
                      }`}
                    >
                      {/* Badge ativo */}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`font-semibold text-sm font-medieval line-clamp-1 ${
                          isActive ? 'text-primary' : 'text-foreground'
                        }`}>
                          {campaign.title || 'Sem nome'}
                        </h3>

                        <button
                          onClick={(e) => openDeleteDialog(campaign.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity"
                          title="Excluir"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground font-lore line-clamp-2 mb-2">
                        {campaign.description || 'Sem descrição'}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FaComments className="w-3 h-3 text-primary/70" />
                          <span>{messageCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaClock className="w-3 h-3 text-primary/70" />
                          <span>{formatRelativeTime(campaign.last_session || campaign.created_at)}</span>
                        </div>
                      </div>

                      {/* Tom da campanha */}
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          campaign.context.tone === 'epic' ? 'bg-yellow-500/20 text-yellow-300' :
                          campaign.context.tone === 'horror' ? 'bg-red-500/20 text-red-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {campaign.context.tone === 'epic' ? 'Épico' :
                           campaign.context.tone === 'horror' ? 'Horror' : 'Casual'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

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
              <Label className="block text-sm font-medium text-foreground mb-2 font-medieval">
                Nome da campanha:
              </Label>
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
              variant="drogon"
              className="flex-1 font-medieval"
            >
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-grimoire border-primary/30">
          <DialogHeader>
            <FaTrash className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <DialogTitle className="text-foreground text-center font-medieval">Excluir Campanha</DialogTitle>
            <DialogDescription className="text-muted-foreground text-center font-lore">
              Tem certeza que deseja excluir esta campanha? Todas as mensagens e histórico serão perdidos permanentemente.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex gap-3">
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                setCampaignToDelete(null);
              }}
              variant="outline"
              className="flex-1 font-medieval"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteCampaign}
              className="flex-1 font-medieval bg-red-600 hover:bg-red-700"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
