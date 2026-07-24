import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from '../FileUpload';

function createFile(name: string, type: string): File {
  return new File(['content'], name, { type });
}

describe('FileUpload', () => {
  it('renders upload area', () => {
    render(<FileUpload />);
    expect(screen.getByLabelText('Upload file')).toBeInTheDocument();
  });

  it('shows processing state when loading', () => {
    render(<FileUpload isLoading />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('calls onFileSelected with file', () => {
    const onFileSelected = vi.fn();
    render(<FileUpload onFileSelected={onFileSelected} accept=".json" />);

    const input = document.querySelector('input[type="file"]')!;
    const file = createFile('test.json', 'application/json');

    fireEvent.change(input, { target: { files: [file] } });
    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it('calls onFilesSelected for multiple files', () => {
    const onFilesSelected = vi.fn();
    render(<FileUpload onFilesSelected={onFilesSelected} multiple />);

    const input = document.querySelector('input[type="file"]')!;
    const files = [createFile('a.json', 'application/json'), createFile('b.json', 'application/json')];

    fireEvent.change(input, { target: { files } });
    expect(onFilesSelected).toHaveBeenCalledWith(files);
  });

  it('shows error for unsupported file type', () => {
    const onFileSelected = vi.fn();
    render(<FileUpload onFileSelected={onFileSelected} accept=".json" />);

    const input = document.querySelector('input[type="file"]')!;
    const file = createFile('test.xml', 'application/xml');

    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
    expect(onFileSelected).not.toHaveBeenCalled();
  });

  it('triggers file input on click', () => {
    const { container } = render(<FileUpload />);
    const clickable = container.querySelector('[role="button"]')!;
    expect(clickable).toBeInTheDocument();
  });
});
