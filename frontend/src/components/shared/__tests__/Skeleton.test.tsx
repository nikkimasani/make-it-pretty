import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton, CardSkeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<Skeleton />);
    const bars = container.querySelectorAll('.h-4');
    expect(bars).toHaveLength(3);
  });

  it('renders custom line count', () => {
    const { container } = render(<Skeleton lines={5} />);
    const bars = container.querySelectorAll('.h-4');
    expect(bars).toHaveLength(5);
  });

  it('has aria-busy attribute', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });
});

describe('CardSkeleton', () => {
  it('renders skeleton card', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toHaveClass('rounded-xl');
  });

  it('has aria-busy attribute', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });
});
