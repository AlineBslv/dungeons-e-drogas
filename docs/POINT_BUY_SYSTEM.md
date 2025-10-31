# Sistema de Distribuição de Pontos por Nível (Point Buy)

## Visão Geral

O sistema de Point Buy foi implementado seguindo as regras oficiais do D&D 5e, incluindo os **Ability Score Improvements (ASI)** que os personagens recebem conforme sobem de nível.

## Como Funciona

### Nível 1-3: Base (27 pontos)
- Todos os atributos começam em **8**
- Jogador tem **27 pontos** para distribuir
- Atributos podem ir de **8 a 15** (antes de bônus raciais)

### Tabela de Custos

| Valor do Atributo | Custo em Pontos |
|-------------------|-----------------|
| 8                 | 0 (base)        |
| 9                 | 1               |
| 10                | 2               |
| 11                | 3               |
| 12                | 4               |
| 13                | 5               |
| 14                | 7               |
| 15                | 9               |

### Pontos por Nível (Ability Score Improvements)

#### Classes Padrão
Todas as classes recebem ASI nos seguintes níveis:

| Nível | Pontos Totais | ASI Acumulado |
|-------|---------------|---------------|
| 1-3   | 27            | +0            |
| 4-7   | 29            | +2            |
| 8-11  | 31            | +4            |
| 12-15 | 33            | +6            |
| 16-18 | 35            | +8            |
| 19-20 | 37            | +10           |

#### Guerreiro (Fighter)
O Guerreiro recebe ASI extras nos níveis 6 e 14:

| Nível | Pontos Totais | ASI Acumulado |
|-------|---------------|---------------|
| 1-3   | 27            | +0            |
| 4-5   | 29            | +2            |
| 6-7   | 31            | +4 (extra)    |
| 8-11  | 33            | +6            |
| 12-13 | 35            | +8            |
| 14-15 | 37            | +10 (extra)   |
| 16-18 | 39            | +12           |
| 19-20 | 41            | +14           |

#### Ladino (Rogue)
O Ladino recebe ASI extra no nível 10:

| Nível | Pontos Totais | ASI Acumulado |
|-------|---------------|---------------|
| 1-3   | 27            | +0            |
| 4-7   | 29            | +2            |
| 8-9   | 31            | +4            |
| 10-11 | 33            | +6 (extra)    |
| 12-15 | 35            | +8            |
| 16-18 | 37            | +10           |
| 19-20 | 39            | +12           |

## Implementação

### Arquivos Modificados

1. **PointBuyEditor.tsx** ([frontend/src/components/character/PointBuyEditor.tsx](../frontend/src/components/character/PointBuyEditor.tsx))
   - Calcula pontos totais baseado no nível e classe
   - Exibe contador dinâmico de pontos
   - Mostra bônus raciais em tempo real
   - Valida distribuição de pontos

2. **CharacterForm.tsx** ([frontend/src/components/character/CharacterForm.tsx](../frontend/src/components/character/CharacterForm.tsx))
   - Usa PointBuyEditor no modo de criação
   - Passa nível e classe como props
   - Valida pontos antes de salvar

### Função de Cálculo

```typescript
const calculateTotalPoints = (level: number, characterClass?: string): number => {
  let points = 27; // Base

  // ASI padrão para todas as classes (níveis 4, 8, 12, 16, 19)
  if (level >= 4) points += 2;
  if (level >= 8) points += 2;
  if (level >= 12) points += 2;
  if (level >= 16) points += 2;
  if (level >= 19) points += 2;

  // ASI extras para Fighter (níveis 6 e 14)
  if (characterClass === "Guerreiro") {
    if (level >= 6) points += 2;
    if (level >= 14) points += 2;
  }

  // ASI extra para Rogue (nível 10)
  if (characterClass === "Ladino") {
    if (level >= 10) points += 2;
  }

  return points;
};
```

## Interface do Usuário

### Modo Criação
- **Point Buy Editor** é exibido automaticamente
- Contador mostra pontos restantes em tempo real
- Botões +/- para ajustar atributos
- Bônus raciais exibidos em verde
- Feedback visual:
  - 🟢 Verde: Todos os pontos distribuídos
  - 🟡 Amarelo: Ainda há pontos para distribuir
  - 🔴 Vermelho: Excedeu o limite de pontos

### Modo Edição
- Inputs tradicionais com valores livres (1-20)
- Não valida Point Buy (personagem já criado)
- Permite ajustes diretos nos atributos

