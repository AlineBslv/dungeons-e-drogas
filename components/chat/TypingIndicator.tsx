"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.7, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="flex items-center space-x-3 px-4 py-2 text-[#C5A75B] font-serif italic"
    >
      <Loader2 className="h-4 w-4 animate-spin text-[#C5A75B]" />
      <span>O Mestre Drogon está conjurando suas palavras...</span>
    </motion.div>
  );
}
