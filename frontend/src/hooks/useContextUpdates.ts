'use client';

import { useState, useCallback, useEffect } from 'react';
import { CampaignContext } from '@/lib/firestore-helpers';
import { useCampaign } from '@/contexts/CampaignContext';
import { toast } from 'sonner';

interface ContextPreview {
  tone?: string;
  detail_level?: string;
  language?: string;
  style?: string;
}

interface UseContextUpdatesReturn {
  preview: ContextPreview | null;
  isApplying: boolean;
  hasChanges: boolean;
  updatePreview: (changes: Partial<CampaignContext>) => void;
  applyChanges: () => Promise<void>;
  resetPreview: () => void;
}

/**
 * Hook para atualização em tempo real do contexto da campanha
 * Permite preview de mudanças antes de aplicar
 */
export function useContextUpdates(): UseContextUpdatesReturn {
  const { currentCampaign, updateCampaignContext } = useCampaign();
  const [preview, setPreview] = useState<ContextPreview | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Reseta o preview quando a campanha muda
  useEffect(() => {
    setPreview(null);
  }, [currentCampaign?.id]);

  // Atualiza o preview sem salvar
  const updatePreview = useCallback((changes: Partial<CampaignContext>) => {
    setPreview((prev) => ({
      ...prev,
      ...changes,
    }));
  }, []);

  // Aplica as mudanças ao Firestore e WebSocket
  const applyChanges = useCallback(async () => {
    if (!preview || !currentCampaign) {
      toast.error('Nenhuma mudança para aplicar');
      return;
    }

    setIsApplying(true);
    try {
      // Atualiza o contexto no Firestore
      await updateCampaignContext(preview as Partial<CampaignContext>);

      // Emite evento via Socket.io para todos os jogadores
      if (typeof window !== 'undefined' && (window as any).socket) {
        (window as any).socket.emit('context:update', {
          campaignId: currentCampaign.id,
          context: preview,
        });
      }

      toast.success('✨ Contexto atualizado com sucesso!', {
        description: getContextChangeDescription(preview),
      });

      setPreview(null);
    } catch (error) {
      console.error('Erro ao aplicar mudanças de contexto:', error);
      toast.error('Erro ao atualizar contexto', {
        description: 'Tente novamente em alguns instantes',
      });
    } finally {
      setIsApplying(false);
    }
  }, [preview, currentCampaign, updateCampaignContext]);

  // Reseta o preview sem salvar
  const resetPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const hasChanges = preview !== null && Object.keys(preview).length > 0;

  return {
    preview,
    isApplying,
    hasChanges,
    updatePreview,
    applyChanges,
    resetPreview,
  };
}

/**
 * Gera descrição legível das mudanças de contexto
 */
function getContextChangeDescription(context: ContextPreview): string {
  const changes: string[] = [];

  if (context.tone) {
    const toneLabels: Record<string, string> = {
      epic: 'Épico e Heroico',
      casual: 'Casual e Descontraído',
      horror: 'Horror e Suspense',
      gritty: 'Sombrio e Realista',
    };
    changes.push(`Tom: ${toneLabels[context.tone] || context.tone}`);
  }

  if (context.detail_level) {
    const detailLabels: Record<string, string> = {
      low: 'Baixo (resumido)',
      medium: 'Médio (equilibrado)',
      high: 'Alto (detalhado)',
    };
    changes.push(`Detalhe: ${detailLabels[context.detail_level] || context.detail_level}`);
  }

  if (context.language) {
    const langLabels: Record<string, string> = {
      'pt-BR': 'Português (BR)',
      'en-US': 'English',
      'es-ES': 'Español',
    };
    changes.push(`Idioma: ${langLabels[context.language] || context.language}`);
  }

  if (context.style) {
    changes.push(`Estilo: ${context.style}`);
  }

  return changes.join(' • ');
}
