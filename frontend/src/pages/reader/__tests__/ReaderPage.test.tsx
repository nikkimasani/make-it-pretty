import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ReaderPage } from '../ReaderPage';

const mockExecute = vi.fn();
vi.mock('@/hooks', () => ({
  useApi: () => ({
    data: null,
    isLoading: false,
    error: null,
    execute: mockExecute,
    reset: vi.fn(),
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ReaderPage />
    </MemoryRouter>,
  );
}

describe('ReaderPage', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockExecute.mockResolvedValue({
      original: '', result: '<p>clean</p>', format: 'html',
      title: 'Test', word_count: 100, reading_time_minutes: 1, metadata: {},
    });
  });

  it('renders workspace header', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Reader' })).toBeInTheDocument();
  });

  it('renders input tab buttons', () => {
    renderPage();
    expect(screen.getByText('Paste HTML')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getAllByText('URL').length).toBeGreaterThanOrEqual(1);
  });

  it('renders URL input field', () => {
    renderPage();
    expect(screen.getByPlaceholderText('https://example.com/article')).toBeInTheDocument();
    expect(screen.getByText('Wikipedia (Readability)')).toBeInTheDocument();
  });

  it('switches to paste tab', async () => {
    renderPage();
    await userEvent.click(screen.getByText('Paste HTML'));
    expect(screen.getByPlaceholderText('Paste HTML or Markdown content here...')).toBeInTheDocument();
  });

  it('disables Read button when input is empty', () => {
    renderPage();
    const readBtn = screen.getByRole('button', { name: /^Read$/ });
    expect(readBtn).toBeDisabled();
  });

  it('calls API when URL is entered and Read clicked', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('https://example.com/article'), 'https://example.com/article');
    await userEvent.click(screen.getByRole('button', { name: /^Read$/ }));
    expect(mockExecute).toHaveBeenCalled();
  });
});
