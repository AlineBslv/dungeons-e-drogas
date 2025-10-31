# 🧪 Guia de Teste - Master Session Control

## ✅ Status da Implementação

- [x] **Modelo de Dados**: Session interface completa
- [x] **Funções CRUD**: 9 funções implementadas
- [x] **Componente UI**: MasterSessionPanel funcional
- [x] **Hook de Tracking**: useSessionStats com throttle
- [x] **Firestore Rules**: Collection /sessions protegida
- [x] **Integração Chat**: Sidebar direita com toggle
- [x] **Build Success**: Compilação sem erros
- [x] **Deploy Rules**: Tentativa de deploy iniciada

---

## 🚀 Como Testar Localmente

### 1. Iniciar Ambiente

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend (se necessário)
cd backend
npm run dev
```

### 2. Fluxo de Teste Completo

#### **Passo 1: Login como Mestre**
1. Acesse `http://localhost:3000/auth/login`
2. Entre com conta de Mestre (`tier: 'mestre'`)
3. Se não tiver, crie em `/auth/register` selecionando **🛡️ Mestre**

#### **Passo 2: Criar/Selecionar Campanha**
1. Vá para `/dashboard`
2. Crie nova campanha ou selecione existente
3. Clique para abrir o chat

#### **Passo 3: Abrir Painel de Sessão**
1. No header do chat, procure o botão **`+`** (à esquerda de configurações)
2. Clique para abrir a sidebar direita
3. Deve aparecer o **MasterSessionPanel**

#### **Passo 4: Iniciar Sessão**
1. Clique em **"Iniciar Sessão"**
2. Timer deve começar a contar: `00:00:01`, `00:00:02`...
3. Status muda para **[ATIVA]** (badge verde)
4. Estatísticas aparecem abaixo (0 mensagens, 0 dados, 0 jogadores)

#### **Passo 5: Enviar Mensagens**
1. Digite uma mensagem: *"Os aventureiros entram na taverna"*
2. Envie e aguarde resposta do Drogon
3. **Contador de mensagens** deve aumentar (+2: sua mensagem + resposta)
4. Hook `useSessionStats` atualiza automaticamente (delay de até 5s)

#### **Passo 6: Rolar Dados**
1. Clique no **botão flutuante de dados** (canto inferior direito)
2. Role `1d20+5` ou outro comando
3. **Contador de dados** deve aumentar (+1)
4. Se há múltiplos dados, conta cada um

#### **Passo 7: Pausar Sessão**
1. Clique em **"Pausar"**
2. Timer congela no tempo atual
3. Status muda para **[PAUSADA]** (badge amarelo)
4. Aguarde 10-15 segundos

#### **Passo 8: Retomar Sessão**
1. Clique em **"Retomar"**
2. Timer continua de onde parou
3. Os 10-15 segundos de pausa **não contam** no timer
4. Status volta para **[ATIVA]**

#### **Passo 9: Adicionar Notas**
1. No campo "Notas da Sessão"
2. Digite: *"Grupo derrotou 3 goblins e encontrou mapa do tesouro"*
3. Notas serão salvas ao encerrar

#### **Passo 10: Encerrar Sessão**
1. Clique em **"Encerrar"**
2. Confirme no alerta do navegador
3. Timer para e sessão é salva
4. Status muda para **ended** no Firestore
5. Sessão aparece no **Histórico** abaixo

#### **Passo 11: Verificar Histórico**
1. Role até "Histórico de Sessões"
2. Deve aparecer a sessão recém-finalizada:
   - Data da sessão
   - Duração total (HH:MM:SS)
   - Estatísticas (X msgs, Y dados, Z players)
   - Notas escritas

---

## 🔍 Verificações no Firestore

### Collection `/sessions`

Abra o Firebase Console → Firestore Database:

```
/sessions/{sessionId}
  campaign_id: "cmp_abc123"
  master_uid: "user_xyz"
  status: "ended"
  started_at: Timestamp(...)
  ended_at: Timestamp(...)
  total_duration: 125 // segundos (2min 5s)
  pause_duration: 15 // 15 segundos pausados
  stats: {
    messages_count: 8
    dice_rolls_count: 3
    players_active: ["user_xyz"]
  }
  notes: "Grupo derrotou 3 goblins..."
```

### Collection `/campaigns`

Verificar que `current_session` foi removido ao encerrar:

```
/campaigns/{campaignId}
  current_session: null // ou campo ausente
  last_session: Timestamp(...) // atualizado
```

