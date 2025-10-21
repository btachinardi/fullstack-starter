import { describe, expect, it } from 'vitest';
import { Store, useStore } from './index';

describe('platform-store', () => {
  it('should export Store', () => {
    expect(Store).toBeDefined();
    expect(typeof Store).toBe('function');
  });

  it('should export useStore', () => {
    expect(useStore).toBeDefined();
    expect(typeof useStore).toBe('function');
  });

  it('should create a store', () => {
    const store = new Store({ count: 0 });
    expect(store).toBeDefined();
    expect(store.state).toBeDefined();
  });
});
