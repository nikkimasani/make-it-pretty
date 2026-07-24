import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BeautifyPage } from '../BeautifyPage';

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
      <BeautifyPage />
    </MemoryRouter>,
  );
}

describe('BeautifyPage', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockExecute.mockResolvedValue({ original: 'test', result: 'test', suggestions: [] });
  });

  it('renders workspace header', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Beautify' })).toBeInTheDocument();
  });

  it('renders example buttons', () => {
    renderPage();
    expect(screen.getByText('Dense paragraph')).toBeInTheDocument();
    expect(screen.getByText('Bullet list')).toBeInTheDocument();
    expect(screen.getByText('Raw notes')).toBeInTheDocument();
  });

  it('loads example text on click', async () => {
    renderPage();
    await userEvent.click(screen.getByText('Dense paragraph'));
    const textarea = screen.getByPlaceholderText('Paste your text here...') as HTMLTextAreaElement;
    expect(textarea.value.length).toBeGreaterThan(0);
  });

  it('calls API on Beautify button click', async () => {
    renderPage();
    const textarea = screen.getByPlaceholderText('Paste your text here...');
    await userEvent.type(textarea, 'hello world');
    const beautifyBtn = screen.getByRole('button', { name: /Beautify$/ });
    await userEvent.click(beautifyBtn);
    expect(mockExecute).toHaveBeenCalled();
  });

  it('disables beautify button when text is empty', () => {
    renderPage();
    const beautifyBtn = screen.getByRole('button', { name: /Beautify$/ });
    expect(beautifyBtn).toBeDisabled();
  });

  it('renders toggle switches', () => {
    renderPage();
    expect(screen.getByText('Grammar Check')).toBeInTheDocument();
    expect(screen.getByText('Emoji Enrichment')).toBeInTheDocument();
  });
});
