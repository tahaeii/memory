/** Sliding-window limiter that counts failed attempts per key and for the whole site. */
export class FailureLimiter {
  private perKey = new Map<string, number[]>();
  private overall: number[] = [];

  constructor(
    private readonly maxPerKey: number,
    private readonly maxOverall: number,
    private readonly windowMs: number,
  ) {}

  private recent(times: number[], now: number): number[] {
    return times.filter((time) => now - time < this.windowMs);
  }

  /** True when this key, or the site as a whole, failed too often recently. */
  isBlocked(key: string): boolean {
    const now = Date.now();
    this.overall = this.recent(this.overall, now);
    const own = this.recent(this.perKey.get(key) ?? [], now);
    if (own.length === 0) this.perKey.delete(key);
    else this.perKey.set(key, own);
    return own.length >= this.maxPerKey || this.overall.length >= this.maxOverall;
  }

  recordFailure(key: string): void {
    const now = Date.now();
    this.overall.push(now);
    this.perKey.set(key, [...this.recent(this.perKey.get(key) ?? [], now), now]);
    if (this.perKey.size > 5000) this.prune(now);
  }

  reset(key: string): void {
    this.perKey.delete(key);
  }

  /** Drops expired keys so many different clients cannot grow the map forever. */
  private prune(now: number): void {
    for (const [key, times] of this.perKey) {
      if (this.recent(times, now).length === 0) this.perKey.delete(key);
    }
  }
}
