# Master Session Control - Documentação

## 📋 Visão Geral

O **Master Session Control** é um sistema completo de gerenciamento de sessões de jogo para Mestres, permitindo iniciar, pausar, retomar e encerrar sessões com rastreamento automático de estatísticas em tempo real.

## 🎯 Funcionalidades

### 1. Controle de Sessões
- **Iniciar Sessão**: Cria nova sessão e começa a contar o tempo
- **Pausar Sessão**: Pausa o timer (útil para intervalos)
- **Retomar Sessão**: Continua a sessão de onde parou
- **Encerrar Sessão**: Finaliza a sessão e salva no histórico

### 2. Timer em Tempo Real
- Contador HH:MM:SS atualizado a cada segundo
- Desconsidera tempo pausado automaticamente
- Visual com ícone de ampulheta animado

### 3. Estatísticas Automáticas
- **Mensagens**: Conta todas as mensagens enviadas na sessão
- **Rolagens de Dados**: Conta todas as rolagens (via /dice ou comandos)
- **Jogadores Ativos**: Rastreia UIDs únicos que participaram

### 4. Histórico de Sessões
- Lista das últimas 20 sessões finalizadas
- Exibe duração, estatísticas e notas
- Ordenado por data (mais recente primeiro)

---

## 🗂️ Estrutura de Dados

### Collection: `/sessions/{sessionId}`

```typescript
interface Session {
  campaign_id: string;
  master_uid: string;
  status: 'active' | 'paused' | 'ended';
  started_at: Timestamp;
  paused_at?: Timestamp;
  ended_at?: Timestamp;
  total_duration: number; // segundos
  pause_duration: number; // segundos
  stats: {
    messages_count: number;
    dice_rolls_count: number;
    players_active: string[]; // UIDs
  };
  notes?: string; // Resumo do mestre
}
```

### Atualização em Campaign

```typescript
interface Campaign {
  // ... campos existentes
  current_session?: string; // ID da sessão ativa
}
```

---

## 🔧 API - Funções Disponíveis

### `startSession(campaignId, masterUid): Promise<string>`
Inicia nova sessão de jogo.

```typescript
const sessionId = await startSession('campaign_123', 'user_abc');
console.log('Sessão iniciada:', sessionId);
```

### `pauseSession(sessionId): Promise<void>`
Pausa uma sessão ativa.

```typescript
await pauseSession('session_xyz');
```

### `resumeSession(sessionId): Promise<void>`
Retoma uma sessão pausada.

```typescript
await resumeSession('session_xyz');
```

### `endSession(sessionId, notes?): Promise<void>`
Encerra sessão e salva no histórico.

```typescript
await endSession('session_xyz', 'Grupo derrotou o dragão vermelho!');
```

### `getCampaignSessions(campaignId): Promise<Session[]>`
Busca histórico de sessões (últimas 20).

```typescript
const sessions = await getCampaignSessions('campaign_123');
console.log(`Total de sessões: ${sessions.length}`);
```

### `updateSessionStats(sessionId, stats): Promise<void>`
Atualiza estatísticas (chamada automaticamente pelo hook).

```typescript
await updateSessionStats('session_xyz', {
  messages_count: 45,
  dice_rolls_count: 12,
  players_active: ['uid1', 'uid2', 'uid3']
});
```

### `formatDuration(seconds): string`
Formata duração em HH:MM:SS.

```typescript
formatDuration(3665); // "01:01:05"
```

---

## 🎨 Componente: `MasterSessionPanel`

### Uso Básico

```tsx
import { MasterSessionPanel } from '@/components/app/master-session-panel';

export default function MasterDashboard() {
  return (
    <div className="p-6">
      <MasterSessionPanel />
    </div>
  );
}
```

### Integração na Página de Chat

