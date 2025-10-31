# Sistema de Magias - Dungeons e Drogas

## Visão Geral

Sistema completo de conjuração de magias D&D 5e integrado com fichas de personagem, incluindo gerenciamento de espaços de magia (spell slots), grimório interativo e mecânicas de rolagem automática.

## Arquitetura

### Estrutura de Dados

```typescript
// Dados da magia
interface SpellData {
  name: string;                 // Nome da magia
  level: number;                // 0 = Truque, 1-9 = Níveis
  school: SpellSchool;          // Escola de magia
  castingTime: string;          // Tempo de conjuração
  range: string;                // Alcance
  components: SpellComponent[]; // V, S, M
  materialComponents?: string;  // Componentes materiais
  duration: string;             // Duração
  concentration: boolean;       // Requer concentração?
  ritual: boolean;              // Pode ser ritual?
  description: string;          // Descrição completa
  higherLevels?: string;        // Efeitos em níveis superiores
  damageType?: DamageType;      // Tipo de dano
  damageFormula?: string;       // Fórmula de dano (ex: "3d6")
  savingThrow?: string;         // Atributo do TR
  attackRoll?: boolean;         // Requer ataque?
  availableFor: string[];       // Classes que podem aprender
}

// Espaços de magia na ficha
interface SpellSlots {
  [level: number]: {
    max: number;      // Máximo de slots deste nível
    current: number;  // Slots restantes
  }
}
```

### Componentes

#### 1. **SpellSlotTracker**
Gerenciador visual de espaços de magia.

**Features:**
- Círculos interativos representando cada slot
- Botões +/- para ajustar manualmente
- Botão "Descanso Longo" para restaurar todos
- Barra de progresso por nível
- Animações de uso/restauração

**Uso:**
```tsx
<SpellSlotTracker
  spellSlots={{
    1: { max: 4, current: 2 },
    2: { max: 3, current: 3 },
    3: { max: 2, current: 1 },
  }}
  onUpdate={(newSlots) => console.log(newSlots)}
/>
```

#### 2. **SpellBook**
Grimório interativo com lista de magias conhecidas.

**Features:**
- Lista completa de magias conhecidas
- Busca por nome ou escola
- 3 visualizações: Todas, Truques, Por Nível
- Painel de detalhes com informações completas
- Badges para propriedades (Concentração, Ritual, etc.)
- Botão de conjuração para cada magia

**Uso:**
```tsx
<SpellBook
  spells={["Mísseis Mágicos", "Bola de Fogo", "Detectar Magia"]}
  allSpells={ALL_SPELLS}
  onCastSpell={(spell) => handleCast(spell)}
/>
```

#### 3. **SpellcastingPanel**
Painel completo que integra tudo.

**Features:**
- Exibe informações de conjuração (CD, bônus de ataque)
- Integra SpellSlotTracker e SpellBook
- Gerencia rolagens de ataque e dano
- Consome slots automaticamente
- Notificações via toast

**Uso:**
```tsx
<SpellcastingPanel
  character={characterSheet}
  onUpdate={(newSlots) => saveToDatabase(newSlots)}
/>
```

## Mecânicas de D&D 5e

### Atributo de Conjuração

Cada classe usa um atributo diferente para magias:

| Classe | Atributo |
|--------|----------|
| Mago, Cavaleiro Arcano | Inteligência |
| Clérigo, Druida, Patrulheiro | Sabedoria |
| Bardo, Feiticeiro, Bruxo, Paladino | Carisma |

### Cálculos

#### CD de Magia (Spell Save DC)
```
CD = 8 + Bônus de Proficiência + Modificador do Atributo de Conjuração

Exemplo (Mago Nível 5, INT 18):
  Bônus de Proficiência: +3
  Modificador de INT: +4
  CD = 8 + 3 + 4 = 15
```

#### Bônus de Ataque Mágico
```
Bônus = Bônus de Proficiência + Modificador do Atributo de Conjuração

Exemplo (Mago Nível 5, INT 18):
  Bônus = 3 + 4 = +7
```

### Espaços de Magia por Nível

Tabela padrão de progressão para conjuradores completos (Mago, Clérigo, Druida):

