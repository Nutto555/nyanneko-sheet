import type { EquipEntry } from '../../types/ui';
import StatBadge from '../ui/StatBadge';
import { safeImageUrl } from '../../utils/imageUrl';

function parseStats(text?: string): string[] {
  if (!text) return [];
  // Split on commas, slashes, newlines — each segment is a stat
  return text
    .split(/[,\/\n、]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 30);
}

interface EquipCardProps {
  entry: EquipEntry;
}

export default function EquipCard({ entry }: EquipCardProps) {
  const { character, team_context, skill_1, basic_attack, skill_2, passive } = entry;
  const portraitUrl = safeImageUrl(character.image_url);

  const rows: { label_en: string; label_th: string; text?: string; stats: string[] }[] = [
    { label_en: 'Basic', label_th: 'โจมตีพื้นฐาน', text: basic_attack, stats: parseStats(basic_attack) },
    { label_en: 'Skill 1', label_th: 'สกิล 1', text: skill_1, stats: parseStats(skill_1) },
    { label_en: 'Skill 2', label_th: 'สกิล 2', text: skill_2, stats: parseStats(skill_2) },
    { label_en: 'Passive', label_th: 'แพสซีฟ', text: passive, stats: parseStats(passive) },
  ].filter((r) => r.text);

  return (
    <div
      className="team-card rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border)' }}
      >
        {/* Portrait */}
        <div
          className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
          style={{ background: 'var(--color-border)', border: '1px solid var(--color-border-bright)' }}
        >
          {portraitUrl ? (
            <img
              src={portraitUrl}
              alt={character.name_en}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base opacity-30">?</div>
          )}
        </div>

        <div className="min-w-0">
          <div className="font-bold text-white text-sm truncate" style={{ fontFamily: 'var(--font-display)' }}>
            {character.name_en}
          </div>
          <div className="text-xs opacity-40 truncate">{character.name_th}</div>
        </div>
      </div>

      {/* Team context tag */}
      {team_context && (
        <div className="px-4 pt-3">
          <span
            className="inline-block text-xs px-2 py-0.5 rounded"
            style={{ background: 'rgba(240,160,48,.1)', color: 'var(--color-gold-light)', border: '1px solid rgba(240,160,48,.2)' }}
          >
            {team_context}
          </span>
        </div>
      )}

      {/* Skill rows */}
      {rows.length > 0 ? (
        <div className="px-4 py-3 space-y-2.5">
          {rows.map((row) => (
            <div key={row.label_en}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-display)' }}>
                  {row.label_en}
                </span>
                <span className="text-xs opacity-30">{row.label_th}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {row.stats.map((stat) => (
                  <StatBadge key={stat} stat={stat} />
                ))}
              </div>
              {/* Full text as small note if it doesn't parse well into badges */}
              {row.stats.length === 0 && row.text && (
                <p className="text-xs opacity-50 leading-relaxed">{row.text}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-4">
          {character.notes ? (
            <p className="text-xs text-slate-400 leading-relaxed">{character.notes}</p>
          ) : (
            <p className="text-xs opacity-30">No equipment data yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
