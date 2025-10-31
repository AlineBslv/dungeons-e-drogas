'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign as deleteCampaignFromFirestore,
  getUserCampaigns,
  Campaign,
  CampaignContext as CampaignContextType,
} from '@/lib/firestore-helpers';

interface CampaignProviderState {
  currentCampaign: (Campaign & { id: string }) | null;
  campaigns: (Campaign & { id: string })[];
  loading: boolean;
  createNewCampaign: (title: string, description?: string, context?: Partial<CampaignContextType>) => Promise<string>;
  selectCampaign: (campaignId: string) => Promise<void>;
  deselectCampaign: () => void;
  deleteCampaign: (campaignId: string) => Promise<void>;
  updateCampaignContext: (context: Partial<CampaignContextType>) => Promise<void>;
  refreshCampaigns: () => Promise<void>;
}

const CampaignContext = createContext<CampaignProviderState | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const { user, userProfile } = useAuth();
  const [currentCampaign, setCurrentCampaign] = useState<(Campaign & { id: string }) | null>(null);
  const [campaigns, setCampaigns] = useState<(Campaign & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);

  // Carrega campanhas do usuário
  const refreshCampaigns = async () => {
    if (!user || !userProfile) {
      console.log('[CampaignContext] refreshCampaigns: user ou userProfile não disponível');
      setCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      const isMaster = userProfile.tier === 'mestre';
      console.log('[CampaignContext] Carregando campanhas para:', user.uid, 'isMaster:', isMaster);
      const userCampaigns = await getUserCampaigns(user.uid, isMaster);
      console.log('[CampaignContext] Campanhas carregadas:', userCampaigns.length, userCampaigns);
      setCampaigns(userCampaigns);
    } catch (error) {
      console.error('[CampaignContext] Erro ao carregar campanhas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile]);

  const createNewCampaign = async (
    title: string,
    description?: string,
    context?: Partial<CampaignContextType>
  ): Promise<string> => {
    console.log('createNewCampaign - user:', user?.uid);
    console.log('createNewCampaign - userProfile:', userProfile);

    if (!user || userProfile?.tier !== 'mestre') {
      throw new Error('Apenas mestres podem criar campanhas');
    }

    try {
      const campaignContext: any = {
        tone: context?.tone || userProfile.preferred_tone || 'epic',
        detail_level: context?.detail_level || 'medium',
        language: context?.language || 'pt-BR',
      };

      // Só adiciona style se não for undefined
      if (context?.style) {
        campaignContext.style = context.style;
      }

      const campaignData: any = {
        context: campaignContext,
      };

      // Só adiciona description se não for undefined
      if (description) {
        campaignData.description = description;
      }

      const campaignId = await createCampaign(user.uid, title, campaignData);

      await refreshCampaigns();
      return campaignId;
    } catch (error: any) {
      console.error('Erro detalhado ao criar campanha:', error);
      console.error('Mensagem de erro:', error?.message);
      console.error('Stack:', error?.stack);
      console.error('Code:', error?.code);
      throw error;
    }
  };

  const selectCampaign = async (campaignId: string) => {
    try {
      const campaign = await getCampaign(campaignId);
      if (campaign) {
        setCurrentCampaign({ id: campaignId, ...campaign });
        setCurrentCampaignId(campaignId);
      }
    } catch (error) {
      console.error('Erro ao selecionar campanha:', error);
    }
  };

  // Listener real-time para currentCampaign
  useEffect(() => {
    if (!currentCampaignId) {
      setCurrentCampaign(null);
      return;
    }

    console.log('[CampaignContext] Iniciando listener real-time para campanha:', currentCampaignId);

    const campaignRef = doc(db, 'campaigns', currentCampaignId);
    const unsubscribe = onSnapshot(campaignRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log('[CampaignContext] Campanha atualizada:', snapshot.data());
        setCurrentCampaign({ id: snapshot.id, ...snapshot.data() } as Campaign & { id: string });
      } else {
        console.warn('[CampaignContext] Campanha não encontrada:', currentCampaignId);
        setCurrentCampaign(null);
      }
    });

    return () => {
      console.log('[CampaignContext] Removendo listener para campanha:', currentCampaignId);
      unsubscribe();
    };
  }, [currentCampaignId]);

  const deselectCampaign = () => {
    setCurrentCampaign(null);
    setCurrentCampaignId(null);
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      console.log('[CampaignContext] Deletando campanha:', campaignId);
      await deleteCampaignFromFirestore(campaignId);

      // Se a campanha deletada era a atual, desseleciona
      if (currentCampaign?.id === campaignId) {
        setCurrentCampaign(null);
      }

      // Atualiza lista de campanhas
      await refreshCampaigns();
    } catch (error) {
      console.error('[CampaignContext] Erro ao deletar campanha:', error);
      throw error;
    }
  };

  const updateCampaignContext = async (context: Partial<CampaignContextType>) => {
    if (!currentCampaign) {
      throw new Error('Nenhuma campanha selecionada');
    }

    await updateCampaign(currentCampaign.id, {
      context: { ...currentCampaign.context, ...context },
    });

    // Atualiza estado local
    setCurrentCampaign({
      ...currentCampaign,
      context: { ...currentCampaign.context, ...context },
    });
  };

  return (
    <CampaignContext.Provider
      value={{
        currentCampaign,
        campaigns,
        loading,
        createNewCampaign,
        selectCampaign,
        deselectCampaign,
        deleteCampaign,
        updateCampaignContext,
        refreshCampaigns,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign deve ser usado dentro de CampaignProvider');
  }
  return context;
}
