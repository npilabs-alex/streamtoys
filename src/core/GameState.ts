/**
 * Main game state manager
 * Emits events that the rendering layer listens to
 */

import { EventEmitter } from 'eventemitter3';
import { Board } from './Board';
import {
  PieceState,
  TileData,
  StatsState,
  MultiplierState,
  CareerState,
  PressureState,
  GameEvent,
  GameEventType,
  generateId,
} from './types';
import {
  createPiece,
  pieceFits,
  tryMoveHorizontal,
  tryMoveDown,
  tryRotate,
  hardDrop,
  pieceToTiles,
  getPieceCells,
} from './Piece';
import {
  calculateCollapseScore,
  pointsToStats,
  STATS_CAP,
  SPECIAL_REWARDS,
  MULTIPLIERS,
  ABILITY_BONUSES,
} from '@/config/scoring';
import { getCareerStage, CAREER_STAGES } from '@/config/career';
import { TIMING, PRESSURE, BOARD } from '@/config/board';
import { MIN_CLUSTER_SIZE, TILE_TYPES, TileType, SpecialType } from '@/config/tiles';

type EventCallback = (event: GameEvent) => void;

export class GameState extends EventEmitter<Record<GameEventType, [GameEvent]>> {
  // Core state
  board: Board;
  currentPiece: PieceState | null = null;
  nextPiece: PieceState | null = null;

  // Stats
  stats: StatsState = {
    streams: 0,
    followers: 0,
    visibility: 0,
    rank: 99,
  };

  // Multipliers
  multipliers: MultiplierState = {
    viral: 1,
    viralRemaining: 0,
    collabPending: false,
  };

  // Career
  career: CareerState = {
    stageIndex: 0,
    stageName: CAREER_STAGES[0].name,
  };

  // Pressure
  pressure: PressureState = {
    timer: 0,
    speed: PRESSURE.initialSpeed,
    warning: false,
  };

  // Timers
  private gravityTimer = 0;
  private lockTimer = 0;
  pieceYSmooth = 0; // Smooth Y for rendering

  // Game state flags
  isRunning = false;
  isPaused = false;
  isGameOver = false;
  isResolving = false; // True during collapse animation

  constructor() {
    super();
    this.board = new Board();
  }

  /**
   * Start a new game
   */
  start(): void {
    this.board.reset();
    this.stats = { streams: 0, followers: 0, visibility: 0, rank: 99 };
    this.multipliers = { viral: 1, viralRemaining: 0, collabPending: false };
    this.career = { stageIndex: 0, stageName: CAREER_STAGES[0].name };
    this.pressure = { timer: 0, speed: PRESSURE.initialSpeed, warning: false };
    this.gravityTimer = 0;
    this.lockTimer = 0;
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;
    this.isResolving = false;

    // Spawn initial pieces
    this.nextPiece = createPiece();
    this.spawnNextPiece();

    this.emit('game:start', { type: 'game:start' });
  }

  /**
   * Spawn the next piece
   */
  private spawnNextPiece(): void {
    this.currentPiece = this.nextPiece;
    this.nextPiece = createPiece();

    if (this.currentPiece && !pieceFits(this.currentPiece, this.board)) {
      this.gameOver();
      return;
    }

    if (this.currentPiece) {
      this.pieceYSmooth = this.currentPiece.y;
      this.gravityTimer = 0;
      this.lockTimer = 0;
      this.emit('piece:spawn', { type: 'piece:spawn', piece: this.currentPiece });
    }
  }

  /**
   * Main update loop - call every frame
   */
  update(dt: number): void {
    if (!this.isRunning || this.isPaused || this.isGameOver || this.isResolving) {
      return;
    }

    // Update pressure
    this.updatePressure(dt);

    // Update falling piece
    if (this.currentPiece) {
      this.updatePiece(dt);
    }
  }

  private updatePressure(dt: number): void {
    this.pressure.timer += dt * 1000;

    const wasWarning = this.pressure.warning;
    this.pressure.warning = this.pressure.timer >= this.pressure.speed * PRESSURE.warningThreshold;

    if (this.pressure.warning && !wasWarning) {
      this.emit('pressure:warning', { type: 'pressure:warning' });
    }

    if (this.pressure.timer >= this.pressure.speed) {
      this.pressure.timer = 0;
      this.addPressureRow();
    }
  }

