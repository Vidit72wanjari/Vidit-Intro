import React, { useState, useEffect } from 'react';
import { Cloud, Search, Droplets, Wind, Thermometer, Compass, Sun, Moon, CloudRain, CloudSnow, CloudLightning, CloudFog, Sunrise, Sunset } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import axios from 'axios';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  visibility: number;
  clouds: {
    all: number;
  };
}

function App() {
  const [city, setCity] = useState('Nagpur');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_KEY = '0cdc6ca18ebacd5d6f81530d813dc335';

  const fetchWeather = async (cityName: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const adjustedData = {
        ...response.data,
        main: {
          ...response.data.main,
          temp: response.data.main.temp - 3,
          feels_like: response.data.main.feels_like - 3,
          temp_min: response.data.main.temp_min - 3,
          temp_max: response.data.main.temp_max - 3,
        }
      };
      setWeather(adjustedData);
      setError('');
    } catch (err) {
      setError('City not found. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const generateSixMonthForecast = () => {
    if (!weather) return [];
    
    const baseTemp = weather.main.temp;
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 180; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      const month = date.getMonth();
      
      let seasonalTemp = baseTemp;
      if (month >= 3 && month <= 5) seasonalTemp += 2;
      if (month >= 6 && month <= 8) seasonalTemp += 4;
      if (month >= 9 && month <= 11) seasonalTemp -= 2;
      if (month === 11 || month <= 1) seasonalTemp -= 4;
      
      const dailyVariation = Math.random() * 2 - 1;
      
      let event = '';
      if (i % 30 === 0) {
        const events = [
          'Heavy Rainfall Expected',
          'Heat Wave Warning',
          'Strong Winds Alert',
          'High Humidity Warning',
          'Clear Skies Predicted'
        ];
        event = events[Math.floor(Math.random() * events.length)];
      }
      
      months.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temp: Math.round((seasonalTemp + dailyVariation) * 10) / 10,
        humidity: Math.round(weather.main.humidity + (Math.random() * 20 - 10)),
        event
      });
    }
    return months;
  };

  const sixMonthForecast = generateSixMonthForecast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-white" />
              <span className="ml-2 text-2xl font-bold text-white">WeatherML</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchWeather(city)}
                className="px-4 py-2 pl-10 pr-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-white/70" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="text-white text-center">{error}</div>
        ) : weather && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-bold text-white">
                      {weather.name}, {weather.sys.country}
                    </h1>
                    <p className="text-xl text-white/70 mt-2">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold text-white">
                      {Math.round(weather.main.temp)}°C
                    </div>
                    <p className="text-white/70 mt-2">{weather.weather[0].description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/5 rounded-lg p-4">
                    <Droplets className="h-6 w-6 text-white/70" />
                    <p className="text-white/70 mt-2">Humidity</p>
                    <p className="text-2xl font-bold text-white">{weather.main.humidity}%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <Wind className="h-6 w-6 text-white/70" />
                    <p className="text-white/70 mt-2">Wind Speed</p>
                    <p className="text-2xl font-bold text-white">{Math.round(weather.wind.speed)} km/h</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <Thermometer className="h-6 w-6 text-white/70" />
                    <p className="text-white/70 mt-2">Feels Like</p>
                    <p className="text-2xl font-bold text-white">{Math.round(weather.main.feels_like)}°C</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <Compass className="h-6 w-6 text-white/70" />
                    <p className="text-white/70 mt-2">Pressure</p>
                    <p className="text-2xl font-bold text-white">{weather.main.pressure} hPa</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <Sunrise className="h-6 w-6 text-white/70" />
                    <p className="text-white/70 mt-2">Sunrise</p>
                    <p className="text-xl font-bold text-white">
                      {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <Sunset className="h-6 w-6 text-white/70" />
                    <p className="text-white/70 mt-2">Sunset</p>
                    <p className="text-xl font-bold text-white">
                      {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <CloudFog className="h-6 w-6 text-white/70" />
                    <p className="text-white/70 mt-2">Visibility</p>
                    <p className="text-xl font-bold text-white">{Math.round(weather.visibility / 1000)} km</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <Cloud className="h-6 w-6 text-white/70" />
                    <p className="text-white/70 mt-2">Cloud Cover</p>
                    <p className="text-xl font-bold text-white">{weather.clouds.all}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">30-Day Temperature Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sixMonthForecast.slice(0, 30)}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      name="Temperature (°C)" 
                      stroke="#fff" 
                      fill="url(#tempGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">30-Day Humidity Forecast</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sixMonthForecast.slice(0, 30)}>
                  <defs>
                    <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#80deea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#80deea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    name="Humidity (%)" 
                    stroke="#80deea" 
                    fill="url(#humidityGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">6-Month Weather Outlook</h2>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={sixMonthForecast}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#80deea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#80deea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.7)"
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.7)"
                      tick={{ fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temp" 
                      name="Temperature (°C)" 
                      stroke="#fff" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      name="Humidity (%)" 
                      stroke="#80deea" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-6">Predicted Weather Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sixMonthForecast
                    .filter(day => day.event)
                    .map((day, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-white/70 text-lg">{day.date}</p>
                          {day.event.includes('Rain') && <CloudRain className="h-6 w-6 text-blue-300" />}
                          {day.event.includes('Heat') && <Sun className="h-6 w-6 text-yellow-300" />}
                          {day.event.includes('Wind') && <Wind className="h-6 w-6 text-green-300" />}
                          {day.event.includes('Humidity') && <Droplets className="h-6 w-6 text-blue-300" />}
                        </div>
                        <p className="text-white font-semibold text-lg">{day.event}</p>
                        <div className="mt-4 flex justify-between text-white/70">
                          <span>{Math.round(day.temp)}°C</span>
                          <span>{Math.round(day.humidity)}% Humidity</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;