'use client';

/**
 * ContextControlPanel - Painel de Controle de Contexto para Mestres
 * Permite ajustar tom, detalhamento e idioma da narrativa em tempo real
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiScrollQuill, GiThreeFriends, GiWorld, GiFeather } from 'react-icons/gi';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCampaign } from '@/contexts/CampaignContext';
import { useContextUpdates } from '@/hooks/useContextUpdates';
import { toast } from 'sonner';

export function ContextControlPanel() {
  const { currentCampaign } = useCampaign();
  const { updatePreview } = useContextUpdates();

  const [tone, setTone] = useState<string>(currentCampaign?.context?.tone || 'epic');
  const [detailLevel, setDetailLevel] = useState<string>(currentCampaign?.context?.detail_level || 'medium');
  const [language, setLanguage] = useState<string>(currentCampaign?.context?.language || 'pt-BR');

  // Sincroniza com mudanças da campanha
  useEffect(() => {
    if (currentCampaign?.context) {
      setTone(currentCampaign.context.tone || 'epic');
      setDetailLevel(currentCampaign.context.detail_level || 'medium');
      setLanguage(currentCampaign.context.language || 'pt-BR');
    }
  }, [currentCampaign?.context]);

  // Atualiza preview quando os valores mudam
  useEffect(() => {
    if (
      tone !== currentCampaign?.context?.tone ||
      detailLevel !== currentCampaign?.context?.detail_level ||
      language !== currentCampaign?.context?.language
    ) {
      updatePreview({
        tone: tone as any,
        detail_level: detailLevel as any,
        language: language as any
      });
    }
  }, [tone, detailLevel, language, currentCampaign?.context, updatePreview]);

  if (!currentCampaign) {
    return (
      <div className="p-4 border border-border rounded-lg bg-dark-400">
        <p className="text-sm text-text-secondary">Selecione uma campanha para ajustar o contexto.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 border border-gold-500/30 rounded-lg bg-dark-400 shadow-lg space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <GiScrollQuill className="w-5 h-5 text-gold-500" />
        <h3 className="text-lg font-medieval text-gold-500">Controle de Contexto</h3>
      </div>

      {/* Tom da Narrativa */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-ui text-text-secondary">
          <GiFeather className="w-4 h-4" />
          Tom da Narrativa
        </Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger className="w-full bg-dark-500 border-border">
            <SelectValue placeholder="Selecione o tom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="epic">✨ Épico e Heroico</SelectItem>
            <SelectItem value="casual">😄 Casual e Descontraído</SelectItem>
            <SelectItem value="horror">🎃 Horror e Suspense</SelectItem>
            <SelectItem value="dark">🌑 Sombrio e Realista</SelectItem>
            <SelectItem value="comic">🎭 Cômico e Divertido</SelectItem>
            <SelectItem value="neutral">⚖️ Neutro e Padrão</SelectItem>
            <SelectItem value="mystical">🔮 Místico e Enigmático</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-text-secondary">
          {getToneDescription(tone)}
        </p>
      </div>

      {/* Nível de Detalhamento */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-ui text-text-secondary">
          <GiScrollQuill className="w-4 h-4" />
          Nível de Detalhamento
        </Label>
        <Select value={detailLevel} onValueChange={setDetailLevel}>
          <SelectTrigger className="w-full bg-dark-500 border-border">
            <SelectValue placeholder="Selecione o nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">⚡ Baixo (resumido e rápido)</SelectItem>
            <SelectItem value="medium">⚖️ Médio (equilibrado)</SelectItem>
            <SelectItem value="high">📜 Alto (muito detalhado)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-text-secondary">
          {getDetailDescription(detailLevel)}
        </p>
      </div>

      {/* Idioma */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-ui text-text-secondary">
          <GiWorld className="w-4 h-4" />
          Idioma
        </Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full bg-dark-500 border-border">
            <SelectValue placeholder="Selecione o idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
            <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
            <SelectItem value="es-ES">🇪🇸 Español</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Informativo */}
      <div className="mt-4 p-3 bg-dark-500 border border-gold-500/20 rounded-lg">
        <p className="text-xs text-text-secondary flex items-center gap-2">
          <GiThreeFriends className="w-4 h-4 text-gold-500" />
          As mudanças serão aplicadas em tempo real para todos os jogadores quando você clicar em <strong className="text-gold-500">"Aplicar Mudanças"</strong> no preview.
        </p>
      </div>
    </motion.div>
  );
}

// Helper functions para descrições
function getToneDescription(tone: string): string {
  const descriptions: Record<string, string> = {
    epic: 'Narrativas grandiosas com linguagem pomposa e dramática',
    casual: 'Diálogos leves, humor e atmosfera relaxada',
    horror: 'Suspense, mistério e elementos macabros',
    gritty: 'Realismo cru, consequências duras e tom adulto',
  };
  return descriptions[tone] || '';
}

function getDetailDescription(level: string): string {
  const descriptions: Record<string, string> = {
    low: 'Respostas curtas e objetivas, foco em ação',
    medium: 'Descrições moderadas com bom equilíbrio',
    high: 'Narrativas ricas em detalhes sensoriais e ambientação',
  };
  return descriptions[level] || '';
}
