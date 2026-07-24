import { ArrowRight, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { WORKSPACES, type WorkspaceConfig } from '@/types';
import { Badge } from '@/components/ui';

function FeaturePill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20 transition-all duration-200 hover:scale-105">
      {children}
    </span>
  );
}

function WorkspaceCard({ workspace, index }: { workspace: WorkspaceConfig; index: number }) {
  return (
    <NavLink
      to={workspace.path}
      style={{ animationDelay: `${index * 80}ms` }}
      className="group relative flex flex-col p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-700 shadow-sm hover:shadow-lg hover:shadow-primary-500/5 dark:hover:shadow-primary-500/10 transition-all duration-300 animate-slide-up"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-xl shadow-sm" role="img" aria-label={workspace.title}>
          {workspace.icon}
        </span>
        <h3 className="font-semibold text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {workspace.title}
        </h3>
      </div>
      <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed mb-4 flex-1">
        {workspace.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {workspace.supportedFormats.slice(0, 4).map((fmt) => (
          <Badge key={fmt} variant="primary">.{fmt}</Badge>
        ))}
        {workspace.supportedFormats.length > 4 && (
          <Badge variant="default">+{workspace.supportedFormats.length - 4}</Badge>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
        Open workspace <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </NavLink>
  );
}

export function HomePage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-grid">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 mb-6 text-xs font-medium text-primary-700 dark:text-primary-400 animate-slide-up">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Five powerful workspaces, zero AI
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-surface-100 mb-4 text-balance tracking-tight leading-tight">
            Make It Pretty
          </h1>
          <p className="text-base sm:text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-8 leading-relaxed text-pretty">
            Transform, beautify, format, and read your content — completely local and private.
            No data ever leaves your machine.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <FeaturePill>100% Local</FeaturePill>
            <FeaturePill>No AI</FeaturePill>
            <FeaturePill>Privacy First</FeaturePill>
            <FeaturePill>Dark Mode</FeaturePill>
          </div>
        </div>
      </section>

      {/* Workspace grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12" aria-label="Workspaces">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKSPACES.map((workspace, i) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-surface-100 dark:border-surface-800">
        <p className="text-center text-xs text-surface-400 dark:text-surface-600">
          Make It Pretty &mdash; Built with FastAPI, React, TypeScript &amp; Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
