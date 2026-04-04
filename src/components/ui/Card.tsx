import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`bg-dark-card border border-primary/10 rounded-xl p-6 ${
        hover ? 'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
