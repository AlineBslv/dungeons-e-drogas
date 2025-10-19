import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Timestamp } from 'firebase/firestore';

interface MessageBubbleProps {
  sender: "mestre" | "drogon" | "jogador";
  content: string;
  timestamp?: string | Timestamp;
}

export default function MessageBubble({ sender, content, timestamp }: MessageBubbleProps) {
  const isMestre = sender === "mestre";
  const isDrogon = sender === "drogon";

  return (
    <div className={cn("flex flex-col gap-1", isMestre ? "items-end" : "items-start")}>
      <Card
        className={cn(
          "px-4 py-3 max-w-[80%] text-sm transition-all duration-200 hover:-translate-y-0.5",
          isMestre
            ? "bg-purple-900/30 border-purple-500/50 text-gray-100"
            : isDrogon
            ? "bg-gray-800/50 border-cyan-500/50 text-gray-100 hover:border-cyan-500"
            : "bg-gray-700/50 border-gray-500/50 text-gray-100"
        )}
      >
        {isDrogon ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="font-lore leading-relaxed mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="text-cyan-300 font-bold">{children}</strong>,
                em: ({ children }) => <em className="text-purple-300 italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="font-lore">{children}</li>,
                code: ({ children }) => <code className="bg-gray-900/50 px-1.5 py-0.5 rounded text-cyan-400 text-xs font-mono">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-300 my-2">{children}</blockquote>,
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
        <span className="text-xs text-gray-500 px-2">
          {sender === "drogon" ? "🐉 Drogon" : sender === "mestre" ? "Mestre" : "Jogador"}
        </span>
      )}
    </div>
  );
}
