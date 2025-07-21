import { forEach, forEachWithContext } from '../../../src/core/foreach';
import { ForEachError } from '../../../src/types/errors';

describe('forEach', () => {
  describe('Array iteration', () => {
    it('should iterate over array elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];
      const indices: number[] = [];

      forEach(arr, (value, index) => {
        result.push(value);
        indices.push(index);
      });

      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(indices).toEqual([0, 1, 2, 3, 4]);
    });

    it('should provide array reference', () => {
      const arr = [1, 2, 3];
      let arrayRef: number[] | undefined;

      forEach(arr, (value, index, array) => {
        arrayRef = array;
      });

      expect(arrayRef).toBe(arr);
    });

    it('should handle empty arrays', () => {
      const result: any[] = [];
      
      forEach([], (value) => {
        result.push(value);
      });

      expect(result).toEqual([]);
    });

    it('should respect thisArg', () => {
      const arr = [1, 2, 3];
      const context = { multiplier: 10 };
      const result: number[] = [];

      forEach(arr, function(this: typeof context, value) {
        result.push(value * this.multiplier);
      }, { thisArg: context });

      expect(result).toEqual([10, 20, 30]);
    });

    it('should iterate in reverse order', () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      forEach(arr, (value) => {
        result.push(value);
      }, { reverse: true });

      expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    it('should break on error when breakOnError is true', () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      expect(() => {
        forEach(arr, (value) => {
          result.push(value);
          if (value === 3) {
            throw new Error('Test error');
          }
        }, { breakOnError: true });
      }).toThrow(ForEachError);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should continue on error when breakOnError is false', () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      forEach(arr, (value) => {
        if (value === 3) {
          throw new Error('Test error');
        }
        result.push(value);
      }, { breakOnError: false });

      expect(result).toEqual([1, 2, 4, 5]);
    });

    it('should break on return when breakOnReturn is true', () => {
      const arr = [1, 2, 3, 4, 5];
      const result: number[] = [];

      forEach(arr, (value): any => {
        result.push(value);
        if (value === 3) {
          return 'break';
        }
      }, { breakOnReturn: true });

      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('Object iteration', () => {
    it('should iterate over object properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keys: string[] = [];
      const values: number[] = [];

      forEach(obj, (value, key) => {
        keys.push(key);
        values.push(value);
      });

      expect(keys.sort()).toEqual(['a', 'b', 'c']);
      expect(values.sort()).toEqual([1, 2, 3]);
    });

    it('should provide object reference', () => {
      const obj = { a: 1 };
      let objRef: Record<string, number> | undefined;

      forEach(obj, (value, key, object) => {
        objRef = object;
      });

      expect(objRef).toBe(obj);
    });

    it('should handle empty objects', () => {
      const result: any[] = [];
      
      forEach({}, (value) => {
        result.push(value);
      });

      expect(result).toEqual([]);
    });

    it('should skip inherited properties', () => {
      const parent = { inherited: true };
      const obj = Object.create(parent);
      obj.own = true;

      const keys: string[] = [];

      forEach(obj, (value, key) => {
        keys.push(key);
      });

      expect(keys).toEqual(['own']);
    });

    it('should iterate in reverse order', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keys: string[] = [];

      forEach(obj, (value, key) => {
        keys.push(key);
      }, { reverse: true });

      expect(keys).toEqual(['c', 'b', 'a']);
    });
  });

  describe('Input validation', () => {
    it('should throw for invalid targets', () => {
      expect(() => forEach(null as any, () => {})).toThrow(ForEachError);
      expect(() => forEach(undefined as any, () => {})).toThrow(ForEachError);
      expect(() => forEach('string' as any, () => {})).toThrow(ForEachError);
      expect(() => forEach(123 as any, () => {})).toThrow(ForEachError);
    });

    it('should throw for invalid callbacks', () => {
      expect(() => forEach([], null as any)).toThrow(ForEachError);
      expect(() => forEach([], undefined as any)).toThrow(ForEachError);
      expect(() => forEach([], 'callback' as any)).toThrow(ForEachError);
      expect(() => forEach([], {} as any)).toThrow(ForEachError);
    });
  });
});

describe('forEachWithContext', () => {
  it('should provide iteration context for arrays', () => {
    const arr = [10, 20, 30];
    const contexts: any[] = [];

    forEachWithContext(arr, (value, index, context) => {
      contexts.push({
        value,
        index,
        total: context.total,
        isFirst: context.isFirst,
        isLast: context.isLast,
      });
    });

    expect(contexts).toEqual([
      { value: 10, index: 0, total: 3, isFirst: true, isLast: false },
      { value: 20, index: 1, total: 3, isFirst: false, isLast: false },
      { value: 30, index: 2, total: 3, isFirst: false, isLast: true },
    ]);
  });

  it('should support break() in context', () => {
    const arr = [1, 2, 3, 4, 5];
    const result: number[] = [];

    forEachWithContext(arr, (value, index, context) => {
      result.push(value);
      if (value === 3) {
        context.break();
      }
    });

    expect(result).toEqual([1, 2, 3]);
  });

  it('should support skip() in context', () => {
    const arr = [1, 2, 3, 4, 5];
    const result: number[] = [];

    forEachWithContext(arr, (value, index, context) => {
      if (value === 3) {
        context.skip();
        return;
      }
      result.push(value);
    });

    expect(result).toEqual([1, 2, 4, 5]);
  });

  it('should provide context for objects', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const contexts: any[] = [];

    forEachWithContext(obj, (value, key, context) => {
      contexts.push({
        key,
        value,
        ...context,
      });
    });

    expect(contexts.length).toBe(3);
    expect(contexts[0]).toMatchObject({ total: 3, isFirst: true });
    expect(contexts[2]).toMatchObject({ total: 3, isLast: true });
  });

  it('should handle errors with context', () => {
    const arr = [1, 2, 3];
    
    expect(() => {
      forEachWithContext(arr, (value, index, context) => {
        if (value === 2) {
          throw new Error('Test error');
        }
      }, { breakOnError: true });
    }).toThrow(ForEachError);
  });

  it('should work with reverse iteration', () => {
    const arr = [1, 2, 3];
    const result: Array<{ value: number; index: number }> = [];

    forEachWithContext(arr, (value, index) => {
      result.push({ value, index });
    }, { reverse: true });

    expect(result).toEqual([
      { value: 3, index: 2 },
      { value: 2, index: 1 },
      { value: 1, index: 0 },
    ]);
  });
});