import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const SKIP = new Set(['node_modules', '.next', 'out', 'scripts']);
const ALLOWED = new Set(['config/brand.ts']);
const hits = [];
function walk(dir) {
  for (const n of readdirSync(dir)) {
    if (SKIP.has(n)) continue;
    const p = join(dir, n), s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(ts|tsx|css|mjs|json|html|md)$/.test(n) && !/package(-lock)?\.json$/.test(n)) {
      const rel = relative(root, p);
      if (ALLOWED.has(rel)) continue;
      readFileSync(p, 'utf8').split('\n').forEach((l, i) => { if (/zerova/i.test(l)) hits.push(`${rel}:${i + 1}: ${l.trim().slice(0, 100)}`); });
    }
  }
}
walk(root);
if (hits.length) { console.error('brand:check failed. The name must only come from config/brand.ts:\n' + hits.join('\n')); process.exit(1); }
console.log('brand:check ok');
