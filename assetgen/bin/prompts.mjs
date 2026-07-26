#!/usr/bin/env node
// Expands an assets.yaml manifest into full, targeted generation prompts.
// See docs/STYLE_GUIDE.md for how to write a good `project.style` block —
// this module is the "how" (style/lighting/framing/negatives), the
// manifest's `description` field is the "why/what" (subject).
//
// No YAML dependency (assetgen is stdlib-only, see README) — ships a
// minimal indent-based YAML subset parser covering exactly what
// assets.example.yaml uses: nested maps, lists of scalars, lists of maps,
// `>` folded block scalars, and quoted/plain scalars. Not a general YAML
// parser — if you need real YAML features, swap in a real parser and keep
// the same `loadManifest()` return shape.

import { readFileSync } from 'node:fs';

const FALLBACK_STYLE =
  'Hand-painted stylized game art, bold simplified shapes, rich saturated color palette, painterly rendering with visible brushwork texture, dramatic directional lighting, strong silhouette readability, no photorealism';

const ASPECT_DIMENSIONS = {
  '1:1': { width: 1024, height: 1024 },
  '3:2': { width: 1216, height: 832 },
  '2:3': { width: 832, height: 1216 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
};

function stripQuotes(s) {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function parseInlineList(s) {
  const inner = s.trim().replace(/^\[/, '').replace(/\]$/, '');
  if (!inner.trim()) return [];
  return inner.split(',').map((x) => stripQuotes(x.trim()));
}

// Strips a trailing ` # comment` from a scalar. For a quoted value, only
// comments AFTER the closing quote are stripped (the quoted content itself
// may legitimately contain "#"); for everything else, from the first " #".
function stripTrailingComment(s) {
  const t = s.trim();
  if (t.startsWith('[')) return t;
  const quote = t[0] === '"' || t[0] === "'" ? t[0] : null;
  if (quote) {
    const closeIdx = t.indexOf(quote, 1);
    if (closeIdx !== -1) {
      const afterQuote = t.slice(closeIdx + 1);
      const hashIdx = afterQuote.indexOf('#');
      return hashIdx === -1 ? t : t.slice(0, closeIdx + 1 + hashIdx).trim();
    }
  }
  const hashIdx = t.indexOf(' #');
  return hashIdx === -1 ? t : t.slice(0, hashIdx).trim();
}

// Minimal indent-based YAML subset parser — see module header for scope.
function parseYaml(text) {
  const rawLines = text.split('\n');
  const lines = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    lines.push({ indent, text: trimmed, raw: line });
  }

  let pos = 0;

  function readBlockScalar(baseIndent) {
    const parts = [];
    while (pos < lines.length && lines[pos].indent > baseIndent) {
      parts.push(lines[pos].text);
      pos++;
    }
    return parts.join(' ').trim();
  }

  function parseValue(raw, baseIndent) {
    if (raw === '>' || raw === '|') {
      return readBlockScalar(baseIndent);
    }
    const cleaned = stripTrailingComment(raw);
    if (cleaned.startsWith('[')) {
      return parseInlineList(cleaned);
    }
    return stripQuotes(cleaned);
  }

  function parseBlock(indent) {
    const isList = lines[pos] && lines[pos].text.startsWith('- ');
    if (isList) {
      const items = [];
      while (
        pos < lines.length &&
        lines[pos].indent === indent &&
        lines[pos].text.startsWith('- ')
      ) {
        const itemLine = lines[pos];
        const afterDash = itemLine.text.slice(2);
        pos++;
        if (afterDash.includes(':')) {
          // list of maps — first key:value shares the line with the dash
          const obj = {};
          const [k, ...rest] = afterDash.split(':');
          const restStr = rest.join(':').trim();
          if (restStr) {
            obj[k.trim()] = parseValue(restStr, itemLine.indent);
          } else {
            obj[k.trim()] = parseBlock(itemLine.indent + 2);
          }
          while (pos < lines.length && lines[pos].indent > indent) {
            const key = lines[pos].text.split(':')[0].trim();
            const rest2 = lines[pos].text.slice(lines[pos].text.indexOf(':') + 1).trim();
            const lineIndent = lines[pos].indent;
            pos++;
            obj[key] = rest2 ? parseValue(rest2, lineIndent) : parseBlock(lineIndent + 2);
          }
          items.push(obj);
        } else {
          items.push(parseValue(afterDash, itemLine.indent));
        }
      }
      return items;
    }

    const obj = {};
    while (pos < lines.length && lines[pos].indent === indent) {
      const line = lines[pos];
      const colonIdx = line.text.indexOf(':');
      const key = line.text.slice(0, colonIdx).trim();
      const rest = line.text.slice(colonIdx + 1).trim();
      pos++;
      if (rest) {
        obj[key] = parseValue(rest, line.indent);
      } else if (pos < lines.length && lines[pos].indent > indent) {
        obj[key] = parseBlock(lines[pos].indent);
      } else {
        obj[key] = null;
      }
    }
    return obj;
  }

  return parseBlock(0);
}

export function loadManifest(path) {
  const text = readFileSync(path, 'utf8');
  const doc = parseYaml(text);
  if (!doc.assets || !Array.isArray(doc.assets)) {
    throw new Error(`Manifest at ${path} has no top-level "assets" list.`);
  }
  return {
    project: doc.project ?? {},
    assets: doc.assets,
  };
}

function usingFallbackStyle(project) {
  return !project.style || !String(project.style).trim();
}

/**
 * Builds the final positive prompt + negative-prompt exclusion list for one
 * manifest asset entry. Deliberately verbose and structured — subject,
 * then framing, then style, then a technical-quality tail — because SDXL/
 * Flux prompt adherence degrades on short vague prompts far more than it
 * degrades on long specific ones.
 */
export function expandPrompt(asset, project) {
  if (!asset.name) throw new Error('Manifest asset entry missing "name".');
  if (!asset.description) {
    throw new Error(
      `Asset "${asset.name}" missing "description" — this is the one field the tool can't invent for you.`,
    );
  }

  const style = String(asset.style_override ?? project.style ?? FALLBACK_STYLE).trim();
  const framing = asset.framing
    ? String(asset.framing).trim()
    : 'centered composition, clear focal subject';
  const subject = String(asset.description).trim().replace(/\s+/g, ' ');

  const positive = [subject, framing, style, 'high detail, professional quality, clean composition']
    .filter(Boolean)
    .join(', ');

  const exclude = [
    ...(Array.isArray(project.global_exclude) ? project.global_exclude : []),
    ...(Array.isArray(asset.exclude) ? asset.exclude : []),
    // Generic anti-artifact vocabulary — SDXL/Flux at low-to-mid step counts
    // are prone to duplicating symmetric or repeated elements (hoops,
    // wheels, limbs, extra heads). Always applied, not just when the
    // subject looks symmetric, since it's cheap insurance either way.
    'duplicate',
    'deformed',
    'extra limbs',
    'malformed',
    'disfigured',
    'mutated',
    'multiple heads',
    'cloned object',
    'warped geometry',
    'distorted proportions',
    'blurry',
    'low quality',
    'jpeg artifacts',
  ];
  const negative = [...new Set(exclude)].join(', ');

  const aspect = asset.aspect ?? project.default_aspect ?? '1:1';
  const dims = ASPECT_DIMENSIONS[aspect];
  if (!dims) {
    throw new Error(
      `Asset "${asset.name}" has unknown aspect "${aspect}". Options: ${Object.keys(ASPECT_DIMENSIONS).join(', ')}`,
    );
  }

  return {
    name: asset.name,
    filename: `${asset.name}.jpg`,
    positive,
    negative,
    width: dims.width,
    height: dims.height,
    tags: Array.isArray(asset.tags) ? asset.tags : [],
  };
}

export function expandManifest(manifestPath) {
  const { project, assets } = loadManifest(manifestPath);
  if (usingFallbackStyle(project)) {
    console.warn(
      '\n⚠️  No project.style set in the manifest — falling back to the generic "Stylized Game Art" default.\n' +
        '    Results will be visually inconsistent with any existing shipped art. See docs/STYLE_GUIDE.md —\n' +
        '    5 minutes writing a project.style block is the single highest-leverage thing you can do here.\n',
    );
  }
  return assets.map((a) => expandPrompt(a, project));
}

const DEFAULT_SFX_DURATION_SECONDS = 4;
const MAX_AUDIO_DURATION_SECONDS = 47; // Stable Audio Open 1.0's hard ceiling — see docs/AUDIO.md

/**
 * Builds the final prompt + duration for one sounds.yaml audio entry.
 * Mirrors expandPrompt's shape/spirit but audio has no framing/aspect axis
 * and instead has duration + loopable, so it's a distinct function rather
 * than a shared one with image-only fields bolted on.
 */
export function expandAudioPrompt(asset, project) {
  if (!asset.name) throw new Error('Sound manifest entry missing "name".');
  if (!asset.description) {
    throw new Error(
      `Sound "${asset.name}" missing "description" — this is the one field the tool can't invent for you.`,
    );
  }

  const style = String(asset.style_override ?? project.audio_style ?? '').trim();
  const subject = String(asset.description).trim().replace(/\s+/g, ' ');
  const loopHint = asset.loopable
    ? 'seamlessly loopable, consistent texture with no clear start or end'
    : '';

  const positive = [subject, loopHint, style].filter(Boolean).join(', ');

  // "music"/"voice"/"singing" are excluded by default because most
  // manifest entries are UI/foley SFX, where a model-invented melody or
  // vocal is an unwanted surprise. A genuinely musical asset (a fanfare,
  // a stinger) needs `allow_music: true` to lift this — an asset-level
  // `exclude:` alone can't suppress it, since these are safety defaults,
  // not project-configurable base exclusions like audio_global_exclude.
  const musicalDefaults = asset.allow_music ? [] : ['music', 'voice', 'speech', 'singing'];

  const exclude = [
    ...(Array.isArray(project.audio_global_exclude) ? project.audio_global_exclude : []),
    ...(Array.isArray(asset.exclude) ? asset.exclude : []),
    ...musicalDefaults,
    'distortion',
    'clipping',
    'silence',
  ];
  const negative = [...new Set(exclude)].join(', ');

  const duration = Number(
    asset.duration_seconds ?? project.default_duration_seconds ?? DEFAULT_SFX_DURATION_SECONDS,
  );
  if (duration <= 0 || duration > MAX_AUDIO_DURATION_SECONDS) {
    throw new Error(
      `Sound "${asset.name}" has duration_seconds=${duration}, must be > 0 and <= ${MAX_AUDIO_DURATION_SECONDS} (Stable Audio Open 1.0's hard ceiling).`,
    );
  }

  return {
    name: asset.name,
    filename: `${asset.name}.mp3`,
    positive,
    negative,
    durationSeconds: duration,
    tags: Array.isArray(asset.tags) ? asset.tags : [],
  };
}

export function expandAudioManifest(manifestPath) {
  const { project, assets } = loadManifest(manifestPath);
  if (!project.audio_style) {
    console.warn(
      '\n⚠️  No project.audio_style set in the manifest — sounds will be generated from their bare\n' +
        '    description with no shared sonic identity (e.g. "retro 8-bit" vs. "warm analog" vs. "crisp\n' +
        '    foley"). See docs/AUDIO.md for guidance on setting one.\n',
    );
  }
  return assets.map((a) => expandAudioPrompt(a, project));
}

// CLI: node prompts.mjs <manifest.yaml> [--audio] [--name <assetName>] —
// prints the expanded prompt(s) as JSON, for inspection without running
// generation. --audio expands a sounds.yaml-shaped manifest instead.
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , manifestPath, ...rest] = process.argv;
  if (!manifestPath) {
    console.error('Usage: prompts.mjs <manifest.yaml> [--audio] [--name <assetName>]');
    process.exit(1);
  }
  const nameFlagIdx = rest.indexOf('--name');
  const filterName = nameFlagIdx >= 0 ? rest[nameFlagIdx + 1] : null;
  const isAudio = rest.includes('--audio');

  let expanded = isAudio ? expandAudioManifest(manifestPath) : expandManifest(manifestPath);
  if (filterName) expanded = expanded.filter((a) => a.name === filterName);
  console.log(JSON.stringify(expanded, null, 2));
}
