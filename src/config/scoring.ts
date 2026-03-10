/**
 * Scoring configuration and formulas
 */

// Stats caps
export const STATS_CAP = {
  streams: 999999,
  followers: 999999,
  visibility: 999999,
};

// Base scoring multipliers
export const SCORING = {
  basePointsPerTile: 12,
  bonusPerExtraTile: 0.18, // 18% bonus per tile above minimum

  // Points to stats conversion
  streamsPerPoint: 40,
  followersPerPoint: 8,
  visibilityPerPoint: 15,

  // Rank reduction per points
  rankReductionDivisor: 20,
};

// Special tile rewards
export const SPECIAL_REWARDS = {
  EP: {
    streams: 8000,
    followers: 2000,
    visibility: 3000,
  },
  ALBUM: {
    streams: 25000,
    followers: 8000,
    visibility: 12000,
  },
  CHART: {
    visibility: 20000,
    rankJumpMin: 5,
    rankJumpMax: 15,
  },
};

// Multiplier durations
export const MULTIPLIERS = {
  viral: {
    multiplier: 3,
    duration: 3, // collapses
  },
  collab: {
    multiplier: 2,
    duration: 1, // next collapse only
  },
};

// Ability bonuses
export const ABILITY_BONUSES = {
  hype: {
    pressureTimePerTile: 350, // ms
    maxPressureTime: 5000, // ms cap
  },
  label: {
    visibilityMultiplier: 30,
    followersMultiplier: 10,
  },
};

/**
 * Calculate collapse score
 */
export function calculateCollapseScore(
  tilesCleared: number,
  viralMultiplier: number = 1,
  collabActive: boolean = false
): number {
  const base = tilesCleared * SCORING.basePointsPerTile;
  const extraTiles = Math.max(0, tilesCleared - 3);
  const sizeBonus = 1 + extraTiles * SCORING.bonusPerExtraTile;
  const collabMult = collabActive ? MULTIPLIERS.collab.multiplier : 1;

  return Math.floor(base * viralMultiplier * collabMult * sizeBonus);
}

/**
 * Convert points to stat gains
 */
export function pointsToStats(points: number): {
  streams: number;
  followers: number;
  visibility: number;
  rankReduction: number;
} {
  return {
    streams: points * SCORING.streamsPerPoint,
    followers: points * SCORING.followersPerPoint,
    visibility: points * SCORING.visibilityPerPoint,
    rankReduction: Math.floor(points / SCORING.rankReductionDivisor),
  };
}

/**
 * Format large numbers for display
 */
export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}
