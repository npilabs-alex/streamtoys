# DROP CAST: Music Hustle - Game Design Document

## Overview

DROP CAST is a musical puzzle game where players build beats, climb charts, and manage music careers. The core mechanic is a falling-block puzzle where collapsing tile clusters creates and layers music in real-time.

**Core Concept**: The game IS the music. Players wear earphones and literally build a beat as they play.

---

## Game Modes

### 1. BEAT MAKER
**Objective**: Create the best beat (endless)
- Tiles represent sound elements (kick, snare, hi-hat, bass, synth, perc)
- Collapsing clusters adds/layers that sound into the playing track
- Bigger clusters = more complex patterns
- Loop continuously evolves

### 2. CHART MAKER
**Objective**: Reach #1 on the charts (endless)
- Tiles represent music industry elements (streams, fans, visibility)
- Collapse to build stats, climb rankings
- Different special tiles focused on chart mechanics

### 3. CAREER MAKER
**Objective**: Manage releases & distribution (endless)
- Strategic/management focused
- Tiles represent: Singles, Albums, Tours, Merch, Deals, Content
- Long-term progression mechanics

---

## Career Stages (All Modes)

| Stage | Name | Description |
|-------|------|-------------|
| 1 | **BEDROOM** | Just starting, making beats alone |
| 2 | **LOCAL** | Small local following, open mics |
| 3 | **EMERGING** | Getting noticed, first real fans |
| 4 | **ESTABLISHED** | Consistent audience, label interest |
| 5 | **SIGNED** | Major backing, radio play |
| 6 | **ICON** | Cultural impact, legacy status |

---

## Tile Types

### BEAT MAKER Tiles

| Tile | Color | Sound Layer | Collapse Effect |
|------|-------|-------------|-----------------|
| **KICK** | `#ff2d6e` pink | Bass drum | Adds kick pattern to loop |
| **SNARE** | `#00e5ff` cyan | Snare/clap | Adds backbeat |
| **HAT** | `#39ff14` green | Hi-hats | Adds hi-hat rhythm |
| **BASS** | `#c060ff` purple | Bass line | Adds bass groove |
| **SYNTH** | `#ffe600` yellow | Melody/chords | Adds melodic element |
| **PERC** | `#ff8c00` orange | Percussion/FX | Adds fills, shakers, FX |

**Beat Maker Specials:**
- **DROP** - Mutes everything then brings it all back (build-up)
- **FILTER** - Sweeps a filter across the mix
- **CHOP** - Glitches/stutters the current loop
- **DOUBLE** - Doubles the tempo briefly
- **REVERB** - Washes the mix in reverb

---

### CHART MAKER Tiles

| Tile | Color | Stat | Collapse Effect |
|------|-------|------|-----------------|
| **STREAM** | `#00e5ff` cyan | Plays | +Streams |
| **FAN** | `#c060ff` purple | Followers | +Followers |
| **BUZZ** | `#ffe600` yellow | Visibility | +Visibility |
| **PROMO** | `#ff2d6e` pink | Marketing | Multiplies next collapse |
| **PLAYLIST** | `#39ff14` green | Placement | +Streams over time |
| **FEATURE** | `#ff8c00` orange | Collab | Clears matching tiles |

**Chart Maker Specials:**
- **VIRAL** - 3x multiplier
- **RADIO** - Massive visibility spike
- **COSIGN** - Celebrity boost, rank jump
- **SYNC** - TV/Film placement, steady income
- **HEADLINE** - Press coverage, all stats up

---

### CAREER MAKER Tiles

| Tile | Color | Resource | Collapse Effect |
|------|-------|----------|-----------------|
| **SINGLE** | `#00e5ff` cyan | Release | Triggers release cycle |
| **ALBUM** | `#ffd700` gold | Major release | Big stats, long cooldown |
| **TOUR** | `#ff2d6e` pink | Live shows | +Fans, +Money |
| **MERCH** | `#39ff14` green | Products | Passive income |
| **DEAL** | `#c060ff` purple | Contracts | Unlocks opportunities |
| **CONTENT** | `#ff8c00` orange | Social media | +Visibility |

