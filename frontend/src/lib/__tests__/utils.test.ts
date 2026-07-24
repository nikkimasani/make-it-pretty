import { describe, expect, it } from 'vitest';
import { cn, formatFileSize, detectFileType } from '../utils';

describe('cn', () => {
  it('joins truthy classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('returns empty string for no truthy values', () => {
    expect(cn(false, undefined, null)).toBe('');
  });
});

describe('formatFileSize', () => {
  it('returns "0 B" for zero', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats KB', () => {
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('formats MB', () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('formats GB', () => {
    expect(formatFileSize(3 * 1024 * 1024 * 1024)).toBe('3 GB');
  });
});

describe('detectFileType', () => {
  it('detects json', () => {
    expect(detectFileType('file.json')).toBe('json');
  });

  it('detects yaml and yml', () => {
    expect(detectFileType('file.yaml')).toBe('yaml');
    expect(detectFileType('file.yml')).toBe('yaml');
  });

  it('detects xml', () => {
    expect(detectFileType('file.xml')).toBe('xml');
  });

  it('detects csv', () => {
    expect(detectFileType('data.csv')).toBe('csv');
  });

  it('detects tsv', () => {
    expect(detectFileType('data.tsv')).toBe('tsv');
  });

  it('detects xlsx', () => {
    expect(detectFileType('sheet.xlsx')).toBe('xlsx');
  });

  it('defaults to text for unknown', () => {
    expect(detectFileType('file.xyz')).toBe('text');
  });

  it('handles missing extension', () => {
    expect(detectFileType('Makefile')).toBe('text');
  });
});
