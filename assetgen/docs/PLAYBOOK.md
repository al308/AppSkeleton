# AssetGen Playbook — operational lessons

Everything here was learned the hard way running this pipeline for real
against RunPod + ComfyUI. Read this before your first real batch — it'll
save you a wasted pod session.

## Pipeline shape

```
bin/runpod.mjs start     → boots a pod from the ComfyUI template, prints SSH info
bin/generate.mjs         → SSH tunnel to ComfyUI API, submits prompts from
                            assets.yaml (via prompts.mjs), retrieves images
                            to .assetgen-staging/<model>/<asset>/candidate-N.png
bin/ingest.mjs            → exiftool provenance check + JPEG q90 normalize,
                            reports pass/fail per candidate
bin/runpod.mjs stop       → terminate pod — do this immediately after the
                            last batch, never leave a pod idling
```

Nothing here ever writes into your project's real asset directory —
generated images stay in gitignored `.assetgen-staging/` until you manually
review and copy the winning candidate(s) in.

## Model defaults & why

Two SDXL-class checkpoints ship as the default pair on the RTX 4090 profile
(`bin/generate.mjs`'s `MODEL_VARIANTS`), chosen after comparing four
checkpoints across real batches:

| Model                                         | Verdict                  | Notes                                                                                                                              |
| --------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| SDXL Base 1.0                                 | dropped                  | Consistently weak across a full comparison batch.                                                                                  |
| SDXL-Turbo                                    | dropped                  | Fast (1 step) but very low quality — only useful for pipeline smoke-tests.                                                         |
| **DreamShaperXL Turbo v2**                    | ✅ default               | Best _average_ quality, strong painterly/illustration look. Must run at **20 steps**, not its native 8 (Lesson 1).                 |
| **Juggernaut XL v9** (`RunDiffusionPhoto_v2`) | ✅ default               | Photo-realism-tuned SDXL finetune. Pairs well with DreamShaper because the two looks are genuinely different, not near-duplicates. |
| FLUX.2 [dev] fp8                              | opt-in (`--model flux2`) | Best raw aesthetic on individual images but needs an A100, not the 4090. See `docs/FLUX2_A100.md`.                                 |

Generating **2 candidates per asset per model by default** (configurable via
`--candidates`) gives real choice without tripling cost — in practice one
of the two default models usually "wins" per asset, and having 2 seeds per
model catches the occasional bad roll (morphed limb, wrong framing) without
a full re-run.

## Lessons learned

### 1. Never run a "Turbo" checkpoint at its marketed minimum step count

Low step counts (SDXL-Turbo-style checkpoints at their native ~8 steps)
reliably produce **duplicated or morphed symmetric elements** — extra
limbs, doubled circular objects, cloned repeated shapes. This is a general
SDXL failure mode at low sampling budgets, not specific to one checkpoint.

**Fix, already applied in `bin/generate.mjs`:** DreamShaperXL Turbo runs at
20 steps (not 8), and `prompts.mjs` always appends a generic anti-artifact
negative-prompt block (`duplicate, deformed, extra limbs, malformed,
disfigured, mutated, multiple heads, cloned object, warped geometry,
distorted proportions`) to every asset automatically. Confirm any new
"Turbo"-branded checkpoint with a single test image before a full batch.

### 2. Flux has no working negative-prompt path

Flux pins `cfg` to `1.0`, so the usual negative-conditioning trick (a
`CLIPTextEncode` wired into KSampler's `negative` input) **has no effect**.
Flux will ignore exclusions stated only in the negative prompt and
sometimes invent unwanted elements (e.g. a person, for scale/mood) even
when explicitly excluded.

**Fix, already applied in `generate.mjs`'s `buildFlux2Workflow`:**
exclusions are reinforced directly in the _positive_ prompt text
(`"...absolutely no: <exclusions>"`), and prompt strength comes from a
`FluxGuidance` node on the positive conditioning, not CFG.

### 3. RunPod's ComfyUI template ships with zero checkpoints and a small `/workspace` volume

The official template (`cw3nka7d08`, `runpod/comfyui:latest`) has SSH +
ComfyUI API pre-wired but **no model weights** — first action on any fresh
pod is always a checkpoint download. `/workspace` (the network-backed
volume) is capacity-constrained — a single 7GB+ SDXL checkpoint can eat
most of a 20GB volume, and it gets tight fast with two checkpoints.

**Fix — do this immediately after every fresh pod boot, before downloading
anything:**

```bash
mv /workspace/runpod-slim/ComfyUI/models/checkpoints /root/checkpoints-real
ln -s /root/checkpoints-real /workspace/runpod-slim/ComfyUI/models/checkpoints
```

This relocates checkpoints onto the pod's `/` overlay disk
(`containerDiskInGb`, 50GB default, otherwise unused) via a symlink ComfyUI
follows transparently.

### 4. RunPod REST API quirks

- `ports` in the pod-create body must be a **JSON array**
  (`["8188/http","22/tcp"]`), not a comma-joined string — the string form
  400s with a schema error that's easy to misdiagnose as a template
  problem.
- `POST /pods/{id}/stop` **pauses** (disk kept, still billed);
  `DELETE /pods/{id}` **terminates** (deletes pod + volume). `runpod.mjs
stop` terminates by default — pass `--pause` for the
  cheaper-but-still-billing pause explicitly.
- Occasional transient `500 "This machine does not have the resources to
deploy your pod"` on `POST /pods` for a specific backing host — not a
  real account-level capacity ceiling. Retrying the identical request lands
  on a different host and succeeds.
- GPU type strings for the REST API sometimes differ from the dashboard
  display name (e.g. A100 80GB is `"NVIDIA A100-SXM4-80GB"`, not `"NVIDIA
A100 80GB"`). Verified values are baked into `runpod.mjs`'s
  `GPU_PROFILES` — don't guess new ones without checking the API response.

### 5. First inference after a pod boot is slow — this is why model-major batching matters

Model load (CLIP + UNet staged into VRAM) plus ComfyUI-Manager's registry
sync on startup adds **~2–2.5 minutes** before the first image even starts
sampling, even for a fast checkpoint. Every subsequent prompt against an
**already-loaded** checkpoint is much faster. `generate.mjs` exploits this
by processing one model checkpoint at a time across every asset (all of
`dreamshaper`'s work, then all of `juggernaut`'s) instead of interleaving —
this is what "batching" means in this pipeline's cost model: minimizing
checkpoint _swaps_, not GPU-level `batch_size` parallelism. Its poll
timeout is 5 minutes to cover cold start with margin.

### 6. ComfyUI embeds the full workflow (including your prompt) as PNG metadata for free

Every generated PNG carries its full ComfyUI workflow JSON — model, sampler
settings, literal prompt string — under an exiftool-visible `Prompt` tag.
Strong, verifiable self-generation provenance on top of `ingest.mjs`'s
third-party-signature check, if you ever need a stronger provenance
argument (App Store review pushback, licensing audit, etc.).

### 7. Square output isn't automatic — enforce it at generation time, not at render time

If your app center-crops non-square images at render time
(`resizeMode="cover"` or equivalent), it's tempting to let the pipeline
generate slightly-off-ratio images and rely on the crop. Don't — a future
UI change that stops cropping will silently break every asset generated
that way. `prompts.mjs`'s `ASPECT_DIMENSIONS` table always requests exact
target dimensions per aspect ratio; keep it that way.

## Per-batch checklist

1. `node bin/runpod.mjs start` (default `--profile sdxl`) — confirm
   GPU/cost, wait for `ready: true`.
2. SSH in once, relocate `checkpoints/` onto the overlay disk (Lesson 3).
3. Download whichever checkpoint(s) the batch needs.
4. `node bin/prompts.mjs assets.yaml` — sanity-check the expanded prompts
   _before_ spending GPU time; fix `description`/`style` issues here, not
   after a full run.
5. `node bin/generate.mjs --manifest assets.yaml --host <ip> --port <sshPort>`
   — spot-check with `--limit 1` first; cheaper to catch a bad prompt or
   graph issue on one asset than after dozens of generations.
6. Run the full manifest once the spot-check looks right.
7. `node bin/runpod.mjs stop <podId>` — **immediately** after the last
   batch.
8. `node bin/ingest.mjs` — provenance + normalize.
9. Manually review `.assetgen-staging/<model>/<asset>/ingested/`, pick the
   best candidate per asset (mixing models across assets is fine and
   expected), copy chosen files into your real asset tree, wire them into
   your app's asset registry.
