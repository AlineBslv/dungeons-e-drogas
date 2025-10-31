# Guia de Teste - Integração Personagem & Chat

## 🧪 Objetivo

Testar a integração completa entre fichas de personagens e chat da campanha, validando:
- Envio de ações (ataques, magias, perícias)
- Renderização de cards no chat
- Consumo de recursos (slots de magia)
- Sincronização em tempo real

---

## 📋 Pré-requisitos

### 1. Backend rodando
```bash
cd backend
npm run dev
# Deve estar rodando na porta 4000
```

### 2. Frontend rodando
```bash
cd frontend
npm run dev
# Deve estar rodando na porta 3000
```

### 3. Firebase configurado
- Firestore ativo
- Autenticação configurada
- Regras de segurança aplicadas

### 4. Dados de teste
- Pelo menos 1 usuário registrado
- Pelo menos 1 campanha criada
- Pelo menos 1 personagem criado

---

## 🚀 Teste 1: Componente de Teste Isolado

### Passo 1: Criar página de teste

Crie o arquivo `frontend/src/app/test-character-actions/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { CharacterActionsTestPanel } from '@/components/character/CharacterActionsTestPanel';
import type { CharacterSheet } from '@/lib/firestore-helpers';
import { getPlayerCharacterSheets } from '@/lib/firestore-helpers';
import { useAuth } from '@/contexts/AuthContext';

export default function TestCharacterActionsPage() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<(CharacterSheet & { id: string })[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterSheet & { id: string } | null>(null);
  const [campaignId, setCampaignId] = useState('');

  useEffect(() => {
    if (user) {
      loadCharacters();
    }
  }, [user]);

  const loadCharacters = async () => {
    try {
      const chars = await getPlayerCharacterSheets(user!.uid);
      setCharacters(chars);
      if (chars.length > 0) {
        setSelectedCharacter(chars[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar personagens:', error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <p>Faça login para testar</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-medieval text-gold-500 mb-2">
          🧪 Teste de Integração - Personagem & Chat
        </h1>
        <p className="text-text-secondary">
          Teste o envio de ações de personagem ao chat
        </p>
      </div>

      {/* Seleção de personagem */}
      <div className="bg-dark-500 rounded-lg p-4 space-y-3">
        <label className="text-sm font-semibold text-gold-500">
          Selecionar Personagem:
        </label>
        <select
          value={selectedCharacter?.id || ''}
          onChange={(e) => {
            const char = characters.find((c) => c.id === e.target.value);
            setSelectedCharacter(char || null);
          }}
          className="w-full p-2 bg-background border border-border rounded-md"
        >
          <option value="">Selecione um personagem</option>
          {characters.map((char) => (
            <option key={char.id} value={char.id}>
              {char.name} - {char.class} Nv {char.level}
            </option>
          ))}
        </select>

        <label className="text-sm font-semibold text-gold-500 block mt-4">
          Campaign ID:
        </label>
        <input
          type="text"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          placeholder="Cole o ID da campanha aqui"
          className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm"
        />
      </div>

      {/* Painel de teste */}
      {selectedCharacter && campaignId && (
        <CharacterActionsTestPanel
          character={selectedCharacter}
          campaignId={campaignId}
        />
      )}

      {!selectedCharacter && (
        <div className="text-center text-text-secondary py-8">
          Selecione um personagem para começar
        </div>
      )}

      {selectedCharacter && !campaignId && (
        <div className="text-center text-text-secondary py-8">
          Insira o ID da campanha para começar
        </div>
      )}
    </div>
  );
}
```

### Passo 2: Acessar a página de teste

1. Acesse `http://localhost:3000/test-character-actions`
2. Faça login com um usuário que tenha personagens
3. Selecione um personagem no dropdown
4. Cole o ID de uma campanha existente
5. Clique nos botões de teste

### Passo 3: Verificar no chat

1. Em outra aba, abra o chat da campanha: `/campaigns/{campaignId}`
2. Verifique se os cards de ação aparecem
3. Confirme que as rolagens estão corretas
4. Verifique animações e estilos

