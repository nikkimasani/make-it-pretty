import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>test</Badge>);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    render(<Badge>default</Badge>);
    expect(screen.getByText('default').className).toContain('bg-surface-100');
  });

  it('applies primary variant', () => {
    render(<Badge variant="primary">primary</Badge>);
    expect(screen.getByText('primary').className).toContain('bg-primary-50');
  });

  it('applies success variant', () => {
    render(<Badge variant="success">success</Badge>);
    expect(screen.getByText('success').className).toContain('bg-emerald-50');
  });

  it('applies warning variant', () => {
    render(<Badge variant="warning">warning</Badge>);
    expect(screen.getByText('warning').className).toContain('bg-amber-50');
  });

  it('applies danger variant', () => {
    render(<Badge variant="danger">danger</Badge>);
    expect(screen.getByText('danger').className).toContain('bg-red-50');
  });

  it('merges custom className', () => {
    render(<Badge className="extra">badge</Badge>);
    expect(screen.getByText('badge').className).toContain('extra');
  });
});
