import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToggleSwitch } from '../ToggleSwitch';

describe('ToggleSwitch', () => {
  it('renders label and description', () => {
    render(
      <ToggleSwitch
        label="Grammar Check"
        description="Fix punctuation"
        checked={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Grammar Check')).toBeInTheDocument();
    expect(screen.getByText('Fix punctuation')).toBeInTheDocument();
  });

  it('renders checkbox with correct checked state', () => {
    const { rerender } = render(
      <ToggleSwitch label="Test" description="" checked={false} onChange={() => {}} />,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    rerender(
      <ToggleSwitch label="Test" description="" checked={true} onChange={() => {}} />,
    );
    expect(checkbox).toBeChecked();
  });

  it('calls onChange when toggled', async () => {
    const onChange = vi.fn();
    render(
      <ToggleSwitch label="Test" description="" checked={false} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
