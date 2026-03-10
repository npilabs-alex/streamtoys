/**
 * Dynamic background scenes based on career stage
 */

import { Container, Graphics } from 'pixi.js';

type SceneRenderer = (g: Graphics, w: number, h: number, t: number) => void;

export class BackgroundRenderer {
  private container: Container;
  private graphics: Graphics;
  private width: number;
  private height: number;
  private currentScene = 0;
  private time = 0;

  private scenes: SceneRenderer[] = [
    this.drawBedroom.bind(this),
    this.drawRehearsal.bind(this),
    this.drawStudio.bind(this),
    this.drawStudio.bind(this), // Used twice for different stages
    this.drawLabelOffice.bind(this),
    this.drawArena.bind(this),
  ];

  constructor(container: Container, width: number, height: number) {
    this.container = container;
    this.width = width;
    this.height = height;
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.render();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.render();
  }

  transitionTo(sceneIndex: number): void {
    this.currentScene = Math.min(sceneIndex, this.scenes.length - 1);
    // Could add transition animation here
  }

  update(dt: number): void {
    this.time += dt;

    // Only re-render occasionally for performance
    if (Math.floor(this.time * 30) % 5 === 0) {
      this.render();
    }
  }

  private render(): void {
    this.graphics.clear();
    const scene = this.scenes[this.currentScene];
    if (scene) {
      scene(this.graphics, this.width, this.height, this.time);
    }
  }

  private drawBedroom(g: Graphics, w: number, h: number, t: number): void {
    // Night sky gradient
    g.rect(0, 0, w, h).fill({ color: 0x0a0a1a });

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = w * (Math.sin(i * 127.1) * 0.5 + 0.5);
      const sy = h * 0.4 * (Math.sin(i * 53.7) * 0.5 + 0.5);
      const alpha = 0.3 + Math.sin(t + i) * 0.3;
      g.circle(sx, sy, 1.5).fill({ color: 0xffffff, alpha });
    }

    // Window glow
    g.circle(w * 0.75, h * 0.25, w * 0.2)
      .fill({ color: 0x3264ff, alpha: 0.12 });

    // Bedroom wall
    g.rect(0, h * 0.55, w, h * 0.45).fill({ color: 0x1a1228 });

    // Desk
    g.rect(w * 0.05, h * 0.72, w * 0.9, h * 0.08).fill({ color: 0x2a1f10 });

    // Monitor
    g.rect(w * 0.35, h * 0.55, w * 0.3, h * 0.17).fill({ color: 0x001a2e });
    g.rect(w * 0.35, h * 0.55, w * 0.3, h * 0.17)
      .stroke({ color: 0x00c8ff, width: 1, alpha: 0.3 });

    // Monitor glow
    const glowAlpha = 0.15 + Math.sin(t * 0.5) * 0.05;
    g.circle(w * 0.5, h * 0.65, w * 0.15)
      .fill({ color: 0x00b4ff, alpha: glowAlpha });

    // Keyboard
    g.rect(w * 0.32, h * 0.73, w * 0.36, h * 0.04).fill({ color: 0x1a1a2e });

