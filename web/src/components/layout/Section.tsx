import type { ReactNode } from 'react';

export function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow?: string; title: string; intro?: string; children: ReactNode }) {
  return <section id={id} className="content-section wrap" aria-labelledby={`${id}-title`}>
    <header className="section-heading">{eyebrow && <p className="section-eyebrow">{eyebrow}</p>}<h2 id={`${id}-title`}>{title}</h2>{intro && <p>{intro}</p>}</header>
    {children}
  </section>;
}
