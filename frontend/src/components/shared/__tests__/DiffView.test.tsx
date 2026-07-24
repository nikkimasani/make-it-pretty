import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DiffView } from '../DiffView';

describe('DiffView', () => {
  it('renders beautified view by default', () => {
    render(<DiffView original={'a\nb'} beautified={'a\nb\nc'} />);
    expect(screen.getByText('Beautified')).toBeInTheDocument();
  });

  it('shows diff line count increase', () => {
    render(<DiffView original={'a\nb'} beautified={'a\nb\nc'} />);
    expect(screen.getByText((content) => content.includes('+1') && content.includes('lines'))).toBeInTheDocument();
  });

  it('shows diff line count decrease', () => {
    render(<DiffView original={'a\nb\nc'} beautified={'a\nb'} />);
    expect(screen.getByText((content) => content.includes('-1') && content.includes('lines'))).toBeInTheDocument();
  });

  it('switches to side-by-side view', async () => {
    render(<DiffView original={'a'} beautified={'b'} />);
    await userEvent.click(screen.getByText('Side by side'));
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getAllByText('Beautified')[0]).toBeInTheDocument();
  });

  it('shows placeholder for empty content in side-by-side view', async () => {
    render(<DiffView original="" beautified="" />);
    await userEvent.click(screen.getByText('Side by side'));
    expect(screen.getAllByText('(empty)').length).toBe(2);
  });
});
