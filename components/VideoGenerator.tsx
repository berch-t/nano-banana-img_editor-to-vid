'use client';

import { useState } from 'react';

interface VideoGeneratorProps {
  onVideoGenerated: (prompt: string, duration: string, cfgScale: number) => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

const VIDEO_PROMPTS = [
  "gentle camera movement revealing the scene",
  "slow zoom in with natural lighting changes",
  "subtle parallax effect bringing depth to life",
  "cinematic reveal with atmospheric effects",
  "smooth pan across the landscape",
  "dynamic lighting changes throughout the scene"
];

export default function VideoGenerator({ 
  onVideoGenerated, 
  isGenerating = false, 
  disabled = false 
}: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<'5' | '10'>('5');
  const [cfgScale, setCfgScale] = useState(0.5);
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || disabled || isGenerating) return;

    // Call parent component to start generating
    onVideoGenerated(prompt.trim(), duration, cfgScale);
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setShowExamples(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-800/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-sm">
            <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
              ⏳ Video generation takes 3-5 minutes
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Please be patient while Kling 2.1 Pro creates your high-quality animated video. The process cannot be cancelled once started.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Video Generation Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the motion, camera movement, or animation you want..."
            className="w-full p-4 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground min-h-[120px]"
            disabled={disabled || isGenerating}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as '5' | '10')}
              className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              disabled={disabled || isGenerating}
            >
              <option value="5">5 seconds</option>
              <option value="10">10 seconds</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Guidance Scale: {cfgScale}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={cfgScale}
              onChange={(e) => setCfgScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer slider"
              disabled={disabled || isGenerating}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Creative</span>
              <span>Precise</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={disabled || !prompt.trim() || isGenerating}
            className={`
              flex-1 px-6 py-3 rounded-lg font-medium transition-colors
              ${disabled || !prompt.trim() || isGenerating
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }
            `}
          >
{isGenerating ? 'Generating Video (3-5 min)...' : 'Generate Video (3-5 min)'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="px-6 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg font-medium transition-colors"
            disabled={disabled || isGenerating}
          >
            {showExamples ? 'Hide Examples' : 'Show Examples'}
          </button>
        </div>
      </form>

      {showExamples && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Example prompts:</h3>
          <div className="grid gap-2">
            {VIDEO_PROMPTS.map((examplePrompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(examplePrompt)}
                className="text-left p-3 bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                disabled={disabled || isGenerating}
              >
&quot;{examplePrompt}&quot;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}