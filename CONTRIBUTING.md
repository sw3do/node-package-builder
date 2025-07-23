# Contributing to Node Package Builder

First off, thank you for considering contributing to Node Package Builder! 🎉

It's people like you that make Node Package Builder such a great tool for the Node.js community.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting A Bug Report:**
- Check the [issues](https://github.com/sw3do/node-package-builder/issues) to see if the problem has already been reported
- Check the [troubleshooting section](https://github.com/sw3do/node-package-builder#troubleshooting) in the README
- Perform a cursory search to see if the problem has already been reported

**How Do I Submit A Bug Report?**

Bugs are tracked as [GitHub issues](https://github.com/sw3do/node-package-builder/issues). Create an issue and provide the following information:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your environment details:**
  - OS and version
  - Node.js version
  - npm version
  - Package version

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

**Before Submitting An Enhancement Suggestion:**
- Check if the enhancement has already been suggested
- Check if the enhancement is already available in the latest version
- Determine which repository the enhancement should be suggested in

**How Do I Submit An Enhancement Suggestion?**

Enhancement suggestions are tracked as [GitHub issues](https://github.com/sw3do/node-package-builder/issues). Create an issue and provide the following information:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**
- **List some other tools where this enhancement exists**

### Pull Requests

The process described here has several goals:

- Maintain the project's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible Node Package Builder
- Enable a sustainable system for maintainers to review contributions

**Before Submitting A Pull Request:**

1. **Fork the repository**
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** following our coding standards
4. **Add tests** for your changes if applicable
5. **Update documentation** if needed
6. **Run the test suite** to ensure nothing is broken
7. **Run type checking** to ensure TypeScript compatibility:
   ```bash
   npm run type-check
   ```
8. **Generate documentation** to ensure JSDoc is up to date:
   ```bash
   npm run docs
   ```

**Pull Request Guidelines:**

- **Fill in the required template**
- **Do not include issue numbers in the PR title**
- **Include screenshots and animated GIFs in your pull request whenever possible**
- **Follow the JavaScript/TypeScript styleguides**
- **Include thoughtfully-worded, well-structured tests**
- **Document new code based on the Documentation Styleguide**
- **End all files with a newline**

## Development Setup

### Prerequisites

- Node.js >= 18.16.0
- npm or yarn
- Git

### Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/sw3do/node-package-builder.git
   cd node-package-builder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run type checking:**
   ```bash
   npm run type-check
   ```

4. **Generate documentation:**
   ```bash
   npm run docs
   ```

5. **Test the CLI:**
   ```bash
   node bin/cli.js --help
   ```

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Test your changes:**
   ```bash
   # Type checking
   npm run type-check
   
   # Generate docs
   npm run docs
   
   # Test CLI
   node bin/cli.js build --help
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

## Coding Standards

### JavaScript/TypeScript Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use UPPER_SNAKE_CASE for constants

### JSDoc Comments

- All public methods must have JSDoc comments
- Include parameter types and descriptions
- Include return type and description
- Include examples for complex methods
- Use `@throws` for methods that can throw errors

### TypeScript Definitions

- Provide complete type definitions for all public APIs
- Use interfaces for complex object types
- Export types that users might need
- Keep types in sync with JSDoc comments

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Documentation

### JSDoc Documentation

- Generate documentation with `npm run docs`
- Documentation is generated in the `docs/` directory
- All public APIs must be documented
- Include code examples in documentation

### README Updates

- Update the README if you add new features
- Include examples for new functionality
- Update the table of contents if needed
- Keep the README concise but comprehensive

## Testing

Currently, the project uses manual testing. We welcome contributions to add automated testing:

- Unit tests for core functionality
- Integration tests for CLI commands
- Cross-platform testing
- Performance testing

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a release tag
4. Publish to npm
5. Create GitHub release

## Questions?

Don't hesitate to ask questions! You can:

- Open an issue with the "question" label
- Start a discussion in [GitHub Discussions](https://github.com/sw3do/node-package-builder/discussions)
- Contact the maintainer: [sw3do](https://github.com/sw3do)

## Recognition

Contributors will be recognized in:

- The project README
- Release notes
- GitHub contributors page

Thank you for contributing! 🚀