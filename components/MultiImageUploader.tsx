'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { compressImage } from '@/utils/imageCompression';

interface MultiImageUploaderProps {
  onImagesUpload: (images: string[]) => void;
}

interface UploadedImage {
  url: string;
  name: string;
  isCompressing?: boolean;
}

export default function MultiImageUploader({ onImagesUpload }: MultiImageUploaderProps) {
  const [primaryImage, setPrimaryImage] = useState<UploadedImage | null>(null);
  const [secondaryImage, setSecondaryImage] = useState<UploadedImage | null>(null);
  const [dragTarget, setDragTarget] = useState<'primary' | 'secondary' | null>(null);

  const handleImageUpload = useCallback(async (file: File, target: 'primary' | 'secondary') => {
    try {
      // Set loading state
      const loadingImage = { url: '', name: file.name, isCompressing: true };
      if (target === 'primary') {
        setPrimaryImage(loadingImage);
      } else {
        setSecondaryImage(loadingImage);
      }

      // Compress the image
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        outputFormat: 'jpeg'
      });

      const uploadedImage = { url: compressedDataUrl, name: file.name };
      
      if (target === 'primary') {
        setPrimaryImage(uploadedImage);
      } else {
        setSecondaryImage(uploadedImage);
      }

      // Update parent component with both images
      const newPrimary = target === 'primary' ? compressedDataUrl : primaryImage?.url;
      const newSecondary = target === 'secondary' ? compressedDataUrl : secondaryImage?.url;
      
      const images = [newPrimary, newSecondary].filter(Boolean) as string[];
      onImagesUpload(images);
    } catch (error) {
      console.error('Error compressing image:', error);
      // Reset loading state on error
      if (target === 'primary') {
        setPrimaryImage(null);
      } else {
        setSecondaryImage(null);
      }
    }
  }, [primaryImage?.url, secondaryImage?.url, onImagesUpload]);

  const onDropPrimary = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleImageUpload(file, 'primary');
    }
    setDragTarget(null);
  }, [handleImageUpload]);

  const onDropSecondary = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleImageUpload(file, 'secondary');
    }
    setDragTarget(null);
  }, [handleImageUpload]);

  const { getRootProps: getPrimaryRootProps, getInputProps: getPrimaryInputProps, isDragActive: isPrimaryDragActive } = useDropzone({
    onDrop: onDropPrimary,
    onDragEnter: () => setDragTarget('primary'),
    onDragLeave: () => setDragTarget(null),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  const { getRootProps: getSecondaryRootProps, getInputProps: getSecondaryInputProps, isDragActive: isSecondaryDragActive } = useDropzone({
    onDrop: onDropSecondary,
    onDragEnter: () => setDragTarget('secondary'),
    onDragLeave: () => setDragTarget(null),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Primary Image Upload Area */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Main/Background Image</h3>
        <div
          {...getPrimaryRootProps()}
          className={`
            relative w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isPrimaryDragActive || dragTarget === 'primary'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 bg-card'
            }
          `}
        >
          <input {...getPrimaryInputProps()} />
          
          {primaryImage?.isCompressing ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="relative w-8 h-8 mb-3">
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-medium">Compressing image...</p>
              <p className="text-xs opacity-75">{primaryImage.name}</p>
            </div>
          ) : primaryImage ? (
            <div className="relative w-full h-full">
              <Image
                src={primaryImage.url}
                alt={primaryImage.name}
                fill
                className="object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                <p className="text-white bg-black/50 px-3 py-1 rounded opacity-0 hover:opacity-100 transition-opacity text-sm">
                  Click or drag to replace
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <svg
                className="w-10 h-10 mb-3"
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
              <p className="text-sm font-medium mb-1">
                {isPrimaryDragActive ? 'Drop image here' : 'Upload image'}
              </p>
              <p className="text-xs opacity-75">
                Drag & drop or click
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Secondary Image Upload Area */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Product/Object to Add</h3>
        <div
          {...getSecondaryRootProps()}
          className={`
            relative w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isSecondaryDragActive || dragTarget === 'secondary'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 bg-card'
            }
          `}
        >
          <input {...getSecondaryInputProps()} />
          
          {secondaryImage?.isCompressing ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="relative w-8 h-8 mb-3">
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-medium">Compressing image...</p>
              <p className="text-xs opacity-75">{secondaryImage.name}</p>
            </div>
          ) : secondaryImage ? (
            <div className="relative w-full h-full">
              <Image
                src={secondaryImage.url}
                alt={secondaryImage.name}
                fill
                className="object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                <p className="text-white bg-black/50 px-3 py-1 rounded opacity-0 hover:opacity-100 transition-opacity text-sm">
                  Click or drag to replace
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <svg
                className="w-10 h-10 mb-3"
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
              <p className="text-sm font-medium mb-1">
                {isSecondaryDragActive ? 'Drop image here' : 'Upload image'}
              </p>
              <p className="text-xs opacity-75">
                Drag & drop or click
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}