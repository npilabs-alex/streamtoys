/**
 * Board rendering - tiles, clusters, effects
 */

import { Container, Graphics } from 'pixi.js';
import { Board } from '@/core/Board';
import { TileRenderer } from './TileRenderer';
import { BOARD } from '@/config/board';
import { VISUAL } from '@/config/visuals';
import { MIN_CLUSTER_SIZE, SPECIAL_TYPES, TILE_COLORS } from '@/config/tiles';

export class BoardRenderer {
  private container: Container;
  private glowContainer: Container;
  private board: Board;
  private tileRenderer: TileRenderer;
  private tileSize: number;

  // Visual elements
  private backgroundG: Graphics;
  private tilesContainer: Container;

  // Flash state
  private flashingCells: Set<string> = new Set();
  private invalidCells: Set<string> = new Set();
  private flashTimer = 0;
  private invalidTimer = 0;

  // Hover state
  private hoverCells: Set<string> = new Set();

  // Pulse animation
  private pulsePhase = 0;

  constructor(
    container: Container,
    glowContainer: Container,
    board: Board,
    tileRenderer: TileRenderer,
    tileSize: number
  ) {
    this.container = container;
    this.glowContainer = glowContainer;
    this.board = board;
    this.tileRenderer = tileRenderer;
    this.tileSize = tileSize;

    this.backgroundG = new Graphics();
    this.tilesContainer = new Container();

    this.container.addChild(this.backgroundG);
    this.container.addChild(this.tilesContainer);

    this.drawBackground();
  }

  setTileSize(size: number): void {
    this.tileSize = size;
    this.tileRenderer.setTileSize(size);
    this.drawBackground();
  }

  private drawBackground(): void {
    const width = BOARD.cols * this.tileSize;
    const height = BOARD.rows * this.tileSize;

    this.backgroundG.clear();

    // Deep background
    this.backgroundG
      .roundRect(0, 0, width, height, 4)
      .fill({ color: 0x05040f, alpha: 0.97 });
  }

  flashCells(cells: [number, number][]): void {
    this.flashingCells = new Set(cells.map(([r, c]) => `${r},${c}`));
    this.flashTimer = 110; // ms
  }

  flashInvalid(cells: [number, number][]): void {
    this.invalidCells = new Set(cells.map(([r, c]) => `${r},${c}`));
    this.invalidTimer = 280; // ms
  }

  update(board: Board, hoverCluster: [number, number][] | null = null): void {
    this.board = board;
    this.pulsePhase += 0.015;

    // Update hover cells
    this.hoverCells.clear();
    if (hoverCluster) {
      for (const [r, c] of hoverCluster) {
        this.hoverCells.add(`${r},${c}`);
      }
    }

    // Update flash timers
    if (this.flashTimer > 0) {
      this.flashTimer -= 16; // Assume 60fps
      if (this.flashTimer <= 0) {
        this.flashingCells.clear();
      }
    }

    if (this.invalidTimer > 0) {
      this.invalidTimer -= 16;
      if (this.invalidTimer <= 0) {
        this.invalidCells.clear();
      }
    }

    this.render();
  }

