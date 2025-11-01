import chalk from 'chalk';
import {
  CampaignError,
  createSpinner,
  logInfo,
  logSuccess,
} from '../utils/error.utils.js';
import { loadCampaignConfig } from '../services/campaign.service.js';
import { TEMPLATE_FILE } from '../constants/index.js';
import {
  getCampaignFilePath,
  getCampaignPath,
  readTextFile,
} from '../utils/file.utils.js';
import { loadAndFilterLeads } from '../services/leads.service.js';
import {
  sendEmail,
  _internal as emailInternal,
} from '../services/email.service.js';

/**
 * Preview a single email, optionally sending it to a given recipient.
 * @param {string} campaignName - Campaign name
 * @param {Object} options - Command options
 * @param {string} [options.lead] - Specific lead email to preview
 * @param {string} [options.to] - Recipient email (sends real email when provided)
 * @param {string} [options.resendApiKey] - Resend API key (required to send)
 * @returns {Promise<Object>} Preview result
 */
export default async function preview(campaignName, options = {}) {
  const { lead: leadEmail, to, resendApiKey } = options;

  const configSpinner = createSpinner('Loading campaign configuration').start();
  const config = loadCampaignConfig(campaignName);
  configSpinner.succeed('Configuration loaded');

  const campaignPath = getCampaignPath(campaignName);
  const templatePath = getCampaignFilePath(campaignPath, TEMPLATE_FILE);
  const template = readTextFile(templatePath);

  const leadsSpinner = createSpinner('Loading leads').start();
  const { validLeads } = loadAndFilterLeads(campaignPath);
  leadsSpinner.succeed('Leads loaded');

  if (validLeads.length === 0) {
    throw new CampaignError('No valid leads available for preview', 'NO_LEADS');
  }

  const selectedLead =
    leadEmail === undefined
      ? validLeads[0]
      : validLeads.find(
          (lead) => lead.email.toLowerCase() === leadEmail.toLowerCase()
        );

  if (!selectedLead) {
    throw new CampaignError(
      `Lead "${leadEmail}" not found in leads.csv`,
      'LEAD_NOT_FOUND'
    );
  }

  const subject = emailInternal.processTemplate(
    selectedLead.subject || config.subject,
    selectedLead,
    config
  );
  const html = emailInternal.processTemplate(template, selectedLead, config);

  if (!to) {
    logInfo(`Previewing lead ${selectedLead.email}`);
    console.log('');
    console.log(chalk.bold('Subject:'), subject);
    console.log('');
    console.log(html);
    console.log('');
    logSuccess('Preview generated locally');

    return {
      sent: false,
      lead: selectedLead.email,
      subject,
      html,
    };
  }

  if (!resendApiKey) {
    throw new CampaignError(
      'Resend API key is required to send preview emails. Pass --resend-api-key <key>.',
      'MISSING_API_KEY'
    );
  }

  const sendSpinner = createSpinner(`Sending preview to ${to}`).start();
  try {
    const response = await sendEmail({
      sender: config.sender,
      replyTo: config.replyTo,
      to,
      subject,
      html,
      resendApiKey,
    });
    sendSpinner.succeed('Preview email sent');
    logSuccess(`Email sent to ${to}`);
    return {
      sent: true,
      response,
      lead: selectedLead.email,
      subject,
    };
  } catch (error) {
    sendSpinner.fail(`Failed to send preview email: ${error.message}`);
    throw error;
  }
}
