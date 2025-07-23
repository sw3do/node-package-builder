# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Node Package Builder
- Cross-platform support for building Node.js applications into single executables
- Support for Linux, macOS, and Windows platforms
- Automatic Node.js binary downloading and caching
- Smart version selection with LTS preference
- Temporary file management with unique build IDs
- Assets bundling support
- CLI interface with comprehensive options
- Programmatic API for integration
- Code cache and snapshot optimization support
- JSDoc documentation generation
- Full TypeScript support with type definitions
- Cross-platform building capabilities
- Automatic cleanup of temporary files
- Platform-specific optimizations

### Features
- **CLI Commands:**
  - `build` - Build executables for specified platforms
  - `platforms` - List supported platforms
  - `init` - Initialize sample projects
  - `cleanup` - Clean temporary files

- **Build Options:**
  - Custom main file specification
  - Output name configuration
  - Multi-platform targeting
  - Asset bundling
  - Code cache and snapshot support
  - Experimental warning control

- **Cross-Platform Support:**
  - Build for any platform from any platform
  - Automatic Node.js binary downloading
  - Platform-specific executable naming
  - Smart build optimization per platform

- **Developer Experience:**
  - Comprehensive JSDoc documentation
  - Full TypeScript definitions
  - Professional CLI with colored output
  - Progress indicators and error handling
  - Detailed build logging

### Technical Details
- Minimum Node.js version: 18.16.0
- Supported Node.js versions for building: 19.9.0+
- Preferred Node.js versions: 20.x LTS series
- Dependencies: commander, chalk, ora, axios, tar, yauzl, semver
- Development dependencies: TypeScript, JSDoc, type definitions

[1.0.0]: https://github.com/sw3do/node-package-builder/releases/tag/v1.0.0