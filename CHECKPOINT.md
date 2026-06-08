# CHECKPOINT — SongSugar/DropCast Development

## Date
2026-04-14

## Session Summary
Major refactoring of tile interaction system, special tiles, and playability improvements for the Candy Crush-style music creation game.

## What Was In Progress
Unified input handling rewrite — replacing PIXI event + selection system with native DOM press-drag-release model. The rewrite was **tested but reverted** back to controllerv9 state before closing.

## Current State (controllerv9)

### What Works
- **Tile rendering:** PIXI.Graphics-based renderer (no textures/sprites)
- **Swap mechanic:** Drag to swap adjacent tiles OR tap-to-select + tap-to-swap
- **Cluster collapse:** Tap cluster of 3+ same-colour tiles to collapse
- **Chain reactions:** Auto-chain when collapse creates new clusters
- **Typed bombs:** BEAT_BOMB, VIBE_BOMB, MELODY_BOMB clear all tiles of their colour
- **Special tiles:** SHUFFLE (randomizes colour tiles), DOUBLE (doubles next score)
- **Phase system:** Board composition changes based on active audio loops (0-3)
- **Playability:** `ensurePlayable()` guarantees minimum swappable pairs on init
- **Touch drag:** Native DOM touchmove/touchend for mobile swipe-to-swap
- **Audio:** Tone.js synthesis (DO NOT MODIFY — marked as constraint)

### What Doesn't Work / Known Issues
- Touch drag can be unreliable on some devices (coordinate mismatch on retina)
- Selection state still exists (two-tap flow) — was mid-refactor to remove it
- SOCIAL tile handler may be incomplete

### Snapshots Available
All snapshots committed and available in `dist/`:
- `controllerv0.html` — swap-based gameplay, chain collapse, cluster borders
- `controllerv1.html` — Graphics renderer, no textures, no GlowFilter
- `controllerv2.html` — phase wiring, higher NOISE, density enforcement
- `controllerv3.html` — remove legacy HUD bars, session timer, borders
- `controllerv4.html` — tile spacing, progress bar fix, HUD invalidate
- `controllerv5.html` — remove WILD/FREEZE, typed bombs, shuffle fix
- `controllerv6.html` — special tile activation, drag conflicts, bomb redraw
- `controllerv7.html` — SHUFFLE redraw, BOOM popup, palette colors, drag fix
- `controllerv8.html` — pre playability and drag coord fixes
- `controllerv9.html` — playable init board, drag coord fix (CURRENT)

## Next Steps When Returning

1. **Test controllerv9** on mobile to verify touch drag works
2. **If touch issues persist:** Consider the unified input rewrite that was reverted:
   - Native DOM mousedown/mousemove/mouseup for desktop
   - Native DOM touchstart/touchmove/touchend for mobile
   - Single gesture handler (press-drag-release)
   - No selection state, no two-tap flow
3. **Review SOCIAL tile** — may need implementation
4. **Consider DOUBLE tile** — verify scoring multiplier works

## Warnings / Gotchas

1. **DO NOT modify audio code** — Tone.js integration, Audio object, MIX HUD are off-limits
2. **Always show diffs before applying** — User wants to review every change
3. **Copy to dist/ after edits** — `cp index.html dist/index.html`
4. **Snapshot pattern:** `cp dist/index.html dist/controllervN.html && git add && git commit`
5. **BUFFER_ROWS = 7** — Rows 0-6 are hidden buffer, row 7 is preview, rows 8-15 are playable
6. **P() returns current palette** — Use `P().beat`, `P().vibe`, `P().melody` for colours

## Files to Know

| File | Purpose |
|------|---------|
| `index.html` | Main game source (single-file app) |
| `dist/index.html` | Deployed version (served by nginx) |
| `dist/controllervN.html` | Snapshots for rollback |
| `AUDIO_ARCHITECTURE.md` | Tone.js audio system docs |

## Git State
- Branch: `main`
- Last commit: `5f4b6e4` (controllerv9)
- Working directory: Clean (matches HEAD)
- Untracked: Some new .js.map files and soundgarden/ demo
