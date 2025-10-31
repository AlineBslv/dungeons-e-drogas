"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GiBoltSpellCast, GiSparkles } from "react-icons/gi";
import { cn } from "@/lib/utils";

interface SpellSlots {
  [level: number]: {
    max: number;
    current: number;
  };
}

interface SpellSlotTrackerProps {
  spellSlots: SpellSlots;
  onUpdate?: (spellSlots: SpellSlots) => void;
  className?: string;
}

export function SpellSlotTracker({
  spellSlots,
  onUpdate,
  className,
}: SpellSlotTrackerProps) {
  const [slots, setSlots] = useState<SpellSlots>(spellSlots);

  const useSlot = (level: number) => {
    if (slots[level] && slots[level].current > 0) {
      const newSlots = {
        ...slots,
        [level]: {
          ...slots[level],
          current: slots[level].current - 1,
        },
      };
      setSlots(newSlots);
      onUpdate?.(newSlots);
    }
  };

  const restoreSlot = (level: number) => {
    if (slots[level] && slots[level].current < slots[level].max) {
      const newSlots = {
        ...slots,
        [level]: {
          ...slots[level],
          current: slots[level].current + 1,
        },
      };
      setSlots(newSlots);
      onUpdate?.(newSlots);
    }
  };

  const restoreAll = () => {
    const newSlots: SpellSlots = {};
    Object.keys(slots).forEach((key) => {
      const level = parseInt(key);
      newSlots[level] = {
        max: slots[level].max,
        current: slots[level].max,
      };
    });
    setSlots(newSlots);
    onUpdate?.(newSlots);
  };

  // Filtra apenas níveis com slots
  const availableLevels = Object.keys(slots)
    .map(Number)
    .filter((level) => slots[level].max > 0)
    .sort((a, b) => a - b);

  if (availableLevels.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-gold-500/30", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-ui flex items-center gap-2">
            <GiBoltSpellCast className="h-5 w-5 text-gold-500" />
            Espaços de Magia
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={restoreAll}
            className="text-xs"
          >
            <GiSparkles className="h-3 w-3 mr-1" />
            Descanso Longo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {availableLevels.map((level) => {
          const slot = slots[level];
          const percentage = (slot.current / slot.max) * 100;

          return (
            <div key={level} className="space-y-2">
              {/* Header do nível */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gold-500">
                    Nível {level}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {slot.current}/{slot.max}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => useSlot(level)}
                    disabled={slot.current === 0}
                    className="h-6 w-6 p-0 text-xs"
                    title="Usar slot"
                  >
                    -
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => restoreSlot(level)}
                    disabled={slot.current === slot.max}
                    className="h-6 w-6 p-0 text-xs"
                    title="Restaurar slot"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Slots visuais */}
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: slot.max }).map((_, index) => {
                  const isUsed = index >= slot.current;

                  return (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() =>
                        isUsed ? restoreSlot(level) : useSlot(level)
                      }
                      className={cn(
                        "w-8 h-8 rounded-full border-2 cursor-pointer transition-all",
                        "flex items-center justify-center",
                        isUsed
                          ? "border-border bg-dark-500 opacity-40 hover:opacity-60"
                          : "border-gold-500 bg-gold-500/20 hover:bg-gold-500/30 animate-rune-glow"
                      )}
                      title={isUsed ? "Clique para restaurar" : "Clique para usar"}
                    >
                      {!isUsed && (
                        <GiSparkles className="h-4 w-4 text-gold-500" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Barra de progresso */}
              <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden border border-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "h-full rounded-full",
                    percentage > 50
                      ? "bg-gold-500"
                      : percentage > 25
                      ? "bg-gold-500/70"
                      : "bg-ruby"
                  )}
                />
              </div>
            </div>
          );
        })}

        {/* Dica */}
        <div className="text-xs text-text-secondary/70 mt-4 p-2 bg-dark-500/30 rounded">
          💡 Clique nos círculos para usar ou restaurar espaços de magia
        </div>
      </CardContent>
    </Card>
  );
}
