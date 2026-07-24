import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui';

interface TextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  title?: string;
}

export function TextArea({
  value = '',
  onChange,
  placeholder = 'Paste your content here...',
  title = 'Input',
}: TextAreaProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-500">
            {title}
          </h3>
          <span className="text-xs tabular-nums text-surface-400 dark:text-surface-600">
            {internalValue.length.toLocaleString()} chars
          </span>
        </div>
        <textarea
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full h-52 px-4 py-3 text-sm font-mono text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-950/60 rounded-lg border border-surface-200 dark:border-surface-700 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:focus:ring-primary-500 placeholder-surface-300 dark:placeholder-surface-600 transition-all duration-150 leading-relaxed"
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
}
