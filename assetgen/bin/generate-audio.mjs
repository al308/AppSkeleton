#!/usr/bin/env node
// Drives ComfyUI on a running RunPod pod (started via runpod.mjs) to
// generate sound assets from a sounds.yaml manifest (see prompts.mjs's
// expandAudioManifest), staging results to
// .assetgen-staging/audio/<asset-name>/candidate-N.mp3.
//
// Usage:
//   node bin/generate-audio.mjs --manifest sounds.yaml --host <ip> --port <sshPort> [options]
//
// Options:
//   --candidates <N>    clips per asset (default: 2)
//   --only <a,b,c>      restrict to these manifest asset names
//   --tag <t>           restrict to assets whose manifest `tags` include t
//   --limit <N>         cap the number of assets processed
//
// Model: Stable Audio Open 1.0 (see docs/AUDIO.md for why — commercially
// usable under the Stability AI Community License below $1M annual
// revenue, natively supported by ComfyUI core with no custom nodes, better
// at SFX/foley than at music per Stability's own model card). Single model
// only — unlike the image pipeline's two-checkpoint comparison, there is
// currently no second commercially-licensed open audio model with mature
// native ComfyUI support worth comparing against. Re-run --candidates
// higher for more variety instead.
//
// Requires an SSH tunnel to the pod's ComfyUI port (8188) — this script
// opens one itself for the duration of the run via `ssh -L`.

import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { expandAudioManifest } from './prompts.mjs';

const ROOT = process.cwd();
const STAGING = join(ROOT, '.assetgen-staging', 'audio');
const LOCAL_TUNNEL_PORT = 18188;
const DEFAULT_CANDIDATES = 2;

// Verified against ComfyUI's official audio_stable_audio_example.json
// workflow template (Comfy-Org/workflow_templates) — native core nodes,
// no custom node repo required. Checkpoint + CLIP files load once per
// pod session; only KSampler's seed/positive/negative/latent duration
// change per generation (same model-major batching logic as the image
// pipeline's cost strategy, trivially true here since there's only one
// model).
const CHECKPOINT = 'stable-audio-open-1.0.safetensors';
const CLIP_MODEL = 't5-base.safetensors';
const SAMPLE_RATE = 44100;

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

function buildWorkflow(prompt, negative, durationSeconds, seed) {
  return {
    4: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: CHECKPOINT } },
    10: {
      class_type: 'CLIPLoader',
      inputs: { clip_name: CLIP_MODEL, type: 'stable_audio', device: 'default' },
    },
    6: { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['10', 0] } },
    7: { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['10', 0] } },
    11: { class_type: 'EmptyLatentAudio', inputs: { seconds: durationSeconds, batch_size: 1 } },
    3: {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps: 50,
        cfg: 4.98,
        sampler_name: 'dpmpp_3m_sde_gpu',
        scheduler: 'exponential',
        denoise: 1.0,
        model: ['4', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['11', 0],
      },
    },
    12: { class_type: 'VAEDecodeAudio', inputs: { samples: ['3', 0], vae: ['4', 2] } },
    19: {
      class_type: 'SaveAudioMP3',
      inputs: { audio: ['12', 0], filename_prefix: 'assetgen', quality: 'V0' },
    },
  };
}

function openTunnel(host, port) {
  return spawn(
    'ssh',
    [
      '-N',
      '-L',
      `${LOCAL_TUNNEL_PORT}:127.0.0.1:8188`,
      '-o',
      'ConnectTimeout=15',
      '-o',
      'ExitOnForwardFailure=yes',
      'root@' + host,
      '-p',
      String(port),
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
}

async function waitForTunnel(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${LOCAL_TUNNEL_PORT}/system_stats`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await sleep(1000);
  }
  throw new Error('Tunnel to ComfyUI did not come up in time.');
}

async function submitPrompt(workflow) {
  const res = await fetch(`http://127.0.0.1:${LOCAL_TUNNEL_PORT}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow, client_id: 'assetgen-audio' }),
  });
  if (!res.ok) throw new Error(`/prompt failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.prompt_id;
}

async function waitForHistory(promptId, timeoutMs = 300000) {
  // Same cold-start cost as the image pipeline (model load into VRAM on
  // first inference) — see docs/PLAYBOOK.md Lesson 5.
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`http://127.0.0.1:${LOCAL_TUNNEL_PORT}/history/${promptId}`);
    if (res.ok) {
      const body = await res.json();
      const entry = body[promptId];
      if (entry && entry.outputs) return entry;
    }
    await sleep(2000);
  }
  throw new Error(`Timed out waiting for prompt ${promptId} to finish.`);
}

