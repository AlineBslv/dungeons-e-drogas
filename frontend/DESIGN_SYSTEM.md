# 🎨 Design System - Dungeons & Drogas

Sistema de design completo para o RPG narrativo com IA, seguindo o guia de estilo medieval dark definido no ROADMAP.md.

## 📁 Estrutura de Arquivos

```
/frontend
├── tokens/
│   ├── theme.json           # Paleta de cores, sombras, espaçamentos
│   └── typography.json      # Hierarquia de fontes e tamanhos
├── src/
│   ├── styles/
│   │   ├── shadcn-theme.css # Tokens HSL para Shadcn UI
│   │   └── animations.css   # Microinterações e animações
│   ├── lib/
│   │   ├── utils.ts         # Utilitários (cn helper)
│   │   └── motion-presets.ts # Animações Framer Motion reutilizáveis
│   ├── components/
│   │   ├── ui/              # Componentes base (Shadcn customizados)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── dialog.tsx
│   │   ├── chat/            # Componentes de chat
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── AnimatedMessage.tsx
│   │   │   └── TypingIndicator.tsx
│   │   └── app/             # Componentes de aplicação
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       ├── context-panel.tsx
│   │       └── player-panel.tsx
│   └── app/
│       ├── globals.css      # Imports dos estilos
│       └── layout.tsx       # Configuração de fontes e metadata
└── tailwind.config.ts       # Configuração Tailwind com tokens
```

## 🎨 Paleta de Cores

### Dark Medieval Theme

| Nome | Hex | Uso | Contraste |
|------|-----|-----|-----------|
| `dark-100` | `#0C0B09` | Fundo global | Base escura |
| `dark-300` | `#181511` | Cards, containers | Camada 1 |
| `dark-500` | `#221E1A` | Inputs, botões secundários | Camada 2 |
| `gold-300` | `#B89E58` | Hover states, aura | Acento quente |
| `gold-500` | `#C5A75B` | Primário, destaques | Energia mágica |
| `text-primary` | `#EDE9E2` | Textos principais | Pergaminho claro |
| `text-secondary` | `#B0ADA7` | Subtextos, labels | Clareza suave |
| `ruby` | `#762B28` | Erros, destrutivo | Sangue e drama |
| `emerald` | `#3E775A` | Sucesso, confirmação | Vida e equilíbrio |
| `arcane` | `#3A4A63` | Links, místico | Mistério |

### Uso no Tailwind

```tsx
// Fundos
className="bg-dark-100"        // Fundo global
className="bg-dark-300"        // Cards
className="bg-dark-500"        // Inputs

// Textos
className="text-text-primary"  // Texto principal
className="text-text-secondary" // Subtexto

// Acentos
className="text-gold-500"      // Dourado primário
className="border-gold-500"    // Bordas douradas
className="hover:shadow-glow"  // Efeito glow
```

## 🔤 Tipografia

### Fontes

| Nome | Família | Variável CSS | Uso |
|------|---------|--------------|-----|
| **Medieval** | Cinzel Decorative | `--font-medieval` | Títulos, campanhas, cabeçalhos |
| **Lore** | Libre Baskerville | `--font-lore` | Mensagens IA, textos narrativos |
| **UI** | Inter | `--font-ui` | Botões, labels, interface |

### Classes Tailwind

```tsx
className="font-medieval"  // Títulos épicos
className="font-lore"      // Narrativa imersiva
className="font-ui"        // Interface moderna
```

### Hierarquia de Tamanhos

```json
{
  "display-lg": "3.75rem",   // 60px - Títulos principais
  "display-md": "3rem",      // 48px - Subtítulos grandes
  "h1": "2rem",              // 32px - Heading 1
  "h2": "1.5rem",            // 24px - Heading 2
  "body": "1rem",            // 16px - Corpo de texto
  "body-sm": "0.875rem",     // 14px - Texto pequeno
  "caption": "0.75rem"       // 12px - Legendas
}
```

## ✨ Animações e Microinterações

### CSS Animations (animations.css)

| Classe | Efeito | Uso |
|--------|--------|-----|
| `glow-gold` | Brilho dourado | Hover em botões primários |
| `animate-pulse-glow` | Respiração dourada | IA processando |
| `animate-rune-glow` | Brilho rúnico | Ícones místicos |
| `animate-fade-in` | Fade in suave | Aparição de elementos |
| `animate-dice-roll` | Rotação 360° | Rolagem de dados |
| `animate-fire-flicker` | Tremulação | Elementos de fogo |

### Framer Motion Presets (motion-presets.ts)

