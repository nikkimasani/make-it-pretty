import { useEffect, useCallback, useRef } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const key = [
        e.ctrlKey || e.metaKey ? 'Ctrl' : '',
        e.shiftKey ? 'Shift' : '',
        e.altKey ? 'Alt' : '',
        e.key === 'Enter' ? 'Enter' : e.key === 'Escape' ? 'Escape' : e.key === 's' ? 's' : e.key === 'c' ? 'c' : '',
      ]
        .filter(Boolean)
        .join('+');

      if (key && shortcutsRef.current[key]) {
        shortcutsRef.current[key]();
      }
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler, enabled]);
}
