import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn (className utility)', () => {
  it('should merge class names', () => {
    const result = cn('px-2', 'py-4');
    expect(result).toBe('px-2 py-4');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'active', false && 'inactive');
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).not.toContain('inactive');
  });

  it('should concatenate classes', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('should handle empty inputs', () => {
    const result = cn('', null, undefined);
    expect(result).toBe('');
  });

  it('should handle arrays', () => {
    const result = cn(['foo', 'bar'], 'baz');
    expect(result).toContain('foo');
    expect(result).toContain('bar');
    expect(result).toContain('baz');
  });
});
