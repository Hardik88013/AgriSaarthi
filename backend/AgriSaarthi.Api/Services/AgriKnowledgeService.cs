using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace AgriSaarthi.Api.Services
{
    public class AgriKnowledgeService : IAgriKnowledgeService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<AgriKnowledgeService> _logger;
        private readonly IWeatherService _weatherService;
        private readonly string _kbPath;

        public AgriKnowledgeService(IWebHostEnvironment env, ILogger<AgriKnowledgeService> logger, IWeatherService weatherService)
        {
            _env = env;
            _logger = logger;
            _weatherService = weatherService;
            _kbPath = Path.Combine(_env.ContentRootPath, "..", "..", "ml", "agri-knowledge");
        }

        private async Task<List<T>> ReadJsonDbAsync<T>(string filename)
        {
            var filePath = Path.Combine(_kbPath, filename);
            if (!File.Exists(filePath))
            {
                _logger.LogWarning($"Knowledge base file not found: {filePath}");
                return new List<T>();
            }

            try
            {
                var json = await File.ReadAllTextAsync(filePath);
                return JsonSerializer.Deserialize<List<T>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<T>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error reading knowledge base file: {filePath}");
                return new List<T>();
            }
        }

        public async Task<List<CropDto>> GetCropsAsync()
        {
            return await ReadJsonDbAsync<CropDto>("crops.json");
        }

        public async Task<List<DiseaseDto>> GetDiseasesAsync(string cropId = null)
        {
            var diseases = await ReadJsonDbAsync<DiseaseDto>("diseases.json");
            if (!string.IsNullOrEmpty(cropId))
            {
                diseases = diseases.Where(d => string.Equals(d.Crop, cropId, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            return diseases;
        }

        public async Task<List<PestDto>> GetPestsAsync(string cropId = null)
        {
            var pests = await ReadJsonDbAsync<PestDto>("pests.json");
            if (!string.IsNullOrEmpty(cropId))
            {
                pests = pests.Where(p => string.Equals(p.Crop, cropId, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            return pests;
        }

        public async Task<DiseaseDto> GetDiseaseByIdAsync(string id)
        {
            var diseases = await ReadJsonDbAsync<DiseaseDto>("diseases.json");
            return diseases.FirstOrDefault(d => string.Equals(d.Id, id, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<PestDto> GetPestByIdAsync(string id)
        {
            var pests = await ReadJsonDbAsync<PestDto>("pests.json");
            return pests.FirstOrDefault(p => string.Equals(p.Id, id, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<AdvisoryResponseDto> GetWeatherAdvisoryAsync(int farmerId)
        {
            var response = new AdvisoryResponseDto
            {
                RiskLevel = "Low",
                Alerts = new List<string>(),
                Recommendations = new List<string>()
            };

            try
            {
                var weather = await _weatherService.GetWeatherForFarmerAsync(farmerId);
                var rules = await ReadJsonDbAsync<WeatherAdvisoryRuleDto>("advisories.json");

                // Evaluate simple static rules safely against the weather data
                double currentTemp = weather.Current.Temperature;
                double currentHumidity = weather.Current.Humidity;
                double currentWind = weather.Current.WindSpeed;
                double rainSum = weather.Forecast.FirstOrDefault()?.Precipitation ?? 0.0;

                bool isHighRisk = false;
                bool isModerateRisk = false;

                foreach (var rule in rules)
                {
                    bool conditionMet = false;

                    // Extremely simple deterministic evaluator
                    if (rule.Condition.Contains("rain_sum > 20") && rainSum > 20) conditionMet = true;
                    if (rule.Condition.Contains("humidity > 85") && currentHumidity > 85) conditionMet = true;
                    if (rule.Condition.Contains("temperature_max > 35") && currentTemp > 35) conditionMet = true;
                    if (rule.Condition.Contains("wind_speed > 25") && currentWind > 25) conditionMet = true;

                    if (conditionMet)
                    {
                        response.Alerts.AddRange(rule.Alerts);
                        response.Recommendations.AddRange(rule.Recommendations);

                        if (rule.RiskLevel == "High") isHighRisk = true;
                        if (rule.RiskLevel == "Moderate") isModerateRisk = true;
                    }
                }

                if (isHighRisk) response.RiskLevel = "High";
                else if (isModerateRisk) response.RiskLevel = "Moderate";
                else response.RiskLevel = "Low";

                if (response.Alerts.Count == 0)
                {
                    response.Alerts.Add("No major weather-related pest or disease risks at this time.");
                    response.Recommendations.Add("Continue standard monitoring and maintenance of your fields.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to generate weather advisory based on rules.");
                // Fallback graceful degradation
                response.Alerts.Add("Unable to evaluate live weather risks.");
                response.Recommendations.Add("Please monitor local weather stations for agricultural updates.");
            }

            return response;
        }
    }
}
