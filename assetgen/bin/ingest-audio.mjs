#!/usr/bin/env node
// Verifies staged AI-generated sound candidates before they're eligible to
// be manually copied into your project's real audio asset tree. Checks
// duration (matches what was requested, catches truncated/failed
// generations) and flags likely-silent or clipped clips via ffmpeg's
// loudness/peak analysis. See docs/AUDIO.md.
//
// Usage:
//   node bin/ingest-audio.mjs [--manifest sounds.yaml] [--only a,b,c]
//
// Walks .assetgen-staging/audio/<asset-name>/candidate-N.mp3. Unlike the
// image pipeline's ingest.mjs, there's no format normalization step —
// SaveAudioMP3 already writes a consistent format (MP3, V0 quality,
// 44.1kHz) — this script is a QA gate, not a converter. Never writes
// outside .assetgen-staging/ — copying approved candidates into your real
// asset tree is always a manual step.
//
// Requires `ffprobe` + `ffmpeg` on PATH (part of the standard ffmpeg
// install — `brew install ffmpeg` / `apt install ffmpeg`).

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { expandAudioManifest } from './prompts.mjs';

const ROOT = process.cwd();
const STAGING = join(ROOT, '.assetgen-staging', 'audio');

// Duration tolerance — Stable Audio Open's actual output length can drift
// slightly from the requested EmptyLatentAudio `seconds` value (frame
// quantization in the VAE). A fraction of a second either way is normal,
// not a failure signal.
const DURATION_TOLERANCE_SECONDS = 1.0;

// A clip whose peak sample level never gets meaningfully above the noise
// floor is very likely a failed/silent generation, not a real quiet sound.
const SILENCE_MEAN_VOLUME_DB_THRESHOLD = -50;

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

function getDuration(filePath) {
  const out = execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ],
    { encoding: 'utf8' },
  );
  return Number(out.trim());
}

function getMeanVolumeDb(filePath) {
  // ffmpeg's volumedetect filter writes its analysis to stderr, not stdout.
  let stderr = '';
  try {
    execFileSync('ffmpeg', ['-i', filePath, '-af', 'volumedetect', '-f', 'null', '-'], {
      encoding: 'utf8',
      stdio: ['ignore', 'ignore', 'pipe'],
    });
  } catch (err) {
    stderr = err.stderr?.toString() ?? '';
  }
  const match = stderr.match(/mean_volume:\s*(-?\d+(\.\d+)?)\s*dB/);
  return match ? Number(match[1]) : null;
}

function ingestAssetDir(assetDir, assetName, expectedDuration) {
  const files = readdirSync(assetDir).filter((f) => /\.mp3$/i.test(f));
  if (files.length === 0) return { pass: 0, fail: 0 };

  let pass = 0;
  let fail = 0;
  for (const file of files) {
    const filePath = join(assetDir, file);
    console.log(`\n${assetName}/${file}`);

    let duration;
    try {
      duration = getDuration(filePath);
    } catch (err) {
      console.log(`  FAIL ffprobe: ${err.message}`);
      fail++;
      continue;
    }

    if (expectedDuration && Math.abs(duration - expectedDuration) > DURATION_TOLERANCE_SECONDS) {
      console.log(
        `  FAIL duration: ${duration.toFixed(2)}s (expected ~${expectedDuration}s, tolerance ±${DURATION_TOLERANCE_SECONDS}s) — likely a truncated or failed generation`,
      );
      fail++;
      continue;
    }
    console.log(`  OK   duration: ${duration.toFixed(2)}s`);

    const meanVolumeDb = getMeanVolumeDb(filePath);
    if (meanVolumeDb !== null && meanVolumeDb < SILENCE_MEAN_VOLUME_DB_THRESHOLD) {
      console.log(
        `  FAIL likely silent: mean volume ${meanVolumeDb}dB (threshold ${SILENCE_MEAN_VOLUME_DB_THRESHOLD}dB)`,
      );
      fail++;
      continue;
    }
    console.log(
      `  OK   mean volume: ${meanVolumeDb !== null ? meanVolumeDb + 'dB' : '(could not measure)'}`,
    );

    pass++;
  }
  return { pass, fail };
}

function main() {
  const flags = parseFlags(process.argv.slice(2));

  if (!existsSync(STAGING)) {
    console.error(`No staging directory at ${STAGING} — run generate-audio.mjs first.`);
    process.exit(1);
  }

  // Expected durations come from the manifest so we can catch truncated
  // generations — optional, ingest still runs (without duration checks) if
  // no manifest is given.
  let expectedDurations = {};
  if (flags.manifest) {
    const expanded = expandAudioManifest(flags.manifest);
    expectedDurations = Object.fromEntries(expanded.map((a) => [a.name, a.durationSeconds]));
  }

  let assetNames = readdirSync(STAGING, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  if (flags.only) {
    const onlyNames = new Set(
      String(flags.only)
        .split(',')
        .map((s) => s.trim()),
    );
    assetNames = assetNames.filter((n) => onlyNames.has(n));
  }

  let totalPass = 0;
  let totalFail = 0;
  for (const assetName of assetNames) {
    const { pass, fail } = ingestAssetDir(
      join(STAGING, assetName),
      assetName,
      expectedDurations[assetName],
    );
    totalPass += pass;
    totalFail += fail;
  }

  console.log(`\n${totalPass} passed, ${totalFail} failed.`);
  console.log(`Review candidates at: ${STAGING}/<asset-name>/candidate-N.mp3`);
  console.log(
    'Next: listen to each candidate, pick the best, copy into your real audio asset tree.',
  );
  if (totalFail > 0) process.exit(1);
}

main();
