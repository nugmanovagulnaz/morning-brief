const { google } = require('googleapis');

function getStartOfDay(tz = 'Europe/London') {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const localDate = formatter.format(now); // e.g. "2026-04-29"
  return new Date(`${localDate}T00:00:00`);
}

async function getCalendarEvents() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const dayStart = getStartOfDay();
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const res = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    timeMin: dayStart.toISOString(),
    timeMax: dayEnd.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 20,
  });

  const events = res.data.items ?? [];

  if (events.length === 0) {
    return '📅 <b>Today\'s Calendar</b>\nNo events today.';
  }

  const lines = events.map((event) => {
    const start = event.start.dateTime ?? event.start.date;
    if (event.start.dateTime) {
      const time = new Date(start).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/London',
      });
      return `• ${time} ${event.summary ?? '(No title)'}`;
    }
    return `• ${event.summary ?? '(No title)'} (all day)`;
  });

  return `📅 <b>Today's Calendar</b>\n${lines.join('\n')}`;
}

module.exports = { getCalendarEvents };
