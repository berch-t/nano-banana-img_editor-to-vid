'use client';

import { DrawingTool } from './DrawingCanvas';

interface DrawingSettings {
  tool: DrawingTool;
  brushSize: number;
  opacity: number;
}

interface DrawingToolbarProps {
  settings: DrawingSettings;
  onSettingsChange: (settings: DrawingSettings) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview?: () => void;
  showPreview?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function DrawingToolbar({
  settings,
  onSettingsChange,
  onClear,
  onUndo,
  onRedo,
  onTogglePreview,
  showPreview = false,
  canUndo = false,
  canRedo = false
}: DrawingToolbarProps) {
  const updateSetting = <K extends keyof DrawingSettings>(
    key: K,
    value: DrawingSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Drawing Tools</h3>
        <div className="flex gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Tool
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => updateSetting('tool', 'brush')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${settings.tool === 'brush'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Brush
          </button>
          <button
            onClick={() => updateSetting('tool', 'eraser')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${settings.tool === 'eraser'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eraser
          </button>
        </div>
      </div>

      {/* Brush Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Brush Size
          </label>
          <span className="text-xs text-muted-foreground">{settings.brushSize}px</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">5</span>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={settings.brushSize}
            onChange={(e) => updateSetting('brushSize', parseInt(e.target.value))}
            className="flex-1 h-2 bg-input rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-muted-foreground">100</span>
        </div>
        
        {/* Brush preview */}
        <div className="flex items-center justify-center p-2">
          <div
            className="bg-primary rounded-full"
            style={{
              width: Math.min(settings.brushSize / 2, 20),
              height: Math.min(settings.brushSize / 2, 20),
              opacity: settings.opacity
            }}
          />
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Opacity
          </label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.opacity * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">10</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={settings.opacity}
            onChange={(e) => updateSetting('opacity', parseFloat(e.target.value))}
            className="flex-1 h-2 bg-input rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-muted-foreground">100</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="flex-1 px-3 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
          
          {onTogglePreview && (
            <button
              onClick={onTogglePreview}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${showPreview
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }
              `}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {showPreview ? 'Hide' : 'Show'} Mask
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Draw on areas you want to edit. White areas will be modified, black areas will remain unchanged.
        </p>
      </div>

      {/* Keyboard shortcuts */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>Brush Tool:</span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">B</kbd>
        </div>
        <div className="flex justify-between">
          <span>Eraser Tool:</span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">E</kbd>
        </div>
        <div className="flex justify-between">
          <span>Undo:</span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd>
        </div>
        <div className="flex justify-between">
          <span>Redo:</span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Y</kbd>
        </div>
      </div>
    </div>
  );
}