import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MessageBubbleProps {
  sender: "user" | "ai";
  content: string;
}

export default function MessageBubble({ sender, content }: MessageBubbleProps) {
  const isUser = sender === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <Card
        className={cn(
          "px-4 py-3 max-w-[80%] text-sm transition-transform duration-200",
          isUser
            ? "bg-[#2D2A26] border border-[#6E4C2E] text-[#FFF7E2] shadow-md hover:shadow-lg"
            : "bg-[#181511] border border-[#C5A75B]/60 text-[#E8E6E1]"
        )}
      >
        <p className="font-['Crimson_Pro'] leading-relaxed">{content}</p>
      </Card>
    </div>
  );
}
