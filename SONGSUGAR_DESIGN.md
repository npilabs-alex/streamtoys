# SONGSUGAR - Game Design Document

## Overview

SONGSUGAR is a musical puzzle game where players make music as they play. The music created is so good, players share it.

SongSugar will sit independently on the web but be heavily integrated with BandLab services on an exclusive basis, serving as a downtime game for music creators — keeping them in the creative mood — while also offering a new experience for gamers and music lovers who want to create without traditional production skills.

## Core Mechanic

An action puzzle game inspired by four classic titles:

| Game | Inspiration |
|------|-------------|
| **Tetris** | Falling pieces, spatial pressure, "one more game" addiction, universal accessibility |
| **Super Puzzle Fighter 2** | Cluster-based matching, chain reactions, building up power before explosive clears, competitive energy |
| **Candy Crush** | Tap-to-collapse mechanics, satisfying visual/audio feedback, gem aesthetics, mobile-first design |

## The Promise

Players don't just play a game — they compose a track. Every session creates a unique mix of loops that layers and evolves. The best sessions can be exported, shared, and even brought into BandLab for further production.

---

## Vision

**"The music created is so good, players share it."**

- Loop combinations should produce professional-quality, share-worthy music
- Each loop choice subtly influences visual effects on the playboard (color tints, particle hues, ambient lighting)
- Architecture supports future visualizer generation from play session data
- The game captures: which loops are active, when they change, cluster clears, wildcards triggered
- Day 2: This session data → generate music visualizations to accompany the track

---

## Studio-Quality Soundscape

### The Sound Source

All loops are sourced from **Splice**, the industry-standard sample library used by professional producers worldwide. Splice's licensing is 100% royalty-free for commercial use — no attribution required, no royalties owed. Players compose with the same sounds heard in chart-topping tracks.

**Future:** BandLab Sounds (100K+ royalty-free loops, in-house) offers a natural integration path once internal API access is available.

### Real-Time Audio Engine

The game uses professional-grade audio tools (Tone.js, Web Audio API) that go beyond simple playback:

- **Time-stretching:** Adjust tempo without changing pitch (95-135 BPM range)
- **Pitch-shifting:** Transpose all loops together (±5 semitones)
- **Live effects:** Filter sweeps, reverb washes, bitcrush — triggered by gameplay
- **Seamless crossfades:** Loops blend smoothly as the soundscape evolves

This isn't a playlist — it's a **live mix** that responds to every move.

### Curated for Compatibility

Every loop is selected and normalized to work together:

- **Same key:** C minor (and compatible keys: Eb major, G minor)
- **Same tempo:** 115 BPM base (adjustable via global controls)
- **Frequency separation:** BEATs occupy low-mid, VIBEs fill the stereo field, MELODYs sit on top
- **Mix-ready levels:** Normalized to -14 LUFS so layers never fight

With 8 loops per category across 3 categories, players have **512 base combinations**. Add global BPM control (40 settings), pitch control (11 semitones), and per-session wildcard effects — the possible unique tracks approach **infinite**.

Every session creates something that's never been heard before.

---

## Visual & UX Principles (Do NOT Compromise)

- **Triple-A Visuals**: Modern tile rendering design (TBD - high polish required)
- **Custom Icons**: Drawn icons (not emoji) - distinct visual language
- **Particle Effects**: Bursts, glow effects, Global FX on big clears
- **Smooth Physics**: Falling mechanics, collision, piece behavior
- **UI Polish**: Toast notifications, combo popups, smooth animations

---

## Tile System

| Tile | Color | Hex | Audio Role |
|------|-------|-----|------------|
| **BEAT** | Pink/Magenta | #ff2d6e | Drums, percussion, rhythmic foundation |
| **VIBE** | Cyan | #00e5ff | Pads, atmosphere, ambient textures |
| **MELODY** | Green | #39ff14 | Leads, hooks, melodic lines, arpeggios |
| **WILD** | Gold | #ffd700 | Wildcard - matches any + triggers effects |

---

## Loop Ontology

**8 loops per category = 24 total loops = 512 unique combinations**

