/**
 * Heads-up display - wide browser layout
 * Top bar: stats | Left: career | Right: next piece/combo | Bottom: pressure
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { StatsState, CareerState, PieceState } from '@/core/types';
import { formatNumber } from '@/config/scoring';
import { TILE_COLORS, ABILITY_DESC } from '@/config/tiles';
import { TileRenderer } from '@/rendering/TileRenderer';
import { getPieceCells } from '@/core/Piece';
import { BOARD } from '@/config/board';

const PANEL_BG = 0x0a0a18;
const PANEL_ALPHA = 0.92;
const PANEL_WIDTH = 140;
const ACCENT_CYAN = 0x00e5ff;
const ACCENT_MAGENTA = 0xff2d6e;
const ACCENT_GOLD = 0xffe600;
const ACCENT_PURPLE = 0xc060ff;
const TEXT_DIM = 0x667788;

export class HUD {
  private container: Container;
  private tileRenderer: TileRenderer;
  private screenWidth: number;
  private screenHeight: number;

  // Top bar elements
  private topBar!: Container;
  private streamsText!: Text;
  private followersText!: Text;
  private stageText!: Text;
  private rankText!: Text;

  // Left panel elements
  private leftPanel!: Container;
  private careerProgressBg!: Graphics;
  private careerProgressFill!: Graphics;
  private careerStageText!: Text;
  private statBars: Map<string, { text: Text; bar: Graphics }> = new Map();

  // Right panel elements
  private rightPanel!: Container;
  private nextPieceContainer!: Container;
  private nextLabel!: Text;
  private comboText!: Text;
  private comboValue!: Text;
  private abilityContainer!: Container;

  // Bottom pressure bar
  private pressureContainer!: Container;
  private pressureBar!: Graphics;
  private pressureGlow!: Graphics;
  private pressureText!: Text;

  // Toast
  private toastContainer!: Container;
  private toastText!: Text;
  private toastTimer = 0;

  // Combo popup
  private comboPopup!: Container;
  private comboPopupText!: Text;
  private comboTimer = 0;

  // Animation state
  private pulsePhase = 0;

  constructor(container: Container, screenWidth: number, screenHeight: number) {
    this.container = container;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.tileRenderer = new TileRenderer(28);

    this.createTopBar();
    this.createLeftPanel();
    this.createRightPanel();
    this.createPressureBar();
    this.createToast();
    this.createComboPopup();
  }

  private createTopBar(): void {
    this.topBar = new Container();
    this.topBar.position.set(0, 0);

    // Background
    const bg = new Graphics()
      .rect(0, 0, this.screenWidth, 44)
      .fill({ color: PANEL_BG, alpha: PANEL_ALPHA });
    this.topBar.addChild(bg);

    // Bottom border glow
    const borderGlow = new Graphics()
      .rect(0, 42, this.screenWidth, 2)
      .fill({ color: ACCENT_CYAN, alpha: 0.3 });
    this.topBar.addChild(borderGlow);

    const labelStyle = new TextStyle({
      fontFamily: '"Barlow Condensed", sans-serif',
      fontSize: 11,
      fontWeight: '600',
      fill: TEXT_DIM,
      letterSpacing: 1,
    });

    const valueStyle = new TextStyle({
      fontFamily: '"Barlow Condensed", sans-serif',
      fontSize: 20,
      fontWeight: '700',
      fill: 0xffffff,
    });

    // Left side: Streams
    let x = 20;

    const streamsIcon = new Text({ text: '🎧', style: { fontSize: 18 } });
    streamsIcon.position.set(x, 12);
    this.topBar.addChild(streamsIcon);
    x += 28;

    const streamsLabel = new Text({ text: 'STREAMS', style: labelStyle });
    streamsLabel.position.set(x, 6);
    this.topBar.addChild(streamsLabel);

    this.streamsText = new Text({ text: '0', style: { ...valueStyle, fill: ACCENT_CYAN } });
    this.streamsText.position.set(x, 20);
    this.topBar.addChild(this.streamsText);
    x += 100;

    // Followers
    const followersIcon = new Text({ text: '👥', style: { fontSize: 18 } });
    followersIcon.position.set(x, 12);
    this.topBar.addChild(followersIcon);
    x += 28;

    const followersLabel = new Text({ text: 'FOLLOWERS', style: labelStyle });
    followersLabel.position.set(x, 6);
    this.topBar.addChild(followersLabel);

    this.followersText = new Text({ text: '0', style: { ...valueStyle, fill: ACCENT_PURPLE } });
    this.followersText.position.set(x, 20);
    this.topBar.addChild(this.followersText);

    // Center: Stage
    this.stageText = new Text({
      text: 'BEDROOM PRODUCER',
      style: new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 10,
        fill: ACCENT_GOLD,
        letterSpacing: 2,
      })
    });
    this.stageText.anchor.set(0.5, 0.5);
    this.stageText.position.set(this.screenWidth / 2, 22);
    this.topBar.addChild(this.stageText);

    // Right side: Rank
    const rankLabel = new Text({ text: 'CHART RANK', style: labelStyle });
    rankLabel.anchor.set(1, 0);
    rankLabel.position.set(this.screenWidth - 20, 6);
    this.topBar.addChild(rankLabel);

    this.rankText = new Text({
      text: '#99',
      style: new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 18,
        fill: ACCENT_GOLD,
      })
    });
    this.rankText.anchor.set(1, 0);
    this.rankText.position.set(this.screenWidth - 20, 20);
    this.topBar.addChild(this.rankText);

    this.container.addChild(this.topBar);
  }

  private createLeftPanel(): void {
    this.leftPanel = new Container();
    this.leftPanel.position.set(0, 54);

    // Background
    const panelHeight = this.screenHeight - 54 - 50;
    const bg = new Graphics()
      .rect(0, 0, PANEL_WIDTH, panelHeight)
      .fill({ color: PANEL_BG, alpha: PANEL_ALPHA });
    this.leftPanel.addChild(bg);

    // Right border glow
    const borderGlow = new Graphics()
      .rect(PANEL_WIDTH - 2, 0, 2, panelHeight)
      .fill({ color: ACCENT_CYAN, alpha: 0.2 });
    this.leftPanel.addChild(borderGlow);

    let y = 16;

    // Career Progress section
    const careerLabel = new Text({
      text: 'CAREER',
      style: new TextStyle({
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 12,
        fontWeight: '700',
        fill: TEXT_DIM,
        letterSpacing: 2,
      })
    });
    careerLabel.position.set(12, y);
    this.leftPanel.addChild(careerLabel);
    y += 22;

    // Stage name
    this.careerStageText = new Text({
      text: 'Stage 1/7',
      style: new TextStyle({
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 14,
        fontWeight: '600',
        fill: 0xffffff,
      })
    });
    this.careerStageText.position.set(12, y);
    this.leftPanel.addChild(this.careerStageText);
    y += 24;

    // Progress bar background
    this.careerProgressBg = new Graphics()
      .roundRect(12, y, PANEL_WIDTH - 24, 8, 4)
      .fill({ color: 0x222233 });
    this.leftPanel.addChild(this.careerProgressBg);

    // Progress bar fill
    this.careerProgressFill = new Graphics();
    this.leftPanel.addChild(this.careerProgressFill);
    y += 24;

    // Divider
    const div1 = new Graphics()
      .rect(12, y, PANEL_WIDTH - 24, 1)
      .fill({ color: 0xffffff, alpha: 0.08 });
    this.leftPanel.addChild(div1);
    y += 16;

    // Stats section
    const statsLabel = new Text({
      text: 'STATS',
      style: new TextStyle({
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 12,
        fontWeight: '700',
        fill: TEXT_DIM,
        letterSpacing: 2,
      })
    });
    statsLabel.position.set(12, y);
    this.leftPanel.addChild(statsLabel);
    y += 24;

    // Create stat rows
    y = this.createStatRow(y, '🎤', 'Vocal', ACCENT_MAGENTA, 'vocal');
    y = this.createStatRow(y, '🥁', 'Beats', ACCENT_CYAN, 'beats');
    y = this.createStatRow(y, '🎸', 'Vibes', ACCENT_GOLD, 'vibes');
    y = this.createStatRow(y, '👁', 'Visibility', ACCENT_PURPLE, 'visibility');

    this.container.addChild(this.leftPanel);
  }

  private createStatRow(y: number, icon: string, label: string, color: number, key: string): number {
    const row = new Container();
    row.position.set(12, y);

    // Icon
    const iconText = new Text({ text: icon, style: { fontSize: 14 } });
    iconText.position.set(0, 0);
    row.addChild(iconText);

    // Label
    const labelText = new Text({
      text: label.toUpperCase(),
      style: new TextStyle({
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 11,
        fontWeight: '600',
        fill: TEXT_DIM,
      })
    });
    labelText.position.set(22, 2);
    row.addChild(labelText);

    // Value
    const valueText = new Text({
      text: '0',
      style: new TextStyle({
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 14,
        fontWeight: '700',
        fill: color,
      })
    });
    valueText.anchor.set(1, 0);
    valueText.position.set(PANEL_WIDTH - 26, 0);
    row.addChild(valueText);

    // Bar background
    const barBg = new Graphics()
      .roundRect(0, 20, PANEL_WIDTH - 24, 4, 2)
      .fill({ color: 0x222233 });
    row.addChild(barBg);

    // Bar fill
    const barFill = new Graphics();
    row.addChild(barFill);

    this.statBars.set(key, { text: valueText, bar: barFill });
    this.leftPanel.addChild(row);

    return y + 36;
  }

  private createRightPanel(): void {
    this.rightPanel = new Container();
    this.rightPanel.position.set(this.screenWidth - PANEL_WIDTH, 54);

    const panelHeight = this.screenHeight - 54 - 50;

    // Background
    const bg = new Graphics()
      .rect(0, 0, PANEL_WIDTH, panelHeight)
      .fill({ color: PANEL_BG, alpha: PANEL_ALPHA });
    this.rightPanel.addChild(bg);

    // Left border glow
    const borderGlow = new Graphics()
      .rect(0, 0, 2, panelHeight)
      .fill({ color: ACCENT_MAGENTA, alpha: 0.2 });
    this.rightPanel.addChild(borderGlow);

    let y = 16;

    // Next piece section
    this.nextLabel = new Text({
      text: 'NEXT',
      style: new TextStyle({
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 12,
        fontWeight: '700',
        fill: TEXT_DIM,
        letterSpacing: 2,
      })
    });
    this.nextLabel.position.set(12, y);
    this.rightPanel.addChild(this.nextLabel);
    y += 24;

    // Next piece container with background
    const nextBg = new Graphics()
      .roundRect(12, y, PANEL_WIDTH - 24, 80, 6)
      .fill({ color: 0x111122, alpha: 0.8 });
    this.rightPanel.addChild(nextBg);

    this.nextPieceContainer = new Container();
    this.nextPieceContainer.position.set(12 + (PANEL_WIDTH - 24) / 2, y + 40);
    this.rightPanel.addChild(this.nextPieceContainer);
    y += 96;

    // Divider
    const div1 = new Graphics()
      .rect(12, y, PANEL_WIDTH - 24, 1)
      .fill({ color: 0xffffff, alpha: 0.08 });
    this.rightPanel.addChild(div1);
    y += 16;

    // Combo section
    const comboLabel = new Text({
      text: 'COMBO',
      style: new TextStyle({
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 12,
        fontWeight: '700',
        fill: TEXT_DIM,
        letterSpacing: 2,
      })
    });
    comboLabel.position.set(12, y);
    this.rightPanel.addChild(comboLabel);
    y += 24;

    this.comboValue = new Text({
      text: 'x1',
      style: new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 24,
        fill: 0x444466,
      })
    });
    this.comboValue.anchor.set(0.5, 0);
    this.comboValue.position.set(PANEL_WIDTH / 2, y);
    this.rightPanel.addChild(this.comboValue);
    y += 40;

    // Divider
    const div2 = new Graphics()
      .rect(12, y, PANEL_WIDTH - 24, 1)
      .fill({ color: 0xffffff, alpha: 0.08 });
    this.rightPanel.addChild(div2);
    y += 16;

    // Abilities section
    const abilLabel = new Text({
      text: 'ABILITIES',
      style: new TextStyle({
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 12,
        fontWeight: '700',
        fill: TEXT_DIM,
        letterSpacing: 2,
      })
    });
    abilLabel.position.set(12, y);
    this.rightPanel.addChild(abilLabel);
    y += 24;

    this.abilityContainer = new Container();
    this.abilityContainer.position.set(12, y);
    this.rightPanel.addChild(this.abilityContainer);

    this.container.addChild(this.rightPanel);
  }

  private createPressureBar(): void {
    this.pressureContainer = new Container();
    this.pressureContainer.position.set(PANEL_WIDTH, this.screenHeight - 50);

    const barWidth = this.screenWidth - PANEL_WIDTH * 2;

    // Background
    const bg = new Graphics()
      .rect(0, 0, barWidth, 50)
      .fill({ color: PANEL_BG, alpha: PANEL_ALPHA });
    this.pressureContainer.addChild(bg);

    // Top border
    const topBorder = new Graphics()
      .rect(0, 0, barWidth, 2)
      .fill({ color: ACCENT_CYAN, alpha: 0.2 });
    this.pressureContainer.addChild(topBorder);

    // Label
    this.pressureText = new Text({
      text: 'PRESSURE',
      style: new TextStyle({
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 11,
        fontWeight: '700',
        fill: TEXT_DIM,
        letterSpacing: 2,
      })
    });
    this.pressureText.position.set(12, 8);
    this.pressureContainer.addChild(this.pressureText);

    // Pressure bar background (waveform style)
    const barBg = new Graphics()
      .roundRect(12, 26, barWidth - 24, 14, 4)
      .fill({ color: 0x111122 });
    this.pressureContainer.addChild(barBg);

    // Pressure glow (behind fill)
    this.pressureGlow = new Graphics();
    this.pressureContainer.addChild(this.pressureGlow);

    // Pressure bar fill
    this.pressureBar = new Graphics();
    this.pressureContainer.addChild(this.pressureBar);

    this.container.addChild(this.pressureContainer);
  }

  private createToast(): void {
    this.toastContainer = new Container();
    this.toastContainer.position.set(this.screenWidth / 2, 70);
    this.toastContainer.alpha = 0;

    const bg = new Graphics()
      .roundRect(-120, -18, 240, 36, 8)
      .fill({ color: 0x0a0a18, alpha: 0.95 });
    this.toastContainer.addChild(bg);

    const border = new Graphics()
      .roundRect(-120, -18, 240, 36, 8)
      .stroke({ color: ACCENT_CYAN, width: 1, alpha: 0.5 });
    this.toastContainer.addChild(border);

    this.toastText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 9,
        fill: 0xffffff,
      })
    });
    this.toastText.anchor.set(0.5);
    this.toastContainer.addChild(this.toastText);

    this.container.addChild(this.toastContainer);
  }

  private createComboPopup(): void {
    this.comboPopup = new Container();
    this.comboPopup.position.set(this.screenWidth / 2, this.screenHeight * 0.35);
    this.comboPopup.alpha = 0;

    this.comboPopupText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 18,
        fill: 0xffffff,
      })
    });
    this.comboPopupText.anchor.set(0.5);
    this.comboPopup.addChild(this.comboPopupText);

    this.container.addChild(this.comboPopup);
  }

  updateStats(stats: StatsState): void {
    this.rankText.text = `#${stats.rank}`;
    this.streamsText.text = formatNumber(stats.streams);
    this.followersText.text = formatNumber(stats.followers);

    // Update visibility stat bar
    const visBar = this.statBars.get('visibility');
    if (visBar) {
      visBar.text.text = formatNumber(stats.visibility);
      this.updateStatBar(visBar.bar, stats.visibility / 100000, ACCENT_PURPLE);
    }
  }

  private updateStatBar(bar: Graphics, progress: number, color: number): void {
    bar.clear();
    const width = (PANEL_WIDTH - 24) * Math.min(1, progress);
    if (width > 0) {
      bar.roundRect(0, 20, width, 4, 2).fill({ color });
    }
  }

  updateCareer(career: CareerState): void {
    this.stageText.text = career.stageName.toUpperCase();
    this.careerStageText.text = `Stage ${career.stageIndex + 1}/7`;

    // Update progress bar
    this.careerProgressFill.clear();
    const progress = career.stageIndex / 6;
    const width = (PANEL_WIDTH - 24) * progress;
    if (width > 0) {
      this.careerProgressFill
        .roundRect(12, 0, width, 8, 4)
        .fill({ color: ACCENT_GOLD });
    }
    this.careerProgressFill.position.set(0, 62);
  }

  updateNextPiece(piece: PieceState | null): void {
    this.nextPieceContainer.removeChildren();

    if (!piece) return;

    const cells = getPieceCells({ ...piece, x: 0, y: 0 });
    const previewSize = 24;

    // Center the piece
    let minCol = Infinity, maxCol = -Infinity;
    let minRow = Infinity, maxRow = -Infinity;
    for (const { col, row } of cells) {
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
    }
    const pieceWidth = (maxCol - minCol + 1) * previewSize;
    const pieceHeight = (maxRow - minRow + 1) * previewSize;

    for (const { col, row, type } of cells) {
      const tile = this.tileRenderer.createTile(type);
      tile.scale.set(previewSize / this.tileRenderer['tileSize']);
      tile.position.set(
        (col - minCol) * previewSize - pieceWidth / 2,
        (row - minRow) * previewSize - pieceHeight / 2
      );
      this.nextPieceContainer.addChild(tile);
    }

    // Update ability hints in ability container
    this.abilityContainer.removeChildren();
    const hintType = piece.isSpecial ? piece.specialType : piece.tiles[0];
    const hint = ABILITY_DESC[hintType as keyof typeof ABILITY_DESC];
    if (hint) {
      const hintText = new Text({
        text: hint,
        style: new TextStyle({
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 11,
          fill: TEXT_DIM,
          wordWrap: true,
          wordWrapWidth: PANEL_WIDTH - 28,
        })
      });
      this.abilityContainer.addChild(hintText);
    }
  }

  updatePressure(progress: number, warning: boolean): void {
    const barWidth = this.screenWidth - PANEL_WIDTH * 2 - 24;
    const fillWidth = barWidth * Math.min(1, progress);

    this.pressureBar.clear();
    this.pressureGlow.clear();

    if (fillWidth > 0) {
      const color = warning ? ACCENT_MAGENTA : 0x445577;

      // Glow effect when warning
      if (warning) {
        const glowAlpha = 0.3 + Math.sin(this.pulsePhase * 3) * 0.2;
        this.pressureGlow
          .roundRect(12, 24, fillWidth, 18, 4)
          .fill({ color: ACCENT_MAGENTA, alpha: glowAlpha });
      }

      // Main bar
      this.pressureBar
        .roundRect(12, 26, fillWidth, 14, 4)
        .fill({ color, alpha: warning ? 1 : 0.6 });

      // Warning text color
      this.pressureText.style.fill = warning ? ACCENT_MAGENTA : TEXT_DIM;
    }
  }

  showToast(message: string, color: number, duration: number = 1800): void {
    this.toastText.text = message;
    this.toastText.style.fill = color;
    this.toastContainer.alpha = 1;
    this.toastTimer = duration;
  }

  showCombo(message: string, color: number): void {
    this.comboPopupText.text = message;
    this.comboPopupText.style.fill = color;
    this.comboPopup.alpha = 1;
    this.comboPopup.scale.set(0.6);
    this.comboTimer = 1100;

    // Update side panel combo display
    const match = message.match(/×(\d+)/);
    if (match) {
      this.comboValue.text = `x${match[1]}`;
      this.comboValue.style.fill = color;
    }
  }

  update(dt: number): void {
    const dtMs = dt * 1000;
    this.pulsePhase += dt * 4;

    // Toast fade
    if (this.toastTimer > 0) {
      this.toastTimer -= dtMs;
      if (this.toastTimer <= 200) {
        this.toastContainer.alpha = this.toastTimer / 200;
      }
    }

    // Combo animation
    if (this.comboTimer > 0) {
      this.comboTimer -= dtMs;

      const progress = 1 - this.comboTimer / 1100;

      if (progress < 0.18) {
        const t = progress / 0.18;
        this.comboPopup.scale.set(0.6 + t * 0.6);
        this.comboPopup.alpha = t;
      } else if (progress < 0.65) {
        this.comboPopup.scale.set(1.2 - (progress - 0.18) * 0.4);
        this.comboPopup.alpha = 1;
      } else {
        const t = (progress - 0.65) / 0.35;
        this.comboPopup.alpha = 1 - t;
        this.comboPopup.y -= dt * 30;
      }
    } else {
      // Reset combo display after animation
      this.comboValue.text = 'x1';
      this.comboValue.style.fill = 0x444466;
    }
  }

  resetComboPosition(screenHeight: number): void {
    this.comboPopup.y = screenHeight * 0.35;
  }
}
