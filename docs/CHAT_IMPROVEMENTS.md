# Melhorias do Chat com Drogon

**Data:** 30 de Outubro de 2025
**Status Atual:** 90% funcional

## Estado Atual

### ✅ Funcionalidades Implementadas

1. **Integração Gemini AI**
   - [frontend/src/app/api/chat/route.ts](../frontend/src/app/api/chat/route.ts)
   - Modelo: `gemini-2.0-flash-001`
   - Sistema de contexto (tom, detalhe, idioma, estilo)
   - Histórico de 5 mensagens recentes

2. **Sincronização em Tempo Real**
   - Firestore listeners para mensagens
   - Socket.io para eventos instantâneos
   - Sistema de presença (usuários online)

3. **Sistema de Dados**
   - Comando `/roll 1d20+5` no chat
   - Integração com botão flutuante global
   - Salvamento no Firestore

4. **Componentes UI**
   - MessageBubble com suporte a dice rolls
   - ChatInput com autocomplete de comandos
   - TypingIndicator para Drogon

## 🔧 Melhorias Necessárias

### 1. Typing Indicators Multiplayer (Alta Prioridade)

**Problema:** Apenas Drogon mostra indicador de "está digitando". Jogadores e mestres não têm indicador visível.

**Solução:**

#### A. Adicionar evento typing ao ChatInput

```tsx
// frontend/src/components/chat/ChatInput.tsx

import { useEffect, useRef } from 'react';

export default function ChatInput({ onSendMessage, onTyping, disabled }) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMsg(value);

    // Notifica que está digitando
    if (onTyping && value.trim()) {
      onTyping(true);

      // Clear timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Para de digitar após 2 segundos de inatividade
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else if (onTyping && !value.trim()) {
      onTyping(false);
    }
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
}
```

#### B. Atualizar ChatPage para emitir eventos

```tsx
// frontend/src/app/chat/page.tsx

<ChatInput
  onSendMessage={handleSendMessage}
  onDiceRoll={handleDiceRoll}
  onTyping={(isTyping) => emitTyping(isTyping)}  // Novo!
  disabled={isTyping}
/>
```

#### C. Exibir usuários digitando

```tsx
// frontend/src/app/chat/page.tsx

{/* Indicadores de usuários digitando (antes das mensagens) */}
{typingUsers.length > 0 && (
  <div className="flex flex-col gap-2 mb-4">
    {typingUsers.map((user) => (
      <motion.div
        key={user.userId}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                delay: i * 0.15,
              }}
              className="w-1.5 h-1.5 bg-primary rounded-full"
            />
          ))}
        </div>
        <span className="font-lore">{user.userName} está digitando...</span>
      </motion.div>
    ))}
  </div>
)}
```

---

### 2. Markdown Rendering (Média Prioridade)

**Problema:** Mensagens de Drogon não suportam formatação (negrito, itálico, listas).

**Solução:**

#### Instalar dependência

```bash
cd frontend
npm install react-markdown remark-gfm
```

#### Atualizar MessageBubble

```tsx
// frontend/src/components/chat/MessageBubble.tsx

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageBubble({ content, sender }) {
  return (
    <Card>
      {sender === 'drogon' ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-invert prose-sm max-w-none"
          components={{
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            strong: ({ node, ...props }) => <strong className="text-metallic-gold font-bold" {...props} />,
            em: ({ node, ...props }) => <em className="text-mystic-purple" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      ) : (
        <p>{content}</p>
      )}
    </Card>
  );
}
```

#### Instruir Gemini a usar Markdown

```ts
// frontend/src/app/api/chat/route.ts

const systemPrompt = `...
**Formatação:**
- Use **negrito** para ênfase em palavras importantes
- Use *itálico* para pensamentos e sussurros
- Use listas quando apropriado:
  - Opções de ação
  - Itens encontrados
  - Consequências possíveis
- Quebre parágrafos para melhor legibilidade

Exemplo:
"Vocês entram na **Taverna do Dragão Dourado**. O ambiente está *estranhamente silencioso*. O taverneiro olha para vocês com medo nos olhos.

Vocês podem:
- Perguntar sobre o silêncio
- Pedir bebidas normalmente
- Investigar a sala"
...`;
```

---

### 3. Lista de Usuários Online (Média Prioridade)

**Problema:** Contador de usuários online existe, mas não há lista visual.

**Solução:**

#### Criar componente OnlineUsersList

```tsx
// frontend/src/components/chat/OnlineUsersList.tsx

'use client';

import { motion } from 'framer-motion';
import { FaCircle, FaCrown, FaShield } from 'react-icons/fa';
import { OnlineUser } from '@/hooks/useSocket';
import { Card } from '@/components/ui/card';

interface OnlineUsersListProps {
  users: OnlineUser[];
}

export default function OnlineUsersList({ users }: OnlineUsersListProps) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-bold text-metallic-gold mb-3 font-medieval flex items-center gap-2">
        <FaCircle className="w-2 h-2 text-green-500 animate-pulse" />
        Participantes Online ({users.length})
      </h3>
      <div className="space-y-2">
        {users.map((user) => (
          <motion.div
            key={user.userId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 text-sm"
          >
            {user.role === 'mestre' ? (
              <FaCrown className="w-4 h-4 text-metallic-gold" title="Mestre" />
            ) : (
              <FaShield className="w-4 h-4 text-foreground/60" title="Jogador" />
            )}
            <span className="font-lore text-foreground">{user.userName}</span>
            <div className="flex-1 flex justify-end">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
```

