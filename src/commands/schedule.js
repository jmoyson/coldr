import { loadCampaignConfig } from '../services/campaign.service.js';
import { loadAndFilterLeads } from '../services/leads.service.js';
import { calculateSchedule, getScheduleSummary } from '../services/scheduler.service.js';
import { scheduleEmailBatch } from '../services/email.service.js';
import { logSuccess, logInfo, logWarning, logStat, createSpinner, CampaignError } from '../utils/error.utils.js';
import { getCampaignPath, getCampaignFilePath, readTextFile } from '../utils/file.utils.js';
import { TEMPLATE_FILE } from '../constants/index.js';

/**
 * Schedule a campaign
 * @param {string} campaignName - Campaign name
 * @param {Object} options - Command options
 * @param {boolean} options.dryRun - If true, only show schedule without sending
 * @param {string} options.resendApiKey - Resend API key (overrides env var)
 * @returns {Promise<Object>} Schedule results
 */
export default async function schedule(campaignName, options = {}) {
  const { dryRun = false, resendApiKey } = options;
  
  // Set API key from option if provided (takes precedence over env var)
  if (resendApiKey) {
    process.env.RESEND_API_KEY = resendApiKey;
  }
  
  // Check API key early (unless dry run)
  if (!dryRun && !process.env.RESEND_API_KEY) {
    throw new CampaignError(
      'RESEND_API_KEY is required.\nSet it with: export RESEND_API_KEY="re_your_key"\nOr use: --resend-api-key "re_your_key"',
      'MISSING_API_KEY'
    );
  }
  
  // Load and validate campaign configuration
  const configSpinner = createSpinner('Loading campaign configuration').start();
  const config = loadCampaignConfig(campaignName);
  configSpinner.succeed('Configuration loaded');
  
  // Load campaign path and template
  const campaignPath = getCampaignPath(campaignName);
  const templatePath = getCampaignFilePath(campaignPath, TEMPLATE_FILE);
  const template = readTextFile(templatePath);
  
  // Load and filter leads
  const leadsSpinner = createSpinner('Loading leads').start();
  const { validLeads, suppressedLeads, totalLeads } = loadAndFilterLeads(campaignPath);
  leadsSpinner.succeed('Leads loaded');
  
  logStat('Total leads', totalLeads);
  logStat('Valid leads', validLeads.length);
  if (suppressedLeads.length > 0) {
    logStat('Suppressed', suppressedLeads.length);
  }
  
  if (validLeads.length === 0) {
    logWarning('No valid leads to schedule');
    return { scheduled: 0, failed: 0 };
  }
  
  // Calculate schedule
  const scheduleSpinner = createSpinner('Calculating schedule').start();
  const schedule = calculateSchedule(config, validLeads);
  const summary = getScheduleSummary(schedule);
  scheduleSpinner.succeed('Schedule calculated');
  
  console.log(''); // Empty line for spacing
  logInfo(`📧 Campaign: ${campaignName}`);
  logStat('Sender', config.sender);
  logStat('Subject', config.subject);
  logStat('Emails/day', config.perDay);
  logStat('Total emails', summary.totalEmails);
  logStat('Start date', new Date(summary.startDate).toLocaleString());
  logStat('End date', new Date(summary.endDate).toLocaleString());
  logStat('Duration', `${summary.totalDays} day${summary.totalDays > 1 ? 's' : ''}`);
  
  // Dry run mode - just show schedule
  if (dryRun) {
    console.log('');
    logInfo('🔍 DRY RUN - Preview (first 5 emails):');
    schedule.slice(0, 5).forEach(({ lead, scheduledAt }) => {
      const date = new Date(scheduledAt);
      logInfo(`  ${date.toLocaleString()} → ${lead.email} ${lead.firstName ? `(${lead.firstName})` : ''}`);
    });
    if (schedule.length > 5) {
      logInfo(`  ... and ${schedule.length - 5} more`);
    }
    console.log('');
    return { scheduled: 0, failed: 0, dryRun: true, schedule };
  }
  
  // Schedule emails via Resend API
  console.log('');
  const sendSpinner = createSpinner(`Scheduling ${schedule.length} email${schedule.length > 1 ? 's' : ''} via Resend`).start();
  const results = await scheduleEmailBatch(config, schedule, template);
  
  const scheduled = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  if (failed === 0) {
    sendSpinner.succeed(`Successfully scheduled ${scheduled} email${scheduled > 1 ? 's' : ''}`);
  } else {
    sendSpinner.warn(`Scheduled ${scheduled}, failed ${failed}`);
  }
  
  if (failed > 0) {
    console.log('');
    logWarning('Failed emails:');
    results.filter(r => !r.success).forEach(({ lead, error }) => {
      logInfo(`  ${lead.email}: ${error}`);
    });
  }
  
  console.log('');
  return { scheduled, failed, results };
}