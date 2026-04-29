# Morning Brief Bot — Claude Code Guide

## What this project does

A Vercel serverless cron job that fires at **07:00 UTC** every day and sends one Telegram message with three sections:

1. **London Weather** — current conditions + today's forecast via Open-Meteo (free, no API key)
2. **Google Calendar** — today's events via a Google service account
3. **Health Tech News** — a short AI-generated brief using Claude with live web search

## File map

```
api/morning-brief.js   Vercel cron handler — orchestrates all three sections
lib/weather.js         Fetches London weather from Open-Meteo
lib/calendar.js        Lists today's Google Calendar events (JWT service account auth)
lib/claude.js          Calls Claude claude-sonnet-4-20250514 with web_search tool
lib/telegram.js        Sends the final HTML message via Telegram Bot API
config/prompt.js       ← Edit this to change the news brief instructions
vercel.json            Cron schedule (0 7 * * *)
.env.example           All required environment variables with descriptions
```

## Key design decisions

- **Graceful degradation** — each section is wrapped in `trySection()`; a failure in one does not block the others.
- **HTML parse mode** — Telegram messages use `parse_mode: 'HTML'` (more reliable than MarkdownV2).
- **Web search** — Claude uses the `web_search_20250305` built-in tool; no extra API key needed beyond `ANTHROPIC_API_KEY`.
- **Cron auth** — Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically when `CRON_SECRET` is set in the project environment. The handler rejects any request without it.

## Editing the news brief prompt

Open `config/prompt.js` and update the string returned by `getNewsBriefPrompt()`. The date is injected automatically so you only need to change the instructions.

## Environment variables

See `.env.example` for all required variables and where each one is used.

## Local testing

```bash
npm install

# Trigger the handler manually (skip auth check during dev by temporarily removing it,
# or set CRON_SECRET and pass the header)
node -e "
  require('dotenv').config({ path: '.env.local' });
  const handler = require('./api/morning-brief');
  handler(
    { headers: { authorization: 'Bearer ' + process.env.CRON_SECRET } },
    { status: (c) => ({ json: (b) => console.log(c, b) }) }
  );
"
```

## Deployment

1. Push to GitHub.
2. Import into Vercel.
3. Add all env vars from `.env.example` in the Vercel project settings.
4. Deploy — Vercel picks up `vercel.json` and registers the cron automatically.
