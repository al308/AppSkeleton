#!/usr/bin/env node
// Drives ComfyUI on a running RunPod pod (started via runpod.mjs) to generate
// puzzle images from tools/genart/prompts.ts, retrieving results to
// tools/.genart-staging/<world>/. See docs/specs/genart-pipeline.md.
//
// Usage:
//   node tools/genart/generate.mjs <world> --host <ip> --port <sshPort> [--limit N]
//
// Requires an SSH tunnel to the pod's ComfyUI port (8188) — this script opens
// one itself for the duration of the run via `ssh -L`.

import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = process.cwd();
const STAGING = join(ROOT, 'tools', '.genart-staging');
const LOCAL_TUNNEL_PORT = 18188;

// Generic anti-artifact vocabulary on top of the content negatives — SDXL
// (especially at low step counts) is prone to duplicating symmetric/repeated
// objects (hoops, wheels, limbs). Observed directly: DreamShaperXL Turbo at
// 8 steps produced a double-basketball-hoop artifact on `basketball.jpg`.
const NEGATIVE_PROMPT =
  'text, watermark, photo, photorealistic, low quality, duplicate, deformed, extra limbs, malformed, disfigured, mutated, multiple heads, cloned object, warped geometry, distorted proportions';

// Four model variants for side-by-side quality comparison (see
// docs/specs/genart-pipeline.md). Each has its own recommended sampler
// settings; `sdxl`-kind graphs (dreamshaper, juggernaut) share a shape,
// `flux` differs (FluxGuidance node instead of a negative-prompt CFG, CFG
// pinned to 1.0). SDXL Base 1.0 was tried and dropped — consistently weaker
// than the other three per user review.
const MODEL_VARIANTS = {
  flux: {
    checkpoint: 'flux1-dev-fp8.safetensors',
    kind: 'flux',
    steps: 20,
    guidance: 3.5,
  },
  flux2: {
    // FLUX.2 [dev] fp8 ships as three separate files (not one bundled
    // checkpoint like FLUX.1) — see Lesson 8 in docs/GENART_PLAYBOOK.md.
    unet: 'flux2_dev_fp8mixed.safetensors',
    clip: 'mistral_3_small_flux2_fp8.safetensors',
    vae: 'flux2-vae.safetensors',
    kind: 'flux2',
    steps: 20,
    guidance: 3.5,
  },
  dreamshaper: {
    checkpoint: 'DreamShaperXL_Turbo_v2.safetensors',
    kind: 'sdxl',
    steps: 20, // bumped from 8 — low step count drove the double-hoop artifact
    cfg: 2.0,
    sampler_name: 'dpmpp_sde',
    scheduler: 'karras',
  },
  juggernaut: {
    checkpoint: 'Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors',
    kind: 'sdxl',
    steps: 30,
    cfg: 5.0,
    sampler_name: 'dpmpp_2m',
    scheduler: 'karras',
  },
};

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

function buildSdxlWorkflow(variant, prompt, seed) {
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
    4: {
      class_type: 'CheckpointLoaderSimple',
      inputs: { ckpt_name: variant.checkpoint },
    },
    5: {
      class_type: 'EmptyLatentImage',
      inputs: { width: 1024, height: 1024, batch_size: 1 },
    },
    6: {
      class_type: 'CLIPTextEncode',
      inputs: { text: prompt, clip: ['4', 1] },
    },
    7: {
      class_type: 'CLIPTextEncode',
      inputs: { text: NEGATIVE_PROMPT, clip: ['4', 1] },
    },
    8: {
      class_type: 'VAEDecode',
      inputs: { samples: ['3', 0], vae: ['4', 2] },
    },
    9: {
      class_type: 'SaveImage',
      inputs: { filename_prefix: 'shiffle', images: ['8', 0] },
    },
  };
}

function buildFluxWorkflow(variant, prompt, seed) {
  // Flux ignores negative-prompt CFG guidance (CFG is pinned to 1.0); prompt
  // strength instead comes from the FluxGuidance node.
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
    4: {
      class_type: 'CheckpointLoaderSimple',
      inputs: { ckpt_name: variant.checkpoint },
    },
    5: {
      class_type: 'EmptyLatentImage',
      inputs: { width: 1024, height: 1024, batch_size: 1 },
    },
    6: {
      class_type: 'CLIPTextEncode',
      // Flux has no working negative-prompt path (CFG pinned to 1.0), so
      // "no people" must be reinforced in the positive prompt itself — Flux
      // otherwise tends to add a human silhouette for scale/mood even when
      // told not to (observed in testing).
      inputs: {
        text: `${prompt}, completely empty and uninhabited, no human figures anywhere in the frame`,
        clip: ['4', 1],
      },
    },
    7: {
      class_type: 'CLIPTextEncode',
      inputs: { text: '', clip: ['4', 1] },
    },
    8: {
      class_type: 'VAEDecode',
      inputs: { samples: ['3', 0], vae: ['4', 2] },
    },
    9: {
      class_type: 'SaveImage',
      inputs: { filename_prefix: 'shiffle', images: ['8', 0] },
    },
    10: {
      class_type: 'FluxGuidance',
      inputs: { conditioning: ['6', 0], guidance: variant.guidance },
    },
  };
}

