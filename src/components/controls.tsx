import { Tick } from './icons';

/* One-of. Selecting advances the funnel, so there is no Continue button. */
export function SingleChoice<T extends string>({
  name, options, value, onPick,
}: {
  name: string;
  options: [string, string][];
  value: T | '';
  onPick: (v: T) => void;
}) {
  return (
    <div className="opts" role="radiogroup" aria-label={name}>
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="radio"
          className="opt"
          aria-checked={value === id}
          aria-pressed={value === id}
          onClick={() => onPick(id as T)}
        >
          <span className="tick"><Tick /></span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* Any-of. Commits through the sticky action bar. */
export function MultiChoice({
  name, options, values, onToggle,
}: {
  name: string;
  options: [string, string][];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="opts" role="group" aria-label={name}>
      {options.map(([id, label]) => {
        const on = values.includes(id);
        return (
          <button
            key={id}
            type="button"
            role="checkbox"
            className="opt multi"
            aria-checked={on}
            aria-pressed={on}
            onClick={() => onToggle(id)}
          >
            <span className="tick"><Tick /></span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
