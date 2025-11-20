'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sword, Shield, Eye, MessageCircle, Sparkles, Heart } from 'lucide-react';
import { CharacterSheet } from '@/lib/firestore-helpers';
import { getAllCharacterDiceActions, DiceAction } from '@/lib/character-dice-actions';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  diceCommand: string;
  description: string;
  color: string;
  modifier?: number;
}

interface QuickActionsProps {
  onAction?: (action: QuickAction, rollCommand: string) => void;
  characterModifiers?: {
    strength?: number;
    dexterity?: number;
    wisdom?: number;
    charisma?: number;
  };
  character?: CharacterSheet; // Nova prop: ficha completa do personagem
}

export default function QuickActions({
  onAction,
  characterModifiers = {},
  character
}: QuickActionsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const getModifier = (stat: keyof typeof characterModifiers): number => {
    const value = characterModifiers[stat] || 0;
    return Math.floor((value - 10) / 2);
  };

  // Se temos uma ficha completa, usa as ações dela
  const characterActions = character ? getAllCharacterDiceActions(character) : null;

  // Converte DiceAction para QuickAction
  const convertDiceAction = (diceAction: DiceAction, icon: React.ReactNode, color: string): QuickAction => ({
    id: diceAction.id,
    label: diceAction.label,
    icon,
    diceCommand: diceAction.command,
    description: diceAction.description,
    color,
    modifier: diceAction.modifier,
  });

  // Se temos ficha, usa ataques e perícias reais
  let actions: QuickAction[] = [];

  if (characterActions) {
    // Usa ataques e perícias da ficha
    actions = [
      // Ataques principais (até 2)
      ...characterActions.attacks.slice(0, 2).map(action =>
        convertDiceAction(action, <Sword className="w-5 h-5" />, 'from-red-600 to-red-800')
      ),
      // Perícias treinadas (até 4)
      ...characterActions.skills.slice(0, 4).map(action =>
        convertDiceAction(
          action,
          action.isProficient ? <Sparkles className="w-5 h-5" /> : <Eye className="w-5 h-5" />,
          'from-purple-600 to-purple-800'
        )
      ),
    ];
  } else {
    // Fallback: ações genéricas se não temos ficha
    actions = [
    {
      id: 'attack',
      label: 'Atacar',
      icon: <Sword className="w-5 h-5" />,
      diceCommand: `1d20${getModifier('strength') >= 0 ? '+' : ''}${getModifier('strength') || ''}`,
      description: 'Ataque corpo a corpo',
      color: 'from-red-600 to-red-800',
      modifier: getModifier('strength'),
    },
    {
      id: 'defend',
      label: 'Defender',
      icon: <Shield className="w-5 h-5" />,
      diceCommand: `1d20${getModifier('dexterity') >= 0 ? '+' : ''}${getModifier('dexterity') || ''}`,
      description: 'Esquiva ou bloqueio',
      color: 'from-blue-600 to-blue-800',
      modifier: getModifier('dexterity'),
    },
    {
      id: 'investigate',
      label: 'Investigar',
      icon: <Eye className="w-5 h-5" />,
      diceCommand: `1d20${getModifier('wisdom') >= 0 ? '+' : ''}${getModifier('wisdom') || ''}`,
      description: 'Percepção e investigação',
      color: 'from-purple-600 to-purple-800',
      modifier: getModifier('wisdom'),
    },
    {
      id: 'persuade',
      label: 'Persuadir',
      icon: <MessageCircle className="w-5 h-5" />,
      diceCommand: `1d20${getModifier('charisma') >= 0 ? '+' : ''}${getModifier('charisma') || ''}`,
      description: 'Convencer ou intimidar',
      color: 'from-yellow-600 to-yellow-800',
      modifier: getModifier('charisma'),
    },
    {
      id: 'magic',
      label: 'Magia',
      icon: <Sparkles className="w-5 h-5" />,
      diceCommand: '1d20',
      description: 'Lançar feitiço',
      color: 'from-cyan-600 to-cyan-800',
    },
    {
      id: 'heal',
      label: 'Curar',
      icon: <Heart className="w-5 h-5" />,
      diceCommand: '1d8+2',
      description: 'Cura básica',
      color: 'from-green-600 to-green-800',
    },
    ];
  }

  // Limita a 6 ações no total
  const displayActions = actions.slice(0, 6);

  const handleAction = async (action: QuickAction) => {
    setSelectedAction(action.id);

    // Feedback visual
    setTimeout(() => setSelectedAction(null), 600);

    if (onAction) {
      onAction(action, action.diceCommand);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-stone-900 to-stone-950 border-amber-900/30">
      <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
        ⚔️ Ações Rápidas
        {character && (
          <span className="text-xs font-normal text-stone-400">
            ({character.name})
          </span>
        )}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayActions.map((action) => (
          <motion.div
            key={action.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => handleAction(action)}
              className={`
                relative w-full h-24 flex flex-col items-center justify-center gap-2
                bg-gradient-to-br ${action.color}
                hover:brightness-110 transition-all
                border-2 border-white/20 shadow-lg
                ${selectedAction === action.id ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-stone-950' : ''}
              `}
            >
              {/* Ícone */}
              <div className="text-white">
                {action.icon}
              </div>

              {/* Label */}
              <span className="text-white font-bold text-sm">
                {action.label}
              </span>

              {/* Modificador */}
              {action.modifier !== undefined && action.modifier !== 0 && (
                <span className="absolute top-1 right-2 text-xs font-mono text-white/80">
                  {action.modifier > 0 ? '+' : ''}{action.modifier}
                </span>
              )}

              {/* Comando de dado */}
              <span className="absolute bottom-1 text-[10px] font-mono text-white/60">
                {action.diceCommand}
              </span>
            </Button>

            {/* Tooltip/descrição */}
            <p className="text-center text-xs text-stone-500 mt-1">
              {action.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-4 p-3 bg-stone-800/50 rounded border border-amber-900/30">
        <p className="text-xs text-stone-400 text-center">
          💡 Clique em uma ação para rolar automaticamente com seus modificadores
        </p>
      </div>
    </Card>
  );
}
