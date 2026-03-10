/**
 * Board state management - pure game logic
 */

import { BOARD } from '@/config/board';
import { MIN_CLUSTER_SIZE, TILE_TYPES, TileType, AnyTileType, SPECIAL_TYPES } from '@/config/tiles';
import { TileData, ClusterResult, GravityMove, generateId } from './types';

export class Board {
  readonly cols: number;
  readonly rows: number;
  private grid: (TileData | null)[][];

  constructor(cols = BOARD.cols, rows = BOARD.rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = this.createEmptyGrid();
  }

  private createEmptyGrid(): (TileData | null)[][] {
    return Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(null)
    );
  }

  /**
   * Reset the board to empty state
   */
  reset(): void {
    this.grid = this.createEmptyGrid();
  }

  /**
   * Get tile at position
   */
  getTile(row: number, col: number): TileData | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    return this.grid[row][col];
  }

  /**
   * Set tile at position
   */
  setTile(row: number, col: number, tile: TileData | null): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.grid[row][col] = tile;
    }
  }

  /**
   * Check if position is empty
   */
  isEmpty(row: number, col: number): boolean {
    return this.getTile(row, col) === null;
  }

  /**
   * Check if position is within bounds
   */
  isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  /**
   * Place tiles on the board
   */
  placeTiles(tiles: TileData[]): void {
    for (const tile of tiles) {
      this.setTile(tile.row, tile.col, tile);
    }
  }

  /**
   * Find cluster at specific position using BFS
   */
  findClusterAt(row: number, col: number): ClusterResult | null {
    const tile = this.getTile(row, col);
    if (!tile) return null;

    const type = tile.type;

    // Special tiles are single-tap, no cluster needed
    if (SPECIAL_TYPES.includes(type as any)) {
      return { type, cells: [[row, col]], isSpecial: true };
    }

    // GARBAGE cannot be tapped directly
    if (type === 'GARBAGE') return null;

    // BFS to find connected tiles of same type (WILD joins any)
    const visited = new Set<string>();
    const cells: [number, number][] = [];
    const queue: [number, number][] = [[row, col]];
    visited.add(`${row},${col}`);

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      cells.push([r, c]);

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        const key = `${nr},${nc}`;

        if (visited.has(key) || !this.isInBounds(nr, nc)) continue;

        const neighbor = this.getTile(nr, nc);
        if (!neighbor) continue;

        const neighborType = neighbor.type;

        // Match same type or WILD
        if (neighborType === type || neighborType === 'WILD' || type === 'WILD') {
          visited.add(key);
          queue.push([nr, nc]);
        }
      }
    }

    return { type, cells, isSpecial: false };
  }

  /**
   * Find all valid clusters on the board (size >= MIN_CLUSTER_SIZE)
   */
  findAllValidClusters(): ClusterResult[] {
    const visited = new Set<string>();
    const clusters: ClusterResult[] = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const key = `${row},${col}`;
        if (visited.has(key)) continue;

        const tile = this.getTile(row, col);
        if (!tile) continue;

        const type = tile.type;
        if (type === 'GARBAGE' || SPECIAL_TYPES.includes(type as any)) {
          visited.add(key);
          continue;
        }

        const cluster = this.findClusterAt(row, col);
        if (cluster && cluster.cells.length >= MIN_CLUSTER_SIZE) {
          clusters.push(cluster);
          for (const [r, c] of cluster.cells) {
            visited.add(`${r},${c}`);
          }
        } else if (cluster) {
          for (const [r, c] of cluster.cells) {
            visited.add(`${r},${c}`);
          }
        }
      }
    }

    return clusters;
  }

  /**
   * Find all connected groups (any size, for rendering)
   */
  findAllGroups(): ClusterResult[] {
    const visited = new Set<string>();
    const groups: ClusterResult[] = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const key = `${row},${col}`;
        if (visited.has(key)) continue;

        const tile = this.getTile(row, col);
        if (!tile) continue;

        if (SPECIAL_TYPES.includes(tile.type as any)) {
          visited.add(key);
          groups.push({ type: tile.type, cells: [[row, col]], isSpecial: true });
          continue;
        }

        const cluster = this.findClusterAt(row, col);
        if (cluster) {
          groups.push(cluster);
          for (const [r, c] of cluster.cells) {
            visited.add(`${r},${c}`);
          }
        }
      }
    }

    return groups;
  }

  /**
   * Clear cells from the board
   */
  clearCells(cells: [number, number][]): void {
    for (const [row, col] of cells) {
      this.setTile(row, col, null);
    }
  }

  /**
   * Find GARBAGE tiles adjacent to given cells
   */
  findAdjacentGarbage(cells: [number, number][]): [number, number][] {
    const garbage: [number, number][] = [];
    const checked = new Set<string>();
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [row, col] of cells) {
      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        const key = `${nr},${nc}`;

        if (checked.has(key)) continue;
        checked.add(key);

        const tile = this.getTile(nr, nc);
        if (tile && tile.type === 'GARBAGE') {
          garbage.push([nr, nc]);
        }
      }
    }

    return garbage;
  }

  /**
   * Apply gravity - tiles fall to fill gaps
   * Returns list of moves for animation
   */
  applyGravity(): GravityMove[] {
    const moves: GravityMove[] = [];

    for (let col = 0; col < this.cols; col++) {
      let writeRow = this.rows - 1;

      for (let readRow = this.rows - 1; readRow >= 0; readRow--) {
        const tile = this.getTile(readRow, col);
        if (tile) {
          if (writeRow !== readRow) {
            moves.push({
              id: tile.id,
              from: { row: readRow, col },
              to: { row: writeRow, col },
            });
            tile.row = writeRow;
            this.setTile(writeRow, col, tile);
            this.setTile(readRow, col, null);
          }
          writeRow--;
        }
      }
    }

    return moves;
  }

  /**
   * Add pressure row from bottom, shifting everything up
   * Returns the new garbage row data
   */
  addPressureRow(): { newRow: TileData[]; gapCol: number; topRowOccupied: boolean } {
    // Check if top row has any tiles (game over condition)
    const topRowOccupied = this.grid[0].some(tile => tile !== null);

    // Shift all rows up
    for (let row = 0; row < this.rows - 1; row++) {
      this.grid[row] = this.grid[row + 1].map(tile => {
        if (tile) tile.row = row;
        return tile;
      });
    }

    // Create new bottom row with one gap
    const gapCol = Math.floor(Math.random() * this.cols);
    const newRow: TileData[] = [];

    this.grid[this.rows - 1] = Array(this.cols).fill(null).map((_, col) => {
      if (col === gapCol) return null;

      const tile: TileData = {
        id: generateId(),
        type: 'GARBAGE',
        row: this.rows - 1,
        col,
      };
      newRow.push(tile);
      return tile;
    });

    return { newRow, gapCol, topRowOccupied };
  }

  /**
   * Clear bottom row (BEAT ability)
   */
  clearBottomRow(): [number, number][] {
    const cleared: [number, number][] = [];
    const bottomRow = this.rows - 1;

    for (let col = 0; col < this.cols; col++) {
      if (this.getTile(bottomRow, col)) {
        cleared.push([bottomRow, col]);
        this.setTile(bottomRow, col, null);
      }
    }

    return cleared;
  }

  /**
   * Convert GARBAGE to WILD in bottom N rows (VOCAL ability)
   */
  convertGarbageToWild(bottomRows: number): [number, number][] {
    const converted: [number, number][] = [];

    for (let row = Math.max(0, this.rows - bottomRows); row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tile = this.getTile(row, col);
        if (tile && tile.type === 'GARBAGE') {
          tile.type = 'WILD';
          converted.push([row, col]);
        }
      }
    }

    return converted;
  }

  /**
   * Pack column - remove gaps (FLOW ability)
   */
  packColumn(col: number): GravityMove[] {
    const moves: GravityMove[] = [];
    let writeRow = this.rows - 1;

    for (let readRow = this.rows - 1; readRow >= 0; readRow--) {
      const tile = this.getTile(readRow, col);
      if (tile) {
        if (writeRow !== readRow) {
          moves.push({
            id: tile.id,
            from: { row: readRow, col },
            to: { row: writeRow, col },
          });
          tile.row = writeRow;
          this.setTile(writeRow, col, tile);
          this.setTile(readRow, col, null);
        }
        writeRow--;
      }
    }

    return moves;
  }

  /**
   * Nuke all tiles of a specific type (WILD ability)
   */
  nukeTileType(type: TileType): [number, number][] {
    const nuked: [number, number][] = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tile = this.getTile(row, col);
        if (tile && tile.type === type) {
          nuked.push([row, col]);
          this.setTile(row, col, null);
        }
      }
    }

    return nuked;
  }

  /**
   * Clear all non-garbage tiles (ALBUM ability)
   */
  clearAllNonGarbage(): [number, number][] {
    const cleared: [number, number][] = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tile = this.getTile(row, col);
        if (tile && tile.type !== 'GARBAGE') {
          cleared.push([row, col]);
          this.setTile(row, col, null);
        }
      }
    }

    return cleared;
  }

  /**
   * Get all tiles (for rendering)
   */
  getAllTiles(): TileData[] {
    const tiles: TileData[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tile = this.getTile(row, col);
        if (tile) tiles.push(tile);
      }
    }
    return tiles;
  }

  /**
   * Debug: print board state
   */
  debugPrint(): void {
    const typeChars: Record<string, string> = {
      BEAT: 'B', VOCAL: 'V', FLOW: 'F', HYPE: 'H',
      LABEL: 'L', WILD: 'W', GARBAGE: 'X',
      EP: 'e', ALBUM: 'a', VIRAL: 'v', CHART: 'c', COLLAB: 'o',
    };

    console.log('Board:');
    for (let row = 0; row < this.rows; row++) {
      let line = '';
      for (let col = 0; col < this.cols; col++) {
        const tile = this.getTile(row, col);
        line += tile ? typeChars[tile.type] || '?' : '.';
      }
      console.log(line);
    }
  }
}
