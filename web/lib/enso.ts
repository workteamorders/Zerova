// @ts-nocheck
/**
 * Illustrative Enso generator for the web preview (browser only). This is NOT the on-chain renderer:
 * the contract draws the final painting. It exists so the Studio and the styleguide can show the idea.
 */
function rng(seed: number) { let a = Math.floor(seed) >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const GEST = [
  { w0: 36, w1: 32, dry: .18, jit: 1.2, ecc: .99, tilt: .05, pulse: .04, wob: 2, splat: 1 },
  { w0: 76, w1: 10, dry: .55, jit: 2.2, ecc: .96, tilt: .2, pulse: .08, wob: 4, splat: 3 },
  { w0: 18, w1: 52, dry: .35, jit: 2.0, ecc: .92, tilt: .38, pulse: .1, wob: 6, splat: 2 },
  { w0: 46, w1: 30, dry: .85, jit: 4.5, ecc: .97, tilt: .15, pulse: .2, wob: 5, splat: 4 },
  { w0: 40, w1: 48, dry: .3, jit: 2.5, ecc: .98, tilt: .1, pulse: .5, wob: 3, splat: 2 },
  { w0: 26, w1: 22, dry: .4, jit: 2.2, ecc: .97, tilt: .12, pulse: .12, wob: 11, splat: 1 },
  { w0: 88, w1: 72, dry: .95, jit: 3, ecc: .95, tilt: .22, pulse: .1, wob: 4, splat: 0 },
  { w0: 98, w1: 58, dry: .12, jit: 1.6, ecc: .96, tilt: .1, pulse: .06, wob: 3, splat: 2 },
];
const cache: Record<string, any> = {};
export function build(seed: number, gi: number, M: number) {
  const key = seed + '/' + gi + '/' + M; if (cache[key]) return cache[key];
  const g = GEST[gi], r = rng(seed * 2654435761 + 12345), cx = 500, cy = 560, R = 306, TAU = 6.283185;
  const a0 = r() * TAU, tilt = (r() - .5) * 2 * g.tilt, ph1 = r() * 6.28, ph2 = r() * 6.28, ct = Math.cos(tilt), st = Math.sin(tilt);
  const T = M * 12, L = T + 6, f1 = (v: number) => Math.round(v * 10) / 10;
  const noise = () => { const raw = [], o = []; for (let j = 0; j < T; j++) raw.push(r() - .5); for (let j = 0; j < T; j++) o.push((raw[(j + T - 1) % T] + 2 * raw[j] + raw[(j + 1) % T]) / 4 * 2); return o; };
  const eo = noise(), ei = noise(), lo = noise();
  const pt = (a: number, rad: number) => { const x = rad * Math.cos(a), y = rad * g.ecc * Math.sin(a); return [cx + x * ct - y * st, cy + x * st + y * ct]; };
  const ss = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };
  const wid = [], rc = [], ang = [];
  for (let j = 0; j < L; j++) {
    const u = j / T, uc = Math.min(1, u), su = (u * 12) % 1, bump = 1 + .12 * Math.exp(-su * 7), base = g.w0 + (g.w1 - g.w0) * uc;
    wid.push(base * (1 + g.pulse * Math.sin(u * TAU * 3 + ph1)) * bump * (.5 + .5 * ss(j / (M * .35))));
    rc.push(R + g.wob * Math.sin(u * TAU * 2 + ph2) + lo[j % T] * g.wob * .8); ang.push(a0 + u * TAU);
  }
  const poly = (j0: number, j1: number, grow: number, js: number) => { const o = [], n = []; for (let j = j0; j <= j1; j++) { const hw = wid[j] / 2 + grow; o.push(pt(ang[j], rc[j] + hw + eo[j % T] * g.jit * js)); n.push(pt(ang[j], rc[j] - hw + ei[j % T] * g.jit * js)); } const ring = o.concat(n.reverse()); return 'M' + ring.map((q) => f1(q[0]) + ',' + f1(q[1])).join(' L') + ' Z'; };
  const line = (j0: number, j1: number, f: number, ex: number) => { const p = []; for (let j = j0; j <= j1; j++) p.push(pt(ang[j], rc[j] + f * wid[j] + ex)); return 'M' + p.map((q) => f1(q[0]) + ',' + f1(q[1])).join(' L'); };
  const strokes = [], dotIdx = [2, 5, 8, 10, 11], dotsAll = [];
  for (let q = 0; q < g.splat; q++) { const i = dotIdx[q % dotIdx.length]; for (let k = 0; k < 2; k++) { const jj = i * M + Math.round(M * .4) + k * Math.round(M * .2), side = (q % 2 === 0) ? 1 : -1; const c = pt(ang[jj], rc[jj] + side * (wid[jj] / 2 + 22 + r() * 34)); dotsAll.push({ i, x: f1(c[0]), y: f1(c[1]), r: f1(2.5 + r() * 5) }); } }
  for (let i = 0; i < 12; i++) {
    const j0 = i * M, j1 = Math.min(L - 1, i * M + M + 1);
    const s = { i, body: poly(j0, j1, 0, 1), halo: poly(j0, j1, 5, 1.7), head: poly(j0, Math.min(j1, j0 + Math.round(M * .3)), 0, 1), op: i % 2 === 0 ? .94 : .89, center: line(j0, j1, 0, 0), br: [], hr: [], dots: dotsAll.filter((d) => d.i === i) };
    const nb = Math.max(3, Math.round((5 + Math.round(g.dry * 4)) * (M < 14 ? .7 : 1)));
    for (let b = 0; b < nb; b++) {
      const f = -.4 + (.8 * b) / (nb - 1) + (r() - .5) * .06, keep = r() < .35 + .65 * g.dry;
      const d1 = Math.round(14 + r() * 70), d2 = Math.round(5 + r() * 22 * (.4 + g.dry)), d3 = Math.round(20 + r() * 80), d4 = Math.round(4 + r() * 18);
      const sw = f1(1.1 + r() * 3.2 * (.5 + g.dry)), op = f1(.3 + .55 * g.dry * r() + .2 * r());
      if (keep) s.br.push({ d: line(j0, j1, f, 0), sw, op, dash: d1 + ' ' + d2 + ' ' + d3 + ' ' + d4 });
    }
    for (let h = 0; h < 3; h++) { const side = r() > .5 ? .5 : -.5, jj0 = j0 + Math.floor(r() * Math.round(M * .3)); s.hr.push({ d: line(jj0, Math.min(j1, jj0 + Math.round(M * .6)), side, (r() - .5) * 6), sw: f1(1 + r() * 1.4), op: f1(.3 + r() * .35), dash: Math.round(20 + r() * 40) + ' ' + Math.round(6 + r() * 16) }); }
    strokes.push(s);
  }
  const wp = []; for (let k = 0; k < 72; k++) { const a = (k / 72) * TAU, c2 = pt(a, R - 14 + 2.4 * Math.sin(a * 3 + ph1) + 1.6 * Math.sin(a * 7 + ph2)); wp.push(f1(c2[0]) + ',' + f1(c2[1])); }
  const fibers = [], specks = [];
  for (let z = 0; z < 16; z++) { const x1 = r() * 1000, y1 = r() * 1250; fibers.push([f1(x1), f1(y1), f1(x1 + (r() - .5) * 120), f1(y1 + (r() - .5) * 36)]); }
  for (let z = 0; z < 26; z++) specks.push([f1(r() * 1000), f1(r() * 1250), f1(.6 + r() * 1.1)]);
  const qq = [r() > .4, r() > .5, r() > .5, r() > .35], cells = [], cs = 22, ox = 743 + 57 - cs * 2, oy = 953 + 57 - cs * 2;
  [[0, 0, qq[0]], [1, 0, qq[1]], [0, 1, qq[2]], [1, 1, qq[3]]].forEach((c) => { if (!c[2]) return; const x = c[0], y = c[1];[[x, y], [3 - x, y], [x, 3 - y], [3 - x, 3 - y]].forEach((m) => cells.push([ox + m[0] * cs, oy + m[1] * cs, cs - 3])); });
  return (cache[key] = { strokes, wash: 'M' + wp.join(' L') + ' Z', fibers, specks, cells, a0 });
}
const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]);
let uid = 0;
export function ensoSvg(data: any, c: any, name: string, sym: string, no: string) {
  const u = 'e' + uid++, o: string[] = []; name = esc(name); sym = esc(sym);
  o.push('<svg viewBox="0 0 1000 1250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>');
  data.strokes.forEach((s: any) => o.push(`<mask id="${u}m${s.i}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1250"><path class="mp" d="${s.center}" fill="none" stroke="#fff" stroke-width="240" pathLength="1"/></mask>`));
  o.push(`</defs><rect width="1000" height="1250" fill="${c.paper}"/>`);
  data.fibers.forEach((f: any) => o.push(`<line x1="${f[0]}" y1="${f[1]}" x2="${f[2]}" y2="${f[3]}" stroke="${c.shade}" stroke-width="1.4" stroke-opacity=".18"/>`));
  data.specks.forEach((k: any) => o.push(`<circle cx="${k[0]}" cy="${k[1]}" r="${k[2]}" fill="${c.shade}" fill-opacity=".3"/>`));
  o.push(`<path d="${data.wash}" fill="${c.wash}" fill-opacity=".26"/>`);
  data.strokes.forEach((s: any) => {
    o.push(`<g mask="url(#${u}m${s.i})"><path d="${s.halo}" fill="${c.ink}" fill-opacity=".1"/><path d="${s.body}" fill="${c.ink}" fill-opacity="${s.op}"/><path d="${s.head}" fill="${c.ink}" fill-opacity=".2"/>`);
    s.br.forEach((b: any) => o.push(`<path d="${b.d}" fill="none" stroke="${c.paper}" stroke-width="${b.sw}" stroke-opacity="${b.op}" stroke-dasharray="${b.dash}" stroke-linecap="round"/>`));
    s.hr.forEach((b: any) => o.push(`<path d="${b.d}" fill="none" stroke="${c.ink}" stroke-width="${b.sw}" stroke-opacity="${b.op}" stroke-dasharray="${b.dash}" stroke-linecap="round"/>`));
    s.dots.forEach((d: any) => o.push(`<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="${c.ink}" fill-opacity=".75"/>`));
    o.push('</g>');
  });
  o.push(`<circle class="zdot" cx="500" cy="560" r="10" fill="${c.ink}"/>`);
  o.push(`<g class="rim"><rect x="20" y="20" width="960" height="1210" fill="none" stroke="${c.seal}" stroke-width="3" stroke-opacity=".9"/><rect x="32" y="32" width="936" height="1186" fill="none" stroke="${c.seal}" stroke-width="1.5" stroke-opacity=".9"/></g>`);
  o.push(`<g transform="rotate(-4 800 1010)"><g class="seal"><rect x="743" y="953" width="114" height="114" fill="none" stroke="${c.seal}" stroke-width="6"/>`);
  data.cells.forEach((k: any) => o.push(`<rect x="${k[0]}" y="${k[1]}" width="${k[2]}" height="${k[2]}" fill="${c.seal}"/>`));
  o.push('</g></g>');
  o.push(`<text x="60" y="1146" font-family="serif" font-size="40" fill="${c.ink}">${name} (${sym})</text><text x="60" y="1198" font-family="sans-serif" font-size="26" fill="${c.ink}" fill-opacity=".8">No. ${no}</text><text class="cnt" x="940" y="1198" text-anchor="end" font-family="sans-serif" font-size="26" fill="${c.ink}" fill-opacity=".8">0 of 12 strokes</text></svg>`);
  return o.join('');
}
