"use client";

import { useState } from "react";
import ChatContainer from "@/components/chat/ChatContainer";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";

interface Message {
  sender: "user" | "ai";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", content: "Bem-vindo, Mestre! Estou pronto para narrar sua jornada epica." },
  ]);
  const [typing, setTyping] = useState(false);

  const handleSend = async (msg: string) => {
    setMessages((prev) => [...prev, { sender: "user", content: msg }]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          content: "Drogon reflete sobre suas palavras... 'Interessante, conte-me mais sobre isso, nobre aventureiro.'"
        },
      ]);
    }, 1500);
  };

  return (
    <main className="flex flex-col h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212]">
      <header className="text-center py-3 border-b border-[#2F2D27] bg-[#141312] font-['Cinzel'] text-[#C5A75B] shadow-inner">
        <h1 className="text-xl font-semibold">Campanha: A Ira dos Kobolds</h1>
      </header>

      <ChatContainer messages={messages} />

      {typing && <TypingIndicator />}

      <ChatInput onSend={handleSend} />
    </main>
  );
}
