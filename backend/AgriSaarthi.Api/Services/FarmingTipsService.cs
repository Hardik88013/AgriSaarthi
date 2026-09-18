using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;
using Microsoft.Extensions.Logging;

namespace AgriSaarthi.Api.Services
{
    public class FarmingTipsService : IFarmingTipsService
    {
        private readonly string _dataPath;
        private readonly ILogger<FarmingTipsService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public FarmingTipsService(ILogger<FarmingTipsService> logger)
        {
            _dataPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "ml", "agri-knowledge", "farming-tips.json");
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        }

        public async Task<List<FarmingTipDto>> GetFarmingTipsAsync(string? crop = null, string? category = null)
        {
            try
            {
                if (!File.Exists(_dataPath))
                {
                    _logger.LogWarning("Farming tips data file not found at {Path}", _dataPath);
                    return new List<FarmingTipDto>();
                }

                var json = await File.ReadAllTextAsync(_dataPath);
                var tips = JsonSerializer.Deserialize<List<FarmingTipDto>>(json, _jsonOptions);

                if (tips == null) return new List<FarmingTipDto>();

                var query = tips.AsQueryable();

                if (!string.IsNullOrWhiteSpace(crop))
                {
                    query = query.Where(t => t.Crop.Equals("All", StringComparison.OrdinalIgnoreCase) || t.Crop.Equals(crop, StringComparison.OrdinalIgnoreCase));
                }

                if (!string.IsNullOrWhiteSpace(category))
                {
                    query = query.Where(t => t.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
                }

                return query.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading farming tips");
                return new List<FarmingTipDto>();
            }
        }
    }
}
