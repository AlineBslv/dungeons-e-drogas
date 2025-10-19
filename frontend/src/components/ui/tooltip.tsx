"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { tooltipNarrative } from "@/lib/motion-presets";

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/**
 * Tooltip Narrativo Drogon
 * Mensagens contextuais com estilo medieval
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={tooltipNarrative}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "absolute z-50 px-3 py-2 text-xs font-lore text-text-primary bg-dark-500 border border-gold-500/60 rounded-md shadow-glow whitespace-nowrap pointer-events-none",
              sideClasses[side],
              className
            )}
          >
            {content}
            {/* Flecha do tooltip */}
            <div
              className={cn(
                "absolute w-2 h-2 bg-dark-500 border-gold-500/60 rotate-45",
                side === "top" && "bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r",
                side === "bottom" && "top-[-5px] left-1/2 -translate-x-1/2 border-t border-l",
                side === "left" && "right-[-5px] top-1/2 -translate-y-1/2 border-r border-t",
                side === "right" && "left-[-5px] top-1/2 -translate-y-1/2 border-l border-b"
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
