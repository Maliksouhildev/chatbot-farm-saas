/**
 * Outbound Rate Limiting & Human-Cadence Queue Utility (F4)
 * Compliant with Milestone 1 Anti-Ban Security Architecture.
 *
 * Enforces:
 * 1. Token-Bucket Rate Limiter:
 *    - Capacity: 3 tokens per contact thread / channel (burst max 3)
 *    - Refill Rate: 1 token every 1,500ms
 *    - Minimum Interval Between Consecutive Messages: >= 1,200ms
 * 2. Human Typing Cadence Simulation:
 *    - Typing duration: min(3,500ms, max(1,200ms, length * 40ms + jitter[200-500ms]))
 */

export interface TokenBucketConfig {
  capacity: number;       // Max tokens in bucket (default: 3)
  refillIntervalMs: number; // Time to restore 1 token (default: 1500ms)
  minSpacingMs: number;    // Minimum wait between consecutive dispatches (default: 1200ms)
}

export interface BucketState {
  tokens: number;
  lastRefillTime: number;
  lastDispatchTime: number;
}

export class TokenBucketRateLimiter {
  private buckets = new Map<string, BucketState>();
  private readonly config: TokenBucketConfig;

  constructor(config?: Partial<TokenBucketConfig>) {
    this.config = {
      capacity: config?.capacity ?? 3,
      refillIntervalMs: config?.refillIntervalMs ?? 1500,
      minSpacingMs: config?.minSpacingMs ?? 1200,
    };
  }

  private getBucket(key: string): BucketState {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        tokens: this.config.capacity,
        lastRefillTime: now,
        lastDispatchTime: 0,
      };
      this.buckets.set(key, bucket);
      return bucket;
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefillTime;
    const tokensToAdd = Math.floor(elapsed / this.config.refillIntervalMs);
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.config.capacity, bucket.tokens + tokensToAdd);
      bucket.lastRefillTime += tokensToAdd * this.config.refillIntervalMs;
    }

    return bucket;
  }

  /**
   * Check whether a message can be dispatched immediately.
   */
  public canDispatch(key: string): boolean {
    const bucket = this.getBucket(key);
    const now = Date.now();
    const timeSinceLast = now - bucket.lastDispatchTime;

    return bucket.tokens >= 1 && timeSinceLast >= this.config.minSpacingMs;
  }

  /**
   * Calculate required wait time before next dispatch can occur.
   */
  public getWaitTimeMs(key: string): number {
    const bucket = this.getBucket(key);
    const now = Date.now();
    let waitMs = 0;

    // Check min spacing
    const timeSinceLast = now - bucket.lastDispatchTime;
    if (timeSinceLast < this.config.minSpacingMs) {
      waitMs = Math.max(waitMs, this.config.minSpacingMs - timeSinceLast);
    }

    // Check token availability
    if (bucket.tokens < 1) {
      const timeSinceRefill = now - bucket.lastRefillTime;
      const refillWait = Math.max(0, this.config.refillIntervalMs - timeSinceRefill);
      waitMs = Math.max(waitMs, refillWait);
    }

    return waitMs;
  }

  /**
   * Consume 1 token and mark dispatch timestamp.
   * Throws or returns false if cannot dispatch.
   */
  public consume(key: string): boolean {
    const bucket = this.getBucket(key);
    const now = Date.now();
    const timeSinceLast = now - bucket.lastDispatchTime;

    if (bucket.tokens >= 1 && timeSinceLast >= this.config.minSpacingMs) {
      bucket.tokens -= 1;
      bucket.lastDispatchTime = now;
      return true;
    }
    return false;
  }

  /**
   * Asynchronously acquire clearance to dispatch, awaiting necessary cadence/token delay.
   */
  public async acquire(key: string): Promise<void> {
    while (true) {
      const waitMs = this.getWaitTimeMs(key);
      if (waitMs <= 0 && this.consume(key)) {
        return;
      }
      const sleepTime = Math.max(waitMs, 100);
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
    }
  }

  /**
   * Reset bucket for a key (useful for tests or reconnection)
   */
  public reset(key: string): void {
    this.buckets.delete(key);
  }
}

/**
 * Calculates realistic human typing cadence duration based on message length and keystroke dynamics.
 * Formula: min(3500ms, max(1200ms, length * 40ms + random(200, 500)ms))
 */
export function calculateTypingCadence(text: string): number {
  const charCount = (text || "").length;
  const jitter = Math.floor(Math.random() * 300) + 200; // 200ms - 500ms jitter
  const rawDuration = charCount * 40 + jitter;
  return Math.min(3500, Math.max(1200, rawDuration));
}

/**
 * Global singleton rate limiter instance with M1 specifications:
 * - 3 token capacity
 * - 1500ms refill interval
 * - 1200ms minimum spacing
 */
export const globalOutboundRateLimiter = new TokenBucketRateLimiter({
  capacity: 3,
  refillIntervalMs: 1500,
  minSpacingMs: 1200,
});

/**
 * Helper to execute an outbound dispatch observing human cadence and token bucket limits.
 */
export async function dispatchWithHumanCadence<T>(
  queueKey: string,
  messageText: string,
  sendAction: () => Promise<T>,
  onTypingStateChange?: (isTyping: boolean) => void
): Promise<T> {
  const typingDuration = calculateTypingCadence(messageText);

  if (onTypingStateChange) {
    onTypingStateChange(true);
  }

  // Simulate human typing indicator
  await new Promise((resolve) => setTimeout(resolve, typingDuration));

  if (onTypingStateChange) {
    onTypingStateChange(false);
  }

  // Await token bucket clearance to prevent burst spam
  await globalOutboundRateLimiter.acquire(queueKey);

  // Execute genuine dispatch
  return await sendAction();
}
