/**
 * Board and piece configuration
 */

export const BOARD = {
  cols: 12,
  rows: 15,
  tileSize: 36, // base size, adjusted on resize
};

// Piece shape definitions
// Each shape has multiple rotation states
// Coordinates are [col, row] offsets from piece origin
export const PIECE_SHAPES: Record<string, number[][][]> = {
  DOMINO:  [[[0,0],[0,1]], [[0,0],[1,0]]],
  TRI_I:   [[[0,0],[0,1],[0,2]], [[0,0],[1,0],[2,0]]],
  TRI_L:   [[[0,0],[0,1],[1,1]], [[0,0],[1,0],[0,1]], [[0,0],[1,0],[1,1]], [[1,0],[1,1],[0,1]]],
  L_SHAPE: [[[0,0],[0,1],[0,2],[1,2]], [[0,0],[1,0],[2,0],[0,1]], [[0,0],[1,0],[1,1],[1,2]], [[2,0],[0,1],[1,1],[2,1]]],
  J_SHAPE: [[[1,0],[1,1],[0,2],[1,2]], [[0,0],[0,1],[1,1],[2,1]], [[0,0],[1,0],[0,1],[0,2]], [[0,0],[1,0],[2,0],[2,1]]],
  T_SHAPE: [[[0,0],[1,0],[2,0],[1,1]], [[0,0],[0,1],[1,1],[0,2]], [[1,0],[0,1],[1,1],[2,1]], [[1,0],[0,1],[1,1],[1,2]]],
  S_SHAPE: [[[1,0],[2,0],[0,1],[1,1]], [[0,0],[0,1],[1,1],[1,2]]],
  Z_SHAPE: [[[0,0],[1,0],[1,1],[2,1]], [[1,0],[0,1],[1,1],[0,2]]],
  I_SHAPE: [[[0,0],[0,1],[0,2],[0,3]], [[0,0],[1,0],[2,0],[3,0]]],
  O_SHAPE: [[[0,0],[1,0],[0,1],[1,1]]],
};

// Piece spawn weights (shapes appearing more often)
export const PIECE_POOL: string[] = [
  'DOMINO', 'DOMINO', 'DOMINO', 'DOMINO',
  'TRI_I', 'TRI_I', 'TRI_I',
  'TRI_L', 'TRI_L', 'TRI_L',
  'L_SHAPE', 'J_SHAPE', 'T_SHAPE', 'T_SHAPE',
  'S_SHAPE', 'Z_SHAPE', 'I_SHAPE', 'O_SHAPE',
];

// Timing configuration
export const TIMING = {
  gravitySpeed: 850, // ms per row
  lockDelay: 380, // ms before piece commits
  flashDuration: 110, // ms for cluster flash
  cascadeDelay: 160, // ms between cascade steps
};

// Pressure system
export const PRESSURE = {
  initialSpeed: 20000, // ms between pressure rows
  minSpeed: 6000, // fastest pressure can get
  speedReduction: 350, // ms faster each pressure row
  warningThreshold: 0.75, // show warning at 75% filled
};

// Probability that a regular piece has mixed tile types
export const MIXED_PIECE_CHANCE = 0.18;
