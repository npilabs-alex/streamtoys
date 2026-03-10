/**
 * Main audio engine using Tone.js
 */

import * as Tone from 'tone';
import { TileType, SpecialType, AnyTileType } from '@/config/tiles';

// Chord definitions for each tile type
const COLLAPSE_CHORDS: Record<string, string[]> = {
  BEAT: ['C2', 'G2'],
  VOCAL: ['C5', 'E5', 'G5', 'C6'],
  FLOW: ['G4', 'B4', 'D5', 'F#5'],
  HYPE: ['A4', 'C#5', 'E5', 'A5'],
  LABEL: ['F4', 'C5', 'E5', 'G5', 'C6'],
  WILD: ['C4', 'E4', 'G4', 'C5'],
  GARBAGE: ['C2'],
};

const SPECIAL_CHORD = ['C5', 'E5', 'G5', 'C6', 'E6'];
const LEVEL_UP_MELODY = ['C4', 'E4', 'G4', 'E4', 'C5', 'E5', 'G5'];
const GAME_OVER_CHORD = ['G4', 'Eb4', 'B3', 'G3'];

export class AudioEngine {
  private initialized = false;
  private initializing = false;
  private master!: Tone.Channel;
  private reverb!: Tone.Reverb;
  private compressor!: Tone.Compressor;

  // Synths for different sound types
  private bassSynth!: Tone.MembraneSynth;
  private padSynth!: Tone.PolySynth;
  private leadSynth!: Tone.PolySynth;
  private noiseSynth!: Tone.NoiseSynth;

  // Effects
  private delay!: Tone.FeedbackDelay;

  async init(): Promise<void> {
    // Audio is lazy-initialized on first user interaction
    // Just mark as ready to accept commands
  }

  private async ensureReady(): Promise<boolean> {
    if (this.initialized) return true;
    if (this.initializing) return false;

    this.initializing = true;

    try {
      await Tone.start();

      // Master chain
      this.compressor = new Tone.Compressor({
        threshold: -12,
        ratio: 4,
        attack: 0.003,
        release: 0.15,
      });

      this.reverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.25,
      });

      this.delay = new Tone.FeedbackDelay({
        delayTime: '8n',
        feedback: 0.2,
        wet: 0.15,
      });

      this.master = new Tone.Channel({ volume: -6 }).chain(
        this.compressor,
        this.reverb,
        Tone.getDestination()
      );