function buildFlux2Workflow(variant, prompt, seed) {
  // FLUX.2 [dev] loads three separate model files via dedicated loaders
  // (UNETLoader/CLIPLoader/VAELoader) instead of one CheckpointLoaderSimple,
  // and uses the Flux2-specific empty-latent node. Text encoder is Mistral-3
  // small, not T5 — same "no working negative prompt" caveat as FLUX.1
  // applies (cfg pinned to 1.0, FluxGuidance drives prompt strength).
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
    4: {
      class_type: 'UNETLoader',
      inputs: { unet_name: variant.unet, weight_dtype: 'default' },
    },
    5: {
      class_type: 'EmptyFlux2LatentImage',
      inputs: { width: 1024, height: 1024, batch_size: 1 },
    },
    6: {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: `${prompt}, completely empty and uninhabited, no human figures anywhere in the frame`,
        clip: ['11', 0],
      },
    },
    7: {
      class_type: 'CLIPTextEncode',
      inputs: { text: '', clip: ['11', 0] },
    },
    8: {
      class_type: 'VAEDecode',
      inputs: { samples: ['3', 0], vae: ['12', 0] },
    },
    9: {
      class_type: 'SaveImage',
      inputs: { filename_prefix: 'shiffle', images: ['8', 0] },
    },
    10: {
      class_type: 'FluxGuidance',
      inputs: { conditioning: ['6', 0], guidance: variant.guidance },
    },
    11: {
      class_type: 'CLIPLoader',
      inputs: { clip_name: variant.clip, type: 'flux2' },
    },
    12: {
      class_type: 'VAELoader',
      inputs: { vae_name: variant.vae },
    },
  };
}

function buildWorkflow(variantKey, prompt, seed) {
  const variant = MODEL_VARIANTS[variantKey];
  if (!variant) {
    throw new Error(
      `Unknown model variant "${variantKey}". Options: ${Object.keys(MODEL_VARIANTS).join(', ')}`,
    );
  }
  if (variant.kind === 'flux2') return buildFlux2Workflow(variant, prompt, seed);
  return variant.kind === 'flux'
    ? buildFluxWorkflow(variant, prompt, seed)
    : buildSdxlWorkflow(variant, prompt, seed);
}

function openTunnel(host, port) {
  const ssh = spawn(
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
  return ssh;
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
    body: JSON.stringify({ prompt: workflow, client_id: 'shiffle-genart' }),
  });
  if (!res.ok) {
    throw new Error(`/prompt failed: ${res.status} ${await res.text()}`);
  }
  const body = await res.json();
  return body.prompt_id;
}

async function waitForHistory(promptId, timeoutMs = 300000) {
  // First generation after a pod boot pays a one-time model-load cost (CLIP +
  // UNet staged into VRAM) that alone can take ~2min even for a 1-step Turbo
  // run; subsequent prompts in the same session are much faster. 5min covers
  // cold start with margin.
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

async function generateOne(p, variantKey, outDir) {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const workflow = buildWorkflow(variantKey, p.prompt, seed);
  const promptId = await submitPrompt(workflow);
  const entry = await waitForHistory(promptId);
  const images = entry.outputs?.['9']?.images ?? [];
  if (images.length === 0) {
    throw new Error(`No output images for ${p.filename} (prompt ${promptId})`);
  }
  const outPath = join(outDir, p.filename.replace(/\.jpg$/, '.png'));
  await downloadImage(images[0], outPath);
  return outPath;
}

async function main() {
  const [, , world, ...rest] = process.argv;
  const { flags } = parseFlags(rest);
  if (!world || !flags.host || !flags.port) {
    console.error(
      'Usage: generate.mjs <world> --host <ip> --port <sshPort> [--model flux|flux2|dreamshaper|juggernaut] [--limit N]',
    );
    process.exit(1);
  }

  const variantKeys = flags.model ? [flags.model] : Object.keys(MODEL_VARIANTS);
  for (const key of variantKeys) {
    if (!MODEL_VARIANTS[key]) {
      console.error(`Unknown --model "${key}". Options: ${Object.keys(MODEL_VARIANTS).join(', ')}`);
      process.exit(1);
    }
  }

  const { PROMPTS } = await import('./prompts.mjs');
  let worldPrompts = PROMPTS.filter((p) => p.world === world);
  if (flags.limit) worldPrompts = worldPrompts.slice(0, Number(flags.limit));
  if (worldPrompts.length === 0) {
    console.error(`No prompts found for world "${world}" in prompts.mjs`);
    process.exit(1);
  }

  console.log(`Opening SSH tunnel to ${flags.host}:${flags.port} → local:${LOCAL_TUNNEL_PORT}...`);
  const tunnel = openTunnel(flags.host, flags.port);
  try {
    await waitForTunnel();
    console.log('Tunnel up. ComfyUI reachable.');

    for (const variantKey of variantKeys) {
      const outDir = join(STAGING, world, variantKey);
      mkdirSync(outDir, { recursive: true });
      console.log(`\n=== Model: ${variantKey} ===`);

      for (const p of worldPrompts) {
        console.log(`Generating ${p.filename} ...`);
        try {
          const outPath = await generateOne(p, variantKey, outDir);
          console.log(`  → ${outPath}`);
        } catch (err) {
          console.error(`  FAILED (attempt 1): ${err.message}`);
          console.log('  Retrying once with a new seed...');
          try {
            const outPath = await generateOne(p, variantKey, outDir);
            console.log(`  → ${outPath} (retry succeeded)`);
          } catch (retryErr) {
            console.error(`  FAILED (attempt 2, giving up): ${retryErr.message}`);
          }
        }
      }
    }
  } finally {
    tunnel.kill();
    console.log('Tunnel closed.');
  }

  console.log(`\nDone. Staged images in ${join(STAGING, world)}/<model>/`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
