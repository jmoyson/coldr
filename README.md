# 🧊 Coldr

> Run, preview, and ship cold email campaigns straight from your terminal.

[![npm version](https://img.shields.io/npm/v/@jmoyson/coldr.svg)](https://www.npmjs.com/package/@jmoyson/coldr)
[![npm downloads](https://img.shields.io/npm/dw/@jmoyson/coldr.svg)](https://www.npmjs.com/package/@jmoyson/coldr)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/jmoyson/coldr/ci.yml?label=build)](https://github.com/jmoyson/coldr/actions)

---

⭐️ **Star the repo** and follow [@jeremymoyson](https://x.com/jeremymoyson) for behind-the-scenes drops and launch news.

## TL;DR — first dry-run in 30 seconds

```bash
npx @jmoyson/coldr@latest init
coldr schedule coldr-campaign --dry-run
```

- Works even without `RESEND_API_KEY` (falls back to dry-run)
- Scaffolds `./coldr-campaign` with config, CSV, template, and suppressions
- Shows a five-lead preview (variant aware) and writes logs back into `leads.csv`

Prefer a single command? 👇

```bash
npx @jmoyson/coldr@latest init && coldr schedule --dry-run
```

_Default `coldr schedule` looks for the `coldr-campaign/` folder in your current directory._

## Why builders pick Coldr

| You get | Instead of |
| --- | --- |
| ⚙️ Terminal-native workflow | Bloated SaaS dashboards |
| 🧾 CSV + HTML you can git diff | Black-box campaign editors |
| 🧊 Safe defaults, smart fallbacks | Fragile setup wizards |
| 💸 Resend free tier compatible | $99+/mo outreach tools |

Perfect for indie makers, technical founders, and teams who want repeatable outreach without surrendering their data.

## What ships out of the box

- **Zero-config onboarding** – `coldr init` scaffolds everything (config, example leads, template, suppressions)
- **Dry-run by default** – previews + CSV logging even with no API key
- **CSV-driven A/B testing** – add `variant`, `subject`, `intro`, `cta`, … columns and they render automatically
- **Per-lead logging** – `scheduled_at`, `resend_id`, `status` are appended back into `leads.csv`
- **Resend integration** – throttled scheduling (1.5s cadence) with retryable errors wrapped as CLI-friendly messages
- **In-memory demo** – `coldr hello` spins a throwaway campaign so you can see the DX before touching your own data

## Quick Start

### 1. Scaffold a campaign

```bash
coldr init            # creates ./coldr-campaign by default
coldr init moonshot   # or name your own campaign folder
```

The scaffold looks like:

```
coldr-campaign/
├── config.json
├── leads.csv
├── template.html
└── suppressions.json
```

### 2. Preview (no API key required)

```bash
coldr schedule coldr-campaign --dry-run
# or if you `cd coldr-campaign`: coldr schedule . --dry-run
```

Example output (truncated, locale-dependent timestamps):

```
- Loading campaign configuration
✔ Configuration loaded
- Loading leads
✔ Leads loaded
  Total leads: 3
  Valid leads: 3
- Calculating schedule
✔ Schedule calculated

🧊 📧 Campaign: coldr-campaign
  Sender: Your Name <hello@sending.yourdomain.com>
  Reply to: hello@yourdomain.com
  Subject: Quick question about {{company}}
  Emails/day: 20
  Total emails: 3
  Start date: 31/10/2025 14:41:00
  End date: 31/10/2025 15:56:00
  Duration: 1 day

🧊 🔍 DRY RUN - Preview (first 5 emails):
  Email              Variant  Subject                            Scheduled At
  charlie@demo.co    DEFAULT  Quick question about Demo Co       31/10/2025 14:41:00
  bob@sample.io      DEFAULT  Quick question about Sample Inc    31/10/2025 15:01:00
  alice@example.com  DEFAULT  Quick question about Example Corp  31/10/2025 15:56:00

🧊 🧾 leads.csv updated with scheduled_at, resend_id, and status
✅ 3 emails scheduled (variants: DEFAULT=3)
```

The dry-run mutates `leads.csv` with `scheduled_at`, empty `resend_id`, and `status=scheduled` so you can keep context in Git.

### 3. Send for real

```bash
export RESEND_API_KEY=re_your_api_key   # or use --resend-api-key
coldr schedule coldr-campaign
```

- Missing API key? The command exits early with a helpful message.
- Resend responses (`id`, failures) are surfaced per lead and logged back into the CSV.
- Coldr waits ~1.5 s between calls so you stay under Resend’s 2 req / 2 s guidance.

### 4. Kick the tires with the demo

```bash
coldr hello
```

This spins up a temporary campaign, runs a dry-run with two A/B variants, displays the same preview table, and cleans itself up. Great for screen recordings or team hand-offs.

More workflows live in [`docs/usage.md`](docs/usage.md).

## CSV-based A/B testing

Coldr reads any extra columns in your `leads.csv` and turns them into template variables.

```csv
email,name,company,subject,intro,cta,variant
alice@domain.com,Alice,Domain Inc,Hey Alice 👋,Saw your team is hiring engineers — quick idea for you.,Book a 10-min chat,var-a
charlie@piedpiper.com,Charlie,Pied Piper,Charlie — about scaling faster,We built a tool to automate demos.,Try it this week,var-b
```

Template example:

```html
<h3>{{subject}}</h3>
<p>Hi {{name}},</p>
<p>{{intro}}</p>
<p>{{cta}}</p>
<p>— {{company}} team</p>
```

Missing data in a row falls back to the global defaults in `config.json`. The dry-run preview shows variants in uppercase (`VAR-A`, `VAR-B`) and the summary aggregates counts so you can eyeball balance.

## Logging & observability

- Dry-runs and real sends update `leads.csv` in-place using atomic writes.
- New columns are created if they don’t exist.
- `status` is `scheduled`, `failed`, or stays untouched when a lead wasn’t part of the run.
- Use the CSV anywhere—import into Sheets, Notion, Airtable, or pipe into your own tooling.

## CLI reference

Command | Purpose
--- | ---
`coldr init [name]` | Scaffold a campaign (`coldr-campaign` by default, `.` to use the current dir)
`coldr schedule [name] [--dry-run] [--resend-api-key <key>]` | Calculate and optionally send a campaign
`coldr hello` | Spin up a temporary A/B demo and preview the output
`coldr test [name] <email> [--resend-api-key <key>]` | Send a single test email using the first lead (API key required)

Full reference lives in [`docs/reference.md`](docs/reference.md).

## Configuration snapshot

`config.json` scaffold:

```json
{
  "sender": "Your Name <hello@sending.yourdomain.com>",
  "replyTo": "hello@yourdomain.com",
  "subject": "Quick question about {{company}}",
  "perDay": 20,
  "startDate": "2025-10-29T00:00:00Z",
  "workDays": [1, 2, 3, 4, 5],
  "workHours": [9, 17]
}
```

- `sender` must match the `"Name <address@domain>"` format Resend expects.
- `workDays` use JS weekday numbers (0 = Sunday).
- `workHours` is a `[startHour, endHour]` tuple in 24h format.

For more knobs (suppressions, CSV format, testing utilities) head to [`docs/reference.md`](docs/reference.md).

## Next steps

1. ⭐️ Star this repo to keep it on your radar.
2. 🧊 Follow [@jeremymoyson](https://x.com/jeremymoyson) for tips, launch threads, and roadmap drops.
3. 📘 Dive deeper: [`docs/usage.md`](docs/usage.md) · [`docs/reference.md`](docs/reference.md) · [`CONTRIBUTING.md`](CONTRIBUTING.md)

## License

MIT © 2025 [Jérémy Moyson](https://jmoyson.com)

Made for builders who ship fast—and want their outreach to feel the same.
