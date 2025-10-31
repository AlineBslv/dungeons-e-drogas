/**
 * Exemplo completo de uso da integração de Dados com Fichas de Personagem
 *
 * Este arquivo mostra como usar todos os componentes e helpers criados
 */

import { CharacterSheet } from '@/lib/firestore-helpers';
import {
  getAllCharacterDiceActions,
  getAttackRolls,
  getSkillTests,
} from '@/lib/character-dice-actions';
import { rollDice } from '@/lib/dice-helpers';
import { CharacterDiceActions } from '@/components/character/CharacterDiceActions';
import QuickActions from '@/components/player/QuickActions';
import { PlayerPanel } from '@/components/app/player-panel';

// ========================================
// EXEMPLO 1: Gerar ações de dados de uma ficha
// ========================================

async function exemploGerarAcoes(character: CharacterSheet) {
  // Obter todas as ações organizadas
  const actions = getAllCharacterDiceActions(character);

  console.log('Testes de Atributo:', actions.attributes);
  // [
  //   { id: 'attr_strength', label: 'Teste de Força', command: '1d20+3', ... },
  //   { id: 'attr_dexterity', label: 'Teste de Destreza', command: '1d20+2', ... },
  //   ...
  // ]

  console.log('Perícias Treinadas:', actions.skills);
  // [
  //   { id: 'skill_perception', label: 'Percepção', command: '1d20+5', isProficient: true, ... },
  //   { id: 'skill_stealth', label: 'Furtividade', command: '1d20+7', isProficient: true, ... },
  //   ...
  // ]

  console.log('Ataques:', actions.attacks);
  // [
  //   { id: 'attack_main', label: 'Espada Longa', command: '1d20+5', ... },
  //   { id: 'attack_unarmed', label: 'Ataque Desarmado', command: '1d20+3', ... },
  // ]

  console.log('Dano:', actions.damage);
  // [
  //   { id: 'damage_main', label: 'Dano - Espada Longa', command: '1d8+3', ... },
  //   { id: 'damage_unarmed', label: 'Dano Desarmado', command: '1d4+3', ... },
  // ]

  console.log('Resistências:', actions.saves);
  // [
  //   { id: 'save_strength', label: 'TR de Força', command: '1d20+5', isProficient: true, ... },
  //   ...
  // ]
}

// ========================================
// EXEMPLO 2: Rolar dados com modificadores da ficha
// ========================================

async function exemploRolarDados(character: CharacterSheet) {
  // Obter ataques disponíveis
  const attacks = getAttackRolls(character);
  const mainWeapon = attacks.find(a => a.id === 'attack_main');

  if (mainWeapon) {
    console.log(`Rolando ataque: ${mainWeapon.command}`);

    // Rola os dados via API
    const result = await rollDice(mainWeapon.command, {
      characterName: character.name,
      context: mainWeapon.description,
    });

    console.log('Resultado:', result.result.finalTotal);
    console.log('Dados:', result.result.rolls);
    console.log('Crítico?', result.result.isCritical);
  }

  // Obter perícias e rolar Percepção
  const skills = getSkillTests(character);
  const perception = skills.find(s => s.id === 'skill_perception');

  if (perception) {
    console.log(`Rolando percepção: ${perception.command}`);

    const result = await rollDice(perception.command, {
      characterName: character.name,
      context: 'Teste de Percepção para detectar armadilha',
    });

    console.log('Total:', result.result.finalTotal);
  }
}

// ========================================
// EXEMPLO 3: Componente de visualização de ficha
// ========================================

function ExemploVisualizacaoFicha() {
  // Ficha de exemplo
  const character: CharacterSheet & { id: string } = {
    id: 'char_123',
    player_uid: 'user_456',
    name: 'Thorin Escudo de Pedra',
    class: 'Guerreiro',
    race: 'Anão',
    level: 5,
    attributes: {
      strength: 16,
      dexterity: 12,
      constitution: 15,
      intelligence: 10,
      wisdom: 11,
      charisma: 8,
    },
    hp: {
      current: 42,
      max: 45,
      temporary: 0,
    },
    armor_class: 18,
    proficiency_bonus: 3,
    proficiencies: {
      armor: ['Leve', 'Média', 'Pesada', 'Escudos'],
      weapons: ['Simples', 'Marciais'],
      tools: ['Ferramentas de Ferreiro'],
      languages: ['Comum', 'Anão'],
    },
    skills: {
      athletics: { proficient: true, expertise: false },
      intimidation: { proficient: true, expertise: false },
      perception: { proficient: true, expertise: false },
    },
    equipment: {
      armor: 'Cota de Malha',
      weapon_main: 'Machado de Batalha',
      weapon_off: 'Escudo',
      inventory: [],
    },
  };

  return (
    <div className="space-y-6">
      {/* Painel completo de dados na ficha */}
      <CharacterDiceActions character={character} />

      {/* Versão compacta para sidebars */}
      <CharacterDiceActions character={character} compact />

      {/* Ações rápidas integradas */}
      <QuickActions
        character={character}
        onAction={(action, command) => {
          console.log(`Ação: ${action.label}, Comando: ${command}`);
        }}
      />
    </div>
  );
}

