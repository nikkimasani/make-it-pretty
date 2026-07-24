import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import type { ReaderResponse } from '@/types';

interface ReaderViewProps {
  data: ReaderResponse;
}

type FontSize = 'sm' | 'md' | 'lg';
type LineHeight = 'normal' | 'relaxed' | 'loose';

const FONT_SIZES: { key: FontSize; label: string; cls: string }[] = [
  { key: 'sm', label: 'S', cls: 'text-sm' },
  { key: 'md', label: 'M', cls: 'text-base' },
  { key: 'lg', label: 'L', cls: 'text-lg' },
];

const LINE_HEIGHTS: { key: LineHeight; label: string; cls: string }[] = [
  { key: 'normal', label: '1.5', cls: 'leading-normal' },
  { key: 'relaxed', label: '1.8', cls: 'leading-relaxed' },
  { key: 'loose', label: '2.0', cls: 'leading-loose' },
];

export function ReaderView({ data }: ReaderViewProps) {
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [lineHeight, setLineHeight] = useState<LineHeight>('relaxed');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isHtml = data.result?.includes('<');

  const currentFont = FONT_SIZES.find((f) => f.key === fontSize)!.cls;
  const currentLine = LINE_HEIGHTS.find((l) => l.key === lineHeight)!.cls;

  useEffect(() => {
    const onScroll = () => {
      setShowScrollBtn(window.scrollY > 600);
      const docEl = document.documentElement;
      const scrollTop = window.scrollY;
      const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const estimatedRemaining = data.reading_time_minutes
    ? Math.max(1, Math.round(data.reading_time_minutes * (1 - progress)))
    : null;

  return (
    <>
      {progress > 0.05 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-surface-100 dark:bg-surface-800">
          <div
            className="h-full bg-primary-500 transition-all duration-150 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <Card>
        <CardContent className="pb-10">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-1">
              <span className="text-xs text-surface-400 dark:text-surface-500 mr-1">Font:</span>
              {FONT_SIZES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFontSize(s.key)}
                  className={`w-7 h-7 text-xs font-medium rounded-md transition-all duration-150 ${
                    fontSize === s.key
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-200 dark:ring-primary-500/30'
                      : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-surface-400 dark:text-surface-500 mr-1">Line:</span>
              {LINE_HEIGHTS.map((lh) => (
                <button
                  key={lh.key}
                  onClick={() => setLineHeight(lh.key)}
                  className={`px-2 h-7 text-[10px] font-medium rounded-md transition-all duration-150 ${
                    lineHeight === lh.key
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-200 dark:ring-primary-500/30'
                      : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  {lh.label}
                </button>
              ))}
            </div>
            {estimatedRemaining !== null && progress > 0.1 && (
              <span className="text-[10px] text-surface-400 dark:text-surface-500 tabular-nums">
                ~{estimatedRemaining} min left
              </span>
            )}
          </div>

          {data.title && (
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-6 text-balance leading-tight tracking-tight">
              {data.title}
            </h1>
          )}

          <div ref={contentRef}>
            {isHtml ? (
              <div
                className={`prose dark:prose-invert max-w-none ${currentFont} ${currentLine} prose-headings:text-surface-900 dark:prose-headings:text-surface-100 prose-p:text-surface-700 dark:prose-p:text-surface-300 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-strong:text-surface-900 dark:prose-strong:text-surface-100`}
                dangerouslySetInnerHTML={{ __html: data.result }}
              />
            ) : (
              <div
                className={`whitespace-pre-wrap ${currentFont} ${currentLine} text-surface-700 dark:text-surface-300 font-sans`}
              >
                {data.result}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showScrollBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-all duration-200 animate-slide-up"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
