import fs from 'fs';
import os from 'os';
import path from 'path';
import { logInfo, logSuccess } from '../utils/error.utils.js';
import schedule from './schedule.js';

export default async function hello() {
  logInfo('Running a demo dry-run...');

  const originalCwd = process.cwd();
  const demoPath = fs.mkdtempSync(path.join(os.tmpdir(), 'coldr-hello-'));

  try {
    process.chdir(demoPath);

    const config = {
      sender: 'Coldr Demo <demo@example.com>',
      replyTo: 'demo@example.com',
      subject: 'Quick idea for {{company}}',
      perDay: 10,
      startDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      workDays: [1, 2, 3, 4, 5],
      workHours: [9, 17],
    };
    fs.writeFileSync('config.json', JSON.stringify(config, null, 2));

    const leads = [
      {
        email: 'alice@domain.com',
        name: 'Alice',
        company: 'Domain Inc',
        variant: 'var-a',
        subject: 'Do you like cookies?',
        intro: 'Saw your team is hiring engineers — quick idea for you.',
        cta: 'Book a 10-min chat',
      },
      {
        email: 'charlie@piedpiper.com',
        name: 'Charlie',
        company: 'Pied Piper',
        variant: 'var-b',
        subject: 'Want to try a free cookie sample?',
        intro: 'We built a small tool to automate outreach emails.',
        cta: 'Try it this week',
      },
    ];

    const csvHeader = 'email,name,company,variant,subject,intro,cta\n';
    const csvRows = leads
      .map((lead) =>
        [
          lead.email,
          lead.name,
          lead.company,
          lead.variant,
          lead.subject,
          lead.intro,
          lead.cta,
        ]
          .map((value) => `"${(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    fs.writeFileSync('leads.csv', `${csvHeader}${csvRows}\n`);

    const template = `<h3>{{subject}}</h3>
<p>Hi {{name}},</p>
<p>{{intro}}</p>
<p>{{cta}}</p>
<p>— The {{company}} team</p>`;
    fs.writeFileSync('template.html', template);

    const suppressions = { emails: [], domains: [] };
    fs.writeFileSync('suppressions.json', JSON.stringify(suppressions, null, 2));

    await schedule('.', { dryRun: true });
    logSuccess('Demo ready — tweak the files above to explore more.');
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(demoPath, { recursive: true, force: true });
  }
}
