export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐱</span>
            <span className="text-gray-400 text-sm">
              NyanNeko Sheet &mdash; Guild vs Guild Guide Platform
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} NyanNeko Sheet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
