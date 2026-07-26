#!/usr/bin/env node
// Controls a RunPod GPU pod used for AI asset generation. Talks to RunPod's
// REST API directly — no SDK dependency, stdlib-only.
//
// Usage:
//   node bin/runpod.mjs start   [--profile sdxl|flux2] [--gpu "<name>"] [--template <id>] [--containerDisk N] [--volume N]
//   node bin/runpod.mjs status  <podId>
//   node bin/runpod.mjs stop    <podId>           # terminates (deletes pod + volume)
//   node bin/runpod.mjs stop    <podId> --pause    # stops only (keeps disk, still billed)
//
// Two built-in GPU profiles (see docs/PLAYBOOK.md and docs/FLUX2_A100.md):
//   sdxl  (default) — RTX 4090, enough for the two default 7B-class SDXL
//                      checkpoints at 1024². Cheapest option, use unless
//                      you specifically need FLUX.2.
//   flux2            — A100 80GB, required for FLUX.2 [dev] fp8's ~32GB
//                      VRAM footprint and its three separate model files.
//
// Requires RUNPOD_KEY in .env (see .env.example). Starting a pod costs real
// money — this script always prints the estimated $/hr and requires typing
// "yes" before it launches anything. It never auto-starts a pod on its own.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

const ROOT = process.cwd();
const API_BASE = 'https://rest.runpod.io/v1';

