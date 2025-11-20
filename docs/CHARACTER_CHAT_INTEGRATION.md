# Integração de Personagens e Magias com Chat

## 📋 Visão Geral

Este documento descreve a integração completa entre fichas de personagens, sistema de magias e chat da campanha, permitindo que jogadores enviem ações diretamente da ficha para o chat.

## 🎯 Funcionalidades

### 1. **Ações de Personagem no Chat**
- ⚔️ Ataques com armas (ataque + dano)
- ✨ Conjuração de magias
- 🎯 Testes de perícias
- 🛡️ Testes de resistência
- 💪 Testes de atributos

### 2. **Cards Especiais no Chat**
- Visualização rica de ações
- Rolagens de dados automáticas
- Indicadores de crítico/falha crítica
- Metadados contextuais

### 3. **Consumo Automático de Recursos**
- Slots de magia são consumidos automaticamente
- Tracking em tempo real

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────┐
│  CharacterSheet (Ficha do Personagem)           │
│  - QuickActionButtons (botões de ação)          │
│  - SpellBookWithChat (grimório integrado)       │
└──────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│  useCharacterActions Hook                        │
│  - sendAttack()                                  │
│  - sendSpell()                                   │
│  - sendSkillCheck()                              │
│  - sendSavingThrow()                             │
│  - sendAbilityCheck()                            │
└──────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│  Firestore: /campaigns/{id}/messages             │
│  - type: 'character_action'                      │
│  - characterAction: {...}                        │
└──────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│  Chat (MessageBubble)                            │
│  - CharacterActionCard (renderização especial)  │
└──────────────────────────────────────────────────┘
```

## 📦 Componentes Criados

### 1. **Hook: `useCharacterActions`**

**Localização:** `frontend/src/hooks/useCharacterActions.ts`

**Responsabilidade:** Gerenciar envio de ações de personagem ao chat

**Métodos:**
```typescript
const {
  sendAttack,       // Envia ataque com arma
  sendSpell,        // Envia conjuração de magia
  sendSkillCheck,   // Envia teste de perícia
  sendSavingThrow,  // Envia teste de resistência
  sendAbilityCheck, // Envia teste de atributo
  isLoading,        // Estado de carregamento
  error,            // Erros
} = useCharacterActions(campaignId);
```

**Exemplo de uso:**
```typescript
await sendAttack(
  character,
  'Espada Longa',
  '1d20+5',  // Comando de ataque
  '1d8+3'    // Comando de dano
);
```

### 2. **Componente: `CharacterActionCard`**

**Localização:** `frontend/src/components/chat/CharacterActionCard.tsx`

**Responsabilidade:** Renderizar ações de personagem no chat

**Props:**
```typescript
interface CharacterActionCardProps {
  characterName: string;
  characterClass: string;
  action: CharacterAction;
  timestamp?: string;
}
```

**Tipos de ação suportados:**
- `attack` - Ataques com armas
- `spell` - Magias
- `skill` - Perícias
- `save` - Resistências
- `ability_check` - Testes de atributo

### 3. **Componente: `QuickActionButtons`**

**Localização:** `frontend/src/components/character/QuickActionButtons.tsx`

**Responsabilidade:** Botões de ação rápida na ficha

**Componentes exportados:**
- `QuickActionButton` - Botão genérico
- `AttributeQuickActions` - Para atributos
- `SkillQuickActions` - Para perícias
- `AttackQuickActions` - Para ataques
- `SavingThrowQuickActions` - Para resistências

**Exemplo de uso:**
```tsx
<AttackQuickActions
  character={character}
  campaignId={campaignId}
  weaponName="Espada Longa"
  attackCommand="1d20+5"
  damageCommand="1d8+3"
/>
```

### 4. **Componente: `SpellBookWithChat`**

**Localização:** `frontend/src/components/spells/SpellBookWithChat.tsx`

**Responsabilidade:** SpellBook integrado com chat

**Funcionalidades:**
- Validação automática de slots
- Consumo de slots ao conjurar
- Envio ao chat com metadados completos
- Truques não consomem slots

**Exemplo de uso:**
```tsx
<SpellBookWithChat
  character={character}
  campaignId={campaignId}
  allSpells={ALL_SPELLS}
/>
```

## 🔧 Como Integrar na Ficha do Personagem

### Passo 1: Adicionar campaignId como prop

```tsx
// CharacterSheet.tsx
interface CharacterSheetProps {
  character: CharacterSheetType & { id: string };
  campaignId?: string;  // Adicionar esta prop
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}
```

### Passo 2: Adicionar botões de ação rápida nos atributos

```tsx
import { AttributeQuickActions } from './QuickActionButtons';

