import { Link } from 'react-router-dom';

const modes = [
  {
    icon: '⚔️',
    title_en: 'Attack',
    title_th: 'ทีมโจมตี',
    description: 'Physical & mage offense builds. Speed order, skill rotation, stat priorities.',
    path: '/attack',
    accent: 'rgba(239,68,68,.15)',
    accentBorder: 'rgba(239,68,68,.25)',
    accentText: '#fca5a5',
  },
  {
    icon: '🛡️',
    title_en: 'Defense — Physical',
    title_th: 'ทีมรับ กายภาพ',
    description: 'Physical defense. Very Fast (spd > 250) and Slow (spd < 150) variants.',
    path: '/defense/phy',
    accent: 'rgba(59,130,246,.15)',
    accentBorder: 'rgba(59,130,246,.25)',
    accentText: '#93c5fd',
  },
  {
    icon: '🔮',
    title_en: 'Defense — Mage',
    title_th: 'ทีมรับ เวทย์',
    description: 'Mage defense must be fast. Speed 270++ to open first with CC or Sleep.',
    path: '/defense/mage',
    accent: 'rgba(139,92,246,.15)',
    accentBorder: 'rgba(139,92,246,.25)',
    accentText: '#c4b5fd',
  },
  {
    icon: '⚙️',
    title_en: 'Defense — Tank',
    title_th: 'ทีมรับ แท้งก์',
    description: 'Tank/HP defense. Block 100% + DTR 32%. Slow counter or Very Fast.',
    path: '/defense/tank',
    accent: 'rgba(16,185,129,.15)',
    accentBorder: 'rgba(16,185,129,.25)',
    accentText: '#6ee7b7',
  },
];

const databases = [
  { icon: '👤', title: 'Characters', count: '90+', path: '/characters', color: '#a78bfa' },
  { icon: '🐾', title: 'Pets', count: '25', path: '/pets', color: '#f59e0b' },
  { icon: '💍', title: 'Rings', count: '32', path: '/rings', color: '#ec4899' },
  { icon: '🗡️', title: 'Equipment', count: '9 Sets', path: '/equipment', color: '#10b981' },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Hero */}
      <section className="text-center mb-14">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
          style={{ background: 'rgba(240,160,48,.12)', color: 'var(--color-gold)', border: '1px solid rgba(240,160,48,.25)' }}
        >
          <span>⚔</span>
          <span>Seven Knights Rebirth — GVG Strategy</span>
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          NyanNeko <span style={{ color: 'var(--color-gold)' }}>Sheet</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
          คู่มือกลยุทธ์ Guild vs Guild สำหรับ Seven Knights Rebirth
          <br />
          <span className="opacity-60">Team builds · Stat priorities · Skill rotations</span>
        </p>
        <div className="mt-4 mx-auto w-24 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-gold-dim), transparent)' }} />
      </section>

      {/* Database Quick Links */}
      <section className="mb-14">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-5 opacity-40">
          Database / ฐานข้อมูล
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {databases.map((db) => (
            <Link
              key={db.path}
              to={db.path}
              className="group rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="text-2xl mb-2">{db.icon}</div>
              <div className="text-sm font-semibold text-white">{db.title}</div>
              <div className="text-lg font-bold mt-1" style={{ color: db.color }}>{db.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Mode cards */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-5 opacity-40">
          Game Modes / โหมดเกม
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modes.map((m) => (
            <Link
              key={m.path}
              to={m.path}
              className="group rounded-xl p-5 flex gap-4 items-start transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = m.accentBorder;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${m.accent}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="text-2xl w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: m.accent, border: `1px solid ${m.accentBorder}` }}
              >
                {m.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{m.title_en}</span>
                  <span className="text-xs opacity-50">{m.title_th}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Gear Guide Link */}
      <section className="mt-8">
        <Link
          to="/equip"
          className="block rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex gap-4 items-center">
            <div
              className="text-2xl w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(240,160,48,.15)', border: '1px solid rgba(240,160,48,.25)' }}
            >
              📖
            </div>
            <div>
              <span className="font-semibold text-white text-sm">Equipment Guide</span>
              <span className="text-xs opacity-50 ml-2">คู่มืออุปกรณ์</span>
              <p className="text-xs text-slate-400 mt-1">Per-character equipment stat priorities for each skill slot.</p>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
