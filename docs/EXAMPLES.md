# Examples

This document provides practical examples of using @oxog/foreach in real-world scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Data Processing](#data-processing)
- [Async Operations](#async-operations)
- [Performance Optimization](#performance-optimization)
- [Plugin Development](#plugin-development)
- [Real-World Use Cases](#real-world-use-cases)

## Basic Usage

### Simple Array Iteration

```typescript
import { forEach } from '@oxog/foreach';

const numbers = [1, 2, 3, 4, 5];

// Basic iteration
forEach(numbers, (value, index) => {
  console.log(`Position ${index}: ${value}`);
});

// With custom context
const multiplier = { factor: 10 };
forEach(numbers, function(value) {
  console.log(value * this.factor);
}, { thisArg: multiplier });
```

### Object Iteration

```typescript
const user = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  active: true
};

forEach(user, (value, key) => {
  console.log(`${key}: ${value}`);
});

// Filter while iterating
const activeFields: string[] = [];
forEach(user, (value, key) => {
  if (value === true || (typeof value === 'string' && value.length > 0)) {
    activeFields.push(key);
  }
});
```

### Early Termination

```typescript
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Break on condition
forEach(data, (value) => {
  console.log(value);
  if (value === 5) {
    return 'break'; // Stops iteration
  }
}, { breakOnReturn: true });

// Handle errors gracefully
forEach(['1', '2', 'invalid', '4'], (value) => {
  const num = parseInt(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number: ${value}`);
  }
  console.log(num * 2);
}, { breakOnError: false }); // Continues despite errors
```

## Data Processing

### CSV Data Processing

```typescript
import { forEach, forEachChunked } from '@oxog/foreach';

interface CSVRow {
  id: string;
  name: string;
  email: string;
  score: number;
}

const csvData: CSVRow[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', score: 95 },
  { id: '2', name: 'Bob', email: 'bob@example.com', score: 87 },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', score: 92 },
  // ... thousands more rows
];

// Process in chunks to manage memory
const results = {
  totalScore: 0,
  count: 0,
  highScorers: [] as string[]
};

forEachChunked(csvData, (row) => {
  results.totalScore += row.score;
  results.count++;
  
  if (row.score > 90) {
    results.highScorers.push(row.name);
  }
}, {
  chunkSize: 1000,
  onChunkComplete: (index, processed) => {
    console.log(`Processed chunk ${index + 1}: ${processed} records`);
  }
});

const averageScore = results.totalScore / results.count;
console.log(`Average score: ${averageScore.toFixed(2)}`);
console.log(`High scorers: ${results.highScorers.join(', ')}`);
```

### Data Transformation Pipeline

```typescript
import { forEachLazy } from '@oxog/foreach';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  reviews: { rating: number; count: number };
}

const products: Product[] = [
  {
    id: 'p1',
    name: 'Laptop Pro',
    price: 1299,
    category: 'Electronics',
    inStock: true,
    reviews: { rating: 4.5, count: 128 }
  },
  // ... more products
];

// Complex filtering and transformation
const discountedProducts = forEachLazy(products)
  .filter(p => p.inStock)
  .filter(p => p.reviews.rating > 4.0)
  .filter(p => p.reviews.count > 10)
  .map(p => ({
    ...p,
    discountPrice: p.price * 0.8,
    savings: p.price * 0.2,
    avgRating: p.reviews.rating
  }))
  .filter(p => p.savings > 50)
  .take(20)
  .toArray();

console.log('Top discounted products:', discountedProducts);
```

### JSON Processing

```typescript
import { forEach, forEachLazy } from '@oxog/foreach';

// Process nested JSON structure
const apiResponse = {
  users: [
    { id: 1, profile: { name: 'John', settings: { theme: 'dark' } } },
    { id: 2, profile: { name: 'Jane', settings: { theme: 'light' } } }
  ],
  metadata: { version: '1.0', timestamp: Date.now() }
};

// Extract and flatten data
const flattenedUsers: Array<{ id: number; name: string; theme: string }> = [];

forEach(apiResponse.users, (user) => {
  flattenedUsers.push({
    id: user.id,
    name: user.profile.name,
    theme: user.profile.settings.theme
  });
});
```

## Async Operations

### API Data Fetching

```typescript
import { forEachAsync, forEachParallel } from '@oxog/foreach';

interface User {
  id: number;
  name: string;
  posts?: Post[];
}

