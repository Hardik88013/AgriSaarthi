using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AgriSaarthi.Api.Services
{
    public class AiService : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AiService> _logger;

        public AiService(HttpClient httpClient, IConfiguration config, ILogger<AiService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            
            var baseUrl = config["AiService:BaseUrl"] ?? "http://localhost:8000";
            _httpClient.BaseAddress = new Uri(baseUrl);
        }

        public async Task<CropRecommendationResponseDto> GetCropRecommendationAsync(CropRecommendationRequestDto request)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("/predict/crop", request);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"AI Service returned {response.StatusCode}");
                    throw new Exception("Crop recommendation service is currently unavailable.");
                }

                var result = await response.Content.ReadFromJsonAsync<CropRecommendationResponseDto>();
                return result ?? throw new Exception("Invalid response from AI Service.");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to connect to AI Service.");
                throw new Exception("Crop recommendation service is currently unavailable.");
            }
        }
    }
}
