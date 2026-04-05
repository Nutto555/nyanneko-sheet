import StatBadge from '../ui/StatBadge';
import type { UnitSlotData } from '../../types/ui';

/** Allow only relative paths and same-origin Supabase URLs as image src. */
function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    const supabaseHost = import.meta.env.VITE_SUPABASE_URL
      ? new URL(import.meta.env.VITE_SUPABASE_URL).host
      : null;
    if (supabaseHost && parsed.host === supabaseHost) return url;
  } catch { /* invalid URL */ }
  return null;
}

interface UnitSlotProps {
  unit: UnitSlotData;
}

export default function UnitSlot({ unit }: UnitSlotProps) {
  const portraitUrl = safeImageUrl(unit.image_url);
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      {/* Portrait */}
      <div
        className="relative rounded-lg overflow-hidden shrink-0"
        style={{
          width: 72,
          height: 72,
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border-bright)',
        }}
      >
        {portraitUrl ? (
          <img
            src={portraitUrl}
            alt={unit.name_en}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
            ⚔
          </div>
        )}
      </div>

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