interface Post {
  id: number;
  title: string;
  content: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

async function fetchUserPosts(userId: number): Promise<Post[]> {
  const response = await fetch(`/api/users/${userId}/posts`);
  return response.json();
}

// Sequential processing
async function processUsersSequentially(userIds: number[]) {
  const users: User[] = [];
  
  await forEachAsync(userIds, async (id) => {
    console.log(`Fetching user ${id}...`);
    const user = await fetchUser(id);
    user.posts = await fetchUserPosts(id);
    users.push(user);
    console.log(`✓ User ${id} complete`);
  });
  
  return users;
}

// Parallel processing with concurrency control
async function processUsersParallel(userIds: number[]) {
  const users = new Map<number, User>();
  
  await forEachParallel(userIds, async (id) => {
    const user = await fetchUser(id);
    user.posts = await fetchUserPosts(id);
    users.set(id, user);
  }, {
    concurrency: 5, // Process 5 users at a time
    timeout: 10000  // 10 second timeout per user
  });
  
  return Array.from(users.values());
}
```

### Batch Processing with Retry Logic

```typescript
import { forEachAsync } from '@oxog/foreach';

async function processWithRetry<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  maxRetries: number = 3
) {
  const failed: Array<{ item: T; error: Error }> = [];
  
  await forEachAsync(items, async (item) => {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        await processor(item);
        break; // Success, exit retry loop
      } catch (error) {
        retries++;
        if (retries > maxRetries) {
          failed.push({ item, error: error as Error });
          break;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, {
    breakOnError: false // Continue processing other items
  });
  
  return { failed };
}

// Usage
const imageUrls = ['url1.jpg', 'url2.jpg', 'url3.jpg'];

const { failed } = await processWithRetry(imageUrls, async (url) => {
  await uploadImage(url);
}, 3);

if (failed.length > 0) {
  console.log('Failed uploads:', failed.map(f => f.item));
}
```

### Database Operations

```typescript
import { forEachChunkedAsync } from '@oxog/foreach';

interface DatabaseRecord {
  id: string;
  data: any;
  updated_at?: Date;
}

async function bulkUpdateDatabase(records: DatabaseRecord[]) {
  let totalUpdated = 0;
  
  await forEachChunkedAsync(records, async (record) => {
    record.updated_at = new Date();
    await database.update('records', record.id, record);
    totalUpdated++;
  }, {
    chunkSize: 100,           // Process 100 records per chunk
    concurrency: 5,           // 5 concurrent operations per chunk
    delayBetweenChunks: 100,  // 100ms delay between chunks
    onChunkComplete: (index, count) => {
      console.log(`Chunk ${index + 1} complete: ${count} records updated`);
    }
  });
  
  console.log(`Total records updated: ${totalUpdated}`);
}
```

## Performance Optimization

### Memory-Efficient Large Dataset Processing

```typescript
import { forEachLazy, forEachGenerator } from '@oxog/foreach';

// Process millions of records without loading all into memory
function* generateLargeDataset() {
  for (let i = 0; i < 10_000_000; i++) {
    yield {
      id: i,
      timestamp: Date.now() + i,
      value: Math.random() * 1000,
      category: ['A', 'B', 'C', 'D'][i % 4]
    };
  }
}

// Memory-efficient processing using generators
function processLargeDatasetEfficiently() {
  const generator = generateLargeDataset();
  const batch: any[] = [];
  const batchSize = 1000;
  let totalProcessed = 0;
  
  for (const item of generator) {
    batch.push(item);
    
    if (batch.length === batchSize) {
      // Process batch
      const highValueItems = forEachLazy(batch)
        .filter(item => item.value > 800)
        .map(item => ({ id: item.id, value: item.value }))
        .toArray();
      
      totalProcessed += highValueItems.length;
      batch.length = 0; // Clear batch
      
      if (totalProcessed >= 1000) break; // Stop after finding 1000 items
    }
  }
  
  console.log(`Found ${totalProcessed} high-value items`);
}
```

### Lazy vs Traditional Comparison

```typescript
import { forEachLazy } from '@oxog/foreach';

const hugeArray = Array.from({ length: 1_000_000 }, (_, i) => i);

// Traditional approach - processes everything
console.time('Traditional');
const traditional = hugeArray
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .filter(n => n > 1_000_000)
  .slice(0, 10);
console.timeEnd('Traditional');

// Lazy approach - processes only what's needed
console.time('Lazy');
const lazy = forEachLazy(hugeArray)
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .filter(n => n > 1_000_000)
  .take(10)
  .toArray();
console.timeEnd('Lazy');

console.log('Results equal:', JSON.stringify(traditional) === JSON.stringify(lazy));
```

## Plugin Development

### Logging Plugin

```typescript
import { IIterationPlugin, IIterationContext } from '@oxog/foreach';

class LoggingPlugin implements IIterationPlugin {
  name = 'logger';
  version = '1.0.0';
  
  private startTime: number = 0;
  private processedCount: number = 0;
  
  beforeIteration(context: IIterationContext): void {
    if (context.isFirst) {
      this.startTime = Date.now();
      this.processedCount = 0;
      console.log(`🚀 Starting iteration of ${context.total} items`);
    }
    
    this.processedCount++;
    
    if (this.processedCount % 1000 === 0) {
      const elapsed = Date.now() - this.startTime;
      const rate = this.processedCount / (elapsed / 1000);
      console.log(`📊 Processed ${this.processedCount}/${context.total} (${rate.toFixed(2)} items/sec)`);
    }
  }
  
  afterIteration(context: IIterationContext): void {
    if (context.isLast) {
      const elapsed = Date.now() - this.startTime;
      console.log(`✅ Completed ${context.total} items in ${elapsed}ms`);
    }
  }
  
  onError(error: Error, context: IIterationContext): void {
    console.error(`❌ Error at index ${context.index}:`, error.message);
  }
}
```

### Performance Monitoring Plugin

```typescript
class PerformancePlugin implements IIterationPlugin {
  name = 'performance';
  version = '1.0.0';
  
  private metrics = new Map<number, number>();
  private slowItems: Array<{ index: number; duration: number }> = [];
  
  beforeIteration(context: IIterationContext): void {
    this.metrics.set(context.index, performance.now());
  }
  
  afterIteration(context: IIterationContext): void {
    const startTime = this.metrics.get(context.index);
    if (startTime) {
      const duration = performance.now() - startTime;
      
      if (duration > 100) { // Flag items taking longer than 100ms
        this.slowItems.push({ index: context.index, duration });
      }
      
      this.metrics.delete(context.index);
      
      if (context.isLast && this.slowItems.length > 0) {
        console.log('⚠️  Slow items detected:', this.slowItems);
      }
    }
  }
}
```

### Circuit Breaker Plugin

```typescript
class CircuitBreakerPlugin implements IIterationPlugin {
  name = 'circuit-breaker';
  version = '1.0.0';
  
  private errorCount = 0;
  private readonly maxErrors: number;
  private readonly windowSize: number;
  private errorWindow: number[] = [];
  
  constructor(maxErrors: number = 5, windowSize: number = 100) {
    this.maxErrors = maxErrors;
    this.windowSize = windowSize;
  }
  
  onError(error: Error, context: IIterationContext): void {
    this.errorCount++;
    this.errorWindow.push(context.index);
    
    // Keep only recent errors within window
    this.errorWindow = this.errorWindow.filter(
      index => context.index - index < this.windowSize
    );
    
    if (this.errorWindow.length >= this.maxErrors) {
      throw new Error(
        `Circuit breaker triggered: ${this.maxErrors} errors in ${this.windowSize} items`
      );
    }
  }
}
```

## Real-World Use Cases

### E-commerce Product Sync

```typescript
import { forEachParallel, forEachChunkedAsync } from '@oxog/foreach';

interface Product {
  sku: string;
  name: string;
  price: number;
  inventory: number;
}

class ProductSyncService {
  async syncProducts(products: Product[]) {
    console.log(`Syncing ${products.length} products...`);
    
    const results = {
      updated: 0,
      created: 0,
      errors: [] as Array<{ sku: string; error: string }>
    };
    
    await forEachChunkedAsync(products, async (product) => {
      try {
        const existing = await this.findProductBySku(product.sku);
        
        if (existing) {
          await this.updateProduct(product);
          results.updated++;
        } else {
          await this.createProduct(product);
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          sku: product.sku,
          error: (error as Error).message
        });
      }
    }, {
      chunkSize: 50,
      concurrency: 10,
      delayBetweenChunks: 200,
      breakOnError: false,
      onChunkComplete: (index, count) => {
        console.log(`✓ Chunk ${index + 1} complete: ${count} products processed`);
      }
    });
    
    console.log('Sync complete:', results);
    return results;
  }
  
  private async findProductBySku(sku: string): Promise<Product | null> {
    // Database lookup
    return null;
  }
  
  private async updateProduct(product: Product): Promise<void> {
    // Update in database
  }
  
  private async createProduct(product: Product): Promise<void> {
    // Create in database
  }
}
```

### Log File Analysis

```typescript
import { forEachLazy, forEach } from '@oxog/foreach';

interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  service: string;
}

