/**
 * Main Game class - orchestrates all systems
 */

import { GameState } from '@/core/GameState';
import { Renderer } from '@/rendering/Renderer';
import { AudioEngine } from '@/audio/AudioEngine';
import { InputManager } from '@/input/InputManager';
import { HUD } from '@/ui/HUD';
import { Overlay } from '@/ui/Overlay';
import { Container } from 'pixi.js';

export class Game {
  private container: HTMLElement;

  // Core systems
  state: GameState;
  renderer!: Renderer;
  audio: AudioEngine;
  input!: InputManager;

  // UI
  hud!: HUD;
  overlay!: Overlay;

  // Game loop
  private lastTime = 0;
  private running = false;

  constructor() {
    this.state = new GameState();
    this.audio = new AudioEngine();
    this.container = document.createElement('div');
  }

  private debug(msg: string): void {
    const el = document.getElementById('error-display');
    if (el) {
      el.style.display = 'block';
      el.style.background = 'rgba(0,100,200,0.9)';
      el.innerHTML += msg + '<br>';
    }
    console.log(msg);
  }

  /**
   * Initialize the game
   */
  async init(container: HTMLElement): Promise<void> {
    this.debug('init: start');
    this.container = container;

    // Initialize renderer
    this.debug('init: creating renderer');
    this.renderer = new Renderer(this.state);
    this.debug('init: calling renderer.init()');
    await this.renderer.init(container);
    this.debug('init: renderer ready');

    // Initialize audio
    this.debug('init: calling audio.init()');
    await this.audio.init();
    this.debug('init: audio ready');

    // Initialize input
    this.debug('init: creating input manager');
    this.input = new InputManager(this.state, this.renderer);

    // Wire input to renderer for hover highlighting
    this.renderer.setInputManager(this.input);

    // Initialize UI
    this.debug('init: initializing UI');
    this.initUI();

    // Bind game events to audio/UI
    this.debug('init: binding events');
    this.bindEvents();

    // Show start screen
    this.debug('init: showing start screen');
    this.overlay.showStart(() => this.startGame());
    this.debug('init: complete');
  }

  private initUI(): void {
    const { width, height } = this.renderer.app.screen;

    // HUD layer
    const hudContainer = new Container();
    this.renderer.layers.ui.addChild(hudContainer);
    this.hud = new HUD(hudContainer, width, height);

    // Overlay layer
    const overlayContainer = new Container();
    this.renderer.layers.ui.addChild(overlayContainer);
    this.overlay = new Overlay(overlayContainer, width, height);
  }

  private bindEvents(): void {
    // Audio events
    this.state.on('piece:land', () => {
      this.audio.playLand();
    });

    this.state.on('piece:rotate', () => {
      this.audio.playRotate();
    });

    this.state.on('cluster:clear', (e) => {
      if (e.type === 'cluster:clear') {
        this.audio.playCollapse(e.tileType, e.cells.length);

        // Show combo
        const size = e.cells.length;
        if (size >= 10) {
          this.hud.showCombo(`🔥 MASSIVE ×${size}!`, 0xff2d6e);
        } else if (size >= 7) {
          this.hud.showCombo(`⚡ HUGE! ×${size}`, 0xffe600);
        } else if (size >= 5) {
          this.hud.showCombo(`🎵 BIG! ×${size}`, 0x00e5ff);
        }
      }
    });

    this.state.on('special:activate', (e) => {
      if (e.type === 'special:activate') {
        this.audio.playSpecial();
        this.hud.showToast(`✨ ${e.specialType}!`, 0xffffff, 2000);
      }
    });

    this.state.on('invalid:tap', () => {
      this.audio.playInvalid();
    });

    this.state.on('pressure:warning', () => {
      this.audio.playPressureWarning();
    });

    this.state.on('pressure:rise', () => {
      this.hud.showToast('⚠ PRESSURE RISING', 0xff2d6e, 1000);
    });

    this.state.on('career:stageup', (e) => {
      if (e.type === 'career:stageup') {
        this.audio.playLevelUp();
        this.hud.showToast(`⬆ ${e.career.stageName}`, 0xffe600, 3000);
        this.hud.updateCareer(e.career);
      }
    });

    this.state.on('stats:update', (e) => {
      if (e.type === 'stats:update') {
        this.hud.updateStats(e.stats);
      }
    });

    this.state.on('piece:spawn', () => {
      this.hud.updateNextPiece(this.state.nextPiece);
    });

    this.state.on('game:pause', () => {
      this.overlay.showPause(() => this.resumeGame());
    });

    this.state.on('game:over', (e) => {
      if (e.type === 'game:over') {
        this.audio.playGameOver();
        this.overlay.showGameOver(e.stats, e.career, () => this.startGame());
      }
    });
  }

  /**
   * Start the game
   */
  private startGame(): void {
    this.overlay.hide();
    this.state.start();
    this.hud.updateStats(this.state.stats);
    this.hud.updateCareer(this.state.career);
    this.hud.updateNextPiece(this.state.nextPiece);
    this.hud.resetComboPosition(this.renderer.app.screen.height);

    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  /**
   * Resume from pause
   */
  private resumeGame(): void {
    this.overlay.hide();
    this.state.resume();
  }

  /**
   * Main game loop
   */
  private gameLoop(): void {
    if (!this.running) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // Cap at 50ms
    this.lastTime = now;

    // Update game state
    this.state.update(dt);

    // Update UI
    this.hud.updatePressure(
      this.state.pressure.timer / this.state.pressure.speed,
      this.state.pressure.warning
    );
    this.hud.update(dt);

    requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.running = false;
    this.input.destroy();
    this.audio.dispose();
    this.renderer.destroy();
  }
}
