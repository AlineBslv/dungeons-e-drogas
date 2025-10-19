'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  createCampaign,
  getCampaign,
  updateCampaign,
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
  updateCampaignContext: (context: Partial<CampaignContextType>) => Promise<void>;
  refreshCampaigns: () => Promise<void>;
}

const CampaignContext = createContext<CampaignProviderState | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const { user, userProfile } = useAuth();
  const [currentCampaign, setCurrentCampaign] = useState<(Campaign & { id: string }) | null>(null);
  const [campaigns, setCampaigns] = useState<(Campaign & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega campanhas do usuário
  const refreshCampaigns = async () => {
    if (!user || !userProfile) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      const isMaster = userProfile.tier === 'mestre';
      const userCampaigns = await getUserCampaigns(user.uid, isMaster);
      setCampaigns(userCampaigns);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCampaigns();
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
        title,
        context: campaignContext,
      };

      // Só adiciona description se não for undefined
      if (description) {
        campaignData.description = description;
      }

      const campaignId = await createCampaign(user.uid, campaignData);

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
      }
    } catch (error) {
      console.error('Erro ao selecionar campanha:', error);
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
