import { useState, useCallback } from 'react';
import { Code, ChevronRight } from 'lucide-react';
import { WorkspaceHeader, FileUpload, OutputPane, ErrorMessage } from '@/components/shared';
import { Button, Card, CardContent } from '@/components/ui';
import { api } from '@/lib/api';
import { useApi } from '@/hooks';
import type { ProcessResponse } from '@/types';
import { FormatMeta } from './FormatMeta';

const WORKSPACE = {
  title: 'Format',
  description: 'Beautify and pretty-print JSON, YAML, XML, TOML, ENV, and INI files.',
  icon: '🔧',
  formats: ['json', 'yaml', 'xml', 'toml', 'env', 'ini'],
};

const FORMAT_EXAMPLES: Record<string, { label: string; content: string }> = {
  json: {
    label: 'JSON',
    content: '{"name":"Alice","age":30,"address":{"city":"Wonderland","zip":"12345"},"hobbies":["chess","coding","tea"]}',
  },
  yaml: {
    label: 'YAML',
    content: 'name: Alice\nage: 30\naddress:\n  city: Wonderland\n  zip: "12345"\nhobbies:\n  - chess\n  - coding\n  - tea',
  },
  xml: {
    label: 'XML',
    content: '<user><name>Alice</name><age>30</age><address><city>Wonderland</city><zip>12345</zip></address></user>',
  },
  toml: {
    label: 'TOML',
    content: '[user]\nname = "Alice"\nage = 30\n[user.address]\ncity = "Wonderland"\nzip = "12345"',
  },
  env: {
    label: 'ENV',
    content: 'DATABASE_URL=postgres://localhost:5432/mydb\nREDIS_URL=redis://localhost:6379\nAPI_KEY=sk-abc123\nNODE_ENV=development\nLOG_LEVEL=debug',
  },
  ini: {
    label: 'INI',
    content: '[database]\nhost = localhost\nport = 5432\nname = myapp\n\n[redis]\nhost = localhost\nport = 6379\ndb = 0\n\n[logging]\nlevel = debug\nfile = /var/log/app.log',
  },
};

const FORMAT_TABS = ['json', 'yaml', 'xml', 'toml', 'env', 'ini'];

export function FormatPage() {
  const [content, setContent] = useState('');
  const [tabSize, setTabSize] = useState(2);
  const [activeFormat, setActiveFormat] = useState('json');
  const { data, isLoading, error, execute } = useApi<ProcessResponse>();

  const handleFormat = useCallback(async () => {
    if (!content.trim()) return;
    await execute(
      api.process('/format/process')({ content, tab_size: tabSize }),
    );
  }, [content, tabSize, execute]);

  const handleFile = useCallback(async (file: File) => {
    const result = await api.upload<{ original: string; result: string; format: string }>('/format/upload')(file);
    setContent(result.original || '');
  }, []);

  const loadExample = useCallback((fmt: string) => {
    const ex = FORMAT_EXAMPLES[fmt];
    if (ex) setContent(ex.content);
    setActiveFormat(fmt);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && content.trim()) {
        handleFormat();
      }
    },
    [handleFormat, content],
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <WorkspaceHeader
        title={WORKSPACE.title}
        description={WORKSPACE.description}
        icon={WORKSPACE.icon}
        formats={WORKSPACE.formats}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5 gap-0.5 w-fit">
            {FORMAT_TABS.map((fmt) => (
              <button
                key={fmt}
                onClick={() => loadExample(fmt)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all uppercase tracking-wider ${
                  activeFormat === fmt
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm'
                    : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500">
                  Raw Input
                </h2>
                <span className="text-xs tabular-nums text-surface-400 dark:text-surface-500">
                  {content.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Paste ${activeFormat.toUpperCase()} content here...`}
                className="w-full h-56 px-4 py-3 text-sm font-mono text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-950/60 rounded-lg border border-surface-200 dark:border-surface-700 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-surface-300 dark:placeholder-surface-600 transition-all leading-relaxed"
                spellCheck={false}
              />
              <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-surface-400 dark:text-surface-500">Examples:</span>
                  {FORMAT_TABS.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => loadExample(fmt)}
                      className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1 rounded-md hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all font-medium"
                    >
                      <ChevronRight className="w-3 h-3" aria-hidden="true" />
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-surface-400 dark:text-surface-500">Ctrl+Enter to format</span>
              </div>
            </CardContent>
          </Card>

          <FileUpload accept=".json,.yaml,.yml,.xml,.toml,.env,.ini" onFileSelected={handleFile} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500 mb-4">
                Options
              </h2>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Indentation
                </label>
                <div className="flex gap-1.5">
                  {[2, 4, 8].map((n) => (
                    <button
                      key={n}
                      onClick={() => setTabSize(n)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                        tabSize === n
                          ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-500/40 text-primary-700 dark:text-primary-400'
                          : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">spaces</p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleFormat}
            isLoading={isLoading}
            disabled={!content.trim()}
            className="w-full"
            size="lg"
          >
            <Code className="w-4 h-4" aria-hidden="true" />
            Format
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-6 animate-slide-up">
          <ErrorMessage message={error} onRetry={handleFormat} />
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-4 animate-slide-up">
          <FormatMeta data={data} />
          <OutputPane
            title="Formatted Output"
            content={data.result || ''}
            language={data.format || 'json'}
          />
        </div>
      )}
    </div>
  );
}
