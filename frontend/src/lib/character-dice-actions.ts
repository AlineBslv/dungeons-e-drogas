/**
 * Helpers para gerar ações de dados baseadas na ficha do personagem
 */

import { CharacterSheet, calculateAttributeModifier } from './firestore-helpers';
import { buildDiceCommand } from './dice-helpers';
import { SKILLS } from './dnd-data';

export interface DiceAction {
  id: string;
  label: string;
  command: string;
  description: string;
  category: 'attribute' | 'skill' | 'attack' | 'save' | 'damage';
  icon?: string;
  modifier: number;
  isProficient?: boolean;
}

/**
 * Gera testes de atributos (força, destreza, etc)
 */
export function getAttributeTests(character: CharacterSheet): DiceAction[] {
  const attributes = {
    strength: 'Força',
    dexterity: 'Destreza',
    constitution: 'Constituição',
    intelligence: 'Inteligência',
    wisdom: 'Sabedoria',
    charisma: 'Carisma',
  };

  return Object.entries(attributes).map(([key, label]) => {
    const value = character.attributes[key as keyof typeof character.attributes];
    const modifier = calculateAttributeModifier(value);

    return {
      id: `attr_${key}`,
      label: `Teste de ${label}`,
      command: buildDiceCommand(20, 1, modifier),
      description: `Teste de atributo de ${label} (${value})`,
      category: 'attribute' as const,
      modifier,
    };
  });
}

/**
 * Gera testes de perícias baseados na ficha
 */
export function getSkillTests(character: CharacterSheet): DiceAction[] {
  if (!character.skills) return [];

  const actions: DiceAction[] = [];

  Object.entries(character.skills).forEach(([skillKey, data]) => {
    if (!data.proficient && !data.expertise) return;

    const skill = SKILLS[skillKey as keyof typeof SKILLS];
    if (!skill) return;

    // Calcula modificador: atributo base + proficiência
    const attrValue = character.attributes[skill.attribute];
    const attrMod = calculateAttributeModifier(attrValue);
    const profBonus = data.proficient ? character.proficiency_bonus : 0;
    const expertiseBonus = data.expertise ? character.proficiency_bonus : 0;
    const totalMod = attrMod + profBonus + expertiseBonus;

    actions.push({
      id: `skill_${skillKey}`,
      label: skill.name as string,
      command: buildDiceCommand(20, 1, totalMod),
      description: `Teste de ${skill.name} (${skill.attribute})`,
      category: 'skill' as const,
      modifier: totalMod,
      isProficient: data.proficient,
      icon: data.expertise ? '⭐' : '✓',
    });
  });

  return actions;
}

/**
 * Gera testes de resistência (saving throws)
 */
export function getSavingThrows(character: CharacterSheet): DiceAction[] {
  const attributes = {
    strength: 'Força',
    dexterity: 'Destreza',
    constitution: 'Constituição',
    intelligence: 'Inteligência',
    wisdom: 'Sabedoria',
    charisma: 'Carisma',
  };

  // TODO: Implementar proficiências de resistência por classe
  const classSavingThrows: Record<string, string[]> = {
    'Guerreiro': ['strength', 'constitution'],
    'Mago': ['intelligence', 'wisdom'],
    'Ladino': ['dexterity', 'intelligence'],
    'Clérigo': ['wisdom', 'charisma'],
    // ... adicionar outras classes
  };

  const proficientSaves = classSavingThrows[character.class] || [];

  return Object.entries(attributes).map(([key, label]) => {
    const value = character.attributes[key as keyof typeof character.attributes];
    const modifier = calculateAttributeModifier(value);
    const isProficient = proficientSaves.includes(key);
    const totalMod = modifier + (isProficient ? character.proficiency_bonus : 0);

    return {
      id: `save_${key}`,
      label: `TR de ${label}`,
      command: buildDiceCommand(20, 1, totalMod),
      description: `Teste de Resistência de ${label}`,
      category: 'save' as const,
      modifier: totalMod,
      isProficient,
    };
  });
}

/**
 * Gera rolagens de ataque baseadas nas armas equipadas
 */
