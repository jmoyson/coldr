# 🧊 Coldr — Scaffold Reference

Coldr keeps things simple: everything lives in your project folder as plain files.
This doc describes what each file does, how it’s structured, and what Coldr writes back during execution.

For CLI usage and flags, run:

```bash
coldr --help
```

---

## Project Structure

When you run `coldr init`, Coldr scaffolds a complete campaign folder:

```
coldr-campaign/
├── config.json          # Campaign configuration
├── leads.csv            # Contact list
├── template.html        # Email body
└── suppressions.json    # Optional blocklist
```

Each of these files can be versioned, diffed, or regenerated safely.
Coldr never hides data behind a database or dashboard.

---

## `config.json`

Defines the global behaviour of your campaign.

Example scaffold:

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

**Fields:**

| Key         | Type                   | Description                                                      |
| ----------- | ---------------------- | ---------------------------------------------------------------- |
| `sender`    | string                 | The “From” field. Must be `"Name <email@domain>"`.               |
| `replyTo`   | string                 | Optional. Defaults to sender domain behaviour.                   |
| `subject`   | string                 | Default subject line; supports `{{variables}}` from `leads.csv`. |
| `perDay`    | integer                | Max number of emails sent per day.                               |
| `startDate` | ISO string             | Start time (shifts to now +1h if in the past).                   |
| `workDays`  | array<number>          | Days allowed for sends (0 = Sunday … 6 = Saturday).              |
| `workHours` | `[startHour, endHour]` | 24h range defining when emails can be sent.                      |

**Notes:**

- Any lead-specific `subject` in `leads.csv` overrides the config one.
- Coldr randomizes send times between `workHours`.
- These settings are safe to tweak between runs — Coldr recalculates on schedule.

---

## `leads.csv`

Your campaign data lives here.

Example:

```csv
email,name,company,subject,intro,cta,variant
alice@domain.com,Alice,Domain Inc,Hey Alice 👋,Saw your team is hiring engineers.,Book a 10-min chat,var-a
charlie@piedpiper.com,Charlie,Pied Piper,Charlie — about scaling faster,We built a tool to automate demos.,Try it this week,var-b
```

**Rules:**

- Only `email` is required.
- Each column becomes available as `{{variable}}` in your template.
- `subject` overrides `config.json.subject`.
- `variant` can be used for A/B testing identifiers.
- Duplicates are skipped automatically.

**Runtime fields added by Coldr:**

| Column         | Description                                            |
| -------------- | ------------------------------------------------------ |
| `scheduled_at` | ISO timestamp of when the email was (or will be) sent. |
| `resend_id`    | Resend message ID (blank in dry-runs).                 |
| `status`       | `scheduled`, `failed`, or `suppressed`.                |

Safe to version — Coldr appends and updates, but doesn’t overwrite your data.

---

## `template.html`

This is your email body. Simple, portable, and easy to customize.

Example:

```html
<p>Hi {{name}},</p>
<p>I noticed {{company}} might find this helpful.</p>
<p>{{cta}}</p>
<p>Best,<br />{{sender}}</p>
```

**Usage notes:**

- Variables map 1:1 with columns in `leads.csv` and keys in `config.json`.
- Missing variables resolve to empty strings.
- You can include minimal inline HTML, Coldr sends through Resend as-is.
- No need for CSS or templates. just use plain HTML for simplicity.

---

## `suppressions.json`

Optional list of emails and domains you want to skip (e.g., unsubscribes, competitors or test domains).

```json
{
  "emails": ["blocked@example.com", "unsubscribed@client.com"],
  "domains": ["competitor.com"]
}
```

- Matches are case-insensitive.
- Suppressed leads are excluded from sends but included in stats for transparency.
- Safe to edit anytime — Coldr merges these checks before scheduling.

---

## API Keys

- Use `--resend-api-key <key>` to authorize live sends.
- Leave the flag off and Coldr stays in dry-run mode.
- Preview sends (`coldr preview --to`) without a key show a clear `MISSING_API_KEY` message.

---

## Logging Behaviour

- Writes to `leads.csv` are atomic (`tmp → rename`) to prevent corruption.
- Dry-runs write `resend_id: "dry-run"` with `status: scheduled`.
- Failures log as `status: failed`.
- CLI output summarizes sent, failed, and suppressed counts at the end of each run.

---

## Development

```bash
npm install          # install dependencies
npm test             # run all tests
npm run lint         # static checks
npm run format:check # verify code style
```

---

## Support

- ⭐️ Star [the repo](https://github.com/jmoyson/coldr)
- 💬 Report issues or ideas — [GitHub Issues](https://github.com/jmoyson/coldr/issues)
- 🧵 Follow [@jeremymoyson](https://x.com/jeremymoyson)

Find this tool useful? [☕️ Buy me a coffee](https://www.buymeacoffee.com/jmoyson).

MIT © 2025 [Jérémy Moyson](https://jmoyson.com)
