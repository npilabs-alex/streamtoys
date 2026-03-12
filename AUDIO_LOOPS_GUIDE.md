# Comprehensive Guide to High-Quality Audio Loops for Browser Games

## 1. FREESOUND API

### Overview
Freesound is a collaborative database of Creative Commons licensed sounds with over 500,000+ audio samples. The API (v2) provides programmatic access to search, filter, and download sounds.

### Getting Started
1. **Register for API credentials**: [https://freesound.org/apiv2/apply](https://freesound.org/apiv2/apply)
2. **Authentication**: Token-based (simple) or OAuth2 (for user actions)

### JavaScript Integration

**Official Client Library**: [freesound.js on GitHub](https://github.com/g-roma/freesound.js)

**Basic Search Example**:
```javascript
// Using fetch with token authentication
const API_KEY = 'your_api_key';

async function searchLoops(query, bpmMin, bpmMax) {
  const filter = `duration:[1 TO 30] tag:loop`;
  const descriptorsFilter = `rhythm.bpm:[${bpmMin} TO ${bpmMax}]`;

  const response = await fetch(
    `https://freesound.org/apiv2/search/text/?` +
    `query=${encodeURIComponent(query)}&` +
    `filter=${encodeURIComponent(filter)}&` +
    `descriptors_filter=${encodeURIComponent(descriptorsFilter)}&` +
    `token=${API_KEY}`
  );
  return response.json();
}
```

### Search Parameters for SONGSUGAR Categories

| Category | Search Query | Descriptors Filter |
|----------|--------------|-------------------|
| **BEAT** | `drums percussion loop -vocal` | `rhythm.bpm:[113 TO 117]` |
| **VIBE** | `ambient pad atmosphere loop` | `rhythm.bpm:[113 TO 117]` |
| **MELODY** | `melody synth lead loop -drums` | `rhythm.bpm:[113 TO 117]` |

### Advanced Filters

**BPM/Tempo**:
```
descriptors_filter=rhythm.bpm:[119 TO 121]
```

**Musical Key**:
```
descriptors_filter=tonal.key_key:"A" tonal.key_scale:"minor"
```

**License Filtering** (for commercial use):
```
filter=license:"Creative Commons 0"
filter=license:"Attribution"
```

### Licenses on Freesound
- **CC0**: Public domain, no attribution required - BEST for games
- **CC-BY**: Attribution required - GOOD
- **CC-BY-NC**: Non-commercial only - AVOID

---

## 2. FREE SAMPLE PACK SOURCES

### 808 Drums / TR-808

| Source | Content | Link |
|--------|---------|------|
| **Looperman** | 1000+ free 808 loops | [looperman.com/loops/tags/free-808-drum-loops](https://www.looperman.com/loops/tags/free-808-drum-loops-samples-sounds-wavs-download) |
| **Hip Hop Makers** | 1,300+ 808 samples | [hiphopmakers.com/free-808-samples](https://hiphopmakers.com/free-808-samples) |
| **Cymatics** | Oracle pack: 34 free 808s | [cymatics.fm/blogs/production/808-drum-kits](https://cymatics.fm/blogs/production/808-drum-kits) |
| **Samples From Mars** | Classic TR-808 pack | [samplesfrommars.com/products/free-808-from-mars](https://samplesfrommars.com/products/free-808-from-mars) |
| **MusicRadar** | 378 classic 808 samples | [musicradar.com](https://www.musicradar.com/news/sampleradar-378-free-808-drum-samples) |

### Electronic Beats

| Source | Content | Link |
|--------|---------|------|
| **Samplesound** | Tech House/Techno drums, 24-bit | [samplesoundmusic.com/free-techno-samples](https://www.samplesoundmusic.com/collections/free-techno-samples) |
| **Samplephonics** | Tech House drum loops | [samplephonics.com/products/free/tech-house](https://www.samplephonics.com/products/free/tech-house) |
| **Producer Loops** | 100 Minimal/Tech drum samples | [producerloops.com](https://www.producerloops.com/Download-100-Free-Minimal-Tech-Drum-Samples.html) |

### Ambient Pads

| Source | Content | Link |
|--------|---------|------|
| **Looperman** | 5000+ ambient loops | [looperman.com/loops/genres/free-ambient-loops](https://www.looperman.com/loops/genres/free-ambient-loops-samples-sounds-wavs-download) |
| **Samplephonics** | Ambient pads, drones | [samplephonics.com/products/free/ambient](https://www.samplephonics.com/products/free/ambient) |
| **Touch Loops** | 21 pad loops (80-126 BPM) | [touchloops.com/products/beat-delivery-free-pad-samples](https://touchloops.com/products/beat-delivery-free-pad-samples) |

### Melodic Loops

| Source | Content | Link |
|--------|---------|------|
| **Hip Hop Makers** | 1,500+ melody samples | [hiphopmakers.com/best-free-melody-samples](https://hiphopmakers.com/best-free-melody-samples) |
| **Looperman** | 5000+ synth melody loops | [looperman.com/loops/tags/free-synth-melody-loops](https://www.looperman.com/loops/tags/free-synth-melody-loops-samples-sounds-wavs-download) |
| **Unison Audio** | 80+ curated melody loops | [unison.audio/free-melody-loops](https://unison.audio/free-melody-loops/) |

### Record Scratches / Vinyl FX

| Source | Content | Link |
|--------|---------|------|
| **Pixabay** | DJ scratches, vinyl crackle | [pixabay.com/sound-effects/search/scratch](https://pixabay.com/sound-effects/search/scratch/) |
| **Mixkit** | 12 DJ scratch effects | [mixkit.co/free-sound-effects/dj-record-scratch](https://mixkit.co/free-sound-effects/dj-record-scratch/) |
| **Sample Focus** | Vinyl scratch FX | [samplefocus.com](https://samplefocus.com/samples/vinyl-scratch-various-fx) |

### Vintage Electronic / 80s Synths

| Source | Content | Link |
|--------|---------|------|
| **MusicRadar** | 499 samples (DX-7, Fairlight, Prophet V) | [musicradar.com](https://www.musicradar.com/news/sampleradar-free-80s-synth-samples) |
| **Samplephonics** | 80s Synthwave pack | [samplephonics.com/products/free/electro/80s-synthwave-freebie](https://www.samplephonics.com/products/free/electro/80s-synthwave-freebie) |

---

## 3. TECHNICAL REQUIREMENTS

### Audio Format Comparison for Web

| Format | Browser Support | File Size | Best Use |
|--------|-----------------|-----------|----------|
| **OGG Vorbis** | Chrome, Firefox, Opera, Edge | Small | Primary format |
| **MP3** | All browsers | Small | Fallback format |
| **AAC/M4A** | Safari, Chrome, Edge | Small | iOS/Safari |
| **WAV** | All browsers | Large | Short SFX only |

### Recommended Strategy
```javascript
// Provide both OGG and MP3 for maximum compatibility
const sound = new Howl({
  src: ['sound.ogg', 'sound.mp3'], // OGG first, MP3 fallback
  html5: false // Use Web Audio API for lower latency
});
```

### Bitrate Recommendations

| Content Type | Bitrate | Size per minute |
|--------------|---------|-----------------|
| Music/Loops | 128-192 kbps | ~1-1.5 MB |
| Sound Effects | 96-128 kbps | ~0.7-1 MB |
| Ambient | 96 kbps | ~0.7 MB |

### BPM Matching

For SONGSUGAR, all loops should be at **115 BPM** in **C minor** (or relative key).

Using Tone.js for sync:
```javascript
import * as Tone from 'tone';

