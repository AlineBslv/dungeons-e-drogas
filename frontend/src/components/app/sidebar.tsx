"use client";

import { motion } from "framer-motion";
import {
  GiCastle,
  GiScrollQuill,
  GiSwordman,
  GiScrollUnfurled,
  GiThreeFriends,
  GiGearHammer
} from "react-icons/gi";
import { cn } from "@/lib/utils";
import { slideInLeft } from "@/lib/motion-presets";

export interface SidebarProps {
  className?: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: GiCastle, label: "Início", href: "/" },
  { icon: GiScrollQuill, label: "Chat", href: "/chat/test" },
  { icon: GiSwordman, label: "Personagens", href: "/characters" },
  { icon: GiScrollUnfurled, label: "Campanhas", href: "/campaigns" },
  { icon: GiThreeFriends, label: "Jogadores", href: "/players" },
  { icon: GiGearHammer, label: "Configurações", href: "/settings" },
];

/**
 * Sidebar - Navegação lateral com tema grimório
 */
export function Sidebar({ className }: SidebarProps) {
  return (
    <motion.aside
      variants={slideInLeft}
      initial="initial"
      animate="animate"
      className={cn(
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-16 sm:w-64 border-r border-border bg-dark-300 shadow-xl",
        className
      )}
    >
      <nav className="flex flex-col gap-2 p-2 sm:p-4">
        {navItems.map((item, index) => (
          <motion.a
            key={item.href}
            href={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg font-ui text-sm transition-all duration-200 group",
              item.active
                ? "bg-gold-500/10 text-gold-500 border border-gold-500/30 shadow-glow"
                : "text-text-secondary hover:bg-dark-500 hover:text-gold-300 hover:border-gold-500/20 border border-transparent"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline font-medium">{item.label}</span>
          </motion.a>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className="hidden sm:block p-3 rounded-lg bg-dark-500/50 border border-gold-500/20">
          <p className="text-xs font-lore text-text-secondary italic">
            &quot;O conhecimento é poder, Mestre.&quot;
          </p>
          <p className="text-xs text-gold-500 mt-1 font-ui">— Drogon</p>
        </div>
      </div>
    </motion.aside>
  );
}