All loops: **115 BPM base**, **C minor key**, **4 bars** (~2.087 seconds)

### BEAT (8) - Rhythmic Foundation

| # | ID | Name | Genre/Origin | Character |
|---|-----|------|--------------|-----------|
| 1 | trap_808 | Trap 808s | Trap/Hip Hop | Hard 808, hi-hat rolls |
| 2 | boom_bap | Boom Bap | 90s Hip Hop | Dusty, sampled breaks |
| 3 | lofi_drums | Lo-fi Drums | Lo-fi Hip Hop | Vinyl-degraded, lazy swing |
| 4 | afrobeat | Afrobeat | West African | Polyrhythmic, organic |
| 5 | house_4x4 | House 4x4 | House/Dance | Driving four-on-floor |
| 6 | drill | Drill | UK/Chicago | Dark, sliding 808s |
| 7 | amapiano | Amapiano | South African | Log drum, shaker, bounce |
| 8 | breakbeat | Breakbeat | Jungle/DnB | Chopped breaks, energy |

### VIBE (8) - Atmosphere & Texture

| # | ID | Name | Sonic Space | Character |
|---|-----|------|-------------|-----------|
| 1 | warm_pad | Warm Pad | Mid/High | Analog, Juno-esque |
| 2 | dark_drone | Dark Drone | Low/Mid | Minor, cinematic tension |
| 3 | lofi_texture | Lo-fi Texture | Full | Vinyl crackle, tape warmth |
| 4 | ethereal_choir | Ethereal Choir | High | Vocal pad, angelic |
| 5 | strings_swell | Strings Swell | Mid/High | Orchestral, emotional |
| 6 | synth_wash | Synth Wash | Wide stereo | Digital, lush |
| 7 | sub_drone | Sub Drone | Sub bass | Felt not heard, weight |
| 8 | glitch_texture | Glitch Texture | Scattered | Digital artifacts, modern |

### MELODY (8) - Hooks & Lines

| # | ID | Name | Instrument | Character |
|---|-----|------|------------|-----------|
| 1 | piano_chords | Piano Chords | Keys | Neo-soul, jazzy |
| 2 | synth_arp | Synth Arp | Synth | Pulsing, sequenced |
| 3 | pluck_lead | Pluck Lead | Synth | Bright, pizzicato |
| 4 | guitar_clean | Guitar Clean | Guitar | Warm, organic |
| 5 | vocal_chop | Vocal Chop | Voice | Processed, rhythmic |
| 6 | bell_melody | Bell Melody | Bells | Crystalline, delicate |
| 7 | flute_line | Flute Line | Woodwind | Breathy, organic |
| 8 | glide_lead | Glide Lead | Synth | Portamento, retro |

### Loop Design Principles

Each loop should differ from others on multiple axes to maximize uniqueness:

**BEAT differences:** Genre origin, drum machine vs organic, simple vs complex rhythm, energy level
**VIBE differences:** Frequency range, texture type, emotional tone, movement (static vs evolving)
**MELODY differences:** Instrument family, melodic style, register, attack character

---

## Wildcard System (WILD Tiles)

WILD tiles serve **dual purposes**:

### 1. Tile Matching (Cluster Formation)
- WILD matches ANY adjacent tile color
- Enables larger clusters and chain reactions
- Strategic placement creates explosive clears

### 2. Audio Effects (On Clear)
When a cluster containing WILD tiles clears, trigger a DJ-style effect:

| Effect | What It Does | Duration |
|--------|--------------|----------|
| Filter Sweep | High-pass reveal or low-pass muffle | 2-4 bars |
| Pitch Bend | Shift all loops ±2 semitones | 4 bars |
| Tape Stop | Slow down to stop, snap back | 1 bar |
| Stutter | Rhythmic repeat/glitch | 2 bars |
| Reverb Wash | Big reverb swell | 2 bars |
| Sidechain Pump | Rhythmic ducking | 4 bars |
| Bitcrush | Lo-fi degradation | 4 bars |

