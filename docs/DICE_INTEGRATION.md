# Guia de Integração - Sistema de Dados

## Visão Geral

Este guia mostra como integrar o sistema de dados virtuais nos seus componentes do projeto Dungeons e Drogas.

## Arquivos Principais

- **Backend:** `backend/controllers/diceController.js`, `backend/routes/dice.js`
- **Frontend:** `frontend/src/components/player/` (DiceRoller, QuickActions, PlayerDicePanel)
- **Helpers:** `frontend/src/lib/dice-helpers.ts`
- **Componentes Atualizados:** MessageBubble, ChatInput, PlayerPanel

## 1. Usando o PlayerDicePanel

O componente mais completo que combina rolagem e ações rápidas.

### Instalação Básica

```tsx
import PlayerDicePanel from '@/components/player/PlayerDicePanel';

export default function PlayerView() {
  return (
    <PlayerDicePanel
      characterName="Gandalf"
      characterStats={{
        strength: 10,
        dexterity: 14,
        wisdom: 18,
        charisma: 16
      }}
    />
  );
}
```

### Com Callback

```tsx
import PlayerDicePanel from '@/components/player/PlayerDicePanel';
import { DiceResult } from '@/lib/dice-helpers';

export default function PlayerView() {
  const handleRollComplete = (
    command: string,
    result: DiceResult,
    context?: string
  ) => {
    console.log(`${context}: ${result.finalTotal}`);

    // Adicionar ao chat, atualizar UI, etc.
  };

  return (
    <PlayerDicePanel
      characterName="Gandalf"
      characterStats={{
        strength: 10,
        dexterity: 14,
        wisdom: 18,
        charisma: 16
      }}
      onRollComplete={handleRollComplete}
    />
  );
}
```

## 2. Integrando com Chat

### Passo 1: Atualizar Estado de Mensagens

Adicione suporte para mensagens de tipo `dice_roll`:

```tsx
interface Message {
  id: string;
  sender: 'mestre' | 'drogon' | 'jogador';
  content: string;
  type?: 'message' | 'dice_roll';
  diceData?: {
    command: string;
    result: DiceResult;
    context?: string;
    characterName?: string;
  };
  timestamp: string;
}
```

### Passo 2: Adicionar Handler de Rolagem

```tsx
import { rollDice } from '@/lib/dice-helpers';

const handleDiceRoll = async (command: string) => {
  try {
    const result = await rollDice(command, {
      campaignId: currentCampaign.id,
      characterName: user.displayName,
      context: 'Rolagem do chat'
    });

    // Adiciona mensagem de rolagem
    const rollMessage: Message = {
      id: Date.now().toString(),
      sender: 'jogador',
      content: '',
      type: 'dice_roll',
      diceData: {
        command,
        result: result.result,
        characterName: user.displayName,
      },
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, rollMessage]);
  } catch (error) {
    console.error('Erro ao rolar dados:', error);
    alert(error.message);
  }
};
```

### Passo 3: Atualizar ChatInput

```tsx
<ChatInput
  onSendMessage={handleSendMessage}
  onDiceRoll={handleDiceRoll}
  disabled={isTyping}
/>
```

### Passo 4: Renderizar com MessageBubble

```tsx
{messages.map((message) => (
  <MessageBubble
    key={message.id}
    sender={message.sender}
    content={message.content}
    type={message.type}
    diceData={message.diceData}
    timestamp={message.timestamp}
  />
))}
```

## 3. Sincronizando com Firestore

### Salvando Rolagens

As rolagens são automaticamente salvas no Firestore quando você fornece `campaignId`:

```tsx
await rollDice('1d20+5', {
  campaignId: 'campaign_123',  // ← Salva no Firestore
  userId: user.uid,
  characterName: 'Gandalf',
  context: 'Ataque'
});
```

### Ouvindo Rolagens em Tempo Real

```tsx
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

useEffect(() => {
  if (!campaignId) return;

  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('campaignId', '==', campaignId),
    orderBy('createdAt', 'asc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();

      // Converte rolagens do Firestore para formato do componente
      if (data.type === 'dice_roll') {
        return {
          id: doc.id,
          sender: data.userId === user.uid ? 'jogador' : 'mestre',
          content: '',
          type: 'dice_roll',
          diceData: {
            command: data.command,
            result: data.result,
            context: data.context,
            characterName: data.characterName,
          },
          timestamp: data.createdAt?.toDate().toISOString(),
        };
      }

      return {
        id: doc.id,
        sender: data.sender,
        content: data.content,
        timestamp: data.createdAt?.toDate().toISOString(),
      };
    });

    setMessages(messages);
  });

  return () => unsubscribe();
}, [campaignId, user]);
```

## 4. Usando Comando /roll no Chat

O ChatInput detecta automaticamente comandos `/roll`:

