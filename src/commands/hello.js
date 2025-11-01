import chalk from 'chalk';
import { logInfo, logSuccess } from '../utils/error.utils.js';
import {
  calculateSchedule,
  getScheduleSummary,
} from '../services/scheduler.service.js';
import { _internal as emailInternal } from '../services/email.service.js';
import { SHARE_HINT_TEXT, GITHUB_REPO_URL } from '../constants/index.js';

/**
 * Run an in-memory demo dry-run for SaaS builders.
 * Shows the scheduling flow without touching the filesystem.
 */
export default async function hello() {
  const config = {
    sender: 'Jeremy from Coldr <jeremy@coldr.jmoyson.com>',
    replyTo: 'support@coldr.jmoyson.com',
    subject: 'Idea for {{company}}',
    perDay: 3,
    startDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    workDays: [1, 2, 3, 4, 5],
    workHours: [9, 17],
  };

  const leads = [
    {
      email: 'alice@example.com',
      name: 'Alice',
      company: 'Example Corp',
      variant: 'demo-a',
      subject: 'Example Corp x Coldr?',
    },
    {
      email: 'bob@sample.io',
      name: 'Bob',
      company: 'Sample Inc',
      variant: 'demo-b',
      subject: 'Save launch time at {{company}}',
    },
    {
      email: 'charlie@demo.co',
      name: 'Charlie',
      company: 'Demo Co',
      variant: 'demo-a',
      subject: 'Example Corp x Coldr?',
    },
  ];

  const schedule = calculateSchedule(config, leads);
  const summary = getScheduleSummary(schedule);

  console.log('');
  logInfo(`📧 Campaign: Coldr demo (scaffold preview)`);
  logInfo(
    `Sender: ${config.sender} | Window: ${config.workHours[0]}-${config.workHours[1]}h | Days: Mon-Fri`
  );
  logInfo(
    `Start: ${new Date(summary.startDate).toLocaleString()} → End: ${new Date(
      summary.endDate
    ).toLocaleString()}`
  );

  console.log('');
  logInfo('🔍 DRY RUN - Preview:');

  const previewRows = schedule.map(({ lead, scheduledAt }) => ({
    email: lead.email,
    variant: (lead.variant || 'default').toUpperCase(),
    subject: emailInternal.processTemplate(
      lead.subject || config.subject,
      lead,
      config
    ),
    scheduledAt: new Date(scheduledAt).toLocaleString(),
  }));

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
  console.log('');

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
    `Demo scheduled ${schedule.length} emails virtually (variants: ${variantSummaryText}).`
  );
  console.log('');
  logInfo('Next steps for builders:');
  console.log(
    `  ${chalk.cyan('›')} ${chalk.white('Spin up your first live run with')} ${chalk.cyan(
      'npx @jmoyson/coldr@latest init'
    )} ${chalk.white('and keep the momentum going.')}`
  );
  console.log(
    `  ${chalk.cyan('›')} ${chalk.white(`${SHARE_HINT_TEXT}:`)} ${chalk.cyan(
      GITHUB_REPO_URL
    )}`
  );
  console.log(
    `  ${chalk.cyan('›')} ${chalk.white('Swap experiments or grab playbooks:')} ${chalk.cyan(
      'https://x.com/jeremymoyson'
    )}`
  );
  console.log('');
  console.log(chalk.italic.dim('Made with 🧊 for devs shipping SaaS who want outreach to feel native.'));
}
