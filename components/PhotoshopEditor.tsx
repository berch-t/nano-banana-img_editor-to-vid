'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import DrawingCanvas, { DrawingTool } from './DrawingCanvas';
import DrawingToolbar from './DrawingToolbar';
import { compressImage } from '@/utils/imageCompression';

interface DrawingSettings {
  tool: DrawingTool;
  brushSize: number;
  opacity: number;
}

interface PhotoshopEditorProps {
  onEditSubmit: (originalImage: string, maskImage: string, prompt: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const PHOTOSHOP_PROMPTS = [
  "Replace with flowers",
  "Add realistic shadows", 
  "Change color to blue",
  "Add motion blur effect",
  "Remove and fill intelligently",
  "Apply vintage texture",
  "Add magical sparkles",
  "Create depth of field blur",
  "Add realistic lighting",
  "Change to different material"
];

export default function PhotoshopEditor({
  onEditSubmit,
  isLoading = false,
  disabled = false
}: PhotoshopEditorProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    tool: 'brush' as DrawingTool,
    brushSize: 20,
    opacity: 0.8
  });
  
  const [canvasActions, setCanvasActions] = useState<{
    clear: () => void;
    undo: () => void;
    redo: () => void;
  } | null>(null);

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
      setMaskImage(null); // Reset mask when new image is uploaded
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

  // Handle mask generation from canvas
  const handleMaskGenerated = useCallback((maskUrl: string) => {
    setMaskImage(maskUrl);
  }, []);

  // Handle canvas ready callback
  const handleCanvasReady = useCallback((actions: { clear: () => void; undo: () => void; redo: () => void }) => {
    setCanvasActions(actions);
  }, []);

  // Canvas actions
  const handleCanvasClear = useCallback(() => {
    setMaskImage(null);
  }, []);

  const handleUndo = useCallback(() => {
    if (canvasActions?.undo) {
      canvasActions.undo();
    }
  }, [canvasActions]);

  const handleRedo = useCallback(() => {
    if (canvasActions?.redo) {
      canvasActions.redo();
    }
  }, [canvasActions]);

  const handleClear = useCallback(() => {
    if (canvasActions?.clear) {
      canvasActions.clear();
    }
  }, [canvasActions]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage || !maskImage || !prompt.trim() || disabled || isLoading) {
      return;
    }
    
    onEditSubmit(originalImage, maskImage, prompt.trim());
  }, [originalImage, maskImage, prompt, disabled, isLoading, onEditSubmit]);

  const handleExampleClick = useCallback((examplePrompt: string) => {
    setPrompt(examplePrompt);
    setShowExamples(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || isLoading) return;
      
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with input fields
      }
      
      if (e.key === 'b' || e.key === 'B') {
        setDrawingSettings(prev => ({ ...prev, tool: 'brush' }));
        e.preventDefault();
      } else if (e.key === 'e' || e.key === 'E') {
        setDrawingSettings(prev => ({ ...prev, tool: 'eraser' }));
        e.preventDefault();
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          handleUndo();
          e.preventDefault();
        } else if (e.key === 'y') {
          handleRedo();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isLoading, handleUndo, handleRedo]);

  const canSubmit = originalImage && maskImage && prompt.trim() && !disabled && !isLoading;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-800/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
              🎨 Photoshop-Style Precise Editing
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Upload an image, draw on areas you want to edit, then describe the changes. AI will apply edits only to the drawn areas.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Image Upload & Drawing */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">1. Upload & Draw</h3>
          
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
                    {isDragActive ? 'Drop image here' : 'Upload image to start'}
                  </p>
                  <p className="text-sm opacity-75">
                    Drag & drop or click to select an image
                  </p>
                  <p className="text-xs opacity-50 mt-2">
                    Supports JPG, PNG, GIF, WebP
                  </p>
                </div>
              )}
            </div>
          ) : (
            <DrawingCanvas
              imageUrl={originalImage}
              settings={drawingSettings}
              onMaskGenerated={handleMaskGenerated}
              onCanvasReady={handleCanvasReady}
              onCanvasClear={handleCanvasClear}
              onUndo={handleUndo}
              onRedo={handleRedo}
              className="w-full"
            />
          )}
          
          {originalImage && (
            <div className="flex gap-2">
              <button
                onClick={() => setOriginalImage(null)}
                className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Upload Different Image
              </button>
            </div>
          )}
        </div>
        
        {/* Right: Drawing Tools */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Drawing Tools</h3>
          
          {originalImage ? (
            <DrawingToolbar
              settings={drawingSettings}
              onSettingsChange={setDrawingSettings}
              onClear={handleClear}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          ) : (
            <div className="p-6 bg-muted/50 border border-border rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Upload an image first to access drawing tools
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Prompt Input Section */}
      {originalImage && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Describe Your Edit</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to change in the drawn areas..."
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
                {isLoading ? 'Processing (up to 5 min)...' : 'Edit Selected Areas'}
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
              <h4 className="text-sm font-medium text-muted-foreground">Example edits for selected areas:</h4>
              <div className="grid gap-2">
                {PHOTOSHOP_PROMPTS.map((examplePrompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(examplePrompt)}
                    className="text-left p-3 bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                    disabled={disabled || isLoading}
                  >
                    &quot;{examplePrompt}&quot;
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
              <div className={`w-2 h-2 rounded-full ${maskImage ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={maskImage ? 'text-green-600' : 'text-muted-foreground'}>
                Areas marked
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${prompt.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={prompt.trim() ? 'text-green-600' : 'text-muted-foreground'}>
                Prompt entered
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}