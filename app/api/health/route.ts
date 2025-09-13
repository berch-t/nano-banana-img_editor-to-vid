import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Basic health status
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
    
    // Check API key configuration
    const falApiKey = process.env.FAL_KEY;
    const apiKeyStatus = {
      configured: !!(falApiKey && falApiKey !== 'your_fal_api_key_here'),
      keyPreview: falApiKey ? `${falApiKey.substring(0, 8)}...` : 'not-set'
    };
    
    // Test network connectivity to fal.ai
    let networkStatus: { accessible: boolean; responseTime: number | null; error: string | null } = { 
      accessible: false, 
      responseTime: null, 
      error: null 
    };
    
    try {
      const networkStartTime = Date.now();
      const response = await fetch('https://fal.run/health', {
        method: 'GET',
        signal: AbortSignal.timeout(10000), // 10 second timeout
        headers: {
          'User-Agent': 'nano-banana-health-check'
        }
      });
      
      const responseTime = Date.now() - networkStartTime;
      networkStatus = {
        accessible: response.ok,
        responseTime,
        error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
      };
    } catch (error) {
      networkStatus = {
        accessible: false,
        responseTime: null,
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
    
    // Determine overall status
    const overallStatus = 
      apiKeyStatus.configured && networkStatus.accessible 
        ? 'healthy' 
        : apiKeyStatus.configured 
          ? 'degraded' 
          : 'unhealthy';
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: overallStatus,
      responseTime,
      checks: {
        basic: health,
        apiKey: apiKeyStatus,
        network: networkStatus
      },
      recommendations: generateRecommendations(apiKeyStatus, networkStatus)
    }, {
      status: overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 206 : 503
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'error',
      responseTime,
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}

function generateRecommendations(
  apiKeyStatus: { configured: boolean; keyPreview: string }, 
  networkStatus: { accessible: boolean; responseTime: number | null; error: string | null }
): string[] {
  const recommendations: string[] = [];
  
  if (!apiKeyStatus.configured) {
    recommendations.push(
      'Configure your FAL_KEY environment variable. Get your API key from https://fal.ai'
    );
  }
  
  if (!networkStatus.accessible) {
    if (networkStatus.error?.includes('timeout')) {
      recommendations.push(
        'Network connection to fal.ai is slow. Check your internet connection or try again later.'
      );
    } else if (networkStatus.error?.includes('blocked') || networkStatus.error?.includes('refused')) {
      recommendations.push(
        'Connection to fal.ai is blocked. Check firewall settings or corporate network policies.'
      );
    } else {
      recommendations.push(
        'Cannot reach fal.ai servers. Check your internet connection and DNS settings.'
      );
    }
  }
  
  if (networkStatus.responseTime && networkStatus.responseTime > 5000) {
    recommendations.push(
      'Slow network connection detected. Consider checking your internet speed or trying again later.'
    );
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All systems operational! 🚀');
  }
  
  return recommendations;
}