// ============================================================
// SOUNDGARDEN — shared creature rendering primitives
// Used by showcase.html, us.html, (landing.html imports palettes only)
// ============================================================

function pal(primary, secondary, glowRgb) {
  return { primary, secondary, glowRgb };
}

// Six musical STATES. Palettes use BandLab brand colours only.
// Brand hues: red #f12c18, orange #ff690d, yellow #fcc931, green #00c37d,
// cyan #29dbe5, blue #2f93f6, purple #b400ff, cool-grey #e1e0de.
const BIOMES = [
  {
    id: 'drift', index: '01 / 06', name: 'Drift', subname: 'the slow breath',
    genre: 'Ambient · Lo-fi · Downtempo', genreColor: '#29dbe5',
    desc: 'Music that arrives by accident. Drift creatures move on a forty-second cycle and blink once a minute. They are the first thing a new visitor meets — the reason they stay.',
    archetypes: [
      { name: 'Drifter', body: 'bell', eyes: 1, eyeSize: 0.22, tentacles: 4, limbStyle: 'strand', palette: pal('#29dbe5','#2f93f6','41,219,229') },
      { name: 'Polyp',   body: 'dome', eyes: 3, eyeSize: 0.11, tentacles: 5, limbStyle: 'curl',   palette: pal('#2f93f6','#b400ff','47,147,246') },
    ],
    tint: { r: 41, g: 219, b: 229, strength: 0.06 },
    attrs: { motion: 'slow drift · 40s cycle', blink: 'once per minute', gaze: 'long stare' }
  },
  {
    id: 'pulse', index: '02 / 06', name: 'Pulse', subname: 'the body remembers',
    genre: 'Hip-hop · Afrobeat · Drum &amp; Bass', genreColor: '#ff690d',
    desc: 'Music that asks your body a question. Pulse creatures contract on every kick drum and their eyes widen on the snare. They travel in pairs and cannot resist a crowd.',
    archetypes: [
      { name: 'Thumper',   body: 'round', eyes: 2, eyeSize: 0.17, tentacles: 3, limbStyle: 'short', palette: pal('#ff690d','#fcc931','255,105,13') },
      { name: 'Skitterer', body: 'long',  eyes: 5, eyeSize: 0.08, tentacles: 6, limbStyle: 'twig',  palette: pal('#f12c18','#ff690d','241,44,24') },
    ],
    tint: { r: 255, g: 105, b: 13, strength: 0.06 },
    attrs: { motion: 'on-beat contract', blink: 'on snare', gaze: 'darting' }
  },
  {
    id: 'fracture', index: '03 / 06', name: 'Fracture', subname: 'the broken thing',
    genre: 'Rock · Metal · Noise · Hardcore', genreColor: '#f12c18',
    desc: 'Music that wants to be heard from the next hill over. Fracture creatures are half-built and half-broken — jagged, asymmetric, intentional. Their one great eye never blinks.',
    archetypes: [
      { name: 'Maw',    body: 'jagged', eyes: 1, eyeSize: 0.28, tentacles: 6, limbStyle: 'spike', palette: pal('#f12c18','#b400ff','241,44,24') },
      { name: 'Cinder', body: 'shard',  eyes: 4, eyeSize: 0.09, tentacles: 4, limbStyle: 'spike', palette: pal('#b400ff','#f12c18','180,0,255') },
    ],
    tint: { r: 241, g: 44, b: 24, strength: 0.06 },
    attrs: { motion: 'sharp twitch', blink: 'never', gaze: 'defiant' }
  },
  {
    id: 'swing', index: '04 / 06', name: 'Swing', subname: 'the loose one',
    genre: 'Jazz · Soul · Blues · Funk', genreColor: '#fcc931',
    desc: 'Music that doesn\'t sit up straight. Swing creatures are always on the off-beat — they sway slightly ahead or slightly behind, never on. They have one eye that\'s always half-closed, like they know something you don\'t.',
    archetypes: [
      { name: 'Crooner', body: 'tall',   eyes: 2, eyeSize: 0.15, tentacles: 3, limbStyle: 'stem', palette: pal('#fcc931','#ff690d','252,201,49') },
      { name: 'Ring',    body: 'ribbon', eyes: 4, eyeSize: 0.1,  tentacles: 0, limbStyle: 'none', palette: pal('#ff690d','#fcc931','255,105,13') },
    ],
    tint: { r: 252, g: 201, b: 49, strength: 0.05 },
    attrs: { motion: 'off-beat sway', blink: 'half-lidded', gaze: 'knowing' }
  },
  {
    id: 'hush', index: '05 / 06', name: 'Hush', subname: 'the listening place',
    genre: 'Classical · Minimal · Drone', genreColor: '#2f93f6',
    desc: 'Music that you have to reach for. Hush creatures barely move. Their eyes are the brightest thing in Soundgarden — huge, slow, and deliberate. It is the only region where a single organism can fill an entire screen.',
    archetypes: [
      { name: 'Lantern', body: 'lantern', eyes: 1, eyeSize: 0.35, tentacles: 2, limbStyle: 'drape', palette: pal('#2f93f6','#29dbe5','47,147,246') },
      { name: 'Choir',   body: 'tall',    eyes: 6, eyeSize: 0.08, tentacles: 0, limbStyle: 'none',  palette: pal('#c2d7f2','#2f93f6','194,215,242') },
    ],
    tint: { r: 47, g: 147, b: 246, strength: 0.05 },
    attrs: { motion: 'near still', blink: 'once per hour', gaze: 'witnessing' }
  },
  {
    id: 'grid', index: '06 / 06', name: 'Grid', subname: 'the machine that dreams',
    genre: 'Electronic · Techno · Synthwave', genreColor: '#b400ff',
    desc: 'Music that admits it is code. Grid creatures are step-sequenced — they move in quantised increments, never between. Their eyes are segmented displays that flicker through readouts. This is where Soundgarden reveals its skeleton.',
    archetypes: [
      { name: 'Pixel', body: 'cube',  eyes: 2, eyeSize: 0.14, tentacles: 0, limbStyle: 'none', palette: pal('#b400ff','#29dbe5','180,0,255') },
      { name: 'Swarm', body: 'swarm', eyes: 7, eyeSize: 0.06, tentacles: 0, limbStyle: 'link', palette: pal('#29dbe5','#b400ff','41,219,229') },
    ],
    tint: { r: 180, g: 0, b: 255, strength: 0.05 },
    attrs: { motion: 'step-sequenced', blink: 'on 16th notes', gaze: 'scanning' }
  },
];

