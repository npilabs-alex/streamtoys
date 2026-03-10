/**
 * Core type definitions for game state
 */

import { TileType, SpecialType, GarbageType, AnyTileType } from '@/config/tiles';

export interface TileData {
  id: string;
  type: AnyTileType;
  row: number;
  col: number;
  flashing?: boolean;
}

export interface PieceState {
  id: string;
  shapeName: string;
  rotation: number;
  x: number; // column position
  y: number; // row position (can be fractional during fall)
  tiles: TileType[];
  isSpecial: boolean;
  specialType?: SpecialType;
}

export interface ClusterResult {
  type: AnyTileType;
  cells: [number, number][]; // [row, col] pairs
  isSpecial: boolean;
}

export interface GravityMove {
  id: string;
  from: { row: number; col: number };
  to: { row: number; col: number };
}

export interface StatsState {
  streams: number;
  followers: number;
  visibility: number;
  rank: number;
}

export interface MultiplierState {
  viral: number; // current multiplier (1 or 3)
  viralRemaining: number; // collapses remaining
  collabPending: boolean; // next collapse is doubled
}

export interface CareerState {
  stageIndex: number;
  stageName: string;
}

export interface PressureState {
  timer: number; // ms elapsed
  speed: number; // ms per pressure row
  warning: boolean;
}

// Game events emitted by GameState
export type GameEvent =
  | { type: 'piece:spawn'; piece: PieceState }
  | { type: 'piece:move'; piece: PieceState; direction: 'left' | 'right' | 'down' }
  | { type: 'piece:rotate'; piece: PieceState }
  | { type: 'piece:land'; tiles: TileData[] }
  | { type: 'cluster:flash'; cells: [number, number][]; tileType: AnyTileType }
  | { type: 'cluster:clear'; cells: [number, number][]; tileType: AnyTileType; score: number; stats: StatsState }
  | { type: 'garbage:smash'; cells: [number, number][] }
  | { type: 'special:activate'; specialType: SpecialType; row: number; col: number }
  | { type: 'ability:trigger'; tileType: TileType; cells: [number, number][]; size: number }
  | { type: 'gravity:settle'; moves: GravityMove[] }
  | { type: 'pressure:warning' }
  | { type: 'pressure:rise'; row: TileData[] }
  | { type: 'multiplier:change'; multipliers: MultiplierState }
  | { type: 'career:stageup'; career: CareerState }
  | { type: 'stats:update'; stats: StatsState }
  | { type: 'game:start' }
  | { type: 'game:pause' }
  | { type: 'game:resume' }
  | { type: 'game:over'; stats: StatsState; career: CareerState }
  | { type: 'invalid:tap'; cells: [number, number][] };

export type GameEventType = GameEvent['type'];

// Utility to generate unique IDs
let idCounter = 0;
export function generateId(): string {
  return `tile_${Date.now()}_${idCounter++}`;
}
