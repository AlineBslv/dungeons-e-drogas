# Integração de Dados com Fichas de Personagem

## Visão Geral

Sistema completo que integra rolagens de dados com as fichas de personagem D&D 5e, calculando automaticamente modificadores baseados nos atributos, perícias e equipamentos do personagem.

## Arquitetura

### 1. Helper de Ações de Dados (`character-dice-actions.ts`)

Biblioteca que gera ações de rolagem baseadas na ficha do personagem.

#### Funções Principais

```typescript
// Gera testes de atributos (Força, Destreza, etc)
getAttributeTests(character: CharacterSheet): DiceAction[]

// Gera testes de perícias treinadas
getSkillTests(character: CharacterSheet): DiceAction[]

// Gera testes de resistência (Saving Throws)
getSavingThrows(character: CharacterSheet): DiceAction[]

// Gera rolagens de ataque com armas equipadas
getAttackRolls(character: CharacterSheet): DiceAction[]

// Gera rolagens de dano
getDamageRolls(character: CharacterSheet): DiceAction[]

// Retorna todas as ações organizadas
getAllCharacterDiceActions(character: CharacterSheet)
```

#### Interface DiceAction

```typescript
interface DiceAction {
  id: string;              // Identificador único (ex: "skill_perception")
  label: string;           // Nome exibido (ex: "Percepção")
  command: string;         // Comando de dados (ex: "1d20+5")
  description: string;     // Descrição da ação
  category: 'attribute' | 'skill' | 'attack' | 'save' | 'damage';
  modifier: number;        // Modificador total aplicado
  isProficient?: boolean;  // Se tem proficiência
}
```

### 2. Componente CharacterDiceActions

Componente visual que exibe todas as rolagens disponíveis para um personagem.

#### Uso

```tsx
import { CharacterDiceActions } from '@/components/character/CharacterDiceActions';

// Versão completa (com tabs)
<CharacterDiceActions character={character} />

// Versão compacta (apenas ataques principais)
<CharacterDiceActions character={character} compact />
```

#### Features

- **4 Tabs Organizadas:**
  - 🎲 **Ataques:** Rolagens de ataque e dano
  - ⚡ **Perícias:** Apenas perícias treinadas/com expertise
  - 🧠 **Atributos:** Testes de atributo puro
  - 🛡️ **Resistências:** Saving Throws

- **Exibição de Resultado:** Mostra último resultado com destaque para críticos/falhas críticas

- **Modificadores Visuais:** Cada ação mostra claramente o modificador aplicado

### 3. QuickActions Integrado

Componente de ações rápidas agora aceita ficha completa.

#### Antes (Apenas Modificadores Básicos)

```tsx
<QuickActions
  characterModifiers={{
    strength: 16,
    dexterity: 14,
    wisdom: 12,
    charisma: 10
  }}
/>
```

#### Agora (Com Ficha Completa)

```tsx
<QuickActions
  character={characterSheet}  // Passa ficha completa
/>
```

#### Diferenças

**Com ficha completa:**
- Usa ataques reais das armas equipadas
- Mostra perícias treinadas com bônus de proficiência
- Exibe nome do personagem
- Limita automaticamente a 6 ações mais relevantes

**Sem ficha (fallback):**
- Ações genéricas (Atacar, Defender, Investigar, etc)
- Modificadores básicos dos atributos

### 4. PlayerPanel & PlayerDicePanel

Painel do jogador agora integra completamente com a ficha.

```tsx
<PlayerPanel campaignId="campaign_123" />
```

**Fluxo:**
1. Carrega ficha vinculada à campanha automaticamente
2. Passa ficha completa para `PlayerDicePanel`
3. `PlayerDicePanel` passa para `QuickActions`
4. Ações geradas automaticamente com modificadores corretos

## Cálculos Automáticos

### Modificador de Atributo

```typescript
Modificador = floor((Atributo - 10) / 2)

Exemplos:
8  → -1
10 → 0
14 → +2
16 → +3
20 → +5
```

### Teste de Perícia

```typescript
Modificador Total = Modificador do Atributo + Bônus de Proficiência + Bônus de Expertise

Exemplo (Percepção, Sabedoria 14, Nível 5, Com proficiência):
  Modificador de Sabedoria: +2
  Bônus de Proficiência: +3
  Total: +5
  Comando: "1d20+5"
```

### Rolagem de Ataque

```typescript
Modificador de Ataque = Modificador do Atributo + Bônus de Proficiência

Exemplo (Espada Longa, Força 16, Nível 3):
  Modificador de Força: +3
  Bônus de Proficiência: +2
  Total: +5
  Comando: "1d20+5"
```

### Armas Finesse

Armas de finesse (adaga, espada curta, florete) usam o **maior** entre Força e Destreza:

```typescript
const isFinesse = weaponName.includes('adaga') || weaponName.includes('espada curta');
const modifier = isFinesse ? Math.max(strMod, dexMod) : strMod;
```