**Career Maker Specials:**
- **SIGNING** - Label deal, resources boost
- **GRAMMY** - Award, prestige unlock
- **RESIDENCY** - Stable income stream
- **FESTIVAL** - Huge exposure event
- **LEGACY** - Catalog value, long-term fans

---

## Music Loop System

```
┌─────────────────────────────────────────────────┐
│  BASE LOOP (selected genre/BPM)                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│  │ Bar │ │ Bar │ │ Bar │ │ Bar │  ← 4-bar loop │
│  │  1  │ │  2  │ │  3  │ │  4  │               │
│  └─────┘ └─────┘ └─────┘ └─────┘               │
└─────────────────────────────────────────────────┘
```

**Layer Intensity by Cluster Size:**

| Size | Intensity | Pattern |
|------|-----------|---------|
| 3 | Basic | Simple 4-on-floor or minimal |
| 4-5 | Standard | Full pattern |
| 6-7 | Complex | Pattern + variations |
| 8+ | Signature | Complex + fills + FX |

Layers stack. Bigger clusters = more complex patterns.
Loop keeps playing and evolves - never resets.

---

## Genre Presets (Player Selects at Start)

| Genre | BPM | Vibe |
|-------|-----|------|
| **Lo-Fi** | 75-85 | Chill, dusty |
| **Boom Bap** | 85-95 | Classic hip-hop |
| **Trap** | 130-150 | Hard, 808s |
| **House** | 120-128 | Four-on-floor |
| **Drill** | 140-145 | Dark, sliding bass |
| **R&B** | 65-80 | Smooth, groovy |

---

## Visual Design

### Tile Appearance
- Candy/jewel style with gradients and highlights
- Glow effect on valid clusters (3+ connected)
- Merged blob rendering for connected clusters
- Particle bursts on collapse

### Board
- Semi-transparent background (55% opacity)
- Background image shows through
- Neon ambient glow effects
- Screen shake on big collapses

### UI Elements
- Combo popups (22px)
- Toast notifications (11px)
- Pressure bar at bottom
- Cluster size badges

---

## Sound Design

### Per-Tile Collapse Sounds (Current)
| Type | Sound |
|------|-------|
| KICK/BEAT | Crunch + deep bass (80Hz→40Hz) |
| SNARE/VOCAL | Bright chord + sparkle arpeggio |
| HAT/FLOW | Triangle wave chord |
| BASS/LABEL | Lush chord |
| SYNTH/HYPE | Square wave chord + sparkles |
| PERC/WILD | Sawtooth sweep |

### Global Events
| Event | Sound |
|-------|-------|
| Piece land | Quick bass thud |
| Rotate | High chirp |
| Invalid tap | Low buzz |
| Pressure row | Deep rumble |
| Level up | Rising melody |
| Game over | Descending minor chord |

---

## Technical Architecture

### Current Stack
- Single HTML file with embedded CSS/JS
- Canvas 2D rendering
- Web Audio API for sound
- No external dependencies in production

### Beat Maker Audio System (To Build)
- Sample-based loop playback
- Per-layer scheduling with Web Audio API
- Quantized triggering (sounds start on beat)
- Real-time mixing of 6 layers
- Filter/effect processing for specials

---

## Development Phases

### Phase 1: Beat Maker Core
- [ ] Genre/BPM selection screen
- [ ] Sample-based audio engine
- [ ] 6-layer loop system
- [ ] Tile → sound layer mapping
- [ ] Cluster size → pattern complexity
- [ ] Basic loop playback

### Phase 2: Beat Maker Polish
- [ ] Special tiles (DROP, FILTER, CHOP, etc.)
- [ ] Visual feedback synced to beat
- [ ] Stage progression
- [ ] High score / best beats

### Phase 3: Chart Maker
- [ ] New tile definitions
- [ ] Chart ranking system
- [ ] Chart-specific specials

### Phase 4: Career Maker
- [ ] New tile definitions
- [ ] Release cycle mechanics
- [ ] Long-term progression
