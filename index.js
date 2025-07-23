const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class NodePackageBuilder {
  constructor(options = {}) {
    this.options = {
      main: options.main || 'index.js',
      output: options.output || 'app',
      disableExperimentalSEAWarning: options.disableExperimentalSEAWarning || true,
      useSnapshot: options.useSnapshot || false,
      useCodeCache: options.useCodeCache || false,
      assets: options.assets || {},
      platforms: options.platforms || [process.platform],
      ...options
    };
    
    this.checkNodeVersion();
  }
  
  checkNodeVersion() {
    const currentVersion = process.version.slice(1);
    const requiredVersion = '19.9.0';
    
    if (!this.isVersionGreaterOrEqual(currentVersion, requiredVersion)) {
      throw new Error(`Node.js version ${requiredVersion} or higher is required. Current version: ${currentVersion}`);
    }
  }
  
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

  async build() {
    const results = [];
    
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
  }

  async buildForPlatform(platform) {
    if (platform !== process.platform) {
      throw new Error(`Cross-platform building is not supported. Current platform: ${process.platform}, requested: ${platform}. Please build on the target platform.`);
    }
    
    const configPath = this.createSeaConfig(platform);
    const blobPath = path.join(process.cwd(), `sea-prep-${platform}.blob`);
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
        path: path.resolve(executableName)
      };
    } catch (error) {
      this.cleanup([configPath, blobPath]);
      throw error;
    }
  }

  createSeaConfig(platform) {
    const config = {
      main: this.options.main,
      output: `sea-prep-${platform}.blob`,
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

    const configPath = `sea-config-${platform}.json`;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return configPath;
  }

  generateBlob(configPath) {
    try {
      execSync(`node --experimental-sea-config ${configPath}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      throw new Error(`Failed to generate blob: ${error.message}`);
    }
  }

  async createExecutable(platform, executableName) {
    const nodePath = process.execPath;
    
    if (platform === 'win32') {
      if (!executableName.endsWith('.exe')) {
        executableName += '.exe';
      }
      
      try {
        fs.copyFileSync(nodePath, executableName);
      } catch (error) {
        throw new Error(`Failed to copy Node.js executable from '${nodePath}' to '${executableName}': ${error.message}`);
      }
    } else {
      execSync(`cp "${nodePath}" "${executableName}"`);
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
    } catch (error) {
      throw new Error(`Failed to inject blob: ${error.message}`);
    }
  }

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

  getExecutableName(platform) {
    const baseName = this.options.output;
    if (platform === 'win32') {
      return baseName.endsWith('.exe') ? baseName : `${baseName}.exe`;
    }
    return baseName;
  }

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

  static getSupportedPlatforms() {
    return ['linux', 'darwin', 'win32'];
  }

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