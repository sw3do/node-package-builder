#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function showHelp() {
  console.log(`
Simple CLI Example
==================

Usage: ${path.basename(process.argv[0])} [command] [options]

Commands:
  hello [name]     Say hello to someone
  info             Show system information
  file <path>      Read and display file content
  help             Show this help message

Examples:
  ${path.basename(process.argv[0])} hello World
  ${path.basename(process.argv[0])} info
  ${path.basename(process.argv[0])} file package.json
`);
}

function sayHello(name = 'World') {
  console.log(`Hello, ${name}! 👋`);
  console.log(`This is a Node.js Single Executable Application!`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
}

function showInfo() {
  console.log('\nSystem Information:');
  console.log('==================');
  console.log(`Node.js Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Executable Path: ${process.execPath}`);
  console.log(`Working Directory: ${process.cwd()}`);
  console.log(`Memory Usage:`);
  const memUsage = process.memoryUsage();
  Object.entries(memUsage).forEach(([key, value]) => {
    console.log(`  ${key}: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`);
  });
}

function readFile(filePath) {
  try {
    if (!filePath) {
      console.error('Error: Please provide a file path');
      return;
    }
    
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: File not found: ${fullPath}`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    console.log(`\nContent of ${filePath}:`);
    console.log('='.repeat(50));
    console.log(content);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'hello':
      sayHello(args[1]);
      break;
      
    case 'info':
      showInfo();
      break;
      
    case 'file':
      readFile(args[1]);
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      if (!command) {
        sayHello();
      } else {
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
      }
  }
}

if (require.main === module) {
  main();
}

module.exports = { sayHello, showInfo, readFile };