### Effect Selection Logic
- **Small cluster (3-4 tiles with WILD):** Subtle effect (filter, reverb)
- **Medium cluster (5-6 tiles):** Moderate effect (pitch, stutter)
- **Large cluster (7+ tiles):** Dramatic effect (tape stop, full bitcrush)

### Open Question
Should the effect be **random** or **deterministic** based on:
- Which color tiles the WILD helped clear?
- Position on the board?
- Player's current loop selection?

---

## Game Modes: Pressure vs Zen

### The Design Tension

SONGSUGAR has two competing identities:
- **Arcade puzzle game:** Stakes, pressure, "game over" states, score attack
- **Creative music toy:** Relaxed exploration, endless sessions, no failure

### Recommendation: Two Modes

#### Challenge Mode (Pressure Bar Active)
```
┌─────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  PRESSURE: 70%   │
└─────────────────────────────────────────┘
```

- Tiles accumulate, pressure rises
- Clear clusters to reduce pressure
- Game over when pressure hits 100%
- **For:** Score chasers, competitive players, "one more game" addiction
- **Rewards:** Leaderboards, high scores, achievement unlocks

#### Chill Mode (No Pressure)
- Tiles still fall but no failure state
- Play indefinitely, focus on the music
- Session ends when player chooses
- **For:** Music creators, relaxation, creative exploration
- **Rewards:** Loop discovery, export best sessions, share creations

### Why Both?
- Different player motivations (gamers vs music lovers)
- Different contexts (commute challenge vs evening unwind)
- BandLab audience skews creative — Chill Mode is their entry point
- Challenge Mode provides replayability and streaming content

---

## Game Mechanics

### Piece Spawning

**Shape Philosophy: NOT Tetris**

Shapes should feel distinct from Tetris to establish unique identity:

| Avoid | Prefer |
|-------|--------|
| L-shapes, T-shapes, S/Z-shapes | Simpler forms: 2-tile, 3-tile lines, 2x2 squares |
| Complex rotation puzzles | Quick placement, fast decisions |
| Precise fitting requirements | Forgiving collision, cluster-focused |

**Spawn Logic:**
- Pieces spawn at top center
- Random tile colors (BEAT/VIBE/MELODY/WILD)
- WILD tiles are rarer (~15% chance per tile)
- Piece preview shows next 1-2 pieces

### Piece Behavior: Break on Impact

**Key mechanic:** Pieces **break apart on landing**, individual tiles then join adjacent clusters.

```
Falling:          Landing:           Settled:
  [B][V]            [B][V]           [B] joins left cluster
    ↓                 ↓↓             [V] joins right cluster
                   ═══════
  [B][B][M]  →    [B][B][M][V]   →  New cluster formed
```

**Implications:**
- No need for precise "fitting" like Tetris
- Focus shifts to **color placement** not shape placement
- Rotation still valuable for positioning colors
- Simpler shapes work fine — complexity comes from cluster strategy

### Ghost Piece: Probably Not Needed

Traditional Tetris ghost shows where piece will land. With break-on-impact:

| With Ghost | Without Ghost |
|------------|---------------|
| Shows landing position | Player watches descent |
| Helps precise placement | Less visual clutter |
| Tetris convention | Cleaner, unique feel |
| Useful for complex shapes | Simple shapes don't need it |

**Recommendation:** Skip the ghost piece. The break-on-impact mechanic makes exact landing position less critical. The focus is "which colors am I adding to which area?" not "will this piece fit?"

Consider: A subtle **color highlight** on clusters that will be affected instead.

### Cluster Detection & Collapse

**Matching Rules:**
- 3+ adjacent tiles of same type = valid cluster
- WILD tiles match any adjacent color
- Adjacency = orthogonal (not diagonal)

**Collapse Flow:**
```
1. Piece lands, breaks into individual tiles
2. Tiles settle into grid positions
3. Cluster detection runs
4. Valid clusters (3+) marked for clearing
5. Clear animation plays (particles, sound)
6. Tiles above fall down (gravity)
7. New clusters may form (chain reaction)
8. Repeat until stable
9. Resources awarded, loops potentially change
```

