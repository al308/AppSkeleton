#!/usr/bin/env node
// Controls a RunPod GPU pod used for AI asset generation (see
// docs/specs/genart-pipeline.md). Talks to RunPod's REST API directly —
// no SDK dependency, matching the rest of tools/ (stdlib-only where possible).
//
// Usage:
//   node tools/genart/runpod.mjs start   [--gpu "NVIDIA GeForce RTX 4090"] [--template <templateId>] [--containerDisk 50] [--volume 20]
//   node tools/genart/runpod.mjs status  <podId>
//   node tools/genart/runpod.mjs stop    <podId>           # terminates (deletes pod + volume)
//   node tools/genart/runpod.mjs stop    <podId> --pause   # stops only (keeps disk, still billed)
//
// FLUX.2 [dev] fp8 needs an A100 80GB (~32GB VRAM footprint) and more disk
// than the RTX 4090/Flux.1 default (three separate model files, larger than
// one Flux.1 checkpoint) — use:
//   node tools/genart/runpod.mjs start --gpu "NVIDIA A100 80GB" --containerDisk 100 --volume 20
//
// Requires RUNPOD_KEY in .env (already present). Starting a pod costs real
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
  console.error('RUNPOD_KEY not found in environment or .env. Aborting.');
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

const DEFAULT_GPU = 'NVIDIA GeForce RTX 4090';
// Official RunPod "ComfyUI" template (docs.runpod.io/tutorials/pods/comfyui):
// pre-installed ComfyUI + Manager, SSH on 22/tcp, ComfyUI API on 8188/http.
const DEFAULT_TEMPLATE = 'cw3nka7d08';

async function cmdStart(flags) {
  const gpu = flags.gpu ?? DEFAULT_GPU;
  const templateId = flags.template ?? DEFAULT_TEMPLATE;
  const containerDiskInGb = Number(flags.containerDisk ?? 50);
  const volumeInGb = Number(flags.volume ?? 20);

  console.log(`About to start a pod:`);
  console.log(`  GPU:      ${gpu}`);
  console.log(`  Template: ${templateId}`);
  console.log(`  Disk:     container ${containerDiskInGb}GB / volume ${volumeInGb}GB`);
  console.log(`  Ports:    22/tcp (SSH), 8188/http (ComfyUI)`);
  console.log('This will start incurring cost immediately once running.');

  const ok = await confirm('Proceed with starting this pod?');
  if (!ok) {
    console.log('Aborted — no pod started.');
    return;
  }

  const pod = await runpodFetch('/pods', {
    method: 'POST',
    body: JSON.stringify({
      name: `shiffle-genart-${Date.now()}`,
      imageName: 'runpod/comfyui:latest',
      templateId,
      gpuTypeIds: [gpu],
      gpuCount: 1,
      cloudType: 'SECURE',
      ports: ['8188/http', '22/tcp'],
      containerDiskInGb,
      volumeInGb,
    }),
  });

  console.log(`Pod created: ${pod.id}`);
  console.log(`Estimated cost: $${pod.costPerHr ?? '?'}/hr`);
  console.log(`Run: node tools/genart/runpod.mjs status ${pod.id}   (to poll until ready)`);
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
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
