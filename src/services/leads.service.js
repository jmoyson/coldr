import fs from 'fs';
import Papa from 'papaparse';
import { CampaignError } from '../utils/error.utils.js';
import { getCampaignFilePath, readJsonFile } from '../utils/file.utils.js';
import { LEADS_FILE, SUPPRESSIONS_FILE } from '../constants/index.js';

/**
 * Leads service to parse CSV and handle suppressions
 * Follows Single Responsibility Principle
 */

/**
 * Parse CSV content into array of objects using papaparse
 * @param {string} csvContent - CSV file content
 * @returns {Array<Object>} Array of lead objects
 * @throws {CampaignError} If CSV is invalid
 */
function parseCSV(csvContent) {
  // Parse CSV content using papaparse
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    trimHeaders: true,
    dynamicTyping: false,
  });

  if (result.errors && result.errors.length > 0) {
    throw new CampaignError(
      `Failed to parse CSV: ${result.errors[0].message}`,
      'INVALID_CSV'
    );
  }

  if (!result.meta.fields || !result.meta.fields.includes('email')) {
    throw new CampaignError('CSV must have an "email" column', 'INVALID_CSV');
  }

  // Optionally: validate that all rows have same number of fields
  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i];
    const keys = Object.keys(row);
    if (keys.length !== result.meta.fields.length) {
      throw new CampaignError(
        `Line ${i + 2} has ${keys.length} columns, expected ${result.meta.fields.length}`,
        'INVALID_CSV'
      );
    }
  }

  return result.data;
}

/**
 * Check if an email should be suppressed
 * @param {string} email - Email to check
 * @param {Object} suppressions - Suppressions object with emails and domains arrays
 * @returns {boolean}
 */
function isSuppressed(email, suppressions) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email is in suppression list
  if (suppressions.emails.some((e) => e.toLowerCase() === normalizedEmail)) {
    return true;
  }

  // Check if domain is in suppression list
  const domain = normalizedEmail.split('@')[1];
  if (
    domain &&
    suppressions.domains.some((d) => d.toLowerCase() === domain.toLowerCase())
  ) {
    return true;
  }

  return false;
}

/**
 * Load leads from campaign CSV file
 * @param {string} campaignPath - Campaign directory path
 * @returns {Array<Object>} Array of lead objects
 * @throws {CampaignError} If file cannot be read or parsed
 */
export function loadLeads(campaignPath) {
  const leadsPath = getCampaignFilePath(campaignPath, LEADS_FILE);

  try {
    const csvContent = fs.readFileSync(leadsPath, 'utf-8');
    return parseCSV(csvContent);
  } catch (error) {
    if (error instanceof CampaignError) {
      throw error;
    }
    throw new CampaignError(
      `Failed to load leads: ${error.message}`,
      'LEADS_LOAD_FAILED'
    );
  }
}

/**
 * Load suppressions from campaign JSON file
 * @param {string} campaignPath - Campaign directory path
 * @returns {Object} Suppressions object with emails and domains arrays
 * @throws {CampaignError} If file cannot be read or parsed
 */
export function loadSuppressions(campaignPath) {
  const suppressionsPath = getCampaignFilePath(campaignPath, SUPPRESSIONS_FILE);

  try {
    const suppressions = readJsonFile(suppressionsPath);

    // Validate structure
    if (
      !Array.isArray(suppressions.emails) ||
      !Array.isArray(suppressions.domains)
    ) {
      throw new CampaignError(
        'Suppressions file must have "emails" and "domains" arrays',
        'INVALID_SUPPRESSIONS'
      );
    }

    return suppressions;
  } catch (error) {
    if (error instanceof CampaignError) {
      throw error;
    }
    throw new CampaignError(
      `Failed to load suppressions: ${error.message}`,
      'SUPPRESSIONS_LOAD_FAILED'
    );
  }
}

/**
 * Filter leads by removing suppressed emails
 * @param {Array<Object>} leads - Array of lead objects
 * @param {Object} suppressions - Suppressions object
 * @returns {Object} { validLeads, suppressedLeads }
 */
export function filterLeads(leads, suppressions) {
  const validLeads = [];
  const suppressedLeads = [];

  for (const lead of leads) {
    if (!lead.email) {
      suppressedLeads.push({ ...lead, reason: 'Missing email' });
      continue;
    }

    if (isSuppressed(lead.email, suppressions)) {
      suppressedLeads.push({ ...lead, reason: 'Suppressed' });
      continue;
    }

    validLeads.push(lead);
  }

  return { validLeads, suppressedLeads };
}

/**
 * Load and filter leads for a campaign
 * @param {string} campaignPath - Campaign directory path
 * @returns {Object} { validLeads, suppressedLeads, totalLeads }
 */
export function loadAndFilterLeads(campaignPath) {
  const leads = loadLeads(campaignPath);
  const suppressions = loadSuppressions(campaignPath);
  const { validLeads, suppressedLeads } = filterLeads(leads, suppressions);

  return {
    validLeads,
    suppressedLeads,
    totalLeads: leads.length,
  };
}

/**
 * Export for testing
 */
export const _internal = {
  parseCSV,
  isSuppressed,
};
