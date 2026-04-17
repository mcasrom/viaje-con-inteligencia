const OPEN_METEO_API = 'https://api.open-meteo.com/v1';

export interface WeatherData {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitation: number;
  windSpeed: number;
}

export interface WeatherForecast {
  location: string;
  current: {
    temp: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
  };
  daily: WeatherData[];
}

const WEATHER_CODES: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Despejado', icon: '☀️' },
  1: { desc: 'Mayormente despejado', icon: '🌤️' },
  2: { desc: 'Parcialmente nublado', icon: '⛅' },
  3: { desc: 'Nublado', icon: '☁️' },
  45: { desc: 'Niebla', icon: '🌫️' },
  48: { desc: 'Niebla escarchada', icon: '🌫️' },
  51: { desc: 'Llovizna ligera', icon: '🌧️' },
  53: { desc: 'Llovizna', icon: '🌧️' },
  55: { desc: 'Llovizna densa', icon: '🌧️' },
  61: { desc: 'Lluvia ligera', icon: '🌧️' },
  63: { desc: 'Lluvia moderada', icon: '🌧️' },
  65: { desc: 'Lluvia fuerte', icon: '🌧️' },
  71: { desc: 'Nieve ligera', icon: '🌨️' },
  73: { desc: 'Nieve moderada', icon: '🌨️' },
  75: { desc: 'Nieve fuerte', icon: '🌨️' },
  80: { desc: 'Chubascos ligeros', icon: '🌦️' },
  81: { desc: 'Chubascos', icon: '🌦️' },
  82: { desc: 'Chubascos fuertes', icon: '⛈️' },
  95: { desc: 'Tormenta', icon: '⛈️' },
  96: { desc: 'Tormenta con granizo', icon: '⛈️' },
  99: { desc: 'Tormenta severa', icon: '⛈️' },
};

export function getWeatherDescription(code: number): string {
  return WEATHER_CODES[code]?.desc || 'Desconocido';
}

export function getWeatherIcon(code: number): string {
  return WEATHER_CODES[code]?.icon || '🌡️';
}

export async function getWeatherForecast(
  lat: number,
  lon: number,
  days: number = 7
): Promise<WeatherForecast | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max',
      hourly: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m',
      timezone: 'auto',
      forecast_days: Math.min(days, 16).toString(),
    });

    const response = await fetch(`${OPEN_METEO_API}/forecast?${params}`);
    
    if (!response.ok) {
      throw new Error('Weather API error');
    }

    const data = await response.json();
    
    const currentHour = new Date().getHours();
    const currentIndex = Math.min(Math.floor(currentHour / 3), 7);

    return {
      location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      current: {
        temp: Math.round(data.hourly.temperature_2m[currentIndex] || 20),
        weatherCode: data.hourly.weather_code[currentIndex] || 0,
        windSpeed: Math.round(data.hourly.wind_speed_10m[currentIndex] || 0),
        humidity: Math.round(data.hourly.relative_humidity_2m[currentIndex] || 50),
      },
      daily: data.daily.time.map((date: string, i: number) => ({
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        weatherCode: data.daily.weather_code[i],
        precipitation: data.daily.precipitation_sum[i] || 0,
        windSpeed: Math.round(data.daily.wind_speed_10m_max[i]),
      })),
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
}

export function getWeatherRecommendation(weatherCode: number, tempMin: number, tempMax: number): string {
  if (weatherCode >= 95) {
    return '⚠️ Posibles tormentas. Lleva impermeable y evita actividades al aire libre.';
  }
  if (weatherCode >= 80) {
    return '🌧️ Chubascos probables. Ten a mano paraguas o chubasquero.';
  }
  if (tempMin < 10) {
    return '🧥 Temperaturas bajas previstas. Lleva ropa de abrigo.';
  }
  if (tempMax > 35) {
    return '🔥 Temperaturas muy altas. Hidrátate frecuentemente y evita el sol directo.';
  }
  if (weatherCode <= 1) {
    return '☀️ Tiempo despejado. Perfecto para actividades al aire libre.';
  }
  return '🌤️ Tiempo variable. Prepárate para cambios.';
}
