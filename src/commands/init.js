import { createCampaign } from '../services/campaign.service.js';
import { logSuccess, logInfo } from '../utils/error.utils.js';

/**
 * Initialize a new campaign
 * @param {string} campaignName - Campaign name
 * @returns {string} Campaign directory path
 */
export default function init(campaignName) {
  const campaignPath = createCampaign(campaignName);
  
  logSuccess(`Campaign initialized: ${campaignPath}`);
  logInfo('Next steps:');
  logInfo(`  1. cd ${campaignPath}`);
  logInfo('  2. Edit config.json with your settings');
  logInfo('  3. Add contacts to leads.csv');
  logInfo('  4. Customize template.html');
  logInfo('  5. Run: coldr schedule <campaign-name>\n');
  
  return campaignPath;
}