  private updatePiece(dt: number): void {
    const piece = this.currentPiece!;
    const canFall = pieceFits({ ...piece, y: piece.y + 1 }, this.board);

    if (canFall) {
      this.gravityTimer += dt * 1000;
      // Smooth interpolation
      this.pieceYSmooth = piece.y + Math.min(this.gravityTimer / TIMING.gravitySpeed, 0.95);

      if (this.gravityTimer >= TIMING.gravitySpeed) {
        this.gravityTimer = 0;
        this.currentPiece = { ...piece, y: piece.y + 1 };
        this.pieceYSmooth = this.currentPiece.y;
        this.lockTimer = 0;
      }
    } else {
      // Piece is resting
      this.pieceYSmooth = piece.y;
      this.gravityTimer = 0;
      this.lockTimer += dt * 1000;

      if (this.lockTimer >= TIMING.lockDelay) {
        // Final check before commit
        if (!pieceFits({ ...piece, y: piece.y + 1 }, this.board)) {
          this.commitPiece();
        } else {
          this.lockTimer = 0;
        }
      }
    }
  }

  /**
   * Commit piece to board
   */
  private commitPiece(): void {
    if (!this.currentPiece) return;

    // Snap to lowest valid position
    this.currentPiece = hardDrop(this.currentPiece, this.board);
    this.pieceYSmooth = this.currentPiece.y;

    const tiles = pieceToTiles(this.currentPiece);

    // Check if any tiles are above the board
    if (tiles.some(t => t.row < 0)) {
      this.gameOver();
      return;
    }

    // Check for overlaps (shouldn't happen but safety check)
    for (const tile of tiles) {
      if (!this.board.isEmpty(tile.row, tile.col)) {
        this.gameOver();
        return;
      }
    }

    // Place tiles
    this.board.placeTiles(tiles);
    this.emit('piece:land', { type: 'piece:land', tiles });

    // Apply gravity
    const moves = this.board.applyGravity();
    if (moves.length > 0) {
      this.emit('gravity:settle', { type: 'gravity:settle', moves });
    }

    this.currentPiece = null;
    this.spawnNextPiece();
  }

  /**
   * Handle tap on board position
   */
  async tap(row: number, col: number): Promise<void> {
    if (this.isResolving || !this.isRunning || this.isPaused || this.isGameOver) {
      return;
    }

    const cluster = this.board.findClusterAt(row, col);
    if (!cluster) return;

    if (cluster.isSpecial) {
      await this.resolveSpecial(cluster.type as SpecialType, row, col);
    } else if (cluster.cells.length >= MIN_CLUSTER_SIZE) {
      await this.resolveCluster(cluster);
    } else {
      // Invalid tap - cluster too small
      this.emit('invalid:tap', { type: 'invalid:tap', cells: cluster.cells });
    }
  }

  /**
   * Resolve a valid cluster collapse
   */
  private async resolveCluster(cluster: { type: any; cells: [number, number][] }): Promise<void> {
    this.isResolving = true;

    // Flash
    this.emit('cluster:flash', {
      type: 'cluster:flash',
      cells: cluster.cells,
      tileType: cluster.type,
    });

    await this.delay(TIMING.flashDuration);

    // Clear cluster
    this.board.clearCells(cluster.cells);

    // Find and smash adjacent garbage
    const garbage = this.board.findAdjacentGarbage(cluster.cells);
    if (garbage.length > 0) {
      this.board.clearCells(garbage);
      this.emit('garbage:smash', { type: 'garbage:smash', cells: garbage });
    }

    // Calculate score
    const score = calculateCollapseScore(
      cluster.cells.length,
      this.multipliers.viral,
      this.multipliers.collabPending
    );

    // Reset collab after use
    if (this.multipliers.collabPending) {
      this.multipliers.collabPending = false;
    }

    // Update stats
    const gains = pointsToStats(score);
    this.addStats(gains);

    this.emit('cluster:clear', {
      type: 'cluster:clear',
      cells: cluster.cells,
      tileType: cluster.type,
      score,
      stats: { ...this.stats },
    });

    // Update viral multiplier
    if (this.multipliers.viralRemaining > 0) {
      this.multipliers.viralRemaining--;
      if (this.multipliers.viralRemaining === 0) {
        this.multipliers.viral = 1;
      }
      this.emit('multiplier:change', {
        type: 'multiplier:change',
        multipliers: { ...this.multipliers },
      });
    }

    // Trigger ability
    await this.triggerAbility(cluster.type, cluster.cells);

    await this.delay(TIMING.cascadeDelay);

    // Apply gravity
    const moves = this.board.applyGravity();
    if (moves.length > 0) {
      this.emit('gravity:settle', { type: 'gravity:settle', moves });
    }

    await this.delay(80);

    this.isResolving = false;

    // Spawn next piece if none
    if (!this.currentPiece) {
      this.spawnNextPiece();
    }
  }

