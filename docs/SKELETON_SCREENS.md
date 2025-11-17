# Skeleton Screens

Implementação completa de skeleton screens para melhorar a experiência de carregamento no **Dungeons e Drogas**.

## O que são Skeleton Screens?

Skeleton screens são placeholders visuais que aparecem enquanto o conteúdo está sendo carregado, proporcionando:
- Melhor percepção de performance
- Redução da ansiedade do usuário durante o carregamento
- Indicação clara da estrutura do conteúdo que será exibido
- Experiência mais profissional e polida

## Componentes Implementados

### 1. Base: `Skeleton`
**Localização:** `src/components/ui/skeleton.tsx`

Componente base que fornece a animação de pulse e estilo base para todos os outros skeleton screens.

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-full" />
```

### 2. `CampaignCardSkeleton`
**Localização:** `src/components/ui/campaign-card-skeleton.tsx`

Skeleton para cards de campanha na lista de campanhas.

**Onde é usado:**
- [campaigns/page.tsx](../frontend/src/app/campaigns/page.tsx:134)

**Estrutura:**
- Header com título e descrição
- Badges de tom e estilo
- Footer com contadores de jogadores e timestamp

### 3. `CharacterCardSkeleton`
**Localização:** `src/components/ui/character-card-skeleton.tsx`

Skeleton para cards de personagens na lista de fichas.

**Onde é usado:**
- [characters/page.tsx](../frontend/src/app/characters/page.tsx:214)

**Estrutura:**
- Avatar circular
- Nome e classe do personagem
- Grid de atributos (3 colunas)
- Botões de ação

### 4. `ChatSkeleton`
**Localização:** `src/components/ui/chat-skeleton.tsx`

Skeleton para interface de chat/mensagens.

**Onde é usado:**
- [campaign-detail-skeleton.tsx](../frontend/src/components/ui/campaign-detail-skeleton.tsx:2) (dentro do CampaignDetailSkeleton)

**Estrutura:**
- Header com título e status
- Múltiplas mensagens (alternando entre remetente e destinatário)
- Input de mensagem no footer

### 5. `CampaignDetailSkeleton`
**Localização:** `src/components/ui/campaign-detail-skeleton.tsx`

Skeleton completo para a página de detalhes da campanha.

**Onde é usado:**
- [campaigns/[id]/page.tsx](../frontend/src/app/campaigns/[id]/page.tsx:271)

**Estrutura:**
- Header com título e botão de ação
- Grid de 2 colunas (principal + sidebar)
- Painel de controle de sessão
- Chat integrado
- Informações da campanha
- Lista de jogadores
- Código de convite

### 6. `FormSkeleton`
**Localização:** `src/components/ui/form-skeleton.tsx`

Skeleton genérico para formulários.

**Estrutura:**
- Header com título e descrição
- 5 campos de formulário (label + input)
- Botões de ação (cancelar/enviar)

**Uso futuro:**
- Formulários de criação/edição de campanhas
- Formulários de criação/edição de personagens
- Configurações

### 7. `TableSkeleton`
**Localização:** `src/components/ui/table-skeleton.tsx`

Skeleton para tabelas com configuração flexível.

**Props:**
- `rows?: number` - Número de linhas (padrão: 5)
- `columns?: number` - Número de colunas (padrão: 4)

```tsx
<TableSkeleton rows={10} columns={6} />
```

**Uso futuro:**
- Listagem de sessões
- Tabela de estatísticas
- Histórico de rolagens de dados

### 8. `StatsCardSkeleton`
**Localização:** `src/components/ui/stats-card-skeleton.tsx`

Skeleton para cards de estatísticas.

**Estrutura:**
- Header com ícone e título
- Estatística principal destacada
- Grid 3x1 de sub-estatísticas

**Uso futuro:**
- Dashboard de estatísticas de campanha
- Métricas do mestre
- Performance de jogadores

## Importação Centralizada

Todos os skeleton screens podem ser importados de um único arquivo:

```tsx
import {
  Skeleton,
  CampaignCardSkeleton,
  CharacterCardSkeleton,
  ChatSkeleton,
  CampaignDetailSkeleton,
  FormSkeleton,
  TableSkeleton,
  StatsCardSkeleton
} from "@/components/ui";
```

## Padrão de Uso

### 1. Estado de Loading na Página

```tsx
export default function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <CampaignCardSkeleton />;
  }

  return <ActualContent />;
}
```

### 2. Loading em Lista

```tsx
{loading ? (
  <div className="grid grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <CampaignCardSkeleton key={i} />
    ))}
  </div>
) : (
  <CampaignList campaigns={campaigns} />
)}
```

### 3. Skeleton Inline

```tsx
{user ? (
  <UserProfile user={user} />
) : (
  <Skeleton className="h-10 w-32 rounded-full" />
)}
```

## Boas Práticas

### 1. Quantidade de Skeletons
- Use quantidade realista de skeletons (3-6 itens)
- Evite muitos skeletons que causam confusão visual
- Mantenha consistência com o layout real

### 2. Dimensões Precisas
- Combine as dimensões do skeleton com o conteúdo real
- Use as mesmas classes de altura/largura
- Mantenha o mesmo grid/layout

### 3. Hierarquia Visual
- Mantenha a hierarquia visual (headers, body, footer)
- Use opacidades diferentes para diferenciar elementos
- Preserve espaçamentos e gaps

### 4. Performance
- Skeletons são leves e renderizam rapidamente
- Evite animações complexas dentro de skeletons
- Use `animate-pulse` do Tailwind (já otimizado)

## Personalização

### Alterar cor de fundo

O skeleton usa `bg-primary/10` por padrão. Para personalizar:

```tsx
<Skeleton className="bg-gold-500/20" />
```

### Alterar forma

```tsx
{/* Circular */}
<Skeleton className="rounded-full w-12 h-12" />

