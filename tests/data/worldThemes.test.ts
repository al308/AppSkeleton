import { WORLDS } from '../../src/data/worlds';
import { getWorldTheme, DEFAULT_WORLD_THEME } from '../../src/data/worldThemes';

describe('world themes', () => {
  it('gives every world a complete theme (gradient, accent, frame)', () => {
    for (const world of WORLDS) {
      const theme = getWorldTheme(world.id);

      expect(theme.gradient).toHaveLength(3);
      expect(theme.accent).toMatch(/^#/);
      expect(theme.frame).toBeTruthy();
    }
  });

  it('gives distinct gradients to distinct worlds', () => {
    const firsts = WORLDS.map((w) => getWorldTheme(w.id).gradient[0]);

    expect(new Set(firsts).size).toBe(WORLDS.length);
  });

  it('falls back to the default theme for an unknown world', () => {
    expect(getWorldTheme('does-not-exist')).toBe(DEFAULT_WORLD_THEME);
    expect(getWorldTheme(undefined)).toBe(DEFAULT_WORLD_THEME);
  });
});
