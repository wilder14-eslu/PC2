import type { CSSProperties } from 'react';
export interface LegendItem { label: string; color: string }
export function Legend({ items, label = 'Leyenda' }: { items: readonly LegendItem[]; label?: string }) {
  return <ul className="ui-legend" aria-label={label}>{items.map(item => <li key={item.label}><span className="ui-legend__swatch" style={{ '--swatch': item.color } as CSSProperties} aria-hidden="true" />{item.label}</li>)}</ul>;
}
export default Legend;
