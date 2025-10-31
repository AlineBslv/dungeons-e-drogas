'use client';

/**
 * ContextPreviewPanel - Painel de Preview de Mudanças de Contexto
 * Mostra uma visualização em tempo real das alterações antes de aplicar
 */

import { motion, AnimatePresence } from 'framer-motion';
import { GiScrollUnfurled, GiCheckMark, GiCancel, GiEyeball } from 'react-icons/gi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useContextUpdates } from '@/hooks/useContextUpdates';
import { useCampaign } from '@/contexts/CampaignContext';

export function ContextPreviewPanel() {
  const { currentCampaign } = useCampaign();
  const { preview, hasChanges, isApplying, applyChanges, resetPreview } = useContextUpdates();

  if (!hasChanges || !preview) return null;

  const currentContext = currentCampaign?.context;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 z-50 w-96 p-5 bg-dark-400 border-2 border-gold-500/40 rounded-lg shadow-2xl backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GiEyeball className="w-5 h-5 text-gold-500 animate-pulse" />
            <h4 className="text-sm font-medieval text-gold-500">Preview de Mudanças</h4>
          </div>
          <button
            onClick={resetPreview}
            disabled={isApplying}
            className="text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <GiCancel className="w-4 h-4" />
          </button>
        </div>

        {/* Comparação de mudanças */}
        <div className="space-y-3 mb-4">
          {preview.tone && preview.tone !== currentContext?.tone && (
            <ChangeItem
              label="Tom"
              oldValue={getToneLabel(currentContext?.tone)}
              newValue={getToneLabel(preview.tone)}
            />
          )}

          {preview.detail_level && preview.detail_level !== currentContext?.detail_level && (
            <ChangeItem
              label="Nível de Detalhe"
              oldValue={getDetailLabel(currentContext?.detail_level)}
              newValue={getDetailLabel(preview.detail_level)}
            />
          )}

          {preview.language && preview.language !== currentContext?.language && (
            <ChangeItem
              label="Idioma"
              oldValue={getLanguageLabel(currentContext?.language)}
              newValue={getLanguageLabel(preview.language)}
            />
          )}

          {preview.style && preview.style !== currentContext?.style && (
            <ChangeItem
              label="Estilo"
              oldValue={currentContext?.style || 'Padrão'}
              newValue={preview.style}
            />
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            onClick={applyChanges}
            disabled={isApplying}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <GiCheckMark className="w-4 h-4" />
            {isApplying ? 'Aplicando...' : 'Aplicar Mudanças'}
          </Button>
          <Button
            onClick={resetPreview}
            disabled={isApplying}
            variant="outline"
            className="gap-2"
          >
            <GiCancel className="w-4 h-4" />
            Cancelar
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ChangeItemProps {
  label: string;
  oldValue?: string;
  newValue: string;
}

function ChangeItem({ label, oldValue, newValue }: ChangeItemProps) {
  return (
    <div className="p-3 bg-dark-500 border border-border rounded-lg">
      <p className="text-xs font-ui text-text-secondary mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {oldValue && (
          <>
            <span className="text-sm text-text-secondary line-through">{oldValue}</span>
            <span className="text-gold-500">→</span>
          </>
        )}
        <span className="text-sm text-gold-500 font-semibold">{newValue}</span>
      </div>
    </div>
  );
}

// Helper functions para labels legíveis
function getToneLabel(tone?: string): string {
  const labels: Record<string, string> = {
    epic: 'Épico e Heroico',
    casual: 'Casual e Descontraído',
    horror: 'Horror e Suspense',
    gritty: 'Sombrio e Realista',
  };
  return tone ? labels[tone] || tone : 'Não definido';
}

function getDetailLabel(level?: string): string {
  const labels: Record<string, string> = {
    low: 'Baixo (resumido)',
    medium: 'Médio (equilibrado)',
    high: 'Alto (detalhado)',
  };
  return level ? labels[level] || level : 'Não definido';
}

function getLanguageLabel(lang?: string): string {
  const labels: Record<string, string> = {
    'pt-BR': 'Português (BR)',
    'en-US': 'English',
    'es-ES': 'Español',
  };
  return lang ? labels[lang] || lang : 'Não definido';
}
