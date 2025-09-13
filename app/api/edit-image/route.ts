import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { withRetry } from '@/utils/retryUtils';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, imageUrls, prompt, mode } = await request.json();

    // Support both old single image format and new multi-image format
    const images = imageUrls || (imageUrl ? [imageUrl] : []);

    if (images.length === 0 || !prompt) {
      return NextResponse.json(
        { error: 'At least one image URL and prompt are required' },
        { status: 400 }
      );
    }

    const falApiKey = process.env.FAL_KEY;
    if (!falApiKey || falApiKey === 'your_fal_api_key_here') {
      return NextResponse.json(
        { 
          error: 'FAL API key not configured. Please sign up at https://fal.ai to get your API key and add it to .env.local',
          needsSetup: true
        },
        { status: 401 }
      );
    }

    fal.config({
      credentials: falApiKey,
    });

    console.log(`🖼️ Starting image editing: ${mode} mode, ${images.length} input image(s)`);
    console.log(`📝 Prompt being sent to API:`, prompt);

    const result = await withRetry(async () => {
      return await fal.subscribe('fal-ai/nano-banana/edit', {
        input: {
          prompt: prompt,
          image_urls: images,
          num_images: 1,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            let logMessage = 'Processing image...';
            if (mode === 'multi') logMessage = 'Merging images...';
            else if (mode === 'timetravel') logMessage = 'Generating time progression stage...';
            else if (mode === 'photoshop') logMessage = 'Processing masked areas...';
            
            console.log(logMessage, update.logs?.map(log => log.message).join('\n'));
          }
        },
      });
    }, {
      maxRetries: 2, // Fewer retries due to longer processing
      baseDelay: 2000,
      timeout: 300000 // 5 minutes for image editing
    });

    if (!result.data || !result.data.images || result.data.images.length === 0) {
      return NextResponse.json(
        { error: 'No images generated' },
        { status: 500 }
      );
    }

    const description = result.data.description || 
      (mode === 'multi' ? 'Images merged successfully' : 
       mode === 'timetravel' ? 'Time progression stage generated' :
       'Image edited successfully');

    return NextResponse.json({
      imageUrl: result.data.images[0].url,
      description: description,
    });

  } catch (error) {
    console.error('🚨 Image editing API Error:', error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          error: 'Invalid FAL API key. Please check your API key at https://fal.ai',
          needsSetup: true
        },
        { status: 401 }
      );
    }
    
    // Handle connection timeout errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('connect timeout') || message.includes('fetch failed') || message.includes('connection')) {
        return NextResponse.json(
          { 
            error: 'Connection to fal.ai failed. Please check your internet connection and try again. If the problem persists, it might be a temporary service issue.',
            isNetworkError: true
          },
          { status: 503 } // Service Unavailable
        );
      }
      
      if (message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Image processing timed out. The service might be experiencing high demand. Please try again in a few minutes.',
            isTimeoutError: true
          },
          { status: 408 } // Request Timeout
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to process image. Please try again later.' },
      { status: 500 }
    );
  }
}