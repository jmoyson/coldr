#!/usr/bin/env node

import { ensureSupportedNodeVersion } from '../src/utils/runtime.utils.js';
import { program } from 'commander';

ensureSupportedNodeVersion();

import { handleCommandError } from '../src/utils/error.utils.js';
import {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
} from '../src/constants/index.js';

import init from '../src/commands/init.js';
import schedule from '../src/commands/schedule.js';
import preview from '../src/commands/preview.js';
import hello from '../src/commands/hello.js';

// Configure program
program.name(APP_NAME).version(APP_VERSION).description(APP_DESCRIPTION);

// Init command
program
  .command('init')
  .description('Initialize a new campaign')
  .argument('[campaign]', 'Campaign name', 'coldr-campaign')
  .action((campaign) => {
    try {
      init(campaign);
    } catch (error) {
      handleCommandError(error);
    }
  });

// Hello command
program
  .command('hello')
  .description('Run a demo dry-run in-memory')
  .action(async () => {
    try {
      await hello();
    } catch (error) {
      handleCommandError(error);
    }
  });

// Schedule command
program
  .command('schedule')
  .description('Schedule a campaign')
  .argument('[campaign]', 'Campaign name', 'coldr-campaign')
  .option('--dry-run', 'Preview schedule without sending emails')
  .option(
    '--resend-api-key <key>',
    'Resend API key (required to send emails)'
  )
  .action(async (campaign, options) => {
    try {
      await schedule(campaign, options);
    } catch (error) {
      handleCommandError(error);
    }
  });

// Preview command
program
  .command('preview')
  .alias('test')
  .description('Preview an email locally or send it to your inbox')
  .argument('[campaign]', 'Campaign name', 'coldr-campaign')
  .argument('[recipient]', 'Recipient email (legacy positional)')
  .option('--lead <email>', 'Lead email to preview')
  .option('--to <email>', 'Recipient email (overrides positional argument)')
  .option(
    '--resend-api-key <key>',
    'Resend API key (required to send emails)'
  )
  .action(async (campaign, recipient, options) => {
    try {
      const finalOptions = { ...options };
      if (recipient && !finalOptions.to) {
        finalOptions.to = recipient;
      }
      await preview(campaign, finalOptions);
    } catch (error) {
      handleCommandError(error);
    }
  });

// Parse arguments
program.parse(process.argv);
