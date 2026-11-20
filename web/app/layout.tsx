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
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23EFE8DD'/%3E%3Cpath d='M7 8.5 Q16 6.5 25 7.5' stroke='%23141312' stroke-width='4.2' fill='none' stroke-linecap='round'/%3E%3Cpath d='M24 8.5 L8 23.5' stroke='%23141312' stroke-width='4.4' fill='none' stroke-linecap='round'/%3E%3Cpath d='M7 24.5 Q16 26 25.5 23.5' stroke='%23C4321F' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E" />
        <style dangerouslySetInnerHTML={{ __html: cssVars() }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <LiveBg />
        <header className="hdr">
          <a className="brand" href="/" aria-label={`${BRAND.name} home`}>
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 8.5 Q16 6.5 25 7.5" stroke="currentColor" strokeWidth="4.2" fill="none" strokeLinecap="round" /><path d="M24 8.5 L8 23.5" stroke="currentColor" strokeWidth="4.4" fill="none" strokeLinecap="round" /><path d="M7 24.5 Q16 26 25.5 23.5" stroke="#C4321F" strokeWidth="4" fill="none" strokeLinecap="round" /></svg>
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
