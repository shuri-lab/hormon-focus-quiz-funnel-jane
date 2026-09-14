import { TILES, type SymptomId } from '../lib/logic';
import { IMG } from '../lib/content';
import { Tick } from './icons';

export function TileGrid({
  selected, onToggle,
}: {
  selected: SymptomId[];
  onToggle: (id: SymptomId) => void;
}) {
  return (
    <div className="tiles" role="group" aria-label="Symptoms">
      {TILES.map(([id, label], i) => {
        const on = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            role="checkbox"
            className="tile"
            aria-checked={on}
            aria-pressed={on}
            onClick={() => onToggle(id)}
          >
            <img
              src={IMG[id]}
              alt=""
              width={540}
              height={405}
              /* the first row is above the fold on every phone size */
              loading={i < 2 ? 'eager' : 'lazy'}
              fetchPriority={i < 2 ? 'high' : 'auto'}
              decoding="async"
            />
            <span className="tileCheck"><Tick /></span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
