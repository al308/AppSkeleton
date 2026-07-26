# FLUX.2 [dev] fp8 on an A100 — setup path

FLUX.2 [dev] fp8 is opt-in (`--model flux2` on `generate.mjs`) because it
needs meaningfully more VRAM and disk than the two default SDXL checkpoints,
and doesn't fit the RTX 4090 profile everything else uses.

## 1. Start the right pod

```bash
node bin/runpod.mjs start --profile flux2
```

This uses `GPU_PROFILES.flux2` in `runpod.mjs`: GPU
`NVIDIA A100-SXM4-80GB`, `containerDiskInGb: 100`, `volumeInGb: 20`. Don't
use the plain dashboard display name `"NVIDIA A100 80GB"` if overriding
`--gpu` manually — the REST API wants the literal enum-style value above.

**Why 100GB container disk:** FLUX.2 ships as three separate files (not one
bundled checkpoint like FLUX.1), ~54GB combined — the default 50GB used by
the `sdxl` profile isn't enough headroom.

## 2. Relocate checkpoints onto the overlay disk

Same as every other profile (see `docs/PLAYBOOK.md` Lesson 3) — do this
before downloading anything:

```bash
mv /workspace/runpod-slim/ComfyUI/models/checkpoints /root/checkpoints-real
ln -s /root/checkpoints-real /workspace/runpod-slim/ComfyUI/models/checkpoints
```

## 3. Download the three FLUX.2 model files

Unlike FLUX.1's single `.safetensors` checkpoint, FLUX.2 [dev] fp8 needs
three files in three different ComfyUI model directories:

| File                                    | Size    | Directory                             |
| --------------------------------------- | ------- | ------------------------------------- |
| `flux2_dev_fp8mixed.safetensors`        | ~35.5GB | `models/diffusion_models/`            |
| `mistral_3_small_flux2_fp8.safetensors` | ~18GB   | `models/text_encoders/` (replaces T5) |
| `flux2-vae.safetensors`                 | ~336MB  | `models/vae/`                         |

**Verified download source:** the repackaged split files live at
**`Comfy-Org/flux2-dev`** on HuggingFace, under `split_files/<kind>/<name>`:

```
https://huggingface.co/Comfy-Org/flux2-dev/resolve/main/split_files/diffusion_models/flux2_dev_fp8mixed.safetensors
https://huggingface.co/Comfy-Org/flux2-dev/resolve/main/split_files/text_encoders/mistral_3_small_flux2_fp8.safetensors
https://huggingface.co/Comfy-Org/flux2-dev/resolve/main/split_files/vae/flux2-vae.safetensors
```

Do **not** guess a repo name like `comfyanonymous/flux2_dev_ComfyUI` — that
404s. `Comfy-Org/flux2-dev` is the correct repo as of this writing.

**This repo is gated.** The gate technically lives on the upstream
`black-forest-labs/FLUX.2-dev` weights repo, but HuggingFace still requires
an authenticated request against `Comfy-Org/flux2-dev` too — every URL 401s
without a valid token. You need:

1. An `HF_TOKEN` (HuggingFace access token) in `.env` — see `.env.example`.
2. The FLUX.2-dev license **accepted on the HuggingFace account that
   token belongs to** (visit the `black-forest-labs/FLUX.2-dev` model page
   while logged in, accept the license, then generate/use a token from that
   same account).

Download with the token as a bearer header:

```bash
curl -L -H "Authorization: Bearer $HF_TOKEN" \
  -o models/diffusion_models/flux2_dev_fp8mixed.safetensors \
  https://huggingface.co/Comfy-Org/flux2-dev/resolve/main/split_files/diffusion_models/flux2_dev_fp8mixed.safetensors
```

Repeat for the other two files into their respective directories. Given the
file sizes, run the three downloads in parallel (`&` background jobs) to
save wall-clock time.

**Verify a completed download** before trusting it, especially after an
interrupted SSH session (which silently truncates the file):

```bash
curl -sI -H "Authorization: Bearer $HF_TOKEN" <url> | grep -i x-linked-size
ls -la models/diffusion_models/flux2_dev_fp8mixed.safetensors
```

Compare the reported size against the actual file size.

## 4. Confirm ComfyUI has the FLUX.2 nodes

The RunPod ComfyUI template's bundled checkout can be several weeks stale
and missing FLUX.2's nodes (`UNETLoader`, `CLIPLoader` with `type: flux2`,
`EmptyFlux2LatentImage`) entirely. Check first, don't assume:

```bash
curl -s http://127.0.0.1:8188/object_info/EmptyFlux2LatentImage | head -c 200
```

If that returns node info, you're fine — skip the update. If it 404s or
returns empty:

```bash
cd /workspace/runpod-slim/ComfyUI
git reset --hard origin/master
pip install -r requirements.txt
# restart main.py process
```

**Trap:** `/workspace/runpod-slim/ComfyUI` is not guaranteed to be a git
checkout on every pod image — on at least one observed pod it had no
`.git` at all. If `git fetch` fails with "not a git repository", check
`/opt/comfyui-baked` (the image's reference copy) for a working checkout
instead of assuming the template is consistent across pod images.

**Trap:** updating via `git reset --hard` resets the checkpoint-relocation
symlink from step 2 (git restores the tracked placeholder directory) — redo
the `mv` + `ln -s` dance _after_ any ComfyUI version update, not before.

## 5. Generate

```bash
node bin/generate.mjs --manifest assets.yaml --host <ip> --port <sshPort> --model flux2
```

Same interface as the default models — `--candidates`, `--only`, `--tag`,
`--limit` all work identically.

## 6. Stop the pod immediately after

A100s are expensive relative to the RTX 4090 default. Don't let one idle:

```bash
node bin/runpod.mjs stop <podId>
```

## Known trade-offs vs. the default SDXL pair

- Best raw aesthetic on individual "hero" images, but less consistent
  across a full batch than the SDXL defaults — good for one or two
  standout assets, not necessarily the right choice for generating an
  entire manifest.
- No working negative-prompt path (see `docs/PLAYBOOK.md` Lesson 2) —
  `generate.mjs` compensates by folding exclusions into the positive prompt
  automatically, but it's a weaker guarantee than SDXL's dedicated negative
  conditioning.
- Meaningfully higher $/hr (A100 vs. RTX 4090) and a slower first-download
  session (~54GB of model files vs. ~7-17GB for a single SDXL checkpoint).
