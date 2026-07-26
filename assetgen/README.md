# AssetGen

A portable, Claude-driven pipeline for generating app/game **image and
sound** assets on demand: describe what you need in a manifest, it spins up
a RunPod GPU pod, drives ComfyUI to generate candidates, verifies them, and
stages results for manual review — never auto-writing into your real asset
tree.

Drop this whole folder into any project. No install step, no dependencies
beyond Node.js (stdlib-only `.mjs` scripts) — `ssh`, `exiftool`, ImageMagick
(`magick`), and `ffmpeg`/`ffprobe` on `PATH`.

## Philosophy

- **You describe subjects, not prompts.** Manifests list what each asset
  _is_; `bin/prompts.mjs` handles style, framing, and negative-prompt
  engineering from one project-wide style block, so every asset stays
  consistent without you re-typing style keywords 40 times. See
  [`docs/STYLE_GUIDE.md`](docs/STYLE_GUIDE.md) (images) and
  [`docs/AUDIO.md`](docs/AUDIO.md) (sound).
- **Two candidates per asset, by default.** Every asset gets generated
  twice so you have real choice, not a single roll of the dice.
  Configurable via `--candidates`.
- **Images: two models by default**, chosen for genuinely different looks,
  not cost-padding: DreamShaperXL Turbo v2 (painterly/illustrative) and
  Juggernaut XL v9 (photoreal-tuned), both SDXL-class checkpoints on a
  single RTX 4090. FLUX.2 [dev] fp8 is available opt-in on an A100 for
  individual hero images — see [`docs/FLUX2_A100.md`](docs/FLUX2_A100.md).
- **Sound: Stable Audio Open 1.0**, the only open text-to-audio model found
  that's both commercially licensed _and_ has mature native ComfyUI
  support (no custom nodes). See [`docs/AUDIO.md`](docs/AUDIO.md) for the
  license terms and the other models considered and rejected (some for
  non-commercial licensing, some for missing ComfyUI support).
- **Cost-conscious batching.** Generation is grouped model-major (load one
  checkpoint, run every asset against it, then swap) instead of
  interleaving models per asset — avoids repeated checkpoint-swap cost, the
  actual expensive part of a RunPod session. See
  [`docs/PLAYBOOK.md`](docs/PLAYBOOK.md) Lesson 5.
- **Nothing auto-lands in your app.** Generated assets stay in gitignored
  `.assetgen-staging/` until you manually pick winners and copy them into
  your real asset directory. Starting a pod costs real money — `runpod.mjs
start` always prints the estimated $/hr and requires typing "yes".

## Quickstart — images

```bash
cd assetgen/
cp .env.example .env                 # fill in RUNPOD_KEY (+ HF_TOKEN — see below)
cp assets.example.yaml assets.yaml   # fill in project.style + your assets
```

Read [`docs/STYLE_GUIDE.md`](docs/STYLE_GUIDE.md) before writing
`assets.yaml` — setting `project.style` deliberately is the single
highest-leverage thing you can do for output quality and consistency.

```bash
# 1. Sanity-check expanded prompts before spending any GPU time
node bin/prompts.mjs assets.yaml

# 2. Start a pod (prints cost, asks for confirmation)
node bin/runpod.mjs start
node bin/runpod.mjs status <podId>   # poll until ready: true

# 3. SSH in once to relocate checkpoints + download models — see
#    docs/PLAYBOOK.md Lesson 3 and the per-batch checklist at its end
ssh root@<ip> -p <sshPort>

# 4. Spot-check one asset before committing to a full run
node bin/generate.mjs --manifest assets.yaml --host <ip> --port <sshPort> --limit 1

# 5. Full run
node bin/generate.mjs --manifest assets.yaml --host <ip> --port <sshPort>

# 6. Stop the pod immediately — don't let it idle
node bin/runpod.mjs stop <podId>

# 7. Verify + normalize staged candidates
node bin/ingest.mjs

# 8. Manually review .assetgen-staging/<model>/<asset>/ingested/,
#    pick winners, copy into your real asset tree.
```

## Quickstart — sound

```bash
cp sounds.example.yaml sounds.yaml   # fill in project.audio_style + your sounds
```

