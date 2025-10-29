# 🧊 Coldr

**Run Cold emails campaigns from your terminal.**

A minimal CLI for cold emails — no dashboard, no subscription, just code and deliverability.

---

## Why Coldr?

Cold outreach tools are expensive ($99+/month) and bloated with features you don't need.

Coldr gives you:

- ✅ **Control** — Your data stays local, you own the process
- ✅ **Transparency** — Plain CSV and JSON files, no black boxes
- ✅ **Simplicity** — Two commands, five minutes to start your campaign
- ✅ **Cost-effective** — Free CLI, Resend’s free tier often covers MVPs

**Perfect for:** Indie makers, Solopreneurs, Developers, bootstrapped startups testing ideas quickly, anyone who wants to run cold emails simply and transparently.

---

## Quick Start

### Install

```bash
npm install -g @jmoyson/coldr
```

### Initialize Campaign

```bash
coldr init my-campaign
cd my-campaign
```

This creates:

```
my-campaign/
├── config.json          # Campaign settings
├── leads.csv            # Your contacts
├── template.html        # Email template
└── suppressions.json    # Opt-out list
```

### Configure

**1. Edit `config.json`:**

```json
{
  "sender": "Alice <alice@yourstartup.com>",
  "subject": "Quick question about {{company}}",
  "perDay": 20,
  "startDate": "2025-10-28T09:00:00Z",
  "workDays": [1, 2, 3, 4, 5],
  "workHours": [9, 17],
  "unsubscribeMailto": "mailto:unsubscribe@yourstartup.com?subject=STOP"
}
```

- **sender**: Your name and email `"Name <email@domain.com>"`
- **subject**: Email subject (supports `{{variables}}`)
- **perDay**: Max emails per day
- **startDate**: Campaign start (ISO 8601 format)
- **workDays**: Days to send (0=Sunday, 6=Saturday)
- **workHours**: Time range `[startHour, endHour]` (24h format)
- **unsubscribeMailto**: Unsubscribe link

**2. Add contacts to `leads.csv`:**

```csv
email,firstName,company
bob@acme.io,Bob,Acme Corp
sarah@tech.co,Sarah,Tech Co
```

Any CSV column can be used as a `{{variable}}` in your template.

**3. Customize `template.html`:**

```html
<p>Hi {{firstName}},</p>
<p>I noticed {{company}} is working on [relevant topic].</p>
<p>Quick question: would you be open to a 15-minute intro call?</p>
<p>Best,<br />Alice</p>
```

**4. (Optional) Add suppressions to `suppressions.json`:**

```json
{
  "emails": ["blocked@example.com"],
  "domains": ["competitor.com"]
}
```

### Schedule Emails

**Preview first (dry run):**

```bash
coldr schedule my-campaign --dry-run
```

**Schedule for real:**

Option 1 - Using environment variable:

```bash
export RESEND_API_KEY=re_your_api_key
coldr schedule my-campaign
```

Option 2 - Using command option:

```bash
coldr schedule my-campaign --resend-api-key re_your_api_key
```

Emails are scheduled via Resend API and sent automatically at calculated times. The scheduler:

- Respects work days and hours
- Randomizes send times for natural distribution
- Enforces daily limits
- Filters suppressed emails/domains
- Fails fast with clear errors if API key is missing

---

## Support

- **Documentation:** [coldr.jmoyson.com](https://coldr.jmoyson.com)
- **Source Code:** [github.com/jmoyson/coldr](https://github.com/jmoyson/coldr)
- **Issues:** [GitHub Issues](https://github.com/jmoyson/coldr/issues)
- **Security:** See [SECURITY.md](SECURITY.md) for vulnerability reporting

---

## License

MIT © 2025 Jeremy Moyson

See [LICENSE](LICENSE) for full text.

**Built for indie makers who code.** 🧊
