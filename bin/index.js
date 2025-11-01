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
import test from '../src/commands/test.js';
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
    'Resend API key (overrides RESEND_API_KEY env var)'
  )
  .action(async (campaign, options) => {
    try {
      await schedule(campaign, options);
    } catch (error) {
      handleCommandError(error);
    }
  });

// Test command
program
  .command('test')
  .description('Send a test email')
  .argument('[campaign]', 'Campaign name', 'coldr-campaign')
  .argument('<to>', 'Recipient email')
  .option(
    '--resend-api-key <key>',
    'Resend API key (overrides RESEND_API_KEY env var)'
  )
  .action(async (campaign, to, options) => {
    try {
      await test(campaign, to, options);
    } catch (error) {
      handleCommandError(error);
    }
  });

// Parse arguments
program.parse(process.argv);