**Chain Reactions:**
- Cascading clears award combo bonuses
- Visual/audio feedback escalates with combo count
- Chains feel rewarding and create musical moments

### Rotation

Even with simpler shapes, rotation adds strategy:

```
Before rotation:     After rotation:
    [B]                 [B][V]
    [V]
```

- Rotate to position colors near matching clusters
- Quick tap to rotate (mobile-friendly)
- No wall-kick complexity needed with simple shapes

---

## Resource Economy

### Earning Points

Clearing clusters earns points of that color:

| Cluster Size | Base Points | Bonus | Total |
|--------------|-------------|-------|-------|
| 3 tiles | 9 | +0 | 9 |
| 4 tiles | 12 | +2 | 14 |
| 5 tiles | 15 | +4 | 19 |
| 6 tiles | 18 | +6 | 24 |
| 7+ tiles | 21+ | +8+ | 29+ |

**Formula:** `(tiles × 3) + ((tiles - 3) × 2)`

Chain combos multiply points.

### Unlocking Loops

| Loop # | Unlock Cost | Cumulative |
|--------|-------------|------------|
| 1 | Free | 0 |
| 2 | 10 | 10 |
| 3 | 15 | 25 |
| 4 | 20 | 45 |
| 5 | 25 | 70 |
| 6 | 30 | 100 |
| 7 | 35 | 135 |
| 8 | 40 | 175 |

Each category (BEAT/VIBE/MELODY) has separate unlock progression.

---

## Global Audio Controls

Players can customize the overall sound:

| Control | Range | Purpose |
|---------|-------|---------|
| **BPM** | 95-135 | Chill to hype energy |
| **Pitch/Key** | ±5 semitones | Mood adjustment |
| **Master Filter** | 20Hz-20kHz | DJ-style sweeps |
| **Reverb** | 0-100% | Intimate to spacious |

**Technical:** Implemented via Tone.js effects chain. Small BPM changes use playback rate, larger changes use granular time-stretching.

---

## Loop Management & Gameplay Relationship

### How Loops Change During Play

**Option A: Automatic Progression**
- Clearing BEAT clusters → cycles to next unlocked BEAT loop
- Clearing VIBE clusters → cycles to next unlocked VIBE loop
- etc.
- Creates evolving soundscape without player intervention

**Option B: Manual Selection**
- Clearing clusters earns points only
- Player opens loop menu to swap loops
- More control, but interrupts gameplay

**Option C: Hybrid (Recommended)**
- Large clears (5+ tiles) auto-advance the loop
- Small clears earn points for unlocks
- Quick-tap on active loop to manually cycle
- Best of both: evolution happens naturally, control available

### Loop Unlock Moments

When player earns enough points to unlock:
1. Subtle notification appears
2. New loop auto-activates (or player chooses)
3. Brief celebration effect
4. Music evolves — rewarding moment

---

## Session Data Capture

Track everything for future visualizer/export:

```javascript
const sessionData = {
  startTime: Date.now(),
  bpm: 115,
  mode: 'challenge', // or 'chill'
  events: [
    { time: 0, type: 'session_start' },
    { time: 1500, type: 'loop_add', category: 'beat', loopId: 'trap_808' },
    { time: 4200, type: 'cluster_clear', category: 'melody', size: 5, chain: 2 },
    { time: 4300, type: 'wildcard', effect: 'filter_sweep' },
    { time: 8000, type: 'loop_change', category: 'vibe', from: 'warm_pad', to: 'dark_drone' },
    // ...
  ],
  finalScore: 12450,
  loopsUnlocked: ['trap_808', 'boom_bap', 'warm_pad', 'piano_chords']
};
```

**Future uses:**
- Generate music video visualizations
- Social sharing with playback
- Import session into BandLab as project

---

## Audio Asset Specifications

### Loop Requirements
- **Format:** OGG (primary), MP3 (fallback)
- **Duration:** Exactly 4 bars at 115 BPM (~2.087 seconds)
- **Sample rate:** 44100 Hz
- **Channels:** Stereo
- **Loudness:** Normalized to -14 LUFS
- **Key:** C minor (or compatible: Eb major, G minor, F minor)

