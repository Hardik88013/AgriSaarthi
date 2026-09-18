using System.Collections.Generic;
using System.Threading.Tasks;
using AgriSaarthi.Api.DTOs;

namespace AgriSaarthi.Api.Services
{
    public interface IMarketPriceService
    {
        Task<List<MarketPriceDto>> GetMarketPricesAsync(string? crop = null, string? state = null);
    }
}
