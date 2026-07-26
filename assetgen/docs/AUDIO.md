# Audio generation — Stable Audio Open 1.0

Sound generation (`bin/generate-audio.mjs` + `sounds.yaml`) is a separate
manifest and pipeline from image generation, but shares the same
philosophy, RunPod pod lifecycle (`bin/runpod.mjs`), and staging/review
model. Read this before your first real batch — licensing and model choice
here have sharper edges than the image side.

## Model choice & why

| Model                     | Verdict             | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stable Audio Open 1.0** | ✅ default          | Commercially usable (see License below), natively supported by ComfyUI core with **no custom nodes required**, generates up to 47s of 44.1kHz stereo audio. Explicitly better at sound effects/foley than at music per Stability's own model card — matches this pipeline's primary use case (game/app SFX, UI cues, short ambiences).                                                                                                               |
| Stable Audio Open Small   | evaluated, not used | Same license family, smaller (0.5B vs. 1B params), designed for on-device/mobile inference. As of this writing there's an open, unresolved compatibility issue getting it running in ComfyUI's audio workflow — the _Open 1.0_ checkpoint has mature native support, Small doesn't yet. Revisit if that gets fixed upstream; the manifest/prompt layer doesn't care which checkpoint runs underneath.                                                |
| ACE-Step                  | evaluated, not used | Apache-2.0 (no revenue threshold, cleanest license of anything considered) but purpose-built for **music generation** (songs, instrumentals, vocals) — not sound effects, which is this pipeline's actual need. Worth adding as a second model if you need generated background music/stingers rather than SFX; different node graph (`TextEncodeAceStepAudio`, `EmptyAceStepLatentAudio`, not the `CLIPTextEncode`/`EmptyLatentAudio` graph below). |
| MMAudio                   | rejected            | State-of-the-art quality per community consensus, but **CC-BY-NC 4.0** on the model weights — non-commercial only. Disqualifying for a shipped commercial app. Code is MIT, but the weights license is what governs generated-audio usage.                                                                                                                                                                                                           |
| TangoFlux                 | rejected            | "Research and academic purposes only" per its license — commercial use requires a separate paid license from Stability AI.                                                                                                                                                                                                                                                                                                                           |

Unlike the image pipeline's two-model comparison (`dreamshaper` +
`juggernaut`), audio generation defaults to **one model** — there is
currently no second commercially-licensed open SFX model with mature
native ComfyUI support worth running side-by-side. Use `--candidates` to
get variety (multiple seeds) from the one model instead of a second
checkpoint's differing style.

## License — read this before shipping generated audio

