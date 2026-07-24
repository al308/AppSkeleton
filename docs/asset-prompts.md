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

## World 3 — Planeten

### planeten_01 · Roter Planet (`roter-planet.jpg`)

```
A rust-red alien planet surface with jagged rock spires and canyons, two small moons
visible in a dusky orange sky, dramatic long shadows, stylized painterly illustration,
flat digital art, vivid color contrast, centered composition, no people, no text, --ar 1:1
```

### planeten_02 · Gasriese (`gasriese.jpg`)

```
A massive gas giant planet close-up, swirling bands of amber, cream and deep orange clouds,
storm vortices visible, stylized painterly illustration, bold graphic color blocks,
centered composition filling the frame, no rings, no text, --ar 1:1
```

### planeten_03 · Ringsystem (`ringsystem.jpg`)

```
A blue-white ice giant planet with a wide flat ring system seen at a dramatic angle,
starfield background, cool tones with a warm rim-light accent, stylized illustration,
strong graphic silhouette, centered composition, no text, --ar 1:1
```

### planeten_04 · Mondsichel (`mondsichel.jpg`)

```
A crescent moon lit from one side against deep space, cratered surface texture visible
in the lit portion, the dark portion faintly earthlit, stylized minimalist illustration,
high contrast, centered composition, no text, --ar 1:1
```

### planeten_05 · Krater (`krater.jpg`)

```
Aerial view straight down into a large impact crater on a rocky moon surface, concentric
rings of debris and shadow, dusty grey-brown palette with warm rim light on the crater edge,
stylized illustration, strong radial composition, no text, --ar 1:1
```

### planeten_06 · Sonnenfinsternis (`sonnenfinsternis.jpg`)

```
A total solar eclipse, the sun's corona blazing white-gold around a black disc against
a deep violet sky, a thin sliver of planet horizon at the bottom, stylized illustration,
dramatic high contrast, centered composition, no text, --ar 1:1
```

---

## World 4 — Fahrzeuge

### fahrzeuge_01 · Rennwagen (`rennwagen.jpg`)

```
A sleek open-wheel racing car seen from a low three-quarter angle, bold red and white
livery, motion blur on the wheels implying speed, stylized flat illustration, strong
graphic shapes, centered composition, no people, no text, no logos, --ar 1:1
```

### fahrzeuge_02 · Motorrad (`motorrad.jpg`)

```
A classic sport motorcycle parked at a three-quarter angle, glossy black and chrome
finish, dramatic studio-style lighting, stylized flat illustration, strong silhouette,
centered composition, no people, no text, no logos, --ar 1:1
```

### fahrzeuge_03 · Segelschiff (`segelschiff.jpg`)

```
A tall sailing ship with full white sails on a deep blue ocean, dramatic sky with
scattered clouds, viewed from a low angle to emphasize the sails, stylized painterly
illustration, bold color contrast, centered composition, no people, no text, --ar 1:1
```

### fahrzeuge_04 · Flugzeug (`flugzeug.jpg`)

```
A vintage propeller airplane banking in flight against a clear blue sky with soft clouds
below, viewed from the side, stylized flat illustration, clean graphic shapes, centered
composition, no people, no text, no logos, --ar 1:1
```

### fahrzeuge_05 · Helikopter (`helikopter.jpg`)

```
A rescue helicopter hovering against a dramatic orange sunset sky, rotor blur implying
motion, viewed from a low three-quarter angle, stylized illustration, strong silhouette,
centered composition, no people, no text, no logos, --ar 1:1
```

### fahrzeuge_06 · Lokomotive (`lokomotive.jpg`)

```
A classic steam locomotive with a plume of white steam, viewed head-on from a low angle,
deep green and black livery with brass details, stylized flat illustration, bold graphic
shapes, centered composition, no people, no text, no logos, --ar 1:1
```

### fahrzeuge_07 · U-Boot (`u-boot.jpg`)

```
A submarine surfaced in open ocean, conning tower prominent, dramatic overcast sky and
choppy dark blue water, stylized painterly illustration, strong silhouette, centered
composition, no people, no text, no logos, --ar 1:1
```

### fahrzeuge_08 · Rakete (`rakete.jpg`)

```
A rocket launching with a bright exhaust plume and billowing smoke cloud at the base,
viewed from a low angle against a twilight sky transitioning to space, stylized
illustration, dramatic high contrast, centered composition, no text, no logos, --ar 1:1
```

---

## World 6 — Sportarten

### sport_01 · Fußball (`fussball.jpg`)

```
A soccer ball frozen mid-motion on bright green grass, dramatic side lighting casting
a long shadow, stylized flat illustration, bold graphic color blocks, centered
composition, no people, no text, no logos, --ar 1:1
```

