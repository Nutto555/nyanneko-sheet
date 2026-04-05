import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

type NavChild = { label_th: string; label_en: string; path: string };

type NavGroup =
  | { label_th: string; label_en: string; path: string; children?: never }
  | { label_th: string; label_en: string; path?: never; children: NavChild[] };

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
  {
    label_th: 'ฐานข้อมูล', label_en: 'Database',
    children: [
      { label_th: 'ตัวละคร', label_en: 'Characters', path: '/characters' },
      { label_th: 'สัตว์เลี้ยง', label_en: 'Pets', path: '/pets' },
      { label_th: 'แหวน', label_en: 'Rings', path: '/rings' },
      { label_th: 'อุปกรณ์', label_en: 'Equipment', path: '/equipment' },
    ],
  },
  { label_th: 'อุปกรณ์แนะนำ', label_en: 'Gear Guide', path: '/equip' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(8,11,16,0.97)', backdropFilter: 'blur(8px)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-xl">🐱</span>
            <span className="font-bold text-white group-hover:text-primary-light transition-colors">
              NyanNeko
            </span>
            <span className="hidden sm:inline text-xs text-gray-500">GvG</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navGroups.map((group) =>
              group.children ? (
                <div key={group.label_en} className="relative">
                  <button
                    onClick={() => toggleDropdown(group.label_en)}
                    onBlur={() => setTimeout(() => setOpenDropdown(null), 150)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      group.children.some((c) => isActive(c.path))
                        ? 'text-primary-light bg-primary/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {group.label_en} ▾
                  </button>
                  {openDropdown === group.label_en && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-card border border-primary/20 rounded-lg py-1 min-w-[160px] shadow-xl">
                      {group.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isActive(child.path)
                              ? 'text-primary-light bg-primary/10'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-xs text-gray-500 mr-2">{child.label_th}</span>
                          {child.label_en}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={group.path}
                  to={group.path!}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive(group.path!)
                      ? 'text-primary-light bg-primary/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {group.label_en}
                </Link>
              )
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-primary/10 bg-dark-card">
          <div className="px-4 py-3 space-y-1">
            {navGroups.map((group) =>
              group.children ? (
                <div key={group.label_en}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.label_en}
                  </div>
                  {group.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        isActive(child.path)
                          ? 'text-primary-light bg-primary/10'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label_th} / {child.label_en}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={group.path}
                  to={group.path!}
                  className={`block px-3 py-2 rounded-md text-sm ${
                    isActive(group.path!)
                      ? 'text-primary-light bg-primary/10'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {group.label_th} / {group.label_en}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
