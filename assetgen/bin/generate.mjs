#!/usr/bin/env node
// Drives ComfyUI on a running RunPod pod (started via runpod.mjs) to
// generate assets from an assets.yaml manifest (see prompts.mjs), staging
// results to .assetgen-staging/<model>/<asset-name>/candidate-N.png.
//
// Usage:
//   node bin/generate.mjs --manifest assets.yaml --host <ip> --port <sshPort> [options]
//
// Options:
//   --model <key>       one of: dreamshaper, juggernaut, flux2 (default: both dreamshaper+juggernaut)
//   --candidates <N>    images per asset per model (default: 2)
//   --only <a,b,c>      restrict to these manifest asset names
//   --tag <t>           restrict to assets whose manifest `tags` include t
//   --limit <N>         cap the number of assets processed (after --only/--tag)
//
// COST STRATEGY — model-major batching, not GPU batch_size:
// the pipeline processes ONE model checkpoint at a time, running every
// requested asset (×candidates) against it before switching to the next
// model. This avoids repeated checkpoint load/VRAM-swap cost (the real
// RunPod cost driver — see docs/PLAYBOOK.md Lesson 5), not GPU-level
// batch_size parallelism. Within a model, images are still generated one
// ComfyUI /prompt submission at a time, sequentially.
//
// Requires an SSH tunnel to the pod's ComfyUI port (8188) — this script
// opens one itself for the duration of the run via `ssh -L`.

import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { expandManifest } from './prompts.mjs';

const ROOT = process.cwd();
const STAGING = join(ROOT, '.assetgen-staging');
const LOCAL_TUNNEL_PORT = 18188;
const DEFAULT_CANDIDATES = 2;

// Two default 7B-class SDXL checkpoints on the RTX 4090 (see
// docs/PLAYBOOK.md's model-comparison section for why these two): one
// painterly/illustrative, one photoreal-tuned, giving two genuinely
// different candidate looks per asset rather than two near-duplicates.
// FLUX.2 [dev] fp8 is opt-in via --model flux2 (needs an A100 — see
// docs/FLUX2_A100.md and runpod.mjs's `flux2` profile).
const MODEL_VARIANTS = {
  dreamshaper: {
    label: 'DreamShaperXL Turbo v2',
    checkpoint: 'DreamShaperXL_Turbo_v2.safetensors',
    kind: 'sdxl',
    steps: 20, // NOT its native 8 — see docs/PLAYBOOK.md Lesson 1 (duplicate-object artifacts)
    cfg: 2.0,
    sampler_name: 'dpmpp_sde',
    scheduler: 'karras',
  },
  juggernaut: {
    label: 'Juggernaut XL v9 (RunDiffusionPhoto_v2)',
    checkpoint: 'Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors',
    kind: 'sdxl',
    steps: 30,
    cfg: 5.0,
    sampler_name: 'dpmpp_2m',
    scheduler: 'karras',
  },
  flux2: {
    label: 'FLUX.2 [dev] fp8 (requires A100 — see docs/FLUX2_A100.md)',
    unet: 'flux2_dev_fp8mixed.safetensors',
    clip: 'mistral_3_small_flux2_fp8.safetensors',
    vae: 'flux2-vae.safetensors',
    kind: 'flux2',
    steps: 20,
    guidance: 3.5,
  },
};

const DEFAULT_MODEL_KEYS = ['dreamshaper', 'juggernaut'];

function parseFlags(args) {
  const flags = {};
  const positional = [];
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
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

function buildSdxlWorkflow(variant, prompt, negative, width, height, seed) {
  return {
    3: {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps: variant.steps,
        cfg: variant.cfg,
        sampler_name: variant.sampler_name,
        scheduler: variant.scheduler,
        denoise: 1.0,
        model: ['4', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['5', 0],
      },
    },
    4: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: variant.checkpoint } },
    5: { class_type: 'EmptyLatentImage', inputs: { width, height, batch_size: 1 } },
    6: { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['4', 1] } },
    7: { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['4', 1] } },
    8: { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
    9: { class_type: 'SaveImage', inputs: { filename_prefix: 'assetgen', images: ['8', 0] } },
  };
}

function buildFlux2Workflow(variant, prompt, negative, width, height, seed) {
  // FLUX.2 pins cfg to 1.0 — negative-prompt CFG has no effect. Exclusions
  // must be reinforced in the positive prompt text itself (see
  // docs/PLAYBOOK.md Lesson 2 — verified on FLUX.1, carries over to FLUX.2's
  // same architecture). prompts.mjs already folds `exclude:` entries into a
  // negative-prompt string for the SDXL path; here we also append a short
  // human-readable exclusion clause to the positive prompt as belt-and-braces.
  const reinforcedPositive = negative ? `${prompt}, absolutely no: ${negative}` : prompt;
  return {
    3: {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps: variant.steps,
        cfg: 1.0,
        sampler_name: 'euler',
        scheduler: 'simple',
        denoise: 1.0,
        model: ['4', 0],
        positive: ['10', 0],
        negative: ['7', 0],
        latent_image: ['5', 0],
      },
    },
    4: { class_type: 'UNETLoader', inputs: { unet_name: variant.unet, weight_dtype: 'default' } },
    5: { class_type: 'EmptyFlux2LatentImage', inputs: { width, height, batch_size: 1 } },
    6: { class_type: 'CLIPTextEncode', inputs: { text: reinforcedPositive, clip: ['11', 0] } },
    7: { class_type: 'CLIPTextEncode', inputs: { text: '', clip: ['11', 0] } },
    8: { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['12', 0] } },
    9: { class_type: 'SaveImage', inputs: { filename_prefix: 'assetgen', images: ['8', 0] } },
    10: {
      class_type: 'FluxGuidance',
      inputs: { conditioning: ['6', 0], guidance: variant.guidance },
    },
    11: { class_type: 'CLIPLoader', inputs: { clip_name: variant.clip, type: 'flux2' } },
    12: { class_type: 'VAELoader', inputs: { vae_name: variant.vae } },
  };
}

