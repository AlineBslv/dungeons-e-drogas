# Firestore Security Rules - Sistema de Visibilidade

**Data:** 30 de Outubro de 2025
**Versão:** 2.0.0 - Mensagens Privadas
**Arquivo:** [firestore.rules](../firestore.rules)

## Visão Geral

As Firestore Security Rules garantem que a segurança da visibilidade de mensagens esteja no **backend**, não apenas no frontend. Isso impede que usuários mal-intencionados burlem o filtro e vejam mensagens privadas.

---

## Nova Funcionalidade: Mensagens Privadas

### Helper Function: `canReadMessage`

**Localização:** [firestore.rules:54-68](../firestore.rules#L54-L68)

```javascript
// Verifica se o usuário pode ler uma mensagem baseado no campo 'audience'
function canReadMessage(campaignId, messageData) {
  // Se a mensagem não tem campo audience ou é 'all', todos os participantes podem ler
  if (!('audience' in messageData) || messageData.audience == 'all') {
    return hasCampaignAccess(campaignId);
  }

  // Se a mensagem é 'master_only', apenas o mestre pode ler
  if (messageData.audience == 'master_only') {
    return isCampaignMaster(campaignId);
  }

  // Default: negar acesso
  return false;
}
```

**Como funciona:**
1. Verifica se o campo `audience` existe
2. Se não existir ou for `'all'` → qualquer participante pode ler
3. Se for `'master_only'` → apenas o mestre pode ler
4. Caso contrário → **nega acesso**

---

## Regras de Mensagens Atualizadas

### Leitura (READ)

**Localização:** [firestore.rules:127-130](../firestore.rules#L127-L130)

```javascript
// Leitura: baseado no campo 'audience'
// - Mensagens 'all' ou sem campo: todos os participantes
// - Mensagens 'master_only': apenas o mestre
allow read: if canReadMessage(campaignId, resource.data);
```

**Comportamento:**

| Campo `audience` | Mestre vê? | Jogador vê? |
|------------------|------------|-------------|
| `'all'` | ✅ Sim | ✅ Sim |
| `null` (não existe) | ✅ Sim | ✅ Sim |
| `'master_only'` | ✅ Sim | ❌ **Não** |

---

### Criação (CREATE)

**Localização:** [firestore.rules:132-155](../firestore.rules#L132-L155)

```javascript
// Criação: apenas participantes da campanha com validações:
// - Mestre pode enviar como 'mestre' ou 'drogon'
// - Jogador pode enviar apenas como 'jogador'
// - Apenas mestre pode criar mensagens 'master_only'
// - Mensagens do Drogon devem ser 'master_only'
allow create: if hasCampaignAccess(campaignId) &&
                (
                  // MESTRE: pode enviar como 'mestre' ou 'drogon'
                  (isCampaignMaster(campaignId) &&
                   request.resource.data.sender in ['mestre', 'drogon'] &&
                   // Mensagens do Drogon DEVEM ser master_only
                   (request.resource.data.sender == 'drogon' ?
                    request.resource.data.audience == 'master_only' : true) &&
                   // Mensagens do Mestre devem ser 'all' ou não ter audience
                   (request.resource.data.sender == 'mestre' ?
                    (!('audience' in request.resource.data) || request.resource.data.audience == 'all') : true)
                  ) ||

                  // JOGADOR: pode enviar apenas como 'jogador' e apenas mensagens 'all'
                  (isCampaignPlayer(campaignId) &&
                   request.resource.data.sender == 'jogador' &&
                   (!('audience' in request.resource.data) || request.resource.data.audience == 'all')
                  )
                );
```

**Validações:**

#### Mestre pode:
- ✅ Enviar como `'mestre'` com `audience: 'all'` ou sem audience
- ✅ Enviar como `'drogon'` **OBRIGATORIAMENTE** com `audience: 'master_only'`
- ❌ **Não pode** enviar mensagem do Drogon com `audience: 'all'`

#### Jogador pode:
- ✅ Enviar como `'jogador'` com `audience: 'all'` ou sem audience
- ❌ **Não pode** enviar com `audience: 'master_only'`
- ❌ **Não pode** enviar como `'mestre'` ou `'drogon'`

---

## Cenários de Teste

### ✅ Cenário 1: Mestre cria mensagem pública

```javascript
// Request
{
  sender: 'mestre',
  content: 'Olá jogadores!',
  audience: 'all',
  timestamp: Timestamp
}

// Resultado: ✅ PERMITIDO
// Mestre: Vê ✅
// Jogador: Vê ✅
```

---

### ✅ Cenário 2: Drogon cria mensagem privada

```javascript
// Request
{
  sender: 'drogon',
  content: 'Há uma armadilha na porta...',
  audience: 'master_only',
  timestamp: Timestamp
}

// Resultado: ✅ PERMITIDO
// Mestre: Vê ✅
// Jogador: ❌ NÃO VÊ (bloqueado pela rule)
```

---

### ❌ Cenário 3: Jogador tenta criar mensagem privada

```javascript
// Request
{
  sender: 'jogador',
  content: 'Mensagem secreta',
  audience: 'master_only',  // ❌ TENTATIVA DE BURLAR
  timestamp: Timestamp
}

// Resultado: ❌ NEGADO
// Erro: "Missing or insufficient permissions"
```

---

### ❌ Cenário 4: Drogon tenta criar mensagem pública

```javascript
// Request
{
  sender: 'drogon',
  content: 'Olá jogadores!',
  audience: 'all',  // ❌ TENTATIVA DE BURLAR
  timestamp: Timestamp
}

// Resultado: ❌ NEGADO
// Erro: "Missing or insufficient permissions"
// Razão: Mensagens do Drogon DEVEM ser master_only
```

---

### ✅ Cenário 5: Jogador cria mensagem pública

```javascript
// Request
{
  sender: 'jogador',
  content: 'Eu examino a sala',
  audience: 'all',
  timestamp: Timestamp
}

// Resultado: ✅ PERMITIDO
// Mestre: Vê ✅
// Jogadores: Veem ✅
```

---

### ❌ Cenário 6: Jogador tenta ler mensagem do Drogon

```javascript
// Mensagem existente no Firestore
{
  sender: 'drogon',
  content: 'Segredo do mestre...',
  audience: 'master_only'
}

// Query do Jogador
db.collection('campaigns/XYZ/messages').get()

// Resultado:
// - Mestre recebe: [mensagem] ✅
// - Jogador recebe: [] ❌ (array vazio - bloqueado pela rule)
```

---

## Deploy das Regras

### Opção 1: Firebase Console (Manual)

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione projeto "Dungeons e Drogas"
3. Vá em **Firestore Database** → **Rules**
4. Cole o conteúdo de [firestore.rules](../firestore.rules)
5. Clique em **Publish**

---

### Opção 2: Firebase CLI (Recomendado)

```bash
# 1. Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# 2. Login no Firebase
firebase login

# 3. Inicializar projeto (se ainda não foi)
firebase init firestore

# 4. Deploy apenas das rules
firebase deploy --only firestore:rules

# Saída esperada:
# ✔ Deploy complete!
#
# Project Console: https://console.firebase.google.com/project/...
# Firestore Rules deployed successfully
```

---

### Verificar Deploy

```bash
firebase firestore:rules:get

# Saída: Mostra as rules atuais no Firestore
```

---

## Testando as Rules

### 1. Teste no Firebase Console

**Acesse:** Firestore → Rules → **Rules Playground**

#### Teste A: Jogador tenta ler mensagem master_only

```javascript
// Simulação
Operation: get
Location: /databases/(default)/documents/campaigns/ABC123/messages/MSG001

// Authenticated: Yes
// Auth UID: player_uid_123

// Custom claims:
{
  "campaigns": {
    "ABC123": {
      "master_uid": "master_uid_456",
      "players": ["player_uid_123"]
    }
  }
}

// Mensagem:
{
  "sender": "drogon",
  "content": "Segredo",
  "audience": "master_only"
}

// Resultado esperado: ❌ DENIED
```

#### Teste B: Mestre tenta ler mensagem master_only

```javascript
// Mesma mensagem, mas Auth UID: master_uid_456

// Resultado esperado: ✅ ALLOWED
```

---

### 2. Teste Programático (Node.js)

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Teste 1: Criar mensagem do Drogon como jogador (deve falhar)
async function testPlayerCreatesDrogonMessage() {
  try {
    await db.collection('campaigns/ABC/messages').add({
      sender: 'drogon',  // ❌ Jogador não pode enviar como Drogon
      content: 'Teste',
      audience: 'master_only',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('❌ ERRO: Jogador conseguiu criar mensagem do Drogon!');
  } catch (error) {
    console.log('✅ CORRETO: Jogador bloqueado -', error.message);
  }
}

// Teste 2: Mestre lê mensagem privada (deve passar)
async function testMasterReadsPrivateMessage() {
  try {
    const snapshot = await db.collection('campaigns/ABC/messages')
      .where('audience', '==', 'master_only')
      .get();

    console.log(`✅ Mestre leu ${snapshot.size} mensagens privadas`);
  } catch (error) {
    console.log('❌ ERRO: Mestre bloqueado!');
  }
}

testPlayerCreatesDrogonMessage();
testMasterReadsPrivateMessage();
```

---

### 3. Teste Real (Frontend)

**Passos:**

1. **Abrir DevTools** (F12)
2. **Aba Console**
3. **Tentar criar mensagem proibida:**

```javascript
// Simular ataque: Jogador tenta criar mensagem master_only
const db = firebase.firestore();

db.collection('campaigns/YOUR_CAMPAIGN_ID/messages').add({
  sender: 'drogon',  // ❌ Não é permitido para jogador
  content: 'Tentativa de hack',
  audience: 'master_only',
  timestamp: firebase.firestore.FieldValue.serverTimestamp()
})
.then(() => {
  console.log('❌ VULNERABILIDADE: Conseguiu criar mensagem proibida!');
})
.catch((error) => {
  console.log('✅ SEGURO: Bloqueado com erro:', error.message);
  // Esperado: "Missing or insufficient permissions"
});
```

**Resultado esperado:**
```
✅ SEGURO: Bloqueado com erro: Missing or insufficient permissions
```

---

## Matriz de Permissões

| Ação | Mestre | Jogador | Anônimo |
|------|--------|---------|---------|
| **Ler mensagem `audience: 'all'`** | ✅ | ✅ | ❌ |
| **Ler mensagem `audience: 'master_only'`** | ✅ | ❌ | ❌ |
| **Criar mensagem como 'mestre'** | ✅ | ❌ | ❌ |
| **Criar mensagem como 'jogador'** | ❌ | ✅ | ❌ |
| **Criar mensagem como 'drogon'** | ✅ | ❌ | ❌ |
| **Criar mensagem `audience: 'all'`** | ✅ | ✅ | ❌ |
| **Criar mensagem `audience: 'master_only'`** | ✅ | ❌ | ❌ |
| **Atualizar mensagem** | ❌ | ❌ | ❌ |
| **Deletar mensagem** | ✅ | ❌ | ❌ |

---

## Logs de Auditoria

### Ver tentativas bloqueadas

**Firebase Console:**
1. **Firestore** → **Usage**
2. Filtrar por: `permission_denied`
3. Ver logs de tentativas de burlar regras

**Exemplo de log:**
```json
{
  "severity": "WARNING",
  "resource": "/campaigns/ABC/messages/MSG123",
  "user": "player_uid_123",
  "error": "PERMISSION_DENIED",
  "rule": "canReadMessage",
  "timestamp": "2025-10-30T18:30:00Z"
}
```

---

## Checklist de Segurança

- [x] ✅ Função `canReadMessage` implementada
- [x] ✅ Leitura de mensagens baseada em `audience`
- [x] ✅ Criação de mensagens validada por role
- [x] ✅ Mensagens do Drogon obrigatoriamente `master_only`
- [x] ✅ Jogadores impedidos de criar mensagens privadas
- [x] ✅ Mensagens imutáveis (no update)
- [ ] ⏳ Testes automatizados (Post-deploy)
- [ ] ⏳ Monitoramento de tentativas de burlar (Post-deploy)

---

## Próximos Passos

### 1. Testes Automatizados (Firebase Emulator)

```bash
# Instalar emulator
npm install -g firebase-tools

# Iniciar emulator
firebase emulators:start --only firestore

# Rodar testes
npm run test:security
```

**Arquivo:** `firestore.spec.js` (criar)

```javascript
const { assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');

describe('Mensagens Privadas', () => {
  test('Jogador NÃO pode ler mensagem master_only', async () => {
    const db = getFirestore({ uid: 'player123' });
    const docRef = db.collection('campaigns/ABC/messages').doc('MSG1');

    await assertFails(docRef.get());
  });

  test('Mestre pode ler mensagem master_only', async () => {
    const db = getFirestore({ uid: 'master456' });
    const docRef = db.collection('campaigns/ABC/messages').doc('MSG1');

    await assertSucceeds(docRef.get());
  });
});
```

---

### 2. Alertas de Segurança

Configurar alertas no Firebase Console:
- **Threshold:** > 10 `permission_denied` por minuto
- **Ação:** Enviar email + notificação Discord
- **Objetivo:** Detectar ataques automatizados

---

### 3. Rate Limiting

Adicionar rate limiting para prevenir spam de tentativas:
```javascript
// Cloud Function
exports.checkRateLimit = functions.firestore
  .document('campaigns/{campaignId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const userId = snap.data().sender_uid;
    const recentMessages = await admin.firestore()
      .collection('campaigns/ABC/messages')
      .where('sender_uid', '==', userId)
      .where('timestamp', '>', Date.now() - 60000) // Último minuto
      .get();

    if (recentMessages.size > 20) {
      throw new Error('Rate limit exceeded');
    }
  });
```

---

## Referências

- [docs/MESSAGE_VISIBILITY.md](MESSAGE_VISIBILITY.md) - Documentação da feature
- [firestore.rules](../firestore.rules) - Arquivo de regras
- [Firebase Security Rules Docs](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Firebase Rules Testing](https://firebase.google.com/docs/rules/unit-tests)

---

**Status:** ✅ Implementado e Deployado
**Deploy:** ✅ Completo (30/10/2025)
**Testes:** ⏳ Pendente (instruções abaixo)
**Versão:** 2.0.0
