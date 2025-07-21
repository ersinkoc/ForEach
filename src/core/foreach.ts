import type {
  ArrayCallback,
  ObjectCallback,
  IForEachOptions,
  IIterationContext,
} from '../types';
import { ForEachError, ForEachErrorCode } from '../types/errors';
import { isArray, hasOwnProperty } from '../utils/type-guards';
import { validateCallback, validateTarget, validateForEachOptions } from '../utils/validators';
import { PerformanceTracker } from '../utils/performance';

class IterationContextImpl implements IIterationContext {
  private _shouldBreak = false;
  private _shouldSkip = false;

  constructor(
    public readonly index: number,
    public readonly total: number,
    public readonly isFirst: boolean,
    public readonly isLast: boolean
  ) {}

  public break(): void {
    this._shouldBreak = true;
  }

  public skip(): void {
    this._shouldSkip = true;
  }

  public get shouldBreak(): boolean {
    return this._shouldBreak;
  }

  public get shouldSkip(): boolean {
    return this._shouldSkip;
  }
}

export function forEach<T>(
  array: T[],
  callback: ArrayCallback<T>,
  options?: IForEachOptions
): void;
export function forEach<T>(
  object: Record<string, T>,
  callback: ObjectCallback<T>,
  options?: IForEachOptions
): void;
export function forEach<T>(
  target: T[] | Record<string, T>,
  callback: ArrayCallback<T> | ObjectCallback<T>,
  options: IForEachOptions = {}
): void {
  validateTarget(target);
  validateCallback(callback);
  validateForEachOptions(options);

  const tracker = new PerformanceTracker();
  tracker.start();

  try {
    if (isArray(target)) {
      forEachArray(target, callback as ArrayCallback<T>, options);
    } else {
      forEachObject(target as Record<string, T>, callback as ObjectCallback<T>, options);
    }
  } finally {
    tracker.stop();
  }
}

function forEachArray<T>(
  array: T[],
  callback: ArrayCallback<T>,
  options: IForEachOptions
): void {
  const { thisArg, breakOnError, breakOnReturn, reverse } = options;
  const items = reverse ? array.slice().reverse() : array;
  const length = items.length;

  for (let i = 0; i < length; i++) {
    const actualIndex = reverse ? length - 1 - i : i;
    const context = new IterationContextImpl(actualIndex, length, i === 0, i === length - 1);

    const item = items[i];
    // Process all indices, including holes as undefined

    try {
      const result = callback.call(thisArg, item, actualIndex, array);

      if (context.shouldBreak || (breakOnReturn && result !== undefined)) {
        break;
      }

      if (context.shouldSkip) {
        continue;
      }
    } catch (error) {
      if (breakOnError) {
        throw new ForEachError(
          `Error in forEach at index ${actualIndex}`,
          ForEachErrorCode.ITERATION_ERROR,
          { index: actualIndex, error }
        );
      }
    }
  }
}

function forEachObject<T>(
  object: Record<string, T>,
  callback: ObjectCallback<T>,
  options: IForEachOptions
): void {
  const { thisArg, breakOnError, breakOnReturn, reverse } = options;
  const keys = Object.keys(object);
  const items = reverse ? keys.reverse() : keys;
  const length = items.length;

  for (let i = 0; i < length; i++) {
    const key = items[i];
    if (key == null || !hasOwnProperty(object, key)) continue;

    const context = new IterationContextImpl(i, length, i === 0, i === length - 1);

    const value = object[key];
    if (value === undefined) continue;
    
    try {
      const result = callback.call(thisArg, value, key, object);

      if (context.shouldBreak || (breakOnReturn && result !== undefined)) {
        break;
      }

      if (context.shouldSkip) {
        continue;
      }
    } catch (error) {
      if (breakOnError) {
        throw new ForEachError(
          `Error in forEach at key "${key}"`,
          ForEachErrorCode.ITERATION_ERROR,
          { key, error }
        );
      }
    }
  }
}

export function forEachWithContext<T>(
  target: T[] | Record<string, T>,
  callback: (value: T, keyOrIndex: string | number, context: IIterationContext) => void,
  options: IForEachOptions = {}
): void {
  validateTarget(target);
  validateCallback(callback);
  validateForEachOptions(options);

  if (isArray(target)) {
    const items = options.reverse ? target.slice().reverse() : target;
    const length = items.length;

    for (let i = 0; i < length; i++) {
      const actualIndex = options.reverse ? length - 1 - i : i;
      const context = new IterationContextImpl(actualIndex, length, i === 0, i === length - 1);

      const item = items[i];
      // Process all indices, including holes as undefined

      try {
        callback.call(options.thisArg, item, actualIndex, context);
        if (context.shouldBreak) break;
        if (context.shouldSkip) continue;
      } catch (error) {
        if (options.breakOnError) {
          throw new ForEachError(
            `Error in forEach at index ${actualIndex}`,
            ForEachErrorCode.ITERATION_ERROR,
            { index: actualIndex, error }
          );
        }
      }
    }
  } else {
    const keys = Object.keys(target as Record<string, T>);
    const items = options.reverse ? keys.reverse() : keys;
    const length = items.length;

    for (let i = 0; i < length; i++) {
      const key = items[i];
      const obj = target as Record<string, T>;
      if (key == null || !hasOwnProperty(obj, key)) continue;

      const context = new IterationContextImpl(i, length, i === 0, i === length - 1);

      const value = obj[key];
      if (value === undefined) continue;
      
      try {
        callback.call(options.thisArg, value, key, context);
        if (context.shouldBreak) break;
        if (context.shouldSkip) continue;
      } catch (error) {
        if (options.breakOnError) {
          throw new ForEachError(
            `Error in forEach at key "${key}"`,
            ForEachErrorCode.ITERATION_ERROR,
            { key, error }
          );
        }
      }
    }
  }
}