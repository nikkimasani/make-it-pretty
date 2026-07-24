import { useState, useCallback, useMemo } from 'react';
import { Sparkles, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { WorkspaceHeader, OutputPane, ErrorMessage } from '@/components/shared';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { api } from '@/lib/api';
import { useApi } from '@/hooks';
import type { ProcessResponse } from '@/types';

const LANGUAGES = [
  { value: 'python', label: 'Python', group: 'Common' },
  { value: 'javascript', label: 'JavaScript', group: 'Common' },
  { value: 'typescript', label: 'TypeScript', group: 'Common' },
  { value: 'html', label: 'HTML', group: 'Markup' },
  { value: 'css', label: 'CSS', group: 'Stylesheet' },
  { value: 'jsx', label: 'JSX', group: 'Common' },
  { value: 'tsx', label: 'TSX', group: 'Common' },
  { value: 'json', label: 'JSON', group: 'Data' },
  { value: 'xml', label: 'XML', group: 'Markup' },
  { value: 'yaml', label: 'YAML', group: 'Data' },
  { value: 'toml', label: 'TOML', group: 'Data' },
  { value: 'env', label: 'ENV', group: 'Data' },
  { value: 'ini', label: 'INI', group: 'Data' },
  { value: 'sql', label: 'SQL', group: 'Data' },
  { value: 'java', label: 'Java', group: 'Compiled' },
  { value: 'c', label: 'C', group: 'Compiled' },
  { value: 'cpp', label: 'C++', group: 'Compiled' },
  { value: 'csharp', label: 'C#', group: 'Compiled' },
  { value: 'go', label: 'Go', group: 'Compiled' },
  { value: 'rust', label: 'Rust', group: 'Compiled' },
  { value: 'kotlin', label: 'Kotlin', group: 'Compiled' },
  { value: 'swift', label: 'Swift', group: 'Compiled' },
  { value: 'scala', label: 'Scala', group: 'Compiled' },
  { value: 'dart', label: 'Dart', group: 'Compiled' },
  { value: 'objectivec', label: 'Objective-C', group: 'Compiled' },
  { value: 'ruby', label: 'Ruby', group: 'Scripting' },
  { value: 'php', label: 'PHP', group: 'Scripting' },
  { value: 'lua', label: 'Lua', group: 'Scripting' },
  { value: 'shell', label: 'Shell', group: 'Scripting' },
  { value: 'perl', label: 'Perl', group: 'Scripting' },
  { value: 'r', label: 'R', group: 'Scripting' },
  { value: 'elixir', label: 'Elixir', group: 'Scripting' },
  { value: 'erlang', label: 'Erlang', group: 'Scripting' },
  { value: 'clojure', label: 'Clojure', group: 'Scripting' },
  { value: 'lisp', label: 'Lisp', group: 'Scripting' },
  { value: 'markdown', label: 'Markdown', group: 'Documentation' },
  { value: 'solidity', label: 'Solidity', group: 'Blockchain' },
  { value: 'elm', label: 'Elm', group: 'Compiled' },
  { value: 'visualbasic', label: 'Visual Basic', group: 'Compiled' },
  { value: 'dockerfile', label: 'Dockerfile', group: 'DevOps' },
  { value: 'makefile', label: 'Makefile', group: 'DevOps' },
  { value: 'cmake', label: 'CMake', group: 'DevOps' },
  { value: 'powershell', label: 'PowerShell', group: 'Scripting' },
];

const LANGUAGES_COUNT = LANGUAGES.length;

const EXTENSION_MAP: Record<string, string> = {
  python: '.py', javascript: '.js', typescript: '.ts', jsx: '.jsx', tsx: '.tsx',
  html: '.html', css: '.css',
  java: '.java', c: '.c', cpp: '.cpp', csharp: '.cs',
  go: '.go', rust: '.rs', kotlin: '.kt', swift: '.swift',
  scala: '.scala', dart: '.dart', objectivec: '.m',
  sql: '.sql', json: '.json', xml: '.xml',
  yaml: '.yaml', toml: '.toml', env: '.env', ini: '.ini',
  ruby: '.rb', php: '.php', lua: '.lua', shell: '.sh',
  perl: '.pl', r: '.r', elixir: '.ex', erlang: '.erl',
  clojure: '.clj', lisp: '.lisp', markdown: '.md',
  solidity: '.sol', elm: '.elm', visualbasic: '.vb',
  dockerfile: '.Dockerfile', makefile: '.Makefile',   cmake: '.cmake',
  powershell: '.ps1',
};

const ACCEPT_EXTS = '.py,.js,.jsx,.ts,.tsx,.html,.htm,.css,.scss,.sass,.less,.java,.c,.h,.cpp,.hpp,.cs,.go,.rs,.kt,.kts,.swift,.scala,.dart,.m,.mm,.sql,.json,.xml,.yaml,.yml,.toml,.env,.ini,.rb,.php,.lua,.sh,.bash,.zsh,.pl,.pm,.r,.ex,.exs,.erl,.clj,.lisp,.md,.mdx,.sol,.elm,.vb,.ps1,.gradle,.Dockerfile,.Makefile';

export function CodeBeautifierPage() {
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [indentSize, setIndentSize] = useState(2);
  const [langSearch, setLangSearch] = useState('');
  const [showAllGroups, setShowAllGroups] = useState(true);
  const { data, isLoading, error, execute } = useApi<ProcessResponse>();

  const groupedLangs = useMemo(() => {
    const groups: Record<string, typeof LANGUAGES> = {};
    for (const l of LANGUAGES) {
      if (!groups[l.group]) groups[l.group] = [];
      groups[l.group].push(l);
    }
    const order = ['Common', 'Compiled', 'Scripting', 'Markup', 'Stylesheet', 'Data', 'Documentation', 'DevOps', 'Blockchain'];
    return order.filter((g) => groups[g]).map((g) => ({ group: g, langs: groups[g] }));
  }, []);

  const filteredGroups = useMemo(() => {
    if (!langSearch.trim()) {
      return showAllGroups ? groupedLangs : [];
    }
    const q = langSearch.toLowerCase();
    return groupedLangs
      .map((g) => ({
        ...g,
        langs: g.langs.filter(
          (l) => l.label.toLowerCase().includes(q) || l.value.includes(q),
        ),
      }))
      .filter((g) => g.langs.length > 0);
  }, [langSearch, groupedLangs, showAllGroups]);

  const handleBeautify = useCallback(async () => {
    if (!input.trim()) return;
    const ext = EXTENSION_MAP[language] || `.${language}`;
    await execute(
      api.process('/code-beautifier/process')({
        content: input,
        filename: `code${ext}`,
        tab_size: indentSize,
      }),
    );
  }, [input, language, indentSize, execute]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const text = await file.text();
    setInput(text);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && input.trim()) {
        handleBeautify();
      }
    },
    [handleBeautify, input],
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <WorkspaceHeader
        title="Code Beautifier"
        description={`Format source code in ${LANGUAGES_COUNT}+ languages using Ruff, Black, Prettier, clang-format, and more.`}
        icon="✨"
        formats={['py', 'js', 'ts', 'html', 'css', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'sql']}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500">
                  Input Code
                </h2>
                <span className="text-xs tabular-nums text-surface-400 dark:text-surface-500">
                  {input.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Paste your code here (${language})...`}
                className="w-full h-52 px-4 py-3 text-sm font-mono text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-950/60 rounded-lg border border-surface-200 dark:border-surface-700 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-surface-300 dark:placeholder-surface-600 transition-all leading-relaxed"
                spellCheck={false}
              />
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-1.5">
                Press Ctrl+Enter to beautify
              </p>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <input type="file" id="code-file-upload"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="hidden"
              accept={ACCEPT_EXTS}
            />
            <label htmlFor="code-file-upload"
              className="inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors font-medium"
            >
              Upload source file
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500 mb-4">
                Options
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Language
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" aria-hidden="true" />
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => { setLangSearch(e.target.value); setShowAllGroups(false); }}
                    placeholder={`Search ${LANGUAGES_COUNT} languages...`}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-surface-200 dark:border-surface-700 rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder-surface-400"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-surface-200 dark:border-surface-700 rounded-lg divide-y divide-surface-100 dark:divide-surface-800">
                  {filteredGroups.length === 0 ? (
                    <p className="text-xs text-surface-400 dark:text-surface-500 p-3 text-center">No languages match</p>
                  ) : langSearch.trim() ? (
                    <div className="p-1">
                      {filteredGroups.map((g) =>
                        g.langs.map((l) => (
                          <button
                            key={l.value}
                            onClick={() => { setLanguage(l.value); setLangSearch(''); }}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                              language === l.value
                                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-medium'
                                : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                            }`}
                          >
                            {l.label}
                          </button>
                        )),
                      )}
                    </div>
                  ) : (
                    groupedLangs.map((g) => (
                      <div key={g.group}>
                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 bg-surface-50 dark:bg-surface-900/50">
                          {g.group}
                        </div>
                        {g.langs.map((l) => (
                          <button
                            key={l.value}
                            onClick={() => setLanguage(l.value)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-none transition-colors ${
                              language === l.value
                                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-medium'
                                : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                            }`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-1.5">{LANGUAGES_COUNT} languages supported</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Indentation
                </label>
                <div className="flex gap-1.5">
                  {[2, 4, 8].map((n) => (
                    <button key={n} onClick={() => setIndentSize(n)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                        indentSize === n
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

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleClear} disabled={!input.trim() && !data}>
              Clear
            </Button>
            <Button onClick={handleBeautify} isLoading={isLoading} disabled={!input.trim()} className="flex-1" size="lg">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Beautify
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 animate-slide-up">
          <ErrorMessage message={error} onRetry={handleBeautify} />
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 flex-wrap">
            {data.language && <Badge variant="primary">{data.language}</Badge>}
            {data.formatter && <Badge variant="default">{data.formatter}</Badge>}
            {data.validation_passed !== undefined && (
              <Badge variant={data.validation_passed ? 'success' : 'danger'}>
                {data.validation_passed ? 'Valid' : (data.validation_error || 'Invalid')}
              </Badge>
            )}
            {data.processing_time !== undefined && (
              <Badge variant="default">{(data.processing_time).toFixed(0)}ms</Badge>
            )}
            {data.recovery_attempted && <Badge variant="warning">Recovery applied</Badge>}
            {data.transformations && data.transformations.map((t) => (
              <Badge key={t} variant="default">{t}</Badge>
            ))}
          </div>
          <OutputPane title="Beautified Code" content={data.result || ''} language={data.language || language} />
        </div>
      )}
    </div>
  );
}