Read [`docs/AUDIO.md`](docs/AUDIO.md) first — the model choice, license
terms ($1M revenue threshold), and gated-download requirements have sharper
edges than the image side.

```bash
# 1. Sanity-check expanded prompts
node bin/prompts.mjs sounds.yaml --audio

# 2. Start a pod (same RTX 4090 tier as images, different profile name)
node bin/runpod.mjs start --profile audio
node bin/runpod.mjs status <podId>

# 3. SSH in, download the two required model files (gated — needs
#    HF_TOKEN) — see docs/AUDIO.md
ssh root@<ip> -p <sshPort>

# 4. Spot-check, then full run
node bin/generate-audio.mjs --manifest sounds.yaml --host <ip> --port <sshPort> --limit 1
node bin/generate-audio.mjs --manifest sounds.yaml --host <ip> --port <sshPort>

# 5. Stop the pod immediately
node bin/runpod.mjs stop <podId>

# 6. Verify (duration + silence checks) — then LISTEN to every candidate,
#    ingest can't judge whether a sound is actually good
node bin/ingest-audio.mjs --manifest sounds.yaml
```

## Folder contents

```
assetgen/
  README.md                  — this file
  .env.example                — RUNPOD_KEY, HF_TOKEN — copy to .env, never commit
  assets.example.yaml         — image manifest template, copy to assets.yaml
  sounds.example.yaml          — sound manifest template, copy to sounds.yaml
  bin/
    prompts.mjs                — manifest → full prompt expansion, both image (expandManifest)
                                  and audio (expandAudioManifest); also a standalone CLI
    runpod.mjs                  — pod lifecycle: start / status / stop (profiles: sdxl, flux2, audio)
    generate.mjs                 — drives ComfyUI for images, stages candidates
    generate-audio.mjs            — drives ComfyUI for sound, stages candidates
    ingest.mjs                     — image provenance check + JPEG q90 normalize
    ingest-audio.mjs                — audio duration + silence QA checks
  docs/
    STYLE_GUIDE.md              — how to define your project's visual style
    PLAYBOOK.md                  — image pipeline: operational lessons, model comparison
    FLUX2_A100.md                 — FLUX.2 [dev] fp8 setup path (opt-in, A100 only)
    AUDIO.md                       — sound pipeline: model/license choice, ComfyUI setup, lessons
```

## Where staged output goes

```
.assetgen-staging/
  <model>/                    ← images, one dir per image model (dreamshaper, juggernaut, flux2)
    <asset-name>/
      candidate-1.png
      candidate-2.png
      ingested/
        candidate-1.jpg       ← provenance-checked, normalized (JPEG q90)
        candidate-2.jpg
  audio/                      ← sound, single model, no per-model subdir
    <asset-name>/
      candidate-1.mp3
      candidate-2.mp3
```

Add `.assetgen-staging/` to your project's `.gitignore` — it's working
storage, not a deliverable.

## Extending

- **More image models:** add an entry to `MODEL_VARIANTS` in
  `bin/generate.mjs` (SDXL-shaped checkpoints reuse `buildSdxlWorkflow`;
  Flux-family models need their own `kind` and workflow builder, following
  `buildFlux2Workflow` as a template).
- **More aspect ratios:** add to `ASPECT_DIMENSIONS` in `bin/prompts.mjs`.
- **A second audio model** (e.g. ACE-Step for music, once you need
  generated BGM rather than SFX): add its workflow builder to
  `generate-audio.mjs` following `buildWorkflow` as a template — the node
  graph differs from Stable Audio Open's, see `docs/AUDIO.md`'s model
  comparison table for the specific node names to expect.
- **Different GPU/profile:** add to `GPU_PROFILES` in `bin/runpod.mjs`.
- **A real YAML parser:** `bin/prompts.mjs` ships a minimal indent-based
  YAML subset parser (no dependency) covering exactly what the two example
  manifests use. If your manifest needs real YAML features (anchors,
  multi-document, flow mappings), swap in a proper parser (`js-yaml`) and
  keep `loadManifest()`'s return shape (`{ project, assets }`) the same —
  nothing downstream needs to change.
