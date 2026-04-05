import { useEffect, useState } from 'react';
import { getUpdates } from '../services/updates';
import type { GameUpdate, UpdateCategory } from '../types/database';

const CATEGORY_CONFIG: Record<UpdateCategory, { label: string; label_th: string; color: string; icon: string }> = {
  patch:     { label: 'Patch Notes',     label_th: 'อัปเดต',       color: '#ef4444', icon: '🔧' },
  developer: { label: 'Developer Notes', label_th: 'โน้ตนักพัฒนา', color: '#8b5cf6', icon: '📝' },
  meta:      { label: 'Meta Change',     label_th: 'เมต้าเปลี่ยน', color: '#f0a030', icon: '⚔️' },
  event:     { label: 'Event',           label_th: 'อีเวนต์',      color: '#10b981', icon: '🎉' },
  other:     { label: 'Notice',          label_th: 'ประกาศ',       color: '#64748b', icon: '📢' },
};

function isSafeUrl(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('http://');
}

function CategoryBadge({ category }: { category: UpdateCategory }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG['other'];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
      style={{
        background: `${cfg.color}18`,
        color: cfg.color,
        border: `1px solid ${cfg.color}35`,
      }}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
}

function GvgBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
      style={{
        background: 'rgba(240,160,48,.12)',
        color: 'var(--color-gold-light)',
        border: '1px solid rgba(240,160,48,.3)',
      }}
    >
      ⚔ GVG Impact
    </span>
  );
}

function UpdateCard({ entry }: { entry: GameUpdate }) {
  const formattedDate = new Date(entry.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      className="team-card rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-start justify-between gap-3"
        style={{ background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="min-w-0">
          <a
            href={isSafeUrl(entry.url) ? entry.url : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-white hover:underline leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {entry.title}
          </a>
          <p className="text-xs opacity-40 mt-0.5">{formattedDate}</p>
        </div>
        <a
          href={isSafeUrl(entry.url) ? entry.url : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 opacity-30 hover:opacity-70 transition-opacity mt-0.5"
          aria-label="Open source"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        <p className="text-sm text-slate-300 leading-relaxed">{entry.summary}</p>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={entry.category} />
          {entry.affects_gvg && <GvgBadge />}
          {entry.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 rounded text-xs opacity-50"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="h-14" style={{ background: 'var(--color-surface-raised)' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded w-4/5" style={{ background: 'var(--color-border)' }} />
        <div className="h-3 rounded w-3/5" style={{ background: 'var(--color-border)' }} />
        <div className="flex gap-2 mt-3">
          <div className="h-5 w-24 rounded" style={{ background: 'var(--color-border)' }} />
          <div className="h-5 w-20 rounded" style={{ background: 'var(--color-border)' }} />
        </div>
      </div>
    </div>
  );
}

export default function Updates() {
  const [entries, setEntries] = useState<GameUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UpdateCategory | 'all'>('all');

  useEffect(() => {
    let cancelled = false;
    getUpdates()
      .then((rows) => { if (!cancelled) setEntries(rows); })
      .catch(() => { /* service already logs in dev */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.category === filter);

  const gvgCount = entries.filter((e) => e.affects_gvg).length;
  const lastEntry = entries[0];
  const lastUpdated = lastEntry
    ? new Date(lastEntry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📋</span>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Game Updates
            </h1>
            <p className="text-sm opacity-50" style={{ fontFamily: 'var(--font-body)' }}>
              อัปเดตเกมและข่าวสาร
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2 max-w-xl">
          Patch notes, developer announcements, and meta changes from Netmarble — automatically scouted every week.
        </p>
        <div className="mt-3 h-px" style={{ background: 'linear-gradient(to right, var(--color-gold-dim), transparent)' }} />
      </div>

      {/* Stats bar */}
      {!loading && entries.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-slate-400">
          <span>
            <span className="text-white font-semibold">{entries.length}</span> total entries
          </span>
          {gvgCount > 0 && (
            <span>
              <span style={{ color: 'var(--color-gold-light)' }} className="font-semibold">{gvgCount}</span> affect GVG
            </span>
          )}
          {lastUpdated && (
            <span>Last updated: <span className="text-white">{lastUpdated}</span></span>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'patch', 'developer', 'meta', 'event', 'other'] as const).map((cat) => {
          const cfg = cat === 'all' ? null : CATEGORY_CONFIG[cat];
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: isActive ? 'rgba(240,160,48,.15)' : 'var(--color-surface)',
                color: isActive ? 'var(--color-gold-light)' : '#94a3b8',
                border: `1px solid ${isActive ? 'rgba(240,160,48,.35)' : 'var(--color-border)'}`,
              }}
            >
              {cfg ? `${cfg.icon} ${cfg.label}` : '🗂 All'}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 opacity-40">📭</div>
          <p className="text-slate-400 text-sm">
            {entries.length === 0
              ? 'No updates yet — the scout runs every Thursday.'
              : 'No entries match this filter.'}
          </p>
          {entries.length === 0 && (
            <p className="text-xs opacity-40 mt-2">
              Check back after Thursday or visit{' '}
              <a
                href="https://forum.netmarble.com/sk_rebirth_gl/list/11/1"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                Netmarble forums
              </a>{' '}
              directly.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((entry) => (
            <UpdateCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
