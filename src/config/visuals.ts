/**
 * Visual configuration for rendering
 */

export const VISUAL = {
  // Background
  backgroundColor: 0x07070f,

  // Board
  boardPadding: 2,
  tileGap: 0, // seamless tiles
  tileCornerRadius: 8,

  // Glow effects
  clusterGlowIntensity: 0.28,
  clusterGlowPulseSpeed: 0.0045,

  // Screen shake
  shakeDecay: 0.74,
  smallShakeIntensity: 7,
  largeShakeIntensity: 12,
  largeShakeThreshold: 6, // tiles cleared

  // Ghost piece
  ghostAlpha: 0.28,
  ghostDashLength: 4,
  ghostGapLength: 4,
};

// Particle configuration per tile type
export const PARTICLE_CONFIG: Record<string, {
  count: number;
  direction: 'up' | 'fan' | 'radial' | 'scatter';
  speed: { base: number; variance: number };
  gravity: number;
  decay: { base: number; variance: number };
  size: { base: number; variance: number };
  colors: number[];
}> = {
  // Streams - vertical jet upward
  VOCAL: {
    count: 22,
    direction: 'up',
    speed: { base: 10, variance: 4 },
    gravity: 0.04,
    decay: { base: 0.04, variance: 0.02 },
    size: { base: 3.5, variance: 1.5 },
    colors: [0xffffff, 0x00e5ff, 0x80f0ff],
  },
  FLOW: {
    count: 22,
    direction: 'up',
    speed: { base: 10, variance: 4 },
    gravity: 0.04,
    decay: { base: 0.04, variance: 0.02 },
    size: { base: 3.5, variance: 1.5 },
    colors: [0xffffff, 0x39ff14, 0x90ff70],
  },

  // Followers - horizontal fan
  LABEL: {
    count: 18,
    direction: 'fan',
    speed: { base: 6, variance: 3 },
    gravity: 0.1,
    decay: { base: 0.035, variance: 0.015 },
    size: { base: 4, variance: 2 },
    colors: [0xffffff, 0xc060ff, 0xdd99ff, 0xff80ff],
  },
  BEAT: {
    count: 18,
    direction: 'fan',
    speed: { base: 6, variance: 3 },
    gravity: 0.1,
    decay: { base: 0.035, variance: 0.015 },
    size: { base: 4, variance: 2 },
    colors: [0xffffff, 0xff4d8a, 0xff80aa],
  },

  // Visibility - radial shockwave
  HYPE: {
    count: 24,
    direction: 'radial',
    speed: { base: 8, variance: 4 },
    gravity: 0,
    decay: { base: 0.04, variance: 0.02 },
    size: { base: 5, variance: 2 },
    colors: [0xffffff, 0xffe600, 0xfff080],
  },
  WILD: {
    count: 24,
    direction: 'radial',
    speed: { base: 8, variance: 4 },
    gravity: 0,
    decay: { base: 0.04, variance: 0.02 },
    size: { base: 5, variance: 2 },
    colors: [0xffffff, 0xff8c00, 0xffcc66],
  },

  // Default scatter
  DEFAULT: {
    count: 18,
    direction: 'scatter',
    speed: { base: 5, variance: 3 },
    gravity: 0.12,
    decay: { base: 0.03, variance: 0.015 },
    size: { base: 4, variance: 2 },
    colors: [0xffffff],
  },

  // Garbage smash
  GARBAGE: {
    count: 10,
    direction: 'radial',
    speed: { base: 4, variance: 2 },
    gravity: 0.15,
    decay: { base: 0.06, variance: 0.02 },
    size: { base: 3, variance: 1 },
    colors: [0xff0033, 0xff4444, 0xaa0022],
  },
};

// Post-processing settings
export const POST_FX = {
  bloom: {
    enabled: true,
    strength: 0.5,
    radius: 2,
    pulseStrength: 1.5,
    pulseDuration: 0.1,
  },
  crt: {
    enabled: true,
    scanlineIntensity: 0.08,
  },
  chromatic: {
    enabled: true,
    baseOffset: 0,
    shakeOffset: 2,
  },
};
