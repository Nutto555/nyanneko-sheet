import { useEffect, useState } from 'react';
import EquipCard from '../components/equip-card/EquipCard';
import { getCharacters } from '../services/characters';
import type { Character } from '../types/database';
import type { EquipEntry } from '../types/ui';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonCard } from '../components/ui/Skeleton';

// Equip notes are stored in character.notes and character.type
function buildEquipEntries(chars: Character[]): EquipEntry[] {
  return chars
    .filter((c) => c.notes || c.type)
    .map((c) => ({
      character: c,
      team_context: c.type || undefined,
      skill_1: c.notes || undefined,
    }));
}

export default function Equip() {
  const [entries, setEntries] = useState<EquipEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    getCharacters()
      .then((chars) => {
        if (!cancelled) setEntries(buildEquipEntries(chars));
      })
      .catch(() => {
        // service already falls back to local data; nothing more to show
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = filter
    ? entries.filter(
        (e) =>
          e.character.name_en.toLowerCase().includes(filter.toLowerCase()) ||
          e.character.name_th?.includes(filter)
      )
    : entries;

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Equipment Guide"
        subtitle="Per-character equipment stat priorities for each skill slot"
      />

      {/* Search */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search character / ค้นหาตัวละคร..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 rounded-lg text-sm text-white outline-none transition-colors"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-bright)',
            fontFamily: 'var(--font-body)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-gold-dim)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-bright)')}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">No characters found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry) => (
            <EquipCard key={entry.character.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
