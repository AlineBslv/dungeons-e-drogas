"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus } from 'lucide-react';

interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface PointBuyEditorProps {
  attributes: Attributes;
  onChange: (attributes: Attributes) => void;
  racialBonuses?: Partial<Attributes>;
  level?: number;
  characterClass?: string;
}

// Tabela de custos do sistema Point Buy (D&D 5e)
const POINT_COSTS: { [key: number]: number } = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

const MIN_ATTRIBUTE = 8;
const MAX_ATTRIBUTE = 15;
const BASE_POINTS = 27;

// Calcula pontos totais baseado no nível e classe (Ability Score Improvements)
const calculateTotalPoints = (level: number, characterClass?: string): number => {
  let points = BASE_POINTS;

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

// Mapeamento de nomes dos atributos em português
const ATTRIBUTE_LABELS: { [K in keyof Attributes]: string } = {
  strength: 'Força',
  dexterity: 'Destreza',
  constitution: 'Constituição',
  intelligence: 'Inteligência',
  wisdom: 'Sabedoria',
  charisma: 'Carisma',
};

// Ordem de exibição dos atributos
const ATTRIBUTE_ORDER: (keyof Attributes)[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

export function PointBuyEditor({
  attributes,
  onChange,
  racialBonuses = {},
  level = 1,
  characterClass
}: PointBuyEditorProps) {
  // Calcula o custo total de pontos gastos
  const calculateTotalCost = (attrs: Attributes): number => {
    return Object.values(attrs).reduce((total, value) => {
      return total + (POINT_COSTS[value] || 0);
    }, 0);
  };

  const maxPoints = calculateTotalPoints(level, characterClass);
  const totalCost = calculateTotalCost(attributes);
  const remainingPoints = maxPoints - totalCost;

  // Calcula o modificador de atributo
  const calculateModifier = (value: number): string => {
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Incrementa um atributo
  const incrementAttribute = (attr: keyof Attributes) => {
    const currentValue = attributes[attr];
    const newValue = currentValue + 1;

    // Verifica se pode incrementar
    if (newValue > MAX_ATTRIBUTE) return;

    const newCost = POINT_COSTS[newValue];
    const oldCost = POINT_COSTS[currentValue];
    const costDifference = newCost - oldCost;

    // Verifica se tem pontos suficientes
    if (totalCost + costDifference > maxPoints) return;

    onChange({
      ...attributes,
      [attr]: newValue,
    });
  };

  // Decrementa um atributo
  const decrementAttribute = (attr: keyof Attributes) => {
    const currentValue = attributes[attr];
    const newValue = currentValue - 1;

    // Verifica se pode decrementar
    if (newValue < MIN_ATTRIBUTE) return;

    onChange({
      ...attributes,
      [attr]: newValue,
    });
  };

  return (
    <Card className="bg-background/50 border-amber-900/30">
      <CardHeader>
        <CardTitle className="text-xl text-amber-100 flex items-center justify-between">
          <span>Distribuição de Pontos de Atributos</span>
          <span className={`text-2xl font-bold ${remainingPoints === 0 ? 'text-green-400' : remainingPoints < 0 ? 'text-red-400' : 'text-amber-400'}`}>
            {remainingPoints} / {maxPoints}
          </span>
        </CardTitle>
        <CardDescription className="text-amber-200/70">
          Distribua {maxPoints} pontos entre os atributos. Todos começam em 8 e podem ir até 15 (antes de bônus raciais).
          {level > 1 && ` (+${maxPoints - BASE_POINTS} pontos de ASI por nível ${level})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ATTRIBUTE_ORDER.map((attr) => {
          const value = attributes[attr];
          const racialBonus = racialBonuses[attr] || 0;
          const finalValue = value + racialBonus;
          const cost = POINT_COSTS[value];
          const canIncrement = value < MAX_ATTRIBUTE && totalCost + (POINT_COSTS[value + 1] - cost) <= maxPoints;
          const canDecrement = value > MIN_ATTRIBUTE;

          return (
            <div
              key={attr}
              className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-amber-900/20 hover:border-amber-700/40 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-amber-100 font-medium min-w-[120px]">
                    {ATTRIBUTE_LABELS[attr]}
                  </span>
                  <span className="text-amber-300/60 text-sm">
                    ({cost} {cost === 1 ? 'ponto' : 'pontos'})
                  </span>
                </div>
                {racialBonus > 0 && (
                  <span className="text-xs text-green-400">
                    +{racialBonus} bônus racial = {finalValue} total
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => decrementAttribute(attr)}
                  disabled={!canDecrement}
                  className="h-8 w-8 p-0 bg-background/50 border-amber-900/40 hover:bg-amber-900/20 disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-2xl font-bold text-amber-100">
                    {value}
                  </span>
                  <span className="text-sm text-amber-300/70">
                    {calculateModifier(value)}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => incrementAttribute(attr)}
                  disabled={!canIncrement}
                  className="h-8 w-8 p-0 bg-background/50 border-amber-900/40 hover:bg-amber-900/20 disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {remainingPoints > 0 && (
          <div className="p-3 bg-amber-900/20 border border-amber-600/40 rounded-lg text-center">
            <p className="text-amber-200 text-sm">
              Você ainda tem <span className="font-bold text-amber-100">{remainingPoints}</span> {remainingPoints === 1 ? 'ponto' : 'pontos'} para distribuir.
            </p>
          </div>
        )}

        {remainingPoints === 0 && (
          <div className="p-3 bg-green-900/20 border border-green-600/40 rounded-lg text-center">
            <p className="text-green-200 text-sm font-medium">
              ✓ Todos os {maxPoints} pontos foram distribuídos!
            </p>
          </div>
        )}

        {remainingPoints < 0 && (
          <div className="p-3 bg-red-900/20 border border-red-600/40 rounded-lg text-center">
            <p className="text-red-200 text-sm font-medium">
              ✗ Você excedeu o limite de pontos!
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-amber-900/30">
          <h4 className="text-sm font-medium text-amber-200 mb-2">Tabela de Custos:</h4>
          <div className="grid grid-cols-4 gap-2 text-xs text-amber-300/70">
            {Object.entries(POINT_COSTS).map(([score, cost]) => (
              <div key={score} className="text-center">
                <span className="font-medium text-amber-200">{score}</span> = {cost}pt
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