      // Bass synth (BEAT, pressure)
      this.bassSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.001,
          decay: 0.4,
          sustain: 0.01,
          release: 1.4,
        },
      }).connect(this.master);

      // Pad synth (VOCAL, FLOW, LABEL)
      this.padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.02,
          decay: 0.3,
          sustain: 0.2,
          release: 0.8,
        },
      }).connect(this.delay).connect(this.master);

      // Lead synth (HYPE, WILD, specials)
      this.leadSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.1,
          release: 0.5,
        },
      }).connect(this.master);

      // Noise synth (crunch, invalid)
      this.noiseSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0,
        },
      }).connect(this.master);
      this.noiseSynth.volume.value = -12;

      this.initialized = true;
      this.initializing = false;
      return true;
    } catch (e) {
      console.warn('Audio init failed:', e);
      this.initializing = false;
      return false;
    }
  }

  /**
   * Play collapse sound for tile type
   */
  playCollapse(type: AnyTileType, size: number): void {
    if (!this.initialized) {
      this.ensureReady();
      return;
    }

    const velocity = Math.min(1, 0.5 + size * 0.08);
    const duration = '8n';

    switch (type) {
      case 'BEAT':
        this.bassSynth.triggerAttackRelease('C1', '4n', undefined, velocity);
        this.noiseSynth.triggerAttackRelease('16n');
        break;

      case 'VOCAL':
      case 'FLOW':
      case 'LABEL':
        const padChord = COLLAPSE_CHORDS[type] || COLLAPSE_CHORDS.VOCAL;
        this.padSynth.triggerAttackRelease(padChord, '4n', undefined, velocity * 0.7);
        this.playSparkle(3);
        break;

      case 'HYPE':
      case 'WILD':
        const leadChord = COLLAPSE_CHORDS[type] || COLLAPSE_CHORDS.HYPE;
        this.leadSynth.triggerAttackRelease(leadChord, duration, undefined, velocity * 0.5);
        this.playSparkle(4);
        break;

      case 'GARBAGE':
        this.bassSynth.triggerAttackRelease('C1', '16n', undefined, 0.3);
        this.noiseSynth.triggerAttackRelease('32n');
        break;

      default:
        // Special tiles
        this.playSpecial();
        break;
    }
  }

  /**
   * Play sparkle arpeggio
   */
  private playSparkle(count: number): void {
    const notes = ['C5', 'E5', 'G5', 'C6', 'E6'];
    const now = Tone.now();

    for (let i = 0; i < count && i < notes.length; i++) {
      this.leadSynth.triggerAttackRelease(
        notes[i],
        '32n',
        now + i * 0.06,
        0.3
      );
    }
  }

  /**
   * Play special tile activation
   */
  playSpecial(): void {
    if (!this.initialized) {
      this.ensureReady();
      return;
    }

    const now = Tone.now();
    SPECIAL_CHORD.forEach((note, i) => {
      this.padSynth.triggerAttackRelease(note, '4n', now + i * 0.05, 0.6);
    });
    this.playSparkle(5);
  }

  /**
   * Play piece land sound
   */
  playLand(): void {
    if (!this.initialized) {
      this.ensureReady();
      return;
    }

    this.leadSynth.triggerAttackRelease('C4', '32n', undefined, 0.2);
  }

  /**
   * Play piece rotate sound
   */
  playRotate(): void {
    if (!this.initialized) {
      this.ensureReady();
      return;
    }

    this.leadSynth.triggerAttackRelease('G5', '64n', undefined, 0.15);
  }

  /**
   * Play invalid tap sound
   */
  playInvalid(): void {
    if (!this.initialized) {
      this.ensureReady();
      return;
    }

    this.bassSynth.triggerAttackRelease('C2', '16n', undefined, 0.2);
  }

  /**
   * Play pressure warning sound
   */
  playPressureWarning(): void {
    if (!this.initialized) {
      this.ensureReady();
      return;
    }

    this.bassSynth.triggerAttackRelease('C1', '2n', undefined, 0.4);
  }

  /**
   * Play level up melody
   */
  playLevelUp(): void {
    if (!this.initialized) {
      this.ensureReady();
      return;
    }

    const now = Tone.now();
    LEVEL_UP_MELODY.forEach((note, i) => {
      this.padSynth.triggerAttackRelease(note, '8n', now + i * 0.09, 0.5);
    });
  }

  /**
   * Play game over sound
   */
  playGameOver(): void {
    if (!this.initialized) {
      this.ensureReady();
      return;
    }

    const now = Tone.now();
    GAME_OVER_CHORD.forEach((note, i) => {
      this.leadSynth.triggerAttackRelease(note, '2n', now + i * 0.15, 0.4);
    });
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    if (!this.initialized) return;

    const db = volume === 0 ? -Infinity : Tone.gainToDb(volume);
    this.master.volume.value = db;
  }

  /**
   * Mute/unmute
   */
  setMuted(muted: boolean): void {
    if (!this.initialized) return;

    this.master.mute = muted;
  }

  /**
   * Clean up
   */
  dispose(): void {
    if (!this.initialized) return;

    this.bassSynth.dispose();
    this.padSynth.dispose();
    this.leadSynth.dispose();
    this.noiseSynth.dispose();
    this.reverb.dispose();
    this.compressor.dispose();
    this.delay.dispose();
    this.master.dispose();

    this.initialized = false;
  }
}
