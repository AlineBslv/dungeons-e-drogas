# Sistema de Visibilidade de Mensagens

**Data:** 30 de Outubro de 2025
**Feature:** Mensagens privadas do Drogon apenas para Mestres

## Conceito

O **Mestre Drogon** é o assistente secreto do Mestre da campanha. Suas respostas são **visíveis apenas para o Mestre**, mantendo o mistério e permitindo que o mestre controle o fluxo narrativo.

### Regras de Visibilidade:

| Tipo de Mensagem | Visível Para | Campo `audience` |
|------------------|--------------|------------------|
| 🧙 Mensagens do Mestre | Todos | `all` |
| 🛡️ Mensagens de Jogadores | Todos | `all` |
| 🎲 Rolagens de Dados | Todos | `all` |
| 🐲 **Respostas do Drogon** | **Apenas Mestre** | **`master_only`** |

---

## Implementação Técnica

### 1. Estrutura de Dados

#### Interface de Mensagem
Arquivo: [frontend/src/app/chat/page.tsx:32-45](../frontend/src/app/chat/page.tsx#L32-L45)

```typescript
interface Message {
  id: string;
  sender: 'mestre' | 'drogon' | 'jogador';
  content: string;
  timestamp: string | Timestamp;
  type?: 'message' | 'dice_roll';
  audience?: 'all' | 'master_only';  // ← Novo campo
  diceData?: {
    command: string;
    result: DiceResult;
    context?: string;
    characterName?: string;
  };
}
```

**Valores de `audience`:**
- `'all'` - Mensagem visível para todos (padrão)
- `'master_only'` - Mensagem visível apenas para mestres

---

### 2. Filtro de Mensagens

#### Sincronização com Firestore
Arquivo: [frontend/src/app/chat/page.tsx:90-118](../frontend/src/app/chat/page.tsx#L90-L118)

```typescript
useEffect(() => {
  if (!currentCampaign || !userProfile) return;

  const messagesRef = collection(db, 'campaigns', currentCampaign.id, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messagesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp instanceof Timestamp
        ? doc.data().timestamp.toDate().toISOString()
        : doc.data().timestamp,
    })) as Message[];

    // 🔒 FILTRO DE VISIBILIDADE
    const filteredMessages = messagesData.filter((message) => {
      // Se for jogador e a mensagem é apenas para mestre, não mostrar
      if (userProfile.tier === 'jogador' && message.audience === 'master_only') {
        return false;
      }
      return true;
    });

    setMessages(filteredMessages);
  });

  return () => unsubscribe();
}, [currentCampaign, userProfile]);
```

**Como funciona:**
1. Busca todas as mensagens do Firestore
2. Filtra mensagens `master_only` se usuário for jogador
3. Mestres veem **todas** as mensagens
4. Jogadores veem apenas mensagens `all`

---

### 3. Marcação de Mensagens

#### A. Mensagens do Mestre (visível para todos)
Arquivo: [frontend/src/app/chat/page.tsx:230-236](../frontend/src/app/chat/page.tsx#L230-L236)

```typescript
await sendMessage(currentCampaign.id, {
  sender: 'mestre',
  content,
  player_uid: user?.uid,
  audience: 'all',  // ← Visível para todos
});
```

#### B. Mensagens do Drogon (apenas mestre)
Arquivo: [frontend/src/app/chat/page.tsx:263-268](../frontend/src/app/chat/page.tsx#L263-L268)

```typescript
await sendMessage(currentCampaign.id, {
  sender: 'drogon',
  content: data.message,
  audience: 'master_only',  // ← Apenas mestre vê
});
```

#### C. Rolagens de Dados (visível para todos)
Arquivo: [frontend/src/app/chat/page.tsx:200-213](../frontend/src/app/chat/page.tsx#L200-L213)

```typescript
await sendMessage(currentCampaign.id, {
  sender: userProfile?.tier === 'mestre' ? 'mestre' : 'jogador',
  content: '',
  type: 'dice_roll',
  player_uid: user?.uid,
  audience: 'all',  // ← Rolagens são transparentes
  diceData: { ... }
});
```

---

### 4. Indicador Visual (Badge)

#### MessageBubble Component
Arquivo: [frontend/src/components/chat/MessageBubble.tsx:148-154](../frontend/src/components/chat/MessageBubble.tsx#L148-L154)

```tsx
{/* Badge de mensagem privada */}
{isPrivate && isDrogon && (
  <Badge variant="secondary" className="mb-2 bg-mystic-purple/20 text-mystic-purple border-mystic-purple/40">
    <FaEyeSlash className="w-3 h-3 mr-1" />
    Apenas para você (Mestre)
  </Badge>
)}
```

**Visual:**
- Badge roxo místico no topo da mensagem
- Ícone de olho barrado (FaEyeSlash)
- Texto: "Apenas para você (Mestre)"
- Aparece **apenas para mestres**

---

## Casos de Uso

### Caso 1: Mestre pede informação secreta

**Mestre:** "Drogon, me dê detalhes sobre o tesouro escondido na caverna"

**Drogon (apenas mestre vê):**
```
🔒 Apenas para você (Mestre)

No fundo da caverna, há um baú contendo:
- **Espada Longa +2** (mágica)
- **500 peças de ouro**
- **Pergaminho de Bola de Fogo**

O baú está protegido por uma armadilha de dardo envenenado (CD 15 Percepção para detectar).
```

**Jogadores veem:**
- Apenas a mensagem do mestre
- NÃO veem a resposta do Drogon

---

### Caso 2: Mestre consulta regras

**Mestre:** "Drogon, como funciona ação de esquiva?"

**Drogon (apenas mestre vê):**
```
🔒 Apenas para você (Mestre)

**Ação de Esquiva (D&D 5e):**

Quando uma criatura realiza a ação de esquiva:
- Ataques contra ela têm **desvantagem**
- Ela tem **vantagem** em testes de resistência de Destreza
- Dura até o início do próximo turno

*Fonte: PHB página 192*
```

---

### Caso 3: Jogador envia mensagem

**Jogador:** "Eu examino a sala em busca de armadilhas"

**Visível para todos:**
- Mestre vê a mensagem
- Outros jogadores veem
- Drogon NÃO responde automaticamente (apenas mestre vê respostas)

**Mestre então pode:**
1. Responder diretamente aos jogadores
2. Pedir ajuda ao Drogon (resposta privada)
3. Revelar informações conforme julgar apropriado

---

### Caso 4: Rolagem de dados

**Jogador rola:** `/roll 1d20+5` para Percepção

**Resultado (visível para todos):**
```
🎲 João (Jogador)
Rolagem via chat

[Dados: 18]
Modificador: +5
───────────
Total: 23
```

**Visibilidade:**
- ✅ Mestre vê: 23
- ✅ Jogadores veem: 23
- ✅ Todos sabem o resultado

---

## Fluxo Completo (Multiplayer)

### Cenário: Mestre + 2 Jogadores

```
┌─────────────────────────────────────────────────────────┐
│                   MESTRE (João)                         │
│                                                         │
│ Mestre: "Drogon, o que tem no baú?"                   │
│ ├─ Todos veem ✅                                       │
│                                                         │
│ 🐲 Drogon: "Há uma espada mágica..."                  │
│ ├─ 🔒 APENAS MESTRE VÊ                                │
│ └─ Badge: "Apenas para você (Mestre)"                  │
│                                                         │
│ Mestre: "Você encontra uma espada brilhante"          │
│ ├─ Todos veem ✅                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  JOGADOR 1 (Maria)                      │
│                                                         │
│ Mestre: "Drogon, o que tem no baú?"                   │
│ ├─ Vê mensagem do mestre ✅                           │
│                                                         │
│ [Mensagem do Drogon NÃO APARECE]                       │
│ ├─ Filtrado pelo sistema ❌                           │
│                                                         │
│ Mestre: "Você encontra uma espada brilhante"          │
│ ├─ Vê mensagem do mestre ✅                           │
│                                                         │
│ Maria: "Eu pego a espada!"                             │
│ ├─ Todos veem ✅                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  JOGADOR 2 (Pedro)                      │
│                                                         │
│ [Mesmo comportamento de Maria]                          │
│ - Vê mensagens do mestre ✅                            │
│ - NÃO vê mensagens do Drogon ❌                        │
│ - Vê mensagens de outros jogadores ✅                  │
│ - Vê rolagens de dados ✅                              │
└─────────────────────────────────────────────────────────┘
```

---

## Impacto no Gameplay

### Vantagens:

1. **🎭 Mantém Mistério:**
   - Jogadores não sabem o que vem pela frente
   - Surpresas e plot twists funcionam

2. **🎮 Controle do Mestre:**
   - Decide o que revelar e quando
   - Pode filtrar informações sensíveis

3. **📚 Consulta Privada de Regras:**
   - Mestre pode tirar dúvidas sem expor mecânicas

4. **🎯 Narrative Agency:**
   - Mestre usa Drogon como "assistente secreto"
   - Pode adaptar respostas para o contexto

### Desvantagens (Mitigadas):

1. **Jogadores não interagem com Drogon diretamente**
   - ✅ **Solução:** Mestre repassa informações de forma narrativa
   - ✅ **Benefício:** Mantém imersão e controle da história

2. **Jogadores podem se sentir excluídos**
   - ✅ **Solução:** Comunicar claramente que Drogon é ferramenta do mestre
   - ✅ **Benefício:** Expectativas alinhadas desde o início

---

## Arquivos Modificados

| Arquivo | Mudanças | Descrição |
|---------|----------|-----------|
| [frontend/src/app/chat/page.tsx](../frontend/src/app/chat/page.tsx) | Interface + Filtro + Marcação | Sistema principal de visibilidade |
| [frontend/src/components/chat/MessageBubble.tsx](../frontend/src/components/chat/MessageBubble.tsx) | Badge visual | Indicador "Apenas para você" |
| [frontend/src/lib/firestore-helpers.ts](../frontend/src/lib/firestore-helpers.ts) | (Não modificado) | `sendMessage` já aceita campos dinâmicos |

---

## Como Testar

### Teste 1: Mestre vê mensagens privadas

1. **Login como Mestre**
2. Enviar mensagem: "Drogon, me ajude"
3. **Resultado esperado:**
   - Você vê sua mensagem ✅
   - Você vê resposta do Drogon com badge "Apenas para você (Mestre)" ✅

### Teste 2: Jogador NÃO vê mensagens privadas

1. **Abrir nova aba anônima**
2. **Login como Jogador**
3. Entrar na mesma campanha
4. **Resultado esperado:**
   - Jogador vê mensagem do mestre ✅
   - Jogador NÃO vê resposta do Drogon ❌
   - Console do navegador: mensagens filtradas corretamente

### Teste 3: Rolagens de dados visíveis para todos

1. **Mestre ou Jogador rola dados:** `/roll 1d20+3`
2. **Resultado esperado:**
   - Todos veem o resultado da rolagem ✅
   - Mestre vê ✅
   - Jogadores veem ✅

### Teste 4: Múltiplos jogadores

1. **3 abas:** Mestre + Jogador1 + Jogador2
2. Mestre envia: "Drogon, segredo"
3. **Resultado esperado:**
   - Apenas aba do Mestre mostra resposta do Drogon
   - Jogador1 não vê
   - Jogador2 não vê

---

## Firestore Structure

```javascript
/campaigns/{campaignId}/messages/{messageId}
{
  "sender": "drogon",
  "content": "Há uma espada mágica no baú...",
  "timestamp": Timestamp,
  "audience": "master_only",  // ← Campo chave
  "type": "message"
}
```

---

## Futuras Melhorias

### 1. Mensagens Privadas entre Jogadores (Post-MVP)

```typescript
audience: {
  type: 'specific_users',
  users: ['userId1', 'userId2']  // Apenas estes veem
}
```

### 2. Mensagens de Grupo (Post-MVP)

```typescript
audience: {
  type: 'role_based',
  roles: ['jogador']  // Apenas jogadores veem
}
```

### 3. Logs de Auditoria (Post-MVP)

- Registrar quem viu cada mensagem
- Timestamps de visualização
- Métricas de engajamento

---

## Considerações de Segurança

### Firestore Rules

```javascript
// firestore.rules

match /campaigns/{campaignId}/messages/{messageId} {
  // Qualquer participante pode criar mensagens
  allow create: if hasCampaignAccess(campaignId);

  // Leitura depende de audience
  allow read: if hasCampaignAccess(campaignId) &&
    (
      // Mensagens públicas
      resource.data.audience == 'all' ||
      resource.data.audience == null ||

      // Mensagens privadas apenas para mestre
      (resource.data.audience == 'master_only' && isCampaignMaster(campaignId))
    );
}
```

**Importante:**
- Filtro no frontend é **UX apenas**
- Firestore Rules é **segurança real**
- Implementar rules para garantir que jogadores não possam burlar filtro

---

## Referências

- [docs/CHAT_IMPROVEMENTS.md](CHAT_IMPROVEMENTS.md)
- [docs/CHAT_UPDATES_30_10_2025.md](CHAT_UPDATES_30_10_2025.md)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions)

---

**Status:** ✅ Implementado
**Data:** 30 de Outubro de 2025
**Versão:** 1.0.0
**Próximo:** Implementar Firestore Rules de segurança
