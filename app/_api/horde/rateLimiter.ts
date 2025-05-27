// Shared rate limiter for Horde API calls
class RateLimiter {
  private requestTimes: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    // Remove old entries outside the window
    this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
    
    if (this.requestTimes.length >= this.maxRequests) {
      // Wait until the oldest request is outside the window
      const oldestRequest = this.requestTimes[0];
      const waitTime = this.windowMs - (now - oldestRequest) + 10; // +10ms buffer
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      // Recursive call to check again
      return this.waitForSlot();
    }
    
    this.requestTimes.push(now);
  }
}

// Different rate limiters for different endpoint types

// /generate/async endpoint - shares the same limit as /status (10 per minute)
// Using 9 per minute to have a safety buffer
export const generateRateLimiter = new RateLimiter(9, 60000);

// /generate/check endpoint - 1 request per 2 seconds (30 per minute)
// Using 1 per 2.1 seconds for safety buffer
export const checkRateLimiter = new RateLimiter(1, 2100);

// /generate/status endpoint - 10 requests per minute
// Using 9 per minute to have a safety buffer
export const statusRateLimiter = new RateLimiter(9, 60000);