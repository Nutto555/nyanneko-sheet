import UnitSlot from '../unit-slot/UnitSlot';
import type { UnitSlotData } from '../unit-slot/UnitSlot';

export interface TeamCardData {
  title: string;
  speedTier?: string | null;
  units: UnitSlotData[];
  skillOrder?: string | null;
  speedOrder?: string | null;
  notes?: string | null;
}

interface TeamCardProps {
  team: TeamCardData;
}

function SpeedBadge({ tier }: { tier: string }) {
  const text = tier.toLowerCase();
  const isFast = text.includes('fast') || text.includes('250') || text.includes('270');
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: isFast ? 'rgba(240,160,48,.15)' : 'rgba(59,130,246,.15)',
        color: isFast ? 'var(--color-gold-light)' : '#93c5fd',
        border: `1px solid ${isFast ? 'rgba(240,160,48,.3)' : 'rgba(59,130,246,.3)'}`,
      }}
    >
      <span>{isFast ? '⚡' : '🛡'}</span>
      <span>{tier}</span>
    </span>
  );
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <div
      className="team-card rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 gap-3"
        style={{ background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border)' }}
      >
        <h3
          className="text-sm font-bold text-white truncate"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {team.title}
        </h3>
        {team.speedTier && <SpeedBadge tier={team.speedTier} />}
      </div>

      {/* Unit grid */}
      <div className="px-4 py-4">
        {team.units.length > 0 ? (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${Math.min(team.units.length, 3)}, minmax(0, 1fr))` }}
          >
            {team.units.map((unit, i) => (
              <UnitSlot key={i} unit={unit} />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 opacity-30 text-sm">No unit data</div>
        )}
      </div>

      {/* Footer: skill / speed order + notes */}
      {(team.skillOrder || team.speedOrder || team.notes) && (
        <div
          className="px-4 py-3 space-y-1.5 text-xs"
          style={{ borderTop: '1px solid var(--color-border)', background: 'rgba(0,0,0,.2)' }}
        >
          {team.skillOrder && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 opacity-50 mt-0.5">⚔</span>
              <span className="leading-relaxed text-slate-300">{team.skillOrder}</span>
            </div>
          )}
          {team.speedOrder && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 opacity-50 mt-0.5">⚡</span>
              <span className="leading-relaxed text-slate-300">{team.speedOrder}</span>
            </div>
          )}
          {team.notes && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 opacity-50 mt-0.5">📋</span>
              <span className="leading-relaxed opacity-60">{team.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
