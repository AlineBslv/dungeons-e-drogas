'use client';

/**
 * SpellBook integrado com chat da campanha
 * Wrapper que adiciona funcionalidade de enviar magias ao chat
 */

import { useState, useCallback } from 'react';
import { SpellBook } from './SpellBook';
import { useCharacterActions } from '@/hooks/useCharacterActions';
import type { CharacterSheet } from '@/lib/firestore-helpers';
import type { SpellData } from '@/lib/spells-data';
import { toast } from 'sonner';
import { updateCharacterSheet } from '@/lib/firestore-helpers';

interface SpellBookWithChatProps {
  character: CharacterSheet & { id: string };
  campaignId: string;
  allSpells: SpellData[];
  className?: string;
}

export function SpellBookWithChat({
  character,
  campaignId,
  allSpells,
  className,
}: SpellBookWithChatProps) {
  const { sendSpell, isLoading } = useCharacterActions(campaignId);
  const [isCasting, setIsCasting] = useState(false);

  const handleCastSpell = useCallback(async (spell: SpellData) => {
    setIsCasting(true);

    try {
      // Valida se personagem tem slots de magia
      if (!character.spells) {
        toast.error('Este personagem não pode lançar magias');
        return;
      }

      const spellLevel = spell.level;

      // Truques não gastam slots
      if (spellLevel === 0) {
        await sendSpell(character, spell, 0);
        toast.success(`✨ ${spell.name} lançado!`);
        return;
      }

      // Verifica se tem slots disponíveis
      const slots = character.spells.spell_slots?.[spellLevel];
      if (!slots || slots.current <= 0) {
        toast.error(`Sem espaços de magia de nível ${spellLevel} disponíveis!`);
        return;
      }

      // Envia ao chat
      await sendSpell(character, spell, spellLevel);

      // Consome slot
      const updatedSlots = {
        ...character.spells.spell_slots,
        [spellLevel]: {
          ...slots,
          current: slots.current - 1,
        },
      };

      await updateCharacterSheet(character.id, {
        spells: {
          ...character.spells,
          spell_slots: updatedSlots,
        },
      });

      toast.success(
        `✨ ${spell.name} lançado! Slots restantes: ${updatedSlots[spellLevel].current}/${updatedSlots[spellLevel].max}`
      );
    } catch (error) {
      console.error('Erro ao lançar magia:', error);
      toast.error('Erro ao lançar magia');
    } finally {
      setIsCasting(false);
    }
  }, [character, campaignId, sendSpell]);

  return (
    <SpellBook
      spells={character.spells?.known_spells || []}
      allSpells={allSpells}
      onCastSpell={handleCastSpell}
      className={className}
    />
  );
}
