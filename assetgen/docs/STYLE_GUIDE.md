# Style Guide — defining your project's look

`generate.mjs` expands every manifest entry into a full prompt using
`bin/prompts.mjs`. The single biggest lever on output quality is the `style`
block in `assets.yaml` — spend the five minutes to set it deliberately
instead of relying on the fallback.

## Set `project.style` explicitly — don't skip this

Before generating anything real, write 2-4 sentences that describe:

1. **Rendering approach** — photoreal photography? Painterly illustration?
   Flat vector? Hand-painted game art (à la Frostpass's Viking assets —
   bold shapes, rich saturated palette, painterly rendering with visible
   brushwork, dramatic directional lighting)?
2. **Palette** — warm/cool bias, saturation level, any locked accent colors.
3. **Lighting** — soft/diffuse vs. hard/dramatic, time-of-day bias.
4. **Framing default** — centered hero shot vs. wide environmental shot vs.
   close-up macro. (Per-asset `framing` in the manifest overrides this.)

Put it in `assets.yaml`:

```yaml
project:
  style: >
    Hand-painted stylized game art in the visual language of a Nordic/Viking
    fantasy world: bold simplified shapes, rich saturated but slightly muted
    palette (deep blues, weathered wood browns, iron greys, accent gold),
    painterly rendering with visible brushwork texture, dramatic directional
    lighting with strong rim-light, no photorealism.
```

### Extracting a style from existing assets

If the target project already has shipped art (icons, splash images,
concept art), the fastest path to a good style block is to describe _that_
art back to the model, not invent a new one:

1. Pick 3-5 of the best existing images.
2. Write down, in plain language: rendering technique, palette, lighting,
   line quality, level of detail, mood. Be concrete ("muted teal-and-rust
   palette", not "nice colors").
3. Turn that into the `project.style` paragraph above.

This keeps new generated assets visually consistent with what's already
shipped, which matters far more for a cohesive-looking app than any single
image being individually impressive.

## Fallback default: Stylized Game Art

If `assets.yaml` has no `project.style`, `prompts.mjs` falls back to:

> Hand-painted stylized game art, bold simplified shapes, rich saturated
> color palette, painterly rendering with visible brushwork texture,
> dramatic directional lighting, strong silhouette readability, no
> photorealism, no text, no watermark, no UI elements

This is deliberately close to the "Frostpass Vikings" aesthetic — painterly,
graphic, game-native — because it's a safer generic default for app/game
assets than either photoreal photography (narrow use case) or flat
corporate illustration (generic, low personality). It is a _starting point_,
not a recommendation to skip setting your own style — the tool will print a
warning and ask you to confirm before generating with the fallback active.

## Per-asset overrides

Any manifest entry can override style, framing, or add hard exclusions
without touching the project-wide default:

```yaml
assets:
  - name: frost-giant-portrait
    description: a towering frost giant, cracked ice-blue skin, glowing eyes
    style_override: >
      Photorealistic digital painting, ArtStation concept-art quality,
      dramatic rim lighting, muted arctic palette
    framing: close-up portrait, centered, shoulders-up
    exclude: [text, watermark, multiple heads, extra limbs]
```

## Writing good `description` fields

`prompts.mjs` does real prompt engineering around your `description` — it
adds style, lighting, framing, composition, and a strong negative-prompt
set automatically. Your job is just to describe the _subject_ concretely:

- **Good:** `a weathered longship beached on a rocky fjord shore, sail
furled, mist rolling in`
- **Too vague:** `a boat` — the model has to invent everything, results
  will be generic and inconsistent across candidates.
- **Don't pre-style it yourself** (`"boat, digital art, trending on
artstation"`) — that's `prompts.mjs`'s job via the style block; putting
  it in `description` just duplicates/conflicts with the generated prompt.

See `assets.example.yaml` for a fully worked manifest.
