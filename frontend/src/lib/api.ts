import type { ProcessRequest, ProcessResponse, UploadResponse, HealthResponse } from '@/types';

const API_BASE = '/api/v1';
const DEFAULT_TIMEOUT = 30_000;

async function request<T>(
  url: string,
  options?: RequestInit & { timeout?: number },
): Promise<T> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  health: (signal?: AbortSignal) =>
    request<HealthResponse>('/health', { signal }),

  process:
    (endpoint: string) =>
    (data: ProcessRequest, signal?: AbortSignal) =>
      request<ProcessResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        signal,
      }),

  upload:
    <T = UploadResponse>(endpoint: string) =>
    async (file: File, signal?: AbortSignal, onProgress?: (pct: number) => void): Promise<T> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        body: formData,
        signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail || 'Upload failed');
      }

      return response.json();
    },
};
