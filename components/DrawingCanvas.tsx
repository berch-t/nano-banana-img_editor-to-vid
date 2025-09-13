'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export type DrawingTool = 'brush' | 'eraser';

interface DrawingSettings {
  tool: DrawingTool;
  brushSize: number;
  opacity: number;
}

interface DrawingCanvasProps {
  imageUrl: string;
  settings: DrawingSettings;
  onMaskGenerated: (maskUrl: string) => void;
  onCanvasReady?: (actions: { clear: () => void; undo: () => void; redo: () => void }) => void;
  onCanvasClear?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  className?: string;
}

interface DrawingState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
  history: ImageData[];
  historyIndex: number;
}

export default function DrawingCanvas({
  imageUrl,
  settings,
  onMaskGenerated,
  onCanvasReady,
  onCanvasClear,
  onUndo,
  onRedo,
  className = ''
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    history: [],
    historyIndex: -1
  });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Initialize canvas and load image
  useEffect(() => {
    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    
    if (!canvas || !backgroundCanvas || !drawingCanvas || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Calculate canvas size to fit the container while maintaining aspect ratio
      const containerWidth = 512;
      const containerHeight = 384;
      
      const aspectRatio = img.width / img.height;
      let canvasWidth, canvasHeight;
      
      if (aspectRatio > containerWidth / containerHeight) {
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / aspectRatio;
      } else {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * aspectRatio;
      }
      
      // Set all canvas dimensions
      [canvas, backgroundCanvas, drawingCanvas].forEach(c => {
        c.width = canvasWidth;
        c.height = canvasHeight;
        c.style.width = `${canvasWidth}px`;
        c.style.height = `${canvasHeight}px`;
      });
      
      setCanvasSize({ width: canvasWidth, height: canvasHeight });
      
      // Draw background image
      const backgroundCtx = backgroundCanvas.getContext('2d');
      if (backgroundCtx) {
        backgroundCtx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      }
      
      // Setup drawing canvas
      const drawingCtx = drawingCanvas.getContext('2d');
      if (drawingCtx) {
        drawingCtx.lineCap = 'round';
        drawingCtx.lineJoin = 'round';
        drawingCtx.imageSmoothingEnabled = true;
      }
      
      setImageLoaded(true);
      
      // Initial empty history entry
      const historyCtx = drawingCanvas.getContext('2d');
      if (historyCtx) {
        const imageData = historyCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
        setDrawingState(prev => ({
          ...prev,
          history: [imageData],
          historyIndex: 0
        }));
      }
    };
    
    img.src = imageUrl;
  }, [imageUrl]);

  // Composite canvases for display
  useEffect(() => {
    if (!imageLoaded) return;
    
    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    
    if (!canvas || !backgroundCanvas || !drawingCanvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear and composite
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundCanvas, 0, 0);
    
    // Draw the mask overlay with reduced opacity for preview
    ctx.globalAlpha = 0.6;
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(drawingCanvas, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, [drawingState, imageLoaded]);

  const saveToHistory = useCallback(() => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    setDrawingState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(imageData);
      
      // Limit history to prevent memory issues
      if (newHistory.length > 20) {
        newHistory.shift();
      }
      
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!imageLoaded) return;
    
    const coords = getCanvasCoordinates(e);
    setDrawingState(prev => ({
      ...prev,
      isDrawing: true,
      lastX: coords.x,
      lastY: coords.y
    }));
  }, [getCanvasCoordinates, imageLoaded]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawingState.isDrawing || !imageLoaded) return;
    
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;
    
    const coords = getCanvasCoordinates(e);
    
    // Configure brush
    ctx.lineWidth = settings.brushSize;
    ctx.globalAlpha = settings.opacity;
    
    if (settings.tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(255, 255, 255, ${settings.opacity})`;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(drawingState.lastX, drawingState.lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    setDrawingState(prev => ({
      ...prev,
      lastX: coords.x,
      lastY: coords.y
    }));
  }, [drawingState.isDrawing, drawingState.lastX, drawingState.lastY, settings, getCanvasCoordinates, imageLoaded]);

  const stopDrawing = useCallback(() => {
    if (!drawingState.isDrawing) return;
    
    setDrawingState(prev => ({ ...prev, isDrawing: false }));
    saveToHistory();
    generateMask();
  }, [drawingState.isDrawing, saveToHistory]);

  const generateMask = useCallback(() => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    
    // Create mask (pure black and white)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = drawingCanvas.width;
    maskCanvas.height = drawingCanvas.height;
    
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    
    // Fill with black (no editing)
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Draw white where user drew (editing areas)
    maskCtx.globalCompositeOperation = 'source-over';
    maskCtx.drawImage(drawingCanvas, 0, 0);
    
    const maskUrl = maskCanvas.toDataURL('image/png');
    onMaskGenerated(maskUrl);
  }, [onMaskGenerated]);

  const clearCanvas = useCallback(() => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    // Save to history
    const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    setDrawingState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(imageData);
      
      if (newHistory.length > 20) {
        newHistory.shift();
      }
      
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
    
    // Generate empty mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = drawingCanvas.width;
    maskCanvas.height = drawingCanvas.height;
    
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      const maskUrl = maskCanvas.toDataURL('image/png');
      onMaskGenerated(maskUrl);
    }
    
    onCanvasClear?.();
  }, [onMaskGenerated, onCanvasClear]);

  const undo = useCallback(() => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;
    
    setDrawingState(prev => {
      if (prev.historyIndex <= 0) return prev;
      
      const newIndex = prev.historyIndex - 1;
      const imageData = prev.history[newIndex];
      
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
        
        // Generate mask inline
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = drawingCanvas.width;
        maskCanvas.height = drawingCanvas.height;
        
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          maskCtx.fillStyle = 'black';
          maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
          maskCtx.globalCompositeOperation = 'source-over';
          maskCtx.drawImage(drawingCanvas, 0, 0);
          
          const maskUrl = maskCanvas.toDataURL('image/png');
          onMaskGenerated(maskUrl);
        }
      }
      
      return { ...prev, historyIndex: newIndex };
    });
    
    onUndo?.();
  }, [onMaskGenerated, onUndo]);

  const redo = useCallback(() => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;
    
    setDrawingState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      
      const newIndex = prev.historyIndex + 1;
      const imageData = prev.history[newIndex];
      
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
        
        // Generate mask inline
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = drawingCanvas.width;
        maskCanvas.height = drawingCanvas.height;
        
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          maskCtx.fillStyle = 'black';
          maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
          maskCtx.globalCompositeOperation = 'source-over';
          maskCtx.drawImage(drawingCanvas, 0, 0);
          
          const maskUrl = maskCanvas.toDataURL('image/png');
          onMaskGenerated(maskUrl);
        }
      }
      
      return { ...prev, historyIndex: newIndex };
    });
    
    onRedo?.();
  }, [onMaskGenerated, onRedo]);

  // Expose methods to parent
  useEffect(() => {
    if (imageLoaded && onCanvasReady) {
      onCanvasReady({
        clear: clearCanvas,
        undo: undo,
        redo: redo
      });
    }
  }, [imageLoaded, onCanvasReady]);

  return (
    <div className={`relative border border-border rounded-lg overflow-hidden ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading image...</p>
          </div>
        </div>
      )}
      
      {/* Hidden canvases for layers */}
      <canvas
        ref={backgroundCanvasRef}
        style={{ display: 'none' }}
      />
      <canvas
        ref={drawingCanvasRef}
        style={{ display: 'none' }}
      />
      
      {/* Main display canvas */}
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair touch-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          cursor: settings.tool === 'brush' ? 'crosshair' : 'grab'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {/* Brush cursor preview */}
      <style jsx>{`
        .cursor-brush {
          cursor: crosshair;
        }
      `}</style>
    </div>
  );
}