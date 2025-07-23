/**
 * TypeScript definitions for node-package-builder
 */

export interface BuildOptions {
  /** Main JavaScript file to build (default: 'index.js') */
  main?: string;
  /** Output executable name (default: 'app') */
  output?: string;
  /** Disable experimental SEA warning (default: true) */
  disableExperimentalSEAWarning?: boolean;
  /** Enable snapshot support (default: false) */
  useSnapshot?: boolean;
  /** Enable code cache (default: false) */
  useCodeCache?: boolean;
  /** Assets to include in the executable */
  assets?: Record<string, string>;
  /** Target platforms to build for (default: ['linux', 'darwin', 'win32']) */
  platforms?: Platform[];
  /** Temporary directory for build files */
  tempDir?: string;
}

export type Platform = 'linux' | 'darwin' | 'win32';

export interface BuildResult {
  /** Target platform */
  platform: Platform;
  /** Whether the build was successful */
  success: boolean;
  /** Name of the generated executable (if successful) */
  executable?: string;
  /** Full path to the generated executable (if successful) */
  path?: string;
  /** Unique build identifier (if successful) */
  buildId?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Main class for building Node.js applications into single executable files
 */
export declare class NodePackageBuilder {
  /** Build configuration options */
  readonly options: Required<BuildOptions>;
  /** Unique identifier for this build session */
  readonly buildId: string;
  /** Temporary build directory path */
  readonly tempBuildDir: string;

  /**
   * Create a new NodePackageBuilder instance
   * @param options - Build configuration options
   */
  constructor(options?: BuildOptions);

  /**
   * Build executables for all configured platforms
   * @returns Promise that resolves to an array of build results
   */
  build(): Promise<BuildResult[]>;

  /**
   * Build executable for a specific platform
   * @param platform - Target platform
   * @returns Promise that resolves to build result
   */
  buildForPlatform(platform: Platform): Promise<BuildResult>;

  /**
   * Generate a unique build identifier
   * @returns Unique build ID string
   */
  generateBuildId(): string;

  /**
   * Ensure temporary directories exist
   */
  ensureTempDir(): void;

  /**
   * Check if current Node.js version meets requirements
   * @throws Error if Node.js version is too old
   */
  checkNodeVersion(): void;

  /**
   * Compare version strings
   * @param current - Current version
   * @param required - Required version
   * @returns True if current version is greater than or equal to required
   */
  isVersionGreaterOrEqual(current: string, required: string): boolean;

  /**
   * Create SEA configuration file for a platform
   * @param platform - Target platform
   * @returns Path to the created configuration file
   */
  createSeaConfig(platform: Platform): string;

  /**
   * Generate blob file from configuration
   * @param configPath - Path to SEA configuration file
   * @throws Error if blob generation fails
   */
  generateBlob(configPath: string): void;

  /**
   * Create executable file for target platform
   * @param platform - Target platform
   * @param executableName - Name of the executable
   */
  createExecutable(platform: Platform, executableName: string): Promise<void>;

  /**
   * Inject blob into executable
   * @param platform - Target platform
   * @param executableName - Name of the executable
   * @param blobPath - Path to the blob file
   */
  injectBlob(platform: Platform, executableName: string, blobPath: string): Promise<void>;

  /**
   * Verify Windows executable is working correctly
   * @param executableName - Name of the executable
   */
  verifyWindowsExecutable(executableName: string): Promise<void>;

  /**
   * Sign executable for distribution
   * @param platform - Target platform
   * @param executableName - Name of the executable
   */
  signExecutable(platform: Platform, executableName: string): Promise<void>;

  /**
   * Get executable name for platform
   * @param platform - Target platform
   * @returns Executable name with appropriate extension
   */
  getExecutableName(platform: Platform): string;

  /**
   * Download Node.js binary for target platform
   * @param platform - Target platform
   * @returns Path to downloaded Node.js binary
   */
  downloadNodeBinary(platform: Platform): Promise<string>;

  /**
   * Get recommended Node.js version
   * @returns Promise that resolves to version string
   */
  getRecommendedNodeVersion(): Promise<string>;

  /**
   * Get download URL for Node.js binary
   * @param version - Node.js version
   * @param platform - Target platform
   * @returns Download URL
   */
  getNodeDownloadUrl(version: string, platform: Platform): string;

  /**
   * Download file from URL
   * @param url - File URL
   * @param filePath - Destination file path
   */
  downloadFile(url: string, filePath: string): Promise<void>;

  /**
   * Extract Node.js binary from archive
   * @param archivePath - Path to archive file
   * @param extractDir - Extraction directory
   * @param platform - Target platform
   * @param version - Node.js version
   */
  extractNodeBinary(archivePath: string, extractDir: string, platform: Platform, version: string): Promise<void>;

  /**
   * Extract Node.js binary from ZIP archive (Windows)
   * @param zipPath - Path to ZIP file
   * @param extractDir - Extraction directory
   * @param version - Node.js version
   * @param platform - Target platform
   */
  extractZip(zipPath: string, extractDir: string, version: string, platform: Platform): Promise<void>;

  /**
   * Extract Node.js binary from tar.gz archive (Unix)
   * @param tarPath - Path to tar.gz file
   * @param extractDir - Extraction directory
   * @param version - Node.js version
   * @param platform - Target platform
   */
  extractTarGz(tarPath: string, extractDir: string, version: string, platform: Platform): Promise<void>;

  /**
   * Clean up temporary files
   * @param files - Array of file paths to clean up
   */
  cleanup(files: string[]): void;

  /**
   * Clean up temporary build directory
   */
  cleanupTempDir(): void;

  /**
   * Clean up all temporary build directories
   */
  static cleanupAllTempDirs(): void;

  /**
   * Get list of supported platforms
   * @returns Array of supported platform names
   */
  static getSupportedPlatforms(): Platform[];

  /**
   * Validate that main file exists and is accessible
   * @param mainFile - Path to main file
   * @throws Error if main file is invalid
   */
  static validateMainFile(mainFile: string): void;
}

export default NodePackageBuilder;

/**
 * Get list of supported platforms
 * @returns Array of supported platform names
 */
export declare function getSupportedPlatforms(): Platform[];

/**
 * Validate that main file exists and is accessible
 * @param mainFile - Path to main file
 * @throws Error if main file is invalid
 */
export declare function validateMainFile(mainFile: string): void;

/**
 * Clean up all temporary build directories
 */
export declare function cleanupAllTempDirs(): void;