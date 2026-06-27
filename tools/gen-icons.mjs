#!/usr/bin/env node
// Generates Shiffle's brand assets (app icon, adaptive icon, splash, favicon,
// store icons, feature graphic) from a single source motif: a sliding-puzzle
// grid with one tile slid aside leaving a dark gap — the same motif used on the
// world cover cards. Renders SVG → PNG via ImageMagick (`magick`).
//
// Colors follow docs/asset-spec.md (the real in-game Game palette).
//
// Usage: node tools/gen-icons.mjs   (run from repo root)

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TMP = join(ROOT, 'tools', '.icon-build');
mkdirSync(TMP, { recursive: true });

const C = {
  bg: '#0c0a24',
  bgTop: '#1a1740',
  bgBottom: '#070613',
  tile: '#a78bfa',
  tileEdge: '#7c5cff',
  gap: '#070613',
  text: '#f4f2ff',
};

// A 3x3 sliding-puzzle motif. `cells` lists which grid slots are filled tiles;
// the one missing slot is the dark gap. One tile is drawn slightly offset to
// read as "mid-slide". Returns an SVG string sized to `size`.
function motifSvg(size, { padding = 0.12, withBg = true, glow = true } = {}) {
  const pad = size * padding;
  const inner = size - pad * 2;
  const gridGap = inner * 0.04;
  const cell = (inner - gridGap * 2) / 3;
  const r = cell * 0.16;

  // gap at slot (row 1, col 2) — index 5; one tile (index 4, the center) is
  // nudged toward the gap to imply motion.
  const GAP = 5;
  const NUDGE = 4;
  const nudge = cell * 0.18;

  const tiles = [];
  for (let i = 0; i < 9; i++) {
    if (i === GAP) continue;
    const row = Math.floor(i / 3);
    const col = i % 3;
    let x = pad + col * (cell + gridGap);
    let y = pad + row * (cell + gridGap);
    if (i === NUDGE) x += nudge; // slide the center tile rightward toward the gap
    // depth toward edges for a subtle concentric feel
    const isEdge = row === 0 || row === 2 || col === 0 || col === 2;
    const fill = isEdge ? C.tileEdge : C.tile;
    tiles.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="${r.toFixed(1)}" fill="${fill}"/>`,
    );
  }

  // The empty slot. On an opaque icon it's drawn as a dark hole; on a
  // transparent foreground (adaptive/favicon) it's left as a true transparent
  // hole so the Android adaptive background (#0c0a24) shows through cleanly.
  const gRow = Math.floor(GAP / 3);
  const gCol = GAP % 3;
  const gx = pad + gCol * (cell + gridGap);
  const gy = pad + gRow * (cell + gridGap);
  const gapRect = withBg
    ? `<rect x="${gx.toFixed(1)}" y="${gy.toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="${r.toFixed(1)}" fill="${C.gap}" opacity="0.55"/>`
    : '';

  const defs = glow
    ? `<defs><filter id="g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${(size * 0.012).toFixed(1)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
    : '';
  const group = `<g ${glow ? 'filter="url(#g)"' : ''}>${gapRect}${tiles.join('')}</g>`;
  const bg = withBg ? `<rect width="${size}" height="${size}" fill="${C.bg}"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}${bg}${group}</svg>`;
}

// Single tile + gap, for the tiny favicon where a full grid is illegible.
function faviconSvg(size) {
  const pad = size * 0.14;
  const inner = size - pad * 2;
  const gap = inner * 0.08;
  const cell = (inner - gap) / 2;
  const r = cell * 0.2;
  const t = (x, y, fill) =>
    `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="${r.toFixed(1)}" fill="${fill}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${t(pad, pad, C.tileEdge)}
    ${t(pad + cell + gap, pad, C.tile)}
    ${t(pad, pad + cell + gap, C.tile)}
    ${t(pad + cell + gap, pad + cell + gap, C.gap).replace('/>', ' opacity="0.5"/>')}
  </svg>`;
}

// Inline motif tiles (no nested <svg>, no filter) so rsvg-convert renders
// cleanly when composited into the splash / feature graphic.
function motifTiles(size, originX, originY, padding = 0.06) {
  const pad = size * padding;
  const inner = size - pad * 2;
  const gridGap = inner * 0.04;
  const cell = (inner - gridGap * 2) / 3;
  const r = cell * 0.16;
  const GAP = 5;
  const NUDGE = 4;
  const nudge = cell * 0.18;
  const parts = [];
  for (let i = 0; i < 9; i++) {
    if (i === GAP) continue;
    const row = Math.floor(i / 3);
    const col = i % 3;
    let x = originX + pad + col * (cell + gridGap);
    const y = originY + pad + row * (cell + gridGap);
    if (i === NUDGE) x += nudge;
    const isEdge = row === 0 || row === 2 || col === 0 || col === 2;
    const fill = isEdge ? C.tileEdge : C.tile;
    parts.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="${r.toFixed(1)}" fill="${fill}"/>`,
    );
  }
  return parts.join('');
}