```
/roll 1d20+5
/roll 2d6
/roll 3d8-2
```

### Customizando Detecção

```tsx
// No ChatInput.tsx, você pode modificar a regex:
const rollMatch = msg.match(/^\/roll\s+(.+)$/i);
```

### Adicionando Outros Comandos

```tsx
// Exemplo: /attack, /defend
const handleSend = () => {
  const rollMatch = msg.match(/^\/roll\s+(.+)$/i);
  const attackMatch = msg.match(/^\/attack$/i);

  if (rollMatch && onDiceRoll) {
    onDiceRoll(rollMatch[1].trim());
    setMsg("");
    return;
  }

  if (attackMatch && onQuickAttack) {
    onQuickAttack();
    setMsg("");
    return;
  }

  // Mensagem normal...
};
```

## 5. Validação de Comandos

Use o helper de validação antes de enviar para API:

```tsx
import { validateDiceCommand } from '@/lib/dice-helpers';

const handleDiceRoll = async (command: string) => {
  // Valida localmente primeiro
  const validation = validateDiceCommand(command);

  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  // Envia para API
  try {
    const result = await rollDice(command);
    // ...
  } catch (error) {
    alert(error.message);
  }
};
```

## 6. Helpers Úteis

### Calcular Modificador

```tsx
import { calculateModifier } from '@/lib/dice-helpers';

const strModifier = calculateModifier(16); // +3
const dexModifier = calculateModifier(8);  // -1
```

### Construir Comando de Dados

```tsx
import { buildDiceCommand } from '@/lib/dice-helpers';

const attackRoll = buildDiceCommand(20, 1, 5);  // "1d20+5"
const damageRoll = buildDiceCommand(8, 2, 3);   // "2d8+3"
```

### Formatar Resultado

```tsx
import { formatDiceResult } from '@/lib/dice-helpers';

const formatted = formatDiceResult(result, '1d20+5');
// "🎲 Rolagem: 1d20+5\nDados: [18] +5 = **23**"
```

## 7. Exemplo Completo: Chat com Dados

```tsx
'use client';

import { useState, useEffect } from 'react';
import { rollDice, validateDiceCommand } from '@/lib/dice-helpers';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import PlayerDicePanel from '@/components/player/PlayerDicePanel';

export default function GameChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Lógica de mensagem normal
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'mestre',
      content,
      timestamp: new Date().toISOString(),
    }]);
  };

  const handleDiceRoll = async (command: string) => {
    // Valida comando
    const validation = validateDiceCommand(command);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      const result = await rollDice(command, {
        campaignId: 'current_campaign',
        characterName: 'Jogador',
      });

      // Adiciona ao chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'jogador',
        content: '',
        type: 'dice_roll',
        diceData: {
          command,
          result: result.result,
          characterName: 'Jogador',
        },
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollFromPanel = (command, result, context) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'jogador',
      content: '',
      type: 'dice_roll',
      diceData: {
        command,
        result,
        context,
        characterName: 'Jogador',
      },
      timestamp: new Date().toISOString(),
    }]);
  };

  return (
    <div className="flex gap-4">
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              sender={msg.sender}
              content={msg.content}
              type={msg.type}
              diceData={msg.diceData}
              timestamp={msg.timestamp}
            />
          ))}
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          onDiceRoll={handleDiceRoll}
          disabled={isLoading}
        />
      </div>

      {/* Painel Lateral de Dados */}
      <div className="w-96">
        <PlayerDicePanel
          characterName="Gandalf"
          characterStats={{
            strength: 10,
            dexterity: 14,
            wisdom: 18,
            charisma: 16
          }}
          onRollComplete={handleRollFromPanel}
        />
      </div>
    </div>
  );
}
```

## 8. Troubleshooting

### Erro: "Token inválido"

Certifique-se de que o token JWT está armazenado:

```tsx
// Após login
localStorage.setItem('token', userToken);
localStorage.setItem('userId', user.uid);
```

### Erro: "campaignId não encontrado"

Defina o campaignId atual:

```tsx
localStorage.setItem('currentCampaignId', campaignId);
```

### Rolagens não aparecem no chat

Verifique se o tipo da mensagem está correto:

```tsx
type: 'dice_roll'  // ✅ Correto
type: 'roll'       // ❌ Errado
```

### Animações não funcionam

Certifique-se de que Framer Motion está instalado:

```bash
npm install framer-motion
```

## 9. Próximos Passos

- [ ] Adicionar sons de dados rolando
- [ ] Implementar histórico visual de rolagens
- [ ] Criar templates de ações personalizadas
- [ ] Adicionar rolagens com vantagem/desvantagem (2d20 keep highest/lowest)
- [ ] Sincronizar rolagens entre múltiplos jogadores

---

**Documentação completa:** [DICE_SYSTEM.md](./DICE_SYSTEM.md)
