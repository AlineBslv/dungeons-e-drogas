"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FiSend } from "react-icons/fi";
import { GiDiceTwentyFacesTwenty } from "react-icons/gi";

interface ChatInputProps {
  onSendMessage?: (msg: string) => void;
  onSend?: (msg: string) => void;
  onDiceRoll?: (command: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, onSend, onDiceRoll, disabled }: ChatInputProps) {
  const [msg, setMsg] = useState("");
  const [showDiceHint, setShowDiceHint] = useState(false);

  const handleSend = () => {
    if (!msg.trim() || disabled) return;

    // Detecta comando /roll
    const rollMatch = msg.match(/^\/roll\s+(.+)$/i);
    if (rollMatch && onDiceRoll) {
      const diceCommand = rollMatch[1].trim();
      onDiceRoll(diceCommand);
      setMsg("");
      return;
    }

    // Envia mensagem normal
    const sendFunc = onSendMessage || onSend;
    if (sendFunc) {
      sendFunc(msg);
      setMsg("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMsg(value);

    // Mostra hint se começar a digitar /roll
    setShowDiceHint(value.toLowerCase().startsWith('/roll'));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <Textarea
            value={msg}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua invocação... (ou /roll 1d20+5)"
            className="resize-none font-lore min-h-[60px] max-h-[120px]"
            aria-label="Campo de mensagem"
            disabled={disabled}
          />
          {/* Hint de comando /roll */}
          {showDiceHint && (
            <div className="absolute -top-10 left-0 bg-card border border-amber-600/50 rounded-md px-3 py-1 text-xs text-amber-400 font-mono shadow-lg">
              <GiDiceTwentyFacesTwenty className="inline h-3 w-3 mr-1" />
              Ex: /roll 1d20+5
            </div>
          )}
        </div>
        <Button
          onClick={handleSend}
          variant="default"
          size="icon"
          aria-label="Enviar mensagem"
          className="rounded-full h-[60px] w-[60px] shadow-glow hover:shadow-glow-intense hover:scale-105 active:scale-95 transition-all"
          disabled={disabled || !msg.trim()}
        >
          <FiSend className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
