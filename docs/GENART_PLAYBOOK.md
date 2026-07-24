# AI Asset Generation Playbook — RunPod + ComfyUI

> Operational record of how Shiffle's puzzle-world images get generated: pod
> lifecycle, model choices, and the traps hit along the way. Companion to
> [asset-prompts.md](./asset-prompts.md) (the prompt content itself) and
> [specs/genart-pipeline.md](./specs/genart-pipeline.md) (the original spec).
> This doc is the operational history + lessons; update it whenever the
> pipeline or model choice changes.

## What this is

Claude drives a RunPod GPU pod over SSH end-to-end — start pod, generate via
ComfyUI's HTTP API, retrieve images, check provenance, stage for review — for
Shiffle's puzzle-world images. Tooling lives in `tools/genart/`:

- `runpod.mjs` — pod lifecycle (`start` / `status` / `stop`)
- `generate.mjs` — drives ComfyUI over an SSH tunnel from `prompts.mjs`
- `ingest.mjs` — exiftool provenance check + JPEG q90 normalization
- `prompts.mjs` — the prompt list (mirrors `asset-prompts.md`)

Nothing here auto-writes to `assets/` or `images.ts`/`levels.ts` — generated
images land in gitignored `tools/.genart-staging/<world>/<model>/`, get
reviewed, and are copied into the real asset tree by hand (or by Claude, with
explicit per-batch approval).

## Model history & current recommendation

| Model                                         | Verdict              | Notes                                                                                                                                                                                                                                                                                             |
| --------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SDXL-Turbo                                    | dropped              | Fast (1 step) but very low quality; only used for the first pipeline smoke-test.                                                                                                                                                                                                                  |
| SDXL Base 1.0                                 | dropped              | Full multi-step run, still "durchweg schlecht" (uniformly weak) per user review of a full comparison batch. Removed from `MODEL_VARIANTS`.                                                                                                                                                        |
| **DreamShaperXL Turbo v2**                    | ✅ keep              | Best _average_ quality, strong painterly/illustration look. Must run at **20 steps**, not its native 8 — see Lesson 1.                                                                                                                                                                            |
| **Flux.1-dev (fp8)**                          | ✅ keep, selectively | Best raw aesthetic on individual images, inconsistent overall. Needs the no-people workaround — see Lesson 2. Good for a specific "hero" image when DreamShaper/Juggernaut don't land it.                                                                                                         |
| **Juggernaut XL v9** (`RunDiffusionPhoto_v2`) | ✅ keep              | Photo-realism-tuned SDXL finetune, added because the user prefers a photoreal look over illustration. Current default for most worlds.                                                                                                                                                            |
| **FLUX.2 [dev] (fp8)**                        | 🧪 evaluating        | Newer, larger Flux generation — needs an A100 80GB (not the RTX 4090 used for everything else). Full 31-prompt set (all 5 worlds: `planeten`, `fahrzeuge`, `kosmos`, `sport`, `urban`) generated across two A100 sessions and passed ingest 2026-07-24; pending user visual review. See Lesson 8. |

Current production settings (see `tools/genart/generate.mjs` `MODEL_VARIANTS`):

```
flux:        steps 20, guidance 3.5, cfg 1.0 (pinned)
flux2:       steps 20, guidance 3.5, cfg 1.0 (pinned)
dreamshaper:  steps 20, cfg 2.0, dpmpp_sde/karras
juggernaut:   steps 30, cfg 5.0, dpmpp_2m/karras
```

## Lessons learned

### 1. Low step counts cause duplicate/morphed objects, independent of model

DreamShaperXL Turbo's native setting is ~8 steps. At that count it produced a
**double basketball hoop** on `sport/basketball.jpg` — a classic SDXL failure
mode for symmetric or repeated objects (hoops, wheels, limbs) at low sampling
budgets, not a defect specific to this checkpoint. Fixed by:

- Bumping steps from 8 → 20 (still fast, much more stable).
- Adding generic anti-artifact vocabulary to the shared negative prompt:
  `duplicate, deformed, extra limbs, malformed, disfigured, mutated, multiple
heads, cloned object, warped geometry, distorted proportions`.

**Rule:** never run a "Turbo"-branded SDXL checkpoint at its marketed
1-8-step minimum for anything with repeated/symmetric elements. Confirm with
a 1-image test before committing to a full batch.

### 2. Flux has no working negative-prompt path — content exclusions must go in the positive prompt

