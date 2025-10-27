"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GiHeartBottle,
  GiShield,
  GiDragonHead,
  GiCrossedSwords,
} from "react-icons/gi";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem } from "@/lib/motion-presets";
import {
  CharacterSheet,
  getPlayerCharacterSheets,
  getCampaignCharacterSheets,
} from "@/lib/firestore-helpers";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import PlayerDicePanel from "@/components/player/PlayerDicePanel";

export interface PlayerPanelProps {
  className?: string;
  campaignId?: string;
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
  campaignId,
  playerName = "Aventureiro",
  characterClass = "Guerreiro",
  hp = 45,
  maxHp = 60,
  weapon = "Espada Longa",
}: PlayerPanelProps) {
  const { user } = useAuth();
  const [character, setCharacter] = useState<(CharacterSheet & { id: string }) | null>(null);
  const [loading, setLoading] = useState(false);

  // Carrega ficha do personagem vinculada à campanha
  useEffect(() => {
    if (!user || !campaignId) return;

    const loadCharacter = async () => {
      setLoading(true);
      try {
        const campaignChars = await getCampaignCharacterSheets(campaignId);
        const userChar = campaignChars.find(c => c.player_uid === user.uid);
        if (userChar) {
          setCharacter(userChar);
        }
      } catch (error) {
        console.error("Erro ao carregar personagem:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacter();
  }, [user, campaignId]);

  // Usa dados da ficha se disponível, caso contrário usa props
  const displayName = character?.name || playerName;
  const displayClass = character?.class || characterClass;
  const displayHp = character?.hp.current || hp;
  const displayMaxHp = character?.hp.max || maxHp;
  const displayWeapon = character?.equipment.weapon_main || weapon;
  const hpPercentage = (displayHp / displayMaxHp) * 100;

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
              <div className="flex-1">
                <CardTitle className="text-base font-medieval text-gold-500">
                  {displayName}
                </CardTitle>
                <p className="text-xs text-text-secondary font-ui mt-0.5">
                  {displayClass}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!character && !loading && (
                  <Link href="/characters">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <GiDragonHead className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <GiShield className="h-8 w-8 text-gold-500 animate-rune-glow" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Barra de HP */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-ui text-text-secondary flex items-center gap-1">
                  <GiHeartBottle className="h-3 w-3 text-ruby" />
                  Pontos de Vida
                </span>
                <span className="text-xs font-ui font-bold text-text-primary">
                  {displayHp}/{displayMaxHp}
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
                <GiCrossedSwords className="h-4 w-4 text-gold-500" />
                <span className="text-xs font-ui text-text-secondary">Arma</span>
              </div>
              <span className="text-xs font-lore text-text-primary font-semibold">
                {displayWeapon}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sistema de Dados */}
      <motion.div variants={staggerItem}>
        <PlayerDicePanel
          characterName={displayName}
          characterStats={character ? {
            strength: character.attributes.strength,
            dexterity: character.attributes.dexterity,
            wisdom: character.attributes.wisdom,
            charisma: character.attributes.charisma
          } : undefined}
        />
      </motion.div>
    </motion.div>
  );
}
