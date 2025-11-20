# Botão Flutuante de Dados - Simplificado

## Visão Geral

Componente de botão flutuante interativo que permite rolar dados com exibição numérica simples, sem necessidade de digitar comandos no chat. Ideal para rolagens rápidas durante o jogo.

**⚠️ ATUALIZAÇÃO (Janeiro 2025):** Sistema simplificado removendo animação 3D complexa em favor de exibição direta do resultado numérico para melhor performance e usabilidade.

## Componentes

### 1. FloatingDiceButton.tsx

Botão flutuante principal com menu suspenso de configuração.

#### Props

```typescript
interface FloatingDiceButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onRollComplete?: (command: string, result: DiceResult) => void;
  characterName?: string;
}
```

#### Funcionalidades

**1. Seletor de Dados**
- Grid 4x2 com todos os tipos (d4-d100)
- Destaque visual do dado selecionado
- Cores diferenciadas por tipo

**2. Configurações de Rolagem**
- **Quantidade:** 1-10 dados
- **Modificador:** -10 a +10
- Preview do comando em tempo real

**3. Atalhos Rápidos**
- 1d20 (padrão)
- 2d6 (dano comum)
- 1d8 (arma média)

**4. Exibição de Resultado**
- Display numérico grande e claro
- Destaque visual para críticos (verde) e falhas (vermelho)
- Lista dos dados individuais rolados
- Auto-limpeza após 5 segundos

**5. Estados**
- **Fechado:** Botão flutuante circular
- **Aberto:** Menu suspenso com configurações
- **Rolando:** Estado de loading durante requisição
- **Resultado:** Card com número final destacado

#### Uso

```tsx
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';

<FloatingDiceButton
  position="bottom-right"
  onRollComplete={(command, result) => {
    console.log(`Rolou ${command}: ${result.finalTotal}`);
  }}
  characterName="Gandalf"
/>
```

## Integração com Chat

### Exemplo Completo

```tsx
'use client';

import { useState } from 'react';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import MessageBubble from '@/components/chat/MessageBubble';
import { DiceResult } from '@/lib/dice-helpers';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);

  const handleDiceRollFromFloating = (command: string, result: DiceResult) => {
    // Adiciona rolagem ao chat
    const rollMessage = {
      id: Date.now().toString(),
      sender: 'jogador',
      content: '',
      type: 'dice_roll',
      diceData: {
        command,
        result,
        characterName: 'Jogador',
        context: 'Rolagem rápida',
      },
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, rollMessage]);
  };

  return (
    <div>
      {/* Chat messages */}
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          sender={msg.sender}
          content={msg.content}
          type={msg.type}
          diceData={msg.diceData}
        />
      ))}

      {/* Botão flutuante */}
      <FloatingDiceButton
        position="bottom-right"
        onRollComplete={handleDiceRollFromFloating}
        characterName="Gandalf"
      />
    </div>
  );
}
```

## Fluxo de Uso

```
1. Usuário clica no botão flutuante 🎲
         ↓
2. Menu suspenso abre com animação
         ↓
3. Usuário seleciona tipo de dado (ex: d20)
         ↓
4. Opcionalmente ajusta quantidade e modificador
         ↓
5. Clica em "🎲 Rolar Dados"
         ↓
6. Requisição enviada ao backend (/dice/roll)
         ↓
7. Backend processa e retorna resultado
         ↓
8. Card de resultado aparece com animação scale
         ↓
9. Número final exibido em destaque (verde/vermelho se crítico)
         ↓
10. Lista de dados individuais mostrada abaixo
         ↓
11. Callback onRollComplete é chamado
         ↓
12. Mensagem de rolagem adicionada ao chat (opcional)
         ↓
13. Resultado limpa após 5s (volta ao estado inicial)
```

## Posicionamento

O botão pode ser posicionado em 4 cantos da tela:

```tsx
// Canto inferior direito (padrão)
<FloatingDiceButton position="bottom-right" />

// Canto inferior esquerdo
<FloatingDiceButton position="bottom-left" />

// Canto superior direito
<FloatingDiceButton position="top-right" />

// Canto superior esquerdo
<FloatingDiceButton position="top-left" />
```

O menu suspenso se ajusta automaticamente à posição do botão.

## Animações

### Botão Principal

```typescript
// Entrada
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', stiffness: 260, damping: 20 }}

// Hover
whileHover={{ scale: 1.1 }}

// Click
whileTap={{ scale: 0.9 }}
```

### Menu Suspenso

```typescript
// Entrada
initial={{ opacity: 0, scale: 0.8, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}

// Saída
exit={{ opacity: 0, scale: 0.8, y: 20 }}

// Transição
transition={{ type: 'spring', stiffness: 300, damping: 25 }}
```

### Card de Resultado

