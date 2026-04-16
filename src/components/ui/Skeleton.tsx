import type { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-skeleton rounded ${className}`}
      style={{ background: 'var(--color-surface-raised)', ...style }}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={className}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={`mb-2 ${
            i === 0
              ? 'w-3/4 h-4'
              : i === lines - 1
                ? 'w-1/2 h-3'
                : 'w-full h-3'
          }`}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      <div className="p-4 flex items-start gap-3">
        <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
        <SkeletonText lines={2} className="flex-1" />
      </div>
    </div>
  );
}
