/**
 * TypeScript definitions for CLI module
 */

/**
 * CLI Build Options interface
 */
export interface CLIBuildOptions {
  /** Main JavaScript file path */
  main: string;
  /** Output executable name */
  output: string;
  /** Target platforms (comma-separated string) */
  platforms: string;
  /** Enable snapshot support */
  useSnapshot: boolean;
  /** Enable code cache */
  useCodeCache: boolean;
  /** Assets to include (JSON string) */
  assets: string;
  /** Disable experimental SEA warning */
  disableWarning: boolean;
}

/**
 * CLI Init Options interface
 */
export interface CLIInitOptions {
  /** Project name */
  name: string;
}

/**
 * CLI command handlers
 */
export declare namespace CLI {
  /**
   * Handle build command
   * @param options - Build options from command line
   */
  function handleBuild(options: CLIBuildOptions): Promise<void>;

  /**
   * Handle platforms command
   */
  function handlePlatforms(): void;

  /**
   * Handle cleanup command
   */
  function handleCleanup(): void;

  /**
   * Handle init command
   * @param options - Init options from command line
   */
  function handleInit(options: CLIInitOptions): void;
}

/**
 * Main CLI program instance
 */
export declare const program: any;