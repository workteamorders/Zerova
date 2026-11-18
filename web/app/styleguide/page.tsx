import type { Metadata } from 'next';
import { BRAND } from '@/config/brand';
import { color, contrast, font, gestures, motion, pigments, radius, space, typeScale } from '@/lib/tokens';
import { Enso } from '@/components/Enso';

export const metadata: Metadata = { title: `Styleguide | ${BRAND.name}` };

const swatches: { key: keyof typeof color; use: string }[] = [
  { key: 'bg', use: 'Page background' },
  { key: 'surface', use: 'Cards, inputs, paintings frame' },
  { key: 'fg', use: 'Text, strong lines, pressed chips' },
  { key: 'dim', use: 'Secondary text' },
  { key: 'line', use: 'Hairlines and dividers' },
  { key: 'frame', use: 'Painting frame border' },
  { key: 'accent', use: 'Primary action, large emphasis' },
  { key: 'accentHover', use: 'Primary action, hover fill' },
  { key: 'onAccent', use: 'Text on the accent' },
  { key: 'warn', use: 'Errors and EXAMPLE or MOCK tags' },
  { key: 'off', use: 'Disabled fill' },
  { key: 'paper', use: 'Painting paper' },
];

const pairs: { fg: keyof typeof color; bg: keyof typeof color; use: string; large?: boolean }[] = [
  { fg: 'fg', bg: 'bg', use: 'Body text on the page' },
  { fg: 'fg', bg: 'surface', use: 'Body text on a card' },
  { fg: 'dim', bg: 'bg', use: 'Secondary text on the page' },
  { fg: 'dim', bg: 'surface', use: 'Secondary text on a card' },
  { fg: 'onAccent', bg: 'accent', use: 'Primary button label' },
  { fg: 'onAccent', bg: 'accentHover', use: 'Primary button label, hover' },
  { fg: 'warn', bg: 'bg', use: 'Error text, EXAMPLE and MOCK tags' },
  { fg: 'warn', bg: 'surface', use: 'Error text on a card' },
  { fg: 'onOff', bg: 'off', use: 'Disabled button label' },
  { fg: 'bg', bg: 'fg', use: 'Pressed chip, toast' },
  { fg: 'accent', bg: 'bg', use: 'Italic display line only (24px and up)', large: true },
];

const vocab: [string, string][] = [
  ['Studio', 'Where a coin and its Enso are made.'],
  ['Enso', 'The ink circle painting that is minted with each coin.'],
  ['Gesture', 'One of 8 brush movements chosen at launch.'],
  ['Pigment', 'One of 6 inks chosen at launch.'],
  ['Stroke', 'One of the 12 brush strokes that make the circle.'],
  ['Progress', 'How far the market price has moved up from the launch price. A display, not a promise.'],
  ['Launch', 'The single transaction that creates the token, the pool and the Enso.'],
  ['Gallery', 'Where launched coins are shown.'],
  ['Collection', 'The Enso held by one wallet.'],
  ['Zero Standard', 'Five checks computed from the chain for each coin. No score, no badge.'],
];