// Dentro do componente CharacterSheet, na aba de Atributos:
{Object.entries(character.attributes).map(([attr, value]) => {
  const modifier = calculateAttributeModifier(value);
  const command = buildDiceCommand(20, 1, modifier);

  return (
    <div key={attr} className="flex items-center justify-between">
      {/* ... código existente ... */}

      {campaignId && (
        <AttributeQuickActions
          character={character}
          campaignId={campaignId}
          attribute={attrNames[attr]}
          command={command}
        />
      )}
    </div>
  );
})}
```

### Passo 3: Adicionar botões nas perícias

```tsx
import { SkillQuickActions } from './QuickActionButtons';

// Na aba de Perícias:
{Object.entries(character.skills || {}).map(([skillKey, data]) => {
  if (!data.proficient && !data.expertise) return null;

  const skill = SKILLS[skillKey];
  const command = /* cálculo do comando */;

  return (
    <div key={skillKey} className="flex items-center justify-between">
      {/* ... código existente ... */}

      {campaignId && (
        <SkillQuickActions
          character={character}
          campaignId={campaignId}
          skillName={skill.name}
          command={command}
          isProficient={data.proficient}
          isExpertise={data.expertise}
        />
      )}
    </div>
  );
})}
```

### Passo 4: Adicionar botões de ataque no equipamento

```tsx
import { AttackQuickActions } from './QuickActionButtons';
import { getAttackRolls, getDamageRolls } from '@/lib/character-dice-actions';

// Na aba de Equipamento:
const attacks = getAttackRolls(character);
const damages = getDamageRolls(character);

{character.equipment.weapon_main && (
  <div className="flex items-center justify-between">
    <span>{character.equipment.weapon_main}</span>

    {campaignId && (
      <AttackQuickActions
        character={character}
        campaignId={campaignId}
        weaponName={character.equipment.weapon_main}
        attackCommand={attacks[1].command} // Arma principal
        damageCommand={damages[1].command}
      />
    )}
  </div>
)}
```

### Passo 5: Integrar SpellBook com chat

```tsx
import { SpellBookWithChat } from '@/components/spells/SpellBookWithChat';
import { ALL_SPELLS } from '@/lib/spells-data';

// Na aba de Magias:
<TabsContent value="spells">
  {character.spells ? (
    campaignId ? (
      <SpellBookWithChat
        character={character}
        campaignId={campaignId}
        allSpells={ALL_SPELLS}
      />
    ) : (
      <SpellcastingPanel character={character} />
    )
  ) : (
    <p>Este personagem não tem habilidades de conjuração</p>
  )}
</TabsContent>
```

## 📨 Schema de Mensagem no Firestore

### Tipo: `character_action`

```typescript
{
  type: 'character_action',
  sender: 'jogador',
  characterId: string,
  characterName: string,
  characterClass: string,
  action: {
    type: 'attack' | 'spell' | 'skill' | 'save' | 'ability_check',
    name: string,
    roll?: DiceResult,
    description: string,
    metadata?: {
      damage?: DiceResult,        // Para ataques
      spellLevel?: number,        // Para magias
      saveType?: string,          // Para magias com TR
      saveDC?: number,            // CD de resistência
      damageType?: string,        // Tipo de dano
      isProficient?: boolean,     // Para perícias/resistências
      isExpertise?: boolean,      // Para perícias
      modifier?: number,          // Modificador aplicado
    }
  },
  content: string,  // Texto de fallback
  timestamp: Timestamp,
  audience: 'all',
}
```

## 🎨 Exemplo de Ação Completa

### Ataque com Espada Longa

```typescript
// Usuário clica no botão de ataque na ficha
await sendAttack(
  character,
  'Espada Longa',
  '1d20+5',  // Ataque
  '1d8+3'    // Dano
);

// Resultado no Firestore:
{
  type: 'character_action',
  characterName: 'Thorin',
  characterClass: 'Guerreiro',
  action: {
    type: 'attack',
    name: 'Espada Longa',
    roll: {
      rolls: [17],
      finalTotal: 22,
      modifier: 5,
      isCritical: false,
      isCriticalFailure: false,
    },
    metadata: {
      damage: {
        rolls: [6],
        finalTotal: 9,
        modifier: 3,
      }
    }
  },
  content: '⚔️ Ataca com Espada Longa - Rolagem: 22 | Dano: 9'
}

