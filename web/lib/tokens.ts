/**
 * Design tokens, direction "Sumi" (chosen by the owner; replaces "Mist"). Single source: layout.tsx turns this object into CSS custom
 * properties, and the styleguide reads the same object, so the page cannot drift from the tokens.
 */
export const color = {
  bg: '#EFE8DD',
  surface: '#F7F2EA',
  fg: '#141312',
  dim: '#4C4741',
  line: '#D6CCBE',
  frame: '#DDD3C5',
  accent: '#9E1B1B',
  accentHover: '#7A1212',
  onAccent: '#FFFFFF',
  red: '#C4321F',
  warn: '#8E1A14',
  off: '#D6CCBE',
  onOff: '#4C4741',
  paper: '#F7F1E6',
  shade: '#8C8274',
} as const;

export const pigments = [
  { id: 'sumi', name: 'Sumi', ink: '#151821', wash: '#C5C9D0', seal: '#B8321E' },
  { id: 'indigo', name: 'Indigo', ink: '#1B2E66', wash: '#BCC6E2', seal: '#B8321E' },
  { id: 'vermilion', name: 'Vermilion', ink: '#B1301B', wash: '#E6C4BA', seal: '#151821' },
  { id: 'umber', name: 'Umber', ink: '#4A2D1A', wash: '#D6C5AE', seal: '#A5341E' },
  { id: 'slate', name: 'Slate', ink: '#2B3944', wash: '#C1CCD2', seal: '#C0452A' },
  { id: 'ochre', name: 'Ochre', ink: '#855410', wash: '#E4D1A0', seal: '#1B2330' },
] as const;

export const gestures = [
  { id: 'still', name: 'Still', note: 'Even and quiet' },
  { id: 'surge', name: 'Surge', note: 'Heavy start, light finish' },
  { id: 'drift', name: 'Drift', note: 'Light start, heavy finish' },
  { id: 'fracture', name: 'Fracture', note: 'Broken, dry strokes' },
  { id: 'bloom', name: 'Bloom', note: 'Swells through the middle' },
  { id: 'tremor', name: 'Tremor', note: 'A wavering line' },
  { id: 'hollow', name: 'Hollow', note: 'Wide and dry' },
  { id: 'weight', name: 'Weight', note: 'Wide and full' },
] as const;

export const space = { s1: 4, s2: 8, s3: 12, s4: 16, s5: 24, s6: 32, s7: 48, s8: 64, s9: 104 } as const;
export const radius = { card: 6, button: 4, pill: 999, field: 4 } as const;
export const font = {
  display: "'Inter Tight', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
} as const;
export const shadow = {
  card: '0 1px 2px rgba(20,19,18,.06), 0 20px 44px -24px rgba(20,19,18,.35)',
} as const;
export const motion = {
  easeOut: 'cubic-bezier(.22,.7,.2,1)',
  easeBrush: 'cubic-bezier(.45,.05,.25,1)',
  fast: '150ms',
  base: '260ms',
  slow: '700ms',
} as const;

export const typeScale = [
  { name: 'Display', css: 'clamp(46px, 6vw, 92px)', family: 'display', weight: 800, sample: 'Every launch is a work of art.' },
  { name: 'Heading 2', css: 'clamp(30px, 3.6vw, 46px)', family: 'display', weight: 800, sample: 'How a launch works' },
  { name: 'Heading 3', css: '21px', family: 'display', weight: 700, sample: 'Choose' },
  { name: 'Spaced line', css: 'clamp(18px, 1.55vw, 23px)', family: 'body', weight: 400, sample: 'One token. One Enso. Twelve strokes.' },
  { name: 'Body', css: '17px', family: 'body', weight: 400, sample: 'Every launch mints one token and one Enso.' },
  { name: 'Small', css: '14px', family: 'body', weight: 400, sample: 'Symbol, name and painting cannot be changed.' },
  { name: 'Label', css: '14px', family: 'body', weight: 600, sample: 'THE ART LAUNCHPAD ON ROBINHOOD CHAIN' },
] as const;

/** CSS custom properties for :root, generated from the tokens above. */
export function cssVars(): string {
  const v: string[] = [];
  for (const [k, val] of Object.entries(color)) v.push(`--c-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${val}`);
  for (const [k, val] of Object.entries(space)) v.push(`--${k}:${val}px`);
  v.push(`--r:${radius.card}px`, `--rb:${radius.button}px`, `--rp:${radius.pill}px`, `--rs:${radius.field}px`);
  v.push(`--font-display:${font.display}`, `--font-body:${font.body}`);
  v.push(`--shadow:${shadow.card}`);
  v.push(`--ease-out:${motion.easeOut}`, `--ease-brush:${motion.easeBrush}`);
  v.push(`--t-fast:${motion.fast}`, `--t-base:${motion.base}`, `--t-slow:${motion.slow}`);
  return `:root{${v.join(';')}}`;
}

/* WCAG 2.x contrast, used by the styleguide to print real ratios. */
function lin(c: number) { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); }
function lum(hex: string) { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); }
export function contrast(a: string, b: string): number {
  const x = lum(a), y = lum(b), hi = Math.max(x, y), lo = Math.min(x, y);
  return (hi + 0.05) / (lo + 0.05);
}
