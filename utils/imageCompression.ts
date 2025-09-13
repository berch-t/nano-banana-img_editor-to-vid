export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'jpeg' | 'png' | 'webp';
}

const defaultOptions: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  outputFormat: 'jpeg'
};

export function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const opts = { ...defaultOptions, ...options };
    
    // Create image element
    const img = new Image();
    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = opts.maxWidth;
            height = width / aspectRatio;
            
            if (height > opts.maxHeight) {
              height = opts.maxHeight;
              width = height * aspectRatio;
            }
          } else {
            height = opts.maxHeight;
            width = height * aspectRatio;
            
            if (width > opts.maxWidth) {
              width = opts.maxWidth;
              height = width / aspectRatio;
            }
          }
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        
        // Configure canvas for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const mimeType = `image/${opts.outputFormat}`;
        const compressedDataUrl = canvas.toDataURL(mimeType, opts.quality);
        
        resolve(compressedDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load the image
    img.src = URL.createObjectURL(file);
  });
}

export function getCompressedImageInfo(dataUrl: string) {
  // Calculate approximate size in KB
  const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
  const sizeInKB = Math.round(sizeInBytes / 1024);
  
  return {
    sizeInKB,
    sizeInBytes,
    format: dataUrl.split(';')[0].split('/')[1] || 'unknown'
  };
}