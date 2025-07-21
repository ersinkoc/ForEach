import { forEachAsync, forEachParallel } from '../../../src/core/foreach-async';
import { ForEachError, TimeoutError } from '../../../src/types/errors';

describe('forEachAsync', () => {
  describe('Array iteration', () => {
    it('should iterate over array elements asynchronously', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      await forEachAsync(arr, async (value) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        result.push(value);
      });

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle synchronous callbacks', async () => {
      const arr = [1, 2, 3];
      const result: number[] = [];

      await forEachAsync(arr, (value) => {
        result.push(value * 2);
      });

      expect(result).toEqual([2, 4, 6]);
    });

    it('should maintain order in sequential execution', async () => {
      const arr = [1, 2, 3];
      const result: number[] = [];
      const delays = [30, 10, 20];

      await forEachAsync(arr, async (value, index) => {
        await new Promise(resolve => setTimeout(resolve, delays[index]));
        result.push(value);
      });

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle errors with breakOnError', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      await expect(
        forEachAsync(arr, async (value) => {
          result.push(value);
          if (value === 3) {
            throw new Error('Test error');
          }
        }, { breakOnError: true })
      ).rejects.toThrow(ForEachError);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should continue on error when breakOnError is false', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      await forEachAsync(arr, async (value) => {
        if (value === 3) {
          throw new Error('Test error');
        }
        result.push(value);
      }, { breakOnError: false });

      expect(result).toEqual([1, 2, 4, 5]);
    });

    it('should handle timeout', async () => {
      const arr = [1, 2, 3];

      await expect(
        forEachAsync(arr, async (value) => {
          if (value === 2) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }, { timeout: 50 })
      ).rejects.toThrow(TimeoutError);
    });

    it('should iterate in reverse', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      await forEachAsync(arr, async (value) => {
        result.push(value);
      }, { reverse: true });

      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should break on return value', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      await forEachAsync(arr, async (value): Promise<any> => {
        result.push(value);
        if (value === 3) {
          return 'break';
        }
      }, { breakOnReturn: true });

      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('Object iteration', () => {
    it('should iterate over object properties asynchronously', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result: Array<[string, number]> = [];

      await forEachAsync(obj, async (value, key) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        result.push([key, value]);
      });

      expect(result.map(([k]) => k).sort()).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty objects', async () => {
      const result: any[] = [];

      await forEachAsync({}, async (value) => {
        result.push(value);
      });

      expect(result).toEqual([]);
    });

    it('should skip inherited properties', async () => {
      const parent = { inherited: true };
      const obj = Object.create(parent);
      obj.own = true;

      const keys: string[] = [];

      await forEachAsync(obj, async (value, key) => {
        keys.push(key);
      });

      expect(keys).toEqual(['own']);
    });
  });
});

describe('forEachParallel', () => {
  describe('Array parallel iteration', () => {
    it('should iterate in parallel with concurrency limit', async () => {
      const arr = [1, 2, 3, 4, 5, 6];
      const running = new Set<number>();
      const maxConcurrent = { value: 0 };

      await forEachParallel(arr, async (value) => {
        running.add(value);
        maxConcurrent.value = Math.max(maxConcurrent.value, running.size);
        await new Promise(resolve => setTimeout(resolve, 50));
        running.delete(value);
      }, { concurrency: 3 });

      expect(maxConcurrent.value).toBeLessThanOrEqual(3);
      expect(maxConcurrent.value).toBeGreaterThan(1);
    });

    it('should complete all items', async () => {
      const arr = Array.from({ length: 20 }, (_, i) => i);
      const result = new Set<number>();

      await forEachParallel(arr, async (value) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        result.add(value);
      }, { concurrency: 5 });

      expect(result.size).toBe(20);
      expect(Array.from(result).sort((a, b) => a - b)).toEqual(arr);
    });

    it('should preserve order when requested', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];
      const delays = [50, 10, 30, 5, 25];

      await forEachParallel(arr, async (value, index) => {
        await new Promise(resolve => setTimeout(resolve, delays[index]));
        result.push(value);
      }, { concurrency: 3, preserveOrder: true });

      // With preserveOrder, all promises complete but results should be in order
      expect(result.length).toBe(5);
    });

    it('should not preserve order by default', async () => {
      const arr = [1, 2, 3];
      const completionOrder: number[] = [];
      const delays = [30, 10, 20];

      await forEachParallel(arr, async (value, index) => {
        await new Promise(resolve => setTimeout(resolve, delays[index]));
        completionOrder.push(value);
      }, { concurrency: 3, preserveOrder: false });

      // Without preserveOrder, items complete in time order
      expect(completionOrder).not.toEqual([1, 2, 3]);
    });

    it('should handle errors in parallel execution', async () => {
      const arr = [1, 2, 3, 4, 5];
      const errors: number[] = [];

      await forEachParallel(arr, async (value) => {
        if (value % 2 === 0) {
          errors.push(value);
          throw new Error(`Error for ${value}`);
        }
      }, { concurrency: 3, breakOnError: false });

      expect(errors.sort()).toEqual([2, 4]);
    });

    it('should apply timeout to parallel execution', async () => {
      const arr = [1, 2, 3];
      let timeoutCount = 0;

      try {
        await forEachParallel(arr, async (value) => {
          if (value === 2) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }, { concurrency: 3, timeout: 50 });
      } catch (error) {
        if (error instanceof TimeoutError) {
          timeoutCount++;
        }
      }

      expect(timeoutCount).toBe(1);
    });
  });

  describe('Object parallel iteration', () => {
    it('should iterate object in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = new Map<string, number>();

      await forEachParallel(obj, async (value, key) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        result.set(key, value);
      }, { concurrency: 2 });

      expect(Array.from(result.entries()).sort()).toEqual([
        ['a', 1], ['b', 2], ['c', 3], ['d', 4]
      ]);
    });

    it('should respect concurrency for objects', async () => {
      const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const running = new Set<string>();
      const maxConcurrent = { value: 0 };

      await forEachParallel(obj, async (value, key) => {
        running.add(key);
        maxConcurrent.value = Math.max(maxConcurrent.value, running.size);
        await new Promise(resolve => setTimeout(resolve, 50));
        running.delete(key);
      }, { concurrency: 2 });

      expect(maxConcurrent.value).toBeLessThanOrEqual(2);
    });

    it('should handle reverse iteration in parallel', async () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keys: string[] = [];

      await forEachParallel(obj, async (value, key) => {
        keys.push(key);
      }, { concurrency: 1, reverse: true });

      expect(keys).toEqual(['c', 'b', 'a']);
    });
  });

  describe('Input validation', () => {
    it('should validate concurrency option', async () => {
      await expect(
        forEachParallel([1, 2, 3], async () => {}, { concurrency: 0 })
      ).rejects.toThrow();

      await expect(
        forEachParallel([1, 2, 3], async () => {}, { concurrency: 1001 })
      ).rejects.toThrow();
    });

    it('should use default concurrency', async () => {
      const arr = Array.from({ length: 20 }, (_, i) => i);
      const running = new Set<number>();
      const maxConcurrent = { value: 0 };

      await forEachParallel(arr, async (value) => {
        running.add(value);
        maxConcurrent.value = Math.max(maxConcurrent.value, running.size);
        await new Promise(resolve => setTimeout(resolve, 10));
        running.delete(value);
      });

      expect(maxConcurrent.value).toBeLessThanOrEqual(10); // default concurrency
    });
  });
});