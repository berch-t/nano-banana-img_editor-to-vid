import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { withRetry } from '@/utils/retryUtils';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { imageUrl, prompt, duration = '5', cfgScale = 0.5 } = await request.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Image URL and prompt are required' },
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

    console.log('🎬 Starting video generation with Kling 2.1:', {
      imageUrl: imageUrl.substring(0, 50) + '...',
      prompt,
      duration,
      cfgScale,
      timestamp: new Date().toISOString()
    });

    const result = await withRetry(async () => {
      return await fal.subscribe('fal-ai/kling-video/v2.1/pro/image-to-video', {
        input: {
          prompt: prompt,
          image_url: imageUrl,
          duration: duration,
          cfg_scale: cfgScale,
          negative_prompt: "blur, distort, and low quality"
        },
        logs: true,
        onQueueUpdate: (update) => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`⏱️ Video generation [${elapsed}s]: ${update.status}`);
          
          if (update.status === 'IN_PROGRESS' && update.logs?.length) {
            const latestLogs = update.logs.slice(-3); // Show last 3 logs
            console.log('📝 Latest progress:', latestLogs.map(log => log.message).join(' | '));
          }
          
          if (update.status === 'IN_QUEUE') {
            console.log('🔄 Video request queued, waiting for processing...');
          }
        },
      });
    }, {
      maxRetries: 1, // Only 1 retry for video due to very long processing time
      baseDelay: 5000,
      timeout: 420000 // 7 minutes for video generation with buffer
    });

    if (!result.data || !result.data.video) {
      return NextResponse.json(
        { error: 'No video generated' },
        { status: 500 }
      );
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Video generated successfully in ${totalTime}s:`, result.data.video.url);

    return NextResponse.json({
      videoUrl: result.data.video.url,
      generationTime: totalTime,
    });

  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ Video generation failed after ${elapsed}s:`, error);
    
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
            error: 'Connection to fal.ai failed during video generation. Please check your internet connection and try again. If the problem persists, it might be a temporary service issue.',
            isNetworkError: true
          },
          { status: 503 } // Service Unavailable
        );
      }
      
      if (message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Video generation timed out. This can happen during high demand or with complex scenes. Please try with a simpler prompt or try again later.',
            isTimeoutError: true
          },
          { status: 408 } // Request Timeout
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate video. Please try again later.' },
      { status: 500 }
    );
  }
}