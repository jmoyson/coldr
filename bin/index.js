#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import init from '../src/commands/init.js';

const NAME = 'coldr';
const VERSION = '0.0.1';
const DESCRIPTION = 'Run Cold emails campaigns from your terminal.';

// Configure program
program
  .name(NAME)
  .version(VERSION)
  .description(DESCRIPTION)

program
  .command('init')
  .description('Initialize a new campaign')
  .argument('<campaign>', 'Campaign name')
  .action((campaign) => {
    try {
      init(campaign);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