  /**
   * Resolve a special tile activation
   */
  private async resolveSpecial(type: SpecialType, row: number, col: number): Promise<void> {
    this.isResolving = true;

    this.board.clearCells([[row, col]]);

    this.emit('special:activate', {
      type: 'special:activate',
      specialType: type,
      row,
      col,
    });

    switch (type) {
      case 'EP':
        this.addStats({ ...SPECIAL_REWARDS.EP, rankReduction: 0 });
        break;

      case 'ALBUM':
        const cleared = this.board.clearAllNonGarbage();
        this.emit('cluster:clear', {
          type: 'cluster:clear',
          cells: cleared,
          tileType: 'ALBUM',
          score: 0,
          stats: { ...this.stats },
        });
        this.addStats({ ...SPECIAL_REWARDS.ALBUM, rankReduction: 0 });
        break;

      case 'VIRAL':
        this.multipliers.viral = MULTIPLIERS.viral.multiplier;
        this.multipliers.viralRemaining = MULTIPLIERS.viral.duration;
        this.emit('multiplier:change', {
          type: 'multiplier:change',
          multipliers: { ...this.multipliers },
        });
        break;

      case 'CHART':
        const jump = SPECIAL_REWARDS.CHART.rankJumpMin +
          Math.floor(Math.random() * (SPECIAL_REWARDS.CHART.rankJumpMax - SPECIAL_REWARDS.CHART.rankJumpMin));
        this.stats.rank = Math.max(1, this.stats.rank - jump);
        this.addStats({ streams: 0, followers: 0, visibility: SPECIAL_REWARDS.CHART.visibility, rankReduction: 0 });
        break;

      case 'COLLAB':
        this.multipliers.collabPending = true;
        this.emit('multiplier:change', {
          type: 'multiplier:change',
          multipliers: { ...this.multipliers },
        });
        break;
    }

    await this.delay(200);

    const moves = this.board.applyGravity();
    if (moves.length > 0) {
      this.emit('gravity:settle', { type: 'gravity:settle', moves });
    }

    await this.delay(80);

    this.isResolving = false;

    if (!this.currentPiece) {
      this.spawnNextPiece();
    }
  }

  /**
   * Trigger tile ability after collapse
   */
  private async triggerAbility(type: any, cells: [number, number][]): Promise<void> {
    const size = cells.length;

    this.emit('ability:trigger', {
      type: 'ability:trigger',
      tileType: type,
      cells,
      size,
    });

    switch (type) {
      case 'BEAT': {
        const cleared = this.board.clearBottomRow();
        if (cleared.length > 0) {
          this.emit('cluster:clear', {
            type: 'cluster:clear',
            cells: cleared,
            tileType: 'BEAT',
            score: 0,
            stats: { ...this.stats },
          });
        }
        break;
      }

      case 'VOCAL': {
        const converted = this.board.convertGarbageToWild(5);
        // Emit event for visual feedback
        break;
      }

      case 'FLOW': {
        const col = cells[0][1];
        const moves = this.board.packColumn(col);
        if (moves.length > 0) {
          this.emit('gravity:settle', { type: 'gravity:settle', moves });
        }
        break;
      }

      case 'HYPE': {
        const bonus = Math.min(
          ABILITY_BONUSES.hype.maxPressureTime,
          size * ABILITY_BONUSES.hype.pressureTimePerTile
        );
        this.pressure.timer = 0;
        this.pressure.warning = false;
        this.pressure.speed = Math.min(PRESSURE.initialSpeed, this.pressure.speed + bonus);
        break;
      }

      case 'LABEL': {
        const visBonus = size * ABILITY_BONUSES.label.visibilityMultiplier * 50;
        const folBonus = size * ABILITY_BONUSES.label.followersMultiplier * 10;
        this.addStats({ streams: 0, followers: folBonus, visibility: visBonus, rankReduction: 0 });
        break;
      }

      case 'WILD': {
        const others = TILE_TYPES.filter(t => t !== 'WILD');
        const target = others[Math.floor(Math.random() * others.length)];
        const nuked = this.board.nukeTileType(target);
        if (nuked.length > 0) {
          this.emit('cluster:clear', {
            type: 'cluster:clear',
            cells: nuked,
            tileType: target,
            score: 0,
            stats: { ...this.stats },
          });
        }
        break;
      }
    }
  }

