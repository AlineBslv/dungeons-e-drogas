"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";

interface Message {
  sender: "user" | "ai";
  content: string;
}

export default function ChatContainer({ messages }: { messages: Message[] }) {
  return (
    <ScrollArea className="h-[calc(100vh-140px)] w-full bg-gradient-to-b from-[#0A0A0A] to-[#121212] px-4 py-6">
      <div className="flex flex-col gap-4" role="log" aria-label="Histórico de mensagens">
        {messages.map((msg, i) => (
          <MessageBubble key={i} {...msg} />
        ))}
      </div>
    </ScrollArea>
  );
}
