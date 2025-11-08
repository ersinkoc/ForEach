import {
  ForEachError,
  ForEachErrorCode,
  PluginError,
  TimeoutError,
  ValidationError,
} from '../../../src/types/errors';

describe('Error Classes', () => {
  describe('ForEachError', () => {
    it('should create error with message and code', () => {
      const error = new ForEachError('Test error', ForEachErrorCode.INVALID_CALLBACK);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ForEachError);
      expect(error.name).toBe('ForEachError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ForEachErrorCode.INVALID_CALLBACK);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should include details when provided', () => {
      const details = { field: 'test', value: 123 };
      const error = new ForEachError('Error with details', ForEachErrorCode.INVALID_OPTIONS, details);
      
      expect(error.details).toEqual(details);
    });

    it('should have stack trace', () => {
      const error = new ForEachError('Stack trace test', ForEachErrorCode.ITERATION_ERROR);
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ForEachError');
    });

    it('should serialize to JSON', () => {
      const error = new ForEachError('JSON test', ForEachErrorCode.INVALID_TARGET, { test: true });
      const json = error.toJSON();
      
      expect(json).toHaveProperty('name', 'ForEachError');
      expect(json).toHaveProperty('message', 'JSON test');
      expect(json).toHaveProperty('code', ForEachErrorCode.INVALID_TARGET);
      expect(json).toHaveProperty('details', { test: true });
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('stack');
    });

    it('should support all error codes', () => {
      const codes = Object.values(ForEachErrorCode);
      
      codes.forEach(code => {
        const error = new ForEachError(`Error with ${code}`, code);
        expect(error.code).toBe(code);
      });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ForEachError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(ForEachErrorCode.INVALID_OPTIONS);
    });

    it('should include validation details', () => {
      const details = { field: 'chunkSize', expected: 'number', received: 'string' };
      const error = new ValidationError('Invalid chunk size', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError('Operation timed out');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ForEachError);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.name).toBe('TimeoutError');
      expect(error.message).toBe('Operation timed out');
      expect(error.code).toBe(ForEachErrorCode.TIMEOUT_ERROR);
    });

    it('should include timeout details', () => {
      const details = { timeout: 5000, operation: 'async forEach' };
      const error = new TimeoutError('Timeout after 5s', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('PluginError', () => {
    it('should create plugin error', () => {
      const error = new PluginError('Plugin failed');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ForEachError);
      expect(error).toBeInstanceOf(PluginError);
      expect(error.name).toBe('PluginError');
      expect(error.message).toBe('Plugin failed');
      expect(error.code).toBe(ForEachErrorCode.PLUGIN_ERROR);
    });

    it('should include plugin details', () => {
      const details = { plugin: 'logger', hook: 'beforeIteration', originalError: new Error('Hook failed') };
      const error = new PluginError('Plugin hook failed', details);
      
      expect(error.details).toEqual(details);
      expect(error.details.originalError).toBeInstanceOf(Error);
    });
  });

  describe('Error inheritance', () => {
    it('should maintain proper prototype chain', () => {
      const baseError = new ForEachError('Base', ForEachErrorCode.ITERATION_ERROR);
      const validationError = new ValidationError('Validation');
      const timeoutError = new TimeoutError('Timeout');
      const pluginError = new PluginError('Plugin');
      
      expect(baseError instanceof Error).toBe(true);
      expect(validationError instanceof Error).toBe(true);
      expect(validationError instanceof ForEachError).toBe(true);
      expect(timeoutError instanceof Error).toBe(true);
      expect(timeoutError instanceof ForEachError).toBe(true);
      expect(pluginError instanceof Error).toBe(true);
      expect(pluginError instanceof ForEachError).toBe(true);
    });
  });
});