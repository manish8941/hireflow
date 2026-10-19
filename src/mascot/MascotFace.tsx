import React from 'react';

export type MascotExpression =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'curious'
  | 'thinking'
  | 'listening'
  | 'confused'
  | 'surprised'
  | 'sleepy'
  | 'shy'
  | 'sad'
  | 'working'
  | 'error'
  | 'success';

export interface MascotFaceProps {
  expression?: MascotExpression;
  size?: number | string;
  className?: string;
  ariaLabel?: string;
  isAnimated?: boolean;
  isBlinking?: boolean;
}

// Continuous, mathematically balanced silhouette matching Reference A
// Head: rounded-square (squircle) with broad cheeks and gentle chin curve
// Ears: two large, symmetrical circular arcs at top corners
// Tuft: small, centered rounded rectangular protrusion
// Color: Reference A vivid orange #FF4A0A
export const MASCOT_BODY_PATH = [
  'M 108,22',
  'L 132,22',
  'C 137,22 140,25 140,30',
  'L 140,54',
  'C 140,62 144,66 150,62',
  'C 155,59 158,53 160,46',
  'A 36 36 0 1 1 206,78',
  'C 208,82 210,88 211,96',
  'C 213,124 213,156 211,176',
  'C 208,202 192,216 160,216',
  'C 142,216.5 98,216.5 80,216',
  'C 48,216 32,202 29,176',
  'C 27,156 27,124 29,96',
  'C 30,88 32,82 34,78',
  'A 36 36 0 1 1 80,46',
  'C 82,53 85,59 90,62',
  'C 96,66 100,62 100,54',
  'L 100,30',
  'C 100,25 103,22 108,22',
  'Z'
].join(' ');

interface EyeGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  transform?: string;
}

interface ExpressionDefinition {
  left?: EyeGeometry;
  right?: EyeGeometry;
  customEyes?: React.ReactNode;
  headTransform?: string;
}

const EXPRESSIONS: Record<MascotExpression, ExpressionDefinition> = {
  neutral: {
    // Exact Reference A default geometry: two clean symmetrical vertical stadiums
    left: { x: 76, y: 90, w: 32, h: 70, rx: 16 },
    right: { x: 132, y: 90, w: 32, h: 70, rx: 16 },
  },
  happy: {
    // Friendly curved arch eyes (^ ^)
    customEyes: (
      <g fill="#FFFFFF">
        <path d="M 74,124 C 74,96 110,96 110,124 C 110,120 102,106 92,106 C 82,106 74,120 74,124 Z" />
        <path d="M 130,124 C 130,96 166,96 166,124 C 166,120 158,106 148,106 C 138,106 130,120 130,124 Z" />
      </g>
    ),
  },
  excited: {
    // Widened stadium eyes with subtle bounce
    left: { x: 74, y: 86, w: 36, h: 74, rx: 18 },
    right: { x: 130, y: 86, w: 36, h: 74, rx: 18 },
    headTransform: 'translateY(-4px)',
  },
  curious: {
    // Small, controlled asymmetry in eye height and subtle inquisitive tilt
    left: { x: 76, y: 82, w: 32, h: 74, rx: 16 },
    right: { x: 133, y: 92, w: 31, h: 68, rx: 15.5 },
    headTransform: 'rotate(2.5deg) translateY(-2px)',
  },
  thinking: {
    // Eyes glance upward sideways with slight contemplative head angle
    left: { x: 82, y: 82, w: 30, h: 66, rx: 15 },
    right: { x: 138, y: 82, w: 30, h: 66, rx: 15 },
    headTransform: 'rotate(-2deg) translateY(-2px)',
  },
  listening: {
    // Stable, attentive eyes
    left: { x: 77, y: 93, w: 31, h: 67, rx: 15.5 },
    right: { x: 132, y: 93, w: 31, h: 67, rx: 15.5 },
  },
  confused: {
    // Controlled asymmetry without excessive distortion
    left: { x: 76, y: 86, w: 32, h: 72, rx: 16 },
    right: { x: 133, y: 98, w: 30, h: 52, rx: 15 },
    headTransform: 'rotate(-3deg)',
  },
  surprised: {
    // Eyes widen slightly while keeping original alignment
    left: { x: 73, y: 84, w: 38, h: 78, rx: 19 },
    right: { x: 129, y: 84, w: 38, h: 78, rx: 19 },
  },
  sleepy: {
    // Smoothly closed eyelids
    left: { x: 76, y: 114, w: 32, h: 26, rx: 13 },
    right: { x: 132, y: 114, w: 32, h: 26, rx: 13 },
  },
  shy: {
    // Gentle downward glance
    left: { x: 77, y: 104, w: 30, h: 60, rx: 15 },
    right: { x: 133, y: 104, w: 30, h: 60, rx: 15 },
    headTransform: 'translateY(3px)',
  },
  sad: {
    // Softened, slightly lowered eyes with subtle angle
    left: { x: 76, y: 98, w: 30, h: 62, rx: 15, transform: 'rotate(-5 91 129)' },
    right: { x: 134, y: 98, w: 30, h: 62, rx: 15, transform: 'rotate(5 149 129)' },
  },
  working: {
    // Focused, steady eyes
    left: { x: 77, y: 94, w: 30, h: 64, rx: 15 },
    right: { x: 133, y: 94, w: 30, h: 64, rx: 15 },
  },
  error: {
    // Restrained concerned expression
    left: { x: 76, y: 96, w: 31, h: 58, rx: 15.5, transform: 'rotate(-4 91 125)' },
    right: { x: 133, y: 96, w: 31, h: 58, rx: 15.5, transform: 'rotate(4 148 125)' },
  },
  success: {
    // Bright happy arches with enthusiastic bounce
    customEyes: (
      <g fill="#FFFFFF">
        <path d="M 74,120 C 74,92 110,92 110,120 C 110,116 102,102 92,102 C 82,102 74,116 74,120 Z" />
        <path d="M 130,120 C 130,92 166,92 166,120 C 166,116 158,102 148,102 C 138,102 130,116 130,120 Z" />
      </g>
    ),
    headTransform: 'translateY(-5px)',
  },
};

