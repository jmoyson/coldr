#!/usr/bin/env node

import { program } from 'commander';


import { handleCommandError } from '../src/utils/error.utils.js';
import { APP_NAME, APP_VERSION, APP_DESCRIPTION } from '../src/constants/index.js';

import init from '../src/commands/init.js';
import schedule from '../src/commands/schedule.js';

// Configure program
program
  .name(APP_NAME)
  .version(APP_VERSION)
  .description(APP_DESCRIPTION);

// Init command
program
  .command('init')
  .description('Initialize a new campaign')
  .argument('<campaign>', 'Campaign name')
  .action((campaign) => {
    try {
      init(campaign);
    } catch (error) {
      handleCommandError(error);
    }
  });

// Schedule command
program
  .command('schedule')
  .description('Schedule a campaign')
  .argument('<campaign>', 'Campaign name')
  .option('--dry-run', 'Preview schedule without sending emails')
  .action(async (campaign, options) => {
    try {
      await schedule(campaign, options);
    } catch (error) {
      handleCommandError(error);
    }
  });

// Parse arguments
program.parse(process.argv);