const STAGES = [
  { key: 'seed',    sizeMul: 0.18, bodyPoints: 6,  wobble: 0.04, limbs: 0,   rings: 0, particles: 0,  eyesOpen: 0,    glowMul: 0.35, satellites: 0, veins: 0 },
  { key: 'sprout',  sizeMul: 0.40, bodyPoints: 10, wobble: 0.08, limbs: 1,   rings: 1, particles: 4,  eyesOpen: 0.25, glowMul: 0.6,  satellites: 0, veins: 0 },
  { key: 'bloom',   sizeMul: 0.72, bodyPoints: 14, wobble: 0.11, limbs: 1.0, rings: 2, particles: 14, eyesOpen: 1,    glowMul: 0.9,  satellites: 0, veins: 0.3 },
  { key: 'ancient', sizeMul: 1.0,  bodyPoints: 20, wobble: 0.14, limbs: 1.4, rings: 3, particles: 22, eyesOpen: 1,    glowMul: 1.0,  satellites: 4, veins: 0.7 },
];

function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

// Subtle BandLab-style dot grid — replaces starfield. Feels like
// registration marks on editorial print, not a nebula.
function drawBlDots(ctx, w, h) {
  const sp = 48;
  ctx.fillStyle = 'rgba(194,215,242,0.055)';
  for (let x = sp; x < w; x += sp) {
    for (let y = sp; y < h; y += sp) {
      ctx.beginPath(); ctx.arc(x, y, 0.85, 0, Math.PI*2); ctx.fill();
    }
  }
}

// Legacy name kept for compat but now no-op (nothing uses stars).
function drawStars() {}

