"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FiSend } from "react-icons/fi";

interface ChatInputProps {
  onSendMessage?: (msg: string) => void;
  onSend?: (msg: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, onSend, disabled }: ChatInputProps) {
  const [msg, setMsg] = useState("");

  const handleSend = () => {
    if (!msg.trim() || disabled) return;
    const sendFunc = onSendMessage || onSend;
    if (sendFunc) {
      sendFunc(msg);
      setMsg("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3 border-t border-border bg-dark-100 p-4">
      <Textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua invocação..."
        className="flex-1 resize-none bg-dark-500 border-border text-text-primary placeholder:text-text-secondary/60 placeholder:italic font-lore min-h-[60px] max-h-[120px] focus:border-gold-500"
        aria-label="Campo de mensagem"
      />
      <Button
        onClick={handleSend}
        variant="drogon"
        size="icon"
        aria-label="Enviar mensagem"
        className="rounded-full"
        disabled={disabled}
      >
        <FiSend className="h-5 w-5" />
      </Button>
    </div>
  );
}
