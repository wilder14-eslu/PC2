export interface ToggleProps { label: string; checked: boolean; onChange: (checked: boolean) => void }
export function Toggle({ label, checked, onChange }: ToggleProps) { return <label className="ui-toggle"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /><span>{label}</span></label>; }
export default Toggle;