| Nível | 1º | 2º | 3º | 4º | 5º | 6º | 7º | 8º | 9º |
|-------|----|----|----|----|----|----|----|----|-----|
| 1     | 2  | -  | -  | -  | -  | -  | -  | -  | -   |
| 2     | 3  | -  | -  | -  | -  | -  | -  | -  | -   |
| 3     | 4  | 2  | -  | -  | -  | -  | -  | -  | -   |
| 4     | 4  | 3  | -  | -  | -  | -  | -  | -  | -   |
| 5     | 4  | 3  | 2  | -  | -  | -  | -  | -  | -   |
| 10    | 4  | 3  | 3  | 3  | 2  | -  | -  | -  | -   |
| 20    | 4  | 3  | 3  | 3  | 3  | 2  | 2  | 1  | 1   |

## Catálogo de Magias

### Magias Implementadas

#### Truques (Nível 0)
- **Globos de Luz** (Evocação) - Cria luzes flutuantes
- **Raio de Gelo** (Evocação) - 1d8 dano de frio + reduz velocidade
- **Rajada Mística** (Evocação) - Até 3 raios de 1d4+1 energia
- **Toque Chocante** (Evocação) - 1d8 dano elétrico
- **Orientação** (Adivinhação) - +1d4 em teste de atributo
- **Consertar** (Transmutação) - Repara objetos pequenos

#### Nível 1
- **Mísseis Mágicos** (Evocação) - 3 dardos automáticos de 1d4+1
- **Escudo Arcano** (Abjuração) - +5 CA por 1 rodada
- **Detectar Magia** (Adivinhação) - Sente presença de magia
- **Curar Ferimentos** (Evocação) - Cura 1d8 + modificador
- **Mãos Flamejantes** (Evocação) - Cone de 3d6 fogo
- **Enfeitiçar Pessoa** (Encantamento) - Enfeita humanoide
- **Compreender Idiomas** (Adivinhação) - Compreende idiomas

#### Nível 2
- **Flecha Ácida de Melf** (Evocação) - 4d4 + 2d4 ácido
- **Levitação** (Transmutação) - Levita criatura/objeto
- **Invisibilidade** (Ilusão) - Torna invisível
- **Restauração Menor** (Abjuração) - Remove condições
- **Imagem Silenciosa** (Ilusão) - Cria ilusão visual

#### Nível 3
- **Bola de Fogo** (Evocação) - 8d6 fogo em área
- **Relâmpago** (Evocação) - Linha de 8d6 elétrico
- **Dissipar Magia** (Abjuração) - Remove efeitos mágicos
- **Voo** (Transmutação) - Velocidade de voo 18m
- **Contra-Feitiço** (Abjuração) - Interrompe conjuração

## Fluxo de Conjuração

### 1. Seleção da Magia

```typescript
// Jogador abre grimório
<SpellBook spells={characterSpells} />

// Clica em uma magia
onSelectSpell(spell: SpellData)

// Painel de detalhes exibe informações
<SpellDetails spell={selectedSpell} />
```

### 2. Verificação de Slots

```typescript
// Verifica se tem slot disponível
const hasSlot = spellSlots[spell.level]?.current > 0;

if (!hasSlot) {
  toast.error("Sem espaços de magia!");
  return;
}
```

### 3. Conjuração

```typescript
// Se requer ataque
if (spell.attackRoll) {
  const attack = await rollDice(`1d20+${spellAttackBonus}`);

  if (attack.result.finalTotal >= targetAC) {
    const damage = await rollDice(spell.damageFormula);
    // Aplica dano
  }
}

// Se requer TR
if (spell.savingThrow) {
  toast.info(`CD de resistência: ${spellSaveDC}`);
  // Mestre rola TR do alvo
}

// Consome o slot
spellSlots[spell.level].current--;
```

### 4. Resultado

```typescript
// Toast com resultado
toast.success("Bola de Fogo conjurado!", {
  description: "Dano: 32 (fogo) | CD: 15 (Destreza)"
});

// Atualiza ficha
onUpdate(newSpellSlots);
```

## Integração com Ficha

### Estrutura na CharacterSheet

```typescript
character.spells = {
  spellcasting_ability: "intelligence",
  spell_save_dc: 15,
  spell_attack_bonus: 7,
  spell_slots: {
    1: { max: 4, current: 2 },
    2: { max: 3, current: 3 },
    3: { max: 2, current: 1 },
  },
  known_spells: [
    "Mísseis Mágicos",
    "Escudo Arcano",
    "Bola de Fogo",
    "Detectar Magia"
  ]
};
```

### Nova Tab na CharacterSheet

