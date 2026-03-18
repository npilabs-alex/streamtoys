# PixiJS Comprehensive Guide
## Expert-Level Reference for Game and Interactive Application Development

This guide covers particles, sprite animation, visual effects, performance optimization, physics integration, and best practices for PixiJS development.

---

## Table of Contents

1. [Particles and Particle Emitters](#1-particles-and-particle-emitters)
2. [Sprite Animation](#2-sprite-animation)
3. [Visual Quality - Filters, Shaders, and Effects](#3-visual-quality---filters-shaders-and-effects)
4. [Performance and FPS Optimization](#4-performance-and-fps-optimization)
5. [Physics Integration](#5-physics-integration)
6. [Best Practices](#6-best-practices)

---

## 1. Particles and Particle Emitters

### Overview

PixiJS provides two approaches to particle systems:
1. **ParticleContainer** (built-in) - For high-performance rendering of simple particles
2. **@pixi/particle-emitter** - Full-featured particle system with behaviors and effects

### ParticleContainer (PixiJS v8)

The `ParticleContainer` in PixiJS v8 is optimized for rendering massive numbers of lightweight particles.

**Performance Benchmarks:**
- Standard Container with Sprites: ~200,000 elements at 60fps
- ParticleContainer with Particles: ~1,000,000 elements at 60fps
- 3x faster than v7 ParticleContainer

#### Basic Usage

```javascript
import { Application, ParticleContainer, Particle, Texture } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });

// Create particle container with optimized settings
const container = new ParticleContainer({
  dynamicProperties: {
    position: true,    // Updated every frame
    scale: false,      // Set once
    rotation: false,   // Set once
    color: false,      // Set once
  },
});

// Create particles
const texture = Texture.from('particle.png');

for (let i = 0; i < 100000; i++) {
  const particle = new Particle({
    texture,
    x: Math.random() * 800,
    y: Math.random() * 600,
    scaleX: 0.5,
    scaleY: 0.5,
    tint: 0xffffff,
    alpha: 1,
  });
  container.addParticle(particle);
}

app.stage.addChild(container);

// Animation loop
app.ticker.add(() => {
  for (const particle of container.particleChildren) {
    particle.y += 1;
    if (particle.y > 600) particle.y = 0;
  }
});
```

#### Dynamic vs Static Properties

| Property | Dynamic (every frame) | Static (set once) |
|----------|----------------------|-------------------|
| position | Recommended | - |
| scale | When animating size | Default |
| rotation | When spinning | Default |
| color/tint | When color shifting | Default |

**Optimization tip:** Fewer dynamic properties = faster rendering.

#### ParticleContainer API

```javascript
// Adding particles
container.addParticle(particle);
container.addParticleAt(particle, index);

// Removing particles
container.removeParticle(particle);
container.removeParticleAt(index);
container.removeParticles();

// Force GPU upload of static properties
container.update();
```

### @pixi/particle-emitter

The `@pixi/particle-emitter` library provides a full-featured particle system with behaviors, paths, and complex effects.

#### Installation

```bash
npm install @pixi/particle-emitter
```

#### Basic Setup

```javascript
import { Emitter } from '@pixi/particle-emitter';
import { Container, Texture } from 'pixi.js';

const container = new Container();
app.stage.addChild(container);

const emitter = new Emitter(container, {
  lifetime: { min: 0.5, max: 1.5 },
  frequency: 0.01,
  maxParticles: 1000,
  pos: { x: 400, y: 300 },
  behaviors: [
    {
      type: 'alpha',
      config: {
        alpha: {
          list: [
            { value: 1, time: 0 },
            { value: 0, time: 1 }
          ]
        }
      }
    },
    {
      type: 'scale',
      config: {
        scale: {
          list: [
            { value: 1, time: 0 },
            { value: 0.3, time: 1 }
          ]
        }
      }
    },
    {
      type: 'moveSpeed',
      config: {
        speed: {
          list: [
            { value: 200, time: 0 },
            { value: 50, time: 1 }
          ]
        }
      }
    },
    {
      type: 'rotationStatic',
      config: { min: 0, max: 360 }
    },
    {
      type: 'spawnShape',
      config: {
        type: 'torus',
        data: { x: 0, y: 0, radius: 50, innerRadius: 0, affectRotation: true }
      }
    },
    {
      type: 'textureSingle',
      config: { texture: Texture.from('particle.png') }
    }
  ]
});

// Start emitting
emitter.emit = true;

// Update in game loop
let elapsed = Date.now();
app.ticker.add(() => {
  const now = Date.now();
  emitter.update((now - elapsed) * 0.001);
  elapsed = now;
});

// Cleanup
emitter.destroy();
```

#### Available Behaviors

| Behavior | Description |
|----------|-------------|
| `alpha` | Fade particles over lifetime |
| `scale` | Resize particles over lifetime |
| `color` | Color transitions |
| `moveSpeed` | Velocity progression |
| `moveAcceleration` | Physics-based acceleration |
| `rotation` | Animated rotation |
| `rotationStatic` | Fixed random rotation |
| `spawnShape` | Emission geometry (point, rect, circle, torus, polygon) |
| `textureSingle` | Single texture |
| `textureRandom` | Random texture from list |
| `animatedSingle` | Animated texture sequence |
| `path` | Move along a path |

#### Emitter Configuration (v3 Format)

```javascript
const config = {
  lifetime: { min: 1, max: 2 },
  frequency: 0.008,
  emitterLifetime: -1,  // -1 = infinite
  maxParticles: 500,
  addAtBack: false,
  pos: { x: 0, y: 0 },
  behaviors: [/* ... */]
};
```

#### Upgrading from Old Config

```javascript
import { upgradeConfig } from '@pixi/particle-emitter';

const oldConfig = { /* v2 or earlier format */ };
const newConfig = upgradeConfig(oldConfig, [texture1, texture2]);
```

### Particle System Resources

- [Official Documentation](https://particle-emitter.pixijs.io/docs/)
- [Interactive Particle Editor](https://pixijs.io/particle-emitter/editor/)
- [GitHub Repository](https://github.com/pixijs-userland/particle-emitter)
- [npm Package](https://www.npmjs.com/package/@pixi/particle-emitter)

---

## 2. Sprite Animation

### Sprite Sheets and Texture Atlases

Sprite sheets combine multiple images into a single texture, improving both download and rendering performance.

#### Benefits

1. **Faster Downloads**: Fewer HTTP requests
2. **Better Rendering**: Shared textures enable batching (single draw call for multiple sprites)
3. **Memory Efficiency**: Single texture upload to GPU

#### Manual Sprite Sheet Definition

```javascript
import { Assets, Spritesheet, Texture } from 'pixi.js';

const atlasData = {
  frames: {
    'walk_01': {
      frame: { x: 0, y: 0, w: 64, h: 64 },
      sourceSize: { w: 64, h: 64 },
      spriteSourceSize: { x: 0, y: 0, w: 64, h: 64 }
    },
    'walk_02': {
      frame: { x: 64, y: 0, w: 64, h: 64 },
      sourceSize: { w: 64, h: 64 },
      spriteSourceSize: { x: 0, y: 0, w: 64, h: 64 }
    },
    'walk_03': {
      frame: { x: 128, y: 0, w: 64, h: 64 },
      sourceSize: { w: 64, h: 64 },
      spriteSourceSize: { x: 0, y: 0, w: 64, h: 64 }
    }
  },
  meta: {
    image: 'spritesheet.png',
    size: { w: 256, h: 64 },
    scale: 1
  },
  animations: {
    walk: ['walk_01', 'walk_02', 'walk_03']
  }
};

// Load the spritesheet
const texture = await Assets.load('spritesheet.png');
const spritesheet = new Spritesheet(texture, atlasData);
await spritesheet.parse();

// Access textures
const walkTextures = spritesheet.animations.walk;
```

#### Loading TexturePacker Output

```javascript
// TexturePacker exports a JSON file and PNG
const sheet = await Assets.load('spritesheet.json');

// Access individual frames
const bunnyTexture = sheet.textures['bunny.png'];

// Access animations (defined in TexturePacker)
const runAnimation = sheet.animations['run'];
```

### AnimatedSprite

The `AnimatedSprite` class provides frame-based animation playback.

```javascript
import { AnimatedSprite, Assets } from 'pixi.js';

// Load spritesheet
const sheet = await Assets.load('character.json');

// Create animated sprite from animation frames
const character = new AnimatedSprite(sheet.animations['walk']);

// Configure animation
character.animationSpeed = 0.15;  // Frames per tick (0.1 - 0.3 typical)
character.loop = true;
character.anchor.set(0.5);
character.position.set(400, 300);

// Playback control
character.play();
character.stop();
character.gotoAndPlay(0);  // Jump to frame and play
character.gotoAndStop(2);  // Jump to frame and stop

// Events
character.onComplete = () => console.log('Animation finished');
character.onFrameChange = (frame) => console.log('Frame:', frame);
character.onLoop = () => console.log('Looped');

app.stage.addChild(character);
```

#### Animation Speed Control

```javascript
// Speed based on delta time
app.ticker.add((ticker) => {
  // Adjust speed based on game state
  character.animationSpeed = 0.15 * gameSpeed;
});

// Or use update method directly
character.update(deltaTime);
```

### Spine Animation (Skeletal Animation)

Spine provides professional skeletal animation with blending, IK, and procedural animation.

#### Installation

```bash
npm install @esotericsoftware/spine-pixi-v8@~4.2.0
```

#### Loading Spine Assets

```javascript
import { Assets } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

// Register assets
Assets.add({ alias: 'spineboy-skel', src: 'spineboy.skel' });
Assets.add({ alias: 'spineboy-atlas', src: 'spineboy.atlas' });

// Load
await Assets.load(['spineboy-skel', 'spineboy-atlas']);

// Create Spine object
const spineboy = new Spine({
  skeleton: 'spineboy-skel',
  atlas: 'spineboy-atlas'
});

spineboy.position.set(400, 500);
app.stage.addChild(spineboy);
```

#### Animation Control

```javascript
// Play animation (track, name, loop)
spineboy.state.setAnimation(0, 'walk', true);

// Queue animation (track, name, delay, loop)
spineboy.state.addAnimation(0, 'jump', 0, false);
spineboy.state.addAnimation(0, 'walk', 0, true);

// Animation mixing (crossfade)
spineboy.state.data.setDefaultMix(0.2);  // Default crossfade time
spineboy.state.data.setMix('walk', 'run', 0.1);  // Specific transition

// Time scale
spineboy.state.timeScale = 1.5;  // Faster playback
```

#### Animation Events

```javascript
spineboy.state.addListener({
  start: (entry) => {
    console.log(`Started: ${entry.animation.name}`);
  },
  complete: (entry) => {
    console.log(`Completed: ${entry.animation.name}`);
  },
  event: (entry, event) => {
    console.log(`Event: ${event.data.name}`);
    // Handle footstep sounds, particle triggers, etc.
  },
  interrupt: (entry) => {
    console.log(`Interrupted: ${entry.animation.name}`);
  },
  end: (entry) => {
    console.log(`Ended: ${entry.animation.name}`);
  }
});
```

#### Skins and Attachments

```javascript
// Set skin
spineboy.skeleton.setSkinByName('default');

// Combine multiple skins
const combinedSkin = new spine.Skin('combined');
combinedSkin.addSkin(skeletonData.findSkin('base'));
combinedSkin.addSkin(skeletonData.findSkin('hair/brown'));
combinedSkin.addSkin(skeletonData.findSkin('armor/gold'));
spineboy.skeleton.setSkin(combinedSkin);
spineboy.skeleton.setSlotsToSetupPose();
```

### GSAP Integration (Tweening)

GSAP provides powerful tweening with PixiJS through the PixiPlugin.

#### Setup

```javascript
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import * as PIXI from 'pixi.js';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);
```

#### Basic Tweening

```javascript
// Simple position tween
gsap.to(sprite, {
  duration: 1,
  pixi: { x: 500, y: 300 }
});

// Scale and rotation (degrees, not radians!)
gsap.to(sprite, {
  duration: 2,
  pixi: {
    scaleX: 2,
    scaleY: 2,
    rotation: 360  // Degrees
  }
});

// Color/Tint animation
gsap.to(sprite, {
  duration: 1,
  pixi: { tint: 0xff0000 }
});

// Alpha fade
gsap.to(sprite, {
  duration: 0.5,
  pixi: { alpha: 0 }
});
```

#### Rotation Direction Control

```javascript
// Clockwise
gsap.to(sprite, { pixi: { rotation: '360_cw' }, duration: 2 });

// Counter-clockwise
gsap.to(sprite, { pixi: { rotation: '360_ccw' }, duration: 2 });

// Shortest path
gsap.to(sprite, { pixi: { rotation: '180_short' }, duration: 1 });
```

#### Filter Animation with GSAP

```javascript
gsap.to(sprite, {
  duration: 1,
  pixi: {
    blur: 10,
    saturation: 0,      // Desaturate
    brightness: 1.5,    // Brighten
    contrast: 1.2,      // Increase contrast
    hue: 180            // Shift hue
  }
});
```

### pixi-actions (Alternative Tweening)

A lightweight actions library specifically for PixiJS.

```javascript
import { Actions } from 'pixi-actions';

// Setup with ticker
app.ticker.add((tick) => Actions.tick(tick.deltaTime / 60));

// Movement
Actions.moveTo(sprite, 500, 300, 1).play();

// Scale
Actions.scaleTo(sprite, 2, 2, 0.5).play();

// Fade
Actions.fadeTo(sprite, 0, 1).play();
Actions.fadeOutAndRemove(sprite, 0.5).play();

// Sequences
Actions.sequence(
  Actions.moveTo(sprite, 500, 300, 1),
  Actions.delay(0.5),
  Actions.scaleTo(sprite, 2, 2, 0.5),
  Actions.runFunc(() => console.log('Done!'))
).play();

// Parallel actions
Actions.parallel(
  Actions.moveTo(sprite, 500, 300, 1),
  Actions.rotateTo(sprite, Math.PI * 2, 1),
  Actions.fadeTo(sprite, 0.5, 1)
).play();

// Repeat
Actions.repeat(
  Actions.sequence(
    Actions.scaleTo(sprite, 1.2, 1.2, 0.3),
    Actions.scaleTo(sprite, 1, 1, 0.3)
  ),
  -1  // Infinite
).play();

// Cleanup
Actions.clear(sprite);  // Remove all actions from node
```

---

## 3. Visual Quality - Filters, Shaders, and Effects

### Built-in Filters

PixiJS includes several core filters.

#### BlurFilter

```javascript
import { BlurFilter } from 'pixi.js';

const blur = new BlurFilter({
  strength: 8,       // Blur intensity
  quality: 4,        // Number of blur passes (higher = smoother, slower)
  kernelSize: 5      // Kernel size (5, 7, 9, 11, 13, 15)
});

sprite.filters = [blur];

// Animate blur
app.ticker.add(() => {
  blur.strength = Math.sin(Date.now() * 0.002) * 10 + 10;
});
```

#### ColorMatrixFilter

```javascript
import { ColorMatrixFilter } from 'pixi.js';

const colorMatrix = new ColorMatrixFilter();

// Presets
colorMatrix.greyscale(0.5);       // Partial greyscale
colorMatrix.sepia(true);          // Sepia tone
colorMatrix.negative(true);       // Invert colors
colorMatrix.saturate(2);          // Increase saturation
colorMatrix.desaturate();         // Remove color
colorMatrix.brightness(1.5);      // Brighten
colorMatrix.contrast(1.2);        // Increase contrast
colorMatrix.hue(90);              // Rotate hue (degrees)

sprite.filters = [colorMatrix];
```

#### DisplacementFilter

```javascript
import { DisplacementFilter, Sprite, Texture } from 'pixi.js';

const displacementSprite = new Sprite(Texture.from('displacement_map.png'));
displacementSprite.texture.source.addressMode = 'repeat';

const displacement = new DisplacementFilter({
  sprite: displacementSprite,
  scale: 50
});

app.stage.filters = [displacement];

// Animate displacement
app.ticker.add(() => {
  displacementSprite.x += 1;
  displacementSprite.y += 1;
});
```

#### NoiseFilter

```javascript
import { NoiseFilter } from 'pixi.js';

const noise = new NoiseFilter({
  noise: 0.5,    // Noise intensity (0-1)
  seed: 0        // Random seed
});

sprite.filters = [noise];

// Animated noise
app.ticker.add(() => {
  noise.seed = Math.random();
});
```

### Community Filters (pixi-filters)

Extended filter collection with 40+ effects.

#### Installation

```bash
npm install pixi-filters
```

```html
<!-- Or via CDN -->
<script src="https://cdn.jsdelivr.net/npm/pixi-filters@latest/dist/browser/pixi-filters.min.js"></script>
```

#### Version Compatibility

| PixiJS Version | pixi-filters Version |
|----------------|---------------------|
| v5.x | v3.x |
| v6.x | v4.x |
| v7.x | v5.x |
| v8.x | v6.x |

#### Popular Filters

```javascript
import {
  GlowFilter,
  OutlineFilter,
  DropShadowFilter,
  BloomFilter,
  AdvancedBloomFilter,
  ShockwaveFilter,
  MotionBlurFilter,
  GodrayFilter,
  CRTFilter,
  AsciiFilter,
  PixelateFilter
} from 'pixi-filters';

// Glow effect
const glow = new GlowFilter({
  distance: 15,
  outerStrength: 4,
  innerStrength: 0,
  color: 0xffffff,
  quality: 0.5
});

// Outline
const outline = new OutlineFilter({
  thickness: 2,
  color: 0x000000
});

// Drop shadow
const shadow = new DropShadowFilter({
  offset: { x: 4, y: 4 },
  blur: 2,
  color: 0x000000,
  alpha: 0.5
});

// Bloom (glow bleeding)
const bloom = new BloomFilter({
  threshold: 0.5,
  bloomScale: 1,
  brightness: 1,
  blur: 8
});

// Advanced bloom with more control
const advBloom = new AdvancedBloomFilter({
  threshold: 0.5,
  bloomScale: 1.5,
  brightness: 1.2,
  blur: 4,
  quality: 8
});

// Shockwave
const shockwave = new ShockwaveFilter({
  center: [0.5, 0.5],
  time: 0,
  speed: 500,
  amplitude: 30,
  wavelength: 160,
  brightness: 1,
  radius: 500
});

// Animate shockwave
app.ticker.add((delta) => {
  shockwave.time += delta.deltaTime * 0.01;
});

// Motion blur
const motion = new MotionBlurFilter({
  velocity: { x: 10, y: 0 },
  kernelSize: 5
});

// God rays
const godray = new GodrayFilter({
  angle: 30,
  gain: 0.5,
  lacunarity: 2.5,
  time: 0
});

// CRT monitor effect
const crt = new CRTFilter({
  curvature: 1,
  lineWidth: 1,
  lineContrast: 0.25,
  verticalLine: false,
  noise: 0.3,
  noiseSize: 1,
  seed: 0,
  vignetting: 0.3,
  vignettingAlpha: 1,
  vignettingBlur: 0.3,
  time: 0
});

// Pixelation
const pixelate = new PixelateFilter(10);  // 10x10 pixel blocks

// Apply multiple filters
sprite.filters = [glow, shadow];
```

### Custom GLSL Shaders

Create custom visual effects with GLSL shaders.

#### Basic Custom Filter

```javascript
import { Filter, GlProgram } from 'pixi.js';

// Fragment shader (pixel manipulation)
const fragmentShader = `
  precision mediump float;

  varying vec2 vTextureCoord;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uResolution;

  void main() {
    vec2 uv = vTextureCoord;

    // Wave distortion
    uv.x += sin(uv.y * 10.0 + uTime) * 0.02;
    uv.y += cos(uv.x * 10.0 + uTime) * 0.02;

    vec4 color = texture2D(uTexture, uv);
    gl_FragColor = color;
  }
`;

// Create filter
const waveFilter = Filter.from({
  gl: {
    fragment: fragmentShader,
  },
  resources: {
    uniforms: {
      uTime: { value: 0, type: 'f32' },
      uResolution: { value: [800, 600], type: 'vec2<f32>' }
    }
  }
});

sprite.filters = [waveFilter];

// Animate uniform
app.ticker.add((delta) => {
  waveFilter.resources.uniforms.uniforms.uTime += delta.deltaTime * 0.05;
});
```

#### Chromatic Aberration Example

```javascript
const chromaticFragment = `
  precision mediump float;

  varying vec2 vTextureCoord;
  uniform sampler2D uTexture;
  uniform float uOffset;

  void main() {
    vec2 uv = vTextureCoord;
    vec2 direction = normalize(uv - 0.5);

    float r = texture2D(uTexture, uv + direction * uOffset).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - direction * uOffset).b;
    float a = texture2D(uTexture, uv).a;

    gl_FragColor = vec4(r, g, b, a);
  }
`;

const chromatic = Filter.from({
  gl: { fragment: chromaticFragment },
  resources: {
    uniforms: {
      uOffset: { value: 0.005, type: 'f32' }
    }
  }
});
```

### Blend Modes

```javascript
import { BLEND_MODES } from 'pixi.js';

// Standard blend modes
sprite.blendMode = 'normal';
sprite.blendMode = 'add';         // Additive (glow effect)
sprite.blendMode = 'multiply';    // Darken
sprite.blendMode = 'screen';      // Lighten

// Advanced blend modes (requires import)
import 'pixi.js/advanced-blend-modes';

sprite.blendMode = 'color-dodge';
sprite.blendMode = 'color-burn';
sprite.blendMode = 'hard-light';
sprite.blendMode = 'soft-light';
sprite.blendMode = 'difference';
sprite.blendMode = 'exclusion';
sprite.blendMode = 'hue';
sprite.blendMode = 'saturation';
sprite.blendMode = 'color';
sprite.blendMode = 'luminosity';
```

**Performance note:** Different blend modes break batching and create additional draw calls. Group sprites with the same blend mode together.

### Filter Optimization

```javascript
// Pre-define filter area to avoid measurement overhead
container.filterArea = new Rectangle(0, 0, 800, 600);

// Clear filters to release memory
container.filters = null;

// Use lower quality for better performance
const blur = new BlurFilter({ strength: 8, quality: 2 });

// Disable filters when not visible
if (!isVisible) {
  sprite.filters = null;
}
```

---

## 4. Performance and FPS Optimization

### Application Setup for Performance

```javascript
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x000000,

  // Performance options
  antialias: false,           // Disable for mobile/performance
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,          // Handle high DPI
  powerPreference: 'high-performance',  // GPU preference

  // Renderer selection
  preference: 'webgpu',       // WebGPU is faster than WebGL

  // Renderer-specific options
  webgl: { antialias: false },
  webgpu: { antialias: true },
});
```

### Batching and Draw Calls

PixiJS batches sprites automatically when they share textures.

**Batching Rules:**
- Sprites can batch with up to 16 different textures (hardware dependent)
- Same blend mode required for batching
- Rendering order matters: group similar objects together

```javascript
// GOOD: All sprites with same texture render in one batch
sprites.forEach(s => s.texture = sharedTexture);

// GOOD: Group by blend mode
normalSprites.forEach(s => stage.addChild(s));
additiveSprites.forEach(s => stage.addChild(s));

// BAD: Alternating blend modes breaks batching
// sprite1 (normal) -> sprite2 (additive) -> sprite3 (normal) = 3 draw calls
```

### Texture Management

#### Sprite Sheets

```javascript
// Use sprite sheets to minimize textures
const sheet = await Assets.load('spritesheet.json');

// All sprites from same sheet batch together
const sprite1 = new Sprite(sheet.textures['enemy1.png']);
const sprite2 = new Sprite(sheet.textures['enemy2.png']);
const sprite3 = new Sprite(sheet.textures['enemy3.png']);
```

#### Resolution Variants

```javascript
// Provide lower resolution for mobile
// character.png (full res)
// character@0.5x.png (half res - auto detected)

const texture = await Assets.load('character.png');
// PixiJS automatically uses @0.5x variant when appropriate
```

#### Texture Garbage Collection

```javascript
// Automatic GC settings (defaults)
const app = new Application();
await app.init({
  textureGCActive: true,        // Enable auto GC
  textureGCMaxIdle: 3600,       // Frames before cleanup (~1 min at 60fps)
  textureGCCheckCountMax: 600   // Check frequency (every 600 frames)
});

// Manual texture cleanup
texture.destroy(true);  // true = destroy base texture too

// Unload from GPU only (keeps in memory)
texture.unload();

// Clear all cached textures
import { Cache } from 'pixi.js';
Cache.reset();
```

### ParticleContainer for Mass Rendering

See [Section 1](#particlecontainer-pixijs-v8) for detailed usage.

```javascript
// 200k sprites in Container = 60fps
// 1M particles in ParticleContainer = 60fps

const particles = new ParticleContainer({
  dynamicProperties: {
    position: true,
    scale: false,
    rotation: false,
    color: false
  }
});
```

### cacheAsTexture (formerly cacheAsBitmap)

Cache complex containers as single textures.

```javascript
// Enable caching
container.cacheAsTexture();

// With options
container.cacheAsTexture({
  resolution: 2,      // Higher quality
  antialias: true
});

// Update after changes
container.updateCacheTexture();

// Disable
container.cacheAsTexture(false);
```

**When to use:**
- Static UI panels with decorations
- Complex containers with filters
- Rarely-updated content with many children

**When to avoid:**
- Frequently changing content
- Very large containers (>4096px)
- Containers with few elements

### Text Performance

```javascript
import { Text, BitmapText, BitmapFont } from 'pixi.js';

// SLOW: Regular text (canvas draw + GPU upload each change)
const text = new Text({
  text: 'Score: 0',
  style: { fontSize: 24, fill: 0xffffff }
});

// FAST: Bitmap text (pre-rendered glyphs)
BitmapFont.install({
  name: 'GameFont',
  style: { fontSize: 24, fill: 0xffffff }
});

const bitmapText = new BitmapText({
  text: 'Score: 0',
  style: { fontFamily: 'GameFont', fontSize: 24 }
});

// Update bitmap text is very fast
bitmapText.text = 'Score: 100';  // No canvas redraw
```

### Mask Performance

Performance hierarchy (fastest to slowest):

1. **Rectangle masks** (scissor rect) - Fastest
2. **Graphics masks** (stencil buffer) - Medium
3. **Sprite masks** (filter-based) - Slowest

```javascript
import { Graphics, Rectangle } from 'pixi.js';

// FASTEST: Rectangle mask
container.mask = new Rectangle(0, 0, 200, 200);

// MEDIUM: Graphics mask
const graphicsMask = new Graphics()
  .rect(0, 0, 200, 200)
  .fill(0xffffff);
container.mask = graphicsMask;

// SLOWEST: Sprite mask (avoid if possible)
container.mask = someSprite;
```

### Event System Optimization

```javascript
// Disable events for non-interactive containers
container.interactiveChildren = false;

// Define hit area to avoid bounds calculation
sprite.eventMode = 'static';
sprite.hitArea = new Rectangle(0, 0, 100, 100);

// Or use circle
sprite.hitArea = new Circle(50, 50, 50);
```

### Culling

```javascript
// Enable culling for off-screen objects
sprite.cullable = true;

// Set cull area (defaults to screen)
sprite.cullArea = new Rectangle(-100, -100, 1000, 800);

// Container-level culling
container.cullableChildren = true;
```

### Mobile Optimization Checklist

```javascript
// 1. Lower resolution textures (@0.5x)
// 2. Disable antialiasing
await app.init({ antialias: false });

// 3. Use WebGL (more compatible than WebGPU on mobile)
await app.init({ preference: 'webgl' });

// 4. Reduce filter quality
const blur = new BlurFilter({ quality: 2 });

// 5. Limit particle counts
const emitter = new Emitter(container, {
  maxParticles: 100,  // Lower for mobile
  // ...
});

// 6. Use object pooling
class BulletPool {
  pool = [];

  get() {
    return this.pool.pop() || new Bullet();
  }

  release(bullet) {
    bullet.reset();
    this.pool.push(bullet);
  }
}

// 7. Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    app.ticker.stop();
  } else {
    app.ticker.start();
  }
});
```

### Performance Monitoring

```javascript
// Built-in FPS display
app.ticker.add(() => {
  console.log('FPS:', app.ticker.FPS.toFixed(2));
});

// Frame time
app.ticker.add((ticker) => {
  const frameTime = ticker.deltaMS;
  if (frameTime > 16.67) {
    console.warn('Frame drop:', frameTime.toFixed(2) + 'ms');
  }
});
```

---

## 5. Physics Integration

PixiJS is a rendering library and doesn't include physics. Integrate with external physics engines.

### Matter.js Integration

#### Setup

```bash
npm install matter-js
```

```javascript
import Matter from 'matter-js';
import { Application, Sprite, Graphics } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });

// Create Matter.js engine
const engine = Matter.Engine.create();
const world = engine.world;

// Configure gravity
engine.gravity.y = 1;
```

#### Synchronizing Physics and Rendering

```javascript
class PhysicsSprite extends Sprite {
  constructor(texture, body) {
    super(texture);
    this.body = body;
    this.anchor.set(0.5);
  }

  sync() {
    this.position.set(this.body.position.x, this.body.position.y);
    this.rotation = this.body.angle;
  }
}

// Create physics body + sprite
function createBox(x, y, width, height, texture) {
  const body = Matter.Bodies.rectangle(x, y, width, height);
  Matter.World.add(world, body);

  const sprite = new PhysicsSprite(texture, body);
  sprite.width = width;
  sprite.height = height;
  app.stage.addChild(sprite);

  return sprite;
}

function createCircle(x, y, radius, texture) {
  const body = Matter.Bodies.circle(x, y, radius);
  Matter.World.add(world, body);

  const sprite = new PhysicsSprite(texture, body);
  sprite.width = radius * 2;
  sprite.height = radius * 2;
  app.stage.addChild(sprite);

  return sprite;
}

// Static ground
const ground = Matter.Bodies.rectangle(400, 580, 800, 40, { isStatic: true });
Matter.World.add(world, ground);

// Create objects
const boxes = [];
for (let i = 0; i < 10; i++) {
  boxes.push(createBox(
    Math.random() * 600 + 100,
    Math.random() * 200,
    50, 50,
    Texture.from('box.png')
  ));
}

// Game loop
app.ticker.add((ticker) => {
  // Update physics (60fps)
  Matter.Engine.update(engine, ticker.deltaMS);

  // Sync sprites with physics bodies
  boxes.forEach(box => box.sync());
});
```

#### Collision Detection

```javascript
// Collision events
Matter.Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;

    // Check labels
    if (bodyA.label === 'player' && bodyB.label === 'enemy') {
      handlePlayerHit();
    }

    // Access sprites via custom property
    const spriteA = bodyA.sprite;
    const spriteB = bodyB.sprite;
  });
});

// Label bodies for identification
const playerBody = Matter.Bodies.rectangle(100, 100, 50, 50, {
  label: 'player'
});
playerBody.sprite = playerSprite;  // Store reference
```

#### Physics Constraints

```javascript
// Pin constraint (fixed point)
const pin = Matter.Constraint.create({
  pointA: { x: 400, y: 100 },
  bodyB: pendulumBody,
  length: 200
});
Matter.World.add(world, pin);

// Spring constraint
const spring = Matter.Constraint.create({
  bodyA: bodyA,
  bodyB: bodyB,
  stiffness: 0.1,
  damping: 0.1
});
Matter.World.add(world, spring);
```

### Simple Collision Detection (Without Physics Engine)

For simple games, use lightweight collision detection.

#### pixi-intersects Library

```bash
npm install yy-intersects
```

```javascript
import * as Intersects from 'yy-intersects';

// Create collision shapes
const playerShape = new Intersects.Rectangle(player, {
  width: player.width,
  height: player.height
});

const enemyShape = new Intersects.Circle(enemy, enemy.width / 2);

// Check collisions
app.ticker.add(() => {
  if (playerShape.collidesRectangle(enemyShape)) {
    console.log('Collision!');
  }

  // Point collision
  if (playerShape.collidesPoint(mousePosition)) {
    console.log('Mouse over player');
  }
});
```

#### Manual AABB Collision

```javascript
function aabbCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function circleCollision(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}

function circleRectCollision(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}
```

#### Spatial Hashing for Many Objects

```javascript
class SpatialHash {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  getKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  insert(object) {
    const keys = this.getObjectCells(object);
    keys.forEach(key => {
      if (!this.cells.has(key)) {
        this.cells.set(key, new Set());
      }
      this.cells.get(key).add(object);
    });
  }

  getObjectCells(obj) {
    const keys = new Set();
    const minX = Math.floor(obj.x / this.cellSize);
    const maxX = Math.floor((obj.x + obj.width) / this.cellSize);
    const minY = Math.floor(obj.y / this.cellSize);
    const maxY = Math.floor((obj.y + obj.height) / this.cellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        keys.add(`${x},${y}`);
      }
    }
    return keys;
  }

  getNearby(object) {
    const nearby = new Set();
    const keys = this.getObjectCells(object);

    keys.forEach(key => {
      const cell = this.cells.get(key);
      if (cell) {
        cell.forEach(obj => {
          if (obj !== object) nearby.add(obj);
        });
      }
    });

    return nearby;
  }

  clear() {
    this.cells.clear();
  }
}

// Usage
const spatialHash = new SpatialHash(100);

app.ticker.add(() => {
  spatialHash.clear();

  // Insert all objects
  objects.forEach(obj => spatialHash.insert(obj));

  // Check collisions efficiently
  objects.forEach(obj => {
    const nearby = spatialHash.getNearby(obj);
    nearby.forEach(other => {
      if (aabbCollision(obj, other)) {
        handleCollision(obj, other);
      }
    });
  });
});
```

---

## 6. Best Practices

### Project Structure

```
project/
├── src/
│   ├── index.js              # Entry point
│   ├── Game.js               # Main game class
│   ├── scenes/
│   │   ├── LoadingScene.js
│   │   ├── MenuScene.js
│   │   └── GameScene.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   └── Bullet.js
│   ├── systems/
│   │   ├── PhysicsSystem.js
│   │   ├── InputSystem.js
│   │   └── AudioSystem.js
│   ├── ui/
│   │   ├── Button.js
│   │   ├── HealthBar.js
│   │   └── ScoreDisplay.js
│   └── utils/
│       ├── ObjectPool.js
│       ├── MathUtils.js
│       └── Constants.js
├── assets/
│   ├── images/
│   │   ├── sprites/
│   │   └── ui/
│   ├── audio/
│   ├── fonts/
│   └── manifest.json
├── public/
│   └── index.html
└── package.json
```

### Asset Loading Strategy

#### Manifest-Based Loading

```javascript
// assets/manifest.json
{
  "bundles": [
    {
      "name": "preload",
      "assets": [
        { "alias": "logo", "src": "images/logo.png" },
        { "alias": "loading-bar", "src": "images/loading-bar.png" }
      ]
    },
    {
      "name": "game",
      "assets": [
        { "alias": "spritesheet", "src": "images/sprites/game.json" },
        { "alias": "background", "src": "images/background.{webp,png}" },
        { "alias": "particles", "src": "images/particles.json" }
      ]
    },
    {
      "name": "audio",
      "assets": [
        { "alias": "bgm", "src": "audio/music.{ogg,mp3}" },
        { "alias": "sfx-jump", "src": "audio/jump.{ogg,mp3}" }
      ]
    }
  ]
}

// src/index.js
import { Application, Assets } from 'pixi.js';

async function init() {
  const app = new Application();
  await app.init({ width: 800, height: 600 });
  document.body.appendChild(app.canvas);

  // Initialize with manifest
  await Assets.init({ manifest: 'assets/manifest.json' });

  // Load preload bundle first
  await Assets.loadBundle('preload');

  // Show loading screen, then load game assets
  const loadingScene = new LoadingScene();
  app.stage.addChild(loadingScene);

  // Background load remaining bundles
  Assets.backgroundLoadBundle('audio');

  // Load game bundle with progress
  await Assets.loadBundle('game', (progress) => {
    loadingScene.updateProgress(progress);
  });

  // Start game
  loadingScene.destroy();
  const gameScene = new GameScene();
  app.stage.addChild(gameScene);
}

init();
```

#### Progressive Loading

```javascript
class LoadingScene extends Container {
  async load() {
    // Load minimum required assets
    await Assets.loadBundle('core');

    // Start game immediately
    this.emit('ready');

    // Continue loading in background
    Assets.backgroundLoadBundle(['level-1', 'level-2', 'audio']);
  }
}

// Later, when entering level
class Level {
  async enter(levelNumber) {
    // Will resolve instantly if already loaded
    const assets = await Assets.loadBundle(`level-${levelNumber}`);
    this.build(assets);
  }
}
```

### Memory Management

#### Proper Cleanup

```javascript
class Scene extends Container {
  constructor() {
    super();
    this.sprites = [];
    this.filters = [];
    this.tweens = [];
  }

  destroy() {
    // Stop all tweens
    this.tweens.forEach(tween => tween.kill());

    // Remove event listeners
    this.off('pointerdown');
    this.eventMode = 'none';

    // Destroy sprites and their textures
    this.sprites.forEach(sprite => {
      sprite.destroy({ children: true, texture: false });
    });

    // Clear filters
    this.filters = null;

    // Call parent destroy
    super.destroy({ children: true });
  }
}
```

#### Object Pooling

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];

    // Pre-populate
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  get() {
    const obj = this.pool.pop() || this.createFn();
    return obj;
  }

  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  clear() {
    this.pool.forEach(obj => obj.destroy?.());
    this.pool = [];
  }
}

// Usage
const bulletPool = new ObjectPool(
  () => new Bullet(),
  (bullet) => {
    bullet.visible = false;
    bullet.position.set(0, 0);
    bullet.velocity.set(0, 0);
  },
  50
);

function fireBullet(x, y, vx, vy) {
  const bullet = bulletPool.get();
  bullet.position.set(x, y);
  bullet.velocity.set(vx, vy);
  bullet.visible = true;
  activeBullets.push(bullet);
}

function recycleBullet(bullet) {
  const index = activeBullets.indexOf(bullet);
  if (index > -1) {
    activeBullets.splice(index, 1);
    bulletPool.release(bullet);
  }
}
```

### Responsive Design

```javascript
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
  resizeTo: window,  // Auto-resize to window
  autoDensity: true,
  resolution: window.devicePixelRatio || 1
});

// Or manual resize handling
function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  app.renderer.resize(width, height);

  // Scale game to fit
  const gameWidth = 800;
  const gameHeight = 600;
  const scale = Math.min(width / gameWidth, height / gameHeight);

  app.stage.scale.set(scale);
  app.stage.position.set(
    (width - gameWidth * scale) / 2,
    (height - gameHeight * scale) / 2
  );
}

window.addEventListener('resize', resize);
resize();
```

#### Responsive Layout System

```javascript
class ResponsiveContainer extends Container {
  constructor(options = {}) {
    super();
    this.layoutRules = options.layout || {};
    this.designWidth = options.designWidth || 800;
    this.designHeight = options.designHeight || 600;
  }

  updateLayout(screenWidth, screenHeight) {
    const scaleX = screenWidth / this.designWidth;
    const scaleY = screenHeight / this.designHeight;

    this.children.forEach(child => {
      const rules = child.layoutRules || {};

      // Anchoring
      if (rules.anchor === 'top-left') {
        child.position.set(rules.margin || 0, rules.margin || 0);
      } else if (rules.anchor === 'top-right') {
        child.position.set(
          screenWidth - child.width - (rules.margin || 0),
          rules.margin || 0
        );
      } else if (rules.anchor === 'center') {
        child.position.set(screenWidth / 2, screenHeight / 2);
      }

      // Scaling
      if (rules.scaleMode === 'fit') {
        const scale = Math.min(scaleX, scaleY);
        child.scale.set(scale);
      } else if (rules.scaleMode === 'stretch') {
        child.scale.set(scaleX, scaleY);
      }
    });
  }
}
```

### Scene Management

```javascript
class SceneManager {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
    this.scenes = new Map();
  }

  register(name, SceneClass) {
    this.scenes.set(name, SceneClass);
  }

  async goto(name, data = {}) {
    const SceneClass = this.scenes.get(name);
    if (!SceneClass) {
      throw new Error(`Scene "${name}" not found`);
    }

    // Transition out
    if (this.currentScene) {
      await this.currentScene.transitionOut?.();
      this.app.stage.removeChild(this.currentScene);
      this.currentScene.destroy();
    }

    // Create and add new scene
    this.currentScene = new SceneClass(this.app, data);
    this.app.stage.addChild(this.currentScene);

    // Initialize and transition in
    await this.currentScene.init?.();
    await this.currentScene.transitionIn?.();
  }
}

// Usage
const sceneManager = new SceneManager(app);
sceneManager.register('menu', MenuScene);
sceneManager.register('game', GameScene);
sceneManager.register('gameover', GameOverScene);

await sceneManager.goto('menu');
```

### Error Handling

```javascript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Show error screen or recover
});

// Asset loading errors
try {
  await Assets.load('missing-asset.png');
} catch (error) {
  console.warn('Asset failed to load:', error);
  // Use fallback texture
  return Texture.WHITE;
}

// WebGL context loss
app.renderer.on('context', (type) => {
  if (type === 'lost') {
    console.warn('WebGL context lost');
    // Pause game, show message
  } else if (type === 'restored') {
    console.log('WebGL context restored');
    // Resume game
  }
});
```

### Development Tools

```javascript
// Enable PixiJS devtools
if (process.env.NODE_ENV === 'development') {
  // Add to window for debugging
  window.__PIXI_APP__ = app;

  // Console helpers
  window.debugSprite = (sprite) => {
    console.log({
      position: { x: sprite.x, y: sprite.y },
      scale: { x: sprite.scale.x, y: sprite.scale.y },
      rotation: sprite.rotation,
      alpha: sprite.alpha,
      visible: sprite.visible,
      bounds: sprite.getBounds()
    });
  };
}

// FPS counter
const fpsText = new Text({
  text: 'FPS: 60',
  style: { fontSize: 14, fill: 0x00ff00 }
});
fpsText.position.set(10, 10);
app.stage.addChild(fpsText);

app.ticker.add(() => {
  fpsText.text = `FPS: ${app.ticker.FPS.toFixed(1)}`;
});
```

---

## Quick Reference

### Essential Imports

```javascript
import {
  Application,
  Container,
  Sprite,
  Graphics,
  Text,
  BitmapText,
  AnimatedSprite,
  ParticleContainer,
  Particle,
  Texture,
  Assets,
  Filter,
  BlurFilter,
  ColorMatrixFilter,
  DisplacementFilter,
  NoiseFilter,
  Rectangle,
  Circle,
  Point
} from 'pixi.js';
```

### Useful Links

**Official Resources:**
- [PixiJS Documentation](https://pixijs.com/8.x/guides)
- [PixiJS API Reference](https://pixijs.download/dev/docs/)
- [PixiJS Examples](https://pixijs.com/8.x/examples)

**Particle Systems:**
- [@pixi/particle-emitter Documentation](https://particle-emitter.pixijs.io/docs/)
- [Particle Editor](https://pixijs.io/particle-emitter/editor/)
- [GitHub Repository](https://github.com/pixijs-userland/particle-emitter)

**Filters:**
- [pixi-filters GitHub](https://github.com/pixijs/filters)
- [Filter Examples](https://pixijs.io/filters/examples/)

**Animation:**
- [GSAP PixiPlugin](https://gsap.com/docs/v3/Plugins/PixiPlugin/)
- [Spine PixiJS Runtime](https://en.esotericsoftware.com/spine-pixi)
- [pixi-actions](https://github.com/srpatel/pixi-actions)

**Tools:**
- [TexturePacker](https://www.codeandweb.com/texturepacker)
- [AssetPack CLI](https://pixijs.io/assetpack/docs/)

**Physics:**
- [Matter.js](https://brm.io/matter-js/)
- [pixi-intersects](https://github.com/davidfig/pixi-intersects)

---

*Guide compiled from official PixiJS documentation, community resources, and best practices as of 2025-2026.*
