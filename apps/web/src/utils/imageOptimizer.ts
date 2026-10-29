/**
 * Utility for client-side image downscaling and compression.
 * Prevents localStorage quota exhaustion by resizing large photos (e.g. 10MB phone uploads)
 * to crisp, newspaper-ready dimensions (max 1600px) with JPEG compression.
 */
export async function downscaleImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<string> {
  // If not an image, reject
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image');
  }

  // Create an object URL for memory efficiency
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale down if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to simple data URL if canvas context unavailable
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
          return;
        }

        // High quality bicubic smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG for photographs or PNG if transparent
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, quality);
        resolve(dataUrl);
      };

      img.onerror = (err) => {
        reject(err);
      };

      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
