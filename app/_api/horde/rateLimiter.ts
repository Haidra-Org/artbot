// Shared rate limiter for all Horde API calls
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

// Global rate limiter shared across all API endpoints
// API limit is "10 per 1 minute"
// Using 9 per minute to have a safety buffer
export const hordeRateLimiter = new RateLimiter(9, 60000);