### ✅ Critérios de Sucesso
- [ ] Botões de teste funcionam sem erros
- [ ] Cards aparecem no chat em tempo real
- [ ] Rolagens mostram valores corretos
- [ ] Animações funcionam suavemente
- [ ] Toast notifications aparecem

---

## 🎯 Teste 2: Ataque com Arma

### Cenário
Jogador ataca com sua arma equipada

### Passos
1. Acesse a ficha de um personagem com arma equipada
2. Adicione botão de ataque próximo à arma:
```tsx
<AttackQuickActions
  character={character}
  campaignId={campaignId}
  weaponName="Espada Longa"
  attackCommand="1d20+5"
  damageCommand="1d8+3"
/>
```
3. Clique no botão de ataque
4. Verifique o chat

### ✅ Resultado Esperado
```
┌──────────────────────────────────┐
│ ⚔️ [Nome] ataca com Espada Longa │
│ Guerreiro                         │
│                                   │
│ Ataque: [Resultado] (1d20+5)    │
│   [dado] +5                      │
│                                   │
│ Dano: [Resultado] (1d8+3)        │
│   [dado] +3                      │
└──────────────────────────────────┘
```

### ✅ Validações
- [ ] Ataque rola 1d20 + modificador
- [ ] Dano rola dado correto + modificador
- [ ] Card mostra nome do personagem e arma
- [ ] Crítico (20) mostra badge especial
- [ ] Falha (1) mostra badge de falha crítica

---

## ✨ Teste 3: Lançar Magia

### Cenário
Conjurador lança uma magia que consome slot

### Passos
1. Crie um personagem conjurador (Mago, Clérigo, etc.)
2. Configure magias conhecidas e slots disponíveis
3. Use `SpellBookWithChat`:
```tsx
<SpellBookWithChat
  character={character}
  campaignId={campaignId}
  allSpells={ALL_SPELLS}
/>
```
4. Selecione uma magia de nível > 0
5. Clique em "Conjurar"
6. Verifique o chat e os slots

### ✅ Resultado Esperado
```
┌──────────────────────────────────────┐
│ 🔥 [Nome] lança Bola de Fogo        │
│ Mago                                 │
│                                      │
│ Nível da Magia: 3                   │
│ CD de Resistência: DEX CD 15        │
│                                      │
│ Dano: 28 (8d6) fogo                 │
│   [5, 3, 6, 2, 4, 3, 3, 2]         │
│                                      │
│ Slots restantes: ⚪⚪⚫⚫ (2/4)      │
└──────────────────────────────────────┘
```

### ✅ Validações
- [ ] Magia só é lançada se houver slots
- [ ] Slot é consumido após lançar
- [ ] Toast mostra slots restantes
- [ ] Truques não consomem slots
- [ ] Dano é rolado corretamente
- [ ] CD de resistência é exibida

---

## 🎯 Teste 4: Teste de Perícia

### Cenário
Jogador testa uma perícia proficiente

### Passos
1. Use `SkillQuickActions`:
```tsx
<SkillQuickActions
  character={character}
  campaignId={campaignId}
  skillName="Furtividade"
  command="1d20+7"
  isProficient={true}
  isExpertise={false}
/>
```
2. Clique no botão
3. Verifique o chat

### ✅ Resultado Esperado
```
┌──────────────────────────────┐
│ 🎯 [Nome] testa Furtividade │
│ Ladino                        │
│                               │
│ Resultado: 19 (1d20+7)       │
│                               │
│ ✓ Proficiente                │
└──────────────────────────────┘
```

### ✅ Validações
- [ ] Badge "Proficiente" aparece se isProficient=true
- [ ] Badge "Especializado" aparece se isExpertise=true
- [ ] Modificador correto é aplicado
- [ ] Rolagem usa 1d20

---

## 🛡️ Teste 5: Teste de Resistência

### Cenário
Jogador faz teste de resistência

### Passos
1. Use `SavingThrowQuickActions`:
```tsx
<SavingThrowQuickActions
  character={character}
  campaignId={campaignId}
  saveName="Destreza"
  command="1d20+5"
  isProficient={true}
/>
```
2. Clique no botão
3. Verifique o chat