function loadEnvKey(name) {
  if (process.env[name]) return process.env[name];
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return undefined;
  const line = readFileSync(envPath, 'utf8')
    .split('\n')
    .find((l) => l.startsWith(`${name}=`));
  return line
    ? line
        .slice(name.length + 1)
        .trim()
        .replace(/^["']|["']$/g, '')
    : undefined;
}

const RUNPOD_KEY = loadEnvKey('RUNPOD_KEY');
if (!RUNPOD_KEY) {
  console.error(
    'RUNPOD_KEY not found in environment or .env. Copy .env.example to .env and fill it in. Aborting.',
  );
  process.exit(1);
}

async function runpodFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${RUNPOD_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`RunPod API ${options.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  return body;
}

async function confirm(promptText) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${promptText} (type "yes" to continue): `);
  rl.close();
  return answer.trim().toLowerCase() === 'yes';
}

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

// Official RunPod "ComfyUI" template (docs.runpod.io/tutorials/pods/comfyui):
// pre-installed ComfyUI + Manager, SSH on 22/tcp, ComfyUI API on 8188/http.
const DEFAULT_TEMPLATE = 'cw3nka7d08';

// GPU profiles. `gpu` is the exact string the RunPod REST API expects for
// gpuTypeIds — verified working values, don't guess new ones (the API wants
// a specific enum-like value that sometimes differs from the dashboard
// display name, e.g. A100 is "NVIDIA A100-SXM4-80GB" not "NVIDIA A100 80GB").
const GPU_PROFILES = {
  sdxl: {
    gpu: 'NVIDIA GeForce RTX 4090',
    containerDiskInGb: 50,
    volumeInGb: 20,
    note: 'Default profile — the two built-in 7B-class SDXL checkpoints (see docs/PLAYBOOK.md) fit comfortably.',
  },
  flux2: {
    gpu: 'NVIDIA A100-SXM4-80GB',
    containerDiskInGb: 100,
    volumeInGb: 20,
    note: 'FLUX.2 [dev] fp8 needs ~32GB VRAM + ~54GB combined model-file disk. See docs/FLUX2_A100.md.',
  },
  audio: {
    gpu: 'NVIDIA GeForce RTX 4090',
    containerDiskInGb: 50,
    volumeInGb: 20,
    note: 'Stable Audio Open 1.0 (~1.2B params, single checkpoint + t5-base CLIP) — comfortably fits the same 4090 tier as sdxl. See docs/AUDIO.md.',
  },
};

async function cmdStart(flags) {
  const profileKey = flags.profile ?? 'sdxl';
  const profile = GPU_PROFILES[profileKey];
  if (!profile) {
    console.error(
      `Unknown --profile "${profileKey}". Options: ${Object.keys(GPU_PROFILES).join(', ')}`,
    );
    process.exit(1);
  }

  const gpu = flags.gpu ?? profile.gpu;
  const templateId = flags.template ?? DEFAULT_TEMPLATE;
  const containerDiskInGb = Number(flags.containerDisk ?? profile.containerDiskInGb);
  const volumeInGb = Number(flags.volume ?? profile.volumeInGb);

  console.log(`About to start a pod (profile: ${profileKey}):`);
  console.log(`  GPU:      ${gpu}`);
  console.log(`  Template: ${templateId}`);
  console.log(`  Disk:     container ${containerDiskInGb}GB / volume ${volumeInGb}GB`);
  console.log(`  Ports:    22/tcp (SSH), 8188/http (ComfyUI)`);
  console.log(`  Note:     ${profile.note}`);
  console.log('This will start incurring cost immediately once running.');

  const ok = await confirm('Proceed with starting this pod?');
  if (!ok) {
    console.log('Aborted — no pod started.');
    return;
  }

  const pod = await runpodFetch('/pods', {
    method: 'POST',
    body: JSON.stringify({
      name: `assetgen-${Date.now()}`,
      imageName: 'runpod/comfyui:latest',
      templateId,
      gpuTypeIds: [gpu],
      gpuCount: 1,
      cloudType: 'SECURE',
      ports: ['8188/http', '22/tcp'], // must be an array — a comma-joined string 400s
      containerDiskInGb,
      volumeInGb,
    }),
  });

  console.log(`Pod created: ${pod.id}`);
  console.log(`Estimated cost: $${pod.costPerHr ?? '?'}/hr`);
  console.log(`Run: node bin/runpod.mjs status ${pod.id}   (to poll until ready)`);
}

async function cmdStatus(podId) {
  if (!podId) {
    console.error('Usage: runpod.mjs status <podId>');
    process.exit(1);
  }
  const pod = await runpodFetch(`/pods/${podId}`);
  const ready =
    Boolean(pod.publicIp) && pod.portMappings && Object.keys(pod.portMappings).length > 0;
  console.log(`Pod ${podId}`);
  console.log(`  desiredStatus: ${pod.desiredStatus}`);
  console.log(`  publicIp:      ${pod.publicIp || '(not yet assigned)'}`);
  console.log(`  portMappings:  ${JSON.stringify(pod.portMappings ?? {})}`);
  console.log(`  costPerHr:     $${pod.costPerHr ?? '?'}`);
  console.log(`  ready:         ${ready}`);
  if (ready) {
    const sshPort = pod.portMappings['22'];
    console.log(`  SSH:           ssh root@${pod.publicIp} -p ${sshPort}`);
  }
  return pod;
}

async function cmdStop(podId, flags) {
  if (!podId) {
    console.error('Usage: runpod.mjs stop <podId> [--pause]');
    process.exit(1);
  }
  if (flags.pause) {
    console.log(`Pausing (not deleting) pod ${podId} — disk is kept and still billed.`);
    await runpodFetch(`/pods/${podId}/stop`, { method: 'POST' });
    console.log('Pod stopped.');
    return;
  }
  console.log(`Terminating pod ${podId} — this deletes the pod and its volume.`);
  const ok = await confirm('Confirm termination?');
  if (!ok) {
    console.log('Aborted — pod left running. Remember to stop it manually.');
    return;
  }
  await runpodFetch(`/pods/${podId}`, { method: 'DELETE' });
  console.log('Pod terminated.');
}

async function main() {
  const [, , command, ...rest] = process.argv;
  const { flags, positional } = parseFlags(rest);

  switch (command) {
    case 'start':
      await cmdStart(flags);
      break;
    case 'status':
      await cmdStatus(positional[0]);
      break;
    case 'stop':
      await cmdStop(positional[0], flags);
      break;
    default:
      console.error('Usage: runpod.mjs <start|status|stop> [args]');
      console.error(
        '  start [--profile sdxl|flux2] [--gpu "<name>"] [--containerDisk N] [--volume N]',
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