// Renderizado no chat como:
┌──────────────────────────────────┐
│ ⚔️ Thorin ataca com Espada Longa │
│ Guerreiro                         │
│                                   │
│ Ataque: 22 (1d20+5)              │
│   [17] +5                        │
│                                   │
│ Dano: 9 (1d8+3) cortante         │
│   [6] +3                         │
└──────────────────────────────────┘
```

### Lançamento de Bola de Fogo

```typescript
// Usuário seleciona Bola de Fogo no grimório e clica "Conjurar"
await sendSpell(character, bolaDeFogoSpell, 3);

// Resultado no chat:
┌──────────────────────────────────────┐
│ 🔥 Elara lança Bola de Fogo         │
│ Mago                                 │
│                                      │
│ Nível da Magia: 3                   │
│ CD de Resistência: DEX CD 15        │
│                                      │
│ Dano: 28 (8d6) fogo                 │
│   [5, 3, 6, 2, 4, 3, 3, 2]         │
│                                      │
│ Slots restantes: ⚪⚪⚫⚫ (2/4)      │
└──────────────────────────────────────┘
```

## ✅ Checklist de Integração

- [x] Hook `useCharacterActions` criado
- [x] Componente `CharacterActionCard` criado
- [x] Componente `QuickActionButtons` criado
- [x] Componente `SpellBookWithChat` criado
- [x] `MessageBubble` atualizado para suportar `character_action`
- [ ] CharacterSheet atualizado com botões de ação rápida
- [ ] Páginas de chat atualizadas para passar `campaignId`
- [ ] Firestore rules atualizadas (se necessário)
- [ ] Testes de integração
- [ ] Documentação de uso para usuários

## 🧪 Como Testar

### 1. Teste de Ataque
```bash
1. Acesse /campaigns/[id]
2. Abra a ficha de um personagem
3. Vá para aba "Equipamento"
4. Clique no botão de ataque próximo a uma arma
5. Verifique se apareceu no chat um card de ataque
6. Confirme que mostra rolagem de ataque e dano
```

### 2. Teste de Magia
```bash
1. Acesse /campaigns/[id]
2. Abra a ficha de um personagem conjurador
3. Vá para aba "Magias"
4. Selecione uma magia de nível > 0
5. Clique em "Conjurar"
6. Verifique se:
   - Apareceu card no chat
   - Slot foi consumido
   - Toast de sucesso apareceu
```

### 3. Teste de Perícia
```bash
1. Abra ficha do personagem
2. Vá para aba "Perícias"
3. Clique no botão de uma perícia proficiente
4. Verifique se apareceu no chat com badge "Proficiente"
```

## 🐛 Troubleshooting

### Erro: "campaignId is undefined"
**Solução:** Certifique-se de que está passando `campaignId` como prop para CharacterSheet

### Erro: "Cannot read property 'spells' of undefined"
**Solução:** Verifique se o personagem tem o campo `spells` definido

### Mensagem não aparece no chat
**Solução:**
1. Verifique console do navegador para erros
2. Confirme que Firestore está configurado corretamente
3. Verifique permissões do Firestore

### Slots de magia não são consumidos
**Solução:** Verifique se `updateCharacterSheet` está sendo chamado corretamente após enviar spell

## 📚 Recursos Adicionais

- [Documentação do Sistema de Dados](./DICE_SYSTEM.md)
- [Documentação de Magias](./SPELLCASTING_SYSTEM.md)
- [Documentação do Chat](./CHAT_UPDATES_30_10_2025.md)
- [Firestore Security Rules](./FIRESTORE_SECURITY_RULES.md)

## 🔄 Próximas Melhorias

1. **Ações em Lote**: Permitir enviar múltiplas ações de uma vez
2. **Histórico de Ações**: Painel mostrando últimas 10 ações do personagem
3. **Reações**: Suporte para reações (Ataque de Oportunidade, Contra-Feiço)
4. **Ações Bônus**: Marcar ações como bônus/reação
5. **Vantagem/Desvantagem**: UI para rolar com vantagem/desvantagem
6. **Templates de Ação**: Salvar combos favoritos
7. **Integração com IA**: Drogon responde narrativamente às ações

## 👥 Contribuindo

Para adicionar novos tipos de ação:

1. Adicione o tipo em `CharacterAction['type']`
2. Implemente método correspondente em `useCharacterActions`
3. Atualize `CharacterActionCard` para renderizar o novo tipo
4. Adicione helper em `character-dice-actions.ts` se necessário
5. Atualize esta documentação

---

**Última atualização:** 30/10/2025
**Versão:** 1.0.0
**Autor:** Claude Code (Integração de Sistema)
