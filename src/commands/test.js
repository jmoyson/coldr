import { createSpinner, logInfo } from '../utils/error.utils.js';
import { loadCampaignConfig } from '../services/campaign.service.js';
import { TEMPLATE_FILE } from '../constants/index.js';
import {
  getCampaignPath,
  getCampaignFilePath,
  readTextFile,
} from '../utils/file.utils.js';
import { sendEmail } from '../services/email.service.js';
import { _internal } from '../services/email.service.js';
import { loadAndFilterLeads } from '../services/leads.service.js';

/**
 * Send a test email
 * @param {string} campaignName - Campaign name
 * @returns {string} Campaign directory path
 */
export default async function test(campaignName, to, options = {}) {
  const { resendApiKey } = options;

  // Set API key from option if provided (takes precedence over env var)
  if (resendApiKey) {
    process.env.RESEND_API_KEY = resendApiKey;
  }
  const configSpinner = createSpinner('Loading campaign configuration').start();
  const config = loadCampaignConfig(campaignName);
  configSpinner.succeed('Configuration loaded');

  // Load campaign path and template
  const campaignPath = getCampaignPath(campaignName);
  const templatePath = getCampaignFilePath(campaignPath, TEMPLATE_FILE);
  const template = readTextFile(templatePath);

  // load first lead for test
  const leadsSpinner = createSpinner('Loading leads').start();
  const { validLeads } = loadAndFilterLeads(campaignPath);
  leadsSpinner.succeed('Leads loaded');

  logInfo(`Sending email to ${to} using value from lead ${validLeads[0].name}`);

  const sendSpinner = createSpinner('Sending test email').start();

  try {
    const html = _internal.processTemplate(template, validLeads[0]);
    const subject = _internal.processTemplate(config.subject, validLeads[0]);   
    
    const response = await sendEmail({
      sender: config.sender,
      replyTo: config.replyTo,
      to,
      subject,
      html,
      unsubscribeMailto: config.unsubscribeMailto,
    });
    sendSpinner.succeed('Test email sent');
    return response;
  } catch (error) {
    sendSpinner.fail(`Failed to send test email: ${error.message}`);
    throw error;
  }
}
