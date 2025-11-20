# 🏗️ Separação: Campanhas vs Chat com Drogon

## 📊 Visão Geral

O sistema será dividido em **duas funcionalidades distintas e independentes**:

### 1. 💬 **Chat com Drogon** (Individual)
- **Propósito**: Conversas exploratórias, testes, consultas rápidas
- **Usuário**: Individual (1 pessoa)
- **Persistência**: Histórico pessoal de conversas
- **Casos de Uso**:
  - Consultar regras de D&D
  - Gerar ideias para campanhas
  - Testar narrativas
  - Aprender sobre lore
  - Exploração sandbox

### 2. 🏰 **Campanhas** (Multiplayer)
- **Propósito**: Sessões formais de RPG com múltiplos jogadores
- **Usuário**: Mestre + Jogadores (1:N)
- **Persistência**: Histórico compartilhado de sessões
- **Casos de Uso**:
  - Sessões de jogo organizadas
  - Controle de sessão (timer, pausar, etc.)
  - Histórico de aventuras
  - Gestão de jogadores
  - Fichas de personagem vinculadas

---

## 🗂️ Nova Estrutura de Dados

### Collection: `/conversations` (Chat Individual)

```typescript
interface Conversation {
  user_uid: string;           // Dono da conversa
  title?: string;              // Opcional: "Consulta sobre Magias"
  created_at: Timestamp;
  last_message_at: Timestamp;
  context: {
    tone: 'epic' | 'casual' | 'horror';
    detail_level: 'low' | 'medium' | 'high';
    language: 'pt-BR' | 'en-US' | 'es-ES';
  };
  tags?: string[];             // Ex: ["rules", "spells", "lore"]
}

// Subcollection
/conversations/{conversationId}/messages/{messageId}
  sender: 'user' | 'drogon'
  content: string
  timestamp: Timestamp
```

**Características:**
- ❌ Não tem `players[]`
- ❌ Não tem sessões formais
- ❌ Não tem Master Session Control
- ✅ Pessoal e privado
- ✅ Múltiplas conversas paralelas
- ✅ Leve e rápido

---

### Collection: `/campaigns` (Multiplayer - ATUALIZADO)

```typescript
interface Campaign {
  master_uid: string;          // Quem criou a campanha
  title: string;               // OBRIGATÓRIO: "A Queda do Dragão"
  description?: string;
  players: string[];           // UIDs dos jogadores
  invite_code?: string;        // Código de convite (ex: "DRAG-2024")
  status: 'active' | 'paused' | 'archived';
  created_at: Timestamp;
  last_session?: Timestamp;
  current_session?: string;    // ID da sessão ativa
  context: {
    tone: 'epic' | 'casual' | 'horror';
    detail_level: 'low' | 'medium' | 'high';
    language: 'pt-BR' | 'en-US' | 'es-ES';
    style: 'sandbox' | 'linear' | 'mystery' | 'combat';
  };
  settings: {
    allow_player_invites: boolean;
    require_character_sheet: boolean;
    max_players: number;       // Limite de jogadores
  };
}

// Subcollection
/campaigns/{campaignId}/messages/{messageId}
  sender: 'mestre' | 'jogador' | 'drogon'
  player_uid?: string
  content: string
  timestamp: Timestamp
  type?: 'message' | 'dice_roll' | 'system'

/campaigns/{campaignId}/players/{playerUid}
  joined_at: Timestamp
  character_sheet_id?: string
  role: 'player' | 'spectator'
  status: 'active' | 'inactive'
```

**Características:**
- ✅ Multiplayer (1 Mestre + N Jogadores)
- ✅ Sessões formais com timer
- ✅ Histórico compartilhado
- ✅ Sistema de convites
- ✅ Gestão de jogadores
- ✅ Fichas vinculadas

---

## 🎨 Nova Estrutura de Páginas

### `/drogon` - Chat Individual

```
┌─────────────────────────────────────┐
│  🐉 Chat com Mestre Drogon          │
├─────────────────────────────────────┤
│  Minhas Conversas     [+ Nova]      │
│  ┌───────────────────────────────┐  │
│  │ 📜 Consulta sobre Magias      │  │
│  │    5 mensagens • 2h atrás     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🎲 Ideias para Campanha       │  │
│  │    12 mensagens • 1d atrás    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Features:**
- Lista de conversas pessoais
- Criar nova conversa
- Continuar conversa existente
- Deletar conversas antigas
- Exportar conversas
- Tags para organização

---

### `/campaigns` - Gerenciamento de Campanhas

```
┌─────────────────────────────────────┐
│  🏰 Minhas Campanhas                │
├─────────────────────────────────────┤
│  [+ Criar Campanha]                 │
│                                     │
│  COMO MESTRE                        │
│  ┌───────────────────────────────┐  │
│  │ ⚔️ A Queda do Dragão Vermelho │  │
│  │    3 jogadores • Sessão ativa │  │
│  │    [Abrir] [Gerenciar]        │  │
│  └───────────────────────────────┘  │
│                                     │
│  COMO JOGADOR                       │
│  ┌───────────────────────────────┐  │
│  │ 🛡️ Aventuras em Waterdeep    │  │
│  │    Mestre: João • 4 players   │  │
│  │    [Entrar]                   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Features:**
- Criar campanha (apenas Mestres)
- Ver campanhas como Mestre
- Ver campanhas como Jogador
- Gerenciar jogadores
- Gerar código de convite
- Arquivar campanhas antigas

---

### `/campaigns/[id]` - Sessão de Campanha

