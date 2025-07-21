export { forEach, forEachWithContext } from './core/foreach';
export { forEachAsync, forEachParallel } from './core/foreach-async';
export { forEachLazy, forEachGenerator } from './core/foreach-lazy';
export { forEachChunked, forEachChunkedAsync } from './core/foreach-chunked';

export { ForEachCore } from './plugins/plugin-manager';

export {
  ForEachError,
  ForEachErrorCode,
  ValidationError,
  TimeoutError,
  PluginError,
} from './types/errors';

export type {
  Nullable,
  ArrayCallback,
  ObjectCallback,
  AsyncArrayCallback,
  AsyncObjectCallback,
  IForEachOptions,
  IAsyncForEachOptions,
  IChunkedOptions,
  ILazyOptions,
  ILazyIterator,
  IIterationContext,
  IIterationPlugin,
  IForEachCore,
  ForEachTarget,
  IPerformanceMetrics,
} from './types';

export type {
  IPlugin,
  IPluginConfig,
  IPluginHooks,
  IPluginLifecycle,
  IPluginManager,
  IPluginMetadata,
} from './plugins/interfaces';

export {
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
} from './utils/type-guards';

export {
  validateCallback,
  validateTarget,
  validateForEachOptions,
  validateAsyncOptions,
  validateChunkedOptions,
  validateLazyOptions,
  validatePlugin,
} from './utils/validators';

export {
  PerformanceTracker,
  measurePerformance,
  measureAsyncPerformance,
  throttle,
  debounce,
} from './utils/performance';