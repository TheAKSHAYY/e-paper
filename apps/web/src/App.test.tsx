import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('Web App Component', () => {
  it('should export a valid React component function', () => {
    expect(typeof App).toBe('function');
  });
});
