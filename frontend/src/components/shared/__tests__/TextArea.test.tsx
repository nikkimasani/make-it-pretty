import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextArea } from '../TextArea';

describe('TextArea', () => {
  it('renders with placeholder', () => {
    render(<TextArea />);
    expect(screen.getByPlaceholderText('Paste your content here...')).toBeInTheDocument();
  });

  it('displays character count', () => {
    render(<TextArea value="hello" />);
    expect(screen.getByText('5 chars')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    render(<TextArea onChange={onChange} />);
    const textarea = screen.getByPlaceholderText('Paste your content here...');
    await userEvent.type(textarea, 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('displays title', () => {
    render(<TextArea title="Input" />);
    expect(screen.getByText('Input')).toBeInTheDocument();
  });

  it('formats character count with locale separator', () => {
    render(<TextArea value={Array(1500).fill('x').join('')} />);
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
  });
});
