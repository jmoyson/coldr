import { ResendService } from './resend.service.js';
import { CampaignError } from '../utils/error.utils.js';
import chalk from 'chalk';

const resendServiceRef = {
  instance: undefined,
  apiKey: undefined,
};

const createResendService = (apiKey) => {
  if (resendServiceRef.instance) {
    if (resendServiceRef.apiKey === undefined) {
      return resendServiceRef.instance;
    }

    if (apiKey && apiKey !== resendServiceRef.apiKey) {
      resendServiceRef.instance = new ResendService(apiKey);
      resendServiceRef.apiKey = apiKey;
    }
    return resendServiceRef.instance;
  }

  if (!apiKey) {
    throw new CampaignError('Resend API key is required', 'MISSING_API_KEY');
  }

  resendServiceRef.instance = new ResendService(apiKey);
  resendServiceRef.apiKey = apiKey;
  return resendServiceRef.instance;
};

export const getResendService = (apiKey) => createResendService(apiKey);

export const resetResendService = () => {
  resendServiceRef.instance = undefined;
  resendServiceRef.apiKey = undefined;
};

export const setResendService = (service) => {
  resendServiceRef.instance = service;
  resendServiceRef.apiKey = undefined;
};

/**
 * Parse sender string into name and email
 * @param {string} sender - Sender in format "Name <email@domain.com>"
 * @returns {{ name: string, email: string }}
 */
function parseSender(sender) {
  const trimmed = sender.trim();
  const match = trimmed.match(/^(.+?)\s*<([^@]+@[^@]+\.[^@]+)>\s*$/);
  if (!match) {
    throw new CampaignError('Invalid sender format', 'INVALID_SENDER');
  }
  return {
    name: match[1].trim(),
    email: match[2].trim(),
  };
}

/**
 * Replace template variables with lead data
 * @param {string} template - HTML template with {{variable}} placeholders
 * @param {Object} lead - Lead data object
 * @returns {string} Processed HTML
 */
function processTemplate(template, lead, config) {
  let processed = template;

  const data = { ...config, ...lead };

  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, data[key] || '');
  });

  processed = processed.replace(/{{[^}]+}}/g, '');

  return processed;
}


/**
 * Send an email via Resend API
 * @param {Object} params - Email parameters
 * @param {string} params.sender - Sender in format "Name <email@domain.com>"
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content

 * @param {string} [params.scheduledAt] - ISO 8601 datetime string (optional)
 * @returns {Promise<Object>} Resend API response
 * @throws {CampaignError} If scheduling fails
 */
export async function sendEmail({
  sender,
  to,
  subject,
  html,
  replyTo,
  scheduledAt,
  resendApiKey,
}) {
  const { name, email } = parseSender(sender);

  return getResendService(resendApiKey).sendEmail({
    from: `${name} <${email}>`,
    to: [to],
    subject,
    html,
    scheduledAt,
    replyTo,
  });
}

/**
 * Schedule multiple emails in batch
 * @param {Object} config - Campaign configuration
 * @param {Array<Object>} scheduledLeads - Array of { lead, scheduledAt }
 * @param {string} template - HTML template
 * @returns {Promise<Array<Object>>} Array of results with { lead, scheduledAt, success, emailId?, error? }
 */
export async function scheduleEmailBatch(
  config,
  scheduledLeads,
  template,
  spinner,
  options = {}
) {
  const { delayMs = 1500, resendApiKey } = options;
  const results = [];

  for (const { lead, scheduledAt } of scheduledLeads) {
    try {
      const html = processTemplate(template, lead, config);
      const subject = processTemplate(lead.subject || config.subject, lead, config);

      const response = await sendEmail({
        sender: config.sender,
        replyTo: config.replyTo,
        to: lead.email,
        subject,
        html,
        scheduledAt: scheduledAt.toISOString(),
        resendApiKey,
      });

      results.push({
        lead,
        scheduledAt,
        success: true,
        emailId: response.id,
      });

      spinner.text = chalk.cyan(
        `📧 Scheduling... ${chalk.bold(`${results.length}/${scheduledLeads.length}`)} emails sent ${chalk.green('✓')}`
      );

      // Wait 1.5 seconds between requests to avoid rate limit (2 requests per 2 seconds)
      if (delayMs > 0) {
        // eslint-disable-next-line no-undef
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.push({
        lead,
        scheduledAt,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Export for testing
 */
export const _internal = {
  parseSender,
  processTemplate,
  resetResendService,
  setResendService,
};
