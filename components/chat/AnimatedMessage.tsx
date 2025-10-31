"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface AnimatedMessageProps {
  text: string;
  isAI?: boolean;
}

export function AnimatedMessage({ text, isAI = true }: AnimatedMessageProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((t) => t + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 25); // Velocidade da "escrita mágica"
    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={clsx(
        "max-w-[80%] px-4 py-3 rounded-2xl shadow-md font-serif leading-relaxed",
        isAI
          ? "bg-[#181511] border border-[#C5A75B]/70 text-[#E8E6E1]"
          : "bg-[#2E2E2E] border border-[#8B4513] text-[#FFF5E9] self-end"
      )}
    >
      <span className="relative">
        {displayed}
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute -bottom-0.5 right-0 text-[#C5A75B]"
        >
          ✨
        </motion.span>
      </span>
    </motion.div>
  );
}
