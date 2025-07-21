# API Reference

This document provides detailed API documentation for @oxog/foreach.

## Table of Contents

- [Core Functions](#core-functions)
- [Types and Interfaces](#types-and-interfaces)
- [Error Handling](#error-handling)
- [Plugin System](#plugin-system)
- [Utilities](#utilities)

## Core Functions

### forEach

Synchronous iteration over arrays and objects.

```typescript
function forEach<T>(
  array: T[], 
  callback: ArrayCallback<T>, 
  options?: IForEachOptions
): void;

function forEach<T>(
  object: Record<string, T>, 
  callback: ObjectCallback<T>, 
  options?: IForEachOptions
): void;
```

#### Parameters

- **target**: The array or object to iterate over
- **callback**: Function to execute for each element
  - For arrays: `(value: T, index: number, array: T[]) => void`
  - For objects: `(value: T, key: string, object: Record<string, T>) => void`
- **options**: Configuration options (optional)

#### Options

```typescript
interface IForEachOptions {
  thisArg?: any;           // Value to use as 'this' when executing callback
  breakOnError?: boolean;  // Stop iteration on first error (default: false)
  breakOnReturn?: boolean; // Stop iteration if callback returns a value
  reverse?: boolean;       // Iterate in reverse order
}
```

#### Examples

```typescript
// Array iteration
forEach([1, 2, 3], (value, index) => {
  console.log(`${index}: ${value}`);
});

// Object iteration
forEach({ a: 1, b: 2 }, (value, key) => {
  console.log(`${key}: ${value}`);
});

// With options
forEach([1, 2, 3], (value) => {
  console.log(value);
}, { reverse: true, breakOnError: true });
```

### forEachAsync

Asynchronous sequential iteration.

```typescript
function forEachAsync<T>(
  target: T[] | Record<string, T>,
  callback: AsyncArrayCallback<T> | AsyncObjectCallback<T>,
  options?: IAsyncForEachOptions
): Promise<void>;
```

#### Parameters

- **target**: The array or object to iterate over
- **callback**: Async function to execute for each element
- **options**: Configuration options (optional)

#### Options

```typescript
interface IAsyncForEachOptions extends IForEachOptions {
  concurrency?: number;      // Number of concurrent operations (for forEachParallel)
  preserveOrder?: boolean;   // Maintain order in parallel execution
  timeout?: number;          // Timeout for each iteration in milliseconds
}
```

#### Examples

```typescript
await forEachAsync([1, 2, 3], async (value) => {
  await processAsync(value);
});

// With timeout
await forEachAsync(items, async (item) => {
  await processItem(item);
}, { timeout: 5000 });
```

### forEachParallel

Parallel asynchronous iteration with concurrency control.

```typescript
function forEachParallel<T>(
  target: T[] | Record<string, T>,
  callback: AsyncArrayCallback<T> | AsyncObjectCallback<T>,
  options?: IAsyncForEachOptions
): Promise<void>;
```

#### Examples

```typescript
// Process items in parallel with concurrency limit
await forEachParallel(urls, async (url) => {
  return await fetch(url);
}, { concurrency: 5 });

// Preserve order of results
await forEachParallel(items, async (item) => {
  return await processItem(item);
}, { concurrency: 10, preserveOrder: true });
```

### forEachLazy

Lazy evaluation with chainable operations.

```typescript
function forEachLazy<T>(
  array: T[], 
  options?: ILazyOptions
): ILazyIterator<T>;

function forEachLazy<T>(
  object: Record<string, T>, 
  options?: ILazyOptions
): ILazyIterator<[string, T]>;
```

#### Options

```typescript
interface ILazyOptions {
  bufferSize?: number;    // Internal buffer size for optimization
  preloadNext?: boolean;  // Preload next items for performance
}
```

#### Chainable Methods

```typescript
interface ILazyIterator<T> {
  next(): IteratorResult<T>;
  [Symbol.iterator](): Iterator<T>;
  toArray(): T[];
  take(count: number): ILazyIterator<T>;
  skip(count: number): ILazyIterator<T>;
  filter(predicate: (value: T) => boolean): ILazyIterator<T>;
  map<U>(transform: (value: T) => U): ILazyIterator<U>;
}
```

#### Examples

```typescript
// Complex data pipeline
const result = forEachLazy(largeDataset)
  .filter(item => item.active)
  .map(item => item.value)
  .filter(value => value > 100)
  .take(50)
  .toArray();

// Manual iteration
const iterator = forEachLazy(data);
for (const value of iterator) {
  if (shouldStop) break;
  process(value);
}
```

### forEachChunked

Process large datasets in chunks.

```typescript
function forEachChunked<T>(
  target: T[] | Record<string, T>,
  callback: ArrayCallback<T> | ObjectCallback<T>,
  options: IChunkedOptions & IForEachOptions
): void;

function forEachChunkedAsync<T>(
  target: T[] | Record<string, T>,
  callback: AsyncArrayCallback<T> | AsyncObjectCallback<T>,
  options: IChunkedOptions & IAsyncForEachOptions
): Promise<void>;
```

#### Options

```typescript
interface IChunkedOptions {
  chunkSize: number;                                                    // Number of items per chunk (required)
  delayBetweenChunks?: number;                                         // Delay in ms between chunks
  onChunkComplete?: (chunkIndex: number, processedCount: number) => void; // Chunk completion callback
}
```

#### Examples

```typescript
// Synchronous chunked processing
forEachChunked(millionItems, (item) => {
  processItem(item);
}, {
  chunkSize: 1000,
  onChunkComplete: (index, count) => {
    console.log(`Chunk ${index} completed: ${count} items`);
  }
});

// Async chunked processing
await forEachChunkedAsync(items, async (item) => {
  await saveToDatabase(item);
}, {
  chunkSize: 100,
  concurrency: 5,
  delayBetweenChunks: 100
});
```

### forEachGenerator

Generator-based iteration.

```typescript
function* forEachGenerator<T>(
  array: T[], 
  options?: { reverse?: boolean }
): Generator<T, void, unknown>;

function* forEachGenerator<T>(
  object: Record<string, T>, 
  options?: { reverse?: boolean }
): Generator<[string, T], void, unknown>;
```

#### Examples

```typescript
// Use with for...of
for (const value of forEachGenerator([1, 2, 3])) {
  console.log(value);
}

// Convert to array
const reversed = [...forEachGenerator([1, 2, 3], { reverse: true })];

// Object entries
for (const [key, value] of forEachGenerator(obj)) {
  console.log(`${key}: ${value}`);
}
```

## Types and Interfaces

### Callback Types

```typescript
type ArrayCallback<T> = (value: T, index: number, array: T[]) => void;
type ObjectCallback<T> = (value: T, key: string, object: Record<string, T>) => void;
type AsyncArrayCallback<T> = (value: T, index: number, array: T[]) => void | Promise<void>;
type AsyncObjectCallback<T> = (value: T, key: string, object: Record<string, T>) => void | Promise<void>;
```

### Iteration Context

```typescript
interface IIterationContext {
  readonly index: number;   // Current iteration index
  readonly total: number;   // Total number of items
  readonly isFirst: boolean; // True if this is the first iteration
  readonly isLast: boolean;  // True if this is the last iteration
  break(): void;            // Stop iteration
  skip(): void;             // Skip to next iteration
}
```

### Performance Metrics

```typescript
interface IPerformanceMetrics {
  readonly itemsProcessed: number;     // Number of items processed
  readonly totalTime: number;          // Total time in milliseconds
  readonly averageTimePerItem: number; // Average time per item
  readonly throughput: number;         // Items per second
}
```

## Error Handling

### Error Types

```typescript
enum ForEachErrorCode {
  INVALID_CALLBACK = 'INVALID_CALLBACK',
  INVALID_TARGET = 'INVALID_TARGET',
  INVALID_OPTIONS = 'INVALID_OPTIONS',
  ITERATION_ERROR = 'ITERATION_ERROR',
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONCURRENCY_ERROR = 'CONCURRENCY_ERROR',
  CHUNK_SIZE_ERROR = 'CHUNK_SIZE_ERROR',
}
```

### Error Classes

```typescript
class ForEachError extends Error {
  public readonly code: ForEachErrorCode;
  public readonly details?: any;
  public readonly timestamp: Date;
  
  constructor(message: string, code: ForEachErrorCode, details?: any);
  toJSON(): object;
}

class ValidationError extends ForEachError {
  constructor(message: string, details?: any);
}

class TimeoutError extends ForEachError {
  constructor(message: string, details?: any);
}

class PluginError extends ForEachError {
  constructor(message: string, details?: any);
}
```

## Plugin System

### Plugin Interface

```typescript
interface IIterationPlugin {
  name: string;
  version: string;
  beforeIteration?(context: IIterationContext): void | Promise<void>;
  afterIteration?(context: IIterationContext): void | Promise<void>;
  onError?(error: Error, context: IIterationContext): void | Promise<void>;
}
```

### ForEachCore

```typescript
class ForEachCore implements IForEachCore {
  use(plugin: IIterationPlugin): void;
  remove(pluginName: string): boolean;
  getPlugins(): ReadonlyArray<IIterationPlugin>;
}
```

### Plugin Example

```typescript
const loggingPlugin: IIterationPlugin = {
  name: 'logger',
  version: '1.0.0',
  beforeIteration: (context) => {
    console.log(`Processing item ${context.index + 1} of ${context.total}`);
  },
  afterIteration: (context) => {
    if (context.isLast) {
      console.log('Iteration complete!');
    }
  },
  onError: (error, context) => {
    console.error(`Error at index ${context.index}:`, error);
  }
};

const core = new ForEachCore();
core.use(loggingPlugin);
```

## Utilities

### Performance Tracking

```typescript
class PerformanceTracker {
  start(): void;
  stop(): void;
  incrementItems(count?: number): void;
  getMetrics(): IPerformanceMetrics;
  reset(): void;
}

function measurePerformance<T>(
  fn: () => T, 
  label?: string
): { result: T; duration: number };

function measureAsyncPerformance<T>(
  fn: () => Promise<T>, 
  label?: string
): Promise<{ result: T; duration: number }>;
```

### Utility Functions

```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): (...args: Parameters<T>) => void;

function debounce<T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): (...args: Parameters<T>) => void;
```

### Type Guards

```typescript
function isArray<T>(value: unknown): value is T[];
function isObject(value: unknown): value is Record<string, any>;
function isFunction(value: unknown): value is Function;
function isPromise<T = any>(value: unknown): value is Promise<T>;
function isCallable<T extends Function = Function>(value: unknown): value is T;
// ... and more
```

### Validators

```typescript
function validateCallback(callback: unknown, errorMessage?: string): void;
function validateTarget(target: unknown): void;
function validateForEachOptions(options: unknown): void;
function validateAsyncOptions(options: unknown): void;
function validateChunkedOptions(options: unknown): void;
function validateLazyOptions(options: unknown): void;
function validatePlugin(plugin: unknown): void;
```

## Best Practices

### Performance

- Use lazy evaluation for large datasets where you don't need all results
- Use chunked processing for memory-constrained environments
- Use parallel processing for I/O-bound operations
- Set appropriate concurrency limits to avoid overwhelming resources

### Error Handling

- Use `breakOnError: false` to continue processing despite errors
- Implement proper error logging in plugins
- Use timeouts for async operations that might hang
- Validate inputs before processing large datasets

### Memory Management

- Prefer lazy evaluation over traditional array methods for large datasets
- Use chunked processing to limit memory usage
- Set appropriate buffer sizes for lazy iterators
- Consider garbage collection when processing very large datasets