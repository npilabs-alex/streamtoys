/**
 * Tile type definitions and configuration
 */

export const TILE_TYPES = ['BEAT', 'VOCAL', 'FLOW', 'HYPE', 'LABEL', 'WILD'] as const;
export type TileType = (typeof TILE_TYPES)[number];

export const SPECIAL_TYPES = ['EP', 'ALBUM', 'VIRAL', 'CHART', 'COLLAB'] as const;
export type SpecialType = (typeof SPECIAL_TYPES)[number];

export const GARBAGE_TYPE = 'GARBAGE' as const;
export type GarbageType = typeof GARBAGE_TYPE;

export type AnyTileType = TileType | SpecialType | GarbageType;

// Color palette for each tile type
export const TILE_COLORS: Record<AnyTileType, {
  base: number;
  mid: number;
  light: number;
  dark: number;
  glow: number;
}> = {
  BEAT:    { base: 0xff1a5e, mid: 0xff4d8a, light: 0xff80aa, dark: 0xaa0033, glow: 0xff4070 },
  VOCAL:   { base: 0x00c8e6, mid: 0x00e5ff, light: 0x80f0ff, dark: 0x006688, glow: 0x00e5ff },
  FLOW:    { base: 0x22cc00, mid: 0x39ff14, light: 0x90ff70, dark: 0x008800, glow: 0x44ff22 },
  HYPE:    { base: 0xe6c800, mid: 0xffe600, light: 0xfff080, dark: 0x887000, glow: 0xffe600 },
  LABEL:   { base: 0x9933cc, mid: 0xc060ff, light: 0xdd99ff, dark: 0x550088, glow: 0xcc44ff },
  WILD:    { base: 0xcc5500, mid: 0xff8c00, light: 0xffcc66, dark: 0x882200, glow: 0xff9900 },
  EP:      { base: 0xcc44aa, mid: 0xff9de2, light: 0xffccee, dark: 0x881166, glow: 0xff66cc },
  ALBUM:   { base: 0xaa8800, mid: 0xffd700, light: 0xfff0aa, dark: 0x664400, glow: 0xffdd44 },
  VIRAL:   { base: 0xcc1111, mid: 0xff4444, light: 0xff9999, dark: 0x880000, glow: 0xff3333 },
  CHART:   { base: 0x009966, mid: 0x00ffaa, light: 0x99ffdd, dark: 0x005533, glow: 0x00ffaa },
  COLLAB:  { base: 0x66aacc, mid: 0xaaffee, light: 0xddfff8, dark: 0x224466, glow: 0x88ffee },
  GARBAGE: { base: 0x0d0d18, mid: 0x161626, light: 0x2a2a44, dark: 0x060610, glow: 0xff0033 },
};

// Icons/emojis for tile types (used in UI)
export const TILE_ICONS: Record<AnyTileType, string> = {
  BEAT: '🥁',
  VOCAL: '🎤',
  FLOW: '🎵',
  HYPE: '⚡',
  LABEL: '🏷',
  WILD: '★',
  EP: '💿',
  ALBUM: '🎵',
  VIRAL: '🔥',
  CHART: '📊',
  COLLAB: '🤝',
  GARBAGE: '💀',
};

// Ability descriptions for HUD hints
export const ABILITY_DESC: Record<AnyTileType, string> = {
  BEAT:  '🥁 BEAT → clears bottom row',
  VOCAL: '🎤 VOX  → garbage→WILD',
  FLOW:  '🎵 FLOW → packs column',
  HYPE:  '⚡ HYPE → resets pressure',
  LABEL: '🏷 LABEL→ visibility boost',
  WILD:  '★ WILD → nukes one type',
  EP:    '💿 EP   → streams burst',
  ALBUM: '🎵 ALBUM→ mega clear',
  VIRAL: '🔥 VIRAL→ 3× multiplier',
  CHART: '📊 CHART→ rank jump',
  COLLAB:'🤝 COLLAB→ doubles next',
  GARBAGE: '💀 GARBAGE → clear adjacent',
};

// Spawn weights for regular tile types (higher = more common)
// BEAT, VOCAL, FLOW, HYPE appear at 2x frequency
export const TILE_SPAWN_WEIGHTS: Record<TileType, number> = {
  BEAT: 2,
  VOCAL: 2,
  FLOW: 2,
  HYPE: 2,
  LABEL: 1,
  WILD: 1,
};

// Build weighted pool for random selection
export function buildTilePool(): TileType[] {
  const pool: TileType[] = [];
  for (const [type, weight] of Object.entries(TILE_SPAWN_WEIGHTS)) {
    for (let i = 0; i < weight; i++) {
      pool.push(type as TileType);
    }
  }
  return pool;
}

// Special tile spawn probability
export const SPECIAL_SPAWN_CHANCE = 0.12;

// Minimum cluster size to collapse
export const MIN_CLUSTER_SIZE = 3;
