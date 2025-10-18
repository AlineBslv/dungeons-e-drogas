# 🗺️ Roadmap de Desenvolvimento - Dungeons e Drogas

**Versão:** 1.1
**Última atualização:** 2025-10-18
**Objetivo:** MVP Funcional com Landing Page e sem Multiplayer Real-time

---

## 📊 Visão Geral do Estado Atual

### ✅ Componentes Implementados

#### Backend (Node.js + Express)
- ✅ Servidor Express com rate limiting (20 req/min)
- ✅ Integração Gemini API (chat + embeddings)
- ✅ Sistema de contexto dinâmico adaptativo
- ✅ Upload e processamento de PDFs
- ✅ Geração de embeddings (text-embedding-004)
- ✅ Firebase Storage Service
- ✅ Busca semântica por similaridade de cosseno
- ✅ Firebase Admin SDK configurado

**Endpoints Ativos:**
```
GET  /              → Status do servidor
GET  /ping          → Health check
POST /chat/send     → Enviar mensagem ao Drogon
POST /gemini/chat   → Chat com contexto dinâmico
POST /upload        → Upload de PDFs
POST /search        → Busca semântica em corpus
```

#### Frontend (Next.js 14)
- ✅ Layout base com tema dark medieval
- ✅ Componentes de UI (Shadcn + Tailwind)
- ✅ Sistema de chat (MessageBubble, ChatInput, ChatContainer)
- ✅ Animações (TypingIndicator, AnimatedMessage com Framer Motion)
- ✅ Firebase SDK configurado
- ✅ Página de teste: `/chat/test`

#### Infraestrutura
- ✅ CI/CD (GitHub Actions)
- ✅ Estrutura modular (controllers, services, routes, models)
- ✅ Documentação técnica (CLAUDE.md)

### 🔶 Arquivos Pendentes de Commit
```
M  .github/workflows/ci.yml
M  backend/firebaseAdmin.js
M  backend/index.js
M  backend/package.json
?? backend/controllers/geminiController.js
?? backend/controllers/searchController.js
?? backend/controllers/uploadController.js
?? backend/services/contextService.js
?? backend/services/embeddingService.js
?? backend/services/pdfService.js
?? backend/services/storageService.js
?? backend/routes/gemini.js
?? backend/routes/search.js
?? backend/routes/upload.js
?? backend/models/contextSchema.js
```

**Ação Recomendada:** Commitar antes de iniciar próximas features

---

## 🎯 Roadmap Prioritizado (6 Sprints)

### **Sprint 0: Landing Page** (Semanas 1-2)

#### Objetivo
Criar landing page de alta conversão seguindo boas práticas de UX/UI para capturar interesse e leads antes do lançamento.

#### Frontend - Tarefas

**1. Estrutura da Landing Page**
- Arquivo: `frontend/src/app/page.tsx` (substituir página atual)
- Seções principais:
  - **Hero Section** - Headline impactante + CTA
  - **Features** - Principais diferenciais do produto
  - **How it Works** - Fluxo de uso (Mestre e Jogador)
  - **Screenshots/Demo** - Prévia da interface
  - **Testimonials** - Depoimentos (futuro)
  - **Pricing/Plans** - Planos (Mestre free/premium)
  - **FAQ** - Perguntas frequentes
  - **Footer** - Links + redes sociais

**2. Boas Práticas de UX/UI**
- Design responsivo (mobile-first)
- Tema dark medieval consistente com a marca
- Micro-interações (scroll animations, hover effects)
- Performance otimizada (Core Web Vitals)
- Acessibilidade (WCAG 2.1 AA)
- SEO otimizado (meta tags, structured data)

**3. Componentes da Landing**
- `frontend/src/components/landing/HeroSection.tsx`
  - Headline: "Onde a narrativa encontra a magia da IA"
  - Subtitle: Descrição do valor único
  - CTAs: "Começar como Mestre" / "Entrar como Jogador"
  - Background animado (partículas, gradientes)

- `frontend/src/components/landing/FeaturesGrid.tsx`
  - Cards destacando:
    - 🧙 Mestre Drogon (IA narradora)
    - 🎲 Sistema simplificado de D&D
    - 📚 Base de conhecimento oficial
    - ⚙️ Contexto dinâmico adaptativo
    - 🎨 Interface grimório medieval
    - 📊 Painel do Mestre completo

- `frontend/src/components/landing/HowItWorks.tsx`
  - Timeline visual em 3 passos:
    1. Crie sua campanha
    2. Convide jogadores
    3. Deixe a magia acontecer
  - Screenshots ou ilustrações de cada etapa

- `frontend/src/components/landing/DemoPreview.tsx`
  - Carrossel de screenshots da aplicação
  - Ou vídeo demo (futuro)
  - Highlight das interfaces de Mestre e Jogador

