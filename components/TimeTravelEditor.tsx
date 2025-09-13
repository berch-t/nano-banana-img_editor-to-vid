'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { TIMETRAVEL_PROMPTS } from '@/utils/timeTravelPrompts';
import { compressImage } from '@/utils/imageCompression';

interface TimeTravelEditorProps {
  onTimeTravelSubmit: (originalImage: string, prompt: string, numImages: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function TimeTravelEditor({
  onTimeTravelSubmit,
  isLoading = false,
  disabled = false
}: TimeTravelEditorProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [numImages, setNumImages] = useState(4);
  const [showExamples, setShowExamples] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    setIsUploadingImage(true);
    try {
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.9,
        outputFormat: 'png'
      });
      
      setOriginalImage(compressedDataUrl);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage || !prompt.trim() || disabled || isLoading) {
      return;
    }
    
    onTimeTravelSubmit(originalImage, prompt.trim(), numImages);
  }, [originalImage, prompt, numImages, disabled, isLoading, onTimeTravelSubmit]);

  const handleExampleClick = useCallback((examplePrompt: string) => {
    setPrompt(examplePrompt);
    setShowExamples(false);
  }, []);

  const canSubmit = originalImage && prompt.trim() && !disabled && !isLoading;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950/20 dark:border-purple-800/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-purple-800 dark:text-purple-200 font-medium mb-1">
              🕒 TimeTravel Image Generation
            </p>
            <p className="text-purple-700 dark:text-purple-300">
              Upload an image and describe how you want it to evolve through time. AI will generate 3-5 stages showing the progression.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Image Upload */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">1. Upload Reference Image</h3>
          
          {!originalImage ? (
            <div
              {...getRootProps()}
              className={`
                relative w-full h-96 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-card'
                }
              `}
            >
              <input {...getInputProps()} />
              
              {isUploadingImage ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="relative w-8 h-8 mb-3">
                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm font-medium">Processing image...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-1">
                    {isDragActive ? 'Drop image here' : 'Upload reference image'}
                  </p>
                  <p className="text-sm opacity-75">
                    Drag & drop or click to select
                  </p>
                  <p className="text-xs opacity-50 mt-2">
                    Supports JPG, PNG, GIF, WebP
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full h-96 bg-muted/20 rounded-lg overflow-hidden border border-border">
                <img
                  src={originalImage}
                  alt="Reference for time travel"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                onClick={() => setOriginalImage(null)}
                className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Upload Different Image
              </button>
            </div>
          )}
        </div>
        
        {/* Right: Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Time Settings</h3>
          
          {originalImage ? (
            <div className="space-y-4">
              {/* Number of Images Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Number of Time Stages
                </label>
                <div className="flex gap-2">
                  {[3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => setNumImages(num)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${numImages === num
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }
                      `}
                    >
                      {num} stages
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  More stages = more detailed progression but longer processing time
                </p>
              </div>

              {/* Processing Time Info */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-800/30">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    Processing time: ~{Math.ceil(numImages * 1.2)} minutes
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-muted/50 border border-border rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Upload an image first to configure time travel settings
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Prompt Input Section */}
      {originalImage && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Describe Time Progression</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how the image should evolve through time... (e.g., 'evolve through different historical eras', 'show aging from young to old', 'progress from ancient to futuristic')"
                className="w-full p-4 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground min-h-[100px]"
                disabled={disabled || isLoading}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`
                  flex-1 px-6 py-3 rounded-lg font-medium transition-colors
                  ${!canSubmit
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }
                `}
              >
                {isLoading ? `Generating ${numImages} Stages (up to ${Math.ceil(numImages * 1.2)} min)...` : `Generate ${numImages} Time Stages`}
              </button>
              
              <button
                type="button"
                onClick={() => setShowExamples(!showExamples)}
                className="px-6 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg font-medium transition-colors"
                disabled={disabled || isLoading}
              >
                {showExamples ? 'Hide Examples' : 'Show Examples'}
              </button>
            </div>
          </form>

          {showExamples && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Example time progressions:</h4>
              <div className="grid gap-2">
                {TIMETRAVEL_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example.prompt)}
                    className="text-left p-3 bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    disabled={disabled || isLoading}
                  >
                    <div className="text-sm font-medium mb-1">{example.title}</div>
                    <div className="text-xs text-muted-foreground mb-1">{example.description}</div>
                    <div className="text-xs italic text-muted-foreground">&quot;{example.prompt}&quot;</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status indicators */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${originalImage ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={originalImage ? 'text-green-600' : 'text-muted-foreground'}>
                Image uploaded
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${prompt.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={prompt.trim() ? 'text-green-600' : 'text-muted-foreground'}>
                Time progression described
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-foreground">
                {numImages} stages selected
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}