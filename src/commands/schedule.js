import { loadCampaignConfig } from '../services/campaign.service.js';
import { loadAndFilterLeads } from '../services/leads.service.js';
import { calculateSchedule, getScheduleSummary } from '../services/scheduler.service.js';
import { scheduleEmailBatch } from '../services/email.service.js';
import { logSuccess, logInfo, logWarning } from '../utils/error.utils.js';
import { getCampaignPath, getCampaignFilePath, readTextFile } from '../utils/file.utils.js';
import { TEMPLATE_FILE } from '../constants/index.js';

/**
 * Schedule a campaign
 * @param {string} campaignName - Campaign name
 * @param {Object} options - Command options
 * @param {boolean} options.dryRun - If true, only show schedule without sending
 * @returns {Promise<Object>} Schedule results
 */
export default async function schedule(campaignName, options = {}) {
  const { dryRun = false } = options;
  
  // Load and validate campaign configuration
  logInfo('Loading campaign configuration...');
  const config = loadCampaignConfig(campaignName);
  logSuccess('Config validation passed');
  
  // Load campaign path and template
  const campaignPath = getCampaignPath(campaignName);
  const templatePath = getCampaignFilePath(campaignPath, TEMPLATE_FILE);
  const template = readTextFile(templatePath);
  
  // Load and filter leads
  logInfo('Loading leads...');
  const { validLeads, suppressedLeads, totalLeads } = loadAndFilterLeads(campaignPath);
  
  logInfo(`Total leads: ${totalLeads}`);
  logInfo(`Valid leads: ${validLeads.length}`);
  if (suppressedLeads.length > 0) {
    logWarning(`Suppressed leads: ${suppressedLeads.length}`);
  }
  
  if (validLeads.length === 0) {
    logWarning('No valid leads to schedule');
    return { scheduled: 0, failed: 0 };
  }
  
  // Calculate schedule
  logInfo('Calculating schedule...');
  const schedule = calculateSchedule(config, validLeads);
  const summary = getScheduleSummary(schedule);
  
  logSuccess('Schedule calculated');
  logInfo(`Campaign: ${campaignName}`);
  logInfo(`Sender: ${config.sender}`);
  logInfo(`Subject: ${config.subject}`);
  logInfo(`Emails per day: ${config.perDay}`);
  logInfo(`Total emails: ${summary.totalEmails}`);
  logInfo(`Start date: ${summary.startDate}`);
  logInfo(`End date: ${summary.endDate}`);
  logInfo(`Duration: ${summary.totalDays} days`);
  
  // Dry run mode - just show schedule
  if (dryRun) {
    logInfo('\n[DRY RUN] Schedule preview (first 5 emails):');
    schedule.slice(0, 5).forEach(({ lead, scheduledAt }) => {
      logInfo(`  ${scheduledAt} -> ${lead.email} (${lead.firstName || 'N/A'})`);
    });
    if (schedule.length > 5) {
      logInfo(`  ... and ${schedule.length - 5} more`);
    }
    return { scheduled: 0, failed: 0, dryRun: true, schedule };
  }
  
  // Schedule emails via Resend API
  logInfo('\nScheduling emails via Resend...');
  const results = await scheduleEmailBatch(config, schedule, template);
  
  const scheduled = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  logSuccess(`Successfully scheduled: ${scheduled} emails`);
  if (failed > 0) {
    logWarning(`Failed to schedule: ${failed} emails`);
  }
  
  return { scheduled, failed, results };
}