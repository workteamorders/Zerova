'use client';
import { useEffect, useState } from 'react';

export function MotionToggle() {
  const [off, setOff] = useState(false);
  useEffect(() => { setOff(window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  useEffect(() => { document.documentElement.dataset.motion = off ? 'off' : 'on'; }, [off]);
  return <button type="button" className="linkbtn" aria-pressed={off} onClick={() => setOff((v) => !v)}>{off ? 'Play motion' : 'Pause motion'}</button>;
}