  /**
   * Add pressure row
   */
  private addPressureRow(): void {
    // If piece is in the way, hard drop it first
    if (this.currentPiece) {
      const cells = getPieceCells(this.currentPiece);
      const wouldConflict = cells.some(({ col, row }) => {
        const newRow = row + 1;
        return newRow < BOARD.rows && !this.board.isEmpty(newRow + 1, col);
      });

      if (wouldConflict) {
        this.commitPiece();
      }
    }

    const { newRow, topRowOccupied } = this.board.addPressureRow();

    if (topRowOccupied) {
      this.gameOver();
      return;
    }

    this.pressure.speed = Math.max(PRESSURE.minSpeed, this.pressure.speed - PRESSURE.speedReduction);

    this.emit('pressure:rise', { type: 'pressure:rise', row: newRow });
  }

  /**
   * Add stats with caps
   */
  private addStats(gains: { streams: number; followers: number; visibility: number; rankReduction: number }): void {
    this.stats.streams = Math.min(STATS_CAP.streams, this.stats.streams + gains.streams);
    this.stats.followers = Math.min(STATS_CAP.followers, this.stats.followers + gains.followers);
    this.stats.visibility = Math.min(STATS_CAP.visibility, this.stats.visibility + gains.visibility);
    this.stats.rank = Math.max(1, this.stats.rank - gains.rankReduction);

    this.emit('stats:update', { type: 'stats:update', stats: { ...this.stats } });

    // Check career progression
    const { stage, index } = getCareerStage(this.stats.streams);
    if (index > this.career.stageIndex) {
      this.career.stageIndex = index;
      this.career.stageName = stage.name;
      this.emit('career:stageup', { type: 'career:stageup', career: { ...this.career } });
    }
  }

  /**
   * Input handlers
   */
  moveLeft(): void {
    if (!this.currentPiece || this.isResolving || this.isPaused || this.isGameOver) return;
    const moved = tryMoveHorizontal(this.currentPiece, -1, this.board);
    if (moved) {
      this.currentPiece = moved;
      this.lockTimer = 0;
      this.emit('piece:move', { type: 'piece:move', piece: moved, direction: 'left' });
    }
  }

  moveRight(): void {
    if (!this.currentPiece || this.isResolving || this.isPaused || this.isGameOver) return;
    const moved = tryMoveHorizontal(this.currentPiece, 1, this.board);
    if (moved) {
      this.currentPiece = moved;
      this.lockTimer = 0;
      this.emit('piece:move', { type: 'piece:move', piece: moved, direction: 'right' });
    }
  }

  softDrop(): void {
    if (!this.currentPiece || this.isResolving || this.isPaused || this.isGameOver) return;
    const moved = tryMoveDown(this.currentPiece, this.board);
    if (moved) {
      this.currentPiece = moved;
      this.pieceYSmooth = moved.y;
      this.emit('piece:move', { type: 'piece:move', piece: moved, direction: 'down' });
    }
  }

  rotate(): void {
    if (!this.currentPiece || this.isResolving || this.isPaused || this.isGameOver) return;
    const rotated = tryRotate(this.currentPiece, this.board);
    if (rotated) {
      this.currentPiece = rotated;
      this.lockTimer = 0;
      this.emit('piece:rotate', { type: 'piece:rotate', piece: rotated });
    }
  }

  doHardDrop(): void {
    if (!this.currentPiece || this.isResolving || this.isPaused || this.isGameOver) return;
    this.currentPiece = hardDrop(this.currentPiece, this.board);
    this.pieceYSmooth = this.currentPiece.y;
    this.gravityTimer = 0;
    this.lockTimer = 0;
    this.commitPiece();
  }

  pause(): void {
    this.isPaused = true;
    this.emit('game:pause', { type: 'game:pause' });
  }

  resume(): void {
    this.isPaused = false;
    this.emit('game:resume', { type: 'game:resume' });
  }

  private gameOver(): void {
    this.isGameOver = true;
    this.isRunning = false;
    this.emit('game:over', {
      type: 'game:over',
      stats: { ...this.stats },
      career: { ...this.career },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
