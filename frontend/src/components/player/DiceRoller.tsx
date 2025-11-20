'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

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

interface DiceRollerProps {
  onRoll?: (command: string, result: DiceResult) => void;
  characterName?: string;
  context?: string;
}

export default function DiceRoller({ onRoll, characterName, context }: DiceRollerProps) {
  const [customCommand, setCustomCommand] = useState('');
  const [rolling, setRolling] = useState(false);
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const diceTypes = [
    { type: 'd4', sides: 4, color: 'from-blue-600 to-blue-800' },
    { type: 'd6', sides: 6, color: 'from-green-600 to-green-800' },
    { type: 'd8', sides: 8, color: 'from-yellow-600 to-yellow-800' },
    { type: 'd10', sides: 10, color: 'from-orange-600 to-orange-800' },
    { type: 'd12', sides: 12, color: 'from-red-600 to-red-800' },
    { type: 'd20', sides: 20, color: 'from-purple-600 to-purple-800' },
    { type: 'd100', sides: 100, color: 'from-pink-600 to-pink-800' },
  ];

  const rollDice = async (command: string) => {
    setRolling(true);
    setShowResult(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dice/roll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          command,
          characterName,
          context,
          campaignId: localStorage.getItem('currentCampaignId'),
          userId: localStorage.getItem('userId'),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao rolar dados');
      }

      const data = await response.json();

      // Animação de rolagem (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLastResult(data.result);
      setShowResult(true);

      if (onRoll) {
        onRoll(command, data.result);
      }

    } catch (err) {
      console.error('Erro ao rolar dados:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao rolar dados');
    } finally {
      setRolling(false);
    }
  };

  const handleQuickRoll = (diceType: string) => {
    rollDice(`1${diceType}`);
  };

  const handleCustomRoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCommand.trim()) {
      rollDice(customCommand.trim());
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-stone-900 to-stone-950 border-amber-900/30">
      <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
        🎲 Rolador de Dados
      </h3>

      {/* Dados rápidos */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {diceTypes.map((dice) => (
          <Button
            key={dice.type}
            onClick={() => handleQuickRoll(dice.type)}
            disabled={rolling}
            className={`bg-gradient-to-br ${dice.color} hover:scale-105 transition-transform font-bold text-white border-2 border-white/20 shadow-lg`}
          >
            {dice.type.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Input customizado */}
      <form onSubmit={handleCustomRoll} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ex: 2d6+3, 1d20+5"
            value={customCommand}
            onChange={(e) => setCustomCommand(e.target.value)}
            disabled={rolling}
            className="bg-stone-800 border-amber-900/50 text-amber-100 placeholder:text-stone-500"
          />
          <Button
            type="submit"
            disabled={rolling || !customCommand.trim()}
            className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
          >
            Rolar
          </Button>
        </div>
        <p className="text-xs text-stone-500 mt-2">
          Formato: XdY+Z (quantidade de dados, tipo, modificador)
        </p>
      </form>

      {/* Animação de rolagem */}
      <AnimatePresence mode="wait">
        {rolling && (
          <motion.div
            key="rolling"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-center py-8"
          >
            <div className="text-6xl">🎲</div>
            <p className="text-amber-400 mt-2 font-semibold">Rolando...</p>
          </motion.div>
        )}

        {/* Resultado */}
        {showResult && lastResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-6 rounded-lg border-2 ${
              lastResult.isCritical
                ? 'bg-green-950/50 border-green-500 shadow-green-500/50'
                : lastResult.isCriticalFailure
                ? 'bg-red-950/50 border-red-500 shadow-red-500/50'
                : 'bg-stone-800/50 border-amber-600'
            } shadow-lg`}
          >
            {/* Total destacado */}
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-amber-300">
                {lastResult.finalTotal}
              </div>
              {lastResult.isCritical && (
                <div className="text-green-400 font-bold text-lg mt-2">
                  🌟 CRÍTICO!
                </div>
              )}
              {lastResult.isCriticalFailure && (
                <div className="text-red-400 font-bold text-lg mt-2">
                  💀 FALHA CRÍTICA!
                </div>
              )}
            </div>

            {/* Detalhes da rolagem */}
            <div className="text-center text-sm text-stone-300">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-stone-400">Dados:</span>
                <span className="font-mono font-bold text-amber-200">
                  [{lastResult.rolls.join(', ')}]
                </span>
              </div>

              {lastResult.modifier !== 0 && (
                <div className="text-stone-400">
                  Modificador:
                  <span className="font-bold text-amber-300 ml-1">
                    {lastResult.modifier > 0 ? '+' : ''}{lastResult.modifier}
                  </span>
                </div>
              )}

              <div className="text-stone-500 text-xs mt-2">
                {lastResult.quantity}d{lastResult.diceType}
                {lastResult.modifier !== 0 && (lastResult.modifier > 0 ? '+' : '')}
                {lastResult.modifier !== 0 && lastResult.modifier}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dica de uso */}
      {!rolling && !showResult && (
        <div className="text-center text-stone-500 text-sm mt-4">
          Clique em um dado ou digite um comando personalizado
        </div>
      )}
    </Card>
  );
}
