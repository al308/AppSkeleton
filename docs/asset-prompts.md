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
- Style: **photorealistic photography** — sharp detail, natural/dramatic
  lighting, camera-like composition (not painterly/illustration). This is the
  current standard as of the Natur/Tiere realism pass (see
  `docs/specs/worlds-restructure.md`); Planeten/Fahrzeuge/Sport/Kosmos/Muster/
  Urban below still show their original stylized/painterly prompts and haven't
  been regenerated to match yet.
- Minimum 1024×1024, target 1200×1200 for retina quality

---

## World — Natur

Photorealistic landscape photography (see the style-rule note above).

### natur_01 · Gletscher (`gletscher.jpg`)

```
A massive blue-white glacier wall with deep crevasses, cold morning light raking across the ice,
a fjord of dark water at its base, photorealistic photography, dramatic natural lighting,
sharp detail, wide-angle landscape shot, no people, no text, --ar 1:1
```

### natur_02 · Vulkan (`vulkan.jpg`)

```
An active volcano cone erupting with a glowing lava plume against a dusky sky,
dark ash clouds billowing upward, photorealistic photography, dramatic natural lighting,
long exposure, sharp detail, no people, no text, --ar 1:1
```

### natur_03 · Geysir (`geysir.jpg`)

```
A tall geyser erupting in a steaming mineral basin, backlit water plume against a pale sky,
warm mineral-orange terraces in the foreground, photorealistic photography,
telephoto compression, sharp detail, no people, no text, --ar 1:1
```

### natur_04 · Felsküste (`felskueste.jpg`)

```
A rugged rocky coastline with tall sea stacks battered by crashing waves, dramatic overcast sky,
cool grey-blue palette with white spray, photorealistic photography,
long exposure motion in the surf, sharp detail, no people, no text, --ar 1:1
```

### natur_05 · Strand (`strand.jpg`)

```
A tropical beach with turquoise water and white sand, gentle waves and a few scattered palm
leaves, bright midday sun, photorealistic photography, natural sunlight, sharp detail,
no people, no text, --ar 1:1
```

### natur_06 · Weizenfeld (`weizenfeld.jpg`)

```
A golden wheat field rippling under a wide summer sky, warm late-afternoon light raking
across the grain, a distant tree line on the horizon, photorealistic photography,
golden-hour natural light, sharp detail, no people, no text, --ar 1:1
```

### natur_07 · Wolken (`wolken.jpg`)

```
A dramatic sky filled with towering cumulus clouds lit from below by a low sun,
gradient from deep blue to warm gold, photorealistic aerial photography,
dramatic natural light, sharp detail, no people, no text, --ar 1:1
```

### natur_08 · Bergsee (`bergsee.jpg`)

```
A still alpine lake mirroring snow-capped mountain peaks, deep blue water, crisp clear
daylight, photorealistic photography, crisp natural daylight, sharp detail,
strong symmetrical composition, no people, no text, --ar 1:1
```

### natur_09 · Herbstwald (`herbstwald.jpg`)

```
A dense autumn forest with red, orange and gold foliage, soft shafts of light breaking
through the canopy, a narrow path receding into the trees, photorealistic photography,
soft forest light, sharp detail, no people, no text, --ar 1:1
```

---

## World — Tiere

Photorealistic wildlife photography (see the style-rule note above).

### tiere_01 · Adler im Sturzflug (`adler.jpg`)

```
A golden eagle diving steeply with wings swept back, sharp talons forward, dramatic cloudy
mountain sky background, photorealistic wildlife photography, fast shutter freeze,
sharp detail, strong dynamic diagonal composition, no people, no text, --ar 1:1
```

### tiere_02 · Orca-Breach (`orca.jpg`)

```
An orca breaching fully out of deep blue ocean water, dramatic spray and splash, overcast
sky, high contrast black-and-white orca against cool blue water, photorealistic wildlife
photography, fast shutter freeze, sharp detail, no people, no text, --ar 1:1
```

### tiere_03 · Schneeleopard (`schneeleopard.jpg`)

```
A snow leopard perched on a rocky outcrop in a snowy mountain landscape amid falling snow,
thick spotted fur, alert posture, cool blue-grey palette, photorealistic wildlife
photography, natural overcast light, sharp detail, no people, no text, --ar 1:1
```

### tiere_04 · Tiger-Sprung (`tiger.jpg`)

```
A Bengal tiger mid-leap through tall golden grass, muscles taut, dramatic low-angle view,
warm orange and black stripes against a soft green background, photorealistic wildlife
photography, fast shutter freeze, sharp detail, no people, no text, --ar 1:1
```

### tiere_05 · Kolibri-Schwebeflug (`kolibri.jpg`)

```
A hummingbird hovering mid-air beside a bright red tropical flower, wings frozen mid-beat,
iridescent green-blue plumage, soft blurred foliage background, photorealistic macro
photography, fast shutter freeze, sharp detail, no people, no text, --ar 1:1
```

### tiere_06 · Pfau-Rad (`pfau.jpg`)

```
A peacock with its tail fully fanned out, iridescent blue-green eye-spot feathers backlit
and displayed symmetrically, centered composition, photorealistic wildlife photography,
natural backlight, sharp detail, no people, no text, --ar 1:1
```

### tiere_07 · Chamäleon-Makro (`chamaeleon.jpg`)

```
An extreme macro shot of a chameleon gripping a branch mid color-change, richly textured
scaly skin in vivid green and turquoise, one eye rotated toward camera, soft blurred jungle
background, photorealistic macro photography, sharp detail, no people, no text, --ar 1:1
```

### tiere_08 · Wanderfalke (`wanderfalke.jpg`)

```
A peregrine falcon in a steep high-speed stoop dive, wings folded tight against its body,
streaking diagonally against a pale sky, photorealistic wildlife photography,
low-angle dramatic perspective, fast shutter freeze, sharp detail, no people, no text, --ar 1:1
```

### tiere_09 · Tiefsee-Qualle (`qualle.jpg`)

```
A translucent deep-sea jellyfish glowing bioluminescent blue against the black ocean depths,
trailing tentacles, bubbles rising, photorealistic underwater photography, dramatic low
light, sharp detail, centered composition, no people, no text, --ar 1:1
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
