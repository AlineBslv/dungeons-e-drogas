'use client';

import { useState } from 'react';
import DiceRoller from './DiceRoller';
import QuickActions from './QuickActions';
import { CharacterSheet } from '@/lib/firestore-helpers';

interface DiceResult {
  rolls: number[];
  total: number;
  modifier: number;
  finalTotal: number;
  isCritical: boolean;
  isCriticalFailure: boolean;
  diceType: number;
  quantity: number;
}

interface PlayerDicePanelProps {
  characterName?: string;
  characterStats?: {
    strength?: number;
    dexterity?: number;
    wisdom?: number;
    charisma?: number;
  };
  character?: CharacterSheet; // Nova prop: ficha completa
  onRollComplete?: (command: string, result: DiceResult, context?: string) => void;
}

export default function PlayerDicePanel({
  characterName,
  characterStats,
  character,
  onRollComplete,
}: PlayerDicePanelProps) {
  const [currentContext, setCurrentContext] = useState<string | undefined>();

  const handleDiceRoll = (command: string, result: DiceResult) => {
    if (onRollComplete) {
      onRollComplete(command, result, currentContext);
    }
    setCurrentContext(undefined);
  };

  const handleQuickAction = (action: any, rollCommand: string) => {
    setCurrentContext(action.description);
    // Trigger dice roll through DiceRoller
    const event = new CustomEvent('quickActionRoll', {
      detail: { command: rollCommand, context: action.description }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-4">
      {/* Ações Rápidas */}
      <QuickActions
        character={character}
        characterModifiers={characterStats}
        onAction={handleQuickAction}
      />

      {/* Rolador de Dados */}
      <DiceRoller
        characterName={characterName}
        context={currentContext}
        onRoll={handleDiceRoll}
      />
    </div>
  );
}
