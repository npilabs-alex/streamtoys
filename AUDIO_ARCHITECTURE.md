# SongSugar Audio Architecture

## Overview

SongSugar uses **Tone.js** (v14.8.49) for all audio synthesis and sequencing. There are no audio files - all sounds are generated in real-time using synthesizers. The system is designed around three core categories of sound that players can layer together to create music while playing.

**Key constraint:** All loops are in **C minor at 115 BPM** so they harmonize automatically when layered.

---

## The Three Categories (Ontology)

### 1. BEAT (Rhythm Layer)
- **Purpose:** Provides the rhythmic foundation - kicks, percussion, groove
- **Implementation:** `MembraneSynth` for kicks, `MetalSynth`/`NoiseSynth` for percussion
- **Max slots:** 2 concurrent beats
- **Available loops (13 total):**
  - trap_808, lofi_dusty, house_groove, drill_dark, afro_bounce
  - rnb_smooth, future_knock, synthwave_kit, chip_beat
  - tropical_bounce, ambient_pulse, acid_drive, jazz_swing

**How BEAT works:**
- Each beat has a **kick pattern** (16-step array of notes like `['C1',null,'C1',...]`)
- Each beat also has **percussion patterns** stored as strings like `'x-x-x-x-'`
- Percussion types: `hh` (hi-hat), `oh` (open hat), `sn` (snare), `cl` (clap), `rm` (rim), `sh` (shaker)

### 2. VIBE (Effects Layer)
- **Purpose:** NOT melodic content - these are audio EFFECTS applied to the entire mix
- **Implementation:** Tone.js effect nodes (Reverb, Delay, Filter, etc.)
- **Max slots:** 3 concurrent effects
- **Available effects (6 total):**
  - `reverb_hall` - Hall reverb (decay: 2.0s)
  - `delay_echo` - PingPong delay (8th note, 30% feedback)
  - `filter_sweep` - AutoFilter modulation
  - `lofi_dust` - BitCrusher (8-bit)
  - `chorus_wide` - Stereo chorus
  - `distort_warm` - Warm distortion

**How VIBE works:**
- Unlike BEAT/MELODY, VIBE has **no patterns** - these are real-time effects
- When activated: `musicBus -> effect node -> masterBus`
- Effects fade in/out with `wet.rampTo()` over 0.3-0.5 seconds

### 3. MELODY (Harmonic Layer)
- **Purpose:** Melodic content - hooks, leads, chords, arpeggios
- **Implementation:** `MonoSynth` instances with various oscillator types
- **Max slots:** 1 melody at a time (to avoid harmonic clashes)
- **Available melodies (13 total):**
  - lofi_keys, trap_bells, synth_pluck, rnb_rhodes, guitar_ambient
  - saw_lead, vocal_chop, arp_runner, chip_arp, steel_drum
  - ambient_shimmer, acid_303, jazz_sax

**How MELODY works:**
- Each melody has a 16-step pattern array
- Patterns contain single notes (`'C5'`) or chord arrays (`['C4','Eb4','G4']`)
- Synths are MonoSynth so only one note plays at a time (chords play first note only)
- All melodies connect to both `melodyBus` AND `reverbSend` for spatial depth

---

## Audio Signal Flow

```
[BEAT Synths] -----> [beatBus (Gain)]
                            |
                            v
[MELODY Synths] ---> [melodyBus (Gain)] ---> [musicBus] ---> [masterFilter] ---> [masterComp] ---> [limiter] ---> [destination]
       |                    |                     ^
       +---> [reverbSend] --+                     |
                            |                     |
[VIBE Effects] -------------+--- (parallel path) -+
                            |
[effectsGain] <-------------+

[SFX Synths] ---> [toDestination()] (bypasses all buses for low latency)
```

**Bus Hierarchy:**
- `masterBus` (gain: 0.85) - Final output level
- `musicBus` (gain: 0.8) - All music content
- `sfxBus` (gain: 0.9) - Game sound effects (separate path)
- `beatBus` / `melodyBus` - Per-category volume control

**Master Chain:**
1. `masterFilter` - Low-pass filter (200Hz to 20kHz sweep)
2. `masterComp` - Compressor (threshold: -18dB, ratio: 4:1)
3. `limiter` - Limiter at -0.5dB

---

## Loop Playback System

### Starting a Loop (`startLoop(cat, id)`)

1. **Slot check:** Verify category hasn't hit max slots (BEAT:2, MELODY:1, VIBE:3)
2. **Duplicate check:** Prevent same loop from starting twice
3. **Intro stop:** First real loop stops the intro pad
4. **Quantized start:** All loops start at `"@1m"` (next measure boundary) for sync

**For BEAT:**
```javascript
const kickSeq = new Tone.Sequence((t, n) => {
  kickSynth.triggerAttackRelease(n, '8n', t);
}, pattern, '16n');
kickSeq.start("@1m");
```
- Kick plays the pattern notes
- Percussion patterns parsed from strings ('x' = hit, '-' = rest)

**For MELODY:**
```javascript
const seq = new Tone.Sequence((t, n) => {
  synth.triggerAttackRelease(note, '16n', t, velocity);
}, pattern, '16n');
seq.start("@1m");
```
- Velocity humanization via accent pattern: `[0.75, 0.55, 0.65, 0.5]`
- Random velocity variation: `+/- 0.05`

**For VIBE:**
- No sequence - creates effect node on demand
- Connects `musicBus -> effect -> masterBus`
- Fades in wet amount over 0.5s