function Tick() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 10.4 L9 13.2 L14 7.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function Styleguide() {
  return (
    <>
      <section className="blk" style={{ borderTop: 0 }}>
        <div className="wrap">
          <p className="lbl">Design system · direction Mist</p>
          <h1 style={{ fontSize: 'clamp(40px,5.4vw,72px)', lineHeight: 1, margin: 'var(--s4) 0 var(--s5)' }}>Styleguide</h1>
          <p className="sub" style={{ marginBottom: 0 }}>Tokens, type, components and the voice of {BRAND.name}. Every value on this page is read from the same token file the site uses, including the contrast ratios, which are computed here.</p>
        </div>
      </section>

      <section className="blk" id="color">
        <div className="wrap">
          <h2 className="sg-h">Color</h2>
          <div className="sg-grid">
            {swatches.map((s) => (
              <div key={s.key}>
                <div className="sg-sw" style={{ background: color[s.key] }} />
                <b>{s.key}</b>
                <div className="sg-code">{color[s.key]}</div>
                <div className="note">{s.use}</div>
              </div>
            ))}
          </div>
          <h3 className="sg-sub">Contrast, computed (WCAG 2.2)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="sg">
              <thead><tr><th>Pair</th><th>Use</th><th>Ratio</th><th>Needs</th><th>Result</th></tr></thead>
              <tbody>
                {pairs.map((p) => {
                  const r = contrast(color[p.fg], color[p.bg]); const need = p.large ? 3 : 4.5; const ok = r >= need;
                  return (
                    <tr key={p.fg + p.bg}>
                      <td><span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: color[p.bg], color: color[p.fg], border: '1px solid var(--c-line)', fontWeight: 600 }}>Aa</span> <span className="sg-code">{p.fg} on {p.bg}</span></td>
                      <td>{p.use}</td>
                      <td>{r.toFixed(2)} : 1</td>
                      <td>{need} : 1{p.large ? ' (large)' : ''}</td>
                      <td className={ok ? 'pass' : 'fail'}>{ok ? 'Pass' : 'Fail'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <h3 className="sg-sub">Pigments, used only inside paintings</h3>
          <div className="sg-row">
            {pigments.map((p) => (
              <div key={p.id} style={{ minWidth: 120 }}>
                <div className="sg-row" style={{ gap: 6, marginBottom: 8 }}>
                  {[p.ink, p.wash, p.seal].map((c) => <span key={c} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: '1px solid rgba(16,34,42,.18)' }} />)}
                </div>
                <b>{p.name}</b>
                <div className="sg-code">{p.ink}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="blk" id="type">
        <div className="wrap">
          <h2 className="sg-h">Type</h2>
          <p className="sub">Display: Fraunces, a soft serif, with italics for the second line of a headline. Body and labels: Figtree. Two families, no monospace.</p>
          <div style={{ display: 'grid', gap: 'var(--s5)' }}>
            {typeScale.map((t) => (
              <div key={t.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,160px) 1fr', gap: 'var(--s5)', alignItems: 'baseline', borderBottom: '1px solid var(--c-line)', paddingBottom: 'var(--s4)' }}>
                <div><b>{t.name}</b><div className="sg-code">{t.css}</div><div className="sg-code">{t.family}, {t.weight}</div></div>
                <div style={{ fontFamily: t.family === 'display' ? font.display : font.body, fontSize: t.css, fontWeight: t.weight, lineHeight: 1.05, letterSpacing: t.family === 'display' ? '-.02em' : t.name === 'Label' ? '.16em' : 0 }}>{t.sample}</div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,160px) 1fr', gap: 'var(--s5)', alignItems: 'baseline' }}>
              <div><b>Display pair</b><div className="sg-code">roman + italic accent</div></div>
              <div style={{ fontFamily: font.display, fontSize: 'clamp(46px,6.6vw,92px)', lineHeight: 0.98, letterSpacing: '-.025em' }}>Start at 0.<br /><i style={{ color: 'var(--c-accent)', fontWeight: 400 }}>Close the circle.</i></div>
            </div>
          </div>
        </div>
      </section>

      <section className="blk" id="space">
        <div className="wrap">
          <h2 className="sg-h">Space, radius, shadow</h2>
          <div className="sg-row" style={{ alignItems: 'flex-end', marginBottom: 'var(--s6)' }}>
            {Object.entries(space).map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ width: v, height: v, background: 'var(--c-accent)', borderRadius: 3, margin: '0 auto 6px' }} />
                <div className="sg-code">{k}<br />{v}px</div>
              </div>
            ))}
          </div>
          <div className="sg-row">
            {Object.entries(radius).map(([k, v]) => (
              <div key={k}>
                <div style={{ width: 120, height: 80, border: '1.5px solid var(--c-fg)', borderRadius: Math.min(v, 40), background: 'var(--c-surface)' }} />
                <div className="sg-code" style={{ marginTop: 6 }}>{k} · {v}px</div>
              </div>
            ))}
            <div>
              <div style={{ width: 120, height: 80, borderRadius: radius.card, background: 'var(--c-surface)', boxShadow: 'var(--shadow)' }} />
              <div className="sg-code" style={{ marginTop: 6 }}>shadow · card</div>
            </div>
          </div>
        </div>
      </section>

      <section className="blk" id="motion">
        <div className="wrap">
          <h2 className="sg-h">Motion</h2>
          <p className="sub">Only transform and opacity move. A brush stroke reveals along its path. The live background is the wind trails behind this page: it stops when the browser asks for reduced motion, when the tab is hidden, and from the Pause motion control in the footer.</p>
          <table className="sg">
            <thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead>
            <tbody>
              <tr><td>ease-out</td><td className="sg-code">{motion.easeOut}</td><td>Reveals, button fill sweep</td></tr>
              <tr><td>ease-brush</td><td className="sg-code">{motion.easeBrush}</td><td>Stroke reveal along the path</td></tr>
              <tr><td>fast</td><td className="sg-code">{motion.fast}</td><td>Hover color and border</td></tr>
              <tr><td>base</td><td className="sg-code">{motion.base}</td><td>Button state</td></tr>
              <tr><td>slow</td><td className="sg-code">{motion.slow}</td><td>Section reveal</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="blk" id="components">
        <div className="wrap">
          <h2 className="sg-h">Components</h2>

          <h3 className="sg-sub">Buttons</h3>
          <div className="sg-row">
            <button className="btn primary" type="button">Launch a coin</button>
            <button className="btn primary is-hover" type="button">Hover</button>
            <button className="btn primary focus-demo" type="button">Focus</button>
            <button className="btn primary" type="button" disabled>Disabled</button>
            <button className="btn ghost" type="button">How it works</button>
            <button className="btn ghost is-hover" type="button">Hover</button>
            <button className="btn primary lg" type="button">Large</button>
          </div>

          <h3 className="sg-sub">Wallet</h3>
          <div className="sg-row">
            <button className="btn ghost" type="button" aria-pressed="false">Connect wallet</button>
            <button className="btn ghost on" type="button" aria-pressed="true"><span className="dot" aria-hidden="true" />0x7a3F…9c21</button>
          </div>
          <div style={{ marginTop: 'var(--s4)', maxWidth: 640 }}>
            <div className="walletbar"><span>Connected: 0x7a3F…9c21 <span className="mock">EXAMPLE</span> {BRAND.chain}</span><button className="btn ghost" type="button" style={{ minHeight: 40 }}>Disconnect</button></div>
          </div>
          <p className="note" style={{ marginTop: 'var(--s3)' }}>The address above is an example. Nothing here contacts a wallet.</p>

          <h3 className="sg-sub">Fields</h3>
          <div className="sg-row" style={{ alignItems: 'flex-start' }}>
            <div className="field" style={{ width: 300 }}><label htmlFor="sg1">Name</label><input id="sg1" type="text" defaultValue="Quiet Hours" readOnly /><span className="hint">1 to 32 characters. Cannot be changed after launch.</span></div>
            <div className="field" style={{ width: 300 }}><label htmlFor="sg2">Symbol</label><input id="sg2" className="err-in" type="text" defaultValue="Q" readOnly aria-invalid="true" /><span className="err">The symbol is 2 to 8 letters or digits.</span></div>
          </div>

          <h3 className="sg-sub">Gesture and pigment</h3>
          <div className="sg-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', marginBottom: 'var(--s4)' }}>
            {gestures.slice(0, 4).map((g, i) => (
              <button key={g.id} type="button" className="opt" role="radio" aria-checked={i === 3}><b>{g.name}</b><span>{g.note}</span></button>
            ))}
          </div>
          <div className="sg-row" style={{ gap: 8 }}>
            {pigments.map((p, i) => (
              <button key={p.id} type="button" className="swb" role="radio" aria-checked={i === 4}><i style={{ background: p.ink }} />{p.name}</button>
            ))}
          </div>

          <h3 className="sg-sub">Chips and stepper</h3>
          <div className="sg-row" style={{ marginBottom: 'var(--s5)' }}>
            <button className="chip" type="button" aria-pressed="false">0%</button>
            <button className="chip" type="button" aria-pressed="false">50%</button>
            <button className="chip" type="button" aria-pressed="false">100%</button>
            <button className="chip" type="button" aria-pressed="true">Complete</button>
          </div>
          <ol className="steps" aria-label="Studio progress">
            <li><span className="st dn"><span className="n">✓</span>Name and symbol</span></li>
            <li><span className="st dn"><span className="n">✓</span>Gesture and pigment</span></li>
            <li><span className="st cur" aria-current="step"><span className="n">3</span>Preview</span></li>
            <li><span className="st"><span className="n">4</span>Review and sign</span></li>
          </ol>

          <h3 className="sg-sub">The bill</h3>
          <dl className="bill" style={{ maxWidth: 780 }}>
            <div><dt>Launch fee</dt><dd>Exactly 0.0005 ETH, paid to the factory and withdrawable only to the treasury address.</dd></div>
            <div><dt>Supply</dt><dd>1,000,000,000 tokens are minted and all of them go into the pool.</dd><dd className="z">0 to you</dd></div>
            <div><dt>First buy</dt><dd>This transaction buys no tokens for you.</dd><dd className="z">0</dd></div>
          </dl>
          <label className="ack" style={{ maxWidth: 780, marginTop: 'var(--s4)' }}><input type="checkbox" defaultChecked readOnly /><span>I have read what this transaction does and the risks above. I understand there is no external audit yet.</span></label>

          <h3 className="sg-sub">Zero Standard rows</h3>
          <div style={{ maxWidth: 780 }}>
            <div className="flag"><div className="t"><b>Supply fixed</b><small>Total supply equals 1,000,000,000.</small></div><div className="v"><div><span>true</span><br /><small>1,000,000,000</small></div><Tick /></div></div>
            <div className="flag"><div className="t"><b>Position locked</b><small>The factory owns the pool position and it holds liquidity.</small></div><div className="v"><div><span>true</span><br /><small>owner is the factory</small></div><Tick /></div></div>
          </div>

          <h3 className="sg-sub">Tags and toast</h3>
          <div className="sg-row">
            <span className="ex">EXAMPLE</span><span className="mock">MOCK</span>
            <span className="toast" role="status">Mock wallet connected. This prototype contacts no real wallet.</span>
          </div>
        </div>
      </section>

      <section className="blk" id="enso">
        <div className="wrap">
          <h2 className="sg-h">The Enso, four states</h2>
          <p className="sub">One painting. Strokes follow the market and can come off. Only the completion seal is permanent. These are illustrations, not launched coins.</p>
          <div className="sg-states">
            {[{ n: 0, s: false, t: '0%', c: 'At launch price' }, { n: 6, s: false, t: '50%', c: '6 of 12 strokes' }, { n: 12, s: false, t: '100%', c: 'Closed, not yet recorded' }, { n: 12, s: true, t: 'Sealed', c: 'Completion recorded on-chain' }].map((x, i) => (
              <figure key={x.t} style={{ margin: 0 }}>
                <div style={{ fontFamily: font.display, fontSize: 34, lineHeight: 1, marginBottom: 12 }}>{x.t}</div>
                <div className="frame"><Enso small strokes={x.n} sealed={x.s} no={String(i + 1)} /></div>
                <figcaption style={{ paddingTop: 12, fontSize: 13 }}><span className="ex">EXAMPLE</span> {x.c}</figcaption>
              </figure>
            ))}
          </div>
          <h3 className="sg-sub">Gestures</h3>
          <div className="sg-states" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 'var(--s4)' }}>
            {gestures.map((g, i) => (
              <figure key={g.id} style={{ margin: 0 }}>
                <div className="frame" style={{ borderRadius: 16 }}><Enso small gesture={i} seed={21 + i * 7} pigment={i % 6} strokes={12} no={String(i + 1)} name={g.name} symbol={g.name.slice(0, 4).toUpperCase()} /></div>
                <figcaption style={{ paddingTop: 8, fontSize: 13 }}><b>{g.name}</b><div className="note">{g.note}</div></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="blk" id="voice">
        <div className="wrap">
          <h2 className="sg-h">Voice</h2>
          <p className="sub">Short, plain, in English. Fixed vocabulary below. A coin&apos;s price can fall to nothing, so the interface never promises an outcome and never claims an audit that has not happened. Banned wording is enforced by <span className="sg-code">pnpm copy:check</span>; the name is enforced by <span className="sg-code">pnpm brand:check</span>.</p>
          <table className="sg">
            <thead><tr><th>Word</th><th>Means</th></tr></thead>
            <tbody>{vocab.map(([w, m]) => <tr key={w}><td><b>{w}</b></td><td>{m}</td></tr>)}</tbody>
          </table>
          <p className="note" style={{ marginTop: 'var(--s5)' }}>Sample data is always labeled <span className="ex">EXAMPLE</span>. Prototype behavior is labeled <span className="mock">MOCK</span>.</p>
        </div>
      </section>
    </>
  );
}
