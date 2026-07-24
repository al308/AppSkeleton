import { WORLDS } from '../../src/data/worlds';
import { getLevelsForWorld, LEVELS } from '../../src/data/levels';
import { resolveImageAsset } from '../../src/data/images';

describe('worlds data invariants', () => {
  it('ships 6–10 worlds', () => {
    expect(WORLDS.length).toBeGreaterThanOrEqual(6);
    expect(WORLDS.length).toBeLessThanOrEqual(10);
  });

  // The two original worlds (natur kept at 9; muster/glyphen predate the 5–9
  // target and intentionally keep their larger, fully-baked level sets). Every
  // newer world must sit in the 5–9 band.
  const LEGACY_LARGE_WORLDS = new Set(['muster', 'glyphen']);

  it('gives every world at least 5 levels', () => {
    for (const world of WORLDS) {
      expect(getLevelsForWorld(world.id).length).toBeGreaterThanOrEqual(5);
    }
  });

  it('keeps every non-legacy world within 5–9 levels', () => {
    for (const world of WORLDS) {
      if (LEGACY_LARGE_WORLDS.has(world.id)) continue;
      expect(getLevelsForWorld(world.id).length).toBeLessThanOrEqual(9);
    }
  });

  it('has a non-empty, uniquely-named level list per world', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const world of WORLDS) {
      expect(getLevelsForWorld(world.id).length).toBeGreaterThan(0);
    }
  });

  it('resolves every image-source level to a bundled asset', () => {
    for (const level of LEVELS) {
      if (level.source.kind === 'image') {
        expect(resolveImageAsset(level.source.asset)).toBeDefined();
      }
    }
  });

  it('points every level at an existing world', () => {
    const worldIds = new Set(WORLDS.map((w) => w.id));
    for (const level of LEVELS) {
      expect(worldIds.has(level.world)).toBe(true);
    }
  });
});