  private render(): void {
    // Clear previous tiles
    this.tilesContainer.removeChildren();
    this.glowContainer.removeChildren();

    const pulse = 0.5 + Math.sin(this.pulsePhase) * 0.5;

    // Render hover highlight first (behind everything)
    if (this.hoverCells.size > 0) {
      this.renderHoverHighlight(pulse);
    }

    // Find all connected groups for merged rendering
    const groups = this.board.findAllGroups();

    // Track which cells are in valid clusters (for glow)
    const renderedCells = new Set<string>();

    // First pass: render merged clusters for groups >= MIN_CLUSTER_SIZE
    for (const group of groups) {
      if (group.isSpecial) continue; // Special tiles render individually

      if (group.cells.length >= MIN_CLUSTER_SIZE) {
        // Mark cells as rendered
        for (const [r, c] of group.cells) {
          renderedCells.add(`${r},${c}`);
        }

        // Create merged visual
        const cells = group.cells.map(([row, col]) => ({ row, col }));
        const merged = this.tileRenderer.createMergedCluster(cells, group.type, pulse);
        this.tilesContainer.addChild(merged);

        // Add glow behind
        this.renderClusterGlow(group.cells, group.type, pulse);
      }
    }

    // Second pass: render individual tiles
    for (let row = 0; row < BOARD.rows; row++) {
      for (let col = 0; col < BOARD.cols; col++) {
        const key = `${row},${col}`;

        // Skip if already rendered as part of a cluster
        if (renderedCells.has(key)) continue;

        const tile = this.board.getTile(row, col);
        if (!tile) continue;

        const isFlashing = this.flashingCells.has(key);
        const isInvalid = this.invalidCells.has(key);
        const isSpecial = SPECIAL_TYPES.includes(tile.type as any);

        const tileGraphic = this.tileRenderer.createTile(tile.type, {
          flash: isFlashing,
          pulse: isSpecial ? pulse : 0,
        });

        tileGraphic.position.set(col * this.tileSize, row * this.tileSize);
        this.tilesContainer.addChild(tileGraphic);

        // Invalid flash overlay
        if (isInvalid) {
          const invalidOverlay = new Graphics()
            .roundRect(
              col * this.tileSize + 2,
              row * this.tileSize + 2,
              this.tileSize - 4,
              this.tileSize - 4,
              6
            )
            .fill({ color: 0xff2222, alpha: 0.3 });
          this.tilesContainer.addChild(invalidOverlay);
        }
      }
    }
  }

  private renderClusterGlow(cells: [number, number][], type: any, pulse: number): void {
    const colors = TILE_COLORS[type as keyof typeof TILE_COLORS];
    if (!colors) return;

    const glowG = new Graphics();
    glowG.alpha = VISUAL.clusterGlowIntensity + pulse * 0.15;

    for (const [row, col] of cells) {
      glowG
        .roundRect(
          col * this.tileSize + 2,
          row * this.tileSize + 2,
          this.tileSize - 4,
          this.tileSize - 4,
          8
        )
        .fill({ color: colors.glow, alpha: 0.5 });
    }

    this.glowContainer.addChild(glowG);
  }

  private renderHoverHighlight(pulse: number): void {
    // Get tile type from first hovered cell to determine color
    const firstCell = Array.from(this.hoverCells)[0];
    if (!firstCell) return;

    const [row, col] = firstCell.split(',').map(Number);
    const tile = this.board.getTile(row, col);
    if (!tile) return;

    const colors = TILE_COLORS[tile.type as keyof typeof TILE_COLORS];
    if (!colors) return;

    // Outer glow effect
    const glowG = new Graphics();
    const glowIntensity = 0.35 + pulse * 0.2;

    for (const cellKey of this.hoverCells) {
      const [r, c] = cellKey.split(',').map(Number);

      // Pulsing glow behind tiles
      glowG
        .roundRect(
          c * this.tileSize - 2,
          r * this.tileSize - 2,
          this.tileSize + 4,
          this.tileSize + 4,
          10
        )
        .fill({ color: colors.glow, alpha: glowIntensity * 0.4 });
    }

    this.glowContainer.addChild(glowG);

    // Highlight border around the cluster
    const borderG = new Graphics();
    const cellSet = this.hoverCells;
    const hasCell = (r: number, c: number) => cellSet.has(`${r},${c}`);

    for (const cellKey of this.hoverCells) {
      const [r, c] = cellKey.split(',').map(Number);
      const x1 = c * this.tileSize;
      const y1 = r * this.tileSize;
      const x2 = x1 + this.tileSize;
      const y2 = y1 + this.tileSize;

      const adjT = hasCell(r - 1, c);
      const adjB = hasCell(r + 1, c);
      const adjL = hasCell(r, c - 1);
      const adjR = hasCell(r, c + 1);

      // Draw bright border on outer edges
      borderG.setStrokeStyle({ width: 3, color: colors.light, alpha: 0.9 });

      if (!adjT) {
        borderG.moveTo(x1, y1).lineTo(x2, y1).stroke();
      }
      if (!adjB) {
        borderG.moveTo(x1, y2).lineTo(x2, y2).stroke();
      }
      if (!adjL) {
        borderG.moveTo(x1, y1).lineTo(x1, y2).stroke();
      }
      if (!adjR) {
        borderG.moveTo(x2, y1).lineTo(x2, y2).stroke();
      }
    }

    this.glowContainer.addChild(borderG);
  }
}