function drawCosmicBg(ctx, w, h, biome, t) {
  // true-black base
  ctx.fillStyle = '#010101';
  ctx.fillRect(0, 0, w, h);

  // biome tint wash — top-center, brand colour
  if (biome && biome.tint) {
    const tn = biome.tint;
    const wash = ctx.createRadialGradient(w*0.5, h*0.25, 0, w*0.5, h*0.25, Math.max(w,h)*0.95);
    wash.addColorStop(0, `rgba(${tn.r},${tn.g},${tn.b},${tn.strength})`);
    wash.addColorStop(0.5, `rgba(${tn.r},${tn.g},${tn.b},${tn.strength*0.25})`);
    wash.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);
  }

  drawBlDots(ctx, w, h);

  // vignette
  const vig = ctx.createRadialGradient(w/2, h/2, h*0.4, w/2, h/2, h*1.05);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

// ============================================================
// CREATURE
// ============================================================

// Recolour helper for user-controlled hue / fork inheritance.
// If archetype has `paletteOverride`, use that instead of default.
function effectivePalette(arch) {
  return arch.paletteOverride || arch.palette;
}

function drawCreature(ctx, cx, cy, archetype, stageIdx, biome, t, seed) {
  const S = STAGES[stageIdx];
  const baseSize = (archetype.sizeScale || 1) * 90 * S.sizeMul;
  const palette = effectivePalette(archetype);
  const { body, eyes, eyeSize, tentacles, limbStyle } = archetype;
  const phase = seed * 1.7;

  ctx.save();
  ctx.translate(cx, cy);

  if (stageIdx === 3) ctx.rotate((hash(seed, 91) - 0.5) * 0.18);

  const pulse = Math.sin(t * (0.6 + (seed%5)*0.1) + phase) * 0.5 + 0.5;
  const breathe = 1 + pulse * 0.06 + (stageIdx === 3 ? 0.02 : 0);
  const size = baseSize * breathe;

  if (stageIdx === 3) {
    ctx.save();
    ctx.strokeStyle = `rgba(${palette.glowRgb},0.14)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const a = (i/7) * Math.PI * 2 + phase;
      ctx.beginPath();
      ctx.moveTo(0, size*0.3);
      for (let j = 1; j <= 14; j++) {
        const r = j * size * 0.18;
        const lx = Math.cos(a)*r + Math.sin(t*0.4 + i + j*0.3)*6;
        const ly = size*0.3 + Math.sin(a)*r*0.35;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  const haloR = size * (2.4 + stageIdx * 0.5);
  const halo = ctx.createRadialGradient(0, 0, size*0.3, 0, 0, haloR);
  halo.addColorStop(0, `rgba(${palette.glowRgb},${0.22 * S.glowMul})`);
  halo.addColorStop(0.5, `rgba(${palette.glowRgb},${0.05 * S.glowMul})`);
  halo.addColorStop(1, `rgba(${palette.glowRgb},0)`);
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(0, 0, haloR, 0, Math.PI*2); ctx.fill();

  for (let i = 0; i < S.rings; i++) {
    const ringT = ((t * 0.4 + i / S.rings + seed*0.1) % 1);
    const rr = size * (1 + ringT * (2.2 + stageIdx*0.5));
    ctx.strokeStyle = `rgba(${palette.glowRgb},${(1-ringT)*0.4 * S.glowMul})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI*2); ctx.stroke();
  }

  const limbN = Math.round(tentacles * S.limbs);
  if (limbN > 0 && limbStyle !== 'none') {
    drawLimbs(ctx, size, limbN, limbStyle, t, seed, palette, stageIdx, S);
  }

  drawBody(ctx, size, body, S, t, phase, palette, stageIdx, seed);

  const numEyes = Math.max(1, eyes + (stageIdx === 3 ? 2 : 0));
  drawEyes(ctx, size, body, numEyes, eyeSize, S, t, phase, palette, stageIdx, seed);

  for (let i = 0; i < S.particles; i++) {
    const a = (i / Math.max(S.particles,1)) * Math.PI * 2 + t * 0.4 + phase;
    const r = size * (1.1 + Math.sin(t*1.2 + i*0.7) * 0.3);
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r - size*0.15;
    const alpha = 0.4 + Math.sin(t*2 + i) * 0.3;
    ctx.fillStyle = `rgba(${palette.glowRgb},${alpha * S.glowMul})`;
    ctx.beginPath(); ctx.arc(px, py, 1.1, 0, Math.PI*2); ctx.fill();
  }

  if (S.satellites > 0) {
    for (let i = 0; i < S.satellites; i++) {
      const a = (i / S.satellites) * Math.PI * 2 + t * 0.15 + phase;
      const orbit = size * 1.75;
      const sx = Math.cos(a) * orbit;
      const sy = Math.sin(a) * orbit * 0.8;
      const sr = size * 0.14;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
      g.addColorStop(0, `rgba(${palette.glowRgb},0.9)`);
      g.addColorStop(1, `rgba(${palette.glowRgb},0.1)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI*2); ctx.fill();
      drawSingleEye(ctx, sx, sy, sr*0.55, palette, 1, Math.sin(t*0.5+i), Math.cos(t*0.5+i));
    }
  }

  ctx.restore();
}

function drawBody(ctx, size, shape, S, t, phase, palette, stageIdx, seed) {
  ctx.save();
  const pts = S.bodyPoints;
  let path = [];

  if (['round','bell','dome','lantern','tall','long'].includes(shape)) {
    const w = (shape === 'long' ? 1.4 : shape === 'tall' ? 0.7 : shape === 'lantern' ? 0.85 : 1) * size;
    const hh = (shape === 'tall' ? 1.3 : shape === 'long' ? 0.6 : shape === 'bell' ? 1.05 : shape === 'dome' ? 0.75 : 1) * size;
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const wob = 1 + Math.sin(t*0.8 + a*3 + phase) * S.wobble;
      const asym = stageIdx === 3 ? (Math.sin(a*2 + seed) * 0.09) : 0;
      path.push([Math.cos(a) * w * wob * (1 + asym), Math.sin(a) * hh * wob]);
    }
  } else if (shape === 'jagged' || shape === 'shard') {
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const spike = (i % 2 === 0 ? 1.15 : 0.75) + Math.sin(t + a*4) * 0.08;
      const asym = stageIdx === 3 ? (Math.sin(a*2 + seed) * 0.1) : 0;
      path.push([Math.cos(a) * size * spike * (1+asym), Math.sin(a) * size * spike * 0.85]);
    }
  } else if (shape === 'ribbon') {
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const wob = 1 + Math.sin(t*0.8 + a*2 + phase) * S.wobble;
      path.push([Math.cos(a) * size * 1.3 * wob, Math.sin(a) * size * 0.35 * wob]);
    }
  } else if (shape === 'cube') {
    drawCubeBody(ctx, size, S, t, phase, palette, stageIdx);
    ctx.restore(); return;
  } else if (shape === 'swarm') {
    drawSwarmBody(ctx, size, S, t, phase, palette, stageIdx, seed);
    ctx.restore(); return;
  } else {
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      path.push([Math.cos(a)*size, Math.sin(a)*size]);
    }
  }

  ctx.beginPath();
  ctx.moveTo(path[0][0], path[0][1]);
  for (let i = 1; i < path.length; i++) {
    const prev = path[i-1], cur = path[i];
    const cpx = (prev[0] + cur[0]) * 0.5;
    const cpy = (prev[1] + cur[1]) * 0.5;
    ctx.quadraticCurveTo(prev[0], prev[1], cpx, cpy);
  }
  ctx.closePath();

  const bg = ctx.createRadialGradient(-size*0.2, -size*0.25, 0, 0, 0, size*1.2);
  bg.addColorStop(0, palette.primary + 'dd');
  bg.addColorStop(0.55, palette.secondary + '99');
  bg.addColorStop(1, `rgba(${palette.glowRgb},0)`);
  ctx.fillStyle = bg;
  ctx.fill();

  const hl = ctx.createRadialGradient(-size*0.18, -size*0.22, 0, -size*0.1, -size*0.15, size*0.7);
  hl.addColorStop(0, 'rgba(255,255,255,0.35)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.fill();

  if (S.veins > 0) {
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = `rgba(${palette.glowRgb},${S.veins * 0.4})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const a1 = (i / 5) * Math.PI * 2 + seed;
      const a2 = a1 + 0.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a1)*size*0.9, Math.sin(a1)*size*0.9);
      ctx.quadraticCurveTo(Math.sin(t+i)*size*0.2, Math.cos(t+i)*size*0.2,
                            Math.cos(a2)*size*0.9, Math.sin(a2)*size*0.9);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawCubeBody(ctx, size, S, t, phase, palette, stageIdx) {
  const s = size * 0.7;
  const rot = Math.sin(t*0.3 + phase) * 0.08;
  ctx.save();
  ctx.rotate(rot);
  ctx.fillStyle = palette.primary + 'cc';
  ctx.beginPath();
  ctx.moveTo(-s, -s); ctx.lineTo(-s + s*0.32, -s - s*0.32);
  ctx.lineTo(s + s*0.32, -s - s*0.32); ctx.lineTo(s, -s);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = palette.secondary + 'cc';
  ctx.beginPath();
  ctx.moveTo(s, -s); ctx.lineTo(s + s*0.32, -s - s*0.32);
  ctx.lineTo(s + s*0.32, s - s*0.32); ctx.lineTo(s, s);
  ctx.closePath(); ctx.fill();
  const fg = ctx.createLinearGradient(-s, -s, s, s);
  fg.addColorStop(0, palette.primary + 'ee');
  fg.addColorStop(1, palette.secondary + 'aa');
  ctx.fillStyle = fg;
  ctx.fillRect(-s, -s, s*2, s*2);
  ctx.strokeStyle = `rgba(${palette.glowRgb},0.9)`;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-s, -s, s*2, s*2);
  if (S.veins > 0) {
    ctx.strokeStyle = `rgba(${palette.glowRgb},${0.4 + Math.sin(t*3)*0.2})`;
    for (let i = 1; i < 3; i++) {
      const x = -s + (i/3)*s*2;
      ctx.beginPath(); ctx.moveTo(x, -s); ctx.lineTo(x, s); ctx.stroke();
      const y = -s + (i/3)*s*2;
      ctx.beginPath(); ctx.moveTo(-s, y); ctx.lineTo(s, y); ctx.stroke();
    }
  }
  ctx.restore();
}

