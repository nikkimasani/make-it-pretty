import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('calls handler on matching key combo', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'Ctrl+Enter': handler }, true));

    const event = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler when disabled', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'Ctrl+Enter': handler }, false));

    const event = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
    window.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('calls handler for Escape', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'Escape': handler }, true));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls handler for Ctrl+S', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'Ctrl+s': handler }, true));

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
