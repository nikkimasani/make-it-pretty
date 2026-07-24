import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardHeader, CardContent } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>content</p></Card>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders card with default classes', () => {
    const { container } = render(<Card>card</Card>);
    expect(container.firstChild).toHaveClass('bg-white', 'rounded-xl', 'border');
  });

  it('merges custom className', () => {
    const { container } = render(<Card className="custom">card</Card>);
    expect(container.firstChild).toHaveClass('custom');
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader><h2>Header</h2></CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('has border-bottom', () => {
    const { container } = render(<CardHeader>header</CardHeader>);
    expect(container.firstChild).toHaveClass('border-b');
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>content</CardContent>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('has padding classes', () => {
    const { container } = render(<CardContent>content</CardContent>);
    expect(container.firstChild).toHaveClass('px-5', 'py-4');
  });
});
