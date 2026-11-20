import type { Metadata } from 'next';
import './globals.css';
import { BRAND } from '@/config/brand';
import { cssVars } from '@/lib/tokens';
import { LiveBg } from '@/components/LiveBg';
import { MotionToggle } from '@/components/MotionToggle';

export const metadata: Metadata = {
  title: `${BRAND.name}: design system`,
  description: 'Permissionless launchpad on Robinhood Chain. Design tokens and styleguide.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-motion="on">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500..800&family=Inter:wght@400..700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 28 28%27%3E%3Ccircle cx=%2714%27 cy=%2714%27 r=%2710%27 fill=%27none%27 stroke=%27%23141312%27 stroke-width=%273.2%27 stroke-dasharray=%2754 9%27/%3E%3C/svg%3E" />
        <style dangerouslySetInnerHTML={{ __html: cssVars() }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <LiveBg />
        <header className="hdr">
          <a className="brand" href="/" aria-label={`${BRAND.name} home`}>
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" strokeWidth="3.2" pathLength="1" strokeDasharray="1 1" strokeDashoffset=".12" transform="rotate(-60 14 14)" /></svg>
            {BRAND.name}
          </a>
          <nav aria-label="Primary"><a href="/styleguide/">Styleguide</a></nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <div className="wrap">
            <span>Digital collectibles and tokens. Not financial advice. No external audit yet. Not affiliated with Robinhood Markets, Robinhood Chain, Uniswap or any marketplace.</span>
            <span>Design system preview. Paintings are illustrative drawings, not the on-chain renderer. <MotionToggle /></span>
          </div>
        </footer>
      </body>
    </html>
  );
}