    // Poster
    g.rect(w * 0.1, h * 0.58, w * 0.15, h * 0.12).fill({ color: 0xff2d6e, alpha: 0.15 });
  }

  private drawRehearsal(g: Graphics, w: number, h: number, t: number): void {
    // Warm room
    g.rect(0, 0, w, h).fill({ color: 0x0f0a05 });

    // Stage lights
    const lightPositions = [0.2, 0.5, 0.8];
    const lightHues = [0xff6633, 0xffaa33, 0xffcc33];

    for (let i = 0; i < lightPositions.length; i++) {
      const lx = w * lightPositions[i];
      g.circle(lx, 0, w * 0.2)
        .fill({ color: lightHues[i], alpha: 0.12 });
    }

    // Floor
    g.rect(0, h * 0.7, w, h * 0.3).fill({ color: 0x1a0e08 });

    // Amps
    g.rect(w * 0.1, h * 0.62, w * 0.15, h * 0.1).fill({ color: 0x2a1a0a });
    g.rect(w * 0.75, h * 0.64, w * 0.18, h * 0.08).fill({ color: 0x2a1a0a });

    // Beat pulse on floor
    const pulseAlpha = 0.08 + Math.sin(t * 2) * 0.04;
    g.rect(0, h * 0.68, w, h * 0.04).fill({ color: 0xff6420, alpha: pulseAlpha });
  }

  private drawStudio(g: Graphics, w: number, h: number, t: number): void {
    // Dark studio
    g.rect(0, 0, w, h).fill({ color: 0x05050f });

    // Control room glass
    g.rect(w * 0.1, h * 0.4, w * 0.8, h * 0.35).fill({ color: 0x002850, alpha: 0.3 });
    g.rect(w * 0.1, h * 0.4, w * 0.8, h * 0.35)
      .stroke({ color: 0x00b4ff, width: 1, alpha: 0.2 });

    // Mixing desk
    g.rect(w * 0.05, h * 0.65, w * 0.9, h * 0.15).fill({ color: 0x1a1228 });

    // Fader lines
    for (let i = 0; i < 12; i++) {
      const fx = w * 0.08 + i * (w * 0.84 / 12);
      const fh = h * (0.04 + Math.sin(t + i * 0.7) * 0.02);
      g.rect(fx, h * 0.68, 3, fh).fill({ color: 0x00e5ff, alpha: 0.25 });
      g.rect(fx - 1, h * 0.68 + fh * 0.5, 5, 2).fill({ color: 0xffffff, alpha: 0.5 });
    }

    // VU meter glow
    const vuAlpha = 0.1 + Math.sin(t * 3) * 0.06;
    g.circle(w * 0.5, h * 0.55, w * 0.1).fill({ color: 0x39ff14, alpha: vuAlpha });
  }

  private drawLabelOffice(g: Graphics, w: number, h: number, t: number): void {
    // City night
    g.rect(0, 0, w, h).fill({ color: 0x050510 });

    // Skyline buildings
    const buildings = [
      [0.02, 0.45, 0.08, 0.55],
      [0.12, 0.35, 0.12, 0.65],
      [0.26, 0.5, 0.06, 0.5],
      [0.34, 0.3, 0.14, 0.7],
      [0.5, 0.4, 0.08, 0.6],
      [0.6, 0.25, 0.15, 0.75],
      [0.77, 0.42, 0.1, 0.58],
      [0.89, 0.38, 0.09, 0.62],
    ];

    for (const [bx, by, bw, bh] of buildings) {
      g.rect(w * bx, h * by, w * bw, h * bh).fill({ color: 0x1a1a3a });

      // Windows
      for (let wy = 0; wy < 6; wy++) {
        for (let wx = 0; wx < 2; wx++) {
          const lit = Math.sin(t * 0.2 + wy * wx) > 0;
          g.rect(
            w * bx + wx * w * bw / 3 + w * 0.01,
            h * by + wy * h * bh / 7 + h * 0.01,
            w * 0.015,
            h * 0.02
          ).fill({ color: lit ? 0xffe664 : 0xffffff, alpha: lit ? 0.6 : 0.06 });
        }
      }
    }

    // Logo glow
    g.circle(w * 0.5, h * 0.1, w * 0.2).fill({ color: 0xc060ff, alpha: 0.15 });
  }

  private drawArena(g: Graphics, w: number, h: number, t: number): void {
    // Dark arena
    g.circle(w * 0.5, h * 0.3, w * 0.6).fill({ color: 0x150010 });
    g.rect(0, 0, w, h).fill({ color: 0x020005, alpha: 0.5 });

    // Stage lights scanning
    const lightHues = [0xff3366, 0xffaa33, 0x33ccff, 0xcc33ff, 0xff33aa];
    for (let i = 0; i < 5; i++) {
      const phase = t * 0.4 + i * 1.2;
      const lx = w * (0.15 + i * 0.175 + Math.sin(phase) * 0.08);
      g.circle(lx, 0, w * 0.18).fill({ color: lightHues[i], alpha: 0.15 });
    }

    // Crowd silhouette
    g.rect(0, h * 0.72, w, h * 0.28).fill({ color: 0x080010 });

    for (let i = 0; i < 30; i++) {
      const hx = w * (i / 30) + (Math.random() - 0.5) * 10;
      const hy = h * (0.68 + Math.sin(t * 2 + i) * 0.02);
      g.circle(hx, hy, w * 0.02).fill({ color: 0x0d0018 });
      g.rect(hx - w * 0.01, hy, w * 0.02, h * 0.04).fill({ color: 0x0d0018 });
    }

    // Stage glow
    const stageAlpha = 0.3 + Math.sin(t * 3) * 0.1;
    g.rect(0, h * 0.65, w, h * 0.07).fill({ color: 0xff3296, alpha: stageAlpha });
  }
}
