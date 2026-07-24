import { Badge } from '@/components/ui';

interface WorkspaceHeaderProps {
  title: string;
  description: string;
  icon: string;
  formats: string[];
}

export function WorkspaceHeader({ title, description, icon, formats }: WorkspaceHeaderProps) {
  return (
    <div className="mb-8 animate-slide-up">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-xl shadow-sm border border-primary-100 dark:border-primary-500/20"
          role="img"
          aria-label={title}
        >
          {icon}
        </span>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          {title}
        </h1>
      </div>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-3 leading-relaxed max-w-2xl">
        {description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {formats.map((fmt) => (
          <Badge key={fmt} variant="primary">
            .{fmt}
          </Badge>
        ))}
      </div>
    </div>
  );
}
