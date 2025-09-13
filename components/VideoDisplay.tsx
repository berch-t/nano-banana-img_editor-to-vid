'use client';

interface VideoDisplayProps {
  videoUrl: string | null;
  isLoading?: boolean;
  placeholder?: string;
}

export default function VideoDisplay({ videoUrl, isLoading = false, placeholder = "Generated video will appear here" }: VideoDisplayProps) {
  const handleDownload = () => {
    if (!videoUrl) return;
    
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `animated-video-${Date.now()}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="relative w-full aspect-video bg-card border border-border rounded-lg flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-foreground mb-2">Generating video with Kling 2.1...</p>
        <p className="text-xs text-muted-foreground text-center max-w-sm mb-3">
          🕐 <strong>This process takes 3-5 minutes.</strong> Please be patient while we create your high-quality video.
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Don&apos;t close this tab - your video will appear automatically when ready.
        </p>
        <div className="mt-4 w-full max-w-xs bg-input rounded-full h-3">
          <div className="bg-gradient-to-r from-primary to-primary/60 h-3 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="relative w-full aspect-video bg-card border border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm font-medium mb-1">{placeholder}</p>
        <p className="text-xs opacity-75 text-center max-w-sm">
          Upload and edit an image first, then generate a video to bring it to life
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-card border border-border rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-full object-contain"
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          className="px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Video
        </button>
      </div>
    </div>
  );
}