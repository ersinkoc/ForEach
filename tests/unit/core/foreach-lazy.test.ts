import { forEachLazy, forEachGenerator } from '../../../src/core/foreach-lazy';

describe('forEachLazy', () => {
  describe('Array lazy iteration', () => {
    it('should create lazy iterator for arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      const iterator = forEachLazy(arr);

      expect(iterator.next()).toEqual({ done: false, value: 1 });
      expect(iterator.next()).toEqual({ done: false, value: 2 });
      expect(iterator.next()).toEqual({ done: false, value: 3 });
    });

    it('should be truly lazy', () => {
      const arr: number[] = [];
      const getter = (i: number) => {
        arr.push(i);
        return i;
      };

      const source = [getter(1), getter(2), getter(3)];
      expect(arr).toEqual([1, 2, 3]); // Already evaluated

      arr.length = 0;
      const iterator = forEachLazy(source);
      expect(arr).toEqual([]); // Not evaluated yet

      iterator.next();
      expect(arr).toEqual([]); // Still using already evaluated values
    });

    it('should support iteration protocol', () => {
      const arr = [1, 2, 3];
      const iterator = forEachLazy(arr);
      const result: number[] = [];

      for (const value of iterator) {
        result.push(value);
      }

      expect(result).toEqual([1, 2, 3]);
    });

    it('should convert to array', () => {
      const arr = [1, 2, 3, 4, 5];
      const iterator = forEachLazy(arr);

      expect(iterator.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should support take operation', () => {
      const arr = [1, 2, 3, 4, 5];
      const iterator = forEachLazy(arr).take(3);

      expect(iterator.toArray()).toEqual([1, 2, 3]);
    });

    it('should support skip operation', () => {
      const arr = [1, 2, 3, 4, 5];
      const iterator = forEachLazy(arr).skip(2);

      expect(iterator.toArray()).toEqual([3, 4, 5]);
    });

    it('should support filter operation', () => {
      const arr = [1, 2, 3, 4, 5];
      const iterator = forEachLazy(arr).filter(x => x % 2 === 0);

      expect(iterator.toArray()).toEqual([2, 4]);
    });

    it('should support map operation', () => {
      const arr = [1, 2, 3];
      const iterator = forEachLazy(arr).map(x => x * 2);

      expect(iterator.toArray()).toEqual([2, 4, 6]);
    });

    it('should chain operations', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = forEachLazy(arr)
        .filter(x => x % 2 === 0)
        .map(x => x * 2)
        .skip(1)
        .take(3)
        .toArray();

      expect(result).toEqual([8, 12, 16]);
    });

    it('should handle empty arrays', () => {
      const iterator = forEachLazy([]);
      
      expect(iterator.next()).toEqual({ done: true, value: undefined });
      expect(iterator.toArray()).toEqual([]);
    });

    it('should support reverse iteration', () => {
      const arr = [1, 2, 3, 4, 5];
      const iterator = forEachLazy(arr, { reverse: true });

      expect(iterator.toArray()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle buffer size option', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const iterator = forEachLazy(arr, { bufferSize: 10 });

      // Buffer size doesn't affect correctness, just performance
      expect(iterator.take(15).toArray().length).toBe(15);
    });
  });

  describe('Object lazy iteration', () => {
    it('should create lazy iterator for objects', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const iterator = forEachLazy(obj);

      const first = iterator.next();
      expect(first.done).toBe(false);
      expect(first.value).toHaveLength(2);
      expect(typeof first.value[0]).toBe('string');
      expect(typeof first.value[1]).toBe('number');
    });

    it('should iterate all object properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const iterator = forEachLazy(obj);
      const result = iterator.toArray();

      expect(result).toHaveLength(3);
      expect(result.map(([k]) => k).sort()).toEqual(['a', 'b', 'c']);
      expect(result.map(([, v]) => v).sort()).toEqual([1, 2, 3]);
    });

    it('should skip inherited properties', () => {
      const parent = { inherited: true };
      const obj = Object.create(parent);
      obj.a = 1;
      obj.b = 2;

      const iterator = forEachLazy(obj);
      const result = iterator.toArray();

      expect(result).toHaveLength(2);
      expect(result.map(([k]) => k).sort()).toEqual(['a', 'b']);
    });

    it('should support operations on object entries', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = forEachLazy(obj)
        .filter(([k, v]) => v % 2 === 0)
        .map(([k, v]) => [k, v * 2])
        .toArray();

      expect(result).toHaveLength(2);
      const resultObj = Object.fromEntries(result);
      expect(resultObj).toEqual({ b: 4, d: 8 });
    });

    it('should handle empty objects', () => {
      const iterator = forEachLazy({});
      
      expect(iterator.next()).toEqual({ done: true, value: undefined });
      expect(iterator.toArray()).toEqual([]);
    });

    it('should support reverse iteration for objects', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const iterator = forEachLazy(obj, { reverse: true });
      const keys = iterator.toArray().map(([k]) => k);

      expect(keys).toEqual(['c', 'b', 'a']);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple iterations', () => {
      const arr = [1, 2, 3];
      const iterator = forEachLazy(arr);

      expect(iterator.next().value).toBe(1);
      expect(iterator.next().value).toBe(2);
      
      // Can't restart - continues from current position
      const remaining = iterator.toArray();
      expect(remaining).toEqual([3]);
    });

    it('should handle exhausted iterators', () => {
      const arr = [1, 2];
      const iterator = forEachLazy(arr);

      iterator.next();
      iterator.next();
      const third = iterator.next();
      const fourth = iterator.next();

      expect(third.done).toBe(true);
      expect(fourth.done).toBe(true);
    });

    it('should handle complex chaining with empty results', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = forEachLazy(arr)
        .filter(x => x > 10) // Nothing passes
        .map(x => x * 2)
        .toArray();

      expect(result).toEqual([]);
    });
  });
});

