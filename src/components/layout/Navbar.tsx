import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface NavGroup {
  label_th: string;
  label_en: string;
  path?: string;
  children?: { label_th: string; label_en: string; path: string }[];
}

const navGroups: NavGroup[] = [
  { label_th: 'หน้าแรก', label_en: 'Home', path: '/' },
  {
    label_th: 'GVG โจมตี', label_en: 'Attack',
    path: '/attack',
  },
  {
    label_th: 'GVG รับ', label_en: 'Defense',
    children: [
      { label_th: 'กายภาพ', label_en: 'Physical', path: '/defense/phy' },
      { label_th: 'เวทย์', label_en: 'Mage', path: '/defense/mage' },
      { label_th: 'แท้งก์', label_en: 'Tank', path: '/defense/tank' },
    ],
  },
  { label_th: 'อุปกรณ์', label_en: 'Equipment', path: '/equip' },
  { label_th: 'ตัวละคร', label_en: 'Characters', path: '/characters' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [defenseOpen, setDefenseOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(8,11,16,0.97)', backdropFilter: 'blur(8px)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-xl">🐱</span>
            <span className="font-display text-base font-bold text-white group-hover:text-gold transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
              NyanNeko
            </span>
            <span className="hidden sm:inline text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: 'rgba(240,160,48,.15)', color: 'var(--color-gold)' }}>
              GVG
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navGroups.map((group) =>
              group.children ? (
                <div key={group.label_en} className="relative">
                  <button
                    onClick={() => setDefenseOpen(!defenseOpen)}
                    onBlur={() => setTimeout(() => setDefenseOpen(false), 150)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      location.pathname.startsWith('/defense')
                        ? 'text-gold bg-gold/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                    style={{ color: location.pathname.startsWith('/defense') ? 'var(--color-gold)' : undefined }}
                  >
                    <span>{group.label_en}</span>
                    <span className="text-xs opacity-60 ml-0.5">▾</span>
                    <span className="text-xs ml-1 opacity-50">{group.label_th}</span>
                  </button>
                  {defenseOpen && (
                    <div className="absolute top-full left-0 mt-1 w-44 rounded-lg overflow-hidden shadow-xl z-50 border" style={{ background: 'var(--color-surface-raised)', borderColor: 'var(--color-border-bright)' }}>
                      {group.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            isActive(child.path)
                              ? 'text-gold bg-gold/10'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                          style={{ color: isActive(child.path) ? 'var(--color-gold)' : undefined }}
                          onClick={() => setDefenseOpen(false)}
                        >
                          <span className="font-medium">{child.label_en}</span>
                          <span className="text-xs opacity-50">{child.label_th}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={group.path}
                  to={group.path!}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive(group.path!)
                      ? 'bg-gold/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  style={{ color: isActive(group.path!) ? 'var(--color-gold)' : undefined }}
                >
                  <span>{group.label_en}</span>
                  <span className="text-xs opacity-40">{group.label_th}</span>
                </Link>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <div className="px-4 py-3 space-y-1">
            {navGroups.map((group) =>
              group.children ? (
                <div key={group.label_en}>
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider opacity-40">
                    {group.label_en} / {group.label_th}
                  </div>
                  {group.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between pl-6 pr-3 py-2 rounded-md text-sm transition-colors ${
                        isActive(child.path)
                          ? 'text-gold bg-gold/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                      style={{ color: isActive(child.path) ? 'var(--color-gold)' : undefined }}
                    >
                      <span>{child.label_en}</span>
                      <span className="text-xs opacity-50">{child.label_th}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={group.path}
                  to={group.path!}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive(group.path!)
                      ? 'text-gold bg-gold/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  style={{ color: isActive(group.path!) ? 'var(--color-gold)' : undefined }}
                >
                  <span className="font-medium">{group.label_en}</span>
                  <span className="text-xs opacity-50">{group.label_th}</span>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
