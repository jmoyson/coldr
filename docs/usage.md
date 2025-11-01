# 🧊 Coldr — Usage Guide

## Overview

Coldr lets you manage cold email campaigns directly from your terminal using plain files.  
You can initialize, preview, test, and schedule real sends through the Resend API all without dashboards or databases.

---

## Quick playground

Run this to try Coldr instantly in dry-run mode:

```bash
npx @jmoyson/coldr@latest init && coldr schedule --dry-run
```

This scaffolds a campaign (`coldr-campaign/` by default), runs a safe preview,  
and writes metadata back into `leads.csv`. No API key required.

---

## 1. Initialize a campaign

Create a new campaign folder with all required files:

```bash
npx @jmoyson/coldr@latest init
# or specify a name
npx @jmoyson/coldr@latest init my-campaign
```

By default, Coldr creates a folder named `coldr-campaign/` unless you provide a custom name.

It generates the following structure:

```
coldr-campaign/
├── config.json          # campaign settings
├── leads.csv            # contacts (supports A/B columns)
├── template.html        # email template
└── suppressions.json    # optional blocklist
```

**Tip:** You can delete the scaffold and re-run `coldr init` anytime to start fresh.

Prefer to work from inside the folder?

```bash
cd coldr-campaign
coldr schedule . --dry-run
```

The `.` argument tells Coldr to use the current directory.

---

## 2. Configure your campaign

Edit `config.json` to define how your campaign behaves:

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

**Notes:**

- If your `leads.csv` contains a `subject` column, it **overrides** the value in `config.json` for that lead.
- `workDays` uses numeric format (0 = Sunday, 6 = Saturday).
- Coldr respects your defined send window and rate limits automatically.

---

## 3. Add your leads

Update `leads.csv` with your contacts:

```csv
email,name,company
alice@example.com,Alice,Example Corp
bob@sample.io,Bob,Sample Inc
charlie@demo.co,Charlie,Demo Co
```

**Required:**

- Only `email` is mandatory.  
  The rest (`name`, `company`, `subject`, etc.) are optional and used for personalization or A/B testing.

Any column becomes available as a `{{variable}}` inside your template.

---

## 4. Write your template

Edit `template.html` with your email body. You can mix static text and variables from your CSV:

```html
<p>Hi {{name}},</p>

<p>
  I came across {{company}} and thought this might save your team some time.
</p>

<p>
  We’ve built a simple way to manage outreach at scale — without losing the
  personal touch.
</p>

<p><b>{{cta}}</b></p>

<p>Best,<br />Your Name</p>
```

Coldr replaces variables automatically. Missing variables remain blank.

---

## 5. Preview a single email

You can preview a single email locally:

```bash
coldr preview
```

This prints the email that would be sent to the first lead in your CSV.

To target a specific lead or send it to your inbox for testing:

```bash
coldr preview --lead alice@domain.com --to your-email@example.com --resend-api-key re_your_api_key
```

If `--to` is omitted, the output stays local (no send occurs).
Make sure to provide a valid Resend API key if you want to send to your inbox.

## 6. Preview your campaign

Run a dry-run to check your entire campaign:

```bash
coldr schedule --dry-run
```

You’ll see a preview of:

- total leads
- campaign start time
- first few scheduled emails
- any missing variables or formatting issues

**Nothing is sent during a dry-run**. It only simulates scheduling and logs results.

---

## 7. Schedule your campaign

To actually schedule emails through Resend, run:

```bash
coldr schedule --resend-api-key re_your_api_key
```

or, if your key is already set as an environment variable:

```bash
coldr schedule
```

**Rules:**

- Either the `RESEND_API_KEY` env variable **or** the `--resend-api-key` option is required.
- The CLI option overrides the environment variable if both are present.

Coldr will:

- Schedule messages respecting `workDays` and `workHours`.
- Randomize send times between the `workHours` time window.
- Throttle automatically (~1.5 s per send) to stay within Resend’s rate limits (2 sends per second).
- Log results (`scheduled_at`, `resend_id`, `status`) into `leads.csv`

---

## 8. Check logs

After scheduling, open `leads.csv` to see new columns automatically added:

```csv
email,name,...,scheduled_at,resend_id,status
alice@domain.com,Alice,...,2025-10-31T09:32:00Z,abc123,scheduled
```

You can analyze results in spreadsheets, Notion, Supabase, or any editor that opens CSV files.

---

## 9. Use suppressions (optional)

Edit `suppressions.json` to exclude unwanted addresses (e.g., fake domains, unsubscribed users, competitors):

```json
{
  "emails": ["blocked@example.com", "unsubscribed@client.com"],
  "domains": ["competitor.com"]
}
```

Coldr automatically filters these out before scheduling.

---

## 10. Available commands

You can run `coldr --help` to see a list of available commands and options.

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `coldr init [name]`     | Create a new campaign scaffold              |
| `coldr preview`         | Preview or test a single email              |
| `coldr schedule [path]` | Schedule a campaign (dry-run if no API key) |
| `coldr hello`           | Demo fake campaign in memory                |
| `coldr --help`          | Show all commands and options               |

---

## 11. Troubleshooting

- **No emails sent?** → You must provide either `--resend-api-key` or have `RESEND_API_KEY` set.
- **Wrong timing?** → Check `workDays` and `workHours` in `config.json`, also check your timezone!
- **Duplicate sends?** → Ensure each lead’s email is unique.
- **Missing variables?** → Confirm your template placeholders match CSV column names.
- **Invalid CSV?** → Use UTF-8 encoding and avoid stray commas or quotes.

---

## 12. Next steps

- ⭐️ Star [the repo](https://github.com/jmoyson/coldr) to follow updates
- 🧊 Follow [@jeremymoyson](https://x.com/jeremymoyson) for tips and roadmap drops
- 💬 Need anything? Ping me on X [@jeremymoyson](https://x.com/jeremymoyson)
- 💡 [Suggest an idea](https://github.com/jmoyson/coldr/issues/new/choose)

Find this tool useful? [☕️ Buy me a coffee](https://www.buymeacoffee.com/jmoyson).

---

MIT © 2025 [Jérémy Moyson](https://jmoyson.com)
