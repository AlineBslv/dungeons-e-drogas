'use client';

import { useAuth } from '@/contexts/AuthContext';
import FloatingDiceButton from './FloatingDiceButton';
import { DiceResult } from '@/lib/dice-helpers';
import { useState } from 'react';

/**
 * Botão de dados global que aparece em todas as páginas autenticadas
 * Salva rolagens no localStorage para sincronização futura
 */
export default function GlobalDiceButton() {
  const { user } = useAuth();
  const [lastRolls, setLastRolls] = useState<Array<{ command: string; result: DiceResult }>>([]);

  if (!user) return null;

  const handleRollComplete = (command: string, result: DiceResult) => {
    // Salva últimas 10 rolagens no localStorage
    const rolls = [{ command, result, timestamp: Date.now() }, ...lastRolls].slice(0, 10);
    setLastRolls(rolls);
    localStorage.setItem('recentDiceRolls', JSON.stringify(rolls));

    // Dispara evento global para outras páginas escutarem
    window.dispatchEvent(new CustomEvent('diceRolled', {
      detail: { command, result, user: user.displayName || user.email }
    }));

    console.log(`🎲 ${user.displayName || 'Usuário'} rolou ${command}: ${result.finalTotal}`);
  };

  return (
    <FloatingDiceButton
      position="bottom-right"
      onRollComplete={handleRollComplete}
      characterName={user.displayName || user.email || 'Jogador'}
    />
  );
}
