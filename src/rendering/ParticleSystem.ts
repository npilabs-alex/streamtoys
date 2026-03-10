/**
 * GPU-accelerated particle system
 */

import { Container, Graphics } from 'pixi.js';
import { PARTICLE_CONFIG } from '@/config/visuals';
import { TILE_COLORS, AnyTileType } from '@/config/tiles';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  shrink: number;
  color: number;
  alpha: number;
  gravity: number;
  shape: 'circle' | 'square' | 'streak';
}

export class ParticleSystem {
  private container: Container;
  private particles: Particle[] = [];
  private graphics: Graphics;
  private tileSize: number;

  constructor(container: Container, tileSize: number) {
    this.container = container;
    this.tileSize = tileSize;
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  /**
   * Spawn burst at multiple cells (cluster collapse)
   */
  burstAtCells(cells: [number, number][], type: AnyTileType, tileSize: number): void {
    for (const [row, col] of cells) {
      const x = col * tileSize + tileSize / 2;
      const y = row * tileSize + tileSize / 2;
      this.burst(x, y, type);
    }
  }

  /**
   * Spawn directional burst based on tile type
   */
  burst(x: number, y: number, type: AnyTileType): void {
    const config = PARTICLE_CONFIG[type] || PARTICLE_CONFIG.DEFAULT;
    const colors = TILE_COLORS[type] || TILE_COLORS.GARBAGE;

    for (let i = 0; i < config.count; i++) {
      let angle: number;
      let speed = config.speed.base + Math.random() * config.speed.variance;

      switch (config.direction) {
        case 'up':
          // Tight vertical jet
          angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
          break;

        case 'fan':
          // Horizontal fan (left and right)
          const side = Math.random() < 0.5 ? -1 : 1;
          angle = side * (0.3 + Math.random() * (Math.PI - 0.6));
          break;

        case 'radial':
          // All directions
          angle = Math.random() * Math.PI * 2;
          break;

        case 'scatter':
        default:
          angle = Math.random() * Math.PI * 2;
          speed *= 0.5 + Math.random() * 0.5;
          break;
      }

      const color = config.colors[i % config.colors.length];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: config.decay.base + Math.random() * config.decay.variance,
        size: config.size.base + Math.random() * config.size.variance,
        shrink: 0.92 + Math.random() * 0.05,
        color,
        alpha: 1,
        gravity: config.gravity,
        shape: Math.random() < 0.3 ? 'square' : 'circle',
      });
    }

    // Add shockwave ring
    this.spawnShockwave(x, y, colors.glow);

    // Add white sparkles
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0.8,
        decay: 0.06 + Math.random() * 0.03,
        size: 1.5 + Math.random() * 1.5,
        shrink: 0.88,
        color: 0xffffff,
        alpha: 1,
        gravity: 0.1,
        shape: 'circle',
      });
    }
  }

  /**
   * Spawn expanding shockwave ring
   */
  private spawnShockwave(x: number, y: number, color: number): void {
    const ringCount = 12;
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const speed = 5 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5,
        decay: 0.08,
        size: 2.5,
        shrink: 0.87,
        color,
        alpha: 0.7,
        gravity: 0,
        shape: 'circle',
      });
    }
  }

  /**
   * Spawn special tile activation burst
   */
  specialBurst(row: number, col: number, type: AnyTileType, tileSize: number): void {
    const x = col * tileSize + tileSize / 2;
    const y = row * tileSize + tileSize / 2;
    const colors = TILE_COLORS[type] || TILE_COLORS.GARBAGE;

    // Large radial burst
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 10;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.025 + Math.random() * 0.02,
        size: 4 + Math.random() * 4,
        shrink: 0.94,
        color: i % 3 === 0 ? 0xffffff : colors.glow,
        alpha: 1,
        gravity: 0,
        shape: Math.random() < 0.5 ? 'square' : 'circle',
      });
    }

    // Multiple shockwaves
    for (let ring = 0; ring < 3; ring++) {
      setTimeout(() => {
        this.spawnShockwave(x, y, colors.light);
      }, ring * 50);
    }

    // Rising sparkles
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * tileSize,
        y: y + (Math.random() - 0.5) * tileSize,
        vx: (Math.random() - 0.5) * 3,
        vy: -3 - Math.random() * 4,
        life: 1.2,
        decay: 0.02,
        size: 2 + Math.random() * 3,
        shrink: 0.97,
        color: colors.glow,
        alpha: 1,
        gravity: -0.02, // Float up
        shape: 'circle',
      });
    }
  }

  /**
   * Spawn landing dust puffs
   */
  spawnLandingDust(tiles: { row: number; col: number }[], tileSize: number): void {
    for (const { row, col } of tiles) {
      const x = col * tileSize + tileSize / 2;
      const y = (row + 1) * tileSize; // Bottom of tile

      for (let i = 0; i < 4; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * tileSize * 0.8,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 2,
          life: 0.5,
          decay: 0.06,
          size: 2 + Math.random() * 2,
          shrink: 0.88,
          color: 0x888899,
          alpha: 0.5,
          gravity: 0.15,
          shape: 'circle',
        });
      }
    }
  }

  /**
   * Update all particles
   */
  update(dt: number): void {
    const dtScale = dt * 60; // Normalize to 60fps

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx * dtScale;
      p.y += p.vy * dtScale;
      p.vy += p.gravity * dtScale;
      p.vx *= 0.97;
      p.life -= p.decay * dtScale;
      p.size *= p.shrink;
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0 || p.size < 0.3) {
        this.particles.splice(i, 1);
      }
    }

    this.render();
  }

  /**
   * Render all particles
   */
  private render(): void {
    this.graphics.clear();

    for (const p of this.particles) {
      this.graphics.circle(p.x, p.y, p.size);
      this.graphics.fill({ color: p.color, alpha: p.alpha });
    }
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
    this.graphics.clear();
  }
}
