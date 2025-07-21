import { forEachChunked, forEachChunkedAsync } from '../../../src/core/foreach-chunked';
import { ForEachError } from '../../../src/types/errors';

describe('forEachChunked', () => {
  describe('Array chunked iteration', () => {
    it('should iterate in chunks', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result: number[] = [];
      const chunkInfo: Array<{ index: number; count: number }> = [];

      forEachChunked(arr, (value) => {
        result.push(value);
      }, {
        chunkSize: 3,
        onChunkComplete: (index, count) => {
          chunkInfo.push({ index, count });
        }
      });

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(chunkInfo).toEqual([
        { index: 0, count: 3 },
        { index: 1, count: 3 },
        { index: 2, count: 3 },
        { index: 3, count: 1 }
      ]);
    });

    it('should handle chunk size larger than array', () => {
      const arr = [1, 2, 3];
      const result: number[] = [];
      let chunkCount = 0;

      forEachChunked(arr, (value) => {
        result.push(value);
      }, {
        chunkSize: 10,
        onChunkComplete: () => {
          chunkCount++;
        }
      });

      expect(result).toEqual([1, 2, 3]);
      expect(chunkCount).toBe(1);
    });

    it('should handle errors within chunks', () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      expect(() => {
        forEachChunked(arr, (value) => {
          result.push(value);
          if (value === 3) {
            throw new Error('Test error');
          }
        }, {
          chunkSize: 2,
          breakOnError: true
        });
      }).toThrow();

      expect(result).toEqual([1, 2, 3]);
    });

    it('should continue on error when breakOnError is false', () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      forEachChunked(arr, (value) => {
        if (value === 3) {
          throw new Error('Test error');
        }
        result.push(value);
      }, {
        chunkSize: 2,
        breakOnError: false
      });

      expect(result).toEqual([1, 2, 4, 5]);
    });

    it('should support reverse iteration', () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      forEachChunked(arr, (value) => {
        result.push(value);
      }, {
        chunkSize: 2,
        reverse: true
      });

      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should provide correct indices', () => {
      const arr = ['a', 'b', 'c', 'd'];
      const indices: number[] = [];

      forEachChunked(arr, (value, index) => {
        indices.push(index);
      }, {
        chunkSize: 2
      });

      expect(indices).toEqual([0, 1, 2, 3]);
    });
  });

  describe('Object chunked iteration', () => {
    it('should iterate object in chunks', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const result: Array<[string, number]> = [];
      const chunkInfo: number[] = [];

      forEachChunked(obj, (value, key) => {
        result.push([key, value]);
      }, {
        chunkSize: 2,
        onChunkComplete: (index, count) => {
          chunkInfo.push(count);
        }
      });

      expect(result.length).toBe(5);
      expect(chunkInfo).toEqual([2, 2, 1]);
    });

    it('should handle empty objects', () => {
      const result: any[] = [];
      let chunkCount = 0;

      forEachChunked({}, (value) => {
        result.push(value);
      }, {
        chunkSize: 5,
        onChunkComplete: () => {
          chunkCount++;
        }
      });

      expect(result).toEqual([]);
      expect(chunkCount).toBe(0);
    });

    it('should skip inherited properties', () => {
      const parent = { inherited: true };
      const obj = Object.create(parent);
      obj.a = 1;
      obj.b = 2;

      const keys: string[] = [];

      forEachChunked(obj, (value, key) => {
        keys.push(key);
      }, {
        chunkSize: 10
      });

      expect(keys.sort()).toEqual(['a', 'b']);
    });
  });

  describe('Input validation', () => {
    it('should validate chunk size', () => {
      expect(() => {
        forEachChunked([1, 2, 3], () => {}, { chunkSize: 0 });
      }).toThrow(ForEachError);

      expect(() => {
        forEachChunked([1, 2, 3], () => {}, { chunkSize: -1 });
      }).toThrow(ForEachError);

      expect(() => {
        forEachChunked([1, 2, 3], () => {}, { chunkSize: 10001 });
      }).toThrow(ForEachError);
    });

    it('should validate options object', () => {
      expect(() => {
        forEachChunked([1, 2, 3], () => {}, null as any);
      }).toThrow();
    });
  });
});

