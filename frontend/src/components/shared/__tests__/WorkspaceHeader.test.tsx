import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorkspaceHeader } from '../WorkspaceHeader';

describe('WorkspaceHeader', () => {
  const formats = ['json', 'yaml', 'xml'];

  it('renders title and description', () => {
    render(<WorkspaceHeader title="Format" description="Beautify data" icon="🔧" formats={formats} />);
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('Beautify data')).toBeInTheDocument();
  });

  it('renders icon with aria-label', () => {
    render(<WorkspaceHeader title="Format" description="d" icon="🔧" formats={formats} />);
    expect(screen.getByRole('img', { name: 'Format' })).toHaveTextContent('🔧');
  });

  it('renders format badges', () => {
    render(<WorkspaceHeader title="Format" description="d" icon="🔧" formats={formats} />);
    expect(screen.getByText('.json')).toBeInTheDocument();
    expect(screen.getByText('.yaml')).toBeInTheDocument();
    expect(screen.getByText('.xml')).toBeInTheDocument();
  });
});