- `frontend/src/components/landing/PricingCards.tsx`
  - Plano Gratuito:
    - 1 campanha ativa
    - Até 5 jogadores
    - Chat com Drogon ilimitado
    - Regras básicas de D&D
  - Plano Premium (futuro):
    - Campanhas ilimitadas
    - Jogadores ilimitados
    - Exportação de sessões
    - Acesso antecipado a features

- `frontend/src/components/landing/FAQ.tsx`
  - Accordion com perguntas comuns
  - Tópicos: O que é? Como funciona? É gratuito? Preciso conhecer D&D?

- `frontend/src/components/landing/CTASection.tsx`
  - Seção final de conversão
  - Botão grande "Começar Agora"
  - Badge: "100% Gratuito - Sem cartão de crédito"

**4. Formulário de Waitlist (Opcional)**
- Se produto não estiver pronto:
  - Capturar email para notificar no lançamento
  - Integração com Mailchimp/SendGrid
  - Badge: "Seja um dos primeiros"

**5. Analytics e Tracking**
- Google Analytics 4
- Hotjar (heatmaps e session recordings)
- Conversão de CTAs
- Scroll depth

**6. SEO e Meta Tags**
- Título: "Dungeons e Drogas - RPG Narrativo com IA"
- Description otimizada (155-160 caracteres)
- Open Graph para redes sociais
- Favicon e app icons
- Sitemap.xml

#### Design Guidelines (A detalhar no desenvolvimento)
- Paleta de cores dark medieval
- Tipografia: Fontes com personalidade (serif para títulos, sans-serif para corpo)
- Iconografia: Ícones customizados de grimório/fantasia
- Imagens: Ilustrações de D&D, dados, mapas, pergaminhos
- Animações: Sutis, não intrusivas (Framer Motion)

#### Dependências Adicionais
```json
{
  "react-intersection-observer": "^9.5.0",  // Scroll animations
  "react-countup": "^6.5.0",                // Números animados
  "swiper": "^11.0.0"                       // Carrossel de imagens
}
```

#### Critérios de Aceite
- [ ] Landing page responsiva (mobile, tablet, desktop)
- [ ] Todas seções implementadas e estilizadas
- [ ] CTAs clicáveis redirecionam para /register
- [ ] Performance: Lighthouse score > 90
- [ ] SEO: Meta tags completas
- [ ] Animações suaves em scroll
- [ ] FAQ funcional (accordion)
- [ ] Footer com links para docs e redes sociais

---

### **Sprint 1: Autenticação & Usuários** (Semanas 3-6)

#### Objetivo
Implementar sistema completo de autenticação com Firebase Auth e gerenciamento de perfis (Mestre/Jogador).

#### Backend - Tarefas

