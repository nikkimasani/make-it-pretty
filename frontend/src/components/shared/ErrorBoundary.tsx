import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center p-16 text-center min-h-[40vh]">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4 border border-red-200 dark:border-red-500/20">
            <span className="text-xl" aria-hidden="true">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6 max-w-md leading-relaxed">
            An unexpected error occurred while rendering this workspace. Try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