Stable Audio Open 1.0 is released under the **Stability AI Community
License**. As of this writing: free for commercial use unless you or your
organization generate over **USD $1M in annual revenue**, in which case an
enterprise license is required (see https://stability.ai/license for
current terms — license terms can change, re-check before a real ship
decision, don't rely on this doc as legal advice).

The HuggingFace repo (`stabilityai/stable-audio-open-1.0`) is **gated** —
downloading the checkpoint requires an authenticated request with an
`HF_TOKEN` from an account that has accepted the license on the model
page. This is the same `HF_TOKEN` already used for FLUX.2 (see
`docs/FLUX2_A100.md`) — one token, two gated repos, accept both repos'
licenses on the same HuggingFace account.

## ComfyUI setup

**No custom nodes required** — this is native ComfyUI core support,
verified against the official
`Comfy-Org/workflow_templates/templates/audio_stable_audio_example.json`
workflow. Two files needed:

| File                                | Size       | Directory               | Source                                                                                                                                                                                                 |
| ----------------------------------- | ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `stable-audio-open-1.0.safetensors` | ~1B params | `models/checkpoints/`   | `stabilityai/stable-audio-open-1.0` on HuggingFace (gated, needs `HF_TOKEN`)                                                                                                                           |
| `t5-base.safetensors`               | ~440MB     | `models/text_encoders/` | `google-t5/t5-base` (not gated) — ComfyUI-compatible conversions are commonly available on HuggingFace under `Comfy-Org` uploads, search for one if the raw Google repo's format doesn't load directly |

The graph `generate-audio.mjs` submits (see `buildWorkflow`):

```
CheckpointLoaderSimple (stable-audio-open-1.0)
  → model → KSampler
  → vae   → VAEDecodeAudio
CLIPLoader (t5-base, type: stable_audio)
  → CLIPTextEncode (positive) ─┐
  → CLIPTextEncode (negative) ─┼→ KSampler → VAEDecodeAudio → SaveAudioMP3
EmptyLatentAudio (seconds, batch_size=1) ─┘
```

Default sampler settings (matching the official example workflow):
`steps: 50, cfg: 4.98, sampler_name: dpmpp_3m_sde_gpu, scheduler:
exponential`. These aren't independently tuned by us the way the image
pipeline's SDXL settings were (see `docs/PLAYBOOK.md` Lesson 1) — they're
Stability's own documented defaults, carried over as-is.

## Prompting differences from images

`prompts.mjs`'s `expandAudioPrompt` is deliberately simpler than
`expandPrompt` (images) — no framing/composition axis, no aspect ratio,
and the exclusion vocabulary is audio-specific (`distortion, clipping,
silence` always, plus `music, voice, speech, singing` by default, not the
image pipeline's anti-morphing vocabulary, which doesn't apply to audio).

Three fields worth understanding:

- **`allow_music: true`** — most manifest entries are UI/foley SFX, where
  an invented melody or vocal is an unwanted surprise, so `music`, `voice`,
  `speech`, and `singing` are excluded by default. A genuinely musical
  asset (a fanfare, a stinger, background music) needs `allow_music: true`
  set on it, or the default exclusion actively fights the description —
  an asset-level `exclude:` alone can't suppress these four, since they're
  safety defaults, not project-configurable base exclusions the way
  `audio_global_exclude` is. See `sounds.example.yaml`'s
  `level-complete-fanfare` entry.

- **`duration_seconds`** — hard-capped at 47s (`MAX_AUDIO_DURATION_SECONDS`
  in `prompts.mjs`), Stable Audio Open 1.0's documented ceiling. Keep SFX
  short (1-4s) — longer requests cost more generation time for no benefit
  on a one-shot UI sound.
- **`loopable: true`** — appends a "seamlessly loopable" hint to the
  prompt. This is a _hint_, not a guarantee — the model has no explicit
  loop-point conditioning. **Always manually verify the loop point** (load
  in an audio editor, listen across the seam) before shipping a looped
  ambience; don't trust the hint alone.

## Ingest — what it checks, and what it can't

`bin/ingest-audio.mjs` verifies duration (catches truncated/failed
generations — compares against the manifest's requested
`duration_seconds` with a ±1s tolerance for VAE frame quantization) and
flags likely-silent clips via `ffmpeg`'s `volumedetect` filter (mean
volume below -50dB). It does **not** and cannot verify that a clip
actually sounds like what you asked for, or catch subtler failure modes
(a UI click that sounds like a gunshot, a "wind" prompt that generated
white noise) — that's still a manual listen per candidate, same as the
image pipeline's ingest never replaces a visual review.

Requires `ffmpeg` + `ffprobe` on `PATH` (`brew install ffmpeg` / `apt
install ffmpeg`) — a new dependency beyond the image pipeline's
`exiftool`/`magick`.

## Per-batch checklist

1. `node bin/runpod.mjs start --profile audio` (same RTX 4090 tier as the
   `sdxl` image profile — Stable Audio Open 1.0 is a ~1B-param model, no
   special GPU needed).
2. SSH in, download `stable-audio-open-1.0.safetensors` (gated, needs
   `HF_TOKEN` — see License above) and `t5-base.safetensors` into their
   respective `models/` subdirectories.
3. `node bin/prompts.mjs sounds.yaml --audio` — sanity-check expanded
   prompts before spending GPU time.
4. `node bin/generate-audio.mjs --manifest sounds.yaml --host <ip> --port
<sshPort> --limit 1` — spot-check one sound first.
5. Full manifest run once the spot-check sounds right.
6. `node bin/runpod.mjs stop <podId>` — immediately after the last batch.
7. `node bin/ingest-audio.mjs --manifest sounds.yaml` — duration + silence
   checks.
8. **Listen to every candidate manually** — ingest is a QA gate for
   obvious failures, not a quality judge. Pick winners, copy into your
   real audio asset tree.
