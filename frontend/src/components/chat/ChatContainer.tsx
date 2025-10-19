"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedMessage } from "./AnimatedMessage";

interface Message {
  sender: "user" | "ai";
  content: string;
}

export default function ChatContainer({ messages }: { messages: Message[] }) {
  return (
    <ScrollArea className="h-[calc(100vh-140px)] w-full bg-gradient-to-b from-dark-100 to-dark-300 px-4 py-6">
      <div className="flex flex-col gap-4" role="log" aria-label="Histórico de mensagens">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={msg.sender === "ai" ? "self-start" : "self-end"}
            >
              <AnimatedMessage text={msg.content} isAI={msg.sender === "ai"} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
