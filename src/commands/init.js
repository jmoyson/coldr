import { createCampaign } from '../services/campaign.service.js';
import { logInfo, logSuccess, createSpinner } from '../utils/error.utils.js';
import chalk from 'chalk';

/**
 * Initialize a new campaign
 * @param {string} campaignName - Campaign name
 * @returns {string} Campaign directory path
 */
export default function init(campaignName = 'coldr-campaign') {
  const spinner = createSpinner('Creating campaign').start();
  const campaignPath = createCampaign(campaignName);
  spinner.succeed('Campaign created');

  console.log('');
  logSuccess('Campaign ready.');
  logInfo(`Folder: ${chalk.cyan(campaignPath)}`);
  console.log('');
  logInfo('Run:');
  console.log(`  ${chalk.white('export RESEND_API_KEY=re_*****')}`);
  console.log(`  ${chalk.white('coldr schedule --dry-run')}`);
  console.log('');

  return campaignPath;
}
