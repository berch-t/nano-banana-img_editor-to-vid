'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { compressImage } from '@/utils/imageCompression';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        setIsCompressing(true);
        setFileName(file.name);
        setPreviewUrl(null);

        // Compress the image
        const compressedDataUrl = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          outputFormat: 'jpeg'
        });

        setPreviewUrl(compressedDataUrl);
        onImageUpload(compressedDataUrl);
      } catch (error) {
        console.error('Error compressing image:', error);
      } finally {
        setIsCompressing(false);
      }
    }
    setIsDragging(false);
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative w-full h-96 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive || isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 bg-card'
        }
      `}
    >
      <input {...getInputProps()} />
      
      {isCompressing ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium mb-2">Compressing image...</p>
          <p className="text-sm opacity-75">{fileName}</p>
        </div>
      ) : previewUrl ? (
        <div className="relative w-full h-full">
          <Image
            src={previewUrl}
            alt="Uploaded image"
            fill
            className="object-contain rounded-lg"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
            <p className="text-white bg-black/50 px-3 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
              Click or drag to replace
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <svg
            className="w-12 h-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop your image here' : 'Upload an image'}
          </p>
          <p className="text-sm">
            Drag and drop or click to select
          </p>
          <p className="text-xs mt-2 opacity-75">
            Supports: JPEG, PNG, GIF, WebP
          </p>
        </div>
      )}
    </div>
  );
}