using System;
using System.Collections.Generic;

namespace AgriSaarthi.Api.DTOs
{
    public class WeatherResponseDto
    {
        public string Location { get; set; } = string.Empty;
        public CurrentWeatherDto Current { get; set; } = new CurrentWeatherDto();
        public List<DailyForecastDto> Forecast { get; set; } = new List<DailyForecastDto>();
        public string Advisory { get; set; } = string.Empty;
    }

    public class CurrentWeatherDto
    {
        public double Temperature { get; set; }
        public int Humidity { get; set; }
        public double Precipitation { get; set; }
        public double WindSpeed { get; set; }
        public int WeatherCode { get; set; }
        public string Condition { get; set; } = string.Empty;
    }

    public class DailyForecastDto
    {
        public string Date { get; set; } = string.Empty;
        public double MinTemperature { get; set; }
        public double MaxTemperature { get; set; }
        public double Precipitation { get; set; }
        public int PrecipitationProbability { get; set; }
        public double WindSpeed { get; set; }
        public int WeatherCode { get; set; }
        public string Condition { get; set; } = string.Empty;
    }

    // Classes for deserializing Open-Meteo API
    public class OpenMeteoGeocodingResponse
    {
        public List<OpenMeteoLocation>? Results { get; set; }
    }

    public class OpenMeteoLocation
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Admin1 { get; set; } // State
        public string? Country { get; set; }
    }

    public class OpenMeteoWeatherResponse
    {
        public OpenMeteoCurrent? Current { get; set; }
        public OpenMeteoDaily? Daily { get; set; }
    }

    public class OpenMeteoCurrent
    {
        public double Temperature_2m { get; set; }
        public int Relative_humidity_2m { get; set; }
        public double Precipitation { get; set; }
        public int Weather_code { get; set; }
        public double Wind_speed_10m { get; set; }
    }

    public class OpenMeteoDaily
    {
        public List<string> Time { get; set; } = new List<string>();
        public List<double> Temperature_2m_max { get; set; } = new List<double>();
        public List<double> Temperature_2m_min { get; set; } = new List<double>();
        public List<double> Precipitation_sum { get; set; } = new List<double>();
        public List<int> Precipitation_probability_max { get; set; } = new List<int>();
        public List<double> Wind_speed_10m_max { get; set; } = new List<double>();
        public List<int> Weather_code { get; set; } = new List<int>();
    }
}
