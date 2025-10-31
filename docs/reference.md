# Command & Config Reference

This document is the single source of truth for Coldr’s commands, flags, configuration, and file formats.

---

## CLI commands

### `coldr init [name]`

- **Description:** Scaffolds a campaign using the bundled templates.
- **Default argument:** `coldr-campaign`
- **Special cases:**
  - Pass `.` to scaffold into the current (empty) directory.
  - Command fails fast if the target directory isn’t empty (excluding `.git`).

### `coldr schedule [name]`

- **Description:** Calculates a schedule and optionally sends emails.
- **Flags:**
  - `--dry-run` — calculate + log without hitting the Resend API (default behaviour when no key is present).
  - `--resend-api-key <key>` — override the `RESEND_API_KEY` environment variable for this run.
- **Behaviour notes:**
  - Requires `RESEND_API_KEY` (or the flag) when `--dry-run` is omitted.
  - Waits ~1.5 seconds between requests to respect Resend limits.
  - Appends or updates `scheduled_at`, `resend_id`, and `status` in `leads.csv`.

### `coldr hello`

- **Description:** Creates a temporary campaign, runs a dry-run, prints the preview table, and deletes the temp dir.
- **Use case:** Demos, onboarding, sanity checking the DX.

### `coldr test [name] <recipient>`

- **Description:** Sends a one-off test email using the first valid lead.
- **Flags:** `--resend-api-key <key>` overrides the environment variable.
- **Requires:** `RESEND_API_KEY` (test keys work).

---

## Environment variables

Variable | Description | Required
--- | --- | ---
`RESEND_API_KEY` | API key used for live sends and the `test` command. | Only for non-dry runs

> ℹ️ When `RESEND_API_KEY` is missing, `coldr schedule` automatically switches to dry-run mode unless you explicitly request a send, in which case it throws a `MISSING_API_KEY` error with next steps.

---

## `config.json`

The scaffold ships with the following shape:

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

Field | Type | Required | Notes
--- | --- | --- | ---
`sender` | string | ✅ | Must follow `"Name <email@domain>"` for Resend
`replyTo` | string | optional | Defaults to Resend’s behaviour when omitted
`subject` | string | ✅ | Can include `{{variables}}`
`perDay` | integer | ✅ | Number of emails scheduled per work day
`startDate` | ISO string | ✅ | Start time; Coldr shifts to “now + 1h” if it’s in the past
`workDays` | array<number> | ✅ | 0=Sunday … 6=Saturday
`workHours` | `[startHour, endHour]` | ✅ | 24h integers, `startHour < endHour`

---

## `leads.csv`

- Must include an `email` column.
- All other columns are optional and become template variables (`{{columnName}}`).
- `variant` is not required but shows up in the preview and summary when present.
- Columns added by Coldr:
  - `scheduled_at` — ISO timestamp
  - `resend_id` — Resend email ID (empty on dry runs)
- `status` — `scheduled`, `failed`, or preserved when untouched

---

## `template.html`

- Standard HTML file.
- Use `{{variable}}` placeholders that map to CSV columns or config defaults.
- Missing placeholders resolve to empty strings so you never ship `{{braces}}`.

---

## `suppressions.json`

```json
{
  "emails": [],
  "domains": []
}
```

- Both arrays are optional.
- Matches are case-insensitive.
- Suppressed leads are reported in the schedule stats and excluded from sending.

---

## Logging details

- Writes to `leads.csv` happen via atomic swap (`write to temp file → rename`) to avoid partial writes on interruption.
- Dry-runs write empty `resend_id` values so diffs make the preview explicit.
- Both dry-runs and successful sends log `status: scheduled`; failures log `status: failed` with an empty `resend_id`.

---

## Testing & development

- Install dependencies: `npm install`
- Run the full suite: `npm test`
- Lint: `npm run lint`
- Format check: `npm run format:check`

---

Questions? Ideas? [Open an issue](https://github.com/jmoyson/coldr/issues) or reach out on X: [@jeremymoyson](https://x.com/jeremymoyson).
