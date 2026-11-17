export function InfoTooltip({ label = 'Más información', children }: { label?: string; children: string }) { return <details className="ui-info"><summary>{label}</summary><p>{children}</p></details>; }
export default InfoTooltip;