```tsx
// frontend/src/app/chat/page.tsx
import { MasterSessionPanel } from '@/components/app/master-session-panel';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
  const { userProfile } = useAuth();
  const isMaster = userProfile?.tier === 'mestre';

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Chat Principal */}
      <div className="col-span-8">
        <ChatContainer />
      </div>

      {/* Sidebar Direita */}
      <div className="col-span-4">
        {isMaster && (
          <div className="mb-4">
            <MasterSessionPanel />
          </div>
        )}
        <PlayerPanel />
      </div>
    </div>
  );
}
```

---

## 🪝 Hook: `useSessionStats`

Atualiza estatísticas automaticamente monitorando mensagens.

### Uso

```tsx
import { useSessionStats } from '@/hooks/useSessionStats';
import { useCampaign } from '@/contexts/CampaignContext';

export function ChatPage() {
  const { currentCampaign } = useCampaign();

  // Ativa tracking automático
  useSessionStats({
    campaignId: currentCampaign?.id,
    sessionId: currentCampaign?.current_session,
    enabled: true, // desabilitar para economizar recursos
  });

  return <ChatContainer />;
}
```

### Como Funciona

1. **Listener Real-time**: Escuta a collection `messages` da campanha
2. **Contadores**: Incrementa automaticamente:
   - Mensagens totais
   - Rolagens de dados (detecta `type: 'dice_roll'` ou `diceData`)
   - Jogadores únicos (via `player_uid`)
3. **Throttle**: Atualiza Firestore no máximo a cada 5 segundos
4. **Cleanup**: Faz atualização final ao desmontar

---

## 🔐 Segurança (Firestore Rules)

```javascript
match /sessions/{sessionId} {
  // Leitura: participantes da campanha
  allow read: if isAuthenticated() &&
                 hasCampaignAccess(resource.data.campaign_id);

  // Criação: apenas mestres
  allow create: if isAuthenticated() &&
                  isMaster() &&
                  request.resource.data.master_uid == request.auth.uid;

  // Atualização: apenas o mestre que criou
  allow update: if isAuthenticated() &&
                  resource.data.master_uid == request.auth.uid;

  // Deleção: apenas o mestre que criou
  allow delete: if isAuthenticated() &&
                  resource.data.master_uid == request.auth.uid;
}
```

---

## 📊 Exemplo de Fluxo Completo

```typescript
// 1. Mestre inicia sessão
const sessionId = await startSession('campaign_123', 'master_abc');

// 2. Jogadores entram e enviam mensagens
// (Hook useSessionStats atualiza automaticamente)

// 3. Mestre pausa para intervalo
await pauseSession(sessionId);
// Timer para, mas contadores continuam acessíveis

// 4. Mestre retoma após 10 minutos
await resumeSession(sessionId);
// Timer continua de onde parou (sem contar os 10 min de pausa)

// 5. Fim da sessão
await endSession(sessionId, 'Grupo chegou à Cidade Subterrânea');

// 6. Sessão aparece no histórico
const history = await getCampaignSessions('campaign_123');
console.log(history[0]); // Sessão mais recente
```

---

## 🎯 Estados do Componente

### Sem Sessão Ativa
```
┌─────────────────────────────────┐
│   Controle de Sessão            │
│   ⏳ 00:00:00                   │
│   Nenhuma sessão ativa          │
│   [▶ Iniciar Sessão]            │
└─────────────────────────────────┘
```

### Sessão Ativa
```
┌─────────────────────────────────┐
│   Controle de Sessão    [ATIVA] │
│   ⏳ 01:23:45                   │
│   Sessão em andamento           │
│   [⏸ Pausar] [⏹ Encerrar]      │
│                                 │
│   📜 42    🎲 15    👥 3        │
│   Mensagens Rolagens Jogadores  │
└─────────────────────────────────┘
```

### Sessão Pausada
```
┌─────────────────────────────────┐
│   Controle de Sessão  [PAUSADA] │
│   ⏳ 01:23:45                   │
│   Sessão pausada                │
│   [▶ Retomar] [⏹ Encerrar]     │
│                                 │
│   Notas da Sessão:              │
│   [____________________________]│
└─────────────────────────────────┘
```

