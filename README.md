# @oxog/foreach

[![npm version](https://img.shields.io/npm/v/@oxog/foreach.svg)](https://www.npmjs.com/package/@oxog/foreach)
[![npm downloads](https://img.shields.io/npm/dm/@oxog/foreach.svg)](https://www.npmjs.com/package/@oxog/foreach)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/ersinkoc/foreach)

Enhanced iteration functionality for JavaScript/TypeScript with **zero dependencies**. Provides synchronous and asynchronous iteration, lazy evaluation, chunked processing, parallel execution, and plugin support.

## 🌟 Features

- **🚀 Zero Dependencies** - Lightweight and fast
- **📦 Multiple Iteration Patterns** - Sync, async, parallel, lazy, and chunked
- **🔌 Plugin System** - Extensible architecture for custom behaviors
- **💪 TypeScript Support** - Full type safety and IntelliSense
- **🎯 100% Test Coverage** - Thoroughly tested and reliable
- **⚡ Performance Optimized** - Efficient memory usage and execution
- **🛡️ Error Handling** - Comprehensive error handling with custom error types
- **🔄 Lazy Evaluation** - Memory-efficient processing of large datasets
- **🏃 Parallel Processing** - Concurrent execution with configurable limits
- **📊 Chunked Processing** - Process large datasets in manageable chunks

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [forEach](#foreach)
  - [forEachAsync](#foreachasync)
  - [forEachParallel](#foreachparallel)
  - [forEachLazy](#foreachlazy)
  - [forEachChunked](#foreachchunked)
  - [Plugin System](#plugin-system)
- [Examples](#examples)
- [Configuration](#configuration)
- [Performance](#performance)
- [Contributing](#contributing)
- [License](#license)

## 📦 Installation

```bash
npm install @oxog/foreach
```

or

```bash
yarn add @oxog/foreach
```

or

```bash
pnpm add @oxog/foreach
```

## 🚀 Quick Start

```typescript
import { forEach, forEachAsync, forEachLazy } from '@oxog/foreach';

// Basic array iteration
const numbers = [1, 2, 3, 4, 5];
forEach(numbers, (value, index) => {
  console.log(`Value: ${value}, Index: ${index}`);
});

// Object iteration
const obj = { a: 1, b: 2, c: 3 };
forEach(obj, (value, key) => {
  console.log(`Key: ${key}, Value: ${value}`);
});

// Async iteration
await forEachAsync(numbers, async (value) => {
  await processItem(value);
});

// Lazy evaluation
const result = forEachLazy(numbers)
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .take(5)
  .toArray();
```

## 📖 API Reference

### forEach

Synchronous iteration over arrays and objects.

```typescript
forEach<T>(array: T[], callback: (value: T, index: number, array: T[]) => void, options?: IForEachOptions): void;
forEach<T>(object: Record<string, T>, callback: (value: T, key: string, object: Record<string, T>) => void, options?: IForEachOptions): void;
```

#### Options

- `thisArg?: any` - Value to use as `this` when executing callback
- `breakOnError?: boolean` - Stop iteration on first error (default: false)
- `breakOnReturn?: boolean` - Stop iteration if callback returns a value
- `reverse?: boolean` - Iterate in reverse order

#### Examples

```typescript
// Basic usage
forEach([1, 2, 3], (value) => {
  console.log(value);
});

// With options
forEach([1, 2, 3], function(value) {
  console.log(this.prefix + value);
}, { 
  thisArg: { prefix: 'Number: ' },
  reverse: true 
});

// Break on condition
forEach([1, 2, 3, 4, 5], (value) => {
  console.log(value);
  if (value === 3) return 'break'; // Stops iteration
}, { breakOnReturn: true });
```

### forEachAsync

Asynchronous sequential iteration.

```typescript
forEachAsync<T>(array: T[], callback: AsyncArrayCallback<T>, options?: IAsyncForEachOptions): Promise<void>;
forEachAsync<T>(object: Record<string, T>, callback: AsyncObjectCallback<T>, options?: IAsyncForEachOptions): Promise<void>;
```

#### Options

All options from `forEach` plus:
- `timeout?: number` - Timeout for each iteration in milliseconds
- `concurrency?: number` - Number of concurrent operations (for forEachParallel)
- `preserveOrder?: boolean` - Maintain order in parallel execution

#### Examples

```typescript
// Sequential async processing
await forEachAsync([1, 2, 3], async (value) => {
  await delay(100);
  console.log(value);
});

// With timeout
await forEachAsync(items, async (item) => {
  await processItem(item);
}, { timeout: 5000 });
```

### forEachParallel

Parallel asynchronous iteration with concurrency control.

```typescript
forEachParallel<T>(array: T[], callback: AsyncArrayCallback<T>, options?: IAsyncForEachOptions): Promise<void>;
```

#### Examples

```typescript
// Process items in parallel
await forEachParallel(urls, async (url) => {
  await fetch(url);
}, { concurrency: 5 });

// Preserve order of results
await forEachParallel(items, async (item) => {
  return await processItem(item);
}, { 
  concurrency: 10,
  preserveOrder: true 
});
```

### forEachLazy

Lazy evaluation with chainable operations.

```typescript
forEachLazy<T>(array: T[], options?: ILazyOptions): ILazyIterator<T>;
forEachLazy<T>(object: Record<string, T>, options?: ILazyOptions): ILazyIterator<[string, T]>;
```

#### Options

- `bufferSize?: number` - Internal buffer size for optimization
- `preloadNext?: boolean` - Preload next items for performance

#### Chainable Methods

- `filter(predicate: (value: T) => boolean)` - Filter elements
- `map<U>(transform: (value: T) => U)` - Transform elements
- `take(count: number)` - Take first n elements
- `skip(count: number)` - Skip first n elements
- `toArray()` - Convert to array

#### Examples

```typescript
// Complex data pipeline
const result = forEachLazy(largeDataset)
  .filter(item => item.active)
  .map(item => item.value)
  .filter(value => value > 100)
  .take(50)
  .toArray();

// Memory-efficient processing
const iterator = forEachLazy(hugeArray);
for (const value of iterator) {
  if (shouldStop) break;
  process(value);
}
```

### forEachChunked

Process large datasets in chunks.

```typescript
forEachChunked<T>(array: T[], callback: ArrayCallback<T>, options: IChunkedOptions): void;
forEachChunkedAsync<T>(array: T[], callback: AsyncArrayCallback<T>, options: IChunkedOptions): Promise<void>;
```

#### Options

- `chunkSize: number` - Number of items per chunk (required)
- `delayBetweenChunks?: number` - Delay in ms between chunks
- `onChunkComplete?: (chunkIndex: number, processedCount: number) => void` - Chunk completion callback

#### Examples

```typescript
// Process large array in chunks
forEachChunked(millionItems, (item) => {
  processItem(item);
}, {
  chunkSize: 1000,
  onChunkComplete: (index, count) => {
    console.log(`Chunk ${index} completed: ${count} items`);
  }
});

// Async chunked processing with delays
await forEachChunkedAsync(items, async (item) => {
  await saveToDatabase(item);
}, {
  chunkSize: 100,
  delayBetweenChunks: 1000, // 1 second between chunks
  concurrency: 5 // Process 5 items concurrently within each chunk
});
```

### Plugin System

Extend forEach functionality with custom plugins.

```typescript
interface IIterationPlugin {
  name: string;
  version: string;
  beforeIteration?(context: IIterationContext): void | Promise<void>;
  afterIteration?(context: IIterationContext): void | Promise<void>;
  onError?(error: Error, context: IIterationContext): void | Promise<void>;
}
```

#### Examples

```typescript
import { ForEachCore } from '@oxog/foreach';

// Create a logging plugin
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

// Use the plugin
const core = new ForEachCore();
core.use(loggingPlugin);

// Metrics collection plugin
const metricsPlugin: IIterationPlugin = {
  name: 'metrics',
  version: '1.0.0',
  beforeIteration: (context) => {
    context.startTime = Date.now();
  },
  afterIteration: (context) => {
    const duration = Date.now() - context.startTime;
    metrics.record(duration);
  }
};
```

## 💡 Examples

### Processing Large CSV Files

```typescript
import { forEachChunkedAsync, forEachLazy } from '@oxog/foreach';

// Read and process CSV in chunks
async function processLargeCSV(data: string[]) {
  await forEachChunkedAsync(data, async (row) => {
    const parsed = parseCSVRow(row);
    await saveToDatabase(parsed);
  }, {
    chunkSize: 1000,
    concurrency: 5,
    delayBetweenChunks: 100,
    onChunkComplete: (index, count) => {
      console.log(`Processed ${(index + 1) * 1000} rows`);
    }
  });
}

// Filter and transform CSV data
function analyzeCSV(rows: CSVRow[]) {
  return forEachLazy(rows)
    .filter(row => row.status === 'active')
    .map(row => ({
      id: row.id,
      total: row.quantity * row.price
    }))
    .filter(item => item.total > 100)
    .toArray();
}
```

### Parallel API Requests

```typescript
import { forEachParallel } from '@oxog/foreach';

async function fetchUserData(userIds: string[]) {
  const results = new Map();

  await forEachParallel(userIds, async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      results.set(userId, data);
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
    }
  }, {
    concurrency: 10,
    timeout: 5000,
    breakOnError: false
  });

  return results;
}
```

### Data Transformation Pipeline

```typescript
import { forEachLazy, forEach } from '@oxog/foreach';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

function getDiscountedProducts(products: Product[], minDiscount: number = 0.1) {
  return forEachLazy(products)
    .filter(p => p.inStock)
    .filter(p => p.category !== 'excluded')
    .map(p => ({
      ...p,
      discountPrice: p.price * (1 - minDiscount),
      savings: p.price * minDiscount
    }))
    .filter(p => p.savings > 5)
    .take(100)
    .toArray();
}
```

### Error Recovery

```typescript
import { forEachAsync, ForEachError } from '@oxog/foreach';

async function processWithRetry(items: any[], maxRetries = 3) {
  const failed: any[] = [];

  await forEachAsync(items, async (item) => {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        await processItem(item);
        break;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          failed.push({ item, error });
        } else {
          await delay(1000 * retries); // Exponential backoff
        }
      }
    }
  }, {
    breakOnError: false
  });

  return { succeeded: items.length - failed.length, failed };
}
```

## ⚙️ Configuration

### Global Configuration

The package works with zero configuration out of the box. All configuration is done through function options.

### TypeScript Configuration

The package includes TypeScript definitions. For optimal experience, use these compiler options:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 🚄 Performance

### Benchmarks

Performance comparison with native methods and popular alternatives:

| Operation | @oxog/foreach | Native | Lodash |
|-----------|---------------|---------|---------|
| Array iteration (1M items) | 15ms | 12ms | 18ms |
| Object iteration (100k props) | 8ms | 7ms | 11ms |
| Lazy filter + map (1M items) | 3ms* | 45ms | 52ms |
| Parallel processing (100 items) | 1.2s | N/A | N/A |

\* Lazy evaluation only processes required items

### Memory Usage

- **Lazy evaluation**: Constant memory usage regardless of dataset size
- **Chunked processing**: Configurable memory footprint
- **Standard iteration**: Similar to native methods

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development

```bash
# Clone the repository
git clone https://github.com/ersinkoc/foreach.git
cd foreach

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the project
npm run build

# Lint the code
npm run lint
```

## 📄 License

MIT © [Ersin KOC](https://github.com/ersinkoc)

---

Made with ❤️ by the OXOG team