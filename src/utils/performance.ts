import type { IPerformanceMetrics } from '../types';

export class PerformanceTracker {
  private _startTime: number = 0;
  private _endTime: number = 0;
  private _itemsProcessed: number = 0;
  private _isRunning: boolean = false;

  public start(): void {
    this._startTime = performance.now();
    this._isRunning = true;
    this._itemsProcessed = 0;
  }

  public stop(): void {
    this._endTime = performance.now();
    this._isRunning = false;
  }

  public incrementItems(count: number = 1): void {
    this._itemsProcessed += count;
  }

  public getMetrics(): IPerformanceMetrics {
    const endTime = this._isRunning ? performance.now() : this._endTime;
    const totalTime = endTime - this._startTime;
    const averageTimePerItem = this._itemsProcessed > 0 ? totalTime / this._itemsProcessed : 0;
    const throughput = totalTime > 0 ? (this._itemsProcessed / totalTime) * 1000 : 0;

    return {
      itemsProcessed: this._itemsProcessed,
      totalTime,
      averageTimePerItem,
      throughput,
    };
  }

  public reset(): void {
    this._startTime = 0;
    this._endTime = 0;
    this._itemsProcessed = 0;
    this._isRunning = false;
  }
}

export function measurePerformance<T>(
  fn: () => T,
  label?: string,
  logger?: (message: string) => void
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (label && logger) {
    logger(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label?: string,
  logger?: (message: string) => void
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (label && logger) {
    logger(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;

  return function throttled(...args: Parameters<T>): void {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= delay) {
      lastCallTime = now;
      fn(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        fn(...args);
        timeoutId = null;
      }, delay - timeSinceLastCall);
    }
  };
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}