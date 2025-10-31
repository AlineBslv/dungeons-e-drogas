# 🔧 Correção: Estatísticas de Sessão em Tempo Real

## 📋 Problema Identificado

As estatísticas do `MasterSessionPanel` não estavam atualizando:
- ❌ Contador de mensagens sempre em 0
- ❌ Contador de rolagens de dados sempre em 0
- ❌ Número de jogadores ativos sempre em 0

## 🔍 Causa Raiz

### 1. **Campo `player_uid` Ausente**
As mensagens e rolagens de dados não estavam sendo salvas com o campo `player_uid`, que é usado pelo hook `useSessionStats` para rastrear jogadores ativos.

### 2. **Throttle Muito Alto**
O hook tinha um throttle de 5 segundos, fazendo com que as atualizações demorassem muito para aparecer.

### 3. **Contagem Incorreta**
Mensagens do Drogon (IA) estavam sendo contadas como mensagens de jogadores.

## ✅ Soluções Implementadas

### 1. **Adicionar `player_uid` nas Mensagens** ([chat/page.tsx](../frontend/src/app/chat/page.tsx:219-223,190-201))

**Antes:**
```typescript
await sendMessage(currentCampaign.id, {
  sender: 'mestre',
  content,
});
```

**Depois:**
```typescript
await sendMessage(currentCampaign.id, {
  sender: 'mestre',
  content,
  player_uid: user?.uid, // ✅ Adiciona UID para tracking
});
```

### 2. **Adicionar `player_uid` nas Rolagens de Dados** ([chat/page.tsx](../frontend/src/app/chat/page.tsx:190-201))

**Antes:**
```typescript
await sendMessage(currentCampaign.id, {
  sender: userProfile?.tier === 'mestre' ? 'mestre' : 'jogador',
  content: '',
  type: 'dice_roll',
  diceData: { ... },
});
```

**Depois:**
```typescript
await sendMessage(currentCampaign.id, {
  sender: userProfile?.tier === 'mestre' ? 'mestre' : 'jogador',
  content: '',
  type: 'dice_roll',
  player_uid: user?.uid, // ✅ Adiciona UID para tracking
  diceData: { ... },
});
```

### 3. **Otimizar Hook `useSessionStats`** ([useSessionStats.ts](../frontend/src/hooks/useSessionStats.ts))

**Melhorias:**
- ✅ Throttle reduzido de 5s → 2s
- ✅ Exclui mensagens do Drogon da contagem
- ✅ Logs detalhados de debug
- ✅ Rastreamento de jogadores ativos corrigido

**Lógica de Contagem:**
```typescript
// Conta apenas mensagens de humanos (exclui Drogon)
if (data.sender !== 'drogon') {
  newMessageCount++;
}

// Conta rolagens de dados
if (data.type === 'dice_roll' || data.diceData || data.roll_data) {
  newDiceRollCount++;
}

// Rastreia jogadores ativos (apenas humanos)
if (data.player_uid && data.sender !== 'drogon') {
  newActivePlayers.add(data.player_uid);
}
```

## 🔄 Fluxo de Atualização

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário envia mensagem ou rola dados                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. sendMessage() salva no Firestore                         │
│    - sender: 'mestre' ou 'jogador'                          │
│    - player_uid: user.uid ✅ NOVO                           │
│    - type: 'dice_roll' (se for dados)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. useSessionStats detecta nova mensagem via onSnapshot     │
│    - Incrementa contadores locais                           │
│    - Adiciona player_uid ao Set de jogadores ativos         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Throttle de 2s → updateSessionStats()                    │
│    - Atualiza stats.messages_count                          │
│    - Atualiza stats.dice_rolls_count                        │
│    - Atualiza stats.players_active                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. MasterSessionPanel detecta mudança via onSnapshot        │
│    - currentSession.stats atualiza                          │
│    - UI re-renderiza com novos valores                      │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Estrutura de Dados

### Message (Firestore)
```typescript
{
  sender: 'mestre' | 'jogador' | 'drogon',
  content: string,
  timestamp: Timestamp,
  type?: 'message' | 'dice_roll',
  player_uid?: string,  // ✅ Agora sempre preenchido
  diceData?: {
    command: string,
    result: DiceResult,
    characterName: string,
    context: string
  }
}
```

