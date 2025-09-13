interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
}

export class RetryableError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'RetryableError';
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 8000,
    timeout = 30000
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout wrapper
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        )
      ]);
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if error should be retried
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.1 * delay; // 10% jitter
      const finalDelay = delay + jitter;
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1} in ${Math.round(finalDelay)}ms due to:`, 
        error instanceof Error ? error.message : String(error));
      
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof RetryableError) {
    return true;
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network-related errors that should be retried
    const retryablePatterns = [
      'connect timeout',
      'connection timeout',
      'network error',
      'fetch failed',
      'econnreset',
      'enotfound',
      'econnrefused',
      'socket hang up',
      'request timeout',
      'und_err_connect_timeout'
    ];
    
    return retryablePatterns.some(pattern => message.includes(pattern));
  }
  
  return false;
}

export function createConnectionError(originalError: unknown): Error {
  return new Error(
    `Connection to fal.ai failed. This could be due to network issues, firewall restrictions, or temporary service unavailability. Please check your internet connection and try again.`
  );
}