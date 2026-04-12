export interface WeatherData {
  temp: number;
  hi: number;
  lo: number;
  precip: number;
  conditions: string;
}

export async function fetchWeather(): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=42.10&longitude=-77.23&current=temperature_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America/New_York`;
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch weather');
  }

  const data = await res.json();
  const current = data.current;
  const today = data.daily;

  return {
    temp: Math.round(current.temperature_2m),
    hi: Math.round(today.temperature_2m_max[0]),
    lo: Math.round(today.temperature_2m_min[0]),
    precip: today.precipitation_sum[0] || 0,
    conditions: mapWeatherCode(current.weather_code)
  };
}

export async function fetchExtendedForecast() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=42.10&longitude=-77.23&current=temperature_2m,precipitation,weather_code&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America/New_York`;
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch extended weather');

  const data = await res.json();
  const current = data.current;
  const todayDaily = data.daily;
  const hourlyRaw = data.hourly;

  const currentConditions = {
    temp: Math.round(current.temperature_2m),
    hi: Math.round(todayDaily.temperature_2m_max[0]),
    lo: Math.round(todayDaily.temperature_2m_min[0]),
    precip: todayDaily.precipitation_sum[0] || 0,
    conditions: mapWeatherCode(current.weather_code)
  };

  const daily = [];
  for(let i=0; i<7; i++) {
    daily.push({
      date: todayDaily.time[i],
      hi: Math.round(todayDaily.temperature_2m_max[i]),
      lo: Math.round(todayDaily.temperature_2m_min[i]),
      precip: todayDaily.precipitation_sum[i] || 0,
      weather_code: todayDaily.weather_code[i],
      conditions: mapWeatherCode(todayDaily.weather_code[i])
    });
  }

  const hourly = [];
  for(let i=0; i<48; i++) {
    hourly.push({
      time: hourlyRaw.time[i],
      temp: hourlyRaw.temperature_2m[i],
      precip: hourlyRaw.precipitation[i] || 0
    });
  }

  return { current: currentConditions, daily, hourly };
}

export function mapWeatherCode(code: number): string {
  if (code === 0) return "Clear";
  if (code >= 1 && code <= 3) return "Partly Cloudy";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}