### Session.stats (Firestore)
```typescript
{
  messages_count: number,      // Total de mensagens (exclui Drogon)
  dice_rolls_count: number,    // Total de rolagens
  players_active: string[]     // Array de UIDs únicos
}
```

## 🎯 Resultado Esperado

Agora, quando um usuário:
1. **Envia mensagem** → Contador incrementa em ~2s
2. **Rola dados** → Ambos contadores incrementam em ~2s
3. **Entra na sessão** → UID adicionado à lista de jogadores ativos

**Tudo atualiza automaticamente no painel!** 🎉

## 🧪 Como Testar

1. Inicie backend: `cd backend && npm run dev`
2. Inicie frontend: `cd frontend && npm run dev`
3. Login como Mestre
4. Selecione/crie uma campanha
5. Inicie uma sessão
6. Abra o console do navegador (F12)
7. Envie uma mensagem
8. **Observe logs:**
   ```
   [useSessionStats] Snapshot: { messages: 1, diceRolls: 0, activePlayers: 1 }
   [useSessionStats] Atualizando Firestore: { messages_count: 1, ... }
   ```
9. Role dados (`/roll 1d20`)
10. **Observe:** Contador de dados incrementa
11. **Veja painel:** Stats atualizam em max 2s

## 📊 Logs de Debug

O hook agora tem logs detalhados:

```javascript
// Ao iniciar
[useSessionStats] Iniciando tracking para sessão: abc123

// A cada snapshot
[useSessionStats] Snapshot: {
  messages: 5,
  diceRolls: 2,
  activePlayers: 1
}

// Ao atualizar Firestore
[useSessionStats] Atualizando Firestore: {
  sessionId: "abc123",
  messages_count: 5,
  dice_rolls_count: 2,
  players_active: ["uid1", "uid2"]
}

// Ao desmontar
[useSessionStats] Cleanup para sessão: abc123
[useSessionStats] Atualização final: {
  messages: 10,
  diceRolls: 4,
  players: 2
}
```

## 🐛 Troubleshooting

### Problema: Stats não atualizam
**Solução:**
1. Verifique se `currentCampaign.current_session` existe
2. Veja logs do console
3. Confirme que mensagens têm `player_uid`

### Problema: Contagem errada
**Solução:**
1. Mensagens antigas não têm `player_uid`
2. Limpe mensagens antigas ou migre dados
3. Verifique se Drogon está sendo excluído

### Problema: Delay muito alto
**Solução:**
1. Throttle está em 2s (configurável)
2. Primeira atualização é instantânea
3. Atualizações subsequentes respeitam throttle

## 📝 Checklist de Funcionalidades

- [x] `player_uid` salvo em mensagens
- [x] `player_uid` salvo em rolagens de dados
- [x] Throttle reduzido para 2s
- [x] Mensagens do Drogon excluídas
- [x] Logs detalhados de debug
- [x] Contagem de jogadores ativos
- [x] Atualização final ao desmontar
- [x] Listener real-time de sessão funcionando

## 🚀 Próximos Passos

- [ ] Migrar mensagens antigas para adicionar `player_uid`
- [ ] Criar analytics dashboard de sessões
- [ ] Adicionar gráficos de atividade
- [ ] Exportar stats em CSV/JSON
- [ ] Implementar leaderboard de dados rolados
- [ ] Mostrar stats de cada jogador individual

## 🔗 Arquivos Modificados

1. [frontend/src/app/chat/page.tsx](../frontend/src/app/chat/page.tsx)
2. [frontend/src/hooks/useSessionStats.ts](../frontend/src/hooks/useSessionStats.ts)

## 💡 Notas Importantes

- **Mensagens antigas**: Não têm `player_uid`, então não serão contadas até serem atualizadas
- **Performance**: Throttle de 2s evita sobrecarga do Firestore
- **Real-time**: onSnapshot garante atualizações instantâneas
- **Cleanup**: Stats finais salvos ao sair da sessão

---

**Status**: ✅ Correção Completa
**Data**: 2025-10-29
**Desenvolvedor**: Claude (via Claude Code)
