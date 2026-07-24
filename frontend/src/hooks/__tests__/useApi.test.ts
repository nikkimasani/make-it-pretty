import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useApi } from '../useApi';

describe('useApi', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('starts with idle state', () => {
    const { result } = renderHook(() => useApi<string>());
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading state during execution', async () => {
    const { result } = renderHook(() => useApi<string>());
    const promise = new Promise<string>((resolve) => setTimeout(() => resolve('done'), 100));

    act(() => { result.current.execute(promise); });
    expect(result.current.isLoading).toBe(true);

    await act(() => vi.advanceTimersByTimeAsync(100));
    expect(result.current.isLoading).toBe(false);
  });

  it('returns data on success', async () => {
    const { result } = renderHook(() => useApi<string>());
    const promise = Promise.resolve('hello');

    await act(async () => {
      await result.current.execute(promise);
    });

    expect(result.current.data).toBe('hello');
    expect(result.current.error).toBeNull();
  });

  it('sets error on rejection', async () => {
    const { result } = renderHook(() => useApi<string>());
    const promise = Promise.reject(new Error('fail'));

    await act(async () => {
      await result.current.execute(promise);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('fail');
  });

  it('resets state', async () => {
    const { result } = renderHook(() => useApi<string>());

    await act(async () => {
      await result.current.execute(Promise.resolve('data'));
    });
    expect(result.current.data).toBe('data');

    act(() => { result.current.reset(); });
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('aborts previous request on new execute', async () => {
    const { result } = renderHook(() => useApi<string>());
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

    const slow = new Promise<string>((resolve) => setTimeout(() => resolve('slow'), 1000));
    act(() => { result.current.execute(slow); });

    const fast = Promise.resolve('fast');
    await act(async () => { await result.current.execute(fast); });

    expect(abortSpy).toHaveBeenCalled();
    expect(result.current.data).toBe('fast');
  });
});
