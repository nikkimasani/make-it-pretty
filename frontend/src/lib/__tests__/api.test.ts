import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../api';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('api', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('health', () => {
    it('fetches health endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok', version: '1.0' }),
      });

      const result = await api.health();
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/health', expect.any(Object));
      expect(result).toEqual({ status: 'ok', version: '1.0' });
    });
  });

  describe('process', () => {
    it('sends POST with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ original: '', result: '{}', format: 'json' }),
      });

      const result = await api.process('/format/process')({ content: '{}' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/format/process',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: '{}' }),
        }),
      );
      expect(result).toEqual({ original: '', result: '{}', format: 'json' });
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Bad request' }),
      });

      await expect(api.process('/format/process')({ content: '' })).rejects.toThrow('Bad request');
    });
  });

  describe('upload', () => {
    it('sends POST with FormData', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ filename: 'test.json', content: '{}', format: 'json', size: 2 }),
      });

      const file = new File(['{}'], 'test.json', { type: 'application/json' });
      const result = await api.upload('/format/upload')(file);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/format/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
      expect(result).toEqual({ filename: 'test.json', content: '{}', format: 'json', size: 2 });
    });

    it('throws on upload failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Upload failed' }),
      });

      const file = new File([''], 'test.json');
      await expect(api.upload('/format/upload')(file)).rejects.toThrow('Upload failed');
    });
  });
});
