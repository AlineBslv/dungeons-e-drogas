"use client";

import { motion } from "framer-motion";
import { GiDragonHead } from "react-icons/gi";
import { Card } from "@/components/ui/card";

export default function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  return (
    <div className="flex items-start">
      <Card className="px-4 py-3 max-w-[80%] bg-gray-800/50 border-cyan-500/50 text-gray-100">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
          >
            <GiDragonHead className="w-5 h-5 text-cyan-400" />
          </motion.div>

          <div className="flex items-center gap-1">
            <span className="text-sm font-lore text-gray-300">Drogon está invocando</span>
            <div className="flex gap-1 ml-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  variants={dotVariants}
                  initial="initial"
                  animate="animate"
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 0.6,
                    delay: i * 0.2,
                  }}
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
