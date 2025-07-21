# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-20

### Added
- Initial release of @oxog/foreach package
- Core `forEach` function for synchronous iteration over arrays and objects
- `forEachAsync` for asynchronous sequential iteration
- `forEachParallel` for parallel processing with concurrency control
- `forEachLazy` for lazy evaluation with chainable operations
- `forEachChunked` and `forEachChunkedAsync` for processing large datasets in chunks
- `forEachWithContext` providing detailed iteration context
- `forEachGenerator` for generator-based iteration
- Plugin system with `ForEachCore` class for extensibility
- Comprehensive error handling with custom error types:
  - `ForEachError` - Base error class
  - `ValidationError` - Input validation errors
  - `TimeoutError` - Operation timeout errors
  - `PluginError` - Plugin-related errors
- Full TypeScript support with detailed type definitions
- Performance utilities:
  - `PerformanceTracker` for measuring iteration performance
  - `throttle` and `debounce` utility functions
- Type guards and validators for runtime type checking
- 100% test coverage with comprehensive unit and integration tests
- Zero runtime dependencies
- Support for both CommonJS and ESM modules
- MIT License

### Features
- **Synchronous iteration** with options for reverse iteration, error handling, and early termination
- **Asynchronous iteration** with timeout support and error handling
- **Parallel processing** with configurable concurrency and order preservation
- **Lazy evaluation** with filter, map, take, skip operations
- **Chunked processing** for memory-efficient handling of large datasets
- **Plugin architecture** for extending functionality
- **Type safety** with full TypeScript support
- **Performance optimized** with minimal overhead

### Documentation
- Comprehensive README with API reference and examples
- JSDoc comments for all public APIs
- Integration examples for common use cases
- Performance benchmarks and comparisons

[1.0.0]: https://github.com/ersinkoc/foreach/releases/tag/v1.0.0