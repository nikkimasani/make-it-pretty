import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <main className="flex-1 overflow-auto min-h-screen">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
