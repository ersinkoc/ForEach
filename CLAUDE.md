# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

@oxog/foreach is a TypeScript library providing enhanced iteration functionality with zero dependencies. It offers synchronous/asynchronous iteration, lazy evaluation, chunked processing, parallel execution, and a plugin system.

## Essential Commands

### Development Commands
```bash
# Install dependencies
npm install

# Build the project (creates CommonJS, ESM, and type definitions)
npm run build

# Run all tests with coverage
npm test

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:watch      # Watch mode for tests

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format       # Format all files
npm run format:check # Check formatting

# Benchmarking
npm run benchmark
```

### Build Commands
```bash
npm run clean        # Clean dist directory
npm run build:cjs    # Build CommonJS
npm run build:esm    # Build ES modules  
npm run build:types  # Build TypeScript definitions
```

### Running a Single Test
```bash
# Run a specific test file
npx jest tests/unit/core/foreach.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="should iterate over array"

# Run with coverage for a specific file
npx jest tests/unit/core/foreach.test.ts --coverage
```

## High-Level Architecture

### Core Module Structure

The library is organized into four main areas:

1. **Core Functions** (`src/core/`)
   - `foreach.ts`: Synchronous iteration with context support
   - `foreach-async.ts`: Asynchronous sequential and parallel iteration
   - `foreach-lazy.ts`: Lazy evaluation with chainable operations
   - `foreach-chunked.ts`: Chunked processing for large datasets

2. **Plugin System** (`src/plugins/`)
   - `plugin-manager.ts`: Plugin lifecycle management
   - `interfaces.ts`: Plugin contracts and types
   - Supports hooks: `beforeIteration`, `afterIteration`, `onError`

3. **Type System** (`src/types/`)
   - Core interfaces: `IIterationContext`, `IForEachOptions`, callback types
   - Custom error classes extending `ForEachError`
   - Separate callback types for arrays vs objects

4. **Utilities** (`src/utils/`)
   - `type-guards.ts`: Runtime type checking functions
   - `validators.ts`: Input validation with detailed error messages
   - `performance.ts`: Performance tracking and throttling utilities

### Key Architectural Patterns

1. **Function Overloading Pattern**
   - Each core function has overloads for arrays and objects
   - Type discrimination using `isArray()` guard
   - Separate internal handlers for each type

2. **Validation-First Approach**
   - All public APIs validate inputs before processing
   - Custom error types with specific error codes
   - Detailed error context (index/key where error occurred)

3. **Context Object Pattern**
   - `IIterationContext` provides metadata and control flow
   - Enables `break()` and `skip()` operations
   - Tracks: index, total, isFirst, isLast

4. **Options Pattern**
   - Base options extended by specific implementations
   - Backward-compatible extension mechanism
   - Common options: `thisArg`, `breakOnError`, `breakOnReturn`

5. **Performance Tracking**
   - Built-in `PerformanceTracker` for all operations
   - Wrapped in try/finally for guaranteed cleanup
   - Optional metrics collection via plugins

### Concurrency Architecture

The async module implements sophisticated concurrency control:

1. **Semaphore Pattern**: Controls parallel execution limit
2. **Order Preservation**: Optional maintaining of result order
3. **Timeout Handling**: Per-operation timeouts with proper cleanup
4. **Error Propagation**: Configurable fail-fast vs continue behavior

### Memory Efficiency Design

1. **Lazy Iterators**: Process items on-demand
2. **Generator Support**: Alternative implementation using native generators
3. **Chunked Processing**: Configurable chunk sizes with delays
4. **Buffer Management**: Optional buffering for performance

### Plugin Integration Points

Plugins can hook into the iteration lifecycle at three points:
- **beforeIteration**: Pre-process or validate items
- **afterIteration**: Post-process or collect metrics  
- **onError**: Custom error handling or recovery

The plugin manager maintains execution order and handles async plugin operations.

### Testing Architecture

- Jest with ts-jest for TypeScript support
- 100% code coverage requirement
- Unit tests in `tests/unit/` mirror source structure
- Integration tests in `tests/integration/` for workflows
- Test fixtures in `tests/fixtures/` for shared data

### Export Strategy

The library uses a hybrid module approach:
- CommonJS build for Node.js compatibility
- ESM build for modern environments
- Separate TypeScript definitions
- All builds from single TypeScript source