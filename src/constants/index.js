/**
 * Application constants
 */

export const APP_NAME = 'coldr';
export const APP_VERSION = '0.0.5';
export const APP_DESCRIPTION = 'Run Cold emails campaigns from your terminal.';
export const GITHUB_REPO_URL = 'github.com/jmoyson/coldr';
export const SHARE_HINT_TEXT =
  'If this saves you build time, a quick star helps other builders discover it';
export const SHARE_HINT = `${SHARE_HINT_TEXT}: ${GITHUB_REPO_URL}`;

/**
 * Required files for a campaign
 */
export const REQUIRED_CAMPAIGN_FILES = [
  'config.json',
  'leads.csv',
  'template.html',
  'suppressions.json',
];

/**
 * File names
 */
export const CONFIG_FILE = 'config.json';
export const LEADS_FILE = 'leads.csv';
export const TEMPLATE_FILE = 'template.html';
export const SUPPRESSIONS_FILE = 'suppressions.json';
