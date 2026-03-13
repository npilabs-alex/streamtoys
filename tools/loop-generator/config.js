/**
 * SONGSUGAR Loop Pack Generator - Configuration
 *
 * Defines the ontology for generating loops that layer perfectly together.
 * All loops: 115 BPM, C minor, 4 bars (8.35 seconds)
 */

module.exports = {
  // Global audio settings
  audio: {
    bpm: 115,
    key: 'C',
    scale: 'minor',
    bars: 4,
    durationSeconds: (60 / 115) * 4 * 4, // ~8.35 seconds
    format: 'mp3',
    sampleRate: 44100
  },

  // Loop categories matching game ontology
  categories: {
    BEAT: {
      description: 'Drums, percussion, rhythmic foundation',
      color: '#ff2d6e',
      stemTypes: ['drums', 'percussion'],
      loops: [
        {
          id: 'trap_808',
          name: 'TRAP 808',
          prompt: 'trap 808 drum loop, hard hitting kick, rolling hi-hats, snare on 2 and 4, dark aggressive, 115 bpm, C minor, 4 bars, no melody, instrumental only',
          tags: ['trap', '808', 'hard']
        },
        {
          id: 'lofi_dusty',
          name: 'LOFI DUSTY',
          prompt: 'lofi hip hop drum loop, dusty vinyl drums, mellow kick, soft snare, lazy swing feel, 115 bpm, 4 bars, no melody, instrumental only',
          tags: ['lofi', 'chill', 'vinyl']
        },
        {
          id: 'house_groove',
          name: 'HOUSE',
          prompt: 'deep house drum loop, four on the floor kick, offbeat hi-hats, punchy clap, groovy, 115 bpm, 4 bars, no melody, instrumental only',
          tags: ['house', 'dance', 'groove']
        },
        {
          id: 'drill_dark',
          name: 'UK DRILL',
          prompt: 'UK drill drum loop, sliding 808 bass, aggressive hi-hat rolls, dark menacing, 115 bpm, 4 bars, no melody, instrumental only',
          tags: ['drill', 'uk', 'dark']
        },
        {
          id: 'afro_bounce',
          name: 'AFROBEAT',
          prompt: 'afrobeat drum loop, bouncy percussion, shaker, congas, infectious rhythm, 115 bpm, 4 bars, no melody, instrumental only',
          tags: ['afro', 'bounce', 'percussion']
        },
        {
          id: 'rnb_smooth',
          name: 'R&B',
          prompt: 'rnb drum loop, smooth laid back groove, subtle kick, finger snaps, sensual feel, 115 bpm, 4 bars, no melody, instrumental only',
          tags: ['rnb', 'smooth', 'sensual']
        },
        {
          id: 'future_knock',
          name: 'FUTURE',
          prompt: 'future bass drum loop, punchy syncopated drums, heavy sub kick, electronic percussion, 115 bpm, 4 bars, no melody, instrumental only',
          tags: ['future', 'bass', 'electronic']
        },
        {
          id: 'synthwave_kit',
          name: 'SYNTHWAVE',
          prompt: '80s synthwave drum loop, electronic drums, gated reverb snare, retro drum machine, 115 bpm, 4 bars, no melody, instrumental only',
          tags: ['synthwave', '80s', 'retro']
        }
      ]
    },

    VIBE: {
      description: 'Pads, atmosphere, ambient textures',
      color: '#00e5ff',
      stemTypes: ['synth', 'pad', 'strings', 'atmosphere'],
      loops: [
        {
          id: 'lofi_vinyl',
          name: 'VINYL WARM',
          prompt: 'lofi warm pad, vinyl crackle texture, cozy atmospheric synth, C minor chord, nostalgic, 115 bpm, 4 bars, no drums, no melody',
          tags: ['lofi', 'warm', 'vinyl']
        },
        {
          id: 'dark_ambient',
          name: 'DARK CLOUD',
          prompt: 'dark ambient pad, deep evolving drone, mysterious atmosphere, C minor, cinematic tension, 115 bpm, 4 bars, no drums, no melody',
          tags: ['dark', 'ambient', 'cinematic']
        },
        {
          id: 'dream_pad',
          name: 'DREAM PAD',
          prompt: 'dreamy ethereal pad, shimmering synth texture, floating atmosphere, C minor 7, heavenly, 115 bpm, 4 bars, no drums, no melody',
          tags: ['dream', 'ethereal', 'floating']
        },
        {
          id: 'neo_soul',
          name: 'NEO SOUL',
          prompt: 'neo soul rhodes pad, warm electric piano chords, soulful progression, C minor 9, smooth, 115 bpm, 4 bars, no drums',
          tags: ['soul', 'rhodes', 'warm']
        },
        {
          id: 'retro_synth',
          name: 'RETRO',
          prompt: '80s retro synth pad, analog polysynth, lush detuned saw waves, C minor, nostalgic, 115 bpm, 4 bars, no drums, no melody',
          tags: ['retro', '80s', 'analog']
        },
        {
          id: 'strings_lush',
          name: 'STRINGS',
          prompt: 'orchestral string pad, lush cinematic strings, emotional swell, C minor, epic, 115 bpm, 4 bars, no drums, no melody',
          tags: ['strings', 'orchestral', 'cinematic']
        },
        {
          id: 'choir_vox',
          name: 'CHOIR',
          prompt: 'ethereal choir pad, angelic voices, atmospheric vocal texture, C minor, heavenly, 115 bpm, 4 bars, no drums, no melody',
          tags: ['choir', 'vocal', 'ethereal']
        },
        {
          id: 'sub_weight',
          name: 'SUB BASS',
          prompt: 'deep sub bass drone, heavy low end, rumbling foundation, C note, powerful, 115 bpm, 4 bars, no drums, no melody',
          tags: ['sub', 'bass', 'deep']
        }
      ]
    },

    MELODY: {
      description: 'Hooks, leads, melodic lines, arpeggios',
      color: '#39ff14',
      stemTypes: ['melody', 'lead', 'keys', 'guitar'],
      loops: [
        {
          id: 'lofi_keys',
          name: 'LOFI KEYS',
          prompt: 'lofi piano melody, dusty keys, jazzy chords, melancholic hook, C minor, nostalgic, 115 bpm, 4 bars, no drums',
          tags: ['lofi', 'piano', 'jazzy']
        },
        {
          id: 'trap_bells',
          name: 'TRAP BELLS',
          prompt: 'trap bell melody, dark metallic bells, haunting hook, C minor, hard hitting, 115 bpm, 4 bars, no drums',
          tags: ['trap', 'bells', 'dark']
        },
        {
          id: 'synth_pluck',
          name: 'PLUCK',
          prompt: 'synth pluck melody, bright staccato synth, catchy arpeggio, C minor, energetic, 115 bpm, 4 bars, no drums',
          tags: ['pluck', 'synth', 'arpeggio']
        },
        {
          id: 'rnb_rhodes',
          name: 'RHODES',
          prompt: 'rnb rhodes melody, smooth electric piano, soulful chords, C minor 9, sensual, 115 bpm, 4 bars, no drums',
          tags: ['rhodes', 'rnb', 'soulful']
        },
        {
          id: 'guitar_ambient',
          name: 'GUITAR',
          prompt: 'ambient clean guitar, spacey delay, emotional picking, C minor, atmospheric, 115 bpm, 4 bars, no drums',
          tags: ['guitar', 'ambient', 'spacey']
        },
        {
          id: 'saw_lead',
          name: 'SAW LEAD',
          prompt: 'saw wave synth lead, catchy melody line, detuned analog, C minor, powerful, 115 bpm, 4 bars, no drums',
          tags: ['saw', 'lead', 'synth']
        },
        {
          id: 'vocal_chop',
          name: 'VOX CHOP',
          prompt: 'vocal chop melody, chopped and pitched vocals, rhythmic hook, C minor, modern, 115 bpm, 4 bars, no drums',
          tags: ['vocal', 'chop', 'modern']
        },
        {
          id: 'arp_runner',
          name: 'ARPEGGIO',
          prompt: 'synth arpeggio, fast running notes, hypnotic pattern, C minor, energetic, 115 bpm, 4 bars, no drums',
          tags: ['arp', 'synth', 'hypnotic']
        }
      ]
    }
  },

  // Themed packs (curated combinations)
  packs: [
    {
      id: 'starter',
      name: 'Starter Pack',
      description: 'Essential loops to get started',
      loops: ['trap_808', 'lofi_dusty', 'house_groove', 'lofi_vinyl', 'dream_pad', 'dark_ambient', 'lofi_keys', 'trap_bells', 'synth_pluck'],
      unlocked: true
    },
    {
      id: 'lofi_chill',
      name: 'Lofi Chill',
      description: 'Laid back vibes for study and relaxation',
      loops: ['lofi_dusty', 'lofi_vinyl', 'lofi_keys', 'neo_soul', 'rnb_rhodes'],
      theme: { tint: '#d4a574', mood: 'relaxed' }
    },
    {
      id: 'dark_trap',
      name: 'Dark Trap',
      description: 'Hard hitting trap with dark atmosphere',
      loops: ['trap_808', 'drill_dark', 'dark_ambient', 'trap_bells', 'sub_weight'],
      theme: { tint: '#4a0080', mood: 'aggressive' }
    },
    {
      id: 'future_vibes',
      name: 'Future Vibes',
      description: 'Modern electronic sounds',
      loops: ['future_knock', 'dream_pad', 'synth_pluck', 'arp_runner', 'saw_lead'],
      theme: { tint: '#00ffff', mood: 'energetic' }
    },
    {
      id: 'retro_wave',
      name: 'Retro Wave',
      description: '80s inspired synthwave',
      loops: ['synthwave_kit', 'retro_synth', 'saw_lead', 'arp_runner'],
      theme: { tint: '#ff00ff', mood: 'nostalgic' }
    },
    {
      id: 'soul_session',
      name: 'Soul Session',
      description: 'Smooth R&B and neo soul',
      loops: ['rnb_smooth', 'neo_soul', 'rnb_rhodes', 'strings_lush', 'choir_vox'],
      theme: { tint: '#ffd700', mood: 'sensual' }
    },
    {
      id: 'world_fusion',
      name: 'World Fusion',
      description: 'Global rhythms and textures',
      loops: ['afro_bounce', 'lofi_vinyl', 'guitar_ambient', 'choir_vox'],
      theme: { tint: '#ff6b35', mood: 'uplifting' }
    }
  ],

  // API configuration
  api: {
    providers: {
      // Replicate MusicGen - Best working option
      replicate: {
        name: 'Replicate (MusicGen)',
        baseUrl: 'https://api.replicate.com',
        model: 'meta/musicgen',
        keyEnvVar: 'REPLICATE_API_TOKEN'
      },
      // fal.ai - Hosts Beatoven model
      fal: {
        name: 'fal.ai (Beatoven)',
        baseUrl: 'https://queue.fal.run',
        model: 'fal-ai/beatoven/music-generation',
        keyEnvVar: 'FAL_KEY'
      },
      // Mureka AI - Direct API access
      mureka: {
        name: 'Mureka',
        baseUrl: 'https://api.mureka.ai/v1',
        endpoints: {
          generate: '/instrumental/generate',
          status: '/instrumental/query',
          stems: '/stems/generate'
        },
        models: ['V8', 'O2', 'V7.6', 'V7.5'],
        defaultModel: 'V8'
      },
      // Mureka via useapi.net (alternative)
      mureka_useapi: {
        name: 'Mureka (useapi.net)',
        baseUrl: 'https://api.useapi.net/v1/mureka',
        endpoints: {
          generate: '/music/create-instrumental',
          status: '/jobs',
          stems: '/stems'
        }
      },
      // Suno API via third-party providers
      sunoapi: {
        name: 'SunoAPI.info',
        baseUrl: 'https://api.sunoapi.info/api/v1',
        endpoints: {
          generate: '/music/generate',
          status: '/music/status',
          stems: '/music/stems'
        }
      },
      apipass: {
        name: 'APIPASS',
        baseUrl: 'https://api.apipass.io/suno/v1',
        endpoints: {
          generate: '/generate',
          status: '/status',
          stems: '/stems'
        }
      }
    },
    // Default settings
    defaultProvider: 'replicate',
    retryAttempts: 3,
    pollIntervalMs: 5000,
    timeoutMs: 300000 // 5 minutes max wait
  },

  // Output settings
  output: {
    directory: '../../dist/assets/loops',
    formats: ['ogg', 'mp3'],
    naming: '{category}/{id}.{format}',
    metadata: true
  }
};
