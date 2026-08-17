import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen min-w-0 bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <main className="min-w-0 w-full flex-1 overflow-x-hidden min-h-screen">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