### Quality Bar: Share-Worthy
The loops must be high enough quality that when combined:
- The result sounds like a professionally produced track
- Players want to share/export their creations
- The music stands on its own, not just "game audio"

### Sourcing
- **Primary:** Splice (100% royalty-free commercial use)
- **Secondary:** Looperman, Cymatics (CC0/royalty-free)
- **Custom:** Commission from BandLab creator community
- **Future:** BandLab Sounds (in-house, pending internal API access)

---

## Technical Architecture

### Core Components

1. **SoundscapeEngine** - Loop playback with crossfading, effect chain
2. **ResourceManager** - Points earned, unlock state
3. **LoopManager** - Active loops, swap logic
4. **WildcardSystem** - Effect triggers

---

## Tech Stack Research

### Rendering: PixiJS (Recommended)

**Why PixiJS:**
- 1M+ particles at 60fps via ParticleContainer
- WebGL-accelerated with Canvas fallback
- 40+ built-in filters (glow, blur, displacement, color matrix)
- AnimatedSprite for frame-based animation
- Spine integration for skeletal animation
- Proven in games: CrossCode, HoloVista, Prodigy Math

**Key Capabilities:**

| Feature | PixiJS Solution |
|---------|-----------------|
| Particles | `ParticleContainer` (100K+ sprites) or `@pixi/particle-emitter` |
| Sprite animation | `AnimatedSprite` from spritesheet |
| Glow/bloom | `@pixi/filter-glow`, `@pixi/filter-advanced-bloom` |
| Screen shake | Manipulate container position |
| Color effects | `ColorMatrixFilter` for tinting |
| Blend modes | 16 blend modes (ADD for glow, MULTIPLY for shadows) |

**Performance Strategy:**
- Use `ParticleContainer` for particles (not regular Container)
- Batch sprites with same texture into spritesheets
- Use `PIXI.Ticker` for game loop (auto frame-rate management)
- Enable `antialias: false` for pixel-perfect rendering
- Texture atlases to minimize draw calls

**Future-Proof:** WebGPU support coming (10x rendering performance)

### Audio: Tone.js + Howler.js Hybrid

**Tone.js** (scheduling, effects, synthesis):
```
Loops → PitchShift → Filter → Reverb → Compressor → Limiter → Output
```

| Use Case | Tone.js Feature |
|----------|-----------------|
| Time-stretch BPM | `GrainPlayer` with granular synthesis |
| Pitch shift | `PitchShift` effect (±12 semitones) |
| Filter sweeps | `Filter` with frequency ramp |
| Reverb | `Reverb` with decay/wet control |
| Sidechain pump | `Compressor` with external sidechain |
| Beat sync | `Transport` for BPM-locked scheduling |

**Howler.js** (sample playback, 7KB):
- Audio sprites (multiple sounds in one file)
- Spatial audio (panning)
- Mobile-optimized (handles audio unlock)
- Format fallback (OGG → MP3)

