/**
 * Color-coded badge for GVG stat types.
 * Maps stat abbreviations to a semantic color group.
 */

import type { StatVariant } from '../../types/ui';

const STAT_COLORS: Record<StatVariant, { bg: string; text: string; border: string }> = {
  atk:     { bg: 'rgba(239,68,68,.15)',   text: '#fca5a5', border: 'rgba(239,68,68,.35)' },
  def:     { bg: 'rgba(59,130,246,.15)',  text: '#93c5fd', border: 'rgba(59,130,246,.35)' },
  block:   { bg: 'rgba(139,92,246,.15)',  text: '#c4b5fd', border: 'rgba(139,92,246,.35)' },
  crit:    { bg: 'rgba(245,158,11,.15)',  text: '#fcd34d', border: 'rgba(245,158,11,.35)' },
  spd:     { bg: 'rgba(16,185,129,.15)',  text: '#6ee7b7', border: 'rgba(16,185,129,.35)' },
  neutral: { bg: 'rgba(255,255,255,.08)', text: '#94a3b8', border: 'rgba(255,255,255,.12)' },
};

function classifyStat(stat: string): StatVariant {
  const s = stat.toUpperCase();
  if (s.includes('ATK') || s.includes('WKNESS') || s.includes('WK%') || s.includes('C.DMG')) return 'atk';
  if (s.includes('DEF') || s.includes('HP')) return 'def';
  if (s.includes('BLOCK') || s.includes('DTR')) return 'block';
  if (s.includes('C.R') || s.includes('CRIT') || s.includes('C.RATE')) return 'crit';
  if (s.includes('SPD') || s.includes('SPEED') || s.includes('EHR')) return 'spd';
  return 'neutral';
}

interface StatBadgeProps {
  stat: string;
  className?: string;
}

export default function StatBadge({ stat, className = '' }: StatBadgeProps) {
  const variant = classifyStat(stat);
  const colors = STAT_COLORS[variant];

  return (
    <span
      className={`stat-badge ${className}`}
      style={{
        background: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {stat}
    </span>
  );
}
