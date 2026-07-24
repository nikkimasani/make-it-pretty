import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TabulatePage } from '../TabulatePage';

vi.mock('@/lib/api', () => ({
  api: {
    upload: () => () => Promise.resolve({ columns: ['a', 'b'], rows: [{ a: '1', b: '2' }] }),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <TabulatePage />
    </MemoryRouter>,
  );
}

describe('TabulatePage', () => {
  it('renders workspace header', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Tabulate' })).toBeInTheDocument();
  });

  it('renders delimiter options', () => {
    renderPage();
    expect(screen.getByText('Comma')).toBeInTheDocument();
    expect(screen.getByText('Tab')).toBeInTheDocument();
    expect(screen.getByText('Semicolon')).toBeInTheDocument();
  });

  it('renders paste area and sample button', () => {
    renderPage();
    expect(screen.getByText('Paste Data')).toBeInTheDocument();
    expect(screen.getByText('Load example')).toBeInTheDocument();
    expect(screen.getByText('Load Sample')).toBeInTheDocument();
  });

  it('renders paste textarea with placeholder', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Paste CSV or TSV data here...')).toBeInTheDocument();
  });
});
