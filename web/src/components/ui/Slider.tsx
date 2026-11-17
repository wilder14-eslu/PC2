import { useId } from 'react';
export interface SliderProps { label: string; values: readonly number[]; value: number; onChange: (value: number) => void; format?: (value: number) => string }
export function Slider({ label, values, value, onChange, format = String }: SliderProps) {
  const id = useId();
  const index = Math.max(0, values.indexOf(value));
  return <div className="ui-slider"><label htmlFor={id}>{label}: <strong>{format(value)}</strong></label><input id={id} type="range" min={0} max={Math.max(0, values.length - 1)} step={1} value={index} aria-valuetext={format(value)} onChange={event => { const next = values[Number(event.target.value)]; if (next !== undefined) onChange(next); }} /></div>;
}
export default Slider;