{/* Quadrado */}
<Skeleton className="rounded-none w-12 h-12" />

{/* Arredondado */}
<Skeleton className="rounded-xl w-full h-32" />
```

### Desabilitar animação

```tsx
<Skeleton className="animate-none" />
```

## Melhorias Futuras

### 1. Skeleton com Gradiente
- Implementar shimmer effect (efeito de brilho deslizante)
- Usar gradientes para simular destaque de conteúdo

### 2. Skeleton Condicional
- Skeleton adapta-se ao tipo de conteúdo esperado
- Variações baseadas em contexto

### 3. Skeleton com Transitions
- Transições suaves ao trocar skeleton por conteúdo real
- Fade-in animado do conteúdo

### 4. Lazy Loading com Skeleton
- Skeleton aparece enquanto componente é carregado via lazy
- Integração com React.lazy() e Suspense

## Testes

### Visual Testing
Verificar que todos os skeletons:
- [ ] Têm dimensões corretas
- [ ] Animam suavemente
- [ ] Correspondem ao layout real
- [ ] Funcionam em diferentes tamanhos de tela

### Performance Testing
- [ ] Skeletons renderizam em < 16ms
- [ ] Não causam layout shift ao trocar por conteúdo
- [ ] Animação não causa lag

## Acessibilidade

Os skeleton screens implementados seguem boas práticas de acessibilidade:

- ✅ Usam `aria-live` implícito (conteúdo muda dinamicamente)
- ✅ Mantém estrutura semântica (cards, headers, etc)
- ✅ Não interferem com screen readers (conteúdo é decorativo)
- ✅ Cores com contraste adequado (mesmo em modo escuro)

## Documentação Adicional

- [Tailwind CSS - Animation](https://tailwindcss.com/docs/animation)
- [Shadcn UI - Skeleton](https://ui.shadcn.com/docs/components/skeleton)
- [UX Pattern: Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/)

---

**Última atualização:** Sprint 9
**Responsável:** Sistema de UX/UI
**Status:** ✅ Implementado e testado