### Stopping a Loop (`stopLoop(cat, id)`)

1. Find slot by ID
2. Stop, clear, and dispose all sequences
3. Remove from slots array
4. For VIBE: fade out effect wet to 0
5. For BEAT/MELODY: release any held notes
6. Call `_autoGainStage()` to rebalance levels

### Auto Gain Staging

When multiple loops are active, the system ducks the overall level to prevent clipping:
```javascript
const duckFactor = 0.12; // 12% reduction per loop
const gainMultiplier = 1 / (1 + (totalLoops - 1) * duckFactor);
musicBus.gain.rampTo(0.8 * gainMultiplier, 0.1);
```

---

## User Controls (MIX Screen)

### BPM (80-140)
- `Audio.setBPM(bpm)`
- Uses `Tone.Transport.bpm.rampTo()` for smooth transitions
- Default: 115

### Pitch (-12 to +12 semitones)
- `Audio.setPitch(semitones)`
- Applies detune in cents to all synths
- For MetalSynth (hi-hats): scales frequency instead
- Noise synths unaffected (no pitch)

### Volume Mix (per category, 0-1)
- `Audio.setMix(cat, level)`
- Controls gain on category bus
- Default: BEAT=0.8, VIBE=0.7, MELODY=0.8

### Filter (0-1)
- `Audio.setFilter(level)`
- Master low-pass sweep
- Exponential mapping: 0 = 200Hz, 1 = 20kHz
- Default: 1.0 (wide open)

### Effects/Reverb (0-1)
- `Audio.setEffects(level)`
- Controls wet amount for reverb send
- Default: 0.5

---

## SFX System (Game Sounds)

SFX bypass all buses and connect directly to destination for zero latency.

**SFX Synths:**
- `membrane` - MembraneSynth for kicks/thuds
- `bell` - PolySynth for chimes/tones
- `pluck` - PluckSynth for plucks
- `noise` - NoiseSynth for whooshes
- `metal` - MetalSynth for shimmers
- `poly` - PolySynth for chords
- `click` - Synth for tiny clicks

**SFX Events:**
| Event | Method | Sound |
|-------|--------|-------|
| Tile lands | `playLand()` | Soft kick C1 |
| Rotate | `playRotate()` | White noise whoosh |
| Hard drop | `playDrop()` | Punchy kick C1 |
| Move | `playMove()` | Tiny click G5 |
| Collapse (BEAT) | `playCollapse('BEAT')` | Drum hit C2 |
| Collapse (VIBE) | `playCollapse('VIBE')` | Bell chord Eb-G-Bb |
| Collapse (MELODY) | `playCollapse('MELODY')` | Bell chord B-D#-F# |
| Combo | `playCombo(n)` | Ascending C minor scale |
| Big cluster (5+) | `playBigCluster()` | C minor chord stab |
| Massive (7+) | `playMassive()` | Crash + drum roll |
| Bomb tile | `playBomb()` | Noise + deep kick |
| Freeze tile | `playFreeze()` | Metal + bells |
| Shuffle tile | `playShuffle()` | Rapid noise bursts |
| Double tile | `playDouble()` | Two-note ding |
| Social tile | `playSocial()` | Fanfare chord |
| Danger zone | `playDanger()` | Heartbeat pulse |
| Game over | `playGameOver()` | Descending drums |

---

## Intro Loop

A gentle ambient pad plays when a session starts, before the user activates any loops:
- PolySynth playing `['C2', 'G2']` (C minor root + fifth)
- Loops every measure (`'1m'`)
- Volume: -14dB (very quiet)
- Stops automatically when first real loop is started

---

## Known Issues / Areas to Fix

1. **MELODY MonoSynth + Chords:** Patterns can contain chord arrays like `['C4','Eb4','G4']` but MonoSynth only plays one note. The code does `Array.isArray(n) ? n[0] : n` which plays only the first note of chords.

2. **MELODY_HARMONY patterns exist but are never used:** There's a `patterns.MELODY_HARMONY` object defined but the `startLoop` function doesn't reference it.

3. **No VIBE bus:** Code comment says "VIBE is effects now, no vibeBus needed" - the VIBE category bypasses the bus system entirely.

4. **Placeholder methods:** `_makePad()`, `_makePadFM()`, `_makeMelodyFM()`, `_makePluck()`, `_makeLead()` all return null - leftover from refactoring.

5. **Warmup disabled:** `_warmupSFX()` is empty ("Skip warmup to avoid any audible sounds at start") which may cause latency on first SFX trigger.

---

## Pattern Format Reference

**BEAT kick patterns (16 steps):**
```javascript
['C1', null, 'C1', null, 'G0', null, 'C1', 'C1', null, 'C1', null, null, 'G0', null, 'C1', null]
```

**BEAT percussion patterns (16 chars):**
```javascript
{ hh: 'x-x-x-x-x-x-x-x-', sn: '----x-------x---', oh: '------x-------x-' }
```

**MELODY patterns (16 steps, can have chords):**
```javascript
[['C4','Eb4'], null, ['G4','Bb4'], null, ['F4','Ab4'], null, ...]
// or single notes:
['G5', null, 'Eb5', null, 'C5', null, null, 'D5', ...]
```

---

## Timing

- BPM: 115 (adjustable 80-140)
- Transport resolution: 16th notes (`'16n'`)
- Loop length: 1 bar (16 steps at 16n = 4 beats)
- Loop sync: All loops quantized to `"@1m"` (next measure)
- Latency settings: `lookAhead: 0.05`, `updateInterval: 0.03`
