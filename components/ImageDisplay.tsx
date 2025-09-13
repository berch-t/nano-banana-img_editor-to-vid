'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ImageDisplay({ imageUrl, isLoading = false, placeholder = "No image" }: ImageDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `nano-banana-edited-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-card border border-border rounded-lg flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Processing your image</p>
            <p className="text-sm text-muted-foreground">⏰ <strong>This may take up to 5 minutes.</strong> Please be patient while we process your image with AI.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full h-96 bg-card border border-border rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg">{placeholder}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full h-96 bg-card border border-border rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt="Edited image"
          fill
          className="object-contain"
        />
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
            ${isDownloading
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }
          `}
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Downloading...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Image
            </>
          )}
        </button>
      </div>
    </div>
  );
}