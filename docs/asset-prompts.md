# Shiffle — AI Image Generation Guide

All level images are AI-generated, 1024×1024 square, JPEG quality 90.
Save to: `assets/images/worlds/<world>/<levelId>.jpg`

> **Licensing rule (learned the hard way):** the first batch of Natur images were
> Lorem Picsum placeholders (Unsplash-sourced). Although the Unsplash License
> permits commercial use, it does **not** cover recognizable people or brands, and
> "no modification beyond slicing into puzzle tiles" is legally shaky. Those were
> removed. Only ship images you generated yourself (AI) or hold an explicit
> commercial license for. Verify provenance with `exiftool <file>` — a `Picsum ID`
> in the `UserComment` tag means it is **not** ours and must not ship.

**Style rules for all images:**

- Square format 1:1, compose centrally with a clear focal point
- Strong color contrast and distinct regions that "reveal" nicely when assembled
- Avoid: real people's faces, copyrighted characters, brand logos, text in the image
- Style: stylized / painterly / illustration — not photorealistic stock photography
- Minimum 1024×1024, target 1200×1200 for retina quality

---

## World 1 — Natur

### natur_01 · Bergwiese (`bergwiese.jpg`)

```
Aerial view of an alpine meadow in full bloom, lush green grass with scattered wildflowers
in purple, yellow and white, dramatic rocky peaks in the background, golden hour light,
painterly illustration style, vibrant colors, square composition centered on the flower field,
no people, --ar 1:1 --style raw
```

### natur_02 · Wasserfall (`wasserfall.jpg`)

```
A powerful jungle waterfall cascading over mossy rocks into a crystal-clear turquoise pool,
lush tropical vegetation surrounding it, misty spray catching sunlight,
stylized illustration with bold colors, centered composition, --ar 1:1
```

### natur_03 · Sonnenblumenfeld (`sonnenblumen.jpg`)

```
A vast field of sunflowers in full bloom stretching to the horizon,
bright blue sky with fluffy white clouds, warm golden sunlight,
bold graphic illustration style with strong color blocks,
centered overhead-angle shot showing the radial pattern of the flowers, --ar 1:1
```

### natur_04 · Herbstwald (`herbstwald.jpg`)

```
Dense autumn forest canopy viewed from below looking up,
leaves in deep red, orange, yellow and brown,
sunlight filtering through in golden rays,
abstract painterly style, rich texture, centered composition, --ar 1:1
```

### natur_05 · Küstenlandschaft (`kueste.jpg`)

```
Dramatic coastal cliffs meeting a turquoise ocean, white foam waves,
a lighthouse on a rocky promontory in the distance,
clear blue sky with a few clouds, stylized illustration with strong contrast,
aerial perspective, --ar 1:1
```

### natur_06 · Schneegipfel (`schneegipfel.jpg`)

```
Snow-capped mountain peaks at sunrise, pink and orange alpenglow on the summits,
deep blue glaciers and icy ridges, dramatic scale, stylized alpine illustration,
centered triangular mountain composition, no people, --ar 1:1
```

### natur_07 · Tropischer Regenwald (`regenwald.jpg`)

```
Lush tropical rainforest canopy from above, multiple shades of green,
winding river visible through the treetops, exotic birds in bright colors,
morning mist in the valleys, painterly illustration, rich detail, --ar 1:1
```

### natur_08 · Wüstenmorgen (`wueste.jpg`)

```
Vast desert landscape at dawn, dramatic sand dunes in warm orange and golden tones,
long shadows, a single large cactus silhouette,
violet and pink sky, minimalist stylized illustration, --ar 1:1
```

### natur_09 · Nordlichter (`nordlichter.jpg`)

```
Northern lights (aurora borealis) in vivid green, cyan and purple
dancing across a dark arctic night sky,
snow-covered pine forest reflected in a still frozen lake below,
dreamlike illustration style, strong color contrast, --ar 1:1
```

### natur_10 · Korallenriff (`korallenriff.jpg`)

```
Vibrant coral reef scene viewed from slightly above,
colorful coral formations in pink, orange and purple,
schools of tropical fish in electric blue and yellow,
crystal clear water with light rays, stylized illustration, --ar 1:1
```

### natur_11 · Kirschblüte (`kirschbluete.jpg`)

```
Japanese cherry blossom park in full bloom,
dense canopy of soft pink sakura flowers filling the frame,
a traditional stone lantern visible below,
gentle petals falling, soft pastel illustration style, --ar 1:1
```

### natur_12 · Vulkanlandschaft (`vulkan.jpg`)

```
Active volcano at night, glowing orange and red lava flows cutting through black basalt,
dramatic plume of smoke and ash lit from below,
star-filled sky above, stylized illustration with strong contrast,
aerial perspective, no people, --ar 1:1
```

---

## App Assets

### App Icon (`assets/icon.png`, 1024×1024)

```
A 4×4 sliding puzzle grid, mid-solve: one tile is visibly displaced
revealing a dark square gap, the assembled tiles show fragments of a bold geometric pattern
(concentric squares) in vivid indigo and teal on a deep dark background,
clean vector art, no text, strong silhouette, --ar 1:1 --style raw
```

### Adaptive Icon Foreground (`assets/adaptive-icon.png`, 1024×1024)

```
Same as app icon but on a transparent background,
the puzzle grid centered with generous padding for safe zone,
no background color, --ar 1:1
```

### Splash Screen (`assets/splash.png`, 2048×2048)

```
The word "Shiffle" as a sliding tile puzzle: each letter is a separate tile,
one letter missing leaving a blank gap,
bold geometric sans-serif, indigo tiles on dark background,
minimal and clean, --ar 1:1
```

---

## Generation Tips

- **Midjourney**: Add `--style raw --v 6` for cleanest results
- **DALL-E 3**: Prefix with "Digital illustration, flat design style:"
- **Stable Diffusion**: Use SDXL with `illustration style, flat design, vibrant colors, no people`
- Always check: does the image slice well? Look for ~4 clear visual regions
- Avoid images with a single centered subject — they slice poorly for 4×4 and 5×5

---

## Checklist Before Adding an Image

- [ ] 1024×1024 or larger square
- [ ] JPEG saved at quality 90
- [ ] Clear focal point visible even in 3×3 slice
- [ ] No faces, logos, text in image
- [ ] No real person identifiable
- [ ] Strong color contrast between regions
- [ ] Saved to correct path: `assets/images/worlds/<world>/<levelId>.jpg`
