import {
  isArray,
  isObject,
  isPlainObject,
  isFunction,
  isCallable,
  isPromise,
  isAsyncFunction,
  isIterable,
  isNumber,
  isPositiveInteger,
  isString,
  isBoolean,
  isNullOrUndefined,
  isDefined,
  hasOwnProperty,
} from '../../../src/utils/type-guards';

describe('Type Guards', () => {
  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(new Array())).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(isArray({})).toBe(false);
      expect(isArray('string')).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject(new Date())).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(isObject([])).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(true);
    });

    it('should return false for non-plain objects', () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject(new Map())).toBe(false);
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(undefined)).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function() {})).toBe(true);
      expect(isFunction(async () => {})).toBe(true);
      expect(isFunction(Date)).toBe(true);
    });

    it('should return false for non-functions', () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction([])).toBe(false);
      expect(isFunction('string')).toBe(false);
      expect(isFunction(123)).toBe(false);
      expect(isFunction(null)).toBe(false);
    });
  });

  describe('isCallable', () => {
    it('should return true for callable values', () => {
      expect(isCallable(() => {})).toBe(true);
      expect(isCallable(function() {})).toBe(true);
      expect(isCallable(async () => {})).toBe(true);
    });

    it('should return false for non-callable values', () => {
      expect(isCallable({})).toBe(false);
      expect(isCallable([])).toBe(false);
      expect(isCallable('string')).toBe(false);
      expect(isCallable(123)).toBe(false);
    });
  });

  describe('isPromise', () => {
    it('should return true for promises', () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise(new Promise(() => {}))).toBe(true);
      expect(isPromise({ then: () => {}, catch: () => {} })).toBe(true);
    });

    it('should return false for non-promises', () => {
      expect(isPromise({})).toBe(false);
      expect(isPromise({ then: () => {} })).toBe(false);
      expect(isPromise({ catch: () => {} })).toBe(false);
      expect(isPromise(null)).toBe(false);
      expect(isPromise(undefined)).toBe(false);
    });
  });

  describe('isAsyncFunction', () => {
    it('should return true for async functions', () => {
      expect(isAsyncFunction(async () => {})).toBe(true);
      expect(isAsyncFunction(async function() {})).toBe(true);
    });

    it('should return false for non-async functions', () => {
      expect(isAsyncFunction(() => {})).toBe(false);
      expect(isAsyncFunction(function() {})).toBe(false);
      expect(isAsyncFunction({})).toBe(false);
      expect(isAsyncFunction(null)).toBe(false);
    });
  });

  describe('isIterable', () => {
    it('should return true for iterables', () => {
      expect(isIterable([])).toBe(true);
      expect(isIterable('string')).toBe(true);
      expect(isIterable(new Set())).toBe(true);
      expect(isIterable(new Map())).toBe(true);
    });

    it('should return false for non-iterables', () => {
      expect(isIterable({})).toBe(false);
      expect(isIterable(123)).toBe(false);
      expect(isIterable(null)).toBe(false);
      expect(isIterable(undefined)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should return true for numbers', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(123)).toBe(true);
      expect(isNumber(-123)).toBe(true);
      expect(isNumber(123.45)).toBe(true);
    });

    it('should return false for non-numbers', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });
  });

  describe('isPositiveInteger', () => {
    it('should return true for positive integers', () => {
      expect(isPositiveInteger(1)).toBe(true);
      expect(isPositiveInteger(123)).toBe(true);
      expect(isPositiveInteger(999999)).toBe(true);
    });

    it('should return false for non-positive integers', () => {
      expect(isPositiveInteger(0)).toBe(false);
      expect(isPositiveInteger(-1)).toBe(false);
      expect(isPositiveInteger(1.5)).toBe(false);
      expect(isPositiveInteger('1')).toBe(false);
      expect(isPositiveInteger(null)).toBe(false);
    });
  });

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('')).toBe(true);
      expect(isString('hello')).toBe(true);
      expect(isString(String('test'))).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString(null)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(Boolean(1))).toBe(true);
    });

    it('should return false for non-booleans', () => {
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe('isNullOrUndefined', () => {
    it('should return true for null or undefined', () => {
      expect(isNullOrUndefined(null)).toBe(true);
      expect(isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for defined values', () => {
      expect(isNullOrUndefined(0)).toBe(false);
      expect(isNullOrUndefined('')).toBe(false);
      expect(isNullOrUndefined(false)).toBe(false);
      expect(isNullOrUndefined({})).toBe(false);
    });
  });

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined({})).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe('hasOwnProperty', () => {
    it('should return true for own properties', () => {
      const obj = { a: 1, b: 2 };
      expect(hasOwnProperty(obj, 'a')).toBe(true);
      expect(hasOwnProperty(obj, 'b')).toBe(true);
    });

    it('should return false for non-own properties', () => {
      const obj = { a: 1 };
      expect(hasOwnProperty(obj, 'toString')).toBe(false);
      expect(hasOwnProperty(obj, 'c')).toBe(false);
    });

    it('should work with objects without prototype', () => {
      const obj = Object.create(null);
      obj.a = 1;
      expect(hasOwnProperty(obj, 'a')).toBe(true);
      expect(hasOwnProperty(obj, 'b')).toBe(false);
    });
  });
});