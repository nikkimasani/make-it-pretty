import { useState, useCallback, useRef, useEffect } from 'react';
import { Table2 } from 'lucide-react';
import { WorkspaceHeader, FileUpload, DataTable, ErrorMessage } from '@/components/shared';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { api } from '@/lib/api';

const WORKSPACE = {
  title: 'Tabulate',
  description: 'Transform CSV, TSV, or Excel files into interactive, sortable, searchable tables.',
  icon: '📊',
  formats: ['csv', 'tsv', 'xlsx'],
};

interface ParsedTable {
  columns: string[];
  rows: Record<string, string>[];
}

const SAMPLE_CSV = `Name,Department,Salary,Location,Level
Alice Johnson,Engineering,120000,San Francisco,Senior
Bob Smith,Marketing,85000,New York,Mid
Carol Williams,Engineering,135000,Seattle,Principal
David Brown,Design,92000,Austin,Mid
Eve Davis,Engineering,110000,San Francisco,Senior
Frank Miller,HR,75000,Chicago,Junior
Grace Wilson,Product,115000,San Francisco,Senior
Henry Moore,Engineering,145000,Seattle,Staff
Iris Taylor,Design,98000,New York,Senior
Jack Anderson,Marketing,88000,Boston,Mid`;

export function TabulatePage() {
  const [parsed, setParsed] = useState<ParsedTable | null>(null);
  const [delimiter, setDelimiter] = useState(',');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const parseWithWorker = useCallback((text: string, delim: string) => {
    return new Promise<ParsedTable>((resolve, reject) => {
      workerRef.current?.terminate();
      const worker = new Worker(new URL('../../workers/csv.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { success, columns, rows, error: workerError } = e.data;
        worker.terminate();
        if (!success) {
          reject(new Error(workerError || 'Parsing failed'));
        } else {
          resolve({ columns, rows });
        }
      };
      worker.onerror = () => {
        worker.terminate();
        reject(new Error('Worker error'));
      };
      worker.postMessage({ text, delimiter: delim, hasHeaders: true });
    });
  }, []);

  const parseCSV = useCallback(async (text: string, delim: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await parseWithWorker(text, delim);
      setParsed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parsing failed');
    } finally {
      setIsLoading(false);
    }
  }, [parseWithWorker]);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (ext === 'xlsx' || ext === 'xls') {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.upload<{ columns: string[]; rows: Record<string, string>[] }>('/tabulate/upload')(file);
        setParsed({ columns: result.columns, rows: result.rows });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const text = await file.text();
    const detectedDelim = ext === 'tsv' ? '\t' : delimiter;
    setDelimiter(detectedDelim);
    await parseCSV(text, detectedDelim);
  }, [delimiter, parseCSV]);

  const loadSample = useCallback(() => {
    setFileName(null);
    setDelimiter(',');
    parseCSV(SAMPLE_CSV, ',');
  }, [parseCSV]);

  const handlePaste = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        parseCSV(e.target.value, delimiter);
      }, 400);
    },
    [delimiter, parseCSV],
  );

  const handleDelimiterChange = useCallback((d: string) => {
    setDelimiter(d);
    setFileName(null);
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <WorkspaceHeader
        title={WORKSPACE.title}
        description={WORKSPACE.description}
        icon={WORKSPACE.icon}
        formats={WORKSPACE.formats}
      />

      {!parsed ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500">
                    Paste Data
                  </h2>
                  <button
                    onClick={loadSample}
                    className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1 rounded-md hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all font-medium"
                  >
                    Load example
                  </button>
                </div>
                <textarea
                  placeholder="Paste CSV or TSV data here..."
                  onChange={handlePaste}
                  className="w-full h-44 px-4 py-3 text-sm font-mono text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-950/60 rounded-lg border border-surface-200 dark:border-surface-700 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-surface-300 dark:placeholder-surface-600 transition-all leading-relaxed"
                  spellCheck={false}
                />
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-1.5">
                  Paste auto-parses after 400ms. Change delimiter below to retry.
                </p>
              </CardContent>
            </Card>

            {fileName && (
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-50 dark:bg-surface-900/50 rounded-lg border border-surface-200 dark:border-surface-700">
                <span className="text-xs text-surface-500 dark:text-surface-400">File:</span>
                <span className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate">{fileName}</span>
              </div>
            )}

            <FileUpload accept=".csv,.tsv,.xlsx,.xls" onFileSelected={handleFile} isLoading={isLoading} />
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500 mb-4">
                  Options
                </h2>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Delimiter
                  </label>
                  <div className="flex gap-1.5">
                    {[
                      { label: 'Comma', value: ',' },
                      { label: 'Tab', value: '\t' },
                      { label: 'Semicolon', value: ';' },
                      { label: 'Pipe', value: '|' },
                    ].map((d) => (
                      <button
                        key={d.label}
                        onClick={() => handleDelimiterChange(d.value)}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                          delimiter === d.value
                            ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-500/40 text-primary-700 dark:text-primary-400'
                            : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={loadSample} size="lg" className="w-full">
              <Table2 className="w-4 h-4" aria-hidden="true" />
              Load Sample
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{parsed.columns.length} columns</Badge>
              <Badge variant="default">{parsed.rows.length.toLocaleString()} rows</Badge>
              <Badge variant="default">delimiter: {delimiter === '\t' ? 'tab' : delimiter}</Badge>
              {fileName && <Badge variant="default">{fileName}</Badge>}
            </div>
            <Button variant="secondary" size="sm" onClick={() => { setParsed(null); setFileName(null); }}>
              New table
            </Button>
          </div>

          {error && <ErrorMessage message={error} />}

          <DataTable columns={parsed.columns} rows={parsed.rows} pageSize={50} />
        </div>
      )}
    </div>
  );
}
