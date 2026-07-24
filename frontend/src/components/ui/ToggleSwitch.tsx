interface ToggleSwitchProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="flex items-start gap-3.5 cursor-pointer group">
      <div className="relative inline-flex items-center mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className="w-9 h-5 rounded-full transition-all duration-200
            bg-surface-200 dark:bg-surface-700
            peer-checked:bg-primary-500 dark:peer-checked:bg-primary-500
            peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-surface-900"
        />
        <div
          className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm
            transition-transform duration-200 peer-checked:translate-x-4"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-surface-800 dark:text-surface-200 group-hover:text-surface-900 dark:group-hover:text-surface-100 transition-colors leading-tight">
          {label}
        </div>
        <div className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 leading-relaxed">
          {description}
        </div>
      </div>
    </label>
  );
}
