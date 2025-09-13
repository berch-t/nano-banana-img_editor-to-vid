'use client';

import { useState } from 'react';
import { EditingMode } from './ModeSelector';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  mode?: EditingMode;
}

const SINGLE_IMAGE_PROMPTS = [
  "make the photo more vibrant and colorful",
  "turn this into a vintage film photo",
  "add a beautiful sunset in the background",
  "make it look like a professional portrait",
  "convert to black and white with high contrast",
  "add magical sparkles and glowing effects"
];

const MULTI_IMAGE_PROMPTS = [
  "merge these images naturally together",
  "add the product from the second image to the first image",
  "combine both images into a realistic scene",
  "place the object on the background seamlessly",
  "blend these images to create a cohesive composition",
  "integrate the subject from image 2 into the scene from image 1"
];

export default function PromptInput({ value, onChange, onSubmit, disabled, isLoading = false, mode = 'single' }: PromptInputProps) {
  const [showExamples, setShowExamples] = useState(false);

  const examplePrompts = mode === 'single' ? SINGLE_IMAGE_PROMPTS : MULTI_IMAGE_PROMPTS;
  const placeholderText = mode === 'single' 
    ? "Describe how you want to edit your image..."
    : "Describe how you want to merge or combine your images...";
  const buttonText = mode === 'single' ? 'Edit Image' : 'Merge Images';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && value.trim()) {
      onSubmit();
    }
  };

  const handleExampleClick = (prompt: string) => {
    onChange(prompt);
    setShowExamples(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholderText}
            className="w-full p-4 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground min-h-[120px]"
            disabled={disabled}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className={`
              flex-1 px-6 py-3 rounded-lg font-medium transition-colors
              ${disabled || !value.trim()
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }
            `}
          >
{isLoading ? (mode === 'multi' ? 'Merging (up to 5 min)...' : 'Processing (up to 5 min)...') : buttonText}
          </button>
          
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="px-6 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg font-medium transition-colors"
          >
            {showExamples ? 'Hide Examples' : 'Show Examples'}
          </button>
        </div>
      </form>

      {showExamples && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Example prompts:</h3>
          <div className="grid gap-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(prompt)}
                className="text-left p-3 bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                disabled={disabled}
              >
&quot;{prompt}&quot;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}