**Audio Chain Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                      PER-CATEGORY                           │
├─────────────────────────────────────────────────────────────┤
│  BEAT Loop ──→ [Volume] ──→ [Solo/Mute] ──┐                │
│  VIBE Loop ──→ [Volume] ──→ [Solo/Mute] ──┼──→ Mix Bus     │
│  MELODY Loop → [Volume] ──→ [Solo/Mute] ──┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      GLOBAL EFFECTS                         │
├─────────────────────────────────────────────────────────────┤
│  Mix Bus ──→ [PitchShift] ──→ [Filter] ──→ [Reverb] ──→    │
│          ──→ [Compressor] ──→ [Limiter] ──→ Master Out     │
└─────────────────────────────────────────────────────────────┘
```

### BPM/Tempo Flexibility

| BPM Change | Method | Pitch Effect |
|------------|--------|--------------|
| ±10 BPM (105-125) | Playback rate | Minimal (<2 semitones) |
| ±25 BPM (90-140) | Granular time-stretch | None (pitch preserved) |

**Recommendation:** Support 95-135 BPM range. Use playback rate for small changes, granular for large.

### Audio Sourcing: Splice (Primary)

**Commercial Terms:**
- 100% royalty-free for commercial games
- No attribution required
- Cannot redistribute samples standalone
- Can export player-created mixes (derivative works OK)

**Search Criteria for SONGSUGAR:**

| Category | Search Terms | Filters |
|----------|--------------|---------|
| BEAT | "drum loop", "percussion" | BPM: 110-120, Genre: Hip Hop/House/Afrobeat |
| VIBE | "pad loop", "ambient", "atmosphere" | BPM: any, Genre: Ambient/Lo-Fi/Synthwave |
| MELODY | "melody loop", "synth lead", "arp" | BPM: 110-120, Key: C minor/Eb major/G minor |

**Backup Sources:**
- Looperman (royalty-free)
- Cymatics (free packs)
- BandLab creator commissions

**Future Integration: BandLab Sounds**
- 100K+ royalty-free loops (in-house asset)
- Tagged with BPM, key, genre, instrument
- No public API currently — requires internal access
- Natural fit once platform integration is prioritized

### Format Strategy

| Format | Use | Browser Support |
|--------|-----|-----------------|
| OGG Vorbis | Primary | Chrome, Firefox, Edge, Opera |
| MP3 | Fallback | All browsers including Safari |
| WAV | Short FX only | All (large file size) |

**Bitrate:** 128-192 kbps for loops, 96-128 kbps for ambient

---

## UI/UX Design

### Screen Map (5 Screens)

```
┌─────────────┐
│    HOME     │
│             │
│ Start       │───────────────►┌─────────────┐
│ Resume      │                │    PLAY     │
│ Saved Games │                │   (game)    │
│ Settings    │◄───────────────│             │
│ Scores      │   Save & Exit  └──────┬──────┘
└─────────────┘                       │
      │                         ┌─────┴─────┐
      │                         │           │
      ▼                    [PAUSE]       [MIX]
┌─────────────┐                 │           │
│  SETTINGS   │◄────────────────┤           │
└─────────────┘                 ▼           ▼
                          ┌─────────┐ ┌─────────┐
                          │  PAUSE  │ │   MIX   │
                          │ SCREEN  │ │ SCREEN  │
                          └─────────┘ └─────────┘
