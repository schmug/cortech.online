import { Suspense, lazy, useEffect, useState } from 'react';

const OSShell = lazy(() => import('./os/OSShell'));
const MobileShell = lazy(() => import('./mobile/MobileShell'));

const MOBILE_MAX = 767;

type Mode = 'mobile' | 'desktop' | null;

export default function RootShell() {
  const [mode, setMode] = useState<Mode>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const update = () => setMode(mq.matches ? 'mobile' : 'desktop');
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (mode === null) {
    return <div className="ct-backdrop min-h-[100dvh]" aria-hidden="true" />;
  }

  return (
    <Suspense fallback={<div className="ct-backdrop min-h-[100dvh]" aria-hidden="true" />}>
      {mode === 'mobile' ? <MobileShell /> : <OSShell />}
    </Suspense>
  );
}