#### Integrar na sidebar direita

```tsx
// frontend/src/app/chat/page.tsx

<AnimatePresence>
  {(showSettings || showSessionPanel) && (
    <motion.div className="...">
      <div className="w-96 h-full overflow-y-auto p-4 space-y-4">
        {/* Lista de Usuários Online */}
        {onlineUsers.length > 0 && (
          <OnlineUsersList users={onlineUsers} />
        )}

        {/* ... resto dos painéis */}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

---

### 4. Mensagens de Sistema (Baixa Prioridade)

**Problema:** Eventos importantes (usuário entrou, usuário saiu) não são visíveis no chat.

**Solução:**

#### Criar tipo de mensagem `system`

```tsx
// frontend/src/app/chat/page.tsx

interface Message {
  id: string;
  sender: 'mestre' | 'drogon' | 'jogador' | 'system';  // Novo tipo
  content: string;
  timestamp: string | Timestamp;
  type?: 'message' | 'dice_roll' | 'system_event';     // Novo tipo
}
```

#### Adicionar mensagens de sistema

```tsx
// frontend/src/app/chat/page.tsx

useEffect(() => {
  if (!currentCampaign?.id) return;

  const cleanupDiceRoll = onDiceRoll((data) => {
    toast.success(`${data.userName} rolou dados!`);
  });

  // Listener para mudanças de presença
  const cleanupPresence = onPresenceUpdate((data) => {
    // Adiciona mensagem de sistema ao chat
    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`,
      sender: 'system',
      content: `${data.userName} ${data.joined ? 'entrou' : 'saiu'} da sessão`,
      timestamp: new Date().toISOString(),
      type: 'system_event'
    }]);
  });

  return () => {
    cleanupDiceRoll?.();
    cleanupPresence?.();
  };
}, [currentCampaign?.id]);
```

#### Estilizar mensagens de sistema

```tsx
// frontend/src/components/chat/MessageBubble.tsx

if (sender === 'system') {
  return (
    <div className="flex justify-center my-2">
      <div className="px-3 py-1 rounded-full bg-accent/30 text-xs text-muted-foreground font-lore border border-border/50">
        {content}
      </div>
    </div>
  );
}
```

---

### 5. Comandos Slash (Baixa Prioridade)

**Problema:** Apenas `/roll` está implementado.

**Sugestões de novos comandos:**

```tsx
// frontend/src/components/chat/ChatInput.tsx

// /roll 1d20+5 → Rolagem de dados (já existe)
// /npc [nome] → Criar NPC rápido
// /scene [descrição] → Definir cena atual
// /help → Mostrar lista de comandos
// /clear → Limpar chat (local)

const handleCommand = (msg: string) => {
  const parts = msg.split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  switch (command) {
    case '/roll':
      onDiceRoll?.(args);
      break;

    case '/npc':
      onSendMessage?.(`[Criou NPC: ${args}]`);
      break;

    case '/scene':
      onSendMessage?.(`[Cena: ${args}]`);
      break;

    case '/help':
      toast.info('Comandos: /roll, /npc, /scene, /help, /clear');
      break;

    case '/clear':
      // Implementar limpeza local do chat
      break;

    default:
      toast.error(`Comando desconhecido: ${command}`);
  }

  setMsg('');
};
```

---

## 📋 Priorização de Implementação

### Sprint 1 (4 horas)
1. **Typing Indicators Multiplayer** (2h)
   - Atualizar ChatInput
   - Integrar com Socket.io
   - Exibir usuários digitando

2. **Lista de Usuários Online** (2h)
   - Criar componente OnlineUsersList
   - Integrar na sidebar

### Sprint 2 (3 horas)
3. **Markdown Rendering** (2h)
   - Instalar react-markdown
   - Atualizar MessageBubble
   - Atualizar prompt do Gemini

4. **Mensagens de Sistema** (1h)
   - Adicionar tipo 'system'
   - Exibir eventos de presença

### Sprint 3 (2 horas)
5. **Comandos Slash Adicionais** (2h)
   - Implementar /npc, /scene, /help
   - Criar lista de comandos
   - Adicionar autocomplete

---

## 🧪 Testes Necessários

### Testes Multiplayer

1. **Teste de Typing:**
   - Abrir 2 navegadores
   - Logar com usuários diferentes
   - Verificar se indicador aparece em tempo real

2. **Teste de Presença:**
   - Entrar/sair de campanha
   - Verificar se lista atualiza
   - Confirmar contador correto

3. **Teste de Markdown:**
   - Enviar mensagem com **negrito**, *itálico*, listas
   - Verificar renderização no MessageBubble
   - Testar em mobile (responsividade)

---

## 📚 Referências

- [Socket.io Typing Indicators](https://socket.io/get-started/private-messaging-part-3/#typing-indicator)
- [react-markdown Docs](https://github.com/remarkjs/react-markdown)
- [Firestore Real-time Updates](https://firebase.google.com/docs/firestore/query-data/listen)
- [Gemini API Docs](https://ai.google.dev/docs)
