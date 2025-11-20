'use client';

/**
 * Card especializado para exibir ações de personagem no chat
 */

import { Sword, Sparkles, Target, Shield, Dumbbell } from 'lucide-react';
import type { CharacterAction } from '@/hooks/useCharacterActions';
import { Badge } from '@/components/ui/badge';

interface CharacterActionCardProps {
  characterName: string;
  characterClass: string;
  action: CharacterAction;
  timestamp?: string;
}

export function CharacterActionCard({
  characterName,
  characterClass,
  action,
  timestamp,
}: CharacterActionCardProps) {
  const icon = getActionIcon(action.type);
  const color = getActionColor(action.type);
  const isCritical = action.roll?.isCritical || false;
  const isCriticalFailure = action.roll?.isCriticalFailure || false;

  return (
    <div className={`
      rounded-lg border-2 p-4 space-y-3
      bg-gradient-to-br from-card/95 to-card/80
      backdrop-blur-sm shadow-lg
      ${isCritical ? 'border-yellow-500/60 shadow-yellow-500/20' : ''}
      ${isCriticalFailure ? 'border-red-500/60 shadow-red-500/20' : ''}
      ${!isCritical && !isCriticalFailure ? `border-${color}-500/30` : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-500/20`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{characterName}</p>
              <Badge variant="outline" className="text-xs">
                {characterClass}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {getActionTitle(action)}
            </p>
          </div>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        )}
      </div>

      {/* Main Roll Result */}
      {action.roll && (
        <div className={`
          p-3 rounded-md text-center
          ${isCritical ? 'bg-yellow-500/20 border border-yellow-500/40' : ''}
          ${isCriticalFailure ? 'bg-red-500/20 border border-red-500/40' : ''}
          ${!isCritical && !isCriticalFailure ? `bg-${color}-500/10` : ''}
        `}>
          <div className="text-3xl font-bold text-foreground mb-1">
            {action.roll.finalTotal}
          </div>
          <div className="text-sm text-muted-foreground">
            [{action.roll.rolls.join(', ')}]
            {action.roll.modifier !== 0 && (
              <span className="ml-1">
                {action.roll.modifier > 0 ? '+' : ''}{action.roll.modifier}
              </span>
            )}
          </div>
          {isCritical && (
            <div className="mt-2 text-yellow-500 font-semibold text-sm animate-pulse">
              ⭐ ACERTO CRÍTICO!
            </div>
          )}
          {isCriticalFailure && (
            <div className="mt-2 text-red-500 font-semibold text-sm">
              💀 FALHA CRÍTICA!
            </div>
          )}
        </div>
      )}

      {/* Damage (for attacks) */}
      {action.type === 'attack' && action.metadata?.damage && (
        <div className="bg-red-500/10 p-3 rounded-md">
          <p className="text-xs text-muted-foreground mb-1">Dano</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-red-400">
              {action.metadata.damage.finalTotal}
            </span>
            <span className="text-sm text-muted-foreground">
              [{action.metadata.damage.rolls.join(', ')}]
              {action.metadata.damage.modifier !== 0 && (
                <span className="ml-1">
                  {action.metadata.damage.modifier > 0 ? '+' : ''}{action.metadata.damage.modifier}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Spell Details */}
      {action.type === 'spell' && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Nível da Magia</span>
            <Badge variant="secondary">{action.metadata?.spellLevel}</Badge>
          </div>
          {action.metadata?.saveDC && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">CD de Resistência</span>
              <Badge variant="outline">
                {action.metadata.saveType?.toUpperCase()} CD {action.metadata.saveDC}
              </Badge>
            </div>
          )}
          {action.metadata?.damage && (
            <div className="bg-purple-500/10 p-3 rounded-md mt-2">
              <p className="text-xs text-muted-foreground mb-1">
                Dano ({action.metadata.damageType || 'mágico'})
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-400">
                  {action.metadata.damage.finalTotal}
                </span>
                <span className="text-sm text-muted-foreground">
                  [{action.metadata.damage.rolls.join(', ')}]
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skill/Save Metadata */}
      {(action.type === 'skill' || action.type === 'save') && (
        <div className="flex gap-2">
          {action.metadata?.isExpertise && (
            <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
              ⭐ Especializado
            </Badge>
          )}
          {action.metadata?.isProficient && !action.metadata?.isExpertise && (
            <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/40">
              ✓ Proficiente
            </Badge>
          )}
        </div>
      )}

      {/* Description */}
      {action.description && action.type === 'spell' && (
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground transition-colors">
            Ver descrição
          </summary>
          <p className="mt-2 text-xs leading-relaxed">{action.description}</p>
        </details>
      )}
    </div>
  );
}

/**
 * Retorna ícone baseado no tipo de ação
 */
function getActionIcon(type: CharacterAction['type']) {
  switch (type) {
    case 'attack':
      return <Sword className="w-5 h-5 text-red-400" />;
    case 'spell':
      return <Sparkles className="w-5 h-5 text-purple-400" />;
    case 'skill':
      return <Target className="w-5 h-5 text-blue-400" />;
    case 'save':
      return <Shield className="w-5 h-5 text-green-400" />;
    case 'ability_check':
      return <Dumbbell className="w-5 h-5 text-orange-400" />;
    default:
      return <Target className="w-5 h-5 text-gray-400" />;
  }
}

/**
 * Retorna cor do tema baseado no tipo de ação
 */
function getActionColor(type: CharacterAction['type']): string {
  switch (type) {
    case 'attack':
      return 'red';
    case 'spell':
      return 'purple';
    case 'skill':
      return 'blue';
    case 'save':
      return 'green';
    case 'ability_check':
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * Gera título descritivo da ação
 */
function getActionTitle(action: CharacterAction): string {
  switch (action.type) {
    case 'attack':
      return `Ataca com ${action.name}`;
    case 'spell':
      return `Lança ${action.name}`;
    case 'skill':
      return `Teste de ${action.name}`;
    case 'save':
      return `Resistência de ${action.name}`;
    case 'ability_check':
      return `Teste de ${action.name}`;
    default:
      return action.name;
  }
}
