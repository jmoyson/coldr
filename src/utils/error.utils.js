import chalk from 'chalk';
import ora from 'ora';

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
  console.error(chalk.red('✗'), chalk.red(message));
  if (error && error.stack) {
    console.error(chalk.dim(error.stack));
  }
}

/**
 * Log a success message to console
 * @param {string} message - Success message
 */
export function logSuccess(message) {
  console.log(chalk.green('✓'), chalk.white(message));
}

/**
 * Log an info message to console
 * @param {string} message - Info message
 */
export function logInfo(message) {
  console.log(chalk.dim(message));
}

/**
 * Log a warning message to console
 * @param {string} message - Warning message
 */
export function logWarning(message) {
  console.log(chalk.yellow('⚠'), chalk.yellow(message));
}

/**
 * Create a spinner for loading states
 * @param {string} text - Spinner text
 * @returns {Object} Ora spinner instance
 */
export function createSpinner(text) {
  return ora({
    text: chalk.dim(text),
    color: 'cyan',
    spinner: 'dots'
  });
}

/**
 * Log a stat/metric
 * @param {string} label - Stat label
 * @param {string|number} value - Stat value
 */
export function logStat(label, value) {
  console.log(chalk.dim(`  ${label}:`), chalk.cyan(value));
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
