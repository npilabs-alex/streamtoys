/**
 * Post-processing effects
 * Note: Full shader-based effects require custom PixiJS filters
 * This is a simplified version using built-in features
 */

import { Container, BlurFilter, ColorMatrixFilter } from 'pixi.js';
import { POST_FX } from '@/config/visuals';

export class PostProcessing {
  private stage: Container;
  private bloomFilter: BlurFilter;
  private colorFilter: ColorMatrixFilter;

  private bloomPulseActive = false;
  private bloomPulseTimer = 0;

  constructor(stage: Container) {
    this.stage = stage;

    // Bloom approximation using blur
    this.bloomFilter = new BlurFilter({
      strength: 0,
      quality: 2,
    });

    // Color adjustments for contrast and vibrancy
    this.colorFilter = new ColorMatrixFilter();
    this.colorFilter.contrast(1.1, false);
    this.colorFilter.saturate(0.1, false);

    // Apply filters to stage
    // Note: In production, you'd use custom shaders for better quality
    // stage.filters = [this.colorFilter];
  }

  /**
   * Trigger bloom pulse effect
   */
  bloomPulse(): void {
    if (!POST_FX.bloom.enabled) return;

    this.bloomPulseActive = true;
    this.bloomPulseTimer = POST_FX.bloom.pulseDuration;
  }

  /**
   * Update effects
   */
  update(dt: number): void {
    // Bloom pulse decay
    if (this.bloomPulseActive) {
      this.bloomPulseTimer -= dt;

      if (this.bloomPulseTimer <= 0) {
        this.bloomPulseActive = false;
        this.bloomFilter.strength = 0;
      } else {
        const progress = this.bloomPulseTimer / POST_FX.bloom.pulseDuration;
        this.bloomFilter.strength = POST_FX.bloom.pulseStrength * progress;
      }
    }
  }

  /**
   * Enable/disable CRT scanlines
   * Note: Requires custom shader in production
   */
  setCRTEnabled(enabled: boolean): void {
    // Would toggle CRT shader here
  }

  /**
   * Set chromatic aberration intensity
   * Note: Requires custom shader in production
   */
  setChromaticAberration(intensity: number): void {
    // Would set shader uniform here
  }
}

/**
 * Custom shader definitions (GLSL)
 * These would be compiled into PixiJS Filter instances
 */
export const SHADER_SOURCES = {
  bloom: `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uBloomStrength;
    uniform float uBloomRadius;

    void main() {
      vec4 color = texture2D(uSampler, vTextureCoord);
      vec4 bloom = vec4(0.0);
      float total = 0.0;

      for (float x = -4.0; x <= 4.0; x++) {
        for (float y = -4.0; y <= 4.0; y++) {
          vec2 offset = vec2(x, y) * uBloomRadius / 512.0;
          float weight = 1.0 - length(vec2(x, y)) / 5.656;
          bloom += texture2D(uSampler, vTextureCoord + offset) * weight;
          total += weight;
        }
      }
      bloom /= total;

      vec3 bright = max(bloom.rgb - 0.5, 0.0);
      gl_FragColor = color + vec4(bright * uBloomStrength, 0.0);
    }
  `,

  crt: `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uScanlineIntensity;
    uniform float uTime;

    void main() {
      vec4 color = texture2D(uSampler, vTextureCoord);

      // Scanlines
      float scanline = sin(vTextureCoord.y * 800.0) * 0.5 + 0.5;
      color.rgb *= 1.0 - uScanlineIntensity * (1.0 - scanline);

      // Slight vignette
      vec2 uv = vTextureCoord * 2.0 - 1.0;
      float vignette = 1.0 - dot(uv, uv) * 0.15;
      color.rgb *= vignette;

      gl_FragColor = color;
    }
  `,

  chromatic: `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uOffset;

    void main() {
      vec2 dir = vTextureCoord - 0.5;
      float d = length(dir) * uOffset * 0.01;

      vec4 color;
      color.r = texture2D(uSampler, vTextureCoord + dir * d).r;
      color.g = texture2D(uSampler, vTextureCoord).g;
      color.b = texture2D(uSampler, vTextureCoord - dir * d).b;
      color.a = 1.0;

      gl_FragColor = color;
    }
  `,

  shockwave: `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform vec2 uCenter;
    uniform float uTime;
    uniform float uAmplitude;

    void main() {
      vec2 uv = vTextureCoord;
      vec2 dir = uv - uCenter;
      float dist = length(dir);

      float ring = smoothstep(uTime - 0.1, uTime, dist)
                 - smoothstep(uTime, uTime + 0.1, dist);

      vec2 offset = normalize(dir) * ring * uAmplitude * 0.02;

      gl_FragColor = texture2D(uSampler, uv + offset);
    }
  `,
};
