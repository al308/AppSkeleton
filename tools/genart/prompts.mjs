// Prompt list for the genart pipeline (docs/specs/genart-pipeline.md).
// Content mirrors docs/asset-prompts.md — keep both in sync when editing.
// One entry per placeholder-world level (title/gridSize sourced from
// src/data/levels.ts). Style rules follow the existing `natur` prompts:
// square 1:1, stylized/painterly, strong regions, no people/logos/text.

export const PROMPTS = [
  // ── Planeten ──────────────────────────────────────────────────────────
  {
    world: 'planeten',
    levelId: 'planeten_01',
    filename: 'roter-planet.jpg',
    prompt:
      'A rust-red alien planet surface with jagged rock spires and canyons, two small moons visible in a dusky orange sky, dramatic long shadows, stylized painterly illustration, flat digital art, vivid color contrast, centered composition, no people, no text',
  },
  {
    world: 'planeten',
    levelId: 'planeten_02',
    filename: 'gasriese.jpg',
    prompt:
      'A massive gas giant planet close-up, swirling bands of amber, cream and deep orange clouds, storm vortices visible, stylized painterly illustration, bold graphic color blocks, centered composition filling the frame, no rings, no text',
  },
  {
    world: 'planeten',
    levelId: 'planeten_03',
    filename: 'ringsystem.jpg',
    prompt:
      'A blue-white ice giant planet with a wide flat ring system seen at a dramatic angle, starfield background, cool tones with a warm rim-light accent, stylized illustration, strong graphic silhouette, centered composition, no text',
  },
  {
    world: 'planeten',
    levelId: 'planeten_04',
    filename: 'mondsichel.jpg',
    prompt:
      'A crescent moon lit from one side against deep space, cratered surface texture visible in the lit portion, the dark portion faintly earthlit, stylized minimalist illustration, high contrast, centered composition, no text',
  },
  {
    world: 'planeten',
    levelId: 'planeten_05',
    filename: 'krater.jpg',
    prompt:
      'Aerial view straight down into a large impact crater on a rocky moon surface, concentric rings of debris and shadow, dusty grey-brown palette with warm rim light on the crater edge, stylized illustration, strong radial composition, no text',
  },
  {
    world: 'planeten',
    levelId: 'planeten_06',
    filename: 'sonnenfinsternis.jpg',
    prompt:
      "A total solar eclipse, the sun's corona blazing white-gold around a black disc against a deep violet sky, a thin sliver of planet horizon at the bottom, stylized illustration, dramatic high contrast, centered composition, no text",
  },

  // ── Fahrzeuge ─────────────────────────────────────────────────────────
  {
    world: 'fahrzeuge',
    levelId: 'fahrzeuge_01',
    filename: 'rennwagen.jpg',
    prompt:
      'A sleek open-wheel racing car seen from a low three-quarter angle, bold red and white livery, motion blur on the wheels implying speed, stylized flat illustration, strong graphic shapes, centered composition, no people, no text, no logos',
  },
  {
    world: 'fahrzeuge',
    levelId: 'fahrzeuge_02',
    filename: 'motorrad.jpg',
    prompt:
      'A classic sport motorcycle parked at a three-quarter angle, glossy black and chrome finish, dramatic studio-style lighting, stylized flat illustration, strong silhouette, centered composition, no people, no text, no logos',
  },
  {
    world: 'fahrzeuge',
    levelId: 'fahrzeuge_03',
    filename: 'segelschiff.jpg',
    prompt:
      'A tall sailing ship with full white sails on a deep blue ocean, dramatic sky with scattered clouds, viewed from a low angle to emphasize the sails, stylized painterly illustration, bold color contrast, centered composition, no people, no text',
  },
  {
    world: 'fahrzeuge',
    levelId: 'fahrzeuge_04',
    filename: 'flugzeug.jpg',
    prompt:
      'A vintage propeller airplane banking in flight against a clear blue sky with soft clouds below, viewed from the side, stylized flat illustration, clean graphic shapes, centered composition, no people, no text, no logos',
  },
  {
    world: 'fahrzeuge',
    levelId: 'fahrzeuge_05',
    filename: 'helikopter.jpg',
    prompt:
      'A rescue helicopter hovering against a dramatic orange sunset sky, rotor blur implying motion, viewed from a low three-quarter angle, stylized illustration, strong silhouette, centered composition, no people, no text, no logos',
  },
  {
    world: 'fahrzeuge',
    levelId: 'fahrzeuge_06',
    filename: 'lokomotive.jpg',
    prompt:
      'A classic steam locomotive with a plume of white steam, viewed head-on from a low angle, deep green and black livery with brass details, stylized flat illustration, bold graphic shapes, centered composition, no people, no text, no logos',
  },
  {
    world: 'fahrzeuge',
    levelId: 'fahrzeuge_07',
    filename: 'u-boot.jpg',
    prompt:
      'A submarine surfaced in open ocean, conning tower prominent, dramatic overcast sky and choppy dark blue water, stylized painterly illustration, strong silhouette, centered composition, no people, no text, no logos',
  },
  {
    world: 'fahrzeuge',
    levelId: 'fahrzeuge_08',
    filename: 'rakete.jpg',
    prompt:
      'A rocket launching with a bright exhaust plume and billowing smoke cloud at the base, viewed from a low angle against a twilight sky transitioning to space, stylized illustration, dramatic high contrast, centered composition, no text, no logos',
  },

  // ── Sportarten ────────────────────────────────────────────────────────
  {
    world: 'sport',
    levelId: 'sport_01',
    filename: 'fussball.jpg',
    prompt:
      'A soccer ball frozen mid-motion on bright green grass, dramatic side lighting casting a long shadow, stylized flat illustration, bold graphic color blocks, centered composition, no people, no text, no logos',
  },
  {
    world: 'sport',
    levelId: 'sport_02',
    filename: 'basketball.jpg',
    prompt:
      'A wide view of an empty outdoor basketball court at golden hour, single hoop and backboard at the far end, long shadows stretching across the painted court lines, warm orange sky, distant city skyline silhouette, stylized illustration, bold graphic color blocks, no people, no text, no logos',
  },
  {
    world: 'sport',
    levelId: 'sport_03',
    filename: 'eishockey.jpg',
    prompt:
      'A hockey puck and stick on reflective ice with cool blue rink lighting, dynamic diagonal composition implying motion, stylized flat illustration, bold color contrast, no people, no text, no logos',
  },
  {
    world: 'sport',
    levelId: 'sport_04',
    filename: 'tennis.jpg',
    prompt:
      'A wide elevated view of a single red clay tennis court seen at a three-quarter angle, white net dividing the court, bold white boundary lines, tall green windscreen fencing around the perimeter, soft morning light, stylized illustration, bold graphic shapes, no people, no text, no logos',
  },
  {
    world: 'sport',
    levelId: 'sport_05',
    filename: 'schwimmen.jpg',
    prompt:
      'A wide indoor view of an empty swimming pool hall from one end, rows of starting blocks along the near edge, turquoise water with bold white lane dividers stretching into the distance, tall windows letting in soft daylight, stylized flat illustration, strong graphic perspective, no people, no text',
  },
  {
    world: 'sport',
    levelId: 'sport_06',
    filename: 'leichtathletik.jpg',
    prompt:
      'A red running track curve seen from a low angle with bold white lane lines converging, dramatic stadium lighting, stylized illustration, strong graphic perspective, centered composition, no people, no text, no logos',
  },

  // ── Kosmos ────────────────────────────────────────────────────────────
  {
    world: 'kosmos',
    levelId: 'kosmos_01',
    filename: 'nebel.jpg',
    prompt:
      'A vast colorful nebula in deep space, swirling clouds of magenta, cyan and violet gas lit from within by embedded stars, stylized painterly illustration, rich texture, centered composition, no text',
  },
  {
    world: 'kosmos',
    levelId: 'kosmos_02',
    filename: 'sternenfeld.jpg',
    prompt:
      'A dense star field against deep black space, varying star brightness and subtle color temperature differences, a faint wisp of galactic dust, stylized minimalist illustration, high contrast, centered composition, no text',
  },
  {
    world: 'kosmos',
    levelId: 'kosmos_03',
    filename: 'spiralgalaxie.jpg',
    prompt:
      'A spiral galaxy viewed face-on, luminous core with sweeping arms of stars and cosmic dust in blue and gold tones, deep space background, stylized illustration, strong radial composition, no text',
  },
  {
    world: 'kosmos',
    levelId: 'kosmos_04',
    filename: 'schwarzes-loch.jpg',
    prompt:
      'A black hole with a glowing accretion disc of orange and white light bending around a dark center, deep space backdrop, stylized illustration, dramatic high contrast, strong radial composition, no text',
  },
  {
    world: 'kosmos',
    levelId: 'kosmos_05',
    filename: 'supernova.jpg',
    prompt:
      'A supernova explosion, brilliant white core surrounded by expanding shells of orange, pink and blue gas, dramatic radiating light, stylized illustration, vivid color contrast, centered composition, no text',
  },

  // ── Urban ─────────────────────────────────────────────────────────────
  {
    world: 'urban',
    levelId: 'urban_01',
    filename: 'skyline.jpg',
    prompt:
      'A city skyline silhouette at dusk with illuminated windows, gradient sky from orange to deep purple, stylized flat illustration, bold graphic shapes, centered composition, no people, no text, no logos',
  },
  {
    world: 'urban',
    levelId: 'urban_02',
    filename: 'neonschild.jpg',
    prompt:
      'A glowing neon sign on a dark brick wall at night, vivid pink and cyan light with a soft glow and reflection on wet pavement below, stylized illustration, strong color contrast, centered composition, no readable text, no logos',
  },
  {
    world: 'urban',
    levelId: 'urban_03',
    filename: 'fassade.jpg',
    prompt:
      'A grid of colorful apartment building windows and balconies viewed straight-on, varied warm and cool facade colors, stylized flat illustration, strong repeating graphic pattern, centered composition, no people, no text',
  },
  {
    world: 'urban',
    levelId: 'urban_04',
    filename: 'u-bahn.jpg',
    prompt:
      'A subway train arriving at a platform, motion blur on the train implying speed, cool fluorescent platform lighting, stylized illustration, strong graphic perspective, centered composition, no people, no text, no logos',
  },
  {
    world: 'urban',
    levelId: 'urban_05',
    filename: 'bruecke.jpg',
    prompt:
      'A suspension bridge viewed from below at dusk, cables converging dramatically toward illuminated towers, gradient sky, stylized flat illustration, bold graphic composition, no people, no text, no logos',
  },
  {
    world: 'urban',
    levelId: 'urban_06',
    filename: 'nachtleben.jpg',
    prompt:
      'A lively city street at night with colorful illuminated shop signs and string lights, reflections on wet pavement, stylized illustration, vivid color contrast, centered composition, no people, no readable text, no logos',
  },
];