### Detecção de Tipo de Dado de Dano

```typescript
const damageDiceMap = {
  'adaga': 4,
  'espada curta': 6,
  'espada longa': 8,
  'machado': 10,
  'grande': 12  // Espadas grandes, machados grandes
};
```

## Integração com Chat (Futuro)

### Rolagens no Chat

```typescript
// Em desenvolvimento
// Ao rolar dados na ficha, envia para o chat da campanha
const handleRoll = async (action: DiceAction) => {
  const result = await rollDice(action.command, {
    characterName: character.name,
    context: action.description,
    campaignId: currentCampaignId
  });

  // Envia para WebSocket da campanha
  socket.emit('dice_rolled', {
    campaignId,
    userId: user.uid,
    character: character.name,
    action: action.label,
    result: result.result
  });
};
```

## Exemplos de Uso

### 1. Visualização de Ficha com Rolagens

```tsx
import { CharacterSheetView } from '@/components/character/CharacterSheet';

// Na visualização da ficha, há uma tab "Dados" que mostra CharacterDiceActions
<CharacterSheetView character={character} />
```

### 2. Painel do Jogador em Campanha

```tsx
import { PlayerPanel } from '@/components/app/player-panel';

// Carrega automaticamente a ficha vinculada à campanha
<PlayerPanel campaignId="campaign_xyz" />
```

### 3. Ações Rápidas Personalizadas

```tsx
import QuickActions from '@/components/player/QuickActions';

<QuickActions
  character={character}
  onAction={(action, command) => {
    console.log(`Rolando ${action.label}: ${command}`);
  }}
/>
```

## Fluxo de Dados

```
1. Usuário cria ficha de personagem
   └─> /characters (CharacterForm)
        └─> Salva em Firestore (character_sheets)

2. Jogador entra em campanha
   └─> PlayerPanel busca ficha vinculada
        └─> getCampaignCharacterSheets(campaignId)

3. PlayerPanel passa ficha para PlayerDicePanel
   └─> PlayerDicePanel passa para QuickActions
        └─> getAllCharacterDiceActions(character)
             └─> Gera ações com modificadores corretos

4. Jogador clica em ação
   └─> handleRoll() chama API de dados
        └─> POST /dice/roll com modificadores
             └─> Salva no Firestore e retorna resultado
```

## Estrutura de Arquivos

```
frontend/src/
├── lib/
│   ├── character-dice-actions.ts    # Lógica de geração de ações
│   ├── dice-helpers.ts              # API de dados
│   └── firestore-helpers.ts         # CRUD de fichas
├── components/
│   ├── character/
│   │   ├── CharacterDiceActions.tsx  # UI de rolagens na ficha
│   │   ├── CharacterSheet.tsx        # Visualização com tab Dados
│   │   └── CharacterForm.tsx         # Criação/edição
│   ├── player/
│   │   ├── QuickActions.tsx          # Ações rápidas (agora com ficha)
│   │   ├── PlayerDicePanel.tsx       # Painel de dados do jogador
│   │   └── DiceRoller.tsx            # Rolador manual
│   └── app/
│       └── player-panel.tsx          # Painel completo do jogador
```

## Próximos Passos

### Sprint Atual
- [x] Helper de geração de ações
- [x] Componente CharacterDiceActions
- [x] Integração com QuickActions
- [x] Integração com PlayerPanel
- [ ] Testes unitários

### Futuro (Sprints 11-12)
- [ ] Seletor de personagem ativo em campanhas com múltiplos personagens
- [ ] Sincronização de rolagens com chat da campanha via WebSocket
- [ ] Histórico de rolagens por personagem
- [ ] Atalhos de teclado para rolagens comuns (R para ataque, P para percepção)
- [ ] Templates de ações customizadas (macros)
- [ ] Integração com magias e spell slots

## Troubleshooting

### Ações não aparecem no QuickActions

**Problema:** QuickActions não mostra ações da ficha.

**Solução:** Verificar se a prop `character` está sendo passada:
```tsx
<QuickActions character={characterSheet} />
```

### Modificadores incorretos

**Problema:** Modificadores não batem com a ficha.

**Solução:** Verificar se:
1. `proficiency_bonus` está calculado corretamente no backend
2. Perícias marcadas como `proficient: true` na ficha
3. Bônus raciais aplicados aos atributos

### Ficha não carrega no PlayerPanel

**Problema:** PlayerPanel não encontra personagem.

**Solução:**
1. Verificar se personagem está vinculado à campanha (`campaign_id` definido)
2. Verificar permissões do Firestore
3. Ver console para erros de carregamento

## Suporte

Para dúvidas ou problemas:
- Consulte `/docs/CHARACTER_SHEETS.md` para detalhes sobre fichas
- Consulte `/docs/DICE_SYSTEM.md` para sistema de dados
- Abra uma issue no repositório
