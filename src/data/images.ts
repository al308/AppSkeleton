import type { ImageSourcePropType } from 'react-native';

// Metro only bundles images referenced by a static `require()`. A dynamic
// string path is not enough, so every level image must appear literally here.
// The key is what `levels.ts` stores in `ImageSource.asset`.
//
// Adding a real image to a placeholder world is a one-line change:
//   1. Drop the PNG in assets/images/worlds/<world>/ (folders already exist).
//   2. Add a `'<world>/<name>': require('...')` line below.
//   3. Point the matching level's `source` at `img('<world>', '<name>')`.
const IMAGE_REGISTRY = {
  'natur/lion': require('../../assets/images/worlds/natur/lion.png'),
  'natur/swans': require('../../assets/images/worlds/natur/swans.png'),
  'natur/kitten': require('../../assets/images/worlds/natur/kitten.png'),
  'planeten/roter-planet': require('../../assets/images/worlds/planeten/roter-planet.jpg'),
  'planeten/gasriese': require('../../assets/images/worlds/planeten/gasriese.jpg'),
  'planeten/ringsystem': require('../../assets/images/worlds/planeten/ringsystem.jpg'),
  'planeten/mondsichel': require('../../assets/images/worlds/planeten/mondsichel.jpg'),
  'planeten/krater': require('../../assets/images/worlds/planeten/krater.jpg'),
  'planeten/sonnenfinsternis': require('../../assets/images/worlds/planeten/sonnenfinsternis.jpg'),
  'fahrzeuge/rennwagen': require('../../assets/images/worlds/fahrzeuge/rennwagen.jpg'),
  'fahrzeuge/motorrad': require('../../assets/images/worlds/fahrzeuge/motorrad.jpg'),
  'fahrzeuge/segelschiff': require('../../assets/images/worlds/fahrzeuge/segelschiff.jpg'),
  'fahrzeuge/flugzeug': require('../../assets/images/worlds/fahrzeuge/flugzeug.jpg'),
  'fahrzeuge/helikopter': require('../../assets/images/worlds/fahrzeuge/helikopter.jpg'),
  'fahrzeuge/lokomotive': require('../../assets/images/worlds/fahrzeuge/lokomotive.jpg'),
  'fahrzeuge/u-boot': require('../../assets/images/worlds/fahrzeuge/u-boot.jpg'),
  'fahrzeuge/rakete': require('../../assets/images/worlds/fahrzeuge/rakete.jpg'),
  'sport/fussball': require('../../assets/images/worlds/sport/fussball.jpg'),
  'sport/basketball': require('../../assets/images/worlds/sport/basketball.jpg'),
  'sport/eishockey': require('../../assets/images/worlds/sport/eishockey.jpg'),
  'sport/tennis': require('../../assets/images/worlds/sport/tennis.jpg'),
  'sport/schwimmen': require('../../assets/images/worlds/sport/schwimmen.jpg'),
  'sport/leichtathletik': require('../../assets/images/worlds/sport/leichtathletik.jpg'),
  'kosmos/nebel': require('../../assets/images/worlds/kosmos/nebel.jpg'),
  'kosmos/sternenfeld': require('../../assets/images/worlds/kosmos/sternenfeld.jpg'),
  'kosmos/spiralgalaxie': require('../../assets/images/worlds/kosmos/spiralgalaxie.jpg'),
  'kosmos/schwarzes-loch': require('../../assets/images/worlds/kosmos/schwarzes-loch.jpg'),
  'kosmos/supernova': require('../../assets/images/worlds/kosmos/supernova.jpg'),
  'urban/skyline': require('../../assets/images/worlds/urban/skyline.jpg'),
  'urban/neonschild': require('../../assets/images/worlds/urban/neonschild.jpg'),
  'urban/fassade': require('../../assets/images/worlds/urban/fassade.jpg'),
  'urban/u-bahn': require('../../assets/images/worlds/urban/u-bahn.jpg'),
  'urban/bruecke': require('../../assets/images/worlds/urban/bruecke.jpg'),
  'urban/nachtleben': require('../../assets/images/worlds/urban/nachtleben.jpg'),
} as const;

export type ImageAssetKey = keyof typeof IMAGE_REGISTRY;

export function resolveImageAsset(key: ImageAssetKey): ImageSourcePropType {
  return IMAGE_REGISTRY[key];
}
