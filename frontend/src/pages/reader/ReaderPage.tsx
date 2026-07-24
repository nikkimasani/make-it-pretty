import { useState, useCallback, useRef, useMemo } from 'react';
import { BookOpen, Link as LinkIcon, ArrowUp, Globe, FileWarning } from 'lucide-react';
import { WorkspaceHeader, FileUpload, ErrorMessage } from '@/components/shared';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { api } from '@/lib/api';
import { useApi } from '@/hooks';
import type { ReaderResponse } from '@/types';
import { ReaderView } from './ReaderView';

const WORKSPACE = {
  title: 'Reader',
  description: 'Convert noisy HTML, PDF, or DOCX documents into clean, elegant reading experiences.',
  icon: '📖',
  formats: ['url', 'html', 'pdf', 'docx', 'md'],
};

const EXAMPLE_URLS = [
  { label: 'Wikipedia (Readability)', url: 'https://en.wikipedia.org/wiki/Readability' },
  { label: 'Wikipedia (Typography)', url: 'https://en.wikipedia.org/wiki/Typography' },
  { label: 'Simple article', url: 'https://example.com' },
];

const URL_PATTERN = /^https?:\/\/.+\..+/i;

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function ReaderPage() {
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'paste'>('url');
  const [pasteContent, setPasteContent] = useState('');
  const { data, isLoading, error, execute, reset } = useApi<ReaderResponse>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const urlValid = useMemo(() => URL_PATTERN.test(urlInput.trim()), [urlInput]);

  const processUrl = useCallback(async () => {
    if (!urlInput.trim()) return;
    await execute(
      api.process('/reader/process')({ content: urlInput.trim() }) as Promise<ReaderResponse>,
    );
  }, [urlInput, execute]);

  const processPaste = useCallback(async () => {
    if (!pasteContent.trim()) return;
    await execute(
      api.process('/reader/process')({ content: pasteContent.trim() }) as Promise<ReaderResponse>,
    );
  }, [pasteContent, execute]);

  const handleFile = useCallback(
    async (file: File) => {
      const readerResponse = await api.upload<ReaderResponse>('/reader/upload')(file);
      await execute(Promise.resolve(readerResponse));
    },
    [execute],
  );

  const handleReset = useCallback(() => {
    reset();
    setUrlInput('');
    setPasteContent('');
  }, [reset]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const errorMeta = useMemo(() => {
    if (!error) return null;
    const isTimeout = error.toLowerCase().includes('timeout');
    const isHttp = error.toLowerCase().includes('http');
    return { isTimeout, isHttp };
  }, [error]);

  return (
    <div ref={scrollRef} className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <WorkspaceHeader
        title={WORKSPACE.title}
        description={WORKSPACE.description}
        icon={WORKSPACE.icon}
        formats={WORKSPACE.formats}
      />

      {!data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5 gap-0.5 w-fit">
              {(['url', 'paste', 'file'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                    activeTab === t
                      ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                      : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
                  }`}
                >
                  {t === 'url' ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="w-3 h-3" aria-hidden="true" /> URL
                    </span>
                  ) : t === 'paste' ? 'Paste HTML' : 'Upload File'}
                </button>
              ))}
            </div>

            {activeTab === 'url' && (
              <Card>
                <CardContent>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500 mb-3">
                    URL
                  </h2>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500"
                        aria-hidden="true"
                      />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.nativeEvent.isComposing && urlValid) processUrl();
                        }}
                        placeholder="https://example.com/article"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm bg-surface-50 dark:bg-surface-950/60 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-surface-800 dark:text-surface-200 placeholder-surface-300 dark:placeholder-surface-600 transition-all ${
                          urlInput && !urlValid
                            ? 'border-amber-300 dark:border-amber-600'
                            : 'border-surface-200 dark:border-surface-700'
                        }`}
                      />
                    </div>
                  </div>
                  {urlInput && !urlValid && (
                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <FileWarning className="w-3 h-3" aria-hidden="true" />
                      Enter a valid URL starting with http:// or https://
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="text-xs text-surface-400 dark:text-surface-500">Try:</span>
                    {EXAMPLE_URLS.map((ex) => (
                      <button
                        key={ex.label}
                        onClick={() => {
                          setUrlInput(ex.url);
                        }}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-500/10 px-2 py-1 rounded-md hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all font-medium"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                  {urlValid && (
                    <p className="mt-1.5 text-[10px] text-surface-400 dark:text-surface-500">
                      Will fetch from <span className="font-mono">{extractDomain(urlInput)}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'paste' && (
              <Card>
                <CardContent>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500 mb-3">
                    Paste HTML or Markdown
                  </h2>
                  <textarea
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder="Paste HTML or Markdown content here..."
                    className="w-full h-48 px-4 py-3 text-sm font-mono text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-950/60 rounded-lg border border-surface-200 dark:border-surface-700 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-surface-300 dark:placeholder-surface-600 transition-all leading-relaxed"
                    spellCheck={false}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && pasteContent.trim()) {
                        processPaste();
                      }
                    }}
                  />
                  <p className="text-xs text-surface-400 dark:text-surface-500 mt-1.5">Press Ctrl+Enter to process</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'file' && (
              <FileUpload accept=".html,.pdf,.docx,.md" onFileSelected={handleFile} isLoading={isLoading} />
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500 mb-3">
                  What you&apos;ll get
                </h2>
                <ul className="space-y-2 text-sm text-surface-600 dark:text-surface-400">
                  {['Clean, readable text', 'Estimated reading time', 'Word count', 'No ads, no clutter', 'Dark mode support'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button
              onClick={activeTab === 'url' ? processUrl : processPaste}
              isLoading={isLoading}
              disabled={activeTab === 'url' ? !urlValid : !pasteContent.trim()}
              className="w-full"
              size="lg"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              {isLoading ? 'Fetching...' : 'Read'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {data.title && (
                <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate max-w-md">
                  {data.title}
                </span>
              )}
              <Badge variant="default">{data.word_count?.toLocaleString()} words</Badge>
              <Badge variant="primary">{data.reading_time_minutes} min read</Badge>
              {data.format && <Badge variant="default">{data.format}</Badge>}
              {Boolean(data.metadata?.url) && (
                <Badge variant="default">
                  {extractDomain(data.metadata.url as string)}
                </Badge>
              )}
              {Boolean(data.metadata?.pages) && (
                <Badge variant="default">{String(data.metadata.pages)} pages</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={scrollToTop} aria-label="Scroll to top">
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Read another
              </Button>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          <ReaderView data={data} />
        </div>
      )}
    </div>
  );
}
