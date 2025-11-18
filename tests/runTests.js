#!/usr/bin/env node

/**
 * Test Runner Script
 * Provides a user-friendly interface for running tests
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🧪 Berry & Blocks POS - Test Runner\n'));

const args = process.argv.slice(2);
const testType = args[0] || 'all';

const tests = {
  health: {
    name: 'Health Checks',
    command: 'jest tests/health --verbose',
    description: 'Quick system validation (10 seconds)'
  },
  unit: {
    name: 'Unit Tests',
    command: 'jest tests/unit --coverage',
    description: 'Individual component testing (30 seconds)'
  },
  integration: {
    name: 'Integration Tests',
    command: 'jest tests/integration --coverage',
    description: 'Complete workflow testing (2-3 minutes)'
  },
  all: {
    name: 'All Tests',
    command: 'jest --coverage --verbose',
    description: 'Complete test suite (5 minutes)'
  }
};

function runTest(type) {
  const test = tests[type];
  
  if (!test) {
    console.log(chalk.red(`❌ Unknown test type: ${type}`));
    console.log(chalk.yellow('\nAvailable test types:'));
    Object.keys(tests).forEach(key => {
      console.log(chalk.cyan(`  - ${key}: ${tests[key].description}`));
    });
    process.exit(1);
  }
  
  console.log(chalk.green(`\n▶️  Running ${test.name}...`));
  console.log(chalk.gray(`   ${test.description}\n`));
  
  try {
    execSync(test.command, { stdio: 'inherit' });
    console.log(chalk.green.bold(`\n✅ ${test.name} completed successfully!\n`));
  } catch (error) {
    console.log(chalk.red.bold(`\n❌ ${test.name} failed!\n`));
    process.exit(1);
  }
}

// Run the test
runTest(testType);
