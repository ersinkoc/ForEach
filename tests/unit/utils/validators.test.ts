import {
  validateCallback,
  validateTarget,
  validateForEachOptions,
  validateAsyncOptions,
  validateChunkedOptions,
  validateLazyOptions,
  validatePlugin,
} from '../../../src/utils/validators';
import { ForEachError, ValidationError } from '../../../src/types/errors';

describe('Validators', () => {
  describe('validateCallback', () => {
    it('should not throw for valid callbacks', () => {
      expect(() => validateCallback(() => {})).not.toThrow();
      expect(() => validateCallback(function() {})).not.toThrow();
      expect(() => validateCallback(async () => {})).not.toThrow();
    });

    it('should throw for invalid callbacks', () => {
      expect(() => validateCallback(null)).toThrow(ForEachError);
      expect(() => validateCallback(undefined)).toThrow(ForEachError);
      expect(() => validateCallback({})).toThrow(ForEachError);
      expect(() => validateCallback('function')).toThrow(ForEachError);
      expect(() => validateCallback(123)).toThrow(ForEachError);
    });

    it('should use custom error message', () => {
      expect(() => validateCallback(null, 'Custom error')).toThrow('Custom error');
    });
  });

  describe('validateTarget', () => {
    it('should not throw for valid targets', () => {
      expect(() => validateTarget([])).not.toThrow();
      expect(() => validateTarget([1, 2, 3])).not.toThrow();
      expect(() => validateTarget({})).not.toThrow();
      expect(() => validateTarget({ a: 1, b: 2 })).not.toThrow();
    });

    it('should throw for invalid targets', () => {
      expect(() => validateTarget(null)).toThrow(ForEachError);
      expect(() => validateTarget(undefined)).toThrow(ForEachError);
      expect(() => validateTarget('string')).toThrow(ForEachError);
      expect(() => validateTarget(123)).toThrow(ForEachError);
      expect(() => validateTarget(() => {})).toThrow(ForEachError);
    });
  });

  describe('validateForEachOptions', () => {
    it('should not throw for valid options', () => {
      expect(() => validateForEachOptions({})).not.toThrow();
      expect(() => validateForEachOptions({ breakOnError: true })).not.toThrow();
      expect(() => validateForEachOptions({ breakOnReturn: false })).not.toThrow();
      expect(() => validateForEachOptions({ reverse: true })).not.toThrow();
      expect(() => validateForEachOptions({ thisArg: {} })).not.toThrow();
    });

    it('should not throw for non-object options', () => {
      expect(() => validateForEachOptions(null)).not.toThrow();
      expect(() => validateForEachOptions(undefined)).not.toThrow();
    });

    it('should throw for invalid option types', () => {
      expect(() => validateForEachOptions({ breakOnError: 'true' })).toThrow(ValidationError);
      expect(() => validateForEachOptions({ breakOnReturn: 1 })).toThrow(ValidationError);
      expect(() => validateForEachOptions({ reverse: 'false' })).toThrow(ValidationError);
    });
  });

  describe('validateAsyncOptions', () => {
    it('should not throw for valid async options', () => {
      expect(() => validateAsyncOptions({})).not.toThrow();
      expect(() => validateAsyncOptions({ concurrency: 5 })).not.toThrow();
      expect(() => validateAsyncOptions({ preserveOrder: true })).not.toThrow();
      expect(() => validateAsyncOptions({ timeout: 1000 })).not.toThrow();
    });

    it('should throw for invalid concurrency', () => {
      expect(() => validateAsyncOptions({ concurrency: 0 })).toThrow(ValidationError);
      expect(() => validateAsyncOptions({ concurrency: -1 })).toThrow(ValidationError);
      expect(() => validateAsyncOptions({ concurrency: 1.5 })).toThrow(ValidationError);
      expect(() => validateAsyncOptions({ concurrency: '5' })).toThrow(ValidationError);
      expect(() => validateAsyncOptions({ concurrency: 1001 })).toThrow(ValidationError);
    });

    it('should throw for invalid preserveOrder', () => {
      expect(() => validateAsyncOptions({ preserveOrder: 'true' })).toThrow(ValidationError);
      expect(() => validateAsyncOptions({ preserveOrder: 1 })).toThrow(ValidationError);
    });

    it('should throw for invalid timeout', () => {
      expect(() => validateAsyncOptions({ timeout: 0 })).toThrow(ValidationError);
      expect(() => validateAsyncOptions({ timeout: -1 })).toThrow(ValidationError);
      expect(() => validateAsyncOptions({ timeout: 1.5 })).toThrow(ValidationError);
      expect(() => validateAsyncOptions({ timeout: '1000' })).toThrow(ValidationError);
    });
  });

  describe('validateChunkedOptions', () => {
    it('should not throw for valid chunked options', () => {
      expect(() => validateChunkedOptions({ chunkSize: 10 })).not.toThrow();
      expect(() => validateChunkedOptions({ chunkSize: 100, delayBetweenChunks: 50 })).not.toThrow();
      expect(() => validateChunkedOptions({ chunkSize: 10, onChunkComplete: () => {} })).not.toThrow();
    });

    it('should throw for missing or invalid chunkSize', () => {
      expect(() => validateChunkedOptions({})).toThrow(ForEachError);
      expect(() => validateChunkedOptions({ chunkSize: 0 })).toThrow(ForEachError);
      expect(() => validateChunkedOptions({ chunkSize: -1 })).toThrow(ForEachError);
      expect(() => validateChunkedOptions({ chunkSize: 1.5 })).toThrow(ForEachError);
      expect(() => validateChunkedOptions({ chunkSize: '10' })).toThrow(ForEachError);
      expect(() => validateChunkedOptions({ chunkSize: 10001 })).toThrow(ForEachError);
    });

    it('should throw for invalid delayBetweenChunks', () => {
      expect(() => validateChunkedOptions({ chunkSize: 10, delayBetweenChunks: -1 })).toThrow(ValidationError);
      expect(() => validateChunkedOptions({ chunkSize: 10, delayBetweenChunks: '50' })).toThrow(ValidationError);
    });

    it('should throw for invalid onChunkComplete', () => {
      expect(() => validateChunkedOptions({ chunkSize: 10, onChunkComplete: 'callback' })).toThrow(ValidationError);
      expect(() => validateChunkedOptions({ chunkSize: 10, onChunkComplete: {} })).toThrow(ValidationError);
    });

    it('should throw for non-object options', () => {
      expect(() => validateChunkedOptions(null)).toThrow(ValidationError);
      expect(() => validateChunkedOptions(undefined)).toThrow(ValidationError);
      expect(() => validateChunkedOptions('options')).toThrow(ValidationError);
    });
  });

  describe('validateLazyOptions', () => {
    it('should not throw for valid lazy options', () => {
      expect(() => validateLazyOptions({})).not.toThrow();
      expect(() => validateLazyOptions({ bufferSize: 10 })).not.toThrow();
      expect(() => validateLazyOptions({ preloadNext: true })).not.toThrow();
      expect(() => validateLazyOptions({ bufferSize: 100, preloadNext: false })).not.toThrow();
    });

    it('should not throw for non-object options', () => {
      expect(() => validateLazyOptions(null)).not.toThrow();
      expect(() => validateLazyOptions(undefined)).not.toThrow();
    });

    it('should throw for invalid bufferSize', () => {
      expect(() => validateLazyOptions({ bufferSize: 0 })).toThrow(ValidationError);
      expect(() => validateLazyOptions({ bufferSize: -1 })).toThrow(ValidationError);
      expect(() => validateLazyOptions({ bufferSize: 1.5 })).toThrow(ValidationError);
      expect(() => validateLazyOptions({ bufferSize: '10' })).toThrow(ValidationError);
      expect(() => validateLazyOptions({ bufferSize: 10001 })).toThrow(ValidationError);
    });

    it('should throw for invalid preloadNext', () => {
      expect(() => validateLazyOptions({ preloadNext: 'true' })).toThrow(ValidationError);
      expect(() => validateLazyOptions({ preloadNext: 1 })).toThrow(ValidationError);
    });
  });

  describe('validatePlugin', () => {
    it('should not throw for valid plugins', () => {
      expect(() => validatePlugin({ name: 'test', version: '1.0.0' })).not.toThrow();
      expect(() => validatePlugin({
        name: 'test',
        version: '1.0.0',
        beforeIteration: () => {},
        afterIteration: () => {},
        onError: () => {},
      })).not.toThrow();
    });

    it('should throw for non-object plugins', () => {
      expect(() => validatePlugin(null)).toThrow(ValidationError);
      expect(() => validatePlugin(undefined)).toThrow(ValidationError);
      expect(() => validatePlugin('plugin')).toThrow(ValidationError);
    });

    it('should throw for missing or invalid name', () => {
      expect(() => validatePlugin({ version: '1.0.0' })).toThrow(ValidationError);
      expect(() => validatePlugin({ name: '', version: '1.0.0' })).toThrow(ValidationError);
      expect(() => validatePlugin({ name: 123, version: '1.0.0' })).toThrow(ValidationError);
    });

    it('should throw for missing or invalid version', () => {
      expect(() => validatePlugin({ name: 'test' })).toThrow(ValidationError);
      expect(() => validatePlugin({ name: 'test', version: '' })).toThrow(ValidationError);
      expect(() => validatePlugin({ name: 'test', version: 123 })).toThrow(ValidationError);
    });

    it('should throw for invalid hook functions', () => {
      expect(() => validatePlugin({
        name: 'test',
        version: '1.0.0',
        beforeIteration: 'not a function',
      })).toThrow(ValidationError);

      expect(() => validatePlugin({
        name: 'test',
        version: '1.0.0',
        afterIteration: {},
      })).toThrow(ValidationError);

      expect(() => validatePlugin({
        name: 'test',
        version: '1.0.0',
        onError: 123,
      })).toThrow(ValidationError);
    });
  });
});