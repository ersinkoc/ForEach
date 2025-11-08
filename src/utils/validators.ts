import { ForEachError, ForEachErrorCode, ValidationError } from '../types/errors';
import {
  isArray,
  isBoolean,
  isDefined,
  isFunction,
  isNumber,
  isObject,
  isPositiveInteger,
} from './type-guards';
import type {
  IAsyncForEachOptions,
  IChunkedOptions,
  IForEachOptions,
  IIterationPlugin,
  ILazyOptions,
} from '../types';

export function validateCallback(callback: unknown, errorMessage?: string): void {
  if (!isFunction(callback)) {
    throw new ForEachError(
      errorMessage || 'Callback must be a function',
      ForEachErrorCode.INVALID_CALLBACK,
      { received: typeof callback }
    );
  }
}

export function validateTarget(target: unknown): void {
  if (!isArray(target) && !isObject(target)) {
    throw new ForEachError(
      'Target must be an array or object',
      ForEachErrorCode.INVALID_TARGET,
      { received: typeof target }
    );
  }
}

export function validateForEachOptions(options: unknown): void {
  if (!isObject(options)) return;

  const opts = options as IForEachOptions;

  if (isDefined(opts.breakOnError) && !isBoolean(opts.breakOnError)) {
    throw new ValidationError('breakOnError must be a boolean', {
      field: 'breakOnError',
      received: typeof opts.breakOnError,
    });
  }

  if (isDefined(opts.breakOnReturn) && !isBoolean(opts.breakOnReturn)) {
    throw new ValidationError('breakOnReturn must be a boolean', {
      field: 'breakOnReturn',
      received: typeof opts.breakOnReturn,
    });
  }

  if (isDefined(opts.reverse) && !isBoolean(opts.reverse)) {
    throw new ValidationError('reverse must be a boolean', {
      field: 'reverse',
      received: typeof opts.reverse,
    });
  }
}

export function validateAsyncOptions(options: unknown): void {
  if (!isObject(options)) return;

  validateForEachOptions(options);
  const opts = options as IAsyncForEachOptions;

  if (isDefined(opts.concurrency)) {
    if (!isPositiveInteger(opts.concurrency)) {
      throw new ValidationError('concurrency must be a positive integer', {
        field: 'concurrency',
        received: opts.concurrency,
      });
    }
    if (opts.concurrency > 1000) {
      throw new ValidationError('concurrency cannot exceed 1000', {
        field: 'concurrency',
        received: opts.concurrency,
      });
    }
  }

  if (isDefined(opts.preserveOrder) && !isBoolean(opts.preserveOrder)) {
    throw new ValidationError('preserveOrder must be a boolean', {
      field: 'preserveOrder',
      received: typeof opts.preserveOrder,
    });
  }

  if (isDefined(opts.timeout)) {
    if (!isPositiveInteger(opts.timeout)) {
      throw new ValidationError('timeout must be a positive integer', {
        field: 'timeout',
        received: opts.timeout,
      });
    }
  }
}

export function validateChunkedOptions(options: unknown): void {
  if (!isObject(options)) {
    throw new ValidationError('Chunked options must be an object');
  }

  const opts = options as IChunkedOptions;

  if (!isPositiveInteger(opts.chunkSize)) {
    throw new ForEachError(
      'chunkSize must be a positive integer',
      ForEachErrorCode.CHUNK_SIZE_ERROR,
      { received: opts.chunkSize }
    );
  }

  if (opts.chunkSize > 10000) {
    throw new ForEachError(
      'chunkSize cannot exceed 10000',
      ForEachErrorCode.CHUNK_SIZE_ERROR,
      { received: opts.chunkSize }
    );
  }

  if (isDefined(opts.delayBetweenChunks)) {
    if (!isNumber(opts.delayBetweenChunks) || opts.delayBetweenChunks < 0) {
      throw new ValidationError('delayBetweenChunks must be a non-negative number', {
        field: 'delayBetweenChunks',
        received: opts.delayBetweenChunks,
      });
    }
  }

  if (isDefined(opts.onChunkComplete) && !isFunction(opts.onChunkComplete)) {
    throw new ValidationError('onChunkComplete must be a function', {
      field: 'onChunkComplete',
      received: typeof opts.onChunkComplete,
    });
  }
}

export function validateLazyOptions(options: unknown): void {
  if (!isObject(options)) return;

  const opts = options as ILazyOptions;

  if (isDefined(opts.bufferSize)) {
    if (!isPositiveInteger(opts.bufferSize)) {
      throw new ValidationError('bufferSize must be a positive integer', {
        field: 'bufferSize',
        received: opts.bufferSize,
      });
    }
    if (opts.bufferSize > 10000) {
      throw new ValidationError('bufferSize cannot exceed 10000', {
        field: 'bufferSize',
        received: opts.bufferSize,
      });
    }
  }

  if (isDefined(opts.preloadNext) && !isBoolean(opts.preloadNext)) {
    throw new ValidationError('preloadNext must be a boolean', {
      field: 'preloadNext',
      received: typeof opts.preloadNext,
    });
  }
}

export function validatePlugin(plugin: unknown): void {
  if (!isObject(plugin)) {
    throw new ValidationError('Plugin must be an object');
  }

  const p = plugin as IIterationPlugin;

  if (!p.name || typeof p.name !== 'string') {
    throw new ValidationError('Plugin must have a name property of type string', {
      field: 'name',
      received: p.name,
    });
  }

  if (!p.version || typeof p.version !== 'string') {
    throw new ValidationError('Plugin must have a version property of type string', {
      field: 'version',
      received: p.version,
    });
  }

  const methods = ['beforeIteration', 'afterIteration', 'onError'] as const;
  for (const method of methods) {
    if (isDefined(p[method]) && !isFunction(p[method])) {
      throw new ValidationError(`Plugin ${method} must be a function`, {
        field: method,
        plugin: p.name,
        received: typeof p[method],
      });
    }
  }
}