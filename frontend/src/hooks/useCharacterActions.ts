/**
 * Hook para enviar ações de personagem ao chat da campanha
 */

import { useState, useCallback } from 'react';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { rollDice } from '@/lib/dice-helpers';
import type { DiceResult } from '@/lib/dice-helpers';
import type { CharacterSheet } from '@/lib/firestore-helpers';
import type { SpellData } from '@/lib/spells-data';

export interface CharacterAction {
  type: 'attack' | 'spell' | 'skill' | 'save' | 'ability_check';
  name: string;
  roll?: DiceResult;
  description: string;
  metadata?: {
    damage?: DiceResult;
    spellLevel?: number;
    saveType?: string;
    saveDC?: number;
    damageType?: string;
    isProficient?: boolean;
    isExpertise?: boolean;
    modifier?: number;
  };
}

export interface CharacterActionMessage {
  characterId: string;
  characterName: string;
  characterClass: string;
  action: CharacterAction;
  sender: 'jogador';
  type: 'character_action';
  content: string;
  timestamp: any;
  audience: 'all';
}

interface UseCharacterActionsReturn {
  sendAttack: (character: CharacterSheet & { id: string }, weaponName: string, attackCommand: string, damageCommand: string) => Promise<void>;
  sendSpell: (character: CharacterSheet & { id: string }, spell: SpellData, spellLevel: number) => Promise<void>;
  sendSkillCheck: (character: CharacterSheet & { id: string }, skillName: string, command: string, isProficient?: boolean, isExpertise?: boolean) => Promise<void>;
  sendSavingThrow: (character: CharacterSheet & { id: string }, saveName: string, command: string, isProficient?: boolean) => Promise<void>;
  sendAbilityCheck: (character: CharacterSheet & { id: string }, abilityName: string, command: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useCharacterActions(campaignId: string): UseCharacterActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Envia ação ao Firestore
   */
  const sendActionToChat = useCallback(async (
    characterId: string,
    characterName: string,
    characterClass: string,
    action: CharacterAction
  ) => {
    try {
      const messagesRef = collection(db, 'campaigns', campaignId, 'messages');

      // Gera descrição textual da ação
      const contentText = generateActionContent(action);

      const messageData: CharacterActionMessage = {
        characterId,
        characterName,
        characterClass,
        action,
        sender: 'jogador',
        type: 'character_action',
        content: contentText,
        timestamp: serverTimestamp(),
        audience: 'all',
      };

      await addDoc(messagesRef, messageData);
    } catch (err) {
      console.error('Erro ao enviar ação:', err);
      throw err;
    }
  }, [campaignId]);

  /**
   * Envia ataque com arma
   */
  const sendAttack = useCallback(async (
    character: CharacterSheet & { id: string },
    weaponName: string,
    attackCommand: string,
    damageCommand: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Rola ataque
      const attackRoll = await rollDice(attackCommand, {
        campaignId,
        characterName: character.name,
        context: `Ataque com ${weaponName}`,
      });

      // Rola dano
      const damageRoll = await rollDice(damageCommand, {
        campaignId,
        characterName: character.name,
        context: `Dano de ${weaponName}`,
      });

      const action: CharacterAction = {
        type: 'attack',
        name: weaponName,
        roll: attackRoll.result,
        description: `Ataca com ${weaponName}`,
        metadata: {
          damage: damageRoll.result,
          modifier: attackRoll.result.modifier,
        },
      };

      await sendActionToChat(character.id, character.name, character.class, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar ataque');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, sendActionToChat]);

  /**
   * Envia conjuração de magia
   */
  const sendSpell = useCallback(async (
    character: CharacterSheet & { id: string },
    spell: SpellData,
    spellLevel: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let roll: DiceResult | undefined;

      // Se magia tem ataque, rola ataque
      if (spell.attackRoll && character.spells?.spell_attack_bonus) {
        const attackCommand = `1d20+${character.spells.spell_attack_bonus}`;
        const attackRoll = await rollDice(attackCommand, {
          campaignId,
          characterName: character.name,
          context: `Ataque mágico: ${spell.name}`,
        });
        roll = attackRoll.result;
      }

      // Se magia tem dano, rola dano
      let damageRoll: DiceResult | undefined;
      if (spell.damageFormula) {
        const damageResult = await rollDice(spell.damageFormula, {
          campaignId,
          characterName: character.name,
          context: `Dano de ${spell.name}`,
        });
        damageRoll = damageResult.result;
      }

      const action: CharacterAction = {
        type: 'spell',
        name: spell.name,
        roll,
        description: spell.description,
        metadata: {
          spellLevel,
          saveDC: character.spells?.spell_save_dc,
          saveType: spell.savingThrow,
          damage: damageRoll,
          damageType: spell.damageType,
        },
      };

      await sendActionToChat(character.id, character.name, character.class, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao lançar magia');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, sendActionToChat]);

  /**
   * Envia teste de perícia
   */
  const sendSkillCheck = useCallback(async (
    character: CharacterSheet & { id: string },
    skillName: string,
    command: string,
    isProficient: boolean = false,
    isExpertise: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const rollResult = await rollDice(command, {
        campaignId,
        characterName: character.name,
        context: `Teste de ${skillName}`,
      });

      const action: CharacterAction = {
        type: 'skill',
        name: skillName,
        roll: rollResult.result,
        description: `Teste de ${skillName}`,
        metadata: {
          isProficient,
          isExpertise,
          modifier: rollResult.result.modifier,
        },
      };

      await sendActionToChat(character.id, character.name, character.class, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar teste de perícia');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, sendActionToChat]);

  /**
   * Envia teste de resistência
   */
  const sendSavingThrow = useCallback(async (
    character: CharacterSheet & { id: string },
    saveName: string,
    command: string,
    isProficient: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const rollResult = await rollDice(command, {
        campaignId,
        characterName: character.name,
        context: `TR de ${saveName}`,
      });

      const action: CharacterAction = {
        type: 'save',
        name: saveName,
        roll: rollResult.result,
        description: `Teste de Resistência de ${saveName}`,
        metadata: {
          isProficient,
          modifier: rollResult.result.modifier,
        },
      };

      await sendActionToChat(character.id, character.name, character.class, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar teste de resistência');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, sendActionToChat]);

  /**
   * Envia teste de atributo
   */
  const sendAbilityCheck = useCallback(async (
    character: CharacterSheet & { id: string },
    abilityName: string,
    command: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const rollResult = await rollDice(command, {
        campaignId,
        characterName: character.name,
        context: `Teste de ${abilityName}`,
      });

      const action: CharacterAction = {
        type: 'ability_check',
        name: abilityName,
        roll: rollResult.result,
        description: `Teste de ${abilityName}`,
        metadata: {
          modifier: rollResult.result.modifier,
        },
      };

      await sendActionToChat(character.id, character.name, character.class, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar teste de atributo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, sendActionToChat]);

  return {
    sendAttack,
    sendSpell,
    sendSkillCheck,
    sendSavingThrow,
    sendAbilityCheck,
    isLoading,
    error,
  };
}

/**
 * Gera conteúdo textual da ação para fallback
 */
function generateActionContent(action: CharacterAction): string {
  switch (action.type) {
    case 'attack':
      return `⚔️ Ataca com ${action.name} - Rolagem: ${action.roll?.finalTotal || '?'} | Dano: ${action.metadata?.damage?.finalTotal || '?'}`;

    case 'spell':
      return `✨ Lança ${action.name} (Nível ${action.metadata?.spellLevel || '?'})${
        action.metadata?.damage ? ` - Dano: ${action.metadata.damage.finalTotal}` : ''
      }`;

    case 'skill':
      return `🎯 ${action.name}: ${action.roll?.finalTotal || '?'}${
        action.metadata?.isExpertise ? ' (Especializado)' : action.metadata?.isProficient ? ' (Proficiente)' : ''
      }`;

    case 'save':
      return `🛡️ Resistência de ${action.name}: ${action.roll?.finalTotal || '?'}${
        action.metadata?.isProficient ? ' (Proficiente)' : ''
      }`;

    case 'ability_check':
      return `💪 Teste de ${action.name}: ${action.roll?.finalTotal || '?'}`;

    default:
      return action.description;
  }
}
