import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomePage } from '../../HomePage';

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('renders hero section', () => {
    renderWithRouter();
    expect(screen.getByText('Make It Pretty')).toBeInTheDocument();
    expect(screen.getByText('100% Local')).toBeInTheDocument();
    expect(screen.getByText('No AI')).toBeInTheDocument();
    expect(screen.getByText('Privacy First')).toBeInTheDocument();
  });

  it('renders all workspace cards', () => {
    renderWithRouter();
    expect(screen.getByText('Beautify')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('Tabulate')).toBeInTheDocument();
    expect(screen.getByText('Reader')).toBeInTheDocument();
    expect(screen.getByText('Code Beautifier')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderWithRouter();
    expect(screen.getByText(/Built with FastAPI/)).toBeInTheDocument();
  });
});
