import { describe, it, expect } from 'vitest';
import { createRouter, Link, Outlet } from './index';

describe('platform-router', () => {
  it('should export createRouter', () => {
    expect(createRouter).toBeDefined();
    expect(typeof createRouter).toBe('function');
  });

  it('should export Link component', () => {
    expect(Link).toBeDefined();
  });

  it('should export Outlet component', () => {
    expect(Outlet).toBeDefined();
  });
});
