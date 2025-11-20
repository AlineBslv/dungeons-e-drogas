'use client';

/**
 * ContextSyncListener - Escuta atualizações de contexto em tempo real
 * Sincroniza mudanças do Mestre com todos os jogadores via Socket.io
 */

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useCampaign } from '@/contexts/CampaignContext';
import { useAuth } from '@/contexts/AuthContext';

export function ContextSyncListener() {
  const { currentCampaign, selectCampaign } = useCampaign();
  const { userProfile } = useAuth();

  useEffect(() => {
    if (!currentCampaign || typeof window === 'undefined') return;

    const socket = (window as any).socket;
    if (!socket) {
      console.warn('[ContextSyncListener] Socket não disponível');
      return;
    }

    /**
     * Listener para updates de contexto do Mestre
     */
    const handleContextUpdate = async (data: any) => {
      const { context, updatedBy, updatedAt } = data;

      console.log('[ContextSyncListener] Context updated:', context);

      // Mostra notificação visual apenas para jogadores
      if (userProfile?.tier === 'jogador') {
        toast.info('⚙️ Contexto da campanha atualizado', {
          description: getContextChangeDescription(context),
          duration: 5000,
        });
      }

      // Recarrega a campanha para sincronizar o estado
      await selectCampaign(currentCampaign.id);
    };

    // Registra listener
    socket.on('context:updated', handleContextUpdate);

    console.log('[ContextSyncListener] Listener ativo para campanha:', currentCampaign.id);

    // Cleanup ao desmontar
    return () => {
      socket.off('context:updated', handleContextUpdate);
      console.log('[ContextSyncListener] Listener removido');
    };
  }, [currentCampaign, userProfile, selectCampaign]);

  // Este componente não renderiza nada
  return null;
}

/**
 * Gera descrição legível das mudanças de contexto
 */
function getContextChangeDescription(context: any): string {
  const changes: string[] = [];

  if (context.tone) {
    const toneLabels: Record<string, string> = {
      epic: 'Épico',
      casual: 'Casual',
      horror: 'Horror',
      gritty: 'Sombrio',
    };
    changes.push(`Tom: ${toneLabels[context.tone] || context.tone}`);
  }

  if (context.detail_level) {
    const detailLabels: Record<string, string> = {
      low: 'Baixo',
      medium: 'Médio',
      high: 'Alto',
    };
    changes.push(`Detalhe: ${detailLabels[context.detail_level]}`);
  }

  if (context.language) {
    const langLabels: Record<string, string> = {
      'pt-BR': 'PT-BR',
      'en-US': 'EN-US',
      'es-ES': 'ES',
    };
    changes.push(`Idioma: ${langLabels[context.language]}`);
  }

  return changes.join(' • ') || 'Configurações atualizadas';
}
