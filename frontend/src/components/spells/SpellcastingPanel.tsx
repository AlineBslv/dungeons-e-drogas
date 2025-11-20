"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SpellSlotTracker } from "./SpellSlotTracker";
import { SpellBook } from "./SpellBook";
import { CharacterSheet } from "@/lib/firestore-helpers";
import { SpellData, ALL_SPELLS, calculateSpellSaveDC, calculateSpellAttackBonus } from "@/lib/spells-data";
import { calculateAttributeModifier } from "@/lib/firestore-helpers";
import { rollDice } from "@/lib/dice-helpers";
import { toast } from "sonner";
import { GiMagicSwirl, GiBoltSpellCast } from "react-icons/gi";
import { cn } from "@/lib/utils";

interface SpellcastingPanelProps {
  character: CharacterSheet & { id: string };
  onUpdate?: (spellSlots: any) => void;
  className?: string;
}

export function SpellcastingPanel({
  character,
  onUpdate,
  className,
}: SpellcastingPanelProps) {
  const [spellSlots, setSpellSlots] = useState(character.spells?.spell_slots || {});

  // Verifica se o personagem tem conjuração
  if (!character.spells || !character.spells.known_spells) {
    return (
      <Card className={cn("border-gold-500/30", className)}>
        <CardContent className="py-12 text-center">
          <GiMagicSwirl className="h-16 w-16 text-text-secondary/30 mx-auto mb-4" />
          <h3 className="text-lg font-medieval text-gold-500 mb-2">
            Sem Habilidade de Conjuração
          </h3>
          <p className="text-sm text-text-secondary">
            Este personagem não possui a habilidade de conjurar magias.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcula modificadores de conjuração
  const spellcastingAbility = character.spells.spellcasting_ability || "intelligence";
  const attrKey = spellcastingAbility as keyof typeof character.attributes;
  const spellcastingModifier = calculateAttributeModifier(
    character.attributes[attrKey]
  );

  const spellSaveDC = character.spells.spell_save_dc ||
    calculateSpellSaveDC(character.proficiency_bonus, spellcastingModifier);

  const spellAttackBonus = character.spells.spell_attack_bonus ||
    calculateSpellAttackBonus(character.proficiency_bonus, spellcastingModifier);

  const handleSpellSlotsUpdate = (newSlots: any) => {
    setSpellSlots(newSlots);
    onUpdate?.(newSlots);
  };

  const handleCastSpell = async (spell: SpellData) => {
    // Verifica se tem slots disponíveis
    if (spell.level > 0) {
      const hasSlot = spellSlots[spell.level]?.current > 0;

      if (!hasSlot) {
        toast.error(`Sem espaços de magia de nível ${spell.level}!`);
        return;
      }
    }

    try {
      // Se tem ataque ou dano, faz a rolagem
      if (spell.attackRoll && spell.damageFormula) {
        // Rolagem de ataque
        const attackRoll = await rollDice(`1d20+${spellAttackBonus}`, {
          characterName: character.name,
          context: `Ataque de magia: ${spell.name}`,
        });

        // Verifica se acertou (simplificado)
        const hit = attackRoll.result.finalTotal >= 15; // CA média

        if (hit) {
          // Rolagem de dano
          const damageRoll = await rollDice(spell.damageFormula, {
            characterName: character.name,
            context: `Dano de ${spell.name}`,
          });

          toast.success(
            `${spell.name} acertou!`,
            {
              description: `Ataque: ${attackRoll.result.finalTotal} | Dano: ${damageRoll.result.finalTotal} (${spell.damageType})`,
            }
          );
        } else {
          toast.warning(`${spell.name} errou!`, {
            description: `Rolagem de ataque: ${attackRoll.result.finalTotal}`,
          });
        }
      } else if (spell.savingThrow) {
        // Magia com TR
        toast.info(`${spell.name} conjurado!`, {
          description: `CD de resistência: ${spellSaveDC} (${spell.savingThrow})`,
        });
      } else {
        // Magia sem rolagem
        toast.success(`${spell.name} conjurado com sucesso!`);
      }

      // Consome o slot
      if (spell.level > 0) {
        const newSlots = {
          ...spellSlots,
          [spell.level]: {
            ...spellSlots[spell.level],
            current: spellSlots[spell.level].current - 1,
          },
        };
        setSpellSlots(newSlots);
        onUpdate?.(newSlots);
      }
    } catch (error) {
      console.error("Erro ao conjurar magia:", error);
      toast.error("Erro ao conjurar magia");
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Informações de Conjuração */}
      <Card className="border-gold-500/30">
        <CardHeader>
          <CardTitle className="text-lg font-ui flex items-center gap-2">
            <GiBoltSpellCast className="h-5 w-5 text-gold-500" />
            Habilidade de Conjuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-dark-500 rounded-md border border-border">
              <div className="text-xs text-text-secondary mb-1">Atributo</div>
              <div className="text-lg font-bold text-gold-500 capitalize">
                {spellcastingAbility === "intelligence" ? "Inteligência" :
                 spellcastingAbility === "wisdom" ? "Sabedoria" : "Carisma"}
              </div>
            </div>
            <div className="text-center p-3 bg-dark-500 rounded-md border border-border">
              <div className="text-xs text-text-secondary mb-1">CD de Magia</div>
              <div className="text-lg font-bold text-emerald">
                {spellSaveDC}
              </div>
            </div>
            <div className="text-center p-3 bg-dark-500 rounded-md border border-border">
              <div className="text-xs text-text-secondary mb-1">Bônus de Ataque</div>
              <div className="text-lg font-bold text-ruby">
                +{spellAttackBonus}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Espaços de Magia */}
      {character.spells.spell_slots && (
        <SpellSlotTracker
          spellSlots={spellSlots}
          onUpdate={handleSpellSlotsUpdate}
        />
      )}

      {/* Grimório */}
      <SpellBook
        spells={character.spells.known_spells}
        allSpells={ALL_SPELLS}
        onCastSpell={handleCastSpell}
      />
    </div>
  );
}
