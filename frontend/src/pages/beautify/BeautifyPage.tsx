import { useState, useCallback } from 'react';
import { WandSparkles, ChevronRight } from 'lucide-react';
import { WorkspaceHeader, FileUpload, ErrorMessage } from '@/components/shared';
import { Button, Card, CardContent, ToggleSwitch } from '@/components/ui';
import { api } from '@/lib/api';
import { useApi } from '@/hooks';
import type { ProcessResponse } from '@/types';
import { BeautifyResult } from './BeautifyResult';

const WORKSPACE = {
  title: 'Beautify',
  description: 'Improve human readability of natural text, apply grammar fixes, and add expressive emojis.',
  icon: '✨',
  formats: ['txt', 'md', 'html', 'docx', 'pdf'],
};

const EXAMPLES = [
  {
    label: 'Dense paragraph',
    text: 'The meeting was held on monday.all team members attended.the project deadline was extended.no one was happy about the situation.next meeting is thursday.',
  },
  {
    label: 'Bullet list',
    text: '- improve test coverage\n- fix login bug\n- update documentation\n- review pull requests\n- deploy to staging',
  },
  {
    label: 'Raw notes',
    text: 'call customer re: invoice 4521 unpaid since jan. schedule follow-up for friday. check if payment method updated. escalate if not resolved by eod.',
  },
];

export function BeautifyPage() {
  const [text, setText] = useState('');
  const [grammarCheck, setGrammarCheck] = useState(true);
  const [emojiEnrichment, setEmojiEnrichment] = useState(false);
  const { data, isLoading, error, execute } = useApi<ProcessResponse>();

  const handleBeautify = useCallback(async () => {
    if (!text.trim()) return;
    await execute(
      api.process('/beautify/process')({ content: text, grammar_check: grammarCheck, emoji_enrichment: emojiEnrichment }),
    );
  }, [text, grammarCheck, emojiEnrichment, execute]);

  const handleFile = useCallback(async (file: File) => {
    const result = await api.upload<ProcessResponse>('/beautify/upload')(file);
    setText(result.original || '');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && text.trim()) {
        handleBeautify();
      }
    },
    [handleBeautify, text],
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
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500">
                  Input Text
                </h2>
                <span className="text-xs tabular-nums text-surface-400 dark:text-surface-500">
                  {text.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste your text here..."
                className="w-full h-52 px-4 py-3 text-sm font-mono text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-950/60 rounded-lg border border-surface-200 dark:border-surface-700 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-surface-300 dark:placeholder-surface-600 transition-all leading-relaxed"
                spellCheck={false}
              />
              <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="text-xs text-surface-400 dark:text-surface-500">Try example:</span>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => setText(ex.text)}
                      className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1 rounded-md hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all font-medium"
                    >
                      <ChevronRight className="w-3 h-3" aria-hidden="true" />
                      {ex.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-surface-400 dark:text-surface-500">Ctrl+Enter to run</span>
              </div>
            </CardContent>
          </Card>

          <FileUpload accept=".txt,.md,.html,.docx,.pdf" onFileSelected={handleFile} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500 mb-4">
                Options
              </h2>
              <div className="space-y-4">
                <ToggleSwitch
                  label="Grammar Check"
                  description="Fix punctuation, capitalization, and basic grammar errors"
                  checked={grammarCheck}
                  onChange={setGrammarCheck}
                />
                <ToggleSwitch
                  label="Emoji Enrichment"
                  description="Contextually add expressive emojis to enhance tone"
                  checked={emojiEnrichment}
                  onChange={setEmojiEnrichment}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleBeautify}
            isLoading={isLoading}
            disabled={!text.trim()}
            className="w-full"
            size="lg"
          >
            <WandSparkles className="w-4 h-4" aria-hidden="true" />
            Beautify
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-6 animate-slide-up">
          <ErrorMessage message={error} onRetry={handleBeautify} />
        </div>
      )}

      {data && (
        <div className="mt-6 animate-slide-up">
          <BeautifyResult data={data} />
        </div>
      )}
    </div>
  );
}
