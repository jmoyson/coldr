# 🧊 Coldr

> Ship cold email campaigns from your terminal: fast, safe, and open source.

Two commands. Full control. No dashboards.

[![npm version](https://img.shields.io/npm/v/@jmoyson/coldr.svg)](https://www.npmjs.com/package/@jmoyson/coldr)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

👉 **Star the repo** and follow [@jeremymoyson](https://x.com/jeremymoyson) for behind-the-scenes updates and launch notes.

## TL;DR — try it in 10 seconds

[TODO] - Add GIF here

```bash
npx @jmoyson/coldr@latest hello
```

Instant fake campaign preview. No setup, no key, just proof it works.

## Want to send your own?

Init a campaign:

```bash
npx @jmoyson/coldr@latest init
cd coldr-campaign
# Edit config.json, leads.csv, and template.html as you like
coldr schedule --dry-run
# Check everything looks good, then send:
coldr schedule --resend-api-key <your-api-key>
```

That’s it! Your first campaign is live, now watch cold leads warm up 🔥.

## Why Coldr

Cold outreach tools are bloated, pricey, and lock you into dashboards.

Coldr stays small, local, and transparent. Built for people who prefer shipping code over managing UIs.

- ⚙️ **Terminal-native** - run everything from your CLI
- 🧾 **Plain files** - CSV, HTML, JSON you can version and diff
- 🧊 **Safe by default** - dry-run first, send explicit
- 💸 **Free and open source** - no hidden fees, no lock-in _(works with Resend’s free tier)_

Built for builders who’d rather own their process than rent another dashboard.

## What it does

Coldr gives you everything you need to run and test campaigns in minutes.

Two commands, no setup, no guessing.

- ⚙️ **Instant scaffolding** - `coldr init` creates config, sample leads, template, and suppressions in one go
- 🔍 **Dry-run by default** - preview every send safely, even without an API key
- 🧩 **CSV-based A/B testing** - add `variant`, `subject`, `intro`, or `cta` columns and Coldr renders them automatically
- 🧾 **Automatic logging** - `scheduled_at`, `resend_id`, and `status` get written back into `leads.csv`
- ✉️ **Resend integration** - clean scheduling, safe throttling, and retry logic built in

## Next steps

- ⭐️ **Star this repo** - support the project and get notified on updates
- 🧊 **Follow [@jeremymoyson](https://x.com/jeremymoyson)** for launch threads, dev notes, and roadmap drops
- 📘 **Go deeper** - read [`docs/usage.md`](docs/usage.md) or check the [scaffold examples](https://github.com/jmoyson/coldr/tree/main/scaffold)
- 💡 **Want to help?** - open an issue, suggest an idea, or improve the docs.

☕️ [Buy me a coffee](https://www.buymeacoffee.com/jmoyson) - fuels open-source mornings.

## License

MIT © 2025 [Jérémy Moyson](https://www.jmoyson.com)

Built for builders who ship fast and want their outreach to feel the same.