export function getAttackRolls(character: CharacterSheet): DiceAction[] {
  const attacks: DiceAction[] = [];

  // Ataque desarmado (sempre disponível)
  const strMod = calculateAttributeModifier(character.attributes.strength);
  attacks.push({
    id: 'attack_unarmed',
    label: 'Ataque Desarmado',
    command: buildDiceCommand(20, 1, strMod + character.proficiency_bonus),
    description: 'Soco ou chute',
    category: 'attack',
    modifier: strMod + character.proficiency_bonus,
  });

  // Arma principal
  if (character.equipment.weapon_main) {
    // Detecta se é arma de finesse/distância ou força
    const weaponName = character.equipment.weapon_main.toLowerCase();
    const isFinesse = weaponName.includes('adaga') ||
                     weaponName.includes('espada curta') ||
                     weaponName.includes('florete');
    const isRanged = weaponName.includes('arco') ||
                    weaponName.includes('besta') ||
                    weaponName.includes('funda');

    const dexMod = calculateAttributeModifier(character.attributes.dexterity);
    const modifier = (isFinesse || isRanged)
      ? Math.max(strMod, dexMod) + character.proficiency_bonus
      : strMod + character.proficiency_bonus;

    attacks.push({
      id: 'attack_main',
      label: character.equipment.weapon_main,
      command: buildDiceCommand(20, 1, modifier),
      description: `Ataque com ${character.equipment.weapon_main}`,
      category: 'attack',
      modifier,
      isProficient: true,
    });
  }

  // Arma secundária
  if (character.equipment.weapon_off) {
    const dexMod = calculateAttributeModifier(character.attributes.dexterity);
    attacks.push({
      id: 'attack_off',
      label: character.equipment.weapon_off,
      command: buildDiceCommand(20, 1, strMod + character.proficiency_bonus),
      description: `Ataque com ${character.equipment.weapon_off}`,
      category: 'attack',
      modifier: strMod + character.proficiency_bonus,
    });
  }

  return attacks;
}

/**
 * Gera rolagens de dano comuns
 */
export function getDamageRolls(character: CharacterSheet): DiceAction[] {
  const strMod = calculateAttributeModifier(character.attributes.strength);
  const dexMod = calculateAttributeModifier(character.attributes.dexterity);

  const damages: DiceAction[] = [
    {
      id: 'damage_unarmed',
      label: 'Dano Desarmado',
      command: buildDiceCommand(4, 1, strMod),
      description: '1d4 + Força',
      category: 'damage',
      modifier: strMod,
    },
  ];

  // Dano de arma principal (genérico)
  if (character.equipment.weapon_main) {
    const weaponName = character.equipment.weapon_main.toLowerCase();

    // Detecta tipo de dado baseado na arma
    let damageDice = 8; // padrão para espadas longas
    if (weaponName.includes('adaga')) damageDice = 4;
    else if (weaponName.includes('espada curta')) damageDice = 6;
    else if (weaponName.includes('machado') || weaponName.includes('martelo')) damageDice = 10;
    else if (weaponName.includes('grande')) damageDice = 12;

    const isFinesse = weaponName.includes('adaga') || weaponName.includes('espada curta');
    const modifier = isFinesse ? Math.max(strMod, dexMod) : strMod;

    damages.push({
      id: 'damage_main',
      label: `Dano - ${character.equipment.weapon_main}`,
      command: buildDiceCommand(damageDice, 1, modifier),
      description: `1d${damageDice} + modificador`,
      category: 'damage',
      modifier,
    });
  }

  return damages;
}

/**
 * Gera todas as ações de dados de um personagem
 */
export function getAllCharacterDiceActions(character: CharacterSheet): {
  attributes: DiceAction[];
  skills: DiceAction[];
  saves: DiceAction[];
  attacks: DiceAction[];
  damage: DiceAction[];
} {
  return {
    attributes: getAttributeTests(character),
    skills: getSkillTests(character),
    saves: getSavingThrows(character),
    attacks: getAttackRolls(character),
    damage: getDamageRolls(character),
  };
}

/**
 * Formata ação de dados para exibição rápida
 */
export function formatDiceAction(action: DiceAction): string {
  const modStr = action.modifier >= 0 ? `+${action.modifier}` : `${action.modifier}`;
  const profStr = action.isProficient ? ' [Prof]' : '';
  return `${action.label} (${action.command}) ${modStr}${profStr}`;
}
