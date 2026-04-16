interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
      )}
      <div
        className="mt-3 h-px"
        style={{ background: 'linear-gradient(to right, var(--color-gold-dim), transparent)' }}
      />
    </div>
  );
}