```typescript
// Entrada do resultado
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: "spring" }}

// Cores condicionais
className={
  lastResult.isCritical ? 'text-emerald-400' :
  lastResult.isCriticalFailure ? 'text-red-400' :
  'text-amber-300'
}
```

## Responsividade

### Desktop
- Botão: 64px × 64px
- Menu: 320px largura
- Ícones: 32px

### Mobile
- Botão: 56px × 56px (ajustar se necessário)
- Menu: 90% da largura da tela (max 320px)
- Ícones: 28px

### Ajustes Automáticos
- Posição fixa relativa ao viewport
- Z-index: 50 (botão), 40 (menu), 30 (overlay)
- Overlay com backdrop-blur para foco

## Acessibilidade

- **Botão:** `aria-label` implícito pelo ícone
- **Inputs:** Labels descritivos
- **Teclado:** Enter para rolar
- **Screen readers:** Anúncio de resultados

## Performance

- **Otimizações:**
  - AnimatePresence para unmount suave
  - Debounce em inputs (se necessário)
  - Memoização de callbacks

- **Bundle Size:**
  - FloatingDiceButton: ~3KB
  - GlobalDiceButton: ~1KB
  - Total: ~4KB (gzipped)

## Customização

### Cores

Edite as cores em `FloatingDiceButton.tsx`:

```tsx
const diceOptions: DiceOption[] = [
  { type: 4, label: 'd4', color: 'from-blue-600 to-blue-800' },
  // ... altere os gradientes aqui
];
```

### Tamanho do Resultado

Ajuste o tamanho do número em `FloatingDiceButton.tsx`:

```tsx
<div className="text-6xl font-bold mb-2"> // Altere text-6xl para text-8xl, etc.
  {lastResult.finalTotal}
</div>
```

### Duração do Auto-reset

Modifique o tempo de exibição do resultado:

```tsx
setTimeout(() => {
  setLastResult(null);
}, 5000); // Altere 5000ms (5s) para o tempo desejado
```

## Troubleshooting

### Botão não aparece

**Causa:** Z-index conflitando
**Solução:** Verifique se nenhum elemento tem z-index > 50

### Erro ao rolar dado

**Causa:** Backend não está rodando ou rota não configurada
**Solução:**
- Verifique se backend está em http://localhost:4000
- Confirme que rota `/dice` está pública (sem authenticateJWT)
- Verifique logs do backend para erros

### Resultado não aparece no chat

**Causa:** Callback não conectado
**Solução:** Verifique se `onRollComplete` está passando dados corretamente

### Overlay não fecha

**Causa:** onClick no overlay não funciona
**Solução:** Verifique se z-index está correto (30)

## Exemplos de Uso

### Chat Simples

```tsx
<FloatingDiceButton
  position="bottom-right"
  onRollComplete={(cmd, res) => addToChat(cmd, res)}
/>
```

### Com Contexto de Personagem

```tsx
const { character } = useCharacter();

<FloatingDiceButton
  position="bottom-left"
  characterName={character.name}
  onRollComplete={(cmd, res) => {
    addToChat(cmd, res);
    updateCharacterStats(res);
  }}
/>
```

### Múltiplos Botões (Master + Player)

```tsx
{/* Botão do Mestre */}
<FloatingDiceButton
  position="bottom-left"
  characterName="Mestre"
  onRollComplete={handleMasterRoll}
/>

{/* Botão do Jogador */}
<FloatingDiceButton
  position="bottom-right"
  characterName={playerName}
  onRollComplete={handlePlayerRoll}
/>
```

## Melhorias Futuras

- [ ] Sons de dados rolando
- [ ] Vibração no mobile (haptic feedback)
- [ ] Histórico de últimas 5 rolagens
- [ ] Salvar dados favoritos
- [ ] Modos de rolagem especiais (vantagem/desvantagem D&D 5e)
- [ ] Integração com fichas de personagem (usar modificadores automaticamente)
- [ ] Opção de rolar com vantagem (2d20, pega o maior)
- [ ] Estatísticas de rolagens por sessão

## Changelog

### v2.0.0 (Janeiro 2025)
- ✅ **[BREAKING]** Removida animação 3D complexa
- ✅ Sistema simplificado com exibição numérica direta
- ✅ Melhor performance e usabilidade
- ✅ Rota backend `/dice` agora é pública (sem autenticação)
- ✅ Card de resultado com animação scale
- ✅ Detecção visual de críticos (verde) e falhas (vermelho)
- ✅ Lista de dados individuais no resultado
- ✅ Auto-reset após 5 segundos

### v1.0.0 (Janeiro 2025)
- Versão inicial com animação 3D
- Botão flutuante em todas as telas autenticadas
- Integração completa com backend
- GlobalDiceButton para gerenciamento de autenticação

---

**Criado por:** Sistema Dungeons e Drogas
**Versão:** 2.0.0
**Última Atualização:** Janeiro 2025
