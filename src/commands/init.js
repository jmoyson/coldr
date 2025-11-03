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

  console.log(`👇 Next Steps:`)
  console.log('');
  console.log(chalk.blue(`1️⃣. Edit campaign files as needed:`));
  console.log(`  ${chalk.dim('•')} ${chalk.cyan('config.json')} - Campaign settings`);
  console.log(`  ${chalk.dim('•')} ${chalk.cyan('leads.csv')} - Your recipients`);
  console.log(`  ${chalk.dim('•')} ${chalk.cyan('template.html')} - Email template`);
  console.log(`  ${chalk.dim('•')} ${chalk.cyan('suppressions.json')} - Blocked emails/domains`);
  console.log('');

  console.log(chalk.blue(`2️⃣. Run: `));
  console.log(`  ${chalk.white('coldr schedule --dry-run')}`);
  console.log(`  ${chalk.white('coldr schedule --resend-api-key re_*****')}`);
  console.log('');

  console.log(chalk.blue(`3️⃣. Support: `));
  console.log(`  ⭐️ ${chalk.white('Star the repo -> https://github.com/jmoyson/coldr')}`);
  console.log(`  👋 ${chalk.white('Connect with me -> https://x.com/jeremymoyson')}`);
  console.log('');

  return campaignPath;
}
