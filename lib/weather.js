// London coordinates
const LAT = 51.5074;
const LON = -0.1278;

const WMO_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Heavy showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

function weatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫';
  if (code <= 55) return '🌦';
  if (code <= 65) return '🌧';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧';
  if (code <= 86) return '🌨';
  return '⛈';
}

async function getWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Europe%2FLondon` +
    `&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const data = await res.json();

  const { current, daily } = data;
  const code = current.weathercode;
  const description = WMO_CODES[code] ?? 'Unknown';
  const emoji = weatherEmoji(code);
  const temp = Math.round(current.temperature_2m);
  const feels = Math.round(current.apparent_temperature);
  const wind = Math.round(current.windspeed_10m);
  const high = Math.round(daily.temperature_2m_max[0]);
  const low = Math.round(daily.temperature_2m_min[0]);
  const rainChance = daily.precipitation_probability_max[0] ?? 0;

  return (
    `${emoji} <b>London Weather</b>\n` +
    `${temp}°C (feels like ${feels}°C) — ${description}\n` +
    `High: ${high}°C · Low: ${low}°C\n` +
    `Rain: ${rainChance}% · Wind: ${wind} km/h`
  );
}

module.exports = { getWeather };
