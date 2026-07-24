import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun, Sparkles, Menu, X } from 'lucide-react';
import { WORKSPACES, type WorkspaceConfig } from '@/types';
import { useTheme } from '@/hooks';

function NavItem({ workspace, onClick }: { workspace: WorkspaceConfig; onClick?: () => void }) {
  return (
    <NavLink
      to={workspace.path}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
        }`
      }
      aria-current="page"
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex items-center justify-center w-7 h-7 rounded-md text-base transition-all duration-150 ${
              isActive
                ? 'bg-primary-500/15 dark:bg-primary-400/15'
                : 'bg-surface-100 dark:bg-surface-800 group-hover:bg-surface-200 dark:group-hover:bg-surface-700'
            }`}
            aria-hidden="true"
          >
            {workspace.icon}
          </span>
          <span className="truncate">{workspace.title}</span>
          {isActive && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 shrink-0" aria-hidden="true" />
          )}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarId = 'main-sidebar';

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-lg hover:shadow-xl transition-shadow"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-controls={sidebarId}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="w-5 h-5 text-surface-700 dark:text-surface-300" /> : <Menu className="w-5 h-5 text-surface-700 dark:text-surface-300" />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={closeMobile}
          role="presentation"
          aria-hidden="true"
        />
      )}

      <aside
        id={sidebarId}
        className={`
          w-60 h-screen sticky top-0 border-r border-surface-200 dark:border-surface-800
          bg-white dark:bg-surface-900 flex flex-col shrink-0 z-40
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="px-5 py-5 border-b border-surface-100 dark:border-surface-800">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="Make It Pretty — Home"
            onClick={closeMobile}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 dark:bg-primary-600 shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-semibold text-surface-900 dark:text-surface-100 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Make It Pretty
              </div>
              <div className="text-[10px] text-surface-400 dark:text-surface-500 leading-tight">
                Beautify your content
              </div>
            </div>
          </NavLink>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold text-surface-400 dark:text-surface-600 uppercase tracking-widest">
            Workspaces
          </p>
          {WORKSPACES.map((workspace) => (
            <NavItem key={workspace.id} workspace={workspace} onClick={closeMobile} />
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-surface-100 dark:border-surface-800 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-150"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-surface-100 dark:bg-surface-800" aria-hidden="true">
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </span>
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>

          <div className="px-3 py-1">
            <p className="text-[10px] text-surface-400 dark:text-surface-600">
              v0.1.0 &middot; Local-first
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
