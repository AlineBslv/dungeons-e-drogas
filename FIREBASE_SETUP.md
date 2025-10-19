# 🔥 Firebase Setup - Dungeons e Drogas

Guia passo a passo para configurar e fazer deploy das regras do Firebase.

## ✅ Pré-requisitos

- [x] Firebase CLI instalado (v14.20.0)
- [ ] Login no Firebase CLI
- [ ] Projeto Firebase criado

## 📝 Passos para Configuração

### 1. Login no Firebase CLI

Abra um terminal **novo** e execute:

```bash
firebase login
```

Isso abrirá uma janela do navegador para você fazer login com sua conta Google.

### 2. Verificar projeto configurado

```bash
firebase projects:list
```

Você deve ver o projeto `dungeons-e-drogas` listado.

### 3. Fazer Deploy das Regras de Segurança

#### Opção A: Deploy de tudo (Recomendado na primeira vez)

```bash
cd "c:\Users\aline\OneDrive\Área de Trabalho\Repositório\Dungeons and Drogas"
firebase deploy
```

#### Opção B: Deploy apenas das regras

```bash
# Apenas Firestore
firebase deploy --only firestore:rules

# Apenas Storage
firebase deploy --only storage:rules

# Firestore + Storage
firebase deploy --only firestore:rules,storage:rules

# Incluir indexes do Firestore
firebase deploy --only firestore
```

### 4. Verificar Deploy

Após o deploy, você verá algo como:

```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/dungeons-e-drogas/overview
```

Acesse o console para verificar:
- **Firestore Database → Rules** - Verifique se as regras foram aplicadas
- **Storage → Rules** - Verifique se as regras foram aplicadas

## 🧪 Testar Regras Localmente (Emuladores)

### Iniciar emuladores

```bash
firebase emulators:start
```

Isso iniciará:
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Storage Emulator: http://localhost:9199
- Emulator UI: http://localhost:4000

### Configurar frontend para usar emuladores

Adicione no arquivo `.env.local`:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

E atualize `src/lib/firebase.ts`:

```typescript
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';

// Depois de inicializar os serviços
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

## 📋 Arquivos de Configuração Criados

- ✅ **firebase.json** - Configuração principal do Firebase
- ✅ **.firebaserc** - Projeto padrão (dungeons-e-drogas)
- ✅ **firestore.rules** - Regras de segurança do Firestore
- ✅ **firestore.indexes.json** - Índices compostos do Firestore
- ✅ **storage.rules** - Regras de segurança do Storage

## 🎯 Comandos Úteis

### Deploy

```bash
# Deploy completo
firebase deploy

# Deploy apenas de regras
firebase deploy --only firestore:rules,storage:rules

# Deploy de hosting (frontend)
firebase deploy --only hosting

# Deploy de functions (backend)
firebase deploy --only functions
```

### Desenvolvimento

```bash
# Iniciar emuladores
firebase emulators:start

# Iniciar emuladores com seed data
firebase emulators:start --import=./firebase-data

# Exportar dados dos emuladores
firebase emulators:export ./firebase-data
```

### Debug

```bash
# Ver logs das Functions
firebase functions:log

# Ver logs do Firestore
firebase firestore:indexes

# Testar regras de segurança
firebase emulators:exec --only firestore "npm test"
```

## 🔒 Segurança

### Firestore Rules aplicadas:

- ✅ Users só podem ler/editar seus próprios dados
- ✅ Mestres podem criar campanhas
- ✅ Jogadores só veem campanhas que participam
- ✅ Mensagens são imutáveis (apenas criação e leitura)
- ✅ Apenas mestres podem editar contextos
- ✅ Base cognitiva D&D: mestres gerenciam, todos leem

### Storage Rules aplicadas:

- ✅ PDFs D&D: apenas mestres fazem upload
- ✅ Assets de campanha: apenas mestres da campanha
- ✅ Retratos de personagens: públicos (autenticados)
- ✅ Uploads pessoais: apenas o dono
- ✅ Limite de 50MB por arquivo

## ⚠️ Troubleshooting

### Erro: "Not logged in"

```bash
firebase login --reauth
```

### Erro: "Permission denied"

Verifique se você é owner do projeto no Firebase Console.

### Erro: "Index not found"

```bash
firebase deploy --only firestore:indexes
```

Aguarde alguns minutos para os índices serem criados.

## 📚 Documentação

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Esquema do Firestore](./docs/FIRESTORE_SCHEMA.md)

## 🚀 Próximos Passos

Após configurar o Firebase:

1. [ ] Testar login/registro no frontend
2. [ ] Criar primeira campanha
3. [ ] Enviar primeiras mensagens
4. [ ] Implementar chat com Gemini API
5. [ ] Adicionar base cognitiva D&D

---

**Status:** 🟡 Aguardando `firebase login` manual
