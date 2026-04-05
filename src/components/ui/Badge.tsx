import type { BadgeVariant } from '../../types/ui';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variants = {
  primary: 'bg-primary/20 text-primary-light border-primary/30',
  secondary: 'bg-secondary/20 text-secondary-light border-secondary/30',
  accent: 'bg-accent/20 text-red-300 border-accent/30',
  neutral: 'bg-white/10 text-gray-300 border-white/10',
};

export default function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {label}
    </span>
  );
}
