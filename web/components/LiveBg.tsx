'use client';
import { useEffect, useRef } from 'react';
import { startLiveBg } from '@/lib/livebg';

/** Fixed live background behind the page. See lib/livebg.ts for the layers. */
export function LiveBg() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current) startLiveBg(ref.current); }, []);
  return <div id="bg" aria-hidden="true"><canvas ref={ref} id="bgcv" /></div>;
}