describe('forEachChunkedAsync', () => {
  describe('Array async chunked iteration', () => {
    it('should iterate asynchronously in chunks', async () => {
      const arr = [1, 2, 3, 4, 5, 6];
      const result: number[] = [];
      const chunkInfo: number[] = [];

      await forEachChunkedAsync(arr, async (value) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        result.push(value);
      }, {
        chunkSize: 2,
        onChunkComplete: (index, count) => {
          chunkInfo.push(count);
        }
      });

      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
      expect(chunkInfo).toEqual([2, 2, 2]);
    });

    it('should support delay between chunks', async () => {
      const arr = [1, 2, 3, 4];
      const timestamps: number[] = [];

      await forEachChunkedAsync(arr, async () => {
        timestamps.push(Date.now());
      }, {
        chunkSize: 2,
        delayBetweenChunks: 50
      });

      expect(timestamps.length).toBe(4);
      expect(timestamps[2] - timestamps[1]).toBeGreaterThanOrEqual(50);
    });

    it('should support concurrent execution within chunks', async () => {
      const arr = [1, 2, 3, 4, 5, 6];
      const startTimes: number[] = [];
      const endTimes: number[] = [];

      await forEachChunkedAsync(arr, async (value) => {
        startTimes.push(Date.now());
        await new Promise(resolve => setTimeout(resolve, 50));
        endTimes.push(Date.now());
      }, {
        chunkSize: 3,
        concurrency: 3
      });

      // Within a chunk, items should start roughly at the same time
      const firstChunkStarts = startTimes.slice(0, 3);
      const maxDiff = Math.max(...firstChunkStarts) - Math.min(...firstChunkStarts);
      expect(maxDiff).toBeLessThan(20); // Allow some scheduling variance
    });

    it('should handle errors in async chunks', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      await expect(
        forEachChunkedAsync(arr, async (value) => {
          result.push(value);
          if (value === 3) {
            throw new Error('Async error');
          }
        }, {
          chunkSize: 2,
          breakOnError: true
        })
      ).rejects.toThrow();

      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('should continue on error when specified', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      await forEachChunkedAsync(arr, async (value) => {
        if (value === 3) {
          throw new Error('Skip this');
        }
        result.push(value);
      }, {
        chunkSize: 2,
        breakOnError: false
      });

      expect(result).toEqual([1, 2, 4, 5]);
    });

    it('should support reverse async iteration', async () => {
      const arr = [1, 2, 3, 4];
      const result: number[] = [];

      await forEachChunkedAsync(arr, async (value) => {
        result.push(value);
      }, {
        chunkSize: 2,
        reverse: true
      });

      expect(result).toEqual([4, 3, 2, 1]);
    });
  });

  describe('Object async chunked iteration', () => {
    it('should iterate object asynchronously in chunks', async () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = new Map<string, number>();

      await forEachChunkedAsync(obj, async (value, key) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        result.set(key, value);
      }, {
        chunkSize: 2
      });

      expect(Array.from(result.entries()).sort()).toEqual([
        ['a', 1], ['b', 2], ['c', 3], ['d', 4]
      ]);
    });

    it('should handle concurrent object processing', async () => {
      const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };
      const processing = new Set<string>();
      const maxConcurrent = { value: 0 };

      await forEachChunkedAsync(obj, async (value, key) => {
        processing.add(key);
        maxConcurrent.value = Math.max(maxConcurrent.value, processing.size);
        await new Promise(resolve => setTimeout(resolve, 50));
        processing.delete(key);
      }, {
        chunkSize: 3,
        concurrency: 2
      });

      // Should process at most chunkSize (3) items concurrently
      expect(maxConcurrent.value).toBeLessThanOrEqual(3);
    });

    it('should skip inherited properties in async iteration', async () => {
      const parent = { inherited: 'skip' };
      const obj = Object.create(parent);
      obj.own1 = 1;
      obj.own2 = 2;

      const keys: string[] = [];

      await forEachChunkedAsync(obj, async (value, key) => {
        keys.push(key);
      }, {
        chunkSize: 5
      });

      expect(keys.sort()).toEqual(['own1', 'own2']);
    });
  });

  describe('Performance characteristics', () => {
    it('should process chunks sequentially by default', async () => {
      const arr = [1, 2, 3, 4, 5, 6];
      const chunkStarts: number[] = [];

      await forEachChunkedAsync(arr, async (value, index) => {
        if (index % 2 === 0) {
          chunkStarts.push(Date.now());
        }
        await new Promise(resolve => setTimeout(resolve, 20));
      }, {
        chunkSize: 2,
        concurrency: 1
      });

      // Each chunk should start after the previous one completes
      expect(chunkStarts[1] - chunkStarts[0]).toBeGreaterThanOrEqual(40);
      expect(chunkStarts[2] - chunkStarts[1]).toBeGreaterThanOrEqual(40);
    });

    it('should respect chunk boundaries', async () => {
      const arr = Array.from({ length: 10 }, (_, i) => i);
      const chunkBoundaries: number[][] = [];
      let currentChunk: number[] = [];

      await forEachChunkedAsync(arr, async (value) => {
        currentChunk.push(value);
      }, {
        chunkSize: 3,
        onChunkComplete: () => {
          chunkBoundaries.push([...currentChunk]);
          currentChunk = [];
        }
      });

      expect(chunkBoundaries).toEqual([
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [9]
      ]);
    });
  });
});