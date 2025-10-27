import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Timestamp } from 'firebase/firestore';
import { GiDragonHead, GiDiceTwentyFacesTwenty } from "react-icons/gi";
import { motion } from "framer-motion";

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
  type?: "message" | "dice_roll";
  diceData?: {
    command: string;
    result: DiceResult;
    context?: string;
    characterName?: string;
  };
}

export default function MessageBubble({ sender, content, timestamp, type = "message", diceData }: MessageBubbleProps) {
  const isMestre = sender === "mestre";
  const isDrogon = sender === "drogon";
  const isDiceRoll = type === "dice_roll" && diceData;

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
                ? "bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-500/30"
                : result.isCriticalFailure
                ? "bg-red-950/50 border-red-500 shadow-lg shadow-red-500/30"
                : "bg-gradient-to-br from-amber-950/30 to-stone-900/50 border-amber-600/40"
            )}
          >
            {/* Cabeçalho da rolagem */}
            <div className="flex items-center gap-2 mb-3">
              <GiDiceTwentyFacesTwenty className="h-5 w-5 text-amber-400" />
              <div className="flex-1">
                <div className="font-bold text-amber-300 font-lore">
                  {characterName || "Jogador"}
                </div>
                {context && (
                  <div className="text-xs text-stone-400 font-ui">
                    {context}
                  </div>
                )}
              </div>
              <div className="text-xs font-mono text-stone-500">
                {command}
              </div>
            </div>

            {/* Resultado */}
            <div className="bg-stone-950/50 rounded-lg p-3 border border-amber-900/30">
              {/* Total grande */}
              <div className="text-center mb-2">
                <div className="text-4xl font-bold text-amber-300 font-medieval">
                  {result.finalTotal}
                </div>
                {result.isCritical && (
                  <div className="text-emerald-400 font-bold text-sm mt-1 animate-pulse">
                    🌟 CRÍTICO!
                  </div>
                )}
                {result.isCriticalFailure && (
                  <div className="text-red-400 font-bold text-sm mt-1 animate-pulse">
                    💀 FALHA CRÍTICA!
                  </div>
                )}
              </div>

              {/* Detalhes */}
              <div className="text-center text-xs text-stone-400 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-stone-500">Dados:</span>
                  <span className="font-mono text-amber-200 font-semibold">
                    [{result.rolls.join(', ')}]
                  </span>
                </div>
                {result.modifier !== 0 && (
                  <div>
                    Modificador:
                    <span className="font-bold text-amber-300 ml-1">
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
