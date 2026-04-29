const { getWeather } = require('../lib/weather');
const { getCalendarEvents } = require('../lib/calendar');
const { getNewsBrief } = require('../lib/claude');
const { sendMessage } = require('../lib/telegram');

function getDateHeader() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });
}

async function trySection(name, fn) {
  try {
    return await fn();
  } catch (err) {
    console.error(`[morning-brief] ${name} failed:`, err.message);
    return `⚠️ <b>${name}</b>\nUnavailable right now.`;
  }
}

module.exports = async function handler(req, res) {
  // Verify the request comes from Vercel Cron or an authorised caller
  const authHeader = req.headers['authorization'];
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (authHeader !== expected) {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  const [weather, calendar, news] = await Promise.all([
    trySection('London Weather', getWeather),
    trySection("Today's Calendar", getCalendarEvents),
    trySection('Health Tech News', getNewsBrief),
  ]);

  const header = `☀️ <b>Morning Brief</b> — ${getDateHeader()}`;
  const message = [header, weather, calendar, news].join('\n\n');

  try {
    await sendMessage(message);
    console.log('[morning-brief] Message sent successfully');
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[morning-brief] Failed to send Telegram message:', err.message);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
