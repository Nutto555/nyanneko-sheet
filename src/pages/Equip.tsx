import { useEffect, useState } from 'react';
import EquipCard from '../components/equip-card/EquipCard';
import { getCharacters } from '../services/characters';
import type { Character } from '../types/database';
import type { EquipEntry } from '../types/ui';

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

function Skeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="h-16 flex items-center px-4 gap-3" style={{ background: 'var(--color-surface-raised)' }}>
        <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--color-border)' }} />
        <div className="space-y-1.5">
          <div className="w-24 h-3 rounded" style={{ background: 'var(--color-border)' }} />
          <div className="w-16 h-2.5 rounded" style={{ background: 'var(--color-border)' }} />
        </div>
      </div>
      <div className="p-4 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-3 rounded" style={{ background: 'var(--color-border)', width: `${70 + i * 10}%` }} />
        ))}
      </div>
    </div>
  );
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📖</span>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Equipment Guide
            </h1>
            <p className="text-sm opacity-50">คู่มืออุปกรณ์ตัวละคร</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2 max-w-xl">
          Stat priorities per skill slot for each character — from the EquipLegend sheet.
        </p>
        <div className="mt-3 h-px" style={{ background: 'linear-gradient(to right, var(--color-gold-dim), transparent)' }} />
      </div>

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
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
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
