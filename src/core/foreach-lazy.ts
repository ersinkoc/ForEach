import type { ILazyIterator, ILazyOptions } from '../types';
import { hasOwnProperty, isArray } from '../utils/type-guards';
import { validateLazyOptions, validateTarget } from '../utils/validators';

abstract class BaseLazyIterator<T> implements ILazyIterator<T> {
  protected _buffer: T[] = [];
  protected _currentIndex = 0;
  protected readonly _bufferSize: number;
  protected readonly _preloadNext: boolean;

  constructor(options: ILazyOptions = {}) {
    this._bufferSize = options.bufferSize || 10;
    this._preloadNext = options.preloadNext ?? true;
  }

  public abstract next(): IteratorResult<T>;

  public [Symbol.iterator](): Iterator<T> {
    return this;
  }

  public toArray(): T[] {
    const result: T[] = [];
    let item = this.next();
    while (!item.done) {
      result.push(item.value);
      item = this.next();
    }
    return result;
  }

  public take(count: number): ILazyIterator<T> {
    return new TakeLazyIterator(this, count);
  }

  public skip(count: number): ILazyIterator<T> {
    return new SkipLazyIterator(this, count);
  }

  public filter(predicate: (value: T) => boolean): ILazyIterator<T> {
    return new FilterLazyIterator(this, predicate);
  }

  public map<U>(transform: (value: T) => U): ILazyIterator<U> {
    return new MapLazyIterator(this, transform);
  }
}

class ArrayLazyIterator<T> extends BaseLazyIterator<T> {
  private readonly _array: T[];
  private readonly _reverse: boolean;

  constructor(array: T[], options: ILazyOptions = {}, reverse = false) {
    super(options);
    this._array = array;
    this._reverse = reverse;
    this._currentIndex = reverse ? array.length - 1 : 0;

    if (this._preloadNext) {
      this._preloadBuffer();
    }
  }

  public next(): IteratorResult<T> {
    if (this._reverse) {
      if (this._currentIndex < 0) {
        return { done: true, value: undefined as any };
      }
      const value = this._array[this._currentIndex];
      this._currentIndex--;
      return { done: false, value: value! };
    } else {
      if (this._currentIndex >= this._array.length) {
        return { done: true, value: undefined as any };
      }
      const value = this._array[this._currentIndex];
      this._currentIndex++;
      return { done: false, value: value! };
    }
  }

  private _preloadBuffer(): void {
    const start = this._currentIndex;
    const end = this._reverse
      ? Math.max(0, start - this._bufferSize)
      : Math.min(this._array.length, start + this._bufferSize);

    this._buffer = this._reverse
      ? this._array.slice(end, start + 1).reverse()
      : this._array.slice(start, end);
  }
}

class ObjectLazyIterator<T> extends BaseLazyIterator<[string, T]> {
  private readonly _keys: string[];
  private readonly _object: Record<string, T>;

  constructor(object: Record<string, T>, options: ILazyOptions = {}, reverse = false) {
    super(options);
    this._object = object;
    this._keys = Object.keys(object);
    if (reverse) {
      this._keys.reverse();
    }
    this._currentIndex = 0;
  }

  public next(): IteratorResult<[string, T]> {
    while (this._currentIndex < this._keys.length) {
      const key = this._keys[this._currentIndex]!;
      this._currentIndex++;

      if (hasOwnProperty(this._object, key)) {
        const value = this._object[key];
        return { done: false, value: [key, value!] };
      }
    }

    return { done: true, value: undefined as any };
  }
}

class TakeLazyIterator<T> extends BaseLazyIterator<T> {
  private _taken = 0;

  constructor(
    private readonly _source: ILazyIterator<T>,
    private readonly _count: number
  ) {
    super();
  }

  public next(): IteratorResult<T> {
    if (this._taken >= this._count) {
      return { done: true, value: undefined as any };
    }

    const result = this._source.next();
    if (!result.done) {
      this._taken++;
    }
    return result;
  }
}

class SkipLazyIterator<T> extends BaseLazyIterator<T> {
  private _skipped = 0;

  constructor(
    private readonly _source: ILazyIterator<T>,
    private readonly _count: number
  ) {
    super();
  }

  public next(): IteratorResult<T> {
    while (this._skipped < this._count) {
      const result = this._source.next();
      if (result.done) {
        return result;
      }
      this._skipped++;
    }

    return this._source.next();
  }
}

class FilterLazyIterator<T> extends BaseLazyIterator<T> {
  constructor(
    private readonly _source: ILazyIterator<T>,
    private readonly _predicate: (value: T) => boolean
  ) {
    super();
  }

  public next(): IteratorResult<T> {
    let result = this._source.next();

    while (!result.done && !this._predicate(result.value)) {
      result = this._source.next();
    }

    return result;
  }
}

class MapLazyIterator<T, U> extends BaseLazyIterator<U> {
  constructor(
    private readonly _source: ILazyIterator<T>,
    private readonly _transform: (value: T) => U
  ) {
    super();
  }

  public next(): IteratorResult<U> {
    const result = this._source.next();

    if (result.done) {
      return { done: true, value: undefined as any };
    }

    return { done: false, value: this._transform(result.value) };
  }
}

export function forEachLazy<T>(
  array: T[],
  options?: ILazyOptions & { reverse?: boolean }
): ILazyIterator<T>;
export function forEachLazy<T>(
  object: Record<string, T>,
  options?: ILazyOptions & { reverse?: boolean }
): ILazyIterator<[string, T]>;
export function forEachLazy<T>(
  target: T[] | Record<string, T>,
  options: ILazyOptions & { reverse?: boolean } = {}
): ILazyIterator<T> | ILazyIterator<[string, T]> {
  validateTarget(target);
  validateLazyOptions(options);

  if (isArray(target)) {
    return new ArrayLazyIterator(target, options, options.reverse);
  } else {
    return new ObjectLazyIterator(target, options, options.reverse);
  }
}

export function forEachGenerator<T>(
  array: T[],
  options?: { reverse?: boolean }
): Generator<T, void, unknown>;
export function forEachGenerator<T>(
  object: Record<string, T>,
  options?: { reverse?: boolean }
): Generator<[string, T], void, unknown>;
export function* forEachGenerator<T>(
  target: T[] | Record<string, T>,
  options: { reverse?: boolean } = {}
): Generator<T | [string, T], void, unknown> {
  validateTarget(target);

  if (isArray(target)) {
    const items = options.reverse ? target.slice().reverse() : target;
    for (const item of items) {
      yield item;
    }
  } else {
    const keys = Object.keys(target);
    const items = options.reverse ? keys.reverse() : keys;
    
    for (const key of items) {
      if (hasOwnProperty(target, key)) {
        const value = (target)[key];
        yield [key, value!] as [string, T];
      }
    }
  }
}