### ✅ Resultado Esperado
```
┌──────────────────────────────┐
│ 🛡️ [Nome] - TR de Destreza   │
│ Ladino                        │
│                               │
│ Resultado: 17 (1d20+5)       │
│                               │
│ ✓ Proficiente                │
└──────────────────────────────┘
```

---

## 🔄 Teste 6: Sincronização em Tempo Real

### Cenário
Múltiplos jogadores enviando ações simultaneamente

### Passos
1. Abra 2 navegadores/abas diferentes
2. Logue com usuários diferentes
3. Abra o mesmo chat da campanha
4. Envie ações de ambos os usuários
5. Verifique se ambos veem as ações em tempo real

### ✅ Validações
- [ ] Ações aparecem instantaneamente para todos
- [ ] Ordem cronológica é mantida
- [ ] Nenhuma ação é perdida
- [ ] WebSocket está conectado (verificar console)

---

## 🐛 Testes de Erro

### Teste 7.1: Sem slots de magia
1. Tente lançar magia sem slots disponíveis
2. **Esperado:** Toast de erro "Sem espaços de magia..."

### Teste 7.2: CampaignId inválido
1. Use um campaignId que não existe
2. **Esperado:** Erro no console, toast de erro

### Teste 7.3: Personagem sem magias
1. Tente usar SpellBookWithChat em personagem sem spells
2. **Esperado:** Mensagem "Sem Habilidade de Conjuração"

### Teste 7.4: Conexão offline
1. Desconecte da internet
2. Tente enviar ação
3. **Esperado:** Toast de erro de conexão

---

## 📊 Checklist Final de Validação

### Funcionalidade
- [ ] Todos os tipos de ação funcionam (ataque, magia, perícia, resistência, atributo)
- [ ] Rolagens de dados são corretas
- [ ] Modificadores são aplicados corretamente
- [ ] Recursos (slots) são consumidos

### UI/UX
- [ ] Cards são visualmente distintos por tipo
- [ ] Animações são suaves
- [ ] Toast notifications são claras
- [ ] Cores seguem o tema dark medieval
- [ ] Responsivo em mobile

### Performance
- [ ] Latência < 500ms para enviar ação
- [ ] Chat atualiza em < 100ms
- [ ] Sem lag ou travamentos
- [ ] Memória não vaza (verificar DevTools)

### Segurança
- [ ] Apenas owner do personagem pode usar ações
- [ ] Firestore rules impedem escrita não autorizada
- [ ] Dados sensíveis não são expostos no frontend

---

## 🚨 Problemas Comuns e Soluções

### Problema: "character.id is undefined"
**Solução:** Certifique-se de passar `CharacterSheet & { id: string }`

### Problema: Ações não aparecem no chat
**Solução:**
1. Verifique se campaignId está correto
2. Confirme que Firestore está configurado
3. Verifique console do navegador para erros

### Problema: Slots não são consumidos
**Solução:** Verifique se `updateCharacterSheet` está sendo chamado

### Problema: WebSocket não conecta
**Solução:**
1. Backend rodando na porta 4000?
2. CORS configurado corretamente?
3. Variável `NEXT_PUBLIC_BACKEND_URL` definida?

---

## 📸 Capturas de Tela Esperadas

### 1. Ataque com Espada
![Card de ataque com rolagens visíveis]

### 2. Magia com Dano
![Card de magia mostrando dano e CD]

### 3. Teste de Perícia
![Card de perícia com badge de proficiência]

### 4. Crítico!
![Card com destaque amarelo e "CRÍTICO!"]

---

## ✅ Conclusão do Teste

Se todos os testes passaram, a integração está funcionando corretamente!

**Próximos passos:**
1. Integrar botões na ficha completa do personagem
2. Adicionar mais tipos de ações (reações, ações bônus)
3. Implementar histórico de ações
4. Adicionar suporte para vantagem/desvantagem

---

**Última atualização:** 30/10/2025
**Testado por:** [Seu nome]
**Status:** ✅ Todos os testes passaram
