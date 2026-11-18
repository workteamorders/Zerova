'use client';
import { useEffect, useMemo, useRef } from 'react';
import { color, pigments } from '@/lib/tokens';
import { build, ensoSvg } from '@/lib/enso';

type Props = {
  seed?: number; gesture?: number; pigment?: number; name?: string; symbol?: string; no?: string;
  /** strokes drawn, 0 to 12 */ strokes?: number; sealed?: boolean; small?: boolean;
};

/** Illustrative painting. Marked EXAMPLE wherever it is shown. Not the on-chain renderer. */
export function Enso({ seed = 33, gesture = 3, pigment = 4, name = 'Quiet Hours', symbol = 'QUIET', no = '7', strokes = 12, sealed = false, small = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => {
    const p = pigments[pigment];
    return ensoSvg(build(seed, gesture, small ? 10 : 20), { paper: color.paper, shade: color.shade, ink: p.ink, wash: p.wash, seal: p.seal }, name, symbol, no);
  }, [seed, gesture, pigment, name, symbol, no, small]);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.querySelectorAll<SVGPathElement>('.mp').forEach((m, i) => { m.style.strokeDashoffset = i < strokes ? '0' : '1'; });
    el.firstElementChild?.classList.toggle('done', sealed);
    const cnt = el.querySelector('.cnt'); if (cnt) cnt.textContent = `${strokes} of 12 strokes`;
  }, [html, strokes, sealed]);
  return <div ref={ref} className="paint" role="img" aria-label={`Illustrative ink circle painting, ${strokes} of 12 strokes drawn${sealed ? ', completion seal stamped' : ''}, example only`} dangerouslySetInnerHTML={{ __html: html }} />;
}
