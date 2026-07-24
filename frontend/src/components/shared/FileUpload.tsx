import { useCallback, useRef, useState } from 'react';
import { Upload, LoaderCircle } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  onFileSelected?: (file: File) => void;
  onFilesSelected?: (files: File[]) => void;
  multiple?: boolean;
  isLoading?: boolean;
}

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  '.json,.yaml,.yml,.xml,.toml,.env,.ini': ['json', 'yaml', 'yml', 'xml', 'toml', 'env', 'ini'],
  '.csv,.tsv,.xlsx,.xls': ['csv', 'tsv', 'xlsx', 'xls'],
  '.html,.pdf,.docx,.md': ['html', 'pdf', 'docx', 'md'],
};

function getAcceptedExtensions(accept?: string): string[] {
  if (!accept) return [];
  const exts = ALLOWED_EXTENSIONS[accept];
  if (exts) return exts;
  return accept.split(',').map((e) => e.trim().replace(/^\./, '').toLowerCase());
}

function validateFileType(file: File, accept?: string): boolean {
  if (!accept) return true;
  if (accept === '*') return true;
  const exts = getAcceptedExtensions(accept);
  if (exts.length === 0) return true;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return exts.includes(ext);
}

export function FileUpload({
  accept,
  onFileSelected,
  onFilesSelected,
  multiple = false,
  isLoading = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
      setDragError(null);
    } else {
      setIsDragging(false);
    }
  }, []);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const list = Array.from(files);
      const valid = list.filter((f) => {
        if (!validateFileType(f, accept)) {
          const ext = f.name.split('.').pop() || '';
          setDragError(`Unsupported file type: .${ext}`);
          return false;
        }
        return true;
      });
      if (valid.length === 0) return;
      try {
        if (onFilesSelected) {
          await onFilesSelected(valid);
        } else if (onFileSelected && valid.length > 0) {
          await onFileSelected(valid[0]);
        }
      } catch (err) {
        setDragError(err instanceof Error ? err.message : 'Upload failed');
      }
    },
    [accept, onFileSelected, onFilesSelected],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) await handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleClick = () => inputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) await handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload file"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
        isDragging
          ? 'border-primary-400 dark:border-primary-500 bg-primary-50/60 dark:bg-primary-500/5 scale-[1.01]'
          : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 hover:bg-surface-50/60 dark:hover:bg-surface-800/40 bg-white dark:bg-surface-900/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
      {isLoading ? (
        <div className="flex flex-col items-center gap-2.5">
          <LoaderCircle className="h-8 w-8 text-primary-500 animate-spin" aria-hidden="true" />
          <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Processing...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5">
          <div
            className={`p-3 rounded-xl transition-colors duration-200 ${
              isDragging
                ? 'bg-primary-100 dark:bg-primary-500/20'
                : 'bg-surface-100 dark:bg-surface-800'
            }`}
          >
            <Upload
              className={`h-6 w-6 transition-colors duration-200 ${
                isDragging ? 'text-primary-500' : 'text-surface-400 dark:text-surface-500'
              }`}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                Click to upload
              </span>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-600 mt-0.5">
              Supported formats based on workspace
            </p>
          </div>
          {dragError && (
            <p className="text-xs text-red-500 dark:text-red-400 font-medium">{dragError}</p>
          )}
        </div>
      )}
    </div>
  );
}
