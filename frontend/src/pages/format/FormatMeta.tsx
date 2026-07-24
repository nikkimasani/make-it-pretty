import { Badge } from '@/components/ui';
import type { ProcessResponse } from '@/types';

export function FormatMeta({ data }: { data: ProcessResponse }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {data.format && <Badge variant="primary">{data.format.toUpperCase()}</Badge>}
      {data.formatter && <Badge variant="default">{data.formatter}</Badge>}
      {data.validation_passed !== undefined && (
        <Badge variant={data.validation_passed ? 'success' : 'danger'}>
          {data.validation_passed ? 'Valid' : 'Invalid syntax'}
        </Badge>
      )}
      {data.processing_time !== undefined && (
        <Badge variant="default">{(data.processing_time * 1000).toFixed(0)}ms</Badge>
      )}
      {data.original_lines !== undefined && data.result_lines !== undefined && (
        <Badge variant="default">{data.result_lines} lines</Badge>
      )}
      {data.transformations && data.transformations.length > 0 && (
        data.transformations.map((t) => (
          <Badge key={t} variant="default">{t}</Badge>
        ))
      )}
    </div>
  );
}