// ========================================
// EXEMPLO 4: Painel do jogador em campanha
// ========================================

function ExemploPainelJogador() {
  return (
    <div className="flex gap-6">
      {/* Painel do jogador com dados integrados */}
      <PlayerPanel campaignId="campaign_789" />

      {/* O PlayerPanel faz automaticamente:
       * 1. Busca ficha vinculada à campanha
       * 2. Carrega atributos e equipamento
       * 3. Passa para PlayerDicePanel
       * 4. PlayerDicePanel gera ações com modificadores corretos
       */}
    </div>
  );
}

// ========================================
// EXEMPLO 5: Uso programático avançado
// ========================================

async function exemploAvancado(character: CharacterSheet) {
  const actions = getAllCharacterDiceActions(character);

  // Rolar todos os ataques disponíveis
  console.log('=== Testando todos os ataques ===');
  for (const attack of actions.attacks) {
    const result = await rollDice(attack.command, {
      characterName: character.name,
      context: attack.description,
    });

    console.log(`${attack.label}: ${result.result.finalTotal}`);

    if (result.result.isCritical) {
      console.log('  🌟 ACERTO CRÍTICO!');
    }
  }

  // Rolar todas as perícias proficientes
  console.log('\n=== Testando perícias treinadas ===');
  for (const skill of actions.skills) {
    const result = await rollDice(skill.command, {
      characterName: character.name,
      context: skill.description,
    });

    const profIcon = skill.isProficient ? '✓' : '';
    console.log(`${profIcon} ${skill.label}: ${result.result.finalTotal}`);
  }

  // Simular combate completo
  console.log('\n=== Simulação de Combate ===');

  // 1. Iniciativa (Destreza)
  const initiative = actions.attributes.find(a => a.id === 'attr_dexterity');
  if (initiative) {
    const initResult = await rollDice(initiative.command);
    console.log(`Iniciativa: ${initResult.result.finalTotal}`);
  }

  // 2. Ataque
  const mainAttack = actions.attacks.find(a => a.id === 'attack_main');
  if (mainAttack) {
    const attackResult = await rollDice(mainAttack.command);
    console.log(`Ataque (${mainAttack.label}): ${attackResult.result.finalTotal}`);

    // 3. Se acertou, rola dano
    if (attackResult.result.finalTotal >= 15) { // CA do inimigo
      const damage = actions.damage.find(d => d.id === 'damage_main');
      if (damage) {
        const damageResult = await rollDice(damage.command);
        console.log(`Dano: ${damageResult.result.finalTotal}`);
      }
    } else {
      console.log('Ataque errou!');
    }
  }
}

// ========================================
// EXEMPLO 6: Integração com WebSocket (futuro)
// ========================================

/*
async function exemploWebSocket(character: CharacterSheet, socket: any) {
  const actions = getAllCharacterDiceActions(character);
  const mainAttack = actions.attacks[0];

  // Rola dados
  const result = await rollDice(mainAttack.command, {
    characterName: character.name,
    context: mainAttack.description,
    campaignId: 'campaign_789',
  });

  // Envia para todos os jogadores da campanha
  socket.emit('dice_rolled', {
    campaignId: 'campaign_789',
    userId: character.player_uid,
    characterName: character.name,
    action: mainAttack.label,
    command: mainAttack.command,
    result: result.result,
    timestamp: new Date().toISOString(),
  });

  console.log('Rolagem sincronizada com todos os jogadores!');
}
*/

export {
  exemploGerarAcoes,
  exemploRolarDados,
  ExemploVisualizacaoFicha,
  ExemploPainelJogador,
  exemploAvancado,
};
