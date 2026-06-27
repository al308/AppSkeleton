export type PatternShape =
  | 'stripes_h'
  | 'stripes_v'
  | 'checker'
  | 'nested_squares'
  | 'star'
  | 'diamond'
  | 'gradient_h'
  | 'gradient_v'
  | 'gradient_r'
  | 'cross'
  | 'frame'
  | 'radial'
  | 'stripes_d'
  | 'stripes_d2'
  | 'checker_large'
  | 'zigzag'
  | 'spiral'
  | 'waves'
  | 'triangles'
  | 'bordered_stripes';

export type PaletteId =
  | 'warm'
  | 'cool'
  | 'earth'
  | 'neon'
  | 'mono'
  | 'flag_de'
  | 'flag_fr'
  | 'flag_it'
  | 'flag_jp';

export type GlyphMotif = 'none' | 'lines_h' | 'lines_v' | 'lines_d' | 'lines_d2' | 'grid';

export type PatternStyle = 'fill' | 'number';

export type PatternDefinition = {
  shape: PatternShape;
  colorCount: number;
  palette: PaletteId;
  glyph?: GlyphMotif;
  style?: PatternStyle;
};

const PALETTES: Record<PaletteId, string[]> = {
  warm: ['#d32f2f', '#f57c00', '#fbc02d', '#c0ca33', '#6d4c41', '#e64a19', '#bf360c', '#ff6f00'],
  cool: ['#1565c0', '#0097a7', '#7b1fa2', '#283593', '#00838f', '#4527a0', '#1a237e', '#006064'],
  earth: ['#5d4037', '#827717', '#558b2f', '#bf360c', '#4e342e', '#33691e', '#e65100', '#6d4c41'],
  neon: ['#ff1744', '#00e676', '#2979ff', '#ffea00', '#ff6d00', '#d500f9', '#00b0ff', '#76ff03'],
  mono: ['#111111', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd', '#ffffff'],
  flag_de: ['#000000', '#dd0000', '#ffce00', '#000000', '#dd0000', '#ffce00', '#000000', '#dd0000'],
  flag_fr: ['#002395', '#ffffff', '#ed2939', '#002395', '#ffffff', '#ed2939', '#002395', '#ffffff'],
  flag_it: ['#009246', '#ffffff', '#ce2b37', '#009246', '#ffffff', '#ce2b37', '#009246', '#ffffff'],
  flag_jp: ['#ffffff', '#bc002d', '#ffffff', '#bc002d', '#ffffff', '#bc002d', '#ffffff', '#bc002d'],
};

export type TileColor = {
  groupId: string;
  color: string;
};

function posToGroupId(
  shape: PatternShape,
  row: number,
  col: number,
  size: number,
  colorCount: number,
): number {
  switch (shape) {
    case 'stripes_h':
      return Math.floor((row / size) * colorCount);
    case 'stripes_v':
      return Math.floor((col / size) * colorCount);
    case 'stripes_d':
      return Math.floor(((row + col) / ((size - 1) * 2)) * colorCount);
    case 'stripes_d2':
      return Math.floor(((row + (size - 1 - col)) / ((size - 1) * 2)) * colorCount);
    case 'checker':
      return (row + col) % 2;
    case 'checker_large':
      return (Math.floor(row / 2) + Math.floor(col / 2)) % 2;
    case 'nested_squares': {
      const dist = Math.min(row, col, size - 1 - row, size - 1 - col);
      const maxDist = Math.floor(size / 2);
      return Math.floor((dist / (maxDist + 1)) * colorCount);
    }
    case 'frame': {
      const ring = Math.min(row, col, size - 1 - row, size - 1 - col);
      return Math.min(ring, colorCount - 1);
    }
    case 'diamond': {
      const cr = size / 2;
      const dist = Math.abs(row - cr + 0.5) + Math.abs(col - cr + 0.5);
      const maxDist = size - 1;
      return Math.min(Math.floor((dist / maxDist) * colorCount), colorCount - 1);
    }
    case 'star': {
      const cr = (size - 1) / 2;
      const dx = col - cr;
      const dy = row - cr;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = cr;
      if (dist < maxR * 0.35) return 0;
      if (dist < maxR * 0.7) return Math.min(1, colorCount - 1);
      return Math.min(2, colorCount - 1);
    }
    case 'cross': {
      const mid = Math.floor(size / 2);
      if (row === mid || col === mid) return 0;
      return Math.min(1, colorCount - 1);
    }
    case 'radial': {
      const cr = (size - 1) / 2;
      const angle = Math.atan2(row - cr, col - cr) + Math.PI;
      return Math.floor((angle / (2 * Math.PI)) * colorCount);
    }
    case 'gradient_h':
      return Math.floor((col / size) * colorCount);
    case 'gradient_v':
      return Math.floor((row / size) * colorCount);
    case 'gradient_r': {
      const cr = (size - 1) / 2;
      const dist = Math.sqrt((row - cr) ** 2 + (col - cr) ** 2);
      const maxDist = Math.sqrt(2) * cr;
      return Math.min(Math.floor((dist / maxDist) * colorCount), colorCount - 1);
    }
    case 'zigzag': {
      const phase = col % 2 === 0 ? row : size - 1 - row;
      return Math.floor((phase / size) * colorCount);
    }
    case 'spiral': {
      // Map spiral position index → color group
      let top = 0,
        bottom = size - 1,
        left = 0,
        right = size - 1;
      const order: number[][] = [];
      while (top <= bottom && left <= right) {
        for (let c = left; c <= right; c++) order.push([top, c]);
        for (let r = top + 1; r <= bottom; r++) order.push([r, right]);
        if (top < bottom) for (let c = right - 1; c >= left; c--) order.push([bottom, c]);
        if (left < right) for (let r = bottom - 1; r > top; r--) order.push([r, left]);
        top++;
        bottom--;
        left++;
        right--;
      }
      const idx = order.findIndex(([r, c]) => r === row && c === col);
      return Math.min(Math.floor((idx / (size * size)) * colorCount), colorCount - 1);
    }
    case 'waves': {
      const wave = row + 1.2 * Math.sin(col * 1.6);
      const norm = Math.max(0, Math.min(wave, size - 1)) / size;
      return Math.min(Math.floor(norm * colorCount), colorCount - 1);
    }
    case 'triangles': {
      // Split across the main diagonal, then band each half by distance from it.
      const diag = col - row;
      const maxDiag = size - 1;
      const band = Math.floor((Math.abs(diag) / (maxDiag + 1)) * colorCount);
      if (diag >= 0) return Math.min(band, colorCount - 1);
      return colorCount - 1 - Math.min(band, colorCount - 1);
    }
    case 'bordered_stripes': {
      const ring = Math.min(row, col, size - 1 - row, size - 1 - col);
      if (ring === 0) return 0;
      return Math.floor((col / size) * colorCount);
    }
  }
}

export type PatternTileData = {
  tileId: number;
  groupId: string;
  color: string;
};

export function derivePatternTiles(def: PatternDefinition, gridSize: number): PatternTileData[] {
  const palette = PALETTES[def.palette];
  const result: PatternTileData[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const pos = row * gridSize + col;
      const total = gridSize * gridSize;
      const tileId = pos === total - 1 ? 0 : pos + 1;
      const groupIdx = posToGroupId(def.shape, row, col, gridSize, def.colorCount);
      const boundedIdx = Math.min(groupIdx, def.colorCount - 1);
      const color = palette[boundedIdx] ?? palette[0] ?? '#888888';
      result.push({ tileId, groupId: `g${boundedIdx}`, color });
    }
  }
  return result;
}

export function buildTileGroupMap(tiles: PatternTileData[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const t of tiles) {
    map.set(t.tileId, t.groupId);
  }
  return map;
}
