'use client';

import { motion } from 'framer-motion';

interface RealisticDice3DProps {
  diceType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
  isRolling: boolean;
  result?: number;
  size?: number;
}

/**
 * Dado 3D ultra-realista com CSS puro
 * Inspirado em dados físicos reais
 */
export default function RealisticDice3D({ diceType, isRolling, result, size = 120 }: RealisticDice3DProps) {
  const getDiceColor = () => {
    switch (diceType) {
      case 4: return { bg: '#3b82f6', shadow: '#1e3a8a', border: '#60a5fa' };
      case 6: return { bg: '#f8fafc', shadow: '#cbd5e1', border: '#e2e8f0' };
      case 8: return { bg: '#fbbf24', shadow: '#b45309', border: '#fcd34d' };
      case 10: return { bg: '#f97316', shadow: '#9a3412', border: '#fb923c' };
      case 12: return { bg: '#ef4444', shadow: '#7f1d1d', border: '#f87171' };
      case 20: return { bg: '#a855f7', shadow: '#581c87', border: '#c084fc' };
      case 100: return { bg: '#ec4899', shadow: '#831843', border: '#f472b6' };
    }
  };

  const colors = getDiceColor();
  const isDark = diceType !== 6;

  // Renderiza D6 (cubo) com pontos realistas
  const renderD6 = () => {
    const Dot = ({ style }: { style?: React.CSSProperties }) => (
      <div
        className="absolute rounded-full bg-black shadow-inner"
        style={{
          width: size * 0.12,
          height: size * 0.12,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
          ...style,
        }}
      />
    );

    const faces = [
      // Face 1 (frente)
      <div key="face-1" className="dice-face" style={{ transform: `translateZ(${size / 2}px)` }}>
        <Dot style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>,

      // Face 2 (direita)
      <div key="face-2" className="dice-face" style={{ transform: `rotateY(90deg) translateZ(${size / 2}px)` }}>
        <Dot style={{ top: '30%', left: '30%' }} />
        <Dot style={{ bottom: '30%', right: '30%' }} />
      </div>,

      // Face 3 (topo)
      <div key="face-3" className="dice-face" style={{ transform: `rotateX(90deg) translateZ(${size / 2}px)` }}>
        <Dot style={{ top: '25%', left: '25%' }} />
        <Dot style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <Dot style={{ bottom: '25%', right: '25%' }} />
      </div>,

      // Face 4 (fundo)
      <div key="face-4" className="dice-face" style={{ transform: `rotateX(-90deg) translateZ(${size / 2}px)` }}>
        <Dot style={{ top: '25%', left: '25%' }} />
        <Dot style={{ top: '25%', right: '25%' }} />
        <Dot style={{ bottom: '25%', left: '25%' }} />
        <Dot style={{ bottom: '25%', right: '25%' }} />
      </div>,

      // Face 5 (esquerda)
      <div key="face-5" className="dice-face" style={{ transform: `rotateY(-90deg) translateZ(${size / 2}px)` }}>
        <Dot style={{ top: '25%', left: '25%' }} />
        <Dot style={{ top: '25%', right: '25%' }} />
        <Dot style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <Dot style={{ bottom: '25%', left: '25%' }} />
        <Dot style={{ bottom: '25%', right: '25%' }} />
      </div>,

      // Face 6 (trás)
      <div key="face-6" className="dice-face" style={{ transform: `rotateY(180deg) translateZ(${size / 2}px)` }}>
        <Dot style={{ top: '20%', left: '30%' }} />
        <Dot style={{ top: '50%', left: '30%', transform: 'translateY(-50%)' }} />
        <Dot style={{ bottom: '20%', left: '30%' }} />
        <Dot style={{ top: '20%', right: '30%' }} />
        <Dot style={{ top: '50%', right: '30%', transform: 'translateY(-50%)' }} />
        <Dot style={{ bottom: '20%', right: '30%' }} />
      </div>,
    ];

    return <>{faces}</>;
  };

  // Renderiza D20 com faces numeradas
  const renderD20 = () => {
    const faces = Array.from({ length: 20 }, (_, i) => {
      const angle = (360 / 20) * i;
      const elevation = i < 10 ? 45 : -45;
      const tilt = i % 2 === 0 ? 10 : -10;

      return (
        <div
          key={`d20-${i + 1}`}
          className="dice-face-poly"
          style={{
            position: 'absolute',
            width: size * 0.45,
            height: size * 0.45,
            background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.shadow} 100%)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            transform: `rotateY(${angle}deg) rotateX(${elevation}deg) rotateZ(${tilt}deg) translateZ(${size * 0.4}px)`,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: size * 0.08,
            fontSize: size * 0.16,
            fontWeight: '800',
            color: '#fff',
            textShadow: '0 2px 6px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.8)',
            border: `1px solid ${colors.border}`,
            boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {i + 1}
        </div>
      );
    });

    return <>{faces}</>;
  };

  // Renderiza outros dados
  const renderOtherDice = () => {
    const faceCount = diceType === 100 ? 10 : diceType;
    const faces = Array.from({ length: faceCount }, (_, i) => {
      const number = diceType === 100 ? (i + 1) * 10 : i + 1;
      const angle = (360 / faceCount) * i;

      return (
        <div
          key={`d${diceType}-${number}`}
          className="dice-face-numbered"
          style={{
            position: 'absolute',
            width: size * 0.75,
            height: size * 0.75,
            background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.shadow} 100%)`,
            transform: `rotateY(${angle}deg) translateZ(${size / 2}px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.35,
            fontWeight: '900',
            color: isDark ? '#fff' : '#1e293b',
            textShadow: isDark ? '0 3px 8px rgba(0,0,0,0.7)' : '0 2px 4px rgba(255,255,255,0.8)',
            border: `3px solid ${colors.border}`,
            borderRadius: size * 0.08,
            boxShadow: `
              inset 0 2px 12px rgba(255,255,255,0.25),
              inset 0 -2px 8px rgba(0,0,0,0.2),
              0 4px 12px rgba(0,0,0,0.4)
            `,
          }}
        >
          {number}
        </div>
      );
    });

    return <>{faces}</>;
  };

  // Rotação final baseada no resultado
  const getResultRotation = () => {
    if (!result) return { rotateX: -25, rotateY: 35, rotateZ: 0 };

    if (diceType === 6) {
      const rotations: Record<number, { rotateX: number; rotateY: number; rotateZ: number }> = {
        1: { rotateX: 0, rotateY: 0, rotateZ: 0 },
        2: { rotateX: 0, rotateY: 90, rotateZ: 0 },
        3: { rotateX: -90, rotateY: 0, rotateZ: 0 },
        4: { rotateX: 90, rotateY: 0, rotateZ: 0 },
        5: { rotateX: 0, rotateY: -90, rotateZ: 0 },
        6: { rotateX: 0, rotateY: 180, rotateZ: 0 },
      };
      return rotations[result] || { rotateX: 0, rotateY: 0, rotateZ: 0 };
    }

    const faceCount = diceType === 100 ? 10 : diceType;
    const faceIndex = diceType === 100 ? (result / 10) - 1 : result - 1;
    const angle = (faceIndex * 360) / faceCount;

    return { rotateX: 0, rotateY: -angle, rotateZ: 0 };
  };

  const finalRotation = getResultRotation();

  return (
    <div
      className="dice-container relative"
      style={{
        perspective: size * 5,
        perspectiveOrigin: '50% 50%',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        className="dice-wrapper"
        animate={
          isRolling
            ? {
                rotateX: [0, 360, 720, 1080, 1440, 1800],
                rotateY: [0, 360, 720, 1080, 1440, 1800],
                rotateZ: [0, 180, 360, 540, 720, 900],
              }
            : finalRotation
        }
        transition={
          isRolling
            ? {
                duration: 2.0,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
              }
            : {
                type: 'spring',
                stiffness: 120,
                damping: 20,
                mass: 1.2,
              }
        }
        style={{
          transformStyle: 'preserve-3d',
          width: size,
          height: size,
          position: 'relative',
          filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.4))',
        }}
      >
        <div
          className="dice-cube"
          style={{
            transformStyle: 'preserve-3d',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {diceType === 6 && renderD6()}
          {diceType === 20 && renderD20()}
          {diceType !== 6 && diceType !== 20 && renderOtherDice()}
        </div>
      </motion.div>

      <style jsx global>{`
        .dice-face {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, ${colors.bg} 0%, ${colors.shadow} 100%);
          border: 3px solid ${colors.border};
          border-radius: ${size * 0.08}px;
          backface-visibility: hidden;
          box-shadow:
            inset 0 4px 16px rgba(255,255,255,0.3),
            inset 0 -4px 12px rgba(0,0,0,0.25),
            0 8px 20px rgba(0,0,0,0.4);
        }

        .dice-face-poly,
        .dice-face-numbered {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
