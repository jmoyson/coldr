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
npm install -g coldr
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
  "unsubscribeLink": "mailto:unsubscribe@yourstartup.com?subject=STOP", // optional, default is no unsubscribe link
  "perDay": 20, // optional, default is 20 emails per day
  "startDate": "2025-10-28T09:00:00+02:00", // optional, default is tomorrow
  "workDays": [0, 1, 2, 3, 4, 5], // optional, default is all Monday to Friday
  "workHours": [9, 17] // optional, default is 9am to 5pm
}
```

**2. Add your contacts to `leads.csv`:**

```csv
email,firstName,company
bob@acme.io,Bob,Acme Corp
sarah@tech.co,Sarah,Tech Co
```

**3. Customize `template.html`:**

```html
<p>Hi {{firstName}},</p>

<p>I noticed {{company}} is working on [relevant topic].</p>

<p>Quick question: would you be open to a 15-minute intro call?</p>

<p>Best,<br />Alice</p>
```

### Schedule Emails

```bash
export RESEND_API_KEY=re_your_api_key
coldr schedule
```

**That's it.** Coldr schedules your emails and Resend handles the delivery.

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