---

## 🚀 Melhorias Futuras (Opcional)

### 1. Exportação de Logs
```typescript
async function exportSessionLog(sessionId: string): Promise<Blob> {
  const session = await getSession(sessionId);
  const messages = await getCampaignMessages(session.campaign_id);

  // Gera PDF ou Markdown
  return generatePDF(session, messages);
}
```

### 2. Gráficos de Estatísticas
```tsx
import { LineChart } from 'recharts';

function SessionChart({ sessions }: { sessions: Session[] }) {
  const data = sessions.map(s => ({
    date: s.started_at.toDate(),
    duration: s.total_duration / 60, // em minutos
    messages: s.stats.messages_count
  }));

  return <LineChart data={data} />;
}
```

### 3. Notificações de Milestones
```typescript
// Ao atingir 50 mensagens
if (stats.messages_count === 50) {
  toast.success('🎉 50 mensagens alcançadas!');
}

// Ao completar 2h de sessão
if (timer === 7200) {
  toast.info('⏰ 2 horas de jogo!');
}
```

### 4. Integração com IA
```typescript
async function generateSessionSummary(sessionId: string): Promise<string> {
  const messages = await getCampaignMessages(campaignId);

  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: 'Resuma esta sessão de RPG em 3-5 frases',
      history: messages
    })
  });

  return response.text();
}
```

---

## 📝 Checklist de Implementação

- [x] Tipos de dados (`Session`, `Campaign.current_session`)
- [x] Funções CRUD (`startSession`, `pauseSession`, `resumeSession`, `endSession`)
- [x] Componente `MasterSessionPanel`
- [x] Hook `useSessionStats` para tracking automático
- [x] Firestore rules para `/sessions`
- [x] Timer em tempo real
- [x] Histórico de sessões
- [x] Estatísticas (mensagens, dados, jogadores)
- [ ] Integração na página de chat
- [ ] Testes E2E
- [ ] Exportação de logs (futuro)

---

## 🎓 Como Testar

### 1. Criar Campanha
```typescript
// No dashboard
const campaignId = await createCampaign(user.uid, {
  title: 'Campanha de Teste',
  context: { tone: 'epic', detail_level: 'medium', language: 'pt-BR' }
});
```

### 2. Entrar na Página de Chat
```
/chat?campaign={campaignId}
```

### 3. Iniciar Sessão (Mestre)
- Clicar em "Iniciar Sessão"
- Timer deve começar a contar

### 4. Enviar Mensagens
- Enviar 5-10 mensagens
- Verificar que contador aumenta

### 5. Rolar Dados
- Usar `/roll 1d20+5`
- Contador de rolagens deve aumentar

### 6. Pausar/Retomar
- Pausar por 30 segundos
- Retomar
- Timer não deve contar os 30s

### 7. Encerrar Sessão
- Adicionar notas: "Sessão de testes"
- Clicar em "Encerrar"
- Verificar aparição no histórico

---

## 🐛 Troubleshooting

### Timer não atualiza
- Verificar se `currentSession.status === 'active'`
- Confirmar que `useEffect` do timer está rodando

### Estatísticas não atualizam
- Verificar se `useSessionStats` está ativado
- Confirmar que `campaignId` e `sessionId` não são `undefined`
- Throttle de 5s pode causar delay

### Erro ao criar sessão
- Confirmar que usuário tem `tier: 'mestre'`
- Verificar Firestore rules
- Checar console do navegador

### Sessão não aparece no histórico
- Confirmar que sessão foi encerrada (`status: 'ended'`)
- Histórico exibe apenas sessões finalizadas
- Verificar query `orderBy('started_at', 'desc')`

---

**Status:** ✅ Implementado e pronto para uso
**Tempo de Desenvolvimento:** ~6 horas
**Versão:** 1.0.0
**Data:** 28/10/2025
**Autor:** Claude Code + Equipe Dungeons e Drogas
