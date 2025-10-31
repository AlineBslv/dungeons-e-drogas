'use client';

import { motion } from 'framer-motion';

interface PerfectDiceProps {
  diceType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
  isRolling: boolean;
  result?: number;
  size?: number;
}

/**
 * Dado 3D perfeito com geometria corrigida
 * Baseado em exemplos testados de CSS 3D
 */
export default function PerfectDice({ diceType, isRolling, result, size = 100 }: PerfectDiceProps) {

  // Para d6, vamos usar um cubo CSS clássico e bem testado
  if (diceType === 6) {
    const Dot = ({ position }: { position: string }) => (
      <div
        className={`absolute w-[18%] h-[18%] bg-black rounded-full ${position}`}
        style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}
      />
    );

    const faces = [
      // Face 1 (frente)
      <div
        key="1"
        className="absolute w-full h-full bg-white border-2 border-gray-300 flex items-center justify-center"
        style={{
          transform: `rotateY(0deg) translateZ(${size/2}px)`,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
        }}
      >
        <Dot position="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>,

      // Face 6 (trás)
      <div
        key="6"
        className="absolute w-full h-full bg-white border-2 border-gray-300 flex items-center justify-center"
        style={{
          transform: `rotateY(180deg) translateZ(${size/2}px)`,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
        }}
      >
        <Dot position="top-[20%] left-[25%]" />
        <Dot position="top-[20%] right-[25%]" />
        <Dot position="top-1/2 left-[25%] -translate-y-1/2" />
        <Dot position="top-1/2 right-[25%] -translate-y-1/2" />
        <Dot position="bottom-[20%] left-[25%]" />
        <Dot position="bottom-[20%] right-[25%]" />
      </div>,

      // Face 3 (direita)
      <div
        key="3"
        className="absolute w-full h-full bg-white border-2 border-gray-300"
        style={{
          transform: `rotateY(90deg) translateZ(${size/2}px)`,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
        }}
      >
        <Dot position="top-[25%] left-[25%]" />
        <Dot position="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <Dot position="bottom-[25%] right-[25%]" />
      </div>,

      // Face 4 (esquerda)
      <div
        key="4"
        className="absolute w-full h-full bg-white border-2 border-gray-300"
        style={{
          transform: `rotateY(-90deg) translateZ(${size/2}px)`,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
        }}
      >
        <Dot position="top-[25%] left-[25%]" />
        <Dot position="top-[25%] right-[25%]" />
        <Dot position="bottom-[25%] left-[25%]" />
        <Dot position="bottom-[25%] right-[25%]" />
      </div>,

      // Face 5 (topo)
      <div
        key="5"
        className="absolute w-full h-full bg-white border-2 border-gray-300"
        style={{
          transform: `rotateX(90deg) translateZ(${size/2}px)`,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
        }}
      >
        <Dot position="top-[25%] left-[25%]" />
        <Dot position="top-[25%] right-[25%]" />
        <Dot position="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <Dot position="bottom-[25%] left-[25%]" />
        <Dot position="bottom-[25%] right-[25%]" />
      </div>,

      // Face 2 (fundo)
      <div
        key="2"
        className="absolute w-full h-full bg-white border-2 border-gray-300"
        style={{
          transform: `rotateX(-90deg) translateZ(${size/2}px)`,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
        }}
      >
        <Dot position="top-[30%] left-[30%]" />
        <Dot position="bottom-[30%] right-[30%]" />
      </div>,
    ];

    const getD6Rotation = () => {
      if (!result) return { rotateX: -30, rotateY: -30, rotateZ: 0 };

      const rotations: Record<number, { rotateX: number; rotateY: number; rotateZ: number }> = {
        1: { rotateX: 0, rotateY: 0, rotateZ: 0 },
        2: { rotateX: 90, rotateY: 0, rotateZ: 0 },
        3: { rotateX: 0, rotateY: -90, rotateZ: 0 },
        4: { rotateX: 0, rotateY: 90, rotateZ: 0 },
        5: { rotateX: -90, rotateY: 0, rotateZ: 0 },
        6: { rotateX: 0, rotateY: 180, rotateZ: 0 },
      };

      return rotations[result] || { rotateX: 0, rotateY: 0, rotateZ: 0 };
    };

    return (
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          perspective: `${size * 4}px`,
        }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
          }}
          animate={isRolling ? {
            rotateX: [0, 360, 720, 1080],
            rotateY: [0, 360, 720, 1080],
            rotateZ: [0, 180, 360, 540],
          } : getD6Rotation()}
          transition={isRolling ? {
            duration: 1.5,
            ease: "easeInOut",
            times: [0, 0.33, 0.66, 1],
          } : {
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
        >
          {faces}
        </motion.div>
      </div>
    );
  }

  // Para d20, vamos usar um visual simplificado mas bonito
  if (diceType === 20) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
          perspective: `${size * 3}px`,
        }}
      >
        <motion.div
          className="relative flex items-center justify-center"
          style={{
            width: size * 0.9,
            height: size * 0.9,
            transformStyle: 'preserve-3d',
          }}
          animate={isRolling ? {
            rotateX: [0, 360, 720],
            rotateY: [0, 360, 720],
            rotateZ: [0, 180, 360],
          } : {
            rotateX: -20,
            rotateY: 30,
            rotateZ: 0,
          }}
          transition={isRolling ? {
            duration: 1.5,
            ease: "easeInOut",
          } : {
            type: "spring",
            stiffness: 120,
            damping: 20,
          }}
        >
          {/* Icosaedro simplificado - pentágono com faces */}
          <div
            className="absolute"
            style={{
              width: size * 0.7,
              height: size * 0.7,
              background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size * 0.3,
              fontWeight: '900',
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: `
                inset 0 4px 16px rgba(255,255,255,0.2),
                0 8px 32px rgba(0,0,0,0.3)
              `,
            }}
          >
            {result || '20'}
          </div>
        </motion.div>
      </div>
    );
  }

  // Para outros dados, usar formato octogonal/circular bonito
  const colors: Record<number, string> = {
    4: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    8: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    10: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    12: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    100: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  };

  const textColors: Record<number, string> = {
    4: 'white',
    8: '#1e293b',
    10: 'white',
    12: 'white',
    100: 'white',
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        perspective: `${size * 3}px`,
      }}
    >
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          transformStyle: 'preserve-3d',
        }}
        animate={isRolling ? {
          rotateX: [0, 360, 720],
          rotateY: [0, 360, 720],
          rotateZ: [0, 180, 360],
        } : {
          rotateX: -15,
          rotateY: 25,
          rotateZ: 0,
        }}
        transition={isRolling ? {
          duration: 1.5,
          ease: "easeInOut",
        } : {
          type: "spring",
          stiffness: 120,
          damping: 20,
        }}
      >
        <div
          className="absolute rounded-2xl"
          style={{
            width: '100%',
            height: '100%',
            background: colors[diceType],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.4,
            fontWeight: '900',
            color: textColors[diceType],
            textShadow: textColors[diceType] === 'white'
              ? '0 3px 8px rgba(0,0,0,0.6)'
              : '0 2px 4px rgba(255,255,255,0.5)',
            border: '3px solid rgba(255,255,255,0.3)',
            boxShadow: `
              inset 0 4px 16px rgba(255,255,255,0.25),
              inset 0 -4px 12px rgba(0,0,0,0.2),
              0 8px 32px rgba(0,0,0,0.4)
            `,
          }}
        >
          <div className="flex flex-col items-center">
            <div>{result || diceType}</div>
            <div className="text-xs opacity-70 mt-1">d{diceType}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
