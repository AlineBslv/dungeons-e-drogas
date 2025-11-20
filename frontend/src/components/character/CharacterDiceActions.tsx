"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CharacterSheet } from "@/lib/firestore-helpers";
import {
  getAllCharacterDiceActions,
  DiceAction,
} from "@/lib/character-dice-actions";
import { rollDice, DiceResult } from "@/lib/dice-helpers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GiBrain,
  GiBoltSpellCast,
  GiCrossedSwords,
  GiShield,
  GiHeartWings,
  GiDiceTwentyFacesTwenty,
} from "react-icons/gi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CharacterDiceActionsProps {
  character: CharacterSheet & { id: string };
  compact?: boolean;
}

export function CharacterDiceActions({
  character,
  compact = false,
}: CharacterDiceActionsProps) {
  const [rolling, setRolling] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    action: DiceAction;
    result: DiceResult;
  } | null>(null);

  const actions = getAllCharacterDiceActions(character);

  const handleRoll = async (action: DiceAction) => {
    setRolling(action.id);
    setLastResult(null);

    try {
      const result = await rollDice(action.command, {
        characterName: character.name,
        context: action.description,
      });

      setLastResult({ action, result: result.result });

      // Toast com resultado
      const modStr =
        action.modifier >= 0 ? `+${action.modifier}` : `${action.modifier}`;
      const critText = result.result.isCritical
        ? " 🌟 CRÍTICO!"
        : result.result.isCriticalFailure
        ? " 💀 FALHA CRÍTICA!"
        : "";

      toast.success(
        `${action.label}: ${result.result.finalTotal}${critText}`,
        {
          description: `${action.command} = ${result.result.finalTotal}`,
        }
      );
    } catch (error: any) {
      console.error("Erro ao rolar dados:", error);
      toast.error(`Erro ao rolar dados: ${error.message}`);
    } finally {
      setRolling(null);
    }
  };

  const DiceActionButton = ({ action }: { action: DiceAction }) => {
    const isRolling = rolling === action.id;
    const modStr = action.modifier >= 0 ? `+${action.modifier}` : `${action.modifier}`;

    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRoll(action)}
          disabled={!!rolling}
          className={cn(
            "w-full justify-between text-left h-auto py-2 px-3 transition-colors",
            "hover:bg-gold-500/10 hover:border-gold-500/40",
            isRolling && "animate-pulse border-gold-500"
          )}
        >
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-text-primary">
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </span>
            </div>
            <span className="text-xs text-text-secondary">{action.command}</span>
          </div>
          <div
            className={cn(
              "text-lg font-bold px-2 py-1 rounded min-w-[3rem] text-center",
              action.modifier >= 0
                ? "text-emerald bg-emerald/10"
                : "text-ruby bg-ruby/10"
            )}
          >
            {modStr}
          </div>
        </Button>
      </motion.div>
    );
  };

  if (compact) {
    // Versão compacta: apenas ataques e perícias principais
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gold-500 mb-2">
          Ações Rápidas
        </div>
        {actions.attacks.slice(0, 2).map((action) => (
          <DiceActionButton key={action.id} action={action} />
        ))}
        {actions.skills.slice(0, 3).map((action) => (
          <DiceActionButton key={action.id} action={action} />
        ))}
      </div>
    );
  }

  // Versão completa com tabs
  return (
    <Card className="border-gold-500/30">
      <CardHeader>
        <CardTitle className="text-lg font-ui flex items-center gap-2">
          <GiDiceTwentyFacesTwenty className="h-5 w-5 text-gold-500 animate-rune-glow" />
          Rolagens de Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Último Resultado */}
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-4 p-4 rounded-lg border-2",
              lastResult.result.isCritical
                ? "bg-emerald/10 border-emerald"
                : lastResult.result.isCriticalFailure
                ? "bg-ruby/10 border-ruby"
                : "bg-gold-500/10 border-gold-500"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-secondary">
                  {lastResult.action.label}
                </div>
                <div className="text-xs text-text-secondary/70">
                  {lastResult.action.command}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "text-3xl font-bold",
                    lastResult.result.isCritical
                      ? "text-emerald"
                      : lastResult.result.isCriticalFailure
                      ? "text-ruby"
                      : "text-gold-500"
                  )}
                >
                  {lastResult.result.finalTotal}
                </div>
                {lastResult.result.isCritical && (
                  <div className="text-xs text-emerald font-bold">CRÍTICO!</div>
                )}
                {lastResult.result.isCriticalFailure && (
                  <div className="text-xs text-ruby font-bold">
                    FALHA CRÍTICA!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <Tabs defaultValue="attacks" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="attacks" className="text-xs">
              <GiCrossedSwords className="h-4 w-4 mr-1" />
              Ataques
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs">
              <GiBoltSpellCast className="h-4 w-4 mr-1" />
              Perícias
            </TabsTrigger>
            <TabsTrigger value="attributes" className="text-xs">
              <GiBrain className="h-4 w-4 mr-1" />
              Atributos
            </TabsTrigger>
            <TabsTrigger value="saves" className="text-xs">
              <GiShield className="h-4 w-4 mr-1" />
              Resistências
            </TabsTrigger>
          </TabsList>

          {/* Tab: Ataques */}
          <TabsContent value="attacks" className="space-y-2 mt-0">
            {actions.attacks.length > 0 ? (
              actions.attacks.map((action) => (
                <DiceActionButton key={action.id} action={action} />
              ))
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">
                Nenhum ataque disponível
              </p>
            )}

            {/* Dano */}
            {actions.damage.length > 0 && (
              <>
                <div className="text-xs font-semibold text-gold-500 mt-4 mb-2">
                  Rolagens de Dano
                </div>
                {actions.damage.map((action) => (
                  <DiceActionButton key={action.id} action={action} />
                ))}
              </>
            )}
          </TabsContent>

          {/* Tab: Perícias */}
          <TabsContent value="skills" className="space-y-2 mt-0">
            {actions.skills.length > 0 ? (
              actions.skills.map((action) => (
                <DiceActionButton key={action.id} action={action} />
              ))
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">
                Nenhuma perícia treinada
              </p>
            )}
          </TabsContent>

          {/* Tab: Atributos */}
          <TabsContent value="attributes" className="space-y-2 mt-0">
            {actions.attributes.map((action) => (
              <DiceActionButton key={action.id} action={action} />
            ))}
          </TabsContent>

          {/* Tab: Resistências */}
          <TabsContent value="saves" className="space-y-2 mt-0">
            {actions.saves.map((action) => (
              <DiceActionButton key={action.id} action={action} />
            ))}
            <div className="text-xs text-text-secondary/70 mt-3 p-2 bg-dark-500/30 rounded">
              💡 Testes de Resistência (Saving Throws) são usados para resistir a
              efeitos mágicos, venenos, armadilhas, etc.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