Flux pins `cfg` to `1.0` (its documented required setting), which means the
usual negative-conditioning trick (a separate `CLIPTextEncode` with "no
people, no text" wired into KSampler's `negative` input) has **no effect** —
Flux ignored `"no people"` and repeatedly invented a human silhouette for
scale/mood even when the prompt explicitly excluded it. Prompt strength comes
from a `FluxGuidance` node on the _positive_ conditioning instead.

**Fix:** append hard exclusions directly to the positive prompt text, e.g.
`"...completely empty and uninhabited, no human figures anywhere in the
frame"`. Verified this removes the artifact on re-test.

### 3. RunPod's ComfyUI template ships with zero checkpoints and a 20GB `/workspace` volume

The official template (`cw3nka7d08`, `runpod/comfyui:latest`) has SSH +
ComfyUI API pre-wired but **no model weights** — the first action on any
fresh pod is always a checkpoint download. Worse, `/workspace` (the
network-backed volume, sized by `volumeInGb`) is capacity-constrained — one
17GB Flux checkpoint alone can exceed a 20GB volume once the base image's own
footprint is counted.

**Fix, do this immediately after every fresh pod boot, before downloading
anything:**

```bash
mv /workspace/runpod-slim/ComfyUI/models/checkpoints /root/checkpoints-real
ln -s /root/checkpoints-real /workspace/runpod-slim/ComfyUI/models/checkpoints
```

This relocates the checkpoints directory onto the pod's `/` overlay disk
(`containerDiskInGb`, defaults to 50GB, effectively unused otherwise) via a
symlink ComfyUI follows transparently.

### 4. RunPod REST API quirks

- `ports` in the pod-create body must be a **JSON array**
  (`["8188/http","22/tcp"]`), not a comma-joined string — the string form
  fails a 400 schema error that's easy to misdiagnose as a template problem.
- `POST /pods/{id}/stop` **pauses** (disk kept, still billed);
  `DELETE /pods/{id}` **terminates** (deletes pod + volume). The pipeline's
  `runpod.mjs stop` terminates by default; pass `--pause` for the
  cheaper-but-still-billing pause explicitly.
- Occasional transient `500 "This machine does not have the resources to
deploy your pod"` on `POST /pods` for a specific backing host — not a real
  account-level capacity ceiling. Retrying the identical request lands on a
  different host and succeeds.
- GPU type string for the REST API is the plain display name, e.g.
  `"NVIDIA GeForce RTX 4090"`.

### 5. First inference after a pod boot is slow — budget for it, don't mistake it for a hang

Model load (CLIP + UNet staged into VRAM) plus ComfyUI-Manager's registry
sync on startup can add **~2–2.5 minutes** before the first image even starts
sampling, even for a fast/low-step model. `generate.mjs`'s poll timeout is
5 minutes to cover this with margin. Every prompt after the first in the same
session is much faster (VRAM-resident model).

### 6. ComfyUI embeds the full workflow (including your prompt text) as PNG metadata for free

Every generated PNG carries its full ComfyUI workflow JSON — model, sampler
settings, and the literal prompt string — under an exiftool-visible `Prompt`
tag. This is strong, verifiable self-generation provenance on top of the
existing Picsum/Unsplash-signature check (see
[LESSONS.md's licensing guidance](./LESSONS.md)) — `ingest.mjs` doesn't
currently assert on it, but it's there if a stronger provenance check is ever
needed.

### 7. Real (photographed) source images may not be true 1:1 squares — don't let that slide into new pipeline output

The pre-existing `natur` world's 3 hand-picked images actually ship at
1536×1024 (3:2), not the 1024×1024 the spec calls for — `PuzzleTile.tsx`
silently center-crops them to square at render time
(`resizeMode="cover"`). The generation pipeline enforces true 1:1 square
output (`EmptyLatentImage`/`EmptyFlux2LatentImage` at 1024×1024) precisely so
new assets don't inherit that silent-crop dependency.

### 8. FLUX.2 [dev] needs an A100, a ComfyUI update, and three separate model files (not one checkpoint)

Unlike FLUX.1 (single `.safetensors` checkpoint), FLUX.2 [dev] fp8 ships as
three independent files that must go in three different model directories:

- `flux2_dev_fp8mixed.safetensors` (~35.5GB) → `models/diffusion_models/`
- `mistral_3_small_flux2_fp8.safetensors` (~18GB) → `models/text_encoders/`
  (replaces T5 — Mistral-3-small reads prompts, hence the much bigger file)
- `flux2-vae.safetensors` (~336MB) → `models/vae/`

Graph-wise this means `UNETLoader` + `CLIPLoader` (`type: "flux2"`) +
`VAELoader` instead of a single `CheckpointLoaderSimple`, plus the
Flux2-specific `EmptyFlux2LatentImage` node instead of `EmptyLatentImage`.
Same "no working negative prompt" caveat as FLUX.1 applies (cfg pinned to
1.0, `FluxGuidance` on the positive conditioning does the work) — see
`buildFlux2Workflow` in `generate.mjs`.

**VRAM/GPU:** the fp8 diffusion model alone needs ~32GB VRAM with headroom —
doesn't fit the RTX 4090 used for every other model in this pipeline. Use an
A100 80GB (RunPod GPU id: `NVIDIA A100-SXM4-80GB`, not the display name
`"NVIDIA A100 80GB"` — the REST API wants the literal enum value).

**Disk:** the default `containerDiskInGb: 50` is not enough (the three files
alone are ~54GB combined). Use `--containerDisk 100` on `runpod.mjs start`.

**ComfyUI version:** the RunPod ComfyUI template's bundled checkout can be
several weeks stale and missing the Flux2 nodes entirely. Confirmed fix:
`git reset --hard origin/master` in `/workspace/runpod-slim/ComfyUI`, then
`pip install -r requirements.txt`, then restart the `main.py` process — this
also resets the checkpoint-relocation symlinks from Lesson 3 (git restores
the tracked placeholder directories), so redo the `mv`+`ln -s` dance
_after_ the version update, not before.

**Trap: `/workspace/runpod-slim/ComfyUI` is not always a git checkout.** On a
second pod, that directory had no `.git` at all (`git fetch` failed with
"not a git repository"), so the update-in-place approach above doesn't
generalize to every pod image. `/opt/comfyui-baked` (the image's reference
copy) _did_ have a working `.git` remote (`comfyanonymous/ComfyUI`) on that
pod — updating and running ComfyUI from there instead worked. **Always
verify `.git` exists in whichever ComfyUI directory you intend to update
before trusting `git reset --hard` to do anything**; if it's missing, check
`/opt/comfyui-baked` (or equivalent) for a real checkout instead of assuming
the template is consistent across pods/hosts.

**Trap: an interrupted SSH session mid-download silently truncates the
file, and a stray `pkill` can kill your own SSH session** (exit 255) if the
grep pattern is too broad — leaving you unsure whether the kill or the
restart actually happened. Always verify a resumed download against the
`x-linked-size` HTTP header (`curl -sI <url> | grep -i x-linked-size`)
before trusting a downloaded model file, and split "kill old process" from
"start new process" into separate SSH invocations rather than chaining them
in one command.

## Workflow recap (per batch)

1. `node tools/genart/runpod.mjs start` — confirm GPU/cost, wait for `ready: true`.
2. SSH in once to relocate `checkpoints/` onto the overlay disk (Lesson 3).
3. Download whichever checkpoint(s) the batch needs (parallel `wget &` if more than one).
4. `node tools/genart/generate.mjs <world> --host <ip> --port <sshPort> --model <key>` — one world × one model at a time; omit `--model` to run every configured variant.
5. Spot-check 1–2 images before committing to a full multi-world run — cheaper to catch a bad prompt/graph early than after 90+ generations.
6. `node tools/genart/runpod.mjs stop <podId>` — **immediately** after the last batch; never leave a pod idling.
7. `node tools/genart/ingest.mjs <world> [<model>]` — provenance + normalize.
8. Manual review in `tools/.genart-staging/<world>/<model>/ingested/`; user picks final images per level, possibly mixing models across levels within a world.
9. Copy chosen files into `assets/images/worlds/<world>/`, add `images.ts` registry entries, point the level's `source` at `img('<world>', '<name>')` in `levels.ts`, drop the now-unused `optimalMovesPattern` field (image levels use `optimalMoves` only). Run `just check`.

## Current asset status (2026-07-24)

All 31 placeholder-world levels now have real, wired-in images —
`optimalMovesPattern`/pattern sources are gone from `levels.ts`. Mixed
provenance by design (per Lesson/step 8 above, the user can mix models
across levels within a world):

- `planeten`, `fahrzeuge`, `kosmos`, `urban` (25 levels): **Juggernaut XL
  v9** — chosen and wired in an earlier session.
- `sport` (6 levels): **FLUX.2 [dev] fp8** — `basketball`/`tennis`/
  `schwimmen` previously used procedural pattern sources pending
  generation; all 6 sport levels (including the 3 that already had
  Juggernaut images) were regenerated with FLUX.2 for a consistent look
  across the world and are now live.

FLUX.2 outputs for the other 4 worlds (`planeten`, `fahrzeuge`, `kosmos`,
`urban`) were generated and passed ingest but were **not** wired in —
the user kept the existing Juggernaut choice for those. They remain
available for comparison at `tools/.genart-staging/<world>/flux2/ingested/`
if a future session wants to swap.
