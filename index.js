const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const axios = require('axios');
const tar = require('tar');
const yauzl = require('yauzl');
const semver = require('semver');
const { promisify } = require('util');
const { pipeline } = require('stream');
const crypto = require('crypto');
const pipelineAsync = promisify(pipeline);

/**
 * Main class for building Node.js applications into single executable files using SEA (Single Executable Applications)
 * Supports cross-platform builds for Linux, macOS, and Windows
 * @class NodePackageBuilder
 */
class NodePackageBuilder {
  /**
   * Create a new NodePackageBuilder instance
   * @param {Object} [options={}] - Build configuration options
   * @param {string} [options.main='index.js'] - Main JavaScript file to build
   * @param {string} [options.output='app'] - Output executable name
   * @param {boolean} [options.disableExperimentalSEAWarning=true] - Disable experimental SEA warning
   * @param {boolean} [options.useSnapshot=false] - Enable snapshot support
   * @param {boolean} [options.useCodeCache=false] - Enable code cache
   * @param {Object} [options.assets={}] - Assets to include in the executable
   * @param {string[]} [options.platforms=['linux', 'darwin', 'win32']] - Target platforms to build for
   * @param {string} [options.tempDir] - Temporary directory for build files
   */
  constructor(options = {}) {
    this.options = {
      main: options.main || 'index.js',
      output: options.output || 'app',
      disableExperimentalSEAWarning: options.disableExperimentalSEAWarning || true,
      useSnapshot: options.useSnapshot || false,
      useCodeCache: options.useCodeCache || false,
      assets: options.assets || {},
      platforms: options.platforms || ['linux', 'darwin', 'win32'],
      tempDir: options.tempDir || path.join(os.tmpdir(), 'node-package-builder'),
      ...options
    };
    
    this.buildId = this.generateBuildId();
    this.tempBuildDir = path.join(this.options.tempDir, this.buildId);
    
    this.checkNodeVersion();
    this.ensureTempDir();
  }
  
