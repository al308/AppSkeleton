#!/usr/bin/env node
// Verifies and normalizes staged AI-generated images before they're eligible
// to be manually copied into assets/images/worlds/<world>/. See
// docs/specs/genart-pipeline.md and docs/asset-prompts.md for the rules this
// enforces: square 1:1, >=1024x1024, JPEG q90, no third-party provenance
// signature (the Picsum/Unsplash lesson).
//
// Usage:
//   node tools/genart/ingest.mjs <world> [<model>]
//
// <model> targets tools/.genart-staging/<world>/<model>/ (as produced by
// generate.mjs's per-variant output dirs); omit it to ingest a flat
// tools/.genart-staging/<world>/ directory instead.
//
// Requires `exiftool` and ImageMagick (`magick`) on PATH — same tools
// tools/gen-icons.mjs already depends on.
//
// This script only reports pass/fail and writes normalized copies to
// <staging-dir>/ingested/ — it never writes into assets/. Copying into
// assets/images/worlds/ is a manual step after review.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const ROOT = process.cwd();

// Signatures seen in third-party placeholder services we've been burned by
// before (Picsum/Unsplash) — see docs/asset-prompts.md's licensing note.
const FORBIDDEN_PROVENANCE_PATTERNS = [/picsum/i, /unsplash/i];

function parseFlags(args) {
  const positional = args.filter((a) => !a.startsWith('--'));
  return { positional };
}

function checkProvenance(filePath) {
  let exifOutput;
  try {
    exifOutput = execFileSync('exiftool', [filePath], { encoding: 'utf8' });
  } catch (err) {
    return { ok: false, reason: `exiftool failed: ${err.message}` };
  }
  for (const pattern of FORBIDDEN_PROVENANCE_PATTERNS) {
    if (pattern.test(exifOutput)) {
      return { ok: false, reason: `Forbidden provenance signature matched: ${pattern}` };
    }
  }
  return { ok: true, exifOutput };
}

function getDimensions(filePath) {
  const out = execFileSync('magick', ['identify', '-format', '%w %h', filePath], {
    encoding: 'utf8',
  });
  const [w, h] = out.trim().split(' ').map(Number);
  return { width: w, height: h };
}

function normalizeToJpeg(filePath, outPath) {
  // Center-crop to square (defensive — our own workflow already emits 1024x1024,
  // this guards against any future non-square source) then re-encode q90.
  execFileSync('magick', [
    filePath,
    '-gravity',
    'center',
    '-extent',
    '%[fx:min(w,h)]x%[fx:min(w,h)]',
    '-quality',
    '90',
    outPath,
  ]);
}

function main() {
  const [, , ...rest] = process.argv;
  const { positional } = parseFlags(rest);
  const world = positional[0];
  const model = positional[1];
  if (!world) {
    console.error('Usage: ingest.mjs <world> [<model>]');
    process.exit(1);
  }

  const stagingDir = model
    ? join(ROOT, 'tools', '.genart-staging', world, model)
    : join(ROOT, 'tools', '.genart-staging', world);
  if (!existsSync(stagingDir)) {
    console.error(`No staged images found at ${stagingDir}`);
    process.exit(1);
  }

  const outDir = join(stagingDir, 'ingested');
  mkdirSync(outDir, { recursive: true });

  const files = readdirSync(stagingDir).filter((f) => /\.(png|jpe?g)$/i.test(f));
  if (files.length === 0) {
    console.error(`No image files in ${stagingDir}`);
    process.exit(1);
  }

  let passCount = 0;
  let failCount = 0;

  for (const file of files) {
    const filePath = join(stagingDir, file);
    console.log(`\n${file}`);

    const provenance = checkProvenance(filePath);
    if (!provenance.ok) {
      console.log(`  FAIL provenance: ${provenance.reason}`);
      failCount++;
      continue;
    }
    console.log('  OK   provenance (no forbidden signature)');

    const { width, height } = getDimensions(filePath);
    if (width < 1024 || height < 1024) {
      console.log(`  FAIL dimensions: ${width}x${height} (minimum 1024x1024)`);
      failCount++;
      continue;
    }
    console.log(`  OK   dimensions: ${width}x${height}`);

    const outName = `${basename(file, extname(file))}.jpg`;
    const outPath = join(outDir, outName);
    normalizeToJpeg(filePath, outPath);
    const { width: ow, height: oh } = getDimensions(outPath);
    console.log(`  OK   normalized → ${outPath} (${ow}x${oh}, JPEG q90)`);
    passCount++;
  }

  console.log(`\n${passCount} passed, ${failCount} failed.`);
  console.log(`Approved images are staged at: ${outDir}`);
  console.log(
    'Next: manually review, then copy into assets/images/worlds/<world>/ and wire images.ts/levels.ts.',
  );
  if (failCount > 0) process.exit(1);
}

main();