## Validações

### Ao Salvar Personagem (Modo Criação)

1. **Pontos Exatos**: O jogador DEVE distribuir exatamente o número de pontos calculado para o nível
   - Exemplo: Nível 1 = 27 pontos
   - Exemplo: Nível 4 = 29 pontos
   - Exemplo: Guerreiro Nível 6 = 31 pontos

2. **Range de Atributos**: Todos os atributos devem estar entre 8 e 15
   - Antes de aplicar bônus raciais
   - Limites definidos pelo sistema Point Buy do D&D 5e

3. **Mensagens de Erro**:
   - "Você deve distribuir exatamente X pontos nos atributos. Atualmente: Y pontos."
   - "Os atributos devem estar entre 8 e 15 antes de aplicar bônus raciais."

## Exemplos de Uso

### Exemplo 1: Guerreiro Humano Nível 1
- **Pontos disponíveis**: 27
- **Distribuição sugerida**:
  - Força: 15 (9 pontos)
  - Destreza: 12 (4 pontos)
  - Constituição: 14 (7 pontos)
  - Inteligência: 8 (0 pontos)
  - Sabedoria: 10 (2 pontos)
  - Carisma: 13 (5 pontos)
  - **Total**: 27 pontos ✅

- **Com bônus racial (Humano +1 em todos)**:
  - Força: 16 (+3)
  - Destreza: 13 (+1)
  - Constituição: 15 (+2)
  - Inteligência: 9 (-1)
  - Sabedoria: 11 (+0)
  - Carisma: 14 (+2)

### Exemplo 2: Mago Elfo Alto Nível 4
- **Pontos disponíveis**: 29 (27 base + 2 ASI)
- **Distribuição sugerida**:
  - Força: 8 (0 pontos)
  - Destreza: 14 (7 pontos)
  - Constituição: 12 (4 pontos)
  - Inteligência: 15 (9 pontos)
  - Sabedoria: 13 (5 pontos)
  - Carisma: 12 (4 pontos)
  - **Total**: 29 pontos ✅

- **Com bônus racial (Elfo +2 DEX, Alto Elfo +1 INT)**:
  - Força: 8 (-1)
  - Destreza: 16 (+3)
  - Constituição: 12 (+1)
  - Inteligência: 16 (+3)
  - Sabedoria: 13 (+1)
  - Carisma: 12 (+1)

### Exemplo 3: Guerreiro Anão da Montanha Nível 6
- **Pontos disponíveis**: 31 (27 base + 4 ASI do Guerreiro)
- **Distribuição sugerida**:
  - Força: 15 (9 pontos)
  - Destreza: 10 (2 pontos)
  - Constituição: 15 (9 pontos)
  - Inteligência: 8 (0 pontos)
  - Sabedoria: 12 (4 pontos)
  - Carisma: 13 (5 pontos)
  - **Total**: 31 pontos ✅

- **Com bônus racial (Anão +2 CON, Anão da Montanha +2 FOR)**:
  - Força: 17 (+3)
  - Destreza: 10 (+0)
  - Constituição: 17 (+3)
  - Inteligência: 8 (-1)
  - Sabedoria: 12 (+1)
  - Carisma: 13 (+1)

## Referências

- **D&D 5e Player's Handbook**: Capítulo 1 - Ability Scores
- **D&D 5e Player's Handbook**: Capítulo 3 - Classes (ASI por classe)
- **Implementação**: [PointBuyEditor.tsx](../frontend/src/components/character/PointBuyEditor.tsx)

## Notas de Desenvolvimento

### Decisões de Design

1. **ASI como Pontos**: Optamos por converter os ASI em pontos do sistema Point Buy para simplificar a interface
   - ASI padrão = +2 pontos
   - Permite distribuição flexível entre atributos

2. **Modo Criação vs Edição**:
   - **Criação**: Usa Point Buy obrigatório
   - **Edição**: Permite valores livres (personagem pode ter crescido de nível, recebido itens mágicos, etc.)

3. **Validação no Submit**: Garante que o personagem foi criado seguindo as regras oficiais

### Melhorias Futuras

- [ ] Opção de rolar dados (4d6 drop lowest) como alternativa ao Point Buy
- [ ] Histórico de como os pontos de ASI foram distribuídos em cada nível
- [ ] Sugestões automáticas de distribuição por classe
- [ ] Integração com feats (opção de trocar ASI por feat)
- [ ] Suporte para raças customizadas com bônus personalizados
