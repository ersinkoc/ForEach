export type Nullable<T> = T | null | undefined;

export type ArrayCallback<T> = (value: T, index: number, array: T[]) => void;
export type ObjectCallback<T> = (value: T, key: string, object: Record<string, T>) => void;

export type AsyncArrayCallback<T> = (value: T, index: number, array: T[]) => void | Promise<void>;
export type AsyncObjectCallback<T> = (value: T, key: string, object: Record<string, T>) => void | Promise<void>;

export interface IForEachOptions {
  readonly thisArg?: any;
  readonly breakOnError?: boolean;
  readonly breakOnReturn?: boolean;
  readonly reverse?: boolean;
}

export interface IAsyncForEachOptions extends IForEachOptions {
  readonly concurrency?: number;
  readonly preserveOrder?: boolean;
  readonly timeout?: number;
}

export interface IChunkedOptions {
  readonly chunkSize: number;
  readonly delayBetweenChunks?: number;
  readonly onChunkComplete?: (chunkIndex: number, processedCount: number) => void;
}

export interface ILazyOptions {
  readonly bufferSize?: number;
  readonly preloadNext?: boolean;
}

export interface ILazyIterator<T> {
  next(): IteratorResult<T>;
  [Symbol.iterator](): Iterator<T>;
  toArray(): T[];
  take(count: number): ILazyIterator<T>;
  skip(count: number): ILazyIterator<T>;
  filter(predicate: (value: T) => boolean): ILazyIterator<T>;
  map<U>(transform: (value: T) => U): ILazyIterator<U>;
}

export interface IIterationContext {
  readonly index: number;
  readonly total: number;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  break(): void;
  skip(): void;
}

export interface IIterationPlugin {
  readonly name: string;
  readonly version: string;
  beforeIteration?(context: IIterationContext): void | Promise<void>;
  afterIteration?(context: IIterationContext): void | Promise<void>;
  onError?(error: Error, context: IIterationContext): void | Promise<void>;
}

export interface IForEachCore {
  use(plugin: IIterationPlugin): void;
  remove(pluginName: string): boolean;
  getPlugins(): ReadonlyArray<IIterationPlugin>;
}

export type ForEachTarget<T> = T[] | Record<string, T>;

export interface IPerformanceMetrics {
  readonly itemsProcessed: number;
  readonly totalTime: number;
  readonly averageTimePerItem: number;
  readonly throughput: number;
}