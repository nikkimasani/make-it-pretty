import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OutputPane } from '../OutputPane';

Object.assign(navigator, {
  clipboard: { writeText: vi.fn() },
});

describe('OutputPane', () => {
  it('renders content', () => {
    render(<OutputPane content="hello world" />);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('shows placeholder when content is empty', () => {
    render(<OutputPane content="" />);
    expect(screen.getByText('No output yet. Upload or paste content to process.')).toBeInTheDocument();
  });

  it('copies content to clipboard', async () => {
    render(<OutputPane content="copy me" />);
    await userEvent.click(screen.getByLabelText('Copy to clipboard'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy me');
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<OutputPane title="Custom Title" content="test" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders download button', () => {
    render(<OutputPane content="test" />);
    expect(screen.getByLabelText('Download output')).toBeInTheDocument();
  });
});
