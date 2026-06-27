import type { ImageSourcePropType } from 'react-native';

// Metro only bundles images referenced by a static `require()`. A dynamic
// string path is not enough, so every level image must appear literally here.
// The key is what `levels.ts` stores in `ImageSource.asset`.
const IMAGE_REGISTRY = {
  'natur/lion': require('../../assets/images/worlds/natur/lion.png'),
  'natur/swans': require('../../assets/images/worlds/natur/swans.png'),
  'natur/kitten': require('../../assets/images/worlds/natur/kitten.png'),
} as const;

export type ImageAssetKey = keyof typeof IMAGE_REGISTRY;

export function resolveImageAsset(key: ImageAssetKey): ImageSourcePropType {
  return IMAGE_REGISTRY[key];
}
