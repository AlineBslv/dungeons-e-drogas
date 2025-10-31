import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Timestamp } from 'firebase/firestore';
import { GiDragonHead, GiDiceTwentyFacesTwenty } from "react-icons/gi";
import { FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { CharacterActionCard } from './CharacterActionCard';
import type { CharacterAction } from '@/hooks/useCharacterActions';

interface DiceResult {
  rolls: number[];
  total: number;
  modifier: number;
  finalTotal: number;
  isCritical: boolean;
  isCriticalFailure: boolean;
  diceType: number;
  quantity: number;
}

interface MessageBubbleProps {
  sender: "mestre" | "drogon" | "jogador";
  content: string;
  timestamp?: string | Timestamp;
  type?: "message" | "dice_roll" | "character_action";
  audience?: 'all' | 'master_only';  // Controla visibilidade
  diceData?: {
    command: string;
    result: DiceResult;
    context?: string;
    characterName?: string;
  };
  characterAction?: {
    characterId: string;
    characterName: string;
    characterClass: string;
    action: CharacterAction;
  };
}

export default function MessageBubble({ sender, content, timestamp, type = "message", audience, diceData, characterAction }: MessageBubbleProps) {
  const isMestre = sender === "mestre";
  const isDrogon = sender === "drogon";
  const isDiceRoll = type === "dice_roll" && diceData;
  const isCharacterAction = type === "character_action" && characterAction;
  const isPrivate = audience === 'master_only';

  // Renderiza ação de personagem
  if (isCharacterAction) {
    const { characterName, characterClass, action } = characterAction;

    return (
      <div className="flex flex-col gap-1 items-start w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <CharacterActionCard
            characterName={characterName}
            characterClass={characterClass}
            action={action}
            timestamp={timestamp ? formatTimestamp(timestamp) : undefined}
          />
        </motion.div>
      </div>
    );
  }

  // Renderiza rolagem de dados
  if (isDiceRoll) {
    const { result, command, context, characterName } = diceData;

    return (
      <div className="flex flex-col gap-1 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <Card
            className={cn(
              "px-4 py-3 text-sm transition-all duration-200",
              result.isCritical
                ? "bg-dice-critical-bg border-dice-critical shadow-lg shadow-dice-critical/30"
                : result.isCriticalFailure
                ? "bg-dice-failure-bg border-dice-failure shadow-lg shadow-dice-failure/30"
                : "bg-dice-normal-bg border-dice-normal/40"
            )}
          >
            {/* Cabeçalho da rolagem */}
            <div className="flex items-center gap-2 mb-3">
              <GiDiceTwentyFacesTwenty className="h-5 w-5 text-dice-normal" />
              <div className="flex-1">
                <div className="font-bold text-dice-normal font-lore">
                  {characterName || "Jogador"}
                </div>
                {context && (
                  <div className="text-xs text-muted-foreground font-ui">
                    {context}
                  </div>
                )}
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                {command}
              </div>
            </div>

            {/* Resultado */}
            <div className="bg-background/50 rounded-lg p-3 border border-dice-normal/30">
              {/* Total grande */}
              <div className="text-center mb-2">
                <div className={cn(
                  "text-4xl font-bold font-medieval",
                  result.isCritical && "text-dice-critical",
                  result.isCriticalFailure && "text-dice-failure",
                  !result.isCritical && !result.isCriticalFailure && "text-dice-normal"
                )}>
                  {result.finalTotal}
                </div>
                {result.isCritical && (
                  <div className="text-dice-critical font-bold text-sm mt-1 animate-pulse">
                    🌟 CRÍTICO!
                  </div>
                )}
                {result.isCriticalFailure && (
                  <div className="text-dice-failure font-bold text-sm mt-1 animate-pulse">
                    💀 FALHA CRÍTICA!
                  </div>
                )}
              </div>

              {/* Detalhes */}
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-muted-foreground">Dados:</span>
                  <span className="font-mono text-dice-normal font-semibold">
                    [{result.rolls.join(', ')}]
                  </span>
                </div>
                {result.modifier !== 0 && (
                  <div>
                    Modificador:
                    <span className="font-bold text-dice-normal ml-1">
                      {result.modifier > 0 ? '+' : ''}{result.modifier}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {timestamp && (
          <span className="text-xs text-muted-foreground px-2 font-lore flex items-center gap-1">
            <GiDiceTwentyFacesTwenty className="h-3 w-3" /> Rolagem
          </span>
        )}
      </div>
    );
  }

  // Renderiza mensagem normal
  return (
    <div className={cn("flex flex-col gap-1", isMestre ? "items-end" : "items-start")}>
      <Card
        className={cn(
          "px-4 py-3 max-w-[80%] text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow",
          isMestre
            ? "bg-primary/20 border-primary/50 text-foreground hover:border-primary"
            : isDrogon
            ? "bg-accent/30 border-accent/50 text-foreground hover:border-accent"
            : "bg-card/50 border-border text-foreground hover:border-primary/50"
        )}
      >
        {/* Badge de mensagem privada */}
        {isPrivate && isDrogon && (
          <Badge variant="secondary" className="mb-2 bg-mystic-purple/20 text-mystic-purple border-mystic-purple/40">
            <FaEyeSlash className="w-3 h-3 mr-1" />
            Apenas para você (Mestre)
          </Badge>
        )}

        {isDrogon ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="font-lore leading-relaxed mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="text-primary font-bold">{children}</strong>,
                em: ({ children }) => <em className="text-primary/80 italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="font-lore">{children}</li>,
                code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-primary text-xs font-mono">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-2">{children}</blockquote>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="font-lore leading-relaxed">{content}</p>
        )}
      </Card>
      {timestamp && (
        <span className="text-xs text-muted-foreground px-2 font-lore flex items-center gap-1">
          {sender === "drogon" && <><GiDragonHead className="h-3 w-3" /> Drogon</>}
          {sender === "mestre" && "Mestre"}
          {sender === "jogador" && "Jogador"}
        </span>
      )}
    </div>
  );
}

/**
 * Formata timestamp para exibição
 */
function formatTimestamp(timestamp: string | Timestamp): string {
  try {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}