### sport_02 · Basketball (`basketball.jpg`)

```
A wide view of an empty outdoor basketball court at golden hour, single hoop and backboard
at the far end, long shadows stretching across the painted court lines, warm orange sky,
distant city skyline silhouette, stylized illustration, bold graphic color blocks,
no people, no text, no logos, --ar 1:1
```

### sport_03 · Eishockey (`eishockey.jpg`)

```
A hockey puck and stick on reflective ice with cool blue rink lighting, dynamic diagonal
composition implying motion, stylized flat illustration, bold color contrast, no people,
no text, no logos, --ar 1:1
```

### sport_04 · Tennis (`tennis.jpg`)

```
A wide elevated view of a single red clay tennis court seen at a three-quarter angle,
white net dividing the court, bold white boundary lines, tall green windscreen fencing
around the perimeter, soft morning light, stylized illustration, bold graphic shapes,
no people, no text, no logos, --ar 1:1
```

### sport_05 · Schwimmen (`schwimmen.jpg`)

```
A wide indoor view of an empty swimming pool hall from one end, rows of starting blocks
along the near edge, turquoise water with bold white lane dividers stretching into the
distance, tall windows letting in soft daylight, stylized flat illustration, strong
graphic perspective, no people, no text, --ar 1:1
```

### sport_06 · Leichtathletik (`leichtathletik.jpg`)

```
A red running track curve seen from a low angle with bold white lane lines converging,
dramatic stadium lighting, stylized illustration, strong graphic perspective, centered
composition, no people, no text, no logos, --ar 1:1
```

---

## World 7 — Kosmos

### kosmos_01 · Nebel (`nebel.jpg`)

```
A vast colorful nebula in deep space, swirling clouds of magenta, cyan and violet gas
lit from within by embedded stars, stylized painterly illustration, rich texture,
centered composition, no text, --ar 1:1
```

### kosmos_02 · Sternenfeld (`sternenfeld.jpg`)

```
A dense star field against deep black space, varying star brightness and subtle color
temperature differences, a faint wisp of galactic dust, stylized minimalist illustration,
high contrast, centered composition, no text, --ar 1:1
```

### kosmos_03 · Spiralgalaxie (`spiralgalaxie.jpg`)

```
A spiral galaxy viewed face-on, luminous core with sweeping arms of stars and cosmic dust
in blue and gold tones, deep space background, stylized illustration, strong radial
composition, no text, --ar 1:1
```

### kosmos_04 · Schwarzes Loch (`schwarzes-loch.jpg`)

```
A black hole with a glowing accretion disc of orange and white light bending around a
dark center, deep space backdrop, stylized illustration, dramatic high contrast, strong
radial composition, no text, --ar 1:1
```

### kosmos_05 · Supernova (`supernova.jpg`)

```
A supernova explosion, brilliant white core surrounded by expanding shells of orange,
pink and blue gas, dramatic radiating light, stylized illustration, vivid color contrast,
centered composition, no text, --ar 1:1
```

---

## World 8 — Urban

### urban_01 · Skyline (`skyline.jpg`)

```
A city skyline silhouette at dusk with illuminated windows, gradient sky from orange to
deep purple, stylized flat illustration, bold graphic shapes, centered composition,
no people, no text, no logos, --ar 1:1
```

### urban_02 · Neonschild (`neonschild.jpg`)

```
A glowing neon sign on a dark brick wall at night, vivid pink and cyan light with a soft
glow and reflection on wet pavement below, stylized illustration, strong color contrast,
centered composition, no readable text, no logos, --ar 1:1
```

### urban_03 · Fassade (`fassade.jpg`)

```
A grid of colorful apartment building windows and balconies viewed straight-on, varied
warm and cool facade colors, stylized flat illustration, strong repeating graphic pattern,
centered composition, no people, no text, --ar 1:1
```

### urban_04 · U-Bahn (`u-bahn.jpg`)

```
A subway train arriving at a platform, motion blur on the train implying speed, cool
fluorescent platform lighting, stylized illustration, strong graphic perspective,
centered composition, no people, no text, no logos, --ar 1:1
```

### urban_05 · Brücke (`bruecke.jpg`)

```
A suspension bridge viewed from below at dusk, cables converging dramatically toward
illuminated towers, gradient sky, stylized flat illustration, bold graphic composition,
no people, no text, no logos, --ar 1:1
```

### urban_06 · Nachtleben (`nachtleben.jpg`)

```
A lively city street at night with colorful illuminated shop signs and string lights,
reflections on wet pavement, stylized illustration, vivid color contrast, centered
composition, no people, no readable text, no logos, --ar 1:1
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
