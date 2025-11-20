# <? Git Flow - Dungeons e Drogas

## =Ë Visão Geral

Este documento define as convenções de versionamento e fluxo de trabalho Git para o projeto **Dungeons e Drogas**.

---

## <3 Estrutura de Branches

### **Branches Principais**

| Branch | Propósito | Proteção | Deploy |
|--------|-----------|----------|--------|
| `main` | Código em produção, sempre estável |  Protegida | =€ Produção |
| `develop` | Desenvolvimento ativo, base para features |   Recomendada | >ê Staging |

### **Branches Temporárias**

| Tipo | Prefixo | Criada de | Merge para | Exemplo |
|------|---------|-----------|------------|---------|
| **Feature** | `feature/` | `develop` | `develop` | `feature/chat-ia` |
| **Bugfix** | `fix/` | `develop` | `develop` | `fix/erro-firebase` |
| **Hotfix** | `hotfix/` | `main` | `main` + `develop` | `hotfix/crash-login` |
| **Release** | `release/` | `develop` | `main` + `develop` | `release/v1.0.0` |
| **Infra** | `infra/` | `develop` | `develop` | `infra/ci-cd-setup` |
| **Teste** | `test/` | `develop` | `develop` | `test/integracao-api` |

---

## =€ Fluxo de Trabalho

### **1ã Desenvolvimento de Feature**

```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar branch de feature
git checkout -b feature/nome-da-feature

# 3. Trabalhar na feature
# ... código ...

# 4. Commitar mudanças
git add .
git commit -m "( Adiciona funcionalidade X"

# 5. Enviar para o GitHub
git push -u origin feature/nome-da-feature

# 6. Criar Pull Request no GitHub
# Base: develop  Compare: feature/nome-da-feature

# 7. Após aprovação e merge, deletar branch
git checkout develop
git pull origin develop
git branch -d feature/nome-da-feature
git push origin --delete feature/nome-da-feature
```

---

### **2ã Correção de Bug (Bugfix)**

```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar branch de bugfix
git checkout -b fix/nome-do-bug

# 3. Corrigir o bug
# ... código ...

# 4. Commitar correção
git add .
git commit -m "= Corrige erro no sistema X"

# 5. Push e criar PR
git push -u origin fix/nome-do-bug
# PR: develop  fix/nome-do-bug
```

---

### **3ã Hotfix (Correção Urgente em Produção)**

```bash
# 1. Criar branch a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/descricao-urgente

# 2. Corrigir o problema
# ... código ...

# 3. Commitar
git add .
git commit -m "=‘ Hotfix: corrige crash crítico no login"

# 4. Push
git push -u origin hotfix/descricao-urgente

# 5. Criar PRs para main E develop
# PR 1: main  hotfix/descricao-urgente
# PR 2: develop  hotfix/descricao-urgente

# 6. Após merge, deletar branch
git branch -d hotfix/descricao-urgente
git push origin --delete hotfix/descricao-urgente
```

---

### **4ã Release (Preparação para Produção)**

```bash
# 1. Criar branch de release
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Ajustes finais (versões, changelogs, etc)
# ... ajustes ...

# 3. Commitar
git add .
git commit -m "= Prepara release v1.0.0"

# 4. Push
git push -u origin release/v1.0.0

# 5. Criar PRs
# PR 1: main  release/v1.0.0
# PR 2: develop  release/v1.0.0

# 6. Após merge em main, criar tag
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 7. Deletar branch
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

---

## =İ Convenções de Commit

### **Formato Padrão**

```
<emoji> <tipo>: <descrição curta>

[corpo opcional com detalhes]

