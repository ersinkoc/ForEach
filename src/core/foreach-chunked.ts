import type {
  ArrayCallback,
  ObjectCallback,
  AsyncArrayCallback,
  AsyncObjectCallback,
  IChunkedOptions,
  IForEachOptions,
  IAsyncForEachOptions,
} from '../types';
import { isArray, hasOwnProperty } from '../utils/type-guards';
import { validateCallback, validateTarget, validateChunkedOptions } from '../utils/validators';
import { PerformanceTracker } from '../utils/performance';

export function forEachChunked<T>(
  array: T[],
  callback: ArrayCallback<T>,
  options: IChunkedOptions & IForEachOptions
): void;
export function forEachChunked<T>(
  object: Record<string, T>,
  callback: ObjectCallback<T>,
  options: IChunkedOptions & IForEachOptions
): void;
export function forEachChunked<T>(
  target: T[] | Record<string, T>,
  callback: ArrayCallback<T> | ObjectCallback<T>,
  options: IChunkedOptions & IForEachOptions
): void {
  validateTarget(target);
  validateCallback(callback);
  validateChunkedOptions(options);

  const tracker = new PerformanceTracker();
  tracker.start();

  try {
    if (isArray(target)) {
      forEachArrayChunked(target, callback as ArrayCallback<T>, options);
    } else {
      forEachObjectChunked(
        target as Record<string, T>,
        callback as ObjectCallback<T>,
        options
      );
    }
  } finally {
    tracker.stop();
  }
}

function forEachArrayChunked<T>(
  array: T[],
  callback: ArrayCallback<T>,
  options: IChunkedOptions & IForEachOptions
): void {
  const { chunkSize, onChunkComplete, thisArg, breakOnError, reverse } = options;
  const items = reverse ? array.slice().reverse() : array;
  const length = items.length;
  const chunks = Math.ceil(length / chunkSize);

  for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, length);
    let processedInChunk = 0;

    for (let i = start; i < end; i++) {
      const actualIndex = reverse ? length - 1 - i : i;

      const item = items[i];
      // Process all indices, including holes as undefined

      try {
        callback.call(thisArg, item, actualIndex, array);
        processedInChunk++;
      } catch (error) {
        if (breakOnError) {
          throw error;
        }
      }
    }

    if (onChunkComplete) {
      onChunkComplete(chunkIndex, processedInChunk);
    }
  }
}

function forEachObjectChunked<T>(
  object: Record<string, T>,
  callback: ObjectCallback<T>,
  options: IChunkedOptions & IForEachOptions
): void {
  const { chunkSize, onChunkComplete, thisArg, breakOnError, reverse } = options;
  const keys = Object.keys(object);
  const items = reverse ? keys.reverse() : keys;
  const length = items.length;
  const chunks = Math.ceil(length / chunkSize);

  for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, length);
    let processedInChunk = 0;

    for (let i = start; i < end; i++) {
      const key = items[i];
      if (key == null || !hasOwnProperty(object, key)) continue;

      const value = object[key];
      if (value === undefined) continue;
      
      try {
        callback.call(thisArg, value, key, object);
        processedInChunk++;
      } catch (error) {
        if (breakOnError) {
          throw error;
        }
      }
    }

    if (onChunkComplete) {
      onChunkComplete(chunkIndex, processedInChunk);
    }
  }
}

export async function forEachChunkedAsync<T>(
  array: T[],
  callback: AsyncArrayCallback<T>,
  options: IChunkedOptions & IAsyncForEachOptions
): Promise<void>;
export async function forEachChunkedAsync<T>(
  object: Record<string, T>,
  callback: AsyncObjectCallback<T>,
  options: IChunkedOptions & IAsyncForEachOptions
): Promise<void>;
export async function forEachChunkedAsync<T>(
  target: T[] | Record<string, T>,
  callback: AsyncArrayCallback<T> | AsyncObjectCallback<T>,
  options: IChunkedOptions & IAsyncForEachOptions
): Promise<void> {
  validateTarget(target);
  validateCallback(callback);
  validateChunkedOptions(options);

  const tracker = new PerformanceTracker();
  tracker.start();

  try {
    if (isArray(target)) {
      await forEachArrayChunkedAsync(target, callback as AsyncArrayCallback<T>, options);
    } else {
      await forEachObjectChunkedAsync(
        target as Record<string, T>,
        callback as AsyncObjectCallback<T>,
        options
      );
    }
  } finally {
    tracker.stop();
  }
}

