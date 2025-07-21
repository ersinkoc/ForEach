export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isPlainObject(value: unknown): value is Record<string, any> {
  if (!isObject(value)) return false;
  
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isCallable<T extends Function = Function>(value: unknown): value is T {
  return typeof value === 'function';
}

export function isPromise<T = any>(value: unknown): value is Promise<T> {
  return value instanceof Promise ||
    (isObject(value) && isFunction((value as any).then) && isFunction((value as any).catch));
}

export function isAsyncFunction(value: unknown): value is (...args: any[]) => Promise<any> {
  return isFunction(value) && value.constructor.name === 'AsyncFunction';
}

export function isIterable<T = any>(value: unknown): value is Iterable<T> {
  return value != null && typeof (value as any)[Symbol.iterator] === 'function';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value) && value > 0;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function hasOwnProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}