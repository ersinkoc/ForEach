import {
  forEach,
  forEachAsync,
  forEachParallel,
  forEachLazy,
  forEachChunked,
  forEachChunkedAsync,
  ForEachCore,
  type IIterationPlugin,
  type IIterationContext,
} from '../../src';

describe('Complete Workflow Integration Tests', () => {
  describe('Combined array operations', () => {
    it('should process large array with multiple techniques', async () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      const results = {
        sync: 0,
        async: 0,
        parallel: 0,
        chunked: 0,
        lazy: 0,
      };

      // Synchronous processing
      forEach(largeArray, (value) => {
        results.sync += value;
      });

      // Async sequential processing
      await forEachAsync(largeArray, async (value) => {
        results.async += value;
      });

      // Parallel processing
      await forEachParallel(largeArray, async (value) => {
        results.parallel += value;
      }, { concurrency: 10 });

      // Chunked processing
      forEachChunked(largeArray, (value) => {
        results.chunked += value;
      }, { chunkSize: 100 });

      // Lazy processing
      const lazySum = forEachLazy(largeArray)
        .filter(x => x < 1000)
        .map(x => x)
        .toArray()
        .reduce((sum, val) => sum + val, 0);
      results.lazy = lazySum;

      const expectedSum = 499500;
      expect(results.sync).toBe(expectedSum);
      expect(results.async).toBe(expectedSum);
      expect(results.parallel).toBe(expectedSum);
      expect(results.chunked).toBe(expectedSum);
      expect(results.lazy).toBe(expectedSum);
    });

    it('should handle error scenarios across different methods', async () => {
      const problematicArray = [1, 2, 3, 4, 5];
      const errorValue = 3;

      // Sync with error handling
      const syncResults: number[] = [];
      forEach(problematicArray, (value) => {
        if (value === errorValue) throw new Error('Sync error');
        syncResults.push(value);
      }, { breakOnError: false });

      // Async with error handling
      const asyncResults: number[] = [];
      await forEachAsync(problematicArray, async (value) => {
        if (value === errorValue) throw new Error('Async error');
        asyncResults.push(value);
      }, { breakOnError: false });

      // Parallel with error handling
      const parallelResults: number[] = [];
      await forEachParallel(problematicArray, async (value) => {
        if (value === errorValue) throw new Error('Parallel error');
        parallelResults.push(value);
      }, { concurrency: 2, breakOnError: false });

      expect(syncResults).toEqual([1, 2, 4, 5]);
      expect(asyncResults).toEqual([1, 2, 4, 5]);
      expect(parallelResults.sort()).toEqual([1, 2, 4, 5]);
    });
  });

  describe('Plugin system integration', () => {
    it('should work with multiple plugins', async () => {
      const core = new ForEachCore();
      const executionLog: string[] = [];

      const loggingPlugin: IIterationPlugin = {
        name: 'logger',
        version: '1.0.0',
        beforeIteration: (context) => {
          executionLog.push(`before-${context.index}`);
        },
        afterIteration: (context) => {
          executionLog.push(`after-${context.index}`);
        },
      };

      const metricsPlugin: IIterationPlugin = {
        name: 'metrics',
        version: '1.0.0',
        beforeIteration: (context) => {
          executionLog.push(`metrics-start-${context.index}`);
        },
      };

      core.use(loggingPlugin);
      core.use(metricsPlugin);

      // Note: In a real implementation, you'd need to integrate
      // the plugin system with the forEach functions
      expect(core.getPlugins()).toHaveLength(2);
    });

    it('should handle plugin lifecycle', () => {
      const core = new ForEachCore();
      const lifecycleEvents: string[] = [];

      const plugin: IIterationPlugin = {
        name: 'lifecycle-test',
        version: '1.0.0',
      };

      core.use(plugin);
      expect(core.getPlugins()).toHaveLength(1);

      core.remove('lifecycle-test');
      expect(core.getPlugins()).toHaveLength(0);
    });
  });

  describe('Real-world scenarios', () => {
    it('should process CSV-like data', async () => {
      const csvData = [
        { id: 1, name: 'John', score: 85 },
        { id: 2, name: 'Jane', score: 92 },
        { id: 3, name: 'Bob', score: 78 },
        { id: 4, name: 'Alice', score: 95 },
        { id: 5, name: 'Charlie', score: 88 },
      ];

      // Calculate average score
      let totalScore = 0;
      let count = 0;
      forEach(csvData, (row) => {
        totalScore += row.score;
        count++;
      });
      const average = totalScore / count;

      expect(average).toBe(87.6);

      // Find high scorers in parallel
      const highScorers: string[] = [];
      await forEachParallel(csvData, async (row) => {
        if (row.score > 90) {
          highScorers.push(row.name);
        }
      }, { concurrency: 3 });

      expect(highScorers.sort()).toEqual(['Alice', 'Jane']);

      // Process in chunks for batch operations
      const processedBatches: number[] = [];
      forEachChunked(csvData, (row) => {
        // Simulate batch processing
      }, {
        chunkSize: 2,
        onChunkComplete: (index, count) => {
          processedBatches.push(count);
        }
      });

      expect(processedBatches).toEqual([2, 2, 1]);
    });

    it('should handle data transformation pipeline', () => {
      const data = Array.from({ length: 100 }, (_, i) => i);

      const result = forEachLazy(data)
        .filter(x => x % 2 === 0)     // Even numbers
        .map(x => x * x)               // Square them
        .filter(x => x < 1000)         // Less than 1000
        .take(10)                      // First 10
        .toArray();

      expect(result).toEqual([0, 4, 16, 36, 64, 100, 144, 196, 256, 324]);
    });

    it('should handle mixed sync/async operations', async () => {
      const data = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const results: Record<string, number> = {};

      // First pass: sync transformation
      forEach(data, (value, key) => {
        results[key] = value * 2;
      });

      // Second pass: async enrichment
      await forEachAsync(results, async (value, key) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        results[key] = value + 10;
      });

      expect(results).toEqual({ a: 12, b: 14, c: 16, d: 18, e: 20 });
    });

    it('should handle nested iterations', async () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];

      const flattened: number[] = [];

      forEach(matrix, (row) => {
        forEach(row, (value) => {
          flattened.push(value);
        });
      });

      expect(flattened).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

      // Async nested iteration
      const asyncFlattened: number[] = [];
      await forEachAsync(matrix, async (row) => {
        await forEachAsync(row, async (value) => {
          asyncFlattened.push(value);
        });
      });

      expect(asyncFlattened).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('Performance optimization scenarios', () => {
    it('should efficiently process large datasets with chunking', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        value: Math.random() * 100,
      }));

      let processedCount = 0;
      const startTime = Date.now();

      await forEachChunkedAsync(largeDataset, async (item) => {
        // Simulate processing
        processedCount++;
      }, {
        chunkSize: 100,
        concurrency: 5,
        delayBetweenChunks: 1,
      });

      const duration = Date.now() - startTime;

      expect(processedCount).toBe(10000);
      expect(duration).toBeGreaterThan(100); // At least 100 chunks * 1ms delay
    });

    it('should handle memory-efficient lazy processing', () => {
      // Simulate infinite sequence
      function* infiniteSequence() {
        let i = 0;
        while (true) {
          yield i++;
        }
      }

      const gen = infiniteSequence();
      const limited = Array.from({ length: 10 }, () => gen.next().value);

      const result = forEachLazy(limited)
        .map(x => x * 2)
        .filter(x => x > 5)
        .take(3)
        .toArray();

      expect(result).toEqual([6, 8, 10]);
    });
  });

  describe('Edge cases and special scenarios', () => {
    it('should handle sparse arrays', () => {
      const sparse = new Array(5);
      sparse[1] = 'a';
      sparse[3] = 'b';

      const result: Array<[number, string | undefined]> = [];
      forEach(sparse, (value, index) => {
        result.push([index, value]);
      });

      expect(result).toEqual([
        [0, undefined],
        [1, 'a'],
        [2, undefined],
        [3, 'b'],
        [4, undefined],
      ]);
    });

    it('should handle objects with special properties', () => {
      const special = {
        normal: 1,
        'with-dash': 2,
        '123': 3,
        '': 4,
        [Symbol.for('test')]: 5, // Should be skipped
      };

      const keys: string[] = [];
      forEach(special, (value, key) => {
        keys.push(key);
      });

      expect(keys.sort()).toEqual(['', '123', 'normal', 'with-dash']);
    });

    it('should handle circular references safely', () => {
      interface CircularNode {
        value: number;
        next?: CircularNode;
      }

      const node1: CircularNode = { value: 1 };
      const node2: CircularNode = { value: 2 };
      const node3: CircularNode = { value: 3 };

      node1.next = node2;
      node2.next = node3;
      node3.next = node1; // Circular reference

      const nodes = [node1, node2, node3];
      const values: number[] = [];

      forEach(nodes, (node) => {
        values.push(node.value);
      });

      expect(values).toEqual([1, 2, 3]);
    });
  });
});