async function forEachArrayChunkedAsync<T>(
  array: T[],
  callback: AsyncArrayCallback<T>,
  options: IChunkedOptions & IAsyncForEachOptions
): Promise<void> {
  const {
    chunkSize,
    delayBetweenChunks = 0,
    onChunkComplete,
    thisArg,
    breakOnError,
    reverse,
    concurrency = 1,
  } = options;

  const items = reverse ? array.slice().reverse() : array;
  const length = items.length;
  const chunks = Math.ceil(length / chunkSize);

  for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, length);
    let processedInChunk = 0;

    if (concurrency > 1) {
      const promises: Promise<void>[] = [];

      for (let i = start; i < end; i += concurrency) {
        const batch = items.slice(i, Math.min(i + concurrency, end));
        const batchPromises = batch.map(async (item, batchIndex) => {
          const globalIndex = i + batchIndex;
          const actualIndex = reverse ? length - 1 - globalIndex : globalIndex;

          try {
            await callback.call(thisArg, item, actualIndex, array);
            processedInChunk++;
          } catch (error) {
            if (breakOnError) {
              throw error;
            }
          }
        });

        promises.push(...batchPromises);
      }

      await Promise.all(promises);
    } else {
      for (let i = start; i < end; i++) {
        const actualIndex = reverse ? length - 1 - i : i;

        const item = items[i];
        // Process all indices, including holes as undefined

        try {
          await callback.call(thisArg, item, actualIndex, array);
          processedInChunk++;
        } catch (error) {
          if (breakOnError) {
            throw error;
          }
        }
      }
    }

    if (onChunkComplete) {
      onChunkComplete(chunkIndex, processedInChunk);
    }

    if (delayBetweenChunks > 0 && chunkIndex < chunks - 1) {
      await delay(delayBetweenChunks);
    }
  }
}

async function forEachObjectChunkedAsync<T>(
  object: Record<string, T>,
  callback: AsyncObjectCallback<T>,
  options: IChunkedOptions & IAsyncForEachOptions
): Promise<void> {
  const {
    chunkSize,
    delayBetweenChunks = 0,
    onChunkComplete,
    thisArg,
    breakOnError,
    reverse,
    concurrency = 1,
  } = options;

  const keys = Object.keys(object);
  const items = reverse ? keys.reverse() : keys;
  const length = items.length;
  const chunks = Math.ceil(length / chunkSize);

  for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, length);
    let processedInChunk = 0;

    if (concurrency > 1) {
      const promises: Promise<void>[] = [];

      for (let i = start; i < end; i += concurrency) {
        const batch = items.slice(i, Math.min(i + concurrency, end));
        const batchPromises = batch.map(async (key) => {
          if (key == null || !hasOwnProperty(object, key)) return;

          const value = object[key];
          if (value === undefined) return;
          
          try {
            await callback.call(thisArg, value, key, object);
            processedInChunk++;
          } catch (error) {
            if (breakOnError) {
              throw error;
            }
          }
        });

        promises.push(...batchPromises);
      }

      await Promise.all(promises);
    } else {
      for (let i = start; i < end; i++) {
        const key = items[i];
        if (key == null || !hasOwnProperty(object, key)) continue;

        const value = object[key];
        if (value === undefined) continue;
        
        try {
          await callback.call(thisArg, value, key, object);
          processedInChunk++;
        } catch (error) {
          if (breakOnError) {
            throw error;
          }
        }
      }
    }

    if (onChunkComplete) {
      onChunkComplete(chunkIndex, processedInChunk);
    }

    if (delayBetweenChunks > 0 && chunkIndex < chunks - 1) {
      await delay(delayBetweenChunks);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}