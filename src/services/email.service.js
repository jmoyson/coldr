import { Resend } from 'resend';
import { CampaignError } from '../utils/error.utils.js';

/**
 * Email service for Resend API integration
 * Handles email scheduling and sending
 */

/**
 * Initialize Resend client
 * @returns {Resend} Resend client instance
 * @throws {CampaignError} If API key is not set
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new CampaignError(
      'RESEND_API_KEY environment variable is required',
      'MISSING_API_KEY'
    );
  }
  
  return new Resend(apiKey);
}

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
    email: match[2].trim()
  };
}

/**
 * Replace template variables with lead data
 * @param {string} template - HTML template with {{variable}} placeholders
 * @param {Object} lead - Lead data object
 * @returns {string} Processed HTML
 */
function processTemplate(template, lead) {
  let processed = template;
  
  // First, replace all known variables
  Object.keys(lead).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, lead[key] || '');
  });
  
  // Then, remove any remaining unreplaced variables
  processed = processed.replace(/{{[^}]+}}/g, '');
  
  return processed;
}

/**
 * Schedule an email via Resend API
 * @param {Object} params - Email parameters
 * @param {string} params.sender - Sender in format "Name <email@domain.com>"
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content
 * @param {string} params.scheduledAt - ISO 8601 datetime string
 * @param {string} params.unsubscribeMailto - Unsubscribe mailto URL
 * @returns {Promise<Object>} Resend API response
 * @throws {CampaignError} If scheduling fails
 */
export async function scheduleEmail({ sender, to, subject, html, scheduledAt, unsubscribeMailto }) {
  try {
    const resend = getResendClient();
    const { name, email } = parseSender(sender);
    
    const response = await resend.emails.send({
      from: `${name} <${email}>`,
      to: [to],
      subject,
      html,
      scheduledAt,
      headers: {
        'List-Unsubscribe': unsubscribeMailto
      }
    });
    
    return response;
  } catch (error) {
    throw new CampaignError(
      `Failed to schedule email: ${error.message}`,
      'EMAIL_SCHEDULE_FAILED'
    );
  }
}

/**
 * Schedule multiple emails in batch
 * @param {Object} config - Campaign configuration
 * @param {Array<Object>} scheduledLeads - Array of { lead, scheduledAt }
 * @param {string} template - HTML template
 * @returns {Promise<Array<Object>>} Array of results with { lead, scheduledAt, success, emailId?, error? }
 */
export async function scheduleEmailBatch(config, scheduledLeads, template) {
  const results = [];
  
  for (const { lead, scheduledAt } of scheduledLeads) {
    try {
      const html = processTemplate(template, lead);
      const subject = processTemplate(config.subject, lead);
      
      const response = await scheduleEmail({
        sender: config.sender,
        to: lead.email,
        subject,
        html,
        scheduledAt,
        unsubscribeMailto: config.unsubscribeMailto
      });
      
      results.push({
        lead,
        scheduledAt,
        success: true,
        emailId: response.id
      });
    } catch (error) {
      results.push({
        lead,
        scheduledAt,
        success: false,
        error: error.message
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
  processTemplate
};
