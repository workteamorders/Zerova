import { BRAND } from '@/config/brand';

export default function Home() {
  return (
    <section className="blk" style={{ borderTop: 0 }}>
      <div className="wrap">
        <p className="lbl">Permissionless launchpad on {BRAND.chain}</p>
        <h1 style={{ fontSize: 'clamp(46px,6.6vw,92px)', lineHeight: 0.98, margin: 'var(--s5) 0 var(--s6)' }}>{BRAND.tagline}</h1>
        <p className="sub">The product pages are built after the styleguide is approved. The design tokens and components are on the styleguide page.</p>
        <a className="btn primary lg" href="/styleguide/">Open the styleguide</a>
      </div>
    </section>
  );
}
