using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using AgriSaarthi.Api.Data;
using AgriSaarthi.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AgriSaarthi.Api.Services
{
    public class WeatherService : IWeatherService
    {
        private readonly AgriSaarthiDbContext _context;
        private readonly HttpClient _httpClient;

        public WeatherService(AgriSaarthiDbContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
        }

        public async Task<WeatherResponseDto?> GetWeatherForFarmerAsync(int farmerId)
        {
            var profile = await _context.FarmerProfiles.FirstOrDefaultAsync(p => p.FarmerId == farmerId);
            if (profile == null) return null;

            // Determine search query for location
            var locationParts = new List<string>();
            if (!string.IsNullOrWhiteSpace(profile.Location)) locationParts.Add(profile.Location);
            if (!string.IsNullOrWhiteSpace(profile.District)) locationParts.Add(profile.District);
            if (!string.IsNullOrWhiteSpace(profile.State)) locationParts.Add(profile.State);

            if (locationParts.Count == 0) return null; // No location info available

            string searchQuery = string.Join(", ", locationParts);

            // 1. Geocoding
            string geoUrl = $"https://geocoding-api.open-meteo.com/v1/search?name={Uri.EscapeDataString(searchQuery)}&count=1";
            var geoResponse = await _httpClient.GetFromJsonAsync<OpenMeteoGeocodingResponse>(geoUrl);
            
            if (geoResponse?.Results == null || geoResponse.Results.Count == 0)
                return null; // Location not found

            var location = geoResponse.Results[0];

            // 2. Weather Forecast
            string weatherUrl = $"https://api.open-meteo.com/v1/forecast?latitude={location.Latitude}&longitude={location.Longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code&timezone=auto";
            
            var weatherResponse = await _httpClient.GetFromJsonAsync<OpenMeteoWeatherResponse>(weatherUrl);
            if (weatherResponse?.Current == null || weatherResponse?.Daily == null)
                return null;

            // 3. Map to clean DTO
            var result = new WeatherResponseDto
            {
                Location = location.Name + (string.IsNullOrEmpty(location.Admin1) ? "" : $", {location.Admin1}"),
                Current = new CurrentWeatherDto
                {
                    Temperature = weatherResponse.Current.Temperature_2m,
                    Humidity = weatherResponse.Current.Relative_humidity_2m,
                    Precipitation = weatherResponse.Current.Precipitation,
                    WindSpeed = weatherResponse.Current.Wind_speed_10m,
                    WeatherCode = weatherResponse.Current.Weather_code,
                    Condition = GetWeatherCondition(weatherResponse.Current.Weather_code)
                },
                Forecast = new List<DailyForecastDto>()
            };

            for (int i = 0; i < weatherResponse.Daily.Time.Count; i++)
            {
                result.Forecast.Add(new DailyForecastDto
                {
                    Date = weatherResponse.Daily.Time[i],
                    MinTemperature = weatherResponse.Daily.Temperature_2m_min[i],
                    MaxTemperature = weatherResponse.Daily.Temperature_2m_max[i],
                    Precipitation = weatherResponse.Daily.Precipitation_sum[i],
                    PrecipitationProbability = weatherResponse.Daily.Precipitation_probability_max[i],
                    WindSpeed = weatherResponse.Daily.Wind_speed_10m_max[i],
                    WeatherCode = weatherResponse.Daily.Weather_code[i],
                    Condition = GetWeatherCondition(weatherResponse.Daily.Weather_code[i])
                });
            }

            // 4. Rule-based Advisory
            result.Advisory = GenerateAdvisory(weatherResponse.Current, weatherResponse.Daily);

            return result;
        }

        private string GetWeatherCondition(int code)
        {
            return code switch
            {
                0 => "Clear sky",
                1 or 2 or 3 => "Partly cloudy",
                45 or 48 => "Fog",
                >= 51 and <= 57 => "Drizzle",
                >= 61 and <= 67 => "Rain",
                >= 71 and <= 77 => "Snow",
                >= 80 and <= 82 => "Rain showers",
                >= 85 and <= 86 => "Snow showers",
                >= 95 => "Thunderstorm",
                _ => "Unknown"
            };
        }

        private string GenerateAdvisory(OpenMeteoCurrent current, OpenMeteoDaily daily)
        {
            // Simple deterministic rules based on today's/current data
            if (daily.Precipitation_probability_max.Count > 0)
            {
                int todayPrecipProb = daily.Precipitation_probability_max[0];
                double todayPrecipSum = daily.Precipitation_sum[0];
                double todayMaxTemp = daily.Temperature_2m_max[0];
                double todayMaxWind = daily.Wind_speed_10m_max[0];

                if (current.Weather_code >= 95)
                    return "Thunderstorm conditions are possible. Avoid field operations during severe weather.";
                
                if (todayPrecipSum > 20)
                    return "Heavy rainfall is expected. Check field drainage and avoid waterlogging.";
                
                if (todayPrecipProb > 50)
                    return "Rain is likely. Consider delaying irrigation and avoid unnecessary spraying.";

                if (todayMaxWind > 40)
                    return "Strong winds are expected. Check vulnerable crops and support structures.";

                if (todayMaxTemp > 35)
                    return "High temperature expected. Monitor crop water requirements and consider evening irrigation.";
            }

            return "Weather is favorable for standard farming operations.";
        }
    }
}
