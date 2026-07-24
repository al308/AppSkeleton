# Spec: RunPod AI Asset Generation Pipeline

Status: **Draft** · Owner: AL · Date: 2026-07-23

## Outcome

A reusable, Claude-driven pipeline that generates puzzle-world images for
Shiffle by controlling a RunPod GPU pod over SSH: start a pod, trigger
image generation via ComfyUI's HTTP API, retrieve results, verify their
provenance, and stage them for manual approval into the asset registry.
Not a one-shot image batch — a tool that makes future asset generation a
repeatable command.

## Scope

In scope:

- `tools/genart/runpod.mjs` — pod lifecycle (start/status/stop) via the
  RunPod REST API.
- `tools/genart/generate.mjs` — drive ComfyUI on the pod (SSH-tunneled HTTP
  API) from a prompt list, retrieve generated images to a local staging dir.
- `tools/genart/ingest.mjs` — provenance check (`exiftool`), format/size
  normalization (square, JPEG q90), staged output ready for manual approval.
- `tools/genart/prompts.ts` (or an extension of `docs/asset-prompts.md`) —
  the prompt list for the 31 placeholder-world levels (`planeten`,
  `fahrzeuge`, `sport`, `kosmos`, `urban`), following the existing `natur`
  prompt style and style rules already documented.
- `.env` additions (`RUNPOD_KEY`, SSH key path) — proposed, not applied
  by the agent (`.env*` is don't-touch). `RUNPOD_KEY` has already been added
  by the user.

Out of scope:

- Auto-editing `src/data/images.ts` / `src/data/levels.ts` to wire in new
  images — stays a proposed diff per world, reviewed before applying
  (`assets/*.png` and registry wiring are approved manually per world).
- Any other RunPod use case beyond Shiffle asset generation.
- Building a UI; this is CLI tooling only, matching the existing `tools/`
  convention (`gen-icons.mjs`, `precompute_solver.py`).
- Leaving a pod running unattended — every session ends with an explicit,
  confirmed `stop`.

## Constraints

- Follows the existing `tools/` convention: standalone scripts, invoked
  directly (`node tools/genart/x.mjs`), not wired into `package.json`.
- Secrets (`RUNPOD_KEY`, SSH key) via `.env`, never hardcoded or committed.
- Starting a pod costs real money — every `runpod.mjs start` requires the
  user's explicit go-ahead before it runs (per the project's risky-action
  rule), and prints estimated $/hr before launching.
- Generated images: square 1:1 (1024×1024 minimum), JPEG q90, per
  `docs/asset-prompts.md`'s existing checklist. This corrects a drift from
  precedent — the 3 existing `natur` PNGs actually shipped at 1536×1024 (3:2)
  and get center-cropped at runtime by `PuzzleTile`'s `resizeMode="cover"`;
  new assets should be true squares so nothing gets cropped.
- Provenance: every staged image must pass an `exiftool` check confirming it
  is self-generated (no third-party placeholder signature), consistent with
  the licensing lesson already documented in `docs/asset-prompts.md`.
- No images committed to the repo automatically — staging only, human
  approval before any asset lands under `assets/images/worlds/`.

## Design

### Backend & infra decisions

- **Generation backend: ComfyUI.** Exposes an HTTP API directly on the pod,
  so triggering generation from the local machine is an SSH-tunneled POST to
  `/prompt` (workflow JSON) + poll `/history`, not a scripted CLI or
  screen-scraped WebUI. Supports SDXL and Flux.
- **GPU tier: RTX 4090 by default**, configurable via flag/config — sufficient
  for 1024×1024 SDXL/Flux batches at meaningfully lower $/hr than an A100.

### Pipeline flow

```
runpod.mjs start        → pod boots from a ComfyUI template, prints SSH info
generate.mjs <world>     → SSH tunnel to ComfyUI API, submit prompts from
                            prompts.ts, poll for completion, scp/rsync results
                            to tools/.genart-staging/<world>/
ingest.mjs <world>       → exiftool provenance check + resize/format-normalize
                            staged images; reports pass/fail per image
runpod.mjs stop          → terminate pod (also auto-called by generate.mjs
                            in a finally, unless --keep-alive)
```

Approved staged images are then manually copied into
`assets/images/worlds/<world>/`, with a follow-up diff to `images.ts` /
`levels.ts` proposed by the agent and applied only after user approval.

### Prompt content

`prompts.ts` derives one prompt per placeholder level from its existing
`title` in `levels.ts` (e.g. `Roter Planet` → Mars-like planet prompt) plus
the world's `worldThemes.ts` accent color for style consistency, following
the exact style-rule and prompt-syntax conventions already established in
`docs/asset-prompts.md` for `natur`. This is authored content — the agent
drafts it, the user reviews/edits before any generation run.

## Verification criteria

- **Phase 1:** `runpod.mjs start` boots a pod and SSH connects; `runpod.mjs
stop` terminates it, confirmed in the RunPod dashboard (done live, together
  with the user — real money involved).
- **Phase 2:** 2–3 test images generated end-to-end and retrieved to
  `tools/.genart-staging/`, visually reviewed against their prompts.
- **Phase 3:** `exiftool` output reviewed for each staged test image; no
  third-party placeholder signatures; dimensions/format match
  `docs/asset-prompts.md`'s checklist.
- **Phase 4:** Full prompt set written for all 31 placeholder levels; one
  world (`planeten`, 6 levels) run through the full pipeline as a batch-size
  sanity check; images reviewed and approved by the user before any
  `images.ts`/`levels.ts` wiring; `just check` green after any wiring diff.
