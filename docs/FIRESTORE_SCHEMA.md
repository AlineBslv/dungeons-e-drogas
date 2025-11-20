# Firestore Database Schema - Dungeons e Drogas

Estrutura completa das collections do Firestore com tipos, validações e exemplos.

## 📋 Collections Overview

```
firestore
├── users/{uid}
├── campaigns/{campaignId}
├── messages/{campaignId}/{messageId}
├── contexts/{campaignId}
├── manual_texts/{textId}
├── character_sheets/{sheetId}
└── session_logs/{sessionId}
```

---

## 👤 Users Collection

**Path:** `/users/{uid}`

### Schema

```typescript
interface User {
  uid: string;                          // Firebase Auth UID
  email: string;                        // Email do usuário
  name: string;                         // Nome de exibição
  tier: 'mestre' | 'jogador';          // Tipo de usuário
  active_campaigns: string[];           // IDs das campanhas ativas
  preferred_tone?: 'epic' | 'casual' | 'horror';  // Tom narrativo preferido
  created_at: Timestamp;                // Data de criação
}
```

### Exemplo

```json
{
  "uid": "abc123def456",
  "email": "mestre@example.com",
  "name": "Mestre das Sombras",
  "tier": "mestre",
  "active_campaigns": ["campaign_001", "campaign_002"],
  "preferred_tone": "epic",
  "created_at": "2025-10-18T00:00:00Z"
}
```

### Regras de Acesso

- **Read:** Apenas o próprio usuário
- **Create:** Durante registro (uid deve coincidir)
- **Update:** Apenas o próprio usuário (não pode mudar uid, email ou tier)
- **Delete:** Não permitido

---

## 🎭 Campaigns Collection

**Path:** `/campaigns/{campaignId}`

### Schema

```typescript
interface Campaign {
  master_uid: string;                   // UID do mestre
  players: string[];                    // UIDs dos jogadores
  context: CampaignContext;             // Contexto da campanha
  created_at: Timestamp;                // Data de criação
  last_session?: Timestamp;             // Última sessão
  title?: string;                       // Título da campanha
  description?: string;                 // Descrição
}

interface CampaignContext {
  tone: 'epic' | 'casual' | 'horror';   // Tom narrativo
  detail_level: 'low' | 'medium' | 'high';  // Nível de detalhe
  language: 'pt-BR' | 'en-US';          // Idioma
  style?: string;                       // Estilo narrativo customizado
}
```

### Exemplo

```json
{
  "master_uid": "abc123def456",
  "players": ["player1uid", "player2uid", "player3uid"],
  "context": {
    "tone": "epic",
    "detail_level": "high",
    "language": "pt-BR",
    "style": "tolkienesque"
  },
  "title": "A Queda do Reino Sombrio",
  "description": "Uma aventura épica nas terras de Eldoria",
  "created_at": "2025-10-18T00:00:00Z",
  "last_session": "2025-10-19T20:00:00Z"
}
```

### Regras de Acesso

- **Read:** Mestre e jogadores da campanha
- **Create:** Apenas mestres
- **Update:** Apenas o mestre da campanha
- **Delete:** Apenas o mestre da campanha

---

## 💬 Messages Collection

**Path:** `/messages/{campaignId}/{messageId}`

### Schema

```typescript
interface Message {
  sender: 'mestre' | 'jogador' | 'drogon';  // Quem enviou
  content: string;                      // Conteúdo da mensagem
  timestamp: Timestamp;                 // Quando foi enviada
  roll_data?: DiceRoll;                 // Dados de rolagem (opcional)
  player_uid?: string;                  // UID do jogador (se sender = 'jogador')
}

interface DiceRoll {
  dice: string;                         // Ex: "d20", "2d6+3"
  modifier: number;                     // Modificador
  result: number;                       // Resultado final
  rolls?: number[];                     // Valores individuais dos dados
}
```

### Exemplo

```json
{
  "sender": "jogador",
  "player_uid": "player1uid",
  "content": "Eu ataco o goblin com minha espada!",
  "roll_data": {
    "dice": "d20",
    "modifier": 5,
    "result": 18,
    "rolls": [13]
  },
  "timestamp": "2025-10-19T20:15:30Z"
}
```

### Regras de Acesso

- **Read:** Todos os participantes da campanha
- **Create:** Participantes da campanha (mestre pode enviar como 'mestre' ou 'drogon', jogador apenas como 'jogador')
- **Update:** Não permitido (mensagens imutáveis)
- **Delete:** Apenas o mestre da campanha

---

## 🧠 Contexts Collection

**Path:** `/contexts/{campaignId}`

### Schema

```typescript
interface Context {
  current_scene?: string;               // Descrição da cena atual
  active_characters: string[];          // Personagens ativos na cena
  location?: string;                    // Localização atual
  time_of_day?: string;                 // Hora do dia
  recent_events: string[];              // Eventos recentes (últimos 5)
  session_summary?: string;             // Resumo da sessão
  updated_at: Timestamp;                // Última atualização
}
```

### Exemplo

