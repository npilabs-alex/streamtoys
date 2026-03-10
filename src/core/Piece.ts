/**
 * Piece management - spawning, movement, rotation
 */

import { PIECE_SHAPES, PIECE_POOL, BOARD, MIXED_PIECE_CHANCE } from '@/config/board';
import { buildTilePool, TileType, SPECIAL_TYPES, SpecialType, SPECIAL_SPAWN_CHANCE } from '@/config/tiles';
import { PieceState, TileData, generateId } from './types';
import { Board } from './Board';

// Pre-built tile pool for random selection
const TILE_POOL = buildTilePool();

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Create a new regular piece
 */
export function createPiece(): PieceState {
  // Check for special piece spawn
  if (Math.random() < SPECIAL_SPAWN_CHANCE) {
    return createSpecialPiece();
  }

  const shapeName = randomFromArray(PIECE_POOL);
  const rotations = PIECE_SHAPES[shapeName];
  const cellCount = rotations[0].length;

  // Determine if mixed colors
  const isMixed = Math.random() < MIXED_PIECE_CHANCE;
  const baseType = randomFromArray(TILE_POOL);

  const tiles: TileType[] = [];
  for (let i = 0; i < cellCount; i++) {
    tiles.push(isMixed ? randomFromArray(TILE_POOL) : baseType);
  }

  // Calculate starting X position (centered)
  const maxCol = Math.max(...rotations[0].map(([c]) => c));
  const startX = Math.max(0, Math.floor((BOARD.cols - maxCol - 1) / 2));

  return {
    id: generateId(),
    shapeName,
    rotation: 0,
    x: startX,
    y: 0,
    tiles,
    isSpecial: false,
  };
}

/**
 * Create a special piece (2-tall domino of special type)
 */
export function createSpecialPiece(): PieceState {
  const specialType = randomFromArray([...SPECIAL_TYPES]) as SpecialType;

  return {
    id: generateId(),
    shapeName: 'DOMINO',
    rotation: 0,
    x: Math.floor(BOARD.cols / 2) - 1,
    y: 0,
    tiles: [specialType as unknown as TileType, specialType as unknown as TileType],
    isSpecial: true,
    specialType,
  };
}

/**
 * Get the cells occupied by a piece at its current position
 */
export function getPieceCells(piece: PieceState): { col: number; row: number; type: TileType }[] {
  if (piece.isSpecial) {
    // Special pieces are always vertical 2-tall
    return [
      { col: piece.x, row: Math.floor(piece.y), type: piece.tiles[0] },
      { col: piece.x, row: Math.floor(piece.y) + 1, type: piece.tiles[1] },
    ];
  }

  const rotations = PIECE_SHAPES[piece.shapeName];
  const offsets = rotations[piece.rotation % rotations.length];

  return offsets.map(([dc, dr], i) => ({
    col: piece.x + dc,
    row: Math.floor(piece.y) + dr,
    type: piece.tiles[i] ?? piece.tiles[0],
  }));
}

/**
 * Check if piece fits at its current position
 */
export function pieceFits(piece: PieceState, board: Board): boolean {
  const cells = getPieceCells(piece);

  for (const { col, row } of cells) {
    // Allow cells above board (row < 0)
    if (col < 0 || col >= board.cols) return false;
    if (row >= board.rows) return false;
    if (row >= 0 && !board.isEmpty(row, col)) return false;
  }

  return true;
}

/**
 * Try to move piece horizontally
 */
export function tryMoveHorizontal(piece: PieceState, direction: -1 | 1, board: Board): PieceState | null {
  const moved = { ...piece, x: piece.x + direction };
  return pieceFits(moved, board) ? moved : null;
}

/**
 * Try to move piece down one row
 */
export function tryMoveDown(piece: PieceState, board: Board): PieceState | null {
  const moved = { ...piece, y: piece.y + 1 };
  return pieceFits(moved, board) ? moved : null;
}

/**
 * Try to rotate piece (with wall kicks)
 */
export function tryRotate(piece: PieceState, board: Board): PieceState | null {
  // Special pieces don't rotate
  if (piece.isSpecial) return null;

  const rotations = PIECE_SHAPES[piece.shapeName];
  if (rotations.length <= 1) return null; // O-block

  const newRotation = (piece.rotation + 1) % rotations.length;
  const rotated = { ...piece, rotation: newRotation };

  // Try original position
  if (pieceFits(rotated, board)) return rotated;

  // Wall kicks: try horizontal offsets
  for (const kick of [-1, 1, -2, 2, -3, 3]) {
    const kicked = { ...rotated, x: rotated.x + kick };
    if (pieceFits(kicked, board)) return kicked;
  }

  // Floor kick: try moving up
  const floorKicked = { ...rotated, y: rotated.y - 1 };
  if (pieceFits(floorKicked, board)) return floorKicked;

  return null;
}

/**
 * Hard drop piece to lowest valid position
 */
export function hardDrop(piece: PieceState, board: Board): PieceState {
  let dropped = { ...piece };

  while (true) {
    const next = { ...dropped, y: dropped.y + 1 };
    if (!pieceFits(next, board)) break;
    dropped = next;
  }

  dropped.y = Math.floor(dropped.y);
  return dropped;
}

/**
 * Get ghost piece position (preview of where piece will land)
 */
export function getGhostPosition(piece: PieceState, board: Board): number {
  const dropped = hardDrop(piece, board);
  return Math.floor(dropped.y);
}

/**
 * Convert piece to TileData array for placing on board
 */
export function pieceToTiles(piece: PieceState): TileData[] {
  const cells = getPieceCells(piece);

  return cells
    .filter(({ row }) => row >= 0) // Only cells on the board
    .map(({ col, row, type }) => ({
      id: generateId(),
      type: type as any,
      row,
      col,
    }));
}
