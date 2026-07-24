import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/shared';
import { HomePage } from '@/pages/HomePage';
import { BeautifyPage } from '@/pages/beautify/BeautifyPage';
import { FormatPage } from '@/pages/format/FormatPage';
import { TabulatePage } from '@/pages/tabulate/TabulatePage';
import { ReaderPage } from '@/pages/reader/ReaderPage';
import { CodeBeautifierPage } from '@/pages/code-beautifier/CodeBeautifierPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
      <Route path="/beautify" element={<ErrorBoundary><BeautifyPage /></ErrorBoundary>} />
      <Route path="/format" element={<ErrorBoundary><FormatPage /></ErrorBoundary>} />
      <Route path="/tabulate" element={<ErrorBoundary><TabulatePage /></ErrorBoundary>} />
      <Route path="/reader" element={<ErrorBoundary><ReaderPage /></ErrorBoundary>} />
      <Route path="/code-beautifier" element={<ErrorBoundary><CodeBeautifierPage /></ErrorBoundary>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
