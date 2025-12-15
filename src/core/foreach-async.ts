import type {
  AsyncArrayCallback,
  AsyncObjectCallback,
  IAsyncForEachOptions,
} from '../types';
import { ForEachError, ForEachErrorCode, TimeoutError } from '../types/errors';
import { hasOwnProperty, isArray } from '../utils/type-guards';
import {
  validateAsyncOptions,
  validateCallback,
  validateTarget,
} from '../utils/validators';
import { PerformanceTracker } from '../utils/performance';

// Note: AsyncIterationContext was removed as dead code (BUG-004 fix)
// The context pattern is only used in forEachWithContext, not in forEachAsync

export async function forEachAsync<T>(
  array: T[],
  callback: AsyncArrayCallback<T>,
  options?: IAsyncForEachOptions
): Promise<void>;
export async function forEachAsync<T>(
  object: Record<string, T>,
  callback: AsyncObjectCallback<T>,
  options?: IAsyncForEachOptions
): Promise<void>;
export async function forEachAsync<T>(
  target: T[] | Record<string, T>,
  callback: AsyncArrayCallback<T> | AsyncObjectCallback<T>,
  options: IAsyncForEachOptions = {}
): Promise<void> {
  validateTarget(target);
  validateCallback(callback);
  validateAsyncOptions(options);

  const tracker = new PerformanceTracker();
  tracker.start();

  try {
    if (isArray(target)) {
      await forEachArrayAsync(target, callback as AsyncArrayCallback<T>, options);
    } else {
      await forEachObjectAsync(
        target,
        callback as AsyncObjectCallback<T>,
        options
      );
    }
  } finally {
    tracker.stop();
  }
}

async function forEachArrayAsync<T>(
  array: T[],
  callback: AsyncArrayCallback<T>,
  options: IAsyncForEachOptions
): Promise<void> {
  const { thisArg, breakOnError, breakOnReturn, reverse, timeout } = options;
  const items = reverse ? array.slice().reverse() : array;
  const length = items.length;

  for (let i = 0; i < length; i++) {
    const actualIndex = reverse ? length - 1 - i : i;

    // Skip holes in sparse arrays (like native forEach)
    if (!(i in items)) continue;

    const item = items[i] as T;

    try {
      const promise = Promise.resolve(
        callback.call(thisArg, item, actualIndex, array)
      );

      const result = timeout
        ? await withTimeout(promise, timeout, `Index ${actualIndex}`)
        : await promise;

      // BUG-004 fix: Removed dead code for context.shouldBreak/shouldSkip
      // Context is not passed to callback, use breakOnReturn instead
      if (breakOnReturn && result !== undefined) {
        break;
      }
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw error; // Always throw timeout errors
      }
      if (breakOnError) {
        throw new ForEachError(
          `Error in forEachAsync at index ${actualIndex}`,
          ForEachErrorCode.ITERATION_ERROR,
          { index: actualIndex, error }
        );
      }
    }
  }
}

async function forEachObjectAsync<T>(
  object: Record<string, T>,
  callback: AsyncObjectCallback<T>,
  options: IAsyncForEachOptions
): Promise<void> {
  const { thisArg, breakOnError, breakOnReturn, reverse, timeout } = options;
  const keys = Object.keys(object);
  const items = reverse ? keys.reverse() : keys;
  const length = items.length;

  for (let i = 0; i < length; i++) {
    const key = items[i];
    if (key == null || !hasOwnProperty(object, key)) continue;

    const value = object[key];
    if (value === undefined) continue;

    try {
      const promise = Promise.resolve(
        callback.call(thisArg, value, key, object)
      );

      const result = timeout
        ? await withTimeout(promise, timeout, `Key "${key}"`)
        : await promise;

      // BUG-004 fix: Removed dead code for context.shouldBreak/shouldSkip
      // Context is not passed to callback, use breakOnReturn instead
      if (breakOnReturn && result !== undefined) {
        break;
      }
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw error; // Always throw timeout errors
      }
      if (breakOnError) {
        throw new ForEachError(
          `Error in forEachAsync at key "${key}"`,
          ForEachErrorCode.ITERATION_ERROR,
          { key, error }
        );
      }
    }
  }
}

export async function forEachParallel<T>(
  array: T[],
  callback: AsyncArrayCallback<T>,
  options?: IAsyncForEachOptions
): Promise<void>;
export async function forEachParallel<T>(
  object: Record<string, T>,
  callback: AsyncObjectCallback<T>,
  options?: IAsyncForEachOptions
): Promise<void>;
export async function forEachParallel<T>(
  target: T[] | Record<string, T>,
  callback: AsyncArrayCallback<T> | AsyncObjectCallback<T>,
  options: IAsyncForEachOptions = {}
): Promise<void> {
  validateTarget(target);
  validateCallback(callback);
  validateAsyncOptions(options);

  const { concurrency = 10, preserveOrder = false } = options;
  const tracker = new PerformanceTracker();
  tracker.start();

  try {
    if (isArray(target)) {
      await forEachArrayParallel(
        target,
        callback as AsyncArrayCallback<T>,
        options,
        concurrency,
        preserveOrder
      );
    } else {
      await forEachObjectParallel(
        target,
        callback as AsyncObjectCallback<T>,
        options,
        concurrency,
        preserveOrder
      );
    }
  } finally {
    tracker.stop();
  }
}