**1. Criar Model de Usuário**
- Arquivo: `backend/models/userSchema.js`
- Schema:
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,
  displayName: string,
  tier: "mestre" | "jogador",
  photoURL?: string,
  active_campaigns: string[], // Array de campaignIds
  preferences: {
    preferred_tone: "epic" | "dark" | "comic" | "casual",
    language: "pt-BR" | "en-US" | "es-ES",
    notifications: boolean
  },
  createdAt: Timestamp,
  lastLoginAt: Timestamp
}
```

**2. Criar Controller de Autenticação**
- Arquivo: `backend/controllers/authController.js`
- Funções:
  - `register(req, res)` - Criar usuário no Firestore após registro Firebase
  - `getProfile(req, res)` - Buscar perfil completo do usuário
  - `updateProfile(req, res)` - Atualizar displayName, preferences
  - `setTier(req, res)` - Definir se é Mestre ou Jogador

**3. Criar Middleware de Autenticação**
- Arquivo: `backend/middleware/authMiddleware.js`
- Função: `verifyFirebaseToken(req, res, next)`
  - Verificar token Firebase no header `Authorization: Bearer <token>`
  - Decodificar token e adicionar `req.user = { uid, email }`
  - Retornar 401 se token inválido

**4. Criar Rotas de Autenticação**
- Arquivo: `backend/routes/auth.js`
```javascript
POST   /auth/register      → Criar perfil após Firebase Auth
GET    /auth/me            → Buscar perfil do usuário logado
PUT    /auth/profile       → Atualizar perfil
PUT    /auth/tier          → Definir tier (mestre/jogador)
DELETE /auth/account       → Deletar conta (soft delete)
```

**5. Proteger Rotas Existentes**
- Adicionar `authMiddleware` em:
  - `/chat/send`
  - `/gemini/chat`
  - `/upload`
  - Todas rotas futuras de campanhas

#### Frontend - Tarefas

**1. Criar Context de Autenticação**
- Arquivo: `frontend/src/contexts/AuthContext.tsx`
- Prover:
  - `user` (FirebaseUser + dados Firestore)
  - `loading` (estado de carregamento)
  - `login(email, password)`
  - `register(email, password, displayName, tier)`
  - `logout()`
  - `updateProfile(data)`

**2. Criar Páginas de Autenticação**
- `frontend/src/app/login/page.tsx`
  - Form: email + password
  - Link para registro
  - Mensagens de erro (Firebase Auth)

- `frontend/src/app/register/page.tsx`
  - Form: email + password + confirmar senha + nome + tier (radio: Mestre/Jogador)
  - Validação de senha forte
  - Criar usuário Firebase + perfil Firestore

**3. Criar Componente de Proteção de Rotas**
- Arquivo: `frontend/src/components/auth/ProtectedRoute.tsx`
- Redirecionar para `/login` se não autenticado
- Mostrar loading enquanto verifica auth

**4. Criar Header com Menu de Usuário**
- Arquivo: `frontend/src/components/layout/Header.tsx`
- Avatar do usuário
- Dropdown menu:
  - Meu Perfil
  - Minhas Campanhas
  - Configurações
  - Sair

**5. Criar Página de Perfil**
- `frontend/src/app/profile/page.tsx`
- Editar displayName, photoURL
- Alterar preferências (tone, language)
- Trocar senha (Firebase Auth)

#### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras de usuários
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow delete: if request.auth.uid == userId;
    }

    // Regras de contextos (apenas o dono pode editar)
    match /contexts/{contextId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### Critérios de Aceite
- [ ] Usuário pode se registrar escolhendo tier (Mestre/Jogador)
- [ ] Login funcional com email/senha
- [ ] Perfil armazenado no Firestore
- [ ] Token JWT validado no backend
- [ ] Rotas protegidas redirecionam para login
- [ ] Header mostra avatar e nome do usuário
- [ ] Logout limpa sessão e redireciona

---

### **Sprint 2: Campanhas & Sessões** (Semanas 7-10)

#### Objetivo
CRUD completo de campanhas, histórico de mensagens persistido no Firestore.

#### Backend - Tarefas

**1. Criar Model de Campanha**
- Arquivo: `backend/models/campaignSchema.js`
- Schema:
```javascript
{
  campaignId: string,           // UUID gerado
  title: string,
  description: string,
  master_uid: string,           // UID do Mestre criador
  players: [                    // Array de jogadores
    {
      uid: string,
      displayName: string,
      joinedAt: Timestamp
    }
  ],
  context: {                    // Contexto da campanha (do contextService)
    tone: "epic" | "dark" | "comic" | "casual",
    detail_level: "low" | "medium" | "high",
    language: "pt-BR" | "en-US" | "es-ES",
    style: "narrative" | "rule" | "mixed",
    ai_focus: "storytelling" | "rules" | "balanced",
    temperature: number,
    context_memory: {}
  },
  settings: {
    isPublic: boolean,          // Campanha pública ou privada
    maxPlayers: number,
    autoSave: boolean
  },
  stats: {
    totalMessages: number,
    totalSessions: number,
    totalPlayTime: number       // Em minutos
  },
  currentSession: {
    isActive: boolean,
    startedAt: Timestamp | null,
    participants: string[]      // UIDs dos jogadores online
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActivity: Timestamp
}
```

**2. Criar Controller de Campanhas**
- Arquivo: `backend/controllers/campaignController.js`
- Funções:
  - `create(req, res)` - Criar campanha (apenas Mestres)
  - `getById(req, res)` - Buscar campanha por ID
  - `update(req, res)` - Atualizar título, descrição, contexto
  - `delete(req, res)` - Deletar campanha (apenas Mestre criador)
  - `getUserCampaigns(req, res)` - Listar campanhas do usuário
  - `addPlayer(req, res)` - Adicionar jogador à campanha
  - `removePlayer(req, res)` - Remover jogador
  - `startSession(req, res)` - Iniciar sessão de jogo
  - `endSession(req, res)` - Finalizar sessão

**3. Criar Model de Mensagem**
- Arquivo: `backend/models/messageSchema.js`
- Schema:
```javascript
{
  messageId: string,
  campaignId: string,
  sender: {
    uid: string,              // "drogon" para IA
    displayName: string,
    tier: "mestre" | "jogador" | "drogon"
  },
  content: string,
  type: "text" | "dice_roll" | "action" | "system",
  metadata: {
    roll_data?: {             // Se type = "dice_roll"
      dice: string,           // Ex: "1d20+5"
      result: number,
      modifier: number,
      isCritical: boolean
    },
    action_type?: string,     // Ex: "attack", "defend"
    context_detected?: {}     // Mudanças de contexto detectadas
  },
  timestamp: Timestamp,
  editedAt?: Timestamp,
  isVisible: boolean          // Para mensagens de sistema
}
```

**4. Atualizar Chat Controller**
- Arquivo: `backend/controllers/chatController.js`
- Modificar `sendMessage` para:
  - Salvar mensagem do usuário no Firestore
  - Buscar histórico recente (últimas 10 mensagens)
  - Incluir histórico no contexto do Gemini
  - Salvar resposta da IA no Firestore
  - Incrementar `campaign.stats.totalMessages`

**5. Criar Controller de Mensagens**
- Arquivo: `backend/controllers/messageController.js`
- Funções:
  - `getHistory(req, res)` - Buscar histórico de mensagens (paginado)
  - `deleteMessage(req, res)` - Deletar mensagem (apenas Mestre ou autor)
  - `editMessage(req, res)` - Editar mensagem (apenas autor)

**6. Criar Rotas**
- Arquivo: `backend/routes/campaigns.js`
```javascript
POST   /campaigns              → Criar campanha (Mestre)
GET    /campaigns              → Listar campanhas do usuário
GET    /campaigns/:id          → Buscar campanha por ID
PUT    /campaigns/:id          → Atualizar campanha
DELETE /campaigns/:id          → Deletar campanha
POST   /campaigns/:id/players  → Adicionar jogador
DELETE /campaigns/:id/players/:uid → Remover jogador
POST   /campaigns/:id/session/start → Iniciar sessão
POST   /campaigns/:id/session/end   → Finalizar sessão
```

- Arquivo: `backend/routes/messages.js`
```javascript
GET    /messages/:campaignId         → Histórico (paginado)
DELETE /messages/:campaignId/:msgId  → Deletar mensagem
PUT    /messages/:campaignId/:msgId  → Editar mensagem
```

#### Frontend - Tarefas

**1. Criar Context de Campanha**
- Arquivo: `frontend/src/contexts/CampaignContext.tsx`
- Prover:
  - `campaigns` (lista de campanhas do usuário)
  - `currentCampaign` (campanha ativa)
  - `createCampaign(data)`
  - `updateCampaign(id, data)`
  - `deleteCampaign(id)`
  - `loadCampaign(id)`

**2. Criar Páginas de Campanhas**
- `frontend/src/app/campaigns/page.tsx` - Lista de campanhas
  - Grid de cards de campanhas
  - Botão "Nova Campanha" (apenas Mestres)
  - Filtros: Ativas / Arquivadas

- `frontend/src/app/campaigns/new/page.tsx` - Criar campanha
  - Form: título, descrição, maxPlayers, isPublic
  - Seleção de contexto inicial (tone, detail_level)

- `frontend/src/app/campaigns/[id]/page.tsx` - Detalhes da campanha
  - Informações gerais
  - Lista de jogadores
  - Estatísticas
  - Botão "Entrar no Chat"

**3. Criar Componentes de Campanha**
- `frontend/src/components/campaign/CampaignCard.tsx`
  - Thumbnail da campanha
  - Título, descrição curta
  - Mestre, número de jogadores
  - Última atividade

- `frontend/src/components/campaign/CampaignForm.tsx`
  - Form reutilizável para criar/editar

- `frontend/src/components/campaign/PlayerList.tsx`
  - Lista de jogadores com avatares
  - Botão adicionar/remover (apenas Mestre)

**4. Atualizar ChatContainer**
- `frontend/src/components/chat/ChatContainer.tsx`
  - Receber `campaignId` como prop
  - Buscar histórico ao montar componente
  - Salvar mensagens no Firestore via API
  - Auto-scroll ao receber nova mensagem
  - Paginação ao scroll top (carregar mais antigas)

**5. Criar Hook de Histórico**
- `frontend/src/hooks/useMessageHistory.ts`
  - Gerenciar estado de mensagens
  - Implementar paginação
  - Cache local (React Query ou SWR)

#### Firestore Security Rules (Atualização)

```javascript
// Campanhas
match /campaigns/{campaignId} {
  allow read: if request.auth != null && (
    resource.data.master_uid == request.auth.uid ||
    request.auth.uid in resource.data.players
  );
  allow create: if request.auth != null &&
    request.resource.data.master_uid == request.auth.uid;
  allow update: if request.auth != null &&
    resource.data.master_uid == request.auth.uid;
  allow delete: if request.auth != null &&
    resource.data.master_uid == request.auth.uid;
}

// Mensagens
match /messages/{campaignId}/{messageId} {
  allow read: if request.auth != null && (
    get(/databases/$(database)/documents/campaigns/$(campaignId)).data.master_uid == request.auth.uid ||
    request.auth.uid in get(/databases/$(database)/documents/campaigns/$(campaignId)).data.players
  );
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null &&
    resource.data.sender.uid == request.auth.uid;
}
```

#### Critérios de Aceite
- [ ] Mestre pode criar campanha com contexto inicial
- [ ] Jogador pode visualizar campanhas onde participa
- [ ] Histórico de chat salvo no Firestore
- [ ] Mensagens paginadas (20 por página)
- [ ] IA usa histórico recente para contexto
- [ ] Estatísticas de campanha atualizadas automaticamente
- [ ] Mestre pode adicionar/remover jogadores

---

### **Sprint 3: Painel do Mestre** (Semanas 11-14)

#### Objetivo
Interface de controle completa para o Mestre gerenciar campanha e contexto em tempo real.

#### Backend - Tarefas

**1. Criar Endpoint de Estatísticas**
- Arquivo: `backend/controllers/campaignController.js`
- Função: `getStats(req, res)`
  - Total de mensagens
  - Tempo total de jogo
  - Jogadores mais ativos
  - Distribuição de tipos de mensagem

**2. Criar Endpoint de Exportação**
- Arquivo: `backend/controllers/exportController.js`
- Função: `exportSession(req, res)`
  - Gerar PDF com histórico da sessão
  - Incluir estatísticas
  - Formato: narrativa cronológica

**3. Atualizar Context Service**
- Adicionar endpoint para atualizar contexto em lote
- Função: `batchUpdateContext(campaignId, updates)`

#### Frontend - Tarefas

**1. Criar Layout do Painel do Mestre**
- `frontend/src/app/master/campaign/[id]/page.tsx`
- Layout dual:
  - Sidebar esquerda (30%): Controles
  - Área principal (70%): Chat

**2. Criar Painel de Contexto**
- `frontend/src/components/master/ContextPanel.tsx`
- Controles:
  - **Tom:** Slider (Epic ↔ Dark ↔ Comic ↔ Casual)
  - **Nível de Detalhe:** Radio (Baixo / Médio / Alto)
  - **Idioma:** Select (PT-BR / EN-US / ES-ES)
  - **Estilo:** Radio (Narrativo / Regras / Misto)
  - **Foco da IA:** Radio (Storytelling / Rules / Balanced)
  - Botão "Aplicar Mudanças" (atualiza contexto via API)

**3. Criar Painel de Gerenciamento de Jogadores**
- `frontend/src/components/master/PlayerManagement.tsx`
- Funcionalidades:
  - Lista de jogadores com status (online/offline)
  - Botão "Adicionar Jogador" (buscar por email)
  - Botão "Remover" ao lado de cada jogador
  - Indicador de atividade (última mensagem)

**4. Criar Painel de Controle de Sessão**
- `frontend/src/components/master/SessionControls.tsx`
- Botões:
  - "Iniciar Sessão" → Marca `currentSession.isActive = true`
  - "Pausar Sessão"
  - "Finalizar Sessão" → Salva duração, gera resumo
  - Timer de duração da sessão

**5. Criar Painel de Estatísticas**
- `frontend/src/components/master/StatsPanel.tsx`
- Métricas:
  - Total de mensagens (gráfico de linha)
  - Tempo total de jogo
  - Distribuição de ações (pizza chart)
  - Jogadores mais ativos (ranking)

**6. Criar Modal de Exportação**
- `frontend/src/components/master/ExportModal.tsx`
- Opções:
  - Formato: PDF / JSON / Markdown
  - Período: Última sessão / Toda campanha
  - Incluir: Mensagens / Estatísticas / Contexto

**7. Criar Dashboard Geral**
- `frontend/src/app/master/dashboard/page.tsx`
- Visão geral de todas campanhas
- Cards com:
  - Título da campanha
  - Última atividade
  - Número de jogadores
  - Botão "Gerenciar"

#### Critérios de Aceite
- [ ] Mestre visualiza todas campanhas criadas em dashboard
- [ ] Painel dual (controles + chat) funcional
- [ ] Contexto atualizado em tempo real (reflete na próxima resposta da IA)
- [ ] Jogadores podem ser adicionados/removidos
- [ ] Sessões podem ser iniciadas e finalizadas
- [ ] Estatísticas atualizadas dinamicamente
- [ ] Exportação de sessão em PDF funcional

---

### **Sprint 4: Painel do Jogador** (Semanas 15-18)

#### Objetivo
Interface de jogador com ficha de personagem simplificada e sistema de rolagem de dados.

#### Backend - Tarefas

**1. Criar Model de Personagem**
- Arquivo: `backend/models/characterSchema.js`
- Schema:
```javascript
{
  characterId: string,
  campaignId: string,
  player_uid: string,
  name: string,
  race: string,              // Ex: "Humano", "Elfo"
  class: string,             // Ex: "Guerreiro", "Mago"
  level: number,
  attributes: {
    strength: number,        // 8-20
    dexterity: number,
    constitution: number,
    intelligence: number,
    wisdom: number,
    charisma: number
  },
  combat: {
    hp_current: number,
    hp_max: number,
    ac: number,              // Armor Class
    initiative: number
  },
  inventory: [
    {
      itemId: string,
      name: string,
      quantity: number,
      description?: string
    }
  ],
  skills: string[],          // Ex: ["Atletismo", "Furtividade"]
  notes: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**2. Criar Controller de Personagens**
- Arquivo: `backend/controllers/characterController.js`
- Funções:
  - `create(req, res)` - Criar personagem
  - `getById(req, res)` - Buscar personagem
  - `update(req, res)` - Atualizar atributos, HP, inventário
  - `delete(req, res)` - Deletar personagem
  - `getByCampaign(req, res)` - Listar personagens da campanha

**3. Criar Controller de Dados**
- Arquivo: `backend/controllers/diceController.js`
- Função: `roll(req, res)`
  - Receber comando (ex: "1d20+5")
  - Parser de dados (regex)
  - Calcular resultado
  - Detectar crítico/falha crítica
  - Salvar rolagem no histórico de mensagens

**4. Criar Rotas**
- Arquivo: `backend/routes/characters.js`
```javascript
POST   /characters              → Criar personagem
GET    /characters/:id          → Buscar personagem
PUT    /characters/:id          → Atualizar personagem
DELETE /characters/:id          → Deletar personagem
GET    /campaigns/:id/characters → Listar personagens da campanha
```

- Arquivo: `backend/routes/dice.js`
```javascript
POST   /dice/roll              → Rolar dados
GET    /dice/history/:campaignId → Histórico de rolagens
```

#### Frontend - Tarefas

**1. Criar Página de Personagem**
- `frontend/src/app/player/character/[id]/page.tsx`
- Seções:
  - **Header:** Nome, raça, classe, nível
  - **Atributos:** Grid 2x3 com modificadores calculados
  - **Combate:** HP (barra de progresso), AC, Iniciativa
  - **Inventário:** Lista de itens com drag-and-drop
  - **Anotações:** TextArea livre

**2. Criar Componente de Ficha**
- `frontend/src/components/player/CharacterSheet.tsx`
- Form editável (apenas jogador dono ou Mestre)
- Auto-save ao desfocar campo

**3. Criar Componente de Rolagem de Dados**
- `frontend/src/components/player/DiceRoller.tsx`
- Botões rápidos:
  - d4, d6, d8, d10, d12, d20, d100
  - Botão "+Modificador" (input numérico)
- Input avançado: comando livre (ex: "2d6+3")
- Animação de rolagem (número girando)
- Resultado com destaque:
  - Verde se crítico (20 natural)
  - Vermelho se falha crítica (1 natural)
  - Branco normal

**4. Criar Componente de Ações Rápidas**
- `frontend/src/components/player/QuickActions.tsx`
- Botões pré-configurados:
  - **Atacar:** Envia "Ataco com [arma]" + rola d20+modificador
  - **Defender:** Envia "Me defendo" + rola d20+DEX
  - **Investigar:** Envia "Investigo [alvo]" + rola d20+INT
  - **Persuadir:** Envia "Tento persuadir" + rola d20+CHA
- Configurável pelo jogador (salvar ações customizadas)

**5. Criar Página de Campanha do Jogador**
- `frontend/src/app/player/campaign/[id]/page.tsx`
- Layout:
  - Sidebar direita (25%): Ficha resumida + Ações rápidas
  - Área principal (75%): Chat

**6. Criar Dashboard do Jogador**
- `frontend/src/app/player/dashboard/page.tsx`
- Cards de campanhas onde participa
- Resumo de personagens ativos

**7. Integrar Dados ao Chat**
- Ao rolar dados, criar mensagem especial:
  - Tipo: `dice_roll`
  - Template: "🎲 [Nome] rolou 1d20+5 = **18** (13 + 5)"
  - Highlight no chat

#### Firestore Security Rules (Atualização)

```javascript
// Personagens
match /characters/{characterId} {
  allow read: if request.auth != null && (
    resource.data.player_uid == request.auth.uid ||
    get(/databases/$(database)/documents/campaigns/$(resource.data.campaignId)).data.master_uid == request.auth.uid
  );
  allow create: if request.auth != null &&
    request.resource.data.player_uid == request.auth.uid;
  allow update, delete: if request.auth != null && (
    resource.data.player_uid == request.auth.uid ||
    get(/databases/$(database)/documents/campaigns/$(resource.data.campaignId)).data.master_uid == request.auth.uid
  );
}
```

#### Critérios de Aceite
- [ ] Jogador pode criar personagem para campanha
- [ ] Ficha editável com cálculo automático de modificadores
- [ ] Rolagem de dados funcional (d4 a d100)
- [ ] Parser de comandos (ex: "2d6+3") funciona
- [ ] Críticos e falhas críticas detectados
- [ ] Ações rápidas enviam comando + rolagem para chat
- [ ] Histórico de rolagens visível
- [ ] Layout dual (ficha + chat) responsivo

---

### **Sprint 5: Base Cognitiva & Integração** (Semanas 19-22)

#### Objetivo
Indexar corpus de D&D no Firestore, implementar busca semântica e integrar conhecimento oficial à IA.

#### Backend - Tarefas

**1. Processar PDFs e Gerar Embeddings**
- Executar script: `backend/generate-embeddings.js`
- Para cada PDF em `backend/pdfs/`:
  - Extrair texto (pdf-parse)
  - Dividir em chunks de ~500 palavras
  - Gerar embedding para cada chunk (Gemini text-embedding-004)
  - Salvar no Firestore

**2. Criar Coleção `manual_texts`**
- Schema Firestore:
```javascript
/manual_texts/{chunkId}
{
  chunkId: string,           // UUID
  text: string,              // Conteúdo do chunk (500 palavras)
  embedding: number[],       // Vetor 768D
  source: string,            // Nome do PDF (ex: "Player_Handbook.pdf")
  page: number,              // Página original
  section: string,           // Título da seção (ex: "Combat Rules")
  keywords: string[],        // Tags (ex: ["attack", "initiative"])
  indexed_at: Timestamp
}
```

**3. Otimizar Search Service**
- Arquivo: `backend/services/searchService.js`
- Função: `semanticSearch(query, topK = 5)`
  - Gerar embedding da query
  - Buscar no Firestore (scan completo ou usar vetorização)
  - Calcular similaridade de cosseno
  - Retornar top K chunks ordenados por relevância

**4. Integrar Busca ao Chat**
- Arquivo: `backend/controllers/geminiController.js`
- Modificar `basicChat`:
  - Antes de responder, chamar `semanticSearch(message)`
  - Se relevância > 0.7, incluir chunks no contexto:
    ```
    REFERÊNCIAS OFICIAIS:
    [Chunk 1 - PHB p.194]
    [Chunk 2 - DMG p.45]
    ```
  - Instruir IA a citar fonte quando usar regra oficial

**5. Criar Controller de Busca Manual**
- Arquivo: `backend/controllers/searchController.js`
- Atualizar endpoint `/search`:
  - Retornar chunks com metadados (source, page, section)
  - Highlight de termos relevantes
  - Paginação (10 resultados por página)

**6. Criar Rotas**
```javascript
POST   /search/semantic        → Busca semântica manual
GET    /search/manual/:id      → Buscar chunk específico
POST   /admin/index-pdfs       → Re-indexar PDFs (admin)
GET    /admin/index-status     → Status da indexação
```

#### Frontend - Tarefas

**1. Criar Página de Busca de Regras**
- `frontend/src/app/rules/page.tsx`
- Input de busca semântica
- Resultados:
  - Card por chunk
  - Texto com highlight
  - Badge: fonte (PHB, DMG, MM)
  - Badge: página
  - Botão "Copiar texto"
  - Botão "Enviar para Chat"

**2. Criar Componente de Referência**
- `frontend/src/components/chat/RuleReference.tsx`
- Exibido quando IA cita regra oficial:
  - Ícone de livro
  - Tooltip com fonte completa
  - Link "Ver regra completa" → abre modal com texto

**3. Adicionar Busca ao Chat**
- `frontend/src/components/chat/ChatInput.tsx`
- Botão "Buscar Regras" ao lado do input
- Abre modal com busca rápida
- Ao selecionar resultado, insere no input

**4. Criar Modal de Busca Rápida**
- `frontend/src/components/rules/QuickSearch.tsx`
- Input com debounce (300ms)
- Resultados em tempo real
- Click para inserir no chat

**5. Criar Badge de Fonte**
- `frontend/src/components/rules/SourceBadge.tsx`
- Cores diferentes por tipo de livro:
  - PHB (azul)
  - DMG (verde)
  - MM (vermelho)
  - Custom (cinza)

#### Scripts de Indexação

**1. Script de Geração de Embeddings**
- Arquivo: `backend/scripts/index-pdfs.js`
- Funcionalidades:
  - Ler todos PDFs de `backend/pdfs/`
  - Processar em lotes (rate limiting)
  - Salvar progresso (checkpoint)
  - Logs detalhados
  - Estimativa de tempo

**2. Script de Verificação**
- Arquivo: `backend/scripts/verify-embeddings.js`
- Verificar integridade:
  - Todos chunks têm embeddings
  - Dimensão correta (768D)
  - Metadados completos

**3. Script de Atualização**
- Arquivo: `backend/scripts/update-index.js`
- Re-indexar PDFs modificados
- Deletar chunks órfãos

#### Firestore Security Rules (Atualização)

```javascript
// Manual texts (read-only para usuários)
match /manual_texts/{chunkId} {
  allow read: if request.auth != null;
  allow write: if false; // Apenas via Admin SDK
}
```

#### Critérios de Aceite
- [ ] Todos PDFs processados e indexados no Firestore
- [ ] Busca semântica retorna resultados relevantes (precisão > 80%)
- [ ] IA cita fonte quando usa regra oficial
- [ ] Página de busca de regras funcional
- [ ] Modal de busca rápida no chat
- [ ] Referências clicáveis nas mensagens da IA
- [ ] Performance: busca < 1s para 1000+ chunks

---

## 📦 Entregáveis por Sprint

| Sprint | Entregável | Status |
|--------|-----------|--------|
| **Sprint 0** | Landing Page de conversão | 🔴 Pendente |
| **Sprint 1** | Sistema de autenticação completo | 🔴 Pendente |
| **Sprint 2** | CRUD de campanhas + histórico | 🔴 Pendente |
| **Sprint 3** | Painel do Mestre funcional | 🔴 Pendente |
| **Sprint 4** | Painel do Jogador com fichas | 🔴 Pendente |
| **Sprint 5** | Base cognitiva integrada | 🔴 Pendente |

---

## 🎯 Próximos Passos Imediatos

### 1. Preparação (Hoje)
- [x] Commitar arquivos pendentes (backend completo)
- [ ] Criar branches: `feature/landing-page`, `feature/auth`, etc.
- [ ] Configurar Firestore Security Rules iniciais

### 2. Sprint 0 - Semana 1
- [ ] Criar estrutura de componentes da landing
- [ ] Implementar Hero Section
- [ ] Implementar Features Grid
- [ ] Implementar How It Works

### 3. Sprint 0 - Semana 2
- [ ] Implementar Pricing Cards
- [ ] Implementar FAQ
- [ ] Implementar CTA Section + Footer
- [ ] Configurar SEO e Analytics
- [ ] Testes de performance (Lighthouse)

### 4. Sprint 1 - Semana 1
- [ ] Implementar `userSchema.js`
- [ ] Criar `authMiddleware.js`
- [ ] Criar `authController.js`
- [ ] Criar rotas `/auth/*`
- [ ] Testar autenticação via Postman

### 5. Sprint 1 - Semanas 2-4
- [ ] Criar `AuthContext.tsx`
- [ ] Implementar páginas de login/registro
- [ ] Criar `ProtectedRoute.tsx`
- [ ] Criar Header com menu de usuário
- [ ] Criar página de perfil
- [ ] Testes de integração (Cypress)

---

## 🔧 Tecnologias e Dependências

### Backend - Novas Dependências
```json
{
  "jsonwebtoken": "^9.0.0",      // Já incluído no Firebase Admin
  "uuid": "^9.0.0",               // Geração de IDs
  "pdfkit": "^0.13.0"            // Geração de PDFs (exportação)
}
```

### Frontend - Novas Dependências
```json
{
  "@tanstack/react-query": "^5.0.0",  // Cache e estado de servidor
  "recharts": "^2.10.0",               // Gráficos de estatísticas
  "react-hook-form": "^7.49.0",        // Forms otimizados
  "zod": "^3.22.0",                    // Validação de schemas
  "date-fns": "^3.0.0",                // Manipulação de datas
  "framer-motion": "^10.0.0"           // Já incluído
}
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta | Medição |
|---------|------|---------|
| **Tempo de resposta da IA** | < 2.8s | Latency no Gemini API |
| **Precisão da busca semântica** | > 80% | Relevância dos top 5 resultados |
| **Taxa de retenção (semana 1)** | > 60% | Usuários que retornam após criar campanha |
| **Uptime do backend** | > 99% | Monitoramento (Firebase) |
| **Cobertura de testes** | > 70% | Jest coverage |

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Rate limit Gemini API | Média | Alto | Implementar cache de respostas comuns |
| Firestore custos altos | Baixa | Alto | Limitar histórico (max 1000 msgs/campanha) |
| Performance busca semântica | Média | Médio | Usar Pinecone ou Firestore Vector Search |
| Complexidade da ficha de personagem | Baixa | Baixo | Implementar versão simplificada primeiro |

---

## 📅 Timeline Resumido

```
Semana 1-2:   ██░░░░░░░░░░ Landing Page
Semana 3-6:   ░░████░░░░░░ Autenticação & Usuários
Semana 7-10:  ░░░░░░████░░ Campanhas & Sessões
Semana 11-14: ░░░░░░░░████ Painel do Mestre
Semana 15-18: ░░░░░░░░░░██ Painel do Jogador
Semana 19-22: ░░░░░░░░░░░█ Base Cognitiva
```

**Total:** 22 semanas (~5.5 meses)

---

**Última atualização:** 2025-10-18
**Próxima revisão:** Após conclusão do Sprint 1
