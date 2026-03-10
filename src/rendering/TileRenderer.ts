/**
 * Individual tile rendering with gem-style graphics
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TILE_COLORS, AnyTileType, SPECIAL_TYPES, TILE_ICONS } from '@/config/tiles';
import { VISUAL } from '@/config/visuals';

export class TileRenderer {
  private tileSize: number;

  constructor(tileSize: number) {
    this.tileSize = tileSize;
  }

  setTileSize(size: number): void {
    this.tileSize = size;
  }

  /**
   * Create a gem-style tile graphic
   */
  createTile(
    type: AnyTileType,
    options: {
      flash?: boolean;
      pulse?: number;
      alpha?: number;
    } = {}
  ): Container {
    const { flash = false, pulse = 0, alpha = 1 } = options;
    const container = new Container();
    const colors = TILE_COLORS[type] || TILE_COLORS.GARBAGE;
    const isSpecial = SPECIAL_TYPES.includes(type as any);

    const pad = Math.max(2, this.tileSize * 0.055);
    const innerW = this.tileSize - pad * 2;
    const innerH = this.tileSize - pad * 2;
    const radius = Math.min(innerW, innerH) * 0.22;

    container.alpha = alpha;

    if (flash) {
      // White flash
      const flashG = new Graphics()
        .roundRect(pad, pad, innerW, innerH, radius)
        .fill({ color: 0xffffff });
      container.addChild(flashG);
      return container;
    }

    // Outer glow for valid clusters or specials
    if (pulse > 0 || isSpecial) {
      const glowG = new Graphics()
        .roundRect(pad - 2, pad - 2, innerW + 4, innerH + 4, radius + 2)
        .stroke({ color: colors.glow, width: 2, alpha: 0.6 + pulse * 0.3 });
      container.addChild(glowG);
    }

    // Base body with gradient simulation (top to bottom: mid -> base -> dark)
    const baseG = new Graphics()
      .roundRect(pad, pad, innerW, innerH, radius)
      .fill({ color: colors.base });
    container.addChild(baseG);

    // Top highlight gradient simulation
    const highlightG = new Graphics()
      .roundRect(pad, pad, innerW, innerH * 0.5, radius)
      .fill({ color: colors.mid, alpha: 0.5 });
    container.addChild(highlightG);

    // Side shading (left lighter, right darker)
    const leftShade = new Graphics()
      .roundRect(pad, pad, innerW * 0.3, innerH, radius)
      .fill({ color: 0xffffff, alpha: 0.1 });
    container.addChild(leftShade);

    // Top specular highlight (oval)
    const specularG = new Graphics()
      .ellipse(
        pad + innerW * 0.38,
        pad + innerH * 0.22,
        innerW * 0.25,
        innerH * 0.12
      )
      .fill({ color: 0xffffff, alpha: 0.45 });
    container.addChild(specularG);

    // Glint dot
    const glintG = new Graphics()
      .circle(pad + innerW * 0.25, pad + innerH * 0.2, innerW * 0.08)
      .fill({ color: 0xffffff, alpha: 0.8 });
    container.addChild(glintG);

    // Border
    const borderG = new Graphics()
      .roundRect(pad, pad, innerW, innerH, radius)
      .stroke({ color: colors.light, width: 1.2, alpha: 0.6 });
    container.addChild(borderG);

    // Icon
    const icon = this.createIcon(type, colors);
    icon.position.set(this.tileSize / 2, this.tileSize / 2);
    container.addChild(icon);

    // Special sparkle overlay
    if (isSpecial) {
      const sparkles = this.createSparkles(colors.glow, innerW);
      sparkles.position.set(pad + innerW / 2, pad + innerH / 2);
      container.addChild(sparkles);
    }

    return container;
  }

  /**
   * Create tile icon
   */
  private createIcon(type: AnyTileType, colors: typeof TILE_COLORS.BEAT): Container {
    const container = new Container();
    const iconSize = this.tileSize * 0.36;
    const g = new Graphics();

    switch (type) {
      case 'BEAT':
        // Drum with sticks
        g.ellipse(0, iconSize * 0.1, iconSize * 0.5, iconSize * 0.25)
          .stroke({ color: 0xffffff, width: iconSize * 0.08, alpha: 0.9 })
          .moveTo(-iconSize * 0.3, -iconSize * 0.4)
          .lineTo(-iconSize * 0.1, -iconSize * 0.1)
          .stroke({ color: 0xffffff, width: iconSize * 0.06, alpha: 0.9 })
          .moveTo(iconSize * 0.3, -iconSize * 0.4)
          .lineTo(iconSize * 0.1, -iconSize * 0.1)
          .stroke({ color: 0xffffff, width: iconSize * 0.06, alpha: 0.9 });
        break;

      case 'VOCAL':
        // Microphone
        g.roundRect(-iconSize * 0.15, -iconSize * 0.4, iconSize * 0.3, iconSize * 0.5, iconSize * 0.15)
          .fill({ color: 0xffffff, alpha: 0.2 })
          .stroke({ color: 0xffffff, width: iconSize * 0.08, alpha: 0.9 })
          .moveTo(0, iconSize * 0.1)
          .lineTo(0, iconSize * 0.35)
          .stroke({ color: 0xffffff, width: iconSize * 0.08, alpha: 0.9 })
          .moveTo(-iconSize * 0.2, iconSize * 0.35)
          .lineTo(iconSize * 0.2, iconSize * 0.35)
          .stroke({ color: 0xffffff, width: iconSize * 0.08, alpha: 0.9 });
        break;

      case 'FLOW':
        // EQ bars
        const barW = iconSize * 0.12;
        const heights = [0.5, 0.9, 0.65, 0.85, 0.45];
        heights.forEach((h, i) => {
          const barH = iconSize * h;
          const x = -iconSize * 0.45 + i * iconSize * 0.22;
          g.roundRect(x, iconSize * 0.4 - barH, barW, barH, 2)
            .fill({ color: 0xffffff, alpha: 0.85 });
        });
        break;

      case 'HYPE':
        // Lightning bolt
        g.moveTo(iconSize * 0.1, -iconSize * 0.5)
          .lineTo(-iconSize * 0.2, 0)
          .lineTo(iconSize * 0.05, 0)
          .lineTo(-iconSize * 0.1, iconSize * 0.5)
          .lineTo(iconSize * 0.25, -iconSize * 0.05)
          .lineTo(0, -iconSize * 0.05)
          .closePath()
          .fill({ color: 0xffffff, alpha: 0.95 });
        break;

      case 'LABEL':
        // Price tag
        g.moveTo(-iconSize * 0.4, -iconSize * 0.25)
          .lineTo(iconSize * 0.15, -iconSize * 0.25)
          .lineTo(iconSize * 0.4, 0)
          .lineTo(iconSize * 0.15, iconSize * 0.25)
          .lineTo(-iconSize * 0.4, iconSize * 0.25)
          .closePath()
          .fill({ color: 0xffffff, alpha: 0.2 })
          .stroke({ color: 0xffffff, width: iconSize * 0.08, alpha: 0.9 })
          .circle(iconSize * 0.2, 0, iconSize * 0.08)
          .fill({ color: 0xffffff, alpha: 0.85 });
        break;

      case 'WILD':
        // 5-point star
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * 4 * Math.PI / 5) - Math.PI / 2;
          const innerAngle = outerAngle + 2 * Math.PI / 5;
          const outerR = iconSize * 0.5;
          const innerR = iconSize * 0.2;

          if (i === 0) {
            g.moveTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
          } else {
            g.lineTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
          }
          g.lineTo(Math.cos(innerAngle) * innerR, Math.sin(innerAngle) * innerR);
        }
        g.closePath().fill({ color: 0xffffff, alpha: 0.95 });
        break;

      case 'GARBAGE':
        // Skull
        g.circle(0, -iconSize * 0.1, iconSize * 0.35)
          .fill({ color: 0xcc0020, alpha: 0.7 })
          .circle(-iconSize * 0.15, -iconSize * 0.15, iconSize * 0.1)
          .fill({ color: 0x050410, alpha: 0.95 })
          .circle(iconSize * 0.15, -iconSize * 0.15, iconSize * 0.1)
          .fill({ color: 0x050410, alpha: 0.95 });
        break;

      case 'EP':
        // Vinyl record
        g.circle(0, 0, iconSize * 0.45)
          .stroke({ color: 0xffffff, width: iconSize * 0.08, alpha: 0.8 })
          .circle(0, 0, iconSize * 0.15)
          .fill({ color: 0xffffff, alpha: 0.75 });
        break;

      case 'ALBUM':
        // Spinning vinyl
        g.circle(0, 0, iconSize * 0.45)
          .stroke({ color: 0xffd700, width: iconSize * 0.08, alpha: 0.85 })
          .circle(0, 0, iconSize * 0.1)
          .fill({ color: 0xffd700, alpha: 0.9 });
        break;

      case 'VIRAL':
        // Flame
        g.moveTo(0, -iconSize * 0.5)
          .bezierCurveTo(
            iconSize * 0.4, -iconSize * 0.2,
            iconSize * 0.35, iconSize * 0.2,
            0, iconSize * 0.5
          )
          .bezierCurveTo(
            -iconSize * 0.35, iconSize * 0.2,
            -iconSize * 0.4, -iconSize * 0.2,
            0, -iconSize * 0.5
          )
          .fill({ color: 0xff5020, alpha: 0.95 });
        break;

      case 'CHART':
        // Rising bars with arrow
        const barHeights = [0.35, 0.55, 0.45, 0.7];
        barHeights.forEach((h, i) => {
          g.roundRect(
            -iconSize * 0.4 + i * iconSize * 0.22,
            iconSize * 0.4 - iconSize * h,
            iconSize * 0.18,
            iconSize * h,
            2
          ).fill({ color: 0x00ffaa, alpha: 0.9 });
        });
        break;

      case 'COLLAB':
        // Two overlapping circles
        g.circle(-iconSize * 0.15, 0, iconSize * 0.3)
          .fill({ color: 0xffffff, alpha: 0.1 })
          .stroke({ color: 0xffffff, width: iconSize * 0.08, alpha: 0.85 })
          .circle(iconSize * 0.15, 0, iconSize * 0.3)
          .fill({ color: 0xffffff, alpha: 0.1 })
          .stroke({ color: 0xffffff, width: iconSize * 0.08, alpha: 0.85 });
        break;
    }

    container.addChild(g);
    return container;
  }

  /**
   * Create sparkle overlay for special tiles
   */
  private createSparkles(color: number, size: number): Container {
    const container = new Container();
    const g = new Graphics();

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI / 2);
      const r = size * 0.35;
      g.circle(
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        1.5
      ).fill({ color: 0xffffff, alpha: 0.6 });
    }

    container.addChild(g);
    return container;
  }

  /**
   * Create merged cluster visual (multiple tiles as one blob)
   */
  createMergedCluster(
    cells: { row: number; col: number }[],
    type: AnyTileType,
    pulse: number = 0
  ): Container {
    const container = new Container();
    const colors = TILE_COLORS[type] || TILE_COLORS.GARBAGE;
    const isValid = cells.length >= 3;

    const cellSet = new Set(cells.map(c => `${c.row},${c.col}`));
    const hasCell = (r: number, c: number) => cellSet.has(`${r},${c}`);

    const pad = VISUAL.boardPadding;
    const radius = VISUAL.tileCornerRadius;

    // Draw each cell with merged edges
    for (const { row, col } of cells) {
      const px = col * this.tileSize;
      const py = row * this.tileSize;

      const adjT = hasCell(row - 1, col);
      const adjB = hasCell(row + 1, col);
      const adjL = hasCell(row, col - 1);
      const adjR = hasCell(row, col + 1);

      // Create custom rounded rect with selective corners
      const g = new Graphics();

      // Fill
      const tlr = (adjT || adjL) ? 0 : radius;
      const trr = (adjT || adjR) ? 0 : radius;
      const blr = (adjB || adjL) ? 0 : radius;
      const brr = (adjB || adjR) ? 0 : radius;

      const x1 = px + pad;
      const y1 = py + pad;
      const w = this.tileSize - pad * 2;
      const h = this.tileSize - pad * 2;

      g.roundRect(x1, y1, w, h, radius)
        .fill({ color: colors.base });

      // Top highlight
      g.roundRect(x1, y1, w, h * 0.5, radius)
        .fill({ color: colors.mid, alpha: 0.4 });

      container.addChild(g);

      // Icon on each cell
      const icon = this.createIcon(type, colors);
      icon.position.set(px + this.tileSize / 2, py + this.tileSize / 2);
      icon.scale.set(0.9);
      container.addChild(icon);
    }

    // Outer border only on edges
    const borderG = new Graphics();
    for (const { row, col } of cells) {
      const px = col * this.tileSize + pad;
      const py = row * this.tileSize + pad;
      const w = this.tileSize - pad * 2;
      const h = this.tileSize - pad * 2;

      const adjT = hasCell(row - 1, col);
      const adjB = hasCell(row + 1, col);
      const adjL = hasCell(row, col - 1);
      const adjR = hasCell(row, col + 1);

      if (!adjT) {
        borderG.moveTo(px, py).lineTo(px + w, py)
          .stroke({ color: colors.light, width: isValid ? 2.5 : 1.5, alpha: isValid ? 0.7 : 0.35 });
      }
      if (!adjB) {
        borderG.moveTo(px, py + h).lineTo(px + w, py + h)
          .stroke({ color: colors.light, width: isValid ? 2.5 : 1.5, alpha: isValid ? 0.7 : 0.35 });
      }
      if (!adjL) {
        borderG.moveTo(px, py).lineTo(px, py + h)
          .stroke({ color: colors.light, width: isValid ? 2.5 : 1.5, alpha: isValid ? 0.7 : 0.35 });
      }
      if (!adjR) {
        borderG.moveTo(px + w, py).lineTo(px + w, py + h)
          .stroke({ color: colors.light, width: isValid ? 2.5 : 1.5, alpha: isValid ? 0.7 : 0.35 });
      }
    }
    container.addChild(borderG);

    // Glow for valid clusters
    if (isValid) {
      const glowG = new Graphics();
      glowG.alpha = 0.1 + pulse * 0.15;
      for (const { row, col } of cells) {
        glowG.rect(
          col * this.tileSize,
          row * this.tileSize,
          this.tileSize,
          this.tileSize
        ).fill({ color: colors.glow });
      }
      container.addChildAt(glowG, 0);

      // Size badge
      const topCell = cells.reduce((a, b) =>
        a.row < b.row || (a.row === b.row && a.col > b.col) ? a : b
      );
      const badge = new Graphics()
        .circle(0, 0, 8)
        .fill({ color: colors.glow });
      badge.position.set(
        (topCell.col + 1) * this.tileSize - 8,
        topCell.row * this.tileSize + 8
      );

      const badgeText = new Text({
        text: String(cells.length),
        style: {
          fontFamily: 'Barlow Condensed',
          fontSize: 10,
          fontWeight: 'bold',
          fill: 0x000000,
        }
      });
      badgeText.anchor.set(0.5);
      badge.addChild(badgeText);

      container.addChild(badge);
    }

    return container;
  }
}