function drawSwarmBody(ctx, size, S, t, phase, palette, stageIdx, seed) {
  const N = 6 + Math.floor(S.bodyPoints);
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + phase + t * 0.15;
    const r = size * (0.4 + Math.sin(t*0.8 + i*1.3 + seed)*0.4);
    nodes.push([Math.cos(a)*r, Math.sin(a)*r*0.85]);
  }
  ctx.strokeStyle = `rgba(${palette.glowRgb},0.35)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i+1; j < nodes.length; j++) {
      const dx = nodes[i][0] - nodes[j][0], dy = nodes[i][1] - nodes[j][1];
      const d2 = dx*dx + dy*dy;
      const thresh = size*size*0.5;
      if (d2 < thresh) {
        ctx.globalAlpha = (1 - d2/thresh) * 0.6;
        ctx.beginPath();
        ctx.moveTo(nodes[i][0], nodes[i][1]);
        ctx.lineTo(nodes[j][0], nodes[j][1]);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < nodes.length; i++) {
    const g = ctx.createRadialGradient(nodes[i][0], nodes[i][1], 0, nodes[i][0], nodes[i][1], size*0.12);
    g.addColorStop(0, `rgba(${palette.glowRgb},1)`);
    g.addColorStop(1, `rgba(${palette.glowRgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(nodes[i][0], nodes[i][1], size*0.12, 0, Math.PI*2); ctx.fill();
  }
  drawSwarmBody._nodes = nodes;
}