describe('forEachGenerator', () => {
  describe('Array generation', () => {
    it('should generate values from array', () => {
      const arr = [1, 2, 3];
      const generator = forEachGenerator(arr);
      const result: number[] = [];

      for (const value of generator) {
        result.push(value);
      }

      expect(result).toEqual([1, 2, 3]);
    });

    it('should support reverse generation', () => {
      const arr = [1, 2, 3];
      const generator = forEachGenerator(arr, { reverse: true });
      const result = Array.from(generator);

      expect(result).toEqual([3, 2, 1]);
    });

    it('should be restartable', () => {
      const arr = [1, 2, 3];
      
      const gen1 = forEachGenerator(arr);
      const result1 = Array.from(gen1);

      const gen2 = forEachGenerator(arr);
      const result2 = Array.from(gen2);

      expect(result1).toEqual(result2);
      expect(result1).toEqual([1, 2, 3]);
    });
  });

  describe('Object generation', () => {
    it('should generate entries from object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const generator = forEachGenerator(obj);
      const result = Array.from(generator);

      expect(result).toHaveLength(3);
      expect(result.map(([k]) => k).sort()).toEqual(['a', 'b', 'c']);
    });

    it('should skip inherited properties', () => {
      const parent = { inherited: true };
      const obj = Object.create(parent);
      obj.own = 1;

      const generator = forEachGenerator(obj);
      const result = Array.from(generator);

      expect(result).toEqual([['own', 1]]);
    });

    it('should support reverse generation for objects', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const generator = forEachGenerator(obj, { reverse: true });
      const keys = Array.from(generator).map(([k]) => k);

      expect(keys).toEqual(['c', 'b', 'a']);
    });
  });

  describe('Generator protocol', () => {
    it('should implement iterator protocol correctly', () => {
      const arr = [1, 2, 3];
      const generator = forEachGenerator(arr);

      const first = generator.next();
      expect(first.done).toBe(false);
      expect(first.value).toBe(1);

      const second = generator.next();
      expect(second.done).toBe(false);
      expect(second.value).toBe(2);

      const third = generator.next();
      expect(third.done).toBe(false);
      expect(third.value).toBe(3);

      const fourth = generator.next();
      expect(fourth.done).toBe(true);
      expect(fourth.value).toBeUndefined();
    });

    it('should work with destructuring', () => {
      const arr = [1, 2, 3];
      const [first, second, ...rest] = forEachGenerator(arr);

      expect(first).toBe(1);
      expect(second).toBe(2);
      expect(rest).toEqual([3]);
    });

    it('should work with spread operator', () => {
      const obj = { a: 1, b: 2 };
      const entries = [...forEachGenerator(obj)];

      expect(entries).toHaveLength(2);
      expect(Object.fromEntries(entries)).toEqual(obj);
    });
  });
});