```
┌─────────────────────────────────────┐
│  ⚔️ A Queda do Dragão Vermelho      │
│  Mestre: Você • 3/5 jogadores       │
├─────────────────────────────────────┤
│                                     │
│  [CHAT]          [SESSION CONTROL]  │
│  Mensagens       Timer: 01:23:45    │
│  compartilhadas  [⏸ Pausar]         │
│                  [⏹ Encerrar]       │
│                                     │
│                  📊 Estatísticas    │
│                  42 msgs            │
│                  15 dados           │
│                  3 players          │
└─────────────────────────────────────┘
```

---

## 🔀 Fluxo de Navegação

### Para Mestres:

```
Dashboard
  ├─ [Chat com Drogon] → /drogon
  │   └─ Conversas pessoais
  │
  └─ [Minhas Campanhas] → /campaigns
      ├─ [+ Criar Campanha]
      ├─ Campanha A → /campaigns/abc123
      └─ Campanha B → /campaigns/def456
```

### Para Jogadores:

```
Dashboard
  ├─ [Chat com Drogon] → /drogon
  │   └─ Conversas pessoais
  │
  └─ [Minhas Campanhas] → /campaigns
      ├─ Campanha A (como jogador)
      └─ Campanha B (como jogador)
```

---

## 🎯 Migração de Código

### 1. Mover `/chat` → `/drogon`
```bash
mv frontend/src/app/chat → frontend/src/app/drogon
```

### 2. Criar `/campaigns/page.tsx`
- Lista de campanhas (Mestre vs Jogador)
- Card para criar campanha (apenas Mestre)

### 3. Criar `/campaigns/[id]/page.tsx`
- Chat compartilhado
- Master Session Control (apenas Mestre)
- Lista de jogadores
- Configurações de campanha

### 4. Atualizar `CampaignContext`
```typescript
// Renomear para CampaignContext (mantém campanhas)
// Criar ConversationContext (novas conversas individuais)
```

---

## 📝 Firestore Rules

```javascript
// Conversations - Individual e privado
match /conversations/{conversationId} {
  allow read, write: if request.auth.uid == resource.data.user_uid;
}

match /conversations/{conversationId}/messages/{messageId} {
  allow read, write: if request.auth.uid == get(/databases/$(database)/documents/conversations/$(conversationId)).data.user_uid;
}

// Campaigns - Multiplayer compartilhado
match /campaigns/{campaignId} {
  allow read: if hasCampaignAccess(campaignId);
  allow create: if isMaster();
  allow update, delete: if isCampaignMaster(campaignId);
}

match /campaigns/{campaignId}/messages/{messageId} {
  allow read: if hasCampaignAccess(campaignId);
  allow create: if hasCampaignAccess(campaignId);
}
```

---

## ✅ Checklist de Implementação

### Fase 1: Estrutura de Dados
- [ ] Criar interfaces `Conversation` e `ConversationMessage`
- [ ] Atualizar interface `Campaign` (adicionar `invite_code`, `settings`)
- [ ] Criar `ConversationContext`
- [ ] Manter `CampaignContext` (atualizado)

### Fase 2: Firestore Helpers
- [ ] `createConversation()`
- [ ] `getConversations(uid)`
- [ ] `sendConversationMessage()`
- [ ] `updateCampaign()` (adicionar players)
- [ ] `generateInviteCode()`
- [ ] `joinCampaign(code)`

### Fase 3: Páginas
- [ ] `/drogon/page.tsx` - Lista de conversas
- [ ] `/drogon/[id]/page.tsx` - Chat individual
- [ ] `/campaigns/page.tsx` - Lista de campanhas
- [ ] `/campaigns/[id]/page.tsx` - Sessão de campanha

### Fase 4: Componentes
- [ ] `ConversationList` - Lista de conversas
- [ ] `CreateConversationDialog` - Criar conversa
- [ ] `CampaignList` - Lista de campanhas (Mestre vs Jogador)
- [ ] `CreateCampaignDialog` - Atualizar para multiplayer
- [ ] `InvitePlayersDialog` - Gerar e compartilhar código
- [ ] `PlayerManagementPanel` - Adicionar/remover jogadores

### Fase 5: Dashboard
- [ ] Separar cards: "Chat com Drogon" vs "Campanhas"
- [ ] Estatísticas separadas
- [ ] Navegação clara

### Fase 6: Firestore Rules
- [ ] Adicionar rules para `/conversations`
- [ ] Atualizar rules para `/campaigns` (multiplayer)

---

## 📊 Comparação Final

| Feature | Chat com Drogon | Campanhas |
|---------|----------------|-----------|
| **Usuários** | 1 (individual) | 1 Mestre + N Jogadores |
| **Objetivo** | Consultas, testes, exploração | Sessões formais de RPG |
| **Sessões** | ❌ Não tem | ✅ Timer, pausar, histórico |
| **Jogadores** | ❌ Não tem | ✅ Adicionar/remover |
| **Convites** | ❌ Não tem | ✅ Código de convite |
| **Fichas** | ❌ Não vincula | ✅ Vincula personagens |
| **Histórico** | Pessoal | Compartilhado |
| **Privacidade** | Privado | Compartilhado (grupo) |

---

## 🚀 Próximos Passos

1. **Implementar estrutura de dados**
2. **Criar páginas `/drogon` e `/campaigns`**
3. **Migrar código existente**
4. **Atualizar dashboard**
5. **Testar fluxos completos**

**Tempo Estimado:** ~8-12 horas

---

**Data:** 28/10/2025
**Status:** 📋 Planejamento Completo
