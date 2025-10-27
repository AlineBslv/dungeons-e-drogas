"use client";

import { motion } from "framer-motion";
import {
  GiGearHammer,
  GiMagicSwirl,
  GiEarthAmerica,
  GiSoundWaves,
  GiPaintBrush
} from "react-icons/gi";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { slideInRight } from "@/lib/motion-presets";
import { useCampaign } from "@/contexts/CampaignContext";
import { useState } from "react";

export interface ContextPanelProps {
  className?: string;
}

type ToneType = 'epic' | 'casual' | 'horror';
type DetailLevelType = 'low' | 'medium' | 'high';
type LanguageType = 'pt-BR' | 'en-US' | 'es-ES';

const TONE_MAP: Record<string, ToneType> = {
  'Épico': 'epic',
  'Casual': 'casual',
  'Sombrio': 'horror',
};

const DETAIL_MAP: Record<string, DetailLevelType> = {
  'Baixo': 'low',
  'Médio': 'medium',
  'Alto': 'high',
};

const LANGUAGE_MAP: Record<string, LanguageType> = {
  'Português (BR)': 'pt-BR',
  'English': 'en-US',
  'Español': 'es-ES',
};

/**
 * Context Panel - Painel de configuração de contexto da IA
 */
export function ContextPanel({ className }: ContextPanelProps) {
  const { currentCampaign, updateCampaignContext } = useCampaign();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToneChange = async (displayTone: string) => {
    if (!currentCampaign || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateCampaignContext({ tone: TONE_MAP[displayTone] });
    } catch (error) {
      console.error('Erro ao atualizar tom:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDetailChange = async (displayLevel: string) => {
    if (!currentCampaign || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateCampaignContext({ detail_level: DETAIL_MAP[displayLevel] });
    } catch (error) {
      console.error('Erro ao atualizar nível de detalhe:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLanguageChange = async (displayLang: string) => {
    if (!currentCampaign || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateCampaignContext({ language: LANGUAGE_MAP[displayLang] });
    } catch (error) {
      console.error('Erro ao atualizar idioma:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentTone = currentCampaign?.context?.tone || 'epic';
  const currentDetail = currentCampaign?.context?.detail_level || 'medium';
  const currentLanguage = currentCampaign?.context?.language || 'pt-BR';

  return (
    <motion.aside
      variants={slideInRight}
      initial="initial"
      animate="animate"
      exit="initial"
      className={cn(
        "fixed right-0 top-16 z-30 h-[calc(100vh-4rem)] w-80 border-l border-border bg-dark-300 shadow-xl overflow-y-auto",
        className
      )}
    >
      <div className="p-4 space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <GiGearHammer className="h-5 w-5 text-gold-500" />
          <h2 className="text-lg font-medieval text-gold-500">Contexto IA</h2>
        </div>

        {!currentCampaign && (
          <Card className="border-gold-500/30 bg-dark-500/50">
            <CardContent className="pt-4">
              <p className="text-xs font-ui text-text-secondary text-center">
                Selecione uma campanha para configurar o contexto
              </p>
            </CardContent>
          </Card>
        )}

        {currentCampaign && (
          <>
            {/* Tom Narrativo */}
            <Card className="border-gold-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 font-ui text-text-primary">
                  <GiPaintBrush className="h-4 w-4 text-gold-500" />
                  Tom Narrativo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.keys(TONE_MAP).map((displayTone) => (
                  <button
                    key={displayTone}
                    onClick={() => handleToneChange(displayTone)}
                    disabled={isUpdating}
                    className={cn(
                      "w-full px-3 py-2 rounded-md text-sm font-ui transition-all",
                      TONE_MAP[displayTone] === currentTone
                        ? "bg-gold-500/20 text-gold-500 border border-gold-500/50 shadow-glow"
                        : "bg-dark-500 text-text-secondary hover:bg-dark-500/80 hover:text-gold-300 hover:border hover:border-gold-500/30 active:scale-95",
                      isUpdating && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {displayTone}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Nível de Detalhe */}
            <Card className="border-gold-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 font-ui text-text-primary">
                  <GiMagicSwirl className="h-4 w-4 text-gold-500" />
                  Nível de Detalhe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.keys(DETAIL_MAP).map((displayLevel) => (
                  <button
                    key={displayLevel}
                    onClick={() => handleDetailChange(displayLevel)}
                    disabled={isUpdating}
                    className={cn(
                      "w-full px-3 py-2 rounded-md text-sm font-ui transition-all",
                      DETAIL_MAP[displayLevel] === currentDetail
                        ? "bg-gold-500/20 text-gold-500 border border-gold-500/50 shadow-glow"
                        : "bg-dark-500 text-text-secondary hover:bg-dark-500/80 hover:text-gold-300 hover:border hover:border-gold-500/30 active:scale-95",
                      isUpdating && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {displayLevel}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Idioma */}
            <Card className="border-gold-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 font-ui text-text-primary">
                  <GiEarthAmerica className="h-4 w-4 text-gold-500" />
                  Idioma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.keys(LANGUAGE_MAP).map((displayLang) => (
                  <button
                    key={displayLang}
                    onClick={() => handleLanguageChange(displayLang)}
                    disabled={isUpdating}
                    className={cn(
                      "w-full px-3 py-2 rounded-md text-sm font-ui transition-all",
                      LANGUAGE_MAP[displayLang] === currentLanguage
                        ? "bg-gold-500/20 text-gold-500 border border-gold-500/50 shadow-glow"
                        : "bg-dark-500 text-text-secondary hover:bg-dark-500/80 hover:text-gold-300 hover:border hover:border-gold-500/30 active:scale-95",
                      isUpdating && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {displayLang}
                  </button>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Status IA */}
        <Card className="border-emerald/30 bg-dark-500/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                <span className="text-xs font-ui text-text-secondary">
                  Mestre Drogon ativo
                </span>
              </div>
              <GiSoundWaves className="h-4 w-4 text-gold-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.aside>
  );
}
