import chalk from 'chalk';
import { loadCampaignConfig } from '../services/campaign.service.js';
import { loadAndFilterLeads, writeLeads } from '../services/leads.service.js';
import {
  calculateSchedule,
  getScheduleSummary,
} from '../services/scheduler.service.js';
import { scheduleEmailBatch, _internal } from '../services/email.service.js';
import {
  logInfo,
  logWarning,
  logStat,
  logSuccess,
  createSpinner,
} from '../utils/error.utils.js';
import {
  getCampaignPath,
  getCampaignFilePath,
  readTextFile,
} from '../utils/file.utils.js';
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
  let isDryRun = Boolean(dryRun);

  // Check API key early (unless dry run)
  if (!isDryRun && !resendApiKey) {
    logWarning(
      'Resend API key missing — falling back to dry-run. Pass --resend-api-key <key> to send for real.'
    );
    isDryRun = true;
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
  const { validLeads, suppressedLeads, totalLeads } =
    loadAndFilterLeads(campaignPath);
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
  logStat('Reply to', config.replyTo);
  logStat('Subject', config.subject);
  logStat('Emails/day', config.perDay);
  logStat('Total emails', summary.totalEmails);
  logStat('Start date', new Date(summary.startDate).toLocaleString());
  logStat('End date', new Date(summary.endDate).toLocaleString());
  logStat(
    'Duration',
    `${summary.totalDays} day${summary.totalDays > 1 ? 's' : ''}`
  );

  // Dry run mode - just show schedule
  if (isDryRun) {
    console.log('');
    logInfo('🔍 DRY RUN - Preview (first 5 emails):');

    if (schedule.length === 0) {
      logWarning('No emails to preview');
    } else {
      const previewRows = schedule.slice(0, 5).map(({ lead, scheduledAt }) => {
        const scheduledAtDisplay = new Date(scheduledAt).toLocaleString();
        const subject = _internal.processTemplate(
          lead.subject || config.subject,
          lead,
          config
        );
        const variant = (lead.variant || 'default').toUpperCase();

        return {
          email: lead.email,
          variant,
          subject,
          scheduledAt: scheduledAtDisplay,
        };
      });

      const headers = {
        email: 'Email',
        variant: 'Variant',
        subject: 'Subject',
        scheduledAt: 'Scheduled At',
      };

      const columnWidths = Object.entries(headers).reduce(
        (acc, [key, header]) => {
          const maxValueLength = previewRows.reduce((max, row) => {
            const value = row[key] ?? '';
            return Math.max(max, value.length);
          }, header.length);
          acc[key] = maxValueLength;
          return acc;
        },
        {}
      );

      const formatRow = (row) =>
        `  ${chalk.white(row.email.padEnd(columnWidths.email))}  ${chalk.white(
          row.variant.padEnd(columnWidths.variant)
        )}  ${chalk.white(row.subject.padEnd(columnWidths.subject))}  ${chalk.white(
          row.scheduledAt.padEnd(columnWidths.scheduledAt)
        )}`;

      console.log(
        `  ${chalk.dim(headers.email.padEnd(columnWidths.email))}  ${chalk.dim(
          headers.variant.padEnd(columnWidths.variant)
        )}  ${chalk.dim(headers.subject.padEnd(columnWidths.subject))}  ${chalk.dim(
          headers.scheduledAt.padEnd(columnWidths.scheduledAt)
        )}`
      );
      previewRows.forEach((row) => {
        console.log(formatRow(row));
      });

      if (schedule.length > 5) {
        logInfo(`...and ${schedule.length - 5} more`);
      }
    }
    console.log('');

    // Update leads with dry-run data
    const updatedLeads = validLeads.map((lead) => {
      const scheduledLead = schedule.find((s) => s.lead.email === lead.email);
      if (!scheduledLead) {
        return {
          ...lead,
          scheduled_at: lead.scheduled_at || '',
          resend_id: lead.resend_id || '',
          status: lead.status || '',
        };
      }

      return {
        ...lead,
        scheduled_at: scheduledLead.scheduledAt.toISOString(),
        resend_id: 'dry-run',
        status: 'scheduled',
      };
    });

    writeLeads(campaignPath, updatedLeads);
    logInfo('🧾 leads.csv updated with scheduled_at, resend_id, and status');

    const variantSummary = schedule.reduce((acc, { lead }) => {
      const variant = (lead.variant || 'default').toUpperCase();
      acc[variant] = (acc[variant] || 0) + 1;
      return acc;
    }, {});

    const variantSummaryText =
      Object.keys(variantSummary).length > 0
        ? Object.entries(variantSummary)
            .map(([variant, count]) => `${variant}=${count}`)
            .join(', ')
        : 'none';

    logSuccess(
      `${schedule.length} email${
        schedule.length === 1 ? '' : 's'
      } scheduled (variants: ${variantSummaryText})`
    );

    return { scheduled: 0, failed: 0, dryRun: true, schedule };
  }

  // Schedule emails via Resend API
  console.log('');
  const sendSpinner = createSpinner(
    `Scheduling ${schedule.length} email${schedule.length > 1 ? 's' : ''} via Resend`
  ).start();
  const results = await scheduleEmailBatch(
    config,
    schedule,
    template,
    sendSpinner,
    { resendApiKey }
  );

  const scheduled = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  if (failed === 0) {
    sendSpinner.succeed(
      `✅ Successfully scheduled ${scheduled} email${scheduled > 1 ? 's' : ''}`
    );
  } else {
    sendSpinner.warn(`Scheduled ${scheduled}, failed ${failed}`);
  }

  // Update leads with real-run data
  const updatedLeads = validLeads.map((lead) => {
    const result = results.find((r) => r.lead.email === lead.email);

    if (!result) {
      return {
        ...lead,
        scheduled_at: lead.scheduled_at || '',
        resend_id: lead.resend_id || '',
        status: lead.status || '',
      };
    }

    const baseLead = {
      ...lead,
      scheduled_at: result.scheduledAt.toISOString(),
    };

    if (result.success) {
      return {
        ...baseLead,
        resend_id: result.emailId || '',
        status: 'scheduled',
      };
    }

    return {
      ...baseLead,
      resend_id: '',
      status: 'failed',
    };
  });

  writeLeads(campaignPath, updatedLeads);
  logInfo('🧾 leads.csv updated with scheduled_at, resend_id, and status');

  const variantSummary = results
    .filter((result) => result.success)
    .reduce((acc, { lead }) => {
      const variant = (lead.variant || 'default').toUpperCase();
      acc[variant] = (acc[variant] || 0) + 1;
      return acc;
    }, {});

  const variantSummaryText =
    Object.keys(variantSummary).length > 0
      ? Object.entries(variantSummary)
          .map(([variant, count]) => `${variant}=${count}`)
          .join(', ')
      : 'none';

  if (scheduled > 0) {
    logSuccess(
      `${scheduled} email${
        scheduled === 1 ? '' : 's'
      } sent (variants: ${variantSummaryText})`
    );
  } else {
    logWarning('0 emails sent (variants: none)');
  }

  if (failed > 0) {
    console.log('');
    logWarning('Failed emails:');
    results
      .filter((r) => !r.success)
      .forEach(({ lead, error }) => {
        logWarning(`  ${lead.email}: ${error}`);
      });
  }

  console.log('');
  return { scheduled, failed, results };
}
