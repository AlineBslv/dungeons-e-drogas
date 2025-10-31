'use client';

import { motion } from 'framer-motion';

interface DiceAnimationProps {
  diceType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
  isRolling: boolean;
  result?: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente de animação 3D de dados
 * Simula dado rolando com rotação 3D e bounce
 */
export default function DiceAnimation({ diceType, isRolling, result, size = 'md' }: DiceAnimationProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
  };

  const getDiceColor = () => {
    switch (diceType) {
      case 4: return 'from-blue-600 to-blue-800';
      case 6: return 'from-green-600 to-green-800';
      case 8: return 'from-yellow-600 to-yellow-800';
      case 10: return 'from-orange-600 to-orange-800';
      case 12: return 'from-red-600 to-red-800';
      case 20: return 'from-purple-600 to-purple-800';
      case 100: return 'from-pink-600 to-pink-800';
    }
  };

  const getDiceShape = () => {
    // SVG paths para diferentes formatos de dados
    switch (diceType) {
      case 4: return ( // Tetraedro
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,10 90,80 10,80" fill="currentColor" opacity="0.9" />
          <polygon points="50,10 90,80 70,50" fill="currentColor" opacity="0.7" />
          <polygon points="50,10 10,80 30,50" fill="currentColor" opacity="0.8" />
        </svg>
      );
      case 6: return ( // Cubo
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="20" y="30" width="40" height="40" fill="currentColor" opacity="0.9" />
          <polygon points="60,30 80,20 80,60 60,70" fill="currentColor" opacity="0.7" />
          <polygon points="20,30 40,20 80,20 60,30" fill="currentColor" opacity="0.8" />
        </svg>
      );
      case 8: return ( // Octaedro
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,10 80,50 50,90 20,50" fill="currentColor" opacity="0.9" />
          <polygon points="50,10 80,50 65,30" fill="currentColor" opacity="0.7" />
        </svg>
      );
      case 12: return ( // Dodecaedro
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,15 75,30 75,60 50,75 25,60 25,30" fill="currentColor" opacity="0.9" />
          <polygon points="50,15 75,30 65,25" fill="currentColor" opacity="0.7" />
        </svg>
      );
      case 20: return ( // Icosaedro
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,10 70,35 50,60 30,35" fill="currentColor" opacity="0.9" />
          <polygon points="50,60 70,85 50,95 30,85" fill="currentColor" opacity="0.8" />
          <polygon points="70,35 85,50 70,85" fill="currentColor" opacity="0.7" />
        </svg>
      );
      default: return ( // d10, d100 - similar ao d10
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,10 80,45 60,85 40,85 20,45" fill="currentColor" opacity="0.9" />
          <polygon points="50,10 80,45 65,30" fill="currentColor" opacity="0.7" />
        </svg>
      );
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      {isRolling ? (
        // Animação de rolagem
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${getDiceColor()} rounded-lg shadow-2xl flex items-center justify-center text-white font-bold`}
          animate={{
            rotateX: [0, 360, 720, 1080],
            rotateY: [0, 360, 720, 1080],
            rotateZ: [0, 180, 360, 540],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            times: [0, 0.3, 0.6, 0.9, 1],
          }}
          style={{
            perspective: 1000,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="opacity-50">
            {getDiceShape()}
          </div>
        </motion.div>
      ) : result ? (
        // Resultado final com bounce
        <motion.div
          initial={{ scale: 0, rotateZ: -180 }}
          animate={{ scale: 1, rotateZ: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className={`absolute inset-0 bg-gradient-to-br ${getDiceColor()} rounded-lg shadow-2xl flex flex-col items-center justify-center text-white border-4 border-white/30`}
        >
          <div className="text-center">
            <div className="font-bold">{result}</div>
            <div className="text-xs opacity-70 mt-1">d{diceType}</div>
          </div>
        </motion.div>
      ) : (
        // Estado inicial
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`absolute inset-0 bg-gradient-to-br ${getDiceColor()} rounded-lg shadow-xl flex flex-col items-center justify-center text-white cursor-pointer border-2 border-white/20`}
        >
          <div className="opacity-60 mb-1">
            {getDiceShape()}
          </div>
          <div className="text-xs opacity-70">d{diceType}</div>
        </motion.div>
      )}
    </div>
  );
}
