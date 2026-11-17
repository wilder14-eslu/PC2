import type { ReactNode } from 'react';

export interface KpiCardProps { value: ReactNode; label: string; detail?: string; source?: string; variant?: 'neutral' | 'highlight' | 'risk' }
export function KpiCard({ value, label, detail, source, variant = 'neutral' }: KpiCardProps) {
  return <article className={`ui-kpi ui-kpi--${variant}`}><strong className="ui-kpi__value">{value}</strong><span className="ui-kpi__label">{label}</span>{detail && <span className="ui-kpi__detail">{detail}</span>}{source && <details className="ui-info"><summary>Fuente</summary><p>{source}</p></details>}</article>;
}
export default KpiCard;