export const MascotFace: React.FC<MascotFaceProps> = ({
  expression = 'neutral',
  size = 88,
  className = '',
  ariaLabel,
  isAnimated = true,
  isBlinking = false,
}) => {
  const currentExp = EXPRESSIONS[expression] || EXPRESSIONS.neutral;
  const canBlink = !currentExp.customEyes && expression !== 'sleepy';
  const shouldBlink = isBlinking && canBlink;

  const headStyle: React.CSSProperties = {
    transform: currentExp.headTransform || 'none',
    transformOrigin: '120px 120px',
    transition: isAnimated ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
  };

  const eyesGroupStyle: React.CSSProperties = {
    transform: `translate(var(--eye-glance-x, 0px), var(--eye-glance-y, 0px)) ${
      shouldBlink ? 'scaleY(0.08)' : 'scaleY(1)'
    }`,
    transformOrigin: '120px 125px',
    transition: shouldBlink
      ? 'transform 0.08s ease-out'
      : isAnimated
      ? 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)'
      : 'none',
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={`mascot-face-svg ${className}`}
      role="img"
      aria-label={ariaLabel || `HireFlow Mascot (${expression})`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <g className="mascot-face-head" style={headStyle}>
        {/* Flat, solid vivid orange body from Reference A (#FF4A0A) */}
        <path
          d={MASCOT_BODY_PATH}
          fill="#FF4A0A"
          style={{ transition: 'fill 0.3s ease' }}
        />

        {/* Eyes: Controlled, symmetric, clean white geometry with cursor glance and blink support */}
        <g className="mascot-eyes-group" style={eyesGroupStyle}>
          {currentExp.customEyes ? (
            currentExp.customEyes
          ) : (
            <>
              {currentExp.left && (
                <rect
                  x={currentExp.left.x}
                  y={currentExp.left.y}
                  width={currentExp.left.w}
                  height={currentExp.left.h}
                  rx={currentExp.left.rx}
                  ry={currentExp.left.rx}
                  fill="#FFFFFF"
                  transform={currentExp.left.transform}
                  style={{
                    transition: isAnimated ? 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                  }}
                />
              )}
              {currentExp.right && (
                <rect
                  x={currentExp.right.x}
                  y={currentExp.right.y}
                  width={currentExp.right.w}
                  height={currentExp.right.h}
                  rx={currentExp.right.rx}
                  ry={currentExp.right.rx}
                  fill="#FFFFFF"
                  transform={currentExp.right.transform}
                  style={{
                    transition: isAnimated ? 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                  }}
                />
              )}
            </>
          )}
        </g>
      </g>
    </svg>
  );
};
