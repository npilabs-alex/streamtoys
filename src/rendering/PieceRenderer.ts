/**
 * Active piece and ghost piece rendering
 */

import { Container, Graphics } from 'pixi.js';
import { PieceState } from '@/core/types';
import { Board } from '@/core/Board';
import { getPieceCells, getGhostPosition } from '@/core/Piece';
import { TileRenderer } from './TileRenderer';
import { TILE_COLORS, SPECIAL_TYPES } from '@/config/tiles';
import { VISUAL } from '@/config/visuals';

export class PieceRenderer {
  private pieceContainer: Container;
  private ghostContainer: Container;
  private tileRenderer: TileRenderer;
  private tileSize: number;

  private currentPiece: PieceState | null = null;

  constructor(
    pieceContainer: Container,
    ghostContainer: Container,
    tileRenderer: TileRenderer,
    tileSize: number
  ) {
    this.pieceContainer = pieceContainer;
    this.ghostContainer = ghostContainer;
    this.tileRenderer = tileRenderer;
    this.tileSize = tileSize;
  }

  setTileSize(size: number): void {
    this.tileSize = size;
  }

  setPiece(piece: PieceState, board: Board): void {
    this.currentPiece = piece;
    this.renderGhost(piece, board);
  }

  updatePosition(piece: PieceState | null, smoothY: number, board: Board): void {
    this.currentPiece = piece;
    if (piece) {
      this.renderGhost(piece, board);
    }
  }

  update(piece: PieceState | null, smoothY: number): void {
    this.pieceContainer.removeChildren();

    if (!piece) return;

    const cells = getPieceCells(piece);
    const yOffset = (smoothY - Math.floor(piece.y)) * this.tileSize;

    // Group cells by type for merged rendering
    const typeGroups = new Map<string, { col: number; row: number }[]>();
    for (const { col, row, type } of cells) {
      if (row < 0) continue; // Above board

      const key = String(type);
      if (!typeGroups.has(key)) {
        typeGroups.set(key, []);
      }
      typeGroups.get(key)!.push({ col, row });
    }

    // Render each type group
    for (const [typeStr, typeCells] of typeGroups) {
      const type = typeStr as any;
      const isSpecial = SPECIAL_TYPES.includes(type);

      if (typeCells.length >= 2 && !isSpecial) {
        // Render as merged blob
        const merged = this.tileRenderer.createMergedCluster(typeCells, type, 0);
        merged.position.y = yOffset;
        this.pieceContainer.addChild(merged);
      } else {
        // Render individual tiles
        for (const { col, row } of typeCells) {
          const tile = this.tileRenderer.createTile(type, {
            pulse: isSpecial ? 0.5 : 0,
          });
          tile.position.set(
            col * this.tileSize,
            row * this.tileSize + yOffset
          );
          this.pieceContainer.addChild(tile);
        }
      }
    }
  }

  private renderGhost(piece: PieceState, board: Board): void {
    this.ghostContainer.removeChildren();

    const ghostY = getGhostPosition(piece, board);

    // Don't render ghost if piece is already at ghost position
    if (ghostY === Math.floor(piece.y)) return;

    const cells = getPieceCells({ ...piece, y: ghostY });
    const firstType = cells[0]?.type;
    const colors = TILE_COLORS[firstType as keyof typeof TILE_COLORS] || TILE_COLORS.GARBAGE;

    const g = new Graphics();
    g.alpha = VISUAL.ghostAlpha;

    // Build cell set for edge detection
    const cellSet = new Set(cells.map(c => `${c.row},${c.col}`));
    const hasCell = (r: number, c: number) => cellSet.has(`${r},${c}`);

    // Draw only outer edges with dashed lines
    for (const { col, row } of cells) {
      if (row < 0) continue;

      const x1 = col * this.tileSize + 2;
      const y1 = row * this.tileSize + 2;
      const x2 = (col + 1) * this.tileSize - 2;
      const y2 = (row + 1) * this.tileSize - 2;

      const adjT = hasCell(row - 1, col);
      const adjB = hasCell(row + 1, col);
      const adjL = hasCell(row, col - 1);
      const adjR = hasCell(row, col + 1);

      // Draw dashed edges
      g.setStrokeStyle({
        width: 1.5,
        color: colors.light,
        alpha: 0.8,
      });

      if (!adjT) this.drawDashedLine(g, x1, y1, x2, y1);
      if (!adjB) this.drawDashedLine(g, x1, y2, x2, y2);
      if (!adjL) this.drawDashedLine(g, x1, y1, x1, y2);
      if (!adjR) this.drawDashedLine(g, x2, y1, x2, y2);
    }

    this.ghostContainer.addChild(g);
  }

  private drawDashedLine(g: Graphics, x1: number, y1: number, x2: number, y2: number): void {
    const dashLength = VISUAL.ghostDashLength;
    const gapLength = VISUAL.ghostGapLength;
    const totalLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const dx = (x2 - x1) / totalLength;
    const dy = (y2 - y1) / totalLength;

    let drawn = 0;
    let drawing = true;

    while (drawn < totalLength) {
      const segmentLength = drawing
        ? Math.min(dashLength, totalLength - drawn)
        : Math.min(gapLength, totalLength - drawn);

      if (drawing) {
        g.moveTo(x1 + dx * drawn, y1 + dy * drawn);
        g.lineTo(x1 + dx * (drawn + segmentLength), y1 + dy * (drawn + segmentLength));
        g.stroke();
      }

      drawn += segmentLength;
      drawing = !drawing;
    }
  }

  clear(): void {
    this.pieceContainer.removeChildren();
    this.ghostContainer.removeChildren();
    this.currentPiece = null;
  }
}