```tsx
import { messageAppear, diceRoll, buttonHover } from "@/lib/motion-presets";

// Mensagem aparecendo
<motion.div variants={messageAppear} initial="initial" animate="animate" />

// Dados rolando
<motion.div variants={diceRoll} animate="animate" />

// Botão com hover
<motion.button {...buttonHover} />
```

## 🧩 Componentes UI

### Button

```tsx
import { Button } from "@/components/ui/button";

// Variantes
<Button variant="drogon">Primário Dourado</Button>
<Button variant="secondary">Secundário Bronze</Button>
<Button variant="outline">Contorno</Button>
<Button variant="destructive">Destrutivo</Button>
<Button variant="arcane">Arcano</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="lg">Grande</Button>
<Button size="icon">Ícone</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo com tema medieval
  </CardContent>
</Card>
```

### Input

```tsx
import { Input } from "@/components/ui/input";

<Input placeholder="Digite sua invocação..." />
```

### Tooltip

```tsx
import { Tooltip } from "@/components/ui/tooltip";

<Tooltip content="O poder observa você" side="top">
  <button>Hover me</button>
</Tooltip>
```

### Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título Arcano</DialogTitle>
    </DialogHeader>
    Conteúdo do modal
  </DialogContent>
</Dialog>
```

## 🏗️ Componentes de Aplicação

### Header

```tsx
import { Header } from "@/components/app";

<Header campaignName="A Ira dos Kobolds" />
```

### Sidebar

```tsx
import { Sidebar } from "@/components/app";

<Sidebar />
```

### Context Panel

```tsx
import { ContextPanel } from "@/components/app";

<ContextPanel />
```

### Player Panel

```tsx
import { PlayerPanel } from "@/components/app";

<PlayerPanel
  playerName="Thorin"
  characterClass="Guerreiro"
  hp={45}
  maxHp={60}
  weapon="Espada Longa"
/>
```

## 🎬 Motion System

### Transições Padrão

```tsx
import { transitions } from "@/lib/motion-presets";

// Suave
transition={transitions.smooth}  // 0.3s easeOut

// Elástica
transition={transitions.bouncy}  // cubic-bezier bouncy

// Lenta
transition={transitions.slow}    // 0.7s easeInOut

// Spring
transition={transitions.spring}  // Spring physics
```

### Variants Predefinidas

- `messageAppear` - Mensagens aparecendo
- `slideInLeft` - Entrada da esquerda
- `slideInRight` - Entrada da direita
- `modalArcane` - Modal arcano com blur
- `tooltipNarrative` - Tooltip narrativo
- `runeGlow` - Brilho rúnico
- `diceRoll` - Rolagem de dados
- `fireFlicker` - Tremulação de fogo

## ♿ Acessibilidade

### Contraste

- Texto normal: ≥ 4.5:1
- Texto narrativo: ≥ 7:1
- Elementos interativos: ≥ 3:1

### ARIA Labels

Todos os componentes interativos possuem:
- `aria-label` para botões sem texto
- `role="log"` para chat
- `aria-live` para feedback dinâmico

### Redução de Movimento

```css
@media (prefers-reduced-motion: reduce) {
  animation-duration: 0.01ms !important;
}
```

## 🚀 Como Usar

### 1. Importar Componentes

```tsx
import { Button } from "@/components/ui/button";
import { Header, Sidebar } from "@/components/app";
```

### 2. Aplicar Classes Tailwind

```tsx
<div className="bg-dark-300 text-text-primary font-lore">
  Texto com tema Drogon
</div>
```

### 3. Usar Motion Presets

```tsx
import { motion } from "framer-motion";
import { messageAppear } from "@/lib/motion-presets";

<motion.div variants={messageAppear} initial="initial" animate="animate">
  Conteúdo animado
</motion.div>
```

### 4. Acessar Tokens

```tsx
import themeTokens from "@/tokens/theme.json";

const primaryColor = themeTokens.colors.gold["500"]; // #C5A75B
```

## 📖 Referências

- **ROADMAP.md** - Guia de estilo completo e especificações
- **Shadcn UI** - Base dos componentes
- **Tailwind CSS** - Utilitário de estilos
- **Framer Motion** - Biblioteca de animações
- **Lucide React** - Ícones

## 🎯 Próximos Passos

- [ ] Adicionar componente `Toast` para notificações narrativas
- [ ] Criar `Avatar` com bordas rúnicas
- [ ] Implementar `Switch` para contexto IA
- [ ] Adicionar `Badge` para status e tags
- [ ] Criar `DropdownMenu` com tema medieval

---

**Versão:** 1.0.0
**Última atualização:** 2025-10-18
**Mestre Drogon aprova este design system.** ✨