class LogAnalyzer {
  analyzeLogFile(logEntries: LogEntry[]) {
    const analysis = {
      totalEntries: 0,
      errorCount: 0,
      warningCount: 0,
      servicesWithErrors: new Set<string>(),
      errorsByHour: new Map<number, number>(),
      topErrors: new Map<string, number>()
    };
    
    // Use lazy evaluation for memory efficiency with large log files
    forEachLazy(logEntries)
      .filter(entry => entry.level === 'ERROR' || entry.level === 'WARN')
      .forEach(entry => {
        analysis.totalEntries++;
        
        if (entry.level === 'ERROR') {
          analysis.errorCount++;
          analysis.servicesWithErrors.add(entry.service);
          
          const hour = entry.timestamp.getHours();
          analysis.errorsByHour.set(hour, (analysis.errorsByHour.get(hour) || 0) + 1);
          
          // Track error patterns
          const errorType = this.extractErrorType(entry.message);
          analysis.topErrors.set(errorType, (analysis.topErrors.get(errorType) || 0) + 1);
        } else {
          analysis.warningCount++;
        }
      });
    
    return this.formatAnalysisReport(analysis);
  }
  
  private extractErrorType(message: string): string {
    // Extract error type from message
    const match = message.match(/^(\w+Error|Exception)/);
    return match ? match[1] : 'Unknown';
  }
  
