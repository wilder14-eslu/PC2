import { useId, useRef, type ReactNode } from 'react';
export interface FigurePanelProps { number: number | string; title: string; note: ReactNode; children: ReactNode; data?: ReactNode; description?: string; expandable?: boolean }
export function FigurePanel({ number, title, note, children, data, description, expandable = true }: FigurePanelProps) {
  const id = useId(); const panel = useRef<HTMLElement>(null);
  const toggleFullscreen = () => { if (document.fullscreenElement === panel.current) void document.exitFullscreen(); else if (panel.current?.requestFullscreen) void panel.current.requestFullscreen(); };
  return <figure ref={panel} className="figure-panel" aria-describedby={description ? id : undefined}>
    <figcaption className="figure-panel__heading"><span className="figure-panel__caption"><strong>Figura {number}</strong><em>{title}</em></span>{expandable && <button className="ui-button" type="button" onClick={toggleFullscreen} aria-label={`Ampliar figura ${number}`}>Ampliar</button>}</figcaption>
    {description && <p id={id}>{description}</p>}{children}
    {data && <details><summary>Ver datos</summary>{data}</details>}
    <p className="figure-panel__note"><em>Nota.</em> {note}</p>
  </figure>;
}
export default FigurePanel;
