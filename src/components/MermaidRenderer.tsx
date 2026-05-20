'use client';

import { useEffect, useRef } from 'react';

export default function MermaidRenderer({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: mermaid } = await import('mermaid');
      if (cancelled) return;
      mermaid.initialize({ theme: 'dark', startOnLoad: false });
      const { svg } = await mermaid.render('mermaid-svg-' + Math.random().toString(36).slice(2), chart);
      if (!cancelled && ref.current) {
        ref.current.innerHTML = svg;
      }
    })();
    return () => { cancelled = true; };
  }, [chart]);

  return <div ref={ref} className="my-6 flex justify-center" />;
}
