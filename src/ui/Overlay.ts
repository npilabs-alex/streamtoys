/**
 * Game overlays - start, pause, game over
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { StatsState, CareerState } from '@/core/types';
import { formatNumber } from '@/config/scoring';

export type OverlayType = 'start' | 'pause' | 'gameover' | 'none';

export class Overlay {
  private container: Container;
  private background!: Graphics;
  private title!: Text;
  private message!: Text;
  private button!: Container;
  private buttonText!: Text;

  private currentType: OverlayType = 'none';
  private onAction: (() => void) | null = null;

  constructor(container: Container, screenWidth: number, screenHeight: number) {
    this.container = container;
    this.create(screenWidth, screenHeight);
  }

  private create(screenWidth: number, screenHeight: number): void {
    // Background
    this.background = new Graphics()
      .rect(0, 0, screenWidth, screenHeight)
      .fill({ color: 0x02020c, alpha: 0.93 });
    this.container.addChild(this.background);

    // Title
    this.title = new Text({
      text: 'DROP CAST',
      style: new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 18,
        fill: 0x00e5ff,
      })
    });
    this.title.anchor.set(0.5);
    this.title.position.set(screenWidth / 2, screenHeight * 0.35);
    this.container.addChild(this.title);

    // Message
    this.message = new Text({
      text: 'MUSIC HUSTLE\n\nTAP CLUSTERS TO COLLAPSE\nSWIPE TO MOVE\nBUILD YOUR CAREER',
      style: new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 6,
        fill: 0x888899,
        align: 'center',
        lineHeight: 16,
      })
    });
    this.message.anchor.set(0.5);
    this.message.position.set(screenWidth / 2, screenHeight * 0.5);
    this.container.addChild(this.message);

    // Button
    this.button = new Container();
    this.button.position.set(screenWidth / 2, screenHeight * 0.7);
    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';

    const buttonBg = new Graphics()
      .roundRect(-70, -18, 140, 36, 4)
      .stroke({ color: 0x00e5ff, width: 2 });
    this.button.addChild(buttonBg);

    this.buttonText = new Text({
      text: 'START HUSTLE',
      style: new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 8,
        fill: 0x00e5ff,
      })
    });
    this.buttonText.anchor.set(0.5);
    this.button.addChild(this.buttonText);

    this.button.on('pointerdown', () => {
      if (this.onAction) {
        this.onAction();
      }
    });

    this.container.addChild(this.button);

    // Initially hidden
    this.container.visible = false;
  }

  /**
   * Show start screen
   */
  showStart(onStart: () => void): void {
    this.currentType = 'start';
    this.onAction = onStart;

    this.title.text = 'DROP CAST';
    this.title.style.fill = 0x00e5ff;
    this.message.text = 'MUSIC HUSTLE\n\nTAP CLUSTERS TO COLLAPSE\nSWIPE TO MOVE • TAP TO ROTATE\nBUILD YOUR CAREER • RACE TO #1';
    this.buttonText.text = 'START HUSTLE ▶';

    this.container.visible = true;
  }

  /**
   * Show pause screen
   */
  showPause(onResume: () => void): void {
    this.currentType = 'pause';
    this.onAction = onResume;

    this.title.text = 'PAUSED';
    this.title.style.fill = 0xffe600;
    this.message.text = 'PRESS ESC OR TAP TO RESUME';
    this.buttonText.text = 'RESUME ▶';

    this.container.visible = true;
  }

  /**
   * Show game over screen
   */
  showGameOver(stats: StatsState, career: CareerState, onRestart: () => void): void {
    this.currentType = 'gameover';
    this.onAction = onRestart;

    this.title.text = 'GAME OVER';
    this.title.style.fill = 0xff2d6e;

    this.message.text = [
      career.stageName,
      '',
      `CHART: #${stats.rank}`,
      `STREAMS: ${formatNumber(stats.streams)}`,
      `FANS: ${formatNumber(stats.followers)}`,
      `VISIBILITY: ${formatNumber(stats.visibility)}`,
    ].join('\n');

    this.buttonText.text = 'TRY AGAIN ▶';

    this.container.visible = true;
  }

  /**
   * Hide overlay
   */
  hide(): void {
    this.currentType = 'none';
    this.onAction = null;
    this.container.visible = false;
  }

  /**
   * Get current overlay type
   */
  getType(): OverlayType {
    return this.currentType;
  }

  /**
   * Resize overlay
   */
  resize(screenWidth: number, screenHeight: number): void {
    this.background.clear()
      .rect(0, 0, screenWidth, screenHeight)
      .fill({ color: 0x02020c, alpha: 0.93 });

    this.title.position.set(screenWidth / 2, screenHeight * 0.35);
    this.message.position.set(screenWidth / 2, screenHeight * 0.5);
    this.button.position.set(screenWidth / 2, screenHeight * 0.7);
  }
}
