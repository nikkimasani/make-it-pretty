import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FormatPage } from '../FormatPage';

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
      <FormatPage />
    </MemoryRouter>,
  );
}

describe('FormatPage', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockExecute.mockResolvedValue({ original: '', result: '{}', format: 'json' });
  });

  it('renders workspace header', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Format' })).toBeInTheDocument();
    expect(screen.getByText('.json')).toBeInTheDocument();
  });

  it('renders format tabs', () => {
    renderPage();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('YAML')).toBeInTheDocument();
    expect(screen.getByText('XML')).toBeInTheDocument();
    expect(screen.getByText('TOML')).toBeInTheDocument();
  });

  it('loads example content on tab click', async () => {
    renderPage();
    await userEvent.click(screen.getByText('JSON'));
    const textarea = screen.getByPlaceholderText('Paste JSON content here...') as HTMLTextAreaElement;
    expect(textarea.value.length).toBeGreaterThan(0);
  });

  it('calls API on Format button click', async () => {
    renderPage();
    const textarea = screen.getByPlaceholderText('Paste JSON content here...');
    fireEvent.change(textarea, { target: { value: '{"a":1}' } });
    const formatBtn = screen.getByRole('button', { name: /Format$/ });
    await userEvent.click(formatBtn);
    expect(mockExecute).toHaveBeenCalled();
  });

  it('disables format button when content is empty', () => {
    renderPage();
    const formatBtn = screen.getByRole('button', { name: /Format$/ });
    expect(formatBtn).toBeDisabled();
  });

  it('renders indent size options', () => {
    renderPage();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
