'use client';

import { useState } from 'react';

interface TimeTravelImage {
  url: string;
  stage: string;
  isLoading?: boolean;
  error?: string;
}

interface TimeTravelDisplayProps {
  images: TimeTravelImage[];
  isLoading?: boolean;
  placeholder?: string;
}

export default function TimeTravelDisplay({
  images,
  isLoading = false,
  placeholder = "Your time progression will appear here"
}: TimeTravelDisplayProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const downloadImage = async (url: string, filename: string, index: number) => {
    setDownloadingIndex(index);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingIndex(null);
    }
  };

  const downloadAllImages = async () => {
    setDownloadingAll(true);
    try {
      const completedImgs = images.filter(img => img.url && !img.isLoading && !img.error);
      for (let i = 0; i < completedImgs.length; i++) {
        const image = completedImgs[i];
        await downloadImage(image.url, `timetravel-${image.stage.toLowerCase().replace(/\s+/g, '-')}.png`, i);
        // Add small delay between downloads
        if (i < completedImgs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  // Check if any images are still loading
  const hasLoadingImages = images.some(img => img.isLoading);
  const completedImages = images.filter(img => !img.isLoading && img.url);
  const loadingCount = images.filter(img => img.isLoading).length;
  
  if (isLoading && images.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="aspect-square bg-muted/50 flex flex-col items-center justify-center p-8">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground text-center">
              Analyzing time progression...
              <br />
              <span className="text-sm">Preparing dynamic prompts</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="aspect-square bg-muted/50 flex flex-col items-center justify-center p-8">
            <svg className="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-muted-foreground text-center">{placeholder}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  return (
    <div className="w-full space-y-6">
      {/* Progress Indicator */}
      {hasLoadingImages && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-800/30">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
            Generating {loadingCount} of {images.length} stages in parallel...
          </span>
        </div>
      )}

      {/* Main Display */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="aspect-square relative">
          {currentImage.isLoading ? (
            <div className="w-full h-full bg-muted/50 flex flex-col items-center justify-center">
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-muted-foreground text-center font-medium">{currentImage.stage}</p>
              <p className="text-muted-foreground/70 text-sm">Generating...</p>
            </div>
          ) : currentImage.error ? (
            <div className="w-full h-full bg-destructive/10 flex flex-col items-center justify-center border-2 border-destructive/20">
              <svg className="w-12 h-12 text-destructive mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 14.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-destructive font-medium text-center">{currentImage.stage}</p>
              <p className="text-destructive/70 text-sm text-center">Failed to generate</p>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs text-center">{currentImage.error}</p>
            </div>
          ) : currentImage.url ? (
            <>
              <img
                src={currentImage.url}
                alt={`Time progression - ${currentImage.stage}`}
                className="w-full h-full object-contain bg-muted/20"
              />
              
              {/* Stage Label Overlay */}
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">{currentImage.stage}</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-muted/50 flex items-center justify-center">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}

          {/* Download Button - only show when image is available */}
          {currentImage.url && !currentImage.isLoading && !currentImage.error && (
            <div className="absolute top-4 right-4">
              <button
                onClick={() => downloadImage(currentImage.url, `timetravel-${currentImage.stage.toLowerCase().replace(/\s+/g, '-')}.png`, selectedIndex)}
                disabled={downloadingIndex === selectedIndex}
                className="bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors disabled:opacity-50"
                title="Download this image"
              >
                {downloadingIndex === selectedIndex ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Timeline Navigation */}
      <div className="flex items-center justify-center space-x-4">
        {images.map((image, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* Timeline Dot with states */}
            <button
              onClick={() => setSelectedIndex(index)}
              className={`
                w-4 h-4 rounded-full border-2 transition-all duration-200 relative
                ${selectedIndex === index
                  ? 'scale-125'
                  : ''
                }
                ${image.isLoading
                  ? 'border-blue-500 bg-blue-500/20'
                  : image.error
                  ? 'border-destructive bg-destructive/20'
                  : image.url
                  ? selectedIndex === index
                    ? 'bg-primary border-primary'
                    : 'bg-green-500 border-green-500'
                  : 'bg-background border-border hover:border-primary/50'
                }
              `}
            >
              {image.isLoading && (
                <div className="absolute inset-0.5 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              {image.error && (
                <svg className="w-2.5 h-2.5 text-destructive absolute inset-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {image.url && !image.isLoading && !image.error && (
                <svg className="w-2.5 h-2.5 text-white absolute inset-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            {/* Stage Label */}
            <span className={`
              mt-2 text-xs text-center transition-colors duration-200
              ${selectedIndex === index ? 'text-foreground font-medium' : 'text-muted-foreground'}
            `}>
              {image.stage}
            </span>
            
            {/* Connection Line */}
            {index < images.length - 1 && (
              <div className="absolute w-8 h-0.5 bg-border mt-2 ml-6 -z-10" />
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        {completedImages.length > 0 && (
          <button
            onClick={downloadAllImages}
            disabled={downloadingAll || completedImages.length === 0}
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {downloadingAll ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Download All ({completedImages.length})
          </button>
        )}
        
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-lg">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-muted-foreground">
            {completedImages.length} of {images.length} stages completed
            {hasLoadingImages && <span className="text-blue-600 dark:text-blue-400 ml-1">(generating...)</span>}
          </span>
        </div>
      </div>
    </div>
  );
}