"use client";

import { motion } from "framer-motion";
import { Heart, Shield, Sword, Zap, Eye, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem } from "@/lib/motion-presets";

export interface PlayerPanelProps {
  className?: string;
  playerName?: string;
  characterClass?: string;
  hp?: number;
  maxHp?: number;
  weapon?: string;
}

/**
 * Player Panel - Mini ficha do jogador com ações rápidas
 */
export function PlayerPanel({
  className,
  playerName = "Aventureiro",
  characterClass = "Guerreiro",
  hp = 45,
  maxHp = 60,
  weapon = "Espada Longa",
}: PlayerPanelProps) {
  const hpPercentage = (hp / maxHp) * 100;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn("w-full max-w-md space-y-3", className)}
    >
      {/* Ficha do Personagem */}
      <motion.div variants={staggerItem}>
        <Card className="border-gold-500/40 bg-dark-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medieval text-gold-500">
                  {playerName}
                </CardTitle>
                <p className="text-xs text-text-secondary font-ui mt-0.5">
                  {characterClass}
                </p>
              </div>
              <Shield className="h-8 w-8 text-gold-500 animate-rune-glow" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Barra de HP */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-ui text-text-secondary flex items-center gap-1">
                  <Heart className="h-3 w-3 text-ruby" />
                  Pontos de Vida
                </span>
                <span className="text-xs font-ui font-bold text-text-primary">
                  {hp}/{maxHp}
                </span>
              </div>
              <div className="h-2 bg-dark-500 rounded-full overflow-hidden border border-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${hpPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-colors",
                    hpPercentage > 60
                      ? "bg-emerald"
                      : hpPercentage > 30
                      ? "bg-gold-500"
                      : "bg-ruby animate-pulse"
                  )}
                />
              </div>
            </div>

            {/* Arma Equipada */}
            <div className="flex items-center justify-between px-3 py-2 bg-dark-500 rounded-md border border-gold-500/30">
              <div className="flex items-center gap-2">
                <Sword className="h-4 w-4 text-gold-500" />
                <span className="text-xs font-ui text-text-secondary">Arma</span>
              </div>
              <span className="text-xs font-lore text-text-primary font-semibold">
                {weapon}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ações Rápidas */}
      <motion.div variants={staggerItem}>
        <Card className="border-gold-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-ui text-text-primary flex items-center gap-2">
              <Zap className="h-4 w-4 text-gold-500" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 font-ui"
              >
                <Eye className="h-3.5 w-3.5" />
                Percepção
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 font-ui"
              >
                <Sword className="h-3.5 w-3.5" />
                Ataque
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 font-ui"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Persuasão
              </Button>
              <Button
                variant="drogon"
                size="sm"
                className="flex items-center gap-2 font-ui"
              >
                🎲 Rolar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
