import chalk from 'chalk';

/**
 * Error handling utilities following DRY principle
 */

/**
 * Custom error class for campaign-related errors
 */
export class CampaignError extends Error {
  constructor(message, code = 'CAMPAIGN_ERROR') {
    super(message);
    this.name = 'CampaignError';
    this.code = code;
  }
}

/**
 * Log an error message to console
 * @param {string} message - Error message
 * @param {Error} [error] - Optional error object
 */
export function logError(message, error = null) {
  console.error(chalk.red('Error:'), message);
  if (error && error.stack) {
    console.error(chalk.gray(error.stack));
  }
}

/**
 * Log a success message to console
 * @param {string} message - Success message
 */
export function logSuccess(message) {
  console.log(chalk.green('✓'), message);
}

/**
 * Log an info message to console
 * @param {string} message - Info message
 */
export function logInfo(message) {
  console.log(chalk.gray(message));
}

/**
 * Log a warning message to console
 * @param {string} message - Warning message
 */
export function logWarning(message) {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Handle command errors consistently
 * @param {Error} error - Error object
 * @param {boolean} exit - Whether to exit process
 */
export function handleCommandError(error, exit = true) {
  if (error instanceof CampaignError) {
    logError(error.message);
  } else {
    logError('An unexpected error occurred', error);
  }
  
  if (exit) {
    process.exit(1);
  }
}
