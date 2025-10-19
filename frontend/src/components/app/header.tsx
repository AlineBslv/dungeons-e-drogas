"use client";

import { motion } from "framer-motion";
import { Scroll, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  campaignName?: string;
  className?: string;
}

/**
 * Header - Cabeçalho principal com tema medieval
 */
export function Header({ campaignName = "Dungeons e Drogas", className }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-dark-300/95 backdrop-blur supports-[backdrop-filter]:bg-dark-300/80 shadow-lg",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo e título */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Scroll className="h-8 w-8 text-gold-500 animate-rune-glow" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-gold-300 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-medieval text-gold-500 tracking-wide">
              {campaignName}
            </h1>
            <p className="text-xs text-text-secondary font-ui">
              Mestre Drogon narrating...
            </p>
          </div>
        </div>

        {/* Status e ações */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-500 border border-gold-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs font-ui text-text-secondary">IA Ativa</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
