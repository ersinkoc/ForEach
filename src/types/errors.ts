export enum ForEachErrorCode {
  INVALID_CALLBACK = 'INVALID_CALLBACK',
  INVALID_TARGET = 'INVALID_TARGET',
  INVALID_OPTIONS = 'INVALID_OPTIONS',
  ITERATION_ERROR = 'ITERATION_ERROR',
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONCURRENCY_ERROR = 'CONCURRENCY_ERROR',
  CHUNK_SIZE_ERROR = 'CHUNK_SIZE_ERROR',
}

export class ForEachError extends Error {
  public readonly code: ForEachErrorCode;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(message: string, code: ForEachErrorCode, details?: any) {
    super(message);
    this.name = 'ForEachError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForEachError);
    }
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

export class ValidationError extends ForEachError {
  constructor(message: string, details?: any) {
    super(message, ForEachErrorCode.INVALID_OPTIONS, details);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends ForEachError {
  constructor(message: string, details?: any) {
    super(message, ForEachErrorCode.TIMEOUT_ERROR, details);
    this.name = 'TimeoutError';
  }
}

export class PluginError extends ForEachError {
  constructor(message: string, details?: any) {
    super(message, ForEachErrorCode.PLUGIN_ERROR, details);
    this.name = 'PluginError';
  }
}