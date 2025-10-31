# 🎃 Horror Theme - Halloween Special

Sistema temático visual completo para campanhas de mistério, terror e suspense.

## Visão Geral

O **Horror Theme** transforma a interface dark medieval dourada em uma experiência visual sombria com:
- Paleta roxa necrótica + verde espectral + vermelho sangue
- Efeitos de névoa animada
- Brilhos sobrenaturais pulsantes
- Animações sinistras (tremor, flutuação fantasmagórica, piscar)

## Como Ativar

### 1. Criar Campanha com Tone Horror

```typescript
// No painel de criação de campanha ou configurações
await createNewCampaign("A Maldição da Mansão", "Aventura de horror sobrenatural", {
  tone: 'horror',
  detail_level: 'high',
  language: 'pt-BR'
});
```

### 2. Alterar Campanha Existente

No **Painel de Contexto** (ícone de engrenagem):
- Selecione **Tom: Horror**
- O tema será aplicado automaticamente

## Paleta de Cores

### Cores Principais
```css
--background: hsl(270 30% 4%)     /* Darkness necrótica */
--foreground: hsl(280 20% 92%)    /* Branco fantasmagórico */
--primary: hsl(280 65% 55%)       /* Roxo necrótico */
--secondary: hsl(0 72% 45%)       /* Vermelho sangue */
--accent: hsl(150 60% 45%)        /* Verde espectral */
```

### Cores Especiais Horror
- `horror-purple` - Roxo necrótico (auras, magia sombria)
- `horror-blood` - Vermelho sangue (perigo, dano)
- `horror-spectral` - Verde espectral (fantasmas, veneno)
- `horror-shadow` - Sombra profunda (fundos, bordas)

## Classes CSS Disponíveis

### Efeitos de Texto
```tsx
<h1 className="text-horror-necrotic">Título Necrótico</h1>
<p className="text-horror-blood">Texto Sangue</p>
<span className="text-horror-spectral">Texto Espectral</span>
```

### Animações
```tsx
// Pulsação sinistra
<div className="animate-horror-pulse">...</div>

// Piscar assustador
<div className="animate-horror-flicker">...</div>

// Flutuação fantasmagórica
<div className="animate-horror-float">...</div>

// Tremor assustador (trigger em eventos)
<div className="animate-horror-tremor">...</div>

// Gota de sangue
<div className="animate-blood-drip">...</div>
```

### Fundos e Sombras
```tsx
// Fundo com névoa animada
<div className="bg-horror-fog">...</div>

// Sombra profunda
<div className="shadow-horror">...</div>

// Borda brilhante roxa
<div className="border-horror-glow">...</div>
```

## Aplicação Automática

O `ThemeProvider` detecta automaticamente o `tone` da campanha atual e aplica:
```html
<html class="dark" data-tone="horror">
```

Isso ativa todas as variáveis CSS do tema horror globalmente.

## Integração com Componentes

### MessageBubble com Tom Horror
```tsx
// O componente pode detectar tone e ajustar estilo
{currentCampaign?.context?.tone === 'horror' && (
  <div className="border-horror-glow animate-horror-pulse">
    <GiSkull className="text-horror-blood" />
  </div>
)}
```

### Botões Horror
```tsx
<Button
  variant="default"
  className="shadow-horror-purple hover:animate-horror-tremor"
>
  Investigar Sombra
</Button>
```

## Prompt do Gemini (Mestre Drogon)

Quando `tone: 'horror'`, o sistema instrui o Drogon a:
- Usar vocabulário de terror e suspense
- Criar atmosferas tensas e ameaçadoras
- Introduzir elementos sobrenaturais gradualmente
- Focar em descrições sensoriais (sons, sombras, sensações)
- Manter suspense crescente

**Temperature:** `0.85` (alta criatividade para imprevisibilidade)

## Exemplos de Uso

### Campanha "A Mansão Amaldiçoada"
```typescript
{
  title: "A Mansão Amaldiçoada",
  context: {
    tone: 'horror',
    detail_level: 'high',
    language: 'pt-BR',
    style: 'narrative'
  }
}
```

**Resultado Visual:**
- Interface roxa escura com brilhos espectrais
- Névoa animada no fundo
- Ícones e textos com glow necrótico
- Animações sinistras em eventos importantes

### Evento Halloween Especial
```typescript
// Mestre pode alternar tone durante sessão
await updateCampaignContext({
  tone: 'horror',
  mood: 'fear'
});
```

## Combinações Recomendadas

### Máximo Suspense
```typescript
{
  tone: 'horror',
  mood: 'fear',
  detail_level: 'high',
  ai_focus: 'storytelling'
}
```

### Mystery Investigation
```typescript
{
  tone: 'horror',
  mood: 'mystery',
  detail_level: 'medium',
  ai_focus: 'balanced'
}
```

### Cosmic Horror (Lovecraftiano)
```typescript
{
  tone: 'horror',
  mood: 'despair',
  detail_level: 'high',
  ai_focus: 'lore'
}
```

## Performance

Todas as animações usam `transform` e `opacity` (GPU-accelerated).
Névoa de fundo usa `pointer-events: none` para não interferir em cliques.

## Acessibilidade

- Mantém contraste WCAG AAA entre texto e fundo
- Animações podem ser desativadas via `prefers-reduced-motion`
- Brilhos não interferem na legibilidade

## Desativação

Para voltar ao tema padrão:
```typescript
await updateCampaignContext({
  tone: 'mystical' // ou 'epic', 'dark', etc
});
```

O tema será revertido automaticamente.

---

**Criado para:** Evento Halloween - Dungeons e Drogas
**Data:** Outubro 2025
**Versão:** 1.0
