# Usage Guide

Coldr is designed to feel like your favourite JavaScript tooling: opinionated defaults with room to grow. This guide covers the flows you’ll likely use right after the README quick start.

---

## One-liner playground

```bash
npx @jmoyson/coldr@latest init && coldr schedule --dry-run
```

- `coldr init` scaffolds `./coldr-campaign`
- `coldr schedule --dry-run` runs from the current directory and targets the default folder
- No API key required – the run stays in “dry” mode and writes metadata back into `coldr-campaign/leads.csv`

## Working inside a campaign directory

Prefer to `cd` into the campaign?

```bash
cd coldr-campaign
coldr schedule . --dry-run
```

Passing `.` tells the CLI to operate on the current directory. Use `coldr schedule .` (without `--dry-run`) when you’re ready to send.

## Using your own campaign name

```bash
coldr init moonshot
coldr schedule moonshot --dry-run
```

Naming the campaign up front keeps your projects organised. Every command accepts the same name argument.

## Real sends with Resend

```bash
export RESEND_API_KEY=re_live_or_test_key
coldr schedule moonshot
```

Tips:

- The key must live in `RESEND_API_KEY` or be passed through `--resend-api-key`.
- Coldr spaces calls by ~1.5 seconds to remain inside Resend’s 2 requests / 2 seconds guidance.
- Failures are captured per lead, logged back into `leads.csv`, and surfaced in the CLI summary.

## Hello demo

```bash
coldr hello
```

What it does:

1. Creates a temporary campaign in your OS temp directory
2. Seeds variant-ready leads, an opinionated template, and an example config
3. Runs `schedule --dry-run` against it
4. Deletes the temporary files afterwards

Use it for demos, quick validation, or to show teammates the developer experience.

## Sending a single test email

```bash
coldr test moonshot alice@example.com --resend-api-key re_test_key
```

- Uses the first lead in `leads.csv` to render the template
- Allows you to sanity check deliverability before a full send
- Requires a Resend key (test keys are enough)

## Updating templates & CSVs

- Any column in `leads.csv` becomes available as `{{columnName}}` inside `template.html`.
- Missing per-lead data resolves to config defaults – keep `config.json` opinionated.
- Keep `email` as the first column; it’s the only required field.

## Suppressions

`coldr-campaign/suppressions.json` follows the scaffolded shape:

```json
{
  "emails": [],
  "domains": []
}
```

- Exact email matches or domain matches in this file are skipped.
- Suppressed leads appear in the CLI counts so you can confirm the filter.

## Regenerating the scaffold

If you need a clean slate, delete the folder and re-run:

```bash
rm -rf coldr-campaign
coldr init
```

The command is idempotent as long as the target directory doesn’t already exist (or is empty when you pass `.`).

## Need more?

Head to the [reference](reference.md) for every flag, environment variable, and config property. Contributions are welcome—see [CONTRIBUTING.md](../CONTRIBUTING.md).
