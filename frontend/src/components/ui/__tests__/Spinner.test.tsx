import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('renders with default md size', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.classList.contains('h-6')).toBe(true);
  });

  it('renders with sm size', () => {
    const { container } = render(<Spinner size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('h-4')).toBe(true);
  });

  it('renders with lg size', () => {
    const { container } = render(<Spinner size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('h-10')).toBe(true);
  });

  it('has role status and aria label', () => {
    const { container } = render(<Spinner />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('role')).toBe('status');
    expect(wrapper.getAttribute('aria-label')).toBe('Loading');
  });

  it('merges custom className', () => {
    const { container } = render(<Spinner className="extra" />);
    expect((container.firstChild as HTMLElement).className).toContain('extra');
  });
});
