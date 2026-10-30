import { describe, it, expect } from 'vitest';
import { downscaleImageFile } from './imageOptimizer';

describe('Image Optimizer & File Security (imageOptimizer.ts)', () => {
  it('rejects non-image files with clear error', async () => {
    const textFile = new File(['hello text'], 'notes.txt', { type: 'text/plain' });
    await expect(downscaleImageFile(textFile)).rejects.toThrow(
      'Unsupported image format'
    );
  });

  it('rejects SVG files to prevent script execution and canvas rendering failures', async () => {
    const svgFile = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'],
      'image.svg',
      { type: 'image/svg+xml' }
    );
    await expect(downscaleImageFile(svgFile)).rejects.toThrow(
      'Unsupported image format'
    );
  });
});

