# Node Package Builder

A cross-platform npm module for building Node.js applications into single executable files using Node.js Single Executable Applications (SEA) feature.

## Features

- 🚀 Build single executable applications from Node.js projects
- 🌍 Cross-platform support (Linux, macOS, Windows)
- 📦 Simple CLI interface
- ⚙️ Configurable build options
- 🎯 Support for assets bundling
- 🔧 Code cache and snapshot optimization

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
- `-p, --platforms <platforms>`: Target platforms, comma-separated (default: current platform)
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
| `platforms` | array | `[process.platform]` | Target platforms to build for |
| `useSnapshot` | boolean | `false` | Enable V8 snapshot for faster startup |
| `useCodeCache` | boolean | `false` | Enable code cache for faster startup |
| `assets` | object | `{}` | Additional files to bundle |
| `disableExperimentalSEAWarning` | boolean | `true` | Disable experimental feature warning |

## Cross-Platform Building

When building for platforms different from your current platform:

- `useSnapshot` and `useCodeCache` are automatically disabled
- Code cache and snapshots are platform-specific
- The generated executable will work on the target platform

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

## Examples

Check out the `examples/` directory for sample projects:

- Simple CLI application
- Web server application
- Application with bundled assets

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details.

## Related

- [Node.js Single Executable Applications](https://nodejs.org/api/single-executable-applications.html)
- [postject](https://github.com/postmanlabs/postject)
- [Node.js SEA Documentation](https://nodejs.org/api/single-executable-applications.html)