/**
 * Runtime guards for the CLI process.
 */

const MINIMUM_NODE_MAJOR_VERSION = 18;

/**
 * Check whether the provided Node.js version meets the minimum requirement.
 * @param {string} versionString - Raw version string, e.g. "18.19.0".
 * @returns {boolean} True when the version is supported.
 */
export function isNodeVersionSupported(versionString) {
  if (typeof versionString !== 'string') {
    return false;
  }

  const [majorPart] = versionString.split('.');
  const major = Number.parseInt(majorPart, 10);

  return Number.isInteger(major) && major >= MINIMUM_NODE_MAJOR_VERSION;
}

/**
 * Format a helpful message guiding the user to upgrade Node.js.
 * @param {string} detectedVersion - Detected version presented to the user (typically process.version).
 * @returns {string} Message to display before exiting.
 */
export function formatUnsupportedNodeMessage(detectedVersion) {
  return [
    'coldr requires Node.js 18 or newer.',
    `Detected ${detectedVersion || 'an unknown version'}.`,
    'Upgrade Node.js or use a version manager like nvm (e.g. `nvm install 18 && nvm use 18`).',
  ].join(' ');
}

/**
 * Ensure the current Node.js version is supported, exiting otherwise.
 * Accepts injectable functions for logging and exiting to simplify testing.
 * @param {Object} [options]
 * @param {string} [options.currentVersion] - Raw semantic version (defaults to process.versions.node).
 * @param {string} [options.displayVersion] - Human-friendly version (defaults to process.version).
 * @param {(message: string) => void} [options.log] - Logging function (defaults to console.error).
 * @param {(code?: number) => never} [options.exit] - Exit function (defaults to process.exit).
 * @returns {boolean} True when the runtime is supported.
 */
export function ensureSupportedNodeVersion({
  currentVersion = process.versions.node,
  displayVersion = process.version,
  log = console.error,
  exit = process.exit,
} = {}) {
  if (isNodeVersionSupported(currentVersion)) {
    return true;
  }

  log(formatUnsupportedNodeMessage(displayVersion));
  exit(1);

  return false;
}

export const __testing__ = {
  MINIMUM_NODE_MAJOR_VERSION,
};