---

## 🐛 Troubleshooting

### Timer não atualiza
**Problema:** Timer fica em `00:00:00`
**Causa:** `currentSession.status !== 'active'`
**Solução:** Verificar que sessão foi iniciada corretamente

### Estatísticas não mudam
**Problema:** Envio mensagens mas contador não aumenta
**Causa:** Hook `useSessionStats` desabilitado ou throttle
**Solução:**
- Aguardar 5 segundos (throttle)
- Verificar `enabled: userProfile?.tier === 'mestre'`
- Checar console do navegador por erros

### Erro ao criar sessão
**Problema:** "Token inválido" ou "Permissão negada"
**Causa:** Firestore rules não atualizadas
**Solução:**
```bash
firebase deploy --only firestore:rules
```

### Sessão não aparece no histórico
**Problema:** Histórico vazio após encerrar
**Causa:** Sessão não foi encerrada (`status !== 'ended'`)
**Solução:** Verificar Firestore que `status: 'ended'` e `ended_at` existem

### Botão "+" não aparece
**Problema:** Botão de sessão invisível
**Causa:** Usuário não é Mestre
**Solução:** Verificar `userProfile.tier === 'mestre'` no console

---

## ✅ Checklist de Teste

- [ ] Login como Mestre funciona
- [ ] Criar/selecionar campanha
- [ ] Abrir painel de sessão (botão +)
- [ ] Iniciar sessão (timer começa)
- [ ] Enviar mensagens (contador aumenta)
- [ ] Rolar dados (contador aumenta)
- [ ] Pausar sessão (timer congela)
- [ ] Aguardar 10s pausado
- [ ] Retomar sessão (timer continua, sem contar pausa)
- [ ] Adicionar notas
- [ ] Encerrar sessão
- [ ] Verificar histórico
- [ ] Verificar Firestore `/sessions/{id}`
- [ ] Verificar `/campaigns/{id}.current_session === null`

---

## 📊 Testes Automatizados (Futuro)

### Jest + React Testing Library

```typescript
describe('MasterSessionPanel', () => {
  it('deve iniciar sessão ao clicar no botão', async () => {
    render(<MasterSessionPanel />);

    const startButton = screen.getByText('Iniciar Sessão');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/ATIVA/i)).toBeInTheDocument();
    });
  });

  it('deve pausar e retomar sessão', async () => {
    // ... test implementation
  });

  it('deve calcular duração corretamente', () => {
    const duration = 3665; // 1h 1min 5s
    expect(formatDuration(duration)).toBe('01:01:05');
  });
});
```

### Cypress E2E

```javascript
describe('Session Control Flow', () => {
  beforeEach(() => {
    cy.login('master@test.com', 'password123');
    cy.visit('/chat?campaign=test_campaign');
  });

  it('completa fluxo de sessão', () => {
    // Abrir painel
    cy.get('[title="Controle de Sessão"]').click();

    // Iniciar sessão
    cy.contains('Iniciar Sessão').click();
    cy.contains('ATIVA').should('be.visible');

    // Enviar mensagem
    cy.get('textarea').type('Teste de mensagem{enter}');

    // Verificar contador
    cy.contains('1').should('be.visible');

    // Encerrar
    cy.contains('Encerrar').click();
    cy.on('window:confirm', () => true);

    // Verificar histórico
    cy.contains('Histórico de Sessões').should('be.visible');
  });
});
```

---

## 📝 Relatório de Bugs

Se encontrar bugs, documente aqui:

### Formato:
```
**Bug:** [Descrição curta]
**Passos:**
1. ...
2. ...
**Esperado:** ...
**Obtido:** ...
**Console:** [Erros do console]
**Firestore:** [Estado dos documentos]
```

---

## 🎯 Próximas Melhorias

- [ ] **Exportação de Logs**: Gerar PDF/Markdown da sessão
- [ ] **Gráficos**: Histórico visual com Chart.js
- [ ] **Notificações**: Toast ao atingir milestones (50 msgs, 2h, etc.)
- [ ] **Integração IA**: Resumo automático da sessão via Gemini
- [ ] **Multi-tab**: Sincronizar timer entre abas abertas
- [ ] **Sons**: Efeito sonoro ao iniciar/encerrar sessão

---

**Data de Criação:** 28/10/2025
**Última Atualização:** 28/10/2025
**Status:** ✅ Sistema Pronto para Teste
