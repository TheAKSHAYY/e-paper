import type { MinimalDocument, PageDimensions } from '@epaper-studio/document-schema';

export interface RenderJobRequest {
  jobId: string;
  document: MinimalDocument;
  dimensions: PageDimensions;
  outputFormat: 'pdf' | 'png-1bit' | 'png-8bit';
  ditherAlgorithm?: 'floyd-steinberg' | 'atkinson' | 'none';
}

export interface RenderJobResponse {
  jobId: string;
  success: boolean;
  byteLength?: number;
  outputUrl?: string;
  error?: string;
}

export interface RendererWorkerConfig {
  concurrency: number;
  timeoutMs: number;
}

/**
 * Placeholder worker orchestrator interface.
 * Real PDF generation and Playwright browser pool to be implemented in Phase 2.
 */
export class RendererWorker {
  private config: RendererWorkerConfig;

  constructor(config: Partial<RendererWorkerConfig> = {}) {
    this.config = {
      concurrency: config.concurrency ?? 4,
      timeoutMs: config.timeoutMs ?? 30000,
    };
  }

  public getConfig(): Readonly<RendererWorkerConfig> {
    return this.config;
  }

  public async validateEnvironment(): Promise<boolean> {
    return true;
  }
}
