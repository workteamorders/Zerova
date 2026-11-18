import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const SCAN = ['app', 'components', 'lib'];
const BANNED = [
  /\bearn(s|ed|ing)?\b/i, /\byield(s|ing)?\b/i, /\bprofit(s|able)?\b/i, /\bpassive income\b/i, /\bapy\b/i,
  /\brewards?\b/i, /\bdividends?\b/i, /\binvest(s|ed|ing|ment|ments|or|ors)?\b/i, /\bguarantee(s|d)?\b/i,
  /\bmoon(ing)?\b/i, /\bgems?\b/i, /\b100x\b/i, /\bpump(s|ed|ing)?\b/i, /\bape(s|d)?\b/i, /\bdegens?\b/i,
  /\bsafe(r|ly|ty)?\b/i, /\brug-?proof\b/i, /\baudited\b/i, /\bverified\b/i, /will appreciate/i, /gain value/i,
  /zero[- ]risk/i, /risk[- ]free/i, /\btrustless\b/i, /liquidity layer/i, /unified liquidity/i,
];
const hits = [];
function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n), s = statSync(p);
    if (s.isDirectory()) { walk(p); continue; }
    if (!/\.(ts|tsx)$/.test(n)) continue;
    readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
      if (l.includes('copy-check:allow')) return;
      for (const re of BANNED) if (re.test(l)) hits.push(`${relative(root, p)}:${i + 1}: ${re} -> ${l.trim().slice(0, 90)}`);
    });
  }
}
for (const d of SCAN) { try { walk(join(root, d)); } catch {} }
if (hits.length) { console.error('copy:check failed:\n' + hits.join('\n')); process.exit(1); }
console.log('copy:check ok');
