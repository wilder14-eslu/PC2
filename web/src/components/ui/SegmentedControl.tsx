export interface SegmentedOption<T extends string> { value: T; label: string }
export interface SegmentedControlProps<T extends string> { label: string; options: readonly SegmentedOption<T>[]; value: T; onChange: (value: T) => void }
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return <div className="ui-segmented" role="group" aria-label={label}>{options.map(option => <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}
export default SegmentedControl;