  private formatAnalysisReport(analysis: any) {
    return {
      summary: {
        total: analysis.totalEntries,
        errors: analysis.errorCount,
        warnings: analysis.warningCount,
        errorRate: (analysis.errorCount / analysis.totalEntries * 100).toFixed(2) + '%'
      },
      affectedServices: Array.from(analysis.servicesWithErrors),
      errorDistribution: Object.fromEntries(analysis.errorsByHour),
      topErrorTypes: Array.from(analysis.topErrors.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    };
  }
}
```

### Data Migration

```typescript
import { forEachChunkedAsync } from '@oxog/foreach';

interface LegacyRecord {
  id: string;
  data: any;
}

interface ModernRecord {
  id: string;
  normalizedData: any;
  migratedAt: Date;
}

class DataMigrationService {
  async migrateData(legacyRecords: LegacyRecord[]) {
    const migrationStats = {
      total: legacyRecords.length,
      migrated: 0,
      skipped: 0,
      failed: 0,
      startTime: Date.now()
    };
    
    await forEachChunkedAsync(legacyRecords, async (record) => {
      try {
        // Check if already migrated
        const exists = await this.checkIfMigrated(record.id);
        if (exists) {
          migrationStats.skipped++;
          return;
        }
        
        // Transform data
        const modernRecord: ModernRecord = {
          id: record.id,
          normalizedData: this.normalizeData(record.data),
          migratedAt: new Date()
        };
        
        // Save to new system
        await this.saveModernRecord(modernRecord);
        migrationStats.migrated++;
        
      } catch (error) {
        console.error(`Failed to migrate record ${record.id}:`, error);
        migrationStats.failed++;
      }
    }, {
      chunkSize: 100,
      concurrency: 5,
      delayBetweenChunks: 500, // Rate limiting
      onChunkComplete: (index, count) => {
        const progress = ((index + 1) * 100 / Math.ceil(migrationStats.total / 100)) * 100;
        console.log(`Migration progress: ${progress.toFixed(1)}%`);
      }
    });
    
    const duration = Date.now() - migrationStats.startTime;
    console.log(`Migration completed in ${duration}ms:`, migrationStats);
    
    return migrationStats;
  }
  
  private async checkIfMigrated(id: string): Promise<boolean> {
    // Check if record exists in new system
    return false;
  }
  
  private normalizeData(data: any): any {
    // Transform legacy data format to modern format
    return data;
  }
  
  private async saveModernRecord(record: ModernRecord): Promise<void> {
    // Save to new database
  }
}
```

These examples demonstrate the versatility and power of @oxog/foreach in handling various real-world scenarios efficiently and safely.