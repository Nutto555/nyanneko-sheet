import StatBadge from '../ui/StatBadge';
import { CharacterPortrait } from '../character-portrait/CharacterPortrait';
import type { UnitSlotData } from '../../types/ui';
import type { Character } from '../../types/database';

interface UnitSlotProps {
  unit: UnitSlotData;
}

export default function UnitSlot({ unit }: UnitSlotProps) {
  // Cast needed: UnitSlotData is a partial view type, not a full Character.
  // We construct a display-only Character to satisfy CharacterPortrait's prop type.
  const minimalCharacter = {
    id: '',
    name_en: unit.name_en,
    name_th: unit.name_th ?? '',
    slug: '',
    role: null,
    type: null,
    image_url: unit.image_url ?? null,
    thumbnail_url: null,
    notes: null,
    created_at: '',
    updated_at: '',
  } as Character;

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      {/* Portrait */}
      <CharacterPortrait character={minimalCharacter} size="lg" showName={false} />

      {/* Name */}
      <div className="text-center leading-tight max-w-[80px]">
        <div className="text-xs font-semibold text-white truncate">{unit.name_en}</div>
        {unit.name_th && (
          <div className="text-xs opacity-40 truncate" style={{ fontFamily: 'var(--font-body)' }}>
            {unit.name_th}
          </div>
        )}
      </div>

      {/* Primary stat + target */}
      {unit.stat_primary && (
        <div className="flex flex-col items-center gap-0.5">
          <StatBadge stat={unit.stat_primary} />
          {unit.stat_secondary && unit.stat_secondary !== unit.stat_primary && (
            <StatBadge stat={unit.stat_secondary} />
          )}
          {unit.stat_target && (
            <span
              className="text-xs font-bold"
              style={{ color: 'var(--color-gold-light)' }}
            >
              {unit.stat_target}
            </span>
          )}
        </div>
      )}

      {/* Per-unit notes */}
      {unit.notes && (
        <p className="text-center text-xs leading-snug opacity-50 max-w-[90px] line-clamp-2">
          {unit.notes}
        </p>
      )}
    </div>
  );
}