  /**
   * Generate a unique build identifier using timestamp and random bytes
   * @returns {string} Unique build ID string
   */
  generateBuildId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `build-${timestamp}-${random}`;
  }

  /**
   * Ensure temporary directories exist, creating them if necessary
   */
  ensureTempDir() {
    if (!fs.existsSync(this.options.tempDir)) {
      fs.mkdirSync(this.options.tempDir, { recursive: true });
    }
    if (!fs.existsSync(this.tempBuildDir)) {
      fs.mkdirSync(this.tempBuildDir, { recursive: true });
    }
  }

  /**
   * Check if current Node.js version meets minimum requirements
   * @throws {Error} If Node.js version is too old
   */
  checkNodeVersion() {
    const currentVersion = process.version.slice(1);
    const requiredVersion = '19.9.0';
    
    if (!this.isVersionGreaterOrEqual(currentVersion, requiredVersion)) {
      throw new Error(`Node.js version ${requiredVersion} or higher is required. Current version: ${currentVersion}`);
    }
  }
  
  /**
   * Compare version strings to determine if current version meets requirements
   * @param {string} current - Current version string
   * @param {string} required - Required minimum version string
   * @returns {boolean} True if current version is greater than or equal to required
   */
  isVersionGreaterOrEqual(current, required) {
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const requiredPart = requiredParts[i] || 0;
      
      if (currentPart > requiredPart) return true;
      if (currentPart < requiredPart) return false;
    }
    
    return true;
  }

  /**
   * Build executables for all configured platforms
   * @returns {Promise<Array<{platform: string, success: boolean, executable: string, path: string, buildId: string, error: string}>>} Promise that resolves to an array of build results
   */
  async build() {
    const results = [];
    
    try {
      for (const platform of this.options.platforms) {
        try {
          const result = await this.buildForPlatform(platform);
          results.push(result);
        } catch (error) {
          console.error(`Failed to build for ${platform}:`, error.message);
          results.push({ platform, success: false, error: error.message });
        }
      }
      
      return results;
    } finally {
      this.cleanupTempDir();
    }
  }

  /**
   * Build executable for a specific platform
   * @param {string} platform - Target platform ('linux', 'darwin', or 'win32')
   * @returns {Promise<{platform: string, success: boolean, executable: string, path: string, buildId: string}>} Promise that resolves to build result
   * @throws {Error} If build process fails
   */
  async buildForPlatform(platform) {
    const configPath = this.createSeaConfig(platform);
    const blobPath = path.join(this.tempBuildDir, `sea-prep-${platform}.blob`);
    const executableName = this.getExecutableName(platform);
    
    try {
      this.generateBlob(configPath);
      
      await this.createExecutable(platform, executableName);
      
      await this.injectBlob(platform, executableName, blobPath);
      
      if (platform === 'darwin' || platform === 'win32') {
        await this.signExecutable(platform, executableName);
      }
      
      this.cleanup([configPath, blobPath]);
      
      return {
        platform,
        success: true,
        executable: executableName,
        path: path.resolve(executableName),
        buildId: this.buildId
      };
    } catch (error) {
      this.cleanup([configPath, blobPath]);
      throw error;
    }
  }

  /**
   * Create SEA (Single Executable Application) configuration file for a platform
   * @param {string} platform - Target platform
   * @returns {string} Path to the created configuration file
   */
  createSeaConfig(platform) {
    const config = {
      main: this.options.main,
      output: path.join(this.tempBuildDir, `sea-prep-${platform}.blob`),
      disableExperimentalSEAWarning: this.options.disableExperimentalSEAWarning,
      useSnapshot: this.options.useSnapshot,
      useCodeCache: this.options.useCodeCache
    };

    if (platform !== process.platform) {
      config.useSnapshot = false;
      config.useCodeCache = false;
    }

    if (Object.keys(this.options.assets).length > 0) {
      config.assets = this.options.assets;
    }

    const configPath = path.join(this.tempBuildDir, `sea-config-${platform}-${this.buildId}.json`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return configPath;
  }

  /**
   * Generate blob file from SEA configuration using Node.js
   * @param {string} configPath - Path to SEA configuration file
   * @throws {Error} If blob generation fails
   */
  generateBlob(configPath) {
    try {
      const nodeExecutable = process.execPath;
      execSync(`"${nodeExecutable}" --experimental-sea-config ${configPath}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      throw new Error(`Failed to generate blob: ${error.message}`);
    }
  }

  /**
   * Create executable file for target platform by copying Node.js binary
   * @param {string} platform - Target platform
   * @param {string} executableName - Name of the executable to create
   * @throws {Error} If executable creation fails
   */
  async createExecutable(platform, executableName) {
    let nodePath;
    
    if (platform === process.platform) {
      nodePath = process.execPath;
    } else {
      nodePath = await this.downloadNodeBinary(platform);
    }
    
    if (platform === 'win32' && !executableName.endsWith('.exe')) {
      executableName += '.exe';
    }
    
    try {
      fs.copyFileSync(nodePath, executableName);
    } catch (error) {
      throw new Error(`Failed to copy Node.js executable from '${nodePath}' to '${executableName}': ${error.message}`);
    }

    if (platform === 'darwin') {
      try {
        execSync(`codesign --remove-signature "${executableName}"`, { stdio: 'ignore' });
      } catch (error) {
        console.warn('Warning: Could not remove signature. Continuing...');
      }
    }

    if (platform === 'win32') {
      try {
        execSync(`signtool remove /s "${executableName}"`, { stdio: 'ignore' });
      } catch (error) {
        console.warn('Warning: Could not remove signature. Continuing...');
      }
    }
  }

  /**
   * Inject blob into executable using postject tool
   * @param {string} platform - Target platform
   * @param {string} executableName - Name of the executable
   * @param {string} blobPath - Path to the blob file to inject
   * @throws {Error} If blob injection fails
   */
  async injectBlob(platform, executableName, blobPath) {
    let command;
    const sentinelFuse = 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2';
    
    if (platform === 'darwin') {
      command = `npx postject "${executableName}" NODE_SEA_BLOB "${blobPath}" --sentinel-fuse ${sentinelFuse} --macho-segment-name NODE_SEA`;
    } else {
      command = `npx postject "${executableName}" NODE_SEA_BLOB "${blobPath}" --sentinel-fuse ${sentinelFuse}`;
    }

    try {
      execSync(command, { stdio: 'inherit' });
      
      if (platform === 'win32') {
        await this.verifyWindowsExecutable(executableName);
      }
    } catch (error) {
      throw new Error(`Failed to inject blob: ${error.message}`);
    }
  }
  
  /**
   * Verify Windows executable is working correctly and not in REPL mode
   * @param {string} executableName - Name of the executable to verify
   * @throws {Error} If executable is still in REPL mode
   */
  async verifyWindowsExecutable(executableName) {
    try {
      const result = execSync(`"${path.resolve(executableName)}" --help`, { 
        encoding: 'utf8', 
        timeout: 5000,
        stdio: 'pipe'
      });
      
      if (result.includes('Welcome to Node.js') || result.includes('Type ".help"')) {
        throw new Error('Windows executable is still in REPL mode - blob injection failed');
      }
    } catch (error) {
      if (error.message.includes('REPL mode')) {
        throw error;
      }
    }
  }

  /**
   * Sign executable for distribution (macOS and Windows)
   * @param {string} platform - Target platform
   * @param {string} executableName - Name of the executable to sign
   */
  async signExecutable(platform, executableName) {
    try {
      if (platform === 'darwin') {
        execSync(`codesign --sign - "${executableName}"`, { stdio: 'ignore' });
      } else if (platform === 'win32') {
        execSync(`signtool sign /fd SHA256 "${executableName}"`, { stdio: 'ignore' });
      }
    } catch (error) {
      console.warn(`Warning: Could not sign executable for ${platform}. The executable should still work.`);
    }
  }

  /**
   * Get executable name for platform with appropriate extension
   * @param {string} platform - Target platform
   * @returns {string} Executable name with platform-specific extension
   */
  getExecutableName(platform) {
    const baseName = this.options.output;
    if (platform === 'win32') {
      return baseName.endsWith('.exe') ? baseName : `${baseName}.exe`;
    }
    return baseName;
  }

  /**
   * Download Node.js binary for target platform with caching support
   * @param {string} platform - Target platform
   * @returns {Promise<string>} Promise that resolves to path of downloaded Node.js binary
   * @throws {Error} If download or extraction fails
   */
  async downloadNodeBinary(platform) {
    const version = await this.getRecommendedNodeVersion();
    const cacheDir = path.join(os.homedir(), '.node-package-builder', 'cache');
    const platformDir = path.join(cacheDir, platform);
    const versionDir = path.join(platformDir, version);
    
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    if (!fs.existsSync(platformDir)) {
      fs.mkdirSync(platformDir, { recursive: true });
    }
    
    const executableName = platform === 'win32' ? 'node.exe' : 'node';
    const executablePath = path.join(versionDir, executableName);
    
    if (fs.existsSync(executablePath)) {
      console.log(`Using cached Node.js ${version} for ${platform}`);
      return executablePath;
    }
    
    console.log(`Downloading Node.js ${version} for ${platform}...`);
    
    const downloadUrl = this.getNodeDownloadUrl(version, platform);
    const archivePath = path.join(platformDir, `node-${version}-${platform}.${platform === 'win32' ? 'zip' : 'tar.gz'}`);
    
    await this.downloadFile(downloadUrl, archivePath);
    
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true });
    }
    
    await this.extractNodeBinary(archivePath, versionDir, platform, version);
    
    fs.unlinkSync(archivePath);
    
    if (!fs.existsSync(executablePath)) {
      throw new Error(`Failed to extract Node.js executable for ${platform}`);
    }
    
    if (platform !== 'win32') {
      fs.chmodSync(executablePath, '755');
    }
    
    return executablePath;
  }
  
  /**
   * Get recommended Node.js version from official registry with fallback
   * @returns {Promise<string>} Promise that resolves to recommended Node.js version string
   */
  async getRecommendedNodeVersion() {
    try {
      const response = await axios.get('https://nodejs.org/dist/index.json');
      const versions = response.data;
      
      const minVersion = '19.9.0';
      const maxVersion = '22.99.99';
      const validVersions = versions.filter(v => {
        const version = v.version.slice(1);
        return semver.gte(version, minVersion) && 
               semver.lte(version, maxVersion) &&
               !v.version.includes('rc') && 
               !v.version.includes('beta');
      });
      
      if (validVersions.length === 0) {
        throw new Error(`No valid Node.js versions found (minimum: ${minVersion})`);
      }
      
      const preferredVersions = ['20.18.0', '20.17.0', '20.16.0', '20.15.1'];
      for (const preferred of preferredVersions) {
        const found = validVersions.find(v => v.version.slice(1) === preferred);
        if (found) {
          return found.version.slice(1);
        }
      }
      
      const latestLTS = validVersions.find(v => v.lts !== false && semver.major(v.version.slice(1)) === 20);
      if (latestLTS) {
        return latestLTS.version.slice(1);
      }
      
      return validVersions[0].version.slice(1);
    } catch (error) {
      console.warn('Failed to fetch latest Node.js version, using fallback');
      return '20.18.0';
    }
  }
  
  /**
   * Get download URL for Node.js binary for specific version and platform
   * @param {string} version - Node.js version
   * @param {string} platform - Target platform
   * @returns {string} Download URL for Node.js binary
   * @throws {Error} If platform is unsupported
   */
  getNodeDownloadUrl(version, platform) {
    const arch = 'x64';
    const baseUrl = 'https://nodejs.org/dist';
    
    if (platform === 'win32') {
      return `${baseUrl}/v${version}/node-v${version}-win-${arch}.zip`;
    } else if (platform === 'darwin') {
      return `${baseUrl}/v${version}/node-v${version}-darwin-${arch}.tar.gz`;
    } else if (platform === 'linux') {
      return `${baseUrl}/v${version}/node-v${version}-linux-${arch}.tar.gz`;
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }
  
  /**
   * Download file from URL to local path using streaming
   * @param {string} url - File URL to download
   * @param {string} filePath - Destination file path
   * @returns {Promise<void>} Promise that resolves when download completes
   */
  async downloadFile(url, filePath) {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(filePath);
    await pipelineAsync(response.data, writer);
  }
  
  /**
   * Extract Node.js binary from archive file (ZIP for Windows, tar.gz for Unix)
   * @param {string} archivePath - Path to archive file
   * @param {string} extractDir - Directory to extract to
   * @param {string} platform - Target platform
   * @param {string} version - Node.js version
   * @returns {Promise<void>} Promise that resolves when extraction completes
   */
  async extractNodeBinary(archivePath, extractDir, platform, version) {
    if (platform === 'win32') {
      await this.extractZip(archivePath, extractDir, version, platform);
    } else {
      await this.extractTarGz(archivePath, extractDir, version, platform);
    }
  }
  
  /**
   * Extract Node.js binary from ZIP archive (Windows)
   * @param {string} zipPath - Path to ZIP file
   * @param {string} extractDir - Directory to extract to
   * @param {string} version - Node.js version
   * @param {string} platform - Target platform
   * @returns {Promise<void>} Promise that resolves when extraction completes
   */
  async extractZip(zipPath, extractDir, version, platform) {
    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) return reject(err);
        
        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
          if (entry.fileName.endsWith('node.exe')) {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) return reject(err);
              
              const outputPath = path.join(extractDir, 'node.exe');
              const writeStream = fs.createWriteStream(outputPath);
              
              readStream.pipe(writeStream);
              writeStream.on('close', () => {
                zipfile.close();
                resolve();
              });
              writeStream.on('error', reject);
            });
          } else {
            zipfile.readEntry();
          }
        });
        
        zipfile.on('end', resolve);
        zipfile.on('error', reject);
      });
    });
  }
  
  /**
   * Extract Node.js binary from tar.gz archive (Unix systems)
   * @param {string} tarPath - Path to tar.gz file
   * @param {string} extractDir - Directory to extract to
   * @param {string} version - Node.js version
   * @param {string} platform - Target platform
   * @returns {Promise<void>} Promise that resolves when extraction completes
   */
  async extractTarGz(tarPath, extractDir, version, platform) {
    const folderName = `node-v${version}-${platform}-x64`;
    const nodeBinaryPath = `${folderName}/bin/node`;
    
    await tar.extract({
      file: tarPath,
      cwd: extractDir,
      filter: (path) => path === nodeBinaryPath
    });
    
    const extractedPath = path.join(extractDir, nodeBinaryPath);
    const finalPath = path.join(extractDir, 'node');
    
    if (fs.existsSync(extractedPath)) {
      fs.renameSync(extractedPath, finalPath);
      
      const folderPath = path.join(extractDir, folderName);
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
      }
    }
  }

  /**
   * Clean up temporary files
   * @param {string[]} files - Array of file paths to clean up
   */
  cleanup(files) {
    files.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (error) {
        console.warn(`Warning: Could not clean up ${file}`);
      }
    });
  }

  /**
   * Clean up temporary build directory for this instance
   */
  cleanupTempDir() {
    try {
      if (fs.existsSync(this.tempBuildDir)) {
        fs.rmSync(this.tempBuildDir, { recursive: true, force: true });
        console.log(`Cleaned up temporary build directory: ${this.tempBuildDir}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not clean up temp directory ${this.tempBuildDir}: ${error.message}`);
    }
  }

  /**
   * Clean up all temporary build directories from previous builds
   * @static
   */
  static cleanupAllTempDirs() {
    try {
      const tempDir = path.join(os.tmpdir(), 'node-package-builder');
      if (fs.existsSync(tempDir)) {
        const buildDirs = fs.readdirSync(tempDir).filter(dir => dir.startsWith('build-'));
        buildDirs.forEach(buildDir => {
          const fullPath = path.join(tempDir, buildDir);
          try {
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`Cleaned up old build directory: ${fullPath}`);
          } catch (error) {
            console.warn(`Warning: Could not clean up ${fullPath}: ${error.message}`);
          }
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not clean up temp directories: ${error.message}`);
    }
  }

  /**
   * Get list of supported target platforms
   * @static
   * @returns {string[]} Array of supported platform names
   */
  static getSupportedPlatforms() {
    return ['linux', 'darwin', 'win32'];
  }

  /**
   * Validate that main file exists and is accessible
   * @static
   * @param {string} mainFile - Path to main file to validate
   * @throws {Error} If main file is invalid or doesn't exist
   */
  static validateMainFile(mainFile) {
    if (!fs.existsSync(mainFile)) {
      throw new Error(`Main file not found: ${mainFile}`);
    }
    
    const stats = fs.statSync(mainFile);
    if (!stats.isFile()) {
      throw new Error(`Main file is not a file: ${mainFile}`);
    }
  }
}

module.exports = NodePackageBuilder;
module.exports.NodePackageBuilder = NodePackageBuilder;
module.exports.getSupportedPlatforms = NodePackageBuilder.getSupportedPlatforms;
module.exports.validateMainFile = NodePackageBuilder.validateMainFile;
module.exports.cleanupAllTempDirs = NodePackageBuilder.cleanupAllTempDirs;