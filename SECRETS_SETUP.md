# = Configuração de Secrets - GitHub Actions

## =Ë Guia Passo a Passo

### **1ã Acessar Página de Secrets**

=I https://github.com/AlineBslv/dungeons-e-drogas/settings/secrets/actions

---

## = Secrets a Adicionar

Clique em **"New repository secret"** para cada um dos itens abaixo:

### **Secret 1: NEXT_PUBLIC_API_URL**
- **Name:** `NEXT_PUBLIC_API_URL`
- **Value:** `http://localhost:4000`
- 9 _Será atualizado depois com a URL do Firebase Functions_

---

### **Secret 2: NEXT_PUBLIC_FIREBASE_API_KEY**
- **Name:** `NEXT_PUBLIC_FIREBASE_API_KEY`
- **Value:** `AIzaSyCFbeGLrlAQ2NftzkbIRgBF4ZAWogl9E9o`

---

### **Secret 3: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
- **Name:** `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- **Value:** `dungeons-e-drogas.firebaseapp.com`

---

### **Secret 4: NEXT_PUBLIC_FIREBASE_PROJECT_ID**
- **Name:** `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- **Value:** `dungeons-e-drogas`

---

### **Secret 5: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
- **Name:** `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- **Value:** `dungeons-e-drogas.firebasestorage.app`

---

### **Secret 6: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
- **Name:** `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- **Value:** `666663846015`

---

### **Secret 7: NEXT_PUBLIC_FIREBASE_APP_ID**
- **Name:** `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Value:** `1:666663846015:web:47d53f675333f15bab3f4a`

---

### **Secret 8: FIREBASE_TOKEN**  

**Opção A: Gerar Token via CLI (Recomendado)**

1. Abra o **PowerShell** ou **CMD** no Windows
2. Execute:
   ```bash
   firebase login:ci
   ```
3. Isso abrirá o navegador para autenticação
4. Após login, um token será exibido no terminal
5. Copie o token completo

**Então:**
- **Name:** `FIREBASE_TOKEN`
- **Value:** `[cole o token gerado]`

---

**Opção B: Usar Service Account JSON**

1. Acesse: https://console.firebase.google.com/project/dungeons-e-drogas/settings/serviceaccounts/adminsdk
2. Clique em **"Generate new private key"**
3. Baixe o arquivo JSON
4. Abra o arquivo e copie TODO o conteúdo
5. No GitHub:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** `[cole todo o JSON]`

  **Importante:** Se usar a Opção B, será necessário ajustar o workflow do GitHub Actions.

---

##  Checklist de Verificação

Após adicionar todos os secrets, verifique:

- [ ] 8 secrets adicionados no total
- [ ] Nenhum secret com espaços ou quebras de linha extras
- [ ] `FIREBASE_TOKEN` gerado e adicionado (Opção A)
- [ ] Ou `FIREBASE_SERVICE_ACCOUNT` adicionado (Opção B)

---

## >ê Testar Configuração

Após adicionar os secrets:

1. Faça um push para a branch `develop`:
   ```bash
   git push origin develop
   ```

2. Verifique o workflow:
   =I https://github.com/AlineBslv/dungeons-e-drogas/actions

3. O workflow **CI - Build and Test** deve passar 

---

## =¨ Troubleshooting

### Erro: "Secret not found"
- Verifique se digitou o nome exatamente como indicado
- Secrets são case-sensitive

### Erro: "Invalid Firebase token"
- Regere o token: `firebase login:ci`
- Substitua o secret no GitHub

### Build falha mesmo com secrets
- Verifique logs no GitHub Actions
- Confirme que todos os 8 secrets foram adicionados

---

## =Ý Próximos Passos

Após configurar os secrets:

1.  Workflows automáticos funcionarão
2.  CI validará builds automaticamente
3.  Deploy para Firebase estará pronto
4. =€ Configure Vercel para frontend (próximo passo)

---

**  IMPORTANTE - SEGURANÇA:**

- L **NUNCA** comite este arquivo com os valores reais
- L **NUNCA** compartilhe o `FIREBASE_TOKEN` publicamente
- L **NUNCA** adicione secrets em `.env` no repositório
-  Secrets devem estar APENAS no GitHub Actions
-  Use `.env.local` para desenvolvimento local (já está no `.gitignore`)

---

**=% Dungeons e Drogas** - Segurança em primeiro lugar <²
