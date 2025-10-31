# 🔧 Correção: Atualização em Tempo Real de Sessões

## 📋 Problema Identificado

As informações do painel de controle de sessão (`MasterSessionPanel`) não estavam atualizando em tempo real quando:
- Uma sessão era iniciada
- Uma sessão era pausada
- Uma sessão era retomada
- Uma sessão era encerrada

## 🔍 Causa Raiz

1. **CampaignContext não estava em real-time**: O `currentCampaign` era carregado apenas uma vez ao selecionar, sem listener do Firestore
2. **Faltavam eventos Socket.io**: As ações de sessão não emitiam eventos para sincronização multiplayer
3. **Loop de dependências**: O listener precisava usar uma referência separada para evitar re-renders infinitos

## ✅ Soluções Implementadas

### 1. **Real-time Listener no CampaignContext** ([CampaignContext.tsx](../frontend/src/contexts/CampaignContext.tsx))

**Mudanças:**
- ✅ Adicionado estado `currentCampaignId` separado
- ✅ Criado `useEffect` com `onSnapshot` do Firestore
- ✅ Listener atualiza `currentCampaign` automaticamente quando a campanha muda
- ✅ Logs de debug adicionados para rastreamento

```typescript
// Listener real-time para currentCampaign
useEffect(() => {
  if (!currentCampaignId) {
    setCurrentCampaign(null);
    return;
  }

  const campaignRef = doc(db, 'campaigns', currentCampaignId);
  const unsubscribe = onSnapshot(campaignRef, (snapshot) => {
    if (snapshot.exists()) {
      setCurrentCampaign({ id: snapshot.id, ...snapshot.data() });
    }
  });

  return () => unsubscribe();
}, [currentCampaignId]);
```

### 2. **Emissão de Eventos Socket.io** ([master-session-panel.tsx](../frontend/src/components/app/master-session-panel.tsx))

**Mudanças:**
- ✅ `handleStartSession`: Emite `session:start`
- ✅ `handlePauseSession`: Emite `session:pause`
- ✅ `handleResumeSession`: Emite `session:resume`
- ✅ `handleEndSession`: Emite `session:end`

```typescript
// Exemplo: handleStartSession
const sessionId = await startSession(currentCampaign.id, user.uid);

// Emite evento Socket.io
if (typeof window !== 'undefined' && (window as any).socket) {
  (window as any).socket.emit('session:start', {
    campaignId: currentCampaign.id,
    sessionId,
  });
}
```

### 3. **Backend Socket.io já Configurado** ([socketServer.js](../backend/socketServer.js))

O backend já estava preparado com os listeners:
- ✅ `session:start` → broadcast `session:started`
- ✅ `session:pause` → broadcast `session:paused`
- ✅ `session:resume` → broadcast `session:resumed`
- ✅ `session:end` → broadcast `session:ended`

## 🔄 Fluxo de Atualização

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Mestre clica "Iniciar Sessão"                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. handleStartSession() executa                             │
│    - Chama startSession() → Firestore atualiza              │
│    - Emite socket.emit('session:start')                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│ 3a. Firestore    │        │ 3b. Socket.io    │
│     atualiza     │        │     broadcast    │
│     campaigns/   │        │     para room    │
└────────┬─────────┘        └────────┬─────────┘
         │                           │
         ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│ 4a. onSnapshot   │        │ 4b. Jogadores    │
│     detecta      │        │     recebem      │
│     mudança      │        │     evento       │
└────────┬─────────┘        └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. currentCampaign atualiza → MasterSessionPanel re-render  │
│    - current_session mudou                                   │
│    - Listener da sessão detecta e atualiza currentSession   │
│    - Timer, stats e UI atualizam automaticamente            │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Resultado Esperado

Agora, quando o Mestre:
1. **Inicia** uma sessão → Timer começa, status muda para "ATIVA"
2. **Pausa** uma sessão → Timer para, status muda para "PAUSADA"
3. **Retoma** uma sessão → Timer continua, status volta para "ATIVA"
4. **Encerra** uma sessão → Stats finais salvos, histórico atualizado

**Tudo acontece em tempo real sem refresh!** 🎉

## 🧪 Como Testar

1. Inicie o backend: `cd backend && npm run dev`
2. Inicie o frontend: `cd frontend && npm run dev`
3. Login como Mestre
4. Selecione uma campanha
5. Abra o painel de sessão (botão `+` no header)
6. Clique em "Iniciar Sessão"
7. **Observe**: Timer deve começar imediatamente
8. Clique em "Pausar"
9. **Observe**: Status muda para "PAUSADA"
10. Clique em "Retomar"
11. **Observe**: Timer continua do ponto pausado
12. Clique em "Encerrar"
13. **Observe**: Sessão aparece no histórico

## 📊 Logs de Debug

Os logs do console ajudam a rastrear o fluxo:

```
[CampaignContext] Iniciando listener real-time para campanha: abc123
[CampaignContext] Campanha atualizada: { current_session: "session_xyz", ... }
✅ User authenticated: uid123 (user@example.com)
▶️ Session session_xyz started in campaign abc123
```

## 🐛 Troubleshooting

**Problema**: Timer não atualiza
- **Solução**: Verifique se `currentCampaign.current_session` existe

**Problema**: Status não muda
- **Solução**: Verifique logs do Firestore e Socket.io no console

**Problema**: Histórico não carrega
- **Solução**: Verifique se a função `getCampaignSessions()` está retornando dados

## 📝 Checklist de Funcionalidades

- [x] Listener real-time do CampaignContext
- [x] Emissão de eventos Socket.io nas ações
- [x] Timer atualiza a cada segundo
- [x] Status visual (ATIVA/PAUSADA)
- [x] Estatísticas em tempo real (mensagens, dados, jogadores)
- [x] Histórico de sessões encerradas
- [x] Notas da sessão
- [x] Broadcast multiplayer via WebSocket

## 🚀 Próximos Passos

- [ ] Adicionar toast notifications quando sessão muda
- [ ] Criar listener de sessão para jogadores (PlayerSessionPanel)
- [ ] Implementar auto-save de notas
- [ ] Adicionar confirmação visual de sincronização
- [ ] Criar dashboard de analytics de sessões

---

**Status**: ✅ Correção Completa
**Data**: 2025-10-29
**Desenvolvedor**: Claude (via Claude Code)
