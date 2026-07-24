import { TriangleAlert, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-lg ${className}`}
      role="alert"
    >
      <TriangleAlert
        className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <p className="text-sm text-red-700 dark:text-red-400 flex-1 min-w-0 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 rounded-md hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors"
        >
          <RefreshCw className="w-3 h-3" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
