'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Dice3DProps {
  diceType: 4 | 6 | 8 | 10 | 12 | 20 | 100;
  isRolling: boolean;
  result?: number;
  size?: number;
}

/**
 * Componente de dado 3D realista com faces numeradas
 * Usa CSS 3D transforms para criar dados geométricos fiéis
 */
export default function Dice3D({ diceType, isRolling, result, size = 100 }: Dice3DProps) {
  const getDiceColor = () => {
    switch (diceType) {
      case 4: return { primary: '#3b82f6', secondary: '#1e40af', text: '#fff' };
      case 6: return { primary: '#22c55e', secondary: '#15803d', text: '#fff' };
      case 8: return { primary: '#eab308', secondary: '#a16207', text: '#000' };
      case 10: return { primary: '#f97316', secondary: '#c2410c', text: '#fff' };
      case 12: return { primary: '#ef4444', secondary: '#b91c1c', text: '#fff' };
      case 20: return { primary: '#a855f7', secondary: '#7e22ce', text: '#fff' };
      case 100: return { primary: '#ec4899', secondary: '#be185d', text: '#fff' };
    }
  };

  const colors = getDiceColor();

  // Componente de ponto para dados com pips (d6)
  const Pip = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={cn("absolute w-3 h-3 bg-white rounded-full shadow-inner", className)} style={style} />
  );

  // Renderiza face do d6 com pontos
  const D6Face = ({ number }: { number: number }) => {
    const pipConfigs = {
      1: [{ style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }],
      2: [
        { style: { top: '25%', left: '25%' } },
        { style: { bottom: '25%', right: '25%' } },
      ],
      3: [
        { style: { top: '25%', left: '25%' } },
        { style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { style: { bottom: '25%', right: '25%' } },
      ],
      4: [
        { style: { top: '25%', left: '25%' } },
        { style: { top: '25%', right: '25%' } },
        { style: { bottom: '25%', left: '25%' } },
        { style: { bottom: '25%', right: '25%' } },
      ],
      5: [
        { style: { top: '25%', left: '25%' } },
        { style: { top: '25%', right: '25%' } },
        { style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
        { style: { bottom: '25%', left: '25%' } },
        { style: { bottom: '25%', right: '25%' } },
      ],
      6: [
        { style: { top: '20%', left: '25%' } },
        { style: { top: '50%', left: '25%', transform: 'translateY(-50%)' } },
        { style: { bottom: '20%', left: '25%' } },
        { style: { top: '20%', right: '25%' } },
        { style: { top: '50%', right: '25%', transform: 'translateY(-50%)' } },
        { style: { bottom: '20%', right: '25%' } },
      ],
    };

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {pipConfigs[number as keyof typeof pipConfigs]?.map((pip, i) => (
          <Pip key={i} className="pip" style={pip.style} />
        ))}
      </div>
    );
  };

  // Renderiza d6 (cubo) com 6 faces
  const renderD6 = () => (
    <div
      className="dice-3d"
      style={{
        width: size,
        height: size,
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}
    >
      {/* Face 1 - Frente */}
      <div
        className="dice-face"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          transform: `translateZ(${size / 2}px)`,
        }}
      >
        <D6Face number={1} />
      </div>

      {/* Face 2 - Direita */}
      <div
        className="dice-face"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          transform: `rotateY(90deg) translateZ(${size / 2}px)`,
        }}
      >
        <D6Face number={2} />
      </div>

      {/* Face 3 - Topo */}
      <div
        className="dice-face"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          transform: `rotateX(90deg) translateZ(${size / 2}px)`,
        }}
      >
        <D6Face number={3} />
      </div>

      {/* Face 4 - Fundo */}
      <div
        className="dice-face"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          transform: `rotateX(-90deg) translateZ(${size / 2}px)`,
        }}
      >
        <D6Face number={4} />
      </div>

      {/* Face 5 - Esquerda */}
      <div
        className="dice-face"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          transform: `rotateY(-90deg) translateZ(${size / 2}px)`,
        }}
      >
        <D6Face number={5} />
      </div>

      {/* Face 6 - Trás */}
      <div
        className="dice-face"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          transform: `rotateY(180deg) translateZ(${size / 2}px)`,
        }}
      >
        <D6Face number={6} />
      </div>
    </div>
  );

  // Renderiza d20 (icosaedro simplificado com 20 faces triangulares)
  const renderD20 = () => {
    const faces = Array.from({ length: 20 }, (_, i) => i + 1);

    return (
      <div
        className="dice-3d"
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {faces.map((num, i) => {
          const angle = (360 / 20) * i;
          const elevation = i < 10 ? 30 : -30;

          return (
            <div
              key={num}
              className="dice-face-triangle"
              style={{
                position: 'absolute',
                width: size * 0.4,
                height: size * 0.4,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                transform: `rotateY(${angle}deg) rotateX(${elevation}deg) translateZ(${size / 2}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.15,
                fontWeight: 'bold',
                color: colors.text,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {num}
            </div>
          );
        })}
      </div>
    );
  };

  // Renderiza outros dados com números
  const renderGenericDice = () => {
    const faceCount = diceType === 100 ? 10 : diceType;
    const faces = Array.from({ length: faceCount }, (_, i) =>
      diceType === 100 ? (i + 1) * 10 : i + 1
    );

    return (
      <div
        className="dice-3d"
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {faces.map((num, i) => {
          const angle = (360 / faceCount) * i;

          return (
            <div
              key={num}
              className="dice-face-poly"
              style={{
                position: 'absolute',
                width: size * 0.6,
                height: size * 0.6,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                transform: `rotateY(${angle}deg) translateZ(${size / 2}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.25,
                fontWeight: 'bold',
                color: colors.text,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {num}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDice = () => {
    switch (diceType) {
      case 6:
        return renderD6();
      case 20:
        return renderD20();
      default:
        return renderGenericDice();
    }
  };

  // Rotações finais baseadas no resultado
  const getResultRotation = () => {
    if (!result) return { rotateX: 0, rotateY: 0, rotateZ: 0 };

    if (diceType === 6) {
      const rotations = {
        1: { rotateX: 0, rotateY: 0, rotateZ: 0 },
        2: { rotateX: 0, rotateY: 90, rotateZ: 0 },
        3: { rotateX: -90, rotateY: 0, rotateZ: 0 },
        4: { rotateX: 90, rotateY: 0, rotateZ: 0 },
        5: { rotateX: 0, rotateY: -90, rotateZ: 0 },
        6: { rotateX: 0, rotateY: 180, rotateZ: 0 },
      };
      return rotations[result as keyof typeof rotations] || { rotateX: 0, rotateY: 0, rotateZ: 0 };
    }

    // Para outros dados, rotação aproximada
    const angle = ((result - 1) * 360) / diceType;
    return { rotateX: 0, rotateY: angle, rotateZ: 0 };
  };

  const finalRotation = getResultRotation();

  return (
    <div
      className="dice-container"
      style={{
        perspective: size * 4,
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        animate={
          isRolling
            ? {
                rotateX: [0, 360, 720, 1080, 1440],
                rotateY: [0, 360, 720, 1080, 1440],
                rotateZ: [0, 180, 360, 540, 720],
              }
            : result
            ? finalRotation
            : { rotateX: -20, rotateY: 30, rotateZ: 0 }
        }
        transition={
          isRolling
            ? {
                duration: 1.5,
                ease: [0.34, 1.56, 0.64, 1],
                times: [0, 0.25, 0.5, 0.75, 1],
              }
            : {
                type: 'spring',
                stiffness: 100,
                damping: 15,
              }
        }
        style={{
          transformStyle: 'preserve-3d',
          width: size,
          height: size,
        }}
      >
        {renderDice()}
      </motion.div>

      <style jsx global>{`
        .dice-face,
        .dice-face-poly,
        .dice-face-triangle {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
        }

        .dice-face {
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
        }

        .pip {
          box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
