/**
 * Dungeons & Drogas - Motion Presets
 * Animações reutilizáveis com Framer Motion
 * Baseado na seção 6 do ROADMAP
 */

import { Variants, Transition } from "framer-motion";

/**
 * Configurações de transição padrão
 */
export const transitions = {
  smooth: { duration: 0.3, ease: "easeOut" } as Transition,
  bouncy: { duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] } as Transition,
  slow: { duration: 0.7, ease: "easeInOut" } as Transition,
  spring: { type: "spring", stiffness: 300, damping: 20 } as Transition,
};

/**
 * Aparição de mensagem - Fade in suave
 */
export const messageAppear: Variants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

/**
 * Brilho rúnico - Pulse dourado
 */
export const runeGlow: Variants = {
  initial: {
    opacity: 0.6,
    filter: "brightness(1)",
  },
  animate: {
    opacity: [0.6, 1, 0.6],
    filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Rolagem de dados - Rotação 360°
 */
export const diceRoll: Variants = {
  initial: {
    rotate: 0,
    scale: 1,
  },
  animate: {
    rotate: 360,
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      ease: transitions.bouncy.ease,
    },
  },
};

/**
 * Entrada da esquerda - Slide in
 */
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.2 },
  },
};

/**
 * Entrada da direita - Slide in
 */
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.2 },
  },
};

/**
 * Modal arcano - Zoom com blur
 */
export const modalArcane: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(2px)",
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Tooltip narrativo - Fade + slight scale
 */
export const tooltipNarrative: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -5,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

/**
 * Botão hover - Lift effect
 */
export const buttonHover = {
  whileHover: {
    y: -2,
    boxShadow: "0 0 20px rgba(197, 167, 91, 0.6)",
    transition: { duration: 0.2 },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

/**
 * Card hover - Lift + glow
 */
export const cardHover = {
  whileHover: {
    y: -3,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
    borderColor: "rgba(197, 167, 91, 0.8)",
    transition: { duration: 0.2 },
  },
};

/**
 * Fogo tremulante - Fire flicker
 */
export const fireFlicker: Variants = {
  animate: {
    opacity: [1, 0.9, 0.95, 0.92, 1],
    filter: [
      "brightness(1)",
      "brightness(1.1)",
      "brightness(0.95)",
      "brightness(1.05)",
      "brightness(1)",
    ],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Typing indicator - Dots bouncing
 */
export const typingDot = (delay: number): Variants => ({
  animate: {
    y: [0, -8, 0],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.4,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    },
  },
});

/**
 * Stagger container - Para listas
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Stagger item - Filho do container
 */
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * Page transition - Transição de páginas
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(2px)",
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Arcane shimmer - Brilho místico
 */
export const arcaneShimmer: Variants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    },
  },
};
