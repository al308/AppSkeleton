#!/usr/bin/env node
// Verifies and normalizes staged AI-generated images before they're eligible
// to be manually copied into your project's real asset tree. Enforces:
// no third-party placeholder-service provenance signature, minimum
// dimensions, JPEG q90 normalization. See docs/PLAYBOOK.md.
//
// Usage:
//   node bin/ingest.mjs [--model <key>] [--only a,b,c]
//
// Walks .assetgen-staging/<model>/<asset-name>/candidate-N.png, writes
// normalized JPEGs to .assetgen-staging/<model>/<asset-name>/ingested/
// candidate-N.jpg. Never writes outside .assetgen-staging/ — copying
// approved candidates into your real asset tree is always a manual step.
//
// Requires `exiftool` and ImageMagick (`magick`) on PATH.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const ROOT = process.cwd();
const STAGING = join(ROOT, '.assetgen-staging');

// Signatures of third-party placeholder services (Picsum/Unsplash etc.) —
// these have shown up before as an accidental provenance/licensing trap
// when a "generated" image was actually a downloaded stock placeholder.
// Extend this list if your project has been burned by a specific service.
const FORBIDDEN_PROVENANCE_PATTERNS = [/picsum/i, /unsplash/i, /shutterstock/i, /gettyimages/i];

const MIN_DIMENSION = 1024;

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
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
  execFileSync('magick', [filePath, '-quality', '90', outPath]);
}

function listAssetDirs(modelDir) {
  return readdirSync(modelDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function ingestAssetDir(assetDir, assetName) {
  const outDir = join(assetDir, 'ingested');
  mkdirSync(outDir, { recursive: true });

  const files = readdirSync(assetDir).filter((f) => /\.(png|jpe?g)$/i.test(f));
  if (files.length === 0) return { pass: 0, fail: 0 };

  let pass = 0;
  let fail = 0;
  for (const file of files) {
    const filePath = join(assetDir, file);
    console.log(`\n${assetName}/${file}`);

    const provenance = checkProvenance(filePath);
    if (!provenance.ok) {
      console.log(`  FAIL provenance: ${provenance.reason}`);
      fail++;
      continue;
    }
    console.log('  OK   provenance');

    const { width, height } = getDimensions(filePath);
    if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
      console.log(
        `  FAIL dimensions: ${width}x${height} (minimum ${MIN_DIMENSION}x${MIN_DIMENSION})`,
      );
      fail++;
      continue;
    }
    console.log(`  OK   dimensions: ${width}x${height}`);

    const outName = `${basename(file, extname(file))}.jpg`;
    const outPath = join(outDir, outName);
    normalizeToJpeg(filePath, outPath);
    console.log(`  OK   normalized → ${outPath} (JPEG q90)`);
    pass++;
  }
  return { pass, fail };
}

function main() {
  const flags = parseFlags(process.argv.slice(2));

  if (!existsSync(STAGING)) {
    console.error(`No staging directory at ${STAGING} — run generate.mjs first.`);
    process.exit(1);
  }

  const modelKeys = flags.model
    ? [flags.model]
    : readdirSync(STAGING, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

  const onlyNames = flags.only
    ? new Set(
        String(flags.only)
          .split(',')
          .map((s) => s.trim()),
      )
    : null;

  let totalPass = 0;
  let totalFail = 0;

  for (const modelKey of modelKeys) {
    const modelDir = join(STAGING, modelKey);
    if (!existsSync(modelDir)) {
      console.error(`No staged images for model "${modelKey}" at ${modelDir}`);
      continue;
    }
    let assetNames = listAssetDirs(modelDir);
    if (onlyNames) assetNames = assetNames.filter((n) => onlyNames.has(n));

    for (const assetName of assetNames) {
      const { pass, fail } = ingestAssetDir(join(modelDir, assetName), `${modelKey}/${assetName}`);
      totalPass += pass;
      totalFail += fail;
    }
  }

  console.log(`\n${totalPass} passed, ${totalFail} failed.`);
  console.log(`Approved candidates staged at: ${STAGING}/<model>/<asset-name>/ingested/`);
  console.log(
    'Next: review candidates per asset (2 by default per model), pick the best, copy into your real asset tree.',
  );
  if (totalFail > 0) process.exit(1);
}

main();
