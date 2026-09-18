using System;

namespace AgriSaarthi.Api.DTOs
{
    public class MarketPriceDto
    {
        public string Id { get; set; } = string.Empty;
        public string Crop { get; set; } = string.Empty;
        public string Market { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
    }
}