async function forEachArrayParallel<T>(
  array: T[],
  callback: AsyncArrayCallback<T>,
  options: IAsyncForEachOptions,
  concurrency: number,
  preserveOrder: boolean
): Promise<void> {
  const { thisArg, timeout, reverse, breakOnError } = options;
  const items = reverse ? array.slice().reverse() : array;
  const length = items.length;

  if (preserveOrder) {
    const results: Promise<void>[] = [];
    const semaphore = new Semaphore(concurrency);

    for (let i = 0; i < length; i++) {
      const actualIndex = reverse ? length - 1 - i : i;
      const promise = semaphore.acquire().then(async (release) => {
        try {
          // Skip holes in sparse arrays (like native forEach)
          if (!(i in items)) {
            release();
            return;
          }

          const item = items[i] as T;

          const callPromise = Promise.resolve(
            callback.call(thisArg, item, actualIndex, array)
          );

          if (timeout) {
            await withTimeout(callPromise, timeout, `Index ${actualIndex}`);
          } else {
            await callPromise;
          }
        } catch (error) {
          if (error instanceof TimeoutError) {
            throw error; // Always throw timeout errors
          }
          if (breakOnError) {
            throw error;
          }
          // Silently continue if breakOnError is false
        } finally {
          release();
        }
      });

      results.push(promise);
    }

    // For timeout errors, we always want them to propagate
    // For other errors, respect breakOnError setting
    try {
      await Promise.all(results);
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw error; // Always throw timeout errors
      }
      if (breakOnError) {
        throw error;
      }
      // Continue silently for other errors when breakOnError is false
    }
  } else {
    // BUG-001 fix: Track indices to handle duplicate values correctly
    // Using indexOf would return first occurrence for duplicates
    const indexedItems = items.map((item, i) => ({ item, originalIndex: i }));
    const chunks = createChunks(indexedItems, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async ({ item, originalIndex: i }) => {
        const actualIndex = reverse ? length - 1 - i : i;

        try {
          const callPromise = Promise.resolve(
            callback.call(thisArg, item, actualIndex, array)
          );

          if (timeout) {
            await withTimeout(callPromise, timeout, `Index ${actualIndex}`);
          } else {
            await callPromise;
          }
        } catch (error) {
          if (error instanceof TimeoutError) {
            throw error; // Always throw timeout errors
          }
          if (breakOnError) {
            throw error;
          }
          // Silently continue if breakOnError is false
        }
      });

      // For timeout errors, we always want them to propagate
      // For other errors, respect breakOnError setting
      try {
        await Promise.all(promises);
      } catch (error) {
        if (error instanceof TimeoutError) {
          throw error; // Always throw timeout errors
        }
        if (breakOnError) {
          throw error;
        }
        // Continue silently for other errors when breakOnError is false
      }
    }
  }
}

async function forEachObjectParallel<T>(
  object: Record<string, T>,
  callback: AsyncObjectCallback<T>,
  options: IAsyncForEachOptions,
  concurrency: number,
  preserveOrder: boolean
): Promise<void> {
  const { thisArg, timeout, reverse, breakOnError } = options;
  const keys = Object.keys(object);
  const items = reverse ? keys.reverse() : keys;

  if (preserveOrder) {
    const results: Promise<void>[] = [];
    const semaphore = new Semaphore(concurrency);

    for (const key of items) {
      if (key == null || !hasOwnProperty(object, key)) continue;

      const promise = semaphore.acquire().then(async (release) => {
        try {
          const value = object[key];
          if (value === undefined) {
            release();
            return;
          }

          const callPromise = Promise.resolve(
            callback.call(thisArg, value, key, object)
          );

          if (timeout) {
            await withTimeout(callPromise, timeout, `Key "${key}"`);
          } else {
            await callPromise;
          }
        } catch (error) {
          if (error instanceof TimeoutError) {
            throw error; // Always throw timeout errors
          }
          if (breakOnError) {
            throw error;
          }
          // Silently continue if breakOnError is false
        } finally {
          release();
        }
      });

      results.push(promise);
    }

    // For timeout errors, we always want them to propagate
    // For other errors, respect breakOnError setting
    try {
      await Promise.all(results);
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw error; // Always throw timeout errors
      }
      if (breakOnError) {
        throw error;
      }
      // Continue silently for other errors when breakOnError is false
    }
  } else {
    const chunks = createChunks(items, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async (key) => {
        if (key == null || !hasOwnProperty(object, key)) return;

        const value = object[key];
        if (value === undefined) return;

        // BUG-002 fix: Add error handling consistent with preserveOrder path
        try {
          const callPromise = Promise.resolve(
            callback.call(thisArg, value, key, object)
          );

          if (timeout) {
            await withTimeout(callPromise, timeout, `Key "${key}"`);
          } else {
            await callPromise;
          }
        } catch (error) {
          if (error instanceof TimeoutError) {
            throw error; // Always throw timeout errors
          }
          if (breakOnError) {
            throw error;
          }
          // Silently continue if breakOnError is false
        }
      });

      // For timeout errors, we always want them to propagate
      // For other errors, respect breakOnError setting
      try {
        await Promise.all(promises);
      } catch (error) {
        if (error instanceof TimeoutError) {
          throw error; // Always throw timeout errors
        }
        if (breakOnError) {
          throw error;
        }
        // Continue silently for other errors when breakOnError is false
      }
    }
  }
}

class Semaphore {
  private _permits: number;
  private readonly _queue: Array<() => void> = [];

  constructor(permits: number) {
    this._permits = permits;
  }

  public async acquire(): Promise<() => void> {
    if (this._permits > 0) {
      this._permits--;
      return () => this.release();
    }

    return new Promise<() => void>((resolve) => {
      this._queue.push(() => {
        this._permits--;
        resolve(() => this.release());
      });
    });
  }

  private release(): void {
    this._permits++;
    if (this._queue.length > 0 && this._permits > 0) {
      const next = this._queue.shift();
      if (next) next();
    }
  }
}

function createChunks<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  context: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new TimeoutError(
          `Operation timed out after ${timeout}ms at ${context}`,
          { timeout, context }
        )
      );
    }, timeout);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}