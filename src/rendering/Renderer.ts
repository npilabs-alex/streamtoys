/**
 * Main PixiJS Renderer
 * Orchestrates all visual rendering
 */

import { Application, Container, Graphics } from 'pixi.js';
import { GameState, GameEvent } from '@/core';
import { BOARD } from '@/config/board';
import { VISUAL } from '@/config/visuals';
import { BoardRenderer } from './BoardRenderer';
import { TileRenderer } from './TileRenderer';
import { PieceRenderer } from './PieceRenderer';
import { ParticleSystem } from './ParticleSystem';
import { PostProcessing } from './PostProcessing';
import { BackgroundRenderer } from './BackgroundRenderer';

export class Renderer {
  app: Application;
  private gameState: GameState;

  // Render dimensions
  tileSize = BOARD.tileSize;
  boardWidth = BOARD.cols * BOARD.tileSize;
  boardHeight = BOARD.rows * BOARD.tileSize;
  boardOffsetX = 0;
  boardOffsetY = 0;

  // Layer containers (back to front)
  layers!: {
    background: Container;
    boardGlow: Container;
    board: Container;
    ghost: Container;
    piece: Container;
    particles: Container;
    ui: Container;
  };

  // Sub-renderers
  background!: BackgroundRenderer;
  boardRenderer!: BoardRenderer;
  tileRenderer!: TileRenderer;
  pieceRenderer!: PieceRenderer;
  particles!: ParticleSystem;
  postFX!: PostProcessing;

  // Shake state
  private shakeIntensity = 0;
  private shakeDecay = VISUAL.shakeDecay;

  constructor(gameState: GameState) {
    this.app = new Application();
    this.gameState = gameState;
  }

  async init(container: HTMLElement): Promise<void> {
    await this.app.init({
      backgroundColor: VISUAL.backgroundColor,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      resizeTo: container,
    });

    container.appendChild(this.app.canvas);

    this.calculateDimensions();
    this.setupLayers();
    this.initSubRenderers();
    this.bindGameEvents();
    this.startRenderLoop();

    // Handle resize
    window.addEventListener('resize', () => this.onResize());
  }

  private calculateDimensions(): void {
    // HUD panel dimensions
    const PANEL_WIDTH = 140;
    const TOP_BAR_HEIGHT = 44;
    const BOTTOM_BAR_HEIGHT = 50;
    const PADDING = 16;

    // Available space for the board (between panels)
    const availWidth = this.app.screen.width - (PANEL_WIDTH * 2) - (PADDING * 2);
    const availHeight = this.app.screen.height - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT - (PADDING * 2);

    // Calculate tile size to fit in available space
    this.tileSize = Math.floor(Math.min(
      availHeight / BOARD.rows,
      availWidth / BOARD.cols
    ));
    this.tileSize = Math.max(22, Math.min(this.tileSize, 48));

    this.boardWidth = BOARD.cols * this.tileSize;
    this.boardHeight = BOARD.rows * this.tileSize;

    // Center board in the play area (between left panel and right panel)
    const playAreaX = PANEL_WIDTH;
    const playAreaWidth = this.app.screen.width - (PANEL_WIDTH * 2);
    const playAreaY = TOP_BAR_HEIGHT;
    const playAreaHeight = this.app.screen.height - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT;

    this.boardOffsetX = Math.floor(playAreaX + (playAreaWidth - this.boardWidth) / 2);
    this.boardOffsetY = Math.floor(playAreaY + (playAreaHeight - this.boardHeight) / 2);
  }

  private setupLayers(): void {
    this.layers = {
      background: new Container(),
      boardGlow: new Container(),
      board: new Container(),
      ghost: new Container(),
      piece: new Container(),
      particles: new Container(),
      ui: new Container(),
    };

    // Add layers in order
    this.app.stage.addChild(this.layers.background);
    this.app.stage.addChild(this.layers.boardGlow);
    this.app.stage.addChild(this.layers.board);
    this.app.stage.addChild(this.layers.ghost);
    this.app.stage.addChild(this.layers.piece);
    this.app.stage.addChild(this.layers.particles);
    this.app.stage.addChild(this.layers.ui);

    // Position board layers
    const boardContainer = new Container();
    boardContainer.position.set(this.boardOffsetX, this.boardOffsetY);

    this.layers.boardGlow.position.set(this.boardOffsetX, this.boardOffsetY);
    this.layers.board.position.set(this.boardOffsetX, this.boardOffsetY);
    this.layers.ghost.position.set(this.boardOffsetX, this.boardOffsetY);
    this.layers.piece.position.set(this.boardOffsetX, this.boardOffsetY);
    this.layers.particles.position.set(this.boardOffsetX, this.boardOffsetY);
  }

  private initSubRenderers(): void {
    this.background = new BackgroundRenderer(
      this.layers.background,
      this.app.screen.width,
      this.app.screen.height
    );

    this.tileRenderer = new TileRenderer(this.tileSize);

    this.boardRenderer = new BoardRenderer(
      this.layers.board,
      this.layers.boardGlow,
      this.gameState.board,
      this.tileRenderer,
      this.tileSize
    );

    this.pieceRenderer = new PieceRenderer(
      this.layers.piece,
      this.layers.ghost,
      this.tileRenderer,
      this.tileSize
    );

    this.particles = new ParticleSystem(this.layers.particles, this.tileSize);

    this.postFX = new PostProcessing(this.app.stage);
  }

