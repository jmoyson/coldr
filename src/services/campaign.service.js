import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  directoryExists,
  createDirectory,
  copyDirectory,
  validateRequiredFiles,
  getCampaignPath,
  getCampaignFilePath,
  readJsonFile,
} from '../utils/file.utils.js';
import { validateSchema } from '../utils/validation.utils.js';
import { configSchema } from '../schemas/config.schema.js';
import { CampaignError } from '../utils/error.utils.js';
import { REQUIRED_CAMPAIGN_FILES, CONFIG_FILE } from '../constants/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCAFFOLD_DIR = join(__dirname, '../../scaffold');

/**
 * Campaign service following Single Responsibility Principle
 * Handles all campaign-related business logic
 */

/**
 * Check if a campaign exists
 * @param {string} campaignName - Campaign name
 * @returns {boolean}
 */
export function campaignExists(campaignName) {
  const campaignPath = getCampaignPath(campaignName);
  return directoryExists(campaignPath);
}

/**
 * Create a new campaign from scaffold
 * @param {string} campaignName - Campaign name
 * @returns {string} Campaign directory path
 * @throws {CampaignError} If campaign already exists or creation fails
 */
export function createCampaign(campaignName) {
  if (!campaignName) {
    throw new CampaignError('Campaign name is required', 'MISSING_NAME');
  }

  const campaignPath = getCampaignPath(campaignName);

  if (campaignExists(campaignName)) {
    throw new CampaignError(
      `Campaign "${campaignName}" already exists`,
      'CAMPAIGN_EXISTS'
    );
  }

  // Create campaign directory
  createDirectory(campaignPath);

  // Copy scaffold files
  copyDirectory(SCAFFOLD_DIR, campaignPath);

  // Validate structure
  const validation = validateRequiredFiles(
    campaignPath,
    REQUIRED_CAMPAIGN_FILES
  );
  if (!validation.valid) {
    throw new CampaignError(
      `Missing required files: ${validation.missingFiles.join(', ')}`,
      'MISSING_FILES'
    );
  }

  return campaignPath;
}

/**
 * Load and validate campaign configuration
 * @param {string} campaignName - Campaign name
 * @returns {Object} Validated configuration object
 * @throws {CampaignError} If campaign doesn't exist or config is invalid
 */
export function loadCampaignConfig(campaignName) {
  if (!campaignExists(campaignName)) {
    throw new CampaignError(
      `Campaign "${campaignName}" does not exist`,
      'CAMPAIGN_NOT_FOUND'
    );
  }

  const campaignPath = getCampaignPath(campaignName);
  const configPath = getCampaignFilePath(campaignPath, CONFIG_FILE);

  try {
    const configData = readJsonFile(configPath);
    return validateSchema(configSchema, configData);
  } catch (error) {
    throw new CampaignError(
      `Failed to load or validate config: ${error.message}`,
      'INVALID_CONFIG'
    );
  }
}

/**
 * Validate campaign structure
 * @param {string} campaignName - Campaign name
 * @returns {Object} { valid: boolean, missingFiles: string[] }
 */
export function validateCampaignStructure(campaignName) {
  const campaignPath = getCampaignPath(campaignName);
  return validateRequiredFiles(campaignPath, REQUIRED_CAMPAIGN_FILES);
}

