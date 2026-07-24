import { useMemo, useState } from 'react';

interface DiffViewProps {
  original: string;
  beautified: string;
  className?: string;
}

export function DiffView({ original, beautified, className = '' }: DiffViewProps) {
  const [view, setView] = useState<'side-by-side' | 'beautified'>('beautified');

  const stats = useMemo(() => {
    const origLines = original ? original.split('\n').length : 0;
    const bfLines = beautified ? beautified.split('\n').length : 0;
    const diff = bfLines - origLines;
    return { origLines, bfLines, diff };
  }, [original, beautified]);

  const orig = original || '';
  const bf = beautified || '';

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5 gap-0.5">
          {(['beautified', 'side-by-side'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 capitalize ${
                view === v
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              {v === 'side-by-side' ? 'Side by side' : 'Beautified'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-500 tabular-nums">
          <span>Original: <strong className="text-surface-700 dark:text-surface-300">{stats.origLines}</strong> lines</span>
          <span>Beautified: <strong className="text-surface-700 dark:text-surface-300">{stats.bfLines}</strong> lines</span>
          {stats.diff !== 0 && (
            <span className={`font-semibold ${stats.diff < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {stats.diff > 0 ? '+' : ''}{stats.diff} lines
            </span>
          )}
        </div>
      </div>

      {view === 'side-by-side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {[{ label: 'Original', content: orig }, { label: 'Beautified', content: bf }].map(({ label, content }) => (
            <div key={label}>
              <div className="text-[10px] font-semibold text-surface-500 dark:text-surface-500 uppercase tracking-wider mb-1.5 px-1">
                {label}
              </div>
              <pre className="bg-surface-50 dark:bg-surface-950/60 rounded-xl px-4 py-3 overflow-auto max-h-96 text-sm font-mono text-surface-700 dark:text-surface-300 whitespace-pre-wrap break-words border border-surface-200 dark:border-surface-800 leading-relaxed">
                {content || '(empty)'}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <pre className="bg-surface-50 dark:bg-surface-950/60 rounded-xl px-4 py-3 overflow-auto max-h-96 text-sm font-mono text-surface-700 dark:text-surface-300 whitespace-pre-wrap break-words border border-surface-200 dark:border-surface-800 leading-relaxed">
          {bf || (
            <span className="text-surface-400 dark:text-surface-600 italic">
              No output yet. Paste or upload code to beautify.
            </span>
          )}
        </pre>
      )}
    </div>
  );
}
