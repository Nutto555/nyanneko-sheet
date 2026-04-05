import { useEffect, useState } from 'react';
import TeamCard from '../components/team-card/TeamCard';
import type { TeamCardData, GvgModeConfig } from '../types/ui';
import type { TeamWithMembers, Character } from '../types/database';
import { getTeamsByCategory } from '../services/teams';
import { getCharacters } from '../services/characters';

const MODE_CONFIGS: Record<string, GvgModeConfig> = {
  attack: {
    category: 'attack',
    title_en: 'GVG Attack',
    title_th: 'ทีมโจมตี GVG',
    description: 'Physical and mage attack team builds for Guild vs Guild offense.',
    icon: '⚔️',
  },
  'defense-phy': {
    category: 'defense_phy',
    title_en: 'Defense — Physical',
    title_th: 'ทีมรับ กายภาพ',
    description: 'Physical defense builds. Two variants: Very Fast (spd > 250) and Slow (spd < 150).',
    icon: '🛡️',
  },
  'defense-mage': {
    category: 'defense_mage',
    title_en: 'Defense — Mage',
    title_th: 'ทีมรับ เวทย์',
    description: 'Mage defense — must be fast. Speed 270++ to open first with CC or Sleep.',
    icon: '🔮',
  },
  'defense-tank': {
    category: 'defense_tank',
    title_en: 'Defense — Tank',
    title_th: 'ทีมรับ แท้งก์',
    description: 'Tank/HP defense. Slow counter or Very Fast variants.',
    icon: '⚙️',
  },
};

function TeamSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="h-12" style={{ background: 'var(--color-surface-raised)' }} />
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-lg" style={{ background: 'var(--color-border)' }} />
              <div className="w-14 h-3 rounded" style={{ background: 'var(--color-border)' }} />
              <div className="w-12 h-3 rounded" style={{ background: 'var(--color-border)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildTeamCards(teams: TeamWithMembers[], charMap: Map<string, Character>): TeamCardData[] {
  return teams.map((team) => {
    const units = (team.team_members || [])
      .sort((a, b) => a.position - b.position)
      .map((member) => {
        const char = charMap.get(member.character_id) || (member.characters as Character | undefined);
        // Parse gear_notes: "STAT_PRIMARY|STAT_TARGET|notes" or JSON
        let stat_primary: string | undefined;
        let stat_secondary: string | undefined;
        let stat_target: string | undefined;
        let notes: string | undefined;

        if (member.gear_notes) {
          try {
            const parsed: unknown = JSON.parse(member.gear_notes);
            if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
              const p = parsed as Record<string, unknown>;
              stat_primary = typeof p.stat_primary === 'string' ? p.stat_primary : undefined;
              stat_secondary = typeof p.stat_secondary === 'string' ? p.stat_secondary : undefined;
              stat_target = typeof p.stat_target === 'string' ? p.stat_target : undefined;
              notes = typeof p.notes === 'string' ? p.notes : undefined;
            }
          } catch {
            notes = member.gear_notes;
          }
        }

        return {
          name_en: char?.name_en || member.role_in_team || 'Unknown',
          name_th: char?.name_th || undefined,
          image_url: char?.image_url || null,
          stat_primary,
          stat_secondary,
          stat_target,
          notes,
        };
      });

    // Parse strategy_notes for skill/speed order
    let skillOrder: string | undefined;
    let speedOrder: string | undefined;
    const sn = team.strategy_notes || '';
    const skillMatch = sn.match(/Skill[:：]\s*(.+?)(?:\n|Speed order|$)/i);
    const speedMatch = sn.match(/Speed(?:\s+order)?[:：]\s*(.+?)(?:\n|$)/i);
    if (skillMatch) skillOrder = skillMatch[1].trim();
    if (speedMatch) speedOrder = speedMatch[1].trim();

    return {
      title: team.name,
      speedTier: team.speed_requirement || null,
      units,
      skillOrder: skillOrder || null,
      speedOrder: speedOrder || null,
      notes: team.description || null,
    };
  });
}

interface GvgModeProps {
  mode: string; // "attack" | "defense-phy" | "defense-mage" | "defense-tank"
}

export default function GvgMode({ mode }: GvgModeProps) {
  const config = MODE_CONFIGS[mode] ?? null;
  const [teams, setTeams] = useState<TeamCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [rawTeams, chars] = await Promise.all([
          getTeamsByCategory(config!.category),
          getCharacters(),
        ]);
        if (cancelled) return;

        const charMap = new Map(chars.map((c: Character) => [c.id, c])) as Map<string, Character>;
        setTeams(buildTeamCards(rawTeams, charMap));
      } catch {
        if (!cancelled) setError('Failed to load team data. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [config?.category]);

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">Mode not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {config.title_en}
            </h1>
            <p className="text-sm opacity-50" style={{ fontFamily: 'var(--font-body)' }}>
              {config.title_th}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2 max-w-xl">{config.description}</p>
        <div className="mt-3 h-px" style={{ background: 'linear-gradient(to right, var(--color-gold-dim), transparent)' }} />
      </div>

      {/* Content */}
      {error && (
        <div className="rounded-lg p-4 mb-6 text-sm text-red-300" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)' }}>
          Failed to load teams: {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <TeamSkeleton key={i} />)}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">No team builds yet for this mode.</p>
          <p className="text-xs mt-1 opacity-60">Run <code>npm run seed</code> to populate data.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((team, i) => (
            <TeamCard key={i} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