```

---

### HOME Screen

```
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│            ♪ SONGSUGAR ♪                     │
│                                              │
│                                              │
│          ┌─────────────────────┐             │
│          │   START SESSION    │             │
│          └─────────────────────┘             │
│          ┌─────────────────────┐             │
│          │  RESUME SESSION    │  ← last     │
│          │  "Chill Mix #3"    │    played   │
│          └─────────────────────┘             │
│          ┌─────────────────────┐             │
│          │   SAVED GAMES      │  ← 10 slots │
│          └─────────────────────┘             │
│          ┌─────────────────────┐             │
│          │    SETTINGS        │             │
│          └─────────────────────┘             │
│          ┌─────────────────────┐             │
│          │     SCORES         │  ← personal │
│          └─────────────────────┘    + global │
│                                              │
└──────────────────────────────────────────────┘
```

- **10 save slots** for saved games
- **Resume Session** shows last played (auto-save on exit)
- **Scores** shows personal high scores and global leaderboard

---

### PLAY Screen (Minimal HUD)

```
┌──────────────────────────────────────────────┐
│  12,450                                 [II] │
│  pts                                   PAUSE │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│               GAME BOARD                     │
│                                              │
│                                              │
│                                              │
├──────────────────────────────────────────────┤
│  B ████████░░░░░░                            │
│  V ██████████████░░  ← pulsing        [MIX]  │
│  M ████░░░░░░░░░░░░                          │
└──────────────────────────────────────────────┘
```

**Top bar:**
- LEFT: Score (points)
- RIGHT: Pause button

**Bottom bar:**
- LEFT: Three horizontal progress bars (B/V/M)
  - Fill as player clears clusters of that type
  - Pulse/animate as they near full
  - When full → "LOOP UNLOCKED!" toast → bar resets
- RIGHT: MIX button

**Progress bar behavior:**
- Same fill amount for each unlock (no escalation)
- Unlock count only visible in MIX screen
- New loops available for manual selection in MIX

---

### PAUSE Screen (Overlay)

```
┌──────────────────────────────────────────────┐
│                                              │
│                  PAUSED                      │
│                                              │
│          ┌─────────────────────┐             │
│          │      RESUME        │             │
│          └─────────────────────┘             │
│          ┌─────────────────────┐             │
│          │    SAVE & EXIT     │             │
│          └─────────────────────┘             │
│          ┌─────────────────────┐             │
│          │       MUTE         │             │
│          └─────────────────────┘             │
│          ┌─────────────────────┐             │
│          │     SETTINGS       │             │
│          └─────────────────────┘             │
│                                              │
└──────────────────────────────────────────────┘
```

- Music PAUSES on this screen (unlike MIX)
- SETTINGS opens settings screen

---

### MIX Screen (Full Takeover)

Game paused, **music continues playing**. Player configures their soundscape.

```
┌──────────────────────────────────────────────┐
│                    MIX                  [X]  │
├──────────────────────────────────────────────┤
│                                              │
│      BEAT           VIBE          MELODY     │
│                                              │
│   ┌──────┐       ┌──────┐       ┌──────┐     │
│   │ TRAP │       │ WARM │       │PIANO │     │
│   └──────┘       └──────┘       └──────┘     │
│   ┌──────┐       ┌──────┐       ┌ ─ ─ ─┐     │
│   │ BOOM │       │      │       │      │     │
│   └──────┘       └ ─ ─ ─┘       └ ─ ─ ─┘     │
│   ┌ ─ ─ ─┐       ┌ ─ ─ ─┐       ┌ ─ ─ ─┐     │
│   │      │       │      │       │      │     │
│   └ ─ ─ ─┘       └ ─ ─ ─┘       └ ─ ─ ─┘     │
│                                              │
│  2 ready to unlock              1 ready to   │
│                                    unlock    │
│       ↕              ↕              ↕        │
├──────────────────────────────────────────────┤
│  ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  TRAP   │    │  WARM   │    │ PIANO   │   │
│  │   ON    │    │   ON    │    │   ON    │   │
│  └─────────┘    └─────────┘    └─────────┘   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  BOOM   │    │  LOFI   │    │ SYNTH   │   │
│  │   ON    │    │   OFF   │    │   OFF   │   │
│  └─────────┘    └─────────┘    └─────────┘   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  LOFI   │    │  DARK   │    │ PLUCK   │   │
│  │   OFF   │    │   OFF   │    │   OFF   │   │
│  └─────────┘    └─────────┘    └─────────┘   │
│  ┌ ─ ─ ─ ─ ┐    ┌ ─ ─ ─ ─ ┐    ┌ ─ ─ ─ ─ ┐   │
│  │▷  AFRO  │    │▷ETHEREAL│    │▷ GUITAR │   │
│  │ UNLOCK  │    │ UNLOCK  │    │ UNLOCK  │   │
│  └ ─ ─ ─ ─ ┘    └ ─ ─ ─ ─ ┘    └ ─ ─ ─ ─ ┘   │
│       :              :              :        │
│   (scrolls)      (scrolls)      (scrolls)    │
│                                              │
├──────────────────────────────────────────────┤
│  BPM   ◄ [========●===] ►  115               │
│  PITCH ◄ [====●=======] ►  +0                │
├──────────────────────────────────────────────┤
│            [ BACK TO GAME ]                  │
└──────────────────────────────────────────────┘
```

**Layer Grid (Top):**
- 3×3 grid showing active slots per category
- Filled slot = loop name, colored
- Empty slot = dashed outline
- Tap active slot = turns that loop OFF

**"X ready to unlock" text:**
- Shows if resources available for that category
- Hidden if no resources available

**Card Columns (Scrollable):**
- 8 cards per column, scroll independently
- Future-proofs for adding more loops

**Card States:**

| State | Visual | Label | Demo |
|-------|--------|-------|------|
| **ON** | Colored, solid border | "ON" | (none) |
| **OFF** | Colored dimmer, solid | "OFF" | (none) |
| **LOCKED** | Greyed, dashed border | "UNLOCK" | ▷ |

**Interactions:**
- Tap ON card → turns OFF
- Tap OFF card → turns ON (if slots available)
- Tap UNLOCK card → unlocks if resources, else "Need more BEAT points!"
- Tap ▷ on UNLOCK → demos/previews that loop
- Max 3 ON per category → "Max BEAT layers reached" toast

**Global Controls (Bottom):**
- BPM slider: 95-135
- PITCH slider: ±5 semitones
- BACK TO GAME button

---

### Loop System Rules

- **Loops 1-3:** Unlocked from start (9 total)
- **Loops 4-8:** Must unlock via progress bars
- **Max active:** 3 per category (9 total layers)
- **Unlock cost:** Same for each (progress bar fills equally)
- **Layering:** Multiple loops can play simultaneously in same category

---

### Layer Audio Mixing

Auto-gain based on layer count prevents clipping:

| Layers Active | Per-Layer Volume |
|---------------|------------------|
| 1 | 100% |
| 2 | 80% each |
| 3 | 65% each |

Plus master compressor + limiter on output.

---

### SFX System (Game Event Sounds)

Separate from loop system. Tone.js synthesis for responsive, in-key feedback.

| Event | Sound Character |
|-------|-----------------|
| Piece lands | Soft thud |
| Cluster forms | Subtle chime |
| Cluster clears | Satisfying burst, chord in C minor |
| Chain reaction | Escalating pitch/intensity |
| Combo | Ascending arpeggio |
| Loop unlock | Celebration flourish |
| Wildcard trigger | Dramatic sweep/impact |
| Progress bar fills | Rising tone |
| Max layers reached | Gentle warning |

---

### SETTINGS Screen

```
┌──────────────────────────────────────────────┐
│                 SETTINGS               [X]   │
├──────────────────────────────────────────────┤
│                                              │
│  Master Volume    [===========●===]          │
│                                              │
│  Music Volume     [=========●=====]          │
│                                              │
│  SFX Volume       [=======●=======]          │
│                                              │
└──────────────────────────────────────────────┘
```

BPM and Pitch are controlled in MIX screen, not settings.

---

## Open Questions

1. **Wildcard effect selection:** Random vs deterministic?
2. **Default mode:** Should new players start in Chill or Challenge?
3. **Visual style:** Candy/jewel vs flat/modern vs something else?
4. **Multiplayer:** Future competitive mode? Battle puzzler?

---

## Implementation Phases

### Phase 1: Core Loop
- [ ] SoundscapeEngine with placeholder synth loops
- [ ] Tile system (BEAT/VIBE/MELODY/WILD)
- [ ] Basic cluster detection and collapse
- [ ] Simple piece spawning (2-3 tile shapes)

### Phase 2: Audio Integration
- [ ] Load real loops from Splice/sources
- [ ] Crossfade between loops
- [ ] Global controls (BPM, filter)
- [ ] Wildcard effects

### Phase 3: Progression
- [ ] Resource earning
- [ ] Loop unlock system
- [ ] UI for loop selection
- [ ] Session data capture

### Phase 4: Polish
- [ ] Visual effects (particles, glow, screen shake)
- [ ] Challenge/Chill mode toggle
- [ ] Combo system and feedback
- [ ] Export/share functionality

### Phase 5: Integration
- [ ] BandLab authentication
- [ ] Session export to BandLab
- [ ] Leaderboards
- [ ] Social sharing

---

## Files

- `SONGSUGAR_DESIGN.md` - This document
- `dist/index.html` - Main game (current prototype)
- `dist/audio-preview.html` - Loop preview tool
- `AUDIO_LOOPS_GUIDE.md` - Sourcing reference
- `PIXIJS_COMPREHENSIVE_GUIDE.md` - Rendering reference