[rodapé opcional com issues relacionadas]
```

### **Tipos de Commit**

| Emoji | Tipo | Quando usar | Exemplo |
|-------|------|-------------|---------|
| ( | `feat` | Nova funcionalidade | `( Adiciona sistema de rolagem de dados` |
| = | `fix` | Correção de bug | `= Corrige erro ao salvar campanha` |
| =İ | `docs` | Documentação | `=İ Atualiza README com instruções` |
| =„ | `style` | UI/CSS (não altera lógica) | `=„ Ajusta espaçamento do chat` |
| { | `refactor` | Refatoração de código | `{ Refatora lógica de autenticação` |
| ¡ | `perf` | Melhoria de performance | `¡ Otimiza carregamento de campanhas` |
|  | `test` | Testes | ` Adiciona testes para API do Gemini` |
| =' | `chore` | Configuração/manutenção | `=' Atualiza dependências do projeto` |
| =‘ | `hotfix` | Correção urgente | `=‘ Corrige crash no login` |
| = | `release` | Nova versão | `= Release v1.0.0` |
| =% | `remove` | Remoção de código/arquivos | `=% Remove código legado do chat` |
| =§ | `wip` | Trabalho em progresso | `=§ WIP: implementa painel do jogador` |

### **Exemplos de Bons Commits**

```bash
( Adiciona integração com Gemini API para chat IA

= Corrige erro ao criar nova campanha sem descrição

=İ Documenta fluxo de autenticação no README

{ Refatora componente de mensagens do chat

¡ Otimiza consulta ao Firestore para campanhas

 Adiciona testes E2E para fluxo de login

=' Configura ESLint e Prettier no projeto
```

---

## = Proteções de Branch

### **Branch `main`**

 Configurações recomendadas no GitHub:

- **Require a pull request before merging**
- **Require approvals** (mínimo 1 review)
- **Require status checks to pass before merging**
- **Require branches to be up to date before merging**
- **Do not allow bypassing the above settings**
- **Include administrators** (opcional)

### **Branch `develop`**

  Configurações opcionais:

- **Require a pull request before merging** (recomendado)
- Permite commits diretos em casos de urgência (não recomendado)

---

## <÷ Versionamento Semântico

Seguimos o padrão [Semantic Versioning](https://semver.org/):

```
v<MAJOR>.<MINOR>.<PATCH>

Exemplo: v1.2.3
```

| Incremento | Quando usar | Exemplo |
|------------|-------------|---------|
| **MAJOR** | Mudanças incompatíveis (breaking changes) | `v1.0.0` ’ `v2.0.0` |
| **MINOR** | Novas funcionalidades (compatíveis) | `v1.0.0` ’ `v1.1.0` |
| **PATCH** | Correções de bugs | `v1.0.0` ’ `v1.0.1` |

### **Tags de Versão**

```bash
# Criar tag anotada
git tag -a v1.0.0 -m "Release v1.0.0 - MVP do Módulo Mestre"

# Enviar tag para o GitHub
git push origin v1.0.0

# Listar tags
git tag -l

# Deletar tag local
git tag -d v1.0.0

# Deletar tag remota
git push origin --delete v1.0.0
```

---

## =Ë Checklist de Pull Request

Antes de criar um PR, verifique:

- [ ] Código testado localmente
- [ ] Sem conflitos com a branch base
- [ ] Commit messages seguem o padrão
- [ ] Código revisado (self-review)
- [ ] Documentação atualizada (se necessário)
- [ ] Testes adicionados/atualizados (se aplicável)
- [ ] Build passa sem erros
- [ ] Variáveis sensíveis não commitadas (.env)

### **Template de PR**

```markdown
## =İ Descrição

Breve descrição das mudanças

## <¯ Tipo de mudança

- [ ] ( Nova feature
- [ ] = Bugfix
- [ ] =İ Documentação
- [ ] { Refatoração
- [ ] ¡ Performance

## >ê Como testar

1. Passo 1
2. Passo 2
3. Resultado esperado

## =ø Screenshots (se aplicável)

[Adicionar imagens]

##  Checklist

- [ ] Código testado
- [ ] Sem conflitos
- [ ] Documentação atualizada
- [ ] Build passa
```

---

## =¨ Regras Importantes

### **L NÃO FAZER**

- L Commitar diretamente na `main`
- L Commitar arquivos `.env` ou credenciais
- L Fazer force push em branches compartilhadas
- L Usar commits genéricos (`fix`, `update`, `changes`)
- L Misturar múltiplas funcionalidades em um único commit
- L Deixar branches antigas sem deletar após merge

### ** BOAS PRÁTICAS**

-  Commitar frequentemente com mensagens claras
-  Manter branches atualizadas com a base (`develop` ou `main`)
-  Fazer rebase quando necessário
-  Revisar código antes de criar PR
-  Responder feedbacks de code review
-  Deletar branches após merge
-  Usar `.gitignore` adequadamente

---

## =' Comandos Úteis

### **Atualizar branch local com mudanças remotas**

```bash
git pull origin develop
```

### **Sincronizar fork com repositório original**

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
```

### **Desfazer último commit (mantendo mudanças)**

```bash
git reset --soft HEAD~1
```

### **Desfazer mudanças não commitadas**

```bash
git checkout -- .
```

### **Ver histórico de commits**

```bash
git log --oneline --graph --all --decorate
```

### **Ver diferenças entre branches**

```bash
git diff develop..feature/nome-da-feature
```

### **Rebase interativo (organizar commits)**

```bash
git rebase -i HEAD~3
```

---

## <˜ Resolução de Problemas

### **Conflitos de Merge**

```bash
# 1. Atualizar branch base
git checkout develop
git pull origin develop

# 2. Voltar para sua branch
git checkout feature/sua-feature

# 3. Fazer rebase ou merge
git rebase develop
# ou
git merge develop

# 4. Resolver conflitos manualmente nos arquivos
# 5. Adicionar arquivos resolvidos
git add .

# 6. Continuar rebase
git rebase --continue
# ou commitar merge
git commit

# 7. Fazer push (pode precisar de force se fez rebase)
git push origin feature/sua-feature --force-with-lease
```

### **Reverter commit público**

```bash
# Criar commit que reverte mudanças
git revert <commit-hash>
git push origin <branch>
```

### **Limpar branches deletadas remotamente**

```bash
git fetch --prune
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -d
```

---

## =Ú Recursos Adicionais

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

## > Contribuindo

Se tiver dúvidas sobre o fluxo Git ou sugestões de melhoria, abra uma issue ou entre em contato com o time.

---

**=% Dungeons e Drogas** - Versionamento com a disciplina de um Mestre <²
