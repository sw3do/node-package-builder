<div align="center">

# Node Package Builder

[![npm version](https://badge.fury.io/js/node-package-builder.svg)](https://badge.fury.io/js/node-package-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.16.0-brightgreen.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/node-package-builder.svg)](https://www.npmjs.com/package/node-package-builder)
[![GitHub Stars](https://img.shields.io/github/stars/sw3do/node-package-builder.svg)](https://github.com/sw3do/node-package-builder/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/sw3do/node-package-builder.svg)](https://github.com/sw3do/node-package-builder/issues)

**A powerful cross-platform npm module for building Node.js applications into single executable files using Node.js Single Executable Applications (SEA) feature.**

[Installation](#installation) • [Quick Start](#quick-start) • [Documentation](#cli-usage) • [Examples](#examples) • [Contributing](#contributing)

</div>

## Features

- 🚀 Build single executable applications from Node.js projects
- 🌍 **True cross-platform support** - Build for Linux, macOS, and Windows from any platform
- 📥 **Automatic Node.js downloading** - Downloads compatible Node.js binaries from the internet
- 📦 Simple CLI interface
- ⚙️ Configurable build options
- 🎯 Support for assets bundling
- 🔧 Code cache and snapshot optimization
- 🔄 **Version management** - Uses Node.js versions 19.9.0+ with smart version selection

## Requirements

- Node.js >= 18.16.0 (for SEA support)
- npm or yarn

## Installation

### Global Installation (Recommended)

```bash
npm install -g node-package-builder
```

### Local Installation

```bash
npm install node-package-builder
```

## Quick Start

### 1. Create a sample project

```bash
node-package-builder init my-app
cd my-app
```

### 2. Build executable for current platform

```bash
node-package-builder build
```

### 3. Run your executable

```bash
./app
```

## CLI Usage

### Build Command

```bash
node-package-builder build [options]
```

#### Options:

- `-m, --main <file>`: Main JavaScript file (default: "index.js")
- `-o, --output <name>`: Output executable name (default: "app")
- `-p, --platforms <platforms>`: Target platforms, comma-separated (default: "linux,darwin,win32")
- `--use-snapshot`: Enable snapshot support (default: false)
- `--use-code-cache`: Enable code cache (default: false)
- `--assets <assets>`: Assets to include as JSON string (default: "{}")
- `--disable-warning`: Disable experimental SEA warning (default: true)

#### Examples:

```bash
# Build for current platform
node-package-builder build

# Build for multiple platforms
node-package-builder build --platforms linux,darwin,win32

# Build with custom main file and output name
node-package-builder build --main src/app.js --output myapp

# Build with assets
node-package-builder build --assets '{"config.json": "./config.json", "data.txt": "./data.txt"}'

# Build with optimizations
node-package-builder build --use-code-cache --use-snapshot
```

### Other Commands

```bash
# List supported platforms
node-package-builder platforms

# Initialize a sample project
node-package-builder init [project-name]

# Clean up temporary build files
node-package-builder cleanup

# Show help
node-package-builder --help
```

## Programmatic Usage

```javascript
const NodePackageBuilder = require('node-package-builder');

async function buildApp() {
  const builder = new NodePackageBuilder({
    main: 'src/index.js',
    output: 'myapp',
    platforms: ['linux', 'darwin', 'win32'],
    useCodeCache: true,
    assets: {
      'config.json': './config.json'
    }
  });

  try {
    const results = await builder.build();
    console.log('Build results:', results);
  } catch (error) {
    console.error('Build failed:', error);
  }
}

buildApp();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `main` | string | `'index.js'` | Entry point of your application |
| `output` | string | `'app'` | Name of the output executable |
| `platforms` | array | `['linux', 'darwin', 'win32']` | Target platforms to build for |
| `useSnapshot` | boolean | `false` | Enable V8 snapshot for faster startup |
| `useCodeCache` | boolean | `false` | Enable code cache for faster startup |
| `assets` | object | `{}` | Additional files to bundle |
| `disableExperimentalSEAWarning` | boolean | `true` | Disable experimental feature warning |
| `tempDir` | string | `os.tmpdir()/node-package-builder` | Custom temporary directory for build files |

## Cross-Platform Building

**NEW: True Cross-Platform Support!** 🎉

You can now build executables for **any platform from any platform**:

```bash
# Build for all platforms from macOS
node-package-builder build --platforms linux,darwin,win32

# Build Windows executable from Linux
node-package-builder build --platforms win32

# Build Linux executable from Windows
node-package-builder build --platforms linux
```

### How it works:

1. **Automatic Node.js Download**: Downloads compatible Node.js binaries (v19.9.0+) from nodejs.org
2. **Smart Version Selection**: Prefers stable LTS versions (20.x series) for maximum compatibility
3. **Local Caching**: Downloaded binaries are cached in `~/.node-package-builder/cache/`
4. **Platform-Specific Optimization**: Automatically adjusts build settings per platform

### Platform-specific behavior:

- **Same platform**: Uses your local Node.js executable
- **Different platform**: Downloads and uses platform-specific Node.js binary
- `useSnapshot` and `useCodeCache` are automatically disabled for cross-platform builds
- Windows builds include automatic `.exe` extension

### Version Management:

- **Minimum version**: 19.9.0 (required for SEA support)
- **Preferred versions**: 20.18.0, 20.17.0, 20.16.0, 20.15.1
- **Fallback version**: 20.18.0 if internet is unavailable
- **Maximum version**: 22.x (for stability)

## Temporary File Management

**NEW: Smart Temporary File Handling!** 🧹

The builder now uses a sophisticated temporary file system to prevent conflicts and ensure clean builds:

### Features:

- **Isolated Build Directories**: Each build gets a unique temporary directory
- **Automatic Cleanup**: Temporary files are automatically cleaned after each build
- **Conflict Prevention**: Multiple simultaneous builds won't interfere with each other
- **Manual Cleanup**: Clean up all temporary files with the cleanup command

### How it works:

1. **Unique Build IDs**: Each build gets a unique ID (timestamp + random hash)
2. **Temporary Directory**: Files are created in `os.tmpdir()/node-package-builder/build-{id}/`
3. **Automatic Cleanup**: Temporary directory is removed after build completion
4. **Manual Cleanup**: Use `node-package-builder cleanup` to remove all temporary directories

### Examples:

```bash
# Build with automatic cleanup
node-package-builder build

# Manual cleanup of all temporary files
node-package-builder cleanup

# Custom temporary directory
const builder = new NodePackageBuilder({
  main: 'index.js',
  tempDir: '/custom/temp/path'
});
```

### Programmatic Cleanup:

```javascript
const { cleanupAllTempDirs } = require('node-package-builder');

// Clean up all temporary directories
cleanupAllTempDirs();
```

## Assets Bundling

You can bundle additional files with your executable:

```javascript
const builder = new NodePackageBuilder({
  main: 'index.js',
  assets: {
    'config.json': './config/production.json',
    'templates/main.html': './src/templates/main.html',
    'data.txt': './data/sample.txt'
  }
});
```

Access bundled assets in your application:

```javascript
const fs = require('fs');
const { getAsset } = require('node:sea');

// Read bundled asset
const config = JSON.parse(getAsset('config.json', 'utf8'));
const template = getAsset('templates/main.html', 'utf8');
```

## Platform-Specific Notes

### macOS
- Code signing is automatically handled
- Requires Xcode command line tools for signing

### Windows
- `.exe` extension is automatically added
- Optional code signing with signtool

### Linux
- No additional requirements
- Executable permissions are set automatically

## Troubleshooting

### Common Issues

1. **"postject not found"**
   ```bash
   npm install -g postject
   ```

2. **Permission denied on macOS/Linux**
   ```bash
   chmod +x ./your-app
   ```

3. **Code signing issues on macOS**
   - Install Xcode command line tools: `xcode-select --install`
   - Or disable signing warnings in system preferences

4. **Large executable size**
   - Use `--use-code-cache` for better compression
   - Minimize dependencies in your application

5. **Build conflicts with multiple builds**
   ```bash
   # Clean up temporary files
   node-package-builder cleanup
   ```

6. **Temporary files not cleaned up**
   - Temporary files are automatically cleaned after each build
   - Use `node-package-builder cleanup` to manually clean all temp files
   - Check `os.tmpdir()/node-package-builder/` for any remaining files

## Examples

Check out the `examples/` directory for sample projects:

- Simple CLI application
- Web server application
- Application with bundled assets

## API Documentation

For detailed API documentation with TypeScript support, see the generated JSDoc documentation:

```bash
npm run docs
```

The documentation will be generated in the `docs/` directory.

## TypeScript Support

This package includes full TypeScript definitions. You can use it in TypeScript projects:

```typescript
import NodePackageBuilder from 'node-package-builder';

const builder = new NodePackageBuilder({
  main: 'src/index.ts',
  output: 'myapp',
  platforms: ['linux', 'darwin', 'win32']
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/sw3do/node-package-builder/blob/main/CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository: `https://github.com/sw3do/node-package-builder`
2. Clone your fork: `git clone https://github.com/sw3do/node-package-builder.git`
3. Install dependencies: `npm install`
4. Create your feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes and add tests
6. Run type checking: `npm run type-check`
7. Generate documentation: `npm run docs`
8. Commit your changes: `git commit -m 'Add amazing feature'`
9. Push to the branch: `git push origin feature/amazing-feature`
10. Open a Pull Request

### Code Style

- Follow the existing code style
- Add JSDoc comments for all public methods
- Include TypeScript definitions
- Write tests for new features

## Changelog

See [CHANGELOG.md](https://github.com/sw3do/node-package-builder/blob/main/CHANGELOG.md) for a detailed history of changes.

## Support

- 📖 [Documentation](https://github.com/sw3do/node-package-builder#readme)
- 🐛 [Issue Tracker](https://github.com/sw3do/node-package-builder/issues)
- 💬 [Discussions](https://github.com/sw3do/node-package-builder/discussions)
- 📧 [Contact](mailto:sw3do@example.com)

## License

MIT License - see [LICENSE](https://github.com/sw3do/node-package-builder/blob/main/LICENSE) file for details.

## Author

**sw3do** - [GitHub](https://github.com/sw3do)

## Related Projects

- [Node.js Single Executable Applications](https://nodejs.org/api/single-executable-applications.html) - Official Node.js SEA documentation
- [postject](https://github.com/postmanlabs/postject) - Tool for injecting arbitrary read-only resources into executable files
- [pkg](https://github.com/vercel/pkg) - Alternative packaging solution for Node.js
- [nexe](https://github.com/nexe/nexe) - Another Node.js executable builder

---

<div align="center">

**Made with ❤️ by [sw3do](https://github.com/sw3do)**

[⭐ Star this project](https://github.com/sw3do/node-package-builder) if you find it useful!

</div>