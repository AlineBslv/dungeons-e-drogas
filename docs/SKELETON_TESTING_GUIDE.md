# Guia de Testes para Skeleton Screens

Guia completo para testar skeleton screens no **Dungeons e Drogas**, garantindo qualidade, performance e acessibilidade.

## Índice

1. [Testes Visuais](#testes-visuais)
2. [Testes de Performance](#testes-de-performance)
3. [Testes de Acessibilidade](#testes-de-acessibilidade)
4. [Testes Funcionais](#testes-funcionais)
5. [Testes de Regressão](#testes-de-regressão)
6. [Automação de Testes](#automação-de-testes)

---

## Testes Visuais

### 1. Verificação de Dimensões

**Objetivo:** Garantir que skeleton corresponde ao tamanho do conteúdo real.

**Checklist:**
- [ ] Altura do skeleton = altura do conteúdo real (±5px)
- [ ] Largura do skeleton = largura do conteúdo real (±5px)
- [ ] Padding e margin idênticos
- [ ] Border radius consistente

**Como testar:**

```tsx
// 1. Capture dimensões do skeleton
const skeletonRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (skeletonRef.current) {
    const { height, width } = skeletonRef.current.getBoundingClientRect();
    console.log('Skeleton:', { height, width });
  }
}, []);

// 2. Compare com conteúdo real
const contentRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (contentRef.current) {
    const { height, width } = contentRef.current.getBoundingClientRect();
    console.log('Content:', { height, width });
  }
}, []);
```

**Teste Manual:**
1. Abra DevTools (F12)
2. Ative "Layout Shift Regions" no Performance tab
3. Carregue a página
4. Verifique se não há shifts visuais ao trocar skeleton por conteúdo

### 2. Verificação de Layout

**Objetivo:** Garantir que estrutura visual é preservada.

**Checklist:**
- [ ] Grid/Flex layout idêntico
- [ ] Hierarquia visual mantida (header, body, footer)
- [ ] Espaçamentos consistentes
- [ ] Alinhamento correto

**Teste Visual Comparativo:**

```bash
# Capture screenshots
# 1. Com skeleton
npm run dev
# Acesse http://localhost:3000/campaigns
# Capture screenshot antes do loading completar

# 2. Com conteúdo real
# Aguarde loading completar
# Capture screenshot

# 3. Compare lado a lado
# Verifique alinhamento de elementos
```

### 3. Verificação de Animação

**Objetivo:** Garantir animação suave e não invasiva.

**Checklist:**
- [ ] Animação `animate-pulse` funcionando
- [ ] FPS mantido > 60
- [ ] Sem jank visual
- [ ] Animação para quando conteúdo carrega

**Teste de Performance:**

```tsx
// Medir FPS durante animação
let lastTime = performance.now();
let frames = 0;

function measureFPS() {
  frames++;
  const currentTime = performance.now();

  if (currentTime >= lastTime + 1000) {
    const fps = Math.round((frames * 1000) / (currentTime - lastTime));
    console.log(`FPS: ${fps}`);
    frames = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(measureFPS);
}

requestAnimationFrame(measureFPS);
```

### 4. Responsividade

**Objetivo:** Verificar funcionamento em diferentes tamanhos de tela.

**Breakpoints para testar:**
- [ ] Mobile: 375px
- [ ] Mobile Large: 425px
- [ ] Tablet: 768px
- [ ] Desktop: 1024px
- [ ] Desktop Large: 1440px

**Teste Automatizado:**

```tsx
// cypress/e2e/skeleton-responsive.cy.ts
describe('Skeleton Screens - Responsividade', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  viewports.forEach(({ name, width, height }) => {
    it(`deve renderizar corretamente em ${name}`, () => {
      cy.viewport(width, height);
      cy.visit('/campaigns');

      // Verifica presença de skeletons
      cy.get('[data-testid="campaign-skeleton"]').should('be.visible');

      // Captura screenshot
      cy.screenshot(`skeleton-${name}`);
    });
  });
});
```

---

## Testes de Performance

### 1. Tempo de Renderização

**Objetivo:** Skeleton deve renderizar em < 16ms (60 FPS).

**Teste:**

```tsx
// components/ui/__tests__/skeleton-performance.test.tsx
import { render } from '@testing-library/react';
import { CampaignCardSkeleton } from '../campaign-card-skeleton';

describe('Skeleton Performance', () => {
  it('deve renderizar em menos de 16ms', () => {
    const startTime = performance.now();

    render(
      <>
        {[...Array(50)].map((_, i) => (
          <CampaignCardSkeleton key={i} />
        ))}
      </>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(16);
    console.log(`Render time: ${renderTime.toFixed(2)}ms`);
  });
});
```

### 2. Layout Shift (CLS)

**Objetivo:** CLS (Cumulative Layout Shift) = 0 ao trocar skeleton por conteúdo.

**Teste Manual:**
1. Abra Chrome DevTools
2. Performance > Capture Settings > Enable "Layout Shift Regions"
3. Grave performance durante loading
4. Verifique CLS score = 0

**Teste Automatizado (Lighthouse CI):**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/campaigns'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

### 3. Memória

**Objetivo:** Skeletons não causam memory leak.

**Teste:**

```tsx
// Memory leak test
describe('Skeleton Memory', () => {
  it('não deve causar memory leak', async () => {
    const { rerender, unmount } = render(<CampaignCardSkeleton />);

    // Força garbage collection (Node.js com --expose-gc)
    if (global.gc) {
      global.gc();
    }

    const initialMemory = process.memoryUsage().heapUsed;

    // Renderiza/desmonta 100 vezes
    for (let i = 0; i < 100; i++) {
      rerender(<CampaignCardSkeleton />);
      unmount();
    }

    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Aumento de memória deve ser < 1MB
    expect(memoryIncrease).toBeLessThan(1024 * 1024);
  });
});
```

---

## Testes de Acessibilidade

### 1. Screen Readers

**Objetivo:** Skeleton não interfere com leitores de tela.

**Teste Manual:**
1. Ative NVDA (Windows) ou VoiceOver (Mac)
2. Navegue pela página com skeleton
3. Verifique que:
   - [ ] Skeleton não é lido como conteúdo
   - [ ] Foco não fica preso em skeleton
   - [ ] Conteúdo real é anunciado corretamente após loading

**Atributos recomendados:**

```tsx
<div
  className="skeleton"
  aria-hidden="true" // Oculta de screen readers
  aria-busy="true" // Indica loading state
>
  <Skeleton />
</div>
```

### 2. Contraste de Cores

**Objetivo:** Skeleton visível mesmo em low vision.

**Teste:**
1. Use ferramenta de contraste (ex: WebAIM)
2. Verifique ratio mínimo 3:1 (para elementos decorativos)

```tsx
// Teste automatizado com jest-axe
import { axe } from 'jest-axe';
import { render } from '@testing-library/react';

it('deve ter contraste adequado', async () => {
  const { container } = render(<CampaignCardSkeleton />);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
```

### 3. Navegação por Teclado

**Objetivo:** Usuário pode navegar normalmente durante loading.

**Teste:**
1. Carregue página com skeleton
2. Navegue com Tab
3. Verifique que:
   - [ ] Foco não entra em skeleton
   - [ ] Elementos interativos (header, nav) permanecem acessíveis
   - [ ] Ordem de foco lógica

---

## Testes Funcionais

### 1. Estados de Loading

**Teste:** Verificar comportamento em diferentes estados.

```tsx
// cypress/e2e/skeleton-states.cy.ts
describe('Skeleton Loading States', () => {
  it('deve mostrar skeleton durante loading', () => {
    cy.intercept('GET', '/api/campaigns', (req) => {
      req.reply((res) => {
        res.delay(2000); // Simula delay
      });
    });

    cy.visit('/campaigns');

    // Verifica skeleton presente
    cy.get('[data-testid="campaign-skeleton"]').should('exist');

    // Aguarda loading
    cy.wait(2000);

    // Verifica skeleton removido
    cy.get('[data-testid="campaign-skeleton"]').should('not.exist');

    // Verifica conteúdo presente
    cy.get('[data-testid="campaign-card"]').should('exist');
  });

  it('deve trocar para empty state quando não há dados', () => {
    cy.intercept('GET', '/api/campaigns', { body: [] });

    cy.visit('/campaigns');

    // Aguarda skeleton desaparecer
    cy.get('[data-testid="campaign-skeleton"]').should('not.exist');

    // Verifica empty state
    cy.contains('Nenhuma campanha encontrada').should('be.visible');
  });
});
```

### 2. Transições

**Teste:** Verificar transição suave skeleton → conteúdo.

```tsx
describe('Skeleton Transitions', () => {
  it('deve ter fade-in suave ao carregar conteúdo', () => {
    cy.visit('/campaigns');

    // Captura opacidade inicial do conteúdo
    cy.get('[data-testid="campaign-card"]')
      .first()
      .should('have.css', 'opacity', '0');

    // Aguarda transição
    cy.wait(300);

    // Verifica opacidade final
    cy.get('[data-testid="campaign-card"]')
      .first()
      .should('have.css', 'opacity', '1');
  });
});
```

---

## Testes de Regressão

### 1. Visual Regression Testing

Use Chromatic ou Percy para detectar mudanças visuais não intencionais.

**Setup com Chromatic:**

```bash
npm install --save-dev chromatic
```

```tsx
// .storybook/main.ts
module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-essentials'],
};

// src/components/ui/campaign-card-skeleton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CampaignCardSkeleton } from './campaign-card-skeleton';

const meta: Meta<typeof CampaignCardSkeleton> = {
  title: 'Skeletons/CampaignCard',
  component: CampaignCardSkeleton,
};

export default meta;
type Story = StoryObj<typeof CampaignCardSkeleton>;

export const Default: Story = {};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-6">
      <CampaignCardSkeleton />
      <CampaignCardSkeleton />
      <CampaignCardSkeleton />
    </div>
  ),
};
```

```bash
# Run visual tests
npx chromatic --project-token=<your-token>
```

### 2. Screenshot Testing

```tsx
// cypress/e2e/skeleton-visual.cy.ts
describe('Skeleton Visual Regression', () => {
  it('deve corresponder ao snapshot', () => {
    cy.visit('/campaigns');

    // Aguarda skeleton aparecer
    cy.get('[data-testid="campaign-skeleton"]').should('be.visible');

    // Captura screenshot
    cy.screenshot('campaigns-skeleton', {
      capture: 'viewport',
      disableTimersAndAnimations: false, // Mantém animação
    });

    // Compare com baseline
    cy.compareSnapshot('campaigns-skeleton');
  });
});
```

---

## Automação de Testes

### 1. Pre-commit Hook

Rode testes antes de cada commit.

```bash
npm install --save-dev husky lint-staged
```

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "**/*.tsx": [
      "npm run test:skeleton",
      "npm run lint"
    ]
  },
  "scripts": {
    "test:skeleton": "jest --testPathPattern=skeleton"
  }
}
```

### 2. CI/CD Pipeline

```yaml
# .github/workflows/skeleton-tests.yml
name: Skeleton Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:skeleton

      - name: Run E2E tests
        run: npm run test:e2e:skeleton

      - name: Run accessibility tests
        run: npm run test:a11y

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

### 3. Testes de Performance Contínuos

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  schedule:
    - cron: '0 0 * * *' # Diariamente à meia-noite

jobs:
  performance:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000/campaigns
            http://localhost:3000/characters
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Check CLS
        run: |
          if [ $(cat .lighthouseci/cls.json | jq '.score') -lt 0.1 ]; then
            echo "CLS score too high!"
            exit 1
          fi
```

---

## Checklist de Testes Completo

### Antes de Deploy

- [ ] **Visual**
  - [ ] Dimensões corretas
  - [ ] Layout preservado
  - [ ] Animação suave
  - [ ] Responsivo (mobile, tablet, desktop)

- [ ] **Performance**
  - [ ] Render time < 16ms
  - [ ] CLS = 0
  - [ ] FPS > 60
  - [ ] Sem memory leaks

- [ ] **Acessibilidade**
  - [ ] Screen reader compatível
  - [ ] Contraste adequado
  - [ ] Navegação por teclado OK
  - [ ] ARIA attributes corretos

- [ ] **Funcional**
  - [ ] Aparece durante loading
  - [ ] Desaparece após loading
  - [ ] Transição suave
  - [ ] Empty state funciona

- [ ] **Regressão**
  - [ ] Visual regression passed
  - [ ] Screenshot tests passed
  - [ ] Storybook updated

### Após Deploy

- [ ] Monitorar Core Web Vitals
- [ ] Verificar error tracking (Sentry)
- [ ] Coletar feedback de usuários
- [ ] Analisar heatmaps (Hotjar)

---

## Ferramentas Recomendadas

### Testing
- **Jest** - Unit tests
- **React Testing Library** - Component tests
- **Cypress** - E2E tests
- **jest-axe** - Accessibility tests

### Visual Testing
- **Chromatic** - Visual regression
- **Percy** - Screenshot testing
- **Storybook** - Component gallery

### Performance
- **Lighthouse CI** - Performance monitoring
- **WebPageTest** - Detailed analysis
- **Chrome DevTools** - Manual testing

### Accessibility
- **axe DevTools** - Browser extension
- **NVDA** - Screen reader (Windows)
- **VoiceOver** - Screen reader (Mac)
- **WAVE** - Accessibility checker

---

## Relatório de Testes Template

```markdown
# Relatório de Testes - Skeleton Screens

**Data:** 2025-11-08
**Versão:** 1.0.0
**Testador:** [Nome]

## Resumo
- Total de testes: X
- Passou: Y
- Falhou: Z
- Ignorado: W

## Testes Visuais
✅ Dimensões corretas
✅ Layout preservado
❌ Animação com jank em mobile (Issue #123)
✅ Responsividade OK

## Testes de Performance
✅ Render time: 12ms (target: < 16ms)
✅ CLS: 0.02 (target: < 0.1)
✅ FPS: 62 (target: > 60)
✅ Memory: OK

## Testes de Acessibilidade
✅ Screen reader: NVDA passou
✅ Contraste: 4.5:1 (WCAG AA)
✅ Keyboard navigation: OK
✅ ARIA: 0 violations

## Issues Encontrados
1. **Issue #123**: Animação com jank em mobile
   - Severidade: Média
   - Browser: Chrome Mobile
   - Fix sugerido: Reduzir complexidade da animação

## Recomendações
1. Adicionar shimmer effect para carregamentos > 2s
2. Implementar lazy loading de skeletons complexos
3. Adicionar testes de performance no CI

## Próximos Passos
- [ ] Corrigir Issue #123
- [ ] Adicionar testes automatizados
- [ ] Documentar edge cases
```

---

**Última atualização:** Sprint 9
**Versão:** 1.0
**Status:** ✅ Guia completo de testes
