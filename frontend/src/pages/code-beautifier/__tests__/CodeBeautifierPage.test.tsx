import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CodeBeautifierPage } from '../CodeBeautifierPage';

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
      <CodeBeautifierPage />
    </MemoryRouter>,
  );
}

describe('CodeBeautifierPage', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockExecute.mockResolvedValue({
      original: 'a', result: 'b', language: 'javascript', formatter: 'prettier',
    });
  });

  it('renders workspace header', () => {
    renderPage();
    expect(screen.getByText('Code Beautifier')).toBeInTheDocument();
    expect(screen.getByText('.py')).toBeInTheDocument();
  });

  it('renders language selector options', () => {
    renderPage();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('renders indent size options', () => {
    renderPage();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('calls API on Beautify button click', async () => {
    renderPage();
    const textarea = screen.getByPlaceholderText('Paste your code here (javascript)...');
    await userEvent.type(textarea, 'const a = 1');
    const beautifyBtn = screen.getByRole('button', { name: /Beautify$/ });
    await userEvent.click(beautifyBtn);
    expect(mockExecute).toHaveBeenCalled();
  });

  it('disables beautify button when input is empty', () => {
    renderPage();
    const beautifyBtn = screen.getByRole('button', { name: /Beautify$/ });
    expect(beautifyBtn).toBeDisabled();
  });

  it('clears input on Clear button click', async () => {
    renderPage();
    const textarea = screen.getByPlaceholderText('Paste your code here (javascript)...');
    await userEvent.type(textarea, 'some code');
    await userEvent.click(screen.getByText('Clear'));
    expect(textarea).toHaveValue('');
  });

  it('filters languages on search', async () => {
    renderPage();
    const searchInput = screen.getByPlaceholderText(/Search.*languages/);
    await userEvent.type(searchInput, 'py');
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
  });
});
