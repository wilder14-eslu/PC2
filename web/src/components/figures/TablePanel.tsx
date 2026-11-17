import { useId, type ReactNode } from 'react';
export interface TablePanelProps { number: number | string; title: string; note: ReactNode; children: ReactNode }
export function TablePanel({ number, title, note, children }: TablePanelProps) {
  const id = useId();
  return <section className="table-panel" aria-labelledby={id}><div className="table-panel__heading"><div id={id} className="table-panel__caption"><strong>Tabla {number}</strong><em>{title}</em></div></div><div className="table-scroll" role="region" aria-labelledby={id} tabIndex={0}>{children}</div><p className="table-panel__note"><em>Nota.</em> {note}</p></section>;
}
export default TablePanel;
