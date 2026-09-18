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
    public class MarketPriceService : IMarketPriceService
    {
        private readonly string _dataPath;
        private readonly ILogger<MarketPriceService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public MarketPriceService(ILogger<MarketPriceService> logger)
        {
            _dataPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "ml", "agri-knowledge", "market-prices.json");
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        }

        public async Task<List<MarketPriceDto>> GetMarketPricesAsync(string? crop = null, string? state = null)
        {
            try
            {
                if (!File.Exists(_dataPath))
                {
                    _logger.LogWarning("Market prices data file not found at {Path}", _dataPath);
                    return new List<MarketPriceDto>();
                }

                var json = await File.ReadAllTextAsync(_dataPath);
                var prices = JsonSerializer.Deserialize<List<MarketPriceDto>>(json, _jsonOptions);

                if (prices == null) return new List<MarketPriceDto>();

                var query = prices.AsQueryable();

                if (!string.IsNullOrWhiteSpace(crop))
                {
                    query = query.Where(p => p.Crop.Equals(crop, StringComparison.OrdinalIgnoreCase));
                }

                if (!string.IsNullOrWhiteSpace(state))
                {
                    query = query.Where(p => p.State.Equals(state, StringComparison.OrdinalIgnoreCase));
                }

                return query.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading market prices");
                return new List<MarketPriceDto>();
            }
        }
    }
}
