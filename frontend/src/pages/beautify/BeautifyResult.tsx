import { Card, CardContent, Badge } from '@/components/ui';
import { DiffView } from '@/components/shared';
import type { ProcessResponse } from '@/types';

interface BeautifyResultProps {
  data: ProcessResponse;
}

export function BeautifyResult({ data }: BeautifyResultProps) {
  const wordCount = data.result?.split(/\s+/).filter(Boolean).length ?? 0;

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            Result
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.grammar_check_applied && (
              <Badge variant="success">Grammar corrected</Badge>
            )}
            {data.emoji_enrichment_applied && (
              <Badge variant="primary">Emojis added</Badge>
            )}
            {data.writing_direction && (
              <Badge variant="default">{data.writing_direction}</Badge>
            )}
            <Badge variant="default">{wordCount.toLocaleString()} words</Badge>
            {data.processing_time !== undefined && (
              <Badge variant="default">{(data.processing_time * 1000).toFixed(0)}ms</Badge>
            )}
          </div>
        </div>

        <DiffView original={data.original} beautified={data.result} />

        {data.suggestions && data.suggestions.length > 0 && (
          <div className="mt-5 pt-5 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500 mb-3">
              Grammar Suggestions
            </p>
            <div className="space-y-2">
              {data.suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-xs px-3 py-2.5 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-lg"
                >
                  <code className="text-red-600 dark:text-red-400 line-through font-mono shrink-0">{s.original}</code>
                  <span className="text-surface-400 dark:text-surface-500" aria-hidden="true">→</span>
                  <code className="text-emerald-700 dark:text-emerald-400 font-mono shrink-0">{s.suggestion}</code>
                  <span className="text-surface-500 dark:text-surface-400 ml-1 flex-1 min-w-0">{s.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.warnings && data.warnings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 space-y-1.5">
            {data.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span aria-hidden="true" className="text-base">⚠</span> {w}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
