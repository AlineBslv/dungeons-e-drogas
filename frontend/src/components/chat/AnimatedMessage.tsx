"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { messageAppear } from "@/lib/motion-presets";

interface AnimatedMessageProps {
  text: string;
  isAI?: boolean;
}

export function AnimatedMessage({ text, isAI = true }: AnimatedMessageProps) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset ao receber novo texto
    setDisplayed("");
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed((prev) => prev + text[indexRef.current]);
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, 25); // Velocidade da "escrita mágica"

    return () => clearInterval(interval);
  }, [text]);

  const isTyping = displayed.length < text.length;

  return (
    <motion.div
      variants={messageAppear}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "max-w-[80%] px-4 py-3 rounded-2xl shadow-md font-lore leading-relaxed",
        isAI
          ? "bg-dark-300 border border-gold-500/70 text-text-primary"
          : "bg-dark-500 border border-gold-300/50 text-text-primary self-end"
      )}
    >
      <span className="relative">
        {displayed}
        {isTyping && (
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="ml-1 text-gold-500"
          >
            |
          </motion.span>
        )}
      </span>
    </motion.div>
  );
}
