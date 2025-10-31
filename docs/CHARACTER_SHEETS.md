# Sistema de Fichas de Personagem - Dungeons e Drogas

## Visão Geral

Sistema completo de CRUD para fichas de personagem D&D 5e, integrado com campanhas e chat narrativo.

## Estrutura de Dados

### CharacterSheet (Firestore Collection: `character_sheets`)

```typescript
{
  player_uid: string;              // UID do jogador dono da ficha
  campaign_id?: string;            // ID da campanha vinculada (opcional)
  name: string;                    // Nome do personagem
  class: string;                   // Classe (Guerreiro, Mago, etc)
  race: string;                    // Raça (Humano, Elfo, etc)
  level: number;                   // Nível (1-20)
  background?: string;             // Antecedente
  alignment?: string;              // Alinhamento moral

  // Atributos D&D 5e (3-20)
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };

  // Pontos de Vida
  hp: {
    current: number;
    max: number;
    temporary: number;
  };

  armor_class: number;             // CA
  proficiency_bonus: number;       // Bônus de proficiência (calculado)

  // Proficiências
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
  };

  // Perícias (skills)
  skills: {
    [key: string]: {
      proficient: boolean;
      expertise: boolean;
      bonus?: number;
    };
  };

  // Equipamento
  equipment: {
    armor?: string;
    weapon_main?: string;
    weapon_off?: string;
    inventory: InventoryItem[];
  };

  // Magias (opcional)
  spells?: {
    spellcasting_ability?: string;
    spell_save_dc?: number;
    spell_attack_bonus?: number;
    spell_slots?: { [level: number]: { max: number; current: number } };
    known_spells: string[];
  };

  // Informações narrativas
  personality_traits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;

  created_at: Timestamp;
  updated_at: Timestamp;
}
```

## API Backend

### Endpoints (`/characters`)

#### POST `/characters`
Cria nova ficha de personagem.

**Headers:**
- `x-user-id`: UID do usuário autenticado

**Body:**
```json
{
  "name": "Thorin Escudo de Pedra",
  "class": "Guerreiro",
  "race": "Anão",
  "level": 3,
  "attributes": {
    "strength": 16,
    "dexterity": 12,
    "constitution": 15,
    "intelligence": 10,
    "wisdom": 11,
    "charisma": 8
  },
  "hp": {
    "current": 28,
    "max": 28
  },
  "armor_class": 17
}
```

**Response:**
```json
{
  "success": true,
  "id": "abc123",
  "message": "Ficha criada com sucesso"
}
```

#### GET `/characters`
Lista todas as fichas do usuário.

**Query Params:**
- `campaign_id` (opcional): Filtrar por campanha

**Response:**
```json
{
  "success": true,
  "characters": [...]
}
```

#### GET `/characters/:id`
Busca ficha específica.

**Response:**
```json
{
  "success": true,
  "character": {...}
}
```

#### PUT `/characters/:id`
Atualiza ficha existente.

**Body:** Campos a atualizar (parcial)

**Response:**
```json
{
  "success": true,
  "message": "Ficha atualizada com sucesso"
}
```

#### DELETE `/characters/:id`
Deleta ficha permanentemente.

**Response:**
```json
{
  "success": true,
  "message": "Ficha deletada com sucesso"
}
```

#### PATCH `/characters/:id/hp`
Atualiza apenas HP do personagem.

**Body:**
```json
{
  "current": 15,
  "temporary": 5
}
```

#### POST `/characters/:id/inventory`
Adiciona item ao inventário.

**Body:**
```json
{
  "name": "Poção de Cura",
  "quantity": 3,
  "weight": 0.5,
  "description": "Restaura 2d4+2 HP"
}
```

#### PATCH `/characters/:id/link-campaign`
Vincula ficha a uma campanha.

**Body:**
```json
{
  "campaign_id": "campaign_xyz"
}
```

## Frontend - Firestore Helpers

### Funções Principais

```typescript
// Criar ficha
const sheetId = await createCharacterSheet(playerUid, characterData);

// Buscar ficha
const sheet = await getCharacterSheet(sheetId);

// Atualizar ficha
await updateCharacterSheet(sheetId, updates);

// Deletar ficha
await deleteCharacterSheet(sheetId);

// Listar fichas do jogador
const sheets = await getPlayerCharacterSheets(playerUid);

// Listar fichas de uma campanha
const campaignSheets = await getCampaignCharacterSheets(campaignId);

// Vincular/desvincular de campanha
await linkCharacterToCampaign(sheetId, campaignId);
await unlinkCharacterFromCampaign(sheetId);

// Atualizar HP
await updateCharacterHP(sheetId, currentHp, temporaryHp);

// Gerenciar inventário
await addInventoryItem(sheetId, item);
await removeInventoryItem(sheetId, itemName);
```

### Funções Utilitárias

```typescript
// Calcula modificador de atributo (-5 a +5)
const mod = calculateAttributeModifier(16); // +3

// Calcula bônus de proficiência baseado no level
const profBonus = calculateProficiencyBonus(5); // +3
```

## Componentes React

