'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiDiceTwentyFacesTwenty, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { rollDice, DiceResult } from '@/lib/dice-helpers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DiceOption {
  type: 4 | 6 | 8 | 10 | 12 | 20 | 100;
  label: string;
  color: string;
}

interface FloatingDiceButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onRollComplete?: (command: string, result: DiceResult) => void;
  characterName?: string;
}

const diceOptions: DiceOption[] = [
  { type: 4, label: 'd4', color: 'from-blue-600 to-blue-800' },
  { type: 6, label: 'd6', color: 'from-green-600 to-green-800' },
  { type: 8, label: 'd8', color: 'from-yellow-600 to-yellow-800' },
  { type: 10, label: 'd10', color: 'from-orange-600 to-orange-800' },
  { type: 12, label: 'd12', color: 'from-red-600 to-red-800' },
  { type: 20, label: 'd20', color: 'from-purple-600 to-purple-800' },
  { type: 100, label: 'd100', color: 'from-pink-600 to-pink-800' },
];

export default function FloatingDiceButton({
  position = 'bottom-right',
  onRollComplete,
  characterName,
}: FloatingDiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedDice, setSelectedDice] = useState<DiceOption>(diceOptions[5]); // d20 padrão
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [modifier, setModifier] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const handleRoll = async () => {
    if (isRolling) return;

    setIsRolling(true);

    // Monta comando
    let command = `${quantity}d${selectedDice.type}`;
    if (modifier !== 0) {
      command += modifier > 0 ? `+${modifier}` : `${modifier}`;
    }

    try {
      const result = await rollDice(command, {
        characterName,
        context: 'Rolagem rápida',
      });

      setLastResult(result.result);

      if (onRollComplete) {
        onRollComplete(command, result.result);
      }

      // Reseta após 5s
      setTimeout(() => {
        setLastResult(null);
      }, 5000);

    } catch (error: any) {
      console.error('Erro ao rolar dado:', error);
      toast.error(`Erro ao rolar dado: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante Principal */}
      <motion.div
        className={`fixed ${positionClasses[position]} z-50`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full shadow-2xl flex items-center justify-center text-primary-foreground hover:shadow-glow transition-shadow"
        >
          <GiDiceTwentyFacesTwenty className="w-8 h-8" />
        </motion.button>
      </motion.div>

      {/* Menu Suspenso */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed ${position.includes('bottom') ? 'bottom-24' : 'top-24'} ${position.includes('right') ? 'right-6' : 'left-6'} z-40`}
          >
            <Card className="bg-card border-border shadow-2xl p-4 w-80">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary font-medieval flex items-center gap-2">
                  <GiPerspectiveDiceSixFacesRandom className="w-5 h-5" />
                  Rolador Rápido
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  ✕
                </Button>
              </div>

              {/* Seletor de Dados */}
              <div className="mb-4">
                <Label className="text-xs mb-2 block font-ui">
                  Tipo de Dado
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {diceOptions.map((dice) => (
                    <Button
                      key={dice.type}
                      variant={selectedDice.type === dice.type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDice(dice)}
                      className={cn(
                        "font-bold transition-all",
                        selectedDice.type === dice.type && `bg-gradient-to-br ${dice.color} text-white shadow-lg hover:opacity-90`
                      )}
                    >
                      {dice.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantidade e Modificador */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <Label htmlFor="quantity" className="text-xs mb-1 block font-ui">
                    Quantidade
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="text-center font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="modifier" className="text-xs mb-1 block font-ui">
                    Modificador
                  </Label>
                  <Input
                    id="modifier"
                    type="number"
                    min="-10"
                    max="10"
                    value={modifier}
                    onChange={(e) => setModifier(Math.max(-10, Math.min(10, parseInt(e.target.value) || 0)))}
                    className="text-center font-mono"
                  />
                </div>
              </div>

              {/* Preview do Comando */}
              <div className="mb-4 p-2 bg-background/50 rounded border border-border text-center">
                <span className="text-dice-normal font-mono font-bold">
                  {quantity}d{selectedDice.type}
                  {modifier !== 0 && (modifier > 0 ? `+${modifier}` : modifier)}
                </span>
              </div>

              {/* Resultado */}
              {lastResult && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`mb-4 p-6 rounded-lg border-2 ${
                    lastResult.isCritical
                      ? 'bg-dice-critical-bg border-dice-critical'
                      : lastResult.isCriticalFailure
                      ? 'bg-dice-failure-bg border-dice-failure'
                      : 'bg-dice-normal-bg border-dice-normal'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Resultado</div>
                    <div className={`text-6xl font-bold mb-2 ${
                      lastResult.isCritical ? 'text-dice-critical' :
                      lastResult.isCriticalFailure ? 'text-dice-failure' :
                      'text-dice-normal'
                    }`}>
                      {lastResult.finalTotal}
                    </div>
                    {lastResult.isCritical && (
                      <div className="text-dice-critical font-bold text-sm">🌟 CRÍTICO!</div>
                    )}
                    {lastResult.isCriticalFailure && (
                      <div className="text-dice-failure font-bold text-sm">💀 FALHA CRÍTICA!</div>
                    )}
                    {lastResult.rolls && lastResult.rolls.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Dados: [{lastResult.rolls.join(', ')}]
                        {lastResult.modifier !== 0 && ` ${lastResult.modifier > 0 ? '+' : ''}${lastResult.modifier}`}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Botão de Rolar */}
              <Button
                onClick={handleRoll}
                disabled={isRolling}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-3 text-lg shadow-lg"
              >
                {isRolling ? 'Rolando...' : '🎲 Rolar Dados'}
              </Button>

              {/* Atalhos Rápidos */}
              <div className="mt-4 pt-4 border-t border-border">
                <Label className="text-xs mb-2 block font-ui">Atalhos:</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setSelectedDice(diceOptions[5]); setQuantity(1); setModifier(0); }}
                    className="text-xs"
                  >
                    1d20
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setSelectedDice(diceOptions[1]); setQuantity(2); setModifier(0); }}
                    className="text-xs"
                  >
                    2d6
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setSelectedDice(diceOptions[2]); setQuantity(1); setModifier(0); }}
                    className="text-xs"
                  >
                    1d8
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
}