// Text is composited separately via ImageMagick -annotate (rsvg-convert can't
// resolve font-family names reliably). Backgrounds are solid here; rsvg-convert
// drops SVG linearGradients under forced -size, so the splash uses the flat
// brand bg (Expo's splash.backgroundColor fills the rest) and the feature
// graphic gets its gradient from ImageMagick directly (see build step).
function splashSvg(size) {
  const m = size * 0.5;
  const mOffset = (size - m) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${C.bg}"/>
    ${motifTiles(m, mOffset, size * 0.2)}
  </svg>`;
}

function featureGraphicMotifSvg(w, h) {
  const m = h * 0.78;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${motifTiles(m, h * 0.12, h * 0.11)}
  </svg>`;
}

const FONT = '/System/Library/Fonts/Helvetica.ttc';

let svgCounter = 0;
// Render an SVG to PNG at an exact pixel size. `opaque` drops the alpha channel
// (required for iOS/Play store icons) by flattening onto the brand bg.
function render(svg, outPath, { size, width, height, opaque = false, annotate } = {}) {
  const w = width ?? size;
  const h = height ?? size;
  const svgPath = join(TMP, `src-${svgCounter++}.svg`);
  writeFileSync(svgPath, svg);
  const args = ['-background', 'none', '-size', `${w}x${h}`, svgPath];
  if (annotate) {
    for (const t of annotate) {
      args.push(
        '-font',
        FONT,
        '-fill',
        t.fill,
        '-pointsize',
        String(t.size),
        '-gravity',
        t.gravity ?? 'NorthWest',
        '-annotate',
        t.at,
        t.text,
      );
    }
  }
  if (opaque) {
    args.push('-background', C.bg, '-flatten', '-alpha', 'off');
  }
  args.push(outPath);
  execFileSync('magick', args, { stdio: 'inherit' });
  console.log('  ✓', outPath);
}

console.log('Generating Shiffle brand assets…');

// 1. App icon — opaque, full-bleed background, no alpha
render(motifSvg(1024, { padding: 0.16, withBg: true }), join(ROOT, 'assets/icon.png'), {
  size: 1024,
  opaque: true,
});

// 2. Adaptive icon foreground — transparent, motif in central ~66% safe zone
render(motifSvg(1024, { padding: 0.24, withBg: false }), join(ROOT, 'assets/adaptive-icon.png'), {
  size: 1024,
});

// 3. Splash — gradient bg + motif + wordmark
render(splashSvg(2048), join(ROOT, 'assets/splash.png'), {
  size: 2048,
  opaque: true,
  annotate: [{ text: 'SHIFFLE', fill: C.text, size: 200, gravity: 'Center', at: '+0+440' }],
});

// 4. Favicon — single tile + gap, transparent
render(faviconSvg(64), join(ROOT, 'assets/favicon.png'), { size: 64 });

// 5/6. Store icons — opaque, no alpha
mkdirSync(join(ROOT, 'store-assets'), { recursive: true });
render(
  motifSvg(1024, { padding: 0.16, withBg: true }),
  join(ROOT, 'store-assets/app-icon-1024.png'),
  {
    size: 1024,
    opaque: true,
  },
);
render(
  motifSvg(512, { padding: 0.16, withBg: true }),
  join(ROOT, 'store-assets/app-icon-512.png'),
  {
    size: 512,
    opaque: true,
  },
);

// 7. Feature graphic — 1024x500, opaque. Gradient bg from ImageMagick, motif
// overlaid, wordmark + subtitle composited.
{
  const motifSvgPath = join(TMP, 'fg-motif.svg');
  writeFileSync(motifSvgPath, featureGraphicMotifSvg(1024, 500));
  const out = join(ROOT, 'store-assets/feature-graphic.png');
  execFileSync(
    'magick',
    [
      '-size',
      '1024x500',
      `gradient:${C.bgTop}-${C.bgBottom}`,
      '(',
      '-background',
      'none',
      '-size',
      '1024x500',
      motifSvgPath,
      ')',
      '-composite',
      '-font',
      FONT,
      '-fill',
      C.text,
      '-pointsize',
      '92',
      '-gravity',
      'NorthWest',
      '-annotate',
      '+470+200',
      'SHIFFLE',
      '-fill',
      C.tile,
      '-pointsize',
      '40',
      '-annotate',
      '+472+310',
      'Slide. Solve. Relax.',
      '-alpha',
      'off',
      out,
    ],
    { stdio: 'inherit' },
  );
  console.log('  ✓', out);
}

rmSync(TMP, { recursive: true, force: true });
console.log('Done.');
