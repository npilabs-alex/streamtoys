/**
 * Input handling - touch and keyboard
 */

import { GameState } from '@/core/GameState';
import { Renderer } from '@/rendering/Renderer';

export class InputManager {
  private gameState: GameState;
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;

  // Touch state
  private touchStartX = 0;
  private touchStartY = 0;
  private touchLastX = 0;
  private touchMoved = false;

  // Hover state for desktop
  private hoverRow = -1;
  private hoverCol = -1;
  private hoverCluster: [number, number][] | null = null;

  // Swipe thresholds
  private readonly SWIPE_THRESHOLD_RATIO = 0.45; // Relative to tile size
  private readonly DROP_THRESHOLD_RATIO = 1.2;

  constructor(gameState: GameState, renderer: Renderer) {
    this.gameState = gameState;
    this.renderer = renderer;
    this.canvas = renderer.app.canvas as HTMLCanvasElement;

    this.setupTouchListeners();
    this.setupKeyboardListeners();
  }

  private setupTouchListeners(): void {
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    // Mouse for desktop
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchLastX = touch.clientX;
    this.touchMoved = false;
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();

    if (this.gameState.isPaused || this.gameState.isGameOver || this.gameState.isResolving) {
      return;
    }

    const touch = e.touches[0];
    const dx = touch.clientX - this.touchLastX;
    const totalDy = touch.clientY - this.touchStartY;
    const tileSize = this.renderer.tileSize;

    // Horizontal swipe - move piece
    if (Math.abs(dx) > tileSize * this.SWIPE_THRESHOLD_RATIO) {
      this.touchMoved = true;
      if (dx > 0) {
        this.gameState.moveRight();
      } else {
        this.gameState.moveLeft();
      }
      this.touchLastX = touch.clientX;
    }

    // Swipe down - hard drop
    if (!this.touchMoved && totalDy > tileSize * this.DROP_THRESHOLD_RATIO) {
      this.touchMoved = true;
      this.gameState.doHardDrop();
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    if (this.gameState.isPaused || this.gameState.isGameOver) {
      return;
    }

    // If it was a swipe, don't process as tap
    if (this.touchMoved) return;

    const touch = e.changedTouches[0];
    this.handleTap(touch.clientX, touch.clientY);
  }

  private onMouseDown(e: MouseEvent): void {
    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
    this.touchMoved = false;
  }

  private onMouseUp(e: MouseEvent): void {
    if (this.gameState.isPaused || this.gameState.isGameOver) {
      return;
    }

    // Simple click detection
    const dx = Math.abs(e.clientX - this.touchStartX);
    const dy = Math.abs(e.clientY - this.touchStartY);

    if (dx < 10 && dy < 10) {
      this.handleTap(e.clientX, e.clientY);
    }
  }

  private onMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const boardPos = this.renderer.screenToBoard(x, y);

    if (boardPos) {
      this.hoverRow = boardPos.row;
      this.hoverCol = boardPos.col;

      // Find cluster at hover position
      const cluster = this.gameState.board.findClusterAt(boardPos.row, boardPos.col);

      if (cluster && !cluster.isSpecial && cluster.cells.length >= 3) {
        this.hoverCluster = cluster.cells;
        this.canvas.style.cursor = 'pointer';
      } else if (cluster && cluster.isSpecial) {
        // Special tiles are single-tap
        this.hoverCluster = cluster.cells;
        this.canvas.style.cursor = 'pointer';
      } else {
        this.hoverCluster = null;
        this.canvas.style.cursor = 'default';
      }
    } else {
      this.hoverRow = -1;
      this.hoverCol = -1;
      this.hoverCluster = null;
      this.canvas.style.cursor = 'default';
    }
  }

  private onMouseLeave(): void {
    this.hoverRow = -1;
    this.hoverCol = -1;
    this.hoverCluster = null;
    this.canvas.style.cursor = 'default';
  }

  /**
   * Get currently hovered cluster cells (for rendering highlight)
   */
  getHoverCluster(): [number, number][] | null {
    return this.hoverCluster;
  }

  /**
   * Get hover position
   */
  getHoverPosition(): { row: number; col: number } | null {
    if (this.hoverRow < 0 || this.hoverCol < 0) return null;
    return { row: this.hoverRow, col: this.hoverCol };
  }

  private handleTap(clientX: number, clientY: number): void {
    // Convert to canvas coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check if tap is on board
    const boardPos = this.renderer.screenToBoard(x, y);

    if (boardPos) {
      const tile = this.gameState.board.getTile(boardPos.row, boardPos.col);

      if (tile && !this.gameState.isResolving) {
        // Tap on existing tile - try to collapse
        this.gameState.tap(boardPos.row, boardPos.col);
        return;
      }
    }

    // Tap elsewhere - rotate piece
    if (this.gameState.currentPiece && !this.gameState.isResolving) {
      this.gameState.rotate();
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (this.gameState.isPaused || this.gameState.isGameOver) {
      // Allow resume
      if (e.code === 'Escape' && this.gameState.isPaused) {
        this.gameState.resume();
      }
      return;
    }

    if (this.gameState.isResolving) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.gameState.moveLeft();
        break;

      case 'ArrowRight':
      case 'KeyD':
        this.gameState.moveRight();
        break;

      case 'ArrowDown':
      case 'KeyS':
        this.gameState.softDrop();
        break;

      case 'ArrowUp':
      case 'KeyW':
      case 'KeyZ':
        this.gameState.rotate();
        break;

      case 'Space':
        e.preventDefault();
        this.gameState.doHardDrop();
        break;

      case 'Escape':
        this.gameState.pause();
        break;
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.canvas.removeEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.removeEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.removeEventListener('touchend', this.onTouchEnd.bind(this));
    this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }
}
