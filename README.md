# 🔥 Dungeons e Drogas

Sistema Narrativo Interativo de RPG com IA - **Mestre Drogon**

## 📋 Sobre o Projeto

**Dungeons e Drogas** é um sistema de RPG narrativo onde Mestres e Jogadores interagem através de uma IA narradora chamada **Mestre Drogon**, criando histórias dinâmicas, imersivas e cooperativas dentro de uma interface inspirada em grimórios medievais sombrios.

## 🏗️ Estrutura do Projeto

```
dungeons-e-drogas/
├── frontend/          # Next.js 14 (App Router + TypeScript + Tailwind)
├── backend/           # Node.js + Express + Firebase Admin
├── firebase/          # Configurações Firebase (futuro)
├── CLAUDE.md          # Documentação técnica completa
└── README.md          # Este arquivo
```

## ⚙️ Tecnologias

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase SDK (Auth + Firestore)
- Axios

**Backend:**
- Node.js
- Express
- Firebase Admin SDK
- Gemini API (IA)
- CORS

**Infraestrutura:**
- Firebase (Firestore + Auth + Storage)
- Vercel/Firebase Hosting

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js ≥ 18.x
- npm ≥ 9.x
- Conta no Firebase
- Chave da API Gemini (opcional, para IA)

### 1. Clonar o repositório

```bash
git clone <url-do-repositório>
cd dungeons-e-drogas
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` com:

```env
PORT=4000
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
# GEMINI_API_KEY=your_key_here
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crie o arquivo `.env.local` com:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative **Firestore Database** (modo teste)
4. Ative **Authentication** (Email/Password)
5. Copie as credenciais para `.env.local`
6. Baixe o **Service Account Key** e adicione ao `.env` do backend

## 🎮 Como Rodar

### Backend

```bash
cd backend
npm run dev
```

O servidor estará em: http://localhost:4000

### Frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

O app estará em: http://localhost:3000

## 📦 Scripts Disponíveis

### Backend
- `npm start` - Rodar em produção
- `npm run dev` - Rodar com nodemon (desenvolvimento)

### Frontend
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Rodar build de produção

## 🧪 Testar Conexão

Acesse http://localhost:3000 - você verá o status de todos os serviços:

- ✅ Frontend (Next.js) - deve estar online
- ✅ Backend (Express) - deve responder "pong"
- ⚙️ Firebase - configurar credenciais
- ⚙️ Gemini API - adicionar chave posteriormente

## 📚 Documentação Completa

Consulte [CLAUDE.md](./CLAUDE.md) para:
- Visão do produto
- Arquitetura detalhada
- Modelos de dados
- Roadmap completo
- Metodologia de desenvolvimento

## 🎯 Próximos Passos

1. ✅ Ambiente configurado
2. ⚙️ Configurar Firebase
3. ⚙️ Obter chave Gemini API
4. 🚧 Implementar autenticação
5. 🚧 Desenvolver chat com IA
6. 🚧 Criar painel do Mestre
7. 🚧 Criar painel do Jogador

## 🤝 Contribuindo

Este é um projeto em desenvolvimento ativo. Consulte o roadmap em [CLAUDE.md](./CLAUDE.md) para ver o progresso.

## 📄 Licença

Em definição.

---

🔥 **Dungeons e Drogas** - Onde a narrativa encontra a magia da IA 🎲