### CharacterForm
Formulário completo para criar/editar personagem.

```tsx
<CharacterForm
  initialData={existingCharacter}  // Opcional, para edição
  onSave={handleSave}
  onCancel={handleCancel}
  campaignId={campaignId}          // Opcional, vincular à campanha
/>
```

### CharacterSheetView
Visualização completa ou compacta da ficha.

```tsx
// Visualização completa
<CharacterSheetView
  character={character}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// Visualização compacta (lista)
<CharacterSheetView
  character={character}
  compact
/>
```

### PlayerPanel (Atualizado)
Painel do jogador integrado com fichas.

```tsx
<PlayerPanel
  campaignId={campaignId}  // Carrega automaticamente a ficha vinculada
/>
```

## Página de Gerenciamento

**Rota:** `/characters`

Funcionalidades:
- Listar todas as fichas do jogador
- Criar nova ficha
- Editar ficha existente
- Visualizar ficha completa
- Deletar ficha

## Integração com Campanhas

### Fluxo de Vinculação

1. **Jogador cria personagem** em `/characters`
2. **Mestre convida jogador** para campanha
3. **Jogador vincula personagem** à campanha:
   ```typescript
   await linkCharacterToCampaign(sheetId, campaignId);
   ```
4. **PlayerPanel carrega automaticamente** a ficha vinculada durante sessões

### Permissões (Firestore Rules)

```javascript
// Leitura: dono da ficha OU mestre da campanha
allow read: if isAuthenticated() && (
  resource.data.player_uid == request.auth.uid ||
  (resource.data.campaign_id != null && isCampaignMaster(resource.data.campaign_id))
);

// Criação: apenas jogadores (com uid correspondente)
allow create: if isAuthenticated() &&
  request.resource.data.player_uid == request.auth.uid;

// Atualização/Deleção: apenas o dono da ficha
allow update, delete: if isAuthenticated() &&
  resource.data.player_uid == request.auth.uid;
```

## Cálculos Automáticos

### Modificador de Atributo (D&D 5e)
```
Modificador = floor((Atributo - 10) / 2)

Exemplos:
8  → -1
10 → 0
12 → +1
16 → +3
20 → +5
```

### Bônus de Proficiência
```
Level 1-4:   +2
Level 5-8:   +3
Level 9-12:  +4
Level 13-16: +5
Level 17-20: +6

Fórmula: floor((level - 1) / 4) + 2
```

## Próximos Passos (Roadmap)

### Sprint 9-10
- [ ] Sistema de Skills/Perícias detalhado
- [ ] Rolagem de dados com modificadores da ficha
- [ ] Gestão de magias (spell slots)
- [ ] Feats e habilidades de classe

### Sprint 11-12
- [ ] Importação de fichas (JSON/PDF)
- [ ] Exportação de fichas (PDF)
- [ ] Templates de personagens pré-criados
- [ ] Compartilhamento de fichas entre jogadores

## Exemplos de Uso

### Criar Personagem Completo

```typescript
const sheetId = await createCharacterSheet(user.uid, {
  name: "Aria Tempestade",
  class: "Mago",
  race: "Elfo",
  level: 5,
  background: "Sábio",
  alignment: "Neutro e Bom",
  attributes: {
    strength: 8,
    dexterity: 14,
    constitution: 12,
    intelligence: 18,
    wisdom: 13,
    charisma: 10,
  },
  hp: {
    current: 24,
    max: 24,
    temporary: 0,
  },
  armor_class: 12,
  proficiencies: {
    armor: [],
    weapons: ["Adaga", "Dardo", "Funda", "Bordão", "Besta Leve"],
    tools: [],
    languages: ["Comum", "Élfico", "Dracônico", "Anão"],
  },
  equipment: {
    armor: "Vestes",
    weapon_main: "Bordão Arcano",
    weapon_off: "Grimório",
    inventory: [
      { name: "Poção de Cura", quantity: 2, weight: 0.5 },
      { name: "Componentes de Feitiço", quantity: 1, weight: 1 },
      { name: "Livro de Feitiços", quantity: 1, weight: 3 },
    ],
  },
  spells: {
    spellcasting_ability: "Intelligence",
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
      "Detectar Magia",
    ],
  },
  personality_traits: "Curioso e sedento por conhecimento arcano",
  ideals: "O conhecimento deve ser compartilhado com todos",
  bonds: "Meu grimório é minha posse mais valiosa",
  flaws: "Subestimo os perigos em busca de novos feitiços",
  backstory: "Cresceu na biblioteca de uma torre arcana...",
});
```

## Troubleshooting

### Ficha não aparece no PlayerPanel
- Verificar se `campaign_id` está definido na ficha
- Verificar se o jogador está na lista `players` da campanha

### Erro de permissão ao atualizar ficha
- Verificar se `player_uid` corresponde ao usuário autenticado
- Verificar Firestore Rules

### Cálculos incorretos
- Verificar se `level` está entre 1-20
- Verificar se `attributes` estão entre 1-20
- Proficiency bonus é recalculado automaticamente ao mudar level

## Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação do projeto em `/docs`
- Contate o time de desenvolvimento
