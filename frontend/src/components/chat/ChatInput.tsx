"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FiSend } from "react-icons/fi";

export default function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [msg, setMsg] = useState("");

  const handleSend = () => {
    if (!msg.trim()) return;
    onSend(msg);
    setMsg("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-[#2F2D27] bg-[#0D0D0D] p-4">
      <Textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua invocacao..."
        className="flex-1 resize-none bg-transparent text-[#E8E6E1] placeholder-gray-500 font-['Crimson_Pro'] min-h-[60px] max-h-[120px]"
        aria-label="Campo de mensagem"
      />
      <Button
        onClick={handleSend}
        className="rounded-full bg-gradient-to-br from-[#C5A75B] to-[#9F7A32] text-black hover:shadow-[0_0_10px_#C5A75B] transition-shadow"
        size="icon"
        aria-label="Enviar mensagem"
      >
        <FiSend className="h-5 w-5" />
      </Button>
    </div>
  );
}