async function downloadAudio(audioInfo, outPath) {
  const params = new URLSearchParams({
    filename: audioInfo.filename,
    subfolder: audioInfo.subfolder ?? '',
    type: audioInfo.type ?? 'output',
  });
  const res = await fetch(`http://127.0.0.1:${LOCAL_TUNNEL_PORT}/view?${params}`);
  if (!res.ok) throw new Error(`/view failed for ${audioInfo.filename}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
}

async function generateOne(asset, outPath) {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const workflow = buildWorkflow(asset.positive, asset.negative, asset.durationSeconds, seed);
  const promptId = await submitPrompt(workflow);
  const entry = await waitForHistory(promptId);
  // SaveAudioMP3 is node 19 in the graph above.
  const audios = entry.outputs?.['19']?.audio ?? [];
  if (audios.length === 0)
    throw new Error(`No output audio for ${asset.name} (prompt ${promptId})`);
  await downloadAudio(audios[0], outPath);
}

async function main() {
  const [, , ...rest] = process.argv;
  const flags = parseFlags(rest);

  if (!flags.manifest || !flags.host || !flags.port) {
    console.error(
      'Usage: generate-audio.mjs --manifest sounds.yaml --host <ip> --port <sshPort> [--candidates N] [--only a,b,c] [--tag t] [--limit N]',
    );
    process.exit(1);
  }
  const candidates = Number(flags.candidates ?? DEFAULT_CANDIDATES);

  let assets = expandAudioManifest(flags.manifest);
  if (flags.only) {
    const names = new Set(
      String(flags.only)
        .split(',')
        .map((s) => s.trim()),
    );
    assets = assets.filter((a) => names.has(a.name));
  }
  if (flags.tag) {
    assets = assets.filter((a) => a.tags.includes(flags.tag));
  }
  if (flags.limit) assets = assets.slice(0, Number(flags.limit));
  if (assets.length === 0) {
    console.error('No sounds matched (check --manifest / --only / --tag against sounds.yaml).');
    process.exit(1);
  }

  console.log(
    `Plan: ${assets.length} sound(s) × ${candidates} candidate(s) = ${assets.length * candidates} generations.`,
  );
  console.log(
    `Sample rate ${SAMPLE_RATE}Hz, model: Stable Audio Open 1.0. See docs/AUDIO.md for license terms.`,
  );

  console.log(`Opening SSH tunnel to ${flags.host}:${flags.port} → local:${LOCAL_TUNNEL_PORT}...`);
  const tunnel = openTunnel(flags.host, flags.port);
  try {
    await waitForTunnel();
    console.log('Tunnel up. ComfyUI reachable.');

    for (const asset of assets) {
      const outDir = join(STAGING, asset.name);
      mkdirSync(outDir, { recursive: true });
      console.log(
        `Generating ${asset.name} (${candidates} candidate(s), ${asset.durationSeconds}s) ...`,
      );

      for (let c = 1; c <= candidates; c++) {
        const outPath = join(outDir, `candidate-${c}.mp3`);
        try {
          await generateOne(asset, outPath);
          console.log(`  candidate-${c} → ${outPath}`);
        } catch (err) {
          console.error(`  candidate-${c} FAILED (attempt 1): ${err.message}`);
          console.log('  Retrying once with a new seed...');
          try {
            await generateOne(asset, outPath);
            console.log(`  candidate-${c} → ${outPath} (retry succeeded)`);
          } catch (retryErr) {
            console.error(`  candidate-${c} FAILED (attempt 2, giving up): ${retryErr.message}`);
          }
        }
      }
    }
  } finally {
    tunnel.kill();
    console.log('Tunnel closed.');
  }

  console.log(`\nDone. Staged clips in ${STAGING}/<asset-name>/candidate-N.mp3`);
  console.log('Next: node bin/ingest-audio.mjs to verify + report duration before review.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
