import { describe, it, expect } from 'vitest';
import { RendererWorker } from './index';

describe('RendererWorker', () => {
  it('should initialize with default concurrency and timeout settings', () => {
    const worker = new RendererWorker();
    const config = worker.getConfig();
    expect(config.concurrency).toBe(4);
    expect(config.timeoutMs).toBe(30000);
  });

  it('should allow overriding configuration parameters', () => {
    const worker = new RendererWorker({ concurrency: 8, timeoutMs: 60000 });
    const config = worker.getConfig();
    expect(config.concurrency).toBe(8);
    expect(config.timeoutMs).toBe(60000);
  });
});
