'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import MultiImageUploader from '@/components/MultiImageUploader';
import ModeSelector, { EditingMode } from '@/components/ModeSelector';
import PromptInput from '@/components/PromptInput';
import ImageDisplay from '@/components/ImageDisplay';
import VideoGenerator from '@/components/VideoGenerator';
import VideoDisplay from '@/components/VideoDisplay';
import PhotoshopEditor from '@/components/PhotoshopEditor';
import TimeTravelEditor from '@/components/TimeTravelEditor';
import TimeTravelDisplay from '@/components/TimeTravelDisplay';
import { generateTimeTravelStagesWithLLM } from '@/utils/timeTravelDynamicPrompts';

export default function Home() {
  const [mode, setMode] = useState<EditingMode>('single');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [multipleImages, setMultipleImages] = useState<string[]>([]);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [timeTravelImages, setTimeTravelImages] = useState<Array<{ url: string; stage: string; isLoading?: boolean; error?: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (imageUrl: string) => {
    setOriginalImage(imageUrl);
    setEditedImage(null);
    setError(null);
  };

  const handleMultipleImagesUpload = (images: string[]) => {
    setMultipleImages(images);
    setEditedImage(null);
    setError(null);
  };

  const handleModeChange = (newMode: EditingMode) => {
    setMode(newMode);
    if (newMode !== 'video') {
      setOriginalImage(null);
      setMultipleImages([]);
      setEditedImage(null);
    }
    if (newMode !== 'timetravel') {
      setTimeTravelImages([]);
    }
    setGeneratedVideo(null);
    setError(null);
    setPrompt('');
  };

  const handleVideoGenerated = async (prompt: string, duration: string, cfgScale: number) => {
    if (!editedImage) return;
    
    setIsGeneratingVideo(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: editedImage,
          prompt: prompt.trim(),
          duration,
          cfgScale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsSetup) {
          throw new Error(`🔑 ${data.error}`);
        }
        
        // Handle specific error types with better messaging
        if (data.isNetworkError) {
          throw new Error(`🌐 ${data.error}`);
        }
        
        if (data.isTimeoutError) {
          throw new Error(`⏱️ ${data.error}`);
        }
        
        throw new Error(data.error || 'Failed to generate video');
      }

      setGeneratedVideo(data.videoUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while generating video';
      setError(errorMessage);
      console.error('Error generating video:', error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handlePhotoshopEdit = async (originalImage: string, maskImage: string, prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: [originalImage, maskImage], // Send both original and mask
          prompt: `Edit only the masked areas: ${prompt}`,
          mode: 'photoshop',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsSetup) {
          throw new Error(`🔑 ${data.error}`);
        }
        
        // Handle specific error types with better messaging
        if (data.isNetworkError) {
          throw new Error(`🌐 ${data.error}`);
        }
        
        if (data.isTimeoutError) {
          throw new Error(`⏱️ ${data.error}`);
        }
        
        throw new Error(data.error || 'Failed to edit image');
      }

      setEditedImage(data.imageUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error editing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeTravelSubmit = async (originalImage: string, prompt: string, numImages: number) => {
    setIsLoading(true);
    setError(null);
    setTimeTravelImages([]);
    
    try {
      // Generate dynamic stage-specific prompts using LLM
      const stages = await generateTimeTravelStagesWithLLM(prompt, numImages);
      
      console.log('Generated stages:', stages);
      
      // Initialize placeholder images for loading states
      const placeholderImages = stages.map(stage => ({
        url: '',
        stage: stage.stage,
        isLoading: true
      }));
      setTimeTravelImages(placeholderImages);
      
      // Create API calls for each stage
      const apiCalls = stages.map(async (stage, index) => {
        console.log(`🚀 Stage ${index + 1} (${stage.stage}):`, stage.prompt);
        try {
          const response = await fetch('/api/edit-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrls: [originalImage],
              prompt: stage.prompt,
              mode: 'timetravel',
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Failed to generate stage ${index + 1}`);
          }

          return {
            url: data.imageUrl,
            stage: stage.stage,
            stageNumber: stage.stageNumber,
            isLoading: false
          };
        } catch (error) {
          console.error(`Error generating stage ${index + 1}:`, error);
          return {
            url: '',
            stage: stage.stage,
            stageNumber: stage.stageNumber,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to generate'
          };
        }
      });

      // Execute all API calls in parallel
      const results = await Promise.all(apiCalls);
      
      // Check for any errors
      const hasErrors = results.some(result => 'error' in result);
      if (hasErrors) {
        const errorMessages = results
          .filter(result => 'error' in result)
          .map(result => `Stage ${result.stageNumber}: ${'error' in result ? result.error : 'Unknown error'}`)
          .join(', ');
        throw new Error(`Some stages failed to generate: ${errorMessages}`);
      }

      // Filter out any failed results and update state
      const successfulResults = results.filter(result => result.url && !('error' in result));
      setTimeTravelImages(successfulResults);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error generating time progression:', error);
      setTimeTravelImages([]); // Clear loading states on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = async () => {
    const hasImages = mode === 'single' 
      ? originalImage && prompt
      : multipleImages.length > 0 && prompt;
    
    if (!hasImages) return;

    setIsLoading(true);
    setError(null);
    try {
      const imageUrls = mode === 'single' ? [originalImage!] : multipleImages;
      
      const response = await fetch('/api/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: imageUrls,
          prompt: prompt,
          mode: mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's an API setup error
        if (data.needsSetup) {
          throw new Error(`🔑 ${data.error}`);
        }
        
        // Handle specific error types with better messaging
        if (data.isNetworkError) {
          throw new Error(`🌐 ${data.error}`);
        }
        
        if (data.isTimeoutError) {
          throw new Error(`⏱️ ${data.error}`);
        }
        
        throw new Error(data.error || 'Failed to edit image');
      }

      setEditedImage(data.imageUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error editing image:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          Nano Banana - AI Image Editor & Video Generator
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {mode === 'single' 
            ? 'Transform your images with Google\'s Nano Banana model using natural language prompts'
            : mode === 'multi'
            ? 'Merge and combine multiple images seamlessly with Google\'s Nano Banana AI'
            : mode === 'photoshop'
            ? 'Precisely edit specific areas by drawing on your image with professional AI-powered tools'
            : mode === 'timetravel'
            ? 'Generate multiple versions showing your image evolving through time - perfect for historical progressions, aging, or style evolution'
            : 'Bring your edited images to life with Kling 2.1 Pro video generation'
          }
        </p>
        
        <ModeSelector mode={mode} onModeChange={handleModeChange} />
        
        <div className="max-w-7xl mx-auto">
          {mode === 'single' ? (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Original Image</h2>
                  <ImageUploader onImageUpload={handleImageUpload} />
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Edited Image</h2>
                  <ImageDisplay 
                    imageUrl={editedImage}
                    isLoading={isLoading}
                    placeholder="Your edited image will appear here"
                  />
                </div>
              </div>
            </div>
          ) : mode === 'multi' ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Input Images</h2>
                <MultiImageUploader onImagesUpload={handleMultipleImagesUpload} />
              </div>
              
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">Result</h2>
                <ImageDisplay 
                  imageUrl={editedImage}
                  isLoading={isLoading}
                  placeholder="Your merged image will appear here"
                />
              </div>
            </div>
          ) : mode === 'photoshop' ? (
            <div className="space-y-8">
              <PhotoshopEditor 
                onEditSubmit={handlePhotoshopEdit}
                isLoading={isLoading}
                disabled={isLoading}
              />
              
              {editedImage && (
                <div className="max-w-md mx-auto">
                  <h2 className="text-xl font-semibold mb-4">Edited Result</h2>
                  <ImageDisplay 
                    imageUrl={editedImage}
                    isLoading={isLoading}
                    placeholder="Your precisely edited image will appear here"
                  />
                </div>
              )}
            </div>
          ) : mode === 'timetravel' ? (
            <div className="space-y-8">
              <TimeTravelEditor 
                onTimeTravelSubmit={handleTimeTravelSubmit}
                isLoading={isLoading}
                disabled={isLoading}
              />
              
              {timeTravelImages.length > 0 && (
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xl font-semibold mb-4">Time Progression Results</h2>
                  <TimeTravelDisplay 
                    images={timeTravelImages}
                    isLoading={isLoading}
                    placeholder="Your time progression will appear here"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Source Image</h2>
                  <ImageDisplay 
                    imageUrl={editedImage}
                    isLoading={false}
                    placeholder="Complete image editing first to generate a video"
                  />
                  {editedImage && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ✨ Ready for video generation! Use the controls to animate this image.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Generated Video</h2>
                  <VideoDisplay 
                    videoUrl={generatedVideo}
                    isLoading={isGeneratingVideo}
                    placeholder="Generated video will appear here"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive font-medium">{error}</p>
              
              {error.includes('🔑') && (
                <div className="mt-3 p-3 bg-card/50 rounded border">
                  <p className="text-sm font-medium mb-2">🔧 API Setup Required:</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>Visit <a href="https://fal.ai" target="_blank" className="text-primary hover:underline">fal.ai</a> and create an account</li>
                    <li>Go to your dashboard to get your API key</li>
                    <li>Add <code className="bg-muted px-1 py-0.5 rounded">FAL_KEY=your_actual_key_here</code> to your .env.local file</li>
                    <li>Restart the dev server</li>
                  </ol>
                </div>
              )}
              
              {error.includes('🌐') && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded dark:bg-blue-950/20 dark:border-blue-800/30">
                  <p className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-200">🔍 Connection Troubleshooting:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-blue-700 dark:text-blue-300">
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page and retrying</li>
                    <li>If on corporate network, check firewall settings</li>
                    <li>Visit <a href="/api/health" target="_blank" className="text-primary hover:underline">health check</a> for detailed diagnostics</li>
                  </ul>
                </div>
              )}
              
              {error.includes('⏱️') && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded dark:bg-amber-950/20 dark:border-amber-800/30">
                  <p className="text-sm font-medium mb-2 text-amber-800 dark:text-amber-200">💡 Timeout Solutions:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-amber-700 dark:text-amber-300">
                    <li>The service may be experiencing high demand</li>
                    <li>Try again in a few minutes</li>
                    <li>For video generation, try a simpler prompt</li>
                    <li>Check service status at <a href="https://status.fal.ai" target="_blank" className="text-primary hover:underline">status.fal.ai</a></li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {mode === 'video' ? (
            editedImage ? (
              <VideoGenerator 
                onVideoGenerated={handleVideoGenerated}
                isGenerating={isGeneratingVideo}
                disabled={isGeneratingVideo}
              />
            ) : (
              <div className="text-center p-8 bg-card border border-border rounded-lg">
                <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">No Source Image Available</h3>
                <p className="text-muted-foreground mb-4">
                  Switch to Single Image or Multi-Image mode first to create or edit an image, then return here to generate a video.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setMode('single')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Single Image Mode
                  </button>
                  <button
                    onClick={() => setMode('multi')}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Multi-Image Mode
                  </button>
                </div>
              </div>
            )
          ) : mode !== 'photoshop' && mode !== 'timetravel' ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-800/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                      ⏰ Processing takes up to 5 minutes
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Image editing requires significant AI processing time. Please be patient after clicking submit.
                    </p>
                  </div>
                </div>
              </div>
              
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleEditImage}
                disabled={mode === 'single' ? (!originalImage || isLoading) : (multipleImages.length === 0 || isLoading)}
                isLoading={isLoading}
                mode={mode}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