function drawLimbs(ctx, size, count, style, t, seed, palette, stageIdx, S) {
  ctx.save();
  ctx.strokeStyle = `rgba(${palette.glowRgb},0.55)`;
  ctx.lineWidth = 1.3 + stageIdx * 0.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const base = (i / count - 0.5) * Math.PI * 1.4 + Math.PI/2;
    const sway = Math.sin(t*0.8 + i + seed) * 0.25;
    const a = base + sway;
    const len = size * (1.2 + (stageIdx*0.2) + (stageIdx === 3 ? (hash(seed,i)-0.5)*0.4 : 0));
    const x0 = Math.cos(a - Math.PI/2) * size * 0.4;
    const y0 = Math.sin(a - Math.PI/2) * size * 0.4 + size*0.1;

    if (style === 'strand' || style === 'drape') {
      ctx.beginPath(); ctx.moveTo(x0, y0);
      for (let j = 1; j <= 12; j++) {
        const tj = j/12;
        const wob = Math.sin(t*1.2 + i + j*0.5) * 8 * tj;
        ctx.lineTo(x0 + wob, y0 + tj * len);
      }
      ctx.stroke();
      ctx.fillStyle = `rgba(${palette.glowRgb},0.9)`;
      ctx.beginPath(); ctx.arc(x0, y0 + len, 2, 0, Math.PI*2); ctx.fill();
    } else if (style === 'curl') {
      ctx.beginPath(); ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(
        Math.cos(a)*len*0.6 + Math.sin(t+i)*6,
        Math.sin(a)*len*0.6,
        Math.cos(a)*len, Math.sin(a)*len);
      ctx.stroke();
    } else if (style === 'spike') {
      ctx.beginPath(); ctx.moveTo(x0, y0);
      ctx.lineTo(Math.cos(a)*len*0.8, Math.sin(a)*len*0.8);
      ctx.stroke();
      const bx = Math.cos(a)*len*0.8, by = Math.sin(a)*len*0.8;
      ctx.fillStyle = `rgba(${palette.glowRgb},0.8)`;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a+0.4)*8, by + Math.sin(a+0.4)*8);
      ctx.lineTo(bx + Math.cos(a-0.4)*8, by + Math.sin(a-0.4)*8);
      ctx.closePath(); ctx.fill();
    } else if (style === 'short' || style === 'twig' || style === 'stem') {
      ctx.beginPath(); ctx.moveTo(x0, y0);
      const mx = Math.cos(a)*len*0.5 + Math.sin(t + i)*4;
      const my = Math.sin(a)*len*0.5;
      ctx.quadraticCurveTo(mx, my, Math.cos(a)*len*0.9, Math.sin(a)*len*0.9);
      ctx.stroke();
      ctx.fillStyle = `rgba(${palette.glowRgb},0.85)`;
      ctx.beginPath(); ctx.arc(Math.cos(a)*len*0.9, Math.sin(a)*len*0.9, 2.5, 0, Math.PI*2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawEyes(ctx, size, body, numEyes, eyeSize, S, t, phase, palette, stageIdx, seed) {
  if (numEyes <= 0) return;
  const positions = eyePositions(body, numEyes, size, seed);
  const gazeA = Math.sin(t * 0.3 + phase) * 0.8;
  const gazeB = Math.cos(t * 0.25 + phase * 1.3) * 0.8;
  const blinkPhase = (t * 0.35 + seed * 0.7) % 6;
  const blinking = blinkPhase < 0.18 ? (1 - Math.abs(blinkPhase/0.09 - 1)) : 0;

  positions.forEach((p, i) => {
    const er = size * eyeSize * (stageIdx === 0 ? 0.6 : 1);
    let gx = gazeA, gy = gazeB;
    if (stageIdx === 3) {
      gx = Math.sin(t * 0.3 + i * 2.1) * 0.9;
      gy = Math.cos(t * 0.25 + i * 1.7) * 0.9;
    }
    const openness = S.eyesOpen * (1 - blinking);
    drawSingleEye(ctx, p[0], p[1], er, palette, openness, gx, gy);
  });
}

function drawSingleEye(ctx, x, y, r, palette, openness, gx, gy) {
  ctx.save();
  ctx.translate(x, y);
  if (openness < 0.05) {
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.quadraticCurveTo(0, r*0.3, r, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const sclera = ctx.createRadialGradient(-r*0.3, -r*0.3, 0, 0, 0, r);
  sclera.addColorStop(0, 'rgba(255,248,230,0.98)');
  sclera.addColorStop(1, 'rgba(210,200,180,0.9)');
  ctx.fillStyle = sclera;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * openness, 0, 0, Math.PI*2);
  ctx.fill();
  const ig = ctx.createRadialGradient(0, 0, 0, 0, 0, r*0.7);
  ig.addColorStop(0, palette.primary);
  ig.addColorStop(0.7, palette.secondary);
  ig.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.ellipse(gx * r * 0.2, gy * r * 0.2, r * 0.62, r * 0.62 * openness, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(gx * r * 0.3, gy * r * 0.3, r * 0.28, r * 0.28 * Math.max(openness, 0.4), 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.ellipse(gx * r * 0.3 - r * 0.2, gy * r * 0.3 - r * 0.2, r * 0.12, r * 0.12 * Math.max(openness, 0.4), 0, 0, Math.PI*2);
  ctx.fill();
  if (openness < 1) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, -r*0.5, r, r*0.5 * (1-openness), 0, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function eyePositions(body, n, size, seed) {
  const pos = [];
  if (body === 'cube') {
    if (n === 1) return [[0, 0]];
    if (n === 2) return [[-size*0.22, -size*0.05], [size*0.22, -size*0.05]];
    return [[-size*0.22, -size*0.1], [0, size*0.05], [size*0.22, -size*0.1]];
  }
  if (body === 'swarm') {
    const nodes = drawSwarmBody._nodes || [];
    if (!nodes.length) return [[0,0]];
    for (let i = 0; i < Math.min(n, nodes.length); i++) pos.push(nodes[i]);
    return pos;
  }
  if (body === 'tall' || body === 'lantern') {
    if (n === 1) return [[0, -size*0.1]];
    for (let i = 0; i < n; i++) pos.push([Math.sin(i*2.7+seed)*size*0.1, -size*0.5 + (i/(n-1||1))*size*0.9]);
    return pos;
  }
  if (body === 'ribbon') {
    for (let i = 0; i < n; i++) pos.push([-size*0.9 + (i/(n-1||1))*size*1.8, 0]);
    return pos;
  }
  if (body === 'long') {
    for (let i = 0; i < n; i++) pos.push([-size*0.9 + (i/(n-1||1))*size*1.8, -size*0.05]);
    return pos;
  }
  if (n === 1) return [[0, -size*0.1]];
  if (n === 2) return [[-size*0.28, -size*0.1], [size*0.28, -size*0.1]];
  if (n === 3) return [[-size*0.3, -size*0.05], [0, -size*0.3], [size*0.3, -size*0.05]];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI + (i+0.5)/n * Math.PI;
    pos.push([Math.cos(a) * size * 0.55, Math.sin(a) * size * 0.45 - size*0.05]);
  }
  return pos;
}

// ============================================================
// FORK INHERITANCE — child creature inherits attributes from parent
// ============================================================
function forkCreature(parent, userHue) {
  // User-controlled hue rotation applied to primary; secondary kept
  const { h, s, l } = hexToHsl(parent.palette.primary);
  const newH = (h + (userHue || 30)) % 360;
  const newPrimary = hslToHex(newH, s, l);
  const newGlow = hslToRgb(newH, s, l).join(',');
  return {
    ...parent,
    palette: pal(newPrimary, parent.palette.secondary, newGlow),
    // mutation: one extra eye, slightly different eye size
    eyes: parent.eyes + (Math.random() < 0.3 ? 1 : 0),
    eyeSize: parent.eyeSize * (0.85 + Math.random() * 0.3),
    // tentacles inherited with ±1 variation
    tentacles: Math.max(0, parent.tentacles + (Math.random() < 0.5 ? -1 : 1)),
  };
}

function hexToHsl(hex) {
  const m = hex.replace('#','');
  const r = parseInt(m.substr(0,2),16)/255;
  const g = parseInt(m.substr(2,2),16)/255;
  const b = parseInt(m.substr(4,2),16)/255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
  const l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = ((g-b)/d + (g<b?6:0));
    else if (mx === g) h = (b-r)/d + 2;
    else h = (r-g)/d + 4;
    h *= 60;
  }
  return { h, s, l };
}
function hslToHex(h, s, l) {
  const [r,g,b] = hslToRgb(h, s, l);
  const hex = n => n.toString(16).padStart(2,'0');
  return '#' + hex(r) + hex(g) + hex(b);
}
function hslToRgb(h, s, l) {
  h /= 360;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) r = g = b = l;
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
}