```json
{
  "current_scene": "Os heróis estão na taverna 'O Dragão Dourado'",
  "active_characters": ["Thorin", "Elara", "Grimm"],
  "location": "Taverna O Dragão Dourado, Cidade de Waterdeep",
  "time_of_day": "Noite",
  "recent_events": [
    "Conheceram o misterioso elfo",
    "Receberam a missão do conselho",
    "Compraram provisões"
  ],
  "session_summary": "Os aventureiros chegaram em Waterdeep e receberam sua primeira missão.",
  "updated_at": "2025-10-19T21:00:00Z"
}
```

### Regras de Acesso

- **Read:** Todos os participantes da campanha
- **Create/Update:** Apenas o mestre da campanha
- **Delete:** Apenas o mestre da campanha

---

## 📚 Manual Texts Collection

**Path:** `/manual_texts/{textId}`

### Schema

```typescript
interface ManualText {
  title: string;                        // Título do texto
  content: string;                      // Conteúdo
  source: string;                       // Fonte (ex: "Player's Handbook")
  category: string;                     // Categoria (ex: "rules", "spells", "monsters")
  page?: number;                        // Página do manual original
  embedding?: number[];                 // Vetor de embedding (para busca semântica)
  created_at: Timestamp;                // Data de criação
}
```

### Exemplo

```json
{
  "title": "Fireball - 3rd Level Evocation",
  "content": "A bright streak flashes from your pointing finger to a point you choose within range...",
  "source": "Player's Handbook",
  "category": "spells",
  "page": 241,
  "created_at": "2025-10-18T00:00:00Z"
}
```

### Regras de Acesso

- **Read:** Todos os usuários autenticados
- **Create/Update/Delete:** Apenas mestres

---

## 🎲 Character Sheets Collection

**Path:** `/character_sheets/{sheetId}`

### Schema

```typescript
interface CharacterSheet {
  player_uid: string;                   // UID do jogador
  campaign_id?: string;                 // ID da campanha (opcional)
  name: string;                         // Nome do personagem
  class: string;                        // Classe
  race: string;                         // Raça
  level: number;                        // Nível
  attributes: Attributes;               // Atributos
  hp: HitPoints;                        // Pontos de vida
  skills: Record<string, number>;       // Habilidades
  inventory: Item[];                    // Inventário
  spells?: Spell[];                     // Magias (se aplicável)
  created_at: Timestamp;                // Data de criação
  updated_at: Timestamp;                // Última atualização
}

interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface HitPoints {
  current: number;
  max: number;
  temporary: number;
}

interface Item {
  name: string;
  quantity: number;
  description?: string;
}

interface Spell {
  name: string;
  level: number;
  school: string;
  prepared: boolean;
}
```

### Regras de Acesso

- **Read:** Dono da ficha ou mestre da campanha
- **Create:** Apenas jogadores
- **Update/Delete:** Apenas o dono da ficha

---

## 📖 Session Logs Collection

**Path:** `/session_logs/{sessionId}`

### Schema

```typescript
interface SessionLog {
  campaign_id: string;                  // ID da campanha
  session_number: number;               // Número da sessão
  title: string;                        // Título da sessão
  summary: string;                      // Resumo gerado pela IA
  date: Timestamp;                      // Data da sessão
  participants: string[];               // UIDs dos participantes
  key_events: string[];                 // Eventos principais
  created_at: Timestamp;                // Data de criação
}
```

### Exemplo

```json
{
  "campaign_id": "campaign_001",
  "session_number": 1,
  "title": "O Chamado da Aventura",
  "summary": "Os heróis se conheceram na taverna e aceitaram sua primeira missão...",
  "date": "2025-10-19T20:00:00Z",
  "participants": ["player1uid", "player2uid", "player3uid"],
  "key_events": [
    "Encontro na taverna",
    "Missão do conselho",
    "Primeira batalha"
  ],
  "created_at": "2025-10-19T23:00:00Z"
}
```

### Regras de Acesso

- **Read:** Participantes da campanha
- **Create/Update:** Apenas o mestre da campanha
- **Delete:** Não permitido (preservar histórico)

---

## 🔐 Security Summary

### Role-Based Access Control

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| `users` | Owner | Owner (on signup) | Owner | ❌ |
| `campaigns` | Campaign members | Masters only | Campaign master | Campaign master |
| `messages` | Campaign members | Campaign members* | ❌ | Campaign master |
| `contexts` | Campaign members | Campaign master | Campaign master | Campaign master |
| `manual_texts` | All authenticated | Masters | Masters | Masters |
| `character_sheets` | Owner + master | Players | Owner | Owner |
| `session_logs` | Campaign members | Campaign master | Campaign master | ❌ |

\* Mestres podem enviar como 'mestre' ou 'drogon', jogadores apenas como 'jogador'

---

## 🚀 Deployment

### Aplicar Regras do Firestore

```bash
firebase deploy --only firestore:rules
```

### Aplicar Regras do Storage

```bash
firebase deploy --only storage:rules
```

### Aplicar Todas as Regras

```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## 📝 Notas de Desenvolvimento

1. **Timestamps:** Sempre use `serverTimestamp()` do Firebase para garantir consistência
2. **IDs:** Use `doc().id` do Firebase para gerar IDs únicos
3. **Subcollections:** Messages são subcollection de campanhas para melhor organização
4. **Imutabilidade:** Mensagens e logs de sessão são imutáveis para preservar histórico
5. **Validação:** Sempre valide dados no frontend antes de enviar ao Firestore
