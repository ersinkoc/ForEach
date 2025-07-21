# Contributing to @oxog/foreach

Thank you for your interest in contributing to @oxog/foreach! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainers@oxog.com](mailto:maintainers@oxog.com).

## Getting Started

### Prerequisites

- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/foreach.git
   cd foreach
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Verify the setup:
   ```bash
   npm test
   npm run build
   ```

## Contribution Workflow

1. **Create an Issue**: Before starting work, create an issue describing the bug fix or feature
2. **Create a Branch**: Create a feature branch from `develop`
3. **Make Changes**: Implement your changes following our coding standards
4. **Test**: Ensure all tests pass and add new tests for your changes
5. **Document**: Update documentation as needed
6. **Submit PR**: Create a pull request against the `develop` branch

### Branch Naming

- Features: `feature/description-of-feature`
- Bug fixes: `fix/description-of-fix`
- Documentation: `docs/description-of-change`
- Refactoring: `refactor/description-of-refactor`

## Coding Standards

### TypeScript Guidelines

- Use strict TypeScript with no `any` types unless absolutely necessary
- All functions must have explicit return types
- Use interfaces for object types, prefixed with `I`
- Use type aliases for union types
- Follow the naming conventions:
  - Classes: `PascalCase`
  - Interfaces: `IPascalCase`
  - Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Private members: `_camelCase`

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Error Handling

- Use custom error classes that extend `ForEachError`
- Provide meaningful error messages
- Include error codes and additional details where helpful
- Document error conditions in JSDoc comments

## Testing

### Test Requirements

- **100% code coverage is mandatory**
- Write tests for all new functionality
- Update existing tests when modifying behavior
- Include both positive and negative test cases
- Test edge cases and error conditions

### Test Structure

```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for complete workflows
└── fixtures/       # Test data and utilities
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/core/foreach.test.ts
```

### Writing Tests

```typescript
describe('functionName', () => {
  describe('when condition', () => {
    it('should behave correctly', () => {
      // Arrange
      const input = createTestData();
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

## Documentation

### JSDoc Comments

All public APIs must have comprehensive JSDoc comments:

```typescript
/**
 * Iterates over an array or object and executes a callback for each element.
 * 
 * @param target - The array or object to iterate over
 * @param callback - Function to execute for each element
 * @param options - Configuration options for iteration
 * @returns void
 * 
 * @example
 * ```typescript
 * forEach([1, 2, 3], (value, index) => {
 *   console.log(`Index ${index}: ${value}`);
 * });
 * ```
 * 
 * @throws {ForEachError} When target is not an array or object
 * @throws {ForEachError} When callback is not a function
 */
```

### README Updates

When adding new features:
1. Update the API reference section
2. Add usage examples
3. Update the feature list
4. Include performance notes if applicable

## Submitting Changes

### Pull Request Guidelines

1. **Title**: Use a clear, descriptive title
2. **Description**: Include:
   - What changes were made and why
   - Link to related issues
   - Breaking changes (if any)
   - Testing performed
3. **Checklist**: Complete the PR template checklist
4. **Size**: Keep PRs focused and reasonably sized

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Added unit tests
- [ ] Added integration tests
- [ ] All tests pass
- [ ] Coverage remains 100%

## Documentation
- [ ] Updated README
- [ ] Updated JSDoc comments
- [ ] Added examples

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] No console.log statements
- [ ] Breaking changes documented
```

### Review Process

1. Automated checks must pass (CI, tests, linting)
2. At least one maintainer review required
3. All feedback must be addressed
4. Final approval from a maintainer

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Workflow

1. Create release branch from `develop`
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Create PR to `main`
5. After merge, create GitHub release
6. Automated publishing to npm

### Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.1.0] - 2024-01-20

### Added
- New forEachParallel function for concurrent processing

### Changed
- Improved error messages for validation errors

### Fixed
- Fixed memory leak in lazy evaluation

### Deprecated
- Deprecated old forEach options (will be removed in v2.0.0)
```

## Development Tips

### Performance Considerations

- Benchmark new features against existing solutions
- Consider memory usage for large datasets
- Optimize for common use cases
- Document performance characteristics

### Zero Dependencies Policy

- All functionality must be implemented from scratch
- No runtime dependencies allowed
- Development dependencies are okay (testing, building, linting)
- Consider performance implications of custom implementations

### Browser Compatibility

While primarily targeting Node.js, ensure code works in modern browsers:
- Use ES2020 features
- Avoid Node.js-specific APIs in core functionality
- Test in multiple environments

## Getting Help

- **Issues**: Check existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers at [maintainers@oxog.com](mailto:maintainers@oxog.com)
- **Documentation**: Refer to README and API docs

## Recognition

Contributors are recognized in:
- CHANGELOG.md for significant contributions
- README.md contributors section
- GitHub contributors graph
- Release notes

Thank you for contributing to @oxog/foreach! 🎉