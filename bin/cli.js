#!/usr/bin/env node

/**
 * Command Line Interface for Node Package Builder
 * Provides commands to build, manage, and initialize Node.js executable projects
 * @fileoverview CLI tool for building Node.js applications into single executable files
 */

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const NodePackageBuilder = require('../index');

const program = new Command();

program
  .name('node-package-builder')
  .description('Build Node.js applications into single executable files')
  .version('1.0.0');

/**
 * Build command - Creates executable files from Node.js application
 * Supports multiple platforms and various optimization options
 */
program
  .command('build')
  .description('Build executable from Node.js application')
  .option('-m, --main <file>', 'Main JavaScript file', 'index.js')
  .option('-o, --output <name>', 'Output executable name', 'app')
  .option('-p, --platforms <platforms>', 'Target platforms (comma-separated)', 'linux,darwin,win32')
  .option('--use-snapshot', 'Enable snapshot support', false)
  .option('--use-code-cache', 'Enable code cache', false)
  .option('--assets <assets>', 'Assets to include (JSON string)', '{}')
  .option('--disable-warning', 'Disable experimental SEA warning', true)
  .action(async (options) => {
    const spinner = ora('Initializing build process...').start();
    
    try {
      const mainFile = path.resolve(options.main);
      
      if (!fs.existsSync(mainFile)) {
        spinner.fail(chalk.red(`Main file not found: ${mainFile}`));
        process.exit(1);
      }
      
      const platforms = options.platforms.split(',').map(p => p.trim());
      const supportedPlatforms = NodePackageBuilder.getSupportedPlatforms();
      
      for (const platform of platforms) {
        if (!supportedPlatforms.includes(platform)) {
          spinner.fail(chalk.red(`Unsupported platform: ${platform}`));
          console.log(chalk.yellow(`Supported platforms: ${supportedPlatforms.join(', ')}`));
          process.exit(1);
        }
      }
      
      let assets = {};
      try {
        assets = JSON.parse(options.assets);
      } catch (error) {
        spinner.fail(chalk.red('Invalid assets JSON format'));
        process.exit(1);
      }
      
      const builder = new NodePackageBuilder({
        main: mainFile,
        output: options.output,
        platforms: platforms,
        useSnapshot: options.useSnapshot,
        useCodeCache: options.useCodeCache,
        assets: assets,
        disableExperimentalSEAWarning: options.disableWarning
      });
      
      spinner.text = 'Building executables...';
      
      const results = await builder.build();
      
      spinner.stop();
      
      console.log(chalk.green('\n✅ Build completed!\n'));
      
      results.forEach(result => {
        if (result.success) {
          console.log(chalk.green(`✅ ${result.platform}: ${result.executable}`));
          console.log(chalk.gray(`   Path: ${result.path}`));
        } else {
          console.log(chalk.red(`❌ ${result.platform}: ${result.error}`));
        }
      });
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      console.log(chalk.blue(`\n📊 Summary: ${successCount}/${totalCount} builds successful`));
      
      if (successCount === 0) {
        process.exit(1);
      }
      
    } catch (error) {
      spinner.fail(chalk.red(`Build failed: ${error.message}`));
      console.error(chalk.red(error.stack));
      process.exit(1);
    }
  });

/**
 * Platforms command - Lists all supported target platforms
 */
program
  .command('platforms')
  .description('List supported platforms')
  .action(() => {
    const platforms = NodePackageBuilder.getSupportedPlatforms();
    console.log(chalk.blue('Supported platforms:'));
    platforms.forEach(platform => {
      const current = platform === process.platform ? chalk.green(' (current)') : '';
      console.log(chalk.white(`  • ${platform}${current}`));
    });
  });

/**
 * Cleanup command - Removes all temporary build directories
 */
program
  .command('cleanup')
  .description('Clean up all temporary build directories')
  .action(() => {
    const spinner = ora('Cleaning up temporary directories...').start();
    
    try {
      NodePackageBuilder.cleanupAllTempDirs();
      spinner.succeed(chalk.green('Temporary directories cleaned up successfully'));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to clean up: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Init command - Creates a sample project with basic configuration
 */
program
  .command('init')
  .description('Initialize a sample project')
  .option('-n, --name <name>', 'Project name', 'my-app')
  .action((options) => {
    const projectName = options.name;
    const spinner = ora(`Creating sample project: ${projectName}`).start();
    
    try {
      if (!fs.existsSync(projectName)) {
        fs.mkdirSync(projectName);
      }
      
      const sampleCode = `console.log('Hello from ${projectName}!');
console.log('Arguments:', process.argv.slice(2));`;
      
      fs.writeFileSync(path.join(projectName, 'index.js'), sampleCode);
      
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        description: 'Sample Node.js application',
        main: 'index.js',
        scripts: {
          build: 'node-package-builder build',
          'build-all': 'node-package-builder build --platforms linux,darwin,win32',
          cleanup: 'node-package-builder cleanup'
        }
      };
      
      fs.writeFileSync(
        path.join(projectName, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      spinner.succeed(chalk.green(`Sample project created: ${projectName}`));
      
      console.log(chalk.blue('\nNext steps:'));
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white('  npm run build'));
      console.log(chalk.white(`  ./${projectName}`));
      console.log(chalk.white('  npm run cleanup  # to clean temp files'));
      
    } catch (error) {
      spinner.fail(chalk.red(`Failed to create project: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();