Na visualização da ficha, agora há 5 tabs:
1. ⚔️ Atributos
2. 🛡️ Equipamento
3. 📜 Perícias
4. ✨ **Magias** (NOVO!)
5. 🎲 Dados

## Exemplos de Uso

### Exemplo 1: Mago Conjurando Bola de Fogo

```typescript
// Jogador abre grimório
// Seleciona "Bola de Fogo" (3º nível)
// Clica em "Conjurar"

// Sistema verifica slots
if (spellSlots[3].current > 0) {
  // Exibe CD de resistência
  toast.info("CD de Destreza: 15");

  // Mestre rola TR dos inimigos
  // Se falharem:
  const damage = await rollDice("8d6"); // Ex: 28 de dano

  // Consome slot
  spellSlots[3].current--;

  toast.success("Bola de Fogo! 28 de dano de fogo");
}
```

### Exemplo 2: Clérigo Curando Aliado

```typescript
// Seleciona "Curar Ferimentos"
// Clica em "Conjurar"

const healing = await rollDice(`1d8+${wisdomMod}`); // Ex: 1d8+4
// Aliado recupera 9 HP

spellSlots[1].current--;
toast.success("Aliado curado! +9 HP");
```

### Exemplo 3: Descanso Longo

```typescript
// Jogador clica em "Descanso Longo"
restoreAllSlots();

// Todos os slots voltam ao máximo
spellSlots = {
  1: { max: 4, current: 4 },
  2: { max: 3, current: 3 },
  3: { max: 2, current: 2 },
};

toast.success("Espaços de magia restaurados!");
```

## Adicionando Novas Magias

### 1. Adicionar aos dados

```typescript
// Em spells-data.ts
const NEW_SPELL: SpellData = {
  name: "Escudo de Fé",
  level: 1,
  school: "Abjuração",
  castingTime: "1 ação bônus",
  range: "18 metros",
  components: ["V", "S", "M"],
  materialComponents: "pequeno pergaminho com texto sagrado",
  duration: "Até 10 minutos",
  concentration: true,
  ritual: false,
  description: "Uma criatura à sua escolha ganha +2 de bônus na CA.",
  availableFor: ["Clérigo", "Paladino"],
};

// Adicionar à lista
const LEVEL_1_SPELLS = [...existingSpells, NEW_SPELL];
```

### 2. Testar

```typescript
// Na ficha do personagem, adicione a magia
character.spells.known_spells.push("Escudo de Fé");

// Deve aparecer automaticamente no grimório
```

## Próximas Melhorias

### Sprint Atual
- [x] Sistema básico de magias
- [x] Gerenciador de slots
- [x] Grimório interativo
- [x] Integração com ficha
- [ ] Testes unitários

### Futuro
- [ ] Mais 50+ magias (níveis 4-9)
- [ ] Sistema de concentração (tracker de magias ativas)
- [ ] Magias rituais (sem consumir slot)
- [ ] Upcasting automático (conjurar em nível superior)
- [ ] Histórico de magias conjuradas
- [ ] Integração com chat (magias aparecem na narrativa)
- [ ] Slots de Bruxo (restauram em descanso curto)
- [ ] Sistema de metamagia para Feiticeiros
- [ ] Invocações Místicas para Bruxos

## Troubleshooting

### Magia não aparece no grimório

**Problema:** Magia adicionada mas não exibida.

**Solução:**
1. Verificar se está em `known_spells`
2. Verificar se classe está em `availableFor`
3. Limpar cache do navegador

### Slots não restauram

**Problema:** Botão "Descanso Longo" não funciona.

**Solução:**
1. Verificar se `onUpdate` está definido
2. Verificar console para erros
3. Verificar se `spell_slots` tem estrutura correta

### CD de magia incorreto

**Problema:** CD calculado errado.

**Solução:**
1. Verificar `proficiency_bonus` na ficha
2. Verificar modificador do atributo de conjuração
3. Fórmula: `8 + profBonus + attrMod`

## Referências

- [D&D 5e SRD - Magias](https://www.5esrd.com/)
- [Spell Slots por Nível](https://www.dndbeyond.com/sources/basic-rules/spellcasting#SpellSlotsperSpellLevel)
- [Escolas de Magia](https://www.5esrd.com/spellcasting/all-spells/schools/)

## Suporte

Para dúvidas:
- Consulte `/docs/CHARACTER_SHEETS.md` para estrutura de fichas
- Consulte `/docs/DICE_INTEGRATION.md` para rolagens
- Abra issue no repositório
