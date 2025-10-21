import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime, formatNumber, truncate } from './format';

describe('formatDate', () => {
  it('should format a date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Jan(uary)? 15, 2024/);
  });

  it('should handle string dates', () => {
    const formatted = formatDate('2024-01-15');
    expect(formatted).toMatch(/Jan(uary)? 15, 2024/);
  });
});

describe('formatRelativeTime', () => {
  it('should format recent times', () => {
    const now = new Date();
    const result = formatRelativeTime(now);
    expect(result).toBe('just now');
  });

  it('should handle past dates', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    const result = formatRelativeTime(pastDate);
    expect(result).toContain('day');
  });
});

describe('formatNumber', () => {
  it('should format numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should handle decimals', () => {
    expect(formatNumber(1234.56)).toMatch(/1,234\.56/);
  });

  it('should handle small numbers', () => {
    expect(formatNumber(42)).toBe('42');
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    const result = truncate('This is a very long string', 10);
    expect(result).toBe('This is...');
  });

  it('should not truncate short strings', () => {
    const result = truncate('Short', 10);
    expect(result).toBe('Short');
  });

  it('should handle exact length', () => {
    const result = truncate('Exactly10!', 10);
    expect(result).toBe('Exactly10!');
  });
});
