'use client';

export type EditingMode = 'single' | 'multi' | 'photoshop' | 'timetravel' | 'video';

interface ModeSelectorProps {
  mode: EditingMode;
  onModeChange: (mode: EditingMode) => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="bg-card border border-border rounded-lg p-1 flex flex-wrap sm:flex-nowrap gap-1 sm:gap-0">
        <button
          onClick={() => onModeChange('single')}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm
            ${mode === 'single'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Single Image
          </div>
        </button>
        
        <button
          onClick={() => onModeChange('multi')}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm
            ${mode === 'multi'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Multi-Image
          </div>
        </button>
        
        <button
          onClick={() => onModeChange('photoshop')}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm
            ${mode === 'photoshop'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Photoshop Edit
          </div>
        </button>
        
        <button
          onClick={() => onModeChange('timetravel')}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm
            ${mode === 'timetravel'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            TimeTravel
          </div>
        </button>
        
        <button
          onClick={() => onModeChange('video')}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm
            ${mode === 'video'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video Generation
          </div>
        </button>
      </div>
    </div>
  );
}