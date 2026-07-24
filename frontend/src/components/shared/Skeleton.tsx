interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 3 }: SkeletonProps) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-200 dark:bg-surface-800 rounded-md"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 space-y-4 animate-pulse shadow-glass dark:shadow-glass-dark"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-5 bg-surface-200 dark:bg-surface-800 rounded-md w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-surface-100 dark:bg-surface-800/60 rounded w-full" />
        <div className="h-4 bg-surface-100 dark:bg-surface-800/60 rounded w-5/6" />
        <div className="h-4 bg-surface-100 dark:bg-surface-800/60 rounded w-3/4" />
      </div>
    </div>
  );
}
