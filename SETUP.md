# ⚡ Guia Rápido de Setup - Dungeons e Drogas

## 🎯 Comandos Essenciais

### Rodar o Projeto (Desenvolvimento)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Acesse: http://localhost:3000

---

## 📝 Checklist de Configuração

### ✅ Já Configurado
- [x] Frontend Next.js criado
- [x] Backend Express configurado
- [x] Estrutura de pastas criada
- [x] Dependências instaladas
- [x] Arquivos `.env` template criados
- [x] Sistema de API (axios) configurado
- [x] Página de teste criada

### ⚙️ Falta Configurar

#### 1. Firebase (obrigatório)
- [ ] Criar projeto no [Firebase Console](https://console.firebase.google.com/)
- [ ] Ativar Firestore Database
- [ ] Ativar Authentication (Email/Password)
- [ ] Copiar credenciais Web App para `frontend/.env.local`
- [ ] Baixar Service Account Key para `backend/.env`

#### 2. Gemini API (para IA)
- [ ] Obter chave em [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Adicionar em `backend/.env`: `GEMINI_API_KEY=sua_chave`

---

## 🔑 Variáveis de Ambiente

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### `backend/.env`
```env
PORT=4000
# FIREBASE_SERVICE_ACCOUNT=
# GEMINI_API_KEY=
```

---

## 🐛 Troubleshooting

### Backend não conecta
- Verifique se está rodando na porta 4000
- Confirme que o `.env` existe em `backend/`

### Frontend não carrega
- Certifique-se que rodou `npm install` na pasta `frontend/`
- Verifique se a porta 3000 está livre

### Erro de CORS
- Confirme que o backend está com `cors()` habilitado
- Verifique o `NEXT_PUBLIC_API_URL` no `.env.local`

### Firebase não inicializa
- Confirme que todas as variáveis `NEXT_PUBLIC_FIREBASE_*` estão preenchidas
- Verifique se o projeto Firebase está ativo

---

## 📁 Estrutura de Arquivos Importantes

```
dungeons-e-drogas/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx          # Página principal
│   │   ├── firebase/
│   │   │   └── config.ts         # Config Firebase
│   │   └── utils/
│   │       └── api.ts            # Cliente API
│   └── .env.local                # Variáveis de ambiente
│
├── backend/
│   ├── index.js                  # Servidor Express
│   ├── firebaseAdmin.js          # Firebase Admin
│   └── .env                      # Variáveis de ambiente
│
├── CLAUDE.md                     # Doc técnica completa
├── README.md                     # Documentação principal
└── SETUP.md                      # Este arquivo
```

---

## 🚀 Próximos Passos de Desenvolvimento

1. **Configurar Firebase** (URGENTE)
2. **Implementar autenticação**
   - Login/Cadastro
   - Proteção de rotas
3. **Criar interface de chat**
   - Componente de mensagens
   - Input de texto
4. **Integrar Gemini API**
   - Endpoint para IA
   - Sistema de contexto
5. **Desenvolver painéis**
   - Painel do Mestre
   - Painel do Jogador

---

## 📚 Links Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express.js](https://expressjs.com/)
- [Gemini API](https://ai.google.dev/docs)

---

**Dúvidas?** Consulte o [CLAUDE.md](./CLAUDE.md) para documentação completa.