  private bindGameEvents(): void {
    this.gameState.on('piece:spawn', (e) => {
      if (e.type === 'piece:spawn') {
        this.pieceRenderer.setPiece(e.piece, this.gameState.board);
      }
    });

    this.gameState.on('piece:move', () => {
      this.pieceRenderer.updatePosition(
        this.gameState.currentPiece,
        this.gameState.pieceYSmooth,
        this.gameState.board
      );
    });

    this.gameState.on('piece:rotate', () => {
      this.pieceRenderer.updatePosition(
        this.gameState.currentPiece,
        this.gameState.pieceYSmooth,
        this.gameState.board
      );
    });

    this.gameState.on('piece:land', (e) => {
      if (e.type === 'piece:land') {
        this.pieceRenderer.clear();
        this.particles.spawnLandingDust(e.tiles, this.tileSize);
      }
    });

    this.gameState.on('cluster:flash', (e) => {
      if (e.type === 'cluster:flash') {
        this.boardRenderer.flashCells(e.cells);
      }
    });

    this.gameState.on('cluster:clear', (e) => {
      if (e.type === 'cluster:clear') {
        this.particles.burstAtCells(e.cells, e.tileType, this.tileSize);
        this.shake(e.cells.length >= VISUAL.largeShakeThreshold
          ? VISUAL.largeShakeIntensity
          : VISUAL.smallShakeIntensity);
        this.postFX.bloomPulse();
      }
    });

    this.gameState.on('garbage:smash', (e) => {
      if (e.type === 'garbage:smash') {
        this.particles.burstAtCells(e.cells, 'GARBAGE', this.tileSize);
      }
    });

    this.gameState.on('special:activate', (e) => {
      if (e.type === 'special:activate') {
        this.particles.specialBurst(e.row, e.col, e.specialType, this.tileSize);
        this.shake(VISUAL.largeShakeIntensity);
      }
    });

    this.gameState.on('gravity:settle', () => {
      // Tiles will be re-rendered on next frame
    });

    this.gameState.on('career:stageup', (e) => {
      if (e.type === 'career:stageup') {
        this.background.transitionTo(e.career.stageIndex);
      }
    });

    this.gameState.on('pressure:rise', () => {
      this.shake(5);
    });

    this.gameState.on('invalid:tap', (e) => {
      if (e.type === 'invalid:tap') {
        this.boardRenderer.flashInvalid(e.cells);
      }
    });

    this.gameState.on('game:over', () => {
      // Could trigger special effect
    });
  }

  private startRenderLoop(): void {
    this.app.ticker.add(() => {
      this.update(this.app.ticker.deltaMS / 1000);
    });
  }

  // Reference to input manager for hover state
  private inputManager: { getHoverCluster: () => [number, number][] | null } | null = null;

  /**
   * Set input manager reference for hover detection
   */
  setInputManager(input: { getHoverCluster: () => [number, number][] | null }): void {
    this.inputManager = input;
  }

  private update(dt: number): void {
    // Update shake
    if (this.shakeIntensity > 0.5) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 0.6;

      this.layers.board.position.set(this.boardOffsetX + shakeX, this.boardOffsetY + shakeY);
      this.layers.piece.position.set(this.boardOffsetX + shakeX, this.boardOffsetY + shakeY);

      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.layers.board.position.set(this.boardOffsetX, this.boardOffsetY);
      this.layers.piece.position.set(this.boardOffsetX, this.boardOffsetY);
    }

    // Get hover cluster from input manager
    const hoverCluster = this.inputManager?.getHoverCluster() || null;

    // Update sub-renderers
    this.background.update(dt);
    this.boardRenderer.update(this.gameState.board, hoverCluster);
    this.pieceRenderer.update(
      this.gameState.currentPiece,
      this.gameState.pieceYSmooth
    );
    this.particles.update(dt);
    this.postFX.update(dt);
  }

  private shake(intensity: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  private onResize(): void {
    this.calculateDimensions();

    this.layers.boardGlow.position.set(this.boardOffsetX, this.boardOffsetY);
    this.layers.board.position.set(this.boardOffsetX, this.boardOffsetY);
    this.layers.ghost.position.set(this.boardOffsetX, this.boardOffsetY);
    this.layers.piece.position.set(this.boardOffsetX, this.boardOffsetY);
    this.layers.particles.position.set(this.boardOffsetX, this.boardOffsetY);

    this.background.resize(this.app.screen.width, this.app.screen.height);
    this.tileRenderer.setTileSize(this.tileSize);
    this.boardRenderer.setTileSize(this.tileSize);
    this.pieceRenderer.setTileSize(this.tileSize);
  }

  /**
   * Convert screen coordinates to board position
   */
  screenToBoard(screenX: number, screenY: number): { row: number; col: number } | null {
    const boardX = screenX - this.boardOffsetX;
    const boardY = screenY - this.boardOffsetY;

    if (boardX < 0 || boardX >= this.boardWidth ||
        boardY < 0 || boardY >= this.boardHeight) {
      return null;
    }

    return {
      col: Math.floor(boardX / this.tileSize),
      row: Math.floor(boardY / this.tileSize),
    };
  }

  /**
   * Convert board position to screen coordinates (center of tile)
   */
  boardToScreen(row: number, col: number): { x: number; y: number } {
    return {
      x: this.boardOffsetX + col * this.tileSize + this.tileSize / 2,
      y: this.boardOffsetY + row * this.tileSize + this.tileSize / 2,
    };
  }

  destroy(): void {
    this.app.destroy(true, { children: true });
  }
}