function buildWorkflow(variantKey, prompt, negative, width, height, seed) {
  const variant = MODEL_VARIANTS[variantKey];
  if (!variant) {
    throw new Error(
      `Unknown model variant "${variantKey}". Options: ${Object.keys(MODEL_VARIANTS).join(', ')}`,
    );
  }
  return variant.kind === 'flux2'
    ? buildFlux2Workflow(variant, prompt, negative, width, height, seed)
    : buildSdxlWorkflow(variant, prompt, negative, width, height, seed);
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
    body: JSON.stringify({ prompt: workflow, client_id: 'assetgen' }),
  });
  if (!res.ok) throw new Error(`/prompt failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.prompt_id;
}

async function waitForHistory(promptId, timeoutMs = 300000) {
  // First generation after a pod boot pays a one-time model-load cost
  // (CLIP + UNet staged into VRAM) that alone can take ~2min. Subsequent
  // prompts against an already-loaded checkpoint are much faster — this is
  // exactly why model-major batching (see header comment) matters for cost.
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

async function downloadImage(imageInfo, outPath) {
  const params = new URLSearchParams({
    filename: imageInfo.filename,
    subfolder: imageInfo.subfolder ?? '',
    type: imageInfo.type ?? 'output',
  });
  const res = await fetch(`http://127.0.0.1:${LOCAL_TUNNEL_PORT}/view?${params}`);
  if (!res.ok) throw new Error(`/view failed for ${imageInfo.filename}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
}

async function generateOne(asset, variantKey, width, height, outPath) {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const workflow = buildWorkflow(variantKey, asset.positive, asset.negative, width, height, seed);
  const promptId = await submitPrompt(workflow);
  const entry = await waitForHistory(promptId);
  const images = entry.outputs?.['9']?.images ?? [];
  if (images.length === 0)
    throw new Error(`No output images for ${asset.name} (prompt ${promptId})`);
  await downloadImage(images[0], outPath);
}

async function main() {
  const [, , ...rest] = process.argv;
  const { flags } = parseFlags(rest);

  if (!flags.manifest || !flags.host || !flags.port) {
    console.error(
      'Usage: generate.mjs --manifest assets.yaml --host <ip> --port <sshPort> [--model dreamshaper|juggernaut|flux2] [--candidates N] [--only a,b,c] [--tag t] [--limit N]',
    );
    process.exit(1);
  }

  const variantKeys = flags.model ? [flags.model] : DEFAULT_MODEL_KEYS;
  for (const key of variantKeys) {
    if (!MODEL_VARIANTS[key]) {
      console.error(`Unknown --model "${key}". Options: ${Object.keys(MODEL_VARIANTS).join(', ')}`);
      process.exit(1);
    }
  }
  const candidates = Number(flags.candidates ?? DEFAULT_CANDIDATES);

  let assets = expandManifest(flags.manifest);
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
    console.error('No assets matched (check --manifest / --only / --tag against assets.yaml).');
    process.exit(1);
  }

  console.log(
    `Plan: ${assets.length} asset(s) × ${candidates} candidate(s) × ${variantKeys.length} model(s) = ${assets.length * candidates * variantKeys.length} generations.`,
  );
  console.log(
    `Models run one at a time (model-major batching — see generate.mjs header) to minimize checkpoint-swap cost.`,
  );

  console.log(`Opening SSH tunnel to ${flags.host}:${flags.port} → local:${LOCAL_TUNNEL_PORT}...`);
  const tunnel = openTunnel(flags.host, flags.port);
  try {
    await waitForTunnel();
    console.log('Tunnel up. ComfyUI reachable.');

    for (const variantKey of variantKeys) {
      const variant = MODEL_VARIANTS[variantKey];
      console.log(`\n=== Model: ${variantKey} (${variant.label}) ===`);

      for (const asset of assets) {
        const outDir = join(STAGING, variantKey, asset.name);
        mkdirSync(outDir, { recursive: true });
        console.log(
          `Generating ${asset.name} (${candidates} candidate(s), ${asset.width}x${asset.height}) ...`,
        );

        for (let c = 1; c <= candidates; c++) {
          const outPath = join(outDir, `candidate-${c}.png`);
          try {
            await generateOne(asset, variantKey, asset.width, asset.height, outPath);
            console.log(`  candidate-${c} → ${outPath}`);
          } catch (err) {
            console.error(`  candidate-${c} FAILED (attempt 1): ${err.message}`);
            console.log('  Retrying once with a new seed...');
            try {
              await generateOne(asset, variantKey, asset.width, asset.height, outPath);
              console.log(`  candidate-${c} → ${outPath} (retry succeeded)`);
            } catch (retryErr) {
              console.error(`  candidate-${c} FAILED (attempt 2, giving up): ${retryErr.message}`);
            }
          }
        }
      }
    }
  } finally {
    tunnel.kill();
    console.log('Tunnel closed.');
  }

  console.log(`\nDone. Staged images in ${STAGING}/<model>/<asset-name>/candidate-N.png`);
  console.log(
    'Next: node bin/ingest.mjs --manifest <manifest> to verify + normalize before review.',
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
