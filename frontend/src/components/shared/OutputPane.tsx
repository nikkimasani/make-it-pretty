import { useCallback, useMemo, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { VirtualList } from './VirtualList';

interface OutputPaneProps {
  title?: string;
  content: string;
  placeholder?: string;
  language?: string;
  className?: string;
}

export function OutputPane({
  title = 'Output',
  content,
  placeholder = 'No output yet. Upload or paste content to process.',
  language,
  className = '',
}: OutputPaneProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output.${language || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, language]);

  const lines = useMemo(() => content.split('\n'), [content]);
  const isLarge = content.length > 50000;

  const renderLine = useCallback(
    (line: string, index: number) => (
      <div key={index} className="flex whitespace-pre-wrap break-words min-h-[1.25rem]">
        <span className="text-surface-400 dark:text-surface-500 text-xs w-10 shrink-0 text-right pr-3 select-none">{index + 1}</span>
        <span>{line || ' '}</span>
      </div>
    ),
    [],
  );

  const displayContent = content || placeholder;

  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300">{title}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 px-2 py-1 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="Copy to clipboard"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 px-2 py-1 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="Download output"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>
        {isLarge ? (
          <div className="bg-surface-50 dark:bg-surface-950/60 rounded-lg overflow-auto max-h-96 text-sm font-mono text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-800">
            <VirtualList
              items={lines}
              itemHeight={20}
              renderItem={renderLine}
              maxHeight="384px"
              overscan={10}
            />
          </div>
        ) : (
          <pre className="bg-surface-50 dark:bg-surface-950/60 rounded-lg p-4 overflow-auto max-h-96 text-sm font-mono text-surface-800 dark:text-surface-200 whitespace-pre-wrap break-words border border-surface-200 dark:border-surface-800">
            {displayContent}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
