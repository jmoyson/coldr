import { createCampaign } from '../services/campaign.service.js';
import { logInfo, createSpinner } from '../utils/error.utils.js';
import chalk from 'chalk';

/**
 * Initialize a new campaign
 * @param {string} campaignName - Campaign name
 * @returns {string} Campaign directory path
 */
export default function init(campaignName) {
  const spinner = createSpinner('Creating campaign').start();
  const campaignPath = createCampaign(campaignName);
  spinner.succeed('Campaign created');

  console.log('');
  logInfo(`📁 ${chalk.cyan(campaignPath)}`);
  console.log('');
  logInfo('Next steps:');
  logInfo(`  ${chalk.cyan('1.')} cd ${campaignName}`);
  logInfo(
    `  ${chalk.cyan('2.')} Edit ${chalk.white('config.json')} with your settings`
  );
  logInfo(`  ${chalk.cyan('3.')} Add contacts to ${chalk.white('leads.csv')}`);
  logInfo(`  ${chalk.cyan('4.')} Customize ${chalk.white('template.html')}`);
  logInfo(
    `  ${chalk.cyan('5.')} Run ${chalk.white('coldr schedule . --dry-run')}`
  );
  console.log('');

  return campaignPath;
}