Tone.Transport.bpm.value = 115;

const loop = new Tone.Player("loop.ogg").toDestination();
loop.sync().start(0);
Tone.Transport.start();
```

### Audio Sprites (Multiple sounds in one file)

```javascript
const effects = new Howl({
  src: ['sprites.ogg', 'sprites.mp3'],
  sprite: {
    kick: [0, 500],
    snare: [1000, 400],
    hihat: [2000, 200]
  }
});

effects.play('kick');
```

---

## 4. LICENSING GUIDE

### Best Licenses for Commercial Web Games

| License | Attribution | Commercial | Use For SONGSUGAR |
|---------|-------------|------------|-------------------|
| **CC0** | No | Yes | BEST |
| **CC-BY** | Yes | Yes | GOOD |
| **Royalty-Free** | Varies | Yes | CHECK TERMS |
| **CC-BY-NC** | Yes | NO | AVOID |
| **CC-BY-SA** | Yes | Yes* | CAUTION |

### Platform License Terms

| Platform | License | Commercial OK |
|----------|---------|---------------|
| **Looperman** | Royalty-free | Yes |
| **Freesound** | CC0/CC-BY/CC-BY-NC | Filter by license |
| **Pixabay** | Pixabay License | Yes |
| **Mixkit** | Mixkit License | Yes |
| **OpenGameArt** | CC0/CC-BY | Mostly yes |

---

## 5. RECOMMENDED APPROACH FOR SONGSUGAR

### Phase 1: Curated Sample Pack
1. Download high-quality loops from Looperman + Freesound (CC0 only)
2. Normalize to 115 BPM, C minor
3. Convert to OGG + MP3
4. Host as static assets

### Phase 2: Dynamic Loading (Future)
1. Integrate Freesound API
2. Let players discover/add loops
3. Cache popular loops
4. BandLab integration for user-created loops

### File Structure
```
/assets/audio/
├── loops/
│   ├── beat/
│   │   ├── afrobeat_drums.ogg
│   │   ├── afrobeat_drums.mp3
│   │   ├── trap_808.ogg
│   │   └── ...
│   ├── vibe/
│   │   ├── ambient_pad.ogg
│   │   └── ...
│   └── melody/
│       ├── piano_riff.ogg
│       └── ...
├── fx/
│   ├── scratch.ogg
│   ├── vinyl_crackle.ogg
│   └── 808_hit.ogg
└── sprites/
    ├── ui_sounds.ogg
    └── ui_sounds.json
```

---

## Sources

- [Freesound API Documentation](https://freesound.org/docs/api/)
- [Freesound.js Client Library](https://github.com/g-roma/freesound.js)
- [Howler.js Documentation](https://howlerjs.com/)
- [Tone.js Framework](https://tonejs.github.io/)
- [Creative Commons License Types](https://creativecommons.org/share-your-work/